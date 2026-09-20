import { useState } from "react";
import type { ChatType } from "../types/Chat";
import "./Sidebar.scss";

type SidebarProps = {
    chats: ChatType[];
    activeChatId: string | null;
    onSelectChat: (id: string) => void;
    onNewChat: () => void;
    onDeleteChat: (id: string) => void;
    onRenameChat: (id: string, newTitle: string) => void;
};

function Sidebar({ chats, activeChatId, onSelectChat, onNewChat, onDeleteChat, onRenameChat }: SidebarProps) {
    const [renamingChatId, setRenamingChatId] = useState<string | null>(null);
    const [renamingChatValue, setRenamingChatValue] = useState("");

    return (
        <aside className="sidebar">
            <button onClick={onNewChat}>+ New Chat</button>

            {chats.map((chat) => (
                <div
                    className={"sidebar__chat" + (chat.id === activeChatId ? " active" : "")}
                    key={chat.id}
                    onClick={() => onSelectChat(chat.id)}>
                    {renamingChatId === chat.id ? (
                        <input
                            value={renamingChatValue}
                            onChange={(e) => setRenamingChatValue(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    if (renamingChatValue.trim() !== "")
                                        onRenameChat(chat.id, renamingChatValue.trim());

                                    setRenamingChatId(null);
                                } else if (e.key === "Escape") {
                                    setRenamingChatId(null);
                                }
                            }}
                        />
                    ) : (
                        <span>{chat.title}</span>
                    )}

                    <div className="sidebar__chat-actions">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteChat(chat.id);
                            }}>
                            Delete chat
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setRenamingChatId(chat.id);
                                setRenamingChatValue(chat.title);
                            }}>
                            Rename
                        </button>
                    </div>
                </div>
            ))}
        </aside>
    );
}

export default Sidebar;
