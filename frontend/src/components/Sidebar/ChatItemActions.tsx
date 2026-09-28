import { Pencil, Settings, Trash } from "lucide-react";

type ChatItemActionsProps = {
    actionsOpened: boolean;
    onRename: () => void;
    onDelete: () => void;
    onToggleActions: () => void;
};

function ChatItemActions({ actionsOpened, onRename, onDelete, onToggleActions }: ChatItemActionsProps) {
    return (
        <div className="sidebar__chat-actions">
            {actionsOpened && (
                <div className="sidebar__chat-actions-container">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();

                            onRename();
                        }}
                        className="sidebar__chat-actions-rename">
                        Rename
                        <Pencil />
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="sidebar__chat-actions-delete">
                        Delete
                        <Trash />
                    </button>
                </div>
            )}

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleActions();
                }}
                className="sidebar__chat-actions-open">
                <Settings />
            </button>
        </div>
    );
}

export default ChatItemActions;
