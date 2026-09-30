import { describe, expect, it } from 'vitest';
import { buildBreadcrumbJsonLd, buildEventJsonLd, buildHomeJsonLd, buildUpdateJsonLd } from './seo';

const canonical = 'https://updates.thestreamchurch.org/fiesta-de-las-naciones-2026/';
const update = {
  data: {
    title: 'Fiesta de las Naciones 2026',
    description: 'Una celebración para toda la familia.',
    slug: 'fiesta-de-las-naciones-2026',
    image: '/images/fiesta-de-las-naciones-2026/hero.webp',
    eventDate: new Date('2026-10-04T00:00:00Z'),
    eventTime: '1:00 PM',
    locationName: 'Mission Baptist Church - The Stream',
    address: '11 Technology Drive North, Warren, NJ 07059',
  },
};

describe('Event JSON-LD', () => {
  it('emits the approved Fiesta event details with New Jersey offset', () => {
    const json = buildEventJsonLd(update, canonical)!;
    expect(json['@type']).toBe('Event');
    expect(json.name).toBe('Fiesta de las Naciones 2026');
    expect(json.startDate).toBe('2026-10-04T13:00:00-04:00');
    expect(json.eventStatus).toBe('https://schema.org/EventScheduled');
    expect(json.eventAttendanceMode).toBe('https://schema.org/OfflineEventAttendanceMode');
    expect(json.url).toBe(canonical);
    expect(json.location.address.streetAddress).toContain('11 Technology Drive North');
    expect(json.location.address.addressLocality).toBe('Warren');
    expect(json.location.address.addressRegion).toBe('NJ');
    expect(json.location.address.postalCode).toBe('07059');
    expect(json.organizer.name).toMatch(/Mission Baptist Church|The Stream/);
  });

  it('does not emit Event when required event metadata is missing', () => {
    expect(buildEventJsonLd({ data: { ...update.data, eventTime: undefined } }, canonical)).toBeNull();
  });
});

it('uses Article structured data for non-event updates', () => {
  expect(buildUpdateJsonLd({ data: { ...update.data, eventTime: undefined } }, canonical)['@type']).toBe('Article');
});

describe('extra structured data', () => {
  it('marks the event free, Spanish, and names the guest', () => {
    const json = buildEventJsonLd({ data: { ...update.data, guestName: 'Chanel Novas' } }, canonical)!;
    expect(json.isAccessibleForFree).toBe(true);
    expect(json.offers.price).toBe(0);
    expect(json.inLanguage).toBe('es');
    expect(json.performer.name).toBe('Chanel Novas');
  });

  it('omits performer when there is no guest', () => {
    expect(buildEventJsonLd(update, canonical)!.performer).toBeUndefined();
  });

  it('builds a two-level breadcrumb ending at the update', () => {
    const crumbs = buildBreadcrumbJsonLd('Fiesta de las Naciones 2026', canonical);
    expect(crumbs.itemListElement.map((i: any) => i.item)).toEqual(['https://updates.thestreamchurch.org/', canonical]);
  });

  it('lists published updates on the home page graph', () => {
    const graph = buildHomeJsonLd([{ title: 'Fiesta de las Naciones 2026', url: canonical }])['@graph'];
    expect(graph.map((n: any) => n['@type'])).toEqual(['Church', 'WebSite', 'ItemList']);
    expect(graph[2].itemListElement[0].url).toBe(canonical);
  });
});
