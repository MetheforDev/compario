import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, getProducts, getSegmentsByCategory } from '@compario/database';
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
    return {
      title: `${cat.name} Karşılaştırma`,
      description: cat.description ?? `${cat.name} kategorisindeki ürünleri karşılaştırın.`,
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
  const [category, segments] = await Promise.all([
    getCategoryBySlug(params.slug).catch(() => null),
    // segments fetched below
    Promise.resolve([]),
  ]);

  if (!category) notFound();

  const categorySegments = await getSegmentsByCategory(category.id).catch(() => []);
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

  return (
    <main className="min-h-screen bg-grid pt-20 pb-24">
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
