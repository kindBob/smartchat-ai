import type { ConversationType } from "../types/Api";
import type { MessageType } from "../types/Chat";

export function createMessage(text: string, sender: MessageType["sender"]): MessageType {
    return {
        id: crypto.randomUUID(),
        text,
        sender,
        timestamp: new Date().toISOString(),
    };
}

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
