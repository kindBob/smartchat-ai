import { useEffect, useState } from "react";
import Chat from "../components/Chat";
import Sidebar from "../components/Sidebar/Sidebar";
import type { ChatType } from "../types/Chat";
import { createConversation, createMessage } from "../utils/conversation";
import { SquareMenu } from "lucide-react";
import { useChatGeneration } from "../hooks/useChatGeneration";
import { loadActiveChatId, saveActiveChatId } from "../utils/chatStorage";
import type { authClient } from "../auth";
import { mapChat } from "../utils/mapChat";
import { getErrorMessage } from "../utils/getErrorMessage";
import { toast } from "sonner";
import {
    createChat,
    fetchChats,
    deleteChat as deleteChatRequest,
    updateChat as updateChatRequest,
} from "../api/chatApi";
import "./Home.scss";

type AuthUser = typeof authClient.$Infer.Session.user;

type HomeProps = {
    user: AuthUser;
    onSignOut: () => Promise<void>;
};

function Home({ user, onSignOut }: HomeProps) {
    const [chats, setChats] = useState<ChatType[]>([]);
    const [isLoadingChats, setIsLoadingChats] = useState(true);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);

    const [loadError, setLoadError] = useState<string | null>(null);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const { generateAssistantResponse, generateTitle, stopTyping } = useChatGeneration({ activeChatId, setChats });

    const activeChat = chats.find((chat) => chat.id === activeChatId) ?? chats[0];

    async function loadUserChats() {
        try {
            setLoadError(null);
            setIsLoadingChats(true);

            const chatResponses = await fetchChats();

            const loadedChats: ChatType[] = chatResponses.map(mapChat);

            setChats(loadedChats);

            const loadedActiveChatId = loadActiveChatId();

            if (loadedActiveChatId && loadedChats.some((chat) => chat.id === loadedActiveChatId)) {
                setActiveChatId(loadedActiveChatId);
            } else if (loadedChats.length > 0) {
                setActiveChatId(loadedChats[0].id);
            } else {
                setActiveChatId(null);
            }
        } catch (error) {
            console.error("Failed to load chats:", error);
            setLoadError("Failed to load your chats.");
        } finally {
            setIsLoadingChats(false);
        }
    }

    useEffect(() => {
        loadUserChats();
    }, []);

    useEffect(() => {
        if (!activeChat) return;
        saveActiveChatId(activeChatId!);
    }, [activeChatId]);

    async function createNewChat(): Promise<ChatType | null> {
        if (chats[0].title === "New Chat" && chats[0].messages.length < 2) {
            selectChat(chats[0].id);

            toast("You already have an empty chat.");

            return null;
        }

        try {
            const chat = await createChat("New Chat");

            const newChat = mapChat(chat);

            return newChat;
        } catch (error) {
            console.error("Failed to create chat:", error);
            toast.error(getErrorMessage(error, "Could not create a chat"), { id: "create-chat" });
            throw error;
        }
    }

    async function deleteChat(chatId: string) {
        if (chats[0].title === "New Chat" && chats[0].messages.length < 2) {
            toast("You can't delete an empty chat.");

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

            stopTyping();
        } catch (error) {
            return;
        }

        const remaining = chats.filter((c) => c.id !== chatId);

        if (remaining.length === 0) {
            try {
                const newChat = await createNewChat();

                if (!newChat) return;

                setChats([newChat]);
                setActiveChatId(newChat.id);
            } catch (error) {
                setChats([]);
                setActiveChatId(null);
            }

            return;
        }

        setChats((prev) => prev.filter((c) => c.id !== chatId));
        if (chatId === activeChatId) setActiveChatId(remaining[0].id);
    }

    async function renameChat(id: string, newTitle: string) {
        const previousTitle = chats.find((c) => c.id === id)?.title;

        if (previousTitle === undefined) return;

        setChats((prev) => prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c)));

        try {
            await updateChatRequest(id, { title: newTitle });
        } catch (error) {
            console.error("Failed to rename chat:", error);
            setChats((prev) => prev.map((c) => (c.id === id ? { ...c, title: previousTitle } : c)));
            toast.error(getErrorMessage(error, "Could not rename the chat"), { id: "rename-chat" });
        }
    }

    async function togglePinChat(id: string) {
        const chat = chats.find((c) => c.id === id);
        if (!chat) return;

        const previousPinnedAt = chat.pinnedAt;
        const pinned = chat.pinnedAt === null;

        function setPinnedAt(pinnedAt: string | null) {
            setChats((prev) => prev.map((c) => (c.id === id ? { ...c, pinnedAt } : c)));
        }

        setPinnedAt(pinned ? new Date().toISOString() : null);

        try {
            const updated = await updateChatRequest(id, { pinned });
            setPinnedAt(updated.pinnedAt);
        } catch (error) {
            console.error("Failed to pin chat:", error);
            setPinnedAt(previousPinnedAt);
            toast.error(getErrorMessage(error, "Could not pin the chat"), { id: "pin-chat" });
        }
    }

    function selectChat(id: string) {
        setActiveChatId(id);
        setIsSidebarOpen(false);
    }

    function sendMessage(userMessage: string) {
        const newMessage = createMessage(userMessage, "user");

        if (activeChat?.title === "New Chat") {
            generateTitle(userMessage);
        }

        const updatedMessages = [...activeChat.messages, newMessage];

        setChats((prevChats) =>
            prevChats.map((chat) => {
                if (chat.id !== activeChatId) return chat;

                return {
                    ...chat,
                    isResponseLoading: true,
                    messages: updatedMessages,
                    lastMessageAt: new Date().toISOString(),
                    error: undefined,
                };
            }),
        );

        const conversation = createConversation(updatedMessages);

        generateAssistantResponse(conversation);
    }

    function retryResponse() {
        setChats((prevChats) =>
            prevChats.map((chat) => {
                if (chat.id !== activeChatId) return chat;

                return {
                    ...chat,
                    isResponseLoading: true,
                    error: undefined,
                };
            }),
        );

        const conversation = createConversation(activeChat.messages);

        generateAssistantResponse(conversation);
    }

    if (isLoadingChats) {
        return (
            <main className="home-loading">
                <div className="loading-logo">S</div>

                <div className="loading-spinner" />

                <p>Loading your chats...</p>
            </main>
        );
    }

    if (loadError) {
        return (
            <main className="home-loading">
                <div className="loading-logo">S</div>
                <p className="chat-error">
                    {loadError}
                    <button onClick={loadUserChats}>Try Again</button>
                </p>
            </main>
        );
    }

    return (
        <main className="home">
            <button className="mobile-menu-button" onClick={() => setIsSidebarOpen(true)} aria-label="Open sidebar">
                <SquareMenu />
            </button>
            <Sidebar
                userName={user.name || user.email || "User"}
                chats={chats}
                onNewChat={async () => {
                    try {
                        const newChat = await createNewChat();

                        if (!newChat) return;

                        setChats((prev) => [newChat, ...prev]);
                        setActiveChatId(newChat.id);
                        setIsSidebarOpen(false);
                    } catch (error) {
                        console.error("Failed to create a new chat", error);
                    }
                }}
                onSelectChat={selectChat}
                activeChatId={activeChatId}
                onDeleteChat={deleteChat}
                onRenameChat={renameChat}
                onPinChat={togglePinChat}
                onSignOut={onSignOut}
                isSidebarOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
            <Chat chat={activeChat} onSend={sendMessage} onStop={stopTyping} onRetry={retryResponse} />
        </main>
    );
}

export default Home;
