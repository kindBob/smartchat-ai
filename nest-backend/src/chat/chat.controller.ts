import { Body, Controller, Get, Post } from "@nestjs/common";
import { ChatService } from "./chat.service.js";
import { GenerateTitleDto } from "./dto/generate-title.dto.js";
import { SendMessageDto } from "./dto/send-message.dto.js";
import { CreateChatDto } from "./dto/create-chat.dto.js";

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

    @Post("create")
    async createChat(@Body() dto: CreateChatDto) {
        return this.chatService.createChat(dto.userId, dto.title);
    }

    @Post()
    async generateResponse(@Body() dto: SendMessageDto) {
        const response = await this.chatService.generateResponse(dto.messages);

        return {
            response,
        };
    }
}
