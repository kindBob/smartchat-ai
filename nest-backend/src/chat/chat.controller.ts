import { Body, Controller, Post, BadRequestException, Get } from "@nestjs/common";
import { ChatService } from "./chat.service.js";
import { GenerateTitleDto } from "./dto/generate-title.dto/generate-title.dto.js";

@Controller("chat")
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Post("title")
    async generateTitle(@Body() dto: GenerateTitleDto) {
        const title = await this.chatService.generateTitle(dto.message);

        return {
            response: title,
        };
    }
}
