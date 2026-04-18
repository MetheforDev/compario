import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = readFileSync(resolve(__dirname, '../apps/web/.env.local'), 'utf-8');
const getEnv = k => env.match(new RegExp('^' + k + '=(.+)$', 'm'))?.[1]?.trim();
const supabase = createClient(getEnv('NEXT_PUBLIC_SUPABASE_URL'), getEnv('SUPABASE_SERVICE_KEY'));

const { data: cats } = await supabase
  .from('categories')
  .select('id,slug')
  .in('slug', ['android-telefonlar', 'kompakt-crossover', 'benzinli-suv', 'hibrit-suv']);

const catMap = Object.fromEntries(cats.map(c => [c.slug, c.id]));
console.log('Kategoriler:', catMap);

const PRODUCTS = [
  // ── Samsung Galaxy S25 Serisi ──────────────────────────────────────────────
  {
    name: 'Galaxy S25',
    slug: 'samsung-galaxy-s25',
    brand: 'Samsung', model: 'Galaxy S25', model_year: 2025,
    category_id: catMap['android-telefonlar'],
    price_min: 44999, price_max: 59999,
    short_description: 'Snapdragon 8 Elite, Galaxy AI ve kompakt 6.2 inç ekranla Samsung amiral gemi.',
    specs: {
      'İşlemci': 'Snapdragon 8 Elite for Galaxy',
      'Ekran': '6.2 inç Dynamic AMOLED 2X, 2340×1080, 120Hz, 2600 nit',
      'Arka Kamera': '50MP Main + 12MP Ultra Wide + 10MP 3x Teleskopos',
      'Ön Kamera': '12MP',
      'RAM': '12 GB',
      'Batarya': '4000 mAh, 25W',
      'Su Geçirmezlik': 'IP68',
      'Bağlantı': '5G, Wi-Fi 7, Bluetooth 5.4, USB-C (3.2)',
      'İşletim Sistemi': 'Android 15, One UI 7',
      'Depolama Seçenekleri': [
        { 'Kapasite': '128 GB', 'Fiyat': '44.999 ₺' },
        { 'Kapasite': '256 GB', 'Fiyat': '49.999 ₺' },
        { 'Kapasite': '512 GB', 'Fiyat': '59.999 ₺' },
      ],
      'Renk Seçenekleri': 'Icyblue, Mint, Navy, Silver Shadow',
    },
  },
  {
    name: 'Galaxy S25+',
    slug: 'samsung-galaxy-s25-plus',
    brand: 'Samsung', model: 'Galaxy S25+', model_year: 2025,
    category_id: catMap['android-telefonlar'],
    price_min: 54999, price_max: 69999,
    short_description: '6.7 inç büyük ekran ve 4900 mAh batarya ile Galaxy S25 Plus.',
    specs: {
      'İşlemci': 'Snapdragon 8 Elite for Galaxy',
      'Ekran': '6.7 inç Dynamic AMOLED 2X, 3088×1440, 120Hz, 2600 nit',
      'Arka Kamera': '50MP Main + 12MP Ultra Wide + 10MP 3x Teleskopos',
      'Ön Kamera': '12MP',
      'RAM': '12 GB',
      'Batarya': '4900 mAh, 45W',
      'Su Geçirmezlik': 'IP68',
      'Bağlantı': '5G, Wi-Fi 7, Bluetooth 5.4, USB-C (3.2)',
      'İşletim Sistemi': 'Android 15, One UI 7',
      'Depolama Seçenekleri': [
        { 'Kapasite': '256 GB', 'Fiyat': '54.999 ₺' },
        { 'Kapasite': '512 GB', 'Fiyat': '69.999 ₺' },
      ],
      'Renk Seçenekleri': 'Icyblue, Mint, Navy, Silver Shadow',
    },
  },
  {
    name: 'Galaxy S25 Ultra',
    slug: 'samsung-galaxy-s25-ultra',
    brand: 'Samsung', model: 'Galaxy S25 Ultra', model_year: 2025,
    category_id: catMap['android-telefonlar'],
    price_min: 74999, price_max: 104999,
    short_description: 'S Pen, 200MP kamera ve titanyum gövde ile en güçlü Galaxy.',
    specs: {
      'İşlemci': 'Snapdragon 8 Elite for Galaxy',
      'Ekran': '6.9 inç Dynamic AMOLED 2X, 3088×1440, 120Hz, 2600 nit',
      'Arka Kamera': '200MP Main + 50MP Ultra Wide + 10MP 3x + 50MP 5x Teleskopos',
      'Ön Kamera': '12MP',
      'RAM': '12 GB',
      'Batarya': '5000 mAh, 45W',
      'Su Geçirmezlik': 'IP68',
      'Bağlantı': '5G, Wi-Fi 7, Bluetooth 5.4, USB-C (3.2)',
      'Malzeme': 'Titanyum çerçeve',
      'S Pen': 'Dahili S Pen',
      'İşletim Sistemi': 'Android 15, One UI 7',
      'Depolama Seçenekleri': [
        { 'Kapasite': '256 GB', 'Fiyat': '74.999 ₺' },
        { 'Kapasite': '512 GB', 'Fiyat': '87.999 ₺' },
        { 'Kapasite': '1 TB',   'Fiyat': '104.999 ₺' },
      ],
      'Renk Seçenekleri': 'Titanium Silverblue, Titanium Black, Titanium Whitesilver, Titanium Gray',
    },
  },
  {
    name: 'Galaxy S24 FE',
    slug: 'samsung-galaxy-s24-fe',
    brand: 'Samsung', model: 'Galaxy S24 FE', model_year: 2024,
    category_id: catMap['android-telefonlar'],
    price_min: 27999, price_max: 34999,
    short_description: 'Fan Edition: Galaxy AI özelliklerini uygun fiyata sunan amiral gemi deneyimi.',
    specs: {
      'İşlemci': 'Exynos 2500',
      'Ekran': '6.7 inç Dynamic AMOLED 2X, 2340×1080, 120Hz',
      'Arka Kamera': '50MP Main + 8MP Ultra Wide + 10MP 3x Teleskopos',
      'Ön Kamera': '10MP',
      'RAM': '8 GB',
      'Batarya': '4700 mAh, 25W',
      'Su Geçirmezlik': 'IP68',
      'Bağlantı': '5G, Wi-Fi 6, Bluetooth 5.3, USB-C',
      'İşletim Sistemi': 'Android 14, One UI 6.1',
      'Depolama Seçenekleri': [
        { 'Kapasite': '128 GB', 'Fiyat': '27.999 ₺' },
        { 'Kapasite': '256 GB', 'Fiyat': '34.999 ₺' },
      ],
      'Renk Seçenekleri': 'Blue, Graphite, Gray, Mint, Yellow',
    },
  },
  {
    name: 'Pixel 9',
    slug: 'google-pixel-9',
    brand: 'Google', model: 'Pixel 9', model_year: 2024,
    category_id: catMap['android-telefonlar'],
    price_min: 38999, price_max: 49999,
    short_description: 'Google Tensor G4 çip, Gemini AI entegrasyonu ve saf Android deneyimi.',
    specs: {
      'İşlemci': 'Google Tensor G4',
      'Ekran': '6.3 inç Actua OLED, 2424×1080, 120Hz, 2700 nit',
      'Arka Kamera': '50MP Main + 48MP Ultra Wide',
      'Ön Kamera': '10.5MP',
      'RAM': '12 GB',
      'Batarya': '4700 mAh, 27W',
      'Su Geçirmezlik': 'IP68',
      'Bağlantı': '5G, Wi-Fi 7, Bluetooth 5.3, USB-C (3.2)',
      'İşletim Sistemi': 'Android 14 → Android 15',
      'Depolama Seçenekleri': [
        { 'Kapasite': '128 GB', 'Fiyat': '38.999 ₺' },
        { 'Kapasite': '256 GB', 'Fiyat': '44.999 ₺' },
        { 'Kapasite': '512 GB', 'Fiyat': '49.999 ₺' },
      ],
      'Renk Seçenekleri': 'Obsidian, Porcelain, Wintergreen, Peony',
    },
  },
  {
    name: 'Xiaomi 15',
    slug: 'xiaomi-15',
    brand: 'Xiaomi', model: 'Xiaomi 15', model_year: 2025,
    category_id: catMap['android-telefonlar'],
    price_min: 34999, price_max: 44999,
    short_description: 'Snapdragon 8 Elite, Leica kamera ve 90W hızlı şarj ile Xiaomi 15.',
    specs: {
      'İşlemci': 'Snapdragon 8 Elite',
      'Ekran': '6.36 inç OLED, 2670×1200, 120Hz, 3200 nit',
      'Arka Kamera': '50MP Leica Summilux Main + 50MP Ultra Wide + 50MP 5x Teleskopos',
      'Ön Kamera': '32MP',
      'RAM': '12 GB',
      'Batarya': '5240 mAh, 90W kablolu, 50W kablosuz',
      'Su Geçirmezlik': 'IP68',
      'Bağlantı': '5G, Wi-Fi 7, Bluetooth 5.4, USB-C (3.2)',
      'İşletim Sistemi': 'Android 15, HyperOS 2',
      'Depolama Seçenekleri': [
        { 'Kapasite': '256 GB', 'Fiyat': '34.999 ₺' },
        { 'Kapasite': '512 GB', 'Fiyat': '44.999 ₺' },
      ],
      'Renk Seçenekleri': 'White, Black, Mavi',
    },
  },

  // ── Kompakt Crossover ─────────────────────────────────────────────────────
  {
    name: 'Corolla Cross',
    slug: 'toyota-corolla-cross',
    brand: 'Toyota', model: 'Corolla Cross', model_year: 2024,
    category_id: catMap['kompakt-crossover'],
    price_min: 1650000, price_max: 2100000,
    short_description: 'Toyota\'nın en popüler kompakt crossover\'ı — hibrit seçeneğiyle yakıt verimliliği lideri.',
    specs: {
      'Motor Seçenekleri': [
        { 'Versiyon': 'Flame',       'Motor': '1.8 Hibrit 122 HP', 'Fiyat': '1.650.000 ₺' },
        { 'Versiyon': 'Flame X',     'Motor': '1.8 Hibrit 122 HP', 'Fiyat': '1.820.000 ₺' },
        { 'Versiyon': 'Flame X AWD', 'Motor': '2.0 Hibrit 197 HP', 'Fiyat': '2.100.000 ₺' },
      ],
      'Vites': 'e-CVT (otomatik)',
      'Sürüş': 'Ön çeker / AWD',
      'Uzunluk': '4460 mm',
      'Bagaj': '440 litre',
      'Yakıt Tüketimi': '5.0 lt/100km (hibrit)',
      'Güvenlik': 'Toyota Safety Sense 2.0',
      'Ekran': '10.5 inç dokunmatik',
    },
  },
  {
    name: 'Qashqai',
    slug: 'nissan-qashqai',
    brand: 'Nissan', model: 'Qashqai', model_year: 2024,
    category_id: catMap['kompakt-crossover'],
    price_min: 1750000, price_max: 2250000,
    short_description: 'Avrupa\'nın en çok satan kompakt SUV\'u — e-Power hibrit teknolojisiyle.',
    specs: {
      'Motor Seçenekleri': [
        { 'Versiyon': 'Acenta',   'Motor': '1.3 DIG-T MHEV 140 HP', 'Fiyat': '1.750.000 ₺' },
        { 'Versiyon': 'Tekna',    'Motor': '1.3 DIG-T MHEV 158 HP', 'Fiyat': '1.980.000 ₺' },
        { 'Versiyon': 'e-Power',  'Motor': '1.5 e-Power 190 HP',     'Fiyat': '2.250.000 ₺' },
      ],
      'Vites': '7 ileri çift kavramalı (DCT) / e-CVT',
      'Sürüş': 'Ön çeker / e-4ORCE',
      'Uzunluk': '4425 mm',
      'Bagaj': '436 litre',
      'Yakıt Tüketimi': '5.8 lt/100km',
      'Güvenlik': 'ProPilot, Nissan Safety Shield',
      'Ekran': '12.3 inç NissanConnect',
    },
  },
  {
    name: 'Tucson',
    slug: 'hyundai-tucson',
    brand: 'Hyundai', model: 'Tucson', model_year: 2024,
    category_id: catMap['kompakt-crossover'],
    price_min: 1890000, price_max: 2450000,
    short_description: 'Keskin tasarımı ve hibrit seçenekleriyle Hyundai Tucson, kompakt SUV segmentinin güçlü oyuncusu.',
    specs: {
      'Motor Seçenekleri': [
        { 'Versiyon': 'Style',       'Motor': '1.6 T-GDI 150 HP',        'Fiyat': '1.890.000 ₺' },
        { 'Versiyon': 'Style HEV',   'Motor': '1.6 T-GDI HEV 230 HP',    'Fiyat': '2.150.000 ₺' },
        { 'Versiyon': 'Elite PHEV',  'Motor': '1.6 T-GDI PHEV 265 HP',   'Fiyat': '2.450.000 ₺' },
      ],
      'Vites': '7 ileri çift kavramalı (DCT) / 6 ileri otomatik',
      'Sürüş': 'Ön çeker / HTRAC AWD',
      'Uzunluk': '4500 mm',
      'Bagaj': '539 litre',
      'Yakıt Tüketimi': '6.4 lt/100km',
      'Güvenlik': 'SmartSense, Highway Driving Assist',
      'Ekran': '10.25 inç AVN',
    },
  },
  {
    name: 'Kuga',
    slug: 'ford-kuga',
    brand: 'Ford', model: 'Kuga', model_year: 2024,
    category_id: catMap['kompakt-crossover'],
    price_min: 1820000, price_max: 2380000,
    short_description: 'Plug-in hibrit seçeneğiyle Kuga, iş ve aile kullanımına uygun pratik crossover.',
    specs: {
      'Motor Seçenekleri': [
        { 'Versiyon': 'Titanium',       'Motor': '1.5 EcoBoost 150 HP',   'Fiyat': '1.820.000 ₺' },
        { 'Versiyon': 'ST-Line',        'Motor': '2.5 Duratec PHEV 225 HP', 'Fiyat': '2.180.000 ₺' },
        { 'Versiyon': 'ST-Line AWD',    'Motor': '2.5 Duratec PHEV 225 HP', 'Fiyat': '2.380.000 ₺' },
      ],
      'Vites': '8 ileri otomatik / e-CVT',
      'Sürüş': 'Ön çeker / AWD',
      'Uzunluk': '4629 mm',
      'Bagaj': '411 litre (PHEV) / 536 litre',
      'Yakıt Tüketimi': '1.5 lt/100km (PHEV, elektrik sonrası)',
      'Güvenlik': 'Ford Co-Pilot 360, Pre-Collision Assist',
      'Ekran': '13.2 inç SYNC 4',
    },
  },
  {
    name: 'Sportage',
    slug: 'kia-sportage',
    brand: 'Kia', model: 'Sportage', model_year: 2024,
    category_id: catMap['kompakt-crossover'],
    price_min: 1780000, price_max: 2290000,
    short_description: 'Panoramik ekran tasarımı ve geniş iç mekanıyla Kia Sportage, kompakt SUV standardını yeniden belirliyor.',
    specs: {
      'Motor Seçenekleri': [
        { 'Versiyon': 'Concept',     'Motor': '1.6 T-GDI 150 HP',       'Fiyat': '1.780.000 ₺' },
        { 'Versiyon': 'Prestige HEV','Motor': '1.6 T-GDI HEV 230 HP',   'Fiyat': '2.050.000 ₺' },
        { 'Versiyon': 'GT Line PHEV','Motor': '1.6 T-GDI PHEV 265 HP',  'Fiyat': '2.290.000 ₺' },
      ],
      'Vites': '7 ileri DCT / 6 ileri otomatik',
      'Sürüş': 'Ön çeker / AWD',
      'Uzunluk': '4515 mm',
      'Bagaj': '543 litre',
      'Yakıt Tüketimi': '6.2 lt/100km',
      'Güvenlik': 'DriveWise ADAS, Lane Keeping Assist',
      'Ekran': '12.3 inç + 12.3 inç Panoramik Çift Ekran',
    },
  },
  {
    name: 'Kadjar',
    slug: 'renault-kadjar',
    brand: 'Renault', model: 'Kadjar', model_year: 2023,
    category_id: catMap['kompakt-crossover'],
    price_min: 1490000, price_max: 1890000,
    short_description: 'Fransız tasarımı ve uygun fiyatıyla Kadjar, kompakt crossover\'da değer teklifi sunan seçenek.',
    specs: {
      'Motor Seçenekleri': [
        { 'Versiyon': 'Touch',    'Motor': '1.3 TCe 140 HP', 'Fiyat': '1.490.000 ₺' },
        { 'Versiyon': 'Executive','Motor': '1.3 TCe 160 HP', 'Fiyat': '1.890.000 ₺' },
      ],
      'Vites': '6 ileri manuel / 7 ileri EDC',
      'Sürüş': 'Ön çeker / AWD',
      'Uzunluk': '4450 mm',
      'Bagaj': '472 litre',
      'Yakıt Tüketimi': '6.8 lt/100km',
      'Güvenlik': 'Emergency Brake Assist, Lane Departure',
      'Ekran': '9.3 inç Easy Link',
    },
  },
];

console.log(`\n${PRODUCTS.length} ürün yüklenecek...\n`);

let ok = 0, fail = 0;
for (const p of PRODUCTS) {
  if (!p.category_id) {
    console.error(`✗ ${p.name}: kategori ID yok`);
    fail++;
    continue;
  }
  const { error } = await supabase.from('products').upsert(
    { ...p, status: 'active', is_featured: false },
    { onConflict: 'slug' }
  );
  if (error) {
    console.error(`✗ ${p.name}:`, error.message);
    fail++;
  } else {
    console.log(`✓ ${p.name}`);
    ok++;
  }
}

console.log(`\nTamamlandı: ${ok} başarılı, ${fail} hatalı`);
