export type MessageType = {
    id: number;
    text: string;
    sender: "user" | "assistant";
    timestamp: Date;
};
