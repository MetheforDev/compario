'use client';

import Link from 'next/link';
import { useCompare } from '@/lib/compare-store';

interface Props {
  id: string;
  name: string;
  brand: string | null;
  image: string | null;
}

export function AddToCompareButton({ id, name, brand, image }: Props) {
  const { toggle, isSelected, isFull, items } = useCompare();
  const selected = isSelected(id);
  const disabled = !selected && isFull;

  const handleToggle = () => {
    if (disabled) return;
    toggle({ id, name, brand, image });
  };

  if (selected && items.length >= 2) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleToggle}
          className="px-4 py-2.5 font-mono text-xs uppercase tracking-wider rounded-lg border transition-all"
          style={{
            background: 'rgba(196,154,60,0.08)',
            borderColor: 'rgba(196,154,60,0.4)',
            color: '#C49A3C',
          }}
        >
          ✓ Seçildi — Çıkar
        </button>
        <Link
          href={`/compare?ids=${items.map((i) => i.id).join(',')}`}
          className="px-4 py-2.5 font-orbitron text-xs font-bold uppercase tracking-wider rounded-lg transition-all"
          style={{
            background: 'linear-gradient(135deg, #C49A3C, rgba(196,154,60,0.7))',
            color: '#08090E',
          }}
        >
          Karşılaştır →
        </Link>
      </div>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={disabled}
      className="px-4 py-2.5 font-mono text-xs uppercase tracking-wider rounded-lg border transition-all"
      style={{
        background: selected
          ? 'rgba(196,154,60,0.08)'
          : disabled
          ? 'rgba(196,154,60,0.02)'
          : 'rgba(0,255,247,0.06)',
        borderColor: selected
          ? 'rgba(196,154,60,0.4)'
          : disabled
          ? 'rgba(196,154,60,0.08)'
          : 'rgba(0,255,247,0.25)',
        color: selected
          ? '#C49A3C'
          : disabled
          ? 'rgba(107,114,128,0.4)'
          : '#00fff7',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {selected ? '✓ Karşılaştırmaya Eklendi' : disabled ? 'Maksimum 4 ürün seçildi' : '+ Karşılaştırmaya Ekle'}
    </button>
  );
}
