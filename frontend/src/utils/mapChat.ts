import type { ChatResponse, ChatSummaryResponse, MessageResponse } from "../types/Api";
import type { ChatType, MessageType } from "../types/Chat";

export function mapMessage(message: MessageResponse): MessageType {
    return {
        id: message.id,
        text: message.text,
        sender: message.role === "USER" ? "user" : "assistant",
        timestamp: message.createdAt,
    };
}

export function mapChatSummary(chat: ChatSummaryResponse): ChatType {
    return {
        id: chat.id,
        title: chat.title,
        pinnedAt: chat.pinnedAt,
        lastMessageAt: chat.lastMessageAt,
        messages: [],
        messagesStatus: "idle",
        hasUserMessages: chat.hasUserMessages,
        isTyping: false,
        isResponseLoading: false,
    };
}

export function mapChat(chat: ChatResponse): ChatType {
    const messages = chat.messages.map(mapMessage);

    return {
        ...mapChatSummary({ ...chat, hasUserMessages: messages.some((m) => m.sender === "user") }),
        messages,
        messagesStatus: "loaded",
    };
}
