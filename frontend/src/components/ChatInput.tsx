import { useState } from "react";
import "./ChatInput.scss";

type ChatInputProps = {
    onSend: (text: string) => void;
    onClear: () => void;
    isTyping: boolean;
};

function ChatInput({ onSend, onClear, isTyping }: ChatInputProps) {
    const [value, setValue] = useState("");

    function sendMessage() {
        if (!value) return;

        onSend(value);
        setValue("");
    }

    return (
        <div className="chat-input">
            <input
                value={value}
                disabled={isTyping}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        sendMessage();
                    }
                }}
            />
            <button onClick={sendMessage}>Send</button>
            <button onClick={onClear}>Clear</button>
        </div>
    );
}

export default ChatInput;
