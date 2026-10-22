import { Body, Controller, Get, Post, UseGuards, Request, Param, Delete, Patch } from "@nestjs/common";
import { ChatService } from "./chat.service.js";
import { GenerateTitleDto } from "./dto/generate-title.dto.js";
import { SendMessageDto } from "./dto/send-message.dto.js";
import { CreateChatDto } from "./dto/create-chat.dto.js";
import type { AuthenticatedRequest } from "../auth/auth.types.js";
import { AuthGuard } from "../auth/auth.guard.js";
import { CustomThrottlerGuard } from "../common/guards/custom-throttler.guard.js";
import { UpdateChatDto } from "./dto/update-chat.dto.js";

@UseGuards(AuthGuard)
@Controller("chats")
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Get()
    async getUserChats(@Request() request: AuthenticatedRequest) {
        return this.chatService.getUserChats(request.user.id);
    }

    @Post()
    async createChat(@Request() request: AuthenticatedRequest, @Body() dto: CreateChatDto) {
        return this.chatService.createChat(request.user.id, dto.title);
    }

    @Patch(":id")
    async updateChat(
        @Request() request: AuthenticatedRequest,
        @Param("id") chatId: string,
        @Body() dto: UpdateChatDto,
    ) {
        return this.chatService.updateChat(request.user.id, chatId, dto);
    }

    @Delete(":id")
    async deleteChat(@Request() request: AuthenticatedRequest, @Param("id") chatId: string) {
        return this.chatService.deleteChat(request.user.id, chatId);
    }

    @Post(":id/title")
    async generateTitle(
        @Request() request: AuthenticatedRequest,
        @Param("id") chatId: string,
        @Body() dto: GenerateTitleDto,
    ) {
        const title = await this.chatService.generateTitle(request.user.id, chatId, dto.message);

        return {
            response: title,
        };
    }

    @UseGuards(CustomThrottlerGuard)
    @Post(":id/messages")
    async generateResponse(
        @Request() request: AuthenticatedRequest,
        @Param("id") chatId: string,
        @Body() dto: SendMessageDto,
    ) {
        console.log(dto.text);
        const response = await this.chatService.generateResponse(request.user.id, chatId, dto.text);

        return {
            response,
        };
    }
}
