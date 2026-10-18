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
};
