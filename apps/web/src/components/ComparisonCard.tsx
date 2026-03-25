'use client';

interface SpecRow {
  label: string;
  value: string;
  better?: boolean;
}

interface ProductData {
  name: string;
  price?: string;
  image?: string;
  badge?: string;
  winner?: boolean;
  specs?: SpecRow[];
}

interface ComparisonData {
  products?: ProductData[];
  // Legacy 2-product format support
  left?: ProductData;
  right?: ProductData;
  winner?: 'left' | 'right' | 'tie';
  verdict?: string;
}

function normalizeData(raw: ComparisonData): { products: ProductData[]; verdict?: string } {
  if (raw.products) {
    return { products: raw.products, verdict: raw.verdict };
  }
  // Convert legacy {left, right} format
  if (raw.left && raw.right) {
    const left = { ...raw.left, winner: raw.winner === 'left' };
    const right = { ...raw.right, winner: raw.winner === 'right' };
    return { products: [left, right], verdict: raw.verdict };
  }
  return { products: [], verdict: raw.verdict };
}

function ProductCard({
  product,
  index,
  maxSpecs,
  isLeft,
  isRight,
  total,
}: {
  product: ProductData;
  index: number;
  maxSpecs: number;
  isLeft: boolean;
  isRight: boolean;
  total: number;
}) {
  const winnerBorder = product.winner
    ? 'rgba(196,154,60,0.5)'
    : 'rgba(196,154,60,0.12)';
  const winnerShadow = product.winner
    ? '0 0 30px rgba(196,154,60,0.12), inset 0 0 20px rgba(196,154,60,0.04)'
    : undefined;

  const roundedClass =
    total === 2
      ? isLeft ? 'rounded-l-xl' : 'rounded-r-xl'
      : total === 3
      ? index === 0 ? 'rounded-l-xl' : index === 2 ? 'rounded-r-xl' : ''
      : index === 0 ? 'rounded-tl-xl' : index === 1 ? 'rounded-tr-xl' : index === 2 ? 'rounded-bl-xl' : 'rounded-br-xl';

  const borderClass =
    total === 2
      ? isLeft ? 'border border-r-0' : 'border border-l-0'
      : total === 3
      ? index === 0 ? 'border border-r-0' : index === 2 ? 'border border-l-0' : 'border border-x-0'
      : index === 0 ? 'border border-r-0 border-b-0' : index === 1 ? 'border border-l-0 border-b-0' : index === 2 ? 'border border-r-0 border-t-0' : 'border border-l-0 border-t-0';

  const slideAnim =
    total === 2
      ? isLeft ? 'compareSlideLeft 0.5s ease-out both' : 'compareSlideRight 0.5s ease-out both'
      : `compareSlideLeft ${0.3 + index * 0.1}s ease-out both`;

  return (
    <div
      className={`${roundedClass} ${borderClass} overflow-hidden flex flex-col`}
      style={{
        background: `linear-gradient(${isLeft ? '135deg' : '225deg'}, #0f0f1a 0%, #12121f 100%)`,
        borderColor: winnerBorder,
        boxShadow: winnerShadow,
        animation: slideAnim,
      }}
    >
      {/* Winner badge */}
      {product.winner && (
        <div className="w-full py-1.5 text-center font-orbitron text-[9px] font-black uppercase tracking-[0.3em] text-black bg-neon-cyan">
          ◆ KAZANAN ◆
        </div>
      )}

      {/* Rank number for 3-4 products */}
      {!product.winner && total > 2 && (
        <div className="w-full py-1 text-center font-mono text-[9px] text-gray-700 bg-[rgba(0,0,0,0.2)]">
          #{index + 1}
        </div>
      )}

      {/* Image */}
      {product.image && (
        <div className="aspect-video w-full overflow-hidden bg-[#0c0c16]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Name & Price */}
      <div className="p-3 sm:p-4 border-b border-[rgba(196,154,60,0.06)]">
        {product.badge && (
          <span
            className="inline-block mb-1.5 px-2 py-0.5 rounded-full border font-mono text-[9px] uppercase tracking-wider"
            style={{
              borderColor: product.winner ? 'rgba(196,154,60,0.4)' : 'rgba(139,155,172,0.3)',
              color: product.winner ? '#C49A3C' : '#8B9BAC',
              background: product.winner ? 'rgba(196,154,60,0.08)' : 'rgba(139,155,172,0.08)',
            }}
          >
            {product.badge}
          </span>
        )}
        <h3 className="font-orbitron text-xs sm:text-sm font-bold text-white leading-tight mb-1">
          {product.name}
        </h3>
        {product.price && (
          <p
            className="font-orbitron text-sm sm:text-base font-black"
            style={{ color: product.winner ? '#C49A3C' : '#9ca3af' }}
          >
            {product.price}
          </p>
        )}
      </div>

      {/* Specs */}
      {(product.specs?.length ?? 0) > 0 && (
        <div className="flex-1 divide-y divide-[rgba(196,154,60,0.04)]">
          {Array.from({ length: maxSpecs }).map((_, i) => {
            const spec = product.specs?.[i];
            if (!spec) return <div key={i} className="px-3 sm:px-4 py-2.5 min-h-[42px]" />;
            const alignRight = !isLeft && total === 2;
            return (
              <div
                key={i}
                className={`px-3 sm:px-4 py-2.5 flex flex-col gap-0.5 ${alignRight ? 'items-end' : ''}`}
              >
                <span className="font-mono text-[9px] text-gray-600 uppercase tracking-wider">
                  {spec.label}
                </span>
                <span
                  className="font-mono text-xs font-semibold"
                  style={{
                    color: spec.better ? '#C49A3C' : '#6b7280',
                    textShadow: spec.better ? '0 0 8px rgba(196,154,60,0.5)' : undefined,
                  }}
                >
                  {!alignRight && spec.better && <span className="mr-1">▲</span>}
                  {spec.value}
                  {alignRight && spec.better && <span className="ml-1">▲</span>}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface ComparisonCardProps {
  raw: string;
}

export function ComparisonCard({ raw }: ComparisonCardProps) {
  let data: ComparisonData;
  try {
    data = JSON.parse(raw) as ComparisonData;
  } catch {
    return (
      <pre className="bg-red-500/10 border border-red-500/30 rounded p-4 font-mono text-xs text-red-400">
        [compare bloğu hatalı JSON]
      </pre>
    );
  }

  const { products, verdict } = normalizeData(data);

  if (!products.length) {
    return (
      <pre className="bg-red-500/10 border border-red-500/30 rounded p-4 font-mono text-xs text-red-400">
        [compare bloğu boş — products dizisi gerekli]
      </pre>
    );
  }

  const total = Math.min(products.length, 4);
  const visibleProducts = products.slice(0, total);
  const maxSpecs = Math.max(...visibleProducts.map((p) => p.specs?.length ?? 0));

  // Layout classes per count
  const gridClass =
    total === 2
      ? 'grid grid-cols-2'
      : total === 3
      ? 'grid grid-cols-3'
      : 'grid grid-cols-2 lg:grid-cols-4';

  const showVsBadge = total === 2;

  return (
    <div className="my-10 select-none">
      {/* VS badge — only for 2 products */}
      {showVsBadge && (
        <div className="relative pointer-events-none" style={{ height: 0 }}>
          <div className="absolute left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
            style={{ top: '40px' }}>
            <div
              className="w-11 h-11 rounded-full bg-[#0a0a0f] border-2 border-neon-purple flex items-center justify-center font-orbitron text-[11px] font-black text-neon-purple"
              style={{ boxShadow: '0 0 20px rgba(139,155,172,0.4), 0 0 40px rgba(139,155,172,0.15)' }}
            >
              VS
            </div>
          </div>
        </div>
      )}

      {/* Header for 3-4 products */}
      {!showVsBadge && (
        <div className="flex items-center gap-3 mb-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[rgba(139,155,172,0.3)]" />
          <span
            className="font-orbitron text-[10px] uppercase tracking-[0.4em] font-black"
            style={{ color: '#8B9BAC' }}
          >
            {total} ÜRÜN KARŞILAŞTIRMASI
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[rgba(139,155,172,0.3)]" />
        </div>
      )}

      {/* Cards grid */}
      <div className={gridClass}>
        {visibleProducts.map((product, i) => (
          <ProductCard
            key={i}
            product={product}
            index={i}
            maxSpecs={maxSpecs}
            isLeft={i === 0}
            isRight={i === total - 1}
            total={total}
          />
        ))}
      </div>

      {/* Verdict */}
      {verdict && (
        <div
          className="rounded-b-xl px-4 py-3 text-center font-mono text-xs text-gray-500 border border-t-0"
          style={{
            background: 'rgba(139,155,172,0.04)',
            borderColor: 'rgba(139,155,172,0.15)',
          }}
        >
          <span className="text-neon-purple mr-1.5 opacity-60">◈</span>
          {verdict}
        </div>
      )}
    </div>
  );
}
