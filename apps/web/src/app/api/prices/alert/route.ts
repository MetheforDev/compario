import { NextResponse } from 'next/server';
import { createPriceAlert } from '@compario/database';

export async function POST(request: Request) {
  try {
    const { productId, email, targetPrice } = await request.json();

    if (!productId || !email || !targetPrice) {
      return NextResponse.json({ error: 'Eksik alan' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Geçersiz e-posta' }, { status: 400 });
    }

    if (typeof targetPrice !== 'number' || targetPrice <= 0) {
      return NextResponse.json({ error: 'Geçersiz hedef fiyat' }, { status: 400 });
    }

    const alert = await createPriceAlert(productId, email, targetPrice);
    return NextResponse.json({ ok: true, alert }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Alarm oluşturulamadı' }, { status: 500 });
  }
}
