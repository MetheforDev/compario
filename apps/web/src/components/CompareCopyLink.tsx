'use client';

import { useState } from 'react';

export function CompareCopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const fullUrl = typeof window !== 'undefined'
      ? `${window.location.origin}${url}`
      : url;
    await navigator.clipboard.writeText(fullUrl).catch(() => null);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-mono text-xs uppercase tracking-wider transition-all"
      style={{
        background: copied ? 'rgba(0,255,247,0.12)' : 'rgba(0,255,247,0.06)',
        border: `1px solid ${copied ? 'rgba(0,255,247,0.5)' : 'rgba(0,255,247,0.15)'}`,
        color: copied ? '#00fff7' : '#6b7280',
        boxShadow: copied ? '0 0 16px rgba(0,255,247,0.2)' : 'none',
      }}
    >
      <span>{copied ? '✓' : '⎘'}</span>
      <span>{copied ? 'Kopyalandı!' : 'Linki Kopyala'}</span>
    </button>
  );
}
