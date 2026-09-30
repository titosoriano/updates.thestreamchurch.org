import type { APIRoute, GetStaticPaths } from 'astro';
import { buildUpdateMarkdown } from '../lib/llms';
import { getPublishedUpdates } from '../lib/updates';

// Markdown copy of each update, linked from /llms.txt.
export const getStaticPaths = (async () => {
  const updates = await getPublishedUpdates();
  return updates.map((update) => ({ params: { slug: update.data.slug }, props: { update } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  new Response(buildUpdateMarkdown(props.update), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
