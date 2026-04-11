import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { subscribeNewsletter, getFeaturedNews } from '@compario/database';
import { welcomeEmailHtml, welcomeEmailText } from '@/lib/email-templates';
import type { NewsArticlePreview } from '@/lib/email-templates';

export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Geçerli bir e-posta adresi girin.' }, { status: 400 });
    }
    if (email.length > 254) {
      return NextResponse.json({ error: 'E-posta adresi çok uzun.' }, { status: 400 });
    }

    // Save subscriber
    await subscribeNewsletter(email);

    // Fetch last 3 news for welcome email
    let articles: NewsArticlePreview[] = [];
    try {
      const news = await getFeaturedNews(3);
      articles = news.map((a) => ({
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt ?? null,
        cover_image: a.cover_image ?? null,
        published_at: a.published_at ?? null,
      }));
    } catch { /* non-critical */ }

    // Send welcome email
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const from = process.env.RESEND_FROM_EMAIL ?? 'Compario <noreply@compario.tech>';
      await resend.emails.send({
        from,
        to: email,
        subject: "Compario'ya Hoş Geldin! 🎉",
        html: welcomeEmailHtml(articles),
        text: welcomeEmailText(articles),
      });
    }

    return NextResponse.json({ success: true, message: 'Aboneliğiniz başarıyla oluşturuldu.' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
    if (msg === 'Bu e-posta zaten abone.') {
      return NextResponse.json({ error: msg }, { status: 409 });
    }
    console.error('[Newsletter Subscribe]', err);
    return NextResponse.json({ error: 'Abonelik oluşturulamadı.' }, { status: 500 });
  }
}
