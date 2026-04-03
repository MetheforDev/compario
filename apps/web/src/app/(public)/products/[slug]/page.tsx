import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlug, getSimilarProducts, incrementViewCount } from '@compario/database';
import type { Product } from '@compario/database';
import { ProductCard } from '@/components/ProductCard';
import { ShareButtons } from '@/components/ShareButtons';
import ProductGallery from '@/components/ProductGallery';
import SpecsTable from '@/components/SpecsTable';
import AddToCompareButton from '@/components/AddToCompareButton';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const product = await getProductBySlug(params.slug);
    if (!product) return { title: 'Ürün Bulunamadı' };

    const title = [product.brand, product.name, product.model].filter(Boolean).join(' ');
    const description =
      product.meta_description ??
      product.short_description ??
      `${title} teknik özellikleri ve fiyat karşılaştırması.`;

    return {
      title: product.meta_title ?? title,
      description,
      openGraph: {
        title,
        description,
        images: product.image_url ? [product.image_url] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: product.image_url ? [product.image_url] : [],
        creator: '@compariotech',
        site: '@compariotech',
      },
    };
  } catch {
    return { title: 'Ürün' };
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  let product: Product | null = null;
  let similar: Product[] = [];

  try {
    product = await getProductBySlug(params.slug);
    if (product) {
      incrementViewCount(product.id).catch(() => {});
      if (product.category_id) {
        similar = await getSimilarProducts(product.category_id, product.id, 4).catch(() => []);
      }
    }
  } catch {
    // db not available
  }

  if (!product) notFound();

  // Parse images array from JSON
  const extraImages: string[] = Array.isArray(product.images)
    ? (product.images as string[]).filter((v) => typeof v === 'string')
    : [];

  const hasImage = !!product.image_url;

  const priceDisplay =
    product.price_min && product.price_max && product.price_max > product.price_min
      ? `₺${product.price_min.toLocaleString('tr-TR')} – ₺${product.price_max.toLocaleString('tr-TR')}`
      : product.price_min
      ? `₺${product.price_min.toLocaleString('tr-TR')}`
      : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: [product.brand, product.name, product.model].filter(Boolean).join(' '),
    description: product.short_description ?? product.description ?? '',
    brand: { '@type': 'Brand', name: product.brand ?? 'Compario' },
    image: product.image_url ? [product.image_url, ...extraImages] : extraImages,
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
            availability:
              product.status === 'active'
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
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
    <main className="min-h-screen bg-grid pt-20 pb-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 font-mono text-[10px] text-gray-600 uppercase tracking-wider mb-8 flex-wrap">
          <Link href="/" className="hover:text-neon-cyan transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-neon-cyan transition-colors">Kategoriler</Link>
          <span>/</span>
          <span className="text-gray-500 truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Main grid: image + info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {/* Left: Gallery */}
          <div>
            {hasImage ? (
              <ProductGallery
                mainImage={product.image_url!}
                images={extraImages}
                productName={[product.brand, product.name].filter(Boolean).join(' ')}
              />
            ) : (
              <div
                className="w-full rounded-xl flex items-center justify-center"
                style={{ height: '420px', background: 'rgba(12,12,22,0.8)', border: '1px solid rgba(196,154,60,0.08)' }}
              >
                <span className="font-mono text-xs text-gray-700 uppercase tracking-widest">
                  [ Görsel Yok ]
                </span>
              </div>
            )}
          </div>

          {/* Right: Product info */}
          <div className="flex flex-col gap-5">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {product.is_featured && (
                <span
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-mono uppercase tracking-wider"
                  style={{ background: 'rgba(196,154,60,0.1)', borderColor: 'rgba(196,154,60,0.3)', color: '#C49A3C' }}
                >
                  <svg width="11" height="11" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Öne Çıkan
                </span>
              )}
              <span
                className="px-3 py-1 rounded-full border text-xs font-mono uppercase tracking-wider"
                style={
                  product.status === 'active'
                    ? { borderColor: 'rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.08)', color: '#22c55e' }
                    : { borderColor: 'rgba(107,114,128,0.3)', background: 'rgba(107,114,128,0.08)', color: '#6b7280' }
                }
              >
                {product.status === 'active' ? 'Aktif' : product.status}
              </span>
            </div>

            {/* Brand + Name + Model */}
            <div>
              {product.brand && (
                <p className="font-mono text-xs text-neon-purple uppercase tracking-[0.3em] mb-1 opacity-80">
                  {product.brand}
                </p>
              )}
              <h1 className="font-orbitron text-3xl sm:text-4xl font-black text-white leading-tight">
                {product.name}
              </h1>
              <div className="flex flex-wrap gap-3 mt-2">
                {product.model && (
                  <span className="font-mono text-xs text-gray-500">Model: {product.model}</span>
                )}
                {product.model_year && (
                  <span className="font-mono text-xs text-gray-600">{product.model_year}</span>
                )}
              </div>
            </div>

            {/* Price */}
            {priceDisplay && (
              <div
                className="p-5 rounded-xl"
                style={{ background: 'rgba(196,154,60,0.05)', border: '1px solid rgba(196,154,60,0.15)' }}
              >
                <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-1">
                  Fiyat Aralığı
                </p>
                <p className="font-orbitron text-2xl font-bold text-neon-cyan">
                  {priceDisplay}
                </p>
              </div>
            )}

            {/* Description */}
            {(product.short_description || product.description) && (
              <p className="font-mono text-sm text-gray-400 leading-relaxed">
                {product.short_description ?? product.description}
              </p>
            )}

            {/* Stats */}
            <div className="flex gap-5 font-mono text-xs text-gray-600">
              <span className="flex items-center gap-1.5">
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {product.view_count} görüntülenme
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="9" y="2" width="6" height="4" rx="1" /><rect x="2" y="10" width="6" height="4" rx="1" /><rect x="16" y="10" width="6" height="4" rx="1" />
                  <path d="M12 6v4M5 12h4M15 12h4" />
                </svg>
                {product.compare_count} kez karşılaştırıldı
              </span>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col gap-2 mt-1">
              <AddToCompareButton
                product={{ id: product.id, name: product.name, brand: product.brand, image_url: product.image_url }}
              />
              {product.source_url && (
                <a
                  href={product.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-6 rounded-xl font-orbitron text-xs font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all"
                  style={{ border: '1px solid rgba(139,155,172,0.25)', color: '#8B9BAC' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,155,172,0.08)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  Fiyatları Görüntüle
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px mb-12" style={{ background: 'rgba(196,154,60,0.08)' }} />

        {/* Specs */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, rgba(196,154,60,0.15))' }} />
            <h2 className="font-orbitron text-xs uppercase tracking-[0.3em] text-neon-cyan opacity-70">
              ⬡ Teknik Özellikler
            </h2>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, rgba(196,154,60,0.15))' }} />
          </div>
          <SpecsTable specs={product.specs} />
        </section>

        {/* Divider */}
        <div className="h-px mb-12" style={{ background: 'rgba(196,154,60,0.08)' }} />

        {/* Share */}
        <ShareButtons title={[product.brand, product.name].filter(Boolean).join(' ')} slug={product.slug} />

        {/* Similar products */}
        {similar.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, rgba(196,154,60,0.15))' }} />
              <h2 className="font-orbitron text-xs uppercase tracking-[0.3em] text-neon-cyan opacity-70">
                ⬡ Benzer Ürünler
              </h2>
              <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, rgba(196,154,60,0.15))' }} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similar.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
