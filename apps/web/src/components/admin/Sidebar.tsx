'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const EDITOR_ITEMS = [
  { href: '/admin/dashboard',  label: 'Dashboard',   icon: '⬡', exact: true  },
  { href: '/admin/analytics',  label: 'Analytics',   icon: '◉', exact: false },
  { href: '/admin/news',       label: 'Haberler',    icon: '▶', exact: false },
  { href: '/admin/feed',       label: 'Haber Akışı', icon: '◈', exact: false },
];

const ADMIN_ITEMS = [
  { href: '/admin/products',   label: 'Ürünler',      icon: '◈', exact: false },
  { href: '/admin/categories', label: 'Kategoriler',  icon: '◇', exact: false },
  { href: '/admin/segments',   label: 'Segmentler',   icon: '◆', exact: false },
  { href: '/admin/reviews',    label: 'Ürün Yorumları', icon: '★', exact: false },
  { href: '/admin/comments',   label: 'Yorumlar',       icon: '◈', exact: false },
  { href: '/admin/newsletter', label: 'Newsletter',     icon: '✉', exact: false },
  { href: '/admin/users',      label: 'Kullanıcılar', icon: '◎', exact: false },
];

// Bottom nav: most used items on mobile
const BOTTOM_NAV = [
  { href: '/admin/dashboard', label: 'Panel',    icon: '⬡' },
  { href: '/admin/news',      label: 'Haberler', icon: '▶' },
  { href: '/admin/products',  label: 'Ürünler',  icon: '◈' },
  { href: '/admin/analytics', label: 'Analytics',icon: '◉' },
];

interface SidebarProps {
  role?: string;
}

export function Sidebar({ role = 'superadmin' }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const isAdminOrAbove = role === 'superadmin' || role === 'admin';
  const navItems = isAdminOrAbove ? [...EDITOR_ITEMS, ...ADMIN_ITEMS] : EDITOR_ITEMS;

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    await supabase.auth.signOut();
    router.push('/admin-login');
    router.refresh();
  };

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[rgba(196,154,60,0.06)]">
        <Link href="/" className="flex items-center gap-2.5 mb-0.5" onClick={() => setOpen(false)}>
          <div className="relative flex-shrink-0" style={{ width: 28, height: 28 }}>
            <Image src="/images/logos/compario-logo-icon-only.png" alt="Compario" fill className="object-contain" sizes="28px" />
          </div>
          <span className="font-orbitron text-base font-black text-neon-cyan">COMPARIO</span>
        </Link>
        <p className="font-mono text-[9px] text-neon-purple uppercase tracking-[0.3em] mt-0.5 opacity-50">Admin Panel</p>
        <span className="inline-block mt-2 font-mono text-[9px] px-2 py-0.5 rounded-full"
          style={{
            background: role === 'editor' ? 'rgba(16,185,129,0.1)' : 'rgba(196,154,60,0.08)',
            color: role === 'editor' ? '#10B981' : '#C49A3C',
            border: role === 'editor' ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(196,154,60,0.15)',
          }}>
          {role === 'superadmin' ? 'Süper Admin' : role === 'admin' ? 'Admin' : 'Editör'}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-mono text-xs uppercase tracking-wider transition-all ${
                active ? 'text-neon-cyan border-l-2 border-neon-cyan pl-[10px]' : 'text-gray-500 hover:text-neon-cyan border-l-2 border-transparent pl-[10px]'
              }`}
              style={{ background: active ? 'rgba(196,154,60,0.06)' : undefined }}
            >
              <span className={active ? 'opacity-100' : 'opacity-40'}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-[rgba(196,154,60,0.06)] flex flex-col gap-0.5">
        <Link href="/" onClick={() => setOpen(false)}
          className="flex items-center gap-3 px-3 py-2 font-mono text-xs text-gray-600 uppercase tracking-wider hover:text-neon-purple transition-colors rounded border-l-2 border-transparent pl-[10px]">
          <span className="opacity-40 text-base leading-none">←</span>
          <span>Siteye Dön</span>
        </Link>
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 font-mono text-xs text-gray-700 uppercase tracking-wider hover:text-red-500 transition-colors rounded border-l-2 border-transparent pl-[10px] w-full text-left">
          <span className="opacity-40 text-base leading-none">⏻</span>
          <span>Çıkış Yap</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <aside className="hidden lg:flex w-56 flex-shrink-0 min-h-screen bg-[#0c0c16] border-r border-[rgba(196,154,60,0.06)] flex-col">
        <NavContent />
      </aside>

      {/* ── Mobile top bar ──────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3"
        style={{ background: '#0c0c16', borderBottom: '1px solid rgba(196,154,60,0.08)' }}>
        <button onClick={() => setOpen(true)} className="p-2 -ml-1" aria-label="Menüyü aç">
          <div className="space-y-1">
            <span className="block w-5 h-0.5 bg-neon-cyan" />
            <span className="block w-4 h-0.5 bg-neon-cyan opacity-60" />
            <span className="block w-5 h-0.5 bg-neon-cyan" />
          </div>
        </button>

        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="relative" style={{ width: 22, height: 22 }}>
            <Image src="/images/logos/compario-logo-icon-only.png" alt="Compario" fill className="object-contain" sizes="22px" />
          </div>
          <span className="font-orbitron text-sm font-black text-neon-cyan">COMPARIO</span>
        </Link>

        <Link href="/admin/news/new"
          className="font-mono text-[9px] uppercase tracking-wider px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(196,154,60,0.1)', border: '1px solid rgba(196,154,60,0.3)', color: '#C49A3C' }}>
          + Haber
        </Link>
      </div>

      {/* ── Mobile drawer backdrop ───────────────────────────── */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="relative z-10 w-64 max-w-[80vw] min-h-screen flex flex-col"
            style={{ background: '#0c0c16', borderRight: '1px solid rgba(196,154,60,0.1)' }}>
            {/* Close button */}
            <button onClick={() => setOpen(false)}
              className="absolute top-4 right-4 font-mono text-[10px] text-gray-600 hover:text-gray-400 p-1">
              ✕
            </button>
            <NavContent />
          </aside>
        </div>
      )}

      {/* ── Mobile bottom nav ────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex"
        style={{ background: '#0c0c16', borderTop: '1px solid rgba(196,154,60,0.08)' }}>
        {BOTTOM_NAV.map(item => {
          const active = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className="flex-1 flex flex-col items-center gap-1 py-2.5 transition-all"
              style={{ color: active ? '#C49A3C' : '#4b5563' }}>
              <span className="text-base leading-none">{item.icon}</span>
              <span className="font-mono text-[8px] uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
