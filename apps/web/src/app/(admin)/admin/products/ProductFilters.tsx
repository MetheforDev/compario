'use client';

import { useRouter, usePathname } from 'next/navigation';
import type { Category } from '@compario/database';

interface ProductFiltersProps {
  categories: Category[];
  currentParams: {
    category?: string;
    status?: string;
  };
}

export function ProductFilters({ categories, currentParams }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  function update(key: string, value: string) {
    const params = new URLSearchParams();
    if (key !== 'category' && currentParams.category) params.set('category', currentParams.category);
    if (key !== 'status'   && currentParams.status)   params.set('status',   currentParams.status);
    if (value) params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  }

  const selectCls =
    'bg-[#0d0d17] border border-[rgba(0,255,247,0.12)] rounded px-3 py-2 text-xs text-gray-300 font-mono ' +
    'focus:outline-none focus:border-neon-cyan transition-colors cursor-pointer';

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <select
        value={currentParams.category ?? ''}
        onChange={(e) => update('category', e.target.value)}
        className={selectCls}
      >
        <option value="">Tüm Kategoriler</option>
        {categories.map((c) => (
          <option key={c.id} value={c.slug}>{c.name}</option>
        ))}
      </select>

      <select
        value={currentParams.status ?? ''}
        onChange={(e) => update('status', e.target.value)}
        className={selectCls}
      >
        <option value="">Tüm Durumlar</option>
        <option value="active">Aktif</option>
        <option value="draft">Taslak</option>
        <option value="inactive">Pasif</option>
      </select>

      {(currentParams.category || currentParams.status) && (
        <button
          onClick={() => router.push(pathname)}
          className="px-3 py-2 font-mono text-xs text-gray-600 border border-[rgba(255,0,110,0.2)]
                     rounded hover:border-neon-pink hover:text-neon-pink transition-all uppercase tracking-wider"
        >
          × Temizle
        </button>
      )}
    </div>
  );
}
