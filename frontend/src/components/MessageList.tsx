import { useEffect, useRef } from "react";
import type { MessageType } from "../types/Chat";
import Message from "./Message";
import LoadingResponseIndicator from "./LoadingResponseIndicator";

type MessageListProps = {
    messages: MessageType[];
    isResponseLoading: boolean;
};

function MessageList({ messages, isResponseLoading }: MessageListProps) {
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isResponseLoading]);

    return (
        <div className="message-list">
            {messages.map((message) => {
                return <Message key={message.id} {...message} />;
            })}

            {isResponseLoading && <LoadingResponseIndicator />}
            <div ref={bottomRef}></div>
        </div>
    );
}

export default MessageList;
