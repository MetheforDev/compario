import { ImageResponse } from 'next/og'
import { getNewsArticleBySlug } from '@compario/database'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const CATEGORY_LABELS: Record<string, string> = {
  'yeni-model': 'Yeni Model',
  test: 'Test & İnceleme',
  karsilastirma: 'Karşılaştırma',
  fiyat: 'Fiyat Güncelleme',
  teknoloji: 'Teknoloji',
  genel: 'Genel',
}

interface Props {
  params: { slug: string }
}

export default async function Image({ params }: Props) {
  const article = await getNewsArticleBySlug(params.slug).catch(() => null)

  const title    = article?.title ?? 'Compario — Her Şeyi Karşılaştır'
  const cover    = article?.cover_image ?? null
  const cat      = article?.category ?? null
  const catLabel = cat ? (CATEGORY_LABELS[cat] ?? cat.toUpperCase()) : null

  const fontSize =
    title.length > 80 ? 34
    : title.length > 60 ? 42
    : title.length > 40 ? 50
    : 58

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#08090E',
          fontFamily: '"Arial Black", "Arial", sans-serif',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* ── Top: image area (420px) ─────────────────── */}
        <div
          style={{
            flex: '0 0 420px',
            display: 'flex',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt=""
              style={{ width: '1200px', height: '420px', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: '1200px',
                height: '420px',
                background: 'linear-gradient(135deg, #0C1018 0%, #131B28 60%, #0C1018 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{
                width: '100px',
                height: '100px',
                border: '1px solid rgba(196,154,60,0.4)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  border: '1px solid rgba(196,154,60,0.6)',
                  borderRadius: '50%',
                }} />
              </div>
            </div>
          )}

          {/* Gradient fade to dark */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: '140px',
            background: 'linear-gradient(to top, #08090E, transparent)',
          }} />

          {/* COMPARIO badge */}
          <div style={{
            position: 'absolute', top: '24px', left: '28px',
            display: 'flex', alignItems: 'center',
          }}>
            <div style={{
              width: '3px', height: '26px', background: '#C49A3C',
              borderRadius: '2px', marginRight: '10px',
            }} />
            <div style={{
              background: 'rgba(8,9,14,0.9)',
              borderRadius: '6px',
              padding: '8px 16px',
              border: '1px solid rgba(196,154,60,0.35)',
              display: 'flex', alignItems: 'center',
            }}>
              <span style={{
                fontWeight: 900, fontSize: '18px',
                color: '#C49A3C', letterSpacing: '0.12em',
              }}>
                COMPARIO
              </span>
            </div>
          </div>

          {/* Category badge */}
          {catLabel && (
            <div style={{
              position: 'absolute', top: '24px', right: '28px',
              background: 'rgba(196,154,60,0.12)',
              borderRadius: '4px',
              padding: '7px 14px',
              border: '1px solid rgba(196,154,60,0.4)',
              display: 'flex',
            }}>
              <span style={{
                color: '#C49A3C', fontSize: '13px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>
                {catLabel}
              </span>
            </div>
          )}
        </div>

        {/* ── Bottom: title area (210px) ──────────────── */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 40px',
            position: 'relative',
            backgroundColor: '#08090E',
          }}
        >
          {/* Gold accent line */}
          <div style={{
            position: 'absolute', top: 0, left: '40px', right: '40px',
            height: '1px',
            background: 'linear-gradient(to right, #C49A3C, rgba(196,154,60,0))',
          }} />

          <span style={{
            color: '#EDE8DF',
            fontSize: `${fontSize}px`,
            fontWeight: 900,
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
          }}>
            {title}
          </span>

          {/* Domain watermark */}
          <div style={{
            position: 'absolute', bottom: '18px', right: '40px',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <div style={{
              width: '4px', height: '4px',
              background: '#C49A3C', borderRadius: '50%',
            }} />
            <span style={{
              color: 'rgba(196,154,60,0.45)', fontSize: '12px',
              fontWeight: 700, letterSpacing: '0.12em',
            }}>
              compario.tech
            </span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
