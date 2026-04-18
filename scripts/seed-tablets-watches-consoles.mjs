import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = readFileSync(resolve(__dirname, '../apps/web/.env.local'), 'utf-8');
const getEnv = k => env.match(new RegExp('^' + k + '=(.+)$', 'm'))?.[1]?.trim();
const supabase = createClient(getEnv('NEXT_PUBLIC_SUPABASE_URL'), getEnv('SUPABASE_SERVICE_KEY'));

// ── 1. Create categories ──────────────────────────────────────────────────────

const NEW_CATEGORIES = [
  // Root
  { name: 'Tabletler',     slug: 'tabletler',     parent: null },
  { name: 'Akıllı Saatler', slug: 'akilli-saatler', parent: null },
  { name: 'Oyun Konsolları', slug: 'oyun-konsollari', parent: null },

  // Tablet children
  { name: 'iPad',          slug: 'ipad',          parent: 'tabletler' },
  { name: 'Android Tablet', slug: 'android-tablet', parent: 'tabletler' },
  { name: 'Windows Tablet', slug: 'windows-tablet', parent: 'tabletler' },

  // Watch children
  { name: 'Apple Watch',   slug: 'apple-watch',   parent: 'akilli-saatler' },
  { name: 'Samsung Galaxy Watch', slug: 'samsung-galaxy-watch', parent: 'akilli-saatler' },
  { name: 'Garmin',        slug: 'garmin',        parent: 'akilli-saatler' },
  { name: 'Xiaomi / Huawei Bant', slug: 'xiaomi-huawei-bant', parent: 'akilli-saatler' },

  // Console children
  { name: 'PlayStation',   slug: 'playstation',   parent: 'oyun-konsollari' },
  { name: 'Xbox',          slug: 'xbox',          parent: 'oyun-konsollari' },
  { name: 'Nintendo',      slug: 'nintendo',      parent: 'oyun-konsollari' },
];

async function upsertCategories() {
  const slugToId = {};

  // First pass: roots
  for (const cat of NEW_CATEGORIES.filter(c => !c.parent)) {
    const { data, error } = await supabase
      .from('categories')
      .upsert({ name: cat.name, slug: cat.slug, parent_id: null }, { onConflict: 'slug' })
      .select('id, slug')
      .single();
    if (error) { console.error(`Cat upsert error ${cat.slug}:`, error.message); continue; }
    slugToId[cat.slug] = data.id;
    console.log(`  ✓ ${cat.name} (${data.id})`);
  }

  // Second pass: children
  for (const cat of NEW_CATEGORIES.filter(c => c.parent)) {
    const parentId = slugToId[cat.parent];
    if (!parentId) { console.error(`Parent not found: ${cat.parent}`); continue; }
    const { data, error } = await supabase
      .from('categories')
      .upsert({ name: cat.name, slug: cat.slug, parent_id: parentId }, { onConflict: 'slug' })
      .select('id, slug')
      .single();
    if (error) { console.error(`Cat upsert error ${cat.slug}:`, error.message); continue; }
    slugToId[cat.slug] = data.id;
    console.log(`    ✓ ${cat.name} (${data.id})`);
  }

  return slugToId;
}

// ── 2. Products ───────────────────────────────────────────────────────────────

function makeProduct(overrides) {
  return {
    status: 'active',
    is_featured: false,
    view_count: 0,
    ...overrides,
  };
}

function getProducts(slugToId) {
  return [
    // ── iPads ────────────────────────────────────────────────────────────────
    makeProduct({
      slug: 'apple-ipad-air-m2-2024', name: 'iPad Air M2', brand: 'Apple',
      category_id: slugToId['ipad'],
      price_min: 28999, price_max: 42999,
      description: 'M2 çipli, 11" ve 13" seçenekli iPad Air. Öğrenci ve profesyoneller için ideal.',
      specs: { ekran: '11" / 13" Liquid Retina', islemci: 'Apple M2', ram: '8 GB', depolama: ['128 GB', '256 GB', '512 GB', '1 TB'], kamera: '12 MP', pil: '28.65 Wh (11"), 36.59 Wh (13")', renk: ['Uzay Grisi', 'Yıldız Işığı', 'Mavi', 'Mor'] },
    }),
    makeProduct({
      slug: 'apple-ipad-pro-m4-2024', name: 'iPad Pro M4', brand: 'Apple',
      category_id: slugToId['ipad'],
      price_min: 44999, price_max: 89999,
      description: 'Devrim niteliğinde ince tasarım, M4 çip ve Ultra Retina XDR OLED ekran.',
      specs: { ekran: '11" / 13" Ultra Retina XDR OLED', islemci: 'Apple M4', ram: '8 / 16 GB', depolama: ['256 GB', '512 GB', '1 TB', '2 TB'], kamera: '12 MP + LiDAR', pil: '38.99 Wh (11"), 38.99 Wh (13")', kalinlik: '5.1 mm' },
    }),
    makeProduct({
      slug: 'apple-ipad-10-nesil-2022', name: 'iPad 10. Nesil', brand: 'Apple',
      category_id: slugToId['ipad'],
      price_min: 17999, price_max: 22999,
      description: 'Yenilenen tasarım, A14 Bionic ve USB-C. Giriş seviyesi en iyisi.',
      specs: { ekran: '10.9" Liquid Retina', islemci: 'Apple A14 Bionic', depolama: ['64 GB', '256 GB'], kamera: '12 MP', renk: ['Mavi', 'Pembe', 'Sarı', 'Gümüş'] },
    }),

    // ── Android Tablets ───────────────────────────────────────────────────────
    makeProduct({
      slug: 'samsung-galaxy-tab-s10-plus', name: 'Galaxy Tab S10+', brand: 'Samsung',
      category_id: slugToId['android-tablet'],
      price_min: 32999, price_max: 44999,
      description: '12.4" Dynamic AMOLED ekran, Snapdragon 8 Gen 3, S Pen dahil.',
      specs: { ekran: '12.4" Dynamic AMOLED 2X 120Hz', islemci: 'Snapdragon 8 Gen 3', ram: '12 GB', depolama: ['256 GB', '512 GB'], pil: '10090 mAh', sparePen: true, '5g': true },
    }),
    makeProduct({
      slug: 'samsung-galaxy-tab-s9-fe', name: 'Galaxy Tab S9 FE', brand: 'Samsung',
      category_id: slugToId['android-tablet'],
      price_min: 14999, price_max: 19999,
      description: 'Uygun fiyatlı Galaxy Tab deneyimi, IP68 su direnci ve S Pen.',
      specs: { ekran: '10.9" TFT LCD 90Hz', islemci: 'Exynos 1380', ram: '6 GB', depolama: ['128 GB', '256 GB'], pil: '8000 mAh', ip: 'IP68', sparePen: true },
    }),
    makeProduct({
      slug: 'xiaomi-pad-6s-pro', name: 'Pad 6S Pro', brand: 'Xiaomi',
      category_id: slugToId['android-tablet'],
      price_min: 18999, price_max: 26999,
      description: '144Hz 3K ekran, Snapdragon 8 Gen 2 ve 67W hızlı şarj.',
      specs: { ekran: '12.4" 3K 144Hz', islemci: 'Snapdragon 8 Gen 2', ram: ['8 GB', '12 GB'], depolama: ['256 GB', '512 GB'], pil: '10000 mAh', sarj: '67W' },
    }),
    makeProduct({
      slug: 'lenovo-tab-p12-pro', name: 'Tab P12 Pro', brand: 'Lenovo',
      category_id: slugToId['android-tablet'],
      price_min: 21999, price_max: 28999,
      description: '12.6" AMOLED 2K, Snapdragon 870, iş ve eğlence için.',
      specs: { ekran: '12.6" AMOLED 2K 120Hz', islemci: 'Snapdragon 870', ram: '8 GB', depolama: '256 GB', pil: '10200 mAh', aksesuar: 'Keyboard Pack dahil' },
    }),

    // ── Windows Tablets ───────────────────────────────────────────────────────
    makeProduct({
      slug: 'microsoft-surface-pro-11', name: 'Surface Pro 11', brand: 'Microsoft',
      category_id: slugToId['windows-tablet'],
      price_min: 45999, price_max: 79999,
      description: 'Copilot+ PC, Snapdragon X Elite işlemci, OLED ekran seçeneği.',
      specs: { ekran: '13" PixelSense 120Hz', islemci: ['Snapdragon X Plus', 'Snapdragon X Elite'], ram: ['16 GB', '32 GB', '64 GB'], depolama: ['256 GB', '512 GB', '1 TB'], pil: '50 Wh', os: 'Windows 11' },
    }),

    // ── Apple Watch ───────────────────────────────────────────────────────────
    makeProduct({
      slug: 'apple-watch-series-10', name: 'Watch Series 10', brand: 'Apple',
      category_id: slugToId['apple-watch'],
      price_min: 16999, price_max: 24999,
      description: 'En ince Apple Watch, geniş ekran, uyku apnesi tespiti.',
      specs: { ekran: '42mm / 46mm LTPO OLED', islemci: 'S10', pil: '18 saat', saglik: ['Kalp ritmi', 'ECG', 'SpO2', 'Uyku apnesi'], su_direnci: '50m', malzeme: ['Alüminyum', 'Titanyum'] },
    }),
    makeProduct({
      slug: 'apple-watch-ultra-2', name: 'Watch Ultra 2', brand: 'Apple',
      category_id: slugToId['apple-watch'],
      price_min: 34999, price_max: 38999,
      description: 'Titanium kasa, 60 saate kadar pil, çift frekans GPS, dalış sertifikası.',
      specs: { ekran: '49mm Always-On Retina', islemci: 'S9', pil: '60 saat', su_direnci: '100m EN 13319', malzeme: 'Titanyum', gps: 'Çift frekans L1+L5' },
    }),
    makeProduct({
      slug: 'apple-watch-se-2', name: 'Watch SE 2. Nesil', brand: 'Apple',
      category_id: slugToId['apple-watch'],
      price_min: 10999, price_max: 13999,
      description: 'Uygun fiyatlı Apple Watch, S8 çip ve çarpma algılama.',
      specs: { ekran: '40mm / 44mm OLED', islemci: 'S8', pil: '18 saat', saglik: ['Kalp ritmi', 'SpO2'], su_direnci: '50m' },
    }),

    // ── Samsung Galaxy Watch ───────────────────────────────────────────────────
    makeProduct({
      slug: 'samsung-galaxy-watch-7', name: 'Galaxy Watch 7', brand: 'Samsung',
      category_id: slugToId['samsung-galaxy-watch'],
      price_min: 12999, price_max: 18999,
      description: 'Exynos W1000, kan şekeri analizi, 3 gün pil.',
      specs: { ekran: '40mm / 44mm AMOLED', islemci: 'Exynos W1000', pil: '300 mAh / 425 mAh', saglik: ['EKG', 'SpO2', 'Vücut yağ oranı', 'Kan şekeri analizi'], os: 'Wear OS 5' },
    }),
    makeProduct({
      slug: 'samsung-galaxy-watch-ultra', name: 'Galaxy Watch Ultra', brand: 'Samsung',
      category_id: slugToId['samsung-galaxy-watch'],
      price_min: 24999, price_max: 28999,
      description: 'Premium titanyum kasa, çift frekans GPS, 60 saat enerji tasarruf modu.',
      specs: { ekran: '47mm AMOLED', islemci: 'Exynos W1000', pil: '590 mAh', malzeme: 'Titanyum', su_direnci: '10 ATM' },
    }),

    // ── Garmin ────────────────────────────────────────────────────────────────
    makeProduct({
      slug: 'garmin-fenix-8', name: 'fēnix 8', brand: 'Garmin',
      category_id: slugToId['garmin'],
      price_min: 38999, price_max: 54999,
      description: 'Sapphire cam, 16 gün pil, dalış modu, multiband GPS.',
      specs: { ekran: '47mm / 51mm AMOLED', pil: '16 gün', su_direnci: '100m', gps: 'Multiband', sensörler: ['Nabız', 'SpO2', 'Barometre', 'Pusula', 'Termometre'] },
    }),
    makeProduct({
      slug: 'garmin-forerunner-265', name: 'Forerunner 265', brand: 'Garmin',
      category_id: slugToId['garmin'],
      price_min: 19999, price_max: 23999,
      description: 'Koşucu saati, AMOLED ekran, 13 gün pil, Training Readiness.',
      specs: { ekran: '42mm / 46mm AMOLED', pil: '13 gün', su_direnci: '50m', gps: 'Multiband', hedef: 'Koşu & Triatlon' },
    }),

    // ── Xiaomi / Huawei Bant ──────────────────────────────────────────────────
    makeProduct({
      slug: 'xiaomi-smart-band-9', name: 'Smart Band 9', brand: 'Xiaomi',
      category_id: slugToId['xiaomi-huawei-bant'],
      price_min: 1299, price_max: 1799,
      description: '21 gün pil, 1.62" AMOLED, 150+ spor modu.',
      specs: { ekran: '1.62" AMOLED 192x490', pil: '21 gün', saglik: ['Nabız', 'SpO2', 'Stres'], su_direnci: '5 ATM', sporModu: 150 },
    }),
    makeProduct({
      slug: 'huawei-band-9', name: 'Band 9', brand: 'Huawei',
      category_id: slugToId['xiaomi-huawei-bant'],
      price_min: 1499, price_max: 1999,
      description: '14 gün pil, ince tasarım, uyku takibi, AMOLED ekran.',
      specs: { ekran: '1.47" AMOLED', pil: '14 gün', saglik: ['Nabız', 'SpO2', 'Uyku'], su_direnci: '5 ATM' },
    }),

    // ── PlayStation ────────────────────────────────────────────────────────────
    makeProduct({
      slug: 'sony-playstation-5-slim', name: 'PlayStation 5 Slim', brand: 'Sony',
      category_id: slugToId['playstation'],
      price_min: 24999, price_max: 29999,
      description: '30% daha küçük PS5, 1 TB depolama, disc / dijital seçeneği.',
      specs: { islemci: 'AMD Zen 2 8 çekirdek 3.5 GHz', gpu: 'AMD RDNA 2 10.28 TFLOPS', ram: '16 GB GDDR6', depolama: '1 TB NVMe SSD', cozunurluk: '4K 120Hz', optik: ['Disc', 'Digital'] },
    }),
    makeProduct({
      slug: 'sony-playstation-5-pro', name: 'PlayStation 5 Pro', brand: 'Sony',
      category_id: slugToId['playstation'],
      price_min: 38999, price_max: 42999,
      description: 'Gelişmiş GPU, PlayStation Spectral Super Resolution, 4K/60fps garantisi.',
      specs: { islemci: 'AMD Zen 2 8 çekirdek 3.85 GHz', gpu: 'AMD RDNA 3 33.5 TFLOPS', ram: '16 GB GDDR6', depolama: '2 TB NVMe SSD', cozunurluk: '4K 120Hz', pssr: true },
    }),

    // ── Xbox ───────────────────────────────────────────────────────────────────
    makeProduct({
      slug: 'microsoft-xbox-series-x', name: 'Xbox Series X', brand: 'Microsoft',
      category_id: slugToId['xbox'],
      price_min: 22999, price_max: 25999,
      description: '12 teraflop GPU, 4K/120Hz, Quick Resume, Xbox Game Pass uyumlu.',
      specs: { islemci: 'AMD Zen 2 8 çekirdek 3.8 GHz', gpu: 'AMD RDNA 2 12 TFLOPS', ram: '16 GB GDDR6', depolama: '1 TB NVMe SSD', cozunurluk: '4K 120Hz', geriyeDonuk: true },
    }),
    makeProduct({
      slug: 'microsoft-xbox-series-s', name: 'Xbox Series S', brand: 'Microsoft',
      category_id: slugToId['xbox'],
      price_min: 12999, price_max: 14999,
      description: 'En uygun fiyatlı next-gen konsol. 1440p/120Hz, dijital oyun kütüphanesi.',
      specs: { islemci: 'AMD Zen 2 8 çekirdek 3.6 GHz', gpu: 'AMD RDNA 2 4 TFLOPS', ram: '10 GB GDDR6', depolama: '512 GB NVMe SSD', cozunurluk: '1440p 120Hz' },
    }),

    // ── Nintendo ───────────────────────────────────────────────────────────────
    makeProduct({
      slug: 'nintendo-switch-oled', name: 'Switch OLED', brand: 'Nintendo',
      category_id: slugToId['nintendo'],
      price_min: 12999, price_max: 14999,
      description: '7" OLED ekran, 64 GB dahili depolama, TV + taşınabilir mod.',
      specs: { ekran: '7" OLED 720p', islemci: 'Nvidia Tegra X1+', ram: '4 GB', depolama: '64 GB', pil: '4.5-9 saat', mod: ['TV', 'Tabletop', 'Handheld'] },
    }),
    makeProduct({
      slug: 'nintendo-switch-lite', name: 'Switch Lite', brand: 'Nintendo',
      category_id: slugToId['nintendo'],
      price_min: 8999, price_max: 9999,
      description: 'Yalnızca taşınabilir mod, 5.5" LCD, 3-7 saat pil.',
      specs: { ekran: '5.5" LCD 720p', islemci: 'Nvidia Tegra X1', ram: '4 GB', depolama: '32 GB', pil: '3-7 saat', renk: ['Sarı', 'Turkuaz', 'Mercan', 'Gri'] },
    }),
    makeProduct({
      slug: 'nintendo-switch-2', name: 'Switch 2', brand: 'Nintendo',
      category_id: slugToId['nintendo'],
      price_min: 18999, price_max: 19999,
      description: 'Yeni nesil Nintendo Switch, 8" ekran, 4K TV modu, yeni Joy-Con manyetik.',
      specs: { ekran: '8" LCD 1080p', islemci: 'Nvidia Tegra T239', ram: '12 GB LPDDR5', depolama: '256 GB UFS 3.1', cozunurluk: '4K (TV), 1080p (taşınabilir)', pil: '2-6.5 saat' },
    }),
  ];
}

// ── 3. Run ────────────────────────────────────────────────────────────────────

async function run() {
  console.log('\n📂 Kategoriler oluşturuluyor...');
  const slugToId = await upsertCategories();

  console.log('\n📦 Ürünler ekleniyor...');
  const products = getProducts(slugToId);
  let ok = 0, fail = 0;

  for (const product of products) {
    const { error } = await supabase
      .from('products')
      .upsert(product, { onConflict: 'slug' });
    if (error) {
      console.error(`  HATA ${product.slug}: ${error.message}`);
      fail++;
    } else {
      console.log(`  ✓ ${product.brand} ${product.name}`);
      ok++;
    }
  }

  console.log(`\nTamamlandı: ${ok} ürün eklendi, ${fail} hata.`);
}

run().catch(console.error);
