import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { responsiveSrcset, VARIANT_WIDTHS, variantPath } from './images';

describe('responsive images', () => {
  it('lists every variant and the original as the widest candidate', () => {
    expect(responsiveSrcset('/images/a/hero.webp', 1600)).toBe(
      '/images/a/hero-640.webp 640w, /images/a/hero-960.webp 960w, /images/a/hero-1280.webp 1280w, /images/a/hero.webp 1600w',
    );
  });

  it('has generated variants for the event hero', () => {
    for (const width of VARIANT_WIDTHS) {
      const file = `public${variantPath('/images/fiesta-de-las-naciones-2026/hero.webp', width)}`;
      expect(existsSync(file), `${file} missing; run scripts/image-variants.mjs`).toBe(true);
    }
  });
});
