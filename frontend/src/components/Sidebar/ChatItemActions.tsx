import { Pencil, Settings, Trash } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type ChatItemActionsProps = {
    actionsOpened: boolean;
    menuRef: React.RefObject<HTMLDivElement | null>;
    onRename: () => void;
    onDelete: () => void;
    onToggleActions: () => void;
};

function ChatItemActions({ actionsOpened, menuRef, onRename, onDelete, onToggleActions }: ChatItemActionsProps) {
    const actionsButtonRef = useRef<HTMLButtonElement>(null);

    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const [isMenuPositioned, setIsMenuPositioned] = useState(false);

    useLayoutEffect(() => {
        if (!actionsOpened) {
            setIsMenuPositioned(false);
            return;
        }

        function updateMenuPosition() {
            const button = actionsButtonRef.current;
            const menu = menuRef.current;

            if (!button || !menu) return;

            const rect = button.getBoundingClientRect();
            const menuRect = menu.getBoundingClientRect();

            const gap = 6;
            const padding = 8;

            const left = Math.max(
                padding,
                Math.min(rect.right - menuRect.width, window.innerWidth - menuRect.width - padding)
            );

            const spaceBelow = window.innerHeight - rect.bottom;
            const top =
                spaceBelow >= menuRect.height + gap
                    ? rect.bottom + gap
                    : Math.max(padding, rect.top - menuRect.height - gap);

            setMenuPosition({ top, left });
            setIsMenuPositioned(true);
        }

        updateMenuPosition();

        window.addEventListener("resize", updateMenuPosition);
        window.addEventListener("scroll", updateMenuPosition, true);

        return () => {
            window.removeEventListener("resize", updateMenuPosition);
            window.removeEventListener("scroll", updateMenuPosition, true);
        };
    }, [actionsOpened]);

    return (
        <div className="sidebar__chat-actions">
            {actionsOpened &&
                createPortal(
                    <div
                        ref={menuRef}
                        className="sidebar__chat-actions-container"
                        style={{
                            position: "fixed",
                            top: menuPosition.top,
                            left: menuPosition.left,
                            visibility: isMenuPositioned ? "visible" : "hidden",
                        }}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();

                                onRename();
                            }}
                            className="sidebar__chat-rename">
                            Rename
                            <Pencil />
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="sidebar__chat-delete">
                            Delete
                            <Trash />
                        </button>
                    </div>,
                    document.body
                )}

            <button
                ref={actionsButtonRef}
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleActions();
                }}
                className="sidebar__chat-open">
                <Settings />
            </button>
        </div>
    );
}

export default ChatItemActions;
