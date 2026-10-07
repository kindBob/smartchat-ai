import { ApiError, type ChatResponse, type ConversationType } from "../types/Api";
import { authFetch } from "./authFetch";

async function handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();

    if (!response.ok) {
        throw new ApiError(data.message || "Request failed", data.statusCode || response.status, data.retryAfter);
    }

    return data;
}

export async function fetchChatTitle(currentChatId: string, message: string): Promise<string> {
    const request = await authFetch("/chat/title", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatId: currentChatId, message }),
    });

    const data = await handleResponse<{ response: string }>(request);

    return data.response;
}

export async function fetchAssistantResponse(
    chatId: string,
    conversation: ConversationType[],
    controller: AbortController
): Promise<string> {
    const request = await authFetch("/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
            chatId,
            messages: conversation,
        }),
    });

    const data = await handleResponse<{ response: string }>(request);

    return data.response;
}

export async function createChat(title: string): Promise<ChatResponse> {
    const request = await authFetch("/chat/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            title,
        }),
    });

    return handleResponse<ChatResponse>(request);
}

export async function deleteChat(chatId: string) {
    const request = await authFetch(`/chat/${chatId}`, {
        method: "DELETE",
    });

    return handleResponse<{ message: string }>(request);
}

export async function fetchChats(): Promise<ChatResponse[]> {
    const request = await authFetch("/chat");

    return handleResponse<ChatResponse[]>(request);
}
