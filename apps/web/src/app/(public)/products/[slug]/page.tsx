import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlug } from '@compario/database';
import type { Json } from '@compario/database';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const product = await getProductBySlug(params.slug);
    if (!product) return { title: 'Ürün Bulunamadı' };
    return {
      title: product.meta_title ?? product.name,
      description:
        product.meta_description ??
        `${product.name} — ${product.brand ?? ''} ${product.model ?? ''} özelliklerini inceleyin ve karşılaştırın.`,
      openGraph: {
        title: product.name,
        description: product.short_description ?? product.description ?? '',
        images: product.image_url ? [product.image_url] : [],
        type: 'website',
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
    <div className="card-neon p-6">
      <h2 className="font-orbitron text-xs text-neon-cyan uppercase tracking-widest mb-4">
        ⬡ Specifications
      </h2>
      <dl className="divide-y divide-[rgba(0,255,247,0.06)]">
        {entries.map(([key, value]) => (
          <div key={key} className="flex gap-4 py-2.5">
            <dt className="font-mono text-xs text-gray-500 uppercase tracking-wide w-40 flex-shrink-0">
              {key.replace(/_/g, ' ')}
            </dt>
            <dd className="font-mono text-xs text-gray-300 flex-1">
              {String(value ?? '—')}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default async function ProductPage({ params }: PageProps) {
  let product;

  try {
    product = await getProductBySlug(params.slug);
  } catch {
    notFound();
  }

  if (!product) notFound();

  const priceDisplay =
    product.price_min && product.price_max
      ? `₺${product.price_min.toLocaleString('tr-TR')} – ₺${product.price_max.toLocaleString('tr-TR')}`
      : product.price_min
      ? `₺${product.price_min.toLocaleString('tr-TR')}`
      : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? product.short_description ?? '',
    brand: { '@type': 'Brand', name: product.brand ?? 'Compario' },
    image: product.image_url ? [product.image_url] : [],
    sku: product.slug,
    url: `https://compario.tech/products/${product.slug}`,
    ...(product.price_min
      ? {
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: product.currency ?? 'TRY',
            lowPrice: product.price_min,
            highPrice: product.price_max ?? product.price_min,
            offerCount: 1,
          },
        }
      : {}),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://compario.tech' },
      { '@type': 'ListItem', position: 2, name: 'Kategoriler', item: 'https://compario.tech/categories' },
      { '@type': 'ListItem', position: 3, name: product.name, item: `https://compario.tech/products/${product.slug}` },
    ],
  };

  return (
    <main className="min-h-screen bg-grid">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <div className="max-w-4xl mx-auto px-6 pt-28 pb-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 font-mono text-xs text-gray-600 mb-10">
          <Link href="/" className="hover:text-neon-cyan transition-colors">
            Ana Sayfa
          </Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-neon-cyan transition-colors">
            Kategoriler
          </Link>
          <span>/</span>
          <span className="text-gray-400">{product.name}</span>
        </nav>

        {/* Product header */}
        <div className="card-neon p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div>
              <p className="font-mono text-xs text-neon-purple uppercase tracking-widest mb-2">
                {product.brand}
              </p>
              <h1 className="font-orbitron text-2xl sm:text-3xl font-black text-white mb-1">
                {product.name}
              </h1>
              <p className="font-mono text-sm text-gray-500">
                Model: {product.model}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              {priceDisplay && (
              <p className="font-orbitron text-xl font-bold text-neon-green text-glow-green">
                {priceDisplay}
              </p>
            )}
              <span
                className={`inline-block mt-2 font-mono text-xs uppercase tracking-widest px-3 py-1 rounded border ${
                  product.status === 'active'
                    ? 'border-neon-green text-neon-green'
                    : 'border-gray-600 text-gray-600'
                }`}
              >
                {product.status}
              </span>
            </div>
          </div>
        </div>

        {/* Specs */}
        <SpecsTable specs={product.specs} />

        {/* Actions */}
        <div className="mt-6 flex gap-4">
          <Link href="/categories" className="btn-neon text-sm">
            ← Kategorilere Dön
          </Link>
        </div>
      </div>
    </main>
  );
}
