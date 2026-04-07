'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { FEED_SOURCES, CATEGORY_META } from '@/lib/feed-sources';
import type { FeedItem } from '@/app/api/admin/feeds/route';

const STORAGE_KEY = 'compario-feed-saved';
const STORAGE_ENABLED = 'compario-feed-enabled';
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 dakika

type Category = 'all' | 'trend' | 'otomotiv' | 'telefon' | 'teknoloji' | 'genel';

const CATEGORIES: { value: Category; label: string; icon: string; color: string }[] = [
  { value: 'all',       label: 'Tümü',      icon: '◈', color: '#9ca3af' },
  { value: 'trend',     label: 'Trend',      icon: '▲', color: '#C49A3C' },
  { value: 'otomotiv',  label: 'Otomotiv',  icon: '◈', color: '#00fff7' },
  { value: 'telefon',   label: 'Telefon',   icon: '◆', color: '#8B9BAC' },
  { value: 'teknoloji', label: 'Teknoloji', icon: '⬡', color: '#b724ff' },
  { value: 'genel',     label: 'Genel',     icon: '◇', color: '#6b7280' },
];

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Az önce';
  if (m < 60) return `${m} dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} sa önce`;
  return `${Math.floor(h / 24)} gün önce`;
}

function savedItems(): FeedItem[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); } catch { return []; }
}

function saveItem(item: FeedItem) {
  const current = savedItems();
  if (current.find((i) => i.id === item.id)) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([item, ...current].slice(0, 50)));
}

function unsaveItem(id: string) {
  const current = savedItems().filter((i) => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
}

function getEnabledSources(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_ENABLED);
    if (!raw) return FEED_SOURCES.map((s) => s.id);
    return JSON.parse(raw);
  } catch { return FEED_SOURCES.map((s) => s.id); }
}

function setEnabledSources(ids: string[]) {
  localStorage.setItem(STORAGE_ENABLED, JSON.stringify(ids));
}

function FeedCard({ item, onSave, isSaved }: {
  item: FeedItem;
  onSave: (item: FeedItem) => void;
  isSaved: boolean;
}) {
  const cat = CATEGORY_META[item.sourceCategory as keyof typeof CATEGORY_META];
  const writeUrl = `/admin/news/new?title=${encodeURIComponent(item.title)}&source=${encodeURIComponent(item.sourceName)}&source_url=${encodeURIComponent(item.url)}`;

  return (
    <div
      className="flex flex-col rounded-xl border overflow-hidden transition-all hover:border-[rgba(196,154,60,0.2)]"
      style={{ background: '#0c0c18', border: '1px solid rgba(196,154,60,0.08)' }}
    >
      {/* Image */}
      {item.image && (
        <div className="aspect-video w-full overflow-hidden bg-[#0a0a14] flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.image}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Source + category + time */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-wider"
            style={{ background: `${cat?.color ?? '#6b7280'}15`, color: cat?.color ?? '#6b7280', border: `1px solid ${cat?.color ?? '#6b7280'}30` }}
          >
            {item.sourceName}
          </span>
          <span className="font-mono text-[9px] text-gray-700 ml-auto">
            {timeAgo(item.publishedMs)}
          </span>
        </div>

        {/* Title */}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-orbitron text-xs font-bold text-gray-200 leading-snug hover:text-neon-cyan transition-colors line-clamp-3"
        >
          {item.title}
        </a>

        {/* Description */}
        {item.description && (
          <p className="font-mono text-[10px] text-gray-600 leading-relaxed line-clamp-2 flex-1">
            {item.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-[rgba(196,154,60,0.06)] mt-auto">
          <Link
            href={writeUrl}
            className="flex-1 text-center px-3 py-2 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all"
            style={{ background: 'rgba(0,255,247,0.06)', border: '1px solid rgba(0,255,247,0.2)', color: '#00fff7' }}
          >
            ✏ Haber Yaz
          </Link>
          <button
            onClick={() => onSave(item)}
            className="px-3 py-2 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all"
            style={{
              background: isSaved ? 'rgba(196,154,60,0.1)' : 'rgba(196,154,60,0.04)',
              border: `1px solid ${isSaved ? 'rgba(196,154,60,0.4)' : 'rgba(196,154,60,0.12)'}`,
              color: isSaved ? '#C49A3C' : '#6b7280',
            }}
          >
            {isSaved ? '★' : '☆'}
          </button>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-lg font-mono text-[10px] text-gray-700 hover:text-gray-300 transition-colors"
            style={{ border: '1px solid rgba(196,154,60,0.06)' }}
          >
            ↗
          </a>
        </div>
      </div>
    </div>
  );
}

export function FeedPanel() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState<FeedItem[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showSaved, setShowSaved] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [enabledSources, setEnabledSourcesState] = useState<string[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Init from localStorage
  useEffect(() => {
    const en = getEnabledSources();
    setEnabledSourcesState(en);
    const s = savedItems();
    setSaved(s);
    setSavedIds(new Set(s.map((i) => i.id)));
  }, []);

  const fetchFeeds = useCallback(async (category?: Category, sources?: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.set('category', category);
      if (sources?.length) params.set('sources', sources.join(','));
      const res = await fetch(`/api/admin/feeds?${params}`);
      if (!res.ok) throw new Error('Akış yüklenemedi');
      const json = await res.json();
      setItems(json.items ?? []);
      setLastRefresh(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Hata');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial + category change fetch
  useEffect(() => {
    if (enabledSources.length > 0) {
      fetchFeeds(activeCategory, enabledSources);
    }
  }, [activeCategory, enabledSources, fetchFeeds]);

  // Auto refresh
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoRefresh) {
      timerRef.current = setInterval(() => {
        fetchFeeds(activeCategory, enabledSources);
      }, REFRESH_INTERVAL);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [autoRefresh, activeCategory, enabledSources, fetchFeeds]);

  function toggleSource(id: string) {
    const next = enabledSources.includes(id)
      ? enabledSources.filter((s) => s !== id)
      : [...enabledSources, id];
    setEnabledSourcesState(next);
    setEnabledSources(next);
  }

  function handleSave(item: FeedItem) {
    if (savedIds.has(item.id)) {
      unsaveItem(item.id);
      const next = new Set(savedIds);
      next.delete(item.id);
      setSavedIds(next);
      setSaved(savedItems());
    } else {
      saveItem(item);
      const next = new Set(savedIds);
      next.add(item.id);
      setSavedIds(next);
      setSaved(savedItems());
    }
  }

  // Filtered items
  const filtered = (showSaved ? saved : items).filter((item) => {
    if (search) {
      const q = search.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    }
    return true;
  });

  const sourcesByCategory = FEED_SOURCES.reduce<Record<string, typeof FEED_SOURCES>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return (
    <div className="flex h-full min-h-screen" style={{ background: '#08090e' }}>

      {/* Left sidebar — sources */}
      <aside
        className="flex-shrink-0 overflow-y-auto border-r"
        style={{
          width: showSources ? '220px' : '48px',
          borderColor: 'rgba(196,154,60,0.08)',
          background: '#0c0c18',
          transition: 'width 0.2s ease',
        }}
      >
        <button
          onClick={() => setShowSources((p) => !p)}
          className="w-full flex items-center justify-center py-4 border-b font-mono text-[10px] text-gray-600 hover:text-gray-300 transition-colors"
          style={{ borderColor: 'rgba(196,154,60,0.08)' }}
          title={showSources ? 'Küçült' : 'Kaynaklar'}
        >
          {showSources ? '◀' : '▶'}
        </button>

        {showSources && (
          <div className="px-3 py-4 space-y-6">
            <p className="font-mono text-[9px] uppercase tracking-widest text-gray-700">Kaynaklar</p>
            {Object.entries(sourcesByCategory).map(([cat, sources]) => {
              const meta = CATEGORY_META[cat as keyof typeof CATEGORY_META];
              return (
                <div key={cat}>
                  <p className="font-mono text-[9px] uppercase tracking-widest mb-2" style={{ color: meta?.color ?? '#6b7280' }}>
                    {meta?.icon} {meta?.label ?? cat}
                  </p>
                  <div className="space-y-1">
                    {sources.map((s) => (
                      <label key={s.id} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={enabledSources.includes(s.id)}
                          onChange={() => toggleSource(s.id)}
                          className="accent-[#C49A3C] w-3 h-3 flex-shrink-0"
                        />
                        <span className="font-mono text-[10px] text-gray-500 group-hover:text-gray-300 transition-colors truncate">
                          {s.name}
                        </span>
                        <span className="font-mono text-[8px] text-gray-700 flex-shrink-0">
                          {s.lang.toUpperCase()}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Toolbar */}
        <div
          className="flex items-center gap-3 px-5 py-3 border-b flex-shrink-0 flex-wrap"
          style={{ borderColor: 'rgba(196,154,60,0.08)', background: '#0d0d1a' }}
        >
          {/* Category tabs */}
          <div className="flex gap-1 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className="px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all"
                style={{
                  background: activeCategory === cat.value ? `${cat.color}18` : 'transparent',
                  border: `1px solid ${activeCategory === cat.value ? cat.color + '50' : 'rgba(196,154,60,0.1)'}`,
                  color: activeCategory === cat.value ? cat.color : '#6b7280',
                }}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search */}
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Başlık ara..."
            className="bg-[#0c0c16] border border-[rgba(196,154,60,0.15)] rounded-lg px-3 py-1.5 font-mono text-[10px] text-gray-300 placeholder-gray-700 focus:outline-none focus:border-neon-cyan/40 w-44"
          />

          {/* Saved toggle */}
          <button
            onClick={() => setShowSaved((p) => !p)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all"
            style={{
              background: showSaved ? 'rgba(196,154,60,0.1)' : 'transparent',
              border: `1px solid ${showSaved ? 'rgba(196,154,60,0.4)' : 'rgba(196,154,60,0.1)'}`,
              color: showSaved ? '#C49A3C' : '#6b7280',
            }}
          >
            ★ Kaydedilenler {saved.length > 0 && `(${saved.length})`}
          </button>

          {/* Refresh */}
          <button
            onClick={() => fetchFeeds(activeCategory, enabledSources)}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg font-mono text-[10px] text-gray-600 hover:text-gray-300 transition-colors border border-[rgba(196,154,60,0.1)] disabled:opacity-40"
          >
            {loading ? '⟳' : '↺'} Yenile
          </button>

          {/* Auto refresh toggle */}
          <button
            onClick={() => setAutoRefresh((p) => !p)}
            className="px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all"
            style={{
              background: autoRefresh ? 'rgba(34,197,94,0.08)' : 'transparent',
              border: `1px solid ${autoRefresh ? 'rgba(34,197,94,0.3)' : 'rgba(196,154,60,0.1)'}`,
              color: autoRefresh ? '#22c55e' : '#6b7280',
            }}
          >
            {autoRefresh ? '● Canlı' : '○ Durduruldu'}
          </button>
        </div>

        {/* Status bar */}
        <div
          className="px-5 py-2 flex items-center gap-4 border-b flex-shrink-0"
          style={{ borderColor: 'rgba(196,154,60,0.04)', background: '#0a0a14' }}
        >
          <span className="font-mono text-[9px] text-gray-700">
            {filtered.length} haber
            {!showSaved && ` · ${enabledSources.length} kaynak aktif`}
          </span>
          {lastRefresh && (
            <span className="font-mono text-[9px] text-gray-700">
              Son güncelleme: {lastRefresh.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {autoRefresh && (
            <span className="font-mono text-[9px] text-green-800">● Her 5dk yenileniyor</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading && items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div
                className="w-8 h-8 rounded-full border-2 animate-spin"
                style={{ borderColor: 'rgba(196,154,60,0.3)', borderTopColor: '#C49A3C' }}
              />
              <p className="font-mono text-xs text-gray-700">Haberler yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <p className="font-mono text-xs text-red-400">{error}</p>
              <button
                onClick={() => fetchFeeds(activeCategory, enabledSources)}
                className="btn-neon text-xs"
              >
                Tekrar Dene
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <p className="font-mono text-xs text-gray-700">
                {showSaved ? 'Kaydedilen haber yok' : 'Bu kategoride haber bulunamadı'}
              </p>
              {showSaved && (
                <p className="font-mono text-[10px] text-gray-700">
                  Haberlerdeki ★ butonuyla kaydet
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((item) => (
                <FeedCard
                  key={item.id}
                  item={item}
                  onSave={handleSave}
                  isSaved={savedIds.has(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
