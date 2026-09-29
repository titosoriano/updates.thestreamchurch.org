import { describe, expect, it } from 'vitest';
import { cardDate, formatContentDate } from './dates';

describe('card dates', () => {
  it('keeps date-only values on the same calendar day', () => {
    expect(formatContentDate(new Date('2026-09-28'))).toBe('28 de septiembre de 2026');
  });

  it('shows the event date for events', () => {
    const data = { publishDate: new Date('2026-09-28'), eventDate: new Date('2026-10-04') };
    expect(formatContentDate(cardDate(data))).toBe('4 de octubre de 2026');
  });

  it('falls back to the publish date', () => {
    expect(cardDate({ publishDate: new Date('2026-09-28') })).toEqual(new Date('2026-09-28'));
  });
});
