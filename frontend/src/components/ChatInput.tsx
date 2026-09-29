import { useEffect, useRef, useState } from "react";
import { Send, Square } from "lucide-react";

type ChatInputProps = {
    onSend: (text: string) => void;
    onStop: () => void;
    isGenerating: boolean;
};

function ChatInput({ onSend, onStop, isGenerating }: ChatInputProps) {
    const [message, setMessage] = useState("");

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const MAX_TEXTAREA_HEIGHT = 120;

    function resizeTextArea() {
        const textarea = textareaRef.current;

        if (!textarea) return;

        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
    }

    useEffect(() => {
        resizeTextArea();
    }, [message]);

    function sendMessage() {
        if (!message.trim() || isGenerating) return;

        onSend(message);
        setMessage("");
    }

    return (
        <div className="chat-input">
            <textarea
                ref={textareaRef}
                value={message}
                placeholder={isGenerating ? "AI is typing..." : "Message SmartChat AI..."}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key !== "Enter") return;

                    if (e.shiftKey) return;

                    e.preventDefault();

                    if (isGenerating) return;

                    sendMessage();
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
                aria-label={isGenerating ? "Stop generating" : "Send message"}>
                {isGenerating ? <Square className="chat-input__stop" /> : <Send className="chat-input__send" />}
            </button>
        </div>
    );
}

export default ChatInput;
