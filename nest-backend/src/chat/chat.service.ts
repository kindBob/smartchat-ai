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

@Injectable()
export class ChatService {
    private readonly ai: GoogleGenAI;
    private readonly model: string;
    private readonly logger = new Logger(ChatService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        this.ai = new GoogleGenAI({
            apiKey: this.configService.getOrThrow<string>("GEMINI_API_KEY"),
        });

        this.model = this.configService.getOrThrow<string>("GEMINI_MODEL");
    }

    async generateResponse(userId: string, chatId: string, text: string) {
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

        let response: string;

        try {
            const aiResponse = await this.ai.models.generateContent({ model: this.model, contents });
            response = aiResponse.text?.trim() ?? "";
            if (!response) throw new Error("Empty AI response");
        } catch (error) {
            this.logger.error("Gemini API error", error);
            throw new InternalServerErrorException("Failed to generate AI response.");
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

            const result = await this.prisma.chat.updateMany({
                where: {
                    id: chatId,
                    userId,
                },
                data: {
                    title,
                },
            });

            if (result.count === 0) throw new NotFoundException("Chat not found");

            return title;
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

    private findChats(userId: string) {
        return this.prisma.chat.findMany({
            where: { userId },
            include: { messages: { orderBy: { createdAt: "asc" } } },
            orderBy: [{ pinnedAt: { sort: "desc", nulls: "last" } }, { lastMessageAt: "desc" }],
        });
    }

    async getUserChats(userId: string) {
        return this.findChats(userId);
    }
}
