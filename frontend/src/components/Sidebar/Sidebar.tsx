import type { ChatType } from "../../types/Chat";
import "./Sidebar.scss";
import ChatItem from "./ChatItem";
import { useCallback, useState } from "react";

type SidebarProps = {
    chats: ChatType[];
    activeChatId: string | null;
    isOpen: boolean;
    onSelectChat: (id: string) => void;
    onNewChat: () => void;
    onDeleteChat: (id: string) => void;
    onRenameChat: (id: string, newTitle: string) => void;
    onClose: () => void;
};

function Sidebar({
    chats,
    activeChatId,
    isOpen,
    onClose,
    onSelectChat,
    onNewChat,
    onDeleteChat,
    onRenameChat,
}: SidebarProps) {
    const [openedActionsChatId, setOpenedActionsChatId] = useState<string | null>(null);

    const closeActions = useCallback(() => {
        setOpenedActionsChatId(null);
    }, []);

    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? "--visible" : ""}`} onClick={onClose} />
            <aside className={`sidebar ${isOpen ? "--open" : ""}`}>
                <button className="sidebar__new-chat" onClick={onNewChat}>
                    + New Chat
                </button>

                {chats.map((chat) => (
                    <ChatItem
                        key={chat.id}
                        chat={chat}
                        isActive={chat.id === activeChatId}
                        onSelectChat={(id: string) => {
                            setOpenedActionsChatId(null);
                            onSelectChat(id);
                        }}
                        onDeleteChat={onDeleteChat}
                        onRenameChat={onRenameChat}
                        actionsOpened={openedActionsChatId === chat.id}
                        onToggleActions={() => {
                            setOpenedActionsChatId((currentId) => (currentId === chat.id ? null : chat.id));
                        }}
                        onCloseActions={closeActions}
                    />
                ))}
            </aside>
        </>
    );
}

export default Sidebar;
