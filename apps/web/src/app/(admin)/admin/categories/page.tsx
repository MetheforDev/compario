import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getCategoryTree } from '@compario/database';
import type { CategoryWithChildren } from '@compario/database';
import { DeleteCategoryButton } from './DeleteCategoryButton';

export const metadata: Metadata = { title: 'Kategoriler' };

function CategoryRow({ cat, depth = 0 }: { cat: CategoryWithChildren; depth?: number }) {
  const indent = depth * 20;
  return (
    <>
      <tr className="hover:bg-[rgba(0,255,247,0.02)] transition-colors border-b border-[rgba(0,255,247,0.04)]">
        {/* İkon / Görsel */}
        <td className="px-4 py-2.5">
          {cat.image_url ? (
            <div className="relative w-12 h-8 rounded overflow-hidden flex-shrink-0">
              <Image src={cat.image_url} alt={cat.name} fill className="object-cover" sizes="48px" />
            </div>
          ) : (
            <span className="text-xl">{cat.icon ?? '📦'}</span>
          )}
        </td>

        {/* Ad + hiyerarşi girintisi */}
        <td className="px-4 py-2.5" style={{ paddingLeft: `${16 + indent}px` }}>
          <div className="flex items-center gap-2">
            {depth > 0 && (
              <span className="text-gray-700 select-none" style={{ fontSize: 10 }}>
                {'└─'.slice(0, depth > 1 ? 2 : 1)}
              </span>
            )}
            <div>
              <p className="font-mono text-xs text-gray-200">{cat.name}</p>
              {cat.description && (
                <p className="font-mono text-[10px] text-gray-600 mt-0.5 max-w-xs truncate">{cat.description}</p>
              )}
            </div>
          </div>
        </td>

        <td className="px-4 py-2.5 font-mono text-[10px] text-gray-600">{cat.slug}</td>

        <td className="px-4 py-2.5 font-mono text-[10px] text-gray-700">
          {cat.children.length > 0 && (
            <span className="px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,255,247,0.06)', color: '#00fff7' }}>
              {cat.children.length} alt
            </span>
          )}
        </td>

        <td className="px-4 py-2.5">
          <span className={`inline-block px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider rounded border ${
            cat.is_active ? 'border-neon-green text-neon-green' : 'border-gray-600 text-gray-600'
          }`}>
            {cat.is_active ? 'Aktif' : 'Pasif'}
          </span>
        </td>

        <td className="px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/categories/${cat.id}/edit?name=${encodeURIComponent(cat.name)}&slug=${encodeURIComponent(cat.slug)}&icon=${encodeURIComponent(cat.icon ?? '')}&image_url=${encodeURIComponent(cat.image_url ?? '')}&description=${encodeURIComponent(cat.description ?? '')}&is_active=${cat.is_active}`}
              className="px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider border border-[rgba(183,36,255,0.3)]
                         text-[rgba(183,36,255,0.7)] rounded hover:border-neon-purple hover:text-neon-purple transition-all"
            >
              ✏
            </Link>
            <DeleteCategoryButton id={cat.id} />
          </div>
        </td>
      </tr>

      {/* Alt kategoriler — recursive */}
      {cat.children.map((child) => (
        <CategoryRow key={child.id} cat={child} depth={depth + 1} />
      ))}
    </>
  );
}

export default async function CategoriesPage() {
  const tree = await getCategoryTree(false).catch(() => []);
  const totalCount = tree.reduce((sum, root) => {
    const countChildren = (node: CategoryWithChildren): number =>
      1 + node.children.reduce((s, c) => s + countChildren(c), 0);
    return sum + countChildren(root);
  }, 0);

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="font-mono text-[10px] text-neon-purple uppercase tracking-[0.4em] opacity-60 mb-1">Admin</p>
          <h1 className="font-orbitron text-3xl font-black text-neon-cyan text-glow-cyan">KATEGORİLER</h1>
          <p className="font-mono text-xs text-gray-600 mt-1">{totalCount} kategori — {tree.length} üst düzey</p>
        </div>
        <Link href="/admin/categories/new" className="btn-neon">+ Yeni Kategori</Link>
      </div>

      {tree.length === 0 ? (
        <div className="card-neon p-16 text-center font-mono text-sm text-gray-600">[ KATEGORİ YOK ]</div>
      ) : (
        <div className="card-neon overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(0,255,247,0.08)]">
                {['Görsel', 'Ad', 'Slug', 'Alt', 'Durum', 'İşlem'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-gray-600">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tree.map((root) => (
                <CategoryRow key={root.id} cat={root} depth={0} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
