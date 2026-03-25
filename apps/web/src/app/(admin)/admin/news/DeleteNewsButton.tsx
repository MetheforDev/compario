'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteNewsAction } from './actions';

interface Props {
  id: string;
  title: string;
}

export function DeleteNewsButton({ id, title }: Props) {
  const [confirm, setConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="px-3 py-1 border border-red-500/20 text-red-400 font-mono text-[10px] uppercase rounded hover:bg-red-500/10 transition-colors"
      >
        Sil
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span className="font-mono text-[10px] text-red-400">Emin misin?</span>
      <button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await deleteNewsAction(id);
            router.refresh();
          })
        }
        className="px-2 py-0.5 bg-red-500/20 border border-red-500/40 text-red-400 font-mono text-[10px] uppercase rounded hover:bg-red-500/30 transition-colors disabled:opacity-50"
      >
        {isPending ? '...' : 'Evet'}
      </button>
      <button
        onClick={() => setConfirm(false)}
        className="px-2 py-0.5 border border-gray-600/40 text-gray-500 font-mono text-[10px] uppercase rounded hover:text-gray-300 transition-colors"
      >
        İptal
      </button>
    </div>
  );
}
