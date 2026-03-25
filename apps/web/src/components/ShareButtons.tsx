'use client';

import { useState } from 'react';

interface ShareButtonsProps {
  title: string;
  slug: string;
}

export function ShareButtons({ title, slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/news/${slug}`
    : `/news/${slug}`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-[10px] text-gray-600 uppercase tracking-wider">Paylaş:</span>
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1.5 border border-[rgba(0,255,247,0.15)] rounded font-mono text-[10px] text-gray-500 uppercase tracking-wider hover:text-neon-cyan hover:border-neon-cyan/40 transition-colors"
      >
        Twitter/X
      </a>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1.5 border border-[rgba(0,255,247,0.15)] rounded font-mono text-[10px] text-gray-500 uppercase tracking-wider hover:text-neon-green hover:border-neon-green/40 transition-colors"
      >
        WhatsApp
      </a>
      <button
        onClick={copyLink}
        className={`px-3 py-1.5 border rounded font-mono text-[10px] uppercase tracking-wider transition-colors ${
          copied
            ? 'border-neon-cyan/40 text-neon-cyan bg-neon-cyan/10'
            : 'border-[rgba(0,255,247,0.15)] text-gray-500 hover:text-neon-cyan hover:border-neon-cyan/40'
        }`}
      >
        {copied ? 'Kopyalandı ✓' : 'Linki Kopyala'}
      </button>
    </div>
  );
}
