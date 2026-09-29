import { useEffect, useRef, useState } from "react";
import type { ChatType } from "../../types/Chat";
import ChatItemActions from "./ChatItemActions";

type ChatItemsProps = {
    chat: ChatType;
    isActive: boolean;
    actionsOpened: boolean;
    onSelectChat: (id: string) => void;
    onDeleteChat: (id: string) => void;
    onRenameChat: (id: string, newTitle: string) => void;
    onToggleActions: () => void;
    onCloseActions: () => void;
};

function ChatItem({
    chat,
    isActive,
    actionsOpened,
    onSelectChat,
    onRenameChat,
    onDeleteChat,
    onToggleActions,
    onCloseActions,
}: ChatItemsProps) {
    const [isRenaming, setIsRenaming] = useState(false);
    const [chatTitle, setChatTitle] = useState(chat.title);

    const inputRef = useRef<HTMLInputElement>(null);
    const chatItemRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isRenaming) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isRenaming]);

    useEffect(() => {
        if (!isRenaming && !actionsOpened) return;

        function handleClickOutside(event: MouseEvent) {
            if (chatItemRef.current && !chatItemRef.current.contains(event.target as Node)) {
                cancelRename();
                onCloseActions();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isRenaming, actionsOpened, chat.title, onCloseActions]);

    function handleRename() {
        const newTitle = chatTitle.trim();

        if (newTitle !== "") {
            onRenameChat(chat.id, newTitle);
            setChatTitle(newTitle);
        }

        setIsRenaming(false);
        onCloseActions();
    }

    function cancelRename() {
        setIsRenaming(false);
        setChatTitle(chat.title);
    }

    return (
        <div
            ref={chatItemRef}
            className={"sidebar__chat" + (isActive ? " --active" : "")}
            onClick={() => {
                onSelectChat(chat.id);

                if (isRenaming) {
                    inputRef.current?.focus();
                    inputRef.current?.select();

                    onToggleActions();
                }
            }}>
            {isRenaming ? (
                <input
                    ref={inputRef}
                    className="sidebar__chat-input"
                    value={chatTitle}
                    maxLength={75}
                    onChange={(e) => setChatTitle(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleRename();
                        } else if (e.key === "Escape") {
                            cancelRename();
                        }
                    }}
                />
            ) : (
                <span className="sidebar__chat-title">{chat.title}</span>
            )}

            <ChatItemActions
                onRename={() => (!isRenaming ? setIsRenaming(true) : handleRename())}
                onDelete={() => {
                    onDeleteChat(chat.id);
                }}
                onToggleActions={() => {
                    onToggleActions();
                    setIsRenaming(false);
                }}
                actionsOpened={actionsOpened}
            />
        </div>
    );
}

export default ChatItem;
