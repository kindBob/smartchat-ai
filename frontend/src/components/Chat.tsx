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

    function addAssistantMessage(userMessage: string) {
        const response = "You said: " + userMessage;

        //Add empty assistant message
        setMessages((prevMessages) => [
            ...prevMessages,
            createMessage({ id: prevMessages.length + 1, text: "", sender: "assistant" }),
        ]);

        let index = 0;

        const interval = setInterval(() => {
            const currentChar = response[index];

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

            if (index >= response.length) {
                clearInterval(interval);
                setIsTyping(false);
            }
        }, 50);
    }

    // function addAssistantMessage(userMessage: string) {
    //     const response = "You said: " + userMessage;

    //     // Add empty assistant message
    //     setMessages((prev) => [
    //         ...prev,
    //         createMessage({
    //             id: prev.length + 1,
    //             text: "",
    //             sender: "assistant",
    //         }),
    //     ]);

    //     let index = 0;

    //     const interval = setInterval(() => {
    //         setMessages((prev) =>
    //             prev.map((message, messageIndex) => {
    //                 // Update only the last message
    //                 if (messageIndex !== prev.length - 1) {
    //                     return message;
    //                 }

    //                 return {
    //                     ...message,
    //                     text: message.text + response[index - 1],
    //                 };
    //             })
    //         );

    //         index++;

    //         if (index >= response.length) {
    //             clearInterval(interval);
    //             setIsTyping(false);
    //         }
    //     }, 50);
    // }

    function handleSend(text: string) {
        setMessages((prevMessages) => [
            ...prevMessages,
            createMessage({ id: prevMessages.length + 1, text: text, sender: "user" }),
        ]);
        setIsTyping(true);

        setTimeout(() => addAssistantMessage(text), 1000);
    }

    return (
        <div className="chat">
            <MessageList messages={messages} isTyping={isTyping} />
            <ChatInput onSend={handleSend} onClear={clearMessages} isTyping={isTyping} />
        </div>
    );
}

export default Chat;
