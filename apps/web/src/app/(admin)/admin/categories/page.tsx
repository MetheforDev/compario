import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getCategories } from '@compario/database';
import { DeleteCategoryButton } from './DeleteCategoryButton';

export const metadata: Metadata = { title: 'Kategoriler' };

export default async function CategoriesPage() {
  let categories = await getCategories(false).catch(() => []);

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="font-mono text-[10px] text-neon-purple uppercase tracking-[0.4em] opacity-60 mb-1">Admin</p>
          <h1 className="font-orbitron text-3xl font-black text-neon-cyan text-glow-cyan">KATEGORİLER</h1>
          <p className="font-mono text-xs text-gray-600 mt-1">{categories.length} kategori</p>
        </div>
        <Link href="/admin/categories/new" className="btn-neon">+ Yeni Kategori</Link>
      </div>

      {categories.length === 0 ? (
        <div className="card-neon p-16 text-center font-mono text-sm text-gray-600">
          [ KATEGORİ YOK ]
        </div>
      ) : (
        <div className="card-neon overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(0,255,247,0.08)]">
                {['İkon', 'Ad', 'Slug', 'Durum', 'İşlem'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-gray-600">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(0,255,247,0.04)]">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-[rgba(0,255,247,0.02)] transition-colors">
                  <td className="px-4 py-3">
                    {cat.image_url ? (
                      <div className="relative w-14 h-10 rounded overflow-hidden flex-shrink-0">
                        <Image src={cat.image_url} alt={cat.name} fill className="object-cover" sizes="56px" />
                      </div>
                    ) : (
                      <span className="text-2xl">{cat.icon ?? '📦'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs text-gray-200">{cat.name}</p>
                    {cat.description && (
                      <p className="font-mono text-[10px] text-gray-600 mt-0.5 max-w-xs truncate">{cat.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{cat.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider rounded border ${
                      cat.is_active ? 'border-neon-green text-neon-green' : 'border-gray-600 text-gray-600'
                    }`}>
                      {cat.is_active ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/categories/${cat.id}/edit?name=${encodeURIComponent(cat.name)}&slug=${encodeURIComponent(cat.slug)}&icon=${encodeURIComponent(cat.icon ?? '')}&image_url=${encodeURIComponent(cat.image_url ?? '')}&description=${encodeURIComponent(cat.description ?? '')}&is_active=${cat.is_active}`}
                        className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider border border-[rgba(183,36,255,0.3)]
                                   text-[rgba(183,36,255,0.7)] rounded hover:border-neon-purple hover:text-neon-purple transition-all"
                      >
                        ✏ Düzenle
                      </Link>
                      <DeleteCategoryButton id={cat.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
