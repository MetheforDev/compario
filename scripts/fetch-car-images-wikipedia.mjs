/**
 * fetch-car-images-wikipedia.mjs
 * Wikipedia API'sinden araç görselleri çeker ve Supabase'e yazar.
 * Çalıştır: cd scripts && node fetch-car-images-wikipedia.mjs
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

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Env eksik'); process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── slug → Wikipedia makale başlığı eşlemesi ────────────────────────────────
// Wikipedia'nın tam başlıklarını kullanıyoruz; API bunlardan thumbnail URL üretecek.

const WIKI_TITLES = {
  'toyota-rav4-hybrid-2026':          'Toyota RAV4',
  'hyundai-tucson-hybrid-2026':       'Hyundai Tucson (NX4)',
  'kia-sportage-hybrid-2026':         'Kia Sportage (NQ5)',
  'volkswagen-tiguan-2026':           'Volkswagen Tiguan',
  'toyota-corolla-cross-hybrid-2026': 'Toyota Corolla Cross',
  'honda-hrv-ehev-2026':              'Honda HR-V (third generation)',
  'toyota-corolla-sedan-hybrid-2026': 'Toyota Corolla (E210)',
  'hyundai-elantra-hybrid-2026':      'Hyundai Elantra (CN7)',
  'kia-k4-hybrid-2026':               'Kia K4',
  'bmw-3-serisi-2026':                'BMW 3 Series (G20)',
  'mercedes-c-serisi-2025':           'Mercedes-Benz W206',
  'mercedes-c-serisi-2026':           'Mercedes-Benz W206',
  'volkswagen-golf-2026':             'Volkswagen Golf Mk8',
  'renault-clio-etech-2026':          'Renault Clio (V generation)',
  'hyundai-i20-hybrid-2026':          'Hyundai i20 (BC3)',
  'toyota-yaris-hybrid-2026':         'Toyota Yaris (XP210)',
  'tesla-model-y-2025':               'Tesla Model Y',
  'tesla-model-y-2026':               'Tesla Model Y',
  'kia-ev6-2025':                     'Kia EV6',
  'kia-ev6-2026':                     'Kia EV6',
  // Eski seed'den gelenler
  'kia-ev2-2026':                     'Kia EV2',
  'byd-atto-3-2026':                  'BYD Atto 3',
  'volvo-xc40-recharge-2026':         'Volvo XC40 Recharge',
  'volkswagen-id4-2026':              'Volkswagen ID.4',
  'hyundai-kona-electric-2026':       'Hyundai Kona Electric',
  'mg-mg4-2026':                      'MG4 EV',
  'peugeot-e-2008-2026':              'Peugeot e-2008',
  'bmw-3-serisi-320i-2026':           'BMW 3 Series (G20)',
  'mercedes-c-serisi-c200-2026':      'Mercedes-Benz W206',
  'audi-a4-2-0tfsi-2026':             'Audi A4 (B9)',
  'toyota-corolla-1-8-hybrid-2026':   'Toyota Corolla (E210)',
  'volkswagen-passat-2-0tsi-2026':    'Volkswagen Passat (B8)',
  'skoda-octavia-rs-2026':            'Škoda Octavia (4th generation)',
  'volkswagen-golf-2-0tdi-2026':      'Volkswagen Golf Mk8',
  'renault-clio-2026':                'Renault Clio (V generation)',
  'toyota-yaris-hybrid-2025':         'Toyota Yaris (XP210)',
  'hyundai-i20-2026':                 'Hyundai i20 (BC3)',
  'ford-fiesta-st-line-2026':         'Ford Fiesta (seventh generation)',
  'seat-leon-fr-2026':                'SEAT León (Mk4)',
};

// ─── Wikipedia thumbnail API ─────────────────────────────────────────────────

async function getWikipediaImage(title, width = 800) {
  const url = `https://en.wikipedia.org/w/api.php?` + new URLSearchParams({
    action: 'query',
    titles: title,
    prop: 'pageimages',
    format: 'json',
    pithumbsize: String(width),
    origin: '*',
  });

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Compario/1.0 (https://compario.tech; contact@compario.tech)' },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const pages = json?.query?.pages ?? {};
    const page = Object.values(pages)[0];
    return page?.thumbnail?.source ?? null;
  } catch {
    return null;
  }
}

// ─── Ana mantık ──────────────────────────────────────────────────────────────

async function main() {
  console.log('🖼  Wikipedia\'dan araç görselleri çekiliyor...\n');

  let updated = 0;
  let noImage = 0;
  let notInDb = 0;

  for (const [slug, wikiTitle] of Object.entries(WIKI_TITLES)) {
    // DB'de var mı kontrol
    const { data: product } = await supabase
      .from('products')
      .select('id, image_url')
      .eq('slug', slug)
      .single();

    if (!product) {
      notInDb++;
      continue;
    }

    // Zaten gerçek bir görsel varsa atla
    if (product.image_url && product.image_url.includes('upload.wikimedia.org')) {
      console.log(`  ⏭  Wiki görsel zaten var: ${slug}`);
      continue;
    }

    // Wikipedia'dan çek
    const imageUrl = await getWikipediaImage(wikiTitle);

    if (!imageUrl) {
      console.log(`  ⚠  Görsel bulunamadı: ${slug} (${wikiTitle})`);
      noImage++;
      continue;
    }

    // DB'ye yaz
    const { error } = await supabase
      .from('products')
      .update({ image_url: imageUrl })
      .eq('id', product.id);

    if (error) {
      console.error(`  ❌ Hata (${slug}): ${error.message}`);
    } else {
      console.log(`  ✅ ${slug}`);
      console.log(`     → ${imageUrl}`);
      updated++;
    }

    // Rate limit — Wikipedia API'sini yormamak için
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n📊 Sonuç: ${updated} güncellendi, ${noImage} görsel yok, ${notInDb} DB'de yok`);
}

main().catch(err => { console.error(err); process.exit(1); });
