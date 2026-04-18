import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getTrendingProducts, getTopProductsByViews } from '@compario/database';
import type { Product } from '@compario/database';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Trend Ürünler | Compario',
  description: 'En çok karşılaştırılan ve en çok görüntülenen ürünler. Compario trend listesi.',
};

function ProductRow({ product, rank, metric, metricLabel, color }: {
  product: Product;
  rank: number;
  metric: number;
  metricLabel: string;
  color: string;
}) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex items-center gap-4 px-5 py-4 rounded-xl border transition-all duration-200 hover:-translate-y-px"
      style={{
        background: rank === 1 ? 'rgba(196,154,60,0.05)' : '#0c0c18',
        borderColor: rank === 1 ? 'rgba(196,154,60,0.25)' : 'rgba(196,154,60,0.08)',
      }}
    >
      {/* Rank */}
      <span
        className="font-orbitron text-xl font-black w-9 flex-shrink-0 text-right"
        style={{ color: rank <= 3 ? color : 'rgba(196,154,60,0.2)' }}
      >
        {rank}
      </span>

      {/* Image */}
      <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-[#0a0a14] flex items-center justify-center flex-shrink-0"
        style={{ border: '1px solid rgba(196,154,60,0.08)' }}>
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="64px" />
        ) : (
          <span className="text-lg opacity-10">◈</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {product.brand && (
          <p className="font-mono text-[9px] uppercase tracking-widest text-gray-600">{product.brand}</p>
        )}
        <p className="font-orbitron text-sm font-bold text-gray-200 truncate group-hover:text-neon-cyan transition-colors">
          {product.name}
        </p>
        {product.price_min && (
          <p className="font-orbitron text-xs font-black" style={{ color: '#C49A3C' }}>
            ₺{product.price_min.toLocaleString('tr-TR')}
          </p>
        )}
      </div>

      {/* Metric */}
      <div className="flex flex-col items-end flex-shrink-0">
        <span className="font-orbitron text-lg font-black" style={{ color }}>
          {metric.toLocaleString('tr-TR')}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-wider text-gray-700">{metricLabel}</span>
      </div>

      <span className="font-mono text-[10px] text-gray-700 group-hover:text-neon-cyan transition-colors flex-shrink-0">→</span>
    </Link>
  );
}

export default async function TrendingPage() {
  const [byCompares, byViews] = await Promise.all([
    getTrendingProducts(20).catch(() => [] as Product[]),
    getTopProductsByViews(20).catch(() => [] as Product[]),
  ]);

  return (
    <main className="min-h-screen bg-grid pb-24" style={{ paddingTop: '88px' }}>
      {/* Hero */}
      <section className="relative px-4 pt-16 pb-12 text-center">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full blur-[120px] opacity-8 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #C49A3C 0%, transparent 70%)' }}
        />
        <div className="relative z-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] mb-4" style={{ color: 'rgba(196,154,60,0.6)' }}>
            ⬡ Compario
          </p>
          <h1 className="font-orbitron text-4xl sm:text-5xl font-black mb-3" style={{ color: '#C49A3C' }}>
            TREND
          </h1>
          <p className="font-mono text-sm text-gray-500 max-w-lg mx-auto">
            En çok karşılaştırılan ve en çok incelenen ürünler
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* En çok karşılaştırılan */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(196,154,60,0.3), transparent)' }} />
              <h2 className="font-orbitron text-[10px] uppercase tracking-[0.4em] whitespace-nowrap" style={{ color: '#C49A3C' }}>
                En Çok Karşılaştırılan
              </h2>
              <div className="h-px flex-1" style={{ background: 'linear-gradient(270deg, rgba(196,154,60,0.3), transparent)' }} />
            </div>

            {byCompares.length === 0 ? (
              <div className="text-center py-16 font-mono text-xs text-gray-700 border border-[rgba(196,154,60,0.06)] rounded-xl">
                Henüz karşılaştırma yapılmamış
              </div>
            ) : (
              <div className="space-y-3">
                {byCompares.map((p, i) => (
                  <ProductRow
                    key={p.id}
                    product={p}
                    rank={i + 1}
                    metric={p.compare_count ?? 0}
                    metricLabel="karşılaştırma"
                    color="#C49A3C"
                  />
                ))}
              </div>
            )}
          </section>

          {/* En çok görüntülenen */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(0,255,247,0.2), transparent)' }} />
              <h2 className="font-orbitron text-[10px] uppercase tracking-[0.4em] text-neon-cyan whitespace-nowrap">
                En Çok Görüntülenen
              </h2>
              <div className="h-px flex-1" style={{ background: 'linear-gradient(270deg, rgba(0,255,247,0.2), transparent)' }} />
            </div>

            {byViews.length === 0 ? (
              <div className="text-center py-16 font-mono text-xs text-gray-700 border border-[rgba(196,154,60,0.06)] rounded-xl">
                Henüz görüntülenme yok
              </div>
            ) : (
              <div className="space-y-3">
                {byViews.map((p, i) => (
                  <ProductRow
                    key={p.id}
                    product={p}
                    rank={i + 1}
                    metric={p.view_count ?? 0}
                    metricLabel="görüntülenme"
                    color="#00fff7"
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="mt-12 flex flex-wrap gap-3 justify-center">
          <Link href="/products" className="btn-neon">Tüm Ürünler →</Link>
          <Link href="/categories" className="btn-neon-purple">Kategoriler →</Link>
        </div>
      </div>
    </main>
  );
}
