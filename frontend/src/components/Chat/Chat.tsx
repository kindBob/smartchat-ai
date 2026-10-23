import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import type { ChatType } from "../../types/Chat";
import "./Chat.scss";
import { useRef, useState } from "react";

type ChatProps = {
    chat: ChatType | undefined;
    onSend: (userMessage: string) => void;
    onStop: () => void;
    onRetry: () => void;
};

function Chat({ chat, onSend, onStop, onRetry }: ChatProps) {
    if (!chat) return null;

    const [isAtBottom, setIsAtBottom] = useState(true);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    function scrollToBottom() {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    return (
        <div className="chat">
            <div className="chat-container">
                <MessageList
                    messages={chat.messages}
                    onRetry={onRetry}
                    isResponseLoading={chat.isResponseLoading}
                    error={chat?.error}
                    bottomRef={bottomRef}
                    isAtBottom={isAtBottom}
                    setIsAtBottom={setIsAtBottom}
                />
                <ChatInput
                    onSend={onSend}
                    onStop={onStop}
                    isGenerating={chat.isResponseLoading || chat.isTyping}
                    isAtBottom={isAtBottom}
                    onScrollDown={scrollToBottom}
                />
            </div>
        </div>
    );
}

export default Chat;
