import { ImageResponse } from 'next/og';
import { getProductsByIds } from '@compario/database';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawIds = (searchParams.get('ids') ?? '').split(',').filter(Boolean).slice(0, 4);

  const products = rawIds.length >= 2
    ? await getProductsByIds(rawIds).catch(() => [])
    : [];

  const names = products.length >= 2
    ? products.map((p) => p.brand ? `${p.brand} ${p.name}` : p.name)
    : ['Ürün A', 'Ürün B'];

  const images = products.map((p) => p.image_url ?? null);
  const count = Math.max(products.length, 2);

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#08090E',
          fontFamily: '"Arial Black", Arial, sans-serif',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Background grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(196,154,60,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(196,154,60,0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        {/* Top bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 48px',
          flexShrink: 0,
          position: 'relative',
          zIndex: 1,
        }}>
          {/* COMPARIO wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px',
              border: '1.5px solid #C49A3C',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#C49A3C', fontSize: '16px', fontWeight: 900 }}>C</span>
            </div>
            <span style={{
              color: '#C49A3C', fontSize: '20px', fontWeight: 900,
              letterSpacing: '0.18em',
            }}>COMPARIO</span>
          </div>

          {/* Badge */}
          <div style={{
            padding: '6px 16px',
            border: '1px solid rgba(196,154,60,0.3)',
            borderRadius: '4px',
            display: 'flex',
          }}>
            <span style={{
              color: 'rgba(196,154,60,0.7)', fontSize: '11px',
              fontWeight: 700, letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}>
              {count} ÜRÜN KARŞILAŞTIRMASI
            </span>
          </div>
        </div>

        {/* Divider line */}
        <div style={{
          height: '1px', marginLeft: '48px', marginRight: '48px',
          background: 'linear-gradient(to right, #C49A3C, rgba(196,154,60,0))',
          flexShrink: 0,
        }} />

        {/* Product cards row */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          padding: '0 48px',
          gap: '0',
          position: 'relative',
          zIndex: 1,
        }}>
          {names.map((name, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              {/* Product card */}
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                padding: '20px',
              }}>
                {/* Image or placeholder */}
                <div style={{
                  width: count === 2 ? '200px' : '140px',
                  height: count === 2 ? '130px' : '90px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '1px solid rgba(196,154,60,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(196,154,60,0.04)',
                  flexShrink: 0,
                }}>
                  {images[i] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={images[i]!}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{
                      color: 'rgba(196,154,60,0.2)',
                      fontSize: count === 2 ? '36px' : '24px',
                    }}>◈</span>
                  )}
                </div>

                {/* Name */}
                <span style={{
                  color: '#EDE8DF',
                  fontSize: count === 2 ? '22px' : '16px',
                  fontWeight: 900,
                  textAlign: 'center',
                  lineHeight: 1.2,
                  maxWidth: count === 2 ? '280px' : '180px',
                }}>
                  {name.length > 40 ? name.slice(0, 38) + '…' : name}
                </span>

                {/* Price */}
                {products[i]?.price_min && (
                  <span style={{
                    color: '#C49A3C',
                    fontSize: count === 2 ? '18px' : '13px',
                    fontWeight: 900,
                    letterSpacing: '0.02em',
                  }}>
                    ₺{products[i]!.price_min!.toLocaleString('tr-TR')}
                  </span>
                )}
              </div>

              {/* VS separator — between each product */}
              {i < names.length - 1 && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  flexShrink: 0,
                  padding: '0 4px',
                }}>
                  <div style={{ width: '1px', height: '40px', background: 'rgba(196,154,60,0.2)' }} />
                  <span style={{
                    color: '#C49A3C',
                    fontSize: count === 2 ? '18px' : '13px',
                    fontWeight: 900,
                    letterSpacing: '0.1em',
                  }}>VS</span>
                  <div style={{ width: '1px', height: '40px', background: 'rgba(196,154,60,0.2)' }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom: compario.tech watermark */}
        <div style={{
          padding: '12px 48px',
          display: 'flex',
          justifyContent: 'flex-end',
          flexShrink: 0,
          position: 'relative',
          zIndex: 1,
        }}>
          <span style={{
            color: 'rgba(196,154,60,0.3)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.15em',
          }}>compario.tech</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
