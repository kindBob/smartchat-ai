import { Pencil, Settings, Trash } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PinButton from "../PinButton";
import "../ActionsMenu.scss";

type ChatItemActionsProps = {
    onRename: () => void;
    onPin: () => void;
    onDelete: () => void;
    onToggleActions: () => void;
    actionsOpened: boolean;
    pinned: boolean;
    menuRef: React.RefObject<HTMLDivElement | null>;
};

function ChatItemActions({
    onRename,
    onPin,
    onDelete,
    onToggleActions,
    actionsOpened,
    pinned,
    menuRef,
}: ChatItemActionsProps) {
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
                Math.min(rect.right - menuRect.width, window.innerWidth - menuRect.width - padding),
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
                        className="sidebar__chat-actions-container actions-menu"
                        role="menu"
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
                            type="button"
                            role="menuitem"
                            className="actions-menu__item">
                            <Pencil size={18} />
                            Rename
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            type="button"
                            role="menuitem"
                            className="actions-menu__item --danger">
                            <Trash size={18} />
                            Delete
                        </button>
                    </div>,
                    document.body,
                )}

            <button
                ref={actionsButtonRef}
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleActions();
                }}
                type="button"
                className="sidebar__chat-open"
                aria-label="Chat actions"
                aria-haspopup="menu"
                aria-expanded={actionsOpened}
                title="Chat actions">
                <Settings size={22} />
            </button>

            <PinButton onPin={onPin} pinned={pinned} className="sidebar__chat-pin" />
        </div>
    );
}

export default ChatItemActions;
