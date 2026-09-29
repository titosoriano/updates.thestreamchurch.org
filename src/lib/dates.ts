// Content dates are date-only YAML values, which parse as UTC midnight.
// Format them in UTC so a date never shifts to the previous day in New York.
const cardDateFormatter = new Intl.DateTimeFormat('es-US', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatContentDate(date: Date): string {
  return cardDateFormatter.format(date);
}

// Event cards show when the event happens; other updates show when they were published.
export function cardDate(data: { publishDate: Date; eventDate?: Date }): Date {
  return data.eventDate ?? data.publishDate;
}
