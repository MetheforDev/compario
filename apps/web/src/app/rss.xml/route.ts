import { getNewsArticles } from '@compario/database';
import { NextResponse } from 'next/server';

export const revalidate = 3600; // ISR — rebuild every hour

const BASE       = 'https://compario.tech';
const SITE_TITLE = 'Compario — Karşılaştırma Platformu';
const SITE_DESC  = "Türkiye'nin en kapsamlı ürün karşılaştırma platformu. Araçlar, telefonlar, laptoplar ve daha fazlası.";

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function cdataWrap(html: string): string {
  // CDATA is safe for full HTML content in RSS
  return `<![CDATA[${html}]]>`;
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
    const url     = `${BASE}/news/${article.slug}`;
    const pubDate = article.published_at
      ? new Date(article.published_at).toUTCString()
      : new Date(article.created_at).toUTCString();
    const excerpt  = article.excerpt ?? article.title;
    const fullContent = article.content
      ? article.content.replace(/\r\n/g, '\n')
      : excerpt;
    const categories = (article.categories ?? (article.category ? [article.category] : ['genel']))
      .map((c) => `      <category>${esc(c)}</category>`)
      .join('\n');

    return `    <item>
      <title>${esc(article.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${esc(excerpt)}</description>
      <content:encoded>${cdataWrap(fullContent)}</content:encoded>
      <pubDate>${pubDate}</pubDate>
${categories}${article.author ? `\n      <dc:creator>${esc(article.author)}</dc:creator>` : ''}${article.cover_image ? `\n      <enclosure url="${esc(article.cover_image)}" type="image/jpeg" length="0" />\n      <media:content url="${esc(article.cover_image)}" medium="image" />` : ''}
    </item>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${esc(SITE_TITLE)}</title>
    <link>${BASE}</link>
    <description>${esc(SITE_DESC)}</description>
    <language>tr</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <ttl>60</ttl>
    <atom:link href="${BASE}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${BASE}/images/logos/compario-logo-icon-only.png</url>
      <title>${esc(SITE_TITLE)}</title>
      <link>${BASE}</link>
      <width>144</width>
      <height>144</height>
    </image>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type':  'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
