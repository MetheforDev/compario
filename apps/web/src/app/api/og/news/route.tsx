import { ImageResponse } from 'next/og';
import { getNewsArticleBySlug } from '@compario/database';

export const runtime = 'nodejs';

// Cache the font across requests (module-level)
let fontDataCache: ArrayBuffer | null = null;

async function getFont(): Promise<ArrayBuffer | null> {
  if (fontDataCache) return fontDataCache;
  try {
    // Inter 700 — good weight for OG images, reliable from Google CDN
    const res = await fetch(
      'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff',
      { next: { revalidate: 86400 } },
    );
    fontDataCache = await res.arrayBuffer();
    return fontDataCache;
  } catch {
    return null;
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  'yeni-model':    'Yeni Model',
  test:            'Test & İnceleme',
  karsilastirma:   'Karşılaştırma',
  fiyat:           'Fiyat Güncelleme',
  teknoloji:       'Teknoloji',
  genel:           'Genel',
};

const CATEGORY_COLORS: Record<string, string> = {
  'yeni-model':  '#00fff7',
  test:          '#22c55e',
  karsilastirma: '#b724ff',
  fiyat:         '#fbbf24',
  teknoloji:     '#60a5fa',
  genel:         '#9ca3af',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') ?? '';

  let title    = 'Compario Haberleri';
  let excerpt  = 'Güncel karşılaştırmalar ve teknoloji haberleri';
  let coverImage: string | null = null;
  let category = 'genel';
  let author: string | null = null;

  if (slug) {
    const article = await getNewsArticleBySlug(slug).catch(() => null);
    if (article) {
      title      = article.title;
      excerpt    = article.excerpt ?? excerpt;
      coverImage = article.cover_image ?? null;
      category   =
        (article as typeof article & { categories?: string[] | null }).categories?.[0]
        ?? article.category
        ?? 'genel';
      author = article.author ?? null;
    }
  }

  const catLabel = CATEGORY_LABELS[category] ?? category;
  const catColor = CATEGORY_COLORS[category] ?? '#9ca3af';

  const truncatedTitle   = title.length   > 72  ? title.slice(0, 70)   + '…' : title;
  const truncatedExcerpt = excerpt.length > 110 ? excerpt.slice(0, 108) + '…' : excerpt;
  const titleFontSize    = truncatedTitle.length > 50 ? '36px' : '44px';

  const fontData = await getFont();
  const fonts = fontData
    ? [{ name: 'Inter', data: fontData, weight: 700 as const, style: 'normal' as const }]
    : [];

  const headers = {
    'Content-Type':  'image/png',
    'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=3600',
  };

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          backgroundColor: '#08090E',
          fontFamily: 'Inter, Arial, sans-serif',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Cover image — full bleed, low opacity */}
        {coverImage && (
          <div style={{
            position: 'absolute',
            top: 0, right: 0, bottom: 0, left: 0,
            display: 'flex',
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImage}
              alt=""
              width={1200}
              height={630}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.2,
              }}
            />
          </div>
        )}

        {/* Dark gradient overlay */}
        <div style={{
          position: 'absolute',
          top: 0, right: 0, bottom: 0, left: 0,
          background: coverImage
            ? 'linear-gradient(105deg, rgba(8,9,14,0.97) 0%, rgba(8,9,14,0.92) 52%, rgba(8,9,14,0.55) 100%)'
            : 'rgba(8,9,14,0.05)',
        }} />

        {/* Top gold accent line */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '3px',
          background: `linear-gradient(90deg, transparent 0%, ${catColor} 40%, rgba(196,154,60,0.4) 100%)`,
        }} />

        {/* Content */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '52px 60px',
          width: '100%',
        }}>
          {/* Top: COMPARIO logo + category badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                border: '2px solid #C49A3C',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ color: '#C49A3C', fontSize: '18px', fontWeight: 700, lineHeight: 1 }}>C</span>
              </div>
              <span style={{
                color: '#C49A3C',
                fontSize: '22px',
                fontWeight: 700,
                letterSpacing: '0.2em',
              }}>
                COMPARIO
              </span>
            </div>

            {/* Category badge */}
            <div style={{
              padding: '8px 20px',
              border: `1px solid ${catColor}55`,
              borderRadius: '6px',
              display: 'flex',
              background: `${catColor}18`,
            }}>
              <span style={{
                color: catColor,
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.15em',
              }}>
                {catLabel.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Middle: accent + title + excerpt */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '820px' }}>
            <div style={{
              width: '56px',
              height: '3px',
              background: `linear-gradient(90deg, ${catColor}, transparent)`,
              borderRadius: '2px',
            }} />

            <span style={{
              color: '#EDE8DF',
              fontSize: titleFontSize,
              fontWeight: 700,
              lineHeight: 1.18,
              letterSpacing: '-0.01em',
            }}>
              {truncatedTitle}
            </span>

            {truncatedExcerpt && (
              <span style={{
                color: 'rgba(237,232,223,0.5)',
                fontSize: '18px',
                fontWeight: 400,
                lineHeight: 1.5,
              }}>
                {truncatedExcerpt}
              </span>
            )}
          </div>

          {/* Bottom: author + domain */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {author && (
                <>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: catColor,
                  }} />
                  <span style={{
                    color: 'rgba(196,154,60,0.7)',
                    fontSize: '14px',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                  }}>
                    {author}
                  </span>
                </>
              )}
            </div>
            <span style={{
              color: 'rgba(196,154,60,0.4)',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.14em',
            }}>
              compario.tech
            </span>
          </div>
        </div>

        {/* Right image panel */}
        {coverImage && (
          <div style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '380px',
            display: 'flex',
            overflow: 'hidden',
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImage}
              alt=""
              width={380}
              height={630}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'linear-gradient(90deg, #08090E 0%, transparent 45%)',
            }} />
          </div>
        )}
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts,
      headers,
    },
  );
}
