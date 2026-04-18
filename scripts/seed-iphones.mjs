import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = readFileSync(resolve(__dirname, '../apps/web/.env.local'), 'utf-8');
const getEnv = k => env.match(new RegExp('^' + k + '=(.+)$', 'm'))?.[1]?.trim();
const supabase = createClient(getEnv('NEXT_PUBLIC_SUPABASE_URL'), getEnv('SUPABASE_SERVICE_KEY'));

// Telefon kategorisi ID'sini bul (slug: telefonlar veya iPhone alt kategori)
const { data: cats } = await supabase.from('categories').select('id,slug,name').in('slug', ['iphone', 'telefonlar', 'akilli-telefon']);
console.log('Kategoriler:', cats?.map(c => `${c.slug}=${c.id}`));

const iphoneCat = cats?.find(c => c.slug === 'iphone') ?? cats?.find(c => c.slug === 'telefonlar') ?? cats?.[0];
if (!iphoneCat) { console.error('iPhone/Telefon kategorisi bulunamadı'); process.exit(1); }
console.log('Kullanılacak kategori:', iphoneCat.slug, iphoneCat.id);

const PRODUCTS = [
  // ── iPhone 16 Serisi ────────────────────────────────────────────────────────
  {
    name: 'iPhone 16',
    slug: 'apple-iphone-16',
    brand: 'Apple', model: 'iPhone 16', model_year: 2024,
    category_id: iphoneCat.id,
    price_min: 54999, price_max: 74999,
    short_description: 'A18 çip, 48MP kamera, Action Button ve yeni Camera Control tuşu ile iPhone 16.',
    specs: {
      'İşlemci': 'Apple A18',
      'Ekran': '6.1 inç Super Retina XDR OLED, 2556×1179, 460 ppi',
      'Arka Kamera': '48MP Fusion + 12MP Ultra Wide',
      'Ön Kamera': '12MP TrueDepth',
      'Batarya': '3561 mAh, 27W MagSafe',
      'Su Geçirmezlik': 'IP68 (6m / 30dk)',
      'Bağlantı': '5G, Wi-Fi 7, Bluetooth 5.3, USB-C',
      'İşletim Sistemi': 'iOS 18',
      'Depolama Seçenekleri': [
        { 'Kapasite': '128 GB', 'Fiyat': '54.999 ₺' },
        { 'Kapasite': '256 GB', 'Fiyat': '62.999 ₺' },
        { 'Kapasite': '512 GB', 'Fiyat': '74.999 ₺' },
      ],
      'Renk Seçenekleri': 'Ultramarine, Teal, Pink, White, Black',
    },
  },
  {
    name: 'iPhone 16 Plus',
    slug: 'apple-iphone-16-plus',
    brand: 'Apple', model: 'iPhone 16 Plus', model_year: 2024,
    category_id: iphoneCat.id,
    price_min: 62999, price_max: 84999,
    short_description: 'Büyük ekran, büyük batarya. iPhone 16 ailesi\'nin 6.7 inç modeli.',
    specs: {
      'İşlemci': 'Apple A18',
      'Ekran': '6.7 inç Super Retina XDR OLED, 2796×1290, 460 ppi',
      'Arka Kamera': '48MP Fusion + 12MP Ultra Wide',
      'Ön Kamera': '12MP TrueDepth',
      'Batarya': '4674 mAh, 27W MagSafe',
      'Su Geçirmezlik': 'IP68 (6m / 30dk)',
      'Bağlantı': '5G, Wi-Fi 7, Bluetooth 5.3, USB-C',
      'İşletim Sistemi': 'iOS 18',
      'Depolama Seçenekleri': [
        { 'Kapasite': '128 GB', 'Fiyat': '62.999 ₺' },
        { 'Kapasite': '256 GB', 'Fiyat': '70.999 ₺' },
        { 'Kapasite': '512 GB', 'Fiyat': '84.999 ₺' },
      ],
      'Renk Seçenekleri': 'Ultramarine, Teal, Pink, White, Black',
    },
  },
  {
    name: 'iPhone 16 Pro',
    slug: 'apple-iphone-16-pro',
    brand: 'Apple', model: 'iPhone 16 Pro', model_year: 2024,
    category_id: iphoneCat.id,
    price_min: 74999, price_max: 104999,
    short_description: 'A18 Pro çip, 48MP teleskopos kamera, ProMotion 120Hz ve titanyum gövde.',
    specs: {
      'İşlemci': 'Apple A18 Pro',
      'Ekran': '6.3 inç Super Retina XDR ProMotion OLED, 2622×1206, 460 ppi, 120Hz',
      'Arka Kamera': '48MP Fusion + 48MP Ultra Wide + 12MP 5x Teleskopos',
      'Ön Kamera': '12MP TrueDepth',
      'Batarya': '3582 mAh, 27W MagSafe',
      'Su Geçirmezlik': 'IP68 (6m / 30dk)',
      'Bağlantı': '5G, Wi-Fi 7, Bluetooth 5.3, USB-C (USB 3)',
      'Malzeme': 'Grade 5 Titanyum + Textured Matte Glass',
      'İşletim Sistemi': 'iOS 18',
      'Depolama Seçenekleri': [
        { 'Kapasite': '128 GB', 'Fiyat': '74.999 ₺' },
        { 'Kapasite': '256 GB', 'Fiyat': '82.999 ₺' },
        { 'Kapasite': '512 GB', 'Fiyat': '96.999 ₺' },
        { 'Kapasite': '1 TB',   'Fiyat': '104.999 ₺' },
      ],
      'Renk Seçenekleri': 'Black Titanium, White Titanium, Natural Titanium, Desert Titanium',
    },
  },
  {
    name: 'iPhone 16 Pro Max',
    slug: 'apple-iphone-16-pro-max',
    brand: 'Apple', model: 'iPhone 16 Pro Max', model_year: 2024,
    category_id: iphoneCat.id,
    price_min: 84999, price_max: 114999,
    short_description: 'En büyük Pro ekran, en uzun pil ömrü. 6.9 inç titanyum amiral gemi.',
    specs: {
      'İşlemci': 'Apple A18 Pro',
      'Ekran': '6.9 inç Super Retina XDR ProMotion OLED, 2868×1320, 460 ppi, 120Hz',
      'Arka Kamera': '48MP Fusion + 48MP Ultra Wide + 12MP 5x Teleskopos',
      'Ön Kamera': '12MP TrueDepth',
      'Batarya': '4685 mAh, 27W MagSafe',
      'Su Geçirmezlik': 'IP68 (6m / 30dk)',
      'Bağlantı': '5G, Wi-Fi 7, Bluetooth 5.3, USB-C (USB 3)',
      'Malzeme': 'Grade 5 Titanyum + Textured Matte Glass',
      'İşletim Sistemi': 'iOS 18',
      'Depolama Seçenekleri': [
        { 'Kapasite': '256 GB', 'Fiyat': '84.999 ₺' },
        { 'Kapasite': '512 GB', 'Fiyat': '97.999 ₺' },
        { 'Kapasite': '1 TB',   'Fiyat': '114.999 ₺' },
      ],
      'Renk Seçenekleri': 'Black Titanium, White Titanium, Natural Titanium, Desert Titanium',
    },
  },

  // ── iPhone 15 Serisi ────────────────────────────────────────────────────────
  {
    name: 'iPhone 15',
    slug: 'apple-iphone-15',
    brand: 'Apple', model: 'iPhone 15', model_year: 2023,
    category_id: iphoneCat.id,
    price_min: 39999, price_max: 54999,
    short_description: 'Dynamic Island, 48MP kamera ve USB-C ile gelen iPhone 15.',
    specs: {
      'İşlemci': 'Apple A16 Bionic',
      'Ekran': '6.1 inç Super Retina XDR OLED, 2556×1179, 460 ppi',
      'Arka Kamera': '48MP Main + 12MP Ultra Wide',
      'Ön Kamera': '12MP TrueDepth',
      'Batarya': '3349 mAh, 23W MagSafe',
      'Su Geçirmezlik': 'IP68 (6m / 30dk)',
      'Bağlantı': '5G, Wi-Fi 6, Bluetooth 5.3, USB-C',
      'İşletim Sistemi': 'iOS 17 → iOS 18',
      'Depolama Seçenekleri': [
        { 'Kapasite': '128 GB', 'Fiyat': '39.999 ₺' },
        { 'Kapasite': '256 GB', 'Fiyat': '46.999 ₺' },
        { 'Kapasite': '512 GB', 'Fiyat': '54.999 ₺' },
      ],
      'Renk Seçenekleri': 'Black, Blue, Green, Yellow, Pink',
    },
  },
  {
    name: 'iPhone 15 Plus',
    slug: 'apple-iphone-15-plus',
    brand: 'Apple', model: 'iPhone 15 Plus', model_year: 2023,
    category_id: iphoneCat.id,
    price_min: 47999, price_max: 62999,
    short_description: '6.7 inç ekran ve uzun pil ömrüyle iPhone 15 Plus.',
    specs: {
      'İşlemci': 'Apple A16 Bionic',
      'Ekran': '6.7 inç Super Retina XDR OLED, 2796×1290, 460 ppi',
      'Arka Kamera': '48MP Main + 12MP Ultra Wide',
      'Ön Kamera': '12MP TrueDepth',
      'Batarya': '4383 mAh, 23W MagSafe',
      'Su Geçirmezlik': 'IP68 (6m / 30dk)',
      'Bağlantı': '5G, Wi-Fi 6, Bluetooth 5.3, USB-C',
      'İşletim Sistemi': 'iOS 17 → iOS 18',
      'Depolama Seçenekleri': [
        { 'Kapasite': '128 GB', 'Fiyat': '47.999 ₺' },
        { 'Kapasite': '256 GB', 'Fiyat': '54.999 ₺' },
        { 'Kapasite': '512 GB', 'Fiyat': '62.999 ₺' },
      ],
      'Renk Seçenekleri': 'Black, Blue, Green, Yellow, Pink',
    },
  },
  {
    name: 'iPhone 15 Pro',
    slug: 'apple-iphone-15-pro',
    brand: 'Apple', model: 'iPhone 15 Pro', model_year: 2023,
    category_id: iphoneCat.id,
    price_min: 57999, price_max: 84999,
    short_description: 'A17 Pro çip, Action Button ve titanyum gövde ile iPhone 15 Pro.',
    specs: {
      'İşlemci': 'Apple A17 Pro',
      'Ekran': '6.1 inç Super Retina XDR ProMotion OLED, 2556×1179, 460 ppi, 120Hz',
      'Arka Kamera': '48MP Main + 12MP Ultra Wide + 12MP 3x Teleskopos',
      'Ön Kamera': '12MP TrueDepth',
      'Batarya': '3274 mAh, 27W MagSafe',
      'Su Geçirmezlik': 'IP68 (6m / 30dk)',
      'Bağlantı': '5G, Wi-Fi 6E, Bluetooth 5.3, USB-C (USB 3)',
      'Malzeme': 'Grade 5 Titanyum',
      'İşletim Sistemi': 'iOS 17 → iOS 18',
      'Depolama Seçenekleri': [
        { 'Kapasite': '128 GB', 'Fiyat': '57.999 ₺' },
        { 'Kapasite': '256 GB', 'Fiyat': '64.999 ₺' },
        { 'Kapasite': '512 GB', 'Fiyat': '74.999 ₺' },
        { 'Kapasite': '1 TB',   'Fiyat': '84.999 ₺' },
      ],
      'Renk Seçenekleri': 'Black Titanium, White Titanium, Blue Titanium, Natural Titanium',
    },
  },
  {
    name: 'iPhone 15 Pro Max',
    slug: 'apple-iphone-15-pro-max',
    brand: 'Apple', model: 'iPhone 15 Pro Max', model_year: 2023,
    category_id: iphoneCat.id,
    price_min: 67999, price_max: 94999,
    short_description: '6.7 inç ProMotion, 5x teleskopos kamera ve A17 Pro — en güçlü iPhone 15.',
    specs: {
      'İşlemci': 'Apple A17 Pro',
      'Ekran': '6.7 inç Super Retina XDR ProMotion OLED, 2796×1290, 460 ppi, 120Hz',
      'Arka Kamera': '48MP Main + 12MP Ultra Wide + 12MP 5x Teleskopos',
      'Ön Kamera': '12MP TrueDepth',
      'Batarya': '4422 mAh, 27W MagSafe',
      'Su Geçirmezlik': 'IP68 (6m / 30dk)',
      'Bağlantı': '5G, Wi-Fi 6E, Bluetooth 5.3, USB-C (USB 3)',
      'Malzeme': 'Grade 5 Titanyum',
      'İşletim Sistemi': 'iOS 17 → iOS 18',
      'Depolama Seçenekleri': [
        { 'Kapasite': '256 GB', 'Fiyat': '67.999 ₺' },
        { 'Kapasite': '512 GB', 'Fiyat': '77.999 ₺' },
        { 'Kapasite': '1 TB',   'Fiyat': '94.999 ₺' },
      ],
      'Renk Seçenekleri': 'Black Titanium, White Titanium, Blue Titanium, Natural Titanium',
    },
  },

  // ── iPhone 14 Serisi ────────────────────────────────────────────────────────
  {
    name: 'iPhone 14',
    slug: 'apple-iphone-14',
    brand: 'Apple', model: 'iPhone 14', model_year: 2022,
    category_id: iphoneCat.id,
    price_min: 28999, price_max: 39999,
    short_description: 'Kilitlenme algılama, uydu iletişimi ve gelişmiş kamera ile iPhone 14.',
    specs: {
      'İşlemci': 'Apple A15 Bionic',
      'Ekran': '6.1 inç Super Retina XDR OLED, 2532×1170, 460 ppi',
      'Arka Kamera': '12MP Main + 12MP Ultra Wide',
      'Ön Kamera': '12MP TrueDepth (Otofokus)',
      'Batarya': '3279 mAh, 23W MagSafe',
      'Su Geçirmezlik': 'IP68 (6m / 30dk)',
      'Bağlantı': '5G, Wi-Fi 6, Bluetooth 5.3, Lightning',
      'İşletim Sistemi': 'iOS 16 → iOS 18',
      'Depolama Seçenekleri': [
        { 'Kapasite': '128 GB', 'Fiyat': '28.999 ₺' },
        { 'Kapasite': '256 GB', 'Fiyat': '33.999 ₺' },
        { 'Kapasite': '512 GB', 'Fiyat': '39.999 ₺' },
      ],
      'Renk Seçenekleri': 'Midnight, Starlight, Blue, Purple, Red',
    },
  },
  {
    name: 'iPhone 14 Pro',
    slug: 'apple-iphone-14-pro',
    brand: 'Apple', model: 'iPhone 14 Pro', model_year: 2022,
    category_id: iphoneCat.id,
    price_min: 42999, price_max: 64999,
    short_description: 'Dynamic Island ve Always-On ekranla gelen ilk iPhone — 48MP kamera.',
    specs: {
      'İşlemci': 'Apple A16 Bionic',
      'Ekran': '6.1 inç Super Retina XDR ProMotion OLED, 2556×1179, 460 ppi, 120Hz, Always-On',
      'Arka Kamera': '48MP Main + 12MP Ultra Wide + 12MP 3x Teleskopos',
      'Ön Kamera': '12MP TrueDepth (Otofokus)',
      'Batarya': '3200 mAh, 27W MagSafe',
      'Su Geçirmezlik': 'IP68 (6m / 30dk)',
      'Bağlantı': '5G, Wi-Fi 6E, Bluetooth 5.3, Lightning',
      'Malzeme': 'Paslanmaz çelik',
      'İşletim Sistemi': 'iOS 16 → iOS 18',
      'Depolama Seçenekleri': [
        { 'Kapasite': '128 GB', 'Fiyat': '42.999 ₺' },
        { 'Kapasite': '256 GB', 'Fiyat': '49.999 ₺' },
        { 'Kapasite': '512 GB', 'Fiyat': '57.999 ₺' },
        { 'Kapasite': '1 TB',   'Fiyat': '64.999 ₺' },
      ],
      'Renk Seçenekleri': 'Space Black, Silver, Gold, Deep Purple',
    },
  },
  {
    name: 'iPhone 14 Pro Max',
    slug: 'apple-iphone-14-pro-max',
    brand: 'Apple', model: 'iPhone 14 Pro Max', model_year: 2022,
    category_id: iphoneCat.id,
    price_min: 52999, price_max: 74999,
    short_description: '6.7 inç ProMotion ve Always-On ekranla en büyük Pro deneyimi.',
    specs: {
      'İşlemci': 'Apple A16 Bionic',
      'Ekran': '6.7 inç Super Retina XDR ProMotion OLED, 2796×1290, 460 ppi, 120Hz, Always-On',
      'Arka Kamera': '48MP Main + 12MP Ultra Wide + 12MP 3x Teleskopos',
      'Ön Kamera': '12MP TrueDepth (Otofokus)',
      'Batarya': '4323 mAh, 27W MagSafe',
      'Su Geçirmezlik': 'IP68 (6m / 30dk)',
      'Bağlantı': '5G, Wi-Fi 6E, Bluetooth 5.3, Lightning',
      'Malzeme': 'Paslanmaz çelik',
      'İşletim Sistemi': 'iOS 16 → iOS 18',
      'Depolama Seçenekleri': [
        { 'Kapasite': '128 GB', 'Fiyat': '52.999 ₺' },
        { 'Kapasite': '256 GB', 'Fiyat': '59.999 ₺' },
        { 'Kapasite': '512 GB', 'Fiyat': '67.999 ₺' },
        { 'Kapasite': '1 TB',   'Fiyat': '74.999 ₺' },
      ],
      'Renk Seçenekleri': 'Space Black, Silver, Gold, Deep Purple',
    },
  },
];

console.log(`\n${PRODUCTS.length} ürün yüklenecek...\n`);

let ok = 0, fail = 0;
for (const p of PRODUCTS) {
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
