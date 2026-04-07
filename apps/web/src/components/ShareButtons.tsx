'use client';

import { useState } from 'react';

interface ShareButtonsProps {
  title: string;
  /** Tam URL veya path — ikisi de çalışır */
  url?: string;
  /** Geriye dönük uyumluluk için (news slug) */
  slug?: string;
}

export function ShareButtons({ title, url: urlProp, slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const resolvedUrl = (() => {
    if (urlProp) {
      // Tam URL geldiyse direkt kullan, path geldiyse origin ekle
      if (urlProp.startsWith('http')) return urlProp;
      return typeof window !== 'undefined' ? `${window.location.origin}${urlProp}` : urlProp;
    }
    if (slug) {
      return typeof window !== 'undefined'
        ? `${window.location.origin}/news/${slug}`
        : `/news/${slug}`;
    }
    return typeof window !== 'undefined' ? window.location.href : '';
  })();

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(resolvedUrl)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title}\n${resolvedUrl}`)}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(resolvedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="font-mono text-[10px] text-gray-600 uppercase tracking-wider mr-1">Paylaş:</span>
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 border border-[rgba(0,255,247,0.15)] rounded font-mono text-[10px] text-gray-500 uppercase tracking-wider hover:text-neon-cyan hover:border-neon-cyan/40 transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.265 5.638 5.9-5.638zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        Twitter/X
      </a>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 border border-[rgba(0,255,247,0.15)] rounded font-mono text-[10px] text-gray-500 uppercase tracking-wider hover:text-green-400 hover:border-green-400/40 transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        WhatsApp
      </a>
      <button
        onClick={copyLink}
        className={`flex items-center gap-1.5 px-3 py-1.5 border rounded font-mono text-[10px] uppercase tracking-wider transition-all ${
          copied
            ? 'border-neon-cyan/40 text-neon-cyan bg-neon-cyan/10'
            : 'border-[rgba(0,255,247,0.15)] text-gray-500 hover:text-neon-cyan hover:border-neon-cyan/40'
        }`}
      >
        {copied ? '✓ Kopyalandı' : 'Linki Kopyala'}
      </button>
    </div>
  );
}
