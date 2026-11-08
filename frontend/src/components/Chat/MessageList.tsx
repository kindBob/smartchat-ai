import { useLayoutEffect, useRef, type RefObject } from "react";
import type { MessageType } from "../../types/Chat";
import Message from "./Message";
import LoadingResponseIndicator from "./LoadingResponseIndicator";

type MessageListProps = {
    messages: MessageType[];
    isResponseLoading: boolean;
    error?: string;
    onRetry: () => void;
    bottomRef: RefObject<HTMLDivElement | null>;
    isAtBottom: boolean;
    setIsAtBottom: (isAtBottom: boolean) => void;
};

const AT_BOTTOM_THRESHOLD_PX = 80;

function MessageList({
    messages,
    isResponseLoading,
    error,
    onRetry,
    bottomRef,
    isAtBottom,
    setIsAtBottom,
}: MessageListProps) {
    const listRef = useRef<HTMLDivElement>(null);
    const lastScrollTopRef = useRef(0);

    // Scrolls before paint, so new content can't push the list away from the bottom between typing ticks
    useLayoutEffect(() => {
        const list = listRef.current;
        if (!list || !isAtBottom) return;

        list.scrollTop = list.scrollHeight;
        lastScrollTopRef.current = list.scrollTop;
    }, [messages, isResponseLoading, error]);

    function handleScroll() {
        const list = listRef.current;
        if (!list) return;

        const distanceFromBottom = list.scrollHeight - list.scrollTop - list.clientHeight;
        const scrolledUp = list.scrollTop < lastScrollTopRef.current;
        lastScrollTopRef.current = list.scrollTop;

        // Any upward scroll leaves the bottom, however small. The threshold only applies when coming back down.
        // The 1px allows for fractional scroll positions, and for content shrinking while at the bottom.
        if (scrolledUp && distanceFromBottom > 1) setIsAtBottom(false);
        else if (distanceFromBottom <= AT_BOTTOM_THRESHOLD_PX) setIsAtBottom(true);
    }

    return (
        <div className="message-list" ref={listRef} onScroll={handleScroll}>
            <div className="message-list-container">
                {messages.map((message) => {
                    return <Message key={message.id} {...message} />;
                })}

                {isResponseLoading && <LoadingResponseIndicator />}
                {error && (
                    <div className="chat-error">
                        <div className="chat-error__message">{error}</div>
                        <button onClick={onRetry} className="chat-error__button">
                            Try again
                        </button>
                    </div>
                )}
            </div>

            <div ref={bottomRef} style={{ height: 1 }}></div>
        </div>
    );
}

export default MessageList;
