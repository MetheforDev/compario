import { NextResponse } from 'next/server';
import { unsubscribeNewsletter } from '@compario/database';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: string };
    const email = body.email?.trim().toLowerCase();
    if (!email) return NextResponse.json({ error: 'E-posta gerekli' }, { status: 400 });

    await unsubscribeNewsletter(email);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Newsletter Unsubscribe]', err);
    return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 });
  }
}
