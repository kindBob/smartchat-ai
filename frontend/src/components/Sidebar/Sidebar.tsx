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
    onSignOut: () => Promise<void>;
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
    onSignOut,
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

                <div className="sidebar__chats">
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
                </div>

                <div className="sidebar-account">
                    <div className="sidebar-user">
                        <div className="sidebar-avatar">S</div>

                        <div className="sidebar-user-info">
                            <span className="sidebar-user-name">SmartChat User</span>
                            <span className="sidebar-user-status">Online</span>
                        </div>
                    </div>

                    <button className="sidebar-sign-out" onClick={onSignOut}>
                        Sign out
                    </button>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
