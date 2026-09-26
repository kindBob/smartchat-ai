import { useEffect, useRef } from "react";
import RenameIcon from "../../assets/icons/RenameIcon";
import SettingsIcon from "../../assets/icons/SettingsIcon";
import TrashIcon from "../../assets/icons/TrashIcon";

type ChatItemActionsProps = {
    actionsOpened: boolean;
    onRename: () => void;
    onDelete: () => void;
    onToggleActions: () => void;
    onCloseActions: () => void;
};

function ChatItemActions({ actionsOpened, onRename, onDelete, onToggleActions, onCloseActions }: ChatItemActionsProps) {
    const chatActionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (chatActionsRef.current && !chatActionsRef.current.contains(event.target as Node)) {
                onCloseActions();
            }
        }

        if (actionsOpened) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [actionsOpened, onCloseActions]);

    return (
        <div className="sidebar__chat-actions" ref={chatActionsRef}>
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
