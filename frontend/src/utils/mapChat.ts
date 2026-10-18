import type { ChatResponse } from "../types/Api";
import type { ChatType } from "../types/Chat";

export function mapChat(chat: ChatResponse): ChatType {
    return {
        id: chat.id,
        title: chat.title,
        pinnedAt: chat.pinnedAt,
        lastMessageAt: chat.lastMessageAt,
        messages: chat.messages.map((message) => ({
            id: message.id,
            text: message.text,
            sender: message.role === "USER" ? "user" : "assistant",
            timestamp: message.createdAt,
        })),
        isTyping: false,
        isResponseLoading: false,
    };
}
