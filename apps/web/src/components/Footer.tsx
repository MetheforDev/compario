import Link from 'next/link';
import Image from 'next/image';
import { NewsletterForm } from './NewsletterForm';

const NAV_LINKS = [
  { href: '/categories', label: 'Kategoriler' },
  { href: '/products', label: 'Ürünler' },
  { href: '/news', label: 'Haberler' },
  { href: '/search', label: 'Arama' },
];

const SOCIAL_LINKS = [
  {
    href: 'https://twitter.com/compariotech',
    label: 'Twitter / X',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.265 5.638 5.9-5.638zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    href: 'https://instagram.com/compariotech',
    label: 'Instagram',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    href: 'https://youtube.com/@compariotech',
    label: 'YouTube',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="relative mt-0"
      style={{
        background: '#060710',
        borderTop: '1px solid rgba(196,154,60,0.08)',
      }}
    >
      {/* Gold accent line */}
      <div
        className="h-px w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(196,154,60,0.15) 20%, rgba(196,154,60,0.5) 50%, rgba(196,154,60,0.15) 80%, transparent 100%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">

          {/* Brand */}
          <div className="sm:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 mb-4">
              <div className="relative flex-shrink-0" style={{ width: 44, height: 44 }}>
                <Image
                  src="/images/logo/logo-white.png"
                  alt="Compario"
                  fill
                  className="object-contain"
                  sizes="44px"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span
                  className="font-orbitron font-black tracking-widest leading-none"
                  style={{ fontSize: '18px', color: '#00fff7' }}
                >
                  COMPARIO
                </span>
                <span
                  className="font-mono uppercase tracking-[0.35em]"
                  style={{ fontSize: '7px', color: 'rgba(196,154,60,0.35)' }}
                >
                  Karşılaştırma Platformu
                </span>
              </div>
            </Link>
            <p className="font-mono text-xs text-gray-600 leading-relaxed max-w-[240px]">
              Araçlar, telefonlar, laptoplar ve daha fazlasını karşılaştır. Veriye dayalı kararlar al.
            </p>

            {/* Social icon buttons */}
            <div className="flex items-center gap-3 mt-6">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="footer-social-btn flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] mb-4" style={{ color: 'rgba(196,154,60,0.5)' }}>
              Keşfet
            </p>
            <ul className="space-y-3">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="font-mono text-xs text-gray-600 hover:text-gray-300 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] mb-4" style={{ color: 'rgba(196,154,60,0.5)' }}>
              Bülten
            </p>
            <p className="font-mono text-xs text-gray-600 leading-relaxed mb-5">
              Güncel karşılaştırmalar ve yeni model haberleri doğrudan e-postana gelsin.
            </p>
            <NewsletterForm />

            <div className="flex items-center gap-3 mt-6 pt-5" style={{ borderTop: '1px solid rgba(196,154,60,0.06)' }}>
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="footer-social-btn flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(196,154,60,0.06)' }}
        >
          <p className="font-mono text-[10px] text-gray-700">
            © {currentYear} Compario. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[9px] uppercase tracking-[0.3em]" style={{ color: 'rgba(196,154,60,0.2)' }}>
              compario.tech
            </span>
            <span style={{ color: 'rgba(196,154,60,0.15)', fontSize: '8px' }}>◆</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
