import { useState } from "react";
import type { MessageType } from "../types/message";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

type CreateMessageParams = {
    id: number;
    text: string;
    sender: "user" | "assistant";
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
            text: sender === "assistant" ? "You said: " + text : text,
            sender,
            timestamp: new Date(),
        };
    }

    function addAssistantMessage(userMessage: string) {
        setMessages((prevMessages) => [
            ...prevMessages,
            createMessage({ id: prevMessages.length + 1, text: userMessage, sender: "assistant" }),
        ]);

        setIsTyping(false);
    }

    function handleSend(text: string) {
        setMessages((prevMessages) => [
            ...prevMessages,
            createMessage({ id: prevMessages.length + 1, text: text, sender: "user" }),
        ]);
        setIsTyping(true);

        setTimeout(() => addAssistantMessage(text), 5000);
    }

    return (
        <div>
            <MessageList messages={messages} isTyping={isTyping} />
            <ChatInput onSend={handleSend} onClear={clearMessages} />
        </div>
    );
}

export default Chat;
