import { useState } from "react";
import Chat from "../components/Chat/Chat";
import { useChats } from "../hooks/useChats";
import type { authClient } from "../auth";
import { SquareMenu, X } from "lucide-react";
import { useChatGeneration } from "../hooks/useChatGeneration";
import Sidebar from "../components/Sidebar/Sidebar";
import LoadingScreen from "../components/LoadingScreen";
import LoadErrorScreen from "../components/LoadErrorScreen";
import { createMessage } from "../utils/conversation";
import "./Home.scss";

type AuthUser = typeof authClient.$Infer.Session.user;
type HomeProps = {
    user: AuthUser;
    onSignOut: () => Promise<void>;
};

export default function Home({ user, onSignOut }: HomeProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const chatsState = useChats();
    const { chats, setChats, activeChat, activeChatId, isLoading, loadError } = chatsState;

    const { generateAssistantResponse, generateTitle, stopTyping } = useChatGeneration({ setChats });

    function sendMessage(userMessage: string) {
        if (!activeChat || activeChat.isResponseLoading || activeChat.isTyping) return;

        const chatId = activeChat.id;
        const isFirstMessage = activeChat.title === "New Chat";
        const newMessage = createMessage(userMessage, "user");

        setChats((prev) =>
            prev.map((chat) =>
                chat.id !== chatId
                    ? chat
                    : {
                          ...chat,
                          isResponseLoading: true,
                          messages: [...chat.messages, newMessage],
                          lastMessageAt: new Date().toISOString(),
                          error: undefined,
                      },
            ),
        );

        if (isFirstMessage) generateTitle(chatId, userMessage);
        generateAssistantResponse(chatId, userMessage);
    }

    function retryResponse() {
        if (!activeChat || activeChat.isResponseLoading) return;

        const chatId = activeChat.id;
        const lastUserMessage = [...activeChat.messages].reverse().find((m) => m.sender === "user");
        if (!lastUserMessage) return;

        setChats((prev) =>
            prev.map((c) => (c.id === chatId ? { ...c, isResponseLoading: true, error: undefined } : c)),
        );

        generateAssistantResponse(activeChat.id, lastUserMessage.text);
    }

    if (isLoading) return <LoadingScreen />;
    if (loadError) return <LoadErrorScreen message={loadError} onRetry={chatsState.loadChats} />;

    return (
        <main className="home">
            <button className="mobile-menu-button" onClick={() => setIsSidebarOpen(true)} aria-label="Open sidebar">
                <SquareMenu />
            </button>

            <button className="close-sidebar" onClick={() => setIsSidebarOpen(false)} aria-label="Close sidebar">
                <X />
            </button>

            <Sidebar
                userName={user.name || user.email || "User"}
                chats={chats}
                activeChatId={activeChatId}
                isSidebarOpen={isSidebarOpen}
                isCreatingChat={chatsState.isCreatingChat}
                onNewChat={async () => {
                    await chatsState.createNewChat();
                    setIsSidebarOpen(false);
                }}
                onSelectChat={(id) => {
                    chatsState.selectChat(id);
                    setIsSidebarOpen(false);
                }}
                onDeleteChat={(id) => chatsState.deleteChat(id, stopTyping)}
                onRenameChat={chatsState.renameChat}
                onPinChat={chatsState.togglePinChat}
                onSignOut={onSignOut}
                onClose={() => setIsSidebarOpen(false)}
            />

            {activeChat ? (
                <Chat
                    chat={activeChat}
                    onSend={sendMessage}
                    onStop={() => activeChat && stopTyping(activeChat.id)}
                    onRetry={retryResponse}
                />
            ) : (
                <div className="chat-empty">
                    <p>No chats yet.</p>
                </div>
            )}
        </main>
    );
}
