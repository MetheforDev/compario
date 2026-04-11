import { NextResponse } from 'next/server';
import { publishScheduledArticles } from '@compario/database';

// Vercel Cron: her dakika veya her 5 dakikada bir çalıştırılabilir
// vercel.json'a ekle:
// { "crons": [{ "path": "/api/cron/publish-scheduled", "schedule": "* * * * *" }] }

export async function GET(request: Request) {
  // Vercel cron secret ile koru (opsiyonel ama önerilen)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  try {
    const published = await publishScheduledArticles();
    return NextResponse.json({
      ok: true,
      published,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Hata' },
      { status: 500 },
    );
  }
}
