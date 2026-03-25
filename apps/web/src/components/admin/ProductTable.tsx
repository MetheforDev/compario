'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'react-hot-toast';
import type { Product } from '@compario/database';
import { deleteProductAction } from '@/app/(admin)/admin/products/actions';

const statusConfig = {
  active:   { label: 'Aktif',    cls: 'border-neon-green  text-neon-green' },
  draft:    { label: 'Taslak',   cls: 'border-yellow-500  text-yellow-500' },
  inactive: { label: 'Pasif',    cls: 'border-gray-600    text-gray-600'   },
};

interface ProductTableProps {
  products: Product[];
}

function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    startTransition(async () => {
      const result = await deleteProductAction(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Ürün silindi.');
        router.refresh();
      }
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider border border-[rgba(255,0,110,0.3)]
                 text-[rgba(255,0,110,0.7)] rounded hover:border-neon-pink hover:text-neon-pink
                 transition-all disabled:opacity-40"
    >
      {isPending ? '...' : '🗑 Sil'}
    </button>
  );
}

export function ProductTable({ products }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="card-neon p-16 text-center font-mono text-sm text-gray-600">
        [ ÜRÜN BULUNAMADI ]
      </div>
    );
  }

  return (
    <div className="card-neon overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[rgba(0,255,247,0.08)]">
            {['Ürün', 'Marka', 'Model', 'Fiyat', 'Durum', 'İşlem'].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-gray-600"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgba(0,255,247,0.04)]">
          {products.map((p) => {
            const st = statusConfig[p.status] ?? statusConfig.inactive;
            const price = p.price_min
              ? `₺${p.price_min.toLocaleString('tr-TR')}`
              : '—';

            return (
              <tr
                key={p.id}
                className="hover:bg-[rgba(0,255,247,0.02)] transition-colors"
              >
                <td className="px-4 py-3">
                  <p className="font-mono text-xs text-gray-200 max-w-[200px] truncate">{p.name}</p>
                  <p className="font-mono text-[10px] text-gray-600 mt-0.5 truncate">{p.slug}</p>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-400">{p.brand}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-400">{p.model}</td>
                <td className="px-4 py-3 font-mono text-xs text-neon-green">{price}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider rounded border ${st.cls}`}>
                    {st.label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/products/${p.slug}`}
                      target="_blank"
                      className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider border border-[rgba(0,255,247,0.2)]
                                 text-gray-500 rounded hover:border-neon-cyan hover:text-neon-cyan transition-all"
                    >
                      👁
                    </Link>
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider border border-[rgba(183,36,255,0.3)]
                                 text-[rgba(183,36,255,0.7)] rounded hover:border-neon-purple hover:text-neon-purple transition-all"
                    >
                      ✏ Düzenle
                    </Link>
                    <DeleteButton id={p.id} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
