import { ImageResponse } from 'next/og'
import { getNewsArticleBySlug } from '@compario/database'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Props {
  params: { slug: string }
}

export default async function Image({ params }: Props) {
  const article = await getNewsArticleBySlug(params.slug).catch(() => null)

  const title = article?.title ?? 'Compario — Oto Karşılaştırma'
  const coverImage = article?.cover_image ?? null
  const category = article?.category ?? null

  const fontSize =
    title.length > 80 ? 36
    : title.length > 60 ? 44
    : title.length > 40 ? 52
    : 60

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          fontFamily: '"Arial Black", "Arial", sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* Top section — car image */}
        <div
          style={{
            flex: '0 0 378px',
            display: 'flex',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#f0f0f0',
          }}
        >
          {coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImage}
              alt=""
              style={{ width: '100%', height: '378px', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '378px',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: '#a78bfa', fontSize: '80px', fontWeight: 900 }}>🚗</span>
            </div>
          )}

          {/* Logo badge */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '24px',
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '10px',
              padding: '8px 18px',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            }}
          >
            <span style={{ fontWeight: 900, fontSize: '20px', color: '#7C3AED', letterSpacing: '-0.5px' }}>
              COMPARIO
            </span>
          </div>

          {/* Category badge */}
          {category && (
            <div
              style={{
                position: 'absolute',
                top: '20px',
                right: '24px',
                background: 'rgba(124,58,237,0.9)',
                borderRadius: '6px',
                padding: '6px 14px',
                display: 'flex',
              }}
            >
              <span style={{ color: 'white', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                {category}
              </span>
            </div>
          )}
        </div>

        {/* Bottom section — purple gradient with title */}
        <div
          style={{
            flex: 1,
            background: 'linear-gradient(120deg, #6D28D9 0%, #4F46E5 60%, #7C3AED 100%)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 56px',
          }}
        >
          <span
            style={{
              color: '#ffffff',
              fontSize: `${fontSize}px`,
              fontWeight: 900,
              textTransform: 'uppercase',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
