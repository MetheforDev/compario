'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface WidgetProduct {
  name: string;
  brand: string | null;
  image_url: string | null;
  price_min: number | null;
  score: number;
  isWinner: boolean;
}

interface HeroCompareWidgetProps {
  products: WidgetProduct[];
}

const SPECS = [
  { label: 'Performans', a: 87, b: 74 },
  { label: 'Verimlilik',  a: 91, b: 68 },
  { label: 'Değer',       a: 85, b: 61 },
];

export function HeroCompareWidget({ products }: HeroCompareWidgetProps) {
  const [tick, setTick] = useState(0);
  const [visible, setVisible] = useState(false);

  // Fade-in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Animated bar fill
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 2400);
    return () => clearInterval(id);
  }, []);

  const p1 = products[0];
  const p2 = products[1];
  if (!p1 || !p2) return null;

  return (
    <div
      className="relative max-w-sm mx-auto mt-14"
      style={{
        perspective: '1000px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s ease',
      }}
    >
      {/* Animated glow orb behind */}
      <div
        className="absolute -inset-8 rounded-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 60%, rgba(0,255,247,0.12) 0%, rgba(183,36,255,0.08) 40%, transparent 70%)',
          animation: 'pulse-glow 4s ease-in-out infinite',
          filter: 'blur(20px)',
        }}
      />

      {/* 3D floating card */}
      <div
        style={{
          background: 'linear-gradient(145deg, rgba(14,14,26,0.97) 0%, rgba(9,9,18,0.99) 100%)',
          border: '1px solid rgba(0,255,247,0.14)',
          borderRadius: '20px',
          boxShadow: [
            '0 40px 100px rgba(0,0,0,0.7)',
            '0 0 0 1px rgba(0,255,247,0.04)',
            'inset 0 1px 0 rgba(255,255,255,0.05)',
          ].join(', '),
          animation: 'float-3d 6s ease-in-out infinite',
          transformStyle: 'preserve-3d',
          padding: '20px',
        }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#00fff7', boxShadow: '0 0 6px #00fff7' }} />
            <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-gray-600">Canlı Karşılaştırma</span>
          </div>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(239,68,68,0.5)' }} />
            <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(234,179,8,0.5)' }} />
            <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(34,197,94,0.5)' }} />
          </div>
        </div>

        {/* Products */}
        <div className="flex items-stretch gap-3 mb-5">
          {/* Winner */}
          <div
            className="flex-1 rounded-2xl p-3 flex flex-col items-center gap-2"
            style={{
              background: 'rgba(0,255,247,0.05)',
              border: '1px solid rgba(0,255,247,0.18)',
              boxShadow: 'inset 0 1px 0 rgba(0,255,247,0.08)',
            }}
          >
            {/* Winner badge */}
            <span
              className="font-mono text-[7px] px-2 py-0.5 rounded-full uppercase tracking-wider"
              style={{ background: 'rgba(0,255,247,0.12)', color: '#00fff7', border: '1px solid rgba(0,255,247,0.25)' }}
            >
              ▲ Kazanan
            </span>

            {/* Image */}
            <div
              className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0"
              style={{ background: 'rgba(0,255,247,0.06)' }}
            >
              {p1.image_url ? (
                <Image src={p1.image_url} alt={p1.name} fill className="object-cover" sizes="64px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-orbitron text-lg font-black" style={{ color: 'rgba(0,255,247,0.3)' }}>
                    {(p1.brand ?? p1.name).slice(0, 1)}
                  </span>
                </div>
              )}
            </div>

            <div className="text-center">
              {p1.brand && <p className="font-mono text-[7px] text-gray-600 uppercase tracking-wider">{p1.brand}</p>}
              <p className="font-orbitron text-[9px] font-bold text-neon-cyan leading-tight">{p1.name}</p>
              {p1.price_min && (
                <p className="font-orbitron text-[10px] font-black mt-1" style={{ color: '#00fff7' }}>
                  ₺{p1.price_min.toLocaleString('tr-TR')}
                </p>
              )}
            </div>
          </div>

          {/* VS divider */}
          <div className="flex flex-col items-center justify-center gap-2 flex-shrink-0 px-1">
            <div className="h-8 w-px" style={{ background: 'linear-gradient(to bottom, transparent, rgba(183,36,255,0.4), transparent)' }} />
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: 'rgba(183,36,255,0.12)',
                border: '1px solid rgba(183,36,255,0.35)',
                boxShadow: '0 0 16px rgba(183,36,255,0.15)',
              }}
            >
              <span className="font-orbitron text-[8px] font-black text-neon-purple">VS</span>
            </div>
            <div className="h-8 w-px" style={{ background: 'linear-gradient(to bottom, rgba(183,36,255,0.4), transparent)' }} />
          </div>

          {/* Challenger */}
          <div
            className="flex-1 rounded-2xl p-3 flex flex-col items-center gap-2"
            style={{
              background: 'rgba(196,154,60,0.04)',
              border: '1px solid rgba(196,154,60,0.12)',
            }}
          >
            <span className="font-mono text-[7px] px-2 py-0.5 rounded-full uppercase tracking-wider"
              style={{ background: 'rgba(196,154,60,0.1)', color: '#C49A3C', border: '1px solid rgba(196,154,60,0.2)' }}>
              Rakip
            </span>

            <div
              className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0"
              style={{ background: 'rgba(196,154,60,0.06)' }}
            >
              {p2.image_url ? (
                <Image src={p2.image_url} alt={p2.name} fill className="object-cover" sizes="64px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-orbitron text-lg font-black" style={{ color: 'rgba(196,154,60,0.3)' }}>
                    {(p2.brand ?? p2.name).slice(0, 1)}
                  </span>
                </div>
              )}
            </div>

            <div className="text-center">
              {p2.brand && <p className="font-mono text-[7px] text-gray-600 uppercase tracking-wider">{p2.brand}</p>}
              <p className="font-orbitron text-[9px] font-bold text-gray-400 leading-tight">{p2.name}</p>
              {p2.price_min && (
                <p className="font-orbitron text-[10px] font-black mt-1 text-gray-500">
                  ₺{p2.price_min.toLocaleString('tr-TR')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Animated score bars */}
        <div className="space-y-2.5">
          {SPECS.map(({ label, a, b }, i) => {
            const animOffset = (tick + i) % 3;
            const aVal = a + (animOffset === 0 ? 0 : animOffset === 1 ? 3 : -2);
            const bVal = b + (animOffset === 0 ? 0 : animOffset === 1 ? -2 : 4);
            return (
              <div key={label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[7px] text-gray-700 uppercase tracking-wider">{label}</span>
                  <span className="font-mono text-[7px]" style={{ color: '#00fff7' }}>{aVal}%</span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${aVal}%`,
                        background: 'linear-gradient(to right, #00fff7, rgba(0,255,247,0.5))',
                        boxShadow: '0 0 6px rgba(0,255,247,0.4)',
                      }}
                    />
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${bVal}%`, background: '#2d3748' }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom glow line */}
        <div
          className="absolute bottom-0 left-6 right-6 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(0,255,247,0.3), transparent)' }}
        />
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes float-3d {
          0%, 100% {
            transform: rotateX(8deg) rotateY(-3deg) translateY(0px);
            box-shadow: 0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,255,247,0.04), inset 0 1px 0 rgba(255,255,255,0.05);
          }
          33% {
            transform: rotateX(5deg) rotateY(-6deg) translateY(-10px);
            box-shadow: 0 55px 120px rgba(0,0,0,0.75), 0 0 0 1px rgba(0,255,247,0.07), inset 0 1px 0 rgba(255,255,255,0.05);
          }
          66% {
            transform: rotateX(10deg) rotateY(0deg) translateY(-5px);
            box-shadow: 0 45px 110px rgba(0,0,0,0.72), 0 0 0 1px rgba(0,255,247,0.05), inset 0 1px 0 rgba(255,255,255,0.05);
          }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
