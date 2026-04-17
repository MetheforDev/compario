import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getProducts } from '@compario/database';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { category_slug, budget_max, priorities, custom_note } = await req.json();

    if (!category_slug) {
      return NextResponse.json({ error: 'Kategori seçilmedi' }, { status: 400 });
    }

    const products = await getProducts({
      status: 'active',
      category: category_slug,
      limit: 30,
    });

    if (products.length === 0) {
      return NextResponse.json({ error: 'Bu kategoride ürün bulunamadı' }, { status: 404 });
    }

    const productList = products
      .filter(p => !budget_max || (p.price_min ?? 0) <= budget_max)
      .slice(0, 20)
      .map(p => ({
        id: p.id,
        slug: p.slug,
        name: `${p.brand ? p.brand + ' ' : ''}${p.name}`,
        price_min: p.price_min,
        price_max: p.price_max,
        specs: p.specs,
      }));

    if (productList.length === 0) {
      return NextResponse.json({ error: 'Bütçene uygun ürün bulunamadı' }, { status: 404 });
    }

    const prompt = `Sen Compario'nun AI asistanısın. Kullanıcının tercihlerine göre aşağıdaki ürünler arasından en uygun 1-3 ürünü öner.

KULLANICI TERCİHLERİ:
- Bütçe: ${budget_max ? `Maksimum ₺${budget_max.toLocaleString('tr-TR')}` : 'Bütçe belirtilmedi'}
- Öncelikler: ${priorities?.length ? priorities.join(', ') : 'Belirtilmedi'}
- Ek not: ${custom_note?.trim() || 'Yok'}

MEVCUT ÜRÜNLER:
${productList.map((p, i) => `${i + 1}. ${p.name} — ₺${p.price_min?.toLocaleString('tr-TR') ?? '?'}${p.price_max && p.price_max !== p.price_min ? ` - ₺${p.price_max.toLocaleString('tr-TR')}` : ''}`).join('\n')}

Yanıtını aşağıdaki JSON formatında ver (başka hiçbir şey yazma):
{
  "recommendations": [
    {
      "rank": 1,
      "product_name": "tam ürün adı (listeden aynen)",
      "product_slug": "slug değeri",
      "badge": "kısa rozet (örn: En İyi Değer, Performans Canavarı, Bütçe Dostu)",
      "summary": "2-3 cümle neden bu ürün (Türkçe, samimi ve net)",
      "pros": ["avantaj 1", "avantaj 2", "avantaj 3"],
      "cons": ["dezavantaj 1"],
      "verdict": "Tek cümle nihai karar"
    }
  ],
  "ai_note": "Genel bir tavsiye veya uyarı varsa buraya yaz (opsiyonel, max 1 cümle)"
}`;

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = message.content[0].type === 'text' ? message.content[0].text : '';

    // JSON'u temizle
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('AI yanıtı geçersiz format');

    const parsed = JSON.parse(jsonMatch[0]);

    // Slug'ları ürün listesinden eşleştir
    const enriched = parsed.recommendations.map((rec: { product_name: string; product_slug?: string; rank: number; badge: string; summary: string; pros: string[]; cons: string[]; verdict: string }) => {
      const match = productList.find(
        p => p.name.toLowerCase().includes(rec.product_name.toLowerCase().split(' ').slice(-2).join(' ').toLowerCase())
          || rec.product_name.toLowerCase().includes(p.name.toLowerCase())
      );
      return {
        ...rec,
        product_slug: match?.slug ?? rec.product_slug ?? '',
        price_min: match?.price_min,
        price_max: match?.price_max,
      };
    });

    return NextResponse.json({ recommendations: enriched, ai_note: parsed.ai_note ?? null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Hata oluştu';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
