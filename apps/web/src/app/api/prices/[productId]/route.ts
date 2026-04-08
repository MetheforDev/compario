import { NextResponse } from 'next/server';
import { getPriceHistory, recordPrice } from '@compario/database';

export async function GET(
  _request: Request,
  { params }: { params: { productId: string } },
) {
  try {
    const history = await getPriceHistory(params.productId, 30);
    return NextResponse.json(history);
  } catch (err) {
    return NextResponse.json({ error: 'Fiyat geçmişi alınamadı' }, { status: 500 });
  }
}

// Manually record a price (admin use)
export async function POST(
  request: Request,
  { params }: { params: { productId: string } },
) {
  try {
    const { price, currency } = await request.json();
    if (!price || typeof price !== 'number') {
      return NextResponse.json({ error: 'Geçersiz fiyat' }, { status: 400 });
    }
    const point = await recordPrice(params.productId, price, currency ?? 'TRY');
    return NextResponse.json(point, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Fiyat kaydedilemedi' }, { status: 500 });
  }
}
