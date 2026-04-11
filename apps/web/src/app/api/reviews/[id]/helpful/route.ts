import { NextResponse } from 'next/server';
import { createAdminClient } from '@compario/database';

export const runtime = 'nodejs';

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    if (!id) return NextResponse.json({ error: 'ID gerekli' }, { status: 400 });

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('reviews')
      .select('helpful_count, status')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Yorum bulunamadı' }, { status: 404 });
    }
    if (data.status !== 'approved') {
      return NextResponse.json({ error: 'Yorum mevcut değil' }, { status: 404 });
    }

    const { error: updateError } = await admin
      .from('reviews')
      .update({ helpful_count: data.helpful_count + 1 })
      .eq('id', id);

    if (updateError) throw updateError;

    return NextResponse.json({ helpful_count: data.helpful_count + 1 });
  } catch (err) {
    console.error('[Reviews Helpful]', err);
    return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 });
  }
}
