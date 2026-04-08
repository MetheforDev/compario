import { ImageResponse } from 'next/og';
import { getProductsByIds } from '@compario/database';

export const runtime = 'nodejs';

// Cache the font across requests (module-level)
let fontDataCache: ArrayBuffer | null = null;

async function getFont(): Promise<ArrayBuffer | null> {
  if (fontDataCache) return fontDataCache;
  try {
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawIds = (searchParams.get('ids') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  const products = rawIds.length >= 2
    ? await getProductsByIds(rawIds).catch(() => [])
    : [];

  const names = products.length >= 2
    ? products.map((p) => p.brand ? `${p.brand} ${p.name}` : p.name)
    : ['Ürün A', 'Ürün B'];

  const images = products.map((p) => p.image_url ?? null);
  const prices = products.map((p) =>
    p.price_min ? `₺${p.price_min.toLocaleString('tr-TR')}` : null,
  );
  const count = Math.max(products.length, 2);

  const fontData = await getFont();
  const fonts = fontData
    ? [{ name: 'Inter', data: fontData, weight: 700 as const, style: 'normal' as const }]
    : [];

  const headers = {
    'Content-Type':  'image/png',
    'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=3600',
  };

  // Card sizes based on product count
  const imgW  = count === 2 ? 180 : count === 3 ? 130 : 110;
  const imgH  = count === 2 ? 120 : count === 3 ?  86 :  72;
  const nameSize = count === 2 ? '20px' : count === 3 ? '15px' : '13px';
  const priceSize = count === 2 ? '16px' : '12px';
  const nameMaxW = count === 2 ? '240px' : count === 3 ? '170px' : '140px';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#08090E',
          fontFamily: 'Inter, Arial, sans-serif',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Top gold accent line */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #C49A3C 0%, rgba(0,255,247,0.6) 50%, rgba(196,154,60,0.3) 100%)',
        }} />

        {/* Top bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '28px 52px 0',
          flexShrink: 0,
          position: 'relative',
          zIndex: 1,
        }}>
          {/* COMPARIO wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              border: '2px solid #C49A3C',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{ color: '#C49A3C', fontSize: '17px', fontWeight: 700, lineHeight: 1 }}>C</span>
            </div>
            <span style={{
              color: '#C49A3C',
              fontSize: '21px',
              fontWeight: 700,
              letterSpacing: '0.18em',
            }}>
              COMPARIO
            </span>
          </div>

          {/* Badge */}
          <div style={{
            padding: '7px 18px',
            border: '1px solid rgba(196,154,60,0.35)',
            borderRadius: '5px',
            display: 'flex',
            background: 'rgba(196,154,60,0.08)',
          }}>
            <span style={{
              color: 'rgba(196,154,60,0.8)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.15em',
            }}>
              {count} ÜRÜN KARŞILAŞTIRMASI
            </span>
          </div>
        </div>

        {/* Gold separator line */}
        <div style={{
          height: '1px',
          margin: '18px 52px 0',
          background: 'linear-gradient(90deg, #C49A3C 0%, rgba(196,154,60,0) 100%)',
          flexShrink: 0,
        }} />

        {/* Product cards row */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 40px',
          position: 'relative',
          zIndex: 1,
        }}>
          {names.map((name, i) => (
            <div key={String(i)} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              {/* Product card */}
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px',
                padding: '16px',
              }}>
                {/* Image or placeholder */}
                <div style={{
                  width: String(imgW) + 'px',
                  height: String(imgH) + 'px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '1px solid rgba(196,154,60,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(196,154,60,0.05)',
                  flexShrink: 0,
                }}>
                  {images[i] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={images[i]!}
                      alt=""
                      width={imgW}
                      height={imgH}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <span style={{
                      color: 'rgba(196,154,60,0.25)',
                      fontSize: count === 2 ? '32px' : '22px',
                    }}>◈</span>
                  )}
                </div>

                {/* Name */}
                <span style={{
                  color: '#EDE8DF',
                  fontSize: nameSize,
                  fontWeight: 700,
                  textAlign: 'center',
                  lineHeight: 1.2,
                  maxWidth: nameMaxW,
                }}>
                  {name.length > 38 ? name.slice(0, 36) + '…' : name}
                </span>

                {/* Price */}
                {prices[i] && (
                  <span style={{
                    color: '#C49A3C',
                    fontSize: priceSize,
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                  }}>
                    {prices[i]}
                  </span>
                )}
              </div>

              {/* VS separator */}
              {i < names.length - 1 && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  flexShrink: 0,
                  padding: '0 2px',
                }}>
                  <div style={{
                    width: '1px',
                    height: '36px',
                    background: 'linear-gradient(to bottom, transparent, rgba(196,154,60,0.35))',
                  }} />
                  <span style={{
                    color: '#C49A3C',
                    fontSize: count === 2 ? '16px' : '12px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                  }}>VS</span>
                  <div style={{
                    width: '1px',
                    height: '36px',
                    background: 'linear-gradient(to top, transparent, rgba(196,154,60,0.35))',
                  }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          padding: '10px 52px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          position: 'relative',
          zIndex: 1,
        }}>
          <span style={{
            color: 'rgba(196,154,60,0.25)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.08em',
          }}>
            Veriye dayalı kararlar al
          </span>
          <span style={{
            color: 'rgba(196,154,60,0.35)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.15em',
          }}>
            compario.tech
          </span>
        </div>
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
