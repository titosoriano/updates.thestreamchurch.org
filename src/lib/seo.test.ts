import { describe, expect, it } from 'vitest';
import { buildEventJsonLd, buildUpdateJsonLd } from './seo';

const canonical = 'https://updates.thestreamchurch.org/fiesta-de-las-naciones-2026';
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
