'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Items visible to all authenticated users (editors+)
const EDITOR_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard',   icon: '⬡', exact: true  },
  { href: '/admin/news',      label: 'Haberler',    icon: '◉', exact: false },
];

// Items visible only to admin / superadmin
const ADMIN_ITEMS = [
  { href: '/admin/products',   label: 'Ürünler',     icon: '◈', exact: false },
  { href: '/admin/categories', label: 'Kategoriler', icon: '◇', exact: false },
  { href: '/admin/segments',   label: 'Segmentler',  icon: '◆', exact: false },
  { href: '/admin/users',      label: 'Kullanıcılar',icon: '◎', exact: false },
];

interface SidebarProps {
  role?: string; // 'superadmin' | 'admin' | 'editor'
}

export function Sidebar({ role = 'superadmin' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const isAdminOrAbove = role === 'superadmin' || role === 'admin';
  const navItems = isAdminOrAbove ? [...EDITOR_ITEMS, ...ADMIN_ITEMS] : EDITOR_ITEMS;

  const handleLogout = async () => {
    // Clear simple cookie (super admin)
    await fetch('/api/admin/logout', { method: 'POST' });
    // Also sign out of Supabase (editor/admin)
    await supabase.auth.signOut();
    router.push('/admin-login');
    router.refresh();
  };

  return (
    <aside className="w-56 flex-shrink-0 min-h-screen bg-[#0c0c16] border-r border-[rgba(196,154,60,0.06)] flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[rgba(196,154,60,0.06)]">
        <Link href="/" className="font-orbitron text-base font-black text-neon-cyan hover:text-glow-cyan transition-all">
          COMPARIO
        </Link>
        <p className="font-mono text-[9px] text-neon-purple uppercase tracking-[0.3em] mt-0.5 opacity-50">
          Admin Panel
        </p>
        {/* Role badge */}
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
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-mono text-xs uppercase tracking-wider transition-all ${
                active
                  ? 'text-neon-cyan border-l-2 border-neon-cyan pl-[10px]'
                  : 'text-gray-500 hover:text-neon-cyan border-l-2 border-transparent pl-[10px]'
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
        <Link href="/"
          className="flex items-center gap-3 px-3 py-2 font-mono text-xs text-gray-600 uppercase tracking-wider
                     hover:text-neon-purple transition-colors rounded border-l-2 border-transparent pl-[10px]">
          <span className="opacity-40 text-base leading-none">←</span>
          <span>Siteye Dön</span>
        </Link>
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 font-mono text-xs text-gray-700 uppercase tracking-wider
                     hover:text-red-500 transition-colors rounded border-l-2 border-transparent pl-[10px] w-full text-left">
          <span className="opacity-40 text-base leading-none">⏻</span>
          <span>Çıkış Yap</span>
        </button>
      </div>
    </aside>
  );
}
