// Araçlar: Hatchback, Sedan, Crossover, SUV, Elektrikli
import { createClient } from '@supabase/supabase-js';

const s = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const CATS = {
  hatchback:   '09b57fb1-3a4e-46dc-af88-7b817afb3408',
  sedan:       'e68b7b63-f381-4f38-9fe0-87ca80eb9f40',
  crossover:   'dec403a8-7698-4efc-bfbd-91ec152f783f',
  suv:         'b78783f6-69c2-47b9-a458-d5db9ee419b8',
  elektrikli:  'ad974da3-5281-424a-8190-976a31fb1927',
};

const products = [
  // ── Hatchback ──
  {
    name: 'Yaris', slug: 'toyota-yaris', brand: 'Toyota', model: 'Yaris',
    category_id: CATS.hatchback, status: 'active', price_min: 1050000, price_max: 1280000, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80',
    short_description: 'Hibrit seçeneği, düşük yakıt tüketimi, şehir içi en iyi arkadaş.',
    specs: {
      'Motor': '1.5 Hybrid (116 HP)',
      'Şanzıman': 'CVT Otomatik',
      'Yakıt Tüketimi': '3.8 L/100km',
      'CO₂': '87 g/km',
      'Uzunluk': '3.940 mm',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'Passion', 'Motor': '1.5 Hybrid', 'Fiyat': '1.050.000 ₺' },
        { 'Versiyon': 'Style', 'Motor': '1.5 Hybrid', 'Fiyat': '1.150.000 ₺' },
        { 'Versiyon': 'GR Sport', 'Motor': '1.5 Hybrid', 'Fiyat': '1.280.000 ₺' },
      ],
    },
  },
  {
    name: 'Polo', slug: 'volkswagen-polo', brand: 'Volkswagen', model: 'Polo',
    category_id: CATS.hatchback, status: 'active', price_min: 1150000, price_max: 1450000, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80',
    short_description: 'Güvenilir VW kalitesi, geniş iç hacim, TSI motor seçenekleri.',
    specs: {
      'Motor': '1.0 TSI 95 HP',
      'Şanzıman': '5 ileri Manuel / 7 ileri DSG',
      'Yakıt Tüketimi': '5.0 L/100km',
      'Uzunluk': '4.053 mm',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'Impression', 'Motor': '1.0 TSI 95 HP', 'Şanzıman': 'Manuel', 'Fiyat': '1.150.000 ₺' },
        { 'Versiyon': 'Life', 'Motor': '1.0 TSI 95 HP', 'Şanzıman': 'DSG', 'Fiyat': '1.280.000 ₺' },
        { 'Versiyon': 'Style', 'Motor': '1.0 TSI 110 HP', 'Şanzıman': 'DSG', 'Fiyat': '1.450.000 ₺' },
      ],
    },
  },
  {
    name: 'Clio', slug: 'renault-clio', brand: 'Renault', model: 'Clio',
    category_id: CATS.hatchback, status: 'active', price_min: 980000, price_max: 1300000, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80',
    short_description: 'Şık Fransız tasarımı, hibrit seçeneği, geniş multimedya ekranı.',
    specs: {
      'Motor': '1.0 TCe 90 HP / 1.6 E-Tech Hybrid 145 HP',
      'Yakıt Tüketimi': '4.1 L/100km (Hybrid)',
      'Uzunluk': '4.051 mm',
      'Ekran': '9.3" dikey dokunmatik',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'Intense', 'Motor': '1.0 TCe 90 HP', 'Fiyat': '980.000 ₺' },
        { 'Versiyon': 'E-Tech Hybrid Techno', 'Motor': '1.6 Hybrid 145 HP', 'Fiyat': '1.200.000 ₺' },
        { 'Versiyon': 'E-Tech Hybrid RS Line', 'Motor': '1.6 Hybrid 145 HP', 'Fiyat': '1.300.000 ₺' },
      ],
    },
  },
  {
    name: '208', slug: 'peugeot-208', brand: 'Peugeot', model: '208',
    category_id: CATS.hatchback, status: 'active', price_min: 1050000, price_max: 1350000, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80',
    short_description: 'i-Cockpit tasarımı, şehir için ideal boyut, eDGT akıllı vites.',
    specs: {
      'Motor': '1.2 PureTech 100 HP',
      'Şanzıman': '6 ileri Manuel / 8 ileri EAT8',
      'Yakıt Tüketimi': '5.3 L/100km',
      'Uzunluk': '4.055 mm',
      'Özellik': 'i-Cockpit 3D gösterge paneli',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'Active Pack', 'Motor': '1.2 100 HP Manuel', 'Fiyat': '1.050.000 ₺' },
        { 'Versiyon': 'Allure', 'Motor': '1.2 100 HP EAT8', 'Fiyat': '1.200.000 ₺' },
        { 'Versiyon': 'GT', 'Motor': '1.2 130 HP EAT8', 'Fiyat': '1.350.000 ₺' },
      ],
    },
  },
  {
    name: 'i20', slug: 'hyundai-i20', brand: 'Hyundai', model: 'i20',
    category_id: CATS.hatchback, status: 'active', price_min: 950000, price_max: 1200000, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80',
    short_description: 'Modern tasarım, geniş bagaj, 5 yıl garanti, uygun başlangıç fiyatı.',
    specs: {
      'Motor': '1.0 T-GDI 100 HP',
      'Şanzıman': '6 ileri Manuel / 7 ileri DCT',
      'Yakıt Tüketimi': '5.1 L/100km',
      'Bagaj': '351 litre',
      'Garanti': '5 yıl / 150.000 km',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'Jump', 'Motor': '1.0 T-GDI 100 HP Manuel', 'Fiyat': '950.000 ₺' },
        { 'Versiyon': 'Style', 'Motor': '1.0 T-GDI 100 HP DCT', 'Fiyat': '1.080.000 ₺' },
        { 'Versiyon': 'Elite', 'Motor': '1.0 T-GDI 100 HP DCT', 'Fiyat': '1.200.000 ₺' },
      ],
    },
  },
  {
    name: 'Jazz', slug: 'honda-jazz', brand: 'Honda', model: 'Jazz',
    category_id: CATS.hatchback, status: 'active', price_min: 1100000, price_max: 1350000, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80',
    short_description: 'e:HEV hybrid sistemi, sihirli koltuklar, sınıfının en geniş iç hacmi.',
    specs: {
      'Motor': '1.5 e:HEV Hybrid 109 HP',
      'Şanzıman': 'CVT Otomatik',
      'Yakıt Tüketimi': '4.5 L/100km',
      'Koltuk': 'Magic Seats (öne yatabilir arka koltuklar)',
      'Bagaj': '298 L / 1.205 L (katlanınca)',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'Elegance', 'Fiyat': '1.100.000 ₺' },
        { 'Versiyon': 'Executive', 'Fiyat': '1.250.000 ₺' },
        { 'Versiyon': 'Advance', 'Fiyat': '1.350.000 ₺' },
      ],
    },
  },

  // ── Sedan ──
  {
    name: 'Corolla', slug: 'toyota-corolla', brand: 'Toyota', model: 'Corolla',
    category_id: CATS.sedan, status: 'active', price_min: 1350000, price_max: 1750000, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
    short_description: 'Hybrid teknolojisiyle 4.3 L/100km, güvenilirliğiyle efsane, 5 yıl garanti.',
    specs: {
      'Motor': '1.8 Hybrid 122 HP / 2.0 Hybrid 196 HP',
      'Şanzıman': 'CVT (Hybrid)',
      'Yakıt Tüketimi': '4.3 L/100km (1.8 Hybrid)',
      'Uzunluk': '4.630 mm',
      'Garanti': '5 yıl / 150.000 km',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'Dream', 'Motor': '1.8 Hybrid', 'Fiyat': '1.350.000 ₺' },
        { 'Versiyon': 'Flame', 'Motor': '1.8 Hybrid', 'Fiyat': '1.500.000 ₺' },
        { 'Versiyon': 'GR Sport', 'Motor': '2.0 Hybrid', 'Fiyat': '1.750.000 ₺' },
      ],
    },
  },
  {
    name: 'Passat', slug: 'volkswagen-passat', brand: 'Volkswagen', model: 'Passat',
    category_id: CATS.sedan, status: 'active', price_min: 1850000, price_max: 2450000, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
    short_description: 'Üst segment konfor, eHybrid PHEV seçeneği, Travel Assist sürüş asistanı.',
    specs: {
      'Motor': '1.5 eTSI 150 HP / 1.4 GTE eHybrid 272 HP',
      'Şanzıman': '7 ileri DSG',
      'Uzunluk': '4.916 mm',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'Life', 'Motor': '1.5 eTSI 150 HP', 'Fiyat': '1.850.000 ₺' },
        { 'Versiyon': 'Business', 'Motor': '1.5 eTSI 150 HP', 'Fiyat': '2.050.000 ₺' },
        { 'Versiyon': 'GTE', 'Motor': '1.4 eHybrid 272 HP', 'Fiyat': '2.450.000 ₺' },
      ],
    },
  },
  {
    name: 'C Serisi', slug: 'mercedes-c-serisi', brand: 'Mercedes-Benz', model: 'C-Serisi',
    category_id: CATS.sedan, status: 'active', price_min: 2650000, price_max: 3850000, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
    short_description: 'W206 jenerasyonu, MBUX, dikey ekran, PHEV ve AMG seçenekleri.',
    specs: {
      'Motor': '1.5 EQ Boost 170 HP / 2.0 4MATIC 204 HP / PHEV 313 HP',
      'Şanzıman': '9G-TRONIC',
      'Ekran': '11.9" dikey MBUX',
      'Uzunluk': '4.751 mm',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'C 180 AMG Line', 'Motor': '1.5 170 HP', 'Fiyat': '2.650.000 ₺' },
        { 'Versiyon': 'C 200 4MATIC', 'Motor': '2.0 204 HP', 'Fiyat': '2.950.000 ₺' },
        { 'Versiyon': 'C 300e AMG Line', 'Motor': 'PHEV 313 HP', 'Fiyat': '3.850.000 ₺' },
      ],
    },
  },
  {
    name: '3 Serisi', slug: 'bmw-3-serisi', brand: 'BMW', model: '3 Serisi',
    category_id: CATS.sedan, status: 'active', price_min: 2550000, price_max: 3750000, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
    short_description: 'Sürüş dinamiği odaklı, arkadan çekiş veya xDrive AWD, M Sport seçeneği.',
    specs: {
      'Motor': '2.0 Benzin 184 HP / 2.0 Dizel 190 HP / PHEV 326 HP',
      'Şanzıman': '8 ileri Steptronic',
      'Uzunluk': '4.709 mm',
      'iDrive': 'BMW Live Cockpit Professional',
      'Donanım Seçenekleri': [
        { 'Versiyon': '320i M Sport', 'Motor': '2.0 184 HP RWD', 'Fiyat': '2.550.000 ₺' },
        { 'Versiyon': '320d xDrive', 'Motor': '2.0 Dizel 190 HP', 'Fiyat': '2.850.000 ₺' },
        { 'Versiyon': '330e M Sport', 'Motor': 'PHEV 326 HP', 'Fiyat': '3.750.000 ₺' },
      ],
    },
  },

  // ── Crossover ──
  {
    name: 'Captur', slug: 'renault-captur', brand: 'Renault', model: 'Captur',
    category_id: CATS.crossover, status: 'active', price_min: 1250000, price_max: 1650000, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80',
    short_description: 'E-Tech Hybrid ile 4.5 L/100km, yüksek sürüş pozisyonu, şehirli crossover.',
    specs: {
      'Motor': '1.0 TCe 90 HP / 1.6 E-Tech Hybrid 145 HP',
      'Şanzıman': 'Manuel / EDC / E-Tech CVT',
      'Yakıt Tüketimi': '4.5 L/100km (Hybrid)',
      'Uzunluk': '4.228 mm',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'Techno', 'Motor': '1.0 TCe 90 HP', 'Fiyat': '1.250.000 ₺' },
        { 'Versiyon': 'E-Tech Hybrid Techno', 'Motor': '1.6 Hybrid 145 HP', 'Fiyat': '1.450.000 ₺' },
        { 'Versiyon': 'E-Tech Hybrid RS Line', 'Motor': '1.6 Hybrid 145 HP', 'Fiyat': '1.650.000 ₺' },
      ],
    },
  },
  {
    name: 'Puma', slug: 'ford-puma', brand: 'Ford', model: 'Puma',
    category_id: CATS.crossover, status: 'active', price_min: 1350000, price_max: 1700000, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80',
    short_description: '48V mild-hybrid, MegaBox bagaj, sportif tasarım.',
    specs: {
      'Motor': '1.0 EcoBoost 125 HP mHEV',
      'Şanzıman': '6 ileri Manuel / 7 ileri DCT',
      'Yakıt Tüketimi': '5.2 L/100km',
      'MegaBox': '80 litre gizli bagaj bölmesi',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'Titanium', 'Motor': '1.0 mHEV 125 HP', 'Fiyat': '1.350.000 ₺' },
        { 'Versiyon': 'ST-Line', 'Motor': '1.0 mHEV 155 HP', 'Fiyat': '1.550.000 ₺' },
        { 'Versiyon': 'ST', 'Motor': '1.5 EcoBoost 200 HP', 'Fiyat': '1.700.000 ₺' },
      ],
    },
  },
  {
    name: 'Sportage', slug: 'kia-sportage', brand: 'Kia', model: 'Sportage',
    category_id: CATS.crossover, status: 'active', price_min: 1650000, price_max: 2200000, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80',
    short_description: 'HEV ve PHEV seçenekleri, panoramik ekran, AWD mevcut.',
    specs: {
      'Motor': '1.6 T-GDI 150 HP / 1.6 HEV 230 HP / 1.6 PHEV 265 HP',
      'Şanzıman': '7 ileri DCT / 6 ileri AT (HEV)',
      'Uzunluk': '4.516 mm',
      'Ekran': 'Çift 12.3" panoramik',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'Concept', 'Motor': '1.6 T-GDI 150 HP', 'Fiyat': '1.650.000 ₺' },
        { 'Versiyon': 'HEV Prestige', 'Motor': '1.6 HEV 230 HP AWD', 'Fiyat': '1.950.000 ₺' },
        { 'Versiyon': 'PHEV GT Line', 'Motor': '1.6 PHEV 265 HP', 'Fiyat': '2.200.000 ₺' },
      ],
    },
  },
  {
    name: 'Tucson', slug: 'hyundai-tucson', brand: 'Hyundai', model: 'Tucson',
    category_id: CATS.crossover, status: 'active', price_min: 1700000, price_max: 2300000, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80',
    short_description: 'Parametrik tasarım, PHEV ile elektrikli çekiş, güvenlik paket standart.',
    specs: {
      'Motor': '1.6 T-GDI 150 HP / 1.6 HEV 230 HP / 1.6 PHEV 265 HP',
      'Şanzıman': '7 ileri DCT / 6 ileri AT',
      'Uzunluk': '4.500 mm',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'Style', 'Motor': '1.6 T-GDI 150 HP', 'Fiyat': '1.700.000 ₺' },
        { 'Versiyon': 'HEV Elite', 'Motor': '1.6 HEV 230 HP', 'Fiyat': '2.050.000 ₺' },
        { 'Versiyon': 'PHEV Titanium', 'Motor': '1.6 PHEV 265 HP AWD', 'Fiyat': '2.300.000 ₺' },
      ],
    },
  },

  // ── SUV ──
  {
    name: 'Tiguan', slug: 'volkswagen-tiguan', brand: 'Volkswagen', model: 'Tiguan',
    category_id: CATS.suv, status: 'active', price_min: 2200000, price_max: 3100000, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80',
    short_description: '2024 yeni nesil, 7 koltuk opsiyonu, eHybrid PHEV, IQ.Drive sürüş asistanları.',
    specs: {
      'Motor': '1.5 eTSI 150 HP / 2.0 TDI 150 HP / 1.5 eHybrid 204 HP',
      'Çekiş': 'FWD / 4MOTION AWD',
      'Uzunluk': '4.539 mm',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'Life', 'Motor': '1.5 eTSI 150 HP', 'Fiyat': '2.200.000 ₺' },
        { 'Versiyon': 'Elegance', 'Motor': '2.0 TDI 150 HP 4MOTION', 'Fiyat': '2.600.000 ₺' },
        { 'Versiyon': 'R-Line eHybrid', 'Motor': '1.5 eHybrid 204 HP', 'Fiyat': '3.100.000 ₺' },
      ],
    },
  },
  {
    name: 'RAV4', slug: 'toyota-rav4', brand: 'Toyota', model: 'RAV4',
    category_id: CATS.suv, status: 'active', price_min: 2350000, price_max: 3200000, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80',
    short_description: 'PHEV ile 95 km elektrikli menzil, AWD-i sistemi, sınıfının en güvenilir SUV\'u.',
    specs: {
      'Motor': '2.5 Hybrid 222 HP / 2.5 PHEV 306 HP',
      'Çekiş': 'FWD Hybrid / AWD-i (Hybrid) / AWD-i (PHEV)',
      'Elektrikli Menzil': '95 km (PHEV)',
      'Uzunluk': '4.600 mm',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'Style HEV AWD', 'Motor': '2.5 Hybrid 222 HP', 'Fiyat': '2.350.000 ₺' },
        { 'Versiyon': 'Flame HEV AWD', 'Motor': '2.5 Hybrid 222 HP', 'Fiyat': '2.600.000 ₺' },
        { 'Versiyon': 'Flame PHEV AWD', 'Motor': '2.5 PHEV 306 HP', 'Fiyat': '3.200.000 ₺' },
      ],
    },
  },
  {
    name: 'X5', slug: 'bmw-x5', brand: 'BMW', model: 'X5',
    category_id: CATS.suv, status: 'active', price_min: 4200000, price_max: 6500000, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80',
    short_description: 'Lüks SUV segmentinin lideri, xDrive50e PHEV, M Sport paketi, hava süspansiyonu.',
    specs: {
      'Motor': '3.0 xDrive40i 340 HP / 3.0 xDrive50e PHEV 489 HP / 4.4 M60i 530 HP',
      'Çekiş': 'xDrive AWD',
      'Elektrikli Menzil': '88 km (xDrive50e)',
      'Uzunluk': '4.922 mm',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'xDrive40i xLine', 'Motor': '3.0 340 HP', 'Fiyat': '4.200.000 ₺' },
        { 'Versiyon': 'xDrive50e M Sport', 'Motor': 'PHEV 489 HP', 'Fiyat': '5.400.000 ₺' },
        { 'Versiyon': 'M60i M Sport Pro', 'Motor': '4.4 530 HP', 'Fiyat': '6.500.000 ₺' },
      ],
    },
  },
  {
    name: 'GLC', slug: 'mercedes-glc', brand: 'Mercedes-Benz', model: 'GLC',
    category_id: CATS.suv, status: 'active', price_min: 3450000, price_max: 5200000, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80',
    short_description: 'Yeni nesil GLC, 48V mild-hybrid standart, PHEV 101 km elektrikli menzil.',
    specs: {
      'Motor': '2.0 GLC 220d 4MATIC / 2.0 GLC 300 4MATIC / 2.0 GLC 300e PHEV',
      'Elektrikli Menzil': '101 km (GLC 300e)',
      'Uzunluk': '4.716 mm',
      'Ekran': 'MBUX 11.9"',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'GLC 220d 4MATIC', 'Motor': 'Dizel 197 HP', 'Fiyat': '3.450.000 ₺' },
        { 'Versiyon': 'GLC 300 4MATIC AMG Line', 'Motor': '2.0 258 HP', 'Fiyat': '4.100.000 ₺' },
        { 'Versiyon': 'GLC 300e 4MATIC PHEV', 'Motor': 'PHEV 313 HP', 'Fiyat': '5.200.000 ₺' },
      ],
    },
  },

  // ── Elektrikli Araçlar ──
  {
    name: 'Model 3', slug: 'tesla-model-3', brand: 'Tesla', model: 'Model 3',
    category_id: CATS.elektrikli, status: 'active', price_min: 2200000, price_max: 3100000, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?w=800&q=80',
    short_description: 'Highland güncellemesiyle yeni iç mekan, 629 km menzil, Autopilot standart.',
    specs: {
      'Tip': 'Tam Elektrikli',
      'Menzil': '629 km (Long Range)',
      '0-100': '3.1 sn (Performance)',
      'Şarj': 'CCS Combo + Supercharger',
      'Ekran': '15.4" merkezi dokunmatik',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'RWD', 'Menzil': '513 km', 'Fiyat': '2.200.000 ₺' },
        { 'Versiyon': 'Long Range AWD', 'Menzil': '629 km', 'Fiyat': '2.650.000 ₺' },
        { 'Versiyon': 'Performance', 'Menzil': '528 km', '0-100': '3.1 sn', 'Fiyat': '3.100.000 ₺' },
      ],
    },
  },
  {
    name: 'ID.4', slug: 'volkswagen-id4', brand: 'Volkswagen', model: 'ID.4',
    category_id: CATS.elektrikli, status: 'active', price_min: 2100000, price_max: 2900000, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?w=800&q=80',
    short_description: 'SUV boyutunda elektrikli, 531 km menzil, MEB platform, ID. Software.',
    specs: {
      'Tip': 'Tam Elektrikli',
      'Batarya': '82 kWh',
      'Menzil': '531 km (RWD)',
      'Şarj': '170 kW DC hızlı şarj',
      '0-100': '7.2 sn (RWD)',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'Pro RWD', 'Menzil': '531 km', 'Fiyat': '2.100.000 ₺' },
        { 'Versiyon': 'Pro Performance AWD', 'Menzil': '484 km', '0-100': '5.4 sn', 'Fiyat': '2.500.000 ₺' },
        { 'Versiyon': 'GTX AWD', 'Menzil': '490 km', '0-100': '5.2 sn', 'Fiyat': '2.900.000 ₺' },
      ],
    },
  },
  {
    name: 'EV6', slug: 'kia-ev6', brand: 'Kia', model: 'EV6',
    category_id: CATS.elektrikli, status: 'active', price_min: 2050000, price_max: 2950000, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?w=800&q=80',
    short_description: '800V hızlı şarj (18 dakikada %10→80), 528 km menzil, bi-directional şarj.',
    specs: {
      'Tip': 'Tam Elektrikli',
      'Batarya': '77.4 kWh',
      'Menzil': '528 km (RWD)',
      'Şarj': '800V / 230 kW DC',
      'Şarj Süresi': '18 dk (%10→80)',
      '0-100': '5.1 sn (AWD)',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'Standard RWD', 'Batarya': '58 kWh', 'Menzil': '394 km', 'Fiyat': '2.050.000 ₺' },
        { 'Versiyon': 'Long Range RWD', 'Batarya': '77.4 kWh', 'Menzil': '528 km', 'Fiyat': '2.450.000 ₺' },
        { 'Versiyon': 'Long Range AWD GT-Line', 'Fiyat': '2.950.000 ₺' },
      ],
    },
  },
  {
    name: 'IONIQ 6', slug: 'hyundai-ioniq-6', brand: 'Hyundai', model: 'IONIQ 6',
    category_id: CATS.elektrikli, status: 'active', price_min: 2150000, price_max: 3050000, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?w=800&q=80',
    short_description: 'Aerodinamik tasarım (Cd: 0.21), 614 km menzil, 800V şarj altyapısı.',
    specs: {
      'Tip': 'Tam Elektrikli',
      'Cd (Sürükleme Katsayısı)': '0.21',
      'Menzil': '614 km (RWD 77.4 kWh)',
      'Şarj': '800V / 220 kW DC',
      '0-100': '5.1 sn (AWD)',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'Standard RWD', 'Batarya': '53 kWh', 'Menzil': '429 km', 'Fiyat': '2.150.000 ₺' },
        { 'Versiyon': 'Long Range RWD', 'Batarya': '77.4 kWh', 'Menzil': '614 km', 'Fiyat': '2.600.000 ₺' },
        { 'Versiyon': 'Long Range AWD', 'Menzil': '519 km', '0-100': '5.1 sn', 'Fiyat': '3.050.000 ₺' },
      ],
    },
  },
  {
    name: 'Togg T10X', slug: 'togg-t10x', brand: 'Togg', model: 'T10X',
    category_id: CATS.elektrikli, status: 'active', price_min: 1650000, price_max: 2150000, currency: 'TRY',
    image_url: 'https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?w=800&q=80',
    short_description: 'Türkiye\'nin yerli elektrikli SUV\'u, OTA güncellemeler, sofistike cockpit.',
    specs: {
      'Tip': 'Tam Elektrikli',
      'Üretim': 'Bursa, Türkiye',
      'Menzil': '523 km (Long Range RWD)',
      'Şarj': 'AC 11 kW + DC 200 kW',
      '0-100': '4.8 sn (AWD)',
      'Donanım Seçenekleri': [
        { 'Versiyon': 'Standard Range RWD', 'Batarya': '52.4 kWh', 'Menzil': '314 km', 'Fiyat': '1.650.000 ₺' },
        { 'Versiyon': 'Long Range RWD', 'Batarya': '88.5 kWh', 'Menzil': '523 km', 'Fiyat': '1.950.000 ₺' },
        { 'Versiyon': 'Long Range AWD', 'Batarya': '88.5 kWh', '0-100': '4.8 sn', 'Fiyat': '2.150.000 ₺' },
      ],
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
