export type TemplateLoader = () => Promise<any>;

export const templateRegistry: Record<string, TemplateLoader> = {
  'fiesta-de-las-naciones-2026': async () =>
    (await import('../updates/fiesta-de-las-naciones-2026/Landing.astro')).default,
  'servicio-de-mujeres-2026': async () =>
    (await import('../updates/servicio-de-mujeres-2026/Landing.astro')).default,
};

export function getTemplateComponent(template: string): TemplateLoader {
  const loader = templateRegistry[template];
  if (!loader) {
    throw new Error(`No custom landing template registered for "${template}".`);
  }
  return loader;
}
