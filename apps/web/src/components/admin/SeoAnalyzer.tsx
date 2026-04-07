'use client';

import { useMemo, useState } from 'react';

export interface SeoAnalyzerProps {
  title: string;
  slug: string;
  metaTitle: string;
  metaDesc: string;
  excerpt: string;
  content: string;
  coverImage: string;
  categories: string[];
  focusKeyword: string;
  author: string;
}

type Status = 'pass' | 'warn' | 'fail';

interface Check {
  id: string;
  label: string;
  status: Status;
  message: string;
  pts: number;   // earned
  max: number;   // possible
}

// ─── helpers ────────────────────────────────────────────────────────────────

function wordCount(text: string) {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

function stripMarkdown(md: string) {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]+`/g, ' ')
    .replace(/#{1,6}\s/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/[*_~>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  let count = 0;
  let pos = 0;
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase();
  while ((pos = h.indexOf(n, pos)) !== -1) { count++; pos += n.length; }
  return count;
}

function hasHeading(content: string, level: number) {
  const re = new RegExp(`^${'#'.repeat(level)} `, 'm');
  return re.test(content) || content.includes(`<h${level}`);
}

function linkCounts(content: string) {
  let internal = 0, external = 0;
  const mdLinks = [...content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)];
  mdLinks.forEach((m) => {
    if (/^https?:\/\//.test(m[2]) || m[2].startsWith('//')) external++;
    else internal++;
  });
  return { internal, external };
}

function readingTime(text: string) {
  return Math.max(1, Math.round(wordCount(stripMarkdown(text)) / 200));
}

// ─── scoring ────────────────────────────────────────────────────────────────

function computeChecks(p: SeoAnalyzerProps): Check[] {
  const plain = stripMarkdown(p.content);
  const words = wordCount(plain);
  const effectiveTitle = p.metaTitle || p.title;
  const effectiveMeta = p.metaDesc || p.excerpt;
  const kw = p.focusKeyword.toLowerCase().trim();
  const kwOccTitle = kw ? countOccurrences(effectiveTitle, kw) : 0;
  const kwOccContent = kw ? countOccurrences(plain, kw) : 0;
  const kwOccMeta = kw ? countOccurrences(effectiveMeta, kw) : 0;
  const kwDensity = words > 0 && kw ? (kwOccContent / words) * 100 : 0;
  const first100 = plain.split(/\s+/).slice(0, 100).join(' ');
  const kwInFirst = kw ? countOccurrences(first100, kw) > 0 : false;
  const { internal, external } = linkCounts(p.content);
  const titleLen = effectiveTitle.length;
  const metaLen = effectiveMeta.length;

  const checks: Check[] = [
    // ── Temel SEO ──
    {
      id: 'title-len',
      label: 'Başlık uzunluğu',
      ...(titleLen === 0
        ? { status: 'fail', message: 'Başlık boş', pts: 0, max: 10 }
        : titleLen < 30
        ? { status: 'warn', message: `${titleLen} karakter — 50-60 arası ideal`, pts: 5, max: 10 }
        : titleLen <= 60
        ? { status: 'pass', message: `${titleLen} karakter — mükemmel aralık`, pts: 10, max: 10 }
        : { status: 'warn', message: `${titleLen} karakter — 60'tan kısa olmalı`, pts: 5, max: 10 }),
    },
    {
      id: 'meta-len',
      label: 'Meta açıklama uzunluğu',
      ...(metaLen === 0
        ? { status: 'fail', message: 'Meta açıklama yok', pts: 0, max: 10 }
        : metaLen < 120
        ? { status: 'warn', message: `${metaLen} karakter — 140-160 arası ideal`, pts: 5, max: 10 }
        : metaLen <= 160
        ? { status: 'pass', message: `${metaLen} karakter — mükemmel aralık`, pts: 10, max: 10 }
        : { status: 'warn', message: `${metaLen} karakter — 160'tan kısa olmalı`, pts: 5, max: 10 }),
    },
    {
      id: 'slug',
      label: 'URL (slug)',
      ...(p.slug.length === 0
        ? { status: 'fail', message: 'Slug oluşturulmamış', pts: 0, max: 5 }
        : p.slug.length > 75
        ? { status: 'warn', message: 'Slug çok uzun (75 karakter altı önerilir)', pts: 3, max: 5 }
        : { status: 'pass', message: `/${p.slug}`, pts: 5, max: 5 }),
    },
    // ── Anahtar Kelime ──
    {
      id: 'kw-title',
      label: 'Anahtar kelime — başlıkta',
      ...(kw === ''
        ? { status: 'warn', message: 'Odak anahtar kelime girilmedi', pts: 0, max: 10 }
        : kwOccTitle > 0
        ? { status: 'pass', message: `"${p.focusKeyword}" başlıkta mevcut`, pts: 10, max: 10 }
        : { status: 'fail', message: `"${p.focusKeyword}" başlıkta geçmiyor`, pts: 0, max: 10 }),
    },
    {
      id: 'kw-meta',
      label: 'Anahtar kelime — meta açıklamada',
      ...(kw === ''
        ? { status: 'warn', message: 'Odak anahtar kelime girilmedi', pts: 0, max: 8 }
        : kwOccMeta > 0
        ? { status: 'pass', message: `"${p.focusKeyword}" meta açıklamada mevcut`, pts: 8, max: 8 }
        : { status: 'fail', message: `"${p.focusKeyword}" meta açıklamada geçmiyor`, pts: 0, max: 8 }),
    },
    {
      id: 'kw-first',
      label: 'Anahtar kelime — ilk paragraflarda',
      ...(kw === ''
        ? { status: 'warn', message: 'Odak anahtar kelime girilmedi', pts: 0, max: 8 }
        : kwInFirst
        ? { status: 'pass', message: 'İlk 100 kelime içinde geçiyor', pts: 8, max: 8 }
        : { status: 'fail', message: 'İlk paragraflarda kullanın', pts: 0, max: 8 }),
    },
    {
      id: 'kw-density',
      label: 'Anahtar kelime yoğunluğu',
      ...(kw === '' || words === 0
        ? { status: 'warn', message: 'Hesaplanamıyor', pts: 0, max: 5 }
        : kwDensity < 0.5
        ? { status: 'warn', message: `${kwDensity.toFixed(1)}% — çok düşük (hedef: 0.5-2.5%)`, pts: 2, max: 5 }
        : kwDensity <= 2.5
        ? { status: 'pass', message: `${kwDensity.toFixed(1)}% — ideal yoğunluk`, pts: 5, max: 5 }
        : { status: 'warn', message: `${kwDensity.toFixed(1)}% — çok yüksek (aşırı optimizasyon)`, pts: 2, max: 5 }),
    },
    // ── İçerik Kalitesi ──
    {
      id: 'content-len',
      label: 'İçerik uzunluğu',
      ...(words === 0
        ? { status: 'fail', message: 'İçerik boş', pts: 0, max: 12 }
        : words < 300
        ? { status: 'fail', message: `${words} kelime — minimum 300 olmalı`, pts: 2, max: 12 }
        : words < 600
        ? { status: 'warn', message: `${words} kelime — 600+ için daha iyi sıralama`, pts: 7, max: 12 }
        : words < 1000
        ? { status: 'pass', message: `${words} kelime — iyi uzunluk`, pts: 10, max: 12 }
        : { status: 'pass', message: `${words} kelime — mükemmel derinlik`, pts: 12, max: 12 }),
    },
    {
      id: 'headings',
      label: 'H2 başlık yapısı',
      ...(hasHeading(p.content, 2)
        ? { status: 'pass', message: 'En az bir H2 başlık mevcut', pts: 5, max: 5 }
        : { status: 'fail', message: 'H2 başlık ekleyin (## Başlık)', pts: 0, max: 5 }),
    },
    {
      id: 'cover',
      label: 'Kapak görseli',
      ...(p.coverImage
        ? { status: 'pass', message: 'Kapak görseli yüklendi', pts: 8, max: 8 }
        : { status: 'fail', message: 'Kapak görseli eksik — OG ve Twitter card etkilenir', pts: 0, max: 8 }),
    },
    {
      id: 'excerpt',
      label: 'Kısa özet',
      ...(p.excerpt.length === 0
        ? { status: 'fail', message: 'Kısa özet boş — meta description için kullanılır', pts: 0, max: 7 }
        : p.excerpt.length < 80
        ? { status: 'warn', message: `${p.excerpt.length} karakter — daha uzun yazın`, pts: 4, max: 7 }
        : { status: 'pass', message: `${p.excerpt.length} karakter — iyi`, pts: 7, max: 7 }),
    },
    {
      id: 'category',
      label: 'Kategori seçimi',
      ...(p.categories.length === 0
        ? { status: 'fail', message: 'En az bir kategori seçin', pts: 0, max: 4 }
        : { status: 'pass', message: `${p.categories.length} kategori seçili`, pts: 4, max: 4 }),
    },
    {
      id: 'author',
      label: 'Yazar',
      ...(p.author
        ? { status: 'pass', message: p.author, pts: 3, max: 3 }
        : { status: 'warn', message: 'Yazar adı girilmedi', pts: 0, max: 3 }),
    },
    // ── Teknik ──
    {
      id: 'internal-links',
      label: 'Dahili bağlantılar',
      ...(internal === 0
        ? { status: 'warn', message: 'İçerikte dahili link yok — ilgili sayfalara bağlantı ekleyin', pts: 0, max: 4 }
        : { status: 'pass', message: `${internal} dahili bağlantı`, pts: 4, max: 4 }),
    },
    {
      id: 'external-links',
      label: 'Harici bağlantılar',
      ...(external === 0
        ? { status: 'warn', message: 'Kaynak/referans bağlantısı yok — güvenilirlik için ekleyin', pts: 0, max: 3 }
        : { status: 'pass', message: `${external} harici bağlantı`, pts: 3, max: 3 }),
    },
  ];

  return checks;
}

// ─── UI ─────────────────────────────────────────────────────────────────────

const STATUS_ICON: Record<Status, string> = { pass: '✓', warn: '!', fail: '✗' };
const STATUS_COLOR: Record<Status, string> = {
  pass: '#00fff7',
  warn: '#C49A3C',
  fail: '#ef4444',
};
const STATUS_BG: Record<Status, string> = {
  pass: 'rgba(0,255,247,0.08)',
  warn: 'rgba(196,154,60,0.08)',
  fail: 'rgba(239,68,68,0.08)',
};

function ScoreRing({ score }: { score: number }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const fill = circ - (circ * score) / 100;
  const color = score >= 70 ? '#00fff7' : score >= 50 ? '#C49A3C' : '#ef4444';
  const label = score >= 70 ? 'İyi' : score >= 50 ? 'Geliştirilmeli' : 'Zayıf';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
          <circle
            cx="44" cy="44" r={r}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={circ}
            strokeDashoffset={fill}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease', filter: `drop-shadow(0 0 6px ${color}88)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-orbitron text-2xl font-black" style={{ color }}>{score}</span>
          <span className="font-mono text-[9px] text-gray-500 uppercase tracking-wider">/100</span>
        </div>
      </div>
      <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color }}>{label}</span>
    </div>
  );
}

function CheckRow({ check }: { check: Check }) {
  return (
    <div
      className="flex items-start gap-2.5 px-3 py-2 rounded-lg transition-all"
      style={{ background: STATUS_BG[check.status] }}
    >
      <span
        className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold mt-0.5"
        style={{ background: STATUS_COLOR[check.status] + '22', color: STATUS_COLOR[check.status], border: `1px solid ${STATUS_COLOR[check.status]}44` }}
      >
        {STATUS_ICON[check.status]}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-mono text-[10px] text-gray-400 uppercase tracking-wide">{check.label}</p>
        <p className="font-mono text-[11px] mt-0.5" style={{ color: STATUS_COLOR[check.status] + 'cc' }}>
          {check.message}
        </p>
      </div>
      <span className="flex-shrink-0 font-mono text-[9px] text-gray-700 mt-0.5">
        {check.pts}/{check.max}
      </span>
    </div>
  );
}

const SECTIONS: { id: string; label: string; ids: string[] }[] = [
  { id: 'seo',     label: 'Temel SEO',        ids: ['title-len', 'meta-len', 'slug'] },
  { id: 'kw',      label: 'Anahtar Kelime',    ids: ['kw-title', 'kw-meta', 'kw-first', 'kw-density'] },
  { id: 'content', label: 'İçerik Kalitesi',   ids: ['content-len', 'headings', 'cover', 'excerpt', 'category', 'author'] },
  { id: 'tech',    label: 'Teknik / Bağlantı', ids: ['internal-links', 'external-links'] },
];

export function SeoAnalyzer(props: SeoAnalyzerProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const checks = useMemo(() => computeChecks(props), [props]);

  const totalPts = checks.reduce((s, c) => s + c.pts, 0);
  const totalMax = checks.reduce((s, c) => s + c.max, 0);
  const score = totalMax > 0 ? Math.round((totalPts / totalMax) * 100) : 0;

  const passCnt = checks.filter((c) => c.status === 'pass').length;
  const warnCnt = checks.filter((c) => c.status === 'warn').length;
  const failCnt = checks.filter((c) => c.status === 'fail').length;

  return (
    <div className="border border-[rgba(0,255,247,0.1)] rounded-xl overflow-hidden bg-[#080810]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[rgba(0,255,247,0.06)] flex items-center justify-between">
        <div>
          <h3 className="font-orbitron text-xs text-neon-cyan uppercase tracking-widest">SEO Analizi</h3>
          <div className="flex gap-3 mt-1">
            <span className="font-mono text-[10px] text-[#00fff7]">✓ {passCnt} iyi</span>
            <span className="font-mono text-[10px] text-[#C49A3C]">! {warnCnt} uyarı</span>
            <span className="font-mono text-[10px] text-red-400">✗ {failCnt} sorun</span>
          </div>
        </div>
        <ScoreRing score={score} />
      </div>

      {/* Sections */}
      <div className="p-4 space-y-3">
        {SECTIONS.map((sec) => {
          const secChecks = checks.filter((c) => sec.ids.includes(c.id));
          const secFail = secChecks.filter((c) => c.status === 'fail').length;
          const secWarn = secChecks.filter((c) => c.status === 'warn').length;
          const isOpen = !collapsed[sec.id];

          return (
            <div key={sec.id} className="border border-[rgba(255,255,255,0.05)] rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setCollapsed((p) => ({ ...p, [sec.id]: !p[sec.id] }))}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/[0.02] transition-colors"
              >
                <span className="font-mono text-[11px] text-gray-400 uppercase tracking-wider">{sec.label}</span>
                <div className="flex items-center gap-2">
                  {secFail > 0 && (
                    <span className="w-4 h-4 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center font-mono text-[9px] text-red-400">
                      {secFail}
                    </span>
                  )}
                  {secWarn > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[#C49A3C]/20 border border-[#C49A3C]/40 flex items-center justify-center font-mono text-[9px] text-[#C49A3C]">
                      {secWarn}
                    </span>
                  )}
                  <span className="font-mono text-[10px] text-gray-700">{isOpen ? '▲' : '▼'}</span>
                </div>
              </button>

              {isOpen && (
                <div className="px-3 pb-3 space-y-1.5">
                  {secChecks.map((c) => <CheckRow key={c.id} check={c} />)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tip bar */}
      {failCnt > 0 && (
        <div className="px-5 py-3 border-t border-[rgba(239,68,68,0.1)] bg-[rgba(239,68,68,0.04)]">
          <p className="font-mono text-[10px] text-red-400">
            ◈ {failCnt} kritik sorun yayın performansını düşürür — düzeltmek önerilir
          </p>
        </div>
      )}
      {failCnt === 0 && warnCnt > 0 && (
        <div className="px-5 py-3 border-t border-[rgba(196,154,60,0.1)] bg-[rgba(196,154,60,0.03)]">
          <p className="font-mono text-[10px] text-[#C49A3C]">
            ◈ Uyarıları gidererek skoru yükseltebilirsiniz
          </p>
        </div>
      )}
      {failCnt === 0 && warnCnt === 0 && (
        <div className="px-5 py-3 border-t border-[rgba(0,255,247,0.1)] bg-[rgba(0,255,247,0.03)]">
          <p className="font-mono text-[10px] text-neon-cyan">
            ✓ Tüm SEO kontrolleri geçildi — yayınlamaya hazır!
          </p>
        </div>
      )}
    </div>
  );
}
