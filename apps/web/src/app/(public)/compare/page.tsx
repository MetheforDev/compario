import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getProductsByIds, incrementCompareCount } from '@compario/database';
import type { Product, Json } from '@compario/database';
import { ShareButtons } from '@/components/ShareButtons';
import { CompareHistorySaver } from '@/components/CompareHistorySaver';
import { CompareCopyLink } from '@/components/CompareCopyLink';

interface PageProps {
  searchParams: { ids?: string };
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const ids = (searchParams.ids ?? '').split(',').filter(Boolean).slice(0, 4);
  if (ids.length < 2) return { title: 'Ürün Karşılaştırma' };
  const products = await getProductsByIds(ids).catch(() => []);
  const names = products.map((p) => p.brand ? `${p.brand} ${p.name}` : p.name);
  const title = names.length >= 2 ? `${names[0]} vs ${names[1]} Karşılaştırma` : 'Ürün Karşılaştırma';
  const ogImageUrl = `/api/og/compare?ids=${ids.join(',')}`;
  return {
    title,
    description: `${names.join(' — ')} karşılaştırması. Özellikler, fiyatlar ve daha fazlası.`,
    openGraph: { title, images: [{ url: ogImageUrl, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title, images: [ogImageUrl] },
  };
}

// ─── helpers ────────────────────────────────────────────────────────────────

function getSpecs(product: Product): Record<string, string> {
  if (!product.specs || typeof product.specs !== 'object' || Array.isArray(product.specs)) return {};
  return Object.fromEntries(
    Object.entries(product.specs as Record<string, Json>).map(([k, v]) => [k, String(v ?? '—')]),
  );
}

function tryNum(val: string): number | null {
  const n = parseFloat(val.replace(/[^0-9.,]/g, '').replace(',', '.'));
  return isNaN(n) ? null : n;
}

const LOWER_BETTER = ['tüketim', 'yakıt', '0-100', 'ağırlık', 'kg', 'saniye', 'sn', 'litre', 'l/100', 'emisyon', 'co2'];

function isLowerBetter(key: string) {
  return LOWER_BETTER.some((kw) => key.toLowerCase().includes(kw));
}

interface SpecAnalysis {
  bestIdx: number | null;       // index of winner
  bars: number[];               // 0-100 bar width per product
  diffPct: number | null;       // % difference between top two (if 2 contestants)
  isNumeric: boolean;
}

function analyzeSpec(key: string, values: string[]): SpecAnalysis {
  const nums = values.map(tryNum);
  if (nums.some((n) => n === null)) {
    return { bestIdx: null, bars: values.map(() => 0), diffPct: null, isNumeric: false };
  }
  const ns = nums as number[];
  const lb = isLowerBetter(key);
  const best = lb ? Math.min(...ns) : Math.max(...ns);
  const worst = lb ? Math.max(...ns) : Math.min(...ns);
  const bestIdx = ns.indexOf(best);
  const uniqueWinner = ns.filter((n) => n === best).length === 1 ? bestIdx : null;

  // Bar widths: winner = 100%, others relative
  const bars = ns.map((n) => {
    if (best === worst) return 100;
    if (lb) return worst === 0 ? 100 : Math.round((worst - n + best) / (worst - best + best) * 100);
    return best === 0 ? 0 : Math.round((n / best) * 100);
  });

  // % diff (only meaningful with 2 products or winner vs runner-up)
  let diffPct: number | null = null;
  if (ns.length === 2 && best !== worst) {
    diffPct = Math.round(Math.abs((ns[0] - ns[1]) / Math.min(...ns)) * 100);
  }

  return { bestIdx: uniqueWinner, bars, diffPct, isNumeric: true };
}

interface ProductScore {
  wins: number;
  total: number;
  score: number; // 0-100
}

function computeScores(specKeyOrder: string[], specsPerProduct: Record<string, string>[], count: number): ProductScore[] {
  const results: ProductScore[] = Array.from({ length: count }, () => ({ wins: 0, total: 0, score: 0 }));

  for (const key of specKeyOrder) {
    const values = specsPerProduct.map((s) => s[key] ?? '—');
    const { bestIdx, isNumeric } = analyzeSpec(key, values);
    if (!isNumeric) continue;
    results.forEach((r) => r.total++);
    if (bestIdx !== null) results[bestIdx].wins++;
  }

  results.forEach((r) => {
    r.score = r.total > 0 ? Math.round((r.wins / r.total) * 100) : 0;
  });

  return results;
}

// ─── sub-components ──────────────────────────────────────────────────────────

function ScoreRing({ score, size = 72 }: { score: number; size?: number }) {
  const r = size / 2 - 5;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * score) / 100;
  const color = score >= 65 ? '#00fff7' : score >= 40 ? '#C49A3C' : '#ef4444';
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 5px ${color}99)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-orbitron font-black leading-none" style={{ color, fontSize: size * 0.22 }}>{score}</span>
        <span className="font-mono leading-none" style={{ color: '#4b5563', fontSize: size * 0.12 }}>puan</span>
      </div>
    </div>
  );
}

function BarCell({
  val, barPct, isBest, diffPct, isNumeric, isOnly,
}: {
  val: string; barPct: number; isBest: boolean; diffPct: number | null; isNumeric: boolean; isOnly: boolean;
}) {
  const color = isBest ? '#00fff7' : '#4b5563';
  const barColor = isBest ? '#00fff7' : '#1f2937';

  return (
    <div className="flex flex-col gap-1.5 px-4 py-3">
      <div className="flex items-center gap-2 flex-wrap">
        {isBest && !isOnly && (
          <span className="text-[8px] font-mono text-neon-cyan opacity-80">▲</span>
        )}
        <span
          className="font-mono text-xs font-semibold"
          style={{
            color,
            textShadow: isBest && !isOnly ? '0 0 12px rgba(0,255,247,0.4)' : undefined,
          }}
        >
          {val}
        </span>
        {isBest && !isOnly && diffPct !== null && diffPct >= 5 && (
          <span
            className="font-mono text-[9px] px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(0,255,247,0.1)', color: '#00fff7', border: '1px solid rgba(0,255,247,0.2)' }}
          >
            %{diffPct} üstün
          </span>
        )}
      </div>
      {isNumeric && (
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${barPct}%`,
              background: barColor,
              boxShadow: isBest ? '0 0 6px rgba(0,255,247,0.5)' : undefined,
            }}
          />
        </div>
      )}
    </div>
  );
}

// ─── page ────────────────────────────────────────────────────────────────────

export default async function ComparePage({ searchParams }: PageProps) {
  const rawIds = (searchParams.ids ?? '').split(',').filter(Boolean).slice(0, 4);
  if (rawIds.length < 2) redirect('/categories');

  const products = await getProductsByIds(rawIds).catch(() => [] as Product[]);
  if (products.length < 2) redirect('/categories');

  incrementCompareCount(products.map((p) => p.id)).catch(() => null);

  // Collect ordered spec keys
  const specKeyOrder: string[] = [];
  const seenKeys = new Set<string>();
  for (const p of products) {
    for (const k of Object.keys(getSpecs(p))) {
      if (!seenKeys.has(k)) { seenKeys.add(k); specKeyOrder.push(k); }
    }
  }

  const specsPerProduct = products.map(getSpecs);
  const scores = computeScores(specKeyOrder, specsPerProduct, products.length);

  // Overall winner: highest score, then tiebreak by price (cheapest)
  const overallWinnerIdx = scores.reduce((best, s, i) => {
    if (s.score > scores[best].score) return i;
    if (s.score === scores[best].score) {
      const pa = products[best].price_min ?? Infinity;
      const pb = products[i].price_min ?? Infinity;
      return pb < pa ? i : best;
    }
    return best;
  }, 0);

  const prices = products.map((p) => p.price_min);
  const validPrices = prices.filter((p): p is number => p !== null);
  const minPrice = validPrices.length ? Math.min(...validPrices) : null;
  const cheapestIdx = minPrice !== null ? prices.indexOf(minPrice) : null;

  // Value score: spec_score / price * factor (higher = better value)
  const valueScores = products.map((p, i) => {
    if (!p.price_min || p.price_min === 0) return 0;
    return (scores[i].score / p.price_min) * 10000;
  });
  const bestValueIdx = valueScores.indexOf(Math.max(...valueScores));

  const productNames = products.map((p) => (p.brand ? `${p.brand} ${p.name}` : p.name));
  const shareUrl = `/compare?ids=${rawIds.join(',')}`;

  const gridCols = `160px repeat(${products.length}, 1fr)`;
  const LABEL_STYLE: React.CSSProperties = {
    background: '#09090f',
    borderRight: '1px solid rgba(196,154,60,0.06)',
  };
  const ROW_BORDER: React.CSSProperties = { borderBottom: '1px solid rgba(255,255,255,0.03)' };

  return (
    <main className="min-h-screen bg-grid pb-24" style={{ paddingTop: '88px' }}>
      <CompareHistorySaver ids={products.map((p) => p.id)} names={productNames} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 font-mono text-[10px] text-gray-700 uppercase tracking-wider mb-6">
          <Link href="/" className="hover:text-neon-cyan transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-neon-cyan transition-colors">Kategoriler</Link>
          <span>/</span>
          <span className="text-neon-purple">Karşılaştırma</span>
        </nav>

        {/* Title */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg,rgba(196,154,60,0.3),transparent)' }} />
          <h1 className="font-orbitron text-[11px] uppercase tracking-[0.4em] font-black text-neon-cyan">
            {products.length} Ürün Karşılaştırması
          </h1>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(270deg,rgba(196,154,60,0.3),transparent)' }} />
        </div>

        {/* ── Winner Banner ── */}
        {scores.some((s) => s.total > 0) && (
          <div
            className="rounded-xl px-6 py-4 mb-6 flex items-center gap-5 flex-wrap"
            style={{
              background: 'linear-gradient(135deg, rgba(0,255,247,0.06) 0%, rgba(183,36,255,0.04) 100%)',
              border: '1px solid rgba(0,255,247,0.15)',
              boxShadow: '0 0 40px rgba(0,255,247,0.06)',
            }}
          >
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-1">
                Genel Karşılaştırma Sonucu
              </p>
              <p className="font-orbitron text-lg font-black text-white leading-tight">
                <span style={{ color: '#00fff7' }}>{productNames[overallWinnerIdx]}</span>
                {' '}
                <span className="text-gray-500 text-sm font-normal">öne çıkıyor</span>
              </p>
              <p className="font-mono text-xs text-gray-600 mt-1">
                {scores[overallWinnerIdx].wins} / {scores[overallWinnerIdx].total} spec'te daha iyi
                {products.length === 2 && scores[overallWinnerIdx].total > 0 && (
                  <span className="ml-2 text-neon-cyan">
                    (%{Math.round((scores[overallWinnerIdx].wins / scores[overallWinnerIdx].total) * 100)} üstünlük)
                  </span>
                )}
              </p>
            </div>
            {/* Mini scores */}
            <div className="flex items-center gap-4 flex-shrink-0">
              {products.map((p, i) => {
                const isWinner = i === overallWinnerIdx;
                return (
                  <div key={p.id} className="flex flex-col items-center gap-1">
                    <ScoreRing score={scores[i].score} size={60} />
                    <span
                      className="font-mono text-[9px] uppercase tracking-wider text-center max-w-[70px] truncate"
                      style={{ color: isWinner ? '#00fff7' : '#4b5563' }}
                    >
                      {p.brand ?? p.name.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Product Header Cards ── */}
        <div
          className="grid rounded-t-xl overflow-hidden"
          style={{ gridTemplateColumns: gridCols, border: '1px solid rgba(196,154,60,0.1)', borderBottom: 'none' }}
        >
          {/* Label column header */}
          <div className="px-4 py-5 flex items-end" style={LABEL_STYLE}>
            <span className="font-mono text-[9px] uppercase tracking-widest text-gray-700">Özellikler</span>
          </div>

          {products.map((product, i) => {
            const isCheapest = product.price_min !== null && product.price_min === minPrice && validPrices.length > 0;
            const isWinner = i === overallWinnerIdx && scores[i].total > 0;
            const s = scores[i];

            return (
              <div
                key={product.id}
                className="px-4 py-5 flex flex-col gap-2"
                style={{
                  background: isWinner ? 'rgba(0,255,247,0.03)' : isCheapest ? 'rgba(196,154,60,0.03)' : '#0c0c18',
                  borderLeft: i > 0 ? '1px solid rgba(196,154,60,0.06)' : undefined,
                  borderTop: isWinner
                    ? '2px solid rgba(0,255,247,0.5)'
                    : isCheapest
                    ? '2px solid rgba(196,154,60,0.4)'
                    : '2px solid transparent',
                }}
              >
                {/* Badges */}
                <div className="flex gap-2 flex-wrap min-h-[20px]">
                  {isWinner && s.total > 0 && (
                    <span className="font-mono text-[8px] uppercase tracking-[0.25em] px-2 py-0.5 rounded"
                      style={{ background: 'rgba(0,255,247,0.12)', color: '#00fff7', border: '1px solid rgba(0,255,247,0.3)' }}>
                      ◆ Kazanan
                    </span>
                  )}
                  {isCheapest && !isWinner && (
                    <span className="font-mono text-[8px] uppercase tracking-[0.25em]" style={{ color: '#C49A3C' }}>
                      ◆ En Uygun
                    </span>
                  )}
                </div>

                {/* Image */}
                {product.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.image_url} alt={product.name} className="w-full aspect-video object-cover rounded-lg" />
                ) : (
                  <div className="w-full aspect-video rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(196,154,60,0.04)', border: '1px solid rgba(196,154,60,0.08)' }}>
                    <span className="text-2xl opacity-20">◈</span>
                  </div>
                )}

                {product.brand && (
                  <p className="font-mono text-[9px] uppercase tracking-widest" style={{ color: '#8B9BAC' }}>{product.brand}</p>
                )}
                <Link href={`/products/${product.slug}`}>
                  <h2 className="font-orbitron text-xs font-bold text-white leading-snug hover:text-neon-cyan transition-colors">
                    {product.name}
                  </h2>
                </Link>

                {/* Price */}
                {product.price_min && (
                  <p className="font-orbitron text-base font-black" style={{ color: isWinner ? '#00fff7' : isCheapest ? '#C49A3C' : '#9ca3af' }}>
                    ₺{product.price_min.toLocaleString('tr-TR')}
                  </p>
                )}

                {/* Score ring */}
                {s.total > 0 && (
                  <div className="flex items-center gap-3 mt-1 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <ScoreRing score={s.score} size={52} />
                    <div>
                      <p className="font-mono text-[10px] text-gray-600">{s.wins} kazanılan</p>
                      <p className="font-mono text-[10px] text-gray-700">{s.total - s.wins} kaybedilen</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Spec Table ── */}
        <div className="rounded-b-xl overflow-hidden" style={{ border: '1px solid rgba(196,154,60,0.1)' }}>

          {/* Price range row */}
          {products.some((p) => p.price_max && p.price_max !== p.price_min) && (
            <div className="grid" style={{ gridTemplateColumns: gridCols, ...ROW_BORDER }}>
              <div className="px-4 py-3 flex items-center" style={LABEL_STYLE}>
                <span className="font-mono text-[10px] text-gray-600 uppercase tracking-wider">Fiyat Aralığı</span>
              </div>
              {products.map((p, i) => (
                <div key={p.id} className="px-4 py-3"
                  style={{ borderLeft: i > 0 ? '1px solid rgba(196,154,60,0.04)' : undefined }}>
                  {p.price_max && p.price_max !== p.price_min ? (
                    <span className="font-mono text-xs text-gray-500">
                      ₺{p.price_min?.toLocaleString('tr-TR')} – ₺{p.price_max.toLocaleString('tr-TR')}
                    </span>
                  ) : (
                    <span className="font-mono text-xs text-gray-700">—</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Spec rows */}
          {specKeyOrder.map((key, rowIdx) => {
            const values = specsPerProduct.map((s) => s[key] ?? '—');
            const allSame = values.every((v) => v === values[0]);
            const { bestIdx, bars, diffPct, isNumeric } = analyzeSpec(key, values);

            return (
              <div
                key={key}
                className="grid"
                style={{
                  gridTemplateColumns: gridCols,
                  background: rowIdx % 2 === 0 ? '#09090f' : '#0b0b15',
                  ...(rowIdx < specKeyOrder.length - 1 ? ROW_BORDER : {}),
                }}
              >
                {/* Label */}
                <div className="px-4 py-3 flex items-start pt-3.5" style={LABEL_STYLE}>
                  <span className="font-mono text-[10px] text-gray-600 uppercase tracking-wider leading-tight">
                    {key}
                  </span>
                </div>

                {/* Values */}
                {values.map((val, i) => {
                  const isBest = !allSame && bestIdx === i && val !== '—';
                  return (
                    <div
                      key={i}
                      style={{ borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.03)' : undefined }}
                    >
                      <BarCell
                        val={val}
                        barPct={bars[i] ?? 0}
                        isBest={isBest}
                        diffPct={isBest ? diffPct : null}
                        isNumeric={isNumeric}
                        isOnly={allSame}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}

          {specKeyOrder.length === 0 && (
            <div className="py-10 text-center">
              <p className="font-mono text-xs text-gray-700">Bu ürünler için detaylı spec verisi henüz eklenmemiş.</p>
            </div>
          )}
        </div>

        {/* ── Karar Asistanı ── */}
        <div className="mt-8 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(183,36,255,0.15)' }}>
          <div className="px-6 py-4" style={{ background: 'rgba(183,36,255,0.04)', borderBottom: '1px solid rgba(183,36,255,0.1)' }}>
            <h2 className="font-orbitron text-xs text-neon-purple uppercase tracking-widest">Karar Asistanı</h2>
            <p className="font-mono text-[10px] text-gray-600 mt-0.5">Önceliğinize göre hangi ürün sizin için daha iyi?</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[rgba(255,255,255,0.04)]"
            style={{ background: '#0a0a14' }}>

            {/* Bütçe */}
            <div className="px-5 py-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-[9px] px-2 py-1 rounded uppercase tracking-wider"
                  style={{ background: 'rgba(196,154,60,0.1)', color: '#C49A3C', border: '1px solid rgba(196,154,60,0.2)' }}>
                  ◆ Bütçe Bilinçli
                </span>
              </div>
              <p className="font-orbitron text-sm font-bold text-white mb-1">
                {cheapestIdx !== null ? productNames[cheapestIdx] : productNames[0]}
              </p>
              <p className="font-mono text-[10px] text-gray-600 leading-relaxed">
                {cheapestIdx !== null && products[cheapestIdx].price_min ? (
                  <>
                    ₺{products[cheapestIdx].price_min!.toLocaleString('tr-TR')} ile en uygun fiyatlı seçenek.
                    {validPrices.length >= 2 && (() => {
                      const sortedPrices = [...validPrices].sort((a, b) => a - b);
                      const diff = sortedPrices[1] - sortedPrices[0];
                      return diff > 0 ? ` En yakın rakibe göre ₺${diff.toLocaleString('tr-TR')} daha ucuz.` : '';
                    })()}
                  </>
                ) : 'Fiyat bilgisi mevcut değil.'}
              </p>
            </div>

            {/* Performans */}
            <div className="px-5 py-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-[9px] px-2 py-1 rounded uppercase tracking-wider"
                  style={{ background: 'rgba(0,255,247,0.08)', color: '#00fff7', border: '1px solid rgba(0,255,247,0.2)' }}>
                  ▲ Performans Odaklı
                </span>
              </div>
              <p className="font-orbitron text-sm font-bold text-white mb-1">
                {productNames[overallWinnerIdx]}
              </p>
              <p className="font-mono text-[10px] text-gray-600 leading-relaxed">
                {scores[overallWinnerIdx].total > 0 ? (
                  <>
                    {scores[overallWinnerIdx].total} teknik karşılaştırmada{' '}
                    {scores[overallWinnerIdx].wins}&apos;ini kazanıyor (%{scores[overallWinnerIdx].score} oranında üstün).
                    Teknik özellikler önceliğinizse bu seçenek öne çıkıyor.
                  </>
                ) : 'Yeterli spec verisi bulunamadı.'}
              </p>
            </div>

            {/* En İyi Değer */}
            <div className="px-5 py-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-[9px] px-2 py-1 rounded uppercase tracking-wider"
                  style={{ background: 'rgba(16,185,129,0.08)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>
                  ⬡ En İyi Değer
                </span>
              </div>
              <p className="font-orbitron text-sm font-bold text-white mb-1">
                {productNames[bestValueIdx]}
              </p>
              <p className="font-mono text-[10px] text-gray-600 leading-relaxed">
                {products[bestValueIdx].price_min && scores[bestValueIdx].total > 0 ? (
                  <>
                    Fiyat–performans dengesi en iyi bu ürün. ₺{products[bestValueIdx].price_min!.toLocaleString('tr-TR')}&apos;a
                    {' '}{scores[bestValueIdx].wins} spec galibiyeti — paranın karşılığı açısından öne çıkıyor.
                  </>
                ) : 'Karşılaştırma için yeterli veri yok.'}
              </p>
            </div>
          </div>
        </div>

        {/* ── Share & Actions ── */}
        <div className="mt-6 rounded-xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{ background: '#0c0c18', border: '1px solid rgba(196,154,60,0.1)' }}>
          <div className="flex-1">
            <p className="font-mono text-[10px] text-gray-600 uppercase tracking-wider mb-2">Bu Karşılaştırmayı Paylaş</p>
            <div className="flex items-center gap-3 flex-wrap">
              <CompareCopyLink url={shareUrl} />
              <ShareButtons
                title={`${productNames.join(' vs ')} — Compario`}
                url={shareUrl}
              />
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/categories" className="btn-neon-purple">
            ← Yeni Karşılaştırma
          </Link>
          {products.map((p) => (
            <Link key={p.id} href={`/products/${p.slug}`} className="btn-neon text-xs">
              {p.brand} {p.name} →
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
