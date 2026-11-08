export type MessageType = {
    id: string;
    text: string;
    sender: "user" | "assistant";
    timestamp: string;
};

export type ChatType = {
    id: string;
    title: string;
    pinnedAt: string | null;
    lastMessageAt: string;
    isTyping: boolean;
    isResponseLoading: boolean;
    error?: string;
    messages: MessageType[];
    // Messages load when a chat is first opened, so `messages` is empty until this is "loaded"
    messagesStatus: "idle" | "loading" | "loaded" | "error";
    hasUserMessages: boolean;
};
