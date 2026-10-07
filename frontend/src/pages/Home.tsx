import { useEffect, useState } from "react";
import Chat from "../components/Chat";
import Sidebar from "../components/Sidebar/Sidebar";
import type { ChatType } from "../types/Chat";
import { createConversation, createMessage } from "../utils/conversation";
import { SquareMenu } from "lucide-react";
import { useChatGeneration } from "../hooks/useChatGeneration";
import "./Home.scss";
import { createChat, fetchChats, deleteChat as deleteChatRequest } from "../api/chatApi";
import { saveActiveChatId } from "../utils/chatStorage";

function Home() {
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

                const chats: ChatType[] = chatResponses.map((chat) => ({
                    id: chat.id,
                    title: chat.title,
                    messages: [],
                    isTyping: false,
                    isResponseLoading: false,
                }));

                setChats(chats);

                if (chats.length > 0) setActiveChatId(chats[0].id);
            } catch (error) {
                console.error("Failed to load chats:", error);
            } finally {
                setIsLoadingChats(false);
            }
        }

        loadUserChats();
    }, []);

    useEffect(() => {
        saveActiveChatId(activeChatId);
    }, [activeChatId]);

    async function deleteChat(id: string) {
        try {
            await deleteChatRequest(id);

            const newChats = chats.filter((chat) => chat.id !== id);

            if (newChats.length === 0) {
                await handleNewChat();

                return;
            }

            setChats(newChats);

            if (id === activeChatId) {
                setActiveChatId(newChats[0].id);
            }
        } catch (error) {
            console.error("Failed to delete chat:", error);
        }
    }

    function renameChat(id: string, newTitle: string) {
        setChats((prev) => prev.map((chat) => (chat.id === id ? { ...chat, title: newTitle } : chat)));
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

    async function handleNewChat() {
        try {
            const chat = await createChat("New Chat");

            const newChat: ChatType = {
                id: chat.id,
                title: chat.title,
                messages: [],
                isTyping: false,
                isResponseLoading: false,
            };

            setChats((prev) => [newChat, ...prev]);
            setActiveChatId(newChat.id);
        } catch (error) {
            console.error("Failed to create chat:", error);
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
        return <div>Loading chats...</div>;
    }

    return (
        <main className="home">
            <button className="mobile-menu-button" onClick={() => setIsSidebarOpen(true)} aria-label="Open sidebar">
                <SquareMenu />
            </button>
            <Sidebar
                chats={chats}
                onNewChat={handleNewChat}
                onSelectChat={selectChat}
                activeChatId={activeChatId}
                onDeleteChat={deleteChat}
                onRenameChat={renameChat}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
            <Chat chat={activeChat} onSend={sendMessage} onStop={stopTyping} onRetry={retryResponse} />
        </main>
    );
}

export default Home;
