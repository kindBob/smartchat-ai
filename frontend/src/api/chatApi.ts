import { ApiError, type ChatResponse } from "../types/Api";
import { authFetch } from "./authFetch";

const BASE_ENDPOINT = "/chats";

type UpdateChatInput = {
    title?: string;
    pinned?: boolean;
};

async function handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new ApiError(data?.message || "Request failed", data?.statusCode || response.status, data?.retryAfter);
    }

    return data as T;
}

export async function fetchChats(): Promise<ChatResponse[]> {
    const request = await authFetch(BASE_ENDPOINT);

    return handleResponse<ChatResponse[]>(request);
}

export async function createChat(title: string): Promise<ChatResponse> {
    const request = await authFetch(`${BASE_ENDPOINT}`, {
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

export async function updateChat(chatId: string, updates: UpdateChatInput): Promise<ChatResponse> {
    const request = await authFetch(`${BASE_ENDPOINT}/${chatId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
    });

    return handleResponse<ChatResponse>(request);
}

export async function deleteChat(chatId: string): Promise<ChatResponse> {
    const request = await authFetch(`${BASE_ENDPOINT}/${chatId}`, {
        method: "DELETE",
    });

    return handleResponse<ChatResponse>(request);
}

export async function fetchChatTitle(chatId: string, message: string): Promise<string> {
    const request = await authFetch(`${BASE_ENDPOINT}/${chatId}/title`, {
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
    chatId: string,
    userText: string,
    controller: AbortController,
): Promise<string> {
    const request = await authFetch(`${BASE_ENDPOINT}/${chatId}/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
            text: userText,
        }),
    });

    const data = await handleResponse<{ response: string }>(request);

    return data.response;
}
