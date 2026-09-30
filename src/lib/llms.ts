// Builds /llms.txt and the per-update Markdown copies it links to,
// following the format at https://llmstxt.org/.
import { canonicalForSlug, SITE_ORIGIN } from './updates';

export interface LlmsUpdate {
  data: {
    title: string;
    slug: string;
    description: string;
    publishDate: Date;
    category: string;
    eventDate?: Date;
    eventTime?: string;
    endDate?: Date;
    locationName?: string;
    address?: string;
    guestName?: string;
  };
  body?: string;
}

// Date-only content values parse as UTC midnight, so format them in UTC.
const longDate = new Intl.DateTimeFormat('es-US', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export function markdownUrlForSlug(slug: string): string {
  return `${SITE_ORIGIN}/${slug}.md`;
}

function eventFacts(data: LlmsUpdate['data']): string[] {
  const facts: string[] = [];
  if (data.eventDate) facts.push(`- Fecha: ${longDate.format(data.eventDate)} (${isoDate(data.eventDate)})`);
  if (data.endDate) facts.push(`- Termina: ${longDate.format(data.endDate)} (${isoDate(data.endDate)})`);
  if (data.eventTime) facts.push(`- Hora: ${data.eventTime} (hora de Nueva York)`);
  if (data.locationName) facts.push(`- Lugar: ${data.locationName}`);
  if (data.address) facts.push(`- Dirección: ${data.address}`);
  if (data.guestName) facts.push(`- Participación especial: ${data.guestName}`);
  facts.push(`- Categoría: ${data.category}`);
  facts.push(`- Publicado: ${isoDate(data.publishDate)}`);
  return facts;
}

export function buildLlmsTxt(updates: readonly LlmsUpdate[]): string {
  const lines = [
    '# The Stream Church Updates',
    '',
    '> Eventos, anuncios, misiones, testimonios y otras actualizaciones públicas de Mission Baptist Church - The Stream, una iglesia bautista hispana en Warren, New Jersey. El contenido está en español.',
    '',
    'Cada actualización tiene su propia página y una copia en Markdown (la misma URL terminada en `.md`) con los datos del evento. Las fechas y horas son de Nueva York (America/New_York). Si un dato aquí no coincide con otra fuente, la página de la actualización es la referencia.',
    '',
    '## Actualizaciones',
    '',
    ...(updates.length > 0
      ? updates.map((u) => `- [${u.data.title}](${markdownUrlForSlug(u.data.slug)}): ${u.data.description}`)
      : ['- Todavía no hay actualizaciones publicadas.']),
    '',
    '## Iglesia',
    '',
    '- [Sitio principal de The Stream Church](https://thestreamchurch.org/): horarios de servicio, ministerios y cómo visitarnos',
    '- [Qué esperar en tu visita](https://thestreamchurch.org/que-esperar): información para quienes visitan por primera vez',
    '',
    '## Optional',
    '',
    `- [Página de inicio de Updates](${SITE_ORIGIN}/): lista de todas las actualizaciones publicadas`,
    `- [Mapa del sitio](${SITE_ORIGIN}/sitemap-index.xml): todas las URLs públicas`,
    '',
  ];
  return lines.join('\n');
}

export function buildUpdateMarkdown(update: LlmsUpdate): string {
  const { data } = update;
  const body = (update.body ?? '').trim();
  return [
    `# ${data.title}`,
    '',
    `> ${data.description}`,
    '',
    ...eventFacts(data),
    '',
    ...(body ? [body, ''] : []),
    `Página completa: ${canonicalForSlug(data.slug)}`,
    '',
  ].join('\n');
}
