'use client';

import { useCompare } from '@/lib/compare-store';

interface AddToCompareButtonProps {
  product: {
    id: string;
    name: string;
    brand?: string | null;
    image_url?: string | null;
  };
}

export default function AddToCompareButton({ product }: AddToCompareButtonProps) {
  const { toggle, isSelected, isFull } = useCompare();
  const added = isSelected(product.id);
  const disabled = !added && isFull;

  return (
    <button
      onClick={() => toggle({ id: product.id, name: product.name, brand: product.brand, image: product.image_url })}
      disabled={disabled}
      className="w-full py-3.5 px-6 rounded-xl font-orbitron text-xs font-bold uppercase tracking-[0.15em] transition-all duration-200 flex items-center justify-center gap-2"
      style={
        added
          ? { background: 'rgba(196,154,60,0.12)', border: '2px solid rgba(196,154,60,0.5)', color: '#C49A3C' }
          : disabled
          ? { background: 'transparent', border: '1px solid rgba(196,154,60,0.15)', color: 'rgba(196,154,60,0.3)', cursor: 'not-allowed' }
          : { background: 'rgba(196,154,60,0.08)', border: '1px solid rgba(196,154,60,0.35)', color: '#C49A3C' }
      }
    >
      {added ? (
        <>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
            <path d="m5 13 4 4L19 7" />
          </svg>
          Karşılaştırmaya Eklendi
        </>
      ) : disabled ? (
        <>Karşılaştırma dolu (maks. 4)</>
      ) : (
        <>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Karşılaştırmaya Ekle
        </>
      )}
    </button>
  );
}
