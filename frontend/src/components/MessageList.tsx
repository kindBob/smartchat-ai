import type { MessageType } from "../types/message";
import Message from "./Message";
import TypingIndicator from "./TypingIndicator";

type MessageListProps = {
    messages: MessageType[];
    isTyping: boolean;
};

function MessageList({ messages, isTyping }: MessageListProps) {
    return (
        <div>
            {messages.map((message) => {
                return <Message key={message.id} {...message} />;
            })}

            {isTyping && <TypingIndicator />}
        </div>
    );
}

export default MessageList;
