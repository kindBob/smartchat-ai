export type MessageType = {
    id: string;
    text: string;
    sender: "user" | "assistant";
    timestamp: string;
};

export type ChatType = {
    id: string;
    title: string;
    messages: MessageType[];
    isTyping: boolean;
    isResponseLoading: boolean;
};
