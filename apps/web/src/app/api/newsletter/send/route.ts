import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Resend } from 'resend';
import { getNewsletterSubscribers } from '@compario/database';

export const runtime = 'nodejs';
export const maxDuration = 60;

function isAdminAuthed(): boolean {
  return cookies().get('admin_authed')?.value === 'true';
}

export async function POST(request: Request) {
  if (!isAdminAuthed()) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY ayarlanmamış.' }, { status: 503 });
  }

  try {
    const body = await request.json() as { subject?: string; html?: string; text?: string };
    const { subject, html, text } = body;

    if (!subject?.trim()) return NextResponse.json({ error: 'Konu zorunlu' }, { status: 400 });
    if (!html?.trim() && !text?.trim()) return NextResponse.json({ error: 'İçerik zorunlu' }, { status: 400 });

    const subscribers = await getNewsletterSubscribers('active');
    if (subscribers.length === 0) {
      return NextResponse.json({ error: 'Aktif abone yok.' }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.RESEND_FROM_EMAIL ?? 'Compario <noreply@compario.tech>';
    const emails = subscribers.map((s) => s.email);

    // Resend batch API — max 100 per call; chunk if needed
    const CHUNK = 50;
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < emails.length; i += CHUNK) {
      const chunk = emails.slice(i, i + CHUNK);
      const batch = chunk.map((to) => ({
        from,
        to,
        subject: subject.trim(),
        html: html ?? undefined,
        text: text ?? undefined,
      }));

      try {
        await resend.batch.send(batch);
        sent += chunk.length;
      } catch {
        failed += chunk.length;
      }
    }

    return NextResponse.json({ success: true, sent, failed, total: emails.length });
  } catch (err) {
    console.error('[Newsletter Send]', err);
    return NextResponse.json({ error: 'E-posta gönderilemedi.' }, { status: 500 });
  }
}
