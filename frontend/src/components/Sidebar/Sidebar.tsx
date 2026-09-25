import type { ChatType } from "../../types/Chat";
import "./Sidebar.scss";
import ChatItem from "./ChatItem";
import { useState } from "react";

type SidebarProps = {
    chats: ChatType[];
    activeChatId: string | null;
    onSelectChat: (id: string) => void;
    onNewChat: () => void;
    onDeleteChat: (id: string) => void;
    onRenameChat: (id: string, newTitle: string) => void;
};

function Sidebar({ chats, activeChatId, onSelectChat, onNewChat, onDeleteChat, onRenameChat }: SidebarProps) {
    const [openedActionsChatId, setOpenedActionsChatId] = useState<string | null>(null);

    return (
        <aside className="sidebar">
            <button className="sidebar__new-chat" onClick={onNewChat}>
                + New Chat
            </button>

            {chats.map((chat) => (
                <ChatItem
                    key={chat.id}
                    chat={chat}
                    isActive={chat.id === activeChatId}
                    onSelectChat={onSelectChat}
                    onDeleteChat={onDeleteChat}
                    onRenameChat={onRenameChat}
                    actionsOpened={openedActionsChatId === chat.id}
                    onToggleActions={() => {
                        setOpenedActionsChatId((currentId) => (currentId === chat.id ? null : chat.id));
                    }}
                />
            ))}
        </aside>
    );
}

export default Sidebar;
