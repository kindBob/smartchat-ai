import { useEffect, useRef, type ReactNode } from "react";
import "./ConfirmDialog.scss";

type ConfirmDialogProps = {
    open: boolean;
    title: string;
    children: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

// Built on the native <dialog>: showModal() gives us the backdrop, focus trapping and Escape handling.
function ConfirmDialog({
    open,
    title,
    children,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    danger = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (open && !dialog.open) dialog.showModal();
        else if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            className="confirm-dialog"
            aria-labelledby="confirm-dialog-title"
            onCancel={(e) => {
                // Escape: let React state close it so it stays the single source of truth
                e.preventDefault();
                onCancel();
            }}
            onClick={(e) => {
                // a click on the dialog element itself (not its content) is a click on the backdrop
                if (e.target === dialogRef.current) onCancel();
            }}>
            {open && (
                <div className="confirm-dialog__content">
                    <h2 id="confirm-dialog-title" className="confirm-dialog__title">
                        {title}
                    </h2>
                    <div className="confirm-dialog__message">{children}</div>

                    <div className="confirm-dialog__actions">
                        <button type="button" className="confirm-dialog__button" onClick={onCancel} autoFocus>
                            {cancelLabel}
                        </button>
                        <button
                            type="button"
                            className={"confirm-dialog__button" + (danger ? " --danger" : " --primary")}
                            onClick={onConfirm}>
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            )}
        </dialog>
    );
}

export default ConfirmDialog;
