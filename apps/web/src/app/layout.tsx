import type { Metadata, Viewport } from 'next';
import { Orbitron, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { CompareProvider } from '@/lib/compare-store';

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#C49A3C',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://compario.tech'),
  title: {
    default: 'Compario — Her Şeyi Karşılaştır, En İyisine Karar Ver',
    template: '%s | Compario',
  },
  description:
    "Türkiye'nin en kapsamlı ürün karşılaştırma platformu. 2026 model araçlar, akıllı telefonlar, laptoplar ve daha fazlasını karşılaştırın.",
  keywords: ['ürün karşılaştırma', 'araç karşılaştırma', '2026 model', 'compario', 'compare products'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Compario',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Compario',
    title: 'Compario — Her Şeyi Karşılaştır, En İyisine Karar Ver',
    description: '2026 model araçlar ve teknoloji ürünleri karşılaştırma platformu',
    locale: 'tr_TR',
    images: [{ url: '/images/web/og-image-default.png', width: 1200, height: 630, alt: 'Compario' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compario',
    description: 'Her Şeyi Karşılaştır, En İyisine Karar Ver',
    images: ['/images/web/og-image-default.png'],
  },
  icons: {
    icon: [
      { url: '/images/logos/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="tr"
      className={`${orbitron.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <meta name="application-name" content="Compario" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Compario" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#C49A3C" />
      </head>
      <body className="bg-[#08090E] text-[#EDE8DF] font-mono antialiased">
        <CompareProvider>
          {children}
        </CompareProvider>
      </body>
    </html>
  );
}
