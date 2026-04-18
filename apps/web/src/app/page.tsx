import Link from 'next/link';
import Image from 'next/image';
import { getTopLevelCategories, getFeaturedNews, getDailyComparison, getTrendingProducts } from '@compario/database';

export const revalidate = 3600;
import type { Category, NewsArticle, Product } from '@compario/database';
import { NewsCard } from '@/components/NewsCard';
import { HeroCompareWidget } from '@/components/HeroCompareWidget';
import { Header } from '@/components/Header';
import { CompareBar } from '@/components/CompareBar';
import { CompareHistory } from '@/components/CompareHistory';
import { Footer } from '@/components/Footer';

// ─── Section Heading ────────────────────────────────────────────────────────
function SectionHeading({ label, color = 'cyan' }: { label: string; color?: 'cyan' | 'gold' | 'purple' }) {
  const colorMap = {
    cyan:   { text: '#00fff7', line: 'rgba(0,255,247,0.15)' },
    gold:   { text: '#C49A3C', line: 'rgba(196,154,60,0.2)' },
    purple: { text: '#b724ff', line: 'rgba(183,36,255,0.2)' },
  };
  const c = colorMap[color];
  return (
    <div className="flex items-center gap-4 mb-10">
      <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${c.line})` }} />
      <h2 className="font-orbitron text-[11px] uppercase tracking-[0.4em] font-black whitespace-nowrap" style={{ color: c.text }}>
        ⬡ {label}
      </h2>
      <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${c.line})` }} />
    </div>
  );
}

// ─── Category Card ───────────────────────────────────────────────────────────
function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group relative flex flex-col items-center gap-3 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        background: 'linear-gradient(135deg, rgba(15,15,28,0.9) 0%, rgba(10,10,20,0.95) 100%)',
        border: '1px solid rgba(196,154,60,0.08)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* Görsel veya emoji arka plan */}
      {category.image_url ? (
        <div className="relative w-full h-28 overflow-hidden">
          <Image
            src={category.image_url}
            alt={category.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width:640px) 50vw, 20vw"
          />
          {/* Altta gradient geçiş */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,10,20,1) 0%, rgba(10,10,20,0.2) 60%, transparent 100%)' }} />
          {/* Hover overlay */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'rgba(0,255,247,0.06)' }} />
        </div>
      ) : (
        <div className="w-full h-28 flex items-center justify-center"
          style={{ background: 'rgba(196,154,60,0.04)' }}>
          <span className="text-4xl" aria-hidden="true">{category.icon ?? '📦'}</span>
        </div>
      )}

      {/* İsim */}
      <div className="px-3 pb-4 text-center">
        <h3 className="font-orbitron text-[10px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-neon-cyan transition-colors">
          {category.name}
        </h3>
        <span className="font-mono text-[8px] text-neon-purple opacity-0 group-hover:opacity-100 transition-opacity tracking-widest">
          İNCELE →
        </span>
      </div>
    </Link>
  );
}

async function CategoriesSection() {
  let categories: Category[] = [];
  try { categories = await getTopLevelCategories(true); } catch {}
  if (categories.length === 0) return (
    <p className="text-center py-16 text-gray-700 font-mono text-xs">[ KATEGORİ BULUNAMADI ]</p>
  );
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {categories.map((cat) => <CategoryCard key={cat.id} category={cat} />)}
    </div>
  );
}

// ─── Daily Comparison — cinematic card ───────────────────────────────────────
async function DailyComparisonSection() {
  let comparison: NewsArticle | null = null;
  try { comparison = await getDailyComparison(); } catch {}
  if (!comparison) return null;

  const allCategories = (comparison as typeof comparison & { categories?: string[] | null }).categories?.length
    ? (comparison as typeof comparison & { categories: string[] }).categories
    : comparison.category ? [comparison.category] : [];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <SectionHeading label="Günün Karşılaştırması" color="purple" />

      <Link href={`/news/${comparison.slug}`} className="group block">
        <div
          className="relative rounded-2xl overflow-hidden transition-all duration-500 group-hover:scale-[1.005]"
          style={{
            background: 'linear-gradient(135deg, rgba(12,12,24,0.97) 0%, rgba(8,8,18,0.99) 100%)',
            border: '1px solid rgba(183,36,255,0.25)',
            boxShadow: '0 0 0 1px rgba(183,36,255,0.06), 0 40px 80px rgba(0,0,0,0.5), 0 0 60px rgba(183,36,255,0.06)',
          }}
        >
          {/* Purple top accent */}
          <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, transparent, #b724ff, rgba(183,36,255,0.4), transparent)' }} />

          <div className="flex flex-col lg:flex-row">
            {/* Image */}
            {comparison.cover_image && (
              <div className="relative w-full lg:w-[55%] h-[260px] sm:h-[360px] lg:h-auto lg:min-h-[400px] overflow-hidden flex-shrink-0">
                <Image
                  src={comparison.cover_image}
                  alt={comparison.title}
                  fill
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 55vw"
                />
                {/* Gradient right */}
                <div className="absolute inset-0 lg:hidden" style={{ background: 'linear-gradient(to top, rgba(8,8,18,1) 0%, rgba(8,8,18,0.3) 60%, transparent 100%)' }} />
                <div className="hidden lg:block absolute inset-0" style={{ background: 'linear-gradient(to right, transparent 60%, rgba(8,8,18,1) 100%)' }} />
                <div className="hidden lg:block absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,8,18,0.6) 0%, transparent 50%)' }} />
              </div>
            )}

            {/* Content */}
            <div className={`flex flex-col justify-center px-6 py-8 lg:px-10 lg:py-12 ${!comparison.cover_image ? 'w-full' : ''}`}>
              {/* Badge */}
              <div className="mb-5">
                <span
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-mono text-[9px] uppercase tracking-[0.25em]"
                  style={{
                    background: 'rgba(183,36,255,0.12)',
                    border: '1px solid rgba(183,36,255,0.35)',
                    color: '#b724ff',
                    boxShadow: '0 0 20px rgba(183,36,255,0.1)',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-purple animate-pulse" />
                  Günün Karşılaştırması
                </span>
              </div>

              <h2 className="font-orbitron text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight mb-4 group-hover:text-neon-purple transition-colors duration-300">
                {comparison.title}
              </h2>

              {comparison.excerpt && (
                <p className="font-mono text-sm text-gray-500 leading-relaxed mb-6 line-clamp-3 lg:line-clamp-4">
                  {comparison.excerpt}
                </p>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {allCategories.map((cat) => (
                  <span key={cat} className="font-mono text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider"
                    style={{ background: 'rgba(183,36,255,0.1)', border: '1px solid rgba(183,36,255,0.2)', color: '#b724ff' }}>
                    {cat}
                  </span>
                ))}
                {comparison.tags?.slice(0, 3).map((tag) => (
                  <span key={tag} className="font-mono text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#6b7280' }}>
                    #{tag}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="flex items-center gap-3">
                <span
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-mono text-[11px] uppercase tracking-wider transition-all duration-300 group-hover:gap-3"
                  style={{
                    background: 'rgba(183,36,255,0.12)',
                    border: '1px solid rgba(183,36,255,0.3)',
                    color: '#b724ff',
                  }}
                >
                  Karşılaştırmayı Oku
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
                {comparison.view_count > 0 && (
                  <span className="font-mono text-[10px] text-gray-700">{comparison.view_count.toLocaleString('tr-TR')} okuma</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
}

// ─── Trending Product Card ────────────────────────────────────────────────────
function TrendingProductCard({ product, rank }: { product: Product; rank: number }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5"
      style={{
        background: 'linear-gradient(135deg, rgba(15,15,28,0.95) 0%, rgba(10,10,20,0.98) 100%)',
        border: '1px solid rgba(196,154,60,0.08)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      {/* Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#0c0c16]">
        {product.image_url ? (
          <>
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'linear-gradient(to top, rgba(196,154,60,0.15) 0%, transparent 60%)' }} />
          </>
        ) : (
          <span className="absolute inset-0 flex items-center justify-center font-mono text-3xl opacity-10">◈</span>
        )}
        {/* Rank badge */}
        <div className="absolute top-2 left-2">
          <span className="font-orbitron text-[8px] font-black px-2 py-0.5 rounded"
            style={{
              background: rank === 1 ? 'rgba(196,154,60,0.9)' : 'rgba(0,0,0,0.7)',
              color: rank === 1 ? '#000' : '#C49A3C',
              border: rank === 1 ? 'none' : '1px solid rgba(196,154,60,0.3)',
            }}>
            #{rank}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1.5">
        {product.brand && (
          <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-gray-600">{product.brand}</p>
        )}
        <h3 className="font-orbitron text-xs font-bold text-gray-300 leading-snug line-clamp-2 group-hover:text-neon-cyan transition-colors">
          {product.name}
        </h3>
        {product.price_min ? (
          <p className="font-orbitron text-sm font-black mt-auto" style={{ color: '#C49A3C' }}>
            ₺{product.price_min.toLocaleString('tr-TR')}
          </p>
        ) : null}
        {product.compare_count > 0 && (
          <p className="font-mono text-[9px] text-gray-700 uppercase tracking-wider">
            {product.compare_count.toLocaleString('tr-TR')}× karşılaştırıldı
          </p>
        )}
      </div>
    </Link>
  );
}

async function TrendingSection() {
  let products: Product[] = [];
  try { products = await getTrendingProducts(6); } catch {}
  if (products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <SectionHeading label="Trend Karşılaştırmalar" color="gold" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {products.map((product, i) => (
          <TrendingProductCard key={product.id} product={product} rank={i + 1} />
        ))}
      </div>
      <div className="mt-10 text-center">
        <Link href="/products" className="btn-neon">Tüm Ürünlere Bak →</Link>
      </div>
    </section>
  );
}

// ─── Featured News ────────────────────────────────────────────────────────────
async function NewsSection() {
  let news: NewsArticle[] = [];
  try { news = await getFeaturedNews(3); } catch {}
  if (news.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <SectionHeading label="Son Haberler" color="cyan" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((article) => <NewsCard key={article.id} article={article} />)}
      </div>
      <div className="mt-10 text-center">
        <Link href="/news" className="btn-neon-purple">Tüm Haberler →</Link>
      </div>
    </section>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────
function Divider() {
  return <div className="border-t border-[rgba(196,154,60,0.06)] mx-4 sm:mx-6" />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function HomePage() {
  let heroProducts: Product[] = [];
  try { heroProducts = await getTrendingProducts(2); } catch {}

  const widgetProducts = heroProducts.map((p, i) => ({
    name: p.name,
    brand: p.brand,
    image_url: p.image_url,
    price_min: p.price_min,
    score: i === 0 ? 87 : 68,
    isWinner: i === 0,
  }));

  return (
    <main className="min-h-screen bg-grid">
      <Header />

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 pt-32 pb-24 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[140px] opacity-[0.07]"
            style={{ background: 'radial-gradient(ellipse, #C49A3C 0%, transparent 70%)' }} />
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full blur-[100px] opacity-[0.04]"
            style={{ background: '#00fff7' }} />
          <div className="absolute top-1/3 right-1/4 w-[250px] h-[250px] rounded-full blur-[100px] opacity-[0.04]"
            style={{ background: '#b724ff' }} />
        </div>

        <div className="relative z-10 w-full max-w-3xl">
          <p className="font-mono text-[10px] text-neon-purple uppercase tracking-[0.35em] mb-6 opacity-80">
            ⬡ Türkiye&apos;nin Karşılaştırma Platformu
          </p>

          <h1 className="font-orbitron text-5xl sm:text-6xl md:text-7xl font-black text-neon-cyan text-glow-cyan mb-4 leading-none">
            COMPARIO
          </h1>

          <p className="font-mono text-[11px] text-gray-500 uppercase tracking-[0.3em] mb-10">
            Her Şeyi Karşılaştır. En İyisine Karar Ver
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-2">
            <Link href="/categories" className="btn-neon">Kategorilere Göz At</Link>
            <Link href="/categories" className="btn-neon-purple">Ürünleri Karşılaştır</Link>
          </div>

          {/* 3D animated comparison widget — real trending products */}
          {widgetProducts.length >= 2 && (
            <HeroCompareWidget products={widgetProducts} />
          )}
        </div>
      </section>

      <Divider />
      <DailyComparisonSection />
      <Divider />

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <SectionHeading label="Kategoriler" color="cyan" />
        <CategoriesSection />
        <div className="mt-10 text-center">
          <Link href="/categories" className="btn-neon">Tüm Kategoriler →</Link>
        </div>
      </section>

      <Divider />
      <TrendingSection />
      <Divider />
      <NewsSection />
      <Divider />

      <CompareHistory />
      <CompareBar />
      <Footer />
    </main>
  );
}
