import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          backgroundColor: '#08090E',
          fontFamily: 'Arial, sans-serif',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Top accent line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #C49A3C 0%, rgba(0,255,247,0.6) 50%, rgba(196,154,60,0.3) 100%)',
        }} />

        {/* Left accent bar */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: '4px',
          background: 'linear-gradient(to bottom, transparent, #C49A3C 30%, #C49A3C 70%, transparent)',
        }} />

        {/* Left side — brand */}
        <div style={{
          flex: '0 0 580px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 60px',
          position: 'relative',
          zIndex: 1,
        }}>
          {/* COMPARIO wordmark */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '28px',
          }}>
            {/* C mark */}
            <div style={{
              width: '56px',
              height: '56px',
              border: '2px solid #C49A3C',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{
                color: '#C49A3C',
                fontSize: '28px',
                fontWeight: 900,
                lineHeight: 1,
              }}>C</span>
            </div>
            <span style={{
              color: '#C49A3C',
              fontSize: '36px',
              fontWeight: 900,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}>
              COMPARIO
            </span>
          </div>

          {/* Tagline */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginBottom: '36px',
          }}>
            <span style={{
              color: '#EDE8DF',
              fontSize: '42px',
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
            }}>
              Her Şeyi
            </span>
            <span style={{
              color: '#EDE8DF',
              fontSize: '42px',
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
            }}>
              Karşılaştır.
            </span>
            <span style={{
              color: 'rgba(196,154,60,0.9)',
              fontSize: '42px',
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
            }}>
              En İyisine Karar Ver.
            </span>
          </div>

          {/* Categories pills */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {['Araçlar', 'Telefonlar', 'Laptoplar', 'Teknoloji'].map((cat) => (
              <div key={cat} style={{
                padding: '6px 14px',
                border: '1px solid rgba(196,154,60,0.25)',
                borderRadius: '4px',
                display: 'flex',
              }}>
                <span style={{
                  color: 'rgba(196,154,60,0.6)',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                }}>
                  {cat}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{
          width: '1px',
          alignSelf: 'stretch',
          background: 'linear-gradient(to bottom, transparent, rgba(196,154,60,0.25) 30%, rgba(196,154,60,0.25) 70%, transparent)',
          flexShrink: 0,
          margin: '40px 0',
        }} />

        {/* Right side — comparison visual */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          padding: '0 50px',
          position: 'relative',
          zIndex: 1,
        }}>
          {/* VS element */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
          }}>
            {/* A box */}
            <div style={{
              width: '160px',
              height: '160px',
              border: '1px solid rgba(196,154,60,0.3)',
              borderRadius: '12px',
              background: 'rgba(196,154,60,0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{
                color: 'rgba(196,154,60,0.5)',
                fontSize: '48px',
                fontWeight: 900,
              }}>A</span>
            </div>

            {/* VS */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
            }}>
              <div style={{ width: '1px', height: '30px', background: 'rgba(196,154,60,0.3)' }} />
              <span style={{
                color: '#C49A3C',
                fontSize: '20px',
                fontWeight: 900,
                letterSpacing: '0.1em',
              }}>VS</span>
              <div style={{ width: '1px', height: '30px', background: 'rgba(196,154,60,0.3)' }} />
            </div>

            {/* B box */}
            <div style={{
              width: '160px',
              height: '160px',
              border: '1px solid rgba(196,154,60,0.3)',
              borderRadius: '12px',
              background: 'rgba(196,154,60,0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{
                color: 'rgba(196,154,60,0.5)',
                fontSize: '48px',
                fontWeight: 900,
              }}>B</span>
            </div>
          </div>

          {/* Score bar */}
          <div style={{
            width: '360px',
            height: '6px',
            borderRadius: '3px',
            background: 'rgba(196,154,60,0.1)',
            overflow: 'hidden',
            display: 'flex',
          }}>
            <div style={{
              width: '65%',
              height: '100%',
              background: 'linear-gradient(to right, #C49A3C, rgba(196,154,60,0.6))',
              borderRadius: '3px',
            }} />
          </div>

          <span style={{
            color: 'rgba(237,232,223,0.3)',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}>
            compario.tech
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
