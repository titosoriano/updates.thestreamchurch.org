# The Stream Church Updates

Static Astro website for events, announcements, missions, testimonies and other updates from Mission Baptist Church - The Stream.

Production URL: `https://updates.thestreamchurch.org`

## Stack

- Astro static output
- TypeScript
- Tailwind CSS v4
- Vitest
- Direct commits to `main` (no branches or pull requests)
- GitHub Actions deployment over SSH
- InterServer shared hosting
- Cloudflare DNS/CDN in front of the origin

Version 1 intentionally has no database, CMS, login, API or server-side rendering.

## Local development

Requirements: Node `>=22.12.0`.

```bash
npm ci
npm run dev
```

Before pushing to `main`:

```bash
npm test
bash scripts/deploy.test.sh
npm run build
```

## Typography

Headings are set in **Fraunces** (SIL OFL), self-hosted from `public/fonts/` as a single
subset `woff2`. Body copy stays on the system sans stack; there is no second webfont.

The site makes **zero third-party requests** and must keep doing so - do not swap the
self-hosted face for a Google Fonts or CDN `<link>`. Every heading picks the family up
from the `--font-display` custom property in `src/styles/global.css`; never name the
family at a call site.

Provenance, licence, the exact subset and how to regenerate it are in
`public/fonts/README.md`. `src/styles/fonts.test.ts` fails the build if the shipped file,
the `@font-face`, the preload and the cache headers stop agreeing, or if the subset stops
covering a character the site renders.

## Publishing model

Each update has two parts:

1. Structured metadata in `src/content/updates/`.
2. A custom Astro landing page registered in `src/lib/templates.ts`.

Required metadata:

```yaml
title: string
slug: lowercase-kebab-case
description: string
publishDate: date
category: string
featured: boolean
draft: boolean
template: string
image: string
imageAlt: string
```

Optional event metadata:

```yaml
eventDate: date
eventTime: string
endDate: date
locationName: string
address: string
guestName: string
tags: string[]
```

A page is public only when `draft` is `false` and `publishDate` is not in the future. Publication rules are centralized in `src/lib/updates.ts`; do not reproduce them in a page.

## Add a new update

Work directly on `main`; do not create a branch.

```bash
git checkout main
git pull
```

Create the metadata file:

```text
src/content/updates/bautismos-2026.md
```

Create the custom presentation:

```text
src/updates/bautismos-2026/Landing.astro
```

Register it explicitly in `src/lib/templates.ts` using the same value as the metadata `template` field. A published entry with an unregistered template is expected to fail validation/build rather than silently use a generic page.

Run the full local checks, then commit and push directly to `main`. Every push to `main` deploys to production, so confirm that Deploy Production passes afterwards.

## Collaboration rules

- Commit and push directly to `main`. Do not create branches or pull requests unless the owner asks for one.
- Run `npm test`, `bash scripts/deploy.test.sh` and `npm run build` before every push, because each push deploys.
- Never commit cPanel, SSH, Cloudflare, password or private-key credentials.
- Collaborators only need GitHub repository access.

## First custom update

`/fiesta-de-las-naciones-2026` is the first custom landing page. Its approved current event facts are Sunday, October 4, 2026 at 1:00 PM, at 11 Technology Drive North, Warren, NJ 07059, with Chanel Novas as special guest. The page communicates free admission and free food.

## Deployment

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

The deployment uploads the completed `dist/` build to a staged release directory before modifying the live document root, snapshots the previous live release, and attempts rollback if activation fails.

## Dependency reproducibility

`package-lock.json` is committed and both CI and production deployment use `npm ci` with the npm cache enabled in `actions/setup-node`.
