import type { MessageType } from "../types/Message";

const timeFormatter = new Intl.DateTimeFormat([], {
    hour: "2-digit",
    minute: "2-digit",
});

function formatMessageTime(timestamp: string) {
    return timeFormatter.format(new Date(timestamp));
}

function Message({ text, sender, timestamp }: MessageType) {
    return (
        <div className={`message ${sender === "user" ? "message--user" : "message--assistant"}`}>
            <p className="message__text">{text}</p>

            <span className="message__time">{formatMessageTime(timestamp)}</span>
        </div>
    );
}

export default Message;
