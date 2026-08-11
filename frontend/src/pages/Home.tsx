import { useEffect, useState } from "react";
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
    const initialChats: ChatType[] = [
        {
            id: crypto.randomUUID(),
            title: "React Questions",
            messages: [createInitialMessage()],
            isTyping: false,
            isResponseLoading: false,
        },
        {
            id: crypto.randomUUID(),
            title: "Workout",
            messages: [createInitialMessage()],
            isTyping: false,
            isResponseLoading: false,
        },
    ];

    const [chats, setChats] = useState<ChatType[]>(() => {
        const storedChats = localStorage.getItem(CHATS_STORAGE_KEY);

        if (storedChats) {
            return JSON.parse(storedChats);
        }

        return initialChats;
    });
    const [activeChatId, setActiveChatId] = useState(() => {
        const storedActiveChatId = localStorage.getItem(ACTIVE_CHAT_STORAGE_KEY);

        if (storedActiveChatId && chats.some((chat) => chat.id === storedActiveChatId)) {
            return storedActiveChatId;
        }

        return chats[0].id;
    });

    const activeChat = chats.find((chat) => chat.id === activeChatId) ?? chats[0];

    useEffect(() => {
        const modifiedChats = chats.map(({ isTyping, isResponseLoading, ...chat }) => chat);

        localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(modifiedChats));
    }, [chats]);

    useEffect(() => {
        localStorage.setItem(ACTIVE_CHAT_STORAGE_KEY, activeChatId);
    }, [activeChatId]);

    function createInitialMessage(): MessageType {
        return {
            id: crypto.randomUUID(),
            text: "Hello! How can I help you today?",
            sender: "assistant",
            timestamp: new Date(),
        };
    }

    function createNewChat() {
        const newChat: ChatType = {
            id: crypto.randomUUID(),
            title: "New Chat",
            messages: [createInitialMessage()],
            isTyping: false,
            isResponseLoading: false,
        };

        setChats((prev) => [newChat, ...prev]);
        setActiveChatId(newChat.id);
    }

    function deleteChat(id: string) {
        const newChats = chats.filter((chat) => chat.id !== id);

        if (newChats.length === 0) {
            createNewChat();
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
            timestamp: new Date(),
        };
    }

    async function generateAssistantResponse(conversation: ConversationType[]) {
        const currentChatId = activeChatId;

        try {
            const request = await fetch("http://localhost:3000/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messages: conversation,
                }),
            });

            const data = await request.json();
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

            const interval = setInterval(() => {
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

                if (index >= aiResponse.length) {
                    clearInterval(interval);

                    setChats((prevChats) =>
                        prevChats.map((chat) => {
                            if (chat.id !== currentChatId) return chat;

                            return {
                                ...chat,
                                isTyping: false,
                            };
                        })
                    );
                }
            }, 30);
        } catch (error) {
            console.log("Error generating assistant message:", error);
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
        }
    }

    async function generateTitle(message: string) {
        try {
            const request = await fetch("http://localhost:3000/chat-title", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message }),
            });

            const data = await request.json();
            const newTitle = data.response;

            setChats((prev) => prev.map((chat) => (chat.id === activeChatId ? { ...chat, title: newTitle } : chat)));
        } catch (error) {
            console.log("Error generating title: " + error);
        }
    }

    function sendMessage(userMessage: string) {
        const newMessage = createMessage(userMessage, "user");

        if (activeChat?.title === "New Chat") {
            generateTitle(userMessage);
        }

        setChats((prevChats) =>
            prevChats.map((chat) => {
                if (chat.id !== activeChatId) return chat;

                return {
                    ...chat,
                    isResponseLoading: true,
                    messages: [...chat.messages, newMessage],
                };
            })
        );

        const conversation: ConversationType[] = [...activeChat.messages, newMessage].map((message) => ({
            role: message.sender === "assistant" ? "model" : "user",
            parts: [
                {
                    text: message.text,
                },
            ],
        }));

        generateAssistantResponse(conversation);
    }

    return (
        <main className="home">
            <Sidebar
                chats={chats}
                onNewChat={createNewChat}
                onSelectChat={selectChat}
                activeChatId={activeChatId}
                onDeleteChat={deleteChat}
                onRenameChat={renameChat}
            />
            <Chat chat={activeChat} onSend={sendMessage} />
        </main>
    );
}

export default Home;
