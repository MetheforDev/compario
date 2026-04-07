import { getNewsArticles } from '@compario/database';
import { NextResponse } from 'next/server';

const BASE = 'https://compario.tech';
const SITE_TITLE = 'Compario — Karşılaştırma Platformu';
const SITE_DESC = "Türkiye'nin en kapsamlı ürün karşılaştırma platformu. Araçlar, telefonlar, laptoplar ve daha fazlası.";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  let articles: import('@compario/database').NewsArticle[] = [];
  try {
    const result = await getNewsArticles({ limit: 50 });
    articles = result.data;
  } catch {
    articles = [];
  }

  const items = articles.map((article) => {
    const url = `${BASE}/news/${article.slug}`;
    const pubDate = article.published_at
      ? new Date(article.published_at).toUTCString()
      : new Date(article.created_at).toUTCString();
    const description = article.excerpt ?? article.title;
    const category = article.categories?.[0] ?? article.category ?? 'genel';

    return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(category)}</category>${article.cover_image ? `\n      <enclosure url="${escapeXml(article.cover_image)}" type="image/jpeg" length="0" />` : ''}${article.author ? `\n      <author>${escapeXml(article.author)}</author>` : ''}
    </item>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${BASE}</link>
    <description>${escapeXml(SITE_DESC)}</description>
    <language>tr</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${BASE}/icons/icon-512x512.png</url>
      <title>${escapeXml(SITE_TITLE)}</title>
      <link>${BASE}</link>
    </image>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
