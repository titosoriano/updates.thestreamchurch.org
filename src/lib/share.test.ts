import { describe, expect, it } from 'vitest';
import { buildFacebookShareUrl, buildWhatsAppShareUrl } from './share';

const canonical = 'https://updates.thestreamchurch.org/fiesta-de-las-naciones-2026/';

describe('share URLs', () => {
  it('builds a WhatsApp link with title and canonical URL', () => {
    const url = buildWhatsAppShareUrl('Fiesta de las Naciones 2026', canonical);
    expect(decodeURIComponent(url)).toContain('Fiesta de las Naciones 2026');
    expect(decodeURIComponent(url)).toContain(canonical);
  });

  it('builds a Facebook sharer URL with canonical URL', () => {
    expect(new URL(buildFacebookShareUrl(canonical)).searchParams.get('u')).toBe(canonical);
  });
});
