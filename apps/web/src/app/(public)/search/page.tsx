import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { searchProducts, searchNews, getTopLevelCategories, getSubCategories, getCategoryBySlug } from '@compario/database';
import type { SearchProductResult } from '@compario/database';
import type { NewsArticle } from '@compario/database';
import { SearchInput } from '@/components/SearchInput';

interface PageProps {
  searchParams: { q?: string; tab?: string; category?: string };
}

export function generateMetadata({ searchParams }: PageProps): Metadata {
  const q = searchParams.q?.trim();
  return {
    title: q ? `"${q}" — Arama Sonuçları` : 'Arama',
    description: q
      ? `"${q}" için Compario arama sonuçları — ürünler, haberler`
      : "Compario'da ürün ve haber arayın",
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  'yeni-model': 'Yeni Model',
  test: 'Test & İnceleme',
  karsilastirma: 'Karşılaştırma',
  fiyat: 'Fiyat',
  teknoloji: 'Teknoloji',
  genel: 'Genel',
};

function hl(text: string, q: string): React.ReactNode {
  if (!q || !text) return text;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === q.toLowerCase() ? (
      <mark key={i} className="bg-transparent text-neon-cyan font-semibold">{part}</mark>
    ) : part,
  );
}

function ProductResult({ product, q }: { product: SearchProductResult; q: string }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="flex gap-4 p-4 rounded-xl border border-[rgba(0,255,247,0.08)] bg-[rgba(255,255,255,0.02)] hover:border-neon-cyan/30 hover:bg-[rgba(0,255,247,0.03)] transition-all group"
    >
      <div className="relative w-16 h-16 rounded-lg border border-[rgba(0,255,247,0.1)] bg-[#0a0a14] flex-shrink-0 overflow-hidden">
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="64px" />
        ) : (
          <span className="w-full h-full flex items-center justify-center text-gray-700 font-mono">◈</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <h3 className="font-orbitron text-sm font-bold text-white group-hover:text-neon-cyan transition-colors truncate flex-1">
            {hl(product.name, q)}
          </h3>
          {product._matchType === 'exact' && (
            <span className="flex-shrink-0 font-mono text-[9px] text-neon-cyan border border-neon-cyan/30 bg-neon-cyan/5 rounded px-1.5 py-0.5 uppercase tracking-wider">
              Tam eşleşme
            </span>
          )}
        </div>
        {product.brand && (
          <p className="font-mono text-xs text-gray-500 mt-0.5">
            {hl(product.brand, q)}
            {product.model ? <> · {hl(product.model, q)}</> : null}
          </p>
        )}
        {product.price_min && (
          <p className="font-mono text-sm font-bold mt-1.5" style={{ color: '#C49A3C' }}>
            ₺{product.price_min.toLocaleString('tr-TR')}
            {product.price_max && product.price_max !== product.price_min
              ? ` — ₺${product.price_max.toLocaleString('tr-TR')}`
              : ''}
          </p>
        )}
      </div>
      <span className="font-mono text-xs text-gray-700 group-hover:text-neon-cyan transition-colors self-center flex-shrink-0">→</span>
    </Link>
  );
}

function NewsResult({ article, q }: { article: NewsArticle; q: string }) {
  const cat = article.category ? (CATEGORY_LABELS[article.category] ?? article.category) : null;
  return (
    <Link
      href={`/news/${article.slug}`}
      className="flex gap-4 p-4 rounded-xl border border-[rgba(183,36,255,0.08)] bg-[rgba(255,255,255,0.02)] hover:border-neon-purple/30 hover:bg-[rgba(183,36,255,0.03)] transition-all group"
    >
      {article.cover_image && (
        <div className="relative w-20 h-14 rounded-lg border border-[rgba(183,36,255,0.1)] bg-[#0a0a14] flex-shrink-0 overflow-hidden">
          <Image src={article.cover_image} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="80px" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        {cat && (
          <span className="inline-block font-mono text-[9px] uppercase tracking-wider text-neon-purple border border-neon-purple/20 bg-neon-purple/5 rounded px-1.5 py-0.5 mb-1.5">
            {cat}
          </span>
        )}
        <h3 className="font-orbitron text-sm font-bold text-white group-hover:text-neon-purple transition-colors line-clamp-2 leading-snug">
          {hl(article.title, q)}
        </h3>
        {article.excerpt && (
          <p className="font-mono text-xs text-gray-600 line-clamp-1 mt-1">{article.excerpt}</p>
        )}
        {article.published_at && (
          <p className="font-mono text-[10px] text-gray-700 mt-1.5">
            {new Date(article.published_at).toLocaleDateString('tr-TR', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        )}
      </div>
      <span className="font-mono text-xs text-gray-700 group-hover:text-neon-purple transition-colors self-center flex-shrink-0">→</span>
    </Link>
  );
}

export default async function SearchPage({ searchParams }: PageProps) {
  const q = searchParams.q?.trim() ?? '';
  const tab = searchParams.tab ?? 'all';
  const categorySlug = searchParams.category ?? '';

  // Tüm üst düzey kategorileri filtre için çek
  const topCategories = await getTopLevelCategories(true).catch(() => []);

  // Kategori filtresi aktifse, o kategorinin tüm alt ID'lerini bul
  let categoryIds: string[] | undefined;
  if (categorySlug) {
    const selectedCat = await getCategoryBySlug(categorySlug).catch(() => null);
    if (selectedCat) {
      const subs = await getSubCategories(selectedCat.id, true).catch(() => []);
      categoryIds = [selectedCat.id, ...subs.map(s => s.id)];
    }
  }

  let products: SearchProductResult[] = [];
  let news: NewsArticle[] = [];
  let searchDone = false;

  if (q.length >= 2) {
    searchDone = true;
    [products, news] = await Promise.all([
      searchProducts(q, 12, categoryIds).catch(() => []),
      categoryIds ? Promise.resolve([]) : searchNews(q, 8).catch(() => []),
    ]);
  }

  const totalResults = products.length + news.length;
  const exactCount = products.filter((p) => p._matchType === 'exact').length;

  const tabs = [
    { key: 'all', label: 'Tümü', count: totalResults },
    { key: 'products', label: 'Ürünler', count: products.length },
    { key: 'news', label: 'Haberler', count: news.length },
  ];

  const showProducts = tab === 'all' || tab === 'products';
  const showNews = tab === 'all' || tab === 'news';

  return (
    <main className="min-h-screen bg-grid">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-32 pb-20">
        {/* Header */}
        <div className="mb-8">
          <p className="font-mono text-[10px] text-neon-purple uppercase tracking-[0.4em] opacity-70 mb-2">
            ⬡ Arama
          </p>
          <h1 className="font-orbitron text-3xl font-black text-neon-cyan text-glow-cyan mb-6">
            {q ? `"${q}"` : 'ARAMA'}
          </h1>
          <SearchInput initialValue={q} />

          {/* Kategori filtresi */}
          {topCategories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={q ? `/search?q=${encodeURIComponent(q)}` : '/search'}
                className="px-3 py-1.5 rounded-full border font-mono text-[10px] uppercase tracking-wider transition-all"
                style={{
                  borderColor: !categorySlug ? 'rgba(0,255,247,0.4)' : 'rgba(0,255,247,0.1)',
                  color: !categorySlug ? '#00fff7' : '#6b7280',
                  background: !categorySlug ? 'rgba(0,255,247,0.06)' : 'transparent',
                }}
              >
                Tümü
              </Link>
              {topCategories.map(cat => (
                <Link
                  key={cat.id}
                  href={`/search?${q ? `q=${encodeURIComponent(q)}&` : ''}category=${cat.slug}`}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full border font-mono text-[10px] uppercase tracking-wider transition-all"
                  style={{
                    borderColor: categorySlug === cat.slug ? 'rgba(0,255,247,0.4)' : 'rgba(0,255,247,0.1)',
                    color: categorySlug === cat.slug ? '#00fff7' : '#6b7280',
                    background: categorySlug === cat.slug ? 'rgba(0,255,247,0.06)' : 'transparent',
                  }}
                >
                  {cat.icon && <span className="text-[12px] opacity-70">{cat.icon}</span>}
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        {searchDone && (
          <>
            {totalResults === 0 ? (
              <div className="text-center py-20">
                <p className="font-orbitron text-5xl text-gray-800 mb-4">Ø</p>
                <p className="font-mono text-sm text-gray-500">
                  <span className="text-gray-400">"{q}"</span> için sonuç bulunamadı.
                </p>
                <p className="font-mono text-xs text-gray-700 mt-2">
                  Farklı anahtar kelimeler deneyin — marka, model veya özellik
                </p>
              </div>
            ) : (
              <>
                {/* Stats bar */}
                <div className="flex items-center gap-3 mb-5">
                  <p className="font-mono text-xs text-gray-600 flex-1">
                    <span className="text-neon-cyan font-semibold">{totalResults}</span> sonuç bulundu
                    {exactCount > 0 && (
                      <span className="ml-2 text-gray-700">
                        · <span className="text-neon-cyan">{exactCount}</span> tam eşleşme
                      </span>
                    )}
                  </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-0 mb-8 border-b border-[rgba(0,255,247,0.06)]">
                  {tabs.map((t) => (
                    <Link
                      key={t.key}
                      href={`/search?q=${encodeURIComponent(q)}&tab=${t.key}`}
                      className={`flex items-center gap-1.5 px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider border-b-2 transition-colors -mb-px ${
                        tab === t.key
                          ? 'border-neon-cyan text-neon-cyan'
                          : 'border-transparent text-gray-600 hover:text-gray-400'
                      }`}
                    >
                      {t.label}
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${
                        tab === t.key
                          ? 'border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan'
                          : 'border-gray-700 text-gray-700'
                      }`}>
                        {t.count}
                      </span>
                    </Link>
                  ))}
                </div>

                {/* Products section */}
                {showProducts && products.length > 0 && (
                  <section className={showNews && news.length > 0 && tab === 'all' ? 'mb-12' : ''}>
                    {tab === 'all' && (
                      <div className="flex items-center gap-3 mb-4">
                        <h2 className="font-orbitron text-xs uppercase tracking-[0.3em] text-neon-cyan opacity-80">
                          ⬡ Ürünler
                        </h2>
                        <div className="h-px flex-1 bg-gradient-to-r from-neon-cyan/10 to-transparent" />
                      </div>
                    )}
                    <div className="space-y-3">
                      {products.map((p) => (
                        <ProductResult key={p.id} product={p} q={q} />
                      ))}
                    </div>
                  </section>
                )}

                {/* News section */}
                {showNews && news.length > 0 && (
                  <section>
                    {tab === 'all' && (
                      <div className="flex items-center gap-3 mb-4">
                        <h2 className="font-orbitron text-xs uppercase tracking-[0.3em] text-neon-purple opacity-80">
                          ⬡ Haberler
                        </h2>
                        <div className="h-px flex-1 bg-gradient-to-r from-neon-purple/10 to-transparent" />
                      </div>
                    )}
                    <div className="space-y-3">
                      {news.map((a) => (
                        <NewsResult key={a.id} article={a} q={q} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </>
        )}

        {/* Empty state */}
        {!searchDone && (
          <div className="text-center py-20 space-y-4">
            <div className="font-mono text-5xl text-gray-800">⬡</div>
            <p className="font-mono text-sm text-gray-600">
              Aramak istediğiniz ürün veya haberi yazın
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {['Toyota', 'iPhone', 'MacBook', 'Elektrikli', 'BMW'].map((hint) => (
                <Link
                  key={hint}
                  href={`/search?q=${encodeURIComponent(hint)}`}
                  className="font-mono text-xs px-3 py-1.5 rounded-full border border-[rgba(0,255,247,0.1)] text-gray-600 hover:text-neon-cyan hover:border-neon-cyan/30 transition-colors"
                >
                  {hint}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
