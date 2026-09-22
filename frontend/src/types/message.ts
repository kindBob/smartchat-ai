export type MessageType = {
    id: string;
    text: string;
    sender: "user" | "assistant";
    timestamp: string;
};
