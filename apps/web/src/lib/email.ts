import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM ?? 'Compario <noreply@compario.tech>';
const ADMIN = process.env.ADMIN_EMAIL ?? 'methefor@gmail.com';

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}) {
  const { error } = await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });
  if (error) throw new Error(error.message);
}

// Admin'e yeni yorum bildirimi
export async function notifyAdminComment(opts: {
  entityType: 'news' | 'product';
  entityTitle: string;
  entitySlug: string;
  authorName: string | null;
  content: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://compario.tech';
  const entityPath = opts.entityType === 'news' ? 'news' : 'products';
  const entityLabel = opts.entityType === 'news' ? 'Haber' : 'Ürün';
  const adminUrl = `${appUrl}/admin/comments`;

  const html = `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#08090e;font-family:monospace;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#08090e;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#0c0c18;border-radius:12px;border:1px solid rgba(0,255,247,0.1);overflow:hidden;">
        <tr><td style="height:3px;background:linear-gradient(90deg,transparent,#00fff7,transparent);"></td></tr>
        <tr><td style="padding:28px 32px 20px;">
          <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.35em;color:rgba(0,255,247,0.5);text-transform:uppercase;">⬡ Compario Admin</p>
          <h1 style="margin:0;font-size:18px;font-weight:900;color:#fff;">Yeni Yorum Bekleniyor</h1>
        </td></tr>
        <tr><td style="padding:0 32px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f1a;border-radius:8px;border:1px solid rgba(0,255,247,0.06);padding:16px 20px;">
            <tr><td>
              <p style="margin:0 0 6px;font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.2em;">${entityLabel}</p>
              <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#e5e7eb;">
                <a href="${appUrl}/${entityPath}/${opts.entitySlug}" style="color:#00fff7;text-decoration:none;">${opts.entityTitle}</a>
              </p>
              <p style="margin:0 0 6px;font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.2em;">Yazan</p>
              <p style="margin:0 0 12px;font-size:13px;color:#e5e7eb;">${opts.authorName ?? 'Anonim'}</p>
              <p style="margin:0 0 6px;font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.2em;">İçerik</p>
              <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;background:#13131f;border-left:2px solid rgba(0,255,247,0.2);padding:10px 14px;border-radius:4px;">${opts.content}</p>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 32px 28px;text-align:center;">
          <a href="${adminUrl}" style="display:inline-block;padding:10px 24px;background:rgba(0,255,247,0.08);border:1px solid rgba(0,255,247,0.25);border-radius:8px;color:#00fff7;font-size:12px;font-weight:700;text-decoration:none;letter-spacing:0.08em;text-transform:uppercase;">
            Admin Panelde İncele →
          </a>
        </td></tr>
        <tr><td style="height:3px;background:linear-gradient(90deg,transparent,rgba(196,154,60,0.3),transparent);"></td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  await sendEmail({
    to: ADMIN,
    subject: `[Compario] Yeni yorum: ${opts.entityTitle}`,
    html,
    text: `Yeni yorum bekleniyor.\n\n${entityLabel}: ${opts.entityTitle}\nYazan: ${opts.authorName ?? 'Anonim'}\n\nİçerik:\n${opts.content}\n\nİncelemek için: ${adminUrl}`,
  });
}

// Admin'e yeni inceleme bildirimi
export async function notifyAdminReview(opts: {
  productName: string;
  productSlug: string;
  reviewerName: string;
  rating: number;
  comment: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://compario.tech';
  const stars = '★'.repeat(opts.rating) + '☆'.repeat(5 - opts.rating);

  const html = `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#08090e;font-family:monospace;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#08090e;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#0c0c18;border-radius:12px;border:1px solid rgba(196,154,60,0.1);overflow:hidden;">
        <tr><td style="height:3px;background:linear-gradient(90deg,transparent,#C49A3C,transparent);"></td></tr>
        <tr><td style="padding:28px 32px 20px;">
          <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.35em;color:rgba(196,154,60,0.5);text-transform:uppercase;">⬡ Compario Admin</p>
          <h1 style="margin:0;font-size:18px;font-weight:900;color:#fff;">Yeni Ürün İncelemesi</h1>
        </td></tr>
        <tr><td style="padding:0 32px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f1a;border-radius:8px;border:1px solid rgba(196,154,60,0.08);padding:16px 20px;">
            <tr><td>
              <p style="margin:0 0 6px;font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.2em;">Ürün</p>
              <p style="margin:0 0 12px;font-size:13px;font-weight:700;">
                <a href="${appUrl}/products/${opts.productSlug}" style="color:#C49A3C;text-decoration:none;">${opts.productName}</a>
              </p>
              <p style="margin:0 0 6px;font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.2em;">Yazan</p>
              <p style="margin:0 0 12px;font-size:13px;color:#e5e7eb;">${opts.reviewerName}</p>
              <p style="margin:0 0 6px;font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.2em;">Puan</p>
              <p style="margin:0 0 12px;font-size:18px;color:#C49A3C;">${stars} (${opts.rating}/5)</p>
              <p style="margin:0 0 6px;font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.2em;">Yorum</p>
              <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;background:#13131f;border-left:2px solid rgba(196,154,60,0.2);padding:10px 14px;border-radius:4px;">${opts.comment}</p>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 32px 28px;text-align:center;">
          <a href="${appUrl}/admin/reviews" style="display:inline-block;padding:10px 24px;background:rgba(196,154,60,0.08);border:1px solid rgba(196,154,60,0.25);border-radius:8px;color:#C49A3C;font-size:12px;font-weight:700;text-decoration:none;letter-spacing:0.08em;text-transform:uppercase;">
            Admin Panelde İncele →
          </a>
        </td></tr>
        <tr><td style="height:3px;background:linear-gradient(90deg,transparent,rgba(196,154,60,0.3),transparent);"></td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  await sendEmail({
    to: ADMIN,
    subject: `[Compario] Yeni inceleme: ${opts.productName} — ${opts.rating}/5`,
    html,
    text: `Yeni ürün incelemesi.\n\nÜrün: ${opts.productName}\nYazan: ${opts.reviewerName}\nPuan: ${opts.rating}/5\n\nYorum:\n${opts.comment}\n\nİncelemek için: ${appUrl}/admin/reviews`,
  });
}
