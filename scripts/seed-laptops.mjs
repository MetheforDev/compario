// Gaming Laptop, Acer, ASUS, İş Laptopu kategorileri
import { createClient } from '@supabase/supabase-js';

const s = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const CATS = {
  gaming:  'cbdc9dea-4d13-4b94-9f51-20eb9ad21237',
  acer:    '3ed321f8-2f2b-407f-a007-a92a61a4e236',
  asus:    'ab466e8d-ecd2-47b8-8119-f6680cc655a4',
  is:      '11e8aeff-58cf-4d0d-9417-3cd02b84132b',
};

const products = [
  // ── Gaming Laptop ──
  {
    name: 'ROG Strix G16 2024', slug: 'asus-rog-strix-g16-2024', brand: 'ASUS', model: 'ROG Strix G16',
    category_id: CATS.gaming, status: 'active', price_min: 74999, price_max: 99999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80',
    short_description: '16" QHD 240Hz, RTX 4080, Intel Core i9.',
    specs: {
      'Ekran': '16" QHD+ 240Hz, IPS',
      'İşlemci': 'Intel Core i9-14900HX',
      'RAM': '32 GB DDR5',
      'Depolama': '1 TB NVMe SSD',
      'Ekran Kartı': 'NVIDIA GeForce RTX 4080',
      'Pil': '90 Wh',
      'Ağırlık': '2.5 kg',
      'İşletim Sistemi': 'Windows 11',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'i9 / RTX 4080', 'RAM': '32 GB', 'Depolama': '1 TB', 'Fiyat': '99.999 ₺' },
        { 'Versiyon': 'i7 / RTX 4070', 'RAM': '16 GB', 'Depolama': '1 TB', 'Fiyat': '74.999 ₺' },
      ],
    },
  },
  {
    name: 'Raider GE68 HX 2024', slug: 'msi-raider-ge68-hx-2024', brand: 'MSI', model: 'Raider GE68 HX',
    category_id: CATS.gaming, status: 'active', price_min: 79999, price_max: 109999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80',
    short_description: '16" QHD 240Hz, RTX 4090, Intel Core i9.',
    specs: {
      'Ekran': '16" QHD+ 240Hz, Mini-LED',
      'İşlemci': 'Intel Core i9-14900HX',
      'RAM': '64 GB DDR5',
      'Depolama': '2 TB NVMe SSD',
      'Ekran Kartı': 'NVIDIA GeForce RTX 4090',
      'Pil': '99.9 Wh',
      'Ağırlık': '2.6 kg',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'i9 / RTX 4090', 'RAM': '64 GB', 'Fiyat': '109.999 ₺' },
        { 'Versiyon': 'i9 / RTX 4080', 'RAM': '32 GB', 'Fiyat': '79.999 ₺' },
      ],
    },
  },
  {
    name: 'Omen 16 2024', slug: 'hp-omen-16-2024', brand: 'HP', model: 'Omen 16',
    category_id: CATS.gaming, status: 'active', price_min: 54999, price_max: 74999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80',
    short_description: '16.1" FHD 165Hz, RTX 4060, AMD Ryzen 7.',
    specs: {
      'Ekran': '16.1" FHD 165Hz, IPS',
      'İşlemci': 'AMD Ryzen 7 7745HX',
      'RAM': '16 GB DDR5',
      'Depolama': '512 GB NVMe SSD',
      'Ekran Kartı': 'NVIDIA GeForce RTX 4060',
      'Pil': '83 Wh',
      'Ağırlık': '2.4 kg',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'RTX 4070 / 16 GB', 'Depolama': '1 TB', 'Fiyat': '74.999 ₺' },
        { 'Versiyon': 'RTX 4060 / 16 GB', 'Depolama': '512 GB', 'Fiyat': '54.999 ₺' },
      ],
    },
  },
  {
    name: 'Predator Helios Neo 16', slug: 'acer-predator-helios-neo-16', brand: 'Acer', model: 'Predator Helios Neo 16',
    category_id: CATS.gaming, status: 'active', price_min: 49999, price_max: 67999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80',
    short_description: '16" WUXGA 165Hz, RTX 4060, Intel Core i7.',
    specs: {
      'Ekran': '16" WUXGA 165Hz, IPS',
      'İşlemci': 'Intel Core i7-13700HX',
      'RAM': '16 GB DDR5',
      'Depolama': '512 GB NVMe SSD',
      'Ekran Kartı': 'NVIDIA GeForce RTX 4060',
      'Pil': '90 Wh',
      'Ağırlık': '2.7 kg',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'i7 / RTX 4070 / 32 GB', 'Fiyat': '67.999 ₺' },
        { 'Versiyon': 'i7 / RTX 4060 / 16 GB', 'Fiyat': '49.999 ₺' },
      ],
    },
  },
  {
    name: 'ROG Flow X13 2024', slug: 'asus-rog-flow-x13-2024', brand: 'ASUS', model: 'ROG Flow X13',
    category_id: CATS.gaming, status: 'active', price_min: 64999, price_max: 82999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80',
    short_description: 'Dönebilen ekran, 13.4" 2.5K, RTX 4060, Ryzen 9.',
    specs: {
      'Ekran': '13.4" 2.5K 165Hz, OLED dokunmatik',
      'İşlemci': 'AMD Ryzen 9 8945HS',
      'RAM': '32 GB LPDDR5x',
      'Depolama': '1 TB NVMe SSD',
      'Ekran Kartı': 'NVIDIA GeForce RTX 4060',
      'Pil': '75 Wh',
      'Ağırlık': '1.38 kg',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'RTX 4060 / 32 GB', 'Fiyat': '82.999 ₺' },
        { 'Versiyon': 'RTX 4050 / 16 GB', 'Fiyat': '64.999 ₺' },
      ],
    },
  },
  // ── Acer Laptop ──
  {
    name: 'Swift 14 AI', slug: 'acer-swift-14-ai', brand: 'Acer', model: 'Swift 14 AI',
    category_id: CATS.acer, status: 'active', price_min: 34999, price_max: 42999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
    short_description: 'Intel Core Ultra 7, Copilot+ PC, 14" 2.8K OLED.',
    specs: {
      'Ekran': '14" 2.8K OLED, 120Hz',
      'İşlemci': 'Intel Core Ultra 7 258V',
      'RAM': '32 GB LPDDR5x',
      'Depolama': '1 TB NVMe SSD',
      'Ekran Kartı': 'Intel Arc 140V',
      'Pil': '75 Wh',
      'Ağırlık': '1.19 kg',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'Ultra 7 / 32 GB', 'Fiyat': '42.999 ₺' },
        { 'Versiyon': 'Ultra 5 / 16 GB', 'Fiyat': '34.999 ₺' },
      ],
    },
  },
  {
    name: 'Aspire 5', slug: 'acer-aspire-5', brand: 'Acer', model: 'Aspire 5',
    category_id: CATS.acer, status: 'active', price_min: 19999, price_max: 28999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
    short_description: '15.6" FHD, AMD Ryzen 5, günlük kullanım için ideal.',
    specs: {
      'Ekran': '15.6" FHD IPS, 60Hz',
      'İşlemci': 'AMD Ryzen 5 7530U',
      'RAM': '16 GB DDR4',
      'Depolama': '512 GB NVMe SSD',
      'Ekran Kartı': 'AMD Radeon 610M (entegre)',
      'Pil': '56.5 Wh',
      'Ağırlık': '1.8 kg',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'Ryzen 7 / 16 GB', 'Depolama': '1 TB', 'Fiyat': '28.999 ₺' },
        { 'Versiyon': 'Ryzen 5 / 8 GB', 'Depolama': '512 GB', 'Fiyat': '19.999 ₺' },
      ],
    },
  },
  {
    name: 'Swift Go 14', slug: 'acer-swift-go-14', brand: 'Acer', model: 'Swift Go 14',
    category_id: CATS.acer, status: 'active', price_min: 26999, price_max: 34999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
    short_description: '14" 2.8K OLED, Intel Core Ultra 5, hafif tasarım.',
    specs: {
      'Ekran': '14" 2.8K OLED, 90Hz',
      'İşlemci': 'Intel Core Ultra 5 125H',
      'RAM': '16 GB LPDDR5',
      'Depolama': '512 GB NVMe SSD',
      'Ekran Kartı': 'Intel Arc 7 (entegre)',
      'Pil': '65 Wh',
      'Ağırlık': '1.35 kg',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'Ultra 7 / 32 GB', 'Fiyat': '34.999 ₺' },
        { 'Versiyon': 'Ultra 5 / 16 GB', 'Fiyat': '26.999 ₺' },
      ],
    },
  },
  {
    name: 'Nitro 5 2024', slug: 'acer-nitro-5-2024', brand: 'Acer', model: 'Nitro 5',
    category_id: CATS.acer, status: 'active', price_min: 39999, price_max: 54999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80',
    short_description: '15.6" QHD 165Hz, RTX 4060, Ryzen 7 — uygun fiyatlı oyuncu.',
    specs: {
      'Ekran': '15.6" QHD 165Hz, IPS',
      'İşlemci': 'AMD Ryzen 7 7745HX',
      'RAM': '16 GB DDR5',
      'Depolama': '512 GB NVMe SSD',
      'Ekran Kartı': 'NVIDIA GeForce RTX 4060',
      'Pil': '90 Wh',
      'Ağırlık': '2.7 kg',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'RTX 4070 / 32 GB', 'Fiyat': '54.999 ₺' },
        { 'Versiyon': 'RTX 4060 / 16 GB', 'Fiyat': '39.999 ₺' },
      ],
    },
  },
  // ── ASUS Laptop ──
  {
    name: 'ZenBook 14 OLED', slug: 'asus-zenbook-14-oled-2024', brand: 'ASUS', model: 'ZenBook 14 OLED',
    category_id: CATS.asus, status: 'active', price_min: 37999, price_max: 47999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
    short_description: '14" 2.8K OLED, Intel Core Ultra 7, Copilot+ PC.',
    specs: {
      'Ekran': '14" 2.8K OLED, 120Hz',
      'İşlemci': 'Intel Core Ultra 7 258V',
      'RAM': '32 GB LPDDR5x',
      'Depolama': '1 TB NVMe SSD',
      'Ekran Kartı': 'Intel Arc 140V',
      'Pil': '75 Wh',
      'Ağırlık': '1.2 kg',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'Ultra 7 / 32 GB', 'Fiyat': '47.999 ₺' },
        { 'Versiyon': 'Ultra 5 / 16 GB', 'Fiyat': '37.999 ₺' },
      ],
    },
  },
  {
    name: 'VivoBook 15', slug: 'asus-vivobook-15-2024', brand: 'ASUS', model: 'VivoBook 15',
    category_id: CATS.asus, status: 'active', price_min: 16999, price_max: 24999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
    short_description: '15.6" FHD OLED, AMD Ryzen 5, uygun fiyat.',
    specs: {
      'Ekran': '15.6" FHD OLED, 60Hz',
      'İşlemci': 'AMD Ryzen 5 7530U',
      'RAM': '8 GB DDR4',
      'Depolama': '512 GB NVMe SSD',
      'Ekran Kartı': 'AMD Radeon (entegre)',
      'Pil': '42 Wh',
      'Ağırlık': '1.7 kg',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'Ryzen 7 / 16 GB', 'Fiyat': '24.999 ₺' },
        { 'Versiyon': 'Ryzen 5 / 8 GB', 'Fiyat': '16.999 ₺' },
      ],
    },
  },
  {
    name: 'ExpertBook B5', slug: 'asus-expertbook-b5', brand: 'ASUS', model: 'ExpertBook B5',
    category_id: CATS.asus, status: 'active', price_min: 29999, price_max: 42999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
    short_description: 'İş odaklı, 14" FHD, Intel Core Ultra 5, hafif ve dayanıklı.',
    specs: {
      'Ekran': '14" FHD IPS, 60Hz',
      'İşlemci': 'Intel Core Ultra 5 125H',
      'RAM': '16 GB DDR5',
      'Depolama': '512 GB NVMe SSD',
      'Ekran Kartı': 'Intel Arc (entegre)',
      'Pil': '63 Wh',
      'Ağırlık': '1.4 kg',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'Ultra 7 / 32 GB', 'Fiyat': '42.999 ₺' },
        { 'Versiyon': 'Ultra 5 / 16 GB', 'Fiyat': '29.999 ₺' },
      ],
    },
  },
  {
    name: 'ProArt Studiobook 16', slug: 'asus-proart-studiobook-16', brand: 'ASUS', model: 'ProArt Studiobook 16',
    category_id: CATS.asus, status: 'active', price_min: 72999, price_max: 99999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
    short_description: 'Yaratıcı profesyoneller için — RTX 4070, 16" OLED, AMD Ryzen 9.',
    specs: {
      'Ekran': '16" 3.2K OLED, 120Hz, %100 DCI-P3',
      'İşlemci': 'AMD Ryzen 9 7945HX',
      'RAM': '64 GB DDR5',
      'Depolama': '2 TB NVMe SSD',
      'Ekran Kartı': 'NVIDIA GeForce RTX 4070',
      'Pil': '90 Wh',
      'Ağırlık': '2.4 kg',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'RTX 4070 / 64 GB', 'Fiyat': '99.999 ₺' },
        { 'Versiyon': 'RTX 4060 / 32 GB', 'Fiyat': '72.999 ₺' },
      ],
    },
  },
  // ── İş Laptopu ──
  {
    name: 'EliteBook 840 G11', slug: 'hp-elitebook-840-g11', brand: 'HP', model: 'EliteBook 840 G11',
    category_id: CATS.is, status: 'active', price_min: 49999, price_max: 67999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
    short_description: 'Kurumsal güvenlik, Intel Core Ultra 7, 14" WUXGA.',
    specs: {
      'Ekran': '14" WUXGA IPS, 400 nit',
      'İşlemci': 'Intel Core Ultra 7 165U',
      'RAM': '32 GB DDR5',
      'Depolama': '1 TB NVMe SSD',
      'Ekran Kartı': 'Intel Graphics (entegre)',
      'Pil': '51 Wh',
      'Ağırlık': '1.37 kg',
      'Güvenlik': 'HP Wolf Pro Security, parmak izi, yüz tanıma',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'Ultra 7 / 32 GB', 'Fiyat': '67.999 ₺' },
        { 'Versiyon': 'Ultra 5 / 16 GB', 'Fiyat': '49.999 ₺' },
      ],
    },
  },
  {
    name: 'ThinkPad E16 Gen 2', slug: 'lenovo-thinkpad-e16-gen2', brand: 'Lenovo', model: 'ThinkPad E16',
    category_id: CATS.is, status: 'active', price_min: 32999, price_max: 44999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
    short_description: '16" WUXGA, AMD Ryzen 7, kurumsal dayanıklılık.',
    specs: {
      'Ekran': '16" WUXGA IPS, 60Hz',
      'İşlemci': 'AMD Ryzen 7 7735U',
      'RAM': '16 GB DDR5',
      'Depolama': '512 GB NVMe SSD',
      'Ekran Kartı': 'AMD Radeon 610M (entegre)',
      'Pil': '57 Wh',
      'Ağırlık': '1.97 kg',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'Ryzen 7 / 32 GB', 'Depolama': '1 TB', 'Fiyat': '44.999 ₺' },
        { 'Versiyon': 'Ryzen 5 / 16 GB', 'Depolama': '512 GB', 'Fiyat': '32.999 ₺' },
      ],
    },
  },
  {
    name: 'Latitude 5450', slug: 'dell-latitude-5450', brand: 'Dell', model: 'Latitude 5450',
    category_id: CATS.is, status: 'active', price_min: 44999, price_max: 59999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
    short_description: '14" FHD+, Intel Core Ultra 7, MIL-STD-810H sertifikalı.',
    specs: {
      'Ekran': '14" FHD+ IPS, 300 nit',
      'İşlemci': 'Intel Core Ultra 7 165U',
      'RAM': '32 GB DDR5',
      'Depolama': '512 GB NVMe SSD',
      'Ekran Kartı': 'Intel Graphics (entegre)',
      'Pil': '54 Wh',
      'Ağırlık': '1.52 kg',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'Ultra 7 / 32 GB', 'Fiyat': '59.999 ₺' },
        { 'Versiyon': 'Ultra 5 / 16 GB', 'Fiyat': '44.999 ₺' },
      ],
    },
  },
  {
    name: 'Surface Pro 11', slug: 'microsoft-surface-pro-11', brand: 'Microsoft', model: 'Surface Pro 11',
    category_id: CATS.is, status: 'active', price_min: 52999, price_max: 74999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
    short_description: 'Copilot+ PC, Snapdragon X Elite, 13" 2880x1920 OLED.',
    specs: {
      'Ekran': '13" OLED 2880×1920, 120Hz',
      'İşlemci': 'Qualcomm Snapdragon X Elite X1E-80-100',
      'RAM': '32 GB LPDDR5x',
      'Depolama': '1 TB NVMe SSD',
      'Ekran Kartı': 'Qualcomm Adreno X1E',
      'Pil': '53 Wh',
      'Ağırlık': '895 g (tablet)',
      'İşletim Sistemi': 'Windows 11 Home',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'X Elite / 64 GB', 'Depolama': '1 TB', 'Fiyat': '74.999 ₺' },
        { 'Versiyon': 'X Plus / 16 GB', 'Depolama': '256 GB', 'Fiyat': '52.999 ₺' },
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
