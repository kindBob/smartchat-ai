import { useEffect, type RefObject } from "react";
import type { MessageType } from "../../types/Chat";
import Message from "./Message";
import LoadingResponseIndicator from "./LoadingResponseIndicator";

type MessageListProps = {
    messages: MessageType[];
    isResponseLoading: boolean;
    error?: string;
    onRetry: () => void;
    bottomRef: RefObject<HTMLDivElement | null>;
    isAtBottom: boolean;
    setIsAtBottom: (isAtBottom: boolean) => void;
};

function MessageList({
    messages,
    isResponseLoading,
    error,
    onRetry,
    bottomRef,
    isAtBottom,
    setIsAtBottom,
}: MessageListProps) {
    useEffect(() => {
        if (isAtBottom) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isResponseLoading, error]);

    useEffect(() => {
        const el = bottomRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(([entry]) => {
            setIsAtBottom(entry.isIntersecting);
        });

        observer.observe(el);

        return () => observer.disconnect();
    }, [bottomRef, setIsAtBottom]);

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
            <div ref={bottomRef} style={{ height: 1 }}></div>
        </div>
    );
}

export default MessageList;
