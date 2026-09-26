import { useEffect, useRef } from "react";
import type { MessageType } from "../types/Chat";
import Message from "./Message";
import LoadingResponseIndicator from "./LoadingResponseIndicator";

type MessageListProps = {
    messages: MessageType[];
    isResponseLoading: boolean;
    error?: string;
};

function MessageList({ messages, isResponseLoading, error }: MessageListProps) {
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isResponseLoading, error]);

    return (
        <div className="message-list">
            {messages.map((message) => {
                return <Message key={message.id} {...message} />;
            })}

            {isResponseLoading && <LoadingResponseIndicator />}
            {error && <div className="chat-error">{error}</div>}
            <div ref={bottomRef}></div>
        </div>
    );
}

export default MessageList;
