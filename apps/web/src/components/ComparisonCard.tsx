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
  specs?: SpecRow[];
}

interface ComparisonData {
  left: ProductData;
  right: ProductData;
  winner?: 'left' | 'right' | 'tie';
  verdict?: string;
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

  const { left, right, winner, verdict } = data;
  const leftWins = winner === 'left';
  const rightWins = winner === 'right';

  const maxSpecs = Math.max(left.specs?.length ?? 0, right.specs?.length ?? 0);

  return (
    <div className="my-10 select-none">
      {/* Cards row */}
      <div className="relative grid grid-cols-2 gap-0">
        {/* VS badge */}
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="flex flex-col items-center gap-1">
            <div
              className="w-11 h-11 rounded-full bg-[#0a0a0f] border-2 border-neon-purple flex items-center justify-center font-orbitron text-[11px] font-black text-neon-purple"
              style={{ boxShadow: '0 0 20px rgba(183,36,255,0.6), 0 0 40px rgba(183,36,255,0.2)' }}
            >
              VS
            </div>
            <div className="w-px flex-1 bg-gradient-to-b from-neon-purple/40 to-transparent h-8" />
          </div>
        </div>

        {/* LEFT CARD */}
        <div
          className="rounded-l-xl border border-r-0 overflow-hidden flex flex-col"
          style={{
            background: 'linear-gradient(135deg, #0f0f1a 0%, #12121f 100%)',
            borderColor: leftWins ? 'rgba(0,255,247,0.5)' : 'rgba(0,255,247,0.12)',
            boxShadow: leftWins ? '0 0 30px rgba(0,255,247,0.12), inset 0 0 20px rgba(0,255,247,0.04)' : undefined,
            animation: 'compareSlideLeft 0.5s ease-out both',
          }}
        >
          {/* Winner badge */}
          {leftWins && (
            <div className="w-full py-1.5 text-center font-orbitron text-[9px] font-black uppercase tracking-[0.3em] text-black bg-neon-cyan">
              ◆ KAZANAN ◆
            </div>
          )}

          {/* Image */}
          {left.image && (
            <div className="aspect-video w-full overflow-hidden bg-[#0c0c16]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={left.image} alt={left.name} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Name & Price */}
          <div className="p-3 sm:p-4 border-b border-[rgba(0,255,247,0.06)]">
            {left.badge && (
              <span className="inline-block mb-1.5 px-2 py-0.5 rounded-full border border-neon-cyan/30 font-mono text-[9px] text-neon-cyan uppercase tracking-wider bg-neon-cyan/10">
                {left.badge}
              </span>
            )}
            <h3 className="font-orbitron text-xs sm:text-sm font-bold text-white leading-tight mb-1">
              {left.name}
            </h3>
            {left.price && (
              <p
                className="font-orbitron text-sm sm:text-base font-black"
                style={{ color: leftWins ? '#00fff7' : '#9ca3af' }}
              >
                {left.price}
              </p>
            )}
          </div>

          {/* Specs */}
          {left.specs && left.specs.length > 0 && (
            <div className="flex-1 divide-y divide-[rgba(0,255,247,0.04)]">
              {Array.from({ length: maxSpecs }).map((_, i) => {
                const spec = left.specs![i];
                if (!spec) return (
                  <div key={i} className="px-3 sm:px-4 py-2.5 h-[42px]" />
                );
                return (
                  <div key={i} className="px-3 sm:px-4 py-2.5 flex flex-col gap-0.5">
                    <span className="font-mono text-[9px] text-gray-600 uppercase tracking-wider">
                      {spec.label}
                    </span>
                    <span
                      className="font-mono text-xs font-semibold"
                      style={{
                        color: spec.better ? '#00fff7' : '#6b7280',
                        textShadow: spec.better ? '0 0 8px rgba(0,255,247,0.5)' : undefined,
                      }}
                    >
                      {spec.better && <span className="mr-1">▲</span>}
                      {spec.value}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT CARD */}
        <div
          className="rounded-r-xl border border-l-0 overflow-hidden flex flex-col"
          style={{
            background: 'linear-gradient(225deg, #0f0f1a 0%, #12121f 100%)',
            borderColor: rightWins ? 'rgba(0,255,247,0.5)' : 'rgba(0,255,247,0.12)',
            boxShadow: rightWins ? '0 0 30px rgba(0,255,247,0.12), inset 0 0 20px rgba(0,255,247,0.04)' : undefined,
            animation: 'compareSlideRight 0.5s ease-out both',
          }}
        >
          {/* Winner badge */}
          {rightWins && (
            <div className="w-full py-1.5 text-center font-orbitron text-[9px] font-black uppercase tracking-[0.3em] text-black bg-neon-cyan">
              ◆ KAZANAN ◆
            </div>
          )}

          {/* Image */}
          {right.image && (
            <div className="aspect-video w-full overflow-hidden bg-[#0c0c16]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={right.image} alt={right.name} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Name & Price */}
          <div className="p-3 sm:p-4 border-b border-[rgba(0,255,247,0.06)]">
            {right.badge && (
              <span className="inline-block mb-1.5 px-2 py-0.5 rounded-full border border-neon-purple/30 font-mono text-[9px] text-neon-purple uppercase tracking-wider bg-neon-purple/10">
                {right.badge}
              </span>
            )}
            <h3 className="font-orbitron text-xs sm:text-sm font-bold text-white leading-tight mb-1">
              {right.name}
            </h3>
            {right.price && (
              <p
                className="font-orbitron text-sm sm:text-base font-black"
                style={{ color: rightWins ? '#00fff7' : '#9ca3af' }}
              >
                {right.price}
              </p>
            )}
          </div>

          {/* Specs */}
          {right.specs && right.specs.length > 0 && (
            <div className="flex-1 divide-y divide-[rgba(0,255,247,0.04)]">
              {Array.from({ length: maxSpecs }).map((_, i) => {
                const spec = right.specs![i];
                if (!spec) return (
                  <div key={i} className="px-3 sm:px-4 py-2.5 h-[42px]" />
                );
                return (
                  <div key={i} className="px-3 sm:px-4 py-2.5 flex flex-col gap-0.5 items-end">
                    <span className="font-mono text-[9px] text-gray-600 uppercase tracking-wider">
                      {spec.label}
                    </span>
                    <span
                      className="font-mono text-xs font-semibold"
                      style={{
                        color: spec.better ? '#00fff7' : '#6b7280',
                        textShadow: spec.better ? '0 0 8px rgba(0,255,247,0.5)' : undefined,
                      }}
                    >
                      {spec.value}
                      {spec.better && <span className="ml-1">▲</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Verdict */}
      {verdict && (
        <div
          className="mt-0 rounded-b-xl px-4 py-3 text-center font-mono text-xs text-gray-500 border border-t-0"
          style={{
            background: 'rgba(183,36,255,0.04)',
            borderColor: 'rgba(183,36,255,0.15)',
          }}
        >
          <span className="text-neon-purple mr-1.5">◈</span>
          {verdict}
        </div>
      )}
    </div>
  );
}
