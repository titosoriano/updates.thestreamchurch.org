import { describe, expect, it } from 'vitest';
import { getTemplateComponent, templateRegistry } from './templates';

describe('template registry', () => {
  it('registers Fiesta de las Naciones 2026', () => {
    expect(templateRegistry).toHaveProperty('fiesta-de-las-naciones-2026');
  });

  it('registers Servicio de Mujeres 2026', () => {
    expect(templateRegistry).toHaveProperty('servicio-de-mujeres-2026');
  });

  it('throws a clear error for an unknown template', () => {
    expect(() => getTemplateComponent('missing-template')).toThrow(/missing-template/);
  });
});
