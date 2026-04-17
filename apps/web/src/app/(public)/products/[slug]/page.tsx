import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 3600;
import { getProductBySlug, getProducts, getNewsForProduct, incrementViewCount, getApprovedReviews, getRatingSummary, getCategoryById } from '@compario/database';
import type { Json, Product, NewsArticle } from '@compario/database';
import dynamic from 'next/dynamic';
import { ShareButtons } from '@/components/ShareButtons';
import { AddToCompareButton } from '@/components/AddToCompareButton';
import { ProductReviews } from '@/components/ProductReviews';
import { PriceAlertButton } from '@/components/PriceAlertButton';

// dynamic + ssr:false removes recharts/victory-vendor/d3 (ESM-only) from server bundle
const PriceHistory = dynamic(
  () => import('@/components/PriceHistory').then((m) => m.PriceHistory),
  { ssr: false },
);

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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://compario.tech';
    const ogImages = product.image_url
      ? [{ url: product.image_url, width: 1200, height: 630 }]
      : [];
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: ogImages,
        type: 'website',
        siteName: 'Compario',
        url: `${appUrl}/products/${product.slug}`,
      },
      twitter: {
        card: product.image_url ? 'summary_large_image' : 'summary',
        title,
        description,
        images: product.image_url ? [product.image_url] : [],
        site: '@compariotech',
      },
    };
  } catch {
    return { title: 'Ürün' };
  }
}

type VariantRow = Record<string, string | number>;

function VariantTable({ label, variants }: { label: string; variants: VariantRow[] }) {
  if (!variants.length) return null;
  const keys = [...new Set(variants.flatMap(v => Object.keys(v)))];

  return (
    <section
      className="rounded-xl overflow-hidden mb-4"
      style={{ border: '1px solid rgba(196,154,60,0.15)', background: '#0a0a14' }}
    >
      <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: 'rgba(196,154,60,0.1)', background: '#0d0d18' }}>
        <span className="text-neon-cyan opacity-60 text-[10px]">⬡</span>
        <h2 className="font-orbitron text-[10px] uppercase tracking-[0.3em] text-neon-cyan opacity-80">{label}</h2>
        <span
          className="ml-auto font-mono text-[9px] px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(196,154,60,0.08)', border: '1px solid rgba(196,154,60,0.2)', color: 'rgba(196,154,60,0.7)' }}
        >
          {variants.length} seçenek
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[540px]">
          <thead>
            <tr style={{ background: 'rgba(0,255,247,0.03)', borderBottom: '1px solid rgba(0,255,247,0.06)' }}>
              {keys.map(k => (
                <th key={k} className="px-5 py-3 font-mono text-[9px] uppercase tracking-wider text-gray-600">
                  {k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(0,255,247,0.04)]">
            {variants.map((variant, i) => (
              <tr
                key={i}
                className="transition-colors hover:bg-[rgba(0,255,247,0.02)]"
                style={i === 0 ? { background: 'rgba(196,154,60,0.03)' } : undefined}
              >
                {keys.map(k => (
                  <td key={k} className="px-5 py-3 font-mono text-xs text-gray-400">
                    {k.toLowerCase().includes('fiyat') || k.toLowerCase().includes('price') ? (
                      <span style={{ color: '#C49A3C', fontWeight: 600 }}>{String(variant[k] ?? '—')}</span>
                    ) : k === keys[0] ? (
                      <span className="text-gray-200 font-semibold">{String(variant[k] ?? '—')}</span>
                    ) : (
                      String(variant[k] ?? '—')
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SpecsTable({ specs }: { specs: Json }) {
  if (!specs || typeof specs !== 'object' || Array.isArray(specs)) return null;
  const allEntries = Object.entries(specs as Record<string, Json>);
  if (allEntries.length === 0) return null;

  // Variant array'lerini ve normal key-value spec'leri ayır
  const variantEntries = allEntries.filter(
    ([, v]) => Array.isArray(v) && v.length > 0 && v[0] !== null && typeof v[0] === 'object' && !Array.isArray(v[0])
  ) as [string, VariantRow[]][];
  const regularEntries = allEntries.filter(
    ([, v]) => !(Array.isArray(v) && v.length > 0 && v[0] !== null && typeof v[0] === 'object' && !Array.isArray(v[0]))
  );

  return (
    <div className="space-y-4">
      {/* Önce variant tabloları (motor seçenekleri vb.) */}
      {variantEntries.map(([key, variants]) => (
        <VariantTable key={key} label={key} variants={variants} />
      ))}

      {/* Sonra normal teknik özellikler */}
      {regularEntries.length > 0 && (
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
            {regularEntries.map(([key, value]) => (
              <div key={key} className="flex gap-4 py-3">
                <dt className="font-mono text-[10px] text-gray-600 uppercase tracking-wider w-40 flex-shrink-0 self-center">
                  {key.replace(/_/g, ' ')}
                </dt>
                <dd className="font-mono text-xs text-gray-400 flex-1">{String(value ?? '—')}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
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
            <div className="relative aspect-video w-full bg-[#0c0c16] overflow-hidden">
              {p.image_url ? (
                <Image src={p.image_url} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:640px) 100vw, 33vw" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-3xl opacity-10">◈</span>
                </div>
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

  // Kategori hiyerarşisini ve diğer verileri paralel çek
  const category = product.category_id
    ? await getCategoryById(product.category_id).catch(() => null)
    : null;
  const parentCategory = category?.parent_id
    ? await getCategoryById(category.parent_id).catch(() => null)
    : null;
  const grandparentCategory = parentCategory?.parent_id
    ? await getCategoryById(parentCategory.parent_id).catch(() => null)
    : null;

  const [relatedNews, reviews, ratingSummary] = await Promise.all([
    getNewsForProduct(product.id).catch(() => [] as NewsArticle[]),
    getApprovedReviews(product.id).catch(() => []),
    getRatingSummary(product.id).catch(() => ({ average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } })),
  ]);

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
    ...(ratingSummary.count > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: ratingSummary.average,
        reviewCount: ratingSummary.count,
        bestRating: 5,
        worstRating: 1,
      },
      review: reviews.slice(0, 5).map((r) => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: r.reviewer_name ?? 'Anonim' },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: r.rating,
          bestRating: 5,
          worstRating: 1,
        },
        reviewBody: r.comment,
        datePublished: r.created_at.split('T')[0],
      })),
    } : {}),
  };

  const appUrl = 'https://compario.tech';
  const breadcrumbItems = [
    { name: 'Ana Sayfa', url: appUrl },
    ...(grandparentCategory ? [{ name: grandparentCategory.name, url: `${appUrl}/categories/${grandparentCategory.slug}` }] : []),
    ...(parentCategory ? [{ name: parentCategory.name, url: `${appUrl}/categories/${parentCategory.slug}` }] : []),
    ...(category ? [{ name: category.name, url: `${appUrl}/categories/${category.slug}` }] : [{ name: 'Ürünler', url: `${appUrl}/products` }]),
    { name: product.name, url: `${appUrl}/products/${product.slug}` },
  ];

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <main className="min-h-screen bg-grid pb-24" style={{ paddingTop: '88px' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {product.image_url && (
        <div className="relative w-full h-[260px] sm:h-[380px] overflow-hidden">
          <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="100vw" priority />
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

        <nav className="flex items-center gap-2 font-mono text-[10px] text-gray-700 uppercase tracking-wider py-5 flex-wrap">
          <Link href="/" className="hover:text-neon-cyan transition-colors">Ana Sayfa</Link>
          {grandparentCategory && (
            <>
              <span>/</span>
              <Link href={`/categories/${grandparentCategory.slug}`} className="hover:text-neon-cyan transition-colors">
                {grandparentCategory.name}
              </Link>
            </>
          )}
          {parentCategory && (
            <>
              <span>/</span>
              <Link href={`/categories/${parentCategory.slug}`} className="hover:text-neon-cyan transition-colors">
                {parentCategory.name}
              </Link>
            </>
          )}
          {category && (
            <>
              <span>/</span>
              <Link href={`/categories/${category.slug}`} className="hover:text-neon-cyan transition-colors">
                {category.name}
              </Link>
            </>
          )}
          {!category && (
            <>
              <span>/</span>
              <Link href="/products" className="hover:text-neon-cyan transition-colors">Ürünler</Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-500 truncate max-w-[200px]">{product.name}</span>
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
            <PriceAlertButton
              productId={product.id}
              productName={product.name}
              currentPrice={product.price_min}
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
                    <div className="relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={article.cover_image} alt={article.title} fill className="object-cover" sizes="80px" />
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

        <div className="mb-6">
          <PriceHistory
            productId={product.id}
            currentPrice={product.price_min}
            currency={product.currency ?? 'TRY'}
          />
        </div>

        <div className="mb-10">
          <ProductReviews
            productId={product.id}
            initialReviews={reviews}
            initialSummary={ratingSummary}
          />
        </div>

        <RelatedProducts categoryId={product.category_id} currentId={product.id} />
      </div>
    </main>
  );
}
