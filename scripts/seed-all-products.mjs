/**
 * seed-all-products.mjs
 * Tüm kategoriler için Türkiye 2026 ürün veritabanı:
 *   - Telefonlar (iPhone, Android)
 *   - Laptoplar (Gaming, Ultrabook, İş)
 *   - Beyaz Eşya (Çamaşır, Buzdolabı, Bulaşık, Fırın)
 *   - TV & Monitörler (OLED, QLED, Gaming Monitör)
 *   - Ses Sistemleri (ANC Kulaklık, TWS, Bluetooth Hoparlör)
 *
 * Her ürün: base model + "Depolama/Donanım/Beden Seçenekleri" variants array.
 * Görsel: Pexels API ile otomatik çekilir.
 *
 * Çalıştır: cd scripts && node seed-all-products.mjs
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

const SUPABASE_URL         = process.env.NEXT_PUBLIC_SUPABASE_URL  || env['NEXT_PUBLIC_SUPABASE_URL'];
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY      || env['SUPABASE_SERVICE_KEY'];
const PEXELS_KEY           = process.env.PEXELS_API_KEY            || env['PEXELS_API_KEY'];

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL veya SUPABASE_SERVICE_KEY eksik');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getCatId(slug) {
  const { data } = await supabase.from('categories').select('id').eq('slug', slug).single();
  if (!data) console.warn(`  ⚠️  Kategori bulunamadı: ${slug}`);
  return data?.id ?? null;
}

async function fetchPexelsImage(query) {
  if (!PEXELS_KEY) return null;
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape`,
      { headers: { Authorization: PEXELS_KEY } }
    );
    const data = await res.json();
    return data.photos?.[0]?.src?.large ?? null;
  } catch { return null; }
}

async function insertProduct(product) {
  const { data: existing } = await supabase
    .from('products').select('id').eq('slug', product.slug).single();
  if (existing) {
    process.stdout.write(`  ⏭  Mevcut: ${product.slug}\n`);
    return null;
  }
  const { data, error } = await supabase.from('products').insert(product).select('id').single();
  if (error) {
    console.error(`  ❌ Hata (${product.slug}): ${error.message}`);
    return null;
  }
  console.log(`  ✅ Eklendi: ${product.brand} ${product.name}`);
  return data.id;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Tüm kategoriler seed başlıyor...\n');
  const now = new Date().toISOString();
  let added = 0, skipped = 0;

  // ═══════════════════════════════════════════════════════════════════
  //  BÖLÜM 1: TELEFONLAR
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n📱 TELEFONLAR\n' + '─'.repeat(50));

  const catIphone      = await getCatId('iphone-pro');
  const catIphoneStd   = await getCatId('iphone-standart');
  const catSamsung     = await getCatId('samsung-telefonlar');
  const catGoogle      = await getCatId('google-telefonlar');
  const catXiaomi      = await getCatId('xiaomi-telefonlar');

  const phones = [
    // ── iPhone 16 Pro Max ──────────────────────────────────────────
    {
      category_id: catIphone,
      name: 'iPhone 16 Pro Max', slug: 'apple-iphone-16-pro-max',
      brand: 'Apple', model: 'iPhone 16 Pro Max', model_year: 2024,
      price_min: 89_999, price_max: 119_999, currency: 'TRY',
      status: 'active', is_featured: true, published_at: now, source: 'manual',
      short_description: 'Apple A18 Pro çip, 5x optik zoom terahedal telezoom ve 4K/120fps video. 6.9 inç Super Retina XDR ekranla iPhone\'un zirvesi.',
      description: 'iPhone 16 Pro Max, Apple\'ın en güçlü mobil çipi A18 Pro ve yeni "Camera Control" düğmesiyle fotoğrafçılık deneyimini yeniden tanımladı. 48MP ana + 48MP ultrawide + 12MP telezoom kamera sistemi ve ProRes video desteğiyle profesyonel düzeyde içerik üretimi sunuyor.',
      specs: {
        'Depolama Seçenekleri': [
          { 'Kapasite': '256 GB', 'Renk': 'Çoklu Renk', 'RAM': '8 GB', 'Fiyat': '89.999 ₺' },
          { 'Kapasite': '512 GB', 'Renk': 'Çoklu Renk', 'RAM': '8 GB', 'Fiyat': '99.999 ₺' },
          { 'Kapasite': '1 TB',   'Renk': 'Çoklu Renk', 'RAM': '8 GB', 'Fiyat': '119.999 ₺' },
        ],
        'Çip':           'Apple A18 Pro (3nm)',
        'Ekran':         '6.9 inç Super Retina XDR OLED, 120Hz ProMotion',
        'Çözünürlük':    '2868 × 1320 px (460 ppi)',
        'Ana Kamera':    '48 MP f/1.78 (OIS, sensor-shift)',
        'Ultrawide':     '48 MP f/2.2 (autofocus)',
        'Telezoom':      '12 MP f/2.8 5x optik zoom (tetrahedal)',
        'Video':         '4K / 120fps (ProRes), Dolby Vision',
        'Pil':           '4.685 mAh',
        'Şarj':          '27W kablolu, 25W MagSafe, 15W Qi2',
        'Bağlantı':      'USB-C 3 (USB 3.2 Gen 2)',
        'Boyutlar':      '163.0 × 77.6 × 8.25 mm',
        'Ağırlık':       '227 g',
        'Renkler':       'Black Titanium, White Titanium, Natural Titanium, Desert Titanium',
        'Garanti':       '1 yıl (Apple Turkey)',
      },
      image_url: await fetchPexelsImage('iPhone 16 Pro Max titanium apple smartphone'),
      meta_title: 'Apple iPhone 16 Pro Max Fiyat ve Özellikleri | Compario',
      meta_description: 'iPhone 16 Pro Max 256GB fiyatı 89.999 TL. A18 Pro çip, 5x optik zoom, 4K/120fps ProRes.',
    },

    // ── iPhone 16 Pro ──────────────────────────────────────────────
    {
      category_id: catIphone,
      name: 'iPhone 16 Pro', slug: 'apple-iphone-16-pro',
      brand: 'Apple', model: 'iPhone 16 Pro', model_year: 2024,
      price_min: 74_999, price_max: 104_999, currency: 'TRY',
      status: 'active', is_featured: true, published_at: now, source: 'manual',
      short_description: 'A18 Pro çip, yeni Camera Control ve 4K/120fps ProRes video. 6.3 inç ekran, daha kompakt Pro deneyimi.',
      description: 'iPhone 16 Pro, büyük kardeşi Pro Max ile aynı A18 Pro çip ve kamera sistemine sahip, daha kompakt 6.3 inç formda. Yeni Camera Control düğmesi, Action Button ve gelişmiş ısıl yönetim sistemi Pro deneyimini üst seviyeye taşıdı.',
      specs: {
        'Depolama Seçenekleri': [
          { 'Kapasite': '128 GB', 'RAM': '8 GB', 'Fiyat': '74.999 ₺' },
          { 'Kapasite': '256 GB', 'RAM': '8 GB', 'Fiyat': '84.999 ₺' },
          { 'Kapasite': '512 GB', 'RAM': '8 GB', 'Fiyat': '94.999 ₺' },
          { 'Kapasite': '1 TB',   'RAM': '8 GB', 'Fiyat': '104.999 ₺' },
        ],
        'Çip':       'Apple A18 Pro (3nm)',
        'Ekran':     '6.3 inç Super Retina XDR OLED, 120Hz ProMotion',
        'Ana Kamera':'48 MP f/1.78',
        'Telezoom':  '12 MP f/2.8 5x optik zoom',
        'Video':     '4K / 120fps ProRes',
        'Pil':       '3.582 mAh',
        'Şarj':      '27W kablolu, 25W MagSafe',
        'Boyutlar':  '149.6 × 71.5 × 8.25 mm',
        'Ağırlık':   '199 g',
        'Garanti':   '1 yıl (Apple Turkey)',
      },
      image_url: await fetchPexelsImage('iPhone 16 Pro apple smartphone titanium'),
    },

    // ── iPhone 16 ─────────────────────────────────────────────────
    {
      category_id: catIphoneStd,
      name: 'iPhone 16', slug: 'apple-iphone-16',
      brand: 'Apple', model: 'iPhone 16', model_year: 2024,
      price_min: 54_999, price_max: 74_999, currency: 'TRY',
      status: 'active', is_featured: false, published_at: now, source: 'manual',
      short_description: 'A16 Bionic çip, Camera Control düğmesi, 48MP ana kamera ve iOS 18. Standart iPhone serisinin yeni nesli.',
      description: 'iPhone 16, A16 Bionic çip ve yeni Camera Control düğmesiyle önceki nesle göre önemli bir yükseltme sunuyor. 48MP kamera sistemi, Action Button ve USB-C bağlantısı artık standartta.',
      specs: {
        'Depolama Seçenekleri': [
          { 'Kapasite': '128 GB', 'Fiyat': '54.999 ₺' },
          { 'Kapasite': '256 GB', 'Fiyat': '62.999 ₺' },
          { 'Kapasite': '512 GB', 'Fiyat': '74.999 ₺' },
        ],
        'Çip':       'Apple A16 Bionic (4nm)',
        'Ekran':     '6.1 inç Super Retina XDR OLED, 60Hz',
        'Ana Kamera':'48 MP f/1.6',
        'Ultrawide': '12 MP f/2.2',
        'Pil':       '3.561 mAh',
        'Şarj':      '25W kablolu, 15W MagSafe',
        'Boyutlar':  '147.6 × 71.6 × 7.80 mm',
        'Ağırlık':   '170 g',
        'Garanti':   '1 yıl (Apple Turkey)',
      },
      image_url: await fetchPexelsImage('iPhone 16 apple smartphone colorful'),
    },

    // ── Samsung Galaxy S25 Ultra ───────────────────────────────────
    {
      category_id: catSamsung,
      name: 'Galaxy S25 Ultra', slug: 'samsung-galaxy-s25-ultra',
      brand: 'Samsung', model: 'Galaxy S25 Ultra', model_year: 2025,
      price_min: 84_999, price_max: 104_999, currency: 'TRY',
      status: 'active', is_featured: true, published_at: now, source: 'manual',
      short_description: 'Snapdragon 8 Elite, 200MP kamera, 50x uzaklaştırma ve entegre S Pen. Samsung AI Galaxy özellikleriyle Android\'in en güçlüsü.',
      description: 'Galaxy S25 Ultra, Snapdragon 8 Elite çipi ve 200MP kamera sistemiyle Android üst segmentinin referans noktası. S Pen artık daha ince gövdeye rağmen entegre gelmeye devam ediyor. Samsung Galaxy AI özellikleri (Circle to Search, Live Translate, Note Assist) iş akışını dönüştürüyor.',
      specs: {
        'Depolama Seçenekleri': [
          { 'Kapasite': '256 GB', 'RAM': '12 GB', 'Fiyat': '84.999 ₺' },
          { 'Kapasite': '512 GB', 'RAM': '12 GB', 'Fiyat': '94.999 ₺' },
          { 'Kapasite': '1 TB',   'RAM': '12 GB', 'Fiyat': '104.999 ₺' },
        ],
        'Çip':           'Snapdragon 8 Elite (3nm)',
        'Ekran':         '6.9 inç Dynamic AMOLED 2X, 120Hz, 2600 nit',
        'Ana Kamera':    '200 MP f/1.7 (OIS)',
        'Telezoom 1':    '10 MP f/2.4 3x optik',
        'Telezoom 2':    '50 MP f/3.4 5x optik (50x uzaklaştırma)',
        'Ultrawide':     '12 MP f/2.2',
        'S Pen':         'Entegre (Bluetooth yok, Bluetooth-less)',
        'Pil':           '5.000 mAh',
        'Şarj':          '45W kablolu, 15W kablosuz, 4.5W ters kablosuz',
        'AI Özellikler': 'Circle to Search, Live Translate, Note Assist, ProVisual Engine',
        'Boyutlar':      '162.8 × 77.6 × 8.2 mm',
        'Ağırlık':       '218 g',
        'Garanti':       '2 yıl (Samsung Turkey)',
      },
      image_url: await fetchPexelsImage('Samsung Galaxy S25 Ultra smartphone android'),
    },

    // ── Samsung Galaxy S25+ ────────────────────────────────────────
    {
      category_id: catSamsung,
      name: 'Galaxy S25+', slug: 'samsung-galaxy-s25-plus',
      brand: 'Samsung', model: 'Galaxy S25+', model_year: 2025,
      price_min: 59_999, price_max: 69_999, currency: 'TRY',
      status: 'active', is_featured: false, published_at: now, source: 'manual',
      short_description: 'Snapdragon 8 Elite, 6.7 inç büyük ekran ve 50MP ana kamera. Galaxy S25 ailesinin en dengeli modeli.',
      description: 'Galaxy S25+, S25 Ultra\'nın AI özelliklerini daha büyük ekranda ve daha uygun fiyatta sunuyor. Snapdragon 8 Elite ve 12GB RAM kombinasyonu gelecek yıllarca güçlü performans garantiliyor.',
      specs: {
        'Depolama Seçenekleri': [
          { 'Kapasite': '256 GB', 'RAM': '12 GB', 'Fiyat': '59.999 ₺' },
          { 'Kapasite': '512 GB', 'RAM': '12 GB', 'Fiyat': '69.999 ₺' },
        ],
        'Çip':       'Snapdragon 8 Elite (3nm)',
        'Ekran':     '6.7 inç Dynamic AMOLED 2X, 120Hz',
        'Ana Kamera':'50 MP f/1.8',
        'Telezoom':  '10 MP 3x optik',
        'Pil':       '4.900 mAh',
        'Şarj':      '45W kablolu, 15W kablosuz',
        'Ağırlık':   '190 g',
        'Garanti':   '2 yıl (Samsung Turkey)',
      },
      image_url: await fetchPexelsImage('Samsung Galaxy S25 Plus smartphone'),
    },

    // ── Google Pixel 9 Pro XL ──────────────────────────────────────
    {
      category_id: catGoogle,
      name: 'Pixel 9 Pro XL', slug: 'google-pixel-9-pro-xl',
      brand: 'Google', model: 'Pixel 9 Pro XL', model_year: 2024,
      price_min: 62_999, price_max: 79_999, currency: 'TRY',
      status: 'active', is_featured: false, published_at: now, source: 'manual',
      short_description: 'Google Tensor G4, 50MP 5x telezoom, 7 yıl Android güncelleme ve en iyi fotoğraf AI\'sı. Google Camera deneyiminin en üst modeli.',
      description: 'Pixel 9 Pro XL, Google\'ın kendi Tensor G4 çipiyle ve sektörün en iyi hesaplamalı fotoğrafçılık altyapısıyla geliyor. Magic Eraser, Best Take, Photo Unblur ve Gemini AI entegrasyonuyla 7 yıl güvenlik + Android güncellemesi garantisi sunuyor.',
      specs: {
        'Depolama Seçenekleri': [
          { 'Kapasite': '128 GB', 'RAM': '16 GB', 'Fiyat': '62.999 ₺' },
          { 'Kapasite': '256 GB', 'RAM': '16 GB', 'Fiyat': '71.999 ₺' },
          { 'Kapasite': '512 GB', 'RAM': '16 GB', 'Fiyat': '79.999 ₺' },
        ],
        'Çip':           'Google Tensor G4 (4nm, Samsung)',
        'Ekran':         '6.8 inç LTPO OLED, 1-120Hz, 3000 nit peak',
        'Ana Kamera':    '50 MP f/1.68 (OIS)',
        'Ultrawide':     '48 MP f/1.7 autofocus',
        'Telezoom':      '48 MP f/2.8 5x optik',
        'Güncelleme':    '7 yıl Android + güvenlik garantisi',
        'AI':            'Gemini AI, Magic Eraser, Best Take, Real Tone',
        'Pil':           '5.060 mAh',
        'Şarj':          '37W kablolu, 23W kablosuz, ters kablosuz',
        'Boyutlar':      '162.8 × 76.6 × 8.5 mm',
        'Ağırlık':       '221 g',
        'Garanti':       '2 yıl',
      },
      image_url: await fetchPexelsImage('Google Pixel 9 Pro smartphone android'),
    },

    // ── Xiaomi 14 Ultra ───────────────────────────────────────────
    {
      category_id: catXiaomi,
      name: '14 Ultra', slug: 'xiaomi-14-ultra',
      brand: 'Xiaomi', model: '14 Ultra', model_year: 2024,
      price_min: 49_999, price_max: 64_999, currency: 'TRY',
      status: 'active', is_featured: false, published_at: now, source: 'manual',
      short_description: 'Leica 1 inç sensörlü dört kamera, Snapdragon 8 Gen 3 ve 90W hızlı şarj. Fotoğrafçılar için tercih.',
      description: 'Xiaomi 14 Ultra, Leica ile ortaklığının en üst ürünü. 1 inç Sony LYT-900 sensör, sabit f/1.63 açıklık ve dört ayrı kamera modülüyle kompromissiz fotoğraf kalitesi sunuyor. 90W hızlı şarj ve 50W kablosuz şarj ile batarya kaygısı kalmıyor.',
      specs: {
        'Depolama Seçenekleri': [
          { 'Kapasite': '256 GB', 'RAM': '12 GB', 'Fiyat': '49.999 ₺' },
          { 'Kapasite': '512 GB', 'RAM': '16 GB', 'Fiyat': '57.999 ₺' },
          { 'Kapasite': '1 TB',   'RAM': '16 GB', 'Fiyat': '64.999 ₺' },
        ],
        'Çip':           'Snapdragon 8 Gen 3 (4nm)',
        'Ekran':         '6.73 inç LTPO AMOLED, 1-120Hz, 3000 nit',
        'Ana Kamera':    '50 MP 1 inç Sony LYT-900 f/1.63 (Leica)',
        'Ultrawide':     '50 MP f/1.8',
        'Telezoom 1':    '50 MP 3x optik',
        'Telezoom 2':    '50 MP 5x optik (periskop)',
        'Pil':           '5.300 mAh',
        'Şarj':          '90W kablolu, 80W kablosuz, 10W ters',
        'Ağırlık':       '229.5 g',
        'Garanti':       '2 yıl',
      },
      image_url: await fetchPexelsImage('Xiaomi flagship smartphone camera'),
    },
  ];

  for (const p of phones) {
    const r = await insertProduct(p);
    r ? added++ : skipped++;
  }

  // ═══════════════════════════════════════════════════════════════════
  //  BÖLÜM 2: LAPTOPLAR
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n💻 LAPTOPLAR\n' + '─'.repeat(50));

  const catMacBook = await getCatId('apple-macbook');
  const catDellXPS = await getCatId('dell-xps');
  const catAsusRog = await getCatId('asus-rog');
  const catLenovoLegion = await getCatId('lenovo-legion');
  const catLenovoThink  = await getCatId('lenovo-thinkpad');
  const catHp     = await getCatId('hp-laptop');

  const laptops = [
    // ── MacBook Pro 16 M4 Pro ──────────────────────────────────────
    {
      category_id: catMacBook,
      name: 'MacBook Pro 16"', slug: 'apple-macbook-pro-16-m4',
      brand: 'Apple', model: 'MacBook Pro 16"', model_year: 2024,
      price_min: 99_999, price_max: 189_999, currency: 'TRY',
      status: 'active', is_featured: true, published_at: now, source: 'manual',
      short_description: 'M4 Pro / M4 Max çip, Liquid Retina XDR ekran ve 22+ saat pil ömrü. Profesyonel içerik üreticileri için referans laptop.',
      description: 'MacBook Pro 16" M4 Pro, Apple\'ın en güçlü laptop çiplerini 16.2 inç mini-LED ekranla buluşturuyor. M4 Pro konfigürasyonunda 24GB unified memory ve 273 GB/s bellek bandwith\'i ile video editing, 3D render ve makine öğrenmesi görevlerinde kıyaslanacak rakip bulmak zorlaşıyor.',
      specs: {
        'Donanım Seçenekleri': [
          { 'Çip': 'M4 Pro 12-core CPU',  'GPU': '20-core',  'RAM': '24 GB', 'Depolama': '512 GB SSD', 'Fiyat':  '99.999 ₺' },
          { 'Çip': 'M4 Pro 12-core CPU',  'GPU': '20-core',  'RAM': '24 GB', 'Depolama': '1 TB SSD',   'Fiyat': '109.999 ₺' },
          { 'Çip': 'M4 Pro 14-core CPU',  'GPU': '20-core',  'RAM': '24 GB', 'Depolama': '1 TB SSD',   'Fiyat': '119.999 ₺' },
          { 'Çip': 'M4 Pro 14-core CPU',  'GPU': '20-core',  'RAM': '48 GB', 'Depolama': '1 TB SSD',   'Fiyat': '134.999 ₺' },
          { 'Çip': 'M4 Max 14-core CPU',  'GPU': '32-core',  'RAM': '36 GB', 'Depolama': '1 TB SSD',   'Fiyat': '149.999 ₺' },
          { 'Çip': 'M4 Max 16-core CPU',  'GPU': '40-core',  'RAM': '64 GB', 'Depolama': '1 TB SSD',   'Fiyat': '174.999 ₺' },
          { 'Çip': 'M4 Max 16-core CPU',  'GPU': '40-core',  'RAM': '128 GB','Depolama': '1 TB SSD',   'Fiyat': '189.999 ₺' },
        ],
        'Ekran':         '16.2 inç Liquid Retina XDR mini-LED, 3456×2234, 1000 nit SDR / 1600 nit HDR',
        'ProMotion':     '1-120Hz adaptif',
        'Pil Ömrü':      '22 saate kadar (Apple iddiası)',
        'Şarj':          '140W USB-C MagSafe 3',
        'Portlar':       'MagSafe 3 + 3× Thunderbolt 4 + HDMI 2.1 + SD kart + 3.5mm kulaklık',
        'Ses Sistemi':   '6 hoparlör (Spatial Audio)',
        'Klavye':        'Magic Keyboard Touch ID + Touch Bar yok (2024 model)',
        'Kamera':        '12 MP Center Stage',
        'Boyutlar':      '357.9 × 248.1 × 16.8 mm',
        'Ağırlık':       '2.14 kg',
        'Renkler':       'Space Black, Silver',
        'Garanti':       '1 yıl (Apple Turkey), AppleCare+ opsiyonel',
      },
      image_url: await fetchPexelsImage('MacBook Pro laptop apple silver desk'),
    },

    // ── MacBook Air 15 M3 ──────────────────────────────────────────
    {
      category_id: catMacBook,
      name: 'MacBook Air 15"', slug: 'apple-macbook-air-15-m3',
      brand: 'Apple', model: 'MacBook Air 15"', model_year: 2024,
      price_min: 49_999, price_max: 79_999, currency: 'TRY',
      status: 'active', is_featured: true, published_at: now, source: 'manual',
      short_description: 'M3 çip, 15.3 inç Liquid Retina ekran, fanless tasarım ve 18 saat pil. En iyi genel kullanım laptopu.',
      description: 'MacBook Air 15" M3, fanless (sessiz) tasarımı ve 15.3 inç büyük ekranıyla verimlilik odaklı kullanıcılar için ideal. M3 çipinin neural engine\'i ile yapay zeka görevlerini hızla işliyor. Thunderbolt 4 çift harici monitör desteği sayesinde üç ekranlı bir iş istasyonu kurabilirsiniz.',
      specs: {
        'Donanım Seçenekleri': [
          { 'Çip': 'M3 8-core CPU', 'GPU': '10-core', 'RAM': '8 GB',  'Depolama': '256 GB', 'Fiyat': '49.999 ₺' },
          { 'Çip': 'M3 8-core CPU', 'GPU': '10-core', 'RAM': '8 GB',  'Depolama': '512 GB', 'Fiyat': '57.999 ₺' },
          { 'Çip': 'M3 8-core CPU', 'GPU': '10-core', 'RAM': '16 GB', 'Depolama': '512 GB', 'Fiyat': '64.999 ₺' },
          { 'Çip': 'M3 8-core CPU', 'GPU': '10-core', 'RAM': '24 GB', 'Depolama': '1 TB',   'Fiyat': '79.999 ₺' },
        ],
        'Ekran':     '15.3 inç Liquid Retina IPS, 2880×1864, 500 nit, True Tone',
        'Pil Ömrü': '18 saate kadar',
        'Şarj':     '35W çift USB-C adaptör (kutu içinde)',
        'Portlar':  'MagSafe 3 + 2× Thunderbolt 3 + 3.5mm kulaklık',
        'Fanless':  'Evet — tamamen sessiz çalışma',
        'Kamera':   '1080p FaceTime HD',
        'Boyutlar': '340.4 × 237.6 × 11.5 mm',
        'Ağırlık':  '1.51 kg',
        'Renkler':  'Midnight, Starlight, Space Gray, Silver',
        'Garanti':  '1 yıl (Apple Turkey)',
      },
      image_url: await fetchPexelsImage('MacBook Air laptop apple minimal'),
    },

    // ── Dell XPS 15 ───────────────────────────────────────────────
    {
      category_id: catDellXPS,
      name: 'XPS 15 9530', slug: 'dell-xps-15-9530',
      brand: 'Dell', model: 'XPS 15', model_year: 2023,
      price_min: 64_999, price_max: 119_999, currency: 'TRY',
      status: 'active', is_featured: false, published_at: now, source: 'manual',
      short_description: 'Intel Core i7/i9, RTX 4060/4070 ve OLED 3.5K ekran seçeneği. Windows premium laptop\'larının en iyi tasarımı.',
      description: 'Dell XPS 15, ince çerçeveli InfinityEdge ekranı ve CNC alüminyum kasasıyla Windows dünyasının tasarım lideri. 13. nesil Intel ile NVIDIA RTX 40 serisi kombinasyonu yaratıcı profesyoneller için güçlü bir platform sunuyor.',
      specs: {
        'Donanım Seçenekleri': [
          { 'İşlemci': 'Core i7-13700H', 'GPU': 'RTX 4060 8GB', 'RAM': '16 GB', 'Depolama': '512 GB', 'Ekran': 'FHD+ IPS',   'Fiyat': '64.999 ₺' },
          { 'İşlemci': 'Core i7-13700H', 'GPU': 'RTX 4060 8GB', 'RAM': '32 GB', 'Depolama': '1 TB',   'Ekran': 'FHD+ IPS',   'Fiyat': '79.999 ₺' },
          { 'İşlemci': 'Core i7-13700H', 'GPU': 'RTX 4070 8GB', 'RAM': '32 GB', 'Depolama': '1 TB',   'Ekran': 'OLED 3.5K',  'Fiyat': '94.999 ₺' },
          { 'İşlemci': 'Core i9-13900H', 'GPU': 'RTX 4070 8GB', 'RAM': '64 GB', 'Depolama': '2 TB',   'Ekran': 'OLED 3.5K',  'Fiyat': '119.999 ₺' },
        ],
        'Ekran Boyutu': '15.6 inç',
        'Çözünürlük':   'FHD+ 1920×1200 IPS veya OLED 3456×2160 (3.5K)',
        'Portlar':      '2× Thunderbolt 4 + USB-A 3.2 + SD kart + 3.5mm',
        'Pil':          '86 Wh',
        'Şarj':         '130W USB-C',
        'Boyutlar':     '344.4 × 230.1 × 18.0 mm',
        'Ağırlık':      '1.86 kg',
        'Garanti':      '1 yıl (Dell Turkey)',
      },
      image_url: await fetchPexelsImage('Dell XPS laptop premium windows'),
    },

    // ── ASUS ROG Zephyrus G14 ─────────────────────────────────────
    {
      category_id: catAsusRog,
      name: 'ROG Zephyrus G14 (2024)', slug: 'asus-rog-zephyrus-g14-2024',
      brand: 'ASUS', model: 'ROG Zephyrus G14', model_year: 2024,
      price_min: 74_999, price_max: 109_999, currency: 'TRY',
      status: 'active', is_featured: true, published_at: now, source: 'manual',
      short_description: 'AMD Ryzen AI 9 HX 370, RTX 4060/4070, OLED 120Hz ekran ve 14 inç taşınabilir formda. En iyi taşınabilir gaming laptop.',
      description: 'ROG Zephyrus G14 (2024), AMD\'nin en güçlü mobil işlemcisi Ryzen AI 9 HX 370\'i NVIDIA RTX 40 serisiyle bir araya getiriyor. 14 inç formdaki OLED 2880×1800 120Hz ekranı ve 73Wh piliyle hem çalışma hem oyun için mükemmel denge sunuyor.',
      specs: {
        'Donanım Seçenekleri': [
          { 'İşlemci': 'Ryzen 9 8945HS',    'GPU': 'RTX 4060 8GB', 'RAM': '16 GB', 'Depolama': '1 TB', 'Fiyat':  '74.999 ₺' },
          { 'İşlemci': 'Ryzen AI 9 HX 370', 'GPU': 'RTX 4060 8GB', 'RAM': '32 GB', 'Depolama': '1 TB', 'Fiyat':  '84.999 ₺' },
          { 'İşlemci': 'Ryzen AI 9 HX 370', 'GPU': 'RTX 4070 8GB', 'RAM': '32 GB', 'Depolama': '1 TB', 'Fiyat':  '99.999 ₺' },
          { 'İşlemci': 'Ryzen AI 9 HX 370', 'GPU': 'RTX 4070 8GB', 'RAM': '32 GB', 'Depolama': '2 TB', 'Fiyat': '109.999 ₺' },
        ],
        'Ekran':         '14 inç OLED 2880×1800, 120Hz, 0.2ms, 600 nit (HDR: 1000 nit)',
        'AMD NPU':       'XDNA 2 (AI işlemleri)',
        'Portlar':       'USB4 + USB-C 3.2 Gen2 × 2 + USB-A × 2 + HDMI 2.1 + microSD',
        'Pil':           '73 Wh',
        'TGP (GPU)':     '100W (RTX 4060) / 100W (RTX 4070)',
        'Soğutma':       'Tri-fan AeroActive Cooler opsiyonel',
        'Ağırlık':       '1.65 kg',
        'Boyutlar':      '312.0 × 220.0 × 18.5 mm',
        'Garanti':       '2 yıl (ASUS Turkey)',
      },
      image_url: await fetchPexelsImage('gaming laptop RGB ASUS ROG keyboard'),
    },

    // ── Lenovo Legion 5 Pro ───────────────────────────────────────
    {
      category_id: catLenovoLegion,
      name: 'Legion 5 Pro Gen 9', slug: 'lenovo-legion-5-pro-gen9',
      brand: 'Lenovo', model: 'Legion 5 Pro', model_year: 2024,
      price_min: 64_999, price_max: 99_999, currency: 'TRY',
      status: 'active', is_featured: false, published_at: now, source: 'manual',
      short_description: 'AMD Ryzen 7 8845HS, RTX 4060/4070 TGP 140W ve 16 inç 165Hz IPS ekran. Fiyat-performans gaming laptoplarının lideri.',
      description: 'Legion 5 Pro Gen 9, yüksek TGP değerleri ve agresif soğutma sistemiyle gaming laptop segmentinin fiyat-performans şampiyonu. 16 inç 2.5K 165Hz ekranı ve MUX Switch teknolojisiyle oyunlarda en iyi görsel deneyimi sunuyor.',
      specs: {
        'Donanım Seçenekleri': [
          { 'İşlemci': 'Ryzen 7 8845HS', 'GPU': 'RTX 4060 8GB TGP 140W', 'RAM': '16 GB', 'Depolama': '512 GB', 'Fiyat': '64.999 ₺' },
          { 'İşlemci': 'Ryzen 7 8845HS', 'GPU': 'RTX 4060 8GB TGP 140W', 'RAM': '32 GB', 'Depolama': '1 TB',   'Fiyat': '74.999 ₺' },
          { 'İşlemci': 'Ryzen 9 8945HS', 'GPU': 'RTX 4070 8GB TGP 140W', 'RAM': '32 GB', 'Depolama': '1 TB',   'Fiyat': '89.999 ₺' },
          { 'İşlemci': 'Ryzen 9 8945HS', 'GPU': 'RTX 4070 8GB TGP 140W', 'RAM': '64 GB', 'Depolama': '2 TB',   'Fiyat': '99.999 ₺' },
        ],
        'Ekran':     '16 inç IPS 2560×1600, 165Hz, 500 nit',
        'MUX Switch':'Evet (iGPU bypass, +%10-15 FPS)',
        'RAM Tipi':  'DDR5 5200MHz (2× DIMM yuvası)',
        'Portlar':   'USB4 + 2× USB-A + USB-C (şarj) + HDMI 2.1 + Ethernet + SD kart',
        'Soğutma':   'Legion Coldfront 5.0 (çift fan + 4 çıkış)',
        'Pil':       '80 Wh',
        'Ağırlık':   '2.4 kg',
        'Garanti':   '2 yıl (Lenovo Turkey)',
      },
      image_url: await fetchPexelsImage('Lenovo Legion gaming laptop'),
    },

    // ── Lenovo ThinkPad X1 Carbon ─────────────────────────────────
    {
      category_id: catLenovoThink,
      name: 'ThinkPad X1 Carbon Gen 12', slug: 'lenovo-thinkpad-x1-carbon-gen12',
      brand: 'Lenovo', model: 'ThinkPad X1 Carbon', model_year: 2024,
      price_min: 64_999, price_max: 99_999, currency: 'TRY',
      status: 'active', is_featured: false, published_at: now, source: 'manual',
      short_description: 'Intel Core Ultra 7, 14 inç 2.8K OLED ekran, 1.12 kg hafiflik ve kurumsal güvenlik. İş dünyasının en hafif laptoplarından.',
      description: 'ThinkPad X1 Carbon Gen 12, Intel Core Ultra 7 (Meteor Lake) ile yapay zeka destekli görev yönetimi sunuyor. MIL-SPEC 810H sertifikası, TPM 2.0 güvenlik çipi ve 1.12 kg ağırlığıyla hassas iş seyahatlerinde yorulmadan çalışma imkânı veriyor.',
      specs: {
        'Donanım Seçenekleri': [
          { 'İşlemci': 'Core Ultra 5 125U',  'RAM': '16 GB', 'Depolama': '512 GB', 'Ekran': 'WUXGA IPS',   'Fiyat': '64.999 ₺' },
          { 'İşlemci': 'Core Ultra 7 165U',  'RAM': '16 GB', 'Depolama': '512 GB', 'Ekran': 'WUXGA IPS',   'Fiyat': '74.999 ₺' },
          { 'İşlemci': 'Core Ultra 7 165U',  'RAM': '32 GB', 'Depolama': '1 TB',   'Ekran': '2.8K OLED',   'Fiyat': '89.999 ₺' },
          { 'İşlemci': 'Core Ultra 7 165H',  'RAM': '64 GB', 'Depolama': '2 TB',   'Ekran': '2.8K OLED',   'Fiyat': '99.999 ₺' },
        ],
        'Ağırlık':       '1.12 kg',
        'Boyutlar':      '315.6 × 222.5 × 14.9 mm',
        'Sertifikalar':  'MIL-SPEC 810H, Intel Evo',
        'Güvenlik':      'TPM 2.0, IR kamera (Windows Hello), parmak izi okuyucu',
        'Klavye':        'ThinkPad klavye (spill-resistant)',
        'Portlar':       '2× Thunderbolt 4 + 2× USB-A + HDMI 2.1 + Headphone',
        'Pil':           '57 Wh',
        'Şarj':          '65W USB-C',
        'Garanti':       '3 yıl (Lenovo Turkey Premier)',
      },
      image_url: await fetchPexelsImage('ThinkPad business laptop ultrabook'),
    },

    // ── HP EliteBook 840 ──────────────────────────────────────────
    {
      category_id: catHp,
      name: 'EliteBook 840 G11', slug: 'hp-elitebook-840-g11',
      brand: 'HP', model: 'EliteBook 840', model_year: 2024,
      price_min: 54_999, price_max: 84_999, currency: 'TRY',
      status: 'active', is_featured: false, published_at: now, source: 'manual',
      short_description: 'Intel Core Ultra 7, 14 inç 2.8K IPS ekran ve HP Wolf Security ile kurumsal iş laptopu. 5G opsiyonel.',
      description: 'EliteBook 840 G11, HP\'nin amiral gemisi iş laptopu serisinin en yeni versiyonu. Intel Core Ultra işlemci, HP Wolf Security ve Sure View gizlilik ekranıyla kurumsal IT departmanlarının ilk tercihi.',
      specs: {
        'Donanım Seçenekleri': [
          { 'İşlemci': 'Core Ultra 5 135U', 'RAM': '16 GB', 'Depolama': '512 GB', 'Ekran': 'FHD+ IPS',  'Fiyat': '54.999 ₺' },
          { 'İşlemci': 'Core Ultra 7 165U', 'RAM': '16 GB', 'Depolama': '512 GB', 'Ekran': 'FHD+ IPS',  'Fiyat': '64.999 ₺' },
          { 'İşlemci': 'Core Ultra 7 165U', 'RAM': '32 GB', 'Depolama': '1 TB',   'Ekran': '2.8K IPS',  'Fiyat': '79.999 ₺' },
          { 'İşlemci': 'Core Ultra 7 165H', 'RAM': '64 GB', 'Depolama': '2 TB',   'Ekran': '2.8K IPS',  'Fiyat': '84.999 ₺' },
        ],
        'Güvenlik':  'HP Wolf Security, Sure View (gizlilik ekranı), TPM 2.0',
        'Ağırlık':   '1.34 kg',
        'Pil':       '51 Wh + Hızlı Şarj',
        'Portlar':   '2× Thunderbolt 4 + USB-A × 2 + HDMI 2.0 + 3.5mm',
        'Garanti':   '3 yıl HP Care Pack',
      },
      image_url: await fetchPexelsImage('HP EliteBook business laptop office'),
    },
  ];

  for (const p of laptops) {
    const r = await insertProduct(p);
    r ? added++ : skipped++;
  }

  // ═══════════════════════════════════════════════════════════════════
  //  BÖLÜM 3: BEYAZ EŞYA
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n🏠 BEYAZ EŞYA\n' + '─'.repeat(50));

  const catCamasir = await getCatId('camasir-makinesi');
  const catBuzdolabi = await getCatId('buzdolabi');
  const catBulasik = await getCatId('bulasik-makinesi');

  const whiteGoods = [
    // ── Samsung Bespoke AI Çamaşır Makinesi ──────────────────────
    {
      category_id: catCamasir,
      name: 'Bespoke AI WW11BB944DGWTR', slug: 'samsung-bespoke-ai-camasir-11kg',
      brand: 'Samsung', model: 'Bespoke AI', model_year: 2024,
      price_min: 37_999, price_max: 52_999, currency: 'TRY',
      status: 'active', is_featured: true, published_at: now, source: 'manual',
      short_description: 'AI Wash teknolojisi, EcoBubble, 1400 devir ve 11-15 kg kapasiteli. Samsung\'un en akıllı çamaşır makinesi serisi.',
      description: 'Samsung Bespoke AI, yapay zeka destekli AI Wash özelliğiyle çamaşırın ağırlığını ve kirliliğini tespit ederek deterjan ve su miktarını otomatik ayarlıyor. EcoBubble teknolojisi soğuk suda bile etkili yıkama sağlarken enerji tüketimini minimize ediyor.',
      specs: {
        'Kapasite Seçenekleri': [
          { 'Kapasite': '9 kg',  'Devir': '1400 rpm', 'Enerji Sınıfı': 'A', 'Renk': 'Bespoke Beyaz', 'Fiyat': '37.999 ₺' },
          { 'Kapasite': '11 kg', 'Devir': '1400 rpm', 'Enerji Sınıfı': 'A', 'Renk': 'Bespoke Beyaz', 'Fiyat': '44.999 ₺' },
          { 'Kapasite': '13 kg', 'Devir': '1400 rpm', 'Enerji Sınıfı': 'A', 'Renk': 'Bespoke Beyaz', 'Fiyat': '49.999 ₺' },
          { 'Kapasite': '15 kg', 'Devir': '1400 rpm', 'Enerji Sınıfı': 'A', 'Renk': 'Bespoke Beyaz', 'Fiyat': '52.999 ₺' },
        ],
        'Teknoloji':          'EcoBubble + AI Wash + AI Control',
        'Motor':              'Digital Inverter Motor (10 yıl garanti)',
        'SmartThings':        'Evet (uzaktan kontrol)',
        'Program Sayısı':     '16+ program',
        'Hızlı Yıkama':       '15 dk (Hızlı 15 programı)',
        'Gürültü (Yıkama)':   '46 dB',
        'Gürültü (Sıkma)':    '72 dB',
        'Boyutlar':           '600 × 600 × 850 mm',
        'Garanti':            '3 yıl (motor 10 yıl)',
      },
      image_url: await fetchPexelsImage('washing machine modern white laundry'),
    },

    // ── Bosch Serie 8 Çamaşır Makinesi ───────────────────────────
    {
      category_id: catCamasir,
      name: 'Serie 8 WAX32M40TR', slug: 'bosch-serie8-camasir-makinesi',
      brand: 'Bosch', model: 'Serie 8', model_year: 2023,
      price_min: 39_999, price_max: 52_999, currency: 'TRY',
      status: 'active', is_featured: false, published_at: now, source: 'manual',
      short_description: 'i-DOS otomatik deterjan dozlama, EcoSilence Drive motor ve 1600 devir. Bosch\'un en sessiz ve akıllı çamaşır makinesi.',
      description: 'Bosch Serie 8, i-DOS teknolojisiyle sıvı deterjan ve yumuşatıcıyı otomatik olarak ölçüp doz veriyor — fazla deterjan israfı yok. EcoSilence Drive motor ise hem sessiz hem de uzun ömürlü (10 yıl motor garantisi).',
      specs: {
        'Kapasite Seçenekleri': [
          { 'Kapasite': '9 kg',  'Devir': '1400 rpm', 'i-DOS': 'Standart', 'Fiyat': '39.999 ₺' },
          { 'Kapasite': '9 kg',  'Devir': '1600 rpm', 'i-DOS': 'Pro',      'Fiyat': '44.999 ₺' },
          { 'Kapasite': '10 kg', 'Devir': '1600 rpm', 'i-DOS': 'Pro',      'Fiyat': '52.999 ₺' },
        ],
        'i-DOS':              'Otomatik deterjan + yumuşatıcı dozlama',
        'Motor':              'EcoSilence Drive (10 yıl garanti)',
        'Home Connect':       'Evet (Wi-Fi uzaktan kontrol)',
        'Gürültü (Sıkma)':    '69 dB',
        'AntiVibration Wall': 'Evet',
        'Boyutlar':           '598 × 590 × 846 mm',
        'Garanti':            '2 yıl (motor 10 yıl)',
      },
      image_url: await fetchPexelsImage('Bosch washing machine Serie'),
    },

    // ── LG Gram Style Buzdolabı ────────────────────────────────────
    {
      category_id: catBuzdolabi,
      name: 'GBB92STAXP InstaView', slug: 'lg-instaview-buzdolabi',
      brand: 'LG', model: 'InstaView Door-in-Door', model_year: 2024,
      price_min: 42_999, price_max: 64_999, currency: 'TRY',
      status: 'active', is_featured: true, published_at: now, source: 'manual',
      short_description: 'InstaView cam panel (iki vuruşla içeriği gör), ThinQ AI, Total No Frost ve 384-635L kapasiteli. LG\'nin teknoloji şaheseri.',
      description: 'LG InstaView, cam kapıya iki vurarak içeriği görmeni sağlıyor — kapıyı açmadan. %47 daha az soğuk hava kaçışı. ThinQ AI uygulama kontrolü ve Linear Compressor teknolojisiyle A+++ enerji verimliliği sunuyor.',
      specs: {
        'Kapasite Seçenekleri': [
          { 'Net Hacim': '384 L', 'Enerji': 'A++',  'Renk': 'Platinum Silver', 'Fiyat': '42.999 ₺' },
          { 'Net Hacim': '471 L', 'Enerji': 'A+++', 'Renk': 'Platinum Silver', 'Fiyat': '52.999 ₺' },
          { 'Net Hacim': '530 L', 'Enerji': 'A+++', 'Renk': 'Platinum Silver', 'Fiyat': '58.999 ₺' },
          { 'Net Hacim': '635 L', 'Enerji': 'A+++', 'Renk': 'Platinum Silver / Matte Black', 'Fiyat': '64.999 ₺' },
        ],
        'InstaView':     'Evet (cam panel, 2 vurushla görüş)',
        'Total No Frost':'Evet (buzsuzlaştırma yok)',
        'Kompresör':     'Linear Compressor (10 yıl garanti)',
        'ThinQ AI':      'Uzaktan kontrol, AI enerji tasarrufu',
        'Door Alarm':    'Evet',
        'Boyutlar (635L)':'906 × 735 × 1790 mm',
        'Garanti':        '2 yıl (kompresör 10 yıl)',
      },
      image_url: await fetchPexelsImage('modern refrigerator kitchen stainless'),
    },

    // ── Samsung Bespoke Buzdolabı ──────────────────────────────────
    {
      category_id: catBuzdolabi,
      name: 'Bespoke French Door', slug: 'samsung-bespoke-french-door-buzdolabi',
      brand: 'Samsung', model: 'Bespoke French Door', model_year: 2024,
      price_min: 64_999, price_max: 94_999, currency: 'TRY',
      status: 'active', is_featured: false, published_at: now, source: 'manual',
      short_description: 'Özelleştirilebilir renk paneller, AI enerji tasarrufu, Family Hub ekranı ve 580-660L kapasiteli French Door buzdolabı.',
      description: 'Samsung Bespoke French Door, çıkarılabilir ve değiştirilebilir renkli panelleriyle mutfak dekorasyonunuza uyum sağlıyor. Family Hub versiyonunda dahili 21.5 inç dokunmatik ekranla tarifler, alışveriş listesi ve iç kamera görüntüleme yapabiliyorsunuz.',
      specs: {
        'Kapasite Seçenekleri': [
          { 'Net Hacim': '580 L', 'Family Hub': 'Hayır', 'Enerji': 'A++',  'Fiyat': '64.999 ₺' },
          { 'Net Hacim': '580 L', 'Family Hub': 'Evet',  'Enerji': 'A++',  'Fiyat': '79.999 ₺' },
          { 'Net Hacim': '660 L', 'Family Hub': 'Hayır', 'Enerji': 'A+++', 'Fiyat': '84.999 ₺' },
          { 'Net Hacim': '660 L', 'Family Hub': 'Evet',  'Enerji': 'A+++', 'Fiyat': '94.999 ₺' },
        ],
        'Bespoke Paneller':  'Değiştirilebilir renkli paneller (8+ renk)',
        'No Frost':          'All-Around Cooling',
        'AI Enerji':         'SmartThings AI Energy Mode',
        'İç Kamera':         '3× dahili kamera (uzaktan görüntüleme)',
        'Garanti':           '2 yıl',
      },
      image_url: await fetchPexelsImage('Samsung French Door refrigerator modern kitchen'),
    },

    // ── Bosch Bulaşık Makinesi ─────────────────────────────────────
    {
      category_id: catBulasik,
      name: 'Serie 8 SMV8ZCX07E', slug: 'bosch-serie8-bulasik-makinesi',
      brand: 'Bosch', model: 'Serie 8 Tam Gömme', model_year: 2023,
      price_min: 24_999, price_max: 34_999, currency: 'TRY',
      status: 'active', is_featured: false, published_at: now, source: 'manual',
      short_description: 'PerfectDry sıfır enerji kurutma, Home Connect ve 42 dB ile A sınıfı tam gömme bulaşık makinesi.',
      description: 'Bosch Serie 8 bulaşık makinesi, PerfectDry teknolojisiyle ek enerji harcamadan sıfır kuruma bırakmıyor. 42 dB ses seviyesiyle Bosch\'un en sessiz modeli. Home Connect ile program başlatma ve kalan süre takibi yapılabiliyor.',
      specs: {
        'Program Seçenekleri': [
          { 'Program': 'Standart Seti (13 kişilik)', 'Enerji': 'A',  'Yerleşim': 'Ankastre', 'Fiyat': '24.999 ₺' },
          { 'Program': 'Ekstra Geniş (14 kişilik)',  'Enerji': 'A+', 'Yerleşim': 'Ankastre', 'Fiyat': '29.999 ₺' },
          { 'Program': 'XXL (15 kişilik)',            'Enerji': 'A+', 'Yerleşim': 'Ankastre', 'Fiyat': '34.999 ₺' },
        ],
        'Ses Seviyesi':   '42 dB',
        'PerfectDry':     'Sıfır enerji, %100 kuruma',
        'Sepet':          'FlexComfort üst sepet (yükseklik ayarlı)',
        'Home Connect':   'Wi-Fi uzaktan kontrol',
        'Program Sayısı': '8 program (AutoProgramme dahil)',
        'Boyutlar':       '598 × 600 × 820 mm',
        'Garanti':        '2 yıl',
      },
      image_url: await fetchPexelsImage('dishwasher modern kitchen built-in'),
    },
  ];

  for (const p of whiteGoods) {
    const r = await insertProduct(p);
    r ? added++ : skipped++;
  }

  // ═══════════════════════════════════════════════════════════════════
  //  BÖLÜM 4: TV & MONİTÖRLER
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n📺 TV & MONİTÖRLER\n' + '─'.repeat(50));

  const catOledTv  = await getCatId('oled-tv');
  const catQledTv  = await getCatId('qled-tv');
  const catGamingMon = await getCatId('gaming-monitor');

  const tvs = [
    // ── LG C4 OLED ────────────────────────────────────────────────
    {
      category_id: catOledTv,
      name: 'C4 OLED evo', slug: 'lg-c4-oled-2024',
      brand: 'LG', model: 'C4 OLED', model_year: 2024,
      price_min: 44_999, price_max: 164_999, currency: 'TRY',
      status: 'active', is_featured: true, published_at: now, source: 'manual',
      short_description: 'α9 AI Processor Gen7, Brightness Booster Max ve OLED evo paneli. 4K OLED TV\'lerin 2024 referansı.',
      description: 'LG C4, α9 AI 7. nesil işlemcisiyle görüntü kalitesini yeni bir seviyeye taşıdı. Brightness Booster Max sayesinde 1.500+ nit tepe parlaklığı, 120Hz ve HDMI 2.1 ile oyun ve film deneyiminde en iyi OLED TV unvanını koruyor.',
      specs: {
        'Ekran Boyutu Seçenekleri': [
          { 'Boyut': '55 inç', 'Çözünürlük': '4K', 'Model No': 'OLED55C4PSA', 'Fiyat':  '44.999 ₺' },
          { 'Boyut': '65 inç', 'Çözünürlük': '4K', 'Model No': 'OLED65C4PSA', 'Fiyat':  '64.999 ₺' },
          { 'Boyut': '77 inç', 'Çözünürlük': '4K', 'Model No': 'OLED77C4PSA', 'Fiyat':  '99.999 ₺' },
          { 'Boyut': '83 inç', 'Çözünürlük': '4K', 'Model No': 'OLED83C4PSA', 'Fiyat': '144.999 ₺' },
          { 'Boyut': '97 inç', 'Çözünürlük': '4K', 'Model No': 'OLED97C4PSA', 'Fiyat': '164.999 ₺' },
        ],
        'Panel Tipi':      'OLED evo (W-OLED)',
        'İşlemci':         'α9 AI Gen7',
        'Brightness':      '1.500+ nit (Brightness Booster Max)',
        'Yenileme Hızı':   '120Hz (HDMI 2.1 × 4 port)',
        'VRR / G-Sync':    'NVIDIA G-Sync + AMD FreeSync Premium',
        'Ses Sistemi':     '60W 4.2 kanal',
        'webOS':           '24 (LG Smart TV platformu)',
        'HDMI':            '4× HDMI 2.1 (4K/144Hz)',
        'Garanti':         '2 yıl (panel 5 yıl)',
      },
      image_url: await fetchPexelsImage('LG OLED TV living room 4K'),
    },

    // ── Samsung S95D OLED ─────────────────────────────────────────
    {
      category_id: catOledTv,
      name: 'S95D QD-OLED', slug: 'samsung-s95d-qd-oled-2024',
      brand: 'Samsung', model: 'S95D', model_year: 2024,
      price_min: 54_999, price_max: 134_999, currency: 'TRY',
      status: 'active', is_featured: false, published_at: now, source: 'manual',
      short_description: 'QD-OLED panel, 2.500 nit parlaklık ve glare-free ekran. Aydınlık ortamlarda dünya\'nın en iyi OLED TV deneyimi.',
      description: 'Samsung S95D, ikinci nesil QD-OLED panelini glare-free (anti-reflektif) kaplama ile birleştiriyor. 2.500 nit tepe parlaklığı ve Quantum Dot renk filtresi sayesinde gündüz ışıklı ortamlarda bile görüntü kalitesi kompromissiz.',
      specs: {
        'Ekran Boyutu Seçenekleri': [
          { 'Boyut': '55 inç', 'Çözünürlük': '4K', 'Fiyat':  '54.999 ₺' },
          { 'Boyut': '65 inç', 'Çözünürlük': '4K', 'Fiyat':  '84.999 ₺' },
          { 'Boyut': '77 inç', 'Çözünürlük': '4K', 'Fiyat': '134.999 ₺' },
        ],
        'Panel Tipi':      'QD-OLED (2. nesil)',
        'Parlaklık':       '2.500 nit (tepe)',
        'Glare-Free':      'Evet (anti-reflektif kaplama)',
        'Yenileme':        '144Hz (HDMI 2.1)',
        'HDR Desteği':     'HDR10+ Adaptive + Dolby Vision',
        'Tizen OS':        '8.0',
        'Ses':             '70W 4.2.2 kanal (Dolby Atmos)',
        'Garanti':         '3 yıl',
      },
      image_url: await fetchPexelsImage('Samsung OLED TV 4K living room'),
    },

    // ── Samsung QN90D Neo QLED ────────────────────────────────────
    {
      category_id: catQledTv,
      name: 'QN90D Neo QLED', slug: 'samsung-qn90d-neo-qled-2024',
      brand: 'Samsung', model: 'QN90D', model_year: 2024,
      price_min: 34_999, price_max: 119_999, currency: 'TRY',
      status: 'active', is_featured: true, published_at: now, source: 'manual',
      short_description: 'Neo Quantum 4K işlemci, Mini LED arka aydınlatma ve 4.000 nit parlaklık. Parlak odalarda OLED\'i geçen QLED TV.',
      description: 'QN90D, Samsung\'un Mini LED teknolojisiyle 4.000+ nit parlaklığa ulaşan Neo QLED modelidir. Quantum HDR ve Anti-Reflection ekranıyla güneş ışığı altında bile mükemmel görüntü sunarken 120Hz HDMI 2.1 ile oyunculara da hitap ediyor.',
      specs: {
        'Ekran Boyutu Seçenekleri': [
          { 'Boyut': '55 inç', 'Çözünürlük': '4K', 'Fiyat':  '34.999 ₺' },
          { 'Boyut': '65 inç', 'Çözünürlük': '4K', 'Fiyat':  '49.999 ₺' },
          { 'Boyut': '75 inç', 'Çözünürlük': '4K', 'Fiyat':  '74.999 ₺' },
          { 'Boyut': '85 inç', 'Çözünürlük': '4K', 'Fiyat':  '99.999 ₺' },
          { 'Boyut': '98 inç', 'Çözünürlük': '4K', 'Fiyat': '119.999 ₺' },
        ],
        'Panel Tipi':      'VA Mini LED (Neo QLED)',
        'Parlaklık':       '4.000+ nit (Neo Quantum 4K)',
        'HDR':             'Quantum HDR 32x',
        'Anti-Reflection': 'Evet',
        'Yenileme':        '144Hz',
        'Game Mode':       'Motion Xcelerator Turbo Pro',
        'Garanti':         '2 yıl',
      },
      image_url: await fetchPexelsImage('Samsung Neo QLED TV 4K'),
    },

    // ── LG 27GR95QE Gaming Monitör ────────────────────────────────
    {
      category_id: catGamingMon,
      name: '27GR95QE OLED Gaming Monitör', slug: 'lg-27gr95qe-oled-gaming',
      brand: 'LG', model: '27GR95QE', model_year: 2023,
      price_min: 18_999, price_max: 22_999, currency: 'TRY',
      status: 'active', is_featured: true, published_at: now, source: 'manual',
      short_description: '27 inç OLED, 240Hz, 0.03ms yanıt süresi ve 1440p çözünürlük. PC oyunlarında nihai görsel deneyim.',
      description: 'LG 27GR95QE, OLED panelin sonsuz siyah ve 0.03ms yanıt süresi avantajını 240Hz yenileme hızıyla birleştiriyor. 1440p çözünürlük ve DisplayHDR True Black 400 desteğiyle FPS oyunlarında rakiplerinizden bir adım önde olursunuz.',
      specs: {
        'Panel Seçenekleri': [
          { 'Boyut': '27 inç', 'Çözünürlük': '2560×1440 (1440p)', 'Yenileme': '240Hz', 'Fiyat': '18.999 ₺' },
          { 'Boyut': '27 inç', 'Çözünürlük': '2560×1440 (1440p)', 'Yenileme': '240Hz', 'Stand': 'VESA pivot', 'Fiyat': '22.999 ₺' },
        ],
        'Panel Tipi':      'WOLED',
        'Yanıt Süresi':    '0.03ms (GtG)',
        'HDR':             'DisplayHDR True Black 400',
        'Parlaklık':       '450 nit (SDR) / 1.000 nit (HDR peak)',
        'G-Sync / FreeSync': 'NVIDIA G-Sync Compat. + AMD FreeSync Premium Pro',
        'Portlar':         '2× HDMI 2.1 + 1× DP 1.4 + USB hub',
        'Garanti':         '3 yıl (burn-in 3 yıl)',
      },
      image_url: await fetchPexelsImage('OLED gaming monitor setup RGB desk'),
    },

    // ── Samsung Odyssey G9 ────────────────────────────────────────
    {
      category_id: catGamingMon,
      name: 'Odyssey OLED G9 (G95SC)', slug: 'samsung-odyssey-g9-oled',
      brand: 'Samsung', model: 'Odyssey OLED G9', model_year: 2023,
      price_min: 39_999, price_max: 44_999, currency: 'TRY',
      status: 'active', is_featured: false, published_at: now, source: 'manual',
      short_description: '49 inç ultrawide OLED, 240Hz, 32:9 oran ve 5120×1440 çözünürlük. İki monitörün yerini alan megagaming ekranı.',
      description: 'Samsung Odyssey OLED G9, 49 inçlik 32:9 ultra-geniş OLED ekranıyla iki monitörün alanını tek ekranda sunuyor. 240Hz yenileme hızı ve 0.03ms yanıt süresiyle bu boyuttaki en hızlı gaming monitör.',
      specs: {
        'Panel Seçenekleri': [
          { 'Boyut': '49 inç', 'Çözünürlük': '5120×1440 (DQHD)', 'Yenileme': '240Hz', 'Oran': '32:9', 'Fiyat': '39.999 ₺' },
          { 'Boyut': '49 inç', 'Çözünürlük': '5120×1440 (DQHD)', 'Yenileme': '240Hz', 'KVM Switch': 'Dahili', 'Fiyat': '44.999 ₺' },
        ],
        'Panel Tipi':     'QD-OLED',
        'Eğrilik':        '1800R',
        'HDR':            'DisplayHDR True Black 400',
        'Portlar':        '2× HDMI 2.1 + DP 1.4 + USB-A hub',
        'Garanti':        '3 yıl',
      },
      image_url: await fetchPexelsImage('Samsung Odyssey ultrawide gaming monitor curved'),
    },
  ];

  for (const p of tvs) {
    const r = await insertProduct(p);
    r ? added++ : skipped++;
  }

  // ═══════════════════════════════════════════════════════════════════
  //  BÖLÜM 5: SES SİSTEMLERİ
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n🎧 SES SİSTEMLERİ\n' + '─'.repeat(50));

  const catANC     = await getCatId('anc-kulaklik');
  const catTWS     = await getCatId('tws-kulaklik');
  const catBT      = await getCatId('bluetooth-hoparlor');

  const audio = [
    // ── Sony WH-1000XM5 ───────────────────────────────────────────
    {
      category_id: catANC,
      name: 'WH-1000XM5', slug: 'sony-wh1000xm5',
      brand: 'Sony', model: 'WH-1000XM5', model_year: 2022,
      price_min: 9_499, price_max: 9_499, currency: 'TRY',
      status: 'active', is_featured: true, published_at: now, source: 'manual',
      short_description: '8 mikrofon ANC, LDAC Hi-Res Audio ve 30 saat pil. Sony\'nin en iyi gürültü engelleme kulaklığı.',
      description: 'WH-1000XM5, Sony\'nin 8 mikrofon ve V1+HD işlemcisi kombinasyonuyla endüstrinin en iyi ANC performansını sunuyor. LDAC ile 990 kbps Hi-Res Audio wireless aktarımı ve 30 saatlik pil ömrüyle uzun yolculuklar için eşsiz.',
      specs: {
        'Renk Seçenekleri': [
          { 'Renk': 'Siyah (Black)',  'Sürücü': '30mm', 'ANC': '8 mikrofon', 'Fiyat': '9.499 ₺' },
          { 'Renk': 'Beyaz (Platinum Silver)', 'Sürücü': '30mm', 'ANC': '8 mikrofon', 'Fiyat': '9.499 ₺' },
        ],
        'ANC Sistemi':    '8 mikrofon (4 feedforward + 4 feedback) + QN1 + V1 HD işlemci',
        'Codec Desteği':  'SBC, AAC, LDAC (Hi-Res Audio)',
        'Pil Ömrü':       '30 saat (ANC açık), 40 saat (ANC kapalı)',
        'Hızlı Şarj':     '3 dk şarj = 3 saat kullanım',
        'Bağlantı':       'Bluetooth 5.2 (Multipoint × 2)',
        'Konuşma Asistanı': 'Google Assistant / Amazon Alexa / Siri',
        'Katlanabilir':   'Evet (taşıma çantası dahil)',
        'Ağırlık':        '250 g',
        'Garanti':        '2 yıl',
      },
      image_url: await fetchPexelsImage('Sony WH-1000XM5 headphones black'),
    },

    // ── Bose QuietComfort Ultra ────────────────────────────────────
    {
      category_id: catANC,
      name: 'QuietComfort Ultra', slug: 'bose-quietcomfort-ultra',
      brand: 'Bose', model: 'QuietComfort Ultra', model_year: 2023,
      price_min: 12_999, price_max: 12_999, currency: 'TRY',
      status: 'active', is_featured: false, published_at: now, source: 'manual',
      short_description: 'Bose\'un en gelişmiş ANC\'si, Immersive Audio (spatial) ve 24 saat pil. Premium konfor ve ses kalitesi.',
      description: 'QuietComfort Ultra, Bose\'un Immersive Audio teknolojisiyle head-tracking olmadan spatial ses deneyimi sunuyor. CustomTune kişiselleştirilmiş ses ve ANC optimizasyonu ile her kulaklığı ölçüyor.',
      specs: {
        'Renk Seçenekleri': [
          { 'Renk': 'Black', 'Spatial Audio': 'Immersive Audio', 'Fiyat': '12.999 ₺' },
          { 'Renk': 'White Smoke', 'Spatial Audio': 'Immersive Audio', 'Fiyat': '12.999 ₺' },
        ],
        'ANC':            'Bose Custom Mode + QuietComfort Mode',
        'Spatial Audio':  'Immersive Audio (head-tracking olmadan)',
        'Pil Ömrü':       '24 saat (ANC açık)',
        'Hızlı Şarj':     '15 dk = 2.5 saat',
        'Codec':          'SBC, AAC, aptX Adaptive',
        'Bağlantı':       'Bluetooth 5.3 Multipoint',
        'Ağırlık':        '254 g',
        'Garanti':        '1 yıl',
      },
      image_url: await fetchPexelsImage('Bose QuietComfort headphones premium'),
    },

    // ── Apple AirPods Pro 2 ────────────────────────────────────────
    {
      category_id: catTWS,
      name: 'AirPods Pro (2. nesil)', slug: 'apple-airpods-pro-2',
      brand: 'Apple', model: 'AirPods Pro 2', model_year: 2022,
      price_min: 6_999, price_max: 6_999, currency: 'TRY',
      status: 'active', is_featured: true, published_at: now, source: 'manual',
      short_description: 'H2 çip, adaptif ANC, Personalized Spatial Audio ve USB-C şarj. Apple ekosistemi için en iyi TWS kulaklık.',
      description: 'AirPods Pro 2 (USB-C versiyonu), Apple H2 çipi ile bir önceki nesle kıyasla 2 kat daha güçlü ANC sunuyor. Adaptive Audio modu ortam sesini akıllıca dengeleyerek her durumda ideal ses seviyesini sağlıyor.',
      specs: {
        'Versiyon Seçenekleri': [
          { 'Versiyon': 'AirPods Pro 2 USB-C', 'Şarj': 'USB-C / MagSafe / Apple Watch', 'ANC': 'Adaptif ANC', 'Fiyat': '6.999 ₺' },
          { 'Versiyon': 'AirPods Pro 2 + AppleCare+', 'Şarj': 'USB-C / MagSafe', 'ANC': 'Adaptif ANC', 'Fiyat': '8.499 ₺' },
        ],
        'Çip':            'Apple H2',
        'ANC':            'Adaptif ANC (2× güçlü)',
        'Adaptive Audio': 'Conversational Awareness (otomatik ses azaltma)',
        'Spatial Audio':  'Personalized Spatial Audio (head tracking)',
        'Pil (kulaklık)': '6 saat (ANC açık)',
        'Pil (kılıf ile)':'30 saat toplam',
        'Su Dayanıklılık':'IPX4 (kulaklık + kılıf)',
        'Codec':          'AAC + Apple Lossless (yakında)',
        'Garanti':        '1 yıl (Apple Turkey)',
      },
      image_url: await fetchPexelsImage('Apple AirPods Pro earbuds white'),
    },

    // ── Samsung Galaxy Buds3 Pro ──────────────────────────────────
    {
      category_id: catTWS,
      name: 'Galaxy Buds3 Pro', slug: 'samsung-galaxy-buds3-pro',
      brand: 'Samsung', model: 'Galaxy Buds3 Pro', model_year: 2024,
      price_min: 4_999, price_max: 4_999, currency: 'TRY',
      status: 'active', is_featured: false, published_at: now, source: 'manual',
      short_description: '360° Audio, AI Live Translate, ANC ve 6 saat pil. Galaxy cihazlarıyla mükemmel entegrasyon.',
      description: 'Galaxy Buds3 Pro, Samsung AI ekosisteminin tam merkezinde yer alıyor. Galaxy AI ile gerçek zamanlı telefon çevirisi (AI Live Translate) ve AI Noise Cancelling özellikleri sunuyor.',
      specs: {
        'Renk Seçenekleri': [
          { 'Renk': 'Silver',       'ANC': 'AI ANC', '360° Audio': 'Evet', 'Fiyat': '4.999 ₺' },
          { 'Renk': 'White',        'ANC': 'AI ANC', '360° Audio': 'Evet', 'Fiyat': '4.999 ₺' },
        ],
        'ANC':            'AI Active Noise Cancellation',
        'AI Özellikler':  'AI Live Translate, Interpreter Mode',
        'Spatial Audio':  '360° Audio + head tracking',
        'Pil (kulaklık)': '6 saat (ANC açık)',
        'Pil (kılıf ile)':'26 saat toplam',
        'Su Dayanıklılık':'IPX7',
        'Bağlantı':       'Bluetooth 5.4',
        'Garanti':        '1 yıl',
      },
      image_url: await fetchPexelsImage('Samsung Galaxy Buds earbuds wireless'),
    },

    // ── JBL Charge 5 ─────────────────────────────────────────────
    {
      category_id: catBT,
      name: 'Charge 5', slug: 'jbl-charge-5',
      brand: 'JBL', model: 'Charge 5', model_year: 2021,
      price_min: 3_999, price_max: 4_499, currency: 'TRY',
      status: 'active', is_featured: true, published_at: now, source: 'manual',
      short_description: '40W güç, IP67 su ve toz geçirmezlik, 20 saat pil ve powerbank özelliği. Açık hava Bluetooth hoparlörünün favorisi.',
      description: 'JBL Charge 5, 40W güçlü sesi IP67 sertifikalı dayanıklı kasasıyla en zorlu ortamlara taşıyor. 20 saatlik pil ömrü ve dahili powerbank özelliğiyle telefon şarjı da yapabiliyor.',
      specs: {
        'Renk Seçenekleri': [
          { 'Renk': 'Siyah',   'Güç': '40W', 'IP': 'IP67', 'Pil': '20 saat', 'Fiyat': '3.999 ₺' },
          { 'Renk': 'Mavi',    'Güç': '40W', 'IP': 'IP67', 'Pil': '20 saat', 'Fiyat': '3.999 ₺' },
          { 'Renk': 'Kırmızı', 'Güç': '40W', 'IP': 'IP67', 'Pil': '20 saat', 'Fiyat': '3.999 ₺' },
          { 'Renk': 'Sarı',    'Güç': '40W', 'IP': 'IP67', 'Pil': '20 saat', 'Fiyat': '3.999 ₺' },
          { 'Renk': 'Beyaz',   'Güç': '40W', 'IP': 'IP67', 'Pil': '20 saat', 'Fiyat': '4.499 ₺' },
        ],
        'Güç':            '40W (duet modu destekler)',
        'Dayanıklılık':   'IP67 (1m derinlik, 30 dk su altı)',
        'Powerbank':      'Evet (USB-A çıkış)',
        'PartyBoost':     'Evet (JBL hoparlörlerle bağlantı)',
        'Şarj':           'USB-C',
        'Bluetooth':      '5.1',
        'Boyut':          '226.8 × 97.4 × 95.9 mm',
        'Ağırlık':        '960 g',
        'Garanti':        '1 yıl',
      },
      image_url: await fetchPexelsImage('JBL Charge Bluetooth speaker outdoor'),
    },

    // ── Sonos Era 300 ─────────────────────────────────────────────
    {
      category_id: catBT,
      name: 'Era 300', slug: 'sonos-era-300',
      brand: 'Sonos', model: 'Era 300', model_year: 2023,
      price_min: 14_999, price_max: 14_999, currency: 'TRY',
      status: 'active', is_featured: false, published_at: now, source: 'manual',
      short_description: '6 hoparlörlü Spatial Audio, Dolby Atmos ve Sonos ses mimarisi. Ev hoparlörlerinde spatial audio devrimi.',
      description: 'Sonos Era 300, 4 tweeter + 1 woofer + 1 yan tweeter mimarisiyle gerçek Spatial Audio üretiyor. Dolby Atmos müzik desteği ve Trueplay oda uyarlama teknolojisiyle Spotify ile Apple Music\'i spatial ses kalitesinde dinleyebiliyorsunuz.',
      specs: {
        'Renk Seçenekleri': [
          { 'Renk': 'Siyah (Black)',        'Güç': '6 sürücü', 'Spatial Audio': 'Evet', 'Fiyat': '14.999 ₺' },
          { 'Renk': 'Beyaz (White)',         'Güç': '6 sürücü', 'Spatial Audio': 'Evet', 'Fiyat': '14.999 ₺' },
        ],
        'Sürücü Sayısı':  '6 (4 tweeter + 1 woofer + 1 yan tweeter)',
        'Spatial Audio':  'Evet (Dolby Atmos müzik + Apple Music Spatial)',
        'Trueplay':       'Otomatik oda uyarlama',
        'Bağlantı':       'Wi-Fi 6 + Bluetooth 5.0 + USB-C (line-in)',
        'Asistan':        'Amazon Alexa + Sonos Voice Control',
        'Boyutlar':       '260 × 185 × 185 mm',
        'Garanti':        '2 yıl',
      },
      image_url: await fetchPexelsImage('Sonos speaker home audio'),
    },
  ];

  for (const p of audio) {
    const r = await insertProduct(p);
    r ? added++ : skipped++;
  }

  // ─── Özet ─────────────────────────────────────────────────────────
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`📊 TAMAMLANDI:`);
  console.log(`   ✅ Yeni eklenen: ${added} ürün`);
  console.log(`   ⏭  Mevcut (atlandı): ${skipped} ürün`);
  console.log(`\n🎉 Tüm kategoriler için ürün verisi hazır!`);
  console.log(`   Şimdi: /products, /categories veya admin panel'den görüntüleyebilirsiniz.`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
