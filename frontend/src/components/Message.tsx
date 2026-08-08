import type { MessageType } from "../types/Message";

function Message({ id, text, sender, timestamp }: MessageType) {
    return (
        <div>
            <strong>{sender === "user" ? "You: " : "AI: "}</strong>
            <span>{text}</span>
        </div>
    );
}

export default Message;
