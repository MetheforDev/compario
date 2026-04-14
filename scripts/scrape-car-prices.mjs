/**
 * Araç Fiyatı Güncelleyici
 * ─────────────────────────
 * Türk otomobil üreticilerinin resmi Türkiye sitelerinden fiyat çeker,
 * Supabase'deki ürünleri günceller.
 *
 * Çalıştır:  node scripts/scrape-car-prices.mjs
 * Otomatik:  .github/workflows/update-car-prices.yml (günlük)
 *
 * Gereksinim: node >= 18 (native fetch), @supabase/supabase-js
 *
 * ÖNEMLİ: Her üretici için URL ve parsePrice() fonksiyonu
 *          aşağıdaki MANUFACTURERS listesinde tanımlıdır.
 *          Site yapısı değişirse sadece o bloğu güncellemek yeterlidir.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dir = dirname(fileURLToPath(import.meta.url));

// ─── Env ─────────────────────────────────────────────────────────────────────
function loadEnv() {
  try {
    const raw = readFileSync(resolve(__dir, '../apps/web/.env.local'), 'utf8');
    const vars = {};
    raw.split('\n').forEach((line) => {
      const [k, ...rest] = line.split('=');
      if (k?.trim() && rest.length) vars[k.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
    });
    return vars;
  } catch {
    return {};
  }
}

const env = loadEnv();
const SUPABASE_URL  = process.env.SUPABASE_URL  || env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY eksik');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Yardımcı fonksiyonlar ────────────────────────────────────────────────────

/** HTML'den basit text çıkarır (tag'ler kaldırılır) */
function stripTags(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** "1.234.567" veya "1,234,567" gibi fiyatları sayıya çevirir */
function parsePrice(str) {
  if (!str) return null;
  const cleaned = String(str).replace(/[^\d.,]/g, '');
  // Türk formatı: 1.234.567 (nokta = binlik ayraç, virgül = ondalık)
  const n = parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
  return isNaN(n) ? null : Math.round(n);
}

/** İki model adının benzerliğini 0-1 arasında döner */
function similarity(a, b) {
  const normalize = (s) => s.toLowerCase()
    .replace(/[-_\s]+/g, ' ')
    .replace(/[^a-z0-9ğüşıöçğ ]/g, '')
    .trim();
  const na = normalize(a), nb = normalize(b);
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.85;
  const wordsA = new Set(na.split(' '));
  const wordsB = new Set(nb.split(' '));
  const inter = [...wordsA].filter(w => wordsB.has(w)).length;
  return inter / Math.max(wordsA.size, wordsB.size);
}

/** Timeout ile fetch */
async function fetchWithTimeout(url, timeoutMs = 15000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
      },
    });
    return res;
  } finally {
    clearTimeout(id);
  }
}

// ─── Üretici tanımları ────────────────────────────────────────────────────────
//
// Her üretici için:
//   brand    → DB'deki product.brand değeriyle eşleşmeli (büyük/küçük harf farketmez)
//   urls     → Fiyat listesinin bulunduğu sayfalar
//   extract  → HTML'den { model, price }[] dönen fonksiyon
//
// Selektörleri doğrulamak için: tarayıcıda siteye gidip Inspect → Copy selector

const MANUFACTURERS = [

  // ── Toyota Türkiye ──────────────────────────────────────────────────────────
  {
    brand: 'Toyota',
    urls: ['https://www.toyota.com.tr/modeller/fiyat-listesi'],
    async extract(html) {
      const results = [];
      // Toyota fiyat tablosu: <tr> içinde model adı + fiyat
      // Pattern: "Corolla" ... "1.234.567 TL"
      const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
      let rowMatch;
      while ((rowMatch = rowRegex.exec(html)) !== null) {
        const row = rowMatch[1];
        const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m => stripTags(m[1]));
        if (cells.length >= 2) {
          const model = cells[0]?.trim();
          const priceStr = cells.find(c => /\d{3}/.test(c) && c.includes('TL') || /\d{1,3}\.\d{3}/.test(c));
          const price = parsePrice(priceStr);
          if (model && price && price > 100_000) {
            results.push({ model, price });
          }
        }
      }
      return results;
    },
  },

  // ── Volkswagen Türkiye ──────────────────────────────────────────────────────
  {
    brand: 'Volkswagen',
    urls: ['https://www.volkswagen.com.tr/tr/modeller.html'],
    async extract(html) {
      const results = [];
      // VW: data-price veya fiyat span'ları
      const priceRegex = /(?:data-price|fiyat)[^>]*>\s*([0-9.,]+)/gi;
      const modelRegex = /(?:model-name|model-title|vehicle-name)[^>]*>([\s\S]*?)<\//gi;
      const prices = [...html.matchAll(priceRegex)].map(m => parsePrice(m[1]));
      const models = [...html.matchAll(modelRegex)].map(m => stripTags(m[1]).trim());
      models.forEach((model, i) => {
        if (model && prices[i] && prices[i] > 100_000) {
          results.push({ model, price: prices[i] });
        }
      });
      return results;
    },
  },

  // ── Renault Türkiye ─────────────────────────────────────────────────────────
  {
    brand: 'Renault',
    urls: ['https://www.renault.com.tr/otomobiller.html'],
    async extract(html) {
      const results = [];
      // Renault: "Başlangıç Fiyatı" pattern
      const blocks = html.split(/(?=<[a-z][^>]*class="[^"]*(?:card|model|vehicle)[^"]*")/i);
      for (const block of blocks) {
        const modelMatch = block.match(/(?:model-name|vehicle-name|card-title)[^>]*>([\s\S]*?)<\//i);
        const priceMatch = block.match(/(?:starting-price|fiyat|price)[^>]*>([\s\S]*?)<\//i);
        const model = modelMatch ? stripTags(modelMatch[1]).trim() : null;
        const price = priceMatch ? parsePrice(stripTags(priceMatch[1])) : null;
        if (model && price && price > 100_000) {
          results.push({ model, price });
        }
      }
      return results;
    },
  },

  // ── Fiat Türkiye ────────────────────────────────────────────────────────────
  {
    brand: 'Fiat',
    urls: ['https://www.fiat.com.tr/otomobiller'],
    async extract(html) {
      const results = [];
      const priceRegex = /([A-Z][a-z]+(?:\s+[A-Z0-9][a-z0-9]*)*)[^\d]*([\d]{1,3}(?:\.\d{3})+)\s*TL/g;
      let match;
      while ((match = priceRegex.exec(html)) !== null) {
        const model = match[1].trim();
        const price = parsePrice(match[2]);
        if (model && price && price > 100_000) {
          results.push({ model, price });
        }
      }
      return results;
    },
  },

  // ── Hyundai Türkiye ─────────────────────────────────────────────────────────
  {
    brand: 'Hyundai',
    urls: ['https://www.hyundai.com/tr/tr/models.html'],
    async extract(html) {
      const results = [];
      const blocks = html.split(/(?=<[^>]*class="[^"]*(?:model|vehicle|car)[^"]*")/i);
      for (const block of blocks) {
        const modelMatch = block.match(/<h[123][^>]*>([\s\S]{3,40}?)<\/h[123]>/i);
        const priceMatch = block.match(/[\d]{1,3}(?:\.\d{3})+(?:\s*TL)?/);
        const model = modelMatch ? stripTags(modelMatch[1]).trim() : null;
        const price = priceMatch ? parsePrice(priceMatch[0]) : null;
        if (model && price && price > 100_000) {
          results.push({ model, price });
        }
      }
      return results;
    },
  },

  // ── Kia Türkiye ─────────────────────────────────────────────────────────────
  {
    brand: 'Kia',
    urls: ['https://www.kia.com/tr/find-a-car/new-vehicles.html'],
    async extract(html) {
      const results = [];
      const priceRegex = /([A-Z][a-z]+(?:\s+[A-Z0-9][a-z0-9]*)*)[^\d]*([\d]{1,3}(?:\.\d{3})+)\s*TL/g;
      let match;
      while ((match = priceRegex.exec(html)) !== null) {
        const model = match[1].trim();
        const price = parsePrice(match[2]);
        if (model && price && price > 100_000) {
          results.push({ model, price });
        }
      }
      return results;
    },
  },

  // ── BMW Türkiye ─────────────────────────────────────────────────────────────
  {
    brand: 'BMW',
    urls: ['https://www.bmw.com.tr/tr/all-models.html'],
    async extract(html) {
      const results = [];
      // BMW genellikle JSON-LD veya data attribute kullanır
      const jsonMatches = html.matchAll(/window\.__data\s*=\s*(\{[\s\S]*?\})(?:\s*;|\s*<)/g);
      for (const jm of jsonMatches) {
        try {
          const data = JSON.parse(jm[1]);
          const models = data?.models || data?.vehicles || [];
          for (const m of models) {
            if (m.name && m.price) results.push({ model: m.name, price: parsePrice(String(m.price)) });
          }
        } catch {}
      }
      // Fallback: regex
      if (results.length === 0) {
        const priceRegex = /([\d]{1,3}(?:\.\d{3})+)\s*TL/g;
        const modelRegex = /(?:model|series|vehicle)[^>]*class[^>]*>([\s\S]{2,30}?)<\//gi;
        const prices = [...html.matchAll(priceRegex)].map(m => parsePrice(m[1]));
        const models = [...html.matchAll(modelRegex)].map(m => stripTags(m[1]).trim());
        models.forEach((model, i) => {
          if (model && prices[i] && prices[i] > 100_000) results.push({ model, price: prices[i] });
        });
      }
      return results;
    },
  },

  // ── Mercedes-Benz Türkiye ───────────────────────────────────────────────────
  {
    brand: 'Mercedes-Benz',
    urls: ['https://www.mercedes-benz.com.tr/passengercars/mercedes-benz-cars/car-configurator.html'],
    async extract(html) {
      // Mercedes genellikle JS ile yükler; statik HTML'de az veri olabilir
      const results = [];
      const priceRegex = /([\d]{1,3}(?:\.\d{3})+)\s*TL/g;
      const modelRegex = /(?:A-Serisi|C-Serisi|E-Serisi|S-Serisi|GLA|GLB|GLC|GLE|GLS|AMG|CLA|CLS|EQA|EQB|EQC|EQE|EQS)/g;
      const prices = [...html.matchAll(priceRegex)].map(m => parsePrice(m[1]));
      const models = [...html.matchAll(modelRegex)].map(m => m[0]);
      models.forEach((model, i) => {
        if (model && prices[i] && prices[i] > 100_000) results.push({ model, price: prices[i] });
      });
      return results;
    },
  },

  // ── Ford Türkiye ────────────────────────────────────────────────────────────
  {
    brand: 'Ford',
    urls: ['https://www.ford.com.tr/content/ford/tr_TR/vehicles.html'],
    async extract(html) {
      const results = [];
      const priceRegex = /([A-Z][a-z]+(?:\s+[A-Z0-9][a-z0-9]*)*)[^\d]*([\d]{1,3}(?:\.\d{3})+)\s*TL/g;
      let match;
      while ((match = priceRegex.exec(html)) !== null) {
        const price = parsePrice(match[2]);
        if (price > 100_000) results.push({ model: match[1].trim(), price });
      }
      return results;
    },
  },

];

// ─── Ana mantık ───────────────────────────────────────────────────────────────

async function getDbProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, brand, model, price_min')
    .not('brand', 'is', null);
  if (error) throw new Error(`DB okuma hatası: ${error.message}`);
  return data ?? [];
}

async function updateProductPrice(id, price) {
  const { error } = await supabase
    .from('products')
    .update({ price_min: price, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(`Güncelleme hatası (${id}): ${error.message}`);
}

async function scrapeMfr(mfr, dbProducts) {
  const brandProducts = dbProducts.filter(p =>
    p.brand?.toLowerCase().includes(mfr.brand.toLowerCase()) ||
    mfr.brand.toLowerCase().includes(p.brand?.toLowerCase() ?? '')
  );

  if (brandProducts.length === 0) {
    console.log(`  ⚠  DB'de ${mfr.brand} ürünü yok, atlanıyor`);
    return { updated: 0, skipped: 0 };
  }

  let scrapedModels = [];
  for (const url of mfr.urls) {
    try {
      console.log(`  → Çekiliyor: ${url}`);
      const res = await fetchWithTimeout(url);
      if (!res.ok) { console.log(`  ✗ HTTP ${res.status}`); continue; }
      const html = await res.text();
      const models = await mfr.extract(html);
      console.log(`  ✓ ${models.length} model bulundu`);
      scrapedModels.push(...models);
    } catch (e) {
      console.log(`  ✗ Hata: ${e.message}`);
    }
  }

  if (scrapedModels.length === 0) {
    console.log(`  ⚠  Hiç fiyat çekilemedi (site yapısı değişmiş olabilir)`);
    return { updated: 0, skipped: brandProducts.length };
  }

  let updated = 0, skipped = 0;

  for (const dbProd of brandProducts) {
    const nameToMatch = dbProd.model || dbProd.name;
    let bestMatch = null, bestScore = 0;

    for (const scraped of scrapedModels) {
      const score = similarity(nameToMatch, scraped.model);
      if (score > bestScore) { bestScore = score; bestMatch = scraped; }
    }

    if (!bestMatch || bestScore < 0.5) {
      console.log(`  ⚠  Eşleşme yok: "${nameToMatch}" (en iyi: ${bestMatch?.model ?? 'yok'}, skor: ${bestScore.toFixed(2)})`);
      skipped++;
      continue;
    }

    const priceDiff = Math.abs((dbProd.price_min ?? 0) - bestMatch.price);
    const pricePct  = dbProd.price_min ? priceDiff / dbProd.price_min : 1;

    // Fiyat değişmemişse ya da %50'den fazla değiştiyse güncelleme — muhtemelen yanlış eşleşme
    if (pricePct === 0) {
      console.log(`  = Fiyat değişmemiş: "${nameToMatch}" ${bestMatch.price.toLocaleString('tr-TR')} ₺`);
      skipped++;
      continue;
    }
    if (pricePct > 0.5 && dbProd.price_min) {
      console.log(`  ⚠  Şüpheli fiyat değişimi (%${Math.round(pricePct * 100)}), atlanıyor: "${nameToMatch}" ${dbProd.price_min} → ${bestMatch.price}`);
      skipped++;
      continue;
    }

    await updateProductPrice(dbProd.id, bestMatch.price);
    console.log(`  ✓ Güncellendi: "${nameToMatch}" ${(dbProd.price_min ?? 0).toLocaleString('tr-TR')} → ${bestMatch.price.toLocaleString('tr-TR')} ₺ (${bestMatch.model}, skor: ${bestScore.toFixed(2)})`);
    updated++;
  }

  return { updated, skipped };
}

async function main() {
  console.log('🚗 Araç Fiyatı Güncelleyici başladı\n');

  const dbProducts = await getDbProducts();
  console.log(`📦 DB'de ${dbProducts.length} ürün var\n`);

  let totalUpdated = 0, totalSkipped = 0;

  for (const mfr of MANUFACTURERS) {
    console.log(`\n⬡ ${mfr.brand}`);
    try {
      const { updated, skipped } = await scrapeMfr(mfr, dbProducts);
      totalUpdated += updated;
      totalSkipped += skipped;
    } catch (e) {
      console.log(`  ✗ Kritik hata: ${e.message}`);
    }
    // Rate limiting — siteler arasında 2sn bekle
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`\n─────────────────────────────`);
  console.log(`✅ Tamamlandı: ${totalUpdated} güncellendi, ${totalSkipped} atlandı`);
}

main().catch(e => {
  console.error('❌ Kritik hata:', e.message);
  process.exit(1);
});
