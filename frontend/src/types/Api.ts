export type ConversationType = {
    parts: [
        {
            text: string;
        },
    ];
    role: "user" | "model";
};

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

export type ChatResponse = {
    id: string;
    title: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    messages: {
        id: string;
        text: string;
        role: "USER" | "MODEL";
        chatId: string;
        createdAt: string;
    }[];
};
