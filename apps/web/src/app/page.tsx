import Link from 'next/link';
import Image from 'next/image';
import { getCategories, getFeaturedNews, getDailyComparison } from '@compario/database';
import type { Category, NewsArticle } from '@compario/database';
import { NewsCard } from '@/components/NewsCard';
import { Header } from '@/components/Header';
import { CompareBar } from '@/components/CompareBar';
import Divider from '@/components/Divider';

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

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Section label */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[rgba(183,36,255,0.2)]" />
        <span className="font-mono text-[10px] text-neon-purple uppercase tracking-[0.4em] opacity-80">
          ⬡ Günün Karşılaştırması
        </span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[rgba(183,36,255,0.2)]" />
      </div>

      {/* Two-column feature card */}
      <Link
        href={`/news/${comparison.slug}`}
        className="group block relative card-neon overflow-hidden hover:scale-[1.01] transition-transform duration-300"
      >
        <div className="grid md:grid-cols-2 gap-0">
          {/* Left: Image */}
          <div className="relative h-64 md:h-80 overflow-hidden">
            {comparison.cover_image ? (
              <Image
                src={comparison.cover_image}
                alt={comparison.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[rgba(183,36,255,0.15)] to-[rgba(8,9,14,1)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0c0c18] hidden md:block" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c18] to-transparent md:hidden" />
            {/* Badge */}
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neon-purple/20 backdrop-blur-sm border border-neon-purple/40 rounded-full font-mono text-[10px] text-neon-purple uppercase tracking-wider">
                ⚔ Günün Karşılaştırması
              </span>
            </div>
          </div>

          {/* Right: Content */}
          <div className="flex flex-col justify-center p-8">
            <h2 className="font-orbitron text-2xl sm:text-3xl font-black text-neon-cyan leading-tight mb-4 group-hover:text-white transition-colors line-clamp-3">
              {comparison.title}
            </h2>
            {comparison.excerpt && (
              <p className="font-mono text-sm text-gray-400 line-clamp-4 mb-6 leading-relaxed">
                {comparison.excerpt}
              </p>
            )}
            <div className="flex items-center gap-4">
              <span className="btn-neon text-xs">Karşılaştırmayı Gör</span>
              {comparison.published_at && (
                <span className="font-mono text-xs text-gray-600">
                  {new Date(comparison.published_at).toLocaleDateString('tr-TR')}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
}

async function NewsSection() {
  let news: NewsArticle[] = [];
  try {
    news = await getFeaturedNews(6);
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
        {/* Hero background image */}
        <div className="absolute inset-0 pointer-events-none">
          <Image
            src="/images/web/hero-banner.jpg"
            alt=""
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(8,9,14,0.3) 0%, rgba(8,9,14,0.7) 60%, #08090E 100%)' }} />
        </div>
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

      <Divider />

      {/* Daily Comparison — full width feature */}
      <DailyComparisonSection />

      <Divider />

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
        <div className="flex items-center gap-4 mb-10">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[rgba(196,154,60,0.15)]" />
          <h2 className="font-orbitron text-xs uppercase tracking-[0.3em] text-neon-cyan opacity-70">
            ⬡ Kategoriler
          </h2>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[rgba(196,154,60,0.15)]" />
        </div>
        <CategoriesSection />
      </section>

      <Divider />

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
