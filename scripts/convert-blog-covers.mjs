// Generate WebP versions of the heavy blog cover images (Phase 0 perf win).
// The source PNGs are kept as a <picture> fallback and as the og:image (social
// platforms don't reliably render WebP), so this is additive and safe to re-run.
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const blogImagesDir = join(process.cwd(), 'public', 'images', 'blog');

const covers = ['cnc-interiors-cover.png', 'wardrobe-storage-cover.png'];

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

for (const name of covers) {
  const src = join(blogImagesDir, name);
  if (!existsSync(src)) {
    console.warn(`skip: ${name} not found`);
    continue;
  }
  const out = src.replace(/\.png$/i, '.webp');
  // failOn:'none' tolerates non-fatal libpng issues (e.g. bad iCCP profile).
  await sharp(src, { failOn: 'none' }).webp({ quality: 80, effort: 6 }).toFile(out);
  console.log(
    `${name}: ${kb(statSync(src).size)} PNG -> ${kb(statSync(out).size)} WebP`
  );
}
