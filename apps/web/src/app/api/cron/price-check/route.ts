import { NextResponse } from 'next/server';
import { recordDailyPrices, getActiveAlerts, deactivateAlert } from '@compario/database';
import { priceAlertEmailHtml, priceAlertEmailText } from '@/lib/email-templates';
import { Resend } from 'resend';

// Vercel Cron: günlük sabah 08:00 UTC
// vercel.json: { "path": "/api/cron/price-check", "schedule": "0 8 * * *" }

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const results = { recorded: 0, skipped: 0, alertsSent: 0, alertErrors: 0 };

  // 1. Record today's prices for all products
  try {
    const { recorded, skipped } = await recordDailyPrices();
    results.recorded = recorded;
    results.skipped = skipped;
  } catch (err) {
    console.error('[price-check] recordDailyPrices error:', err);
    return NextResponse.json({ ok: false, error: 'Fiyat kaydı başarısız', results }, { status: 500 });
  }

  // 2. Check active alerts — send email if current price <= target
  try {
    const alerts = await getActiveAlerts();

    for (const alert of alerts) {
      if (!alert.current_price || !alert.is_active) continue;
      if (alert.current_price > alert.target_price) continue;

      // Price has dropped to or below target — send email
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'Compario <bildirim@compario.tech>',
          to: alert.email,
          subject: `Fiyat düştü! ${alert.product_name} — ₺${alert.current_price.toLocaleString('tr-TR')}`,
          html: priceAlertEmailHtml({
            productName: alert.product_name,
            productSlug: alert.product_slug,
            targetPrice: alert.target_price,
            currentPrice: alert.current_price,
            currency: 'TRY',
          }),
          text: priceAlertEmailText({
            productName: alert.product_name,
            productSlug: alert.product_slug,
            targetPrice: alert.target_price,
            currentPrice: alert.current_price,
            currency: 'TRY',
          }),
        });

        // Deactivate after sending (one-shot alert)
        await deactivateAlert(alert.id);
        results.alertsSent++;
      } catch (emailErr) {
        console.error('[price-check] email error for alert', alert.id, emailErr);
        results.alertErrors++;
      }
    }
  } catch (err) {
    console.error('[price-check] alerts check error:', err);
  }

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    ...results,
  });
}
