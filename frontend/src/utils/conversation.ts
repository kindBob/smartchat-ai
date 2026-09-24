import type { ConversationType } from "../types/Api";
import type { MessageType } from "../types/Chat";

export function createConversation(messages: MessageType[]): ConversationType[] {
    return messages
        .filter((message) => message.text.trim() !== "")
        .map((message) => ({
            role: message.sender === "assistant" ? "model" : "user",
            parts: [
                {
                    text: message.text,
                },
            ],
        }));
}
