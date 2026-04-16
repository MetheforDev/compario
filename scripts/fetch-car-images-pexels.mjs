/**
 * fetch-car-images-pexels.mjs
 * Pexels API'sinden yüksek kaliteli araç görselleri çeker.
 * Önce Pexels'i dener, bulamazsa Wikipedia'ya fallback eder.
 *
 * Kullanım:
 *   PEXELS_API_KEY=xxx node fetch-car-images-pexels.mjs
 *   veya .env.local içine PEXELS_API_KEY=xxx ekle
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
let env = {};
try {
  const raw = readFileSync(resolve(__dir, '../apps/web/.env.local'), 'utf8');
  raw.split('\n').forEach((line) => {
    const [k, ...v] = line.split('=');
    if (k && !k.startsWith('#') && v.length) env[k.trim()] = v.join('=').trim();
  });
} catch { /**/ }

const SUPABASE_URL        = process.env.NEXT_PUBLIC_SUPABASE_URL || env['NEXT_PUBLIC_SUPABASE_URL'];
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY    || env['SUPABASE_SERVICE_KEY'];
const PEXELS_KEY           = process.env.PEXELS_API_KEY          || env['PEXELS_API_KEY'];

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) { console.error('❌ Supabase env eksik'); process.exit(1); }
if (!PEXELS_KEY) { console.error('❌ PEXELS_API_KEY eksik\n   .env.local içine ekle: PEXELS_API_KEY=xxx'); process.exit(1); }

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── slug → arama terimi ──────────────────────────────────────────────────────

const SEARCH_TERMS = {
  // Hibrit SUV
  'toyota-rav4-hybrid-2026':          'Toyota RAV4 hybrid SUV',
  'hyundai-tucson-hybrid-2026':       'Hyundai Tucson SUV 2024',
  'kia-sportage-hybrid-2026':         'Kia Sportage 2023 SUV',
  'volkswagen-tiguan-2026':           'Volkswagen Tiguan 2024',
  'toyota-corolla-cross-hybrid-2026': 'Toyota Corolla Cross SUV',
  'honda-hrv-ehev-2026':              'Honda HR-V 2023 crossover',
  // Sedan
  'toyota-corolla-sedan-hybrid-2026': 'Toyota Corolla sedan 2023',
  'hyundai-elantra-hybrid-2026':      'Hyundai Elantra sedan 2023',
  'kia-k4-hybrid-2026':               'Kia K4 sedan 2025',
  'bmw-3-serisi-2026':                'BMW 3 series sedan',
  'bmw-3-serisi-320i-2026':           'BMW 3 series sedan front',
  'mercedes-c-serisi-2025':           'Mercedes C class sedan 2022',
  'mercedes-c-serisi-2026':           'Mercedes C class sedan 2022',
  'mercedes-c-serisi-c200-2026':      'Mercedes C class white sedan',
  // Hatchback
  'volkswagen-golf-2026':             'Volkswagen Golf 2020 hatchback',
  'volkswagen-golf-2-0tdi-2026':      'Volkswagen Golf 8 front',
  'renault-clio-etech-2026':          'Renault Clio 2023 hatchback',
  'renault-clio-2026':                'Renault Clio 2023 car',
  'hyundai-i20-hybrid-2026':          'Hyundai i20 hatchback 2023',
  'hyundai-i20-2026':                 'Hyundai i20 2023 compact car',
  'toyota-yaris-hybrid-2026':         'Toyota Yaris hybrid 2023',
  'toyota-yaris-hybrid-2025':         'Toyota Yaris hybrid hatchback',
  // Elektrikli
  'tesla-model-y-2025':               'Tesla Model Y white electric SUV',
  'tesla-model-y-2026':               'Tesla Model Y electric car white',
  'kia-ev6-2025':                     'Kia EV6 electric car',
  'kia-ev6-2026':                     'Kia EV6 electric crossover',
  'kia-ev2-2026':                     'Kia electric SUV compact 2024',
  'byd-atto-3-2026':                  'BYD Atto 3 electric SUV',
  'volvo-xc40-recharge-2026':         'Volvo XC40 electric blue SUV',
  'volkswagen-id4-2026':              'Volkswagen ID4 electric SUV white',
  'hyundai-kona-electric-2026':       'Hyundai Kona electric 2023',
  'mg-mg4-2026':                      'MG4 electric hatchback',
  'peugeot-e-2008-2026':              'Peugeot 2008 SUV red',
  // Eski seed slugları
  'kia-sportage-1-6-t-gdi-2024':       'Kia Sportage SUV road',
  'tesla-model-3-2026':                'Tesla Model 3 sedan electric white',
  'audi-a4-35tfsi-2026':               'Audi A4 sedan silver premium',
  'mercedes-c200-2026':                'Mercedes C class white sedan road',
  'fiat-500e-2026':                    'Fiat 500 electric city car',
  'peugeot-308-2026':                  'Peugeot 308 hatchback 2023',
  'mini-cooper-electric-2026':         'Mini Cooper electric car city',
  'opel-astra-2026':                   'Opel Vauxhall Astra hatchback 2022',
  'toyota-corolla-hybrid-2026':        'Toyota Corolla hybrid sedan road',
  'renault-megane-etech-electric-2026':'Renault Megane electric hatchback',
  'honda-civic-ehev-2026':             'Honda Civic sedan 2023 road',
  'volkswagen-golf-etsi-2026':         'Volkswagen Golf 8 hatchback front',
  // Diğer
  'audi-a4-2-0tfsi-2026':             'Audi A4 sedan silver 2022',
  'volkswagen-passat-2-0tsi-2026':    'Volkswagen Passat sedan 2023',
  'skoda-octavia-rs-2026':            'Skoda Octavia 2023 sedan',
  'ford-fiesta-st-line-2026':         'Ford Fiesta hatchback red',
  'seat-leon-fr-2026':                'SEAT Leon FR hatchback',
};

// ─── Pexels arama ────────────────────────────────────────────────────────────

async function searchPexels(query) {
  const url = `https://api.pexels.com/v1/search?` + new URLSearchParams({
    query,
    per_page: '5',
    orientation: 'landscape',
  });

  const res = await fetch(url, {
    headers: { Authorization: PEXELS_KEY },
  });

  if (!res.ok) return null;
  const json = await res.json();
  const photo = json?.photos?.[0];
  if (!photo) return null;

  // large2x = 1880px, large = 940px — large tercih et
  return photo.src?.large ?? photo.src?.medium ?? null;
}

// ─── Wikipedia fallback ───────────────────────────────────────────────────────

const WIKI_FALLBACK = {
  'hyundai-tucson-hybrid-2026':  'Hyundai Tucson',
  'kia-sportage-hybrid-2026':    'Kia Sportage',
  'honda-hrv-ehev-2026':         'Honda HR-V',
  'hyundai-elantra-hybrid-2026': 'Hyundai Elantra',
  'mercedes-c-serisi-2026':      'Mercedes-Benz C-class',
  'renault-clio-etech-2026':     'Renault Clio',
  'hyundai-i20-hybrid-2026':     'Hyundai i20',
  'volvo-xc40-recharge-2026':    'Volvo XC40',
  'hyundai-kona-electric-2026':  'Hyundai Kona',
  'peugeot-e-2008-2026':         'Peugeot 2008',
};

async function getWikipediaImage(title) {
  const url = `https://en.wikipedia.org/w/api.php?` + new URLSearchParams({
    action: 'query', titles: title, prop: 'pageimages',
    format: 'json', pithumbsize: '800', origin: '*',
  });
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Compario/1.0' } });
    const json = await res.json();
    const page = Object.values(json?.query?.pages ?? {})[0];
    return page?.thumbnail?.source ?? null;
  } catch { return null; }
}

// ─── Ana mantık ──────────────────────────────────────────────────────────────

async function main() {
  console.log('🖼  Pexels\'den araç görselleri çekiliyor...\n');

  // DB'deki tüm ürünleri çek
  const { data: products } = await supabase
    .from('products')
    .select('id, slug, brand, model, image_url');

  if (!products?.length) { console.error('❌ Ürün bulunamadı'); return; }

  let updated = 0, skipped = 0, failed = 0;

  for (const product of products) {
    const searchTerm = SEARCH_TERMS[product.slug];
    if (!searchTerm) {
      console.log(`  ⏭  Tanımsız slug, atlandı: ${product.slug}`);
      skipped++;
      continue;
    }

    // Zaten iyi bir görsel varsa atla
    if (product.image_url?.includes('pexels.com')) {
      console.log(`  ⏭  Pexels görsel mevcut: ${product.slug}`);
      skipped++;
      continue;
    }

    process.stdout.write(`  🔍 ${product.brand} ${product.model}... `);

    // 1. Pexels'i dene
    let imageUrl = await searchPexels(searchTerm);

    // 2. Pexels bulamadıysa Wikipedia fallback
    if (!imageUrl && WIKI_FALLBACK[product.slug]) {
      imageUrl = await getWikipediaImage(WIKI_FALLBACK[product.slug]);
      if (imageUrl) process.stdout.write('[wiki fallback] ');
    }

    if (!imageUrl) {
      console.log('⚠ bulunamadı');
      failed++;
      continue;
    }

    const { error } = await supabase
      .from('products')
      .update({ image_url: imageUrl })
      .eq('id', product.id);

    if (error) { console.log(`❌ DB hatası: ${error.message}`); failed++; }
    else { console.log(`✅`); updated++; }

    // Pexels rate limit: 200 req/saat — güvenli hız
    await new Promise(r => setTimeout(r, 400));
  }

  console.log(`\n📊 Sonuç: ${updated} güncellendi, ${skipped} atlandı, ${failed} başarısız`);
}

main().catch(err => { console.error(err); process.exit(1); });
