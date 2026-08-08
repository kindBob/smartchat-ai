import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import type { ChatType } from "../types/Chat";
import "./Chat.scss";

type ChatProps = {
    chat: ChatType | undefined;
    onSend: (userMessage: string) => void;
    isTyping: boolean;
};

function Chat({ chat, onSend, isTyping }: ChatProps) {
    return (
        <div className="chat">
            <MessageList messages={chat?.messages ?? []} isTyping={isTyping} />
            <ChatInput onSend={onSend} isTyping={isTyping} />
        </div>
    );
}

export default Chat;
