import type { MessageType } from "./Message";

export type ChatType = {
    id: string;
    title: string;
    messages: MessageType[];
    isTyping: boolean;
    isResponseLoading: boolean;
};
