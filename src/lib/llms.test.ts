import { describe, expect, it } from 'vitest';
import { buildLlmsTxt, buildUpdateMarkdown } from './llms';

const fiesta = {
  data: {
    title: 'Fiesta de las Naciones 2026',
    slug: 'fiesta-de-las-naciones-2026',
    description: 'Una celebración para toda la familia.',
    publishDate: new Date('2026-09-28'),
    category: 'Eventos',
    eventDate: new Date('2026-10-04'),
    eventTime: '1:00 PM',
    locationName: 'Mission Baptist Church - The Stream',
    address: '11 Technology Drive North, Warren, NJ 07059',
    guestName: 'Chanel Novas',
  },
  body: 'Domingo 4 de octubre de 2026 a la 1:00 PM.\n',
};

describe('llms.txt', () => {
  const txt = buildLlmsTxt([fiesta]);

  it('follows the llmstxt.org layout: one H1, then a blockquote summary', () => {
    const lines = txt.split('\n');
    expect(lines[0]).toBe('# The Stream Church Updates');
    expect(lines.filter((l) => l.startsWith('# '))).toHaveLength(1);
    expect(lines[2]).toMatch(/^> /);
  });

  it('lists each update as a markdown link to its .md copy with notes', () => {
    expect(txt).toContain(
      '- [Fiesta de las Naciones 2026](https://updates.thestreamchurch.org/fiesta-de-las-naciones-2026.md): Una celebración para toda la familia.',
    );
  });

  it('puts skippable links under an Optional section', () => {
    expect(txt).toMatch(/\n## Optional\n/);
  });

  it('says so when nothing is published', () => {
    expect(buildLlmsTxt([])).toContain('Todavía no hay actualizaciones publicadas.');
  });
});

describe('update markdown', () => {
  const md = buildUpdateMarkdown(fiesta);

  it('keeps the event on its real calendar day', () => {
    expect(md).toContain('- Fecha: domingo, 4 de octubre de 2026 (2026-10-04)');
    expect(md).not.toMatch(/septiembre/);
  });

  it('includes the facts, the body and the canonical page', () => {
    expect(md).toContain('- Dirección: 11 Technology Drive North, Warren, NJ 07059');
    expect(md).toContain('Domingo 4 de octubre de 2026 a la 1:00 PM.');
    expect(md).toContain('Página completa: https://updates.thestreamchurch.org/fiesta-de-las-naciones-2026/');
  });
});
