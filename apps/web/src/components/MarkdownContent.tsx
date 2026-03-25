'use client';

import ReactMarkdown from 'react-markdown';

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => (
          <h1 className="font-orbitron text-2xl font-black text-white mt-8 mb-4">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="font-orbitron text-xl font-bold text-neon-cyan mt-6 mb-3">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="font-orbitron text-base font-semibold text-neon-purple mt-4 mb-2">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="font-mono text-sm text-gray-400 leading-relaxed mb-4">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="space-y-2 mb-4">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="space-y-2 mb-4 list-decimal list-inside">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="flex gap-2 font-mono text-sm text-gray-400">
            <span className="text-neon-cyan mt-1 flex-shrink-0">▸</span>
            <span>{children}</span>
          </li>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-neon-purple pl-4 my-4 text-gray-500 italic font-mono text-sm">
            {children}
          </blockquote>
        ),
        code: ({ children, className }) => {
          const isBlock = className?.includes('language-');
          if (isBlock) {
            return (
              <pre className="bg-[#0c0c16] border border-[rgba(0,255,247,0.1)] rounded p-4 my-4 overflow-x-auto">
                <code className="font-mono text-xs text-neon-cyan">{children}</code>
              </pre>
            );
          }
          return (
            <code className="font-mono text-xs text-neon-cyan bg-[rgba(0,255,247,0.08)] px-1.5 py-0.5 rounded">
              {children}
            </code>
          );
        },
        hr: () => (
          <hr className="border-[rgba(0,255,247,0.08)] my-8" />
        ),
        strong: ({ children }) => (
          <strong className="text-white font-semibold">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="text-gray-300 italic">{children}</em>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neon-cyan underline underline-offset-2 hover:text-glow-cyan transition-all"
          >
            {children}
          </a>
        ),
        img: ({ src, alt }) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt ?? ''}
            className="w-full rounded border border-[rgba(0,255,247,0.1)] my-6"
          />
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-6">
            <table className="w-full border-collapse border border-[rgba(0,255,247,0.1)]">
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-[rgba(0,255,247,0.1)] px-4 py-2 font-mono text-xs text-neon-cyan uppercase tracking-wider bg-[rgba(0,255,247,0.05)] text-left">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-[rgba(0,255,247,0.08)] px-4 py-2 font-mono text-xs text-gray-400">
            {children}
          </td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
