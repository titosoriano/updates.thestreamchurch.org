import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { getCollection } from 'astro:content';
import { assertSafeSlug, assertUniqueSlugs } from '../lib/updates';

describe('updates content collection', () => {
  it('contains only unique safe slugs', async () => {
    const updates = await getCollection('updates');
    expect(() => assertUniqueSlugs(updates)).not.toThrow();
    for (const update of updates) expect(() => assertSafeSlug(update.data.slug)).not.toThrow();
  });
});


describe('Fiesta de las Naciones 2026 contract', () => {
  const source = readFileSync(new URL('./updates/fiesta-de-las-naciones-2026.md', import.meta.url), 'utf8');

  it('pins the approved event facts and excludes the stale date', () => {
    expect(source).toContain('title: \"Fiesta de las Naciones 2026\"');
    expect(source).toContain('slug: \"fiesta-de-las-naciones-2026\"');
    expect(source).toContain('eventDate: 2026-10-04');
    expect(source).toContain('eventTime: \"1:00 PM\"');
    expect(source).toContain('11 Technology Drive North, Warren, NJ 07059');
    expect(source).toContain('guestName: \"Chanel Novas\"');
    expect(source).toMatch(/Comida/);
    expect(source).toMatch(/Música/);
    expect(source).toMatch(/Cultura/);
    expect(source).toMatch(/Palabra de Dios/);
    expect(source).toMatch(/entrada gratuita/i);
    expect(source).toMatch(/comida gratuita/i);
    expect(source).not.toMatch(/septiembre\s+27|27\s+de\s+septiembre/i);
  });
});


describe('Servicio de Mujeres 2026 contract', () => {
  const source = readFileSync(new URL('./updates/servicio-de-mujeres-2026.md', import.meta.url), 'utf8');

  it('pins the approved event facts', () => {
    expect(source).toContain('slug: \"servicio-de-mujeres-2026\"');
    expect(source).toContain('eventDate: 2026-10-23');
    expect(source).toContain('eventTime: \"6:30 PM\"');
    expect(source).toMatch(/Mujeres de Espada/);
    expect(source).toMatch(/Hebreos 4:12/);
    expect(source).toMatch(/Entrada gratis/);
    expect(source).toMatch(/refrigerio gratis/);
  });
});
