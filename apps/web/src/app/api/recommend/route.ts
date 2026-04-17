import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@compario/database';

// Priority → spec keywords to match in product specs
const PRIORITY_SIGNALS: Record<string, string[]> = {
  performans:        ['snapdragon 8', 'a18', 'a17', 'm4', 'm3', 'rtx 40', 'core ultra 9', 'core ultra 7', 'ryzen 9', 'i9', '3nm', '4nm'],
  batarya:           ['mah', 'batarya', 'battery', '65w', '67w', '90w', 'saat', 'uzun'],
  kamera:            ['mp', 'leica', 'zeiss', 'kamera', 'camera', 'telefoto', 'periskop'],
  'fiyat-performans':[], // handled separately via price efficiency score
  tasarim:           ['oled', 'amoled', 'retina', 'gorilla', 'alüminyum', 'titanium', 'premium'],
  hafiflik:          ['kg', 'gram', 'hafif', 'slim', 'ince', 'ultrabook'],
  ekran:             ['oled', 'amoled', '120hz', '144hz', 'qhd', '4k', 'retina', 'pro motion', 'ltpo'],
  dayaniklilik:      ['mil-std', 'ip68', 'ip67', 'gorilla', 'sertifika', 'ruggedized'],
};

const BADGE_BY_PRIORITY: Record<string, string> = {
  performans:         'Performans Canavarı',
  batarya:            'Batarya Şampiyonu',
  kamera:             'Fotoğraf Ustası',
  'fiyat-performans': 'En İyi Değer',
  tasarim:            'Tasarım Harikası',
  hafiflik:           'Ultra Hafif',
  ekran:              'Ekran Kalitesi',
  dayaniklilik:       'Dayanıklılık Odaklı',
};

const PRO_BY_PRIORITY: Record<string, string> = {
  performans:         'Üst düzey işlemci ile maksimum hız',
  batarya:            'Uzun pil ömrü ile günü rahat geçirirsin',
  kamera:             'Yüksek çözünürlüklü kamera sistemi',
  'fiyat-performans': 'Bütçene göre en yüksek performans',
  tasarim:            'Premium malzeme ve şık tasarım',
  hafiflik:           'Taşımaya uygun hafif yapı',
  ekran:              'Yüksek kaliteli ekran deneyimi',
  dayaniklilik:       'Zorlu koşullara dayanıklı yapı',
};

function specsToString(specs: unknown): string {
  if (!specs) return '';
  return JSON.stringify(specs).toLowerCase();
}

function scoreProduct(
  product: { price_min?: number | null; specs: unknown; name: string },
  priorities: string[],
  budgetMax: number,
): number {
  let score = 0;
  const specsStr = specsToString(product.specs) + ' ' + product.name.toLowerCase();

  for (const priority of priorities) {
    const signals = PRIORITY_SIGNALS[priority] ?? [];
    for (const signal of signals) {
      if (specsStr.includes(signal)) score += 10;
    }

    // Fiyat/performans için bütçenin %60-80'inde olan ürünlere bonus
    if (priority === 'fiyat-performans' && budgetMax > 0) {
      const price = product.price_min ?? 0;
      const ratio = price / budgetMax;
      if (ratio >= 0.5 && ratio <= 0.8) score += 20;
    }
  }

  // Fiyatı bütçenin %90'ından az olan ürünlere küçük bonus
  if (budgetMax > 0 && (product.price_min ?? 0) <= budgetMax * 0.9) score += 5;

  return score;
}

function buildSummary(product: { name: string; brand?: string | null; price_min?: number | null }, priorities: string[], rank: number): string {
  const name = `${product.brand ? product.brand + ' ' : ''}${product.name}`;
  const topPriority = priorities[0];

  const phrases: Record<string, string> = {
    performans:         `${name}, güçlü işlemcisi ile bu kategorinin en hızlı seçeneklerinden biri.`,
    batarya:            `${name}, uzun pil ömrüyle şarj kaygısı yaşamadan gün geçirebilirsin.`,
    kamera:             `${name}, gelişmiş kamera sistemiyle profesyonel kalitede fotoğraf çektirir.`,
    'fiyat-performans': `${name}, bütçene kıyasla en yüksek değeri sunan akıllı bir tercih.`,
    tasarim:            `${name}, premium malzemeleri ve özenli tasarımıyla dikkat çekiyor.`,
    hafiflik:           `${name}, hafif yapısıyla her gün yanında taşımak isteyeceğin bir model.`,
    ekran:              `${name}, yüksek kaliteli ekranıyla içerik tüketiminde fark yaratıyor.`,
    dayaniklilik:       `${name}, dayanıklı yapısıyla uzun yıllar sorunsuz kullanım vadediyor.`,
  };

  const base = phrases[topPriority ?? ''] ?? `${name}, tercihlerine göre öne çıkan bir model.`;
  if (rank === 1) return base + ' Önceliklerinle en uyumlu seçenek bu.';
  if (rank === 2) return base + ' İlk öneriye güçlü bir alternatif.';
  return base;
}

function buildPros(priorities: string[], specsStr: string): string[] {
  const pros: string[] = [];
  for (const p of priorities.slice(0, 3)) {
    if (PRO_BY_PRIORITY[p]) pros.push(PRO_BY_PRIORITY[p]);
  }
  if (specsStr.includes('oled') || specsStr.includes('amoled')) pros.push('Yüksek kaliteli OLED ekran');
  if (specsStr.includes('ip6')) pros.push('Su ve toz direnci');
  if (specsStr.includes('5g')) pros.push('5G bağlantı desteği');
  return [...new Set(pros)].slice(0, 4);
}

function buildCons(product: { price_min?: number | null }, budgetMax: number, priorities: string[]): string[] {
  const cons: string[] = [];
  const price = product.price_min ?? 0;
  if (budgetMax > 0 && price > budgetMax * 0.85) cons.push('Bütçenin üst sınırına yakın');
  if (!priorities.includes('batarya')) cons.push('Batarya önceliğin değilse farklı bakabilirsin');
  return cons.slice(0, 2);
}

export async function POST(req: NextRequest) {
  try {
    const { category_slug, budget_max, priorities = [], custom_note } = await req.json();

    if (!category_slug) {
      return NextResponse.json({ error: 'Kategori seçilmedi' }, { status: 400 });
    }

    const allProducts = await getProducts({ status: 'active', category: category_slug, limit: 50 });

    const filtered = allProducts.filter(p =>
      !budget_max || (p.price_min ?? 0) <= budget_max
    );

    if (filtered.length === 0) {
      return NextResponse.json({ error: 'Bütçene uygun ürün bulunamadı' }, { status: 404 });
    }

    // Score & sort
    const scored = filtered
      .map(p => ({ product: p, score: scoreProduct(p, priorities, budget_max ?? 0) }))
      .sort((a, b) => b.score - a.score || (a.product.price_min ?? 0) - (b.product.price_min ?? 0));

    const top = scored.slice(0, 3);

    const topPriority = priorities[0] as string | undefined;
    const badge = topPriority ? (BADGE_BY_PRIORITY[topPriority] ?? 'AI Önerisi') : 'En İyi Seçim';

    const recommendations = top.map(({ product }, i) => {
      const specsStr = specsToString(product.specs) + ' ' + product.name.toLowerCase();
      return {
        rank: i + 1,
        product_name: `${product.brand ? product.brand + ' ' : ''}${product.name}`,
        product_slug: product.slug,
        badge: i === 0 ? badge : (i === 1 ? 'Alternatif' : '3. Seçenek'),
        summary: buildSummary(product, priorities, i + 1),
        pros: buildPros(priorities, specsStr),
        cons: buildCons(product, budget_max ?? 0, priorities),
        verdict: i === 0 ? 'Önceliklerinle en uyumlu tercih.' : 'Güçlü bir alternatif seçenek.',
        price_min: product.price_min,
        price_max: product.price_max,
      };
    });

    const ai_note = custom_note?.trim()
      ? `"${custom_note.trim()}" notuna göre filtreleme yapıldı.`
      : null;

    return NextResponse.json({ recommendations, ai_note });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Hata oluştu';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
