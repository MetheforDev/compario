import type { Metadata } from 'next';
import Link from 'next/link';
import {
  getTopProductsByViews,
  getTopProductsByCompares,
  getTopNewsByViews,
  getProducts,
  getNewsArticlesAdmin,
} from '@compario/database';
import type { Product, NewsArticle } from '@compario/database';

export const metadata: Metadata = { title: 'Analytics' };
export const dynamic = 'force-dynamic';

async function fetchAnalytics() {
  const [byViews, byCompares, topNews, allProducts, allNews] = await Promise.all([
    getTopProductsByViews(10).catch(() => [] as Product[]),
    getTopProductsByCompares(10).catch(() => [] as Product[]),
    getTopNewsByViews(10).catch(() => [] as NewsArticle[]),
    getProducts({ limit: 2000 }).catch(() => [] as Product[]),
    getNewsArticlesAdmin({ limit: 2000 }).catch(() => ({ data: [] as NewsArticle[], total: 0 })),
  ]);
  const totalViews = allProducts.reduce((s, p) => s + (p.view_count ?? 0), 0);
  const totalCompares = allProducts.reduce((s, p) => s + (p.compare_count ?? 0), 0);
  const totalNewsViews = allNews.data.reduce((s, n) => s + (n.view_count ?? 0), 0);
  return { byViews, byCompares, topNews, totalViews, totalCompares, totalNewsViews };
}

function BarRow({ rank, label, sub, value, maxValue, color }: {
  rank: number; label: string; sub?: string; value: number; maxValue: number; color: string;
}) {
  const pct = maxValue > 0 ? Math.round((value / maxValue) * 100) : 0;
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[rgba(196,154,60,0.04)] last:border-0">
      <span className="font-orbitron text-[10px] font-black w-5 flex-shrink-0 text-right"
        style={{ color: rank <= 3 ? color : 'rgba(196,154,60,0.3)' }}>
        {rank}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-xs text-gray-300 truncate">{label}</span>
          <span className="font-orbitron text-xs font-bold ml-3 flex-shrink-0" style={{ color }}>
            {value.toLocaleString('tr-TR')}
          </span>
        </div>
        {sub && <p className="font-mono text-[9px] text-gray-700 truncate">{sub}</p>}
        <div className="h-1 rounded-full mt-1.5" style={{ background: 'rgba(196,154,60,0.08)' }}>
          <div className="h-1 rounded-full" style={{ width: pct + '%', background: color }} />
        </div>
      </div>
    </div>
  );
}

function Leaderboard({ title, icon, items, valueKey, color, emptyHref }: {
  title: string; icon: string;
  items: Array<{ id: string; name: string; sub?: string; value: number }>;
  valueKey: string; color: string; emptyHref: string;
}) {
  const max = items[0]?.value ?? 1;
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#0c0c18', border: '1px solid rgba(196,154,60,0.1)' }}>
      <div className="px-5 py-4 flex items-center justify-between" style={{ background: '#0d0d1a', borderBottom: '1px solid rgba(196,154,60,0.08)' }}>
        <div className="flex items-center gap-2">
          <span style={{ color, fontSize: '12px' }}>{icon}</span>
          <span className="font-orbitron text-[10px] uppercase tracking-[0.3em] text-gray-400">{title}</span>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: 'rgba(196,154,60,0.4)' }}>{valueKey}</span>
      </div>
      <div className="px-5 py-2">
        {items.length === 0 ? (
          <div className="py-8 text-center">
            <p className="font-mono text-xs text-gray-700 mb-3">Henüz veri yok</p>
            <Link href={emptyHref} className="font-mono text-[10px] text-neon-cyan">Ekle</Link>
          </div>
        ) : items.map((item, i) => (
          <BarRow key={item.id} rank={i + 1} label={item.name} sub={item.sub} value={item.value} maxValue={max} color={color} />
        ))}
      </div>
    </div>
  );
}

export default async function AnalyticsPage() {
  const { byViews, byCompares, topNews, totalViews, totalCompares, totalNewsViews } = await fetchAnalytics();
  const summary = [
    { label: 'Toplam Ürün Görüntülenme', value: totalViews, icon: '◉', color: '#00fff7' },
    { label: 'Toplam Karşılaştırma', value: totalCompares, icon: '⬡', color: '#C49A3C' },
    { label: 'Toplam Haber Görüntülenme', value: totalNewsViews, icon: '▶', color: '#8B9BAC' },
  ];
  const viewItems = byViews.map((p) => ({ id: p.id, name: p.name, sub: p.brand ?? undefined, value: p.view_count ?? 0 }));
  const compareItems = byCompares.map((p) => ({ id: p.id, name: p.name, sub: p.brand ?? undefined, value: p.compare_count ?? 0 }));
  const newsItems = topNews.map((n) => ({ id: n.id, name: n.title, sub: n.author ?? undefined, value: n.view_count ?? 0 }));

  return (
    <div className="p-8">
      <div className="mb-10">
        <p className="font-mono text-[10px] text-neon-purple uppercase tracking-[0.4em] opacity-60 mb-1">Admin</p>
        <h1 className="font-orbitron text-3xl font-black text-neon-cyan">ANALYTICS</h1>
      </div>
      <section className="mb-10">
        <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-4">Genel Bakis</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {summary.map((card) => (
            <div key={card.label} className="rounded-xl p-6 relative overflow-hidden" style={{ background: '#0c0c18', border: '1px solid rgba(196,154,60,0.1)' }}>
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: card.color, opacity: 0.5 }} />
              <span style={{ color: card.color, fontSize: '20px' }}>{card.icon}</span>
              <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-4 mb-1">{card.label}</p>
              <p className="font-orbitron text-4xl font-black" style={{ color: card.color }}>{card.value.toLocaleString('tr-TR')}</p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-4">Liderlik Tablolari</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Leaderboard title="En Cok Goruntulenenen" icon="◉" items={viewItems} valueKey="goruntulenme" color="#00fff7" emptyHref="/admin/products/new" />
          <Leaderboard title="En Cok Karsilastirilan" icon="⬡" items={compareItems} valueKey="karsilastirma" color="#C49A3C" emptyHref="/admin/products/new" />
          <Leaderboard title="En Cok Okunan Haberler" icon="▶" items={newsItems} valueKey="okuma" color="#8B9BAC" emptyHref="/admin/news/new" />
        </div>
      </section>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/admin/products" className="btn-neon text-xs">Urunlere Git</Link>
        <Link href="/admin/news" className="btn-neon-purple text-xs">Haberlere Git</Link>
      </div>
    </div>
  );
}