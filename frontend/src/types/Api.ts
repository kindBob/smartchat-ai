export class ApiError extends Error {
    statusCode: number;
    retryAfter?: number;

    constructor(message: string, statusCode: number, retryAfter?: number) {
        super(message);
        this.name = "ApiError";
        this.statusCode = statusCode;
        this.retryAfter = retryAfter;
    }
}

export type MessageResponse = {
    id: string;
    text: string;
    role: "USER" | "MODEL";
    chatId: string;
    createdAt: string;
};

type ChatFields = {
    id: string;
    title: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    pinnedAt: string | null;
    lastMessageAt: string;
};

export type ChatResponse = ChatFields & {
    messages: MessageResponse[];
};

export type ChatSummaryResponse = ChatFields & {
    hasUserMessages: boolean;
};
