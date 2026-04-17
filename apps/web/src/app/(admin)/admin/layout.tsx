import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { Sidebar } from '@/components/admin/Sidebar';
import { getAdminUser } from '@/lib/admin-auth';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s | Admin — Compario' },
  manifest: '/admin-manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Compario Admin',
  },
  themeColor: '#00FFF7',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();
  const role = user?.role ?? 'editor';

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">
      {/* PWA: iOS home screen icon */}
      <head>
        <link rel="apple-touch-icon" href="/images/logos/compario-logo-icon-only.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Compario Admin" />
      </head>
      <Sidebar role={role} />
      {/* pt-14 = mobile top bar, pb-16 = mobile bottom nav, lg: sıfırla */}
      <main className="flex-1 overflow-auto pt-14 pb-16 lg:pt-0 lg:pb-0">
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
