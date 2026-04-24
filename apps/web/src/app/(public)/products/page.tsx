import type { Metadata } from 'next';
import Link from 'next/link';
import { getProducts, getCategories } from '@compario/database';
import { ProductCard } from '@/components/ProductCard';
import { AdSenseUnit } from '@/components/AdSenseUnit';

export const revalidate = 3600;

const APP_URL = 'https://compario.tech';

export const metadata: Metadata = {
  title: 'Tüm Ürünler | Compario',
  description: "Araçlar, telefonlar, laptoplar ve daha fazlasını karşılaştırın. Türkiye'nin en kapsamlı ürün karşılaştırma platformu.",
  alternates: { canonical: `${APP_URL}/products` },
  openGraph: {
    title: 'Tüm Ürünler | Compario',
    description: "Araçlar, telefonlar, laptoplar ve daha fazlasını karşılaştırın.",
    url: `${APP_URL}/products`,
    siteName: 'Compario',
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: { card: 'summary', title: 'Tüm Ürünler | Compario', site: '@compariotech' },
};

interface PageProps {
  searchParams: {
    sort?: string;
    category?: string;
    search?: string;
  };
}

const SORT_OPTIONS = [
  { value: 'newest',     label: 'En Yeni'  },
  { value: 'price_asc',  label: 'Fiyat ↑'  },
  { value: 'price_desc', label: 'Fiyat ↓'  },
  { value: 'name_asc',   label: 'İsim A→Z' },
];

export default async function ProductsPage({ searchParams }: PageProps) {
  const sort = (searchParams.sort ?? 'newest') as 'newest' | 'price_asc' | 'price_desc' | 'name_asc';
  const category = searchParams.category ?? '';
  const search = searchParams.search ?? '';

  const [products, categories] = await Promise.all([
    getProducts({
      status: 'active',
      category: category || undefined,
      search: search || undefined,
      sortBy: sort,
      limit: 48,
    }).catch(() => []),
    getCategories(true).catch(() => []),
  ]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Tüm Ürünler | Compario',
    description: "Türkiye'nin en kapsamlı ürün karşılaştırma platformu.",
    url: `${APP_URL}/products`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.slice(0, 12).map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: `${p.brand ? `${p.brand} ` : ''}${p.name}`,
        url: `${APP_URL}/products/${p.slug}`,
      })),
    },
  };

  return (
    <main className="min-h-screen bg-grid pb-24" style={{ paddingTop: '88px' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Page header */}
        <div className="py-10">
          <nav className="flex items-center gap-2 font-mono text-[10px] text-gray-700 uppercase tracking-wider mb-5">
            <Link href="/" className="hover:text-neon-cyan transition-colors">Ana Sayfa</Link>
            <span>/</span>
            <span className="text-neon-cyan">Ürünler</span>
          </nav>

          <div className="flex items-center gap-4">
            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(196,154,60,0.3), transparent)' }} />
            <h1 className="font-orbitron text-[11px] uppercase tracking-[0.4em] font-black text-neon-cyan whitespace-nowrap">
              Tüm Ürünler
            </h1>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(270deg, rgba(196,154,60,0.3), transparent)' }} />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">

          {/* Search */}
          <form method="GET" className="flex-1">
            {sort !== 'newest' && <input type="hidden" name="sort" value={sort} />}
            {category && <input type="hidden" name="category" value={category} />}
            <div className="relative">
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Ürün, marka veya model ara..."
                className="w-full bg-[#0d0d17] border border-[rgba(0,255,247,0.12)] rounded px-3 py-2.5 pr-10
                           font-mono text-xs text-gray-300 placeholder-gray-700
                           focus:outline-none focus:border-neon-cyan/50 transition-colors"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-neon-cyan transition-colors text-xs">
                ⌕
              </button>
            </div>
          </form>

          {/* Sort */}
          <div className="flex gap-2 flex-wrap">
            {SORT_OPTIONS.map((opt) => {
              const params = new URLSearchParams();
              params.set('sort', opt.value);
              if (category) params.set('category', category);
              if (search) params.set('search', search);
              const active = sort === opt.value;
              return (
                <Link
                  key={opt.value}
                  href={`/products?${params.toString()}`}
                  className="px-3 py-2 font-mono text-[10px] uppercase tracking-wider rounded border transition-all"
                  style={{
                    background: active ? 'rgba(0,255,247,0.08)' : 'transparent',
                    borderColor: active ? 'rgba(0,255,247,0.4)' : 'rgba(0,255,247,0.1)',
                    color: active ? '#00fff7' : 'rgba(156,163,175,0.7)',
                  }}
                >
                  {opt.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Category tabs */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {/* All */}
            <Link
              href={sort !== 'newest' ? `/products?sort=${sort}` : '/products'}
              className="px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider rounded-full border transition-all"
              style={{
                background: !category ? 'rgba(196,154,60,0.1)' : 'transparent',
                borderColor: !category ? 'rgba(196,154,60,0.4)' : 'rgba(196,154,60,0.12)',
                color: !category ? '#C49A3C' : 'rgba(156,163,175,0.6)',
              }}
            >
              Tümü
            </Link>
            {categories.map((cat) => {
              const params = new URLSearchParams();
              params.set('category', cat.slug);
              if (sort !== 'newest') params.set('sort', sort);
              if (search) params.set('search', search);
              const active = category === cat.slug;
              return (
                <Link
                  key={cat.id}
                  href={`/products?${params.toString()}`}
                  className="px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider rounded-full border transition-all"
                  style={{
                    background: active ? 'rgba(196,154,60,0.1)' : 'transparent',
                    borderColor: active ? 'rgba(196,154,60,0.4)' : 'rgba(196,154,60,0.12)',
                    color: active ? '#C49A3C' : 'rgba(156,163,175,0.6)',
                  }}
                >
                  {cat.icon && <span className="mr-1">{cat.icon}</span>}
                  {cat.name}
                </Link>
              );
            })}
          </div>
        )}

        {/* Results count */}
        <p className="font-mono text-[10px] text-gray-700 uppercase tracking-wider mb-6">
          {products.length} ürün bulundu
          {search && <span className="text-neon-cyan ml-2">→ "{search}"</span>}
          {category && categories.find(c => c.slug === category) && (
            <span className="text-[#C49A3C] ml-2">→ {categories.find(c => c.slug === category)!.name}</span>
          )}
        </p>

        {/* Products grid */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <AdSenseUnit
              slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_PRODUCTS ?? ''}
              format="horizontal"
              className="mt-8"
            />
          </>
        ) : (
          <div className="text-center py-24">
            <p className="font-orbitron text-sm text-gray-600 uppercase tracking-wider">
              Ürün bulunamadı
            </p>
            {search && (
              <p className="font-mono text-xs text-gray-700 mt-2">
                "{search}" için sonuç yok
              </p>
            )}
            <Link href="/products" className="btn-neon mt-6 inline-block">
              Tüm Ürünlere Dön
            </Link>
          </div>
        )}
      </div>

    </main>
  );
}
