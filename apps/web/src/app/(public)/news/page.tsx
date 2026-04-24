import type { Metadata } from 'next';
import Link from 'next/link';
import { getNewsArticles } from '@compario/database';

export const revalidate = 3600;
import type { NewsArticle } from '@compario/database';
import { NewsCard } from '@/components/NewsCard';
import { AdSenseUnit } from '@/components/AdSenseUnit';

const CATEGORIES = [
  { value: '', label: 'Tümü' },
  { value: 'yeni-model', label: 'Yeni Model' },
  { value: 'test', label: 'Test & İnceleme' },
  { value: 'karsilastirma', label: 'Karşılaştırma' },
  { value: 'fiyat', label: 'Fiyat' },
  { value: 'teknoloji', label: 'Teknoloji' },
  { value: 'genel', label: 'Genel' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'En Yeni' },
  { value: 'most-viewed', label: 'En Çok Okunan' },
];

interface PageProps {
  searchParams: { category?: string; page?: string; sort?: string; search?: string };
}

const PER_PAGE = 12;

const APP_URL = 'https://compario.tech';

export function generateMetadata({ searchParams }: PageProps): Metadata {
  const cat = CATEGORIES.find((c) => c.value === searchParams.category);
  const isFiltered = !!cat?.value;
  const title = isFiltered ? `${cat!.label} Haberleri` : 'Haberler';
  const canonical = isFiltered ? `${APP_URL}/news?category=${cat!.value}` : `${APP_URL}/news`;
  const description = 'Güncel karşılaştırmalar, teknoloji haberleri, yeni model lansmanları ve fiyat güncellemeleri.';
  return {
    title: `${title} | Compario`,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} | Compario`,
      description,
      url: canonical,
      siteName: 'Compario',
      locale: 'tr_TR',
      type: 'website',
    },
    twitter: { card: 'summary', title: `${title} | Compario`, site: '@compariotech' },
  };
}

export default async function NewsPage({ searchParams }: PageProps) {
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const offset = (page - 1) * PER_PAGE;
  const sortBy = (searchParams.sort === 'most-viewed' ? 'most-viewed' : 'newest') as 'newest' | 'most-viewed';
  const search = searchParams.search?.trim();

  let articles: NewsArticle[] = [];
  let total = 0;

  try {
    const result = await getNewsArticles({
      category: searchParams.category,
      sortBy,
      search,
      limit: PER_PAGE,
      offset,
    });
    articles = result.data;
    total = result.total;
  } catch {
    // db not available
  }

  const activeCategory = searchParams.category ?? '';
  const totalPages = Math.ceil(total / PER_PAGE);

  // Featured hero: first article with cover image, only on page 1 without search
  const heroArticle = !search && page === 1 && articles[0]?.cover_image ? articles[0] : null;
  const gridArticles = heroArticle ? articles.slice(1) : articles;

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = { category: activeCategory, sort: sortBy, search, page: '1', ...overrides };
    Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v); });
    const qs = params.toString();
    return `/news${qs ? `?${qs}` : ''}`;
  }

  return (
    <main className="min-h-screen bg-grid">
      {/* Hero */}
      <section className="relative px-4 pt-32 pb-10 text-center">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] rounded-full blur-[100px] opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #C49A3C 0%, #8B9BAC 100%)' }}
        />
        <div className="relative z-10">
          <p className="font-mono text-[10px] text-neon-purple uppercase tracking-[0.4em] mb-4 opacity-70">
            ⬡ Compario
          </p>
          <h1 className="font-orbitron text-4xl sm:text-5xl font-black text-neon-cyan mb-3">
            HABERLER
          </h1>
          <p className="font-mono text-sm text-gray-500 max-w-xl mx-auto">
            Karşılaştırmalar, teknoloji haberleri ve yeni model lansmanları
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Search + Sort bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <form method="GET" action="/news" className="flex-1 flex gap-2">
            {activeCategory && <input type="hidden" name="category" value={activeCategory} />}
            {sortBy !== 'newest' && <input type="hidden" name="sort" value={sortBy} />}
            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Haber ara..."
              className="flex-1 bg-[#0c0c16] border border-[rgba(196,154,60,0.15)] rounded-lg px-4 py-2.5 font-mono text-xs text-gray-300 placeholder-gray-700 focus:outline-none focus:border-neon-cyan/40 transition-colors"
            />
            <button
              type="submit"
              className="px-4 py-2.5 border border-[rgba(196,154,60,0.2)] rounded-lg font-mono text-xs text-gray-500 hover:text-neon-cyan hover:border-neon-cyan/30 transition-colors"
            >
              Ara
            </button>
            {search && (
              <Link
                href={buildUrl({ search: undefined, page: '1' })}
                className="px-3 py-2.5 border border-[rgba(196,154,60,0.1)] rounded-lg font-mono text-xs text-gray-700 hover:text-gray-400 transition-colors"
              >
                ✕
              </Link>
            )}
          </form>

          {/* Sort */}
          <div className="flex gap-2">
            {SORT_OPTIONS.map((opt) => (
              <Link
                key={opt.value}
                href={buildUrl({ sort: opt.value, page: '1' })}
                className={`px-4 py-2.5 rounded-lg border font-mono text-xs uppercase tracking-wider transition-all ${
                  sortBy === opt.value
                    ? 'border-[rgba(196,154,60,0.4)] text-[#C49A3C] bg-[rgba(196,154,60,0.06)]'
                    : 'border-[rgba(196,154,60,0.1)] text-gray-600 hover:text-gray-300'
                }`}
              >
                {opt.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.value}
              href={buildUrl({ category: cat.value, page: '1' })}
              className={`px-4 py-2 rounded-full border font-mono text-xs uppercase tracking-wider transition-all ${
                activeCategory === cat.value
                  ? 'border-neon-cyan text-neon-cyan bg-neon-cyan/10'
                  : 'border-[rgba(196,154,60,0.12)] text-gray-500 hover:text-neon-cyan hover:border-neon-cyan/40'
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {/* Active search indicator */}
        {search && (
          <p className="font-mono text-xs text-gray-600 mb-6">
            <span className="text-neon-cyan">"{search}"</span> için {total} sonuç
          </p>
        )}

        {articles.length === 0 ? (
          <div className="text-center py-24 border border-[rgba(196,154,60,0.08)] rounded-xl">
            <p className="font-mono text-xs text-gray-600 uppercase tracking-widest mb-4">
              [ HABER BULUNAMADI ]
            </p>
            <Link href="/news" className="font-mono text-xs text-neon-cyan">
              Tüm haberlere dön →
            </Link>
          </div>
        ) : (
          <>
            {/* Featured hero — first article with image */}
            {heroArticle && (
              <Link
                href={`/news/${heroArticle.slug}`}
                className="group block relative rounded-xl overflow-hidden mb-8 border transition-all duration-300"
                style={{ border: '1px solid rgba(196,154,60,0.15)' }}
              >
                <div className="relative w-full h-[280px] sm:h-[420px] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroArticle.cover_image!}
                    alt={heroArticle.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                    style={{ transform: 'scale(1)' }}
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,9,14,0.97) 0%, rgba(8,9,14,0.5) 50%, rgba(8,9,14,0.1) 100%)' }} />

                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                    {(heroArticle as typeof heroArticle & { categories?: string[] }).categories?.[0] || heroArticle.category ? (
                      <span className="inline-block mb-3 px-3 py-1 rounded-full border font-mono text-[10px] uppercase tracking-wider border-neon-cyan/30 text-neon-cyan bg-neon-cyan/10">
                        {(heroArticle as typeof heroArticle & { categories?: string[] }).categories?.[0] ?? heroArticle.category}
                      </span>
                    ) : null}
                    <h2 className="font-orbitron text-2xl sm:text-3xl font-black text-white leading-tight mb-3 group-hover:text-neon-cyan transition-colors">
                      {heroArticle.title}
                    </h2>
                    {heroArticle.excerpt && (
                      <p className="font-mono text-sm text-gray-400 line-clamp-2 max-w-2xl">
                        {heroArticle.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-4">
                      {heroArticle.author && (
                        <span className="font-mono text-[10px] text-gray-600">{heroArticle.author}</span>
                      )}
                      {heroArticle.published_at && (
                        <span className="font-mono text-[10px] text-gray-600">
                          {new Date(heroArticle.published_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      )}
                      <span className="font-mono text-xs text-neon-cyan ml-auto group-hover:translate-x-1 transition-transform">
                        Oku →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridArticles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>

            <AdSenseUnit
              slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_NEWS ?? ''}
              format="horizontal"
              className="mt-8"
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-3">
                {page > 1 && (
                  <Link href={buildUrl({ page: String(page - 1) })} className="btn-neon text-xs py-2 px-5">
                    ← Önceki
                  </Link>
                )}
                <span className="font-mono text-xs text-gray-600">{page} / {totalPages}</span>
                {page < totalPages && (
                  <Link href={buildUrl({ page: String(page + 1) })} className="btn-neon text-xs py-2 px-5">
                    Sonraki →
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div className="pb-20" />
    </main>
  );
}
