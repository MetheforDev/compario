import type { Metadata } from 'next';
import Link from 'next/link';
import { getProducts, getNewsArticles } from '@compario/database';
import type { Product, NewsArticle } from '@compario/database';
import { NewsCard } from '@/components/NewsCard';
import { Header } from '@/components/Header';
import { SearchInput } from '@/components/SearchInput';

interface PageProps {
  searchParams: { q?: string };
}

export function generateMetadata({ searchParams }: PageProps): Metadata {
  const q = searchParams.q?.trim();
  return {
    title: q ? `"${q}" — Arama Sonuçları` : 'Arama',
    description: q ? `"${q}" için Compario arama sonuçları` : 'Compario\'da ürün ve haber arayın',
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

function ProductResult({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="flex gap-4 p-4 rounded-lg border border-[rgba(0,255,247,0.08)] bg-[rgba(255,255,255,0.02)] hover:border-neon-cyan/30 hover:bg-[rgba(0,255,247,0.03)] transition-all group"
    >
      {product.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.image_url}
          alt={product.name}
          className="w-16 h-16 object-cover rounded border border-[rgba(0,255,247,0.1)] flex-shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-orbitron text-sm font-bold text-white group-hover:text-neon-cyan transition-colors truncate">
          {product.name}
        </h3>
        {product.brand && (
          <p className="font-mono text-xs text-gray-500 mt-0.5">{product.brand} · {product.model ?? ''}</p>
        )}
        {product.price_min && (
          <p className="font-mono text-xs text-neon-cyan mt-1">
            ₺{product.price_min.toLocaleString('tr-TR')}
            {product.price_max && product.price_max !== product.price_min
              ? ` — ₺${product.price_max.toLocaleString('tr-TR')}`
              : ''}
          </p>
        )}
      </div>
      <span className="font-mono text-xs text-gray-700 group-hover:text-neon-cyan transition-colors self-center flex-shrink-0">
        →
      </span>
    </Link>
  );
}

export default async function SearchPage({ searchParams }: PageProps) {
  const q = searchParams.q?.trim() ?? '';

  let products: Product[] = [];
  let news: NewsArticle[] = [];
  let searchDone = false;

  if (q.length >= 2) {
    searchDone = true;
    [products, news] = await Promise.all([
      getProducts({ search: q, limit: 8, status: 'active' }).catch(() => []),
      getNewsArticles({ search: q, limit: 6 }).then((r) => r.data).catch(() => []),
    ]);
  }

  const totalResults = products.length + news.length;

  return (
    <main className="min-h-screen bg-grid">
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-32 pb-20">
        {/* Page header */}
        <div className="mb-10">
          <p className="font-mono text-[10px] text-neon-purple uppercase tracking-[0.4em] opacity-70 mb-2">
            ⬡ Arama
          </p>
          <h1 className="font-orbitron text-3xl font-black text-neon-cyan text-glow-cyan mb-6">
            {q ? `"${q}"` : 'ARAMA'}
          </h1>

          {/* Search input */}
          <SearchInput initialValue={q} />
        </div>

        {/* Results */}
        {searchDone && (
          <>
            {totalResults === 0 ? (
              <div className="text-center py-20">
                <p className="font-orbitron text-4xl text-gray-700 mb-4">Ø</p>
                <p className="font-mono text-sm text-gray-500">
                  <span className="text-gray-400">"{q}"</span> için sonuç bulunamadı.
                </p>
                <p className="font-mono text-xs text-gray-700 mt-2">
                  Farklı anahtar kelimeler deneyin
                </p>
              </div>
            ) : (
              <>
                <p className="font-mono text-xs text-gray-600 mb-8">
                  <span className="text-neon-cyan">{totalResults}</span> sonuç bulundu
                </p>

                {/* Products */}
                {products.length > 0 && (
                  <section className="mb-12">
                    <div className="flex items-center gap-3 mb-5">
                      <h2 className="font-orbitron text-xs uppercase tracking-[0.3em] text-neon-cyan opacity-80">
                        ⬡ Ürünler
                      </h2>
                      <span className="font-mono text-[10px] text-gray-600 border border-[rgba(0,255,247,0.1)] rounded-full px-2 py-0.5">
                        {products.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {products.map((p) => (
                        <ProductResult key={p.id} product={p} />
                      ))}
                    </div>
                  </section>
                )}

                {/* News */}
                {news.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-5">
                      <h2 className="font-orbitron text-xs uppercase tracking-[0.3em] text-neon-cyan opacity-80">
                        ⬡ Haberler
                      </h2>
                      <span className="font-mono text-[10px] text-gray-600 border border-[rgba(0,255,247,0.1)] rounded-full px-2 py-0.5">
                        {news.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {news.map((article) => (
                        <NewsCard key={article.id} article={article} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </>
        )}

        {/* Hint when no search */}
        {!searchDone && (
          <div className="text-center py-20">
            <p className="font-mono text-sm text-gray-600">
              Aramak istediğiniz ürün veya haberi yazın
            </p>
            <p className="font-mono text-xs text-gray-700 mt-2">
              En az 2 karakter girin
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
