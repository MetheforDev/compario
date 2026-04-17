'use client';

import { useState } from 'react';

interface Props {
  title: string;
  excerpt: string;
  slug: string;
  categories: string[];
  tags: string[];
  coverImage?: string;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  'yeni-model':   '🚀',
  'test':         '🔬',
  'karsilastirma':'⚡',
  'fiyat':        '💰',
  'teknoloji':    '💡',
  'genel':        '📢',
};

const CATEGORY_HASHTAGS: Record<string, string[]> = {
  'yeni-model':   ['#YeniModel', '#Teknoloji', '#İnceleme'],
  'test':         ['#Test', '#İnceleme', '#Teknoloji'],
  'karsilastirma':['#Karşılaştırma', '#HangsiniAlmalıyım', '#Teknoloji'],
  'fiyat':        ['#Fiyat', '#Kampanya', '#TeknolojiHaberleri'],
  'teknoloji':    ['#Teknoloji', '#TeknolojiHaberleri', '#Dijital'],
  'genel':        ['#Teknoloji', '#Haber'],
};

function generateInstagram(props: Props): string {
  const { title, excerpt, slug, categories, tags } = props;
  const emoji = CATEGORY_EMOJIS[categories[0]] ?? '📱';
  const catHashtags = CATEGORY_HASHTAGS[categories[0]] ?? ['#Teknoloji'];
  const tagHashtags = tags.slice(0, 5).map(t => `#${t.replace(/\s+/g, '')}`);
  const allHashtags = [...new Set([...catHashtags, ...tagHashtags, '#Compario', '#ComparioTech'])].join(' ');

  const cleanExcerpt = excerpt?.trim() || '';
  const body = cleanExcerpt
    ? cleanExcerpt.length > 300
      ? cleanExcerpt.slice(0, 297) + '...'
      : cleanExcerpt
    : '';

  return `${emoji} ${title}

${body}${body ? '\n' : ''}
🔗 Tüm detaylar için link bio'da!
👉 compario.tech/news/${slug}

${allHashtags}`;
}

function generateTwitterThread(props: Props): string[] {
  const { title, excerpt, slug, categories, tags } = props;
  const emoji = CATEGORY_EMOJIS[categories[0]] ?? '📱';
  const catHashtags = CATEGORY_HASHTAGS[categories[0]] ?? ['#Teknoloji'];
  const tagHashtags = tags.slice(0, 3).map(t => `#${t.replace(/\s+/g, '')}`);
  const hashtagLine = [...new Set([...catHashtags.slice(0,2), ...tagHashtags.slice(0,2), '#Compario'])].join(' ');

  const cleanExcerpt = excerpt?.trim() || '';

  const tweet1 = `${emoji} ${title}\n\n${cleanExcerpt.length > 200 ? cleanExcerpt.slice(0, 197) + '...' : cleanExcerpt}\n\n${hashtagLine} 🧵👇`;

  const tweet2 = `📖 Tüm detaylar, teknik özellikler ve fiyat bilgisi için:\n\n🔗 compario.tech/news/${slug}\n\n💬 Yorumlarınızı merak ediyoruz — ne düşünüyorsunuz?`;

  const tweet3 = `⚡ Compario'yu takip et, Türkiye'nin en iyi teknoloji karşılaştırmalarını kaçırma!\n\n🌐 compario.tech\n#Compario #TeknolojiHaberleri`;

  return [tweet1, tweet2, tweet3];
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={copy}
      className="font-mono text-[9px] uppercase tracking-wider px-3 py-1.5 rounded transition-all"
      style={{
        background: copied ? 'rgba(0,255,100,0.1)' : 'rgba(0,255,247,0.06)',
        border: `1px solid ${copied ? 'rgba(0,255,100,0.3)' : 'rgba(0,255,247,0.2)'}`,
        color: copied ? '#00ff64' : 'rgba(0,255,247,0.7)',
      }}
    >
      {copied ? '✓ Kopyalandı' : '⎘ Kopyala'}
    </button>
  );
}

export function SocialShareGenerator({ title, excerpt, slug, categories, tags, coverImage }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'instagram' | 'twitter'>('instagram');

  const disabled = !title.trim();

  const instagramText = generateInstagram({ title, excerpt, slug, categories, tags, coverImage });
  const twitterThread = generateTwitterThread({ title, excerpt, slug, categories, tags, coverImage });

  return (
    <div>
      <button
        type="button"
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all"
        style={{
          background: open ? 'rgba(196,154,60,0.1)' : 'rgba(196,154,60,0.05)',
          border: `1px solid ${open ? 'rgba(196,154,60,0.4)' : 'rgba(196,154,60,0.15)'}`,
          color: disabled ? 'rgba(196,154,60,0.3)' : '#C49A3C',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <span>◈</span>
        <span>Sosyal Medya Şablonu</span>
        <span style={{ marginLeft: 'auto', opacity: 0.5 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div
          className="mt-3 rounded-xl overflow-hidden"
          style={{ border: '1px solid rgba(196,154,60,0.15)', background: '#0a0a14' }}
        >
          {/* Tab bar */}
          <div className="flex border-b" style={{ borderColor: 'rgba(196,154,60,0.1)' }}>
            {(['instagram', 'twitter'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className="flex-1 py-2.5 font-mono text-[10px] uppercase tracking-wider transition-all"
                style={{
                  background: tab === t ? 'rgba(196,154,60,0.08)' : 'transparent',
                  color: tab === t ? '#C49A3C' : 'rgba(107,114,128,1)',
                  borderBottom: tab === t ? '1px solid rgba(196,154,60,0.4)' : '1px solid transparent',
                }}
              >
                {t === 'instagram' ? '📸 Instagram' : '𝕏 Twitter / X'}
              </button>
            ))}
          </div>

          <div className="p-4">
            {tab === 'instagram' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-mono text-[9px] text-gray-600 uppercase tracking-wider">
                    Instagram Caption — {instagramText.length} karakter
                  </p>
                  <CopyButton text={instagramText} />
                </div>
                <pre
                  className="font-mono text-xs text-gray-300 whitespace-pre-wrap p-4 rounded-lg leading-relaxed"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  {instagramText}
                </pre>
                {coverImage && (
                  <p className="font-mono text-[9px] mt-2" style={{ color: 'rgba(0,255,247,0.4)' }}>
                    ℹ Cover image bu görselle paylaş: {coverImage.slice(0, 60)}...
                  </p>
                )}
              </div>
            )}

            {tab === 'twitter' && (
              <div className="space-y-3">
                <p className="font-mono text-[9px] text-gray-600 uppercase tracking-wider mb-3">
                  Twitter Thread — {twitterThread.length} Tweet
                </p>
                {twitterThread.map((tweet, i) => (
                  <div key={i} className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div
                      className="flex items-center justify-between px-3 py-1.5"
                      style={{ background: 'rgba(255,255,255,0.02)' }}
                    >
                      <span className="font-mono text-[9px] text-gray-600">
                        Tweet {i + 1}/{twitterThread.length} · {tweet.length} karakter
                      </span>
                      <CopyButton text={tweet} />
                    </div>
                    <pre
                      className="font-mono text-xs text-gray-300 whitespace-pre-wrap p-3 leading-relaxed"
                      style={{ background: 'rgba(255,255,255,0.01)' }}
                    >
                      {tweet}
                    </pre>
                  </div>
                ))}
                <CopyButton text={twitterThread.join('\n\n---\n\n')} />
                <span className="font-mono text-[9px] text-gray-600 ml-2">Tümünü kopyala</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
