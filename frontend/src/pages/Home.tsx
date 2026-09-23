import { useEffect, useRef, useState } from "react";
import Chat from "../components/Chat";
import Sidebar from "../components/Sidebar";
import type { MessageType } from "../types/Message";
import type { ChatType } from "../types/Chat";

import "./Home.scss";

const CHATS_STORAGE_KEY = "smartchat-chats";
const ACTIVE_CHAT_STORAGE_KEY = "smartchat-active-chat";

type ConversationType = {
    parts: [
        {
            text: string;
        }
    ];
    role: "user" | "model";
};

function Home() {
    const [chats, setChats] = useState<ChatType[]>(() => {
        const storedChats = localStorage.getItem(CHATS_STORAGE_KEY);

        if (!storedChats) return [createNewChat()];

        try {
            const parsedChats = JSON.parse(storedChats);

            if (parsedChats.length === 0) return [createNewChat()];

            return parsedChats;
        } catch {
            return [createNewChat()];
        }
    });
    const [activeChatId, setActiveChatId] = useState<string>(() => {
        const storedActiveChatId = localStorage.getItem(ACTIVE_CHAT_STORAGE_KEY);

        if (storedActiveChatId && chats.some((chat) => chat.id === storedActiveChatId)) {
            return storedActiveChatId;
        }

        return chats[0].id;
    });

    const abortControllerRef = useRef<AbortController | null>(null);
    const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const activeChat = chats.find((chat) => chat.id === activeChatId) ?? chats[0];

    useEffect(() => {
        const modifiedChats = chats.map(({ isTyping, isResponseLoading, ...chat }) => chat);

        localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(modifiedChats));
    }, [chats]);

    useEffect(() => {
        localStorage.setItem(ACTIVE_CHAT_STORAGE_KEY, activeChatId);
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
            const request = await fetch("http://localhost:3001/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                signal: controller.signal,
                body: JSON.stringify({
                    messages: conversation,
                }),
            });

            const data = await request.json();

            if (!request.ok) {
                throw new Error(data.message || "Failed to generate AI response");
            }

            const aiResponse = data.response;

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

    async function generateTitle(message: string) {
        const currentChatId = activeChatId;

        try {
            const request = await fetch("http://localhost:3001/chat/title", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message }),
            });

            const data = await request.json();

            if (!request.ok) {
                throw new Error(data.message || "Failed to generate chat title");
            }

            const newTitle = data.response;

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

        const conversation: ConversationType[] = updatedMessages
            .filter((message) => message.text.trim() !== "")
            .map((message) => ({
                role: message.sender === "assistant" ? "model" : "user",
                parts: [
                    {
                        text: message.text,
                    },
                ],
            }));

        generateAssistantResponse(conversation);
    }

    function handleNewChat() {
        const newChat = createNewChat();

        setChats((prev) => [newChat, ...prev]);
        setActiveChatId(newChat.id);
    }

    return (
        <main className="home">
            <Sidebar
                chats={chats}
                onNewChat={handleNewChat}
                onSelectChat={selectChat}
                activeChatId={activeChatId}
                onDeleteChat={deleteChat}
                onRenameChat={renameChat}
            />
            <Chat chat={activeChat} onSend={sendMessage} onStop={stopTyping} />
        </main>
    );
}

export default Home;
