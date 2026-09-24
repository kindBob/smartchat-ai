import type { ConversationType } from "../types/Chat";

export async function fetchChatTitle(message: string) {
    const request = await fetch("http://localhost:3001/chat/title", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
    });

    const data = await request.json();

    if (!request.ok) {
        throw new Error(data.message || "Failed to generate chat title");
    }

    return data.response;
}

export async function fetchAssistantResponse(
    conversation: ConversationType[],
    controller: AbortController
): Promise<string> {
    const request = await fetch("http://localhost:3001/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
            messages: conversation,
        }),
    });

    const data = await request.json();

    if (!request.ok) {
        throw new Error(data.message || "Failed to generate AI response");
    }

    return data.response;
}
