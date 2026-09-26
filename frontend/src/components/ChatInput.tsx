import { useState } from "react";
import { Send, Square } from "lucide-react";

type ChatInputProps = {
    onSend: (text: string) => void;
    onStop: () => void;
    isGenerating: boolean;
};

function ChatInput({ onSend, onStop, isGenerating }: ChatInputProps) {
    const [value, setValue] = useState("");

    function sendMessage() {
        if (!value.trim() || isGenerating) return;

        onSend(value);
        setValue("");
    }

    return (
        <div className="chat-input">
            <textarea
                value={value}
                disabled={isGenerating}
                placeholder={isGenerating ? "AI is typing..." : "Message SmartChat AI..."}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                    }
                }}
            />
            <button
                onClick={() => {
                    if (isGenerating) {
                        onStop();
                        return;
                    }

                    sendMessage();
                }}
                disabled={!isGenerating && !value.trim()}
                aria-label={isGenerating ? "Stop generating" : "Send message"}>
                {isGenerating ? <Square /> : <Send className="chat-input__send" />}
            </button>
        </div>
    );
}

export default ChatInput;
