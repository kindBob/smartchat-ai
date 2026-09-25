import { useState } from "react";
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
};

function ChatItem({
    chat,
    isActive,
    actionsOpened,
    onSelectChat,
    onRenameChat,
    onDeleteChat,
    onToggleActions,
}: ChatItemsProps) {
    const [isRenaming, setIsRenaming] = useState(false);
    const [chatName, setChatName] = useState(chat.title);

    function handleRename() {
        const newTitle = chatName.trim();

        if (newTitle !== "") {
            onRenameChat(chat.id, newTitle);
            setChatName(newTitle);
        }

        setIsRenaming(false);
    }

    return (
        <div
            className={"sidebar__chat" + (isActive ? " --active" : "")}
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}>
            {isRenaming ? (
                <input
                    className="sidebar__chat-input"
                    value={chatName}
                    onChange={(e) => setChatName(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleRename();
                        } else if (e.key === "Escape") {
                            setIsRenaming(false);
                            setChatName(chat.title);
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
                onToggleActions={onToggleActions}
                actionsOpened={actionsOpened}
            />
        </div>
    );
}

export default ChatItem;
