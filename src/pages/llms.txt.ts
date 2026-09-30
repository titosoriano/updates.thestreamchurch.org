import type { APIRoute } from 'astro';
import { buildLlmsTxt } from '../lib/llms';
import { getPublishedUpdates } from '../lib/updates';

export const GET: APIRoute = async () =>
  new Response(buildLlmsTxt(await getPublishedUpdates()), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
