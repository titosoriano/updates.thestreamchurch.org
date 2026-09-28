# The Stream Church Updates

Static Astro website for events, announcements, missions, testimonies and other updates from Mission Baptist Church - The Stream.

Production URL: `https://updates.thestreamchurch.org`

## Stack

- Astro static output
- TypeScript
- Tailwind CSS v4
- Vitest
- GitHub pull requests for collaboration
- GitHub Actions deployment over SSH
- InterServer shared hosting
- Cloudflare DNS/CDN in front of the origin

Version 1 intentionally has no database, CMS, login, API or server-side rendering.

## Local development

Requirements: Node `>=22.12.0`.

```bash
npm install
npm run dev
```

Before opening a pull request:

```bash
npm test
bash scripts/deploy.test.sh
npm run build
```

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

Example branch:

```bash
git checkout -b feature/bautismos-2026
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

Run the full local checks, push the feature branch, then open a pull request. Production deploys are only triggered from `main`.

## Collaboration rules

- Use `feature/<update-name>` branches for normal content/features.
- Do not push directly to protected `main` once branch protection is enabled.
- Pull requests should pass CI before merge.
- Non-owner collaborator changes should receive at least one approval.
- Never commit cPanel, SSH, Cloudflare, password or private-key credentials.
- Collaborators only need GitHub repository access.

## First custom update

`/fiesta-de-las-naciones-2026` is the first custom landing page. Its approved current event facts are Sunday, October 4, 2026 at 1:00 PM, at 11 Technology Drive North, Warren, NJ 07059, with Chanel Novas as special guest. The page communicates free admission and free food.

## Deployment

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

The deployment uploads the completed `dist/` build to a staged release directory before modifying the live document root, snapshots the previous live release, and attempts rollback if activation fails.

## Lockfile before production

The initial implementation environment could not reach the npm registry. On an internet-connected machine, run:

```bash
npm install
npm test
npm run build
```

Commit the resulting `package-lock.json`. Then replace `npm install --no-audit --no-fund` with `npm ci` in both GitHub Actions workflows, as documented in `docs/DEPLOYMENT.md`.
