import { useState } from "react";
import type { MessageType } from "../types/message";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import "./Chat.scss";

type CreateMessageParams = {
    id: number;
    text: string;
    sender: "user" | "assistant";
};

type ChatType = {
    parts: [
        {
            text: string;
        }
    ];
    role: "user" | "model";
};

function Chat() {
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState<MessageType[]>([
        {
            id: 1,
            text: "Hello! How can I help you today?",
            sender: "assistant",
            timestamp: new Date(),
        },
    ]);

    function clearMessages() {
        setMessages([
            {
                id: 1,
                text: "Hello! How can I help you today?",
                sender: "assistant",
                timestamp: new Date(),
            },
        ]);
    }

    function createMessage({ id, text, sender }: CreateMessageParams): MessageType {
        return {
            id,
            text,
            sender,
            timestamp: new Date(),
        };
    }

    async function addAssistantMessage(conversation: ChatType[]) {
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

        //Add empty assistant message
        setIsTyping(false);
        setMessages((prevMessages) => [
            ...prevMessages,
            createMessage({ id: prevMessages.length + 1, text: "", sender: "assistant" }),
        ]);

        let index = 0;

        const interval = setInterval(() => {
            const currentChar = aiResponse[index];

            setMessages((prevMessages) =>
                prevMessages.map((message, i) => {
                    if (i !== prevMessages.length - 1) return message;

                    return {
                        ...message,
                        text: message.text + currentChar,
                    };
                })
            );

            index++;

            if (index >= aiResponse.length) {
                clearInterval(interval);
            }
        }, 30);
    }

    function handleSend(userMessage: string) {
        setMessages((prevMessages) => [
            ...prevMessages,
            createMessage({ id: prevMessages.length + 1, text: userMessage, sender: "user" }),
        ]);
        setIsTyping(true);

        const conversation: ChatType[] = messages.map((message) => ({
            role: message.sender === "assistant" ? "model" : "user",
            parts: [
                {
                    text: message.text,
                },
            ],
        }));

        conversation.push({
            role: "user",
            parts: [
                {
                    text: userMessage,
                },
            ],
        });

        addAssistantMessage(conversation);
    }

    return (
        <div className="chat">
            <MessageList messages={messages} isTyping={isTyping} />
            <ChatInput onSend={handleSend} onClear={clearMessages} isTyping={isTyping} />
        </div>
    );
}

export default Chat;
