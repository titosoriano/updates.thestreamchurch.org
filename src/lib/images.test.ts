import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { responsiveSrcset, shareImagePath, VARIANT_WIDTHS, variantPath } from './images';

describe('responsive images', () => {
  it('lists every variant and the original as the widest candidate', () => {
    expect(responsiveSrcset('/images/a/hero.webp', 1600)).toBe(
      '/images/a/hero-640.webp 640w, /images/a/hero-960.webp 960w, /images/a/hero-1280.webp 1280w, /images/a/hero.webp 1600w',
    );
  });

  it.each(['fiesta-de-las-naciones-2026', 'servicio-de-mujeres-2026'])('has generated variants for the %s hero', (slug) => {
    const hero = `/images/${slug}/hero.webp`;
    for (const width of VARIANT_WIDTHS) {
      const file = `public${variantPath(hero, width)}`;
      expect(existsSync(file), `${file} missing; run scripts/image-variants.mjs`).toBe(true);
    }
    const share = `public${shareImagePath(hero)}`;
    expect(existsSync(share), `${share} missing; run scripts/image-variants.mjs`).toBe(true);
  });
});
