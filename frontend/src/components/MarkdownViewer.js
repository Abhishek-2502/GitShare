import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkEmoji from "remark-emoji";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import "github-markdown-css/github-markdown-light.css";
import "katex/dist/katex.min.css";

function MarkdownViewer({ markdown, token, currentPath, backendUrl }) {
  const rewriteImageSrc = (src) => {
    if (!src) return "";
    if (src.startsWith("http") || src.startsWith("https")) return src;

    let normalizedSrc = src.replace(/^\.?\//, ""); // remove ./ or / at start
    let fullPath = currentPath ? `${currentPath}/${normalizedSrc}` : normalizedSrc;

    return `${backendUrl}/api/repo-content/${token}?path=${fullPath}`;
  };

  return (
    <div
      className="markdown-body"
      style={{ padding: "20px", overflow: "auto", height: "100%" }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, [remarkEmoji, { emoticon: true }], remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={{
          img({ node, ...props }) {
            const src = rewriteImageSrc(props.src);
            return (
              <img
                {...props}
                src={src}
                alt={props.alt}
                style={{ maxWidth: "100%", display: "block", margin: "10px 0" }}
              />
            );
          },
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                style={dracula}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownViewer;
