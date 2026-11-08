import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { ChatController } from "./chat.controller.js";
import { ChatService } from "./chat.service.js";
import { AuthGuard } from "../auth/auth.guard.js";
import { CustomThrottlerGuard } from "../common/guards/custom-throttler.guard.js";

const REQUEST_ID = "3f2b8c1e-6a4d-4e7f-9b1a-2c3d4e5f6a7b";

describe("ChatController", () => {
    let controller: ChatController;
    let app: INestApplication;
    const generateResponse = vi.fn();
    const stopGeneration = vi.fn();
    const generateTitle = vi.fn();
    const createChat = vi.fn();

    beforeEach(async () => {
        generateResponse.mockReset();
        stopGeneration.mockReset();
        generateTitle.mockReset();
        createChat.mockReset();

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ChatController],
            providers: [
                {
                    provide: ChatService,
                    useValue: { generateResponse, stopGeneration, generateTitle, createChat },
                },
            ],
        })
            .overrideGuard(AuthGuard)
            .useValue({
                canActivate: (context: { switchToHttp(): { getRequest(): { user: { id: string } } } }) => {
                    context.switchToHttp().getRequest().user = { id: "user-1" };
                    return true;
                },
            })
            .overrideGuard(CustomThrottlerGuard)
            .useValue({
                canActivate: () => true,
            })
            .compile();

        controller = module.get<ChatController>(ChatController);
        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
        await app.listen(0);
    });

    afterEach(async () => {
        await app.close();
    });

    function post(path: string, body?: unknown) {
        const { port } = (app.getHttpServer() as Server).address() as AddressInfo;

        return fetch(`http://127.0.0.1:${port}/chats/chat-1/${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: body === undefined ? undefined : JSON.stringify(body),
        });
    }

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    it("passes the request id through validation to the service", async () => {
        generateResponse.mockResolvedValue("Hi there");

        const response = await post("messages", { text: "Hello", requestId: REQUEST_ID });

        await expect(response.json()).resolves.toEqual({ response: "Hi there" });
        expect(generateResponse).toHaveBeenCalledWith("user-1", "chat-1", "Hello", REQUEST_ID);
    });

    it("rejects a malformed request id on a message", async () => {
        const response = await post("messages", { text: "Hello", requestId: "not-a-uuid" });

        expect(response.status).toBe(400);
        expect(generateResponse).not.toHaveBeenCalled();
    });

    it("stops the generation for the signed-in user", async () => {
        const response = await post(`messages/${REQUEST_ID}/stop`);

        expect(response.status).toBe(204);
        expect(stopGeneration).toHaveBeenCalledWith("user-1", "chat-1", REQUEST_ID);
    });

    it("rejects a malformed request id on stop", async () => {
        const response = await post("messages/not-a-uuid/stop");

        expect(response.status).toBe(400);
        expect(stopGeneration).not.toHaveBeenCalled();
    });

    it("rejects a title request with an oversized message before reaching the service", async () => {
        const response = await post("title", { message: "x".repeat(6001) });

        expect(response.status).toBe(400);
        expect(generateTitle).not.toHaveBeenCalled();
    });

    it("rejects creating a chat with an oversized title before reaching the service", async () => {
        const { port } = (app.getHttpServer() as Server).address() as AddressInfo;

        const response = await fetch(`http://127.0.0.1:${port}/chats`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: "x".repeat(101) }),
        });

        expect(response.status).toBe(400);
        expect(createChat).not.toHaveBeenCalled();
    });

    it("rate limits every route that can call Gemini or create rows", () => {
        for (const handler of ["createChat", "generateTitle", "generateResponse", "stopGeneration"] as const) {
            const guards: unknown[] = Reflect.getMetadata("__guards__", ChatController.prototype[handler]) ?? [];

            expect(guards, handler).toContain(CustomThrottlerGuard);
        }
    });
});
