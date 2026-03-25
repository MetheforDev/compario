'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  { href: '/categories', label: 'Kategoriler' },
  { href: '/news', label: 'Haberler' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled
          ? 'rgba(8, 9, 14, 0.94)'
          : 'rgba(8, 9, 14, 0.55)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: scrolled
          ? '1px solid rgba(196,154,60,0.1)'
          : '1px solid transparent',
      }}
    >
      {/* Gold top accent line */}
      <div
        className="h-px w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(196,154,60,0.25) 20%, rgba(196,154,60,0.7) 50%, rgba(196,154,60,0.25) 80%, transparent 100%)',
        }}
      />

      <div
        className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between transition-all duration-500"
        style={{ height: scrolled ? '56px' : '72px' }}
      >
        {/* Logo */}
        <Link href="/" className="group flex flex-col justify-center select-none">
          <div className="flex items-center gap-2">
            {/* Diamond accent */}
            <span
              className="transition-all duration-500"
              style={{
                color: 'rgba(196,154,60,0.5)',
                fontSize: scrolled ? '8px' : '10px',
              }}
            >
              ◆
            </span>
            <span
              className="font-orbitron font-black text-neon-cyan transition-all duration-500 tracking-widest"
              style={{
                fontSize: scrolled ? '16px' : '20px',
                textShadow: scrolled
                  ? 'none'
                  : '0 0 30px rgba(196,154,60,0.3), 0 0 60px rgba(196,154,60,0.1)',
              }}
            >
              COMPARIO
            </span>
          </div>
          <span
            className="font-mono uppercase tracking-[0.35em] text-neon-purple transition-all duration-500 origin-left"
            style={{
              fontSize: '7px',
              opacity: scrolled ? 0 : 0.45,
              maxHeight: scrolled ? '0' : '14px',
              overflow: 'hidden',
              paddingLeft: '18px',
            }}
          >
            Karşılaştırma Platformu
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-4 py-2 font-mono text-[11px] uppercase tracking-wider transition-all duration-200"
                style={{
                  color: active ? '#C49A3C' : '#6b7280',
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.color = '#C49A3C';
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.color = '#6b7280';
                }}
              >
                {item.label}
                {active && (
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-px"
                    style={{ background: 'rgba(196,154,60,0.6)' }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
