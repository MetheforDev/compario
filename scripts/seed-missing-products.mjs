import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// .env.local dosyasından değerleri oku
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../apps/web/.env.local');
const envVars = Object.fromEntries(
  readFileSync(envPath, 'utf8').split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim()]; })
);

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_KEY
);

const PEXELS_KEY = envVars.PEXELS_API_KEY;

async function fetchPexelsImage(query) {
  try {
    const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`, {
      headers: { Authorization: PEXELS_KEY },
    });
    const data = await res.json();
    return data.photos?.[0]?.src?.large2x ?? null;
  } catch {
    return null;
  }
}

async function upsert(product) {
  const { data: existing } = await supabase.from('products').select('id').eq('slug', product.slug).single();
  if (existing) {
    process.stdout.write(`  ⏭  Mevcut: ${product.name}\n`);
    return;
  }
  const { error } = await supabase.from('products').insert({ ...product, status: 'active' });
  if (error) process.stdout.write(`  ❌ HATA: ${product.name} — ${error.message}\n`);
  else process.stdout.write(`  ✅ Eklendi: ${product.name}\n`);
}

// ─── Category IDs ───────────────────────────────────────────────────────────
const catIphonePro     = '7e095115-e2b7-4e37-9db6-b98aff486c0e'; // iPhone Pro Serisi
const catIphoneStd     = 'd0214446-d99c-4487-8a22-0a37c7fb5846'; // iPhone Standart
const catAndroid       = '1f5d86f3-45fe-4190-a5db-daaf1207e722'; // Android
const catSamsung       = '2cd68380-9608-44ce-957d-9f21396efd8a'; // Samsung
const catXiaomi        = '656d68b1-c77f-49b6-8cd8-6258ec1a7c81'; // Xiaomi
const catPixel         = '46c38ad0-2cba-4e9f-a34a-a9ed42983a25'; // Google Pixel
const catMacBook       = 'f411dda5-12ca-4adc-a7f2-e52ab55d9db0'; // Apple MacBook
const catGamingLaptop  = 'cbdc9dea-4d13-4b94-9f51-20eb9ad21237'; // Gaming Laptop
const catAsusRog       = 'e9e5fe5c-b7b2-4d28-8635-99eed99afa1e'; // ASUS ROG / TUF
const catLenovoLegion  = 'f75a603b-80df-4f7b-b45d-b48591258908'; // Lenovo Legion
const catMsiGaming     = '53a4451f-038c-499f-918c-a03bfa15cc09'; // MSI Gaming
const catUltrabook     = '93f4ba84-a898-4a9d-b462-86c0d87052d9'; // Ultrabook
const catIsLaptop      = '11e8aeff-58cf-4d0d-9417-3cd02b84132b'; // İş & Ofis Laptopu

// ─── iPhone Tüm Modeller ────────────────────────────────────────────────────
console.log('\n📱 iPHONE — TAM LİSTE');
console.log('─'.repeat(50));

const iphoneProducts = [
  {
    category_id: catIphonePro,
    name: 'iPhone 16 Pro',
    slug: 'apple-iphone-16-pro',
    brand: 'Apple', model: 'iPhone 16 Pro', model_year: 2024,
    price_min: 72_999, price_max: 99_999, currency: 'TRY',
    specs: {
      'Depolama Seçenekleri': [
        { 'Kapasite': '128 GB', 'RAM': '8 GB', 'Fiyat': '72.999 ₺' },
        { 'Kapasite': '256 GB', 'RAM': '8 GB', 'Fiyat': '79.999 ₺' },
        { 'Kapasite': '512 GB', 'RAM': '8 GB', 'Fiyat': '89.999 ₺' },
        { 'Kapasite': '1 TB',   'RAM': '8 GB', 'Fiyat': '99.999 ₺' },
      ],
      'Çip': 'Apple A18 Pro (3nm)',
      'Ekran': '6.3" Super Retina XDR OLED, ProMotion 120Hz',
      'Kamera': '48 MP Ana + 12 MP Ultra Geniş + 12 MP 5x Telefoto',
      'Ön Kamera': '12 MP TrueDepth',
      'Batarya': '3.582 mAh, 27W Hızlı Şarj',
      'İşletim Sistemi': 'iOS 18',
    },
    image_url: await fetchPexelsImage('iPhone 16 Pro titanium apple'),
  },
  {
    category_id: catIphoneStd,
    name: 'iPhone 16',
    slug: 'apple-iphone-16',
    brand: 'Apple', model: 'iPhone 16', model_year: 2024,
    price_min: 52_999, price_max: 72_999, currency: 'TRY',
    specs: {
      'Depolama Seçenekleri': [
        { 'Kapasite': '128 GB', 'RAM': '8 GB', 'Fiyat': '52.999 ₺' },
        { 'Kapasite': '256 GB', 'RAM': '8 GB', 'Fiyat': '62.999 ₺' },
        { 'Kapasite': '512 GB', 'RAM': '8 GB', 'Fiyat': '72.999 ₺' },
      ],
      'Çip': 'Apple A18 (3nm)',
      'Ekran': '6.1" Super Retina XDR OLED, 60Hz',
      'Kamera': '48 MP Ana + 12 MP Ultra Geniş',
      'Ön Kamera': '12 MP TrueDepth',
      'Batarya': '3.561 mAh, 25W Hızlı Şarj',
      'İşletim Sistemi': 'iOS 18',
    },
    image_url: await fetchPexelsImage('iPhone 16 apple smartphone'),
  },
  {
    category_id: catIphoneStd,
    name: 'iPhone 16 Plus',
    slug: 'apple-iphone-16-plus',
    brand: 'Apple', model: 'iPhone 16 Plus', model_year: 2024,
    price_min: 62_999, price_max: 82_999, currency: 'TRY',
    specs: {
      'Depolama Seçenekleri': [
        { 'Kapasite': '128 GB', 'RAM': '8 GB', 'Fiyat': '62.999 ₺' },
        { 'Kapasite': '256 GB', 'RAM': '8 GB', 'Fiyat': '72.999 ₺' },
        { 'Kapasite': '512 GB', 'RAM': '8 GB', 'Fiyat': '82.999 ₺' },
      ],
      'Çip': 'Apple A18 (3nm)',
      'Ekran': '6.7" Super Retina XDR OLED, 60Hz',
      'Kamera': '48 MP Ana + 12 MP Ultra Geniş',
      'Ön Kamera': '12 MP TrueDepth',
      'Batarya': '4.674 mAh, 25W Hızlı Şarj',
      'İşletim Sistemi': 'iOS 18',
    },
    image_url: await fetchPexelsImage('iPhone 16 Plus apple large'),
  },
  {
    category_id: catIphoneStd,
    name: 'iPhone 15',
    slug: 'apple-iphone-15',
    brand: 'Apple', model: 'iPhone 15', model_year: 2023,
    price_min: 39_999, price_max: 54_999, currency: 'TRY',
    specs: {
      'Depolama Seçenekleri': [
        { 'Kapasite': '128 GB', 'RAM': '6 GB', 'Fiyat': '39.999 ₺' },
        { 'Kapasite': '256 GB', 'RAM': '6 GB', 'Fiyat': '46.999 ₺' },
        { 'Kapasite': '512 GB', 'RAM': '6 GB', 'Fiyat': '54.999 ₺' },
      ],
      'Çip': 'Apple A16 Bionic (4nm)',
      'Ekran': '6.1" Super Retina XDR OLED, 60Hz',
      'Kamera': '48 MP Ana + 12 MP Ultra Geniş',
      'Batarya': '3.877 mAh',
      'İşletim Sistemi': 'iOS 18',
    },
    image_url: await fetchPexelsImage('iPhone 15 apple pink'),
  },
];

for (const p of iphoneProducts) await upsert(p);

// ─── Samsung Galaxy ─────────────────────────────────────────────────────────
console.log('\n📱 SAMSUNG GALAXY');
console.log('─'.repeat(50));

const samsungProducts = [
  {
    category_id: catSamsung,
    name: 'Galaxy S25',
    slug: 'samsung-galaxy-s25',
    brand: 'Samsung', model: 'Galaxy S25', model_year: 2025,
    price_min: 44_999, price_max: 59_999, currency: 'TRY',
    specs: {
      'Depolama Seçenekleri': [
        { 'Kapasite': '128 GB', 'RAM': '12 GB', 'Fiyat': '44.999 ₺' },
        { 'Kapasite': '256 GB', 'RAM': '12 GB', 'Fiyat': '52.999 ₺' },
        { 'Kapasite': '512 GB', 'RAM': '12 GB', 'Fiyat': '59.999 ₺' },
      ],
      'İşlemci': 'Snapdragon 8 Elite (3nm)',
      'Ekran': '6.2" Dynamic AMOLED 2X, 120Hz',
      'Kamera': '50 MP Ana + 12 MP Ultra Geniş + 10 MP 3x Telefoto',
      'Batarya': '4.000 mAh, 25W Şarj',
      'İşletim Sistemi': 'Android 15 / One UI 7',
    },
    image_url: await fetchPexelsImage('Samsung Galaxy S25 smartphone'),
  },
  {
    category_id: catSamsung,
    name: 'Galaxy Z Fold 6',
    slug: 'samsung-galaxy-z-fold-6',
    brand: 'Samsung', model: 'Galaxy Z Fold 6', model_year: 2024,
    price_min: 99_999, price_max: 124_999, currency: 'TRY',
    specs: {
      'Depolama Seçenekleri': [
        { 'Kapasite': '256 GB', 'RAM': '12 GB', 'Fiyat': '99.999 ₺' },
        { 'Kapasite': '512 GB', 'RAM': '12 GB', 'Fiyat': '124.999 ₺' },
      ],
      'İşlemci': 'Snapdragon 8 Gen 3 (4nm)',
      'İç Ekran': '7.6" Dynamic AMOLED 2X, 120Hz',
      'Dış Ekran': '6.3" Dynamic AMOLED 2X, 120Hz',
      'Kamera': '50 MP Ana + 12 MP Ultra Geniş + 10 MP 5x Telefoto',
      'Batarya': '4.400 mAh',
      'Özellik': 'Katlanabilir / S Pen desteği',
    },
    image_url: await fetchPexelsImage('Samsung Galaxy Z Fold foldable phone'),
  },
  {
    category_id: catSamsung,
    name: 'Galaxy Z Flip 6',
    slug: 'samsung-galaxy-z-flip-6',
    brand: 'Samsung', model: 'Galaxy Z Flip 6', model_year: 2024,
    price_min: 59_999, price_max: 74_999, currency: 'TRY',
    specs: {
      'Depolama Seçenekleri': [
        { 'Kapasite': '256 GB', 'RAM': '12 GB', 'Fiyat': '59.999 ₺' },
        { 'Kapasite': '512 GB', 'RAM': '12 GB', 'Fiyat': '74.999 ₺' },
      ],
      'İşlemci': 'Snapdragon 8 Gen 3 (4nm)',
      'İç Ekran': '6.7" Dynamic AMOLED 2X, 120Hz',
      'Dış Ekran': '3.4" Super AMOLED',
      'Kamera': '50 MP Ana + 12 MP Ultra Geniş',
      'Batarya': '4.000 mAh',
      'Özellik': 'Clamshell katlanabilir',
    },
    image_url: await fetchPexelsImage('Samsung Galaxy Z Flip flip phone'),
  },
];

for (const p of samsungProducts) await upsert(p);

// ─── Xiaomi ─────────────────────────────────────────────────────────────────
console.log('\n📱 XİAOMİ');
console.log('─'.repeat(50));

const xiaomiProducts = [
  {
    category_id: catXiaomi,
    name: 'Xiaomi 15 Pro',
    slug: 'xiaomi-15-pro',
    brand: 'Xiaomi', model: 'Xiaomi 15 Pro', model_year: 2025,
    price_min: 64_999, price_max: 79_999, currency: 'TRY',
    specs: {
      'Depolama Seçenekleri': [
        { 'Kapasite': '256 GB', 'RAM': '12 GB', 'Fiyat': '64.999 ₺' },
        { 'Kapasite': '512 GB', 'RAM': '16 GB', 'Fiyat': '79.999 ₺' },
      ],
      'İşlemci': 'Snapdragon 8 Elite (3nm)',
      'Ekran': '6.73" LTPO AMOLED, 120Hz',
      'Kamera': '50 MP Leica Ana + 50 MP Ultra Geniş + 50 MP 5x Telefoto',
      'Batarya': '6.100 mAh, 90W Şarj',
      'İşletim Sistemi': 'Android 15 / HyperOS 2',
    },
    image_url: await fetchPexelsImage('Xiaomi 15 Pro smartphone camera'),
  },
  {
    category_id: catXiaomi,
    name: 'Redmi Note 14 Pro',
    slug: 'xiaomi-redmi-note-14-pro',
    brand: 'Xiaomi', model: 'Redmi Note 14 Pro', model_year: 2024,
    price_min: 18_999, price_max: 24_999, currency: 'TRY',
    specs: {
      'Depolama Seçenekleri': [
        { 'Kapasite': '128 GB', 'RAM': '8 GB',  'Fiyat': '18.999 ₺' },
        { 'Kapasite': '256 GB', 'RAM': '12 GB', 'Fiyat': '24.999 ₺' },
      ],
      'İşlemci': 'Dimensity 7300 Ultra (4nm)',
      'Ekran': '6.67" AMOLED, 120Hz',
      'Kamera': '200 MP Ana + 8 MP Ultra Geniş',
      'Batarya': '5.110 mAh, 45W Şarj',
      'İşletim Sistemi': 'Android 14 / HyperOS',
    },
    image_url: await fetchPexelsImage('Redmi Note Xiaomi budget phone'),
  },
  {
    category_id: catXiaomi,
    name: 'POCO F6 Pro',
    slug: 'poco-f6-pro',
    brand: 'POCO', model: 'POCO F6 Pro', model_year: 2024,
    price_min: 22_999, price_max: 28_999, currency: 'TRY',
    specs: {
      'Depolama Seçenekleri': [
        { 'Kapasite': '256 GB', 'RAM': '12 GB', 'Fiyat': '22.999 ₺' },
        { 'Kapasite': '512 GB', 'RAM': '16 GB', 'Fiyat': '28.999 ₺' },
      ],
      'İşlemci': 'Snapdragon 8 Gen 2 (4nm)',
      'Ekran': '6.67" LTPO AMOLED, 144Hz',
      'Kamera': '50 MP Ana + 8 MP Ultra Geniş',
      'Batarya': '5.000 mAh, 67W Şarj',
    },
    image_url: await fetchPexelsImage('POCO F6 flagship killer phone'),
  },
];

for (const p of xiaomiProducts) await upsert(p);

// ─── Google Pixel ────────────────────────────────────────────────────────────
console.log('\n📱 GOOGLE PİXEL');
console.log('─'.repeat(50));

const pixelProducts = [
  {
    category_id: catPixel,
    name: 'Pixel 9',
    slug: 'google-pixel-9',
    brand: 'Google', model: 'Pixel 9', model_year: 2024,
    price_min: 47_999, price_max: 62_999, currency: 'TRY',
    specs: {
      'Depolama Seçenekleri': [
        { 'Kapasite': '128 GB', 'RAM': '12 GB', 'Fiyat': '47.999 ₺' },
        { 'Kapasite': '256 GB', 'RAM': '12 GB', 'Fiyat': '54.999 ₺' },
        { 'Kapasite': '512 GB', 'RAM': '16 GB', 'Fiyat': '62.999 ₺' },
      ],
      'İşlemci': 'Google Tensor G4',
      'Ekran': '6.3" Actua OLED, 120Hz',
      'Kamera': '50 MP Ana + 48 MP Ultra Geniş',
      'Batarya': '4.700 mAh, 27W Şarj',
      'Özellik': 'Google AI özellikleri, 7 yıl güncelleme garantisi',
    },
    image_url: await fetchPexelsImage('Google Pixel 9 smartphone'),
  },
  {
    category_id: catPixel,
    name: 'Pixel 9 Pro Fold',
    slug: 'google-pixel-9-pro-fold',
    brand: 'Google', model: 'Pixel 9 Pro Fold', model_year: 2024,
    price_min: 99_999, price_max: 114_999, currency: 'TRY',
    specs: {
      'Depolama Seçenekleri': [
        { 'Kapasite': '256 GB', 'RAM': '16 GB', 'Fiyat': '99.999 ₺' },
        { 'Kapasite': '512 GB', 'RAM': '16 GB', 'Fiyat': '114.999 ₺' },
      ],
      'İşlemci': 'Google Tensor G4',
      'İç Ekran': '8.0" LTPO OLED, 120Hz',
      'Dış Ekran': '6.3" LTPO OLED, 120Hz',
      'Kamera': '48 MP Ana + 10.5 MP Ultra Geniş + 10.8 MP 5x Telefoto',
      'Batarya': '4.650 mAh',
    },
    image_url: await fetchPexelsImage('Google Pixel Fold foldable'),
  },
];

for (const p of pixelProducts) await upsert(p);

// ─── MacBook ─────────────────────────────────────────────────────────────────
console.log('\n💻 MACBOOK');
console.log('─'.repeat(50));

const macbookProducts = [
  {
    category_id: catMacBook,
    name: 'MacBook Air 13" M3',
    slug: 'apple-macbook-air-13-m3',
    brand: 'Apple', model: 'MacBook Air 13"', model_year: 2024,
    price_min: 54_999, price_max: 79_999, currency: 'TRY',
    specs: {
      'Donanım Seçenekleri': [
        { 'Çip': 'M3 8 Çekirdek CPU', 'RAM': '8 GB',  'Depolama': '256 GB SSD', 'Fiyat': '54.999 ₺' },
        { 'Çip': 'M3 8 Çekirdek CPU', 'RAM': '16 GB', 'Depolama': '256 GB SSD', 'Fiyat': '64.999 ₺' },
        { 'Çip': 'M3 8 Çekirdek CPU', 'RAM': '16 GB', 'Depolama': '512 GB SSD', 'Fiyat': '74.999 ₺' },
        { 'Çip': 'M3 8 Çekirdek CPU', 'RAM': '24 GB', 'Depolama': '1 TB SSD',   'Fiyat': '79.999 ₺' },
      ],
      'Ekran': '13.6" Liquid Retina, 2560×1664',
      'GPU': '10 Çekirdek GPU',
      'Batarya': '18 saate kadar',
      'Ağırlık': '1.24 kg',
    },
    image_url: await fetchPexelsImage('MacBook Air M3 laptop apple'),
  },
  {
    category_id: catMacBook,
    name: 'MacBook Pro 14" M4',
    slug: 'apple-macbook-pro-14-m4',
    brand: 'Apple', model: 'MacBook Pro 14"', model_year: 2024,
    price_min: 84_999, price_max: 149_999, currency: 'TRY',
    specs: {
      'Donanım Seçenekleri': [
        { 'Çip': 'M4 10 Çekirdek CPU',      'RAM': '16 GB', 'Depolama': '512 GB SSD', 'Fiyat': '84.999 ₺' },
        { 'Çip': 'M4 Pro 14 Çekirdek CPU',  'RAM': '24 GB', 'Depolama': '512 GB SSD', 'Fiyat': '109.999 ₺' },
        { 'Çip': 'M4 Pro 14 Çekirdek CPU',  'RAM': '48 GB', 'Depolama': '1 TB SSD',   'Fiyat': '134.999 ₺' },
        { 'Çip': 'M4 Max 16 Çekirdek CPU',  'RAM': '64 GB', 'Depolama': '1 TB SSD',   'Fiyat': '149.999 ₺' },
      ],
      'Ekran': '14.2" Liquid Retina XDR, ProMotion 120Hz',
      'Batarya': '24 saate kadar',
      'Ağırlık': '1.62 kg',
    },
    image_url: await fetchPexelsImage('MacBook Pro 14 M4 apple laptop'),
  },
];

for (const p of macbookProducts) await upsert(p);

// ─── Gaming Laptop ────────────────────────────────────────────────────────────
console.log('\n🎮 GAMİNG LAPTOP');
console.log('─'.repeat(50));

const gamingLaptopProducts = [
  {
    category_id: catAsusRog,
    name: 'ROG Zephyrus G16 (2024)',
    slug: 'asus-rog-zephyrus-g16-2024',
    brand: 'ASUS', model: 'ROG Zephyrus G16', model_year: 2024,
    price_min: 74_999, price_max: 104_999, currency: 'TRY',
    specs: {
      'Donanım Seçenekleri': [
        { 'İşlemci': 'Intel Core Ultra 7 155H', 'GPU': 'RTX 4060 8 GB', 'RAM': '16 GB', 'Depolama': '512 GB', 'Fiyat': '74.999 ₺' },
        { 'İşlemci': 'Intel Core Ultra 9 185H', 'GPU': 'RTX 4070 8 GB', 'RAM': '32 GB', 'Depolama': '1 TB',   'Fiyat': '89.999 ₺' },
        { 'İşlemci': 'Intel Core Ultra 9 185H', 'GPU': 'RTX 4090 16 GB','RAM': '32 GB', 'Depolama': '1 TB',   'Fiyat': '104.999 ₺' },
      ],
      'Ekran': '16" QHD+ OLED, 240Hz',
      'Ağırlık': '1.85 kg',
      'Özellik': 'MUX Switch, ROG Nebula Display',
    },
    image_url: await fetchPexelsImage('ASUS ROG gaming laptop'),
  },
  {
    category_id: catAsusRog,
    name: 'TUF Gaming F15 (2024)',
    slug: 'asus-tuf-f15-2024',
    brand: 'ASUS', model: 'TUF Gaming F15', model_year: 2024,
    price_min: 38_999, price_max: 54_999, currency: 'TRY',
    specs: {
      'Donanım Seçenekleri': [
        { 'İşlemci': 'Intel Core i7-13620H', 'GPU': 'RTX 4060 8 GB', 'RAM': '16 GB', 'Depolama': '512 GB', 'Fiyat': '38.999 ₺' },
        { 'İşlemci': 'Intel Core i9-13900H', 'GPU': 'RTX 4070 8 GB', 'RAM': '16 GB', 'Depolama': '1 TB',   'Fiyat': '48.999 ₺' },
        { 'İşlemci': 'Intel Core i9-13900H', 'GPU': 'RTX 4070 8 GB', 'RAM': '32 GB', 'Depolama': '1 TB',   'Fiyat': '54.999 ₺' },
      ],
      'Ekran': '15.6" FHD, 144Hz',
      'Ağırlık': '2.2 kg',
      'Özellik': 'MIL-STD-810H sertifikası',
    },
    image_url: await fetchPexelsImage('ASUS TUF gaming laptop'),
  },
  {
    category_id: catLenovoLegion,
    name: 'Legion Pro 7i Gen 9',
    slug: 'lenovo-legion-pro-7i-gen9',
    brand: 'Lenovo', model: 'Legion Pro 7i', model_year: 2024,
    price_min: 79_999, price_max: 114_999, currency: 'TRY',
    specs: {
      'Donanım Seçenekleri': [
        { 'İşlemci': 'Intel Core i7-14700HX', 'GPU': 'RTX 4070 Ti Super 16 GB', 'RAM': '32 GB', 'Depolama': '1 TB',   'Fiyat': '79.999 ₺' },
        { 'İşlemci': 'Intel Core i9-14900HX', 'GPU': 'RTX 4080 12 GB',          'RAM': '32 GB', 'Depolama': '1 TB',   'Fiyat': '94.999 ₺' },
        { 'İşlemci': 'Intel Core i9-14900HX', 'GPU': 'RTX 4090 16 GB',          'RAM': '64 GB', 'Depolama': '2 TB',   'Fiyat': '114.999 ₺' },
      ],
      'Ekran': '16" QHD+ IPS, 240Hz, 500 nit',
      'Ağırlık': '2.8 kg',
      'Özellik': 'Legion ColdFront soğutma, Corsair iCUE RGB',
    },
    image_url: await fetchPexelsImage('Lenovo Legion Pro gaming laptop'),
  },
  {
    category_id: catMsiGaming,
    name: 'MSI Titan GT77 HX',
    slug: 'msi-titan-gt77-hx',
    brand: 'MSI', model: 'Titan GT77 HX', model_year: 2024,
    price_min: 94_999, price_max: 134_999, currency: 'TRY',
    specs: {
      'Donanım Seçenekleri': [
        { 'İşlemci': 'Intel Core i9-13980HX', 'GPU': 'RTX 4080 12 GB',  'RAM': '32 GB', 'Depolama': '2 TB',   'Fiyat': '94.999 ₺' },
        { 'İşlemci': 'Intel Core i9-13980HX', 'GPU': 'RTX 4090 16 GB',  'RAM': '64 GB', 'Depolama': '2 TB',   'Fiyat': '134.999 ₺' },
      ],
      'Ekran': '17.3" UHD IPS, 144Hz',
      'Ağırlık': '3.3 kg',
      'Özellik': 'Cherry MX mekanik klavye',
    },
    image_url: await fetchPexelsImage('MSI Titan gaming laptop'),
  },
  {
    category_id: catMsiGaming,
    name: 'MSI Katana 15 B13V',
    slug: 'msi-katana-15-b13v',
    brand: 'MSI', model: 'Katana 15', model_year: 2024,
    price_min: 34_999, price_max: 44_999, currency: 'TRY',
    specs: {
      'Donanım Seçenekleri': [
        { 'İşlemci': 'Intel Core i7-13620H', 'GPU': 'RTX 4060 8 GB', 'RAM': '16 GB', 'Depolama': '512 GB', 'Fiyat': '34.999 ₺' },
        { 'İşlemci': 'Intel Core i7-13620H', 'GPU': 'RTX 4070 8 GB', 'RAM': '16 GB', 'Depolama': '1 TB',   'Fiyat': '44.999 ₺' },
      ],
      'Ekran': '15.6" FHD, 144Hz',
      'Ağırlık': '2.25 kg',
    },
    image_url: await fetchPexelsImage('MSI gaming laptop budget'),
  },
];

for (const p of gamingLaptopProducts) await upsert(p);

// ─── Ultrabook ────────────────────────────────────────────────────────────────
console.log('\n💼 ULTRABOOK');
console.log('─'.repeat(50));

const ultrabookProducts = [
  {
    category_id: catUltrabook,
    name: 'Dell XPS 13 Plus (2024)',
    slug: 'dell-xps-13-plus-2024',
    brand: 'Dell', model: 'XPS 13 Plus', model_year: 2024,
    price_min: 49_999, price_max: 74_999, currency: 'TRY',
    specs: {
      'Donanım Seçenekleri': [
        { 'İşlemci': 'Intel Core Ultra 5 125H', 'RAM': '16 GB', 'Depolama': '512 GB', 'Fiyat': '49.999 ₺' },
        { 'İşlemci': 'Intel Core Ultra 7 155H', 'RAM': '32 GB', 'Depolama': '1 TB',   'Fiyat': '64.999 ₺' },
        { 'İşlemci': 'Intel Core Ultra 9 185H', 'RAM': '64 GB', 'Depolama': '2 TB',   'Fiyat': '74.999 ₺' },
      ],
      'Ekran': '13.4" OLED 3.5K, 120Hz',
      'Ağırlık': '1.26 kg',
      'Özellik': 'Kapasitif dokunmatik fonksiyon satırı',
    },
    image_url: await fetchPexelsImage('Dell XPS 13 ultrabook slim'),
  },
  {
    category_id: catUltrabook,
    name: 'LG Gram 16 (2024)',
    slug: 'lg-gram-16-2024',
    brand: 'LG', model: 'Gram 16', model_year: 2024,
    price_min: 44_999, price_max: 64_999, currency: 'TRY',
    specs: {
      'Donanım Seçenekleri': [
        { 'İşlemci': 'Intel Core Ultra 5 125H', 'RAM': '16 GB', 'Depolama': '512 GB', 'Fiyat': '44.999 ₺' },
        { 'İşlemci': 'Intel Core Ultra 7 155H', 'RAM': '16 GB', 'Depolama': '1 TB',   'Fiyat': '54.999 ₺' },
        { 'İşlemci': 'Intel Core Ultra 7 155H', 'RAM': '32 GB', 'Depolama': '2 TB',   'Fiyat': '64.999 ₺' },
      ],
      'Ekran': '16" WQXGA IPS, 60Hz',
      'Ağırlık': '1.19 kg',
      'Özellik': 'MIL-STD-810H, 80Wh batarya',
    },
    image_url: await fetchPexelsImage('LG Gram lightweight laptop'),
  },
  {
    category_id: catUltrabook,
    name: 'Microsoft Surface Pro 11',
    slug: 'microsoft-surface-pro-11',
    brand: 'Microsoft', model: 'Surface Pro 11', model_year: 2024,
    price_min: 52_999, price_max: 84_999, currency: 'TRY',
    specs: {
      'Donanım Seçenekleri': [
        { 'İşlemci': 'Snapdragon X Plus',  'RAM': '16 GB', 'Depolama': '256 GB', 'Fiyat': '52.999 ₺' },
        { 'İşlemci': 'Snapdragon X Elite', 'RAM': '16 GB', 'Depolama': '512 GB', 'Fiyat': '64.999 ₺' },
        { 'İşlemci': 'Snapdragon X Elite', 'RAM': '32 GB', 'Depolama': '1 TB',   'Fiyat': '84.999 ₺' },
      ],
      'Ekran': '13" PixelSense Flow OLED, 120Hz',
      'Ağırlık': '895 g (tablet)',
      'Özellik': '2-in-1 tablet/laptop, Copilot+ PC',
    },
    image_url: await fetchPexelsImage('Microsoft Surface Pro tablet laptop'),
  },
];

for (const p of ultrabookProducts) await upsert(p);

// ─── İş Laptopu ───────────────────────────────────────────────────────────────
console.log('\n🏢 İŞ LAPTOPU');
console.log('─'.repeat(50));

const businessLaptopProducts = [
  {
    category_id: catIsLaptop,
    name: 'ThinkPad X1 Carbon Gen 12',
    slug: 'lenovo-thinkpad-x1-carbon-gen12',
    brand: 'Lenovo', model: 'ThinkPad X1 Carbon', model_year: 2024,
    price_min: 59_999, price_max: 84_999, currency: 'TRY',
    specs: {
      'Donanım Seçenekleri': [
        { 'İşlemci': 'Intel Core Ultra 5 125U', 'RAM': '16 GB', 'Depolama': '512 GB', 'Fiyat': '59.999 ₺' },
        { 'İşlemci': 'Intel Core Ultra 7 155U', 'RAM': '32 GB', 'Depolama': '512 GB', 'Fiyat': '74.999 ₺' },
        { 'İşlemci': 'Intel Core Ultra 7 165U', 'RAM': '32 GB', 'Depolama': '1 TB',   'Fiyat': '84.999 ₺' },
      ],
      'Ekran': '14" IPS 2.8K, 60Hz',
      'Ağırlık': '1.12 kg',
      'Özellik': 'MIL-STD-810H, ThinkShutter webcam gizlilik kapağı',
    },
    image_url: await fetchPexelsImage('Lenovo ThinkPad business laptop'),
  },
  {
    category_id: catIsLaptop,
    name: 'HP EliteBook 840 G11',
    slug: 'hp-elitebook-840-g11',
    brand: 'HP', model: 'EliteBook 840 G11', model_year: 2024,
    price_min: 52_999, price_max: 74_999, currency: 'TRY',
    specs: {
      'Donanım Seçenekleri': [
        { 'İşlemci': 'Intel Core Ultra 5 125U', 'RAM': '16 GB', 'Depolama': '512 GB', 'Fiyat': '52.999 ₺' },
        { 'İşlemci': 'Intel Core Ultra 7 155U', 'RAM': '16 GB', 'Depolama': '512 GB', 'Fiyat': '62.999 ₺' },
        { 'İşlemci': 'Intel Core Ultra 7 165U', 'RAM': '32 GB', 'Depolama': '1 TB',   'Fiyat': '74.999 ₺' },
      ],
      'Ekran': '14" IPS 1920x1200',
      'Ağırlık': '1.37 kg',
      'Özellik': 'HP Wolf Security, Sure Erase',
    },
    image_url: await fetchPexelsImage('HP EliteBook business laptop'),
  },
];

for (const p of businessLaptopProducts) await upsert(p);

// ─── Özet ─────────────────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(50));
console.log('🎉 Tamamlandı! Boş kategoriler dolduruldu.');
