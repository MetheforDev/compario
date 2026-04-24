import type { Metadata, Viewport } from 'next';
import { Orbitron, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { CompareProvider } from '@/lib/compare-store';
import { Analytics } from '@vercel/analytics/react';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { CookieConsent } from '@/components/CookieConsent';

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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compario',
    description: 'Her Şeyi Karşılaştır, En İyisine Karar Ver',
  },
  icons: {
    icon: [
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icons/icon-96x96.png',    sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/icons/favicon-32x32.png',
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://compario.tech/#organization',
      name: 'Compario',
      url: 'https://compario.tech',
      logo: {
        '@type': 'ImageObject',
        url: 'https://compario.tech/images/logos/compario-logo-icon-only.png',
        width: 256,
        height: 256,
      },
      sameAs: [
        'https://twitter.com/compariotech',
        'https://instagram.com/compariotech',
      ],
      description: "Türkiye'nin en kapsamlı ürün karşılaştırma ve teknoloji haber platformu.",
    },
    {
      '@type': 'WebSite',
      '@id': 'https://compario.tech/#website',
      url: 'https://compario.tech',
      name: 'Compario',
      publisher: { '@id': 'https://compario.tech/#organization' },
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: 'https://compario.tech/search?q={search_term_string}' },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <link rel="alternate" type="application/rss+xml" title="Compario Haberleri" href="/rss.xml" />
        <meta name="application-name" content="Compario" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Compario" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#C49A3C" />
      </head>
      <body className="bg-[#0D0F1A] text-[#EDE8DF] font-mono antialiased">
        <CompareProvider>
          {children}
          <CookieConsent />
        </CompareProvider>
        <Analytics />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
        {process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
