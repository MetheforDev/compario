import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export const revalidate = 60;
import { getCategoryBySlug, getCategoryById, getSubCategories, getProducts, getSegmentsByCategory } from '@compario/database';
import { ProductCard } from '@/components/ProductCard';

const CATEGORY_BANNERS: Record<string, string> = {
  laptops:      '/images/web/category-laptops.jpg',
  smartphones:  '/images/web/category-smartphones.jpg',
  automotive:   '/images/web/category-automotive.jpg',
  appliances:   '/images/web/category-appliances.jpg',
  tech:         '/images/web/category-tech.jpg',
};

interface PageProps {
  params: { slug: string };
  searchParams: { segment?: string; sort?: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const cat = await getCategoryBySlug(params.slug);
    if (!cat) return {};
    const appUrl = 'https://compario.tech';
    const canonical = `${appUrl}/categories/${params.slug}`;
    const title = `${cat.name} Karşılaştırma`;
    const description = cat.description ?? `${cat.name} kategorisindeki en iyi ürünleri karşılaştırın — fiyatlar, özellikler, yorumlar.`;
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: canonical,
        type: 'website',
        siteName: 'Compario',
        locale: 'tr_TR',
        ...(cat.image_url ? { images: [{ url: cat.image_url, width: 1200, height: 630 }] } : {}),
      },
      twitter: {
        card: cat.image_url ? 'summary_large_image' : 'summary',
        title,
        description,
        site: '@compariotech',
      },
    };
  } catch {
    return {};
  }
}

const SORT_OPTIONS = [
  { value: 'newest',     label: 'En Yeni'     },
  { value: 'price_asc',  label: 'Fiyat ↑'     },
  { value: 'price_desc', label: 'Fiyat ↓'     },
  { value: 'name_asc',   label: 'İsim A→Z'    },
];

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const category = await getCategoryBySlug(params.slug).catch(() => null);
  if (!category) notFound();

  const [subCategories, categorySegments, parentCategory] = await Promise.all([
    getSubCategories(category.id).catch(() => []),
    getSegmentsByCategory(category.id).catch(() => []),
    category.parent_id ? getCategoryById(category.parent_id).catch(() => null) : Promise.resolve(null),
  ]);
  const activeSegment = searchParams.segment ?? '';
  const activeSort = (searchParams.sort ?? 'newest') as 'newest' | 'price_asc' | 'price_desc' | 'name_asc';

  const products = await getProducts({
    category: params.slug,
    segment: activeSegment || undefined,
    status: 'active',
    sortBy: activeSort,
    limit: 60,
  }).catch(() => []);

  const bannerSrc = CATEGORY_BANNERS[params.slug] ?? null;

  const appUrl = 'https://compario.tech';

  const breadcrumbItems = [
    { name: 'Ana Sayfa', url: appUrl },
    { name: 'Kategoriler', url: `${appUrl}/categories` },
    ...(parentCategory ? [{ name: parentCategory.name, url: `${appUrl}/categories/${parentCategory.slug}` }] : []),
    { name: category.name, url: `${appUrl}/categories/${params.slug}` },
  ];

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${category.name} Karşılaştırma`,
      description: category.description ?? `${category.name} kategorisindeki ürünleri karşılaştırın.`,
      url: `${appUrl}/categories/${params.slug}`,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: products.length,
        itemListElement: products.slice(0, 10).map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${appUrl}/products/${p.slug}`,
          name: `${p.brand ? `${p.brand} ` : ''}${p.name}`,
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbItems.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        item: item.url,
      })),
    },
  ];

  return (
    <main className="min-h-screen bg-grid pt-20 pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Category banner header */}
      <div className="relative w-full h-48 sm:h-64 overflow-hidden mb-0">
        {bannerSrc ? (
          <Image
            src={bannerSrc}
            alt={category.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0" style={{ background: 'rgba(12,12,22,1)' }} />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(8,9,14,0.4) 0%, rgba(8,9,14,0.75) 70%, #08090E 100%)' }} />

        <div className="absolute inset-0 flex flex-col justify-end px-4 sm:px-8 pb-6 max-w-7xl mx-auto left-0 right-0">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 font-mono text-[10px] text-gray-500 uppercase tracking-wider mb-3">
            <Link href="/" className="hover:text-neon-cyan transition-colors">Ana Sayfa</Link>
            <span>/</span>
            <Link href="/categories" className="hover:text-neon-cyan transition-colors">Kategoriler</Link>
            {parentCategory && (
              <>
                <span>/</span>
                <Link href={`/categories/${parentCategory.slug}`} className="hover:text-neon-cyan transition-colors">
                  {parentCategory.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-neon-purple">{category.name}</span>
          </nav>

          <div className="flex items-center gap-4">
            {category.icon && (
              <span className="text-4xl drop-shadow-lg">{category.icon}</span>
            )}
            <div>
              <p className="font-mono text-[10px] text-neon-purple uppercase tracking-[0.4em] opacity-70 mb-0.5">
                Karşılaştırma
              </p>
              <h1 className="font-orbitron text-3xl sm:text-4xl font-black text-neon-cyan"
                style={{ textShadow: '0 0 30px rgba(196,154,60,0.4)' }}>
                {category.name.toUpperCase()}
              </h1>
              {category.description && (
                <p className="font-mono text-xs text-gray-400 mt-1 max-w-xl">{category.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Divider */}
        <div className="h-px mb-6 mt-6" style={{ background: 'rgba(196,154,60,0.08)' }} />

        {/* Alt kategoriler */}
        {subCategories.length > 0 && (
          <div className="mb-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-neon-purple opacity-70 mb-4">
              ⬡ Alt Kategoriler
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {subCategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/categories/${sub.slug}`}
                  className="group relative flex flex-col items-center gap-2 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: 'linear-gradient(135deg, rgba(15,15,28,0.95) 0%, rgba(10,10,20,0.98) 100%)',
                    border: '1px solid rgba(0,255,247,0.08)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
                  }}
                >
                  {sub.image_url ? (
                    (() => {
                      const isLogo = sub.image_url.includes('simpleicons.org') || sub.image_url.endsWith('.svg');
                      return isLogo ? (
                        <div className="w-full h-20 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={sub.image_url} alt={sub.name} className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-300" />
                        </div>
                      ) : (
                        <div className="relative w-full h-20 overflow-hidden">
                          <Image src={sub.image_url} alt={sub.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="200px" />
                          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,10,20,0.9) 0%, transparent 60%)' }} />
                        </div>
                      );
                    })()
                  ) : (
                    <div className="w-full h-16 flex items-center justify-center" style={{ background: 'rgba(0,255,247,0.03)' }}>
                      <span className="text-2xl">{sub.icon ?? '📦'}</span>
                    </div>
                  )}
                  <div className="px-2 pb-3 text-center">
                    <p className="font-orbitron text-[9px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-neon-cyan transition-colors leading-tight">
                      {sub.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {/* Segments */}
          {categorySegments.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <Link
                href={`/categories/${params.slug}${activeSort !== 'newest' ? `?sort=${activeSort}` : ''}`}
                className="px-3 py-1.5 rounded-full border font-mono text-[10px] uppercase tracking-wider transition-all"
                style={{
                  borderColor: !activeSegment ? 'rgba(196,154,60,0.5)' : 'rgba(196,154,60,0.12)',
                  color: !activeSegment ? '#C49A3C' : '#6b7280',
                  background: !activeSegment ? 'rgba(196,154,60,0.07)' : 'transparent',
                }}
              >
                Tümü
              </Link>
              {categorySegments.map((seg) => (
                <Link
                  key={seg.id}
                  href={`/categories/${params.slug}?segment=${seg.slug}${activeSort !== 'newest' ? `&sort=${activeSort}` : ''}`}
                  className="px-3 py-1.5 rounded-full border font-mono text-[10px] uppercase tracking-wider transition-all"
                  style={{
                    borderColor: activeSegment === seg.slug ? 'rgba(196,154,60,0.5)' : 'rgba(196,154,60,0.12)',
                    color: activeSegment === seg.slug ? '#C49A3C' : '#6b7280',
                    background: activeSegment === seg.slug ? 'rgba(196,154,60,0.07)' : 'transparent',
                  }}
                >
                  {seg.name}
                </Link>
              ))}
            </div>
          )}

          {/* Sort */}
          <div className="ml-auto flex gap-1">
            {SORT_OPTIONS.map((opt) => (
              <Link
                key={opt.value}
                href={`/categories/${params.slug}?${activeSegment ? `segment=${activeSegment}&` : ''}sort=${opt.value}`}
                className="px-3 py-1.5 rounded font-mono text-[10px] uppercase tracking-wider transition-all"
                style={{
                  background: activeSort === opt.value ? 'rgba(139,155,172,0.1)' : 'transparent',
                  color: activeSort === opt.value ? '#8B9BAC' : '#4b5563',
                  border: '1px solid ' + (activeSort === opt.value ? 'rgba(139,155,172,0.2)' : 'transparent'),
                }}
              >
                {opt.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Info bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest">
            {products.length} ürün · En fazla 4 seçin
          </p>
          <p className="font-mono text-[10px]" style={{ color: 'rgba(196,154,60,0.4)' }}>
            ◆ Karşılaştırmak için ürüne ekle butonuna basın
          </p>
        </div>

        {/* Products grid */}
        {products.length === 0 ? (
          <div
            className="text-center py-24 rounded-xl"
            style={{ border: '1px solid rgba(196,154,60,0.08)' }}
          >
            <p className="font-mono text-xs text-gray-600 uppercase tracking-widest">
              [ Bu kategoride henüz ürün yok ]
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
