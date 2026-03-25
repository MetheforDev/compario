import type { Metadata } from 'next';
import Link from 'next/link';
import { getNewsArticles } from '@compario/database';
import { NewsCard } from '@/components/NewsCard';

export const metadata: Metadata = {
  title: 'Otomotiv Haberleri | Compario',
  description: 'Türkiye otomotiv dünyasından son haberler, yeni model lansmanları, araç testleri ve fiyat güncellemeleri.',
};

const CATEGORIES = [
  { value: '', label: 'Tümü' },
  { value: 'yeni-model', label: 'Yeni Model' },
  { value: 'test', label: 'Test & İnceleme' },
  { value: 'karsilastirma', label: 'Karşılaştırma' },
  { value: 'fiyat', label: 'Fiyat' },
  { value: 'teknoloji', label: 'Teknoloji' },
  { value: 'genel', label: 'Genel' },
];

interface PageProps {
  searchParams: { category?: string; page?: string };
}

const PER_PAGE = 12;

export default async function NewsPage({ searchParams }: PageProps) {
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const offset = (page - 1) * PER_PAGE;

  let articles: import('@compario/database').NewsArticle[] = [];
  let total = 0;

  try {
    const result = await getNewsArticles({
      category: searchParams.category,
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

  return (
    <main className="min-h-screen bg-grid">
      {/* Hero */}
      <section className="relative px-4 pt-32 pb-12 text-center">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] rounded-full blur-[100px] opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #C49A3C 0%, #8B9BAC 100%)' }}
        />
        <div className="relative z-10">
          <p className="font-mono text-[10px] text-neon-purple uppercase tracking-[0.4em] mb-4 opacity-70">
            ⬡ Otomotiv
          </p>
          <h1 className="font-orbitron text-4xl sm:text-5xl font-black text-neon-cyan text-glow-cyan mb-3">
            HABERLER
          </h1>
          <p className="font-mono text-sm text-gray-500 max-w-xl mx-auto">
            2026 model araçlar, lansmanlar, testler ve fiyat güncellemeleri
          </p>
        </div>
      </section>

      {/* Category tabs */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.value}
              href={`/news${cat.value ? `?category=${cat.value}` : ''}`}
              className={`px-4 py-2 rounded-full border font-mono text-xs uppercase tracking-wider transition-all ${
                activeCategory === cat.value
                  ? 'border-neon-cyan text-neon-cyan bg-neon-cyan/10 shadow-[0_0_10px_rgba(196,154,60,0.2)]'
                  : 'border-[rgba(196,154,60,0.12)] text-gray-500 hover:text-neon-cyan hover:border-neon-cyan/40'
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {/* Articles grid */}
        {articles.length === 0 ? (
          <div className="text-center py-24 border border-[rgba(196,154,60,0.08)] rounded-lg">
            <p className="font-mono text-xs text-gray-600 uppercase tracking-widest">
              [ HABER BULUNAMADI ]
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-3">
                {page > 1 && (
                  <Link
                    href={`/news?${activeCategory ? `category=${activeCategory}&` : ''}page=${page - 1}`}
                    className="btn-neon text-xs py-2 px-5"
                  >
                    ← Önceki
                  </Link>
                )}
                <span className="font-mono text-xs text-gray-600">
                  {page} / {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={`/news?${activeCategory ? `category=${activeCategory}&` : ''}page=${page + 1}`}
                    className="btn-neon text-xs py-2 px-5"
                  >
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
