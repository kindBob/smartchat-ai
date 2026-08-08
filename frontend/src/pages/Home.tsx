import { useState } from "react";
import Chat from "../components/Chat";
import Sidebar from "../components/Sidebar";
import type { MessageType } from "../types/Message";
import type { ChatType } from "../types/Chat";

import "./Home.scss";

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
        },
        {
            id: crypto.randomUUID(),
            title: "Workout",
            messages: [createInitialMessage()],
        },
    ];

    const [chats, setChats] = useState<ChatType[]>(initialChats);
    const [activeChatId, setActiveChatId] = useState<string | null>(initialChats[0].id);
    const [isTyping, setIsTyping] = useState(false);

    const activeChat = chats.find((chat) => chat.id === activeChatId);

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
        };

        setChats((prev) => [newChat, ...prev]);
        setActiveChatId(newChat.id);
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
                    if (chat.id !== activeChatId) return chat;

                    return {
                        ...chat,
                        messages: [...chat.messages, assistantMessage],
                    };
                })
            );

            let index = 0;

            const interval = setInterval(() => {
                const currentChar = aiResponse[index];

                setChats((prevChats) =>
                    prevChats.map((chat) => {
                        if (chat.id !== activeChatId) return chat;

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
                    setIsTyping(false);
                }
            }, 30);
        } catch (error) {
            console.log("Error generating assistant message:", error);
            setIsTyping(false);
        }
    }

    function sendMessage(userMessage: string) {
        const newMessage = createMessage(userMessage, "user");

        setChats((prevChats) =>
            prevChats.map((chat) => {
                if (chat.id !== activeChatId) return chat;

                return {
                    ...chat,
                    messages: [...chat.messages, newMessage],
                };
            })
        );
        setIsTyping(true);

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
                onSelectChat={(id) => selectChat(id)}
                activeChatId={activeChatId}
            />
            <Chat chat={activeChat} onSend={sendMessage} isTyping={isTyping} />
        </main>
    );
}

export default Home;
