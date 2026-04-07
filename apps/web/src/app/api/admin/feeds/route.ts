import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { FEED_SOURCES } from '@/lib/feed-sources';

export const dynamic = 'force-dynamic';

async function checkAuth(): Promise<boolean> {
  const cookieStore = cookies();
  const c = cookieStore.get('compario-admin');
  if (c?.value && process.env.ADMIN_SECRET && c.value === process.env.ADMIN_SECRET) return true;
  try {
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch { return false; }
}

export interface FeedItem {
  id: string;
  sourceId: string;
  sourceName: string;
  sourceCategory: string;
  title: string;
  url: string;
  description: string;
  image: string | null;
  publishedAt: string;
  publishedMs: number;
}

function extractBetween(xml: string, open: string, close: string): string {
  const idx = xml.indexOf(open);
  if (idx === -1) return '';
  const start = idx + open.length;
  const end = xml.indexOf(close, start);
  if (end === -1) return '';
  return xml.slice(start, end).trim();
}

function extractTag(xml: string, tag: string): string {
  // Try CDATA first
  const cdataRe = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i');
  const cdataMatch = xml.match(cdataRe);
  if (cdataMatch) return cdataMatch[1].trim();
  // Plain tag
  const plainRe = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const plainMatch = xml.match(plainRe);
  return plainMatch ? plainMatch[1].trim() : '';
}

function extractLink(xml: string): string {
  // <link>url</link> or <link href="url"/> or <link rel="alternate" href="url"/>
  const hrefMatch = xml.match(/<link[^>]+href=["']([^"']+)["'][^>]*\/?>/i);
  if (hrefMatch) return hrefMatch[1];
  const plainMatch = xml.match(/<link>([^<]+)<\/link>/i);
  if (plainMatch) return plainMatch[1].trim();
  return '';
}

function extractImage(xml: string): string | null {
  // media:content, enclosure, og:image, or img in description
  const mediaMatch = xml.match(/<media:content[^>]+url=["']([^"']+)["']/i);
  if (mediaMatch) return mediaMatch[1];
  const enclosureMatch = xml.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
  if (enclosureMatch) return enclosureMatch[1];
  const imgMatch = xml.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch) return imgMatch[1];
  return null;
}

function stripHTML(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 280);
}

function parseDate(str: string): number {
  if (!str) return 0;
  try {
    const d = new Date(str);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  } catch { return 0; }
}

function parseRSS(xml: string, sourceId: string, sourceName: string, sourceCategory: string): FeedItem[] {
  // Split into items (RSS 2.0) or entries (Atom)
  const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi),
                       ...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/gi)];

  return itemMatches.map((m, idx) => {
    const item = m[1];
    const title = stripHTML(extractTag(item, 'title'));
    const url = extractLink(item) || extractTag(item, 'id');
    const description = stripHTML(
      extractTag(item, 'description') ||
      extractTag(item, 'summary') ||
      extractTag(item, 'content')
    );
    const pubStr = extractTag(item, 'pubDate') ||
                   extractTag(item, 'published') ||
                   extractTag(item, 'updated') ||
                   extractTag(item, 'dc:date');
    const image = extractImage(item);
    const ms = parseDate(pubStr);

    if (!title || !url) return null;

    return {
      id: `${sourceId}-${idx}-${ms}`,
      sourceId,
      sourceName,
      sourceCategory,
      title,
      url,
      description,
      image,
      publishedAt: pubStr || new Date(ms || Date.now()).toISOString(),
      publishedMs: ms || (Date.now() - idx * 60000),
    } satisfies FeedItem;
  }).filter((i): i is FeedItem => i !== null);
}

async function fetchFeed(source: typeof FEED_SOURCES[0]): Promise<FeedItem[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(source.url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Compario/1.0 RSS Reader' },
      next: { revalidate: 600 }, // 10 min cache
    });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const xml = await res.text();
    return parseRSS(xml, source.id, source.name, source.category);
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sourceIds = searchParams.get('sources')?.split(',').filter(Boolean);
  const category = searchParams.get('category');

  // Filter sources
  let sources = FEED_SOURCES;
  if (sourceIds?.length) sources = sources.filter((s) => sourceIds.includes(s.id));
  if (category && category !== 'all') sources = sources.filter((s) => s.category === category);

  // Fetch all in parallel
  const results = await Promise.all(sources.map(fetchFeed));
  const items = results.flat();

  // Sort by date desc
  items.sort((a, b) => b.publishedMs - a.publishedMs);

  return NextResponse.json({ items, total: items.length }, {
    headers: { 'Cache-Control': 'private, max-age=300' }, // 5 min browser cache
  });
}
