import { ApiError, type ChatResponse, type ChatSummaryResponse, type MessageResponse } from "../types/Api";
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

export async function fetchChats(): Promise<ChatSummaryResponse[]> {
    const request = await authFetch(BASE_ENDPOINT);

    return handleResponse<ChatSummaryResponse[]>(request);
}

export async function fetchChatMessages(chatId: string): Promise<MessageResponse[]> {
    const request = await authFetch(`${BASE_ENDPOINT}/${chatId}/messages`);

    return handleResponse<MessageResponse[]>(request);
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
    requestId: string,
    controller: AbortController,
): Promise<string | null> {
    const request = await authFetch(`${BASE_ENDPOINT}/${chatId}/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
            text: userText,
            requestId,
        }),
    });

    // null means the request was stopped and no reply was saved
    const data = await handleResponse<{ response: string | null }>(request);

    return data.response;
}

export async function stopAssistantResponse(chatId: string, requestId: string): Promise<void> {
    const request = await authFetch(`${BASE_ENDPOINT}/${chatId}/messages/${requestId}/stop`, {
        method: "POST",
    });

    await handleResponse<null>(request);
}
