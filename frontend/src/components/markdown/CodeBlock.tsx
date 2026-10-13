import { Check, Copy } from "lucide-react";
import { isValidElement, useEffect, useRef, useState, type ReactNode } from "react";

type CodeBlockProps = {
    children?: ReactNode;
};

type CodeElementProps = {
    className?: string;
    children?: ReactNode;
};

function getText(node: ReactNode): string {
    if (typeof node === "string" || typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(getText).join("");
    if (isValidElement<{ children?: ReactNode }>(node)) return getText(node.props.children);

    return "";
}

function CodeBlock({ children }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);
    const timeoutRef = useRef<number | undefined>(undefined);

    useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

    const codeEl = isValidElement<CodeElementProps>(children) ? children : null;
    const language = /language-([\w-]+)/.exec(codeEl?.props.className ?? "")?.[1] ?? "text";

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(getText(children).replace(/\n$/, ""));

            setCopied(true);
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = window.setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            console.error("Copy failed:", err);
        }
    }

    return (
        <div className="code-block">
            <div className="code-block__header">
                <span>{language}</span>

                <button type="button" onClick={handleCopy} aria-label={copied ? "Copied" : "Copy code"}>
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                </button>
            </div>

            <pre>{children}</pre>
        </div>
    );
}

export default CodeBlock;
