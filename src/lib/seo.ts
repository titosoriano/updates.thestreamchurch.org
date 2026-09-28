const SITE_ORIGIN = 'https://updates.thestreamchurch.org';
const CHURCH_URL = 'https://thestreamchurch.org/';

interface SeoUpdate {
  data: {
    title: string;
    description: string;
    slug: string;
    image?: string;
    publishDate?: Date;
    eventDate?: Date;
    eventTime?: string;
    locationName?: string;
    address?: string;
  };
}

function dateOnly(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseTwelveHourTime(value: string): { hour: number; minute: number } | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return null;
  const period = match[3].toUpperCase();
  if (period === 'AM') hour = hour === 12 ? 0 : hour;
  if (period === 'PM') hour = hour === 12 ? 12 : hour + 12;
  return { hour, minute };
}

function newYorkOffset(date: string): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    timeZoneName: 'longOffset',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const zone = formatter.formatToParts(new Date(`${date}T12:00:00Z`)).find((part) => part.type === 'timeZoneName')?.value;
  const match = zone?.match(/^GMT([+-]\d{2}:\d{2})$/);
  if (!match) throw new Error(`Unable to determine America/New_York offset for ${date}.`);
  return match[1];
}

function eventStart(eventDate: Date, eventTime: string): string | null {
  const parsed = parseTwelveHourTime(eventTime);
  if (!parsed) return null;
  const date = dateOnly(eventDate);
  return `${date}T${String(parsed.hour).padStart(2, '0')}:${String(parsed.minute).padStart(2, '0')}:00${newYorkOffset(date)}`;
}

function parseAddress(address: string) {
  const match = address.match(/^(.*),\s*([^,]+),\s*([A-Z]{2})\s+(\d{5})$/);
  if (!match) return null;
  return {
    streetAddress: match[1],
    addressLocality: match[2],
    addressRegion: match[3],
    postalCode: match[4],
    addressCountry: 'US',
  };
}

function absoluteImage(image?: string): string | undefined {
  return image ? new URL(image, SITE_ORIGIN).href : undefined;
}

export function buildEventJsonLd(update: SeoUpdate, canonicalUrl: string): Record<string, any> | null {
  const { data } = update;
  if (!data.eventDate || !data.eventTime || !data.locationName || !data.address) return null;
  const startDate = eventStart(data.eventDate, data.eventTime);
  const address = parseAddress(data.address);
  if (!startDate || !address) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: data.title,
    description: data.description,
    startDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    url: canonicalUrl,
    image: absoluteImage(data.image),
    location: {
      '@type': 'Place',
      name: data.locationName,
      address: { '@type': 'PostalAddress', ...address },
    },
    organizer: {
      '@type': 'Organization',
      name: 'Mission Baptist Church - The Stream',
      alternateName: 'The Stream Church',
      url: CHURCH_URL,
    },
  };
}

export function buildUpdateJsonLd(update: SeoUpdate, canonicalUrl: string): Record<string, any> {
  const { data } = update;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.title,
    description: data.description,
    url: canonicalUrl,
    image: absoluteImage(data.image),
    datePublished: data.publishDate?.toISOString(),
    publisher: {
      '@type': 'Organization',
      name: 'Mission Baptist Church - The Stream',
      url: CHURCH_URL,
    },
  };
}
