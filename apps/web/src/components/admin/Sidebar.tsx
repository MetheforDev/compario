'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '⬡', exact: true },
  { href: '/admin/news', label: 'Haberler', icon: '◉', exact: false },
  { href: '/admin/products', label: 'Ürünler', icon: '◈', exact: false },
  { href: '/admin/categories', label: 'Kategoriler', icon: '◇', exact: false },
  { href: '/admin/segments', label: 'Segmentler', icon: '◆', exact: false },
  { href: '/admin/users', label: 'Kullanıcılar', icon: '◎', exact: false },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin-login');
    router.refresh();
  };

  return (
    <aside className="w-64 flex-shrink-0 min-h-screen bg-[#0c0c16] border-r border-[rgba(0,255,247,0.08)] flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[rgba(0,255,247,0.08)]">
        <Link href="/" className="font-orbitron text-lg font-black text-neon-cyan hover:text-glow-cyan transition-all">
          COMPARIO
        </Link>
        <p className="font-mono text-[10px] text-neon-purple uppercase tracking-[0.3em] mt-0.5 opacity-60">
          Admin Panel
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-mono text-xs uppercase tracking-wider transition-all ${
                active
                  ? 'bg-[rgba(0,255,247,0.07)] text-neon-cyan border-l-2 border-neon-cyan pl-[14px]'
                  : 'text-gray-500 hover:text-neon-cyan hover:bg-[rgba(0,255,247,0.04)] border-l-2 border-transparent pl-[14px]'
              }`}
            >
              <span className={active ? 'opacity-100' : 'opacity-50'}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-[rgba(0,255,247,0.08)] flex flex-col gap-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 font-mono text-xs text-gray-600 uppercase tracking-wider
                     hover:text-neon-purple transition-colors rounded border-l-2 border-transparent pl-[14px]"
        >
          <span className="opacity-50">←</span>
          <span>Siteye Dön</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 font-mono text-xs text-gray-700 uppercase tracking-wider
                     hover:text-red-500 transition-colors rounded border-l-2 border-transparent pl-[14px] w-full text-left"
        >
          <span className="opacity-50">⏻</span>
          <span>Çıkış Yap</span>
        </button>
      </div>
    </aside>
  );
}
