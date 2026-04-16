/**
 * fetch-category-images-pexels.mjs
 * Kategori görsellerini Pexels'ten çeker ve DB'ye yazar.
 * Çalıştır: cd scripts && node fetch-category-images-pexels.mjs
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
if (!PEXELS_KEY) { console.error('❌ PEXELS_API_KEY eksik'); process.exit(1); }

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── slug → Pexels arama terimi ──────────────────────────────────────────────
// Araçlar için sokak fotoğrafları daha gerçekçi görünür

const CATEGORY_QUERIES = {
  // Araç kategorileri
  'suv':          'SUV car luxury road 4x4',
  'sedan':        'sedan car luxury road night',
  'hatchback':    'hatchback compact car city road',
  'crossover':    'crossover car highway sunset',
  'coupe':        'sports coupe car road',
  'pickup':       'pickup truck offroad',
  'minivan':      'minivan family car road',
  'elektrikli':   'electric car charging station modern',
  'hibrit':       'hybrid car modern road eco',
  // Teknoloji
  'akilli-telefon':    'smartphone modern phone technology',
  'tablet':            'tablet modern technology screen',
  'laptop':            'laptop computer modern office',
  'bilgisayar':        'desktop computer setup gaming',
  'kulalik':           'headphones music audio modern',
  'smartwatch':        'smartwatch wrist technology',
  'televizyon':        'television 4k screen modern',
  'kamera':            'camera photography lens professional',
  // Ev
  'beyaz-esya':        'washing machine appliance modern kitchen',
  'klima':             'air conditioner modern home',
  'buzdolabi':         'refrigerator modern kitchen appliance',
};

async function searchPexels(query) {
  const url = `https://api.pexels.com/v1/search?` + new URLSearchParams({
    query,
    per_page: '5',
    orientation: 'landscape',
  });

  const res = await fetch(url, { headers: { Authorization: PEXELS_KEY } });
  if (!res.ok) return null;
  const json = await res.json();
  const photo = json?.photos?.[0];
  return photo?.src?.large ?? null;
}

async function main() {
  console.log('🖼  Pexels\'den kategori görselleri çekiliyor...\n');

  const { data: categories } = await supabase.from('categories').select('id, slug, name, image_url');
  if (!categories?.length) { console.error('❌ Kategori bulunamadı'); return; }

  let updated = 0, skipped = 0, failed = 0;

  for (const cat of categories) {
    const query = CATEGORY_QUERIES[cat.slug];

    if (!query) {
      // Slug eşleşmesi yoksa otomatik olarak kategori adıyla ara
      const autoQuery = `${cat.name} car road`;
      process.stdout.write(`  🔍 ${cat.name} (otomatik arama)... `);
      const url = await searchPexels(autoQuery);
      if (url) {
        await supabase.from('categories').update({ image_url: url }).eq('id', cat.id);
        console.log('✅');
        updated++;
      } else {
        console.log('⚠ bulunamadı');
        failed++;
      }
      await new Promise(r => setTimeout(r, 400));
      continue;
    }

    if (cat.image_url?.includes('pexels.com')) {
      console.log(`  ⏭  Mevcut: ${cat.slug}`);
      skipped++;
      continue;
    }

    process.stdout.write(`  🔍 ${cat.name} (${cat.slug})... `);
    const url = await searchPexels(query);

    if (!url) {
      console.log('⚠ bulunamadı');
      failed++;
    } else {
      const { error } = await supabase.from('categories').update({ image_url: url }).eq('id', cat.id);
      if (error) { console.log(`❌ ${error.message}`); failed++; }
      else { console.log(`✅\n     → ${url}`); updated++; }
    }

    await new Promise(r => setTimeout(r, 400));
  }

  console.log(`\n📊 Sonuç: ${updated} güncellendi, ${skipped} mevcut, ${failed} başarısız`);
}

main().catch(err => { console.error(err); process.exit(1); });
