import { Body, Controller, Post, BadRequestException, Get } from "@nestjs/common";
import { ChatService } from "./chat.service.js";
import { GenerateTitleDto } from "./dto/generate-title.dto.js";
import { SendMessageDto } from "./dto/send-message.dto.js";

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

    @Post()
    async generateResponse(@Body() dto: SendMessageDto) {
        const response = await this.chatService.generateResponse(dto.messages);

        return {
            response,
        };
    }
}
