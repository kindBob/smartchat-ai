import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenAI } from "@google/genai";
import { MessageDto } from "./dto/send-message.dto.js";
import { PrismaService } from "../database/prisma.service.js";

@Injectable()
export class ChatService {
    private readonly ai: GoogleGenAI;
    private readonly model: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService
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

            await this.prisma.chat.updateMany({
                where: {
                    id: chatId,
                },
                data: {
                    title,
                },
            });

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

        return { message: "Chat deleted successfully" };
    }

    async renameChat(userId: string, chatId: string, title: string) {
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

        return {
            message: "Chat updated successfully",
        };
    }

    async getUserChats(userId: string) {
        const chats = await this.prisma.chat.findMany({
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
            orderBy: {
                lastMessageAt: "desc",
            },
        });

        if (chats.length > 0) return chats;

        await this.prisma.chat.create({
            data: {
                userId,
                messages: {
                    create: {
                        text: "Hello, how can I help you?",
                        role: "MODEL",
                    },
                },
            },
        });

        return this.prisma.chat.findMany({
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
    }
}
