export interface NewsArticlePreview {
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string | null;
}

export function welcomeEmailHtml(articles: NewsArticlePreview[]): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://compario.tech';

  const articleRows = articles
    .slice(0, 3)
    .map((a) => {
      const date = a.published_at
        ? new Date(a.published_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })
        : '';
      const img = a.cover_image
        ? `<img src="${a.cover_image}" alt="${escHtml(a.title)}" width="60" height="44"
               style="width:60px;height:44px;object-fit:cover;border-radius:6px;display:block;flex-shrink:0;" />`
        : `<div style="width:60px;height:44px;border-radius:6px;background:#1a1a2e;flex-shrink:0;"></div>`;

      return `
        <a href="${appUrl}/news/${a.slug}"
           style="display:flex;gap:14px;align-items:flex-start;padding:14px 0;border-bottom:1px solid #1e1e30;text-decoration:none;color:inherit;">
          ${img}
          <div style="flex:1;min-width:0;">
            <p style="margin:0 0 4px;font-family:monospace;font-size:13px;font-weight:600;color:#e5e7eb;line-height:1.35;">${escHtml(a.title)}</p>
            ${date ? `<p style="margin:0;font-family:monospace;font-size:11px;color:#4b5563;">${date}</p>` : ''}
          </div>
        </a>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Compario'ya Hoş Geldin!</title>
</head>
<body style="margin:0;padding:0;background:#08090e;font-family:monospace,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
         style="background:#08090e;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation"
               style="max-width:600px;width:100%;">

          <!-- Header gradient bar -->
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,transparent,#C49A3C,#00fff7,#C49A3C,transparent);border-radius:3px 3px 0 0;"></td>
          </tr>

          <!-- Logo + brand -->
          <tr>
            <td style="background:#0c0c18;padding:32px 36px 24px;border-left:1px solid #1a1a2a;border-right:1px solid #1a1a2a;">
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="padding-right:12px;">
                    <img src="${appUrl}/images/logos/compario-logo-icon-only.png" alt="Compario" width="36" height="36"
                         style="display:block;width:36px;height:36px;object-fit:contain;" />
                  </td>
                  <td>
                    <p style="margin:0;font-family:monospace;font-size:20px;font-weight:900;letter-spacing:0.15em;color:#00fff7;">COMPARIO</p>
                    <p style="margin:2px 0 0;font-family:monospace;font-size:8px;letter-spacing:0.35em;color:rgba(196,154,60,0.5);text-transform:uppercase;">Karşılaştırma Platformu</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="background:#0d0d1e;padding:36px 36px 28px;border-left:1px solid #1a1a2a;border-right:1px solid #1a1a2a;border-bottom:1px solid #1a1a2a;">
              <p style="margin:0 0 10px;font-family:monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.3em;color:rgba(196,154,60,0.6);">
                ⬡ Abonelik Onaylandı
              </p>
              <h1 style="margin:0 0 16px;font-family:monospace;font-size:24px;font-weight:900;color:#ffffff;line-height:1.25;">
                Compario'ya<br/>Hoş Geldin!
              </h1>
              <p style="margin:0;font-family:monospace;font-size:13px;color:#9ca3af;line-height:1.7;">
                Artık Türkiye'nin en kapsamlı ürün karşılaştırma platformunun bir parçasısın.
                Araçlar, telefonlar, laptoplar ve daha fazlasını karşılaştıran içerikler
                doğrudan e-postana gelecek.
              </p>
            </td>
          </tr>

          <!-- Latest news -->
          ${articleRows
            ? `<tr>
                <td style="background:#0a0a14;padding:28px 36px;border-left:1px solid #1a1a2a;border-right:1px solid #1a1a2a;">
                  <p style="margin:0 0 16px;font-family:monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.3em;color:rgba(0,255,247,0.5);">
                    Son Haberler
                  </p>
                  ${articleRows}
                </td>
              </tr>`
            : ''}

          <!-- CTA -->
          <tr>
            <td style="background:#0d0d1e;padding:28px 36px;text-align:center;border-left:1px solid #1a1a2a;border-right:1px solid #1a1a2a;">
              <a href="${appUrl}/compare"
                 style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,rgba(0,255,247,0.1),rgba(0,255,247,0.05));border:1px solid rgba(0,255,247,0.3);border-radius:10px;font-family:monospace;font-size:12px;font-weight:700;letter-spacing:0.1em;color:#00fff7;text-decoration:none;text-transform:uppercase;">
                Ürün Karşılaştır →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#08090e;padding:20px 36px;border:1px solid #1a1a2a;border-top:none;border-radius:0 0 12px 12px;">
              <p style="margin:0;font-family:monospace;font-size:10px;color:#374151;text-align:center;line-height:1.6;">
                Bu e-postayı artık almak istemiyorsan
                <a href="${appUrl}/newsletter/unsubscribe" style="color:#6b7280;text-decoration:underline;">buradan çıkabilirsin</a>.<br/>
                © ${new Date().getFullYear()} Compario · compario.tech
              </p>
            </td>
          </tr>

          <!-- Bottom bar -->
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,transparent,rgba(196,154,60,0.4),transparent);border-radius:0 0 3px 3px;"></td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function welcomeEmailText(articles: NewsArticlePreview[]): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://compario.tech';
  const lines = [
    'Compario\'ya Hoş Geldin!',
    '='.repeat(40),
    '',
    'Artık Compario\'nun bir parçasısın. Araçlar, telefonlar, laptoplar ve',
    'daha fazlasını karşılaştıran içerikler doğrudan e-postana gelecek.',
    '',
  ];

  if (articles.length > 0) {
    lines.push('Son Haberler:', '-'.repeat(20));
    for (const a of articles.slice(0, 3)) {
      lines.push(`• ${a.title}`);
      lines.push(`  ${appUrl}/news/${a.slug}`);
      lines.push('');
    }
  }

  lines.push(`Ürünleri karşılaştır: ${appUrl}/compare`);
  lines.push('');
  lines.push(`Abonelikten çıkmak için: ${appUrl}/newsletter/unsubscribe`);

  return lines.join('\n');
}

function escHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── Price Alert Email ────────────────────────────────────────────────────────

export function priceAlertEmailHtml(opts: {
  productName: string;
  productSlug: string;
  targetPrice: number;
  currentPrice: number;
  currency: string;
}): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://compario.tech';
  const productUrl = `${appUrl}/products/${opts.productSlug}`;
  const fmt = (n: number) => n.toLocaleString('tr-TR');
  const sym = opts.currency === 'TRY' ? '₺' : opts.currency;

  return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fiyat Düştü!</title></head>
<body style="margin:0;padding:0;background:#08090E;font-family:'Courier New',monospace;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#08090E;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#0c0c18;border-radius:16px;border:1px solid rgba(196,154,60,0.15);overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0f0f1a,#1a1a2e);padding:32px 40px;text-align:center;border-bottom:1px solid rgba(196,154,60,0.1);">
            <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.4em;color:rgba(196,154,60,0.6);text-transform:uppercase;">⬡ Compario</p>
            <h1 style="margin:0;font-size:28px;font-weight:900;color:#C49A3C;letter-spacing:0.05em;">FİYAT DÜŞTÜ!</h1>
            <p style="margin:8px 0 0;font-size:12px;color:#6b7280;">Takip ettiğiniz ürün hedef fiyatınıza ulaştı</p>
          </td>
        </tr>
        <!-- Product -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.3em;color:rgba(196,154,60,0.5);text-transform:uppercase;">Ürün</p>
            <h2 style="margin:0 0 24px;font-size:20px;font-weight:700;color:#e5e7eb;">${escHtml(opts.productName)}</h2>

            <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid rgba(196,154,60,0.1);">
              <tr>
                <td style="padding:20px 24px;background:#0f0f1a;border-right:1px solid rgba(196,154,60,0.08);text-align:center;">
                  <p style="margin:0 0 4px;font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.2em;">Hedef Fiyat</p>
                  <p style="margin:0;font-size:22px;font-weight:900;color:#22c55e;">${sym}${fmt(opts.targetPrice)}</p>
                </td>
                <td style="padding:20px 24px;background:#0f0f1a;text-align:center;">
                  <p style="margin:0 0 4px;font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.2em;">Şu Anki Fiyat</p>
                  <p style="margin:0;font-size:22px;font-weight:900;color:#C49A3C;">${sym}${fmt(opts.currentPrice)}</p>
                </td>
              </tr>
            </table>

            <div style="margin:32px 0;text-align:center;">
              <a href="${productUrl}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#C49A3C,#a07d28);color:#08090E;font-weight:900;font-size:13px;text-decoration:none;border-radius:8px;letter-spacing:0.1em;text-transform:uppercase;">
                Ürünü İncele →
              </a>
            </div>

            <p style="margin:0;font-size:11px;color:#4b5563;text-align:center;line-height:1.6;">
              Bu alarm tek kullanımlıktır ve artık devre dışı bırakıldı.<br>
              <a href="${appUrl}" style="color:rgba(196,154,60,0.5);text-decoration:none;">compario.tech</a>
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid rgba(196,154,60,0.06);text-align:center;">
            <p style="margin:0;font-size:10px;color:#374151;letter-spacing:0.2em;">© 2026 COMPARIO · TÜRKİYE'NİN KARŞILAŞTIRMA PLATFORMU</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function priceAlertEmailText(opts: {
  productName: string;
  productSlug: string;
  targetPrice: number;
  currentPrice: number;
  currency: string;
}): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://compario.tech';
  const sym = opts.currency === 'TRY' ? '₺' : opts.currency;
  const fmt = (n: number) => n.toLocaleString('tr-TR');
  return [
    'FİYAT DÜŞTÜ — Compario',
    '',
    `${opts.productName}`,
    `Hedef fiyat: ${sym}${fmt(opts.targetPrice)}`,
    `Şu anki fiyat: ${sym}${fmt(opts.currentPrice)}`,
    '',
    `Ürünü incele: ${appUrl}/products/${opts.productSlug}`,
    '',
    'Bu alarm tek kullanımlıktır ve artık devre dışı bırakıldı.',
  ].join('\n');
}
