import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);

export async function POST(req: NextRequest) {
  try {
    const { product_id, email, target_price, last_price } = await req.json();

    if (!product_id || !email) {
      return NextResponse.json({ error: 'product_id ve email zorunlu' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Geçersiz e-posta adresi' }, { status: 400 });
    }

    const { error } = await supabase.from('price_alerts').upsert(
      {
        product_id,
        email: email.toLowerCase().trim(),
        target_price: target_price ?? null,
        last_price: last_price ?? null,
        is_active: true,
      },
      { onConflict: 'product_id,email' },
    );

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Hata oluştu';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { product_id, email } = await req.json();
    if (!product_id || !email) {
      return NextResponse.json({ error: 'product_id ve email zorunlu' }, { status: 400 });
    }

    const { error } = await supabase.from('price_alerts')
      .update({ is_active: false })
      .eq('product_id', product_id)
      .eq('email', email.toLowerCase().trim());

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Hata oluştu';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
