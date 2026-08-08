import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import type { ChatType } from "../types/Chat";
import "./Chat.scss";

type ChatProps = {
    chat: ChatType | undefined;
    onSend: (userMessage: string) => void;
};

function Chat({ chat, onSend }: ChatProps) {
    return (
        <div className="chat">
            <MessageList messages={chat?.messages ?? []} isResponseLoading={chat.isResponseLoading} />
            <ChatInput onSend={onSend} isTyping={chat.isTyping} />
        </div>
    );
}

export default Chat;
