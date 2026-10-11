import { useEffect, useState } from "react";
import Chat from "../components/Chat";
import Sidebar from "../components/Sidebar/Sidebar";
import type { ChatType } from "../types/Chat";
import { createConversation, createMessage } from "../utils/conversation";
import { SquareMenu } from "lucide-react";
import { useChatGeneration } from "../hooks/useChatGeneration";
import "./Home.scss";
import {
    createChat,
    fetchChats,
    deleteChat as deleteChatRequest,
    renameChat as renameChatRequest,
} from "../api/chatApi";
import { loadActiveChatId, saveActiveChatId } from "../utils/chatStorage";
import type { authClient } from "../auth";

type AuthUser = typeof authClient.$Infer.Session.user;

type HomeProps = {
    user: AuthUser;
    onSignOut: () => Promise<void>;
};

function Home({ user, onSignOut }: HomeProps) {
    const [chats, setChats] = useState<ChatType[]>([]);
    const [isLoadingChats, setIsLoadingChats] = useState(true);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const activeChat = chats.find((chat) => chat.id === activeChatId) ?? chats[0];

    const { generateAssistantResponse, generateTitle, stopTyping } = useChatGeneration({ activeChatId, setChats });

    useEffect(() => {
        async function loadUserChats() {
            try {
                const chatResponses = await fetchChats();

                const loadedChats: ChatType[] = chatResponses.map((chat) => ({
                    id: chat.id,
                    title: chat.title,
                    messages: chat.messages.map((message) => ({
                        id: message.id,
                        text: message.text,
                        sender: message.role === "USER" ? "user" : "assistant",
                        timestamp: message.createdAt,
                    })),
                    isTyping: false,
                    isResponseLoading: false,
                }));

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
            } finally {
                setIsLoadingChats(false);
            }
        }

        loadUserChats();
    }, []);

    useEffect(() => {
        if (!activeChat) return;
        saveActiveChatId(activeChatId!);
    }, [activeChatId]);

    async function deleteChat(chatId: string) {
        try {
            await deleteChatRequest(chatId);

            const newChats = chats.filter((chat) => chat.id !== chatId);

            if (newChats.length === 0) {
                const newChat = await handleNewChat();

                setChats([newChat]);
                setActiveChatId(newChat.id);

                return;
            }

            setChats(newChats);
        } catch (error) {
            console.error("Failed to delete chat:", error);
        }
    }

    async function renameChat(id: string, newTitle: string) {
        try {
            setChats((prev) => prev.map((chat) => (chat.id === id ? { ...chat, title: newTitle } : chat)));

            await renameChatRequest(id, newTitle);
        } catch (error) {
            console.error("Failed to rename chat:", error);
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
                    error: undefined,
                };
            })
        );

        const conversation = createConversation(updatedMessages);

        generateAssistantResponse(conversation);
    }

    async function handleNewChat(): Promise<ChatType> {
        try {
            const chat = await createChat("New Chat");

            const newChat: ChatType = {
                id: chat.id,
                title: chat.title,
                messages: chat.messages.map((message) => ({
                    id: message.id,
                    text: message.text,
                    sender: message.role === "USER" ? "user" : "assistant",
                    timestamp: message.createdAt,
                })),
                isTyping: false,
                isResponseLoading: false,
            };

            setIsSidebarOpen(false);

            return newChat;
        } catch (error) {
            console.error("Failed to create chat:", error);
            throw error;
        }
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
            })
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

    return (
        <main className="home">
            <button className="mobile-menu-button" onClick={() => setIsSidebarOpen(true)} aria-label="Open sidebar">
                <SquareMenu />
            </button>
            <Sidebar
                userName={user.name || user.email || "User"}
                chats={chats}
                onNewChat={async () => {
                    const newChat = await handleNewChat();

                    setChats((prev) => [newChat, ...prev]);
                    setActiveChatId(newChat.id);
                }}
                onSelectChat={selectChat}
                activeChatId={activeChatId}
                onDeleteChat={deleteChat}
                onRenameChat={renameChat}
                onSignOut={onSignOut}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
            <Chat chat={activeChat} onSend={sendMessage} onStop={stopTyping} onRetry={retryResponse} />
        </main>
    );
}

export default Home;
