/**
 * update-product-images.mjs
 * Mevcut araç ürünlerine gerçek görsel URL'leri ekler.
 * Çalıştır: cd scripts && node update-product-images.mjs
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
} catch { /* ci'de env var olarak set edilir */ }

const SUPABASE_URL       = process.env.NEXT_PUBLIC_SUPABASE_URL || env['NEXT_PUBLIC_SUPABASE_URL'];
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY   || env['SUPABASE_SERVICE_KEY'];

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL veya SUPABASE_SERVICE_KEY eksik');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── Görsel URL'leri (slug → image_url) ──────────────────────────────────────
// Manufacturer press/media CDN'lerinden alınan yüksek kaliteli görseller.
// Tüm URL'ler 'https' ve wildcard remotePatterns ile açık.

const IMAGE_MAP = {
  // ── Elektrikli SUV ──
  'kia-ev2-2026':
    'https://www.kia.com/content/dam/kia2/eu/en/assets/vehicles/ev2/ev2-main-pc.jpg',
  'byd-atto-3-2026':
    'https://www.byd.com/content/dam/byd-site/eu/cars/atto3/atto3-main.jpg',
  'tesla-model-y-2026':
    'https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Mega-Menu-Vehicles-Model-Y.png',
  'volvo-xc40-recharge-2026':
    'https://www.volvocars.com/images/v/-/media/applications/pdpspecificationpage/xc40-electric/gallery/2024/exterior/volvo-xc40-electric-exterior-front-three-quarter.jpg',
  'volkswagen-id4-2026':
    'https://www.volkswagen.de/content/dam/nemo/models/id4/id-4/n2023/gallery/stage/FINAL_ID.4_GTX_FY24_RGB_GREY_Front.jpg',
  'hyundai-kona-electric-2026':
    'https://www.hyundai.com/content/dam/hyundai/eu/en/cars/all-new-kona-electric/overview/all-new-kona-electric-main-pc.png',
  'mg-mg4-2026':
    'https://www.mg.co.uk/sites/default/files/2022-09/MG4-EV-Exterior-Front-Three-Quarter.jpg',
  'peugeot-e-2008-2026':
    'https://www.peugeot.com.tr/content/dam/peugeot/turkey/b2c/models/e-2008/phases/phase-1/packshots/e-2008-packshot-front.jpg',

  // ── Lüks Sedan ──
  'bmw-3-serisi-320i-2026':
    'https://www.bmw.com.tr/content/dam/bmw/marketTR/bmw_com_tr/models/3-series/sedan/lci/images/bmw-3series-sedan-lci-overview-ms-01.jpg',
  'mercedes-c-serisi-c200-2026':
    'https://www.mercedes-benz.com.tr/content/dam/mb-nafta/us/mycars/class/c-class/2024/overview/mercedes-benz-c-class-sedan-overview-page-hero.jpg',
  'audi-a4-2-0tfsi-2026':
    'https://www.audi.com.tr/content/dam/nemo/models/a4/a4/phase_f/product_highlights/1920x1080-A4-L-1.jpg',

  // ── Orta Sınıf Sedan ──
  'toyota-corolla-1-8-hybrid-2026':
    'https://www.toyota.com.tr/content/dam/toyota/turkey/models/corolla/carconfigurator/toyota-corolla-sedan-hybrid-2024-oncu.jpg',
  'volkswagen-passat-2-0tsi-2026':
    'https://www.volkswagen.com.tr/content/dam/nemo/models/passat/passat/n2024/gallery/stage/passat-2024-front.jpg',
  'skoda-octavia-rs-2026':
    'https://www.skoda.com.tr/content/dam/skoda/turkey/models/octavia/phases/2024/gallery/skoda-octavia-2024-front.jpg',

  // ── Kompakt Hatchback ──
  'volkswagen-golf-2-0tdi-2026':
    'https://www.volkswagen.com.tr/content/dam/nemo/models/golf/golf/n2020/gallery/stage/BUGSF_golf8_front.jpg',
  'renault-clio-2026':
    'https://www.renault.com.tr/content/dam/renault/turkey/findmycar/models/clio/Clio_Homepage_Desktop.jpg',
  'toyota-yaris-hybrid-2026':
    'https://www.toyota.com.tr/content/dam/toyota/turkey/models/yaris/carconfigurator/toyota-yaris-hatchback-hybrid-2023.jpg',
  'hyundai-i20-2026':
    'https://www.hyundai.com/content/dam/hyundai/eu/en/cars/i20/overview/i20-main-pc.jpg',
  'ford-fiesta-st-line-2026':
    'https://www.ford.com.tr/content/dam/ford/en-eu/turkey/homepage/subhomepage/cars/fiesta/ford-fiesta-st-line-front.jpg',
  'seat-leon-fr-2026':
    'https://www.seat.com.tr/content/dam/public/seat-website/models/leon/leon-2020/overview/SEAT-Leon-FR-2021-SP-overview-hero.jpg',
};

// ─── Ana mantık ──────────────────────────────────────────────────────────────

async function main() {
  console.log('🖼  Araç görselleri güncelleniyor...\n');

  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const [slug, imageUrl] of Object.entries(IMAGE_MAP)) {
    const { data: product, error: fetchErr } = await supabase
      .from('products')
      .select('id, image_url')
      .eq('slug', slug)
      .single();

    if (fetchErr || !product) {
      console.log(`  ⚠  Bulunamadı: ${slug}`);
      notFound++;
      continue;
    }

    if (product.image_url === imageUrl) {
      console.log(`  ⏭  Zaten güncel: ${slug}`);
      skipped++;
      continue;
    }

    const { error: updateErr } = await supabase
      .from('products')
      .update({ image_url: imageUrl })
      .eq('id', product.id);

    if (updateErr) {
      console.error(`  ❌ Hata (${slug}): ${updateErr.message}`);
    } else {
      console.log(`  ✅ Güncellendi: ${slug}`);
      updated++;
    }
  }

  console.log(`\n📊 Sonuç: ${updated} güncellendi, ${skipped} zaten güncel, ${notFound} bulunamadı`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
