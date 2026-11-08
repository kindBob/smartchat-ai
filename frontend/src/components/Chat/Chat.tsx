import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import type { ChatType } from "../../types/Chat";
import "./Chat.scss";
import { useRef, useState } from "react";
import ChatHeader from "./ChatHeader";

type ChatProps = {
    chat: ChatType | undefined;
    onSend: (userMessage: string) => void;
    onStop: () => void;
    onRetry: () => void;
    onPinChat: (id: string) => void;
    onRenameChat: (id: string, newTitle: string) => void;
    onDeleteChat: (id: string) => void;
};

function Chat({ chat, onSend, onStop, onRetry, onPinChat, onRenameChat, onDeleteChat }: ChatProps) {
    const [isAtBottom, setIsAtBottom] = useState(true);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    if (!chat) return null;

    function scrollToBottom() {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    return (
        <div className="chat">
            <ChatHeader
                title={chat.title}
                pinned={chat.pinnedAt !== null}
                onPin={() => onPinChat(chat.id)}
                onRename={(newTitle) => onRenameChat(chat.id, newTitle)}
                onDelete={() => onDeleteChat(chat.id)}
            />
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
    );
}

export default Chat;
