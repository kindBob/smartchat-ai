const ACTIVE_CHAT_STORAGE_KEY = "smartchat-active-chat";

export function loadActiveChatId(): string | null {
    return localStorage.getItem(ACTIVE_CHAT_STORAGE_KEY);
}

export function saveActiveChatId(id: string) {
    localStorage.setItem(ACTIVE_CHAT_STORAGE_KEY, id);
}
