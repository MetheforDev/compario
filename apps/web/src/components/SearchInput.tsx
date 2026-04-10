'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SuggestionProduct {
  id: string;
  slug: string;
  name: string;
  brand?: string | null;
  model?: string | null;
  price_min?: number | null;
  currency?: string | null;
  image_url?: string | null;
  _matchType: 'exact' | 'prefix' | 'contains';
}

interface SuggestionNews {
  id: string;
  slug: string;
  title: string;
  category?: string | null;
  cover_image?: string | null;
  published_at?: string | null;
}

interface Suggestions {
  products: SuggestionProduct[];
  news: SuggestionNews[];
}

const CATEGORY_LABELS: Record<string, string> = {
  'yeni-model': 'Yeni Model',
  test: 'Test',
  karsilastirma: 'Karşılaştırma',
  fiyat: 'Fiyat',
  teknoloji: 'Teknoloji',
  genel: 'Genel',
};

function highlight(text: string, query: string): string {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
}

interface SearchInputProps {
  initialValue?: string;
  size?: 'default' | 'sm';
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchInput({
  initialValue = '',
  size = 'default',
  placeholder = 'Ürün veya haber ara...',
  autoFocus = false,
}: SearchInputProps) {
  const [value, setValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Suggestions>({ products: [], news: [] });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSmall = size === 'sm';

  // Close on outside click
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIdx(-1);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions({ products: [], news: [] });
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data: Suggestions = await res.json();
        setSuggestions(data);
        setOpen(data.products.length > 0 || data.news.length > 0);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setValue(q);
    setActiveIdx(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(q), 220);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (q.length < 2) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  // Build flat list for keyboard nav
  const allItems: Array<{ type: 'product' | 'news'; slug: string; href: string }> = [
    ...suggestions.products.map((p) => ({ type: 'product' as const, slug: p.slug, href: `/products/${p.slug}` })),
    ...suggestions.news.map((a) => ({ type: 'news' as const, slug: a.slug, href: `/news/${a.slug}` })),
  ];

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, allItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      setOpen(false);
      router.push(allItems[activeIdx].href);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIdx(-1);
    }
  }

  const totalSuggestions = suggestions.products.length + suggestions.news.length;

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="relative flex items-center">
          {/* Search icon / spinner */}
          <div className={`absolute left-4 text-gray-600 pointer-events-none flex-shrink-0 ${isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'}`}>
            {loading ? (
              <span className="block w-full h-full border-2 border-gray-700 border-t-neon-cyan rounded-full animate-spin" />
            ) : (
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-full h-full">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            )}
          </div>

          <input
            ref={inputRef}
            type="search"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => { if (totalSuggestions > 0) setOpen(true); }}
            placeholder={placeholder}
            autoFocus={autoFocus}
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={open}
            className={`w-full bg-[#0c0c16] border border-[rgba(0,255,247,0.15)] rounded-lg font-mono text-gray-300 placeholder-gray-700
                        focus:outline-none focus:border-neon-cyan/50 focus:bg-[#0d0d1a] transition-all
                        ${isSmall ? 'pl-9 pr-20 py-2 text-xs' : 'pl-11 pr-28 py-3.5 text-sm'}
                        ${open ? 'rounded-b-none border-b-[rgba(0,255,247,0.06)]' : ''}`}
          />

          <button
            type="submit"
            disabled={value.trim().length < 2}
            className={`absolute right-2 font-mono uppercase tracking-wider transition-all
                        ${isSmall ? 'text-[10px] px-2.5 py-1' : 'text-xs px-4 py-2'}
                        bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan rounded
                        hover:bg-neon-cyan/20 disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            Ara
          </button>
        </div>
      </form>

      {/* Dropdown */}
      {open && totalSuggestions > 0 && (
        <div
          className="absolute top-full left-0 right-0 z-50 rounded-b-xl overflow-hidden"
          style={{
            background: '#0c0c18',
            border: '1px solid rgba(0,255,247,0.15)',
            borderTop: 'none',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          }}
        >
          {/* Products */}
          {suggestions.products.length > 0 && (
            <div>
              <div className="px-4 py-2 border-b border-[rgba(0,255,247,0.06)]">
                <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-gray-600">Ürünler</span>
              </div>
              {suggestions.products.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[rgba(0,255,247,0.04)] ${activeIdx === i ? 'bg-[rgba(0,255,247,0.06)]' : ''}`}
                >
                  {/* Thumbnail */}
                  <div className="w-9 h-9 rounded border border-[rgba(0,255,247,0.08)] bg-[#0a0a14] flex-shrink-0 overflow-hidden">
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-gray-700 font-mono text-xs">◈</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-mono text-xs text-gray-300 truncate [&_mark]:bg-transparent [&_mark]:text-neon-cyan [&_mark]:font-semibold"
                      dangerouslySetInnerHTML={{ __html: highlight(p.name, value) }}
                    />
                    {p.brand && (
                      <p className="font-mono text-[10px] text-gray-600 truncate">{p.brand}{p.model ? ` · ${p.model}` : ''}</p>
                    )}
                  </div>
                  {p.price_min && (
                    <span className="font-mono text-xs text-neon-cyan flex-shrink-0">
                      ₺{p.price_min.toLocaleString('tr-TR')}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}

          {/* News */}
          {suggestions.news.length > 0 && (
            <div className={suggestions.products.length > 0 ? 'border-t border-[rgba(0,255,247,0.06)]' : ''}>
              <div className="px-4 py-2 border-b border-[rgba(0,255,247,0.06)]">
                <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-gray-600">Haberler</span>
              </div>
              {suggestions.news.map((a, i) => {
                const idx = suggestions.products.length + i;
                const cat = a.category ? (CATEGORY_LABELS[a.category] ?? a.category) : null;
                return (
                  <Link
                    key={a.id}
                    href={`/news/${a.slug}`}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[rgba(183,36,255,0.04)] ${activeIdx === idx ? 'bg-[rgba(183,36,255,0.06)]' : ''}`}
                  >
                    <div className="w-9 h-9 rounded border border-[rgba(183,36,255,0.1)] bg-[#0a0a14] flex-shrink-0 overflow-hidden">
                      {a.cover_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.cover_image} alt={a.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="w-full h-full flex items-center justify-center text-gray-700 font-mono text-xs">◇</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-mono text-xs text-gray-300 line-clamp-1 [&_mark]:bg-transparent [&_mark]:text-neon-purple [&_mark]:font-semibold"
                        dangerouslySetInnerHTML={{ __html: highlight(a.title, value) }}
                      />
                      {cat && (
                        <p className="font-mono text-[10px] text-gray-600">{cat}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* See all */}
          <div className="border-t border-[rgba(0,255,247,0.06)] px-4 py-2.5">
            <Link
              href={`/search?q=${encodeURIComponent(value.trim())}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 font-mono text-[10px] text-gray-600 hover:text-neon-cyan transition-colors uppercase tracking-wider"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              Tüm sonuçları gör
              <span className="ml-auto text-neon-cyan">→</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
