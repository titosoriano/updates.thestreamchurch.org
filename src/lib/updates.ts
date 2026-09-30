export const SITE_ORIGIN = 'https://updates.thestreamchurch.org';

export interface UpdateDataLike {
  slug: string;
  publishDate: Date;
  draft: boolean;
}

export interface UpdateEntryLike<T extends UpdateDataLike = UpdateDataLike> {
  data: T;
}

export function isUpdatePublished<T extends UpdateEntryLike>(update: T, now = new Date()): boolean {
  return update.data.draft !== true && update.data.publishDate.getTime() <= now.getTime();
}

export function sortUpdatesNewestFirst<T extends UpdateEntryLike>(updates: readonly T[]): T[] {
  return [...updates].sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime());
}

export function assertSafeSlug(slug: string): void {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(`Unsafe update slug: "${slug}". Use lowercase kebab-case only.`);
  }
}

export function assertUniqueSlugs<T extends UpdateEntryLike>(updates: readonly T[]): void {
  const seen = new Set<string>();
  for (const update of updates) {
    const { slug } = update.data;
    assertSafeSlug(slug);
    if (seen.has(slug)) {
      throw new Error(`Duplicate update slug: "${slug}".`);
    }
    seen.add(slug);
  }
}

// Pages are built as <slug>/index.html, and the server 301s "/<slug>" to "/<slug>/".
// Canonicals, the sitemap and internal links all use the trailing-slash form so
// search engines never see a canonical that redirects.
export function pathForSlug(slug: string): string {
  assertSafeSlug(slug);
  return `/${slug}/`;
}

export function canonicalForSlug(slug: string): string {
  return `${SITE_ORIGIN}${pathForSlug(slug)}`;
}

export async function getPublishedUpdates(now = new Date()) {
  const { getCollection } = await import('astro:content');
  const updates = await getCollection('updates');
  assertUniqueSlugs(updates);
  return sortUpdatesNewestFirst(updates.filter((update) => isUpdatePublished(update, now)));
}
