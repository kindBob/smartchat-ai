import type { MessageType } from "../types/Chat";

export function createMessage(text: string, sender: MessageType["sender"]): MessageType {
    return {
        id: crypto.randomUUID(),
        text,
        sender,
        timestamp: new Date().toISOString(),
    };
}
