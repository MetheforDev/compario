import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Compario — Linkler',
  description: 'Compario — Her Şeyi Karşılaştır, En İyisine Karar Ver',
};

// ─── UPDATE THESE WHEN ACCOUNTS ARE READY ───────────────────────────────────
const SOCIAL_LINKS = {
  instagram: 'https://instagram.com/compario',   // ← güncelle
  twitter:   'https://x.com/compario',            // ← güncelle
  youtube:   'https://youtube.com/@compario',     // ← güncelle
};
// ─────────────────────────────────────────────────────────────────────────────

const MAIN_LINKS = [
  {
    icon: '⬡',
    label: 'Ana Platform',
    sublabel: 'compario.tech',
    href: 'https://compario.tech',
    external: true,
    accent: '#C49A3C',
  },
  {
    icon: '◈',
    label: 'Ürün Karşılaştırma',
    sublabel: 'En iyi fiyat ve özellikleri keşfet',
    href: '/categories',
    external: false,
    accent: '#C49A3C',
  },
  {
    icon: '◉',
    label: 'Son Haberler',
    sublabel: 'Yeni modeller, testler ve analizler',
    href: '/news',
    external: false,
    accent: '#8B9BAC',
  },
];

function LinkButton({
  icon, label, sublabel, href, external, accent,
}: typeof MAIN_LINKS[0]) {
  const inner = (
    <div
      className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(196,154,60,0.12)',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = `rgba(196,154,60,0.06)`;
        el.style.border = `1px solid rgba(196,154,60,0.3)`;
        el.style.boxShadow = `0 0 20px rgba(196,154,60,0.08)`;
        el.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = 'rgba(255,255,255,0.03)';
        el.style.border = '1px solid rgba(196,154,60,0.12)';
        el.style.boxShadow = '';
        el.style.transform = '';
      }}
    >
      {/* Icon */}
      <span
        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-mono text-base"
        style={{
          background: `rgba(196,154,60,0.08)`,
          border: `1px solid rgba(196,154,60,0.15)`,
          color: accent,
        }}
      >
        {icon}
      </span>

      {/* Text */}
      <div className="flex-1 text-left">
        <p className="font-orbitron text-sm font-bold text-white">{label}</p>
        <p className="font-mono text-[10px] mt-0.5" style={{ color: 'rgba(196,154,60,0.45)' }}>
          {sublabel}
        </p>
      </div>

      {/* Arrow */}
      <span className="font-mono text-xs transition-transform duration-200 group-hover:translate-x-1"
        style={{ color: 'rgba(196,154,60,0.4)' }}>
        →
      </span>
    </div>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block w-full">
        {inner}
      </a>
    );
  }
  return <Link href={href} className="block w-full">{inner}</Link>;
}

export default function LinksPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: '#08090E' }}
    >
      {/* Background glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(196,154,60,0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Background grid dots */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(196,154,60,0.15) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Card container */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-8">

        {/* Logo block */}
        <div className="flex flex-col items-center gap-3 text-center">
          {/* Gold top accent */}
          <div
            className="w-16 h-px mb-2"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(196,154,60,0.8), transparent)' }}
          />

          {/* Brand */}
          <div className="flex items-center gap-2">
            <span style={{ color: 'rgba(196,154,60,0.5)', fontSize: '12px' }}>◆</span>
            <h1
              className="font-orbitron font-black tracking-widest"
              style={{
                fontSize: '28px',
                color: '#C49A3C',
                textShadow: '0 0 40px rgba(196,154,60,0.4), 0 0 80px rgba(196,154,60,0.15)',
              }}
            >
              COMPARIO
            </h1>
            <span style={{ color: 'rgba(196,154,60,0.5)', fontSize: '12px' }}>◆</span>
          </div>

          <p className="font-mono text-[10px] uppercase tracking-[0.4em]"
            style={{ color: 'rgba(139,155,172,0.6)' }}>
            Karşılaştırma Platformu
          </p>

          {/* Tagline */}
          <p className="font-mono text-xs mt-1" style={{ color: 'rgba(237,232,223,0.4)' }}>
            Her Şeyi Karşılaştır, En İyisine Karar Ver
          </p>

          {/* Gold divider */}
          <div
            className="w-24 h-px mt-2"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(196,154,60,0.4), transparent)' }}
          />
        </div>

        {/* Main links */}
        <div className="w-full flex flex-col gap-3">
          {MAIN_LINKS.map((link) => (
            <LinkButton key={link.href} {...link} />
          ))}
        </div>

        {/* Social icons */}
        <div className="flex items-center gap-4">
          {/* Instagram */}
          <a
            href={SOCIAL_LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(196,154,60,0.1)',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.border = '1px solid rgba(196,154,60,0.35)';
              el.style.background = 'rgba(196,154,60,0.07)';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.border = '1px solid rgba(196,154,60,0.1)';
              el.style.background = 'rgba(255,255,255,0.03)';
            }}
            aria-label="Instagram"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(196,154,60,0.6)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="0.5" fill="rgba(196,154,60,0.6)" stroke="none"/>
            </svg>
          </a>

          {/* X / Twitter */}
          <a
            href={SOCIAL_LINKS.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(196,154,60,0.1)',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.border = '1px solid rgba(196,154,60,0.35)';
              el.style.background = 'rgba(196,154,60,0.07)';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.border = '1px solid rgba(196,154,60,0.1)';
              el.style.background = 'rgba(255,255,255,0.03)';
            }}
            aria-label="X (Twitter)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(196,154,60,0.6)">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.858L1.254 2.25H8.08l4.256 5.626L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>

          {/* YouTube */}
          <a
            href={SOCIAL_LINKS.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(196,154,60,0.1)',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.border = '1px solid rgba(196,154,60,0.35)';
              el.style.background = 'rgba(196,154,60,0.07)';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.border = '1px solid rgba(196,154,60,0.1)';
              el.style.background = 'rgba(255,255,255,0.03)';
            }}
            aria-label="YouTube"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(196,154,60,0.6)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22.54 6.42A2.78 2.78 0 0 0 20.6 4.47C18.88 4 12 4 12 4s-6.88 0-8.6.47A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.53C5.12 20 12 20 12 20s6.88 0 8.6-.47a2.78 2.78 0 0 0 1.94-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
              <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="rgba(196,154,60,0.6)" stroke="none"/>
            </svg>
          </a>
        </div>

        {/* Footer */}
        <p className="font-mono text-[9px] uppercase tracking-[0.3em]"
          style={{ color: 'rgba(196,154,60,0.2)' }}>
          compario.tech · © 2026
        </p>
      </div>
    </main>
  );
}
