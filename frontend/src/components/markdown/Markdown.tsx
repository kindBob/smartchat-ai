import ReactMarkdown, { type Components, type Options as ReactMarkdownOptions } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema, type Options } from "rehype-sanitize";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import { visit } from "unist-util-visit";
import type { Root } from "hast";
import CodeBlock from "./CodeBlock";
import "katex/dist/katex.min.css";
import "./Markdown.scss";
import "highlight.js/styles/atom-one-dark.css";

type MarkdownProps = {
    content: string;
};

const SAFE_DECLARATION = /^(color|background-color)\s*:\s*(#[0-9a-f]{3,8}|[a-z]+|rgba?\([\d\s.,%]+\))$/i;

function rehypeSafeStyle() {
    return (tree: Root) => {
        visit(tree, "element", (node) => {
            const style = node.properties?.style;
            if (typeof style !== "string") return;

            const safe = style
                .split(";")
                .map((s) => s.trim())
                .filter((s) => SAFE_DECLARATION.test(s))
                .join("; ");

            if (safe) node.properties.style = safe;
            else delete node.properties.style;
        });
    };
}

const attrs = defaultSchema.attributes ?? {};

const schema: Options = {
    ...defaultSchema,
    tagNames: [...(defaultSchema.tagNames ?? []), "details", "summary", "dl", "dt", "dd"],
    attributes: {
        ...attrs,
        p: [...(attrs.p ?? []), "align"],
        div: [...(attrs.div ?? []), "align", ["className", "math-display"]],
        span: [...(attrs.span ?? []), "style", ["className", "math-inline", "math-display"]],
        code: [...(attrs.code ?? []), ["className", "language-math", "math-inline", "math-display"]],
        details: [...(attrs.details ?? []), "open"],
    },
};

const remarkPlugins: ReactMarkdownOptions["remarkPlugins"] = [remarkGfm, remarkMath];

const rehypePlugins: ReactMarkdownOptions["rehypePlugins"] = [
    rehypeRaw,
    rehypeSafeStyle,
    [rehypeSanitize, schema],
    rehypeKatex,
    rehypeHighlight,
];

// Defined once: new component functions on each render would make React remount every code block
const components: Components = {
    a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
    pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
};

function Markdown({ content }: MarkdownProps) {
    return (
        <div className="markdown">
            <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins} components={components}>
                {content}
            </ReactMarkdown>
        </div>
    );
}

export default Markdown;
