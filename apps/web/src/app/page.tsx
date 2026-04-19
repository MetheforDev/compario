import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getTopLevelCategories, getFeaturedNews, getDailyComparison, getTrendingProducts } from '@compario/database';
import type { Category, NewsArticle, Product } from '@compario/database';
import { NewsCard } from '@/components/NewsCard';
import { HeroCompareWidget } from '@/components/HeroCompareWidget';
import { Header } from '@/components/Header';
import { CompareBar } from '@/components/CompareBar';
import { CompareHistory } from '@/components/CompareHistory';
import { Footer } from '@/components/Footer';

export const revalidate = 3600;

const APP_URL = 'https://compario.tech';

export const metadata: Metadata = {
  title: 'Compario — Her Şeyi Karşılaştır, En İyisine Karar Ver',
  description: "Türkiye'nin en kapsamlı ürün karşılaştırma platformu. Araçlar, telefonlar, laptoplar, beyaz eşyalar ve daha fazlasını karşılaştırın.",
  alternates: { canonical: APP_URL },
  openGraph: {
    title: 'Compario — Her Şeyi Karşılaştır, En İyisine Karar Ver',
    description: "Türkiye'nin en kapsamlı ürün karşılaştırma platformu.",
    url: APP_URL, siteName: 'Compario', locale: 'tr_TR', type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compario — Her Şeyi Karşılaştır',
    description: "Türkiye'nin en kapsamlı ürün karşılaştırma platformu.",
    site: '@compariotech',
  },
};

// ─── Vertical section label (editorial style) ──────────────────────────────
function SideLabel({ children, color = 'cyan' }: { children: string; color?: 'cyan' | 'gold' | 'purple' }) {
  const colors = { cyan: '#00fff7', gold: '#C49A3C', purple: '#b724ff' };
  return (
    <div className="hidden lg:flex flex-col items-center gap-3 pt-1 w-10 shrink-0">
      <div className="w-px h-8" style={{ background: colors[color] + '33' }} />
      <span
        className="font-mono text-[8px] uppercase tracking-[0.4em] whitespace-nowrap"
        style={{ color: colors[color], opacity: 0.6, writingMode: 'vertical-lr', letterSpacing: '0.35em' }}
      >
        {children}
      </span>
    </div>
  );
}

// ─── Categories ────────────────────────────────────────────────────────────
async function CategoriesSection() {
  let categories: Category[] = [];
  try { categories = await getTopLevelCategories(true); } catch {}
  if (!categories.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
      <div className="flex gap-8 items-start">
        <SideLabel color="cyan">Kategoriler</SideLabel>

        <div className="flex-1 min-w-0">
          {/* Mobile label */}
          <p className="lg:hidden font-mono text-[9px] text-neon-cyan uppercase tracking-[0.4em] opacity-60 mb-6">⬡ Kategoriler</p>

          <div className="flex items-end justify-between mb-8">
            <h2 className="font-orbitron text-2xl sm:text-3xl font-black text-white">
              Neyi Karşılaştırmak<br />
              <span style={{ color: '#00fff7' }}>İstiyorsun?</span>
            </h2>
            <Link href="/categories" className="hidden sm:flex items-center gap-2 font-mono text-[10px] text-gray-500 hover:text-neon-cyan transition-colors uppercase tracking-wider">
              Tümünü Gör <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(196,154,60,0.07)',
                }}
              >
                {cat.image_url ? (
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                    <Image src={cat.image_url} alt={cat.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="48px" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl" style={{ background: 'rgba(196,154,60,0.06)' }}>
                    {cat.icon ?? '📦'}
                  </div>
                )}
                <span className="font-mono text-[9px] uppercase tracking-wider text-gray-500 group-hover:text-neon-cyan transition-colors text-center leading-tight">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-6 sm:hidden text-center">
            <Link href="/categories" className="font-mono text-[10px] text-neon-cyan uppercase tracking-wider">Tüm Kategoriler →</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Daily Comparison ──────────────────────────────────────────────────────
async function DailyComparisonSection() {
  let comparison: NewsArticle | null = null;
  try { comparison = await getDailyComparison(); } catch {}
  if (!comparison) return null;

  const allCategories = (comparison as typeof comparison & { categories?: string[] | null }).categories?.length
    ? (comparison as typeof comparison & { categories: string[] }).categories
    : comparison.category ? [comparison.category] : [];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
      <div className="flex gap-8 items-start">
        <SideLabel color="purple">Günün Seçimi</SideLabel>

        <div className="flex-1 min-w-0">
          <p className="lg:hidden font-mono text-[9px] text-neon-purple uppercase tracking-[0.4em] opacity-60 mb-6">⬡ Günün Karşılaştırması</p>

          <Link href={`/news/${comparison.slug}`} className="group block">
            <div
              className="relative rounded-2xl overflow-hidden transition-all duration-500 group-hover:scale-[1.005]"
              style={{
                border: '1px solid rgba(183,36,255,0.2)',
                boxShadow: '0 0 60px rgba(183,36,255,0.05), 0 40px 80px rgba(0,0,0,0.4)',
              }}
            >
              {/* Top accent line */}
              <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, #b724ff, transparent)' }} />

              <div className="flex flex-col lg:flex-row min-h-[380px]">
                {/* Image */}
                {comparison.cover_image && (
                  <div className="relative w-full lg:w-[52%] h-64 lg:h-auto overflow-hidden shrink-0">
                    <Image
                      src={comparison.cover_image}
                      alt={comparison.title}
                      fill priority
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width:1024px) 100vw, 52vw"
                    />
                    <div className="absolute inset-0 lg:hidden" style={{ background: 'linear-gradient(to top, #0D0F1A 0%, transparent 60%)' }} />
                    <div className="hidden lg:block absolute inset-0" style={{ background: 'linear-gradient(to right, transparent 55%, #0D0F1A 100%)' }} />
                  </div>
                )}

                {/* Content */}
                <div className="flex flex-col justify-center px-8 py-10 lg:py-14" style={{ background: 'rgba(13,15,26,0.97)' }}>
                  <span
                    className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full font-mono text-[9px] uppercase tracking-wider mb-6"
                    style={{ background: 'rgba(183,36,255,0.1)', border: '1px solid rgba(183,36,255,0.3)', color: '#b724ff' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-purple animate-pulse" />
                    Günün Karşılaştırması
                  </span>

                  <h2 className="font-orbitron text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight mb-4 group-hover:text-neon-purple transition-colors duration-300">
                    {comparison.title}
                  </h2>

                  {comparison.excerpt && (
                    <p className="font-mono text-sm text-gray-500 leading-relaxed mb-8 line-clamp-3">
                      {comparison.excerpt}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-8">
                    {allCategories.slice(0, 2).map((cat) => (
                      <span key={cat} className="font-mono text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider"
                        style={{ background: 'rgba(183,36,255,0.1)', border: '1px solid rgba(183,36,255,0.2)', color: '#b724ff' }}>
                        {cat}
                      </span>
                    ))}
                  </div>

                  <span
                    className="inline-flex items-center gap-2 self-start px-5 py-2.5 rounded-lg font-mono text-[11px] uppercase tracking-wider transition-all duration-300 group-hover:gap-3"
                    style={{ background: 'rgba(183,36,255,0.1)', border: '1px solid rgba(183,36,255,0.3)', color: '#b724ff' }}
                  >
                    Karşılaştırmayı Oku
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Trending ───────────────────────────────────────────────────────────────
async function TrendingSection() {
  let products: Product[] = [];
  try { products = await getTrendingProducts(6); } catch {}
  if (!products.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
      <div className="flex gap-8 items-start">
        {/* Right-aligned label for alternating effect */}
        <div className="flex-1 min-w-0">
          <p className="lg:hidden font-mono text-[9px] text-amber-400 uppercase tracking-[0.4em] opacity-60 mb-6">⬡ Trend</p>

          <div className="flex items-end justify-between mb-8">
            <h2 className="font-orbitron text-2xl sm:text-3xl font-black text-white">
              Trend
              <br />
              <span style={{ color: '#C49A3C' }}>Karşılaştırmalar</span>
            </h2>
            <Link href="/products" className="hidden sm:flex items-center gap-2 font-mono text-[10px] text-gray-500 hover:text-amber-400 transition-colors uppercase tracking-wider">
              Tümünü Gör <span>→</span>
            </Link>
          </div>

          {/* Ranked list layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {products.map((product, i) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(196,154,60,0.07)',
                }}
              >
                {/* Rank */}
                <div
                  className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-orbitron text-[10px] font-black"
                  style={i === 0
                    ? { background: 'rgba(196,154,60,0.9)', color: '#000' }
                    : { background: 'rgba(196,154,60,0.08)', color: '#C49A3C', border: '1px solid rgba(196,154,60,0.2)' }
                  }
                >
                  {i + 1}
                </div>

                {/* Image */}
                {product.image_url && (
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                    <Image src={product.image_url} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="48px" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  {product.brand && (
                    <p className="font-mono text-[8px] uppercase tracking-widest text-gray-600 mb-0.5">{product.brand}</p>
                  )}
                  <p className="font-orbitron text-[10px] font-bold text-gray-300 group-hover:text-neon-cyan transition-colors truncate">
                    {product.name}
                  </p>
                  {product.price_min ? (
                    <p className="font-orbitron text-[11px] font-black mt-1" style={{ color: '#C49A3C' }}>
                      ₺{product.price_min.toLocaleString('tr-TR')}
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 sm:hidden text-center">
            <Link href="/products" className="font-mono text-[10px] text-amber-400 uppercase tracking-wider">Tüm Ürünler →</Link>
          </div>
        </div>

        <SideLabel color="gold">Trend</SideLabel>
      </div>
    </section>
  );
}

// ─── News ───────────────────────────────────────────────────────────────────
async function NewsSection() {
  let news: NewsArticle[] = [];
  try { news = await getFeaturedNews(4); } catch {}
  if (!news.length) return null;

  const [featured, ...rest] = news;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
      <div className="flex gap-8 items-start">
        <SideLabel color="cyan">Haberler</SideLabel>

        <div className="flex-1 min-w-0">
          <p className="lg:hidden font-mono text-[9px] text-neon-cyan uppercase tracking-[0.4em] opacity-60 mb-6">⬡ Son Haberler</p>

          <div className="flex items-end justify-between mb-8">
            <h2 className="font-orbitron text-2xl sm:text-3xl font-black text-white">
              Son
              <br />
              <span style={{ color: '#00fff7' }}>Haberler</span>
            </h2>
            <Link href="/news" className="hidden sm:flex items-center gap-2 font-mono text-[10px] text-gray-500 hover:text-neon-cyan transition-colors uppercase tracking-wider">
              Tüm Haberler <span>→</span>
            </Link>
          </div>

          {/* Magazine layout: featured left, stack right */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
            {/* Featured article */}
            {featured && (
              <Link href={`/news/${featured.slug}`} className="group block">
                <div
                  className="relative rounded-2xl overflow-hidden h-full min-h-[340px]"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(0,255,247,0.08)',
                  }}
                >
                  {featured.cover_image && (
                    <div className="relative w-full h-52 overflow-hidden">
                      <Image
                        src={featured.cover_image}
                        alt={featured.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width:1024px) 100vw, 65vw"
                      />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0D0F1A 0%, transparent 60%)' }} />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-mono text-[8px] uppercase tracking-widest px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(0,255,247,0.06)', border: '1px solid rgba(0,255,247,0.12)', color: '#00fff7' }}>
                        {featured.category ?? 'Teknoloji'}
                      </span>
                      <span className="font-mono text-[8px] text-gray-600">
                        {new Date(featured.published_at ?? featured.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                      </span>
                    </div>
                    <h3 className="font-orbitron text-base sm:text-lg font-black text-white leading-tight group-hover:text-neon-cyan transition-colors mb-2">
                      {featured.title}
                    </h3>
                    {featured.excerpt && (
                      <p className="font-mono text-xs text-gray-500 leading-relaxed line-clamp-2">{featured.excerpt}</p>
                    )}
                  </div>
                </div>
              </Link>
            )}

            {/* Stacked smaller articles */}
            <div className="flex flex-col gap-4">
              {rest.slice(0, 3).map((article) => (
                <Link key={article.id} href={`/news/${article.slug}`} className="group flex gap-4 p-4 rounded-xl transition-all duration-300 hover:-translate-y-0.5"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(196,154,60,0.07)' }}>
                  {article.cover_image && (
                    <div className="relative w-20 h-16 rounded-lg overflow-hidden shrink-0">
                      <Image src={article.cover_image} alt={article.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="80px" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-[8px] text-gray-600 uppercase tracking-widest">
                      {new Date(article.published_at ?? article.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                    </span>
                    <h4 className="font-orbitron text-[11px] font-bold text-gray-300 group-hover:text-neon-cyan transition-colors leading-snug mt-0.5 line-clamp-2">
                      {article.title}
                    </h4>
                  </div>
                </Link>
              ))}

              <Link href="/news" className="flex items-center justify-center gap-2 py-3 rounded-xl font-mono text-[10px] uppercase tracking-wider text-gray-600 hover:text-neon-cyan transition-colors"
                style={{ border: '1px dashed rgba(0,255,247,0.08)' }}>
                Tüm Haberler →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────
function Divider() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(196,154,60,0.08), transparent)' }} />
    </div>
  );
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

      {/* ── Hero: Split layout ── */}
      <section className="relative overflow-hidden">
        {/* Ambient orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-[15%] w-[500px] h-[500px] rounded-full blur-[160px] opacity-[0.06]"
            style={{ background: '#C49A3C' }} />
          <div className="absolute top-[20%] right-[5%] w-[350px] h-[350px] rounded-full blur-[120px] opacity-[0.05]"
            style={{ background: '#00fff7' }} />
          <div className="absolute bottom-0 right-[30%] w-[300px] h-[300px] rounded-full blur-[120px] opacity-[0.04]"
            style={{ background: '#b724ff' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left: Brand + CTA */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-[9px] uppercase tracking-[0.3em] mb-8"
                style={{ background: 'rgba(196,154,60,0.06)', border: '1px solid rgba(196,154,60,0.15)', color: 'rgba(196,154,60,0.8)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Türkiye&apos;nin Karşılaştırma Platformu
              </div>

              <h1 className="font-orbitron text-5xl sm:text-6xl lg:text-7xl font-black leading-none mb-2"
                style={{ color: '#00fff7', textShadow: '0 0 60px rgba(0,255,247,0.2)' }}>
                COMPARIO
              </h1>
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-gray-600 mb-6">
                Her Şeyi Karşılaştır · En İyisine Karar Ver
              </p>

              <p className="font-mono text-sm text-gray-400 leading-relaxed mb-10 max-w-md">
                Telefon, laptop, araba, beyaz eşya — binlerce ürünü özellik ve fiyat bazında karşılaştır.
                Türkiye&apos;nin en kapsamlı karşılaştırma platformu.
              </p>

              <div className="flex flex-wrap gap-3 mb-14">
                <Link
                  href="/categories"
                  className="px-6 py-3 rounded-lg font-mono text-[11px] uppercase tracking-wider transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,255,247,0.12), rgba(0,255,247,0.06))',
                    border: '1px solid rgba(0,255,247,0.25)',
                    color: '#00fff7',
                    boxShadow: '0 0 20px rgba(0,255,247,0.05)',
                  }}
                >
                  Kategorilere Göz At →
                </Link>
                <Link
                  href="/products"
                  className="px-6 py-3 rounded-lg font-mono text-[11px] uppercase tracking-wider transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#6b7280',
                  }}
                >
                  Tüm Ürünler
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-8">
                {[
                  { value: '500+', label: 'Ürün' },
                  { value: '20+',  label: 'Kategori' },
                  { value: '∞',    label: 'Karşılaştırma' },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="font-orbitron text-2xl font-black mb-0.5" style={{ color: '#C49A3C' }}>{s.value}</p>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-gray-600">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: 3D Compare Widget */}
            <div className="flex items-center justify-center lg:justify-end">
              {widgetProducts.length >= 2 ? (
                <HeroCompareWidget products={widgetProducts} />
              ) : (
                /* Placeholder when no products */
                <div className="w-full max-w-xs aspect-square rounded-2xl flex items-center justify-center"
                  style={{ border: '1px solid rgba(0,255,247,0.08)', background: 'rgba(0,255,247,0.02)' }}>
                  <span className="font-orbitron text-[40px] opacity-10">◈</span>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      <Divider />
      <DailyComparisonSection />
      <Divider />
      <CategoriesSection />
      <Divider />
      <TrendingSection />
      <Divider />
      <NewsSection />

      {/* Bottom spacing */}
      <div className="h-16" />

      <CompareHistory />
      <CompareBar />
      <Footer />
    </main>
  );
}
