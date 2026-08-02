type MessageProps = {
    text: string;
    sender: "user" | "assistant";
};

function Message({ text, sender }: MessageProps) {
    return (
        <div>
            <strong>{sender === "user" ? "You: " : "AI: "}</strong>
            <span>{text}</span>
        </div>
    );
}

export default Message;
