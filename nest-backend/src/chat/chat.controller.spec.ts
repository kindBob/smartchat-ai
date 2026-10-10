import { Test, TestingModule } from "@nestjs/testing";
import { ChatController } from "./chat.controller.js";
import { ChatService } from "./chat.service.js";
import { AuthGuard } from "../auth/auth.guard.js";
import { CustomThrottlerGuard } from "../common/guards/custom-throttler.guard.js";

describe("ChatController", () => {
    let controller: ChatController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ChatController],
            providers: [
                {
                    provide: ChatService,
                    useValue: {},
                },
            ],
        })
            .overrideGuard(AuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(CustomThrottlerGuard)
            .useValue({
                canActivate: () => true,
            })
            .compile();

        controller = module.get<ChatController>(ChatController);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });
});
