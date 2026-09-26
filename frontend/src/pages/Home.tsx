import { useEffect, useState } from "react";
import Chat from "../components/Chat";
import Sidebar from "../components/Sidebar/Sidebar";
import type { ChatType } from "../types/Chat";
import { loadActiveChatId, loadChats, saveActiveChatId, saveChats } from "../utils/chatStorage";
import { createConversation, createMessage } from "../utils/conversation";
import { SquareMenu } from "lucide-react";
import { useChatGeneration } from "../hooks/useChatGeneration";
import "./Home.scss";

function Home() {
    const [chats, setChats] = useState<ChatType[]>(() => {
        const storedChats = loadChats();

        if (!storedChats || storedChats.length === 0) return [createNewChat()];

        return storedChats;
    });
    const [activeChatId, setActiveChatId] = useState<string>(() => {
        const storedActiveChatId = loadActiveChatId();

        if (storedActiveChatId && chats.some((chat) => chat.id === storedActiveChatId)) {
            return storedActiveChatId;
        }

        return chats[0].id;
    });

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const activeChat = chats.find((chat) => chat.id === activeChatId) ?? chats[0];

    const { generateAssistantResponse, generateTitle, stopTyping } = useChatGeneration({ activeChatId, setChats });

    useEffect(() => {
        saveChats(chats);
    }, [chats]);

    useEffect(() => {
        saveActiveChatId(activeChatId);
    }, [activeChatId]);

    function createNewChat(): ChatType {
        return {
            id: crypto.randomUUID(),
            title: "New Chat",
            messages: [createMessage("Hello! How can I help you today?", "assistant")],
            isTyping: false,
            isResponseLoading: false,
        };
    }

    function deleteChat(id: string) {
        const newChats = chats.filter((chat) => chat.id !== id);

        if (newChats.length === 0) {
            const newChat = createNewChat();

            setChats([newChat]);
            setActiveChatId(newChat.id);

            return;
        }

        setChats(newChats);

        if (id === activeChatId) {
            setActiveChatId(newChats[newChats.length - 1].id);
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
                };
            })
        );

        const conversation = createConversation(updatedMessages);

        generateAssistantResponse(conversation);
    }

    function handleNewChat() {
        const newChat = createNewChat();

        setChats((prev) => [newChat, ...prev]);
        setActiveChatId(newChat.id);
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
            <Chat chat={activeChat} onSend={sendMessage} onStop={stopTyping} />
        </main>
    );
}

export default Home;
