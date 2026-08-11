import type { ChatType } from "../types/Chat";
import "./Sidebar.scss";

type SidebarProps = {
    chats: ChatType[];
    activeChatId: string | null;
    onSelectChat: (id: string) => void;
    onNewChat: () => void;
    onDeleteChat: (id: string) => void;
};

function Sidebar({ chats, activeChatId, onSelectChat, onNewChat, onDeleteChat }: SidebarProps) {
    return (
        <aside className="sidebar">
            <button onClick={onNewChat}>+ New Chat</button>

            {chats.map((chat) => (
                <div
                    className={"sidebar__chat" + (chat.id === activeChatId ? " active" : "")}
                    key={chat.id}
                    onClick={() => onSelectChat(chat.id)}>
                    {chat.title}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChat(chat.id);
                        }}>
                        Delete chat
                    </button>
                </div>
            ))}
        </aside>
    );
}

export default Sidebar;
