import { ImageResponse } from 'next/og';
import { getNewsArticleBySlug } from '@compario/database';

export const runtime = 'nodejs';

const CATEGORY_LABELS: Record<string, string> = {
  'yeni-model': 'Yeni Model',
  test: 'Test & İnceleme',
  karsilastirma: 'Karşılaştırma',
  fiyat: 'Fiyat Güncelleme',
  teknoloji: 'Teknoloji',
  genel: 'Genel',
};

const CATEGORY_COLORS: Record<string, string> = {
  'yeni-model': '#00fff7',
  test: '#22c55e',
  karsilastirma: '#b724ff',
  fiyat: '#fbbf24',
  teknoloji: '#60a5fa',
  genel: '#9ca3af',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') ?? '';

  let title = 'Compario Haberleri';
  let excerpt = 'Güncel karşılaştırmalar ve teknoloji haberleri';
  let coverImage: string | null = null;
  let category = 'genel';
  let author: string | null = null;

  if (slug) {
    const article = await getNewsArticleBySlug(slug).catch(() => null);
    if (article) {
      title = article.title;
      excerpt = article.excerpt ?? excerpt;
      coverImage = article.cover_image ?? null;
      category = (article as typeof article & { categories?: string[] | null }).categories?.[0]
        ?? article.category
        ?? 'genel';
      author = article.author ?? null;
    }
  }

  const catLabel = CATEGORY_LABELS[category] ?? category;
  const catColor = CATEGORY_COLORS[category] ?? '#9ca3af';
  const truncatedTitle = title.length > 72 ? title.slice(0, 70) + '…' : title;
  const truncatedExcerpt = excerpt.length > 110 ? excerpt.slice(0, 108) + '…' : excerpt;

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          backgroundColor: '#08090E',
          fontFamily: '"Arial Black", Arial, sans-serif',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Cover image — left panel */}
        {coverImage && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImage}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.22,
              }}
            />
          </div>
        )}

        {/* Background grid overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(196,154,60,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(196,154,60,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        {/* Left gradient fade */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: coverImage
            ? 'linear-gradient(105deg, rgba(8,9,14,0.97) 0%, rgba(8,9,14,0.92) 55%, rgba(8,9,14,0.5) 100%)'
            : 'rgba(8,9,14,0.1)',
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
          {/* Top: COMPARIO logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '34px', height: '34px',
                border: '1.5px solid #C49A3C',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: '#C49A3C', fontSize: '17px', fontWeight: 900 }}>C</span>
              </div>
              <span style={{
                color: '#C49A3C',
                fontSize: '22px',
                fontWeight: 900,
                letterSpacing: '0.2em',
              }}>COMPARIO</span>
            </div>

            {/* Category badge */}
            <div style={{
              padding: '8px 20px',
              border: `1px solid ${catColor}40`,
              borderRadius: '6px',
              display: 'flex',
              background: `${catColor}12`,
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

          {/* Middle: Title */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '820px' }}>
            {/* Gold accent line */}
            <div style={{
              width: '60px', height: '3px',
              background: `linear-gradient(90deg, ${catColor}, transparent)`,
              borderRadius: '2px',
            }} />

            <span style={{
              color: '#EDE8DF',
              fontSize: truncatedTitle.length > 50 ? '36px' : '44px',
              fontWeight: 900,
              lineHeight: 1.18,
              letterSpacing: '-0.01em',
            }}>
              {truncatedTitle}
            </span>

            {excerpt && (
              <span style={{
                color: 'rgba(237,232,223,0.5)',
                fontSize: '18px',
                fontWeight: 400,
                lineHeight: 1.5,
                fontFamily: 'Arial, sans-serif',
              }}>
                {truncatedExcerpt}
              </span>
            )}
          </div>

          {/* Bottom: Author + URL */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {author && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '6px', height: '6px',
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
                </div>
              )}
            </div>
            <span style={{
              color: 'rgba(196,154,60,0.35)',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.12em',
            }}>compario.tech</span>
          </div>
        </div>

        {/* Right side image panel (if cover image exists) */}
        {coverImage && (
          <div style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '400px',
            display: 'flex',
            overflow: 'hidden',
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImage}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, #08090E 0%, transparent 40%)',
            }} />
          </div>
        )}
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
