'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface SubCat {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  image_url: string | null;
}
interface MegaCat {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  image_url: string | null;
  description: string | null;
  children: SubCat[];
}

const NAV_ITEMS = [
  { href: '/',           label: 'Ana Sayfa',   exact: true,  hasMega: false },
  { href: '/categories', label: 'Kategoriler', exact: false, hasMega: true  },
  { href: '/products',   label: 'Ürünler',     exact: false, hasMega: false },
  { href: '/trending',   label: 'Trend',       exact: false, hasMega: false },
  { href: '/news',       label: 'Haberler',    exact: false, hasMega: false },
  { href: '/recommend',  label: '◆ AI Öneri',  exact: false, hasMega: false },
];

export function Header() {
  const [scrolled,        setScrolled]        = useState(false);
  const [menuOpen,        setMenuOpen]         = useState(false);
  const [megaOpen,        setMegaOpen]         = useState(false);
  const [megaCategories,  setMegaCategories]   = useState<MegaCat[]>([]);
  const [mobileCatsOpen,  setMobileCatsOpen]   = useState(false);
  const megaTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setMenuOpen(false); setMegaOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.ok ? r.json() : [])
      .then((data: MegaCat[]) => setMegaCategories(data))
      .catch(() => {});
  }, []);

  const isActive = (item: typeof NAV_ITEMS[0]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  function openMega() {
    if (megaTimeout.current) clearTimeout(megaTimeout.current);
    if (megaCategories.length > 0) setMegaOpen(true);
  }
  function closeMega() {
    megaTimeout.current = setTimeout(() => setMegaOpen(false), 140);
  }

  const hasMegaContent = megaCategories.length > 0;

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled || menuOpen || megaOpen
            ? 'rgba(8, 9, 14, 0.97)'
            : 'rgba(8, 9, 14, 0.55)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: scrolled || menuOpen
            ? '1px solid rgba(196,154,60,0.1)'
            : megaOpen
            ? '1px solid rgba(196,154,60,0.06)'
            : '1px solid transparent',
        }}
      >
        {/* Altın üst şerit */}
        <div
          className="h-px w-full"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(196,154,60,0.25) 20%, rgba(196,154,60,0.7) 50%, rgba(196,154,60,0.25) 80%, transparent 100%)',
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
            <div className="flex items-center gap-2.5">
              <div
                className="relative flex-shrink-0 transition-all duration-500"
                style={{ width: scrolled ? 28 : 36, height: scrolled ? 28 : 36 }}
              >
                <Image
                  src="/images/logos/compario-logo-icon-only.png"
                  alt="Compario"
                  fill
                  className="object-contain"
                  priority
                  sizes="36px"
                />
              </div>
              <div className="flex flex-col">
                <span
                  className="font-orbitron font-black text-neon-cyan transition-all duration-500 tracking-widest leading-none"
                  style={{
                    fontSize: scrolled ? '16px' : '20px',
                    textShadow: scrolled
                      ? 'none'
                      : '0 0 30px rgba(196,154,60,0.3), 0 0 60px rgba(196,154,60,0.1)',
                  }}
                >
                  COMPARIO
                </span>
                <span
                  className="font-mono uppercase tracking-[0.35em] text-neon-purple transition-all duration-500 origin-left"
                  style={{
                    fontSize: '7px',
                    opacity: scrolled ? 0 : 0.45,
                    maxHeight: scrolled ? '0' : '14px',
                    overflow: 'hidden',
                  }}
                >
                  Karşılaştırma Platformu
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {NAV_ITEMS.filter(i => !i.exact).map((item) => {
              const active = isActive(item);

              if (item.hasMega) {
                return (
                  <div
                    key={item.href}
                    onMouseEnter={openMega}
                    onMouseLeave={closeMega}
                  >
                    <Link
                      href={item.href}
                      className="relative flex items-center gap-1 px-4 py-2 font-mono text-[11px] uppercase tracking-wider transition-colors duration-200"
                      style={{ color: active || megaOpen ? '#C49A3C' : '#6b7280' }}
                    >
                      {item.label}
                      <svg
                        width="7" height="5" viewBox="0 0 7 5" fill="currentColor"
                        style={{
                          opacity: 0.55,
                          transition: 'transform 200ms',
                          transform: megaOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                      >
                        <path d="M3.5 5 0 0h7z"/>
                      </svg>
                      {(active || megaOpen) && (
                        <span
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-px"
                          style={{ background: 'rgba(196,154,60,0.6)' }}
                        />
                      )}
                    </Link>
                  </div>
                );
              }

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

            {/* Kullanıcı menüsü */}
            <UserMenuButton />

            {/* Arama ikonu */}
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

          {/* Mobil: arama + hamburger */}
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

            <button
              className="sm:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded focus:outline-none"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
            >
              <span className="block w-5 h-px transition-all duration-300 origin-center"
                style={{ background: '#C49A3C', transform: menuOpen ? 'translateY(4px) rotate(45deg)' : 'none' }} />
              <span className="block w-5 h-px transition-all duration-300"
                style={{ background: '#C49A3C', opacity: menuOpen ? 0 : 1, transform: menuOpen ? 'scaleX(0)' : 'none' }} />
              <span className="block w-5 h-px transition-all duration-300 origin-center"
                style={{ background: '#C49A3C', transform: menuOpen ? 'translateY(-4px) rotate(-45deg)' : 'none' }} />
            </button>
          </div>
        </div>

        {/* ── Mega Menu (desktop) ── */}
        {hasMegaContent && (
          <div
            className="hidden sm:block overflow-hidden transition-all duration-300 ease-out"
            style={{
              maxHeight: megaOpen ? '360px' : '0',
              opacity: megaOpen ? 1 : 0,
              pointerEvents: megaOpen ? 'auto' : 'none',
            }}
            onMouseEnter={openMega}
            onMouseLeave={closeMega}
          >
            <div
              className="border-t"
              style={{ borderColor: 'rgba(196,154,60,0.06)' }}
            >
              <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5">
                <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
                  {megaCategories.map((cat) => (
                    <div key={cat.id}>
                      {/* Üst kategori başlığı */}
                      <Link
                        href={`/categories/${cat.slug}`}
                        onClick={() => setMegaOpen(false)}
                        className="flex items-center gap-2 mb-2 group"
                      >
                        {cat.image_url ? (
                          <div className="relative w-7 h-7 rounded overflow-hidden flex-shrink-0">
                            <Image
                              src={cat.image_url}
                              alt={cat.name}
                              fill
                              className="object-cover"
                              sizes="28px"
                            />
                          </div>
                        ) : cat.icon ? (
                          <span className="text-lg leading-none">{cat.icon}</span>
                        ) : null}
                        <span
                          className="font-orbitron text-[9px] font-bold uppercase tracking-wider group-hover:text-neon-cyan transition-colors"
                          style={{ color: '#C49A3C' }}
                        >
                          {cat.name}
                        </span>
                      </Link>

                      {/* Alt kategoriler */}
                      <div className="space-y-0.5 ml-0.5">
                        {cat.children.slice(0, 6).map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/categories/${sub.slug}`}
                            onClick={() => setMegaOpen(false)}
                            className="flex items-center gap-1.5 py-0.5 font-mono text-[10px] text-gray-600 hover:text-neon-cyan transition-colors"
                          >
                            {sub.icon && <span className="text-[11px] leading-none opacity-60">{sub.icon}</span>}
                            {sub.name}
                          </Link>
                        ))}
                        {cat.children.length > 6 && (
                          <Link
                            href={`/categories/${cat.slug}`}
                            onClick={() => setMegaOpen(false)}
                            className="font-mono text-[9px] text-neon-purple opacity-60 hover:opacity-100 transition-opacity pt-0.5 block"
                          >
                            +{cat.children.length - 6} daha →
                          </Link>
                        )}
                        {cat.children.length === 0 && (
                          <Link
                            href={`/categories/${cat.slug}`}
                            onClick={() => setMegaOpen(false)}
                            className="font-mono text-[10px] text-gray-700 hover:text-neon-cyan transition-colors"
                          >
                            Tümünü gör →
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Alt bant */}
                <div className="mt-4 pt-3 border-t flex items-center justify-between"
                  style={{ borderColor: 'rgba(196,154,60,0.05)' }}>
                  <p className="font-mono text-[9px] uppercase tracking-widest" style={{ color: 'rgba(196,154,60,0.3)' }}>
                    {megaCategories.length} ana kategori
                  </p>
                  <Link
                    href="/categories"
                    onClick={() => setMegaOpen(false)}
                    className="font-mono text-[9px] uppercase tracking-wider text-neon-cyan opacity-50 hover:opacity-100 transition-opacity"
                  >
                    Tüm kategoriler →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Mobil dropdown menü ── */}
        <div
          className="sm:hidden overflow-hidden transition-all duration-400 ease-in-out"
          style={{
            maxHeight: menuOpen ? '520px' : '0',
            opacity: menuOpen ? 1 : 0,
          }}
        >
          <div
            className="border-t px-5 py-6 flex flex-col gap-1"
            style={{ borderColor: 'rgba(196,154,60,0.08)' }}
          >
            {NAV_ITEMS.map((item, i) => {
              const active = isActive(item);

              if (item.hasMega && megaCategories.length > 0) {
                return (
                  <div key={item.href}>
                    <button
                      onClick={() => setMobileCatsOpen(o => !o)}
                      className="w-full flex items-center gap-3 px-4 py-4 rounded-lg font-mono text-sm uppercase tracking-wider transition-all duration-200"
                      style={{
                        color: active ? '#C49A3C' : '#9ca3af',
                        background: active ? 'rgba(196,154,60,0.06)' : 'transparent',
                        borderLeft: active ? '2px solid rgba(196,154,60,0.5)' : '2px solid transparent',
                      }}
                    >
                      <span style={{ color: active ? '#C49A3C' : 'rgba(196,154,60,0.3)', fontSize: '8px' }}>◆</span>
                      <span className="flex-1 text-left">{item.label}</span>
                      <svg
                        width="10" height="7" viewBox="0 0 10 7" fill="currentColor"
                        style={{
                          opacity: 0.4,
                          transition: 'transform 200ms',
                          transform: mobileCatsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                      >
                        <path d="M5 7 0 0h10z"/>
                      </svg>
                    </button>

                    {/* Mobil alt kategori listesi */}
                    <div
                      className="overflow-hidden transition-all duration-300"
                      style={{ maxHeight: mobileCatsOpen ? '400px' : '0', opacity: mobileCatsOpen ? 1 : 0 }}
                    >
                      <div className="ml-4 pl-4 border-l mb-2 space-y-0.5" style={{ borderColor: 'rgba(196,154,60,0.1)' }}>
                        <Link
                          href="/categories"
                          className="block px-3 py-2 font-mono text-xs text-gray-500 hover:text-neon-cyan transition-colors uppercase tracking-wider"
                        >
                          — Tüm Kategoriler
                        </Link>
                        {megaCategories.map(cat => (
                          <div key={cat.id}>
                            <Link
                              href={`/categories/${cat.slug}`}
                              className="flex items-center gap-2 px-3 py-2 font-mono text-xs uppercase tracking-wider transition-colors"
                              style={{ color: '#C49A3C', opacity: 0.8 }}
                            >
                              {cat.icon && <span className="text-sm">{cat.icon}</span>}
                              {cat.name}
                            </Link>
                            {cat.children.slice(0, 4).map(sub => (
                              <Link
                                key={sub.id}
                                href={`/categories/${sub.slug}`}
                                className="flex items-center gap-2 pl-8 pr-3 py-1.5 font-mono text-[11px] text-gray-600 hover:text-neon-cyan transition-colors"
                              >
                                {sub.icon && <span className="opacity-60">{sub.icon}</span>}
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

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
                  <span style={{ color: active ? '#C49A3C' : 'rgba(196,154,60,0.3)', fontSize: '8px' }}>◆</span>
                  {item.label}
                </Link>
              );
            })}

            {/* Mobil arama linki */}
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

            <div
              className="mt-4 h-px w-full"
              style={{ background: 'linear-gradient(90deg, rgba(196,154,60,0.2) 0%, transparent 100%)' }}
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

      {/* Backdrop — mobil + mega menu */}
      {(menuOpen || megaOpen) && (
        <div
          className={`fixed inset-0 z-40 ${menuOpen ? 'sm:hidden' : ''}`}
          style={{ background: 'rgba(8,9,14,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => { setMenuOpen(false); setMegaOpen(false); }}
        />
      )}
    </>
  );
}

function UserMenuButton() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  if (!email) {
    return (
      <Link
        href="/giris"
        className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all"
        style={{ border: '1px solid rgba(0,255,247,0.15)', color: 'rgba(0,255,247,0.6)' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,255,247,0.4)'; (e.currentTarget as HTMLElement).style.color = '#00fff7'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,255,247,0.15)'; (e.currentTarget as HTMLElement).style.color = 'rgba(0,255,247,0.6)'; }}
      >
        Giriş
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 font-mono text-[10px] px-3 py-1.5 rounded-lg transition-all"
        style={{ border: '1px solid rgba(0,255,247,0.2)', color: '#00fff7', background: 'rgba(0,255,247,0.05)' }}
      >
        <span className="w-5 h-5 rounded-full bg-neon-cyan/20 flex items-center justify-center text-[10px] font-bold text-neon-cyan">
          {email[0].toUpperCase()}
        </span>
        <span className="max-w-[100px] truncate">{email.split('@')[0]}</span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-44 rounded-xl overflow-hidden z-50"
          style={{ background: '#0e0e1a', border: '1px solid rgba(0,255,247,0.12)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
        >
          <Link
            href="/profil"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-3 font-mono text-[11px] text-gray-400 hover:text-neon-cyan hover:bg-[rgba(0,255,247,0.04)] transition-colors"
          >
            ◉ Profilim
          </Link>
          <div className="h-px mx-3" style={{ background: 'rgba(0,255,247,0.06)' }} />
          <button
            onClick={handleLogout}
            className="w-full text-left flex items-center gap-2 px-4 py-3 font-mono text-[11px] text-gray-600 hover:text-red-400 hover:bg-[rgba(220,38,38,0.04)] transition-colors"
          >
            ← Çıkış Yap
          </button>
        </div>
      )}
    </div>
  );
}
