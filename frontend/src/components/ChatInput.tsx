import { useState } from "react";

type ChatInputProps = {
    onSend: (text: string) => void;
    onClear: () => void;
};

function ChatInput({ onSend, onClear }: ChatInputProps) {
    const [value, setValue] = useState("");

    function sendMessage() {
        if (!value) return;

        onSend(value);
        setValue("");
    }

    return (
        <div>
            <input
                value={value}
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
