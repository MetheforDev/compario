import type { Metadata, Viewport } from 'next';
import { Orbitron, JetBrains_Mono } from 'next/font/google';
import './globals.css';

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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compario',
    description: 'Her Şeyi Karşılaştır, En İyisine Karar Ver',
  },
  icons: {
    icon: [
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
        <meta name="theme-color" content="#00fff7" />
      </head>
      <body className="bg-[#08090E] text-[#EDE8DF] font-mono antialiased">
        {children}
      </body>
    </html>
  );
}
