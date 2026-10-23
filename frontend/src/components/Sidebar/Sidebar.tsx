import type { ChatType } from "../../types/Chat";
import ChatItem from "./ChatItem";
import { useCallback, useState } from "react";
import "./Sidebar.scss";

type SidebarProps = {
    chats: ChatType[];
    activeChatId: string | null;
    userName: string;
    isSidebarOpen: boolean;
    isCreatingChat: boolean;
    onSelectChat: (id: string) => void;
    onNewChat: () => void;
    onDeleteChat: (id: string) => void;
    onRenameChat: (id: string, newTitle: string) => void;
    onPinChat: (id: string) => void;
    onSignOut: () => Promise<void>;
    onClose: () => void;
};

function Sidebar({
    chats,
    activeChatId,
    userName,
    isSidebarOpen,
    isCreatingChat,
    onClose,
    onSelectChat,
    onNewChat,
    onDeleteChat,
    onSignOut,
    onRenameChat,
    onPinChat,
}: SidebarProps) {
    const [openedActionsChatId, setOpenedActionsChatId] = useState<string | null>(null);

    const pinnedChats = chats
        .filter((c) => c.pinnedAt)
        .sort((a, b) => b.pinnedAt!.localeCompare(a.pinnedAt!))
        .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));

    const recentChats = chats.filter((c) => !c.pinnedAt).sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));

    const closeActions = useCallback(() => {
        setOpenedActionsChatId(null);
    }, []);

    function renderChat(chat: ChatType) {
        return (
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
                onPinChat={onPinChat}
                actionsOpened={openedActionsChatId === chat.id}
                onToggleActions={() => {
                    setOpenedActionsChatId((currentId) => (currentId === chat.id ? null : chat.id));
                }}
                onCloseActions={closeActions}
            />
        );
    }

    return (
        <>
            <div className={`sidebar-overlay ${isSidebarOpen ? "--visible" : ""}`} onClick={onClose} />
            <aside className={`sidebar ${isSidebarOpen ? "--open" : ""}`}>
                <button className="sidebar__new-chat" onClick={onNewChat} disabled={isCreatingChat}>
                    + New Chat
                </button>

                <div className="sidebar__chats">
                    {pinnedChats.length !== 0 && (
                        <div className="sidebar__section --pinned">
                            <p className="sidebar__section-title">Pinned</p>
                            {pinnedChats.map((chat) => renderChat(chat))}
                        </div>
                    )}

                    {recentChats.length !== 0 && (
                        <div className="sidebar__section --recent">
                            <p className="sidebar__section-title">Recent</p>
                            {recentChats.map((chat) => renderChat(chat))}
                        </div>
                    )}
                </div>

                <div className="sidebar-account">
                    <div className="sidebar-user">
                        <div className="sidebar-avatar">{userName.charAt(0).toUpperCase()}</div>

                        <div className="sidebar-user-info">
                            <span className="sidebar-user-name">{userName}</span>
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
