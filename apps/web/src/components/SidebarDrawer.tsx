'use client';

import { useState } from 'react';

interface Props {
  children: React.ReactNode;
}

export function SidebarDrawer({ children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider px-4 py-2 rounded-lg mb-4"
        style={{
          background: 'rgba(0,255,247,0.06)',
          border: '1px solid rgba(0,255,247,0.15)',
          color: '#00fff7',
        }}
      >
        <span>⚙</span> Filtrele
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'fixed top-0 left-0 h-full z-50 overflow-y-auto transition-transform duration-300',
          'lg:static lg:translate-x-0 lg:z-auto lg:h-auto lg:overflow-visible',
          open ? 'translate-x-0' : '-translate-x-full',
          'w-64 shrink-0',
        ].join(' ')}
        style={{
          background: 'rgba(13,15,26,0.98)',
          borderRight: '1px solid rgba(0,255,247,0.06)',
          padding: '80px 16px 32px',
        }}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setOpen(false)}
          className="lg:hidden absolute top-5 right-4 font-mono text-[10px] text-gray-500 hover:text-white transition-colors"
        >
          ✕ Kapat
        </button>

        {children}
      </aside>
    </>
  );
}
