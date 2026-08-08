import { useEffect, useRef } from "react";
import type { MessageType } from "../types/Message";
import Message from "./Message";
import TypingIndicator from "./TypingIndicator";
import "./MessageList.scss";

type MessageListProps = {
    messages: MessageType[];
    isTyping: boolean;
};

function MessageList({ messages, isTyping }: MessageListProps) {
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    return (
        <div className="message-list">
            {messages.map((message) => {
                return <Message key={message.id} {...message} />;
            })}

            {isTyping && <TypingIndicator />}
            <div ref={bottomRef}></div>
        </div>
    );
}

export default MessageList;
