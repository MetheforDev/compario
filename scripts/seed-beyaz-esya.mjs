// Fırın, Vestel Fırın, Siemens Bulaşık Makinesi
import { createClient } from '@supabase/supabase-js';

const s = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const CATS = {
  firin:          '5b2ad625-dd5b-4ff0-b933-f1d96e5623e2',
  vestelFirin:    '4d128646-7a97-4ddb-80ff-886b10daa33d',
  siemensBulasik: '73678ef0-9d07-4b66-982d-8123fa6563f6',
};

const products = [
  // ── Fırın (genel) ──
  {
    name: 'Serie 8 HBG675BS1', slug: 'bosch-hbg675bs1', brand: 'Bosch', model: 'Serie 8 HBG675BS1',
    category_id: CATS.firin, status: 'active', price_min: 24999, price_max: 24999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    short_description: '71L PerfectRoast, 13 pişirme fonksiyonu, AutoPilot, Pyroliz temizleme.',
    specs: {
      'Hacim': '71 Litre',
      'Enerji Sınıfı': 'A+',
      'Temizleme': 'Pyroliz',
      'Pişirme Fonksiyonu': '13 fonksiyon',
      'Izgara': 'FullSteam',
      'Bağlantı': 'Home Connect (Wi-Fi)',
      'Fiyat': '24.999 ₺',
    },
  },
  {
    name: 'Serie 6 HBA573BS1', slug: 'bosch-hba573bs1', brand: 'Bosch', model: 'Serie 6 HBA573BS1',
    category_id: CATS.firin, status: 'active', price_min: 16999, price_max: 16999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    short_description: '71L, EcoClean, 3D Hotair, otomatik ısıtma.',
    specs: {
      'Hacim': '71 Litre',
      'Enerji Sınıfı': 'A+',
      'Temizleme': 'EcoClean',
      'Pişirme Fonksiyonu': '3D Hotair',
      'Fiyat': '16.999 ₺',
    },
  },
  {
    name: 'iQ700 HB736G1B1', slug: 'siemens-hb736g1b1', brand: 'Siemens', model: 'iQ700 HB736G1B1',
    category_id: CATS.firin, status: 'active', price_min: 27999, price_max: 27999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    short_description: '71L, Pyroliz, activeClean, Home Connect, buhar fonksiyonu.',
    specs: {
      'Hacim': '71 Litre',
      'Enerji Sınıfı': 'A+',
      'Temizleme': 'Pyroliz + activeClean',
      'Buhar': 'Var',
      'Bağlantı': 'Home Connect',
      'Fiyat': '27.999 ₺',
    },
  },
  {
    name: 'Arçelik AFİO 64500 ENX', slug: 'arcelik-afio-64500-enx', brand: 'Arçelik', model: 'AFİO 64500 ENX',
    category_id: CATS.firin, status: 'active', price_min: 13499, price_max: 13499, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    short_description: '64L, A+ enerji, çift fanlı, 11 pişirme programı.',
    specs: {
      'Hacim': '64 Litre',
      'Enerji Sınıfı': 'A+',
      'Fan': 'Çift fan',
      'Programlar': '11 pişirme programı',
      'Fiyat': '13.499 ₺',
    },
  },
  {
    name: 'Profilo FÇEO 66000 B', slug: 'profilo-fceo-66000-b', brand: 'Profilo', model: 'FÇEO 66000 B',
    category_id: CATS.firin, status: 'active', price_min: 10999, price_max: 10999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    short_description: '66L, enerji tasarruflu, katalitik temizleme, çift cam kapı.',
    specs: {
      'Hacim': '66 Litre',
      'Enerji Sınıfı': 'A',
      'Temizleme': 'Katalitik',
      'Fiyat': '10.999 ₺',
    },
  },

  // ── Vestel Fırın ──
  {
    name: 'EFW 6423 S', slug: 'vestel-efw-6423-s', brand: 'Vestel', model: 'EFW 6423 S',
    category_id: CATS.vestelFirin, status: 'active', price_min: 7999, price_max: 7999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    short_description: '64L, A enerji sınıfı, 8 pişirme fonksiyonu, izmir serisi.',
    specs: {
      'Hacim': '64 Litre',
      'Enerji Sınıfı': 'A',
      'Fonksiyonlar': '8 pişirme fonksiyonu',
      'Kapı': 'Çift cam',
      'Fiyat': '7.999 ₺',
    },
  },
  {
    name: 'FW 6434 S', slug: 'vestel-fw-6434-s', brand: 'Vestel', model: 'FW 6434 S',
    category_id: CATS.vestelFirin, status: 'active', price_min: 9499, price_max: 9499, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    short_description: '64L, çift fanlı, pişirme sondası dahil, A+ enerji.',
    specs: {
      'Hacim': '64 Litre',
      'Enerji Sınıfı': 'A+',
      'Fan': 'Çift fan',
      'Sonda': 'Et pişirme sondası',
      'Fiyat': '9.499 ₺',
    },
  },
  {
    name: 'EFW 8664 BS', slug: 'vestel-efw-8664-bs', brand: 'Vestel', model: 'EFW 8664 BS',
    category_id: CATS.vestelFirin, status: 'active', price_min: 11999, price_max: 11999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    short_description: '86L büyük hacim, 4 camlı kapı, A++ enerji, pyroliz temizleme.',
    specs: {
      'Hacim': '86 Litre',
      'Enerji Sınıfı': 'A++',
      'Temizleme': 'Pyroliz',
      'Kapı': '4 camlı',
      'Fiyat': '11.999 ₺',
    },
  },

  // ── Siemens Bulaşık Makinesi ──
  {
    name: 'iQ700 SN678D06TR', slug: 'siemens-sn678d06tr', brand: 'Siemens', model: 'iQ700 SN678D06TR',
    category_id: CATS.siemensBulasik, status: 'active', price_min: 22999, price_max: 22999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    short_description: '14 kişilik, A+++ enerji, Home Connect, zeolith kurutma, 44dB.',
    specs: {
      'Kapasite': '14 kişilik',
      'Enerji Sınıfı': 'A+++',
      'Gürültü': '44 dB',
      'Kurutma': 'Zeolith (sıfır bekleme)',
      'Bağlantı': 'Home Connect (Wi-Fi)',
      'Program': '8 program',
      'Fiyat': '22.999 ₺',
    },
  },
  {
    name: 'iQ500 SN557S01TR', slug: 'siemens-sn557s01tr', brand: 'Siemens', model: 'iQ500 SN557S01TR',
    category_id: CATS.siemensBulasik, status: 'active', price_min: 15999, price_max: 15999, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    short_description: '14 kişilik, A++, VarioSpeed Plus, aquaStop, 46dB.',
    specs: {
      'Kapasite': '14 kişilik',
      'Enerji Sınıfı': 'A++',
      'Gürültü': '46 dB',
      'Hızlandırma': 'VarioSpeed Plus',
      'Güvenlik': 'aquaStop',
      'Fiyat': '15.999 ₺',
    },
  },
  {
    name: 'iQ300 SN436S01TR', slug: 'siemens-sn436s01tr', brand: 'Siemens', model: 'iQ300 SN436S01TR',
    category_id: CATS.siemensBulasik, status: 'active', price_min: 11499, price_max: 11499, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    short_description: '13 kişilik, A+, 48dB, aquaStop, rackMatic sepet.',
    specs: {
      'Kapasite': '13 kişilik',
      'Enerji Sınıfı': 'A+',
      'Gürültü': '48 dB',
      'Sepet': 'rackMatic ayarlanabilir',
      'Güvenlik': 'aquaStop',
      'Fiyat': '11.499 ₺',
    },
  },
];

async function seed() {
  console.log(`Seeding ${products.length} products...`);
  let ok = 0, fail = 0;
  for (const p of products) {
    const { error } = await s.from('products').upsert(p, { onConflict: 'slug' });
    if (error) { console.error(`✗ ${p.slug}:`, error.message); fail++; }
    else { console.log(`✓ ${p.slug}`); ok++; }
  }
  console.log(`\nDone: ${ok} inserted/updated, ${fail} failed`);
}

seed().catch(console.error);
