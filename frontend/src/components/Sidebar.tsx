import type { ChatType } from "../types/Chat";
import "./Sidebar.scss";

type SidebarProps = {
    chats: ChatType[];
    activeChatId: string | null;
    onSelectChat: (id: string) => void;
    onNewChat: () => void;
};

function Sidebar({ chats, activeChatId, onSelectChat, onNewChat }: SidebarProps) {
    return (
        <aside className="sidebar">
            <button onClick={onNewChat}>+ New Chat</button>

            {chats.map((chat) => (
                <div
                    className={"sidebar__chat " + (chat.id === activeChatId ? "active" : "")}
                    key={chat.id}
                    onClick={() => onSelectChat(chat.id)}>
                    {chat.title}
                </div>
            ))}
        </aside>
    );
}

export default Sidebar;
