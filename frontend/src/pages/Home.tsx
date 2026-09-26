import { useEffect, useRef, useState } from "react";
import Chat from "../components/Chat";
import Sidebar from "../components/Sidebar/Sidebar";
import type { ChatType, MessageType } from "../types/Chat";
import type { ConversationType } from "../types/Api";
import { loadActiveChatId, loadChats, saveActiveChatId, saveChats } from "../utils/chatStorage";
import { fetchAssistantResponse, fetchChatTitle } from "../api/chatApi";
import { createConversation } from "../utils/conversation";
import "./Home.scss";
import { SquareMenu } from "lucide-react";

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

    const abortControllerRef = useRef<AbortController | null>(null);
    const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const activeChat = chats.find((chat) => chat.id === activeChatId) ?? chats[0];

    useEffect(() => {
        saveChats(chats);
    }, [chats]);

    useEffect(() => {
        saveActiveChatId(activeChatId);
    }, [activeChatId]);

    useEffect(() => {
        return () => {
            if (typingIntervalRef.current) {
                clearInterval(typingIntervalRef.current);
                typingIntervalRef.current = null;
            }

            abortControllerRef.current?.abort();
        };
    }, []);

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

    function createMessage(text: string, sender: MessageType["sender"]): MessageType {
        return {
            id: crypto.randomUUID(),
            text,
            sender,
            timestamp: new Date().toISOString(),
        };
    }

    async function generateAssistantResponse(conversation: ConversationType[]) {
        const currentChatId = activeChatId;

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const aiResponse = await fetchAssistantResponse(conversation, controller);

            const assistantMessage = createMessage("", "assistant");

            setChats((prevChats) =>
                prevChats.map((chat) => {
                    if (chat.id !== currentChatId) return chat;

                    return {
                        ...chat,
                        isTyping: true,
                        isResponseLoading: false,
                        messages: [...chat.messages, assistantMessage],
                    };
                })
            );

            startTypingAnimation(assistantMessage, aiResponse, currentChatId);
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") return;

            console.error("Error generating assistant message:", error);

            setChats((prevChats) =>
                prevChats.map((chat) => {
                    if (chat.id !== currentChatId) return chat;

                    return {
                        ...chat,
                        isTyping: false,
                        isResponseLoading: false,
                    };
                })
            );
        } finally {
            if (abortControllerRef.current === controller) abortControllerRef.current = null;
        }
    }

    function startTypingAnimation(assistantMessage: MessageType, aiResponse: string, currentChatId: string) {
        let index = 0;

        typingIntervalRef.current = setInterval(() => {
            if (index >= aiResponse.length) {
                if (typingIntervalRef.current) {
                    clearInterval(typingIntervalRef.current);
                    typingIntervalRef.current = null;
                }

                setChats((prevChats) =>
                    prevChats.map((chat) => {
                        if (chat.id !== currentChatId) return chat;

                        return {
                            ...chat,
                            isTyping: false,
                        };
                    })
                );

                return;
            }

            const currentChar = aiResponse[index];

            setChats((prevChats) =>
                prevChats.map((chat) => {
                    if (chat.id !== currentChatId) return chat;

                    return {
                        ...chat,
                        messages: chat.messages.map((message) => {
                            if (message.id !== assistantMessage.id) return message;

                            return {
                                ...message,
                                text: message.text + currentChar,
                            };
                        }),
                    };
                })
            );

            index++;
        }, 30);
    }

    async function generateTitle(message: string) {
        const currentChatId = activeChatId;

        try {
            const newTitle = await fetchChatTitle(message);

            setChats((prev) => prev.map((chat) => (chat.id === currentChatId ? { ...chat, title: newTitle } : chat)));
        } catch (error) {
            console.log("Error generating title: " + error);
        }
    }

    function stopTyping() {
        abortControllerRef.current?.abort();

        if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
        }

        setChats((prevChats) =>
            prevChats.map((chat) => {
                if (chat.id !== activeChatId) return chat;
                return {
                    ...chat,
                    isTyping: false,
                    isResponseLoading: false,
                };
            })
        );
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
