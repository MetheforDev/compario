'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  { href: '/',           label: 'Ana Sayfa',  exact: true  },
  { href: '/categories', label: 'Kategoriler', exact: false },
  { href: '/products',   label: 'Ürünler',    exact: false },
  { href: '/trending',   label: 'Trend',      exact: false },
  { href: '/news',       label: 'Haberler',   exact: false },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const isActive = (item: typeof NAV_ITEMS[0]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled || menuOpen
            ? 'rgba(8, 9, 14, 0.97)'
            : 'rgba(8, 9, 14, 0.55)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: scrolled || menuOpen
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
          <Link
            href="/"
            className="group flex flex-col justify-center select-none"
            onClick={() => setMenuOpen(false)}
          >
            <div className="flex items-center gap-2">
              <span
                className="transition-all duration-500"
                style={{ color: 'rgba(196,154,60,0.5)', fontSize: scrolled ? '8px' : '10px' }}
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

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {NAV_ITEMS.filter(i => !i.exact).map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative px-4 py-2 font-mono text-[11px] uppercase tracking-wider transition-colors duration-200"
                  style={{ color: active ? '#C49A3C' : '#6b7280' }}
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

            {/* Search icon — desktop */}
            <Link
              href="/search"
              aria-label="Ara"
              className="ml-2 w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200"
              style={{
                color: pathname.startsWith('/search') ? '#C49A3C' : '#6b7280',
                background: pathname.startsWith('/search') ? 'rgba(196,154,60,0.08)' : 'transparent',
                border: `1px solid ${pathname.startsWith('/search') ? 'rgba(196,154,60,0.25)' : 'transparent'}`,
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = '#C49A3C';
                el.style.background = 'rgba(196,154,60,0.08)';
                el.style.border = '1px solid rgba(196,154,60,0.2)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                if (!pathname.startsWith('/search')) {
                  el.style.color = '#6b7280';
                  el.style.background = 'transparent';
                  el.style.border = '1px solid transparent';
                }
              }}
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </Link>
          </nav>

          {/* Mobile: search icon + hamburger */}
          <div className="sm:hidden flex items-center gap-2">
            <Link
              href="/search"
              aria-label="Ara"
              className="flex items-center justify-center w-9 h-9 rounded-lg"
              style={{ color: '#6b7280' }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </Link>

          {/* Hamburger button — mobile only */}
          <button
            className="sm:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded focus:outline-none"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
          >
            <span
              className="block w-5 h-px transition-all duration-300 origin-center"
              style={{
                background: '#C49A3C',
                transform: menuOpen ? 'translateY(4px) rotate(45deg)' : 'none',
              }}
            />
            <span
              className="block w-5 h-px transition-all duration-300"
              style={{
                background: '#C49A3C',
                opacity: menuOpen ? 0 : 1,
                transform: menuOpen ? 'scaleX(0)' : 'none',
              }}
            />
            <span
              className="block w-5 h-px transition-all duration-300 origin-center"
              style={{
                background: '#C49A3C',
                transform: menuOpen ? 'translateY(-4px) rotate(-45deg)' : 'none',
              }}
            />
          </button>
          </div>
        </div>{/* end: max-w-7xl container */}

        {/* Mobile dropdown menu */}
        <div
          className="sm:hidden overflow-hidden transition-all duration-400 ease-in-out"
          style={{
            maxHeight: menuOpen ? '320px' : '0',
            opacity: menuOpen ? 1 : 0,
          }}
        >
          <div
            className="border-t px-5 py-6 flex flex-col gap-1"
            style={{ borderColor: 'rgba(196,154,60,0.08)' }}
          >
            {NAV_ITEMS.map((item, i) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-4 rounded-lg font-mono text-sm uppercase tracking-wider transition-all duration-200"
                  style={{
                    color: active ? '#C49A3C' : '#9ca3af',
                    background: active ? 'rgba(196,154,60,0.06)' : 'transparent',
                    borderLeft: active ? '2px solid rgba(196,154,60,0.5)' : '2px solid transparent',
                    animationDelay: `${i * 60}ms`,
                  }}
                >
                  <span style={{ color: active ? '#C49A3C' : 'rgba(196,154,60,0.3)', fontSize: '8px' }}>
                    ◆
                  </span>
                  {item.label}
                </Link>
              );
            })}

            {/* Search link in mobile menu */}
            <Link
              href="/search"
              className="flex items-center gap-3 px-4 py-4 rounded-lg font-mono text-sm uppercase tracking-wider transition-all duration-200"
              style={{
                color: pathname.startsWith('/search') ? '#C49A3C' : '#9ca3af',
                background: pathname.startsWith('/search') ? 'rgba(196,154,60,0.06)' : 'transparent',
                borderLeft: pathname.startsWith('/search') ? '2px solid rgba(196,154,60,0.5)' : '2px solid transparent',
              }}
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              Arama
            </Link>

            {/* Bottom accent */}
            <div
              className="mt-4 h-px w-full"
              style={{
                background: 'linear-gradient(90deg, rgba(196,154,60,0.2) 0%, transparent 100%)',
              }}
            />
            <p
              className="font-mono text-[9px] uppercase tracking-[0.3em] mt-2 px-4"
              style={{ color: 'rgba(196,154,60,0.25)' }}
            >
              compario.tech
            </p>
          </div>
        </div>
      </header>

      {/* Backdrop — mobile only */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 sm:hidden"
          style={{ background: 'rgba(8,9,14,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}
