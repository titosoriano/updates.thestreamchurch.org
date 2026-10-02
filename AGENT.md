# AGENT.md

## Purpose

This file is the operational context for anyone, human or AI agent, continuing work on this repository from another machine or a fresh session.

Read this file together with:

- `README.md`
- `docs/DEPLOYMENT.md`
- `docs/superpowers/specs/2026-09-28-updates-thestreamchurch-design.md`
- `docs/superpowers/plans/2026-09-28-updates-thestreamchurch-implementation.md`

Do not guess infrastructure values, event facts, or deployment behavior when the repository or GitHub configuration can be checked directly.

Last major infrastructure verification: **2026-09-28**.

---

## Project identity

Repository:

```text
titosoriano/updates.thestreamchurch.org
```

Production:

```text
https://updates.thestreamchurch.org
```

Purpose:

A static updates portal for The Stream Church. It is intended for events, announcements, missions, testimonies, series, ministry updates, and other public church content.

This is intentionally separate from the main church website and from the Bible studies site.

Current related hostnames in the same Cloudflare zone include:

```text
thestreamchurch.org
www.thestreamchurch.org
estudios.thestreamchurch.org
updates.thestreamchurch.org
blog.thestreamchurch.org
```

---

## Current architecture

The site is deliberately simple and static.

Stack:

- Astro
- TypeScript
- Tailwind CSS v4
- Vitest
- Astro Sitemap
- Static output only
- GitHub Actions
- SSH deployment
- InterServer shared hosting
- LiteSpeed/Apache-compatible document root
- Cloudflare in front of the origin

There is currently:

- no database
- no CMS
- no login
- no API
- no server-side rendering
- no Cloudflare Pages
- no Cloudflare Workers

The goal is to keep publishing fast, auditable, inexpensive, and easy to migrate.

---

## Node and dependency policy

Required Node version:

```text
>=22.12.0
```

GitHub Actions currently uses:

```text
Node 24
```

A committed `package-lock.json` exists.

Use:

```bash
npm ci
```

for normal clean installs.

Do not change CI or production back to `npm install` unless there is a deliberate reason.

Both CI and production deployment use the npm cache through `actions/setup-node`.

When dependencies change, update and commit `package-lock.json`.

---

## Local setup on a new machine

Clone:

```bash
git clone https://github.com/titosoriano/updates.thestreamchurch.org.git
cd updates.thestreamchurch.org
```

Install:

```bash
npm ci
```

Start development server:

```bash
npm run dev
```

Before pushing changes:

```bash
npm test
bash scripts/deploy.test.sh
npm run build
```

All three should pass.

Do not treat a successful local dev server as sufficient verification.

---

## Important source layout

Core structure:

```text
src/
  components/
  content/
    updates/
  layouts/
  lib/
  pages/
  styles/
  updates/

public/
  images/
  .htaccess

scripts/
  deploy.sh
  deploy.test.sh

.github/
  workflows/
    ci.yml
    deploy.yml
```

Key files:

`src/content.config.ts`
: Defines the structured update collection and validation contract.

`src/content/updates/`
: One metadata Markdown file per update.

`src/updates/<slug>/Landing.astro`
: Custom presentation for an update.

`src/lib/templates.ts`
: Explicit registry connecting metadata template names to Astro landing components.

`src/lib/updates.ts`
: Central publication/filtering rules. Do not duplicate those rules inside individual pages.

`src/lib/seo.ts`
: SEO and structured-data helpers.

`src/components/ShareButtons.astro`
: Social sharing behavior.

`src/pages/[...slug].astro`
: Dynamic static route generation for registered updates.

`public/.htaccess`
: HTTPS redirect, cache behavior, compression, security headers, and custom 404 handling.

---

## Publishing model

Every update has two primary parts:

1. Structured metadata in `src/content/updates/`
2. A custom Astro landing page in `src/updates/<slug>/`

Required metadata fields:

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

An update is public only when:

- `draft` is `false`
- `publishDate` is not in the future
- its template is registered correctly
- the project passes validation/build

A published entry with an unregistered template is expected to fail instead of silently falling back to a generic page.

---

## How to add a new update

Work directly on `main`. Do not create a branch or a pull request.

```bash
git checkout main
git pull
```

Create metadata:

```text
src/content/updates/bautismos-2026.md
```

Create presentation:

```text
src/updates/bautismos-2026/Landing.astro
```

If useful, split the landing into local components in the same folder.

Register the template in:

```text
src/lib/templates.ts
```

Place images under:

```text
public/images/<update-slug>/
```

Run:

```bash
npm test
bash scripts/deploy.test.sh
npm run build
```

Then commit and push directly to `main` (see the branch policy below).

Production deployment is triggered only by changes reaching `main`.

---

## First production update: Fiesta de las Naciones 2026

The first custom landing page is:

```text
/fiesta-de-las-naciones-2026
```

Current approved facts are:

```text
Event: Fiesta de las Naciones 2026
Date: Sunday, October 4, 2026
Time: 1:00 PM
Location: 11 Technology Drive North, Warren, NJ 07059
Special guest: Bolañito (de Los Hijos del Rey)
Admission: Free
Food: Free
```

Guest update (2026-10-02): Chanel Novas will not attend due to logistics. Bolañito, de Los Hijos del Rey, is the confirmed guest. The featured flyer is `fiesta1.webp` (from `fiesta1.png`); `bolanito.webp` (from `bolanito.png`) appears in the guest section. Show both flyers without cropping. The event hero uses optimized `bg1.webp` and `bg1-mobile.webp` crops from `bg1.jpg`; the logistics notice appears in an accessible, labeled alert-style panel.

Critical stale-data warning:

**Do not restore September 27, 2026 as the event date.**

September 27 was the earlier date before the event was postponed because of weather. The correct current date is **October 4, 2026**.

If event facts change again, update both structured metadata and any hard-coded presentation copy.

---

## SEO, discovery, and sharing expectations

The project was built with search engines and LLM discoverability in mind.

Keep these working for every update:

- canonical URL
- title and description
- Open Graph metadata
- Twitter/social metadata
- sitemap inclusion
- robots behavior
- JSON-LD
- Event structured data for events when appropriate
- descriptive image alt text
- semantic headings
- mobile-first rendering
- accessible links/buttons
- sharing controls

For event updates, verify structured data uses the real date, time, location, and public URL.

Do not invent event details to fill schema fields.

Rules added by the 2026-09-29 SEO pass:

- **URLs end in `/`.** Pages build as `<slug>/index.html` and the server 301s `/<slug>`
  to `/<slug>/`. `pathForSlug()` / `canonicalForSlug()` in `src/lib/updates.ts` return the
  trailing-slash form, and canonicals, internal links, share links and the sitemap all use
  it. Never hand-write an update URL; call those helpers.
- **`public/robots.txt`** allows everything and points to `/sitemap-index.xml`.
- **Noindex pages (the 404) get no canonical or `og:url`.** `BaseLayout.astro` drops both
  when `robots` contains `noindex`.
- **Structured data** (`src/lib/seo.ts`):
  - home: `@graph` with the church (`Church`), the `WebSite`, and an `ItemList` of
    published updates;
  - event pages: `Event` with `inLanguage`, `isAccessibleForFree`, a free `Offer`, and
    `performer` when `guestName` is set, plus a `BreadcrumbList`;
  - non-event updates: `Article` plus the same `BreadcrumbList`.
  `isAccessibleForFree` and the free offer assume free entry. If an event ever charges,
  change them.
- **Share images are 1200×630 JPEG** (`<image>-share.jpg`, from `shareImagePath()` in
  `src/lib/images.ts`), with `og:image:width`/`height`. `scripts/image-variants.mjs`
  generates them with the other variants. The home page uses the featured update's share
  image.

---

### llms.txt for AI assistants

`/llms.txt` follows https://llmstxt.org/: one H1, a blockquote summary, then H2 link
lists, with skippable links under `## Optional`. It is generated at build time by
`src/pages/llms.txt.ts` from the same published updates as the home page, so a new
update appears there without editing it by hand.

Each update also gets a Markdown copy at its URL plus `.md`
(`src/pages/[slug].md.ts`), with the event facts and the update body. Both are built in
`src/lib/llms.ts` and tested in `src/lib/llms.test.ts`. `public/.htaccess` serves them as
UTF-8, and the production smoke test checks `/llms.txt`.

---

## CI

Workflow:

```text
.github/workflows/ci.yml
```

CI runs on:

- pull requests targeting `main`
- pushes to `main`

CI currently performs:

1. checkout
2. Node 24 setup
3. npm cache setup
4. `npm ci`
5. `npm test`
6. `bash scripts/deploy.test.sh`
7. `npm run build`

Timezone used for build:

```text
America/New_York
```

This matters for publication-date behavior.

---

## Production deployment

Workflow:

```text
.github/workflows/deploy.yml
```

Trigger:

- push to `main`
- manual workflow dispatch

Production deploy sequence:

1. checkout
2. Node 24
3. `npm ci`
4. tests
5. deployment safety test
6. Astro build
7. verify `dist/index.html`
8. configure pinned SSH credentials
9. stage release on InterServer
10. activate release
11. smoke-test public production URLs

Deployment is intentionally staged rather than deleting/replacing the live directory first.

`scripts/deploy.sh` uploads a release, snapshots the previous live version, activates the new version, and attempts rollback if activation fails.

Release storage should remain outside the public document root.

---

## GitHub Actions secrets

The deployment requires these repository secrets:

```text
INTERSERVER_HOST
INTERSERVER_SSH_PORT
INTERSERVER_USERNAME
INTERSERVER_SSH_KEY
INTERSERVER_SSH_HOST_KEY
INTERSERVER_DEPLOY_PATH
INTERSERVER_RELEASES_PATH
```

Important:

- Never commit their values.
- Never paste private keys into documentation, issues, PRs, chat logs, or screenshots.
- Never commit Cloudflare API credentials.
- Retrieve/rotate values from the real hosting/GitHub configuration when necessary.

The production document root and release paths are represented by secrets. See `docs/DEPLOYMENT.md` for the expected shape.

SSH uses pinned host-key verification. Do not weaken it to `StrictHostKeyChecking=no`.

---

## Smoke tests and the 301 issue that was fixed

The first production deployment completed successfully on the server but the workflow was marked failed because:

```text
/fiesta-de-las-naciones-2026
```

returned a normal directory redirect:

```text
301 -> /fiesta-de-las-naciones-2026/
```

The smoke test originally expected a direct `200`.

The fix was to make curl follow redirects:

```bash
curl -sSL
```

not:

```bash
curl -sS
```

Do not remove `-L` from production smoke tests unless route behavior changes deliberately.

Current smoke tests include:

```text
/
 /fiesta-de-las-naciones-2026
 /sitemap-index.xml
 /llms.txt
```

All must resolve to final HTTP 200 responses.

---

## Hosting

Production is hosted on the existing InterServer shared-hosting environment.

The deployment target is the dedicated document root for:

```text
updates.thestreamchurch.org
```

The site is served behind Cloudflare.

The web server exposes LiteSpeed behavior and supports the current `.htaccess` configuration.

Do not migrate to another hosting product casually. If hosting changes, update:

- GitHub secrets
- deploy script assumptions
- rollback behavior
- Cloudflare origin configuration
- this file
- `docs/DEPLOYMENT.md`

---

## Cloudflare and SSL/TLS

Cloudflare is used as DNS/CDN/proxy for the church domain.

Current intended mode:

```text
SSL/TLS encryption mode: Full (strict)
```

As of 2026-09-28, Full (strict) was successfully restored after correcting origin certificates.

Relevant proxied hostnames:

```text
thestreamchurch.org
www.thestreamchurch.org
estudios.thestreamchurch.org
updates.thestreamchurch.org
blog.thestreamchurch.org
```

These hostnames were confirmed to work without Cloudflare Error 526 after the origin certificate work.

### SSL incident history

Initially, `updates.thestreamchurch.org` needed a valid origin certificate.

A Cloudflare Origin CA certificate was installed for the updates origin.

Later, the Cloudflare zone was switched globally to:

```text
Full (strict)
```

At that time the main site and Estudios returned:

```text
Invalid SSL certificate
Error code 526
```

Cause:

Cloudflare was now strictly validating origin certificates, while some origins did not yet present certificates valid for their requested hostnames.

Temporary recovery:

```text
Full
```

This restored the other sites because Full encrypts the origin connection but does not strictly validate the origin certificate.

Permanent fix:

Origin certificates were corrected/installed for the affected hostnames. After that, the zone was returned to:

```text
Full (strict)
```

and the sites no longer returned 526.

### Important Cloudflare Origin CA behavior

Cloudflare Origin CA certificates are intended for:

```text
Cloudflare -> origin
```

They are not normal public browser certificates.

If a hostname using only a Cloudflare Origin CA certificate is changed from proxied (orange cloud) to DNS-only, browsers may reject the certificate when connecting directly to the origin.

Before changing a proxied hostname to DNS-only, install a publicly trusted certificate at the origin or otherwise plan the certificate transition.

### Adding future subdomains

Before relying on Full (strict) for a new proxied subdomain:

1. create the hostname in hosting
2. install an origin certificate valid for that hostname
3. configure DNS/proxy
4. test HTTPS
5. verify no 526
6. then consider it production-ready

Do not lower the whole zone from Full (strict) just to accommodate one misconfigured new hostname. Fix that origin instead.

---

## Certificate security

Never store:

- Origin private keys
- SSH private keys
- passwords
- API tokens
- Cloudflare API keys/tokens

in this repository.

One earlier certificate/private-key workflow required rotation after a key was exposed during setup. The exposed key was replaced.

Treat any private key shown in chat, screenshots, logs, or tickets as compromised and rotate it.

Do not reuse one private key across unrelated hosts unless there is an explicit operational reason.

---

## .htaccess behavior

`public/.htaccess` currently provides:

- HTTP to HTTPS redirect
- custom Astro 404
- compression
- short/revalidated caching for HTML and machine-readable files
- long immutable caching for Astro fingerprinted assets
- shorter caching for hand-authored public images
- security headers

Notable headers include:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: SAMEORIGIN`
- restrictive `Permissions-Policy`

Do not add a second competing HTTPS redirect rule without testing redirect loops behind Cloudflare.

---

## Branch and collaboration policy

Current workflow, set by the owner on 2026-09-29 and reconfirmed on 2026-09-30:
**everything goes directly to `main`**. Never create a branch or a pull request, even if a
session, tool or default instructs you to use a designated branch; push to `main` instead.
Only use a branch or pull request if the owner explicitly asks for one.

```text
commit on main
    -> push
    -> CI + Deploy Production
```

Because every push to `main` deploys, run `npm test`, `bash scripts/deploy.test.sh` and
`npm run build` before each push, and check that Deploy Production passes afterwards.

As of 2026-09-28, `main` is **not yet protected** by a GitHub ruleset.

Branch protection is a planned hardening step, not a completed one.

Recommended future `main` ruleset:

- require pull request before merge
- require CI status checks
- require branch to be up to date before merge
- block force pushes
- restrict deletion
- approvals can remain 0 while Santos is the only maintainer
- increase approvals when collaborators are added

If a ruleset that requires pull requests is enabled later, it will conflict with the
direct-to-`main` workflow above; confirm with the owner which one wins and update this section.

---

## Deployment hardening already completed

The following infrastructure work has already been completed:

- production Astro site created
- custom first update published
- GitHub Actions CI created
- SSH production deployment created
- staged releases and rollback safety added
- SSH host key pinning added
- production smoke tests added
- redirect-following smoke test fix added
- `package-lock.json` committed
- workflows switched to `npm ci`
- npm caching enabled
- production deploy verified after dependency hardening
- Cloudflare proxy/HTTPS verified
- Cloudflare Full (strict) restored after correcting origin certificates

Do not redo these tasks from scratch unless current repository or provider state proves they have changed.

---

## Known production verification

A successful deployment should prove:

- tests pass
- deployment safety test passes
- Astro build passes
- `dist/index.html` exists
- SSH connection succeeds
- staged release succeeds
- activation succeeds
- smoke tests succeed

Do not claim production is healthy just because a commit exists in `main`.

Check the current GitHub Actions run.

---

## Troubleshooting checklist

### GitHub Action fails at npm install

Confirm:

- `package-lock.json` exists
- `package.json` and lockfile are in sync
- workflow uses `npm ci`
- Node version is compatible

### Build fails on update metadata

Check:

- required content fields
- date syntax
- slug format
- template field
- template registration
- Lighthouse results or the performance rules above
- image path

### Page exists but workflow reports 301

Smoke tests should use:

```bash
curl -sSL
```

because static directory routes may redirect to a trailing slash.

### Cloudflare Error 526

Do not immediately disable HTTPS.

526 under Full (strict) means Cloudflare cannot validate the origin certificate for that hostname.

Check:

- certificate is installed on the correct virtual host
- hostname is included in certificate SAN/CN
- certificate is not expired
- correct certificate/key pair is installed
- Cloudflare Origin CA or another acceptable CA is used
- origin web server is actually presenting the expected certificate

### Browser rejects certificate when bypassing Cloudflare

If the origin uses Cloudflare Origin CA, this can be expected.

Cloudflare Origin CA is designed for Cloudflare-to-origin traffic, not direct public browser trust.

### SSH deployment fails

Check GitHub repository secrets, hosting permissions, SSH host-key pinning, target paths, and remote `rsync`.

Do not print private keys while debugging.

---

## Current operational rule for facts

For church events, never silently infer dates, names, prices, addresses, or guests.

Use approved source material.

When an event is postponed or corrected, old dates can survive in:

- metadata
- landing page copy
- structured data
- images
- social metadata
- tests

Search all relevant files when changing facts.

---

## Design expectations

The portal should remain consistent with The Stream Church identity while allowing every update to have a custom visual presentation.

General expectations:

- mobile-first
- clean
- modern
- readable
- strong visual hierarchy
- no unnecessary backend complexity
- accessible
- fast
- search-friendly
- share-friendly

Custom landing pages are intentional. Do not force all updates into one visually generic template if the update benefits from a dedicated design.

### Typography

Display/heading type is **Fraunces**, licensed under the SIL Open Font License 1.1 and
self-hosted:

```text
public/fonts/fraunces-display.<contenthash>.woff2
public/fonts/Fraunces-OFL.txt
public/fonts/README.md
```

Rules that must survive future changes:

- The site makes **no third-party requests**. Never replace the self-hosted face with a
  Google Fonts or CDN link.
- `woff2` only, one file, subset by hand. Body text stays on the system sans stack; do
  not add a second webfont.
- Headings read the family from `--font-display` in `src/styles/global.css`. Do not name
  a font family at a call site.
- The filename carries a content hash because `public/.htaccess` serves `.woff2` as
  `immutable` for a year. Regenerating the font means renaming the file and updating
  `src/styles/global.css`, `src/layouts/BaseLayout.astro`, `src/styles/fonts.test.ts`
  and `public/fonts/README.md`.
- `--font-display` keeps metric-matched fallback faces ahead of plain Georgia so the swap
  does not move the layout, and keeps Georgia in the stack so text is never invisible.
  `public/fonts/README.md` explains where those numbers come from.
- Avoid `ch` units for widths on display-font elements; `ch` is the width of the font's
  own `0` and moves when the face swaps. Use `em`.

`src/styles/fonts.test.ts` enforces most of the above, including that the subset still
covers every character the repository renders.

### Performance and Lighthouse

Target: **100 in all four Lighthouse categories** (Performance, Accessibility, Best
Practices, SEO) on the mobile test, for every page. The 2026-09-29 audit reached 100 on
`/` and `/fiesta-de-las-naciones-2026` (local build; confirm on pagespeed.web.dev).

What the audit found and fixed, and the rule each fix now implies:

- **Stylesheet blocked first paint.** `astro.config.mjs` uses
  `build.inlineStylesheets: 'always'`, so the CSS ships inside each page instead of as a
  separate request. Keep it that way; keep `global.css` small.
- **Oversized hero photo.** Large photos get narrower copies (640/960/1280 px) through
  `responsiveSrcset()` in `src/lib/images.ts`. After adding or replacing a large photo, run:

  ```bash
  node --experimental-strip-types scripts/image-variants.mjs public/images/<slug>/hero.webp
  ```

  `src/lib/images.test.ts` fails if a variant the site references is missing.
- **Phones downloaded the full-width hero.** The event hero uses `object-fit: cover`, so a
  phone only shows its centre. `Landing.astro` serves a portrait crop
  (`hero-mobile.webp`, 760×919) through `<picture>` below 900 px. Replacing the hero means
  re-cutting that crop too.
- **Above-the-fold images must not be lazy.** The LCP image (the event hero, and the
  featured card on the home page via `<UpdateCard priority />`) uses `loading="eager"` and
  `fetchpriority="high"`. Everything below the fold stays `loading="lazy"`.
- **Every image keeps `width` and `height`** so nothing shifts while loading (CLS 0).
- **Compress photos** as WebP around quality 72–75 before committing; the original hero
  went from 188 KB to 125 KB with no visible change.
- **Missing favicon.** `BaseLayout.astro` links `/images/logo.webp` as the icon. Without
  it, every page logs a `/favicon.ico` 404 and loses Best Practices points.
- **Contrast.** Small text must reach 4.5:1. The brand red `#b5222c` is not readable on
  the midnight background, and `--color-fiesta-gold` is just short on the event red, so
  `.updates-hero .eyebrow` and `.fiesta-kicker-light` use lighter tones. Check contrast
  when putting coloured text on a coloured background.
- **Link names match visible text.** Do not put an `aria-label` on a link that has
  visible text unless it starts with that text. A duplicate image link next to a titled
  link uses `tabindex="-1" aria-hidden="true"` with `alt=""`.

To audit locally, build, serve `dist/` and run Lighthouse against it:

```bash
npm run build
npx sirv-cli dist --port 4321 &
npx lighthouse http://localhost:4321/ --chrome-flags="--headless=new" \
  --only-categories=performance,accessibility,best-practices,seo --view
```

A local server has no cache headers or compression, so ignore Lighthouse's cache and
compression notes there; production gets both from `public/.htaccess`.

---

## Safe continuation from another machine or AI session

Before making changes:

1. clone/pull current `main`
2. read this file
3. read `README.md`
4. read `docs/DEPLOYMENT.md`
5. inspect current GitHub Actions status
6. verify whether branch protection has since been enabled
7. work on `main` (no feature branches unless the owner asks)
8. run tests and build before proposing merge
9. never copy credentials from old chat history into code

If infrastructure state in this file conflicts with live GitHub, Cloudflare, or hosting state, treat the provider's current state as authoritative and update this documentation after confirming the change.

---

## Maintenance requirement

Whenever a future change affects any of these, update this file in the same change:

- deployment flow
- hosting provider
- domain/subdomain structure
- Cloudflare SSL mode
- secrets required by Actions
- Node version
- publishing model
- template registration
- branch policy
- major production incident/fix
- current canonical event facts that are explicitly documented here

The goal is that a fresh machine or fresh agent can understand the project without depending on private conversation history.
