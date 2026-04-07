'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCompare } from '@/lib/compare-store';

export function CompareBar() {
  const { items, remove, clear, count } = useCompare();
  const router = useRouter();

  if (count === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-5 pointer-events-none">
      <div
        className="pointer-events-auto w-full max-w-2xl rounded-2xl px-4 py-3 flex items-center gap-3"
        style={{
          background: 'rgba(10, 10, 16, 0.95)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(196,154,60,0.25)',
          boxShadow: '0 8px 40px rgba(196,154,60,0.12), 0 0 0 1px rgba(196,154,60,0.05)',
        }}
      >
        {/* Gold accent line top */}
        <div
          className="absolute top-0 left-6 right-6 h-px rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(196,154,60,0.5), transparent)' }}
        />

        {/* Count badge */}
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-orbitron text-xs font-black"
          style={{
            background: 'rgba(196,154,60,0.12)',
            border: '1px solid rgba(196,154,60,0.3)',
            color: '#C49A3C',
          }}
        >
          {count}
        </div>

        {/* Product chips */}
        <div className="flex-1 flex items-center gap-2 overflow-x-auto min-w-0">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
              style={{
                background: 'rgba(196,154,60,0.07)',
                border: '1px solid rgba(196,154,60,0.15)',
              }}
            >
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.name}
                  width={20}
                  height={20}
                  className="rounded object-cover flex-shrink-0"
                />
              )}
              <span className="font-mono text-[10px] text-gray-300 truncate max-w-[100px]">
                {item.brand ? `${item.brand} ` : ''}{item.name}
              </span>
              <button
                onClick={() => remove(item.id)}
                className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center font-mono text-[10px] transition-colors hover:text-white"
                style={{ color: 'rgba(196,154,60,0.5)' }}
                aria-label={`${item.name} kaldır`}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center gap-2">
          <button
            onClick={clear}
            className="font-mono text-[10px] uppercase tracking-wider transition-colors"
            style={{ color: 'rgba(139,155,172,0.5)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#8B9BAC'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(139,155,172,0.5)'; }}
          >
            Temizle
          </button>

          <button
            disabled={count < 2}
            onClick={() => router.push(`/compare?ids=${items.map((i) => i.id).join(',')}`)}
            className="font-mono text-[10px] uppercase tracking-wider px-4 py-2 rounded-lg transition-all"
            style={{
              background: count >= 2 ? 'rgba(196,154,60,0.15)' : 'rgba(196,154,60,0.05)',
              border: count >= 2 ? '1px solid rgba(196,154,60,0.4)' : '1px solid rgba(196,154,60,0.1)',
              color: count >= 2 ? '#C49A3C' : 'rgba(196,154,60,0.3)',
              cursor: count < 2 ? 'not-allowed' : 'pointer',
            }}
          >
            {count >= 2 ? `Karşılaştır →` : `2+ seç`}
          </button>
        </div>
      </div>
    </div>
  );
}
