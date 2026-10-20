import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenAI } from "@google/genai";
import { MessageDto } from "./dto/send-message.dto.js";
import { PrismaService } from "../database/prisma.service.js";
import { UpdateChatDto } from "./dto/update-chat.dto.js";
import { Prisma } from "../generated/prisma/client.js";

const MAX_PINNED_CHATS = 5;

@Injectable()
export class ChatService {
    private readonly ai: GoogleGenAI;
    private readonly model: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        this.ai = new GoogleGenAI({
            apiKey: this.configService.getOrThrow<string>("GEMINI_API_KEY"),
        });

        this.model = this.configService.getOrThrow<string>("GEMINI_MODEL");
    }

    async generateResponse(userId: string, chatId: string, messages: MessageDto[]) {
        const chat = await this.prisma.chat.findFirst({
            where: {
                id: chatId,
                userId,
            },
        });

        if (!chat) {
            throw new NotFoundException("Chat not found");
        }

        try {
            const aiResponse = await this.ai.models.generateContent({
                model: this.model,
                contents: messages,
            });

            const response = aiResponse.text?.trim();

            if (!response) throw new Error("Empty AI response");

            const lastMessage = messages[messages.length - 1];

            if (lastMessage?.role === "user") {
                const userText = lastMessage.parts[0]?.text;

                if (!userText) {
                    throw new BadRequestException("Message text is required");
                }

                await this.prisma.message.create({
                    data: {
                        text: userText,
                        role: "USER",
                        chatId,
                    },
                });

                await this.prisma.chat.update({
                    where: {
                        id: chatId,
                    },
                    data: {
                        lastMessageAt: new Date(),
                    },
                });
            }

            await this.prisma.message.create({
                data: {
                    text: response,
                    role: "MODEL",
                    chatId,
                },
            });

            return response;
        } catch (error) {
            console.error("Gemini API error: ", error);

            throw new InternalServerErrorException("Failed to generate AI response");
        }
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

        return this.prisma.chat.findFirst({ where: { id: chatId, userId } });
    }

    async updateChat(userId: string, chatId: string, dto: UpdateChatDto) {
        const data: Prisma.ChatUpdateInput = {};

        if (dto.title !== undefined) data.title = dto.title;
        if (dto.pinned !== undefined) data.pinnedAt = dto.pinned ? new Date() : null;

        if (Object.keys(data).length === 0) throw new BadRequestException("Nothing to update.");

        return this.prisma.$transaction(async (tx) => {
            const chat = await tx.chat.findFirst({ where: { id: chatId, userId }, select: { pinnedAt: true } });

            if (!chat) throw new NotFoundException("Chat not found.");

            if (dto.pinned && chat.pinnedAt === null) {
                const pinnedCount = await tx.chat.count({
                    where: { userId, pinnedAt: { not: null } },
                });

                if (pinnedCount >= MAX_PINNED_CHATS) {
                    throw new BadRequestException(`You can pin up to ${MAX_PINNED_CHATS} chats.`);
                }
            }

            return tx.chat.update({
                where: { id: chatId },
                data,
                select: { id: true, title: true, pinnedAt: true },
            });
        });
    }

    async togglePinChat(userId: string, chatId: string, pinned: boolean) {
        const result = await this.prisma.chat.updateMany({
            where: { id: chatId, userId },
            data: { pinnedAt: pinned ? new Date() : null },
        });

        if (result.count === 0) {
            throw new NotFoundException("Chat not found");
        }

        return this.prisma.chat.findFirst({ where: { id: chatId, userId } });
    }

    async getUserChats(userId: string) {
        let chats = await this.prisma.chat.findMany({
            where: {
                userId,
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: "asc",
                    },
                },
            },
            orderBy: [{ pinnedAt: { sort: "desc", nulls: "last" } }, { lastMessageAt: "desc" }],
        });

        if (chats.length === 0) {
            await this.createChat(userId, "New Chat");

            chats = await this.prisma.chat.findMany({
                where: { userId },
                include: {
                    messages: {
                        orderBy: {
                            createdAt: "asc",
                        },
                    },
                },
                orderBy: {
                    lastMessageAt: "desc",
                },
            });

            return chats;
        }

        for (const chat of chats) {
            if (chat.messages.length === 0) {
                await this.prisma.message.create({
                    data: {
                        text: "Hello, how can I help you?",
                        role: "MODEL",
                        chatId: chat.id,
                    },
                });
            }
        }

        if (chats.some((chat) => chat.messages.length === 0)) {
            chats = await this.prisma.chat.findMany({
                where: { userId },
                include: {
                    messages: {
                        orderBy: { createdAt: "asc" },
                    },
                },

                orderBy: {
                    lastMessageAt: "desc",
                },
            });
        }

        return chats;
    }
}
