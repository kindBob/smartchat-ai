import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import CodeBlock from "./CodeBlock";
import "highlight.js/styles/atom-one-dark.css";
import "./Markdown.scss";

type MarkdownProps = {
    content: string;
};

function Markdown({ content }: MarkdownProps) {
    return (
        <div className="markdown">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeHighlight, rehypeKatex]}
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
