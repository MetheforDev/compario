import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getTopLevelCategories, getSubCategories, getProductCountsByCategory, getCategories } from '@compario/database';
import type { Category } from '@compario/database';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Kategoriler | Compario',
  description: 'Araç, teknoloji, beyaz eşya ve daha fazlasını kategorilere göre karşılaştırın.',
};

async function CategoryCard({ category, productCount }: { category: Category; productCount: number }) {
  const subs = await getSubCategories(category.id, true).catch(() => []);

  return (
    <div
      className="group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        background: 'linear-gradient(145deg, rgba(13,13,22,0.97) 0%, rgba(9,9,18,0.99) 100%)',
        border: '1px solid rgba(196,154,60,0.08)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* Görsel / emoji */}
      <Link href={`/categories/${category.slug}`} className="block">
        {category.image_url ? (
          <div className="relative w-full h-40 overflow-hidden">
            <Image
              src={category.image_url}
              alt={category.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(9,9,18,1) 0%, rgba(9,9,18,0.2) 60%, transparent 100%)' }} />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'rgba(0,255,247,0.05)' }} />
          </div>
        ) : (
          <div className="w-full h-32 flex items-center justify-center"
            style={{ background: 'rgba(196,154,60,0.04)' }}>
            <span className="text-5xl">{category.icon ?? '📦'}</span>
          </div>
        )}

        <div className="p-5 pb-3">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-orbitron text-sm font-black text-neon-cyan uppercase tracking-wider group-hover:text-glow-cyan transition-all">
              {category.name}
            </h2>
            {productCount > 0 && (
              <span
                className="flex-shrink-0 font-mono text-[9px] px-2 py-0.5 rounded-full"
                style={{
                  background: 'rgba(196,154,60,0.08)',
                  border: '1px solid rgba(196,154,60,0.15)',
                  color: 'rgba(196,154,60,0.6)',
                }}
              >
                {productCount} ürün
              </span>
            )}
          </div>
          {category.description && (
            <p className="font-mono text-[11px] text-gray-500 mt-1.5 leading-relaxed line-clamp-2">
              {category.description}
            </p>
          )}
        </div>
      </Link>

      {/* Alt kategori etiketleri */}
      {subs.length > 0 && (
        <div className="px-5 pb-5 flex flex-wrap gap-1.5">
          {subs.slice(0, 5).map((sub) => (
            <Link
              key={sub.id}
              href={`/categories/${sub.slug}`}
              className="font-mono text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider transition-all hover:border-neon-cyan hover:text-neon-cyan"
              style={{
                background: 'rgba(0,255,247,0.04)',
                border: '1px solid rgba(0,255,247,0.1)',
                color: 'rgba(156,163,175,0.8)',
              }}
            >
              {sub.icon} {sub.name}
            </Link>
          ))}
          {subs.length > 5 && (
            <Link
              href={`/categories/${category.slug}`}
              className="font-mono text-[9px] px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(183,36,255,0.06)', border: '1px solid rgba(183,36,255,0.15)', color: 'rgba(183,36,255,0.7)' }}
            >
              +{subs.length - 5} daha
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default async function CategoriesPage() {
  const [categories, allCats, rawCounts] = await Promise.all([
    getTopLevelCategories(true).catch(() => []),
    getCategories(true).catch(() => []),
    getProductCountsByCategory().catch(() => ({} as Record<string, number>)),
  ]);

  // Her üst düzey kategori için kendisi + tüm alt kategorilerindeki ürün sayısını topla
  const allCatMap = new Map(allCats.map(c => [c.id, c]));

  function getDescendantIds(catId: string): string[] {
    const children = allCats.filter(c => c.parent_id === catId);
    return [catId, ...children.flatMap(c => getDescendantIds(c.id))];
  }

  const categoryProductCounts = Object.fromEntries(
    categories.map(cat => {
      const ids = getDescendantIds(cat.id);
      const total = ids.reduce((sum, id) => sum + (rawCounts[id] ?? 0), 0);
      return [cat.id, total];
    })
  );

  // allCatMap kullanılmadı uyarısını engellemek için
  void allCatMap;

  return (
    <main className="min-h-screen bg-grid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="font-mono text-[10px] text-gray-600 hover:text-neon-cyan transition-colors uppercase tracking-widest">
            ← Ana Sayfa
          </Link>
          <p className="font-mono text-[10px] text-neon-purple uppercase tracking-[0.4em] opacity-70 mt-6 mb-2">
            ⬡ Compario
          </p>
          <h1 className="font-orbitron text-4xl sm:text-5xl font-black text-neon-cyan text-glow-cyan">
            KATEGORİLER
          </h1>
          <p className="font-mono text-sm text-gray-500 mt-3">
            {categories.length} ana kategori — Her birini karşılaştır, en iyisini seç.
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-20 text-gray-600 font-mono text-sm">[ KATEGORİ YOK ]</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                productCount={categoryProductCounts[cat.id] ?? 0}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
