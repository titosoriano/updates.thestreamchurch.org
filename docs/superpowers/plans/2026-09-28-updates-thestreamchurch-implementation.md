# Updates.TheStreamChurch.org Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a static Astro website at `https://updates.thestreamchurch.org` with a branded updates homepage, custom landing pages per post, the first Fiesta de las Naciones 2026 landing page, and automated GitHub-to-shared-hosting deployment over SSH.

**Architecture:** The project is a standalone Astro static site. Shared metadata, publishing rules, shell components, SEO, sharing, and routing live in reusable modules, while each update can register its own custom Astro landing component. GitHub is the source of truth, `main` is production, GitHub Actions builds and tests, and only the generated `dist/` output is deployed to the existing shared host over SSH behind Cloudflare.

**Tech Stack:** Astro, TypeScript, Tailwind CSS, Vitest, GitHub Actions, SSH/rsync or equivalent staged static deployment, Cloudflare DNS/CDN.

**Spec:** `docs/superpowers/specs/2026-09-28-updates-thestreamchurch-design.md`

## Global Constraints

- Production URL is exactly `https://updates.thestreamchurch.org`.
- The site is fully static in version 1. No database, authentication, CMS, custom backend, API, SSR, comments, registrations, or payments.
- GitHub remains the source of truth and production deploys occur only from `main`.
- Collaborators must not need cPanel, SSH, hosting-panel, or Cloudflare credentials.
- Each published update must support a custom landing page without forking the global site shell.
- Required metadata: `title`, `slug`, `description`, `publishDate`, `category`, `featured`, `draft`, `template`, `image`, `imageAlt`.
- Optional event metadata: `eventDate`, `eventTime`, `endDate`, `locationName`, `address`, `guestName`, `tags`.
- A post is public only when `draft === false` and `publishDate <= now`.
- A missing registered custom template for a published post must fail the build.
- Missing required publication or SEO metadata must fail the build.
- Public URLs must be short, canonical, and must not repeat `/updates/`.
- The shared shell must use The Stream Church logo and closely mirror the current church site's visual language while allowing custom per-update art direction.
- Do not use brush-style fonts, brush textures, or splatter decoration.
- The site must be mobile-first, keyboard accessible, and usable with JavaScript disabled.
- Fingerprinted `/_astro/` assets receive long-lived immutable caching; HTML starts with conservative caching.
- Cloudflare Workers and Pages are not required for version 1.
- The first landing page is Fiesta de las Naciones 2026. Latest approved event facts are: Sunday, October 4, 2026 at 1:00 PM; 11 Technology Drive North, Warren, NJ 07059; guest Chanel Novas; food, music, culture, Word of God; admission and food are free. The earlier September 27 date is stale.

## Review Focus

- **Future-dated or draft content:** it must never appear on the homepage, route generation, sitemap, or structured data until publishable. Task 2 adds unit tests for both conditions.
- **Duplicate or unsafe slugs:** duplicate slugs and malformed slugs must fail validation rather than overwrite routes or create ambiguous URLs. Task 2 adds explicit tests.
- **Template drift:** a published content entry whose `template` has no registered landing component must fail the build with a clear error. Task 4 tests this path.
- **Event date/time machine readability:** Fiesta de las Naciones must emit a valid ISO start date/time with New Jersey timezone semantics while visible copy remains human-friendly. Task 6 tests JSON-LD values.
- **Deployment interruption:** a failed build or failed upload must not erase the currently live site. Task 8 uses a staged-release/swap deployment and verifies failure behavior.

---

## File Map

### Project and configuration
- `package.json`: scripts and dependencies.
- `astro.config.mjs`: site URL, Tailwind integration, sitemap integration, static output.
- `tsconfig.json`: strict Astro TypeScript configuration.
- `vitest.config.ts`: unit-test configuration.
- `src/styles/global.css`: shared design tokens, typography, focus states, responsive utilities, motion preferences.
- `public/`: logo, favicon, event/social images, versioned static assets.

### Shared site platform
- `src/content.config.ts`: Astro content collection schema for updates.
- `src/lib/updates.ts`: publishing rules, sorting, duplicate detection helpers, canonical URL helper.
- `src/lib/templates.ts`: custom landing-template registry and lookup.
- `src/lib/seo.ts`: update/event structured-data builders.
- `src/components/Header.astro`: branded navigation linked back to the main church site.
- `src/components/Footer.astro`: branded footer linked back to the main church site.
- `src/components/UpdateCard.astro`: homepage update card.
- `src/components/ShareButtons.astro`: WhatsApp, Facebook, copy link, optional Web Share enhancement.
- `src/layouts/BaseLayout.astro`: global HTML head, canonical, Open Graph, Twitter/X metadata, shared shell.
- `src/layouts/UpdateLayout.astro`: common update-page wrapper and structured-data slot.
- `src/pages/index.astro`: updates homepage.
- `src/pages/[...slug].astro`: static update route resolved from metadata and template registry.
- `src/pages/404.astro`: branded not-found page.

### First publication
- `src/content/updates/fiesta-de-las-naciones-2026.md`: canonical metadata and event facts.
- `src/updates/fiesta-de-las-naciones-2026/Landing.astro`: custom page composition.
- `src/updates/fiesta-de-las-naciones-2026/EventFacts.astro`: event date/time/location/free-entry facts.
- `src/updates/fiesta-de-las-naciones-2026/GuestSection.astro`: Chanel Novas section.
- `src/updates/fiesta-de-las-naciones-2026/ExperienceSection.astro`: food/music/culture/Word of God section.

### Tests and operations
- `src/lib/updates.test.ts`: publication, slug, sorting, canonical tests.
- `src/lib/templates.test.ts`: template registry tests.
- `src/lib/seo.test.ts`: Event JSON-LD and general schema tests.
- `src/content/updates.contract.test.ts`: collection/content contract tests including current Fiesta facts.
- `.github/workflows/ci.yml`: test/build validation for pull requests and main.
- `.github/workflows/deploy.yml`: production deployment from main only.
- `scripts/deploy.sh`: staged remote deployment helper used by GitHub Actions.
- `README.md`: contributor and publishing workflow.
- `docs/DEPLOYMENT.md`: hosting document root, required secrets, Cloudflare behavior, rollback procedure.

---

### Task 1: Create the repository and scaffold the static Astro project

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `src/styles/global.css`
- Create: `.gitignore`
- Create: `README.md`

**Interfaces:**
- Consumes: approved design spec.
- Produces: working Astro static project with `npm run dev`, `npm test`, and `npm run build` scripts.

- [ ] **Step 1: Create a new GitHub repository named `updates.thestreamchurch.org` under the user's GitHub account and clone it into an isolated worktree.**

Expected: empty repository exists remotely and local `origin` points to it.

- [ ] **Step 2: Scaffold Astro with TypeScript strict mode and Tailwind CSS, keeping output fully static.**

Required scripts:

```json
{
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "test": "vitest run"
}
```

- [ ] **Step 3: Configure `astro.config.mjs` with `site: 'https://updates.thestreamchurch.org'` and sitemap generation.**

Expected: no SSR adapter is configured.

- [ ] **Step 4: Add shared design tokens to `src/styles/global.css`.**

Required direction: dark navy base, warm paper/cream surface, restrained gold accent, vivid red available for event-specific CTA use, clean sans/display typography, visible focus ring, `prefers-reduced-motion` support, no brush-font dependencies.

- [ ] **Step 5: Run the initial checks.**

Run:

```bash
npm test
npm run build
```

Expected: both PASS, and `dist/` is generated.

- [ ] **Step 6: Commit.**

```bash
git add .
git commit -m "chore: scaffold updates site"
```

---

### Task 2: Add the update content model and publication rules

**Files:**
- Create: `src/content.config.ts`
- Create: `src/lib/updates.ts`
- Create: `src/lib/updates.test.ts`
- Create: `src/content/updates.contract.test.ts`

**Interfaces:**
- Consumes: Astro content collections.
- Produces:
  - `isUpdatePublished(update, now) -> boolean`
  - `sortUpdatesNewestFirst(updates) -> updates`
  - `assertUniqueSlugs(updates) -> void`
  - `assertSafeSlug(slug) -> void`
  - `canonicalForSlug(slug) -> string`
  - `getPublishedUpdates(now?) -> CollectionEntry<'updates'>[]`

- [ ] **Step 1: Write failing tests for publication filtering.**

Assertions:
- `draft: true` returns false.
- `publishDate` after `now` returns false.
- `draft: false` and `publishDate <= now` returns true.

- [ ] **Step 2: Write failing tests for slug safety and uniqueness.**

Assertions:
- `fiesta-de-las-naciones-2026` is accepted.
- `Fiesta 2026`, `/fiesta`, `fiesta/2026`, and empty string are rejected.
- duplicate slugs throw a clear error naming the duplicate.

- [ ] **Step 3: Write failing tests for canonical URLs.**

Assertion:

```ts
expect(canonicalForSlug('fiesta-de-las-naciones-2026'))
  .toBe('https://updates.thestreamchurch.org/fiesta-de-las-naciones-2026');
```

- [ ] **Step 4: Implement the content schema in `src/content.config.ts`.**

Required fields and optional event fields must match the design spec exactly. `tags` defaults to `[]`; `featured` and `draft` default to `false`.

- [ ] **Step 5: Implement the pure helpers in `src/lib/updates.ts`, then the Astro collection-backed `getPublishedUpdates(now?)`.**

Keep publication logic centralized in this file. Routes and homepage must not duplicate the `draft`/date rule.

- [ ] **Step 6: Run tests.**

Run:

```bash
npm test -- src/lib/updates.test.ts src/content/updates.contract.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit.**

```bash
git add src/content.config.ts src/lib/updates.ts src/lib/updates.test.ts src/content/updates.contract.test.ts
git commit -m "feat: add update content model"
```

---

### Task 3: Build the shared The Stream Church shell

**Files:**
- Create: `src/components/Header.astro`
- Create: `src/components/Footer.astro`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/pages/404.astro`
- Add: `public/images/logo.*`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `title`, `description`, `canonical`, `image`, `imageAlt`, `type`, `robots` props in `BaseLayout.astro`.
- Produces: reusable global shell for homepage and update pages.

- [ ] **Step 1: Capture the current public The Stream Church identity from `https://thestreamchurch.org` before implementation and use the current logo asset, not a recreated logo.**

The shared navigation should link back to the main church site for: Inicio, Quiénes somos, Servicios, Ministerios, Eventos, Recursos, and Visítanos. Footer must include the church name, `11 Technology Drive North, Warren NJ 07059`, and a link back to `thestreamchurch.org`.

- [ ] **Step 2: Implement `BaseLayout.astro`.**

Required head behavior:
- canonical link
- unique title and description
- Open Graph title/description/image/image-alt/url/type
- Twitter/X summary-large-image when an image exists
- `lang="es"`
- viewport
- theme color
- slot for page-specific JSON-LD/head content

- [ ] **Step 3: Implement keyboard-accessible desktop/mobile navigation and footer.**

Acceptance checks:
- visible focus states
- mobile toggle exposes `aria-expanded`
- Escape closes the mobile menu
- all external main-site links are valid absolute URLs

- [ ] **Step 4: Implement branded 404 page using `BaseLayout`.**

CTA links to the updates homepage and main church website.

- [ ] **Step 5: Run build.**

Run: `npm run build`

Expected: PASS with no client framework required for shell rendering.

- [ ] **Step 6: Commit.**

```bash
git add src/components/Header.astro src/components/Footer.astro src/layouts/BaseLayout.astro src/pages/404.astro src/styles/global.css public/images
git commit -m "feat: add church site shell"
```

---

### Task 4: Add the custom-template registry and update route

**Files:**
- Create: `src/lib/templates.ts`
- Create: `src/lib/templates.test.ts`
- Create: `src/layouts/UpdateLayout.astro`
- Create: `src/pages/[...slug].astro`

**Interfaces:**
- Consumes: published update entries from `getPublishedUpdates()`.
- Produces:
  - `templateRegistry: Record<string, AstroComponentFactory>`
  - `getTemplateComponent(template: string) -> AstroComponentFactory`
  - static route generation for each published update.

- [ ] **Step 1: Write a failing test that unknown templates throw.**

Assertion: `getTemplateComponent('missing-template')` throws an error containing `missing-template`.

- [ ] **Step 2: Implement `src/lib/templates.ts` with an explicit registry.**

Initial registered key: `fiesta-de-las-naciones-2026`.

- [ ] **Step 3: Implement `UpdateLayout.astro` as a thin wrapper over `BaseLayout`.**

It receives the update entry, computes canonical/social metadata, and exposes slots for custom content and page-specific JSON-LD.

- [ ] **Step 4: Implement `src/pages/[...slug].astro` using `getStaticPaths()`.**

Requirements:
- only published updates produce routes
- route slug comes from content metadata
- template lookup happens during build
- unknown template fails the build
- no generic fallback landing page is silently substituted

- [ ] **Step 5: Run focused tests and build.**

Run:

```bash
npm test -- src/lib/templates.test.ts src/lib/updates.test.ts
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit.**

```bash
git add src/lib/templates.ts src/lib/templates.test.ts src/layouts/UpdateLayout.astro 'src/pages/[...slug].astro'
git commit -m "feat: add custom update routing"
```

---

### Task 5: Build the updates homepage

**Files:**
- Create: `src/components/UpdateCard.astro`
- Create: `src/pages/index.astro`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `getPublishedUpdates()` and each entry's shared metadata.
- Produces: featured update section plus recent updates grid.

- [ ] **Step 1: Implement `UpdateCard.astro`.**

Required visible fields: title, description, category, publish date, image with descriptive alt, and link to canonical slug.

- [ ] **Step 2: Implement homepage selection logic.**

Rules:
- newest published `featured: true` item becomes featured
- remaining published updates appear newest first
- drafts/future items are absent because the page consumes only `getPublishedUpdates()`

- [ ] **Step 3: Implement homepage visual design.**

Requirements:
- shared church shell
- concise `Updates` intro
- editorial, non-generic layout
- clear featured area
- responsive recent-updates grid
- category/date metadata
- visual distinction for entries with future `eventDate` relative to page build time, labeled as upcoming without changing publication eligibility

- [ ] **Step 4: Run build and inspect generated homepage HTML.**

Run:

```bash
npm run build
grep -R "Fiesta de las Naciones" dist/index.html
```

Expected after Task 6 content exists: published Fiesta entry is discoverable; before Task 6, build still succeeds with empty-state copy.

- [ ] **Step 5: Commit.**

```bash
git add src/components/UpdateCard.astro src/pages/index.astro src/styles/global.css
git commit -m "feat: add updates homepage"
```

---

### Task 6: Add Fiesta de las Naciones 2026 content, Event schema, and custom landing page

**Files:**
- Create: `src/content/updates/fiesta-de-las-naciones-2026.md`
- Create: `src/lib/seo.ts`
- Create: `src/lib/seo.test.ts`
- Create: `src/updates/fiesta-de-las-naciones-2026/Landing.astro`
- Create: `src/updates/fiesta-de-las-naciones-2026/EventFacts.astro`
- Create: `src/updates/fiesta-de-las-naciones-2026/GuestSection.astro`
- Create: `src/updates/fiesta-de-las-naciones-2026/ExperienceSection.astro`
- Add: event images under `public/images/fiesta-de-las-naciones-2026/`
- Modify: `src/lib/templates.ts`

**Interfaces:**
- Consumes: `UpdateLayout`, content metadata, shared shell.
- Produces:
  - `buildEventJsonLd(update, canonicalUrl) -> object`
  - registered `fiesta-de-las-naciones-2026` landing component.

- [ ] **Step 1: Write the Fiesta content-contract test before creating the entry.**

Assertions must pin these current facts:
- title: `Fiesta de las Naciones 2026`
- slug: `fiesta-de-las-naciones-2026`
- event date: `2026-10-04`
- event time: `1:00 PM`
- address: `11 Technology Drive North, Warren, NJ 07059`
- guest: `Chanel Novas`
- copy includes food, music, culture, and Word of God
- copy communicates free admission and free food
- no visible content uses the stale September 27 date

- [ ] **Step 2: Create the content entry with `template: fiesta-de-las-naciones-2026`.**

Use a publication date at or before the intended production launch and `draft: false` only when ready to ship.

- [ ] **Step 3: Write failing Event JSON-LD tests in `src/lib/seo.test.ts`.**

Assertions:
- `@type === 'Event'`
- `name === 'Fiesta de las Naciones 2026'`
- `startDate === '2026-10-04T13:00:00-04:00'`
- `eventStatus === 'https://schema.org/EventScheduled'`
- `eventAttendanceMode === 'https://schema.org/OfflineEventAttendanceMode'`
- physical address contains `11 Technology Drive North`, `Warren`, `NJ`, `07059`
- organizer identifies The Stream Church / Mission Baptist Church
- canonical URL matches the update URL

- [ ] **Step 4: Implement `buildEventJsonLd()` and general non-event schema helper in `src/lib/seo.ts`.**

Do not emit `Event` for an update missing the event-specific required fields.

- [ ] **Step 5: Build the custom landing components.**

Visual requirements:
- navy, vivid red, warm cream, restrained gold
- Latin American cultural accents and floral/textile-inspired details used sparingly
- no brush textures or brush typography
- hero with title, Sunday October 4, 2026, 1:00 PM, short unifying message, `Cómo llegar` CTA, `Invita a alguien` CTA
- clear free admission and free food message
- experience section: Comida, Música, Cultura, Palabra de Dios
- Chanel Novas guest section using approved image
- location/directions section for 11 Technology Drive North, Warren, NJ 07059
- responsive mobile-first layout
- decorative assets hidden from assistive technology

- [ ] **Step 6: Register the landing component in `src/lib/templates.ts`.**

Key must exactly equal `fiesta-de-las-naciones-2026`.

- [ ] **Step 7: Run tests and build.**

Run:

```bash
npm test
npm run build
```

Expected: PASS, with generated `dist/fiesta-de-las-naciones-2026/index.html` containing the October 4 event facts and JSON-LD.

- [ ] **Step 8: Commit.**

```bash
git add src/content/updates src/lib/seo.ts src/lib/seo.test.ts src/lib/templates.ts src/updates public/images/fiesta-de-las-naciones-2026
git commit -m "feat: add Fiesta de las Naciones landing page"
```

---

### Task 7: Add social sharing and final metadata polish

**Files:**
- Create: `src/components/ShareButtons.astro`
- Modify: `src/layouts/UpdateLayout.astro`
- Modify: `src/updates/fiesta-de-las-naciones-2026/Landing.astro`
- Modify: `src/layouts/BaseLayout.astro`

**Interfaces:**
- Consumes: canonical URL, title, description.
- Produces: no-JS WhatsApp/Facebook links plus optional JS-enhanced copy/native-share controls.

- [ ] **Step 1: Implement server-rendered WhatsApp and Facebook share URLs.**

They must work without JavaScript and use the canonical update URL.

- [ ] **Step 2: Add copy-link and native Web Share progressive enhancement.**

Requirements:
- copy button only appears/enables when the required browser API is available
- native share only runs after explicit user action
- failure leaves the ordinary share links usable

- [ ] **Step 3: Verify metadata in generated HTML.**

Run:

```bash
npm run build
grep -n "canonical\|og:title\|og:image\|twitter:card" dist/fiesta-de-las-naciones-2026/index.html
```

Expected: one canonical URL and complete social metadata for the Fiesta page.

- [ ] **Step 4: Commit.**

```bash
git add src/components/ShareButtons.astro src/layouts/UpdateLayout.astro src/layouts/BaseLayout.astro src/updates/fiesta-de-las-naciones-2026/Landing.astro
git commit -m "feat: add update sharing and social metadata"
```

---

### Task 8: Add CI and safe SSH deployment to shared hosting

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/deploy.yml`
- Create: `scripts/deploy.sh`
- Create: `docs/DEPLOYMENT.md`

**Interfaces:**
- Consumes: repository code, GitHub Actions secrets, existing shared-host SSH account and subdomain document root.
- Produces: validated automatic production deploy from `main` only.

- [ ] **Step 1: Inspect the current `estudios.thestreamchurch.org` deployment workflow and hosting layout before writing deployment code.**

Reuse the working SSH host, port, authentication method, known-host verification pattern, and any safe release strategy that already exists. Do not copy secrets into repository files.

- [ ] **Step 2: Implement `.github/workflows/ci.yml`.**

Triggers: pull requests and pushes to `main`.

Required steps:

```text
checkout
setup Node
npm ci
npm test
npm run build
```

- [ ] **Step 3: Implement `scripts/deploy.sh` using staged deployment.**

Required behavior:
- upload `dist/` into a new remote release directory
- do not delete the current live document root before upload succeeds
- switch the live path only after upload completes successfully using the safest mechanism supported by the host
- retain at least the previous release when practical for rollback
- nonzero exit on any SSH/transfer/swap failure

- [ ] **Step 4: Implement `.github/workflows/deploy.yml`.**

Trigger: push to `main` only.

Required order:

```text
checkout
setup Node
npm ci
npm test
npm run build
configure SSH key + known_hosts
run scripts/deploy.sh
```

The workflow must use GitHub Actions secrets for SSH private key, host, user, port, and remote document-root/release path.

- [ ] **Step 5: Document exact required GitHub secrets and hosting prerequisites in `docs/DEPLOYMENT.md`.**

Document Cloudflare requirement: `updates` DNS record proxied through Cloudflare; start with conservative HTML caching and long cache for fingerprinted `/_astro/` assets.

- [ ] **Step 6: Test the failure path before production cutover.**

Deliberately run the deploy script against a temporary non-production remote path, then force an upload failure and verify the existing target remains intact.

Expected: failed deployment exits nonzero and leaves previous release untouched.

- [ ] **Step 7: Commit.**

```bash
git add .github/workflows scripts/deploy.sh docs/DEPLOYMENT.md
git commit -m "ci: add safe shared-host deployment"
```

---

### Task 9: Configure repository protection and perform production launch QA

**Files:**
- Modify: `README.md`
- Modify: `docs/DEPLOYMENT.md` if launch findings require clarification.

**Interfaces:**
- Consumes: completed GitHub repository, CI/deploy workflows, hosting document root, Cloudflare DNS.
- Produces: protected collaboration workflow and live version 1 site.

- [ ] **Step 1: Update `README.md` with contributor workflow.**

Include:
- install/dev/test/build commands
- content metadata fields
- how to add a new custom landing template
- branch naming example `feature/<update-name>`
- pull-request workflow
- rule that only `main` deploys production

- [ ] **Step 2: Configure `main` branch protection.**

Required for collaborators:
- pull request required
- at least one approval for non-owner collaborator changes
- CI check required
- force pushes disabled

- [ ] **Step 3: Configure `updates.thestreamchurch.org` on the shared host and Cloudflare.**

Expected:
- dedicated document root
- DNS record resolves to origin as appropriate for the host
- Cloudflare proxy enabled
- valid HTTPS

- [ ] **Step 4: Add GitHub Actions deployment secrets and perform the first production deployment.**

Expected: deployment completes from `main` with no credential exposure in logs.

- [ ] **Step 5: Run production acceptance QA.**

Verify:
- homepage loads at `https://updates.thestreamchurch.org`
- Fiesta page loads at `/fiesta-de-las-naciones-2026`
- October 4, 2026 at 1:00 PM is clearly visible
- no stale September 27 date appears
- Chanel Novas section appears
- free admission and free food are visible
- address is correct and directions link works
- WhatsApp/Facebook sharing works without JS
- copy/native sharing works with JS where supported
- canonical/OG/Twitter metadata is correct
- Event JSON-LD is present and machine-readable
- keyboard navigation works
- visible focus states exist
- mobile menu works
- reduced-motion preference is respected
- phone layout at 375px/390px is readable
- tablet layout around 768px is readable
- desktop layout at 1280px+ is balanced
- draft and future test entries do not render publicly
- unknown-template test entry fails CI/build rather than publishing

- [ ] **Step 6: Run final local verification.**

Run:

```bash
npm test
npm run build
git status --short
```

Expected: tests PASS, build PASS, working tree clean.

- [ ] **Step 7: Commit any final documentation-only corrections.**

```bash
git add README.md docs/DEPLOYMENT.md
git commit -m "docs: finalize updates publishing workflow"
```

- [ ] **Step 8: Push `main` and verify the production deployment workflow is green.**

Expected: live site remains available through Cloudflare and GitHub Actions reports a successful deployment.
