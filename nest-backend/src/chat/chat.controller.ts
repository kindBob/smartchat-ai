import { Body, Controller, Get, Post, UseGuards, Request, Param, Delete } from "@nestjs/common";
import { ChatService } from "./chat.service.js";
import { GenerateTitleDto } from "./dto/generate-title.dto.js";
import { SendMessageDto } from "./dto/send-message.dto.js";
import { CreateChatDto } from "./dto/create-chat.dto.js";
import type { AuthenticatedRequest } from "../auth/auth.types.js";
import { AuthGuard } from "../auth/auth.guard.js";
import { CustomThrottlerGuard } from "../common/guards/custom-throttler.guard.js";

@Controller("chat")
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @UseGuards(AuthGuard)
    @Get()
    async getUserChats(@Request() request: AuthenticatedRequest) {
        return this.chatService.getUserChats(request.user.id);
    }

    @UseGuards(AuthGuard)
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
        return this.chatService.createChat(request.user.id, dto.title);
    }

    @UseGuards(AuthGuard)
    @Delete(":id")
    async deleteChat(@Request() request: AuthenticatedRequest, @Param("id") chatId: string) {
        return this.chatService.deleteChat(request.user.id, chatId);
    }

    @UseGuards(AuthGuard, CustomThrottlerGuard)
    @Post()
    async generateResponse(@Body() dto: SendMessageDto) {
        const response = await this.chatService.generateResponse(dto.messages);

        return {
            response,
        };
    }
}
