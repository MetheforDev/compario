import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { Sidebar } from '@/components/admin/Sidebar';
import { getAdminUser } from '@/lib/admin-auth';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s | Admin — Compario' },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();
  const role = user?.role ?? 'editor';

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">
      <Sidebar role={role} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#12121f',
            color: '#e0e0e0',
            border: '1px solid rgba(196,154,60,0.2)',
            fontFamily: 'var(--font-jetbrains), monospace',
            fontSize: '12px',
          },
          success: { iconTheme: { primary: '#10B981', secondary: '#0a0a0f' } },
          error:   { iconTheme: { primary: '#DC2626', secondary: '#0a0a0f' } },
        }}
      />
    </div>
  );
}
