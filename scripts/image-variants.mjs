// Writes the narrower copies that `responsiveSrcset` in src/lib/images.ts
// points at. Run after replacing a source image:
//   node scripts/image-variants.mjs public/images/<slug>/hero.webp
import sharp from 'sharp';
import { SHARE_IMAGE, shareImagePath, VARIANT_WIDTHS, variantPath } from '../src/lib/images.ts';

for (const source of process.argv.slice(2)) {
  for (const width of VARIANT_WIDTHS) {
    const out = `public${variantPath(source.replace(/^public/, ''), width)}`;
    await sharp(source).resize({ width }).webp({ quality: 72, effort: 6 }).toFile(out);
    console.log(out);
  }
  const share = `public${shareImagePath(source.replace(/^public/, ''))}`;
  await sharp(source).resize({ ...SHARE_IMAGE, fit: 'cover' }).jpeg({ quality: 80, mozjpeg: true }).toFile(share);
  console.log(share);
}
