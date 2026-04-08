import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getProductsByIds } from '@compario/database';
import type { Product, Json } from '@compario/database';

export const runtime = 'nodejs';
export const maxDuration = 30;

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// In-memory rate limiter: 5 requests/hour/IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { allowed: true };
}

function getSpecs(product: Product): Record<string, string> {
  if (!product.specs || typeof product.specs !== 'object' || Array.isArray(product.specs)) return {};
  return Object.fromEntries(
    Object.entries(product.specs as Record<string, Json>).map(([k, v]) => [k, String(v ?? '—')]),
  );
}

function buildProductBlock(product: Product): string {
  const name = product.brand ? `${product.brand} ${product.name}` : product.name;
  const specs = getSpecs(product);
  const specLines = Object.entries(specs)
    .map(([k, v]) => `  - ${k}: ${v}`)
    .join('\n');

  const priceRange = product.price_min
    ? product.price_max && product.price_max !== product.price_min
      ? `₺${product.price_min.toLocaleString('tr-TR')} – ₺${product.price_max.toLocaleString('tr-TR')}`
      : `₺${product.price_min.toLocaleString('tr-TR')}`
    : 'Fiyat bilgisi yok';

  return [
    `### ${name}`,
    `- Fiyat: ${priceRange}`,
    product.short_description ? `- Açıklama: ${product.short_description}` : '',
    Object.keys(specs).length > 0 ? `- Teknik Özellikler:\n${specLines}` : '',
  ].filter(Boolean).join('\n');
}

function buildPrompt(products: Product[]): string {
  const productBlocks = products.map(buildProductBlock).join('\n\n');

  return `Sen bir ürün karşılaştırma uzmanısın. Şu ürünleri karşılaştır:

${productBlocks}

Kullanıcıya kısa (200 kelime), tarafsız öneri ver. Hangisini almalı ve neden?

Kurallar:
- Türkçe yaz
- Markdown kullan (## başlık, **bold**, madde işaretleri)
- Sonunda "**Sonuç:**" ile tek cümlelik net karar ver`;
}

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Saatte 5 istek hakkınız var. Lütfen daha sonra deneyin.', retryAfter: rateCheck.retryAfter },
        { status: 429 },
      );
    }

    const body = await request.json() as { productIds?: string[] };
    const { productIds } = body;

    if (!productIds || productIds.length < 2 || productIds.length > 4) {
      return NextResponse.json(
        { error: 'Karşılaştırma için 2-4 ürün gerekli' },
        { status: 400 },
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'AI servisi şu an yapılandırılmamış' },
        { status: 503 },
      );
    }

    // Fetch product data
    const products = await getProductsByIds(productIds);
    if (products.length < 2) {
      return NextResponse.json({ error: 'Ürünler bulunamadı' }, { status: 404 });
    }

    const prompt = buildPrompt(products);

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const names = products.map((p) => p.brand ? `${p.brand} ${p.name}` : p.name);

    return NextResponse.json({
      analysis: content.text,
      products: names,
      model: message.model,
    });
  } catch (err) {
    console.error('[AI Compare]', err);
    const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
    return NextResponse.json({ error: `AI analizi başarısız: ${message}` }, { status: 500 });
  }
}
