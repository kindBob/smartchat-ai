import type { ConversationType } from "../types/Api";

const API_URL = import.meta.env.VITE_API_URL;

async function handleResponse<T>(request: Response): Promise<T> {
    const data = await request.json();

    if (!request.ok) {
        throw new Error(data.message || "Request failed");
    }

    return data;
}

export async function fetchChatTitle(message: string) {
    const request = await fetch(`${API_URL}/chat/title`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
    });

    const data = await handleResponse<{ response: string }>(request);

    return data.response;
}

export async function fetchAssistantResponse(
    conversation: ConversationType[],
    controller: AbortController
): Promise<string> {
    const request = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
            messages: conversation,
        }),
    });

    const data = await handleResponse<{ response: string }>(request);

    return data.response;
}
