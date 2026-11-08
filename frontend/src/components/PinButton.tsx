import { Pin, PinOff } from "lucide-react";

type PinButtonProps = {
    pinned: boolean;
    onPin: () => void;
    className?: string;
    size?: number;
};

function PinButton({ pinned, onPin, className, size = 22 }: PinButtonProps) {
    const label = pinned ? "Unpin chat" : "Pin chat";

    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                onPin();
            }}
            className={[className, pinned && "--pinned"].filter(Boolean).join(" ")}
            aria-label={label}
            aria-pressed={pinned}
            title={label}>
            {pinned ? <PinOff size={size} /> : <Pin size={size} />}
        </button>
    );
}

export default PinButton;
