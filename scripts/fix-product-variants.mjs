/**
 * fix-product-variants.mjs
 * Ürün isimlerini düzeltir (motor variantını isimden çıkarır) ve
 * specs JSON'una "Donanım Seçenekleri" array'i ekler.
 *
 * Doğru mimari: Product = base model, motor/donanım seçenekleri specs içinde.
 *
 * Çalıştır: cd scripts && node fix-product-variants.mjs
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

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL veya SUPABASE_SERVICE_KEY eksik');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── Ürün güncellemeleri ─────────────────────────────────────────────────────
//
// Her entry: { slug, name, price_min, price_max, specs }
// "Donanım Seçenekleri" anahtarı altında array = VariantTable olarak render edilir.
//
const UPDATES = [

  // ── Volkswagen Golf ─────────────────────────────────────────────────────────
  {
    slug: 'volkswagen-golf-2026',
    name: 'Golf',
    price_min: 1_490_000,
    price_max: 2_280_000,
    specs: {
      'Donanım Seçenekleri': [
        { 'Motor': '1.0 TSI Life',        'Güç': '110 HP', 'Şanzıman': '6MT',   'Yakıt': '5.5 L/100km', '0-100': '10.1 sn', 'Fiyat': '1.490.000 ₺' },
        { 'Motor': '1.5 TSI eTSI Life',   'Güç': '130 HP', 'Şanzıman': '7DSG',  'Yakıt': '5.0 L/100km', '0-100': '9.2 sn',  'Fiyat': '1.750.000 ₺' },
        { 'Motor': '1.5 TSI eTSI Style',  'Güç': '150 HP', 'Şanzıman': '7DSG',  'Yakıt': '4.9 L/100km', '0-100': '8.5 sn',  'Fiyat': '1.950.000 ₺' },
        { 'Motor': '2.0 TDI Style',       'Güç': '150 HP', 'Şanzıman': '7DSG',  'Yakıt': '4.3 L/100km', '0-100': '8.4 sn',  'Fiyat': '2.100.000 ₺' },
        { 'Motor': 'GTE (PHEV)',          'Güç': '245 HP', 'Şanzıman': '6DSG',  'Yakıt': '1.2 L/100km', '0-100': '6.7 sn',  'Fiyat': '2.280.000 ₺' },
      ],
      'Platform':     'MQB Evo',
      'Karoser':      '5 kapılı Hatchback',
      'Uzunluk':      '4.284 mm',
      'Genişlik':     '1.789 mm',
      'Yükseklik':    '1.456 mm',
      'Dingil Mesafesi': '2.686 mm',
      'Bagaj':        '381 L (arka koltuk yukarıda)',
      'ChatGPT':      'Ses asistanı entegrasyonu',
      'ADAS':         'IQ.Drive paket (Travel Assist, Lane Assist, Park Assist)',
      'Garanti':      '2 yıl / sınırsız km',
    },
  },

  // ── Volkswagen Tiguan ───────────────────────────────────────────────────────
  {
    slug: 'volkswagen-tiguan-2026',
    name: 'Tiguan',
    price_min: 2_350_000,
    price_max: 3_400_000,
    specs: {
      'Donanım Seçenekleri': [
        { 'Motor': '1.5 TSI eTSI Life',     'Güç': '130 HP', 'Şanzıman': '7DSG',       'Sürüş': 'FWD',  'Yakıt': '6.0 L/100km', 'Fiyat': '2.350.000 ₺' },
        { 'Motor': '1.5 TSI eTSI Style',    'Güç': '150 HP', 'Şanzıman': '7DSG',       'Sürüş': 'FWD',  'Yakıt': '5.8 L/100km', 'Fiyat': '2.550.000 ₺' },
        { 'Motor': '2.0 TDI 4MOTION',       'Güç': '150 HP', 'Şanzıman': '7DSG',       'Sürüş': 'AWD',  'Yakıt': '5.0 L/100km', 'Fiyat': '2.800.000 ₺' },
        { 'Motor': '2.0 TSI R-Line 4MOTION','Güç': '204 HP', 'Şanzıman': '7DSG',       'Sürüş': 'AWD',  'Yakıt': '7.5 L/100km', 'Fiyat': '3.150.000 ₺' },
        { 'Motor': 'eHybrid (PHEV)',         'Güç': '272 HP', 'Şanzıman': '6DSG',       'Sürüş': 'FWD',  'Yakıt': '1.2 L/100km', 'Fiyat': '3.400.000 ₺' },
      ],
      'Platform':          'MQB Evo',
      'Karoser':           '5 kapılı SUV',
      'Uzunluk':           '4.539 mm',
      'Genişlik':          '1.842 mm',
      'Yükseklik':         '1.661 mm',
      'Bagaj':             '652 L (arka koltuk yukarıda)',
      'Ekran':             '15 inç (IQ.LIGHT standart)',
      'Dijital Gösterge':  '10.25 inç Digital Cockpit',
      'Garanti':           '2 yıl / sınırsız km',
    },
  },

  // ── BMW 3 Serisi ────────────────────────────────────────────────────────────
  {
    slug: 'bmw-3-serisi-2026',
    name: '3 Serisi',
    price_min: 2_750_000,
    price_max: 4_500_000,
    specs: {
      'Donanım Seçenekleri': [
        { 'Motor': '318i',    'Güç': '156 HP', 'Tork': '250 Nm', 'Şanzıman': '8AT', 'Sürüş': 'RWD', '0-100': '8.9 sn', 'Yakıt': '6.5 L/100km', 'Fiyat': '2.750.000 ₺' },
        { 'Motor': '320i',    'Güç': '184 HP', 'Tork': '300 Nm', 'Şanzıman': '8AT', 'Sürüş': 'RWD', '0-100': '7.1 sn', 'Yakıt': '6.4 L/100km', 'Fiyat': '3.100.000 ₺' },
        { 'Motor': '320d',    'Güç': '190 HP', 'Tork': '400 Nm', 'Şanzıman': '8AT', 'Sürüş': 'RWD', '0-100': '7.0 sn', 'Yakıt': '4.5 L/100km', 'Fiyat': '3.300.000 ₺' },
        { 'Motor': '330i',    'Güç': '258 HP', 'Tork': '400 Nm', 'Şanzıman': '8AT', 'Sürüş': 'RWD', '0-100': '5.8 sn', 'Yakıt': '6.6 L/100km', 'Fiyat': '3.700.000 ₺' },
        { 'Motor': '330e',    'Güç': '292 HP', 'Tork': '420 Nm', 'Şanzıman': '8AT', 'Sürüş': 'RWD', '0-100': '5.9 sn', 'Yakıt': '1.4 L/100km', 'Fiyat': '3.950.000 ₺' },
        { 'Motor': 'M340i',   'Güç': '374 HP', 'Tork': '500 Nm', 'Şanzıman': '8AT', 'Sürüş': 'AWD', '0-100': '4.4 sn', 'Yakıt': '7.8 L/100km', 'Fiyat': '4.500.000 ₺' },
      ],
      'Platform':          'CLAR (Cluster Architecture)',
      'Karoser':           '4 kapılı Sedan',
      'Uzunluk':           '4.709 mm',
      'Genişlik':          '1.827 mm',
      'Yükseklik':         '1.435 mm',
      'Bagaj':             '480 L',
      'Ekran':             'BMW Curved Display (12.3" + 14.9")',
      'OS':                'BMW Operating System 8.5',
      'Sürüş Modu':        'Eco, Comfort, Sport, Sport+ (M Sport: Adaptive M)',
      'Garanti':           '2 yıl / sınırsız km',
    },
  },

  // ── Mercedes-Benz C-Serisi ──────────────────────────────────────────────────
  {
    slug: 'mercedes-c-serisi-2026',
    name: 'C-Serisi',
    price_min: 3_100_000,
    price_max: 5_200_000,
    specs: {
      'Donanım Seçenekleri': [
        { 'Motor': 'C 180',   'Güç': '170 HP', 'Tork': '250 Nm', 'Şanzıman': '9AT', 'Sürüş': 'RWD', '0-100': '8.0 sn', 'Yakıt': '6.3 L/100km', 'Fiyat': '3.100.000 ₺' },
        { 'Motor': 'C 200',   'Güç': '204 HP', 'Tork': '300 Nm', 'Şanzıman': '9AT', 'Sürüş': 'RWD', '0-100': '7.3 sn', 'Yakıt': '6.1 L/100km', 'Fiyat': '3.400.000 ₺' },
        { 'Motor': 'C 220d',  'Güç': '200 HP', 'Tork': '440 Nm', 'Şanzıman': '9AT', 'Sürüş': 'RWD', '0-100': '6.8 sn', 'Yakıt': '4.7 L/100km', 'Fiyat': '3.650.000 ₺' },
        { 'Motor': 'C 300',   'Güç': '258 HP', 'Tork': '400 Nm', 'Şanzıman': '9AT', 'Sürüş': 'RWD', '0-100': '5.9 sn', 'Yakıt': '6.5 L/100km', 'Fiyat': '4.100.000 ₺' },
        { 'Motor': 'C 300e',  'Güç': '313 HP', 'Tork': '550 Nm', 'Şanzıman': '9AT', 'Sürüş': 'RWD', '0-100': '5.7 sn', 'Yakıt': '0.8 L/100km', 'Fiyat': '4.600.000 ₺' },
        { 'Motor': 'C 63 AMG S E Performance', 'Güç': '680 HP', 'Tork': '1.020 Nm', 'Şanzıman': '9AT', 'Sürüş': 'RWD', '0-100': '3.4 sn', 'Yakıt': '1.7 L/100km', 'Fiyat': '5.200.000 ₺' },
      ],
      'Platform':          'MRA2 (Modular Rear Architecture)',
      'Karoser':           '4 kapılı Sedan',
      'Uzunluk':           '4.751 mm',
      'Genişlik':          '1.820 mm',
      'Yükseklik':         '1.438 mm',
      'Bagaj':             '455 L',
      'Ekran':             '11.9 inç MBUX dikey ekran',
      'Dijital Gösterge':  '12.3 inç dijital gösterge',
      'Ses Sistemi':       'Burmester 3D surround (üst paket)',
      'Garanti':           '2 yıl / sınırsız km',
    },
  },

  // ── Kia EV6 ────────────────────────────────────────────────────────────────
  {
    slug: 'kia-ev6-2026',
    name: 'EV6',
    price_min: 2_750_000,
    price_max: 4_100_000,
    specs: {
      'Donanım Seçenekleri': [
        { 'Versiyon': 'Standard Range RWD', 'Güç': '168 HP', 'Batarya': '58 kWh',  'Menzil (WLTP)': '394 km', 'Hızlı Şarj': '80 kW',    '0-100': '8.5 sn', 'Fiyat': '2.750.000 ₺' },
        { 'Versiyon': 'Long Range RWD',     'Güç': '229 HP', 'Batarya': '77.4 kWh','Menzil (WLTP)': '528 km', 'Hızlı Şarj': '350 kW',   '0-100': '7.3 sn', 'Fiyat': '3.250.000 ₺' },
        { 'Versiyon': 'Long Range AWD',     'Güç': '325 HP', 'Batarya': '77.4 kWh','Menzil (WLTP)': '484 km', 'Hızlı Şarj': '350 kW',   '0-100': '5.1 sn', 'Fiyat': '3.750.000 ₺' },
        { 'Versiyon': 'GT (AWD)',           'Güç': '585 HP', 'Batarya': '77.4 kWh','Menzil (WLTP)': '424 km', 'Hızlı Şarj': '350 kW',   '0-100': '3.5 sn', 'Fiyat': '4.100.000 ₺' },
      ],
      'Şarj Mimarisi':     '800V ultra-hızlı şarj',
      'AC Şarj':           '11 kW',
      'Şarj Süresi':       '%10 → %80: 18 dk (350 kW ile)',
      'Platform':          'Hyundai E-GMP',
      'Karoser':           '4 kapılı CUV (Crossover Utility Vehicle)',
      'Uzunluk':           '4.695 mm',
      'Bagaj':             '490 L + 52 L frunk',
      'V2L':               'Vehicle-to-Load 3.6 kW (yolcu bölmesi + harici)',
      'Garanti':           '7 yıl / 150.000 km (batarya 70% kapasite)',
    },
  },

  // ── Tesla Model Y ──────────────────────────────────────────────────────────
  {
    slug: 'tesla-model-y-2026',
    name: 'Model Y',
    price_min: 2_450_000,
    price_max: 3_650_000,
    specs: {
      'Donanım Seçenekleri': [
        { 'Versiyon': 'Standard Range RWD', 'Güç': '208 HP', 'Batarya': '60 kWh',   'Menzil (WLTP)': '430 km', 'Hızlı Şarj': '170 kW',  '0-100': '6.9 sn', 'Fiyat': '2.450.000 ₺' },
        { 'Versiyon': 'Long Range RWD',     'Güç': '299 HP', 'Batarya': '75 kWh',   'Menzil (WLTP)': '533 km', 'Hızlı Şarj': '250 kW',  '0-100': '5.9 sn', 'Fiyat': '2.850.000 ₺' },
        { 'Versiyon': 'Long Range AWD',     'Güç': '400 HP', 'Batarya': '75 kWh',   'Menzil (WLTP)': '533 km', 'Hızlı Şarj': '250 kW',  '0-100': '4.9 sn', 'Fiyat': '3.250.000 ₺' },
        { 'Versiyon': 'Performance AWD',    'Güç': '513 HP', 'Batarya': '75 kWh',   'Menzil (WLTP)': '514 km', 'Hızlı Şarj': '250 kW',  '0-100': '3.3 sn', 'Fiyat': '3.650.000 ₺' },
      ],
      'Şarj Ağı':          'Tesla Supercharger (V3: 250 kW)',
      'AC Şarj':           '11 kW',
      'Platform':          'Model Y Juniper (2024 yenilemesi)',
      'Karoser':           '5 kapılı SUV',
      'Uzunluk':           '4.751 mm',
      'Bagaj':             '854 L (arka + frunk)',
      'Sürücü Destek':     'Autopilot standart / FSD opsiyonel',
      'Ekran':             '15.4 inç merkezi + 8 inç arka',
      'Ses Sistemi':       '17 hoparlör (üst paket)',
      'Garanti':           '4 yıl / 80.000 km',
    },
  },

  // ── Toyota RAV4 Hybrid ─────────────────────────────────────────────────────
  {
    slug: 'toyota-rav4-hybrid-2026',
    name: 'RAV4 Hybrid',
    price_min: 2_550_000,
    price_max: 3_250_000,
    specs: {
      'Donanım Seçenekleri': [
        { 'Donanım': 'Passion',     'Motor': '2.5 DOHC + 2 e-motor', 'Güç': '222 HP', 'Sürüş': '2WD (FWD)', 'Yakıt': '5.5 L/100km', 'Fiyat': '2.550.000 ₺' },
        { 'Donanım': 'Passion AWD', 'Motor': '2.5 DOHC + 3 e-motor', 'Güç': '222 HP', 'Sürüş': 'AWD-i',    'Yakıt': '5.8 L/100km', 'Fiyat': '2.850.000 ₺' },
        { 'Donanım': 'Style AWD',   'Motor': '2.5 DOHC + 3 e-motor', 'Güç': '222 HP', 'Sürüş': 'AWD-i',    'Yakıt': '5.8 L/100km', 'Fiyat': '3.050.000 ₺' },
        { 'Donanım': 'Prestige AWD','Motor': '2.5 DOHC + 3 e-motor', 'Güç': '222 HP', 'Sürüş': 'AWD-i',    'Yakıt': '5.8 L/100km', 'Fiyat': '3.250.000 ₺' },
      ],
      'Hibrit Sistemi':    'THS II (Toyota Hybrid System 5. nesil)',
      'Şanzıman':          'e-CVT',
      '0-100 km/s':        '7.4 sn (AWD-i)',
      'CO2 Emisyonu':      '126 g/km',
      'Uzunluk':           '4.600 mm',
      'Genişlik':          '1.855 mm',
      'Yükseklik':         '1.685 mm',
      'Bagaj':             '580 L',
      'ADAS':              'Toyota Safety Sense 3.0 (standart)',
      'Garanti':           '3 yıl / 100.000 km',
    },
  },

  // ── Hyundai Tucson Hybrid ──────────────────────────────────────────────────
  {
    slug: 'hyundai-tucson-hybrid-2026',
    name: 'Tucson Hybrid',
    price_min: 2_100_000,
    price_max: 2_900_000,
    specs: {
      'Donanım Seçenekleri': [
        { 'Donanım': 'Style',     'Motor': '1.6T GDi + e-motor', 'Güç': '230 HP', 'Sürüş': '2WD',   'Şanzıman': '6DCT', 'Yakıt': '6.3 L/100km', 'Fiyat': '2.100.000 ₺' },
        { 'Donanım': 'Style AWD', 'Motor': '1.6T GDi + e-motor', 'Güç': '230 HP', 'Sürüş': 'HTRAC', 'Şanzıman': '6DCT', 'Yakıt': '6.8 L/100km', 'Fiyat': '2.400.000 ₺' },
        { 'Donanım': 'Elegance AWD', 'Motor': '1.6T GDi + e-motor', 'Güç': '230 HP', 'Sürüş': 'HTRAC','Şanzıman': '6DCT','Yakıt': '6.8 L/100km','Fiyat': '2.650.000 ₺' },
        { 'Donanım': 'Prestige AWD', 'Motor': '1.6T GDi + e-motor', 'Güç': '230 HP', 'Sürüş': 'HTRAC','Şanzıman': '6DCT','Yakıt': '6.8 L/100km','Fiyat': '2.900.000 ₺' },
      ],
      'Uzunluk':           '4.500 mm',
      'Genişlik':          '1.865 mm',
      'Yükseklik':         '1.650 mm',
      'Bagaj':             '558 L',
      'Ekran':             '10.25 inç merkezi + 10.25 inç dijital gösterge',
      'Panoramik Tavan':   'Standart (üst paketler)',
      'ADAS':              'SmartSense (standart)',
      'Garanti':           '5 yıl / 100.000 km',
    },
  },

  // ── Kia Sportage Hybrid ────────────────────────────────────────────────────
  {
    slug: 'kia-sportage-hybrid-2026',
    name: 'Sportage Hybrid',
    price_min: 2_050_000,
    price_max: 2_800_000,
    specs: {
      'Donanım Seçenekleri': [
        { 'Donanım': 'Concept',       'Motor': '1.6T GDi + e-motor', 'Güç': '230 HP', 'Sürüş': '2WD',  'Şanzıman': '6DCT', 'Yakıt': '6.3 L/100km', 'Fiyat': '2.050.000 ₺' },
        { 'Donanım': 'Prestige AWD',  'Motor': '1.6T GDi + e-motor', 'Güç': '230 HP', 'Sürüş': 'AWD',  'Şanzıman': '6DCT', 'Yakıt': '6.8 L/100km', 'Fiyat': '2.400.000 ₺' },
        { 'Donanım': 'Gt-Line AWD',   'Motor': '1.6T GDi + e-motor', 'Güç': '230 HP', 'Sürüş': 'AWD',  'Şanzıman': '6DCT', 'Yakıt': '6.8 L/100km', 'Fiyat': '2.650.000 ₺' },
        { 'Donanım': 'Gt-Line Prestige AWD', 'Motor': '1.6T GDi + e-motor', 'Güç': '230 HP', 'Sürüş': 'AWD', 'Şanzıman': '6DCT', 'Yakıt': '6.8 L/100km', 'Fiyat': '2.800.000 ₺' },
      ],
      'Platform':          'Hyundai N3 (5. nesil)',
      'Uzunluk':           '4.515 mm',
      'Bagaj':             '543 L',
      'Panoramik Ekran':   'Çift 12.3" (merkezi + gösterge)',
      'ADAS':              'DriveWise paketi (standart)',
      'Garanti':           '7 yıl / 150.000 km',
    },
  },

  // ── Toyota Corolla Hybrid ──────────────────────────────────────────────────
  {
    slug: 'toyota-corolla-sedan-hybrid-2026',
    name: 'Corolla Hybrid',
    price_min: 1_480_000,
    price_max: 1_980_000,
    specs: {
      'Donanım Seçenekleri': [
        { 'Donanım': 'Passion',     'Motor': '1.8L DOHC + e-motor', 'Güç': '140 HP', 'Yakıt': '4.3 L/100km', '0-100': '10.9 sn', 'Fiyat': '1.480.000 ₺' },
        { 'Donanım': 'Vision',      'Motor': '1.8L DOHC + e-motor', 'Güç': '140 HP', 'Yakıt': '4.3 L/100km', '0-100': '10.9 sn', 'Fiyat': '1.620.000 ₺' },
        { 'Donanım': 'Style',       'Motor': '1.8L DOHC + e-motor', 'Güç': '140 HP', 'Yakıt': '4.3 L/100km', '0-100': '10.9 sn', 'Fiyat': '1.780.000 ₺' },
        { 'Donanım': 'Prestige',    'Motor': '1.8L DOHC + e-motor', 'Güç': '140 HP', 'Yakıt': '4.3 L/100km', '0-100': '10.9 sn', 'Fiyat': '1.980.000 ₺' },
      ],
      'Hibrit Sistemi':    'THS II (Toyota Hybrid System)',
      'Şanzıman':          'e-CVT',
      'CO2 Emisyonu':      '99 g/km',
      'Uzunluk':           '4.620 mm',
      'Bagaj':             '471 L',
      'ADAS':              'Toyota Safety Sense 3.0 (standart)',
      'Garanti':           '3 yıl / 100.000 km',
    },
  },

  // ── Hyundai Elantra Hybrid ─────────────────────────────────────────────────
  {
    slug: 'hyundai-elantra-hybrid-2026',
    name: 'Elantra Hybrid',
    price_min: 1_450_000,
    price_max: 1_950_000,
    specs: {
      'Donanım Seçenekleri': [
        { 'Donanım': 'Elegant',   'Motor': '1.6 GDi + e-motor', 'Güç': '141 HP', 'Şanzıman': '6DCT', 'Yakıt': '4.8 L/100km', '0-100': '9.0 sn', 'Fiyat': '1.450.000 ₺' },
        { 'Donanım': 'Style',     'Motor': '1.6 GDi + e-motor', 'Güç': '141 HP', 'Şanzıman': '6DCT', 'Yakıt': '4.8 L/100km', '0-100': '9.0 sn', 'Fiyat': '1.650.000 ₺' },
        { 'Donanım': 'Prestige',  'Motor': '1.6 GDi + e-motor', 'Güç': '141 HP', 'Şanzıman': '6DCT', 'Yakıt': '4.8 L/100km', '0-100': '9.0 sn', 'Fiyat': '1.950.000 ₺' },
      ],
      'Uzunluk':           '4.675 mm',
      'Bagaj':             '474 L',
      'Ekran':             '10.25 inç merkezi + 10.25 inç gösterge',
      'ADAS':              'SmartSense (standart)',
      'Garanti':           '5 yıl / 100.000 km',
    },
  },

  // ── Kia K4 Hybrid ──────────────────────────────────────────────────────────
  {
    slug: 'kia-k4-hybrid-2026',
    name: 'K4 Hybrid',
    price_min: 1_520_000,
    price_max: 2_050_000,
    specs: {
      'Donanım Seçenekleri': [
        { 'Donanım': 'Concept',     'Motor': '1.6 GDi + e-motor', 'Güç': '141 HP', 'Şanzıman': '6DCT', 'Yakıt': '5.0 L/100km', 'Fiyat': '1.520.000 ₺' },
        { 'Donanım': 'Prestige',    'Motor': '1.6 GDi + e-motor', 'Güç': '141 HP', 'Şanzıman': '6DCT', 'Yakıt': '5.0 L/100km', 'Fiyat': '1.780.000 ₺' },
        { 'Donanım': 'Gt-Line',     'Motor': '1.6 GDi + e-motor', 'Güç': '141 HP', 'Şanzıman': '6DCT', 'Yakıt': '5.0 L/100km', 'Fiyat': '2.050.000 ₺' },
      ],
      'Uzunluk':           '4.620 mm',
      'Bagaj':             '502 L',
      'Panoramik Ekran':   'Çift 12.3" (merkezi + gösterge)',
      'ADAS':              'DriveWise (standart)',
      'Garanti':           '7 yıl / 150.000 km',
    },
  },

  // ── Renault Clio E-Tech ────────────────────────────────────────────────────
  {
    slug: 'renault-clio-etech-2026',
    name: 'Clio E-Tech Hybrid',
    price_min: 1_050_000,
    price_max: 1_620_000,
    specs: {
      'Donanım Seçenekleri': [
        { 'Donanım': 'Evolution',   'Motor': '1.6L + e-motor (full hybrid)', 'Güç': '145 HP', 'Yakıt': '4.4 L/100km', 'Şehir Elektr.': '%80', 'Fiyat': '1.050.000 ₺' },
        { 'Donanım': 'Techno',      'Motor': '1.6L + e-motor (full hybrid)', 'Güç': '145 HP', 'Yakıt': '4.4 L/100km', 'Şehir Elektr.': '%80', 'Fiyat': '1.250.000 ₺' },
        { 'Donanım': 'Esprit Alpine','Motor': '1.6L + e-motor (full hybrid)', 'Güç': '145 HP', 'Yakıt': '4.4 L/100km', 'Şehir Elektr.': '%80', 'Fiyat': '1.450.000 ₺' },
        { 'Donanım': 'Iconic',      'Motor': '1.6L + e-motor (full hybrid)', 'Güç': '145 HP', 'Yakıt': '4.4 L/100km', 'Şehir Elektr.': '%80', 'Fiyat': '1.620.000 ₺' },
      ],
      'Hibrit Sistemi':    'E-Tech full hybrid (F1 teknolojisi türevi)',
      'Şanzıman':          'Multi-mode (debriyajsız, otomatik)',
      'Uzunluk':           '4.050 mm',
      'Bagaj':             '391 L',
      'İnfotainment':      'Google OpenR Link (10.1 inç)',
      'Garanti':           '2 yıl / 100.000 km',
    },
  },

  // ── Hyundai i20 Hybrid ─────────────────────────────────────────────────────
  {
    slug: 'hyundai-i20-hybrid-2026',
    name: 'i20 Hybrid',
    price_min:   970_000,
    price_max: 1_380_000,
    specs: {
      'Donanım Seçenekleri': [
        { 'Donanım': 'Style',     'Motor': '1.0T GDi 48V mild hybrid', 'Güç': '100 HP', 'Şanzıman': '6iMT', 'Yakıt': '5.3 L/100km', 'Fiyat':   '970.000 ₺' },
        { 'Donanım': 'Elegance',  'Motor': '1.0T GDi 48V mild hybrid', 'Güç': '100 HP', 'Şanzıman': '7DCT', 'Yakıt': '5.1 L/100km', 'Fiyat': '1.150.000 ₺' },
        { 'Donanım': 'N-Line',    'Motor': '1.0T GDi 48V mild hybrid', 'Güç': '120 HP', 'Şanzıman': '7DCT', 'Yakıt': '5.8 L/100km', 'Fiyat': '1.250.000 ₺' },
        { 'Donanım': 'N-Line Prestige', 'Motor': '1.6T GDi',           'Güç': '150 HP', 'Şanzıman': '6MT',  'Yakıt': '6.8 L/100km', 'Fiyat': '1.380.000 ₺' },
      ],
      'Uzunluk':           '4.040 mm',
      'Bagaj':             '352 L',
      'Ekran':             '10.25 inç (Elegance ve üstü)',
      'ADAS':              'SmartSense (Elegance ve üstü standart)',
      'Garanti':           '5 yıl / 100.000 km',
    },
  },

  // ── Toyota Yaris Hybrid ────────────────────────────────────────────────────
  {
    slug: 'toyota-yaris-hybrid-2026',
    name: 'Yaris Hybrid',
    price_min: 1_150_000,
    price_max: 1_680_000,
    specs: {
      'Donanım Seçenekleri': [
        { 'Donanım': 'Passion',     'Motor': '1.5L DOHC + e-motor', 'Güç': '130 HP', 'Şanzıman': 'e-CVT', 'Yakıt': '3.8 L/100km', '0-100': '9.4 sn', 'Fiyat': '1.150.000 ₺' },
        { 'Donanım': 'Vision',      'Motor': '1.5L DOHC + e-motor', 'Güç': '130 HP', 'Şanzıman': 'e-CVT', 'Yakıt': '3.8 L/100km', '0-100': '9.4 sn', 'Fiyat': '1.280.000 ₺' },
        { 'Donanım': 'GR Sport',    'Motor': '1.5L DOHC + e-motor', 'Güç': '130 HP', 'Şanzıman': 'e-CVT', 'Yakıt': '4.1 L/100km', '0-100': '9.4 sn', 'Fiyat': '1.480.000 ₺' },
        { 'Donanım': 'GR Sport Prestige', 'Motor': '1.5L DOHC + e-motor', 'Güç': '130 HP', 'Şanzıman': 'e-CVT', 'Yakıt': '4.1 L/100km', '0-100': '9.4 sn', 'Fiyat': '1.680.000 ₺' },
      ],
      'Hibrit Sistemi':    'THS II (5. nesil)',
      'CO2 Emisyonu':      '86 g/km',
      'Uzunluk':           '3.940 mm',
      'Bagaj':             '286 L',
      'ADAS':              'Toyota Safety Sense 2.0 (standart)',
      'Garanti':           '3 yıl / 100.000 km',
    },
  },

  // ── Toyota Corolla Cross ───────────────────────────────────────────────────
  {
    slug: 'toyota-corolla-cross-hybrid-2026',
    name: 'Corolla Cross Hybrid',
    price_min: 1_850_000,
    price_max: 2_450_000,
    specs: {
      'Donanım Seçenekleri': [
        { 'Donanım': 'Passion',     'Motor': '2.0L DOHC + e-motor', 'Güç': '196 HP', 'Sürüş': 'FWD', 'Yakıt': '5.0 L/100km', 'Fiyat': '1.850.000 ₺' },
        { 'Donanım': 'Vision',      'Motor': '2.0L DOHC + e-motor', 'Güç': '196 HP', 'Sürüş': 'FWD', 'Yakıt': '5.0 L/100km', 'Fiyat': '2.050.000 ₺' },
        { 'Donanım': 'Style',       'Motor': '2.0L DOHC + e-motor', 'Güç': '196 HP', 'Sürüş': 'FWD', 'Yakıt': '5.0 L/100km', 'Fiyat': '2.250.000 ₺' },
        { 'Donanım': 'Prestige',    'Motor': '2.0L DOHC + e-motor', 'Güç': '196 HP', 'Sürüş': 'FWD', 'Yakıt': '5.0 L/100km', 'Fiyat': '2.450.000 ₺' },
      ],
      'Hibrit Sistemi':    'THS II',
      'Şanzıman':          'e-CVT',
      'CO2 Emisyonu':      '114 g/km',
      'Uzunluk':           '4.460 mm',
      'Bagaj':             '487 L',
      'ADAS':              'Toyota Safety Sense 3.0 (standart)',
      'Garanti':           '3 yıl / 100.000 km',
    },
  },

  // ── Honda HR-V ─────────────────────────────────────────────────────────────
  {
    slug: 'honda-hrv-ehev-2026',
    name: 'HR-V e:HEV',
    price_min: 1_780_000,
    price_max: 2_280_000,
    specs: {
      'Donanım Seçenekleri': [
        { 'Donanım': 'Advance',         'Motor': '1.5L DOHC + 2 e-motor', 'Güç': '131 HP', 'Sürüş': 'FWD', 'Yakıt': '5.0 L/100km', 'Fiyat': '1.780.000 ₺' },
        { 'Donanım': 'Advance Style',   'Motor': '1.5L DOHC + 2 e-motor', 'Güç': '131 HP', 'Sürüş': 'FWD', 'Yakıt': '5.0 L/100km', 'Fiyat': '2.050.000 ₺' },
        { 'Donanım': 'Executive',       'Motor': '1.5L DOHC + 2 e-motor', 'Güç': '131 HP', 'Sürüş': 'FWD', 'Yakıt': '5.0 L/100km', 'Fiyat': '2.280.000 ₺' },
      ],
      'Hibrit Sistemi':    'Honda e:HEV (seri-paralel, 2 e-motor)',
      'Şanzıman':          'eCVT (yalnızca elektrik şanzımanı)',
      'Uzunluk':           '4.330 mm',
      'Bagaj':             '304 L (kolların arkasında 400+ L',
      'ADAS':              'Honda SENSING (standart)',
      'Garanti':           '5 yıl / 100.000 km',
    },
  },
];

// ─── Update Logic ─────────────────────────────────────────────────────────────

async function updateProduct({ slug, name, price_min, price_max, specs }) {
  const { data: existing } = await supabase
    .from('products').select('id, name').eq('slug', slug).single();

  if (!existing) {
    console.log(`  ⚠️  Bulunamadı: ${slug}`);
    return;
  }

  const { error } = await supabase
    .from('products')
    .update({ name, price_min, price_max, specs, updated_at: new Date().toISOString() })
    .eq('slug', slug);

  if (error) {
    console.error(`  ❌ Hata (${slug}): ${error.message}`);
  } else {
    const variantCount = specs['Donanım Seçenekleri']?.length ?? 0;
    console.log(`  ✅ Güncellendi: "${existing.name}" → "${name}" (${variantCount} donanım seçeneği)`);
  }
}

async function main() {
  console.log('🔧 Ürün verisi düzeltiliyor (base model + donanım seçenekleri)...\n');

  let updated = 0;
  for (const product of UPDATES) {
    await updateProduct(product);
    updated++;
  }

  console.log(`\n📊 Tamamlandı: ${updated} ürün güncellendi`);
  console.log('✅ Artık her ürün base model, motorlar/donanımlar specs tablosunda!');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
