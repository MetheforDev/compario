import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllSegments, getCategories } from '@compario/database';
import { DeleteSegmentButton } from './DeleteSegmentButton';

export const metadata: Metadata = { title: 'Segmentler' };

export default async function SegmentsPage() {
  const [segments, categories] = await Promise.allSettled([
    getAllSegments(),
    getCategories(false),
  ]).then(([s, c]) => [
    s.status === 'fulfilled' ? s.value : [],
    c.status === 'fulfilled' ? c.value : [],
  ]);

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="font-mono text-[10px] text-neon-purple uppercase tracking-[0.4em] opacity-60 mb-1">Admin</p>
          <h1 className="font-orbitron text-3xl font-black text-neon-cyan text-glow-cyan">SEGMENTLER</h1>
          <p className="font-mono text-xs text-gray-600 mt-1">{segments.length} segment</p>
        </div>
        <Link href="/admin/segments/new" className="btn-neon">+ Yeni Segment</Link>
      </div>

      {segments.length === 0 ? (
        <div className="card-neon p-16 text-center font-mono text-sm text-gray-600">[ SEGMENT YOK ]</div>
      ) : (
        <div className="card-neon overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(0,255,247,0.08)]">
                {['Ad', 'Kategori', 'Fiyat Aralığı', 'Slug', 'Durum', 'İşlem'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(0,255,247,0.04)]">
              {segments.map((seg) => {
                const priceRange = seg.price_min && seg.price_max
                  ? `₺${seg.price_min.toLocaleString('tr-TR')} – ₺${seg.price_max.toLocaleString('tr-TR')}`
                  : '—';
                return (
                  <tr key={seg.id} className="hover:bg-[rgba(0,255,247,0.02)] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-200">{seg.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{categoryMap[seg.category_id] ?? '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-neon-green">{priceRange}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{seg.slug}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider rounded border ${
                        seg.is_active ? 'border-neon-green text-neon-green' : 'border-gray-600 text-gray-600'
                      }`}>
                        {seg.is_active ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/segments/${seg.id}/edit`}
                          className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider border border-[rgba(183,36,255,0.3)]
                                     text-[rgba(183,36,255,0.7)] rounded hover:border-neon-purple hover:text-neon-purple transition-all">
                          ✏ Düzenle
                        </Link>
                        <DeleteSegmentButton id={seg.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
