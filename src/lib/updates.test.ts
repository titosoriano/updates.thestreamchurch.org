import { describe, expect, it } from 'vitest';
import {
  assertSafeSlug,
  assertUniqueSlugs,
  canonicalForSlug,
  isUpdatePublished,
  sortUpdatesNewestFirst,
} from './updates';

const entry = (slug: string, publishDate: string, draft = false) => ({
  data: { slug, publishDate: new Date(publishDate), draft },
});

describe('update publication rules', () => {
  const now = new Date('2026-09-28T12:00:00Z');

  it('hides drafts', () => {
    expect(isUpdatePublished(entry('draft-post', '2026-09-01', true), now)).toBe(false);
  });

  it('hides future posts', () => {
    expect(isUpdatePublished(entry('future-post', '2026-10-01'), now)).toBe(false);
  });

  it('publishes non-drafts at or before now', () => {
    expect(isUpdatePublished(entry('ready-post', '2026-09-28T12:00:00Z'), now)).toBe(true);
  });
});

describe('slug rules', () => {
  it('accepts canonical kebab-case', () => {
    expect(() => assertSafeSlug('fiesta-de-las-naciones-2026')).not.toThrow();
  });

  it.each(['Fiesta 2026', '/fiesta', 'fiesta/2026', ''])('rejects unsafe slug %j', (slug) => {
    expect(() => assertSafeSlug(slug)).toThrow();
  });

  it('rejects duplicate slugs and names the duplicate', () => {
    expect(() =>
      assertUniqueSlugs([entry('same-slug', '2026-09-01'), entry('same-slug', '2026-09-02')])
    ).toThrow(/same-slug/);
  });
});

it('builds the canonical update URL', () => {
  expect(canonicalForSlug('fiesta-de-las-naciones-2026')).toBe(
    'https://updates.thestreamchurch.org/fiesta-de-las-naciones-2026'
  );
});

it('sorts newest first without mutating input', () => {
  const input = [entry('older', '2026-09-01'), entry('newer', '2026-09-20')];
  expect(sortUpdatesNewestFirst(input).map((item) => item.data.slug)).toEqual(['newer', 'older']);
  expect(input.map((item) => item.data.slug)).toEqual(['older', 'newer']);
});
