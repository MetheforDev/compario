'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { deleteCategoryAction } from './actions';

export function DeleteCategoryButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
    startTransition(async () => {
      const result = await deleteCategoryAction(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Kategori silindi.');
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
