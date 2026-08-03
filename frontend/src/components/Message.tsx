import type { MessageType } from "../types/message";

function Message({ id, text, sender, timestamp }: MessageType) {
    return (
        <div>
            <strong>{sender === "user" ? "You: " : "AI: "}</strong>
            <span>{text}</span>
        </div>
    );
}

export default Message;
