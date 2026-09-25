import RenameIcon from "../../assets/icons/RenameIcon";
import SettingsIcon from "../../assets/icons/SettingsIcon";
import TrashIcon from "../../assets/icons/TrashIcon";

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
                        <RenameIcon />
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="sidebar__chat-actions-delete">
                        Delete
                        <TrashIcon />
                    </button>
                </div>
            )}

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleActions();
                }}
                className="sidebar__chat-actions-open">
                <SettingsIcon />
            </button>
        </div>
    );
}

export default ChatItemActions;
