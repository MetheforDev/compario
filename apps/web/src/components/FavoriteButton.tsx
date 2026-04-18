'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Props {
  productId: string;
  productName: string;
}

export function FavoriteButton({ productId, productName }: Props) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const uid = data.session?.user.id ?? null;
      setUserId(uid);
      if (!uid) return;
      const { data: row } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', uid)
        .eq('product_id', productId)
        .maybeSingle();
      setIsFav(!!row);
    });
  }, [supabase, productId]);

  async function toggle() {
    if (!userId) {
      router.push(`/giris?next=/products/${productName}`);
      return;
    }
    setLoading(true);
    try {
      if (isFav) {
        await supabase.from('user_favorites').delete()
          .eq('user_id', userId).eq('product_id', productId);
        setIsFav(false);
      } else {
        await supabase.from('user_favorites').insert({ user_id: userId, product_id: productId });
        setIsFav(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      title={isFav ? 'Favorilerden çıkar' : 'Favorilere ekle'}
      className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all"
      style={{
        background: isFav ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)',
        border: isFav ? '1px solid rgba(239,68,68,0.35)' : '1px solid rgba(255,255,255,0.08)',
        color: isFav ? '#ef4444' : '#6b7280',
      }}
    >
      <span>{isFav ? '♥' : '♡'}</span>
      <span>{isFav ? 'Favoride' : 'Favori'}</span>
    </button>
  );
}
