import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { ChatService } from "./chat.service.js";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../database/prisma.service.js";

describe("ChatService", () => {
    let service: ChatService;
    let generateContent: ReturnType<typeof vi.fn>;
    let createInteraction: ReturnType<typeof vi.fn>;

    const prisma = {
        chat: { findFirst: vi.fn(), findMany: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
        message: { findMany: vi.fn(), create: vi.fn() },
        $transaction: vi.fn(),
    };

    beforeEach(async () => {
        vi.resetAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: vi.fn(),
                        getOrThrow: vi.fn(),
                    },
                },
                {
                    provide: PrismaService,
                    useValue: prisma,
                },
            ],
        }).compile();

        service = module.get<ChatService>(ChatService);

        generateContent = vi.fn();
        createInteraction = vi.fn();
        Object.defineProperty(service, "ai", {
            value: { models: { generateContent }, interactions: { create: createInteraction } },
        });
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("generateResponse", () => {
        beforeEach(() => {
            prisma.chat.findFirst.mockResolvedValue({ id: "chat-1" });
            prisma.message.findMany.mockResolvedValue([]);
        });

        function savedRoles() {
            return prisma.message.create.mock.calls.map(([args]) => args.data.role);
        }

        it("saves both messages when generation completes", async () => {
            generateContent.mockResolvedValue({ text: "Hi there" });

            await expect(service.generateResponse("user-1", "chat-1", "Hello")).resolves.toBe("Hi there");

            expect(savedRoles()).toEqual(["USER", "MODEL"]);
        });

        it("saves only the user message when stopped during generation", async () => {
            generateContent.mockImplementation(async () => {
                service.stopGeneration("user-1", "chat-1", "request-1");
                throw new Error("aborted");
            });

            await expect(service.generateResponse("user-1", "chat-1", "Hello", "request-1")).resolves.toBeNull();

            expect(generateContent.mock.calls[0][0].config.abortSignal.aborted).toBe(true);
            expect(savedRoles()).toEqual(["USER"]);
        });

        it("discards the reply when stopped just as generation finishes", async () => {
            generateContent.mockImplementation(async () => {
                service.stopGeneration("user-1", "chat-1", "request-1");
                return { text: "Too late" };
            });

            await expect(service.generateResponse("user-1", "chat-1", "Hello", "request-1")).resolves.toBeNull();

            expect(savedRoles()).toEqual(["USER"]);
        });

        it("skips generation when the stop arrives before the message request", async () => {
            service.stopGeneration("user-1", "chat-1", "request-1");

            await expect(service.generateResponse("user-1", "chat-1", "Hello", "request-1")).resolves.toBeNull();

            expect(generateContent).not.toHaveBeenCalled();
            expect(savedRoles()).toEqual(["USER"]);
        });

        it("forgets an early stop that never gets a message request", () => {
            vi.useFakeTimers();

            try {
                service.stopGeneration("user-1", "chat-1", "request-1");
                expect(service["generations"].size).toBe(1);

                vi.advanceTimersByTime(60_000);
                expect(service["generations"].size).toBe(0);
            } finally {
                vi.useRealTimers();
            }
        });

        it("keeps generating and saves the reply when nothing stops it", async () => {
            generateContent.mockResolvedValue({ text: "Hi there" });

            await expect(service.generateResponse("user-1", "chat-1", "Hello", "request-1")).resolves.toBe("Hi there");

            expect(generateContent.mock.calls[0][0].config.abortSignal.aborted).toBe(false);
            expect(savedRoles()).toEqual(["USER", "MODEL"]);
            expect(service["generations"].size).toBe(0);
        });

        it("does not let a stop from another user affect the generation", async () => {
            generateContent.mockImplementation(async () => {
                service.stopGeneration("user-2", "chat-1", "request-1");
                return { text: "Hi there" };
            });

            await expect(service.generateResponse("user-1", "chat-1", "Hello", "request-1")).resolves.toBe("Hi there");
        });

        it("saves nothing and throws when generation fails without a stop", async () => {
            generateContent.mockRejectedValue(new Error("Gemini down"));

            await expect(service.generateResponse("user-1", "chat-1", "Hello", "request-1")).rejects.toThrow(
                "Failed to generate AI response.",
            );

            expect(prisma.message.create).not.toHaveBeenCalled();
        });
    });

    describe("generateTitle", () => {
        beforeEach(() => {
            createInteraction.mockResolvedValue({ output_text: "Generated Title" });
        });

        it("replaces the default title only", async () => {
            prisma.chat.findFirst.mockResolvedValue({ id: "chat-1", title: "New Chat" });
            prisma.chat.updateMany.mockResolvedValue({ count: 1 });

            await expect(service.generateTitle("user-1", "chat-1", "Hello")).resolves.toBe("Generated Title");

            expect(prisma.chat.updateMany).toHaveBeenCalledWith({
                where: { id: "chat-1", userId: "user-1", title: "New Chat" },
                data: { title: "Generated Title" },
            });
        });

        it("doesn't call Gemini when the chat already has a title", async () => {
            prisma.chat.findFirst.mockResolvedValue({ id: "chat-1", title: "Taxes" });

            await expect(service.generateTitle("user-1", "chat-1", "Hello")).resolves.toBe("Taxes");

            expect(createInteraction).not.toHaveBeenCalled();
            expect(prisma.chat.updateMany).not.toHaveBeenCalled();
        });

        it("returns the stored title when the chat was renamed during generation", async () => {
            prisma.chat.findFirst
                .mockResolvedValueOnce({ id: "chat-1", title: "New Chat" })
                .mockResolvedValueOnce({ title: "Taxes" });
            prisma.chat.updateMany.mockResolvedValue({ count: 0 });

            await expect(service.generateTitle("user-1", "chat-1", "Hello")).resolves.toBe("Taxes");
        });

        it("throws not found when the chat was deleted during generation", async () => {
            prisma.chat.findFirst.mockResolvedValueOnce({ id: "chat-1", title: "New Chat" }).mockResolvedValueOnce(null);
            prisma.chat.updateMany.mockResolvedValue({ count: 0 });

            await expect(service.generateTitle("user-1", "chat-1", "Hello")).rejects.toThrow(NotFoundException);
        });
    });

    describe("getUserChats", () => {
        it("returns chats without messages, flagging the ones the user has written in", async () => {
            prisma.chat.findMany.mockResolvedValue([
                { id: "chat-1", title: "Used", _count: { messages: 2 } },
                { id: "chat-2", title: "New Chat", _count: { messages: 0 } },
            ]);

            await expect(service.getUserChats("user-1")).resolves.toEqual([
                { id: "chat-1", title: "Used", hasUserMessages: true },
                { id: "chat-2", title: "New Chat", hasUserMessages: false },
            ]);

            const query = prisma.chat.findMany.mock.calls[0][0];
            expect(query.where).toEqual({ userId: "user-1" });
            expect(query.include.messages).toBeUndefined();
        });
    });

    describe("getChatMessages", () => {
        it("returns the messages of the user's own chat, oldest first", async () => {
            const messages = [{ id: "m1" }, { id: "m2" }];
            prisma.chat.findFirst.mockResolvedValue({ id: "chat-1" });
            prisma.message.findMany.mockResolvedValue(messages);

            await expect(service.getChatMessages("user-1", "chat-1")).resolves.toEqual(messages);

            expect(prisma.chat.findFirst.mock.calls[0][0].where).toEqual({ id: "chat-1", userId: "user-1" });
            expect(prisma.message.findMany).toHaveBeenCalledWith({
                where: { chatId: "chat-1" },
                orderBy: { createdAt: "asc" },
            });
        });

        it("throws not found for another user's chat without reading its messages", async () => {
            prisma.chat.findFirst.mockResolvedValue(null);

            await expect(service.getChatMessages("user-2", "chat-1")).rejects.toThrow(NotFoundException);

            expect(prisma.message.findMany).not.toHaveBeenCalled();
        });
    });
});
