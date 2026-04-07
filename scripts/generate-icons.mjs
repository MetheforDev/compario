/**
 * Icon Generator — Compario
 *
 * Usage:
 *   1. npm install -D sharp   (root'ta bir kere çalıştır)
 *   2. node scripts/generate-icons.mjs
 *
 * Kaynak dosyaları önce yerleştir:
 *   apps/web/public/icons/source-512.png   → App icon kaynağı (512×512)
 *   apps/web/public/og-image-source.jpg    → OG banner kaynağı (1200×630)
 */

import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '../apps/web/public');
const iconsDir = join(publicDir, 'icons');

// Klasör yoksa oluştur
if (!existsSync(iconsDir)) mkdirSync(iconsDir, { recursive: true });

const SOURCE = join(iconsDir, 'source-512.png');

if (!existsSync(SOURCE)) {
  console.error('❌  Kaynak dosya bulunamadı:', SOURCE);
  console.error('   Gemini\'den indirdiğin 512×512 PNG\'yi buraya koy.');
  process.exit(1);
}

// PWA / manifest ikonları
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

console.log('🎨  İkonlar üretiliyor...');

for (const size of ICON_SIZES) {
  const out = join(iconsDir, `icon-${size}x${size}.png`);
  await sharp(SOURCE)
    .resize(size, size, { fit: 'contain', background: { r: 8, g: 9, b: 14, alpha: 1 } })
    .png()
    .toFile(out);
  console.log(`  ✓ icon-${size}x${size}.png`);
}

// Favicon PNG (32×32)
await sharp(SOURCE)
  .resize(32, 32, { fit: 'contain', background: { r: 8, g: 9, b: 14, alpha: 1 } })
  .png()
  .toFile(join(publicDir, 'favicon.png'));
console.log('  ✓ favicon.png (32×32)');

// Apple touch icon (180×180)
await sharp(SOURCE)
  .resize(180, 180, { fit: 'contain', background: { r: 8, g: 9, b: 14, alpha: 1 } })
  .png()
  .toFile(join(publicDir, 'apple-touch-icon.png'));
console.log('  ✓ apple-touch-icon.png (180×180)');

console.log('\n✅  Tamamlandı!');
console.log('\nSonraki adımlar:');
console.log('  1. apps/web/public/og-image.jpg → OG banner görselini buraya koy (1200×630)');
console.log('  2. favicon.png → favicon.ico\'ya çevirmek için: https://favicon.io/favicon-converter');
console.log('  3. favicon.ico\'yu apps/web/public/ klasörüne koy');
