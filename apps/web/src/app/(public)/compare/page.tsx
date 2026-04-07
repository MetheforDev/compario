import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getProductsByIds, incrementCompareCount } from '@compario/database';
import type { Product, Json } from '@compario/database';
import { ShareButtons } from '@/components/ShareButtons';
import { CompareHistorySaver } from '@/components/CompareHistorySaver';

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
    openGraph: {
      title,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title, images: [ogImageUrl] },
  };
}

function getSpecs(product: Product): Record<string, string> {
  if (!product.specs || typeof product.specs !== 'object' || Array.isArray(product.specs)) return {};
  return Object.fromEntries(
    Object.entries(product.specs as Record<string, Json>).map(([k, v]) => [k, String(v ?? '—')]),
  );
}

function tryParseNumber(val: string): number | null {
  const n = parseFloat(val.replace(/[^0-9.,]/g, '').replace(',', '.'));
  return isNaN(n) ? null : n;
}

// For a spec key, determine which index has the "best" value.
// Higher = better by default; special keys where lower is better.
const LOWER_BETTER_KEYWORDS = ['tüketim', 'yakıt', '0-100', 'ağırlık', 'kg', 'saniye', 'sn', 'litre', 'l/100'];

function getBestIndex(key: string, values: string[]): number | null {
  const nums = values.map(tryParseNumber);
  if (nums.some((n) => n === null)) return null;
  const lowerBetter = LOWER_BETTER_KEYWORDS.some((kw) => key.toLowerCase().includes(kw));
  const best = lowerBetter ? Math.min(...(nums as number[])) : Math.max(...(nums as number[]));
  const idx = nums.indexOf(best);
  return idx;
}

export default async function ComparePage({ searchParams }: PageProps) {
  const rawIds = (searchParams.ids ?? '').split(',').filter(Boolean).slice(0, 4);
  if (rawIds.length < 2) redirect('/categories');

  const products = await getProductsByIds(rawIds).catch(() => [] as Product[]);
  if (products.length < 2) redirect('/categories');

  // Fire-and-forget: increment compare_count for each product
  incrementCompareCount(products.map((p) => p.id)).catch(() => null);

  // Collect all spec keys preserving order
  const specKeyOrder: string[] = [];
  const seenKeys = new Set<string>();
  for (const p of products) {
    const specs = getSpecs(p);
    for (const k of Object.keys(specs)) {
      if (!seenKeys.has(k)) { seenKeys.add(k); specKeyOrder.push(k); }
    }
  }

  const specsPerProduct = products.map(getSpecs);

  // Price comparison — find lowest price index
  const prices = products.map((p) => p.price_min);
  const minPrice = Math.min(...prices.filter((p): p is number => p !== null));

  const productNames = products.map((p) => p.brand ? `${p.brand} ${p.name}` : p.name);

  return (
    <main className="min-h-screen bg-grid pb-24" style={{ paddingTop: '88px' }}>
      <CompareHistorySaver ids={products.map((p) => p.id)} names={productNames} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 font-mono text-[10px] text-gray-700 uppercase tracking-wider mb-6">
            <Link href="/" className="hover:text-neon-cyan transition-colors">Ana Sayfa</Link>
            <span>/</span>
            <Link href="/categories" className="hover:text-neon-cyan transition-colors">Kategoriler</Link>
            <span>/</span>
            <span className="text-neon-purple">Karşılaştırma</span>
          </nav>

          <div className="flex items-center gap-4">
            <div
              className="h-px flex-1"
              style={{ background: 'linear-gradient(90deg, rgba(196,154,60,0.3), transparent)' }}
            />
            <h1 className="font-orbitron text-[11px] uppercase tracking-[0.4em] font-black text-neon-cyan">
              {products.length} Ürün Karşılaştırması
            </h1>
            <div
              className="h-px flex-1"
              style={{ background: 'linear-gradient(270deg, rgba(196,154,60,0.3), transparent)' }}
            />
          </div>
        </div>

        {/* Product header cards */}
        <div
          className="grid gap-0 mb-0 rounded-t-xl overflow-hidden"
          style={{
            gridTemplateColumns: `180px repeat(${products.length}, 1fr)`,
            border: '1px solid rgba(196,154,60,0.1)',
            borderBottom: 'none',
          }}
        >
          {/* Empty label cell */}
          <div
            className="px-4 py-5 flex items-end"
            style={{ background: '#0a0a14', borderRight: '1px solid rgba(196,154,60,0.06)' }}
          >
            <span className="font-mono text-[9px] uppercase tracking-widest text-gray-700">
              Özellikler
            </span>
          </div>

          {products.map((product, i) => {
            const isCheapest = product.price_min !== null && product.price_min === minPrice;
            return (
              <div
                key={product.id}
                className="px-4 py-5 flex flex-col gap-2"
                style={{
                  background: isCheapest ? 'rgba(196,154,60,0.04)' : '#0c0c18',
                  borderLeft: i > 0 ? '1px solid rgba(196,154,60,0.06)' : undefined,
                  borderTop: isCheapest ? '2px solid rgba(196,154,60,0.4)' : '2px solid transparent',
                }}
              >
                {isCheapest && (
                  <span
                    className="font-mono text-[8px] uppercase tracking-[0.3em]"
                    style={{ color: '#C49A3C' }}
                  >
                    ◆ En Uygun
                  </span>
                )}
                {product.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full aspect-video object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full aspect-video rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(196,154,60,0.04)', border: '1px solid rgba(196,154,60,0.08)' }}>
                    <span className="text-2xl opacity-20">◈</span>
                  </div>
                )}
                {product.brand && (
                  <p className="font-mono text-[9px] uppercase tracking-widest" style={{ color: '#8B9BAC' }}>
                    {product.brand}
                  </p>
                )}
                <Link href={`/products/${product.slug}`}>
                  <h2 className="font-orbitron text-xs font-bold text-white leading-snug hover:text-neon-cyan transition-colors">
                    {product.name}
                  </h2>
                </Link>
                {product.price_min && (
                  <p
                    className="font-orbitron text-base font-black"
                    style={{ color: isCheapest ? '#C49A3C' : '#9ca3af' }}
                  >
                    ₺{product.price_min.toLocaleString('tr-TR')}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Spec rows */}
        <div
          className="rounded-b-xl overflow-hidden"
          style={{ border: '1px solid rgba(196,154,60,0.1)' }}
        >
          {/* Price range row */}
          {products.some((p) => p.price_max && p.price_max !== p.price_min) && (
            <div
              className="grid"
              style={{
                gridTemplateColumns: `180px repeat(${products.length}, 1fr)`,
                borderBottom: '1px solid rgba(196,154,60,0.05)',
              }}
            >
              <div className="px-4 py-3 flex items-center"
                style={{ background: '#09090f', borderRight: '1px solid rgba(196,154,60,0.06)' }}>
                <span className="font-mono text-[10px] text-gray-600 uppercase tracking-wider">Fiyat Aralığı</span>
              </div>
              {products.map((p, i) => (
                <div key={p.id} className="px-4 py-3"
                  style={{ borderLeft: i > 0 ? '1px solid rgba(196,154,60,0.05)' : undefined }}>
                  {p.price_max && p.price_max !== p.price_min ? (
                    <span className="font-mono text-xs text-gray-500">
                      ₺{p.price_min?.toLocaleString('tr-TR')} — ₺{p.price_max.toLocaleString('tr-TR')}
                    </span>
                  ) : (
                    <span className="font-mono text-xs text-gray-700">—</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Dynamic spec rows */}
          {specKeyOrder.map((key, rowIdx) => {
            const values = specsPerProduct.map((s) => s[key] ?? '—');
            const allSame = values.every((v) => v === values[0]);
            const bestIdx = allSame ? null : getBestIndex(key, values);

            return (
              <div
                key={key}
                className="grid"
                style={{
                  gridTemplateColumns: `180px repeat(${products.length}, 1fr)`,
                  background: rowIdx % 2 === 0 ? '#09090f' : '#0b0b15',
                  borderBottom: rowIdx < specKeyOrder.length - 1
                    ? '1px solid rgba(196,154,60,0.04)'
                    : undefined,
                }}
              >
                {/* Label */}
                <div
                  className="px-4 py-3 flex items-center"
                  style={{ borderRight: '1px solid rgba(196,154,60,0.06)' }}
                >
                  <span className="font-mono text-[10px] text-gray-600 uppercase tracking-wider">
                    {key}
                  </span>
                </div>

                {/* Values */}
                {values.map((val, i) => {
                  const isBest = bestIdx === i && val !== '—';
                  return (
                    <div
                      key={i}
                      className="px-4 py-3 flex items-center"
                      style={{ borderLeft: i > 0 ? '1px solid rgba(196,154,60,0.04)' : undefined }}
                    >
                      <span
                        className="font-mono text-xs"
                        style={{
                          color: isBest ? '#C49A3C' : val === '—' ? '#374151' : '#9ca3af',
                          textShadow: isBest ? '0 0 12px rgba(196,154,60,0.3)' : undefined,
                          fontWeight: isBest ? 600 : undefined,
                        }}
                      >
                        {isBest && <span className="mr-1 text-[9px]">▲</span>}
                        {val}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {specKeyOrder.length === 0 && (
            <div className="py-8 text-center font-mono text-xs text-gray-700">
              Bu ürünler için detaylı spec verisi henüz eklenmemiş.
            </div>
          )}
        </div>

        {/* Actions + Share */}
        <div className="mt-8 space-y-4">
          {/* Share row */}
          <div className="rounded-xl px-6 py-4"
            style={{ background: '#0c0c18', border: '1px solid rgba(196,154,60,0.1)' }}>
            <ShareButtons
              title={`${products.map((p) => p.brand ? `${p.brand} ${p.name}` : p.name).join(' vs ')} — Compario`}
              url={`/compare?ids=${rawIds.join(',')}`}
            />
          </div>

          {/* Nav buttons */}
          <div className="flex flex-wrap gap-3">
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
      </div>
    </main>
  );
}
