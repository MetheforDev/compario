'use client';

import Link from 'next/link';
import type { Product } from '@compario/database';
import { useCompare } from '@/lib/compare-store';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { toggle, isSelected, isFull } = useCompare();
  const selected = isSelected(product.id);
  const disabled = !selected && isFull;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    toggle({
      id: product.id,
      name: product.name,
      brand: product.brand,
      image: product.image_url,
    });
  };

  return (
    <div
      className="group relative flex flex-col rounded-xl overflow-hidden transition-all duration-300"
      style={{
        background: 'linear-gradient(135deg, #0f0f1a 0%, #12121f 100%)',
        border: selected
          ? '1px solid rgba(196,154,60,0.5)'
          : '1px solid rgba(196,154,60,0.08)',
        boxShadow: selected
          ? '0 0 20px rgba(196,154,60,0.1), inset 0 0 15px rgba(196,154,60,0.03)'
          : undefined,
      }}
    >
      {/* Selected badge */}
      {selected && (
        <div
          className="absolute top-0 left-0 right-0 py-1 text-center font-mono text-[9px] uppercase tracking-[0.3em] z-10"
          style={{ background: 'rgba(196,154,60,0.15)', color: '#C49A3C' }}
        >
          ◆ Seçildi
        </div>
      )}

      {/* Image */}
      <Link href={`/products/${product.slug}`}>
        <div
          className="aspect-video w-full overflow-hidden bg-[#0c0c16] flex items-center justify-center"
          style={{ marginTop: selected ? '24px' : '0' }}
        >
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <span className="font-mono text-4xl opacity-10">◈</span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {product.brand && (
          <p className="font-mono text-[9px] uppercase tracking-[0.3em]" style={{ color: '#8B9BAC' }}>
            {product.brand}
            {product.model_year ? ` · ${product.model_year}` : ''}
          </p>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3
            className="font-orbitron text-xs font-bold leading-snug line-clamp-2 transition-colors duration-200"
            style={{ color: '#e5e7eb' }}
          >
            {product.name}
          </h3>
        </Link>

        {product.price_min && (
          <p className="font-orbitron text-sm font-black" style={{ color: '#C49A3C' }}>
            ₺{product.price_min.toLocaleString('tr-TR')}
            {product.price_max && product.price_max !== product.price_min && (
              <span className="font-mono text-[10px] font-normal text-gray-600 ml-1">
                — ₺{product.price_max.toLocaleString('tr-TR')}
              </span>
            )}
          </p>
        )}

        {/* Compare button */}
        <button
          onClick={handleToggle}
          disabled={disabled}
          className="mt-auto w-full py-2 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all duration-200"
          style={{
            background: selected
              ? 'rgba(196,154,60,0.12)'
              : disabled
              ? 'rgba(196,154,60,0.03)'
              : 'rgba(196,154,60,0.06)',
            border: selected
              ? '1px solid rgba(196,154,60,0.4)'
              : '1px solid rgba(196,154,60,0.1)',
            color: selected
              ? '#C49A3C'
              : disabled
              ? 'rgba(196,154,60,0.2)'
              : 'rgba(196,154,60,0.5)',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          {selected ? '✓ Karşılaştırmadan Çıkar' : disabled ? 'Maksimum 4 ürün' : '+ Karşılaştır'}
        </button>
      </div>
    </div>
  );
}
