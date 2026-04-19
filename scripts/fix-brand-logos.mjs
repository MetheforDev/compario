import { createClient } from '@supabase/supabase-js';

const s = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const updates = [
  { slug: 'iphone',              image_url: 'https://cdn.simpleicons.org/apple/ffffff' },
  { slug: 'iphone-pro',          image_url: 'https://cdn.simpleicons.org/apple/ffffff' },
  { slug: 'iphone-standart',     image_url: 'https://cdn.simpleicons.org/apple/ffffff' },
  { slug: 'apple-watch',         image_url: 'https://cdn.simpleicons.org/apple/ffffff' },
  { slug: 'ipad',                image_url: 'https://cdn.simpleicons.org/apple/ffffff' },
  { slug: 'apple-macbook',       image_url: 'https://cdn.simpleicons.org/apple/ffffff' },
  { slug: 'android-telefonlar',  image_url: 'https://cdn.simpleicons.org/android/3DDC84' },
  { slug: 'google-telefonlar',   image_url: 'https://cdn.simpleicons.org/google/4285F4' },
  { slug: 'samsung-telefonlar',  image_url: 'https://cdn.simpleicons.org/samsung/ffffff' },
  { slug: 'samsung-galaxy-watch',image_url: 'https://cdn.simpleicons.org/samsung/ffffff' },
  { slug: 'xiaomi-telefonlar',   image_url: 'https://cdn.simpleicons.org/xiaomi/ff6900' },
  { slug: 'garmin',              image_url: 'https://cdn.simpleicons.org/garmin/ffffff' },
  { slug: 'playstation',         image_url: 'https://cdn.simpleicons.org/playstation/003087' },
  { slug: 'xbox',                image_url: 'https://cdn.simpleicons.org/xbox/107C10' },
  { slug: 'nintendo',            image_url: 'https://cdn.simpleicons.org/nintendo/E4000F' },
];

async function run() {
  let ok = 0, fail = 0, notFound = 0;
  for (const { slug, image_url } of updates) {
    const { data, error } = await s
      .from('categories')
      .update({ image_url })
      .eq('slug', slug)
      .select('id, name');

    if (error) { console.error(`✗ ${slug}:`, error.message); fail++; }
    else if (!data?.length) { console.log(`⚠ ${slug}: bulunamadı`); notFound++; }
    else { console.log(`✓ ${slug} → ${data[0].name}`); ok++; }
  }
  console.log(`\nDone: ${ok} güncellendi, ${notFound} bulunamadı, ${fail} hata`);
}

run().catch(console.error);
