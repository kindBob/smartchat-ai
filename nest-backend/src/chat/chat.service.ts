import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenAI } from "@google/genai";
import { PrismaService } from "../database/prisma.service.js";
import { UpdateChatDto } from "./dto/update-chat.dto.js";
import { Prisma } from "../generated/prisma/client.js";

const MAX_PINNED_CHATS = 5;
const HISTORY_LIMIT = 30;
const DEFAULT_CHAT_TITLE = "New Chat";
const EARLY_STOP_TTL_MS = 60_000;

@Injectable()
export class ChatService {
    private readonly ai: GoogleGenAI;
    private readonly model: string;
    private readonly logger = new Logger(ChatService.name);
    private readonly generations = new Map<string, AbortController>();

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        this.ai = new GoogleGenAI({
            apiKey: this.configService.getOrThrow<string>("GEMINI_API_KEY"),
        });

        this.model = this.configService.getOrThrow<string>("GEMINI_MODEL");
    }

    /** Returns null if the request was stopped through stopGeneration: only the user's message is saved. */
    async generateResponse(userId: string, chatId: string, text: string, requestId?: string) {
        const key = requestId && this.generationKey(userId, chatId, requestId);

        // Reuses the already-aborted controller when the stop request got here first
        const generation = (key && this.generations.get(key)) || new AbortController();
        if (key) this.generations.set(key, generation);

        try {
            return await this.runGeneration(userId, chatId, text, generation.signal);
        } finally {
            if (key) this.generations.delete(key);
        }
    }

    stopGeneration(userId: string, chatId: string, requestId: string) {
        const key = this.generationKey(userId, chatId, requestId);
        const generation = this.generations.get(key);

        if (generation) {
            generation.abort();
            return;
        }

        // The stop can overtake its message request while that is still in the guards, so remember it for a while
        const stopped = new AbortController();
        stopped.abort();
        this.generations.set(key, stopped);

        setTimeout(() => {
            if (this.generations.get(key) === stopped) this.generations.delete(key);
        }, EARLY_STOP_TTL_MS).unref();
    }

    private generationKey(userId: string, chatId: string, requestId: string) {
        return `${userId}:${chatId}:${requestId}`;
    }

    private async runGeneration(userId: string, chatId: string, text: string, signal: AbortSignal) {
        const receivedAt = new Date();

        const chat = await this.prisma.chat.findFirst({
            where: { id: chatId, userId },
            select: { id: true },
        });
        if (!chat) throw new NotFoundException("Chat not found.");

        const recent = await this.prisma.message.findMany({
            where: { chatId },
            orderBy: { createdAt: "desc" },
            take: HISTORY_LIMIT,
            select: { role: true, text: true },
        });
        const history = recent.reverse();

        const firstUser = history.findIndex((m) => m.role === "USER");
        const usable = firstUser === -1 ? [] : history.slice(firstUser);

        const contents = [
            ...usable.map((m) => ({
                role: m.role === "USER" ? "user" : "model",
                parts: [{ text: m.text }],
            })),
            { role: "user", parts: [{ text }] },
        ];

        let response = "";

        try {
            signal.throwIfAborted();

            const aiResponse = await this.ai.models.generateContent({
                model: this.model,
                contents,
                config: { abortSignal: signal },
            });
            response = aiResponse.text?.trim() ?? "";
            if (!response) throw new Error("Empty AI response");
        } catch (error) {
            if (!signal.aborted) {
                this.logger.error("Gemini API error", error);
                throw new InternalServerErrorException("Failed to generate AI response.");
            }
        }

        if (signal.aborted) {
            await this.prisma.$transaction([
                this.prisma.message.create({ data: { text, role: "USER", chatId, createdAt: receivedAt } }),
                this.prisma.chat.update({ where: { id: chatId }, data: { lastMessageAt: receivedAt } }),
            ]);

            return null;
        }

        const userAt = new Date();
        const modelAt = new Date(userAt.getTime() + 1);

        await this.prisma.$transaction([
            this.prisma.message.create({ data: { text, role: "USER", chatId, createdAt: userAt } }),
            this.prisma.message.create({ data: { text: response, role: "MODEL", chatId, createdAt: modelAt } }),
            this.prisma.chat.update({ where: { id: chatId }, data: { lastMessageAt: modelAt } }),
        ]);

        return response;
    }

    async generateTitle(userId: string, chatId: string, message: string) {
        try {
            const chat = await this.prisma.chat.findFirst({
                where: {
                    id: chatId,
                    userId,
                },
            });

            if (!chat) {
                throw new NotFoundException("Chat not found");
            }

            // Already titled, so there's nothing to spend a Gemini call on
            if (chat.title !== DEFAULT_CHAT_TITLE) return chat.title;

            const aiResponse = await this.ai.interactions.create({
                model: this.model,
                input: `Generate a short title for this message.
            Rules: 
            - Return only the title
            - No quotation marks
            - Max 5 words
            - Keep it concise
    
            Message: 
            ${message}`,
            });

            const title = aiResponse.output_text?.trim();

            if (!title) {
                throw new Error("Empty title returned");
            }

            // Only replace the default title, so a rename made during generation isn't overwritten
            const result = await this.prisma.chat.updateMany({
                where: {
                    id: chatId,
                    userId,
                    title: DEFAULT_CHAT_TITLE,
                },
                data: {
                    title,
                },
            });

            if (result.count > 0) return title;

            const current = await this.prisma.chat.findFirst({
                where: { id: chatId, userId },
                select: { title: true },
            });

            if (!current) throw new NotFoundException("Chat not found");

            return current.title;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;

            console.error("Gemini API error: ", error);

            throw new InternalServerErrorException("Failed to generate title");
        }
    }

    async createChat(userId: string, title: string) {
        return this.prisma.chat.create({
            data: {
                userId,
                title,
                messages: {
                    create: {
                        text: "Hello, how can I help you?",
                        role: "MODEL",
                    },
                },
            },
            include: {
                messages: true,
            },
        });
    }

    async deleteChat(userId: string, chatId: string) {
        const result = await this.prisma.chat.deleteMany({
            where: {
                id: chatId,
                userId,
            },
        });

        if (result.count === 0) {
            throw new NotFoundException("Chat not found");
        }

        return { message: "Chat deleted." };
    }

    async updateChat(userId: string, chatId: string, dto: UpdateChatDto) {
        if (dto.title === undefined && dto.pinned === undefined) {
            throw new BadRequestException("Nothing to update.");
        }

        return this.prisma.$transaction(async (tx) => {
            const chat = await tx.chat.findFirst({
                where: { id: chatId, userId },
                select: { pinnedAt: true },
            });

            if (!chat) throw new NotFoundException("Chat not found.");

            // Only count when pinning a chat that isn't already pinned
            if (dto.pinned === true && chat.pinnedAt === null) {
                const pinnedCount = await tx.chat.count({
                    where: { userId, pinnedAt: { not: null } },
                });

                if (pinnedCount >= MAX_PINNED_CHATS) {
                    throw new BadRequestException(`You can pin up to ${MAX_PINNED_CHATS} chats.`);
                }
            }

            return tx.chat.update({
                where: { id: chatId },
                data: {
                    ...(dto.title !== undefined && { title: dto.title }),
                    ...(dto.pinned !== undefined && {
                        // keep the original pin time if it's already pinned
                        pinnedAt: dto.pinned ? (chat.pinnedAt ?? new Date()) : null,
                    }),
                },
                select: { id: true, title: true, pinnedAt: true },
            });
        });
    }

    /** Lists chats without their messages, which are loaded per chat through getChatMessages. */
    async getUserChats(userId: string) {
        const chats = await this.prisma.chat.findMany({
            where: { userId },
            include: { _count: { select: { messages: { where: { role: "USER" } } } } },
            orderBy: [{ pinnedAt: { sort: "desc", nulls: "last" } }, { lastMessageAt: "desc" }],
        });

        return chats.map(({ _count, ...chat }) => ({ ...chat, hasUserMessages: _count.messages > 0 }));
    }

    async getChatMessages(userId: string, chatId: string) {
        const chat = await this.prisma.chat.findFirst({
            where: { id: chatId, userId },
            select: { id: true },
        });

        if (!chat) throw new NotFoundException("Chat not found.");

        return this.prisma.message.findMany({
            where: { chatId },
            orderBy: { createdAt: "asc" },
        });
    }
}
