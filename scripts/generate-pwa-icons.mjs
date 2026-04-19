import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const SRC  = resolve(root, 'apps/web/public/images/logos/compario-logo-icon-only.png');
const OUT  = resolve(root, 'apps/web/public/icons');

mkdirSync(OUT, { recursive: true });

const SIZES = [
  { size: 16,   name: 'favicon-16x16.png' },
  { size: 32,   name: 'favicon-32x32.png' },
  { size: 48,   name: 'favicon-48x48.png' },
  { size: 96,   name: 'icon-96x96.png' },
  { size: 180,  name: 'apple-touch-icon.png' },
  { size: 192,  name: 'icon-192x192.png' },
  { size: 512,  name: 'icon-512x512.png' },
];

// Background color for maskable icons (navy-dark)
const BG = { r: 13, g: 15, b: 26, alpha: 1 };

async function generate() {
  const src = readFileSync(SRC);
  const meta = await sharp(src).metadata();
  console.log(`Source: ${meta.width}x${meta.height} ${meta.format}`);

  for (const { size, name } of SIZES) {
    const outPath = resolve(OUT, name);

    // For apple-touch-icon and maskable icons: add dark background + padding
    if (size >= 180) {
      const padding = Math.round(size * 0.12);
      const inner   = size - padding * 2;

      await sharp(src)
        .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer()
        .then((icon) =>
          sharp({
            create: { width: size, height: size, channels: 4, background: BG },
          })
            .composite([{ input: icon, gravity: 'centre' }])
            .png()
            .toFile(outPath),
        );
    } else {
      await sharp(src)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(outPath);
    }

    console.log(`✓ ${name} (${size}x${size})`);
  }

  console.log('\nDone! İkonlar apps/web/public/icons/ klasörüne kaydedildi.');
}

generate().catch(console.error);
