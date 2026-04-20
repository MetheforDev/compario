import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export const revalidate = 60;

import {
  getCategoryBySlug,
  getCategoryById,
  getSubCategories,
  getProducts,
  getSegmentsByCategory,
  getBrandsByCategory,
  getCategories,
} from '@compario/database';

export async function generateStaticParams() {
  try {
    const cats = await getCategories();
    return cats.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}
import { ProductCard } from '@/components/ProductCard';
import { CategorySidebar } from '@/components/CategorySidebar';
import { SidebarDrawer } from '@/components/SidebarDrawer';

const CATEGORY_BANNERS: Record<string, string> = {
  laptops:     '/images/web/category-laptops.jpg',
  smartphones: '/images/web/category-smartphones.jpg',
  automotive:  '/images/web/category-automotive.jpg',
  appliances:  '/images/web/category-appliances.jpg',
  tech:        '/images/web/category-tech.jpg',
};

interface PageProps {
  params: { slug: string };
  searchParams: { segment?: string; sort?: string; brand?: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const cat = await getCategoryBySlug(params.slug);
    if (!cat) return {};
    const appUrl = 'https://compario.tech';
    const canonical = `${appUrl}/categories/${params.slug}`;
    const title = `${cat.name} Karşılaştırma`;
    const description =
      cat.description ??
      `${cat.name} kategorisindeki en iyi ürünleri karşılaştırın — fiyatlar, özellikler, yorumlar.`;
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

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const category = await getCategoryBySlug(params.slug).catch(() => null);
  if (!category) notFound();

  const [subCategories, categorySegments, parentCategory, brands] = await Promise.all([
    getSubCategories(category.id).catch(() => []),
    getSegmentsByCategory(category.id).catch(() => []),
    category.parent_id ? getCategoryById(category.parent_id).catch(() => null) : Promise.resolve(null),
    getBrandsByCategory(params.slug).catch(() => []),
  ]);

  const activeSegment = searchParams.segment ?? '';
  const activeSort    = (searchParams.sort ?? 'newest') as 'newest' | 'price_asc' | 'price_desc' | 'name_asc';
  const activeBrand   = searchParams.brand ?? '';

  const products = await getProducts({
    category: params.slug,
    segment:  activeSegment || undefined,
    brand:    activeBrand   || undefined,
    status:   'active',
    sortBy:   activeSort,
    limit:    60,
  }).catch(() => []);

  const bannerSrc = CATEGORY_BANNERS[params.slug] ?? null;
  const appUrl    = 'https://compario.tech';

  const breadcrumbItems = [
    { name: 'Ana Sayfa',   url: appUrl },
    { name: 'Kategoriler', url: `${appUrl}/categories` },
    ...(parentCategory
      ? [{ name: parentCategory.name, url: `${appUrl}/categories/${parentCategory.slug}` }]
      : []),
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

      {/* ── Banner ── */}
      <div className="relative w-full h-44 sm:h-56 overflow-hidden">
        {bannerSrc ? (
          <Image src={bannerSrc} alt={category.name} fill className="object-cover" priority />
        ) : (
          <div className="absolute inset-0" style={{ background: 'rgba(12,12,22,1)' }} />
        )}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(13,15,26,0.4) 0%, rgba(13,15,26,0.75) 70%, #0D0F1A 100%)' }}
        />
        <div className="absolute inset-0 flex flex-col justify-end px-4 sm:px-8 pb-5 max-w-7xl mx-auto left-0 right-0">
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
            {category.icon && <span className="text-4xl drop-shadow-lg">{category.icon}</span>}
            <div>
              <p className="font-mono text-[10px] text-neon-purple uppercase tracking-[0.4em] opacity-70 mb-0.5">
                Karşılaştırma
              </p>
              <h1
                className="font-orbitron text-2xl sm:text-3xl font-black text-neon-cyan"
                style={{ textShadow: '0 0 30px rgba(196,154,60,0.4)' }}
              >
                {category.name.toUpperCase()}
              </h1>
              {category.description && (
                <p className="font-mono text-xs text-gray-400 mt-1 max-w-xl">{category.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2-Kolon Layout ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-px mt-5 mb-5" style={{ background: 'rgba(196,154,60,0.08)' }} />

        <div className="flex gap-6 items-start">

          {/* ── Sol Sidebar ── */}
          <SidebarDrawer>
            <CategorySidebar
              slug={params.slug}
              category={category}
              parentCategory={parentCategory}
              subCategories={subCategories}
              segments={categorySegments}
              brands={brands}
              activeBrand={activeBrand}
              activeSegment={activeSegment}
              activeSort={activeSort}
            />
          </SidebarDrawer>

          {/* ── Sağ: Ürünler ── */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest">
                {products.length} ürün
                {activeBrand && <span className="text-neon-cyan ml-2">· {activeBrand}</span>}
                {activeSegment && <span className="text-amber-500/60 ml-2">· {activeSegment}</span>}
                <span className="opacity-50 ml-2">· En fazla 4 karşılaştır</span>
              </p>
              <p className="font-mono text-[10px]" style={{ color: 'rgba(196,154,60,0.4)' }}>
                ◆ Karşılaştırmak için ürüne ekle butonuna basın
              </p>
            </div>

            {products.length === 0 ? (
              <div
                className="text-center py-24 rounded-xl"
                style={{ border: '1px solid rgba(196,154,60,0.08)' }}
              >
                <p className="font-mono text-xs text-gray-600 uppercase tracking-widest mb-4">
                  [ Bu filtrede henüz ürün yok ]
                </p>
                <Link
                  href={`/categories/${params.slug}`}
                  className="font-mono text-[10px] text-neon-cyan hover:underline"
                >
                  Filtreleri temizle →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
