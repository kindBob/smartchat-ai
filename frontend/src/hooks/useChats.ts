import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { ChatType } from "../types/Chat";
import {
    createChat as createChatRequest,
    deleteChat as deleteChatRequest,
    fetchChats,
    updateChat as updateChatRequest,
} from "../api/chatApi";
import { loadActiveChatId, saveActiveChatId } from "../utils/chatStorage";
import { mapChat } from "../utils/mapChat";
import { getErrorMessage } from "../utils/getErrorMessage";

const isEmptyChat = (chat: ChatType) => !chat.messages.some((m) => m.sender === "user");

export function useChats() {
    const [chats, setChats] = useState<ChatType[]>([]);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isCreatingChat, setIsCreatingChat] = useState(false);

    const hasLoadedRef = useRef(false);
    const isCreatingRef = useRef(false);

    const chatsRef = useRef<ChatType[]>(chats);

    const activeChat = chats.find((c) => c.id === selectedChatId) ?? chats[0];
    const activeChatId = activeChat?.id ?? null;

    const loadChats = useCallback(async () => {
        if (hasLoadedRef.current) return;
        hasLoadedRef.current = true;

        setLoadError(null);
        setIsLoading(true);

        try {
            let loaded = (await fetchChats()).map(mapChat);

            if (loaded.length === 0) {
                loaded = [mapChat(await createChatRequest("New Chat"))];
            }

            setChats(loaded);

            const storedId = loadActiveChatId();
            if (storedId && loaded.some((c) => c.id === storedId)) setSelectedChatId(storedId);
        } catch (error) {
            console.error("Failed to load chats:", error);
            hasLoadedRef.current = false;
            setLoadError("Failed to load your chats.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadChats();
    }, [loadChats]);

    useEffect(() => {
        if (activeChatId) saveActiveChatId(activeChatId);
    }, [activeChatId]);

    useEffect(() => {
        chatsRef.current = chats;
    }, [chats]);

    async function createNewChat() {
        if (isCreatingRef.current) return;

        const emptyChat = chats.find((c) => c.title === "New Chat" && isEmptyChat(c));

        if (emptyChat) {
            setSelectedChatId(emptyChat.id);
            toast("You already have an empty chat.", { id: "empty-chat" });
            return;
        }

        isCreatingRef.current = true;
        setIsCreatingChat(true);

        try {
            const chat = mapChat(await createChatRequest("New Chat"));

            setChats((prev) => [chat, ...prev]);
            setSelectedChatId(chat.id);
        } catch (error) {
            console.error("Failed to create chat:", error);
            toast.error(getErrorMessage(error, "Could not create a chat."), { id: "create-chat" });
        } finally {
            isCreatingRef.current = false;
            setIsCreatingChat(false);
        }
    }

    async function deleteChat(chatId: string, onDeleted?: (chatId: string) => void) {
        const chat = chats.find((c) => c.id === chatId);
        if (!chat) return;

        if (isEmptyChat(chat) && chats.length === 1) {
            toast("This is your only chat, and it's already empty.", { id: "delete-empty" });
            return;
        }

        const request = deleteChatRequest(chatId);

        toast.promise(request, {
            loading: "Deleting chat...",
            success: "Chat deleted.",
            error: (err) => {
                console.error("Failed to delete chat:", err);
                return getErrorMessage(err, "Could not delete the chat.");
            },
            duration: 2000,
        });

        try {
            await request;
        } catch {
            return;
        }

        onDeleted?.(chatId);

        const remaining = chatsRef.current.filter((c) => c.id !== chatId);

        if (remaining.length === 0) {
            try {
                const replacement = mapChat(await createChatRequest("New Chat"));

                setChats([replacement]);
                setSelectedChatId(replacement.id);
            } catch (error) {
                console.error("Failed to create replacement chat:", error);
                setChats([]);
                setSelectedChatId(null);
                toast.error("Could not create a new chat.", { id: "create-chat" });
            }

            return;
        }

        setChats((prev) => prev.filter((c) => c.id !== chatId));
    }

    async function renameChat(id: string, newTitle: string) {
        const previousTitle = chats.find((c) => c.id === id)?.title;
        if (previousTitle === undefined) return;

        const setTitle = (title: string) => setChats((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)));

        setTitle(newTitle);

        try {
            await updateChatRequest(id, { title: newTitle });
        } catch (error) {
            console.error("Failed to rename chat:", error);
            setTitle(previousTitle);
            toast.error(getErrorMessage(error, "Could not rename the chat."), { id: "rename-chat" });
        }
    }

    async function togglePinChat(id: string) {
        const chat = chats.find((c) => c.id === id);
        if (!chat) return;

        const previousPinnedAt = chat.pinnedAt;
        const pinned = previousPinnedAt === null;

        const setPinnedAt = (pinnedAt: string | null) =>
            setChats((prev) => prev.map((c) => (c.id === id ? { ...c, pinnedAt } : c)));

        setPinnedAt(pinned ? new Date().toISOString() : null);

        try {
            const updated = await updateChatRequest(id, { pinned });
            setPinnedAt(updated.pinnedAt);
        } catch (error) {
            console.error("Failed to pin chat:", error);
            setPinnedAt(previousPinnedAt);
            toast.error(getErrorMessage(error, "Could not pin the chat."), { id: "pin-chat" });
        }
    }

    return {
        chats,
        setChats,
        activeChat,
        activeChatId,
        isLoading,
        loadError,
        isCreatingChat,
        loadChats,
        selectChat: setSelectedChatId,
        createNewChat,
        deleteChat,
        renameChat,
        togglePinChat,
    };
}
