import { Body, Controller, Get, Post, UseGuards, Request } from "@nestjs/common";
import { ChatService } from "./chat.service.js";
import { GenerateTitleDto } from "./dto/generate-title.dto.js";
import { SendMessageDto } from "./dto/send-message.dto.js";
import { CreateChatDto } from "./dto/create-chat.dto.js";
import type { AuthenticatedRequest } from "../auth/auth.types.js";
import { AuthGuard } from "../auth/auth.guard.js";

@Controller("chat")
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Get()
    async getUserChats() {
        return this.chatService.getUserChats("test-user-123");
    }

    @Post("title")
    async generateTitle(@Body() dto: GenerateTitleDto) {
        const title = await this.chatService.generateTitle(dto.message);

        return {
            response: title,
        };
    }

    @UseGuards(AuthGuard)
    @Post("create")
    async createChat(@Request() request: AuthenticatedRequest, @Body() dto: CreateChatDto) {
        console.log("Authenticated user:", request.user);

        return this.chatService.createChat(request.user.id, dto.title);
    }

    @Post()
    async generateResponse(@Body() dto: SendMessageDto) {
        const response = await this.chatService.generateResponse(dto.messages);

        return {
            response,
        };
    }
}
