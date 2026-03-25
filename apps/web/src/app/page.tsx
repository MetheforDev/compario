import Link from 'next/link';
import { getCategories, getFeaturedNews } from '@compario/database';
import type { Category, NewsArticle } from '@compario/database';
import { NewsCard } from '@/components/NewsCard';
import { Header } from '@/components/Header';

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

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center gap-4 mb-10">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[rgba(196,154,60,0.15)]" />
          <h2 className="font-orbitron text-xs uppercase tracking-[0.3em] text-neon-cyan opacity-70">
            ⬡ Kategoriler
          </h2>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[rgba(196,154,60,0.15)]" />
        </div>
        {/* @ts-expect-error async server component */}
        <CategoriesSection />
      </section>

      {/* Divider */}
      <div className="border-t border-[rgba(196,154,60,0.08)] mx-4 sm:mx-6" />

      {/* Featured News */}
      {/* @ts-expect-error async server component */}
      <NewsSection />

      {/* Footer */}
      <footer className="border-t border-[rgba(196,154,60,0.06)] mt-10 py-8 text-center px-4">
        <p className="font-mono text-xs text-gray-700 uppercase tracking-widest">
          © 2026 Compario — Tüm Hakları Saklıdır
        </p>
      </footer>
    </main>
  );
}
