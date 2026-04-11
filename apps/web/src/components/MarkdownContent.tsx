'use client';

import { marked } from 'marked';
import { ComparisonCard } from '@/components/ComparisonCard';

interface MarkdownContentProps {
  content: string;
}

// Custom marked renderer — Compario dark theme styles applied via class names
const renderer = new marked.Renderer();

renderer.heading = (text, level) => {
  const tags: Record<number, string> = {
    1: 'font-orbitron text-2xl font-black text-white mt-8 mb-4',
    2: 'font-orbitron text-xl font-bold text-neon-cyan mt-6 mb-3',
    3: 'font-orbitron text-base font-semibold text-neon-purple mt-4 mb-2',
  };
  const cls = tags[level] ?? 'font-orbitron text-sm font-bold text-gray-200 mt-4 mb-2';
  return `<h${level} class="${cls}">${text}</h${level}>`;
};

renderer.paragraph = (text) =>
  `<p class="font-mono text-sm text-gray-400 leading-relaxed mb-4">${text}</p>`;

renderer.strong = (text) => `<strong class="text-white font-semibold">${text}</strong>`;

renderer.em = (text) => `<em class="text-gray-300 italic">${text}</em>`;

renderer.blockquote = (text) =>
  `<blockquote class="border-l-2 border-neon-purple pl-4 my-4 text-gray-500 italic font-mono text-sm">${text}</blockquote>`;

renderer.list = (body, ordered) => {
  const tag = ordered ? 'ol' : 'ul';
  const cls = ordered
    ? 'space-y-2 mb-4 list-decimal list-inside font-mono text-sm text-gray-400'
    : 'space-y-2 mb-4';
  return `<${tag} class="${cls}">${body}</${tag}>`;
};

renderer.listitem = (text) =>
  `<li class="flex gap-2 font-mono text-sm text-gray-400"><span class="text-neon-cyan mt-1 flex-shrink-0">▸</span><span>${text}</span></li>`;

renderer.hr = () => `<hr class="border-[rgba(0,255,247,0.08)] my-8" />`;

renderer.link = (href, _title, text) =>
  `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-neon-cyan underline underline-offset-2 hover:opacity-80 transition-opacity">${text}</a>`;

renderer.image = (href, _title, text) =>
  `<img src="${href}" alt="${text}" class="w-full rounded border border-[rgba(0,255,247,0.1)] my-6" />`;

renderer.table = (header, body) =>
  `<div class="overflow-x-auto my-6"><table class="w-full border-collapse border border-[rgba(0,255,247,0.1)]"><thead>${header}</thead><tbody>${body}</tbody></table></div>`;

renderer.tablecell = (content, flags) => {
  const tag = flags?.header ? 'th' : 'td';
  const cls = flags?.header
    ? 'border border-[rgba(0,255,247,0.1)] px-4 py-2 font-mono text-xs text-neon-cyan uppercase tracking-wider bg-[rgba(0,255,247,0.05)] text-left'
    : 'border border-[rgba(0,255,247,0.08)] px-4 py-2 font-mono text-xs text-gray-400';
  return `<${tag} class="${cls}">${content}</${tag}>`;
};

renderer.codespan = (code) =>
  `<code class="font-mono text-xs text-neon-cyan bg-[rgba(0,255,247,0.08)] px-1.5 py-0.5 rounded">${code}</code>`;

// Code blocks are handled by splitting content (for compare blocks) — see below
renderer.code = (code, lang) => {
  if (lang === 'compare') {
    // Placeholder — replaced by React component in splitAndRender
    return `<compare-card>${encodeURIComponent(code)}</compare-card>`;
  }
  return `<pre class="bg-[#0c0c16] border border-[rgba(0,255,247,0.1)] rounded p-4 my-4 overflow-x-auto"><code class="font-mono text-xs text-neon-cyan">${code}</code></pre>`;
};

marked.setOptions({ renderer, gfm: true, breaks: true });

// ─── Split rendered HTML and inject React ComparisonCard components ───────────
function splitAndRender(html: string): React.ReactNode[] {
  const parts = html.split(/(<compare-card>.*?<\/compare-card>)/s);
  return parts.map((part, i) => {
    const match = part.match(/^<compare-card>(.*)<\/compare-card>$/s);
    if (match) {
      const raw = decodeURIComponent(match[1]);
      return <ComparisonCard key={i} raw={raw} />;
    }
    return (
      <div
        key={i}
        dangerouslySetInnerHTML={{ __html: part }}
      />
    );
  });
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const html = marked(content) as string;
  const nodes = splitAndRender(html);
  return <div className="markdown-content">{nodes}</div>;
}
