import { Pencil, Pin, PinOff, Settings, Trash } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

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
                            <Pencil size={22} />
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="sidebar__chat-delete">
                            Delete
                            <Trash size={22} />
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
                className="sidebar__chat-open">
                <Settings size={22} />
            </button>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onPin();
                }}
                className="sidebar__chat-pin">
                {pinned ? <PinOff size={22} /> : <Pin size={22} />}
            </button>
        </div>
    );
}

export default ChatItemActions;
