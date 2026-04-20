import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Hakkında | Compario',
  description: "Compario, Türkiye'nin en kapsamlı ürün karşılaştırma ve teknoloji haber platformu. Araçlar, telefonlar, laptoplar ve daha fazlasını karşılaştırın.",
  alternates: { canonical: 'https://compario.tech/about' },
  openGraph: {
    title: 'Hakkında | Compario',
    description: "Türkiye'nin #1 karşılaştırma platformu",
    url: 'https://compario.tech/about',
    siteName: 'Compario',
    locale: 'tr_TR',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'Compario Hakkında',
  url: 'https://compario.tech/about',
  description: "Türkiye'nin en kapsamlı ürün karşılaştırma platformu",
  mainEntity: {
    '@type': 'Organization',
    name: 'Compario',
    url: 'https://compario.tech',
    founder: {
      '@type': 'Person',
      name: 'Metehan Arslan',
      email: 'methefor@gmail.com',
    },
    foundingDate: '2025',
    description: "Türkiye'nin en kapsamlı ürün karşılaştırma ve teknoloji haber platformu.",
  },
};

const FEATURES = [
  {
    icon: '◈',
    color: '#00fff7',
    title: 'Ürün Karşılaştırma',
    desc: 'Araçlar, telefonlar, laptoplar, tabletler ve daha fazlasını yan yana karşılaştırın. Spec tabloları, fiyat analizi ve puan sistemi.',
  },
  {
    icon: '◉',
    color: '#b724ff',
    title: 'Teknoloji Haberleri',
    desc: 'Yeni model duyuruları, fiyat güncellemeleri ve test incelemeleri. Türkiye pazarına özel içerikler.',
  },
  {
    icon: '⬡',
    color: '#C49A3C',
    title: 'Fiyat Takibi',
    desc: 'Beğendiğin ürünün fiyatı düşünce e-posta bildirimi al. Doğru zamanda doğru fiyatla satın al.',
  },
  {
    icon: '◆',
    color: '#00fff7',
    title: 'AI Öneri',
    desc: 'Kullanım alışkanlıklarını anlat, sana en uygun ürünü bulalım. Bütçe + ihtiyaç = kişisel öneri.',
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-grid pb-24" style={{ paddingTop: '88px' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Hero ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,255,247,0.06) 0%, transparent 70%)' }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-20 text-center">
          <div className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.4em] px-3 py-1.5 rounded-full mb-6"
            style={{ border: '1px solid rgba(0,255,247,0.15)', color: 'rgba(0,255,247,0.6)' }}>
            ◆ Compario Hakkında
          </div>
          <h1 className="font-orbitron text-3xl sm:text-5xl font-black text-white leading-tight mb-6">
            Her Şeyi Karşılaştır,<br />
            <span style={{ color: '#00fff7' }}>En İyisine Karar Ver</span>
          </h1>
          <p className="font-mono text-sm sm:text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
            Compario, Türkiye'nin en kapsamlı ürün karşılaştırma ve teknoloji haber platformudur.
            Veriye dayalı kararlar almanıza yardımcı oluyoruz.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* ── Misyon ── */}
        <section className="mb-16">
          <div className="rounded-2xl p-8 sm:p-10"
            style={{ background: '#0c0c18', border: '1px solid rgba(196,154,60,0.12)' }}>
            <p className="font-mono text-[9px] uppercase tracking-[0.4em] mb-4" style={{ color: 'rgba(196,154,60,0.5)' }}>
              Misyon
            </p>
            <p className="font-mono text-sm sm:text-base text-gray-400 leading-loose">
              Türkiye'de ürün satın alma kararı vermek zor — onlarca model, farklı fiyatlar, yüzlerce spec.
              Compario bunu kolaylaştırıyor: tüm bilgiyi tek sayfada topluyor, karşılaştırılabilir hale getiriyor
              ve sizi en iyi seçime götürüyor.
            </p>
            <p className="font-mono text-sm sm:text-base text-gray-400 leading-loose mt-4">
              Hedefimiz Türkiye'nin <span className="text-neon-cyan">#1 karşılaştırma platformu</span> olmak —
              epey.com'un ürün derinliğini, webtekno.com'un haber kalitesini tek çatı altında birleştirmek.
            </p>
          </div>
        </section>

        {/* ── Özellikler ── */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg,rgba(0,255,247,0.2),transparent)' }} />
            <h2 className="font-orbitron text-[10px] uppercase tracking-[0.4em] text-neon-cyan opacity-70 whitespace-nowrap">
              Ne Sunuyoruz
            </h2>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(270deg,rgba(0,255,247,0.2),transparent)' }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl p-6"
                style={{ background: '#0c0c18', border: `1px solid ${f.color}18` }}>
                <span className="text-2xl mb-3 block" style={{ color: f.color }}>{f.icon}</span>
                <h3 className="font-orbitron text-sm font-bold text-white mb-2">{f.title}</h3>
                <p className="font-mono text-xs text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Kurucu ── */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg,rgba(183,36,255,0.2),transparent)' }} />
            <h2 className="font-orbitron text-[10px] uppercase tracking-[0.4em] text-neon-purple opacity-70 whitespace-nowrap">
              Kurucu
            </h2>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(270deg,rgba(183,36,255,0.2),transparent)' }} />
          </div>
          <div className="rounded-2xl p-8 flex flex-col sm:flex-row items-start gap-6"
            style={{ background: '#0c0c18', border: '1px solid rgba(183,36,255,0.12)' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-orbitron text-2xl font-black flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg,rgba(0,255,247,0.2),rgba(183,36,255,0.2))',
                border: '2px solid rgba(0,255,247,0.25)',
                color: '#00fff7',
              }}>
              M
            </div>
            <div>
              <h3 className="font-orbitron text-lg font-black text-white mb-1">Metehan Arslan</h3>
              <p className="font-mono text-[10px] uppercase tracking-wider text-neon-purple opacity-60 mb-4">
                Founder & Developer
              </p>
              <p className="font-mono text-sm text-gray-500 leading-relaxed mb-4">
                Teknoloji ve araçlara tutkun bir yazılım geliştirici. Compario'yu Türkiye'deki ürün karşılaştırma
                ekosistemindeki boşluğu doldurmak için kurdu. Günde 2–4 saat yan proje olarak geliştiriyor.
              </p>
              <a href="mailto:methefor@gmail.com"
                className="inline-flex items-center gap-2 font-mono text-[11px] px-4 py-2 rounded-lg transition-all hover:opacity-80"
                style={{ border: '1px solid rgba(0,255,247,0.2)', color: '#00fff7', background: 'rgba(0,255,247,0.05)' }}>
                ⬡ methefor@gmail.com
              </a>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="text-center py-12 rounded-2xl"
          style={{ background: 'linear-gradient(135deg,rgba(0,255,247,0.04),rgba(183,36,255,0.04))', border: '1px solid rgba(0,255,247,0.08)' }}>
          <h2 className="font-orbitron text-xl font-black text-white mb-3">
            Karşılaştırmaya Başla
          </h2>
          <p className="font-mono text-sm text-gray-600 mb-6">
            500+ ürün, 20+ kategori — hepsi ücretsiz.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/categories" className="btn-neon text-xs">Kategorilere Göz At →</Link>
            <Link href="/products"
              className="font-mono text-xs px-5 py-2.5 rounded-lg transition-all hover:opacity-80"
              style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#6b7280' }}>
              Tüm Ürünler
            </Link>
          </div>
        </section>

        {/* ── İletişim ── */}
        <section className="mt-16 pt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-gray-700 mb-4">İletişim</p>
          <div className="flex flex-wrap gap-4">
            <a href="mailto:methefor@gmail.com"
              className="font-mono text-xs text-gray-600 hover:text-neon-cyan transition-colors">
              methefor@gmail.com
            </a>
            <span className="text-gray-700">·</span>
            <a href="https://twitter.com/compariotech" target="_blank" rel="noopener noreferrer"
              className="font-mono text-xs text-gray-600 hover:text-neon-cyan transition-colors">
              @compariotech
            </a>
            <span className="text-gray-700">·</span>
            <a href="https://instagram.com/compariotech" target="_blank" rel="noopener noreferrer"
              className="font-mono text-xs text-gray-600 hover:text-neon-cyan transition-colors">
              instagram.com/compariotech
            </a>
          </div>
        </section>

      </div>
    </main>
  );
}
