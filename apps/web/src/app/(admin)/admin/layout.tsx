import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { Sidebar } from '@/components/admin/Sidebar';

export const metadata: Metadata = {
  title: {
    default: 'Admin',
    template: '%s | Admin — Compario',
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#12121f',
            color: '#e0e0e0',
            border: '1px solid rgba(0,255,247,0.2)',
            fontFamily: 'var(--font-jetbrains), monospace',
            fontSize: '12px',
          },
          success: {
            iconTheme: { primary: '#39ff14', secondary: '#0a0a0f' },
          },
          error: {
            iconTheme: { primary: '#ff006e', secondary: '#0a0a0f' },
          },
        }}
      />
    </div>
  );
}
