"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

interface MathMarkdownProps {
  content: string;
  className?: string;
}

export default function MathMarkdown({ content, className }: MathMarkdownProps) {
  return (
    <div className={className}>
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        // Tables
        table: ({ children }) => (
          <div className="overflow-x-auto my-3">
            <table className="min-w-full text-sm border-collapse">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="border-b border-white/20">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="px-3 py-2 text-left font-semibold text-white/70">{children}</th>
        ),
        td: ({ children }) => (
          <td className="px-3 py-2 border-b border-white/10 text-white/80">{children}</td>
        ),
        // Paragraphs
        p: ({ children }) => (
          <p className="mb-2 last:mb-0">{children}</p>
        ),
        // Strong/bold
        strong: ({ children }) => (
          <strong className="font-semibold text-white">{children}</strong>
        ),
        // Lists
        ul: ({ children }) => (
          <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-white/80">{children}</li>
        ),
        // Code
        code: ({ children, className: codeClass }) => {
          const isBlock = codeClass?.includes("language-");
          if (isBlock) {
            return (
              <pre className="bg-white/5 rounded p-3 overflow-x-auto text-sm my-2">
                <code>{children}</code>
              </pre>
            );
          }
          return (
            <code className="bg-white/10 rounded px-1 py-0.5 text-sm font-mono">
              {children}
            </code>
          );
        },
        // Blockquote
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-white/30 pl-3 italic text-white/60 my-2">
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  );
}
