/**
 * Seed script: 20 adet 2026 model gerçek araç
 * Çalıştır: node scripts/seed-initial-products.mjs
 *
 * Kategoriler + segmentler + ürünler idempotent şekilde eklenir.
 * Aynı slug varsa atlanır (upsert değil, skip).
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ─── Env ─────────────────────────────────────────────────────────────────────

const __dir = dirname(fileURLToPath(import.meta.url));
let env = {};
try {
  const raw = readFileSync(resolve(__dir, '../apps/web/.env.local'), 'utf8');
  raw.split('\n').forEach((line) => {
    const [k, ...v] = line.split('=');
    if (k && !k.startsWith('#') && v.length) env[k.trim()] = v.join('=').trim();
  });
} catch { /* env vars zaten set edilmiş olabilir */ }

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL || env['NEXT_PUBLIC_SUPABASE_URL'];
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY  || env['SUPABASE_SERVICE_KEY'];

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL veya SUPABASE_SERVICE_KEY eksik');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── Helper: idempotent insert ────────────────────────────────────────────────

async function upsertCategory(cat) {
  const { data: existing } = await supabase
    .from('categories').select('id').eq('slug', cat.slug).single();
  if (existing) return existing.id;
  const { data, error } = await supabase.from('categories').insert(cat).select('id').single();
  if (error) throw new Error(`Category insert failed (${cat.slug}): ${error.message}`);
  return data.id;
}

async function upsertSegment(seg) {
  const { data: existing } = await supabase
    .from('segments').select('id').eq('slug', seg.slug).eq('category_id', seg.category_id).single();
  if (existing) return existing.id;
  const { data, error } = await supabase.from('segments').insert(seg).select('id').single();
  if (error) throw new Error(`Segment insert failed (${seg.slug}): ${error.message}`);
  return data.id;
}

async function insertProduct(product) {
  const { data: existing } = await supabase
    .from('products').select('id').eq('slug', product.slug).single();
  if (existing) {
    console.log(`  ⏭  Atlandı (mevcut): ${product.slug}`);
    return null;
  }
  const { data, error } = await supabase.from('products').insert(product).select('id').single();
  if (error) throw new Error(`Product insert failed (${product.slug}): ${error.message}`);
  return data.id;
}

// ─── Data ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Seed başlıyor: 20 araç (SUV/Sedan/Hatchback)\n');

  // ── Kategoriler ──
  const suvCatId = await upsertCategory({
    name: 'SUV',
    slug: 'suv',
    icon: '🚙',
    description: 'Sport Utility Vehicle — yüksek taban araçlar',
    display_order: 1,
    is_active: true,
  });
  console.log('✅ Kategori: SUV');

  const sedanCatId = await upsertCategory({
    name: 'Sedan',
    slug: 'sedan',
    icon: '🚗',
    description: 'Üç hacimli yolcu otomobilleri',
    display_order: 2,
    is_active: true,
  });
  console.log('✅ Kategori: Sedan');

  const hatchCatId = await upsertCategory({
    name: 'Hatchback',
    slug: 'hatchback',
    icon: '🚘',
    description: 'İki/beş kapılı kompakt otomobiller',
    display_order: 3,
    is_active: true,
  });
  console.log('✅ Kategori: Hatchback\n');

  // ── Segmentler ──
  const suvElektrikSegId = await upsertSegment({
    category_id: suvCatId,
    name: 'Elektrikli SUV',
    slug: 'elektrikli-suv',
    description: 'Tam elektrikli SUV modelleri',
    price_min: 1500000,
    price_max: 4000000,
    display_order: 1,
    is_active: true,
  });
  console.log('✅ Segment: Elektrikli SUV');

  const sedanLuksSegId = await upsertSegment({
    category_id: sedanCatId,
    name: 'Lüks Sedan',
    slug: 'luks-sedan',
    description: 'Premium ve lüks sedan modelleri',
    price_min: 2500000,
    price_max: 6000000,
    display_order: 1,
    is_active: true,
  });
  console.log('✅ Segment: Lüks Sedan');

  const sedanOrtaSegId = await upsertSegment({
    category_id: sedanCatId,
    name: 'Orta Sınıf Sedan',
    slug: 'orta-sinif-sedan',
    description: 'Kompakt ve orta segment sedan',
    price_min: 1200000,
    price_max: 2800000,
    display_order: 2,
    is_active: true,
  });
  console.log('✅ Segment: Orta Sınıf Sedan');

  const hatchKompaktSegId = await upsertSegment({
    category_id: hatchCatId,
    name: 'Kompakt Hatchback',
    slug: 'kompakt-hatchback',
    description: 'B ve C segmenti hatchback modeller',
    price_min: 1000000,
    price_max: 3000000,
    display_order: 1,
    is_active: true,
  });
  console.log('✅ Segment: Kompakt Hatchback\n');

  // ── Ürünler ──────────────────────────────────────────────────────────────

  const now = new Date().toISOString();

  const PRODUCTS = [

    // ═══════════════════════════════
    //  SUV — 8 araç
    // ═══════════════════════════════

    {
      category_id: suvCatId,
      segment_id: suvElektrikSegId,
      name: 'EV2',
      slug: 'kia-ev2-2026',
      brand: 'Kia',
      model: 'EV2',
      model_year: 2026,
      price_min: 1890000,
      price_max: 2150000,
      currency: 'TRY',
      status: 'active',
      is_featured: true,
      source: 'manual',
      published_at: now,
      short_description: 'Kia\'nın en uygun fiyatlı elektrikli SUV\'u. 448 km WLTP menzil, 100 kW hızlı şarj ve 7 yıl batarya garantisi ile segment lideri.',
      description: 'Kia EV2, 61 kWh\'lik bataryası ile segmentinde en uzun menzili sunan elektrikli SUV\'dur. 145 HP güç, 10\'dan %80\'e 28 dakika hızlı şarj desteği ve sınıf üstü iç mekan kalitesi ile 2026 Türkiye pazarının en popüler elektrikli modeli konumunda.',
      specs: {
        'Motor Tipi': 'Tam Elektrikli (BEV)',
        'Güç': '145 HP',
        'Tork': '255 Nm',
        'Batarya': '61 kWh',
        'Menzil (WLTP)': '448 km',
        'Hızlı Şarj': '100 kW DC',
        '0-100 km/s': '8.5 sn',
        'Süspansiyon (Ön)': 'MacPherson',
        'Bagaj': '352 L',
        'Garanti': '7 yıl / 150.000 km',
      },
      meta_title: 'Kia EV2 2026 Fiyat ve Özellikleri | Compario',
      meta_description: 'Kia EV2 2026 Türkiye fiyatı, teknik özellikleri, menzil testi ve karşılaştırması. 1.890.000 TL başlangıç.',
    },

    {
      category_id: suvCatId,
      segment_id: suvElektrikSegId,
      name: 'Atto 3',
      slug: 'byd-atto-3-2026',
      brand: 'BYD',
      model: 'Atto 3',
      model_year: 2026,
      price_min: 2150000,
      price_max: 2450000,
      currency: 'TRY',
      status: 'active',
      is_featured: true,
      source: 'manual',
      published_at: now,
      short_description: 'BYD\'nin Blade batarya teknolojisine sahip güçlü elektrikli SUV\'u. 204 HP motor, 420 km menzil ve döner infotainment ekranı.',
      description: 'BYD Atto 3, Blade LFP batarya teknolojisi sayesinde güvenlik ve uzun ömür konusunda segmentin öncüsüdür. 204 HP\'lik güçlü motoru, 7.3 saniyelik 0-100 performansı ve 12.8 inç döner büyük ekranıyla teknoloji tutkunlarının tercihi.',
      specs: {
        'Motor Tipi': 'Tam Elektrikli (BEV)',
        'Güç': '204 HP',
        'Tork': '310 Nm',
        'Batarya': '60.5 kWh (Blade LFP)',
        'Menzil (WLTP)': '420 km',
        'Hızlı Şarj': '80 kW DC',
        '0-100 km/s': '7.3 sn',
        'Bagaj': '440 L',
        'Ekran': '12.8 inç döner',
        'Garanti': '6 yıl / 150.000 km',
      },
      meta_title: 'BYD Atto 3 2026 Fiyat ve Özellikleri | Compario',
      meta_description: 'BYD Atto 3 2026 Türkiye fiyatı 2.150.000 TL. Blade batarya, 420 km menzil, teknik özellikler.',
    },

    {
      category_id: suvCatId,
      segment_id: suvElektrikSegId,
      name: 'Model Y',
      slug: 'tesla-model-y-2026',
      brand: 'Tesla',
      model: 'Model Y',
      model_year: 2026,
      price_min: 2650000,
      price_max: 3250000,
      currency: 'TRY',
      status: 'active',
      is_featured: true,
      source: 'manual',
      published_at: now,
      short_description: 'Dünyanın en çok satan elektrikli otomobili. Juniper güncellemesiyle yenilenen iç mekan, gelişmiş Autopilot ve 533 km menzil.',
      description: 'Tesla Model Y Juniper 2026, yenilenen ön tasarımı, ambient aydınlatmalı iç mekanı ve geliştirilmiş ses yalıtımıyla segmentin referans noktası olmayı sürdürüyor. 533 km\'ye ulaşan menzili ve sürekli güncellenen yazılımıyla öne çıkıyor.',
      specs: {
        'Motor Tipi': 'Tam Elektrikli (BEV)',
        'Güç': '299 HP (RWD)',
        'Batarya': '75 kWh',
        'Menzil (WLTP)': '533 km (RWD)',
        'Hızlı Şarj': '250 kW DC (Supercharger)',
        '0-100 km/s': '5.9 sn (RWD)',
        'Sürücü Destek': 'Autopilot (standart)',
        'Bagaj': '854 L (arka + frunk)',
        'OTA Güncelleme': 'Evet',
        'Garanti': '4 yıl / 80.000 km',
      },
      meta_title: 'Tesla Model Y 2026 Fiyat ve Özellikleri | Compario',
      meta_description: 'Tesla Model Y 2026 Juniper Türkiye fiyatı ve özellikleri. RWD 2.650.000 TL.',
    },

    {
      category_id: suvCatId,
      segment_id: suvElektrikSegId,
      name: 'XC40 Recharge',
      slug: 'volvo-xc40-recharge-2026',
      brand: 'Volvo',
      model: 'XC40 Recharge',
      model_year: 2026,
      price_min: 3200000,
      price_max: 3800000,
      currency: 'TRY',
      status: 'active',
      is_featured: false,
      source: 'manual',
      published_at: now,
      short_description: 'Volvo\'nun güvenlik odaklı elektrikli SUV\'u. 418 km menzil, Google tabanlı infotainment ve 5 yıldız EURO NCAP güvenlik puanı.',
      description: 'Volvo XC40 Recharge, İskandinav tasarım anlayışı ve prim malzeme kalitesiyle dikkat çekiyor. Google Haritalar entegrasyonu, Harman Kardon ses sistemi ve Volvo\'nun imzası olan güvenlik donanımları standart olarak sunuluyor.',
      specs: {
        'Motor Tipi': 'Tam Elektrikli (BEV)',
        'Güç': '231 HP (Tek Motor)',
        'Tork': '330 Nm',
        'Batarya': '69 kWh',
        'Menzil (WLTP)': '418 km',
        'Hızlı Şarj': '130 kW DC',
        '0-100 km/s': '7.4 sn',
        'Ses Sistemi': 'Harman Kardon',
        'NCAP': '5 Yıldız',
        'Garanti': '4 yıl / 100.000 km',
      },
      meta_title: 'Volvo XC40 Recharge 2026 Fiyat ve Özellikleri | Compario',
      meta_description: 'Volvo XC40 Recharge 2026 fiyatı 3.200.000 TL. 418 km menzil, 5 yıldız güvenlik.',
    },

    {
      category_id: suvCatId,
      segment_id: suvElektrikSegId,
      name: 'ID.4',
      slug: 'volkswagen-id4-2026',
      brand: 'Volkswagen',
      model: 'ID.4',
      model_year: 2026,
      price_min: 2850000,
      price_max: 3400000,
      currency: 'TRY',
      status: 'active',
      is_featured: false,
      source: 'manual',
      published_at: now,
      short_description: 'Volkswagen\'in MEB platformu üzerine inşa edilmiş elektrikli SUV\'u. 521 km menzil, geniş iç mekan ve pratik Alman mühendisliği.',
      description: 'VW ID.4, Avrupa\'nın en çok satan elektrikli SUV modelleri arasında yer alıyor. 77 kWh\'lik büyük batarya paketi ile 521 km\'ye ulaşan menzili, merkezi ekranlı sade iç tasarımı ve Alman güvenilirliğiyle öne çıkıyor.',
      specs: {
        'Motor Tipi': 'Tam Elektrikli (BEV)',
        'Güç': '204 HP (Tek Motor)',
        'Tork': '310 Nm',
        'Batarya': '77 kWh',
        'Menzil (WLTP)': '521 km',
        'Hızlı Şarj': '135 kW DC',
        '0-100 km/s': '8.5 sn',
        'Bagaj': '543 L',
        'Isıtma': 'Isı Pompası (standart)',
        'Garanti': '5 yıl / 100.000 km',
      },
      meta_title: 'Volkswagen ID.4 2026 Fiyat ve Özellikleri | Compario',
      meta_description: 'VW ID.4 2026 Türkiye fiyatı 2.850.000 TL. 521 km menzil, teknik özellikler.',
    },

    {
      category_id: suvCatId,
      segment_id: suvElektrikSegId,
      name: 'Kona Electric',
      slug: 'hyundai-kona-electric-2026',
      brand: 'Hyundai',
      model: 'Kona Electric',
      model_year: 2026,
      price_min: 2100000,
      price_max: 2450000,
      currency: 'TRY',
      status: 'active',
      is_featured: false,
      source: 'manual',
      published_at: now,
      short_description: 'Hyundai Kona Electric, 514 km WLTP menziliyle kompakt elektrikli SUV segmentinin menzil şampiyonu. Yenilenen tasarım ve zengin donanım.',
      description: 'Yeni Kona Electric\'in 65.4 kWh\'lik büyük batarya seçeneği 514 km\'ye ulaşan menzil sunuyor. Yükseltilmiş iç mekan kalitesi, gelişmiş ADAS sistemleri ve rekabetçi fiyatıyla segmentin güçlü alternatifi.',
      specs: {
        'Motor Tipi': 'Tam Elektrikli (BEV)',
        'Güç': '218 HP',
        'Tork': '255 Nm',
        'Batarya': '65.4 kWh',
        'Menzil (WLTP)': '514 km',
        'Hızlı Şarj': '100 kW DC',
        '0-100 km/s': '7.8 sn',
        'Bagaj': '466 L',
        'ADAS': 'Hyundai SmartSense',
        'Garanti': '5 yıl / 100.000 km',
      },
      meta_title: 'Hyundai Kona Electric 2026 Fiyat ve Özellikleri | Compario',
      meta_description: 'Hyundai Kona Electric 2026 fiyatı 2.100.000 TL. 514 km menzil, teknik özellikler.',
    },

    {
      category_id: suvCatId,
      segment_id: suvElektrikSegId,
      name: 'MG4',
      slug: 'mg-mg4-2026',
      brand: 'MG',
      model: 'MG4',
      model_year: 2026,
      price_min: 1750000,
      price_max: 2100000,
      currency: 'TRY',
      status: 'active',
      is_featured: false,
      source: 'manual',
      published_at: now,
      short_description: 'MG4, 64 kWh batarya ve 435 km menziliyle fiyat/menzil dengesinde segmentin en çekici seçeneklerinden biri. 150 kW hızlı şarj desteği.',
      description: 'MG4 Türkiye\'nin en uygun fiyatlı uzun menzilli elektrikli SUV\'larından biri. MSP (Modüler Scalable Platform) üzerine inşa edilen model, 150 kW\'a kadar hızlı şarj desteği ve alçak ağırlık merkeziyle sürüş dinamiği açısından da etkileyici.',
      specs: {
        'Motor Tipi': 'Tam Elektrikli (BEV)',
        'Güç': '204 HP',
        'Tork': '250 Nm',
        'Batarya': '64 kWh',
        'Menzil (WLTP)': '435 km',
        'Hızlı Şarj': '150 kW DC',
        '0-100 km/s': '7.9 sn',
        'Bagaj': '363 L',
        'Platform': 'MSP',
        'Garanti': '7 yıl / 150.000 km',
      },
      meta_title: 'MG4 2026 Fiyat ve Özellikleri | Compario',
      meta_description: 'MG4 2026 Türkiye fiyatı 1.750.000 TL. 435 km menzil, 150 kW hızlı şarj.',
    },

    {
      category_id: suvCatId,
      segment_id: suvElektrikSegId,
      name: 'e-2008',
      slug: 'peugeot-e-2008-2026',
      brand: 'Peugeot',
      model: 'e-2008',
      model_year: 2026,
      price_min: 2050000,
      price_max: 2380000,
      currency: 'TRY',
      status: 'active',
      is_featured: false,
      source: 'manual',
      published_at: now,
      short_description: 'Peugeot e-2008, şık Fransız tasarımı ve 406 km WLTP menziliyle kompakt elektrikli SUV segmentinin estetik tercihi.',
      description: 'Peugeot e-2008 yenilenmiş pil paketiyle 406 km menzil sunuyor. i-Cockpit dijital gösterge paneli, sezgisel dokunmatik ekran ve PEUGEOT NIGHT VISION opsiyonuyla teknoloji ve stilin buluştuğu nokta.',
      specs: {
        'Motor Tipi': 'Tam Elektrikli (BEV)',
        'Güç': '156 HP',
        'Tork': '260 Nm',
        'Batarya': '54 kWh',
        'Menzil (WLTP)': '406 km',
        'Hızlı Şarj': '100 kW DC',
        '0-100 km/s': '8.9 sn',
        'Bagaj': '405 L',
        'Kokpit': 'i-Cockpit dijital',
        'Garanti': '3 yıl / 100.000 km',
      },
      meta_title: 'Peugeot e-2008 2026 Fiyat ve Özellikleri | Compario',
      meta_description: 'Peugeot e-2008 2026 fiyatı 2.050.000 TL. 406 km menzil, i-Cockpit.',
    },

    // ═══════════════════════════════
    //  Sedan — 6 araç
    // ═══════════════════════════════

    {
      category_id: sedanCatId,
      segment_id: sedanLuksSegId,
      name: '3 Serisi 320i',
      slug: 'bmw-3-serisi-320i-2026',
      brand: 'BMW',
      model: '3 Serisi',
      model_year: 2026,
      price_min: 3100000,
      price_max: 4200000,
      currency: 'TRY',
      status: 'active',
      is_featured: true,
      source: 'manual',
      published_at: now,
      short_description: 'BMW 3 Serisi, sportif sürüş dinamikleri ve premium donanımıyla lüks sedan segmentinin standart belirleyicisi. LCI güncellemesiyle yenilendi.',
      description: 'BMW 3 Serisi (G20 LCI) 2026, milHybrid mild hibrit sistemi ile yakıt verimliliğini artırırken sportif ruhunu koruyor. 184 HP\'lik 2.0L motor, arka tekerlekten çekiş ve xDrive 4x4 seçeneği sunuluyor.',
      specs: {
        'Motor': '2.0L Turbo Benzin (mild hybrid)',
        'Güç': '184 HP',
        'Tork': '300 Nm',
        'Şanzıman': '8 ileri Steptronic otomatik',
        'Çekiş': 'Arka (RWD)',
        '0-100 km/s': '7.1 sn',
        'Yakıt Tüketimi': '6.2 L/100 km',
        'Bagaj': '480 L',
        'Ekran': '12.3 + 14.9 inç çift ekran',
        'Garanti': '2 yıl / sınırsız km',
      },
      meta_title: 'BMW 3 Serisi 320i 2026 Fiyat ve Özellikleri | Compario',
      meta_description: 'BMW 3 Serisi 320i 2026 Türkiye fiyatı 3.100.000 TL. Sportif sedan, teknik özellikler.',
    },

    {
      category_id: sedanCatId,
      segment_id: sedanLuksSegId,
      name: 'C 200',
      slug: 'mercedes-c200-2026',
      brand: 'Mercedes-Benz',
      model: 'C 200',
      model_year: 2026,
      price_min: 3450000,
      price_max: 4650000,
      currency: 'TRY',
      status: 'active',
      is_featured: true,
      source: 'manual',
      published_at: now,
      short_description: 'Mercedes-Benz C 200, 48V mild hibrit sistemi, dikey büyük OLED ekranı ve S-Serisi\'nden inen teknolojilerle lüks sedan deneyimini yeniden tanımlıyor.',
      description: 'Yeni nesil Mercedes-Benz C 200 (W206), EQ Boost mild hibrit teknolojisi ile konfor ve verimlilik sunuyor. Dikey 11.9 inç OLED multimedya ekranı, MBUX Voice Assistance ve ön hava yastıklarıyla sınıfının en güvenli modeli.',
      specs: {
        'Motor': '1.5L Turbo Benzin + 48V mild hybrid',
        'Güç': '204 HP',
        'Tork': '300 Nm + 15 Nm (e-motor)',
        'Şanzıman': '9G-TRONIC otomatik',
        'Çekiş': 'Arka (RWD)',
        '0-100 km/s': '7.3 sn',
        'Yakıt Tüketimi': '6.4 L/100 km',
        'Ekran': '11.9 inç OLED dikey',
        'Bagaj': '455 L',
        'Garanti': '2 yıl / sınırsız km',
      },
      meta_title: 'Mercedes-Benz C 200 2026 Fiyat ve Özellikleri | Compario',
      meta_description: 'Mercedes C 200 2026 fiyatı 3.450.000 TL. OLED ekran, mild hybrid, teknik özellikler.',
    },

    {
      category_id: sedanCatId,
      segment_id: sedanLuksSegId,
      name: 'A4 35 TFSI',
      slug: 'audi-a4-35tfsi-2026',
      brand: 'Audi',
      model: 'A4',
      model_year: 2026,
      price_min: 3600000,
      price_max: 4800000,
      currency: 'TRY',
      status: 'active',
      is_featured: false,
      source: 'manual',
      published_at: now,
      short_description: 'Audi A4, quattro 4x4 seçeneği, yenilenen dijital arayüzü ve üstün iç mekan kalitesiyle premium sedan segmentinin ciddi rakibi.',
      description: 'Audi A4 35 TFSI 150 HP\'lik 1.5L TSI motoru ile kullanışlı yakıt tüketimi sunuyor. Virtual Cockpit Plus, MMI touch ekranı ve Audi\'nin köklü quattro 4x4 sistemi opsiyonel olarak mevcut.',
      specs: {
        'Motor': '1.5L TSI Turbo Benzin',
        'Güç': '150 HP',
        'Tork': '250 Nm',
        'Şanzıman': '7 ileri S tronic',
        'Çekiş': 'Ön (FWD)',
        '0-100 km/s': '8.9 sn',
        'Yakıt Tüketimi': '5.9 L/100 km',
        'Ekran': '10.1 inç MMI touch',
        'Bagaj': '530 L',
        'Garanti': '2 yıl / sınırsız km',
      },
      meta_title: 'Audi A4 35 TFSI 2026 Fiyat ve Özellikleri | Compario',
      meta_description: 'Audi A4 35 TFSI 2026 fiyatı 3.600.000 TL. Virtual Cockpit, teknik özellikler.',
    },

    {
      category_id: sedanCatId,
      segment_id: sedanOrtaSegId,
      name: 'Model 3',
      slug: 'tesla-model-3-2026',
      brand: 'Tesla',
      model: 'Model 3',
      model_year: 2026,
      price_min: 2200000,
      price_max: 2800000,
      currency: 'TRY',
      status: 'active',
      is_featured: true,
      source: 'manual',
      published_at: now,
      short_description: 'Tesla Model 3 Highland, minimalist yenilenen iç mekanı, 629 km Long Range menzili ve 250 kW Supercharger desteğiyle premium elektrikli sedan.',
      description: 'Tesla Model 3 Highland 2026 güncellemesi, ambient aydınlatma, ön koltuk masajı (Long Range) ve arka koltuk ekranıyla lüks sedan segmentine meydan okuyor. 629 km menzil ve Supercharger ağı avantajı.',
      specs: {
        'Motor Tipi': 'Tam Elektrikli (BEV)',
        'Güç': '283 HP (RWD)',
        'Batarya': '60 kWh',
        'Menzil (WLTP)': '629 km (Long Range AWD)',
        'Hızlı Şarj': '250 kW DC (Supercharger)',
        '0-100 km/s': '6.1 sn (RWD)',
        'Ekran': '15.4 inç yatay',
        'Bagaj': '594 L (arka + frunk)',
        'OTA Güncelleme': 'Evet',
        'Garanti': '4 yıl / 80.000 km',
      },
      meta_title: 'Tesla Model 3 2026 Fiyat ve Özellikleri | Compario',
      meta_description: 'Tesla Model 3 Highland 2026 fiyatı 2.200.000 TL. 629 km menzil, Highland güncelleme.',
    },

    {
      category_id: sedanCatId,
      segment_id: sedanOrtaSegId,
      name: 'Civic e:HEV',
      slug: 'honda-civic-ehev-2026',
      brand: 'Honda',
      model: 'Civic',
      model_year: 2026,
      price_min: 1850000,
      price_max: 2100000,
      currency: 'TRY',
      status: 'active',
      is_featured: false,
      source: 'manual',
      published_at: now,
      short_description: 'Honda Civic e:HEV, şarj gerektirmeyen full hybrid sistemi ile şehir içinde litrede 4 km\'nin altına inen yakıt tüketimi ve sportif tasarımı bir arada sunuyor.',
      description: 'Honda Civic e:HEV tam hibrit sistemi (şarjsız), şehir içi sürüşlerde benzin motorunu büyük ölçüde devre dışı bırakarak elektrikle ilerleme imkanı sunuyor. 5 yıl / 200.000 km garanti paketi ve Honda Sensing güvenlik sistemi standart.',
      specs: {
        'Motor Tipi': 'Full Hybrid (HEV)',
        'Toplam Güç': '184 HP sistemi',
        'Benzin Motor': '2.0L Atkinson',
        'Yakıt Tüketimi': '4.7 L/100 km (şehir)',
        'Şarj': 'Gereksiz',
        '0-100 km/s': '8.0 sn',
        'Şanzıman': 'e-CVT',
        'Çekiş': 'Ön (FWD)',
        'Bagaj': '519 L',
        'Garanti': '5 yıl / 200.000 km',
      },
      meta_title: 'Honda Civic e:HEV 2026 Fiyat ve Özellikleri | Compario',
      meta_description: 'Honda Civic e:HEV 2026 fiyatı 1.850.000 TL. Şarjsız full hybrid, 4.7 L/100km.',
    },

    {
      category_id: sedanCatId,
      segment_id: sedanOrtaSegId,
      name: 'Corolla Hybrid',
      slug: 'toyota-corolla-hybrid-2026',
      brand: 'Toyota',
      model: 'Corolla',
      model_year: 2026,
      price_min: 1680000,
      price_max: 1950000,
      currency: 'TRY',
      status: 'active',
      is_featured: false,
      source: 'manual',
      published_at: now,
      short_description: 'Toyota Corolla Hybrid, dünyanın en güvenilir hibrit teknolojisi ve geniş servis ağıyla pratik günlük araç arayanların ideal tercihi.',
      description: 'Toyota Corolla Hybrid 5. nesil Toyota Hybrid System ile 140 HP toplam güç üretiyor. Geniş Toyota servis ağı, tanıtılmış güvenilirliği ve düşük yakıt giderleriyle Türkiye\'nin en çok satan hibrit sedanı konumunda.',
      specs: {
        'Motor Tipi': 'Full Hybrid (HEV)',
        'Toplam Güç': '140 HP (5. nesil THS)',
        'Benzin Motor': '1.8L Atkinson',
        'Yakıt Tüketimi': '4.5 L/100 km',
        'Şarj': 'Gereksiz',
        '0-100 km/s': '9.2 sn',
        'Şanzıman': 'e-CVT',
        'Çekiş': 'Ön (FWD)',
        'Bagaj': '471 L',
        'Garanti': '3 yıl / 100.000 km',
      },
      meta_title: 'Toyota Corolla Hybrid 2026 Fiyat ve Özellikleri | Compario',
      meta_description: 'Toyota Corolla Hybrid 2026 fiyatı 1.680.000 TL. 4.5 L/100km, güvenilir hibrit.',
    },

    // ═══════════════════════════════
    //  Hatchback — 6 araç
    // ═══════════════════════════════

    {
      category_id: hatchCatId,
      segment_id: hatchKompaktSegId,
      name: 'Golf 1.5 eTSI',
      slug: 'volkswagen-golf-etsi-2026',
      brand: 'Volkswagen',
      model: 'Golf',
      model_year: 2026,
      price_min: 1950000,
      price_max: 2350000,
      currency: 'TRY',
      status: 'active',
      is_featured: true,
      source: 'manual',
      published_at: now,
      short_description: 'VW Golf 1.5 eTSI, 48V mild hybrid sistemi, 150 HP güç ve pratik Avrupa\'nın en ikonik hatchback deneyimini sunuyor. IQ.DRIVE paket standart.',
      description: 'Volkswagen Golf 8.5 güncellemesiyle daha net dokunmatik buton düzeni ve geliştirilmiş IQ.LIGHT LED matrix farlarını kazandı. 150 HP\'lik eTSI mild hibrit motoru hem verimli hem de keyifli sürüş sunuyor.',
      specs: {
        'Motor': '1.5L TSI Evo2 + 48V mild hybrid',
        'Güç': '150 HP',
        'Tork': '250 Nm',
        'Şanzıman': '7 ileri DSG',
        'Çekiş': 'Ön (FWD)',
        '0-100 km/s': '8.4 sn',
        'Yakıt Tüketimi': '5.6 L/100 km',
        'Bagaj': '380 L',
        'Ekran': '10 inç dokunmatik',
        'Garanti': '3 yıl / 100.000 km',
      },
      meta_title: 'Volkswagen Golf 1.5 eTSI 2026 Fiyat ve Özellikleri | Compario',
      meta_description: 'VW Golf 1.5 eTSI 2026 fiyatı 1.950.000 TL. 150 HP mild hybrid, teknik özellikler.',
    },

    {
      category_id: hatchCatId,
      segment_id: hatchKompaktSegId,
      name: 'Mégane E-Tech Electric',
      slug: 'renault-megane-etech-electric-2026',
      brand: 'Renault',
      model: 'Mégane E-Tech Electric',
      model_year: 2026,
      price_min: 1980000,
      price_max: 2280000,
      currency: 'TRY',
      status: 'active',
      is_featured: true,
      source: 'manual',
      published_at: now,
      short_description: 'Renault Mégane E-Tech, CMF-EV platformu üzerine inşa edilen şık elektrikli hatchback. 450 km menzil, 130 kW hızlı şarj ve büyük dikey ekran.',
      description: 'Mégane E-Tech Electric tamamen elektrikli mimarisiyle geliştirildi. OpenR Link Google tabanlı multimedya sistemi, ısı pompası ve 450 km\'ye ulaşan menziliyle Fransız şıklığını elektronik geleceğe taşıyor.',
      specs: {
        'Motor Tipi': 'Tam Elektrikli (BEV)',
        'Güç': '220 HP',
        'Tork': '300 Nm',
        'Batarya': '60 kWh',
        'Menzil (WLTP)': '450 km',
        'Hızlı Şarj': '130 kW DC',
        '0-100 km/s': '7.4 sn',
        'Ekran': '9 + 12 inç dikey OpenR Link',
        'Isı Pompası': 'Standart',
        'Garanti': '5 yıl / 100.000 km',
      },
      meta_title: 'Renault Mégane E-Tech Electric 2026 Fiyat ve Özellikleri | Compario',
      meta_description: 'Renault Mégane E-Tech 2026 fiyatı 1.980.000 TL. 450 km menzil, 130 kW hızlı şarj.',
    },

    {
      category_id: hatchCatId,
      segment_id: hatchKompaktSegId,
      name: 'Astra 1.2 Turbo',
      slug: 'opel-astra-2026',
      brand: 'Opel',
      model: 'Astra',
      model_year: 2026,
      price_min: 1580000,
      price_max: 1850000,
      currency: 'TRY',
      status: 'active',
      is_featured: false,
      source: 'manual',
      published_at: now,
      short_description: 'Opel Astra, Alman mühendisliğinin pratikliği ve uygun fiyatıyla kompakt hatchback segmentinin güvenilir tercihi. AGR sertifikalı ergonomik koltuklar.',
      description: 'Opel Astra 2026, 110 HP 1.2L turbo benzin motoru ve Intelli-Lux LED piksel farlarıyla dikkat çekiyor. AGR sertifikalı koltuklar, Pure Panel dijital gösterge paneli ve Opel Eye kamera sistemi standart özellikler.',
      specs: {
        'Motor': '1.2L Turbo Benzin',
        'Güç': '110 HP',
        'Tork': '205 Nm',
        'Şanzıman': '6 ileri manuel / otomatik',
        'Çekiş': 'Ön (FWD)',
        '0-100 km/s': '10.7 sn',
        'Yakıt Tüketimi': '5.2 L/100 km',
        'Bagaj': '422 L',
        'Koltuklar': 'AGR sertifikalı',
        'Garanti': '3 yıl / 100.000 km',
      },
      meta_title: 'Opel Astra 1.2 Turbo 2026 Fiyat ve Özellikleri | Compario',
      meta_description: 'Opel Astra 2026 fiyatı 1.580.000 TL. AGR koltuklar, Intelli-Lux LED.',
    },

    {
      category_id: hatchCatId,
      segment_id: hatchKompaktSegId,
      name: '308 1.2 PureTech',
      slug: 'peugeot-308-2026',
      brand: 'Peugeot',
      model: '308',
      model_year: 2026,
      price_min: 1620000,
      price_max: 1950000,
      currency: 'TRY',
      status: 'active',
      is_featured: false,
      source: 'manual',
      published_at: now,
      short_description: 'Peugeot 308, i-Cockpit tasarımı, Hybrid 225 opsiyonu ve Fransız tarzı şıklığıyla kompakt sınıfın estetik öncüsü.',
      description: 'Peugeot 308 üçüncü nesli i-Cockpit\'in küçük direksiyon simidi ve 3D kümesi ile eşsiz sürüş deneyimi sunuyor. 1.2L PureTech 130 HP motor günlük kullanım için ideal, Plug-in Hybrid seçeneği de mevcut.',
      specs: {
        'Motor': '1.2L PureTech Turbo Benzin',
        'Güç': '130 HP',
        'Tork': '230 Nm',
        'Şanzıman': '8 ileri EAT8 otomatik',
        'Çekiş': 'Ön (FWD)',
        '0-100 km/s': '9.5 sn',
        'Yakıt Tüketimi': '5.4 L/100 km',
        'Bagaj': '412 L',
        'Gösterge': 'i-Cockpit 3D',
        'Garanti': '3 yıl / 100.000 km',
      },
      meta_title: 'Peugeot 308 1.2 PureTech 2026 Fiyat ve Özellikleri | Compario',
      meta_description: 'Peugeot 308 2026 fiyatı 1.620.000 TL. i-Cockpit 3D, 130 HP.',
    },

    {
      category_id: hatchCatId,
      segment_id: hatchKompaktSegId,
      name: '500e',
      slug: 'fiat-500e-2026',
      brand: 'Fiat',
      model: '500e',
      model_year: 2026,
      price_min: 1450000,
      price_max: 1780000,
      currency: 'TRY',
      status: 'active',
      is_featured: false,
      source: 'manual',
      published_at: now,
      short_description: 'Fiat 500e, ikonik retro tasarımıyla şehrin elektrikli yıldızı. 320 km menzil, açılır tavan La Prima versiyonu ve 85 kW hızlı şarj desteği.',
      description: 'Tamamen elektrikli Fiat 500e, efsanevi 500\'ün DNA\'sını 21. yüzyıla taşıyor. 42 kWh batarya, 118 HP motor ve şehir içi ağırlıklı kullanım için optimize edilmiş platform. La Prima versiyonunda açılır tavan (cabriolet) seçeneği mevcut.',
      specs: {
        'Motor Tipi': 'Tam Elektrikli (BEV)',
        'Güç': '118 HP',
        'Tork': '220 Nm',
        'Batarya': '42 kWh',
        'Menzil (WLTP)': '320 km',
        'Hızlı Şarj': '85 kW DC',
        '0-100 km/s': '9.0 sn',
        'Uzunluk': '3.631 mm (mikro şehir)',
        'Açılır Tavan': 'La Prima versiyonunda',
        'Garanti': '3 yıl / 100.000 km',
      },
      meta_title: 'Fiat 500e 2026 Fiyat ve Özellikleri | Compario',
      meta_description: 'Fiat 500e 2026 fiyatı 1.450.000 TL. 320 km menzil, açılır tavan seçeneği.',
    },

    {
      category_id: hatchCatId,
      segment_id: hatchKompaktSegId,
      name: 'Cooper Electric',
      slug: 'mini-cooper-electric-2026',
      brand: 'Mini',
      model: 'Cooper Electric',
      model_year: 2026,
      price_min: 2100000,
      price_max: 2500000,
      currency: 'TRY',
      status: 'active',
      is_featured: false,
      source: 'manual',
      published_at: now,
      short_description: 'Yeni Mini Cooper Electric E/SE, BMW Group altyapısıyla yeniden tasarlandı. 215 km (E) veya 305 km (SE) menzil, yuvarlak OLED gösterge ve premium premium his.',
      description: 'Mini Cooper Electric 2026 yeni nesil platformuyla daha geniş iç mekan sunuyor. Dairesel OLED gösterge paneli, deneyim modları (Core/Green/Go-kart) ve BMW\'nin güvenilir elektrik teknolojisi. SE versiyonu 218 HP ve 305 km menzil.',
      specs: {
        'Motor Tipi': 'Tam Elektrikli (BEV)',
        'Güç': '218 HP (SE)',
        'Tork': '330 Nm',
        'Batarya': '54.2 kWh (SE)',
        'Menzil (WLTP)': '305 km (SE)',
        'Hızlı Şarj': '95 kW DC',
        '0-100 km/s': '6.7 sn (SE)',
        'Ekran': 'Dairesel OLED 24 cm',
        'Sürüş Modu': 'Core / Green / Go-kart',
        'Garanti': '3 yıl / 100.000 km',
      },
      meta_title: 'Mini Cooper Electric SE 2026 Fiyat ve Özellikleri | Compario',
      meta_description: 'Mini Cooper Electric 2026 fiyatı 2.100.000 TL. 305 km menzil, OLED ekran.',
    },
  ];

  // ── Insert loop ──────────────────────────────────────────────────────────────

  let inserted = 0;
  let skipped = 0;

  for (const product of PRODUCTS) {
    process.stdout.write(`  ↳ ${product.brand} ${product.name}... `);
    const id = await insertProduct(product);
    if (id) { inserted++; console.log('✅'); }
    else { skipped++; }
  }

  console.log(`\n✅ Tamamlandı!`);
  console.log(`   Eklendi : ${inserted}`);
  console.log(`   Atlandı : ${skipped}`);
  console.log(`   Toplam  : ${PRODUCTS.length} ürün\n`);
  console.log('🔗 Admin paneli: http://localhost:3000/admin/products');
}

main().catch((err) => {
  console.error('\n❌ Hata:', err.message);
  process.exit(1);
});
