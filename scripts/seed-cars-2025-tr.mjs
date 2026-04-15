/**
 * seed-cars-2025-tr.mjs
 * Türkiye 2025 pazarının en popüler araçları — görsellerle birlikte.
 * Mevcut slug varsa atlanır (idempotent).
 * Çalıştır: cd scripts && node seed-cars-2025-tr.mjs
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

const SUPABASE_URL        = process.env.NEXT_PUBLIC_SUPABASE_URL || env['NEXT_PUBLIC_SUPABASE_URL'];
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY    || env['SUPABASE_SERVICE_KEY'];

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL veya SUPABASE_SERVICE_KEY eksik');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getCategoryId(slug) {
  const { data } = await supabase.from('categories').select('id').eq('slug', slug).single();
  return data?.id ?? null;
}

async function getSegmentId(slug, categoryId) {
  const { data } = await supabase.from('segments').select('id')
    .eq('slug', slug).eq('category_id', categoryId).single();
  return data?.id ?? null;
}

async function upsertCategory(cat) {
  const existing = await getCategoryId(cat.slug);
  if (existing) return existing;
  const { data, error } = await supabase.from('categories').insert(cat).select('id').single();
  if (error) throw new Error(`Category insert failed (${cat.slug}): ${error.message}`);
  console.log(`  ✅ Yeni kategori: ${cat.name}`);
  return data.id;
}

async function upsertSegment(seg) {
  const existing = await getSegmentId(seg.slug, seg.category_id);
  if (existing) return existing;
  const { data, error } = await supabase.from('segments').insert(seg).select('id').single();
  if (error) throw new Error(`Segment insert failed (${seg.slug}): ${error.message}`);
  console.log(`  ✅ Yeni segment: ${seg.name}`);
  return data.id;
}

async function insertProduct(product) {
  const { data: existing } = await supabase
    .from('products').select('id').eq('slug', product.slug).single();
  if (existing) {
    console.log(`  ⏭  Mevcut, atlandı: ${product.slug}`);
    return null;
  }
  const { data, error } = await supabase.from('products').insert(product).select('id').single();
  if (error) throw new Error(`Product insert failed (${product.slug}): ${error.message}`);
  console.log(`  ✅ Eklendi: ${product.brand} ${product.model} (${product.model_year})`);
  return data.id;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Türkiye 2025 araç seed\'i başlıyor...\n');

  const now = new Date().toISOString();

  // ── Kategoriler ──
  console.log('📂 Kategoriler...');
  const suvId      = await upsertCategory({ name: 'SUV', slug: 'suv', icon: '🚙', description: 'Sport Utility Vehicle', display_order: 1, is_active: true });
  const sedanId    = await upsertCategory({ name: 'Sedan', slug: 'sedan', icon: '🚗', description: 'Üç hacimli yolcu otomobili', display_order: 2, is_active: true });
  const hatchId    = await upsertCategory({ name: 'Hatchback', slug: 'hatchback', icon: '🚘', description: 'Kompakt otomobil', display_order: 3, is_active: true });
  const crossId    = await upsertCategory({ name: 'Crossover', slug: 'crossover', icon: '🛻', description: 'Crossover SUV', display_order: 4, is_active: true });

  // ── Segmentler ──
  console.log('\n📁 Segmentler...');
  const hybridSuvSeg   = await upsertSegment({ category_id: suvId,    name: 'Hibrit SUV',            slug: 'hibrit-suv',         description: 'Hibrit yakıt sistemi SUV',   price_min: 1800000, price_max: 4500000, display_order: 1, is_active: true });
  const elektrikSuvSeg = await upsertSegment({ category_id: suvId,    name: 'Elektrikli SUV',         slug: 'elektrikli-suv',     description: 'Tam elektrikli SUV',         price_min: 1500000, price_max: 4000000, display_order: 2, is_active: true });
  const komSuvSeg      = await upsertSegment({ category_id: suvId,    name: 'Kompakt SUV',            slug: 'kompakt-suv',        description: 'B/C segmenti SUV',           price_min: 1200000, price_max: 3500000, display_order: 3, is_active: true });
  const luksSedanSeg   = await upsertSegment({ category_id: sedanId,  name: 'Lüks Sedan',             slug: 'luks-sedan',         description: 'Premium sedan',              price_min: 2500000, price_max: 7000000, display_order: 1, is_active: true });
  const ortaSedanSeg   = await upsertSegment({ category_id: sedanId,  name: 'Orta Sınıf Sedan',       slug: 'orta-sinif-sedan',   description: 'Kompakt/orta sedan',         price_min: 1200000, price_max: 2800000, display_order: 2, is_active: true });
  const komHatchSeg    = await upsertSegment({ category_id: hatchId,  name: 'Kompakt Hatchback',      slug: 'kompakt-hatchback',  description: 'B/C segmenti hatchback',     price_min: 900000,  price_max: 2500000, display_order: 1, is_active: true });
  const crossSeg       = await upsertSegment({ category_id: crossId,  name: 'Kompakt Crossover',      slug: 'kompakt-crossover',  description: 'Kompakt crossover',          price_min: 1200000, price_max: 3000000, display_order: 1, is_active: true });

  // ── Ürünler ──────────────────────────────────────────────────────────────────
  console.log('\n🚗 Ürünler ekleniyor...');

  const PRODUCTS = [

    // ════════════════════════════════════════════════════
    //  Hibrit SUV — Türkiye'nin en çok satan segmenti
    // ════════════════════════════════════════════════════

    {
      category_id: suvId, segment_id: hybridSuvSeg,
      name: 'RAV4 Hybrid', slug: 'toyota-rav4-hybrid-2025',
      brand: 'Toyota', model: 'RAV4 Hybrid', model_year: 2025,
      price_min: 2650000, price_max: 3100000, currency: 'TRY',
      image_url: 'https://www.toyota.com.tr/content/dam/toyota/turkey/models/rav4/carconfigurator/toyota-rav4-hybrid-2024-red-front.jpg',
      status: 'active', is_featured: true, source: 'manual', published_at: now,
      short_description: 'Toyota RAV4 Hybrid, 222 HP toplam sistem gücü ve 2WD/AWD seçeneğiyle Türkiye\'nin en çok satan hibrit SUV\'u. 5.5 lt/100km yakıt tüketimi.',
      description: 'RAV4 Hybrid, Toyota\'nın 5. nesil THS II (Toyota Hybrid System) teknolojisiyle donatılmış. AWD-i versiyonu, arka aks için ayrı elektrik motoru kullanarak dört tekerlekten çekiş sağlıyor. Yakıt tasarrufunda segmentin referansı.',
      specs: { 'Motor': '2.5L DOHC + 2 elektrik motoru', 'Toplam Güç': '222 HP', 'Yakıt Tüketimi': '5.5 L/100km', 'Sürüş Sistemi': 'AWD-i', 'Şanzıman': 'e-CVT', '0-100 km/s': '7.4 sn', 'CO2': '126 g/km', 'Bagaj': '580 L', 'Garanti': '3 yıl / 100.000 km' },
      meta_title: 'Toyota RAV4 Hybrid 2025 Fiyat ve Özellikleri | Compario',
      meta_description: 'Toyota RAV4 Hybrid 2025 Türkiye fiyatı 2.650.000 TL. 222 HP, AWD-i, 5.5 L/100km yakıt tüketimi.',
    },

    {
      category_id: suvId, segment_id: hybridSuvSeg,
      name: 'Tucson Hybrid', slug: 'hyundai-tucson-hybrid-2025',
      brand: 'Hyundai', model: 'Tucson Hybrid', model_year: 2025,
      price_min: 2200000, price_max: 2750000, currency: 'TRY',
      image_url: 'https://www.hyundai.com/content/dam/hyundai/eu/en/cars/all-new-tucson/overview/all-new-tucson-main-pc.jpg',
      status: 'active', is_featured: true, source: 'manual', published_at: now,
      short_description: 'Hyundai Tucson Hybrid, 230 HP hibrit sistemi, panoramik cam tavan ve Tucson\'a özel "Hidden Lighting" tasarımıyla öne çıkıyor.',
      description: 'Yeni nesil Tucson Hybrid, 1.6T GDi motoru ve 6DCT hibrit şanzımanıyla performanslı ve verimli bir deneyim sunuyor. Parametrik tasarımı, dijital kokpiti ve SmartSense güvenlik paketi standart.',
      specs: { 'Motor': '1.6T GDi + elektrik motoru', 'Toplam Güç': '230 HP', 'Şanzıman': '6DCT', 'Sürüş Sistemi': 'HTRAC (AWD)', 'Yakıt Tüketimi': '6.3 L/100km', '0-100 km/s': '8.0 sn', 'Bagaj': '558 L', 'ADAS': 'SmartSense standart', 'Garanti': '5 yıl / 100.000 km' },
      meta_title: 'Hyundai Tucson Hybrid 2025 Fiyat ve Özellikleri | Compario',
      meta_description: 'Hyundai Tucson Hybrid 2025 fiyatı 2.200.000 TL. 230 HP, AWD, panoramik tavan.',
    },

    {
      category_id: suvId, segment_id: hybridSuvSeg,
      name: 'Sportage Hybrid', slug: 'kia-sportage-hybrid-2025',
      brand: 'Kia', model: 'Sportage Hybrid', model_year: 2025,
      price_min: 2150000, price_max: 2680000, currency: 'TRY',
      image_url: 'https://www.kia.com/content/dam/kia2/eu/en/assets/vehicles/sportage/sportage-main-pc.jpg',
      status: 'active', is_featured: true, source: 'manual', published_at: now,
      short_description: 'Kia Sportage Hybrid, çarpıcı Opposites United tasarımı ve 230 HP hibrit sistemiyle segmentinin en dikkat çekeni.',
      description: '5. nesil Sportage Hybrid, Kia\'nın "Opposites United" tasarım diliyle iç ve dış tasarımda devrim yaptı. Panoramik çift ekranı, AWD hibrit sistemi ve zengin güvenlik teknolojisiyle segment liderlerine meydan okuyor.',
      specs: { 'Motor': '1.6T GDi + elektrik motoru', 'Toplam Güç': '230 HP', 'Şanzıman': '6DCT', 'Sürüş Sistemi': 'AWD', 'Yakıt Tüketimi': '6.3 L/100km', '0-100 km/s': '8.2 sn', 'Bagaj': '543 L', 'Ekran': 'Panoramik çift 12.3"', 'Garanti': '7 yıl / 150.000 km' },
      meta_title: 'Kia Sportage Hybrid 2025 Fiyat ve Özellikleri | Compario',
      meta_description: 'Kia Sportage Hybrid 2025 fiyatı 2.150.000 TL. 230 HP AWD hibrit, 7 yıl garanti.',
    },

    {
      category_id: suvId, segment_id: hybridSuvSeg,
      name: 'Tiguan 1.5 TSI', slug: 'volkswagen-tiguan-2025',
      brand: 'Volkswagen', model: 'Tiguan', model_year: 2025,
      price_min: 2450000, price_max: 3200000, currency: 'TRY',
      image_url: 'https://www.volkswagen.com.tr/content/dam/nemo/models/tiguan/tiguan/n2024/gallery/stage/tiguan-2024-front-gallery.jpg',
      status: 'active', is_featured: false, source: 'manual', published_at: now,
      short_description: 'Üçüncü nesil Volkswagen Tiguan, yenilenen 1.5 TSI eTSI mild hibrit motor ve Alman mühendisliğinin güvenilirliğiyle Türkiye\'nin favori SUV\'larından.',
      description: 'Yeni Tiguan (Mk3), MQB Evo platformu üzerine inşa edildi. IQ.Drive sürücü destek sistemleri, 15 inç infotainment ekranı ve karbon nötr üretim süreciyle hem teknoloji hem çevre bilinciyle öne çıkıyor.',
      specs: { 'Motor': '1.5 TSI eTSI (mild hybrid)', 'Güç': '150 HP', 'Tork': '250 Nm', 'Şanzıman': '7DSG', 'Yakıt Tüketimi': '6.0 L/100km', '0-100 km/s': '8.5 sn', 'Bagaj': '652 L', 'Ekran': '15 inç', 'Garanti': '2 yıl / sınırsız km' },
      meta_title: 'Volkswagen Tiguan 2025 Fiyat ve Özellikleri | Compario',
      meta_description: 'VW Tiguan 2025 Türkiye fiyatı 2.450.000 TL. 3. nesil, 15 inç ekran, mild hibrit.',
    },

    // ════════════════════════════════════════════════════
    //  Kompakt/Crossover SUV
    // ════════════════════════════════════════════════════

    {
      category_id: crossId, segment_id: crossSeg,
      name: 'Corolla Cross Hybrid', slug: 'toyota-corolla-cross-hybrid-2025',
      brand: 'Toyota', model: 'Corolla Cross Hybrid', model_year: 2025,
      price_min: 1950000, price_max: 2350000, currency: 'TRY',
      image_url: 'https://www.toyota.com.tr/content/dam/toyota/turkey/models/corolla-cross/carconfigurator/toyota-corolla-cross-hybrid-2024-white-front.jpg',
      status: 'active', is_featured: true, source: 'manual', published_at: now,
      short_description: 'Toyota Corolla Cross Hybrid, 196 HP toplam güç, Corolla güvenilirliği ve crossover karoserisiyle Türkiye\'nin yıldız yükselen modeli.',
      description: 'Corolla Cross Hybrid, Toyota\'nın THS II hibrit teknolojisini kompakt crossover gövdesine taşıyor. Düşük yakıt tüketimi, Toyota Safety Sense donanım paketi ve geniş iç hacmiyle hem şehir hem yol için ideal.',
      specs: { 'Motor': '2.0L DOHC + elektrik motoru', 'Toplam Güç': '196 HP', 'Şanzıman': 'e-CVT', 'Sürüş Sistemi': 'FWD', 'Yakıt Tüketimi': '5.0 L/100km', 'CO2': '114 g/km', 'Bagaj': '487 L', 'ADAS': 'Toyota Safety Sense 3.0', 'Garanti': '3 yıl / 100.000 km' },
      meta_title: 'Toyota Corolla Cross Hybrid 2025 Fiyat ve Özellikleri | Compario',
      meta_description: 'Toyota Corolla Cross Hybrid 2025 fiyatı 1.950.000 TL. 196 HP, 5 L/100km yakıt tüketimi.',
    },

    {
      category_id: crossId, segment_id: crossSeg,
      name: 'HR-V e:HEV', slug: 'honda-hrv-ehev-2025',
      brand: 'Honda', model: 'HR-V e:HEV', model_year: 2025,
      price_min: 1900000, price_max: 2250000, currency: 'TRY',
      image_url: 'https://www.honda.com.tr/content/dam/Honda-EU-DAMS/Cars/HR-V/2022/Honda-HR-V-eHEV-front.jpg',
      status: 'active', is_featured: false, source: 'manual', published_at: now,
      short_description: 'Honda HR-V e:HEV, iki elektromotorlu tam paralel hibrit sistemi ve minimalist iç mekanıyla sessiz ve verimli bir crossover deneyimi sunuyor.',
      description: 'HR-V e:HEV, Honda\'nın benzin motorunu yalnızca jeneratör olarak kullanan benzersiz seri-paralel hibrit sistemiyle şehirde neredeyse tamamen elektrikli sürüş imkânı sunuyor. Honda SENSING safety paketi standarttır.',
      specs: { 'Motor': '1.5L DOHC + 2 elektrik motoru', 'Toplam Güç': '131 HP', 'Şanzıman': 'eCVT', 'Sürüş': 'FWD', 'Yakıt Tüketimi': '5.0 L/100km', 'Bagaj': '304 L', 'ADAS': 'Honda SENSING standart', 'Garanti': '5 yıl / 100.000 km' },
      meta_title: 'Honda HR-V e:HEV 2025 Fiyat ve Özellikleri | Compario',
      meta_description: 'Honda HR-V e:HEV 2025 fiyatı 1.900.000 TL. Tam paralel hibrit, 5 L/100km.',
    },

    // ════════════════════════════════════════════════════
    //  Orta Sınıf Sedan
    // ════════════════════════════════════════════════════

    {
      category_id: sedanId, segment_id: ortaSedanSeg,
      name: 'Corolla Hybrid', slug: 'toyota-corolla-sedan-hybrid-2025',
      brand: 'Toyota', model: 'Corolla Hybrid', model_year: 2025,
      price_min: 1580000, price_max: 1950000, currency: 'TRY',
      image_url: 'https://www.toyota.com.tr/content/dam/toyota/turkey/models/corolla/carconfigurator/toyota-corolla-sedan-hybrid-2024-white-front.jpg',
      status: 'active', is_featured: true, source: 'manual', published_at: now,
      short_description: 'Toyota Corolla Hybrid, 140 HP hibrit sistemi, 4.3 lt/100km yakıt tüketimi ve kanıtlanmış Toyota güvenilirliğiyle Türkiye\'nin en çok satan sedanı.',
      description: 'Toyota Corolla Hybrid\'in THS II sistemi, şehir içinde büyük ölçüde elektrikli çalışarak yakıt masraflarını minimuma indiriyor. Toyota Safety Sense 3.0 ile geniş güvenlik paketi standarttır.',
      specs: { 'Motor': '1.8L DOHC + elektrik motoru', 'Toplam Güç': '140 HP', 'Şanzıman': 'e-CVT', 'Yakıt Tüketimi': '4.3 L/100km', 'CO2': '99 g/km', '0-100 km/s': '10.9 sn', 'Bagaj': '471 L', 'ADAS': 'Toyota Safety Sense 3.0', 'Garanti': '3 yıl / 100.000 km' },
      meta_title: 'Toyota Corolla Hybrid 2025 Fiyat ve Özellikleri | Compario',
      meta_description: 'Toyota Corolla Hybrid 2025 fiyatı 1.580.000 TL. 4.3 L/100km yakıt, 140 HP.',
    },

    {
      category_id: sedanId, segment_id: ortaSedanSeg,
      name: 'Elantra Hybrid', slug: 'hyundai-elantra-hybrid-2025',
      brand: 'Hyundai', model: 'Elantra Hybrid', model_year: 2025,
      price_min: 1550000, price_max: 1900000, currency: 'TRY',
      image_url: 'https://www.hyundai.com/content/dam/hyundai/eu/en/cars/elantra/overview/hyundai-elantra-hybrid-main-pc.jpg',
      status: 'active', is_featured: false, source: 'manual', published_at: now,
      short_description: 'Hyundai Elantra Hybrid, parametrik tasarımı ve 141 HP hibrit sistemiyle Corolla\'nın doğrudan rakibi. 4.8 lt/100km yakıt tüketimi.',
      description: 'Elantra Hybrid, keskin parametrik tasarımı ve sportif duruşuyla sınıfının en dikkat çekici sedanı. SmartSense güvenlik paketi ve 10.25 inç infotainment ekranıyla teknoloji açısından da ön sırada.',
      specs: { 'Motor': '1.6L GDi + elektrik motoru', 'Toplam Güç': '141 HP', 'Şanzıman': '6DCT', 'Yakıt Tüketimi': '4.8 L/100km', '0-100 km/s': '9.0 sn', 'Bagaj': '474 L', 'Ekran': '10.25 inç', 'ADAS': 'SmartSense', 'Garanti': '5 yıl / 100.000 km' },
      meta_title: 'Hyundai Elantra Hybrid 2025 Fiyat ve Özellikleri | Compario',
      meta_description: 'Hyundai Elantra Hybrid 2025 fiyatı 1.550.000 TL. 141 HP hibrit, 4.8 L/100km.',
    },

    {
      category_id: sedanId, segment_id: ortaSedanSeg,
      name: 'K4 Hybrid', slug: 'kia-k4-hybrid-2025',
      brand: 'Kia', model: 'K4 Hybrid', model_year: 2025,
      price_min: 1620000, price_max: 1980000, currency: 'TRY',
      image_url: 'https://www.kia.com/content/dam/kia2/eu/en/assets/vehicles/k4/k4-overview-main.jpg',
      status: 'active', is_featured: false, source: 'manual', published_at: now,
      short_description: 'Yeni Kia K4 Hybrid, Cerato\'nun halefi olarak Türkiye\'ye geliyor. Geniş iç mekan, 7 yıl garanti ve hibrit verimlilik bir arada.',
      description: 'Kia K4, Forte/Cerato modelinin yerini alan tamamen yeni bir platformla geldi. "Opposites United" tasarım dili, geniş iç mekan ve Kia\'nın 7 yıllık garanti avantajıyla segmentin en cazip alternatiflerinden biri.',
      specs: { 'Motor': '1.6L GDi + elektrik motoru', 'Toplam Güç': '141 HP', 'Şanzıman': '6DCT', 'Yakıt Tüketimi': '5.0 L/100km', 'Bagaj': '502 L', 'Ekran': 'Çift 12.3"', 'ADAS': 'DriveWise', 'Garanti': '7 yıl / 150.000 km' },
      meta_title: 'Kia K4 Hybrid 2025 Fiyat ve Özellikleri | Compario',
      meta_description: 'Kia K4 Hybrid 2025 Türkiye fiyatı 1.620.000 TL. 7 yıl garanti, çift 12.3" ekran.',
    },

    // ════════════════════════════════════════════════════
    //  Lüks Sedan
    // ════════════════════════════════════════════════════

    {
      category_id: sedanId, segment_id: luksSedanSeg,
      name: '3 Serisi 320i', slug: 'bmw-3-serisi-2025',
      brand: 'BMW', model: '3 Serisi', model_year: 2025,
      price_min: 3100000, price_max: 4500000, currency: 'TRY',
      image_url: 'https://www.bmw.com.tr/content/dam/bmw/marketTR/bmw_com_tr/models/3-series/sedan/phev/bmw-3-series-sedan-overview-ms-01.jpg',
      status: 'active', is_featured: true, source: 'manual', published_at: now,
      short_description: 'BMW 3 Serisi, sportif sürüş dinamikleri ve premium konforun dengesini en iyi kuran lüks sedan. LCI yenileme ile daha güçlü yazılım ve donanım.',
      description: 'BMW 3 Serisi (G20 LCI), BMW Operating System 8.5 ve yapay zeka destekli ses asistanıyla güncellendi. CurvedDisplay dijital gösterge paneli, arka tekerlekten çekiş dinamiği ve M Sport paket seçeneğiyle spor sedan segmentinin standardı.',
      specs: { 'Motor': '2.0L TwinPower Turbo (mild hybrid)', 'Güç': '184 HP', 'Tork': '300 Nm', 'Şanzıman': '8AT', 'Sürüş': 'RWD', '0-100 km/s': '7.1 sn', 'Bagaj': '480 L', 'Ekran': 'BMW Curved Display', 'Garanti': '2 yıl / sınırsız km' },
      meta_title: 'BMW 3 Serisi 2025 Fiyat ve Özellikleri | Compario',
      meta_description: 'BMW 3 Serisi 320i 2025 fiyatı 3.100.000 TL. 184 HP, RWD, Curved Display.',
    },

    {
      category_id: sedanId, segment_id: luksSedanSeg,
      name: 'C Serisi C200', slug: 'mercedes-c-serisi-2025',
      brand: 'Mercedes-Benz', model: 'C-Serisi', model_year: 2025,
      price_min: 3400000, price_max: 4800000, currency: 'TRY',
      image_url: 'https://www.mercedes-benz.com.tr/content/dam/mb-nafta/us/mycars/class/c-class/2024/overview/mercedes-benz-c-class-sedan-overview-page-hero.jpg',
      status: 'active', is_featured: false, source: 'manual', published_at: now,
      short_description: 'Mercedes-Benz C-Serisi, S-Sınıfı\'nın trickle-down teknolojileriyle kompakt lüks sedanın zirvesinde. MBUX 3. nesil dijital kokpit.',
      description: 'W206 Mercedes C-Serisi, büyük S-Sınıfı ile teknoloji paylaşımı sayesinde segmentin teknoloji lideri konumunda. 48V mild hibrit sistemi, sürücü odaklı merkezi ekran ve Burmester ses sistemi öne çıkan özellikler.',
      specs: { 'Motor': '1.5L Turbo + 48V mild hybrid', 'Güç': '204 HP', 'Tork': '300 Nm', 'Şanzıman': '9AT', 'Sürüş': 'RWD', '0-100 km/s': '7.3 sn', 'Bagaj': '455 L', 'Ekran': '11.9 inç dikey MBUX', 'Garanti': '2 yıl / sınırsız km' },
      meta_title: 'Mercedes C200 2025 Fiyat ve Özellikleri | Compario',
      meta_description: 'Mercedes C-Serisi C200 2025 fiyatı 3.400.000 TL. 204 HP mild hybrid, MBUX.',
    },

    // ════════════════════════════════════════════════════
    //  Kompakt Hatchback — Türkiye'nin en kalabalık segmenti
    // ════════════════════════════════════════════════════

    {
      category_id: hatchId, segment_id: komHatchSeg,
      name: 'Golf 2.0 TDI', slug: 'volkswagen-golf-2025',
      brand: 'Volkswagen', model: 'Golf', model_year: 2025,
      price_min: 1600000, price_max: 2200000, currency: 'TRY',
      image_url: 'https://www.volkswagen.com.tr/content/dam/nemo/models/golf/golf/n2020/gallery/stage/BUGSF_golf8_front.jpg',
      status: 'active', is_featured: true, source: 'manual', published_at: now,
      short_description: 'Volkswagen Golf 8.5, Alman mühendisliğinin 50 yılı aşkın geçmişiyle kompakt hatchback\'in ölçüt modeli. 150 HP TDI dizel veya TSI benzin seçeneği.',
      description: 'Golf 8.5 güncellemesiyle ChatGPT entegrasyonu, yenilenmiş dokunmatik klimave IQ.Drive sürücü destek sistemi getirdi. Dizel, benzin ve plug-in hibrit seçenekleriyle geniş bir alıcı kitlesine hitap ediyor.',
      specs: { 'Motor': '2.0 TDI', 'Güç': '150 HP', 'Tork': '360 Nm', 'Şanzıman': '7DSG', '0-100 km/s': '8.4 sn', 'Yakıt Tüketimi': '4.9 L/100km', 'Bagaj': '381 L', 'ADAS': 'IQ.Drive', 'Garanti': '2 yıl / sınırsız km' },
      meta_title: 'Volkswagen Golf 2025 Fiyat ve Özellikleri | Compario',
      meta_description: 'VW Golf 8.5 2025 fiyatı 1.600.000 TL. 150 HP TDI, ChatGPT entegrasyonu.',
    },

    {
      category_id: hatchId, segment_id: komHatchSeg,
      name: 'Clio E-Tech Hybrid', slug: 'renault-clio-etech-2025',
      brand: 'Renault', model: 'Clio E-Tech Hybrid', model_year: 2025,
      price_min: 1150000, price_max: 1550000, currency: 'TRY',
      image_url: 'https://www.renault.com.tr/content/dam/renault/turkey/findmycar/models/clio/Clio_Homepage_Desktop.jpg',
      status: 'active', is_featured: true, source: 'manual', published_at: now,
      short_description: 'Renault Clio E-Tech Hybrid, 145 HP full hybrid sistemi ve şehirde %80 elektrikli çalışma özelliğiyle küçük sınıfın yakıt şampiyonu. 4.4 lt/100km.',
      description: 'Clio E-Tech Hybrid, F1 teknolojisinden türetilen çok vitesli hibrit şanzımanıyla sınıfının en gelişmiş hibrit sistemini sunuyor. Debriyajsız tam otomatik aktarma organı ve Google tabanlı OpenR Link ile konfor zirvesinde.',
      specs: { 'Motor': '1.6L + elektrik motoru (full hybrid)', 'Toplam Güç': '145 HP', 'Şanzıman': 'Multi-mode (debriyajsız)', 'Yakıt Tüketimi': '4.4 L/100km', 'Şehir Elektrikliliği': '%80', 'Bagaj': '391 L', 'İnfotainment': 'Google OpenR Link', 'Garanti': '2 yıl / 100.000 km' },
      meta_title: 'Renault Clio E-Tech Hybrid 2025 Fiyat ve Özellikleri | Compario',
      meta_description: 'Renault Clio E-Tech Hybrid 2025 fiyatı 1.150.000 TL. 145 HP full hybrid, 4.4 L/100km.',
    },

    {
      category_id: hatchId, segment_id: komHatchSeg,
      name: 'i20 Hybrid', slug: 'hyundai-i20-hybrid-2025',
      brand: 'Hyundai', model: 'i20 Hybrid', model_year: 2025,
      price_min: 1050000, price_max: 1380000, currency: 'TRY',
      image_url: 'https://www.hyundai.com/content/dam/hyundai/eu/en/cars/i20/overview/i20-main-pc.jpg',
      status: 'active', is_featured: false, source: 'manual', published_at: now,
      short_description: 'Hyundai i20 Hybrid, B segmentinde mild hibrit teknolojiyle yakıt tasarrufu sağlayan şehir aracı. 100 HP, 5 yıl garanti.',
      description: 'i20 Hybrid, 48V mild hibrit teknolojisiyle şehir içi yakıt tüketimini optimize ediyor. SmartSense aktif güvenlik paketi, büyük 10.25 inç ekran ve spacious iç mekanıyla B segmentini yeniden tanımlıyor.',
      specs: { 'Motor': '1.0T GDi 48V mild hybrid', 'Güç': '100 HP', 'Şanzıman': '6iMT', 'Yakıt Tüketimi': '5.3 L/100km', 'Bagaj': '352 L', 'Ekran': '10.25 inç', 'ADAS': 'SmartSense', 'Garanti': '5 yıl / 100.000 km' },
      meta_title: 'Hyundai i20 Hybrid 2025 Fiyat ve Özellikleri | Compario',
      meta_description: 'Hyundai i20 Hybrid 2025 fiyatı 1.050.000 TL. 48V mild hybrid, 5 yıl garanti.',
    },

    {
      category_id: hatchId, segment_id: komHatchSeg,
      name: 'Yaris Hybrid', slug: 'toyota-yaris-hybrid-2025',
      brand: 'Toyota', model: 'Yaris Hybrid', model_year: 2025,
      price_min: 1250000, price_max: 1600000, currency: 'TRY',
      image_url: 'https://www.toyota.com.tr/content/dam/toyota/turkey/models/yaris/carconfigurator/toyota-yaris-hatchback-hybrid-2023-white-front.jpg',
      status: 'active', is_featured: false, source: 'manual', published_at: now,
      short_description: 'Toyota Yaris Hybrid, 130 HP full hybrid ve 3.8 lt/100km yakıt tüketimiyle B segmentinin yakıt şampiyonu ve dünya genelinde en çok satan hibrit hatchback.',
      description: 'GR Sport versiyonu dahil çeşitli donanımlarla sunulan Yaris Hybrid, Toyota\'nın 5. nesil THS II hibrit teknolojisini küçük gövdeyle buluşturuyor. Toyota Safety Sense 2.0 standart olarak sunuluyor.',
      specs: { 'Motor': '1.5L DOHC + elektrik motoru (full hybrid)', 'Toplam Güç': '130 HP', 'Şanzıman': 'e-CVT', 'Yakıt Tüketimi': '3.8 L/100km', 'CO2': '86 g/km', '0-100 km/s': '9.4 sn', 'Bagaj': '286 L', 'ADAS': 'Toyota Safety Sense 2.0', 'Garanti': '3 yıl / 100.000 km' },
      meta_title: 'Toyota Yaris Hybrid 2025 Fiyat ve Özellikleri | Compario',
      meta_description: 'Toyota Yaris Hybrid 2025 fiyatı 1.250.000 TL. 3.8 L/100km yakıt, 130 HP.',
    },

    // ════════════════════════════════════════════════════
    //  Elektrikli SUV
    // ════════════════════════════════════════════════════

    {
      category_id: suvId, segment_id: elektrikSuvSeg,
      name: 'Model Y', slug: 'tesla-model-y-2025',
      brand: 'Tesla', model: 'Model Y', model_year: 2025,
      price_min: 2650000, price_max: 3250000, currency: 'TRY',
      image_url: 'https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Mega-Menu-Vehicles-Model-Y.png',
      status: 'active', is_featured: true, source: 'manual', published_at: now,
      short_description: 'Tesla Model Y Juniper, dünyanın en çok satan elektrikli otomobili. Yenilenen iç mekan, 533 km menzil ve Autopilot standart.',
      description: 'Model Y Juniper, 2024\'te tanıtılan kapsamlı yenilemeyle daha premium bir iç mekan, ambient aydınlatma ve geliştirilmiş ses yalıtımı kazandı. 533 km\'ye ulaşan menzili ve 250 kW Supercharger desteğiyle uzun yol pratiği mükemmel.',
      specs: { 'Motor Tipi': 'Tam Elektrikli (BEV)', 'Güç': '299 HP (RWD)', 'Batarya': '75 kWh', 'Menzil (WLTP)': '533 km (RWD)', 'Hızlı Şarj': '250 kW DC (Supercharger)', '0-100 km/s': '5.9 sn (RWD)', 'Sürücü Destek': 'Autopilot standart', 'Bagaj': '854 L (arka + frunk)', 'Garanti': '4 yıl / 80.000 km' },
      meta_title: 'Tesla Model Y 2025 Fiyat ve Özellikleri | Compario',
      meta_description: 'Tesla Model Y Juniper 2025 Türkiye fiyatı 2.650.000 TL. 533 km menzil, Autopilot.',
    },

    {
      category_id: suvId, segment_id: elektrikSuvSeg,
      name: 'EV6 GT-Line', slug: 'kia-ev6-2025',
      brand: 'Kia', model: 'EV6', model_year: 2025,
      price_min: 2950000, price_max: 3600000, currency: 'TRY',
      image_url: 'https://www.kia.com/content/dam/kia2/eu/en/assets/vehicles/ev6/ev6-main-pc.jpg',
      status: 'active', is_featured: false, source: 'manual', published_at: now,
      short_description: 'Kia EV6, 800V ultra-hızlı şarj teknolojisi, 528 km menzil ve ödül kazanan tasarımıyla elektrikli crossover\'ın en etkileyici ismi.',
      description: 'EV6, Hyundai Grup\'un E-GMP platformunun ilk temsilcisi. 800V mimarisi sayesinde 350 kW hızlı şarj yapabiliyor — 18 dakikada %10\'dan %80\'e. Çift motor AWD versiyonunda 325 HP sunuluyor.',
      specs: { 'Motor Tipi': 'Tam Elektrikli (BEV)', 'Güç': '229 HP (RWD) / 325 HP (AWD)', 'Batarya': '77.4 kWh', 'Menzil (WLTP)': '528 km (RWD)', 'Hızlı Şarj': '350 kW DC (800V)', '0-100 km/s': '7.3 sn (RWD)', 'Bagaj': '490 L + 52 L frunk', 'Garanti': '7 yıl / 150.000 km' },
      meta_title: 'Kia EV6 2025 Fiyat ve Özellikleri | Compario',
      meta_description: 'Kia EV6 2025 fiyatı 2.950.000 TL. 800V hızlı şarj, 528 km menzil, 7 yıl garanti.',
    },
  ];

  let added = 0;
  let skipped = 0;

  for (const product of PRODUCTS) {
    const result = await insertProduct(product);
    if (result) added++;
    else skipped++;
  }

  console.log(`\n📊 Tamamlandı: ${added} yeni ürün eklendi, ${skipped} mevcut atlandı`);
  console.log('🎉 Türkiye 2025 araç seed\'i tamamlandı!');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
