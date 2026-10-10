import { Test, TestingModule } from "@nestjs/testing";
import { ChatService } from "./chat.service.js";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../database/prisma.service.js";

describe("ChatService", () => {
    let service: ChatService;

    beforeEach(async () => {
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
                    useValue: {},
                },
            ],
        }).compile();

        service = module.get<ChatService>(ChatService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
