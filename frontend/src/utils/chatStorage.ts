import type { ChatType } from "../types/Chat";

const CHATS_STORAGE_KEY = "smartchat-chats";
const ACTIVE_CHAT_STORAGE_KEY = "smartchat-active-chat";

export function loadChats(): ChatType[] | null {
    const storedChats = localStorage.getItem(CHATS_STORAGE_KEY);

    if (!storedChats) return null;

    try {
        return JSON.parse(storedChats);
    } catch {
        return null;
    }
}

export function saveChats(chats: ChatType[]) {
    const modifiedChats = chats.map(({ isTyping, isResponseLoading, ...chat }) => chat);

    localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(modifiedChats));
}

export function loadActiveChatId(): string | null {
    return localStorage.getItem(ACTIVE_CHAT_STORAGE_KEY);
}

export function saveActiveChatId(id: string) {
    localStorage.setItem(ACTIVE_CHAT_STORAGE_KEY, id);
}
