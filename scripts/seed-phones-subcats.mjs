// iPhone Pro + Standart alt kategorileri + Samsung/Google ekleri
import { createClient } from '@supabase/supabase-js';

const s = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const CATS = {
  'iphone-pro':     '7e095115-e2b7-4e37-9db6-b98aff486c0e',
  'iphone-standart':'d0214446-d99c-4487-8a22-0a37c7fb5846',
  'samsung':        '2cd68380-9608-44ce-957d-9f21396efd8a',
  'google':         '46c38ad0-2cba-4e9f-a34a-a9ed42983a25',
};

const products = [
  // ── iPhone Pro ──
  {
    name: 'iPhone 16 Pro', slug: 'apple-iphone-16-pro', brand: 'Apple', model: 'iPhone 16 Pro',
    category_id: CATS['iphone-pro'], status: 'active', price_min: 84999, price_max: 110999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
    short_description: 'A18 Pro çip, titanyum gövde, 48MP kamera sistemi.',
    specs: {
      'Ekran': '6.3" Super Retina XDR OLED, ProMotion 120Hz',
      'İşlemci': 'Apple A18 Pro',
      'RAM': '8 GB',
      'İşletim Sistemi': 'iOS 18',
      'Pil': '3582 mAh',
      'Ağırlık': '199 g',
      'Bağlantı': 'USB-C (USB 3.2), Wi-Fi 7, 5G',
      'Depolama Seçenekleri': [
        { 'Kapasite': '128 GB', 'Fiyat': '84.999 ₺' },
        { 'Kapasite': '256 GB', 'Fiyat': '94.999 ₺' },
        { 'Kapasite': '512 GB', 'Fiyat': '110.999 ₺' },
        { 'Kapasite': '1 TB', 'Fiyat': '124.999 ₺' },
      ],
    },
  },
  {
    name: 'iPhone 16 Pro Max', slug: 'apple-iphone-16-pro-max', brand: 'Apple', model: 'iPhone 16 Pro Max',
    category_id: CATS['iphone-pro'], status: 'active', price_min: 94999, price_max: 134999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
    short_description: 'En büyük ekran, A18 Pro çip, tetraprizma kamera.',
    specs: {
      'Ekran': '6.9" Super Retina XDR OLED, ProMotion 120Hz',
      'İşlemci': 'Apple A18 Pro',
      'RAM': '8 GB',
      'İşletim Sistemi': 'iOS 18',
      'Pil': '4685 mAh',
      'Ağırlık': '227 g',
      'Bağlantı': 'USB-C (USB 3.2), Wi-Fi 7, 5G',
      'Depolama Seçenekleri': [
        { 'Kapasite': '256 GB', 'Fiyat': '94.999 ₺' },
        { 'Kapasite': '512 GB', 'Fiyat': '110.999 ₺' },
        { 'Kapasite': '1 TB', 'Fiyat': '134.999 ₺' },
      ],
    },
  },
  {
    name: 'iPhone 15 Pro', slug: 'apple-iphone-15-pro', brand: 'Apple', model: 'iPhone 15 Pro',
    category_id: CATS['iphone-pro'], status: 'active', price_min: 67999, price_max: 87999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
    short_description: 'A17 Pro çip, titanyum çerçeve, Action Button.',
    specs: {
      'Ekran': '6.1" Super Retina XDR OLED, ProMotion 120Hz',
      'İşlemci': 'Apple A17 Pro',
      'RAM': '8 GB',
      'İşletim Sistemi': 'iOS 18',
      'Pil': '3274 mAh',
      'Ağırlık': '187 g',
      'Bağlantı': 'USB-C (USB 3.2), Wi-Fi 6E, 5G',
      'Depolama Seçenekleri': [
        { 'Kapasite': '128 GB', 'Fiyat': '67.999 ₺' },
        { 'Kapasite': '256 GB', 'Fiyat': '74.999 ₺' },
        { 'Kapasite': '512 GB', 'Fiyat': '87.999 ₺' },
      ],
    },
  },
  {
    name: 'iPhone 15 Pro Max', slug: 'apple-iphone-15-pro-max', brand: 'Apple', model: 'iPhone 15 Pro Max',
    category_id: CATS['iphone-pro'], status: 'active', price_min: 79999, price_max: 99999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
    short_description: '5x optik zoom, titanyum gövde, büyük pil.',
    specs: {
      'Ekran': '6.7" Super Retina XDR OLED, ProMotion 120Hz',
      'İşlemci': 'Apple A17 Pro',
      'RAM': '8 GB',
      'Pil': '4422 mAh',
      'Ağırlık': '221 g',
      'Bağlantı': 'USB-C (USB 3.2), Wi-Fi 6E, 5G',
      'Depolama Seçenekleri': [
        { 'Kapasite': '256 GB', 'Fiyat': '79.999 ₺' },
        { 'Kapasite': '512 GB', 'Fiyat': '89.999 ₺' },
        { 'Kapasite': '1 TB', 'Fiyat': '99.999 ₺' },
      ],
    },
  },
  // ── iPhone Standart ──
  {
    name: 'iPhone 16', slug: 'apple-iphone-16', brand: 'Apple', model: 'iPhone 16',
    category_id: CATS['iphone-standart'], status: 'active', price_min: 59999, price_max: 75999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
    short_description: 'A18 çip, Camera Control, Apple Intelligence.',
    specs: {
      'Ekran': '6.1" Super Retina XDR OLED, 60Hz',
      'İşlemci': 'Apple A18',
      'RAM': '8 GB',
      'İşletim Sistemi': 'iOS 18',
      'Pil': '3561 mAh',
      'Ağırlık': '170 g',
      'Bağlantı': 'USB-C, Wi-Fi 7, 5G',
      'Depolama Seçenekleri': [
        { 'Kapasite': '128 GB', 'Fiyat': '59.999 ₺' },
        { 'Kapasite': '256 GB', 'Fiyat': '67.999 ₺' },
        { 'Kapasite': '512 GB', 'Fiyat': '75.999 ₺' },
      ],
    },
  },
  {
    name: 'iPhone 16 Plus', slug: 'apple-iphone-16-plus', brand: 'Apple', model: 'iPhone 16 Plus',
    category_id: CATS['iphone-standart'], status: 'active', price_min: 67999, price_max: 82999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
    short_description: 'Büyük ekran, uzun pil ömrü, A18 çip.',
    specs: {
      'Ekran': '6.7" Super Retina XDR OLED, 60Hz',
      'İşlemci': 'Apple A18',
      'RAM': '8 GB',
      'Pil': '4674 mAh',
      'Ağırlık': '203 g',
      'Bağlantı': 'USB-C, Wi-Fi 7, 5G',
      'Depolama Seçenekleri': [
        { 'Kapasite': '128 GB', 'Fiyat': '67.999 ₺' },
        { 'Kapasite': '256 GB', 'Fiyat': '74.999 ₺' },
        { 'Kapasite': '512 GB', 'Fiyat': '82.999 ₺' },
      ],
    },
  },
  {
    name: 'iPhone 15', slug: 'apple-iphone-15', brand: 'Apple', model: 'iPhone 15',
    category_id: CATS['iphone-standart'], status: 'active', price_min: 47999, price_max: 61999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
    short_description: 'Dynamic Island, USB-C, 48MP kamera.',
    specs: {
      'Ekran': '6.1" Super Retina XDR OLED, 60Hz',
      'İşlemci': 'Apple A16 Bionic',
      'RAM': '6 GB',
      'Pil': '3349 mAh',
      'Ağırlık': '171 g',
      'Bağlantı': 'USB-C, Wi-Fi 6, 5G',
      'Depolama Seçenekleri': [
        { 'Kapasite': '128 GB', 'Fiyat': '47.999 ₺' },
        { 'Kapasite': '256 GB', 'Fiyat': '54.999 ₺' },
        { 'Kapasite': '512 GB', 'Fiyat': '61.999 ₺' },
      ],
    },
  },
  {
    name: 'iPhone 14', slug: 'apple-iphone-14', brand: 'Apple', model: 'iPhone 14',
    category_id: CATS['iphone-standart'], status: 'active', price_min: 36999, price_max: 48999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
    short_description: 'Kaza tespiti, uydu bağlantısı, A15 Bionic.',
    specs: {
      'Ekran': '6.1" Super Retina XDR OLED, 60Hz',
      'İşlemci': 'Apple A15 Bionic',
      'RAM': '6 GB',
      'Pil': '3279 mAh',
      'Ağırlık': '172 g',
      'Bağlantı': 'Lightning, Wi-Fi 6, 5G',
      'Depolama Seçenekleri': [
        { 'Kapasite': '128 GB', 'Fiyat': '36.999 ₺' },
        { 'Kapasite': '256 GB', 'Fiyat': '42.999 ₺' },
        { 'Kapasite': '512 GB', 'Fiyat': '48.999 ₺' },
      ],
    },
  },
  // ── Samsung Telefonlar ──
  {
    name: 'Galaxy S25', slug: 'samsung-galaxy-s25', brand: 'Samsung', model: 'Galaxy S25',
    category_id: CATS['samsung'], status: 'active', price_min: 49999, price_max: 61999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80',
    short_description: 'Snapdragon 8 Elite, Galaxy AI, 50MP kamera.',
    specs: {
      'Ekran': '6.2" Dynamic AMOLED 2X, 120Hz',
      'İşlemci': 'Qualcomm Snapdragon 8 Elite',
      'RAM': '12 GB',
      'İşletim Sistemi': 'Android 15, One UI 7',
      'Pil': '4000 mAh',
      'Ağırlık': '162 g',
      'Bağlantı': 'USB-C (USB 3.2), Wi-Fi 7, 5G',
      'Depolama Seçenekleri': [
        { 'Kapasite': '128 GB', 'Fiyat': '49.999 ₺' },
        { 'Kapasite': '256 GB', 'Fiyat': '54.999 ₺' },
        { 'Kapasite': '512 GB', 'Fiyat': '61.999 ₺' },
      ],
    },
  },
  {
    name: 'Galaxy S25+', slug: 'samsung-galaxy-s25-plus', brand: 'Samsung', model: 'Galaxy S25+',
    category_id: CATS['samsung'], status: 'active', price_min: 59999, price_max: 72999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80',
    short_description: 'Büyük ekran, 12GB RAM, Snapdragon 8 Elite.',
    specs: {
      'Ekran': '6.7" Dynamic AMOLED 2X, 120Hz',
      'İşlemci': 'Qualcomm Snapdragon 8 Elite',
      'RAM': '12 GB',
      'Pil': '4900 mAh',
      'Ağırlık': '190 g',
      'Bağlantı': 'USB-C (USB 3.2), Wi-Fi 7, 5G',
      'Depolama Seçenekleri': [
        { 'Kapasite': '256 GB', 'Fiyat': '59.999 ₺' },
        { 'Kapasite': '512 GB', 'Fiyat': '72.999 ₺' },
      ],
    },
  },
  {
    name: 'Galaxy S24 FE', slug: 'samsung-galaxy-s24-fe', brand: 'Samsung', model: 'Galaxy S24 FE',
    category_id: CATS['samsung'], status: 'active', price_min: 32999, price_max: 38999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80',
    short_description: 'Fan Edition — Galaxy AI uygun fiyata.',
    specs: {
      'Ekran': '6.7" Dynamic AMOLED 2X, 120Hz',
      'İşlemci': 'Exynos 2500',
      'RAM': '8 GB',
      'Pil': '4700 mAh',
      'Ağırlık': '213 g',
      'Bağlantı': 'USB-C, Wi-Fi 6E, 5G',
      'Depolama Seçenekleri': [
        { 'Kapasite': '128 GB', 'Fiyat': '32.999 ₺' },
        { 'Kapasite': '256 GB', 'Fiyat': '38.999 ₺' },
      ],
    },
  },
  // ── Google ──
  {
    name: 'Pixel 9 Pro', slug: 'google-pixel-9-pro', brand: 'Google', model: 'Pixel 9 Pro',
    category_id: CATS['google'], status: 'active', price_min: 45999, price_max: 57999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80',
    short_description: 'Tensor G4, en iyi Android kamera, 7 yıl güncelleme.',
    specs: {
      'Ekran': '6.3" LTPO OLED, 120Hz',
      'İşlemci': 'Google Tensor G4',
      'RAM': '16 GB',
      'İşletim Sistemi': 'Android 15',
      'Pil': '4700 mAh',
      'Ağırlık': '199 g',
      'Bağlantı': 'USB-C (USB 3.2), Wi-Fi 7, 5G',
      'Depolama Seçenekleri': [
        { 'Kapasite': '128 GB', 'Fiyat': '45.999 ₺' },
        { 'Kapasite': '256 GB', 'Fiyat': '51.999 ₺' },
        { 'Kapasite': '1 TB', 'Fiyat': '57.999 ₺' },
      ],
    },
  },
  {
    name: 'Pixel 9', slug: 'google-pixel-9', brand: 'Google', model: 'Pixel 9',
    category_id: CATS['google'], status: 'active', price_min: 34999, price_max: 42999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80',
    short_description: 'Tensor G4, saf Android deneyimi, Gemini AI.',
    specs: {
      'Ekran': '6.3" OLED, 120Hz',
      'İşlemci': 'Google Tensor G4',
      'RAM': '12 GB',
      'Pil': '4700 mAh',
      'Ağırlık': '198 g',
      'Bağlantı': 'USB-C, Wi-Fi 7, 5G',
      'Depolama Seçenekleri': [
        { 'Kapasite': '128 GB', 'Fiyat': '34.999 ₺' },
        { 'Kapasite': '256 GB', 'Fiyat': '42.999 ₺' },
      ],
    },
  },
];

let ok = 0, err = 0;
for (const p of products) {
  const { error } = await s.from('products').upsert(p, { onConflict: 'slug' });
  if (error) { console.error('✗', p.slug, error.message); err++; }
  else { console.log('✓', p.slug); ok++; }
}
console.log(`\n${ok} eklendi, ${err} hata`);
