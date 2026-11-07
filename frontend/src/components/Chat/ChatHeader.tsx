import { useEffect, useRef, useState } from "react";
import { Ellipsis, Pencil, Trash } from "lucide-react";
import PinButton from "../PinButton";
import "../ActionsMenu.scss";

type ChatHeaderProps = {
    title: string;
    pinned: boolean;
    onPin: () => void;
    onRename: (newTitle: string) => void;
    onDelete: () => void;
};

function ChatHeader({ title, pinned, onPin, onRename, onDelete }: ChatHeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [draftTitle, setDraftTitle] = useState(title);

    const actionsRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // switching chats (or a generated title arriving) should reset any in-progress edit
    useEffect(() => {
        setDraftTitle(title);
        setIsRenaming(false);
        setIsMenuOpen(false);
    }, [title]);

    useEffect(() => {
        if (isRenaming) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isRenaming]);

    useEffect(() => {
        if (!isMenuOpen) return;

        function handlePointerDown(event: MouseEvent) {
            if (!actionsRef.current?.contains(event.target as Node)) setIsMenuOpen(false);
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") setIsMenuOpen(false);
        }

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isMenuOpen]);

    function startRename() {
        setIsMenuOpen(false);
        setDraftTitle(title);
        setIsRenaming(true);
    }

    function saveRename() {
        const newTitle = draftTitle.trim();

        if (newTitle && newTitle !== title) onRename(newTitle);
        else setDraftTitle(title);

        setIsRenaming(false);
    }

    function cancelRename() {
        setDraftTitle(title);
        setIsRenaming(false);
    }

    return (
        <header className="chat-header">
            {isRenaming ? (
                <input
                    ref={inputRef}
                    className="chat-header__input"
                    value={draftTitle}
                    maxLength={75}
                    aria-label="Chat title"
                    onChange={(e) => setDraftTitle(e.target.value)}
                    onBlur={saveRename}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") saveRename();
                        else if (e.key === "Escape") cancelRename();
                    }}
                />
            ) : (
                <h1 className="chat-header__title" title={title} onDoubleClick={startRename}>
                    {title}
                </h1>
            )}

            <div className="chat-header__actions" ref={actionsRef}>
                <PinButton pinned={pinned} onPin={onPin} className="chat-header__button" size={20} />

                <button
                    type="button"
                    className={"chat-header__button" + (isMenuOpen ? " --active" : "")}
                    onClick={() => setIsMenuOpen((open) => !open)}
                    aria-label="Chat actions"
                    aria-haspopup="menu"
                    aria-expanded={isMenuOpen}
                    title="Chat actions">
                    <Ellipsis size={20} />
                </button>

                {isMenuOpen && (
                    <div className="chat-header__menu actions-menu" role="menu">
                        <button type="button" role="menuitem" className="actions-menu__item" onClick={startRename}>
                            <Pencil size={18} />
                            Rename
                        </button>

                        <button
                            type="button"
                            role="menuitem"
                            className="actions-menu__item --danger"
                            onClick={() => {
                                setIsMenuOpen(false);
                                onDelete();
                            }}>
                            <Trash size={18} />
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}

export default ChatHeader;
