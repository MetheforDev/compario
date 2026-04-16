/**
 * setup-category-hierarchy.mjs
 * Kategori ağacını kurar:
 *   1. Mevcut düz kategorileri parent_id ile hiyerarşiye taşır
 *   2. Eksik üst/alt kategorileri oluşturur
 *   3. Marka alt kategorileri ekler
 *
 * Çalıştır: cd scripts && node setup-category-hierarchy.mjs
 * İdempotent — tekrar çalıştırılabilir.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
let env = {};
try {
  const raw = readFileSync(resolve(__dir, '../apps/web/.env.local'), 'utf8');
  raw.split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && !k.startsWith('#') && v.length) env[k.trim()] = v.join('=').trim();
  });
} catch { /**/ }

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL || env['NEXT_PUBLIC_SUPABASE_URL'];
const KEY  = process.env.SUPABASE_SERVICE_KEY      || env['SUPABASE_SERVICE_KEY'];
if (!URL_ || !KEY) { console.error('❌ Env eksik'); process.exit(1); }

const db = createClient(URL_, KEY);

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getOrCreate(cat) {
  const { data: existing } = await db.from('categories').select('id').eq('slug', cat.slug).single();
  if (existing) return existing.id;
  const { data, error } = await db.from('categories').insert(cat).select('id').single();
  if (error) throw new Error(`Insert failed (${cat.slug}): ${error.message}`);
  console.log(`  ✅ Yeni: ${cat.name}`);
  return data.id;
}

async function setParent(slug, parentId) {
  const { error } = await db.from('categories').update({ parent_id: parentId }).eq('slug', slug);
  if (error) console.warn(`  ⚠ parent set failed (${slug}): ${error.message}`);
  else console.log(`  🔗 ${slug} → parent set`);
}

async function getId(slug) {
  const { data } = await db.from('categories').select('id').eq('slug', slug).single();
  return data?.id ?? null;
}

// ─── Kategori ağacı tanımı ────────────────────────────────────────────────────

const TREE = [
  // ══════════════════════════════════════════════════════
  //  🚗 ARAÇLAR
  // ══════════════════════════════════════════════════════
  {
    slug: 'araclar', name: 'Araçlar', icon: '🚗',
    description: 'Her türlü kara taşıtı karşılaştırmaları',
    display_order: 1,
    children: [
      {
        slug: 'suv', name: 'SUV', icon: '🚙',
        description: 'Sport Utility Vehicle — yüksek taban araçlar',
        display_order: 1,
        children: [
          { slug: 'hibrit-suv',      name: 'Hibrit SUV',      icon: '🌿', display_order: 1 },
          { slug: 'elektrikli-suv',  name: 'Elektrikli SUV',  icon: '⚡', display_order: 2 },
          { slug: 'benzinli-suv',    name: 'Benzinli SUV',    icon: '⛽', display_order: 3 },
        ],
      },
      {
        slug: 'sedan', name: 'Sedan', icon: '🚗',
        description: 'Üç hacimli yolcu otomobilleri',
        display_order: 2,
        children: [
          { slug: 'luks-sedan',        name: 'Lüks Sedan',        icon: '💎', display_order: 1 },
          { slug: 'orta-sinif-sedan',  name: 'Orta Sınıf Sedan',  icon: '🏁', display_order: 2 },
          { slug: 'hibrit-sedan',      name: 'Hibrit Sedan',      icon: '🌿', display_order: 3 },
        ],
      },
      {
        slug: 'hatchback', name: 'Hatchback', icon: '🚘',
        description: 'İki/beş kapılı kompakt otomobiller',
        display_order: 3,
        children: [
          { slug: 'kompakt-hatchback',   name: 'Kompakt Hatchback',   icon: '🏙', display_order: 1 },
          { slug: 'hibrit-hatchback',    name: 'Hibrit Hatchback',    icon: '🌿', display_order: 2 },
          { slug: 'elektrikli-hatchback',name: 'Elektrikli Hatchback',icon: '⚡', display_order: 3 },
        ],
      },
      {
        slug: 'crossover', name: 'Crossover', icon: '🛻',
        description: 'Crossover SUV modelleri',
        display_order: 4,
        children: [
          { slug: 'kompakt-crossover', name: 'Kompakt Crossover', icon: '🏔', display_order: 1 },
          { slug: 'hibrit-crossover',  name: 'Hibrit Crossover',  icon: '🌿', display_order: 2 },
        ],
      },
      {
        slug: 'elektrikli-araclar', name: 'Elektrikli Araçlar', icon: '⚡',
        description: 'Tam elektrikli (BEV) otomobiller',
        display_order: 5,
        children: [
          { slug: 'elektrikli-suv-tum',   name: 'Elektrikli SUV',    icon: '🚙', display_order: 1 },
          { slug: 'elektrikli-sedan-tum', name: 'Elektrikli Sedan',  icon: '🚗', display_order: 2 },
          { slug: 'elektrikli-hatch-tum', name: 'Elektrikli Hatchback', icon: '🚘', display_order: 3 },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  //  📱 TELEFONLAR
  // ══════════════════════════════════════════════════════
  {
    slug: 'telefonlar', name: 'Telefonlar', icon: '📱',
    description: 'Akıllı telefon karşılaştırmaları',
    display_order: 2,
    children: [
      {
        slug: 'android-telefonlar', name: 'Android', icon: '🤖',
        description: 'Android akıllı telefonlar',
        display_order: 1,
        children: [
          { slug: 'samsung-telefonlar', name: 'Samsung', icon: '📱', display_order: 1 },
          { slug: 'xiaomi-telefonlar',  name: 'Xiaomi',  icon: '📱', display_order: 2 },
          { slug: 'google-telefonlar',  name: 'Google Pixel', icon: '📱', display_order: 3 },
        ],
      },
      {
        slug: 'iphone', name: 'iPhone', icon: '🍎',
        description: 'Apple iPhone modelleri',
        display_order: 2,
        children: [
          { slug: 'iphone-pro',      name: 'iPhone Pro Serisi', icon: '🍎', display_order: 1 },
          { slug: 'iphone-standart', name: 'iPhone Standart',   icon: '🍎', display_order: 2 },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  //  💻 LAPTOPLAR
  // ══════════════════════════════════════════════════════
  {
    slug: 'laptoplar', name: 'Laptoplar', icon: '💻',
    description: 'Dizüstü bilgisayar karşılaştırmaları',
    display_order: 3,
    children: [
      {
        slug: 'gaming-laptop', name: 'Gaming Laptop', icon: '🎮',
        display_order: 1,
        children: [
          { slug: 'asus-rog',   name: 'ASUS ROG / TUF',  icon: '🎮', display_order: 1 },
          { slug: 'lenovo-legion', name: 'Lenovo Legion', icon: '🎮', display_order: 2 },
          { slug: 'msi-gaming', name: 'MSI Gaming',       icon: '🎮', display_order: 3 },
        ],
      },
      {
        slug: 'ultrabook', name: 'Ultrabook', icon: '✈',
        description: 'İnce ve hafif iş laptopu',
        display_order: 2,
        children: [
          { slug: 'apple-macbook',  name: 'Apple MacBook', icon: '🍎', display_order: 1 },
          { slug: 'dell-xps',       name: 'Dell XPS',      icon: '💻', display_order: 2 },
          { slug: 'lenovo-thinkpad',name: 'Lenovo ThinkPad',icon: '💻',display_order: 3 },
        ],
      },
      {
        slug: 'is-laptopu', name: 'İş & Ofis Laptopu', icon: '🏢',
        display_order: 3,
        children: [
          { slug: 'hp-laptop',    name: 'HP',     icon: '💻', display_order: 1 },
          { slug: 'asus-laptop',  name: 'ASUS',   icon: '💻', display_order: 2 },
          { slug: 'acer-laptop',  name: 'Acer',   icon: '💻', display_order: 3 },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  //  🏠 BEYAZ EŞYA
  // ══════════════════════════════════════════════════════
  {
    slug: 'beyaz-esya', name: 'Beyaz Eşya', icon: '🏠',
    description: 'Ev aletleri karşılaştırmaları',
    display_order: 4,
    children: [
      {
        slug: 'camasir-makinesi', name: 'Çamaşır Makinesi', icon: '🫧',
        display_order: 1,
        children: [
          { slug: 'samsung-camasir', name: 'Samsung', icon: '🫧', display_order: 1 },
          { slug: 'lg-camasir',      name: 'LG',      icon: '🫧', display_order: 2 },
          { slug: 'beko-camasir',    name: 'Beko',    icon: '🫧', display_order: 3 },
          { slug: 'bosch-camasir',   name: 'Bosch',   icon: '🫧', display_order: 4 },
          { slug: 'arcelik-camasir', name: 'Arçelik', icon: '🫧', display_order: 5 },
        ],
      },
      {
        slug: 'buzdolabi', name: 'Buzdolabı', icon: '🧊',
        display_order: 2,
        children: [
          { slug: 'samsung-buzdolabi', name: 'Samsung', icon: '🧊', display_order: 1 },
          { slug: 'lg-buzdolabi',      name: 'LG',      icon: '🧊', display_order: 2 },
          { slug: 'beko-buzdolabi',    name: 'Beko',    icon: '🧊', display_order: 3 },
          { slug: 'bosch-buzdolabi',   name: 'Bosch',   icon: '🧊', display_order: 4 },
        ],
      },
      {
        slug: 'bulasik-makinesi', name: 'Bulaşık Makinesi', icon: '✨',
        display_order: 3,
        children: [
          { slug: 'bosch-bulasik',   name: 'Bosch',   icon: '✨', display_order: 1 },
          { slug: 'siemens-bulasik', name: 'Siemens', icon: '✨', display_order: 2 },
          { slug: 'beko-bulasik',    name: 'Beko',    icon: '✨', display_order: 3 },
        ],
      },
      {
        slug: 'firin', name: 'Fırın & Ocak', icon: '🔥',
        display_order: 4,
        children: [
          { slug: 'beko-firin',   name: 'Beko',    icon: '🔥', display_order: 1 },
          { slug: 'bosch-firin',  name: 'Bosch',   icon: '🔥', display_order: 2 },
          { slug: 'vestel-firin', name: 'Vestel',  icon: '🔥', display_order: 3 },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  //  📺 TV & MONİTÖRLER
  // ══════════════════════════════════════════════════════
  {
    slug: 'tv-monitorler', name: 'TV & Monitörler', icon: '📺',
    description: 'Televizyon ve monitör karşılaştırmaları',
    display_order: 5,
    children: [
      {
        slug: 'televizyon', name: 'Televizyon', icon: '📺',
        display_order: 1,
        children: [
          { slug: 'oled-tv',  name: 'OLED TV',  icon: '📺', display_order: 1 },
          { slug: 'qled-tv',  name: 'QLED TV',  icon: '📺', display_order: 2 },
          { slug: 'led-tv',   name: 'LED TV',   icon: '📺', display_order: 3 },
        ],
      },
      {
        slug: 'monitorler', name: 'Monitörler', icon: '🖥',
        display_order: 2,
        children: [
          { slug: 'gaming-monitor',  name: 'Gaming Monitör',  icon: '🖥', display_order: 1 },
          { slug: 'is-monitoru',     name: 'İş Monitörü',     icon: '🖥', display_order: 2 },
          { slug: 'ultrawide',       name: 'Ultrawide',       icon: '🖥', display_order: 3 },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  //  🎧 SES SİSTEMLERİ
  // ══════════════════════════════════════════════════════
  {
    slug: 'ses-sistemleri', name: 'Ses Sistemleri', icon: '🎧',
    description: 'Kulaklık ve hoparlör karşılaştırmaları',
    display_order: 6,
    children: [
      {
        slug: 'kulaklik', name: 'Kulaklık', icon: '🎧',
        display_order: 1,
        children: [
          { slug: 'anc-kulaklik',      name: 'ANC Kulaklık',      icon: '🎧', display_order: 1 },
          { slug: 'tws-kulaklik',      name: 'TWS / Kablosuz',    icon: '🎧', display_order: 2 },
          { slug: 'gaming-kulaklik',   name: 'Gaming Kulaklık',   icon: '🎮', display_order: 3 },
        ],
      },
      {
        slug: 'hoparlor', name: 'Hoparlör', icon: '🔊',
        display_order: 2,
        children: [
          { slug: 'bluetooth-hoparlor', name: 'Bluetooth Hoparlör', icon: '🔊', display_order: 1 },
          { slug: 'ev-sinema',          name: 'Ev Sinema Sistemi',  icon: '🏠', display_order: 2 },
        ],
      },
    ],
  },
];

// ─── Recursive oluşturucu ─────────────────────────────────────────────────────

async function processNode(node, parentId = null) {
  const id = await getOrCreate({
    slug: node.slug,
    name: node.name,
    icon: node.icon ?? null,
    description: node.description ?? null,
    display_order: node.display_order ?? 99,
    is_active: true,
    parent_id: parentId,
  });

  // parent_id'yi güncelle (mevcut kategoriler için)
  if (parentId) {
    await db.from('categories').update({ parent_id: parentId }).eq('id', id).is('parent_id', null);
  }

  if (node.children?.length) {
    for (const child of node.children) {
      await processNode(child, id);
    }
  }

  return id;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🏗  Kategori hiyerarşisi kuruluyor...\n');

  for (const root of TREE) {
    console.log(`\n📂 ${root.name}`);
    await processNode(root, null);
  }

  // Mevcut "Araçlar" parent olan "araçlar" slug'ını da bağla
  const araclarId = await getId('araclar');
  if (araclarId) {
    for (const slug of ['suv', 'sedan', 'hatchback', 'crossover']) {
      await db.from('categories').update({ parent_id: araclarId }).eq('slug', slug);
    }
    console.log('\n🔗 SUV, Sedan, Hatchback, Crossover → Araçlar altına taşındı');
  }

  console.log('\n✅ Kategori ağacı tamamlandı!');
  console.log('\n📊 Özet:');

  const { count } = await db.from('categories').select('*', { count: 'exact', head: true });
  console.log(`   Toplam kategori sayısı: ${count}`);

  const { data: roots } = await db.from('categories').select('name').is('parent_id', null);
  console.log(`   Üst düzey kategori: ${roots?.length ?? 0}`);
}

main().catch(err => { console.error(err); process.exit(1); });
