import { useEffect, useRef, useState } from "react";
import { ArrowDown, Send, Square } from "lucide-react";
import { useIsMobile } from "../../hooks/useIsMobile";

type ChatInputProps = {
    onSend: (text: string) => void;
    onStop: () => void;
    isGenerating: boolean;
    isAtBottom: boolean;
    onScrollDown: () => void;
};

function ChatInput({ onSend, onStop, isGenerating, isAtBottom, onScrollDown }: ChatInputProps) {
    const [message, setMessage] = useState("");

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const scrollDownRef = useRef<HTMLButtonElement>(null);
    const MAX_TEXTAREA_HEIGHT = 120;

    const isMobile = useIsMobile();

    function resizeTextArea() {
        const textarea = textareaRef.current;
        const scrollDown = scrollDownRef.current;

        if (!textarea || !scrollDown) return;

        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;

        scrollDown.style.top = Math.round((textarea.getBoundingClientRect().height * -1) / 2) + "px";
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
            <button
                type="button"
                className={`scroll-down ${isAtBottom ? "--hidden" : ""}`}
                ref={scrollDownRef}
                onClick={onScrollDown}
                aria-label="Scroll to bottom"
                tabIndex={isAtBottom ? -1 : 0}>
                <ArrowDown size={20} strokeWidth={2.25} />
            </button>

            <textarea
                ref={textareaRef}
                value={message}
                placeholder={isGenerating ? "AI is typing..." : "Message SmartChat AI..."}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key !== "Enter") return;

                    if (isMobile) return;

                    if (e.shiftKey) return;

                    e.preventDefault();

                    if (isGenerating) return;

                    sendMessage();
                }}
            />

            <button
                type="button"
                className="chat-input__send-button"
                onClick={() => {
                    if (isGenerating) {
                        onStop();
                        return;
                    }

                    sendMessage();
                }}
                aria-label={isGenerating ? "Stop generating" : "Send message"}>
                {isGenerating ? (
                    <Square size={16} fill="currentColor" className="chat-input__stop" />
                ) : (
                    <Send size={20} strokeWidth={2.25} className="chat-input__send" />
                )}
            </button>
        </div>
    );
}

export default ChatInput;
