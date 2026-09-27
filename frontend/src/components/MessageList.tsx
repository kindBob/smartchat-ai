import { useEffect, useRef } from "react";
import type { MessageType } from "../types/Chat";
import Message from "./Message";
import LoadingResponseIndicator from "./LoadingResponseIndicator";

type MessageListProps = {
    messages: MessageType[];
    isResponseLoading: boolean;
    error?: string;
    onRetry: () => void;
};

function MessageList({ messages, isResponseLoading, error, onRetry }: MessageListProps) {
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
            {error && (
                <div className="chat-error">
                    <div className="chat-error__message">{error}</div>
                    <button onClick={onRetry} className="chat-error__button">
                        Try again
                    </button>
                </div>
            )}
            <div ref={bottomRef}></div>
        </div>
    );
}

export default MessageList;
