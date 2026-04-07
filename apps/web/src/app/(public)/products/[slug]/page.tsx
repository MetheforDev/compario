import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlug, getProducts, getNewsForProduct, incrementViewCount } from '@compario/database';
import type { Json, Product, NewsArticle } from '@compario/database';
import { ShareButtons } from '@/components/ShareButtons';
import { AddToCompareButton } from '@/components/AddToCompareButton';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const product = await getProductBySlug(params.slug);
    if (!product) return { title: 'Ürün Bulunamadı' };
    const title = product.meta_title ?? product.name;
    const description =
      product.meta_description ??
      `${product.name} özellikleri, fiyatı ve karşılaştırması — Compario`;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: product.image_url ? [{ url: product.image_url }] : [],
        type: 'website',
      },
      twitter: {
        card: product.image_url ? 'summary_large_image' : 'summary',
        title,
        description,
        images: product.image_url ? [product.image_url] : [],
      },
    };
  } catch {
    return { title: 'Ürün' };
  }
}

function SpecsTable({ specs }: { specs: Json }) {
  if (!specs || typeof specs !== 'object' || Array.isArray(specs)) return null;
  const entries = Object.entries(specs as Record<string, Json>);
  if (entries.length === 0) return null;

  return (
    <section
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid rgba(196,154,60,0.1)', background: '#0a0a14' }}
    >
      <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(196,154,60,0.08)', background: '#0d0d18' }}>
        <h2 className="font-orbitron text-[10px] uppercase tracking-[0.3em] text-neon-cyan opacity-70">
          ⬡ Teknik Özellikler
        </h2>
      </div>
      <dl className="px-6 divide-y divide-[rgba(0,255,247,0.04)]">
        {entries.map(([key, value]) => (
          <div key={key} className="flex gap-4 py-3">
            <dt className="font-mono text-[10px] text-gray-600 uppercase tracking-wider w-40 flex-shrink-0 self-center">
              {key.replace(/_/g, ' ')}
            </dt>
            <dd className="font-mono text-xs text-gray-400 flex-1">{String(value ?? '—')}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

async function RelatedProducts({ categoryId, currentId }: { categoryId: string; currentId: string }) {
  const all = await getProducts({ status: 'active', limit: 8 }).catch(() => [] as Product[]);
  const related = all.filter((p) => p.id !== currentId && p.category_id === categoryId).slice(0, 3);
  if (related.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-4 mb-6">
        <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(196,154,60,0.2), transparent)' }} />
        <h2 className="font-orbitron text-[10px] uppercase tracking-[0.3em] text-neon-cyan opacity-70 whitespace-nowrap">
          Benzer Ürünler
        </h2>
        <div className="h-px flex-1" style={{ background: 'linear-gradient(270deg, rgba(196,154,60,0.2), transparent)' }} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {related.map((p) => (
          <Link
            key={p.id}
            href={`/products/${p.slug}`}
            className="group flex flex-col rounded-xl overflow-hidden border transition-all"
            style={{ background: '#0f0f1a', borderColor: 'rgba(196,154,60,0.08)' }}
          >
            <div className="aspect-video w-full bg-[#0c0c16] flex items-center justify-center overflow-hidden">
              {p.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <span className="text-3xl opacity-10">◈</span>
              )}
            </div>
            <div className="px-4 py-4 flex flex-col gap-1">
              {p.brand && <p className="font-mono text-[9px] uppercase tracking-widest text-gray-600">{p.brand}</p>}
              <h3 className="font-orbitron text-xs font-bold text-gray-300 line-clamp-2 group-hover:text-neon-cyan transition-colors">{p.name}</h3>
              {p.price_min && (
                <p className="font-orbitron text-sm font-black" style={{ color: '#C49A3C' }}>
                  ₺{p.price_min.toLocaleString('tr-TR')}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default async function ProductPage({ params }: PageProps) {
  const product = await getProductBySlug(params.slug).catch(() => null);
  if (!product) notFound();

  incrementViewCount(product.id).catch(() => null);

  const relatedNews = await getNewsForProduct(product.id).catch(() => [] as NewsArticle[]);

  const productPath = `/products/${product.slug}`;
  const shareTitle = `${product.brand ? `${product.brand} ` : ''}${product.name} — Compario`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? product.short_description ?? '',
    brand: { '@type': 'Brand', name: product.brand ?? 'Compario' },
    image: product.image_url ? [product.image_url] : [],
    sku: product.slug,
    url: `https://compario.tech${productPath}`,
    ...(product.price_min ? {
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: product.currency ?? 'TRY',
        lowPrice: product.price_min,
        highPrice: product.price_max ?? product.price_min,
        offerCount: 1,
      },
    } : {}),
  };

  return (
    <main className="min-h-screen bg-grid pb-24" style={{ paddingTop: '88px' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {product.image_url && (
        <div className="relative w-full h-[260px] sm:h-[380px] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to bottom, rgba(8,9,14,0.2) 0%, transparent 40%, rgba(8,9,14,0.95) 100%)',
          }} />
          {product.brand && (
            <div className="absolute top-5 left-5">
              <span className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded"
                style={{ background: 'rgba(8,9,14,0.85)', color: '#C49A3C', border: '1px solid rgba(196,154,60,0.3)' }}>
                {product.brand}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        <nav className="flex items-center gap-2 font-mono text-[10px] text-gray-700 uppercase tracking-wider py-5">
          <Link href="/" className="hover:text-neon-cyan transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-neon-cyan transition-colors">Ürünler</Link>
          <span>/</span>
          <span className="text-gray-500">{product.name}</span>
        </nav>

        <div className="rounded-xl p-6 sm:p-8 mb-6"
          style={{ background: '#0c0c18', border: '1px solid rgba(196,154,60,0.12)' }}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="flex-1">
              {product.brand && (
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] mb-2" style={{ color: '#8B9BAC' }}>
                  {product.brand}{product.model_year ? ` · ${product.model_year}` : ''}
                </p>
              )}
              <h1 className="font-orbitron text-2xl sm:text-3xl font-black text-white leading-tight mb-2">
                {product.name}
              </h1>
              {product.model && (
                <p className="font-mono text-xs text-gray-600">Model: {product.model}</p>
              )}
              {product.short_description && (
                <p className="font-mono text-sm text-gray-500 mt-3 leading-relaxed">{product.short_description}</p>
              )}
            </div>
            <div className="flex flex-col items-start sm:items-end gap-3 flex-shrink-0">
              {product.price_min && (
                <div className="sm:text-right">
                  <p className="font-orbitron text-2xl font-black" style={{ color: '#C49A3C' }}>
                    ₺{product.price_min.toLocaleString('tr-TR')}
                  </p>
                  {product.price_max && product.price_max !== product.price_min && (
                    <p className="font-mono text-xs text-gray-600">
                      — ₺{product.price_max.toLocaleString('tr-TR')}
                    </p>
                  )}
                </div>
              )}
              <span className="font-mono text-[10px] uppercase tracking-widest px-3 py-1 rounded border"
                style={product.status === 'active'
                  ? { borderColor: 'rgba(34,197,94,0.4)', color: '#22c55e' }
                  : { borderColor: 'rgba(107,114,128,0.3)', color: '#6b7280' }}>
                {product.status === 'active' ? 'Aktif' : product.status}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t"
            style={{ borderColor: 'rgba(196,154,60,0.08)' }}>
            <AddToCompareButton
              id={product.id}
              name={product.name}
              brand={product.brand}
              image={product.image_url}
            />
            <Link href="/products" className="btn-neon-purple text-xs">
              ← Ürünlere Dön
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <SpecsTable specs={product.specs} />
        </div>

        {product.description && (
          <div className="rounded-xl p-6 mb-6"
            style={{ background: '#0c0c18', border: '1px solid rgba(196,154,60,0.08)' }}>
            <h2 className="font-orbitron text-[10px] uppercase tracking-[0.3em] text-neon-cyan opacity-70 mb-4">
              Açıklama
            </h2>
            <p className="font-mono text-sm text-gray-400 leading-relaxed">{product.description}</p>
          </div>
        )}

        <div className="rounded-xl px-6 py-4 mb-10"
          style={{ background: '#0c0c18', border: '1px solid rgba(196,154,60,0.08)' }}>
          <ShareButtons title={shareTitle} url={productPath} />
        </div>

        {relatedNews.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(183,36,255,0.2), transparent)' }} />
              <h2 className="font-orbitron text-[10px] uppercase tracking-[0.4em] text-neon-purple opacity-70 whitespace-nowrap">
                İlgili Haberler
              </h2>
              <div className="h-px flex-1" style={{ background: 'linear-gradient(270deg, rgba(183,36,255,0.2), transparent)' }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedNews.map((article) => (
                <Link
                  key={article.id}
                  href={`/news/${article.slug}`}
                  className="group flex gap-4 rounded-xl border p-4 transition-all hover:-translate-y-px"
                  style={{ background: '#0c0c18', borderColor: 'rgba(183,36,255,0.1)' }}
                >
                  {article.cover_image && (
                    <div className="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={article.cover_image} alt={article.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-orbitron text-xs font-bold text-gray-300 line-clamp-2 group-hover:text-neon-purple transition-colors leading-snug">
                      {article.title}
                    </p>
                    {article.published_at && (
                      <p className="font-mono text-[9px] text-gray-700 mt-1.5">
                        {new Date(article.published_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <RelatedProducts categoryId={product.category_id} currentId={product.id} />
      </div>
    </main>
  );
}
