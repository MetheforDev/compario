import type { Metadata } from 'next';
import Link from 'next/link';
import { StatCard } from '@/components/admin/StatCard';
import { getProducts, getCategories, getAllSegments } from '@compario/database';

export const metadata: Metadata = { title: 'Dashboard' };

async function fetchStats() {
  try {
    const [allProducts, categories, segments] = await Promise.all([
      getProducts({ limit: 1000 }),
      getCategories(false),
      getAllSegments(),
    ]);
    const activeProducts = allProducts.filter((p) => p.status === 'active');
    return {
      total: allProducts.length,
      active: activeProducts.length,
      categories: categories.length,
      segments: segments.length,
      recent: allProducts.slice(0, 5),
    };
  } catch {
    return { total: 0, active: 0, categories: 0, segments: 0, recent: [] };
  }
}

const statusBadge: Record<string, string> = {
  active:   'border-neon-green text-neon-green',
  draft:    'border-yellow-500 text-yellow-500',
  inactive: 'border-gray-600 text-gray-600',
};

export default async function DashboardPage() {
  const stats = await fetchStats();

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-10">
        <p className="font-mono text-[10px] text-neon-purple uppercase tracking-[0.4em] opacity-60 mb-1">
          Admin
        </p>
        <h1 className="font-orbitron text-3xl font-black text-neon-cyan text-glow-cyan">
          DASHBOARD
        </h1>
      </div>

      {/* Stats */}
      <section className="mb-10">
        <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-4">⬡ Genel Bakış</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Toplam Ürün"   value={stats.total}      icon="◈" href="/admin/products"   color="cyan"   />
          <StatCard label="Aktif Ürün"    value={stats.active}     icon="⬡" href="/admin/products"   color="green"  />
          <StatCard label="Kategori"      value={stats.categories} icon="◇" href="/admin/categories" color="purple" />
          <StatCard label="Segment"       value={stats.segments}   icon="◆" href="/admin/segments"   color="pink"   />
        </div>
      </section>

      {/* Recent products */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest">⬡ Son Eklenen Ürünler</p>
          <Link href="/admin/products/new" className="btn-neon text-[10px] py-1.5 px-4">
            + Yeni Ürün
          </Link>
        </div>

        {stats.recent.length === 0 ? (
          <div className="card-neon p-8 text-center font-mono text-sm text-gray-600">
            Henüz ürün yok.
          </div>
        ) : (
          <div className="card-neon overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(0,255,247,0.08)]">
                  {['Ürün', 'Marka', 'Model', 'Fiyat', 'Durum'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-gray-600">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(0,255,247,0.04)]">
                {stats.recent.map((p) => (
                  <tr key={p.id} className="hover:bg-[rgba(0,255,247,0.02)] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-200">{p.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{p.brand}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{p.model}</td>
                    <td className="px-4 py-3 font-mono text-xs text-neon-green">
                      {p.price_min ? `₺${p.price_min.toLocaleString('tr-TR')}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider rounded border ${statusBadge[p.status] ?? statusBadge.inactive}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Quick actions */}
      <section>
        <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-4">⬡ Hızlı İşlemler</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/products/new"   className="btn-neon">+ Ürün Ekle</Link>
          <Link href="/admin/categories/new" className="btn-neon-purple">+ Kategori Ekle</Link>
          <Link href="/admin/segments/new"   className="btn-neon-purple">+ Segment Ekle</Link>
        </div>
      </section>
    </div>
  );
}
