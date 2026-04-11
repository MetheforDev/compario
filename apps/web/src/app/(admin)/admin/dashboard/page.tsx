import type { Metadata } from 'next';
import Link from 'next/link';
import { StatCard } from '@/components/admin/StatCard';
import {
  getProducts,
  getCategories,
  getAllSegments,
  getNewsArticlesAdmin,
  getTopProductsByViews,
  getTopProductsByCompares,
  getTopNewsByViews,
} from '@compario/database';

export const metadata: Metadata = { title: 'Dashboard' };

async function fetchStats() {
  try {
    const [allProducts, categories, segments, allNews, topViewed, topCompared, topNews] =
      await Promise.all([
        getProducts({ limit: 1000 }),
        getCategories(false),
        getAllSegments(),
        getNewsArticlesAdmin({ limit: 1000 }),
        getTopProductsByViews(5),
        getTopProductsByCompares(5),
        getTopNewsByViews(5),
      ]);

    const activeProducts = allProducts.filter((p) => p.status === 'active');
    const draftProducts  = allProducts.filter((p) => p.status === 'draft');

    const publishedNews  = allNews.data.filter((n) => n.status === 'published');
    const draftNews      = allNews.data.filter((n) => n.status === 'draft');
    const scheduledNews  = allNews.data.filter((n) => n.status === 'scheduled');

    const totalViews    = allProducts.reduce((s, p) => s + (p.view_count ?? 0), 0);
    const totalCompares = allProducts.reduce((s, p) => s + (p.compare_count ?? 0), 0);

    const recentProducts = [...allProducts]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    const recentNews = [...allNews.data]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    return {
      totalProducts: allProducts.length,
      activeProducts: activeProducts.length,
      draftProducts: draftProducts.length,
      categories: categories.length,
      segments: segments.length,
      newsTotal: allNews.total,
      newsPublished: publishedNews.length,
      newsDraft: draftNews.length,
      newsScheduled: scheduledNews.length,
      totalViews,
      totalCompares,
      recentProducts,
      recentNews,
      topViewed,
      topCompared,
      topNews,
    };
  } catch {
    return {
      totalProducts: 0, activeProducts: 0, draftProducts: 0,
      categories: 0, segments: 0,
      newsTotal: 0, newsPublished: 0, newsDraft: 0, newsScheduled: 0,
      totalViews: 0, totalCompares: 0,
      recentProducts: [], recentNews: [],
      topViewed: [], topCompared: [], topNews: [],
    };
  }
}

const productStatusBadge: Record<string, string> = {
  active:   'border-neon-green text-neon-green',
  draft:    'border-yellow-500 text-yellow-500',
  inactive: 'border-gray-600 text-gray-600',
};

const newsStatusBadge: Record<string, string> = {
  published: 'border-neon-green text-neon-green',
  draft:     'border-yellow-500 text-yellow-500',
  scheduled: 'border-neon-purple text-neon-purple',
  archived:  'border-gray-600 text-gray-600',
};

const newsStatusLabel: Record<string, string> = {
  published: 'Yayında',
  draft:     'Taslak',
  scheduled: 'Zamanlanmış',
  archived:  'Arşiv',
};

export default async function DashboardPage() {
  const s = await fetchStats();

  return (
    <div className="p-8 space-y-10">

      {/* Header */}
      <div>
        <p className="font-mono text-[10px] text-neon-purple uppercase tracking-[0.4em] opacity-60 mb-1">Admin</p>
        <h1 className="font-orbitron text-3xl font-black text-neon-cyan text-glow-cyan">DASHBOARD</h1>
      </div>

      {/* ── Ürün İstatistikleri ── */}
      <section>
        <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-4">⬡ Ürünler</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Toplam Ürün"    value={s.totalProducts}   icon="◈" href="/admin/products"   color="cyan"   />
          <StatCard label="Aktif"          value={s.activeProducts}  icon="⬡" href="/admin/products?status=active" color="green"  />
          <StatCard label="Taslak"         value={s.draftProducts}   icon="◇" href="/admin/products?status=draft"  color="pink"   />
          <StatCard label="Kategori"       value={s.categories}      icon="◇" href="/admin/categories" color="purple" />
          <StatCard label="Segment"        value={s.segments}        icon="◆" href="/admin/segments"   color="pink"   />
          <StatCard label="Karşılaştırma"  value={s.totalCompares}   icon="⬡" href="/admin/analytics"  color="cyan"   />
        </div>
      </section>

      {/* ── Haber İstatistikleri ── */}
      <section>
        <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-4">⬡ Haberler</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Toplam Haber"    value={s.newsTotal}      icon="◉" href="/admin/news"                    color="cyan"   />
          <StatCard label="Yayında"         value={s.newsPublished}  icon="▶" href="/admin/news?status=published"   color="green"  />
          <StatCard label="Taslak"          value={s.newsDraft}      icon="◇" href="/admin/news?status=draft"       color="pink"   />
          <StatCard label="Zamanlanmış"     value={s.newsScheduled}  icon="◈" href="/admin/news?status=scheduled"   color="purple" />
        </div>
      </section>

      {/* ── Platform Aktivitesi ── */}
      <section>
        <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-4">⬡ Platform Aktivitesi</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* En çok görüntülenen ürünler */}
          <div className="card-neon overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(0,255,247,0.08)]">
              <span className="font-mono text-[10px] text-gray-600 uppercase tracking-widest">En Çok Görüntülenen Ürünler</span>
              <Link href="/admin/analytics" className="font-mono text-[10px] text-neon-cyan hover:opacity-70 transition-opacity">
                Tümü →
              </Link>
            </div>
            {s.topViewed.length === 0 ? (
              <p className="px-5 py-6 font-mono text-xs text-gray-700">Veri yok</p>
            ) : (
              <ul className="divide-y divide-[rgba(0,255,247,0.04)]">
                {s.topViewed.map((p, i) => (
                  <li key={p.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-[rgba(0,255,247,0.02)] transition-colors">
                    <span className="font-orbitron text-[10px] font-black w-4 text-gray-700">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs text-gray-300 truncate">{p.name}</p>
                      <p className="font-mono text-[10px] text-gray-600">{p.brand}</p>
                    </div>
                    <span className="font-mono text-xs text-neon-cyan flex-shrink-0">
                      {(p.view_count ?? 0).toLocaleString('tr-TR')} görüntülenme
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* En çok karşılaştırılan ürünler */}
          <div className="card-neon overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(0,255,247,0.08)]">
              <span className="font-mono text-[10px] text-gray-600 uppercase tracking-widest">En Çok Karşılaştırılan Ürünler</span>
              <Link href="/admin/analytics" className="font-mono text-[10px] text-neon-cyan hover:opacity-70 transition-opacity">
                Tümü →
              </Link>
            </div>
            {s.topCompared.length === 0 ? (
              <p className="px-5 py-6 font-mono text-xs text-gray-700">Veri yok</p>
            ) : (
              <ul className="divide-y divide-[rgba(0,255,247,0.04)]">
                {s.topCompared.map((p, i) => (
                  <li key={p.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-[rgba(0,255,247,0.02)] transition-colors">
                    <span className="font-orbitron text-[10px] font-black w-4 text-gray-700">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs text-gray-300 truncate">{p.name}</p>
                      <p className="font-mono text-[10px] text-gray-600">{p.brand}</p>
                    </div>
                    <span className="font-mono text-xs text-neon-purple flex-shrink-0">
                      {(p.compare_count ?? 0).toLocaleString('tr-TR')} karşılaştırma
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* En çok okunan haberler */}
          <div className="card-neon overflow-hidden lg:col-span-2">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(0,255,247,0.08)]">
              <span className="font-mono text-[10px] text-gray-600 uppercase tracking-widest">En Çok Okunan Haberler</span>
              <Link href="/admin/news" className="font-mono text-[10px] text-neon-cyan hover:opacity-70 transition-opacity">
                Tümü →
              </Link>
            </div>
            {s.topNews.length === 0 ? (
              <p className="px-5 py-6 font-mono text-xs text-gray-700">Veri yok</p>
            ) : (
              <ul className="divide-y divide-[rgba(0,255,247,0.04)]">
                {s.topNews.map((n, i) => (
                  <li key={n.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-[rgba(0,255,247,0.02)] transition-colors">
                    <span className="font-orbitron text-[10px] font-black w-4 text-gray-700">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <Link href={`/admin/news/${n.id}/edit`}
                        className="font-mono text-xs text-gray-300 hover:text-neon-cyan transition-colors truncate block">
                        {n.title}
                      </Link>
                      <p className="font-mono text-[10px] text-gray-600">
                        {n.published_at
                          ? new Date(n.published_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—'}
                      </p>
                    </div>
                    <span className="font-mono text-xs text-neon-green flex-shrink-0">
                      {(n.view_count ?? 0).toLocaleString('tr-TR')} okuma
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* ── Son Eklenen Ürünler ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest">⬡ Son Eklenen Ürünler</p>
          <Link href="/admin/products/new" className="btn-neon text-[10px] py-1.5 px-4">+ Yeni Ürün</Link>
        </div>
        {s.recentProducts.length === 0 ? (
          <div className="card-neon p-8 text-center font-mono text-sm text-gray-600">Henüz ürün yok.</div>
        ) : (
          <div className="card-neon overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(0,255,247,0.08)]">
                  {['Ürün', 'Marka', 'Fiyat', 'Görüntülenme', 'Durum'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(0,255,247,0.04)]">
                {s.recentProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[rgba(0,255,247,0.02)] transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/admin/products/${p.id}/edit`} className="font-mono text-xs text-gray-200 hover:text-neon-cyan transition-colors">
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{p.brand ?? '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-neon-green">
                      {p.price_min ? `₺${p.price_min.toLocaleString('tr-TR')}` : '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {(p.view_count ?? 0).toLocaleString('tr-TR')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider rounded border ${productStatusBadge[p.status] ?? productStatusBadge.inactive}`}>
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

      {/* ── Son Eklenen Haberler ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest">⬡ Son Eklenen Haberler</p>
          <Link href="/admin/news/new" className="btn-neon text-[10px] py-1.5 px-4">+ Yeni Haber</Link>
        </div>
        {s.recentNews.length === 0 ? (
          <div className="card-neon p-8 text-center font-mono text-sm text-gray-600">Henüz haber yok.</div>
        ) : (
          <div className="card-neon overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(0,255,247,0.08)]">
                  {['Başlık', 'Yazar', 'Görüntülenme', 'Tarih', 'Durum'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(0,255,247,0.04)]">
                {s.recentNews.map((n) => (
                  <tr key={n.id} className="hover:bg-[rgba(0,255,247,0.02)] transition-colors">
                    <td className="px-4 py-3 max-w-xs">
                      <Link href={`/admin/news/${n.id}/edit`} className="font-mono text-xs text-gray-200 hover:text-neon-cyan transition-colors line-clamp-1 block">
                        {n.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{n.author ?? '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {(n.view_count ?? 0).toLocaleString('tr-TR')}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {n.published_at
                        ? new Date(n.published_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
                        : n.created_at
                        ? new Date(n.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider rounded border ${newsStatusBadge[n.status] ?? newsStatusBadge.archived}`}>
                        {newsStatusLabel[n.status] ?? n.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Hızlı İşlemler ── */}
      <section>
        <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-4">⬡ Hızlı İşlemler</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/products/new"    className="btn-neon">+ Ürün Ekle</Link>
          <Link href="/admin/products/import" className="btn-neon">CSV Import</Link>
          <Link href="/admin/news/new"        className="btn-neon">+ Haber Ekle</Link>
          <Link href="/admin/categories/new"  className="btn-neon-purple">+ Kategori Ekle</Link>
          <Link href="/admin/segments/new"    className="btn-neon-purple">+ Segment Ekle</Link>
          <Link href="/admin/analytics"       className="btn-neon-purple">Analytics →</Link>
        </div>
      </section>

    </div>
  );
}
