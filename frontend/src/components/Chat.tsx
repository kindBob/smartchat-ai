import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import type { ChatType } from "../types/Chat";
import "./Chat.scss";

type ChatProps = {
    chat: ChatType | undefined;
    onSend: (userMessage: string) => void;
    onStop: () => void;
};

function Chat({ chat, onSend, onStop }: ChatProps) {
    return (
        <div className="chat">
            <MessageList messages={chat?.messages} isResponseLoading={chat.isResponseLoading} error={chat?.error} />
            <ChatInput onSend={onSend} onStop={onStop} isGenerating={chat.isResponseLoading || chat.isTyping} />
        </div>
    );
}

export default Chat;
