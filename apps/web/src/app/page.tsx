import Link from 'next/link';
import { getCategories, getFeaturedNews, getDailyComparison } from '@compario/database';
import type { Category, NewsArticle } from '@compario/database';
import { NewsCard } from '@/components/NewsCard';
import { Header } from '@/components/Header';
import { CompareBar } from '@/components/CompareBar';

function CategoryIcon({ icon }: { icon: string | null }) {
  return (
    <span className="text-3xl" aria-hidden="true">
      {icon ?? '📦'}
    </span>
  );
}

function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="card-neon p-6 flex flex-col gap-3 group cursor-pointer"
    >
      <CategoryIcon icon={category.icon} />
      <h3 className="font-orbitron text-sm font-semibold text-neon-cyan uppercase tracking-wider group-hover:text-glow-cyan transition-all">
        {category.name}
      </h3>
      {category.description && (
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
          {category.description}
        </p>
      )}
      <span className="mt-auto text-xs text-neon-purple font-mono opacity-0 group-hover:opacity-100 transition-opacity">
        İNCELE →
      </span>
    </Link>
  );
}

async function CategoriesSection() {
  let categories: Category[] = [];
  try {
    categories = await getCategories(true);
  } catch {
    // Database not reachable in build/dev without env vars
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-16 text-gray-600 font-mono text-sm">
        <p>[ KATEGORİ BULUNAMADI ]</p>
        <p className="mt-2 text-xs">Veritabanı bağlantısı gerekiyor.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {categories.map((cat) => (
        <CategoryCard key={cat.id} category={cat} />
      ))}
    </div>
  );
}

async function DailyComparisonSection() {
  let comparison: NewsArticle | null = null;
  try {
    comparison = await getDailyComparison();
  } catch {
    // Database not reachable
  }

  if (!comparison) return null;

  const allCategories = (comparison as typeof comparison & { categories?: string[] | null }).categories?.length
    ? (comparison as typeof comparison & { categories?: string[] }).categories!
    : comparison.category
    ? [comparison.category]
    : [];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Section label */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[rgba(183,36,255,0.2)]" />
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-neon-purple uppercase tracking-[0.4em] opacity-80">
            ⬡ Günün Karşılaştırması
          </span>
        </div>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[rgba(183,36,255,0.2)]" />
      </div>

      {/* Featured card */}
      <Link
        href={`/news/${comparison.slug}`}
        className="group block relative rounded-xl overflow-hidden border border-[rgba(183,36,255,0.2)] bg-[#0c0c18] hover:border-neon-purple/50 transition-all duration-300"
      >
        {/* Cover image */}
        {comparison.cover_image ? (
          <div className="relative w-full h-[280px] sm:h-[360px] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={comparison.cover_image}
              alt={comparison.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c18] via-[#0c0c18]/60 to-transparent" />

            {/* "Günün Karşılaştırması" badge — top-left */}
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neon-purple/90 backdrop-blur-sm rounded-full font-mono text-[10px] text-white uppercase tracking-wider">
                ⚔ Günün Karşılaştırması
              </span>
            </div>

            {/* Title overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h2 className="font-orbitron text-xl sm:text-2xl font-black text-white leading-tight group-hover:text-neon-purple transition-colors">
                {comparison.title}
              </h2>
              {comparison.excerpt && (
                <p className="font-mono text-sm text-gray-400 mt-2 line-clamp-2">
                  {comparison.excerpt}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8">
            <div className="mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neon-purple/20 border border-neon-purple/30 rounded-full font-mono text-[10px] text-neon-purple uppercase tracking-wider">
                ⚔ Günün Karşılaştırması
              </span>
            </div>
            <h2 className="font-orbitron text-xl sm:text-2xl font-black text-white leading-tight mb-3 group-hover:text-neon-purple transition-colors">
              {comparison.title}
            </h2>
            {comparison.excerpt && (
              <p className="font-mono text-sm text-gray-400 line-clamp-3">
                {comparison.excerpt}
              </p>
            )}
          </div>
        )}

        {/* Footer strip */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-[rgba(183,36,255,0.1)]">
          <div className="flex items-center gap-3 flex-wrap">
            {allCategories.map((cat) => (
              <span key={cat} className="font-mono text-[10px] text-neon-purple uppercase tracking-wider">
                #{cat}
              </span>
            ))}
            {comparison.tags?.slice(0, 3).map((tag) => (
              <span key={tag} className="font-mono text-[10px] text-gray-600 uppercase tracking-wider">
                #{tag}
              </span>
            ))}
          </div>
          <span className="font-mono text-xs text-neon-purple group-hover:translate-x-1 transition-transform">
            Karşılaştırmayı Oku →
          </span>
        </div>
      </Link>
    </section>
  );
}

async function NewsSection() {
  let news: NewsArticle[] = [];
  try {
    news = await getFeaturedNews(3);
  } catch {
    // Database not reachable
  }

  if (news.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="flex items-center gap-4 mb-10">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[rgba(196,154,60,0.15)]" />
        <h2 className="font-orbitron text-xs uppercase tracking-[0.3em] text-neon-cyan opacity-70">
          ⬡ Son Haberler
        </h2>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[rgba(196,154,60,0.15)]" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link href="/news" className="btn-neon-purple">
          Tüm Haberler →
        </Link>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-grid">
      <Header />
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 pt-28 pb-20 overflow-hidden">
        {/* Glow orb — max-w clamped to prevent mobile overflow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[300px] rounded-full blur-[120px] opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #C49A3C 0%, #4A5568 100%)' }}
        />

        <div className="relative z-10 w-full max-w-3xl">
          <p className="font-mono text-xs text-neon-purple uppercase tracking-[0.3em] mb-6 opacity-80">
            ⬡ Ürün Karşılaştırma Platformu
          </p>

          <h1 className="font-orbitron text-5xl sm:text-6xl md:text-7xl font-black text-neon-cyan text-glow-cyan mb-4 leading-none">
            COMPARIO
          </h1>

          <p className="font-orbitron text-sm sm:text-base text-gray-400 uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-10">
            Her Şeyi Karşılaştır, En İyisine Karar Ver
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/categories" className="btn-neon">
              Kategorilere Göz At
            </Link>
            <Link href="/categories" className="btn-neon-purple">
              Ürünleri Karşılaştır
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-[rgba(196,154,60,0.08)] mx-4 sm:mx-6" />

      {/* Daily Comparison — full width feature */}
      <DailyComparisonSection />

      {/* Divider */}
      <div className="border-t border-[rgba(196,154,60,0.08)] mx-4 sm:mx-6" />

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center gap-4 mb-10">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[rgba(196,154,60,0.15)]" />
          <h2 className="font-orbitron text-xs uppercase tracking-[0.3em] text-neon-cyan opacity-70">
            ⬡ Kategoriler
          </h2>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[rgba(196,154,60,0.15)]" />
        </div>
        <CategoriesSection />
      </section>

      {/* Divider */}
      <div className="border-t border-[rgba(196,154,60,0.08)] mx-4 sm:mx-6" />

      {/* Featured News */}
      <NewsSection />

      <CompareBar />

      {/* Footer */}
      <footer className="border-t border-[rgba(196,154,60,0.06)] mt-10 py-8 text-center px-4">
        <p className="font-mono text-xs text-gray-700 uppercase tracking-widest">
          © 2026 Compario — Tüm Hakları Saklıdır
        </p>
      </footer>
    </main>
  );
}
