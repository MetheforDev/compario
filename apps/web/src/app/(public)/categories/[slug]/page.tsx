import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, getProducts, getSegmentsByCategory } from '@compario/database';
import { ProductCard } from '@/components/ProductCard';

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

  return (
    <main className="min-h-screen bg-grid pt-28 pb-24">
      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 font-mono text-[10px] text-gray-700 uppercase tracking-wider mb-8">
          <Link href="/" className="hover:text-neon-cyan transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-neon-cyan transition-colors">Kategoriler</Link>
          <span>/</span>
          <span className="text-neon-purple">{category.name}</span>
        </nav>

        {/* Category header */}
        <div className="flex items-center gap-5 mb-10">
          {category.icon && (
            <span className="text-5xl">{category.icon}</span>
          )}
          <div>
            <p className="font-mono text-[10px] text-neon-purple uppercase tracking-[0.4em] opacity-60 mb-1">
              Karşılaştırma
            </p>
            <h1 className="font-orbitron text-3xl sm:text-4xl font-black text-neon-cyan text-glow-cyan">
              {category.name.toUpperCase()}
            </h1>
            {category.description && (
              <p className="font-mono text-xs text-gray-500 mt-2 max-w-xl">{category.description}</p>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px mb-6" style={{ background: 'rgba(196,154,60,0.08)' }} />

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
