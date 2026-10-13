import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import "highlight.js/styles/atom-one-dark.css";
import CodeBlock from "./CodeBlock";
import "./Markdown.scss";

type MarkdownProps = {
    content: string;
};

function Markdown({ content }: MarkdownProps) {
    return (
        <div className="markdown">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                    a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                    pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
                }}>
                {content}
            </ReactMarkdown>
        </div>
    );
}

export default Markdown;
