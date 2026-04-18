import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../apps/web/.env.local');
const envContent = readFileSync(envPath, 'utf-8');

const getEnv = (key) => {
  const match = envContent.match(new RegExp(`^${key}=(.+)$`, 'm'));
  return match ? match[1].trim() : null;
};

const supabase = createClient(
  getEnv('NEXT_PUBLIC_SUPABASE_URL'),
  getEnv('SUPABASE_SERVICE_KEY')
);

// Category IDs from Supabase
const CAT = {
  hibrit_suv:           '3a69d140-2212-4c1c-a410-7a793c55f13d',
  elektrikli_suv:       'dae3bafa-4303-473a-bef5-6b3e567b47ed',
  benzinli_suv:         '92392b29-a84a-49c7-9c97-cf3be624b480',
  luks_sedan:           '75e1c613-d149-4c52-8504-35ee1f9fd215',
  orta_sinif_sedan:     '667264fa-64d3-4ec5-a0c0-24c57461b92b',
  hibrit_sedan:         '72b7bc7b-dade-4f36-b149-9ce54a26150b',
  kompakt_hatchback:    '6c7aab5e-7fd7-42db-9fdb-f6a392884c05',
  hibrit_hatchback:     'c89fdab7-09f3-4bd0-accf-091b36a7f70b',
  elektrikli_hatchback: '0cc0b96e-9b6c-472c-87af-30b38ed92be6',
  hibrit_crossover:     'f13f52f4-62c4-4c98-b96e-adfda58a8635',
  kompakt_crossover:    '4a80bb4e-c56b-4dbb-90c9-4ff70ae1e911',
};

// Slug patterns → target category
const ASSIGNMENTS = [
  // Elektrikli SUV
  { slugs: ['volvo-xc40-recharge', 'tesla-model-y', 'byd-atto-3', 'mg-mg4', 'peugeot-e-2008', 'byd-ev2', 'volkswagen-id4', 'hyundai-kona-electric', 'kia-ev6'], cat: CAT.elektrikli_suv },
  // Hibrit SUV
  { slugs: ['toyota-rav4-hybrid', 'kia-sportage-hybrid', 'hyundai-tucson-hybrid'], cat: CAT.hibrit_suv },
  // Benzinli SUV
  { slugs: ['volkswagen-tiguan'], cat: CAT.benzinli_suv },
  // Lüks Sedan
  { slugs: ['audi-a4', 'bmw-3-serisi', 'mercedes-c-serisi', 'mercedes-c-class'], cat: CAT.luks_sedan },
  // Orta Sınıf Sedan
  { slugs: ['kia-k4', 'hyundai-elantra'], cat: CAT.orta_sinif_sedan },
  // Hibrit Sedan
  { slugs: ['toyota-corolla-hybrid', 'honda-civic-ehev'], cat: CAT.hibrit_sedan },
  // Elektrikli Hatchback
  { slugs: ['fiat-500e', 'mini-cooper-electric', 'renault-megane-e-tech', 'volkswagen-golf-etsi', 'renault-clio-e-tech'], cat: CAT.elektrikli_hatchback },
  // Hibrit Hatchback
  { slugs: ['hyundai-i20-hybrid', 'toyota-yaris-hybrid'], cat: CAT.hibrit_hatchback },
  // Kompakt Hatchback
  { slugs: ['peugeot-308', 'opel-astra'], cat: CAT.kompakt_hatchback },
  // Hibrit Crossover
  { slugs: ['honda-hrv-ehev', 'toyota-corolla-cross-hybrid', 'toyota-corolla-cross'], cat: CAT.hibrit_crossover },
];

async function run() {
  // First, get all car products to see actual slugs
  const { data: allProducts, error: fetchErr } = await supabase
    .from('products')
    .select('id, slug, name, category_id')
    .order('slug');

  if (fetchErr) {
    console.error('Fetch error:', fetchErr.message);
    process.exit(1);
  }

  // Filter to car products (those with arac/araba in slug or in specific categories)
  const carSlugs = allProducts.filter(p =>
    p.slug.includes('-hybrid') ||
    p.slug.includes('-electric') ||
    p.slug.includes('-ehev') ||
    p.slug.includes('-etsi') ||
    p.slug.includes('-recharge') ||
    p.slug.includes('model-y') ||
    p.slug.includes('atto-3') ||
    p.slug.includes('mg-mg') ||
    p.slug.includes('e-2008') ||
    p.slug.includes('byd-ev') ||
    p.slug.includes('id4') ||
    p.slug.includes('kona') ||
    p.slug.includes('kia-ev') ||
    p.slug.includes('tiguan') ||
    p.slug.includes('audi-a4') ||
    p.slug.includes('bmw-3') ||
    p.slug.includes('mercedes-c') ||
    p.slug.includes('kia-k4') ||
    p.slug.includes('elantra') ||
    p.slug.includes('fiat-500e') ||
    p.slug.includes('mini-cooper') ||
    p.slug.includes('megane') ||
    p.slug.includes('golf') ||
    p.slug.includes('clio') ||
    p.slug.includes('308') ||
    p.slug.includes('astra') ||
    p.slug.includes('hrv') ||
    p.slug.includes('corolla-cross') ||
    p.slug.includes('rav4') ||
    p.slug.includes('sportage') ||
    p.slug.includes('tucson')
  );

  console.log(`\nBulunan araç ürünleri (${carSlugs.length}):`);
  for (const p of carSlugs) {
    console.log(`  ${p.slug} → mevcut kategori: ${p.category_id}`);
  }

  // Build slug → category map with partial matching
  let updateCount = 0;
  let skipCount = 0;

  for (const { slugs, cat } of ASSIGNMENTS) {
    for (const slugPattern of slugs) {
      const matches = allProducts.filter(p => p.slug.includes(slugPattern));
      for (const product of matches) {
        if (product.category_id === cat) {
          console.log(`  SKIP (already correct): ${product.slug}`);
          skipCount++;
          continue;
        }
        const { error } = await supabase
          .from('products')
          .update({ category_id: cat })
          .eq('id', product.id);

        if (error) {
          console.error(`  HATA: ${product.slug} → ${error.message}`);
        } else {
          console.log(`  ✓ ${product.slug} → ${cat}`);
          updateCount++;
        }
      }
    }
  }

  console.log(`\nTamamlandı: ${updateCount} güncellendi, ${skipCount} zaten doğruydu.`);
}

run().catch(console.error);
