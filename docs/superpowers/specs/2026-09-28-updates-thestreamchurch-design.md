# Updates.TheStreamChurch.org Design Specification

Date: 2026-09-28
Status: Approved design, pending implementation-plan review
Project: updates.thestreamchurch.org

## 1. Purpose

Build a dedicated updates website for The Stream Church at `https://updates.thestreamchurch.org`.

The site will publish church events, announcements, missions, testimonies, ministry updates, and similar time-sensitive content. Each publication will have its own custom landing-page presentation while still sharing a consistent site shell, publishing workflow, SEO foundation, accessibility baseline, and deployment pipeline.

The primary goals are:

- Keep church updates separate from the Bible studies site and the main church website.
- Make every update feel intentionally designed rather than like a generic blog article.
- Let trusted collaborators contribute through GitHub without requiring hosting or SSH access.
- Reuse the church's existing shared hosting, GitHub workflow, SSH deployment pattern, and Cloudflare-proxied domain setup.
- Keep the initial system fully static and operationally simple.
- Preserve a clean path to add a CMS or dynamic services later without redesigning the whole project.

## 2. Non-goals for version 1

Version 1 will not include:

- A database.
- User accounts or authentication.
- A web-based CMS.
- Server-side rendering.
- A custom backend or API.
- Dynamic comments.
- Online registrations or payments.
- Complex editorial permissions beyond GitHub repository permissions and pull-request review.

These can be added later if a real need appears.

## 3. Technical architecture

### Application stack

- Astro
- TypeScript
- Tailwind CSS
- Static site generation
- GitHub for source control and collaboration
- GitHub Actions for production deployment
- SSH for deployment to the existing shared hosting account
- Cloudflare DNS/CDN/proxy in front of the origin

### Production URL

`https://updates.thestreamchurch.org`

### Deployment model

Production deploys occur only from the protected `main` branch.

Flow:

```text
Contributor
  -> feature branch
  -> pull request
  -> review
  -> merge to main
  -> GitHub Actions
  -> Astro production build
  -> SSH deployment
  -> shared hosting document root
  -> Cloudflare
  -> updates.thestreamchurch.org
```

Collaborators need GitHub repository access only. They do not need cPanel, hosting-panel, SSH, or Cloudflare credentials.

## 4. Repository structure

The project will use a hybrid structure: shared site components plus a dedicated custom presentation folder for each update.

```text
updates.thestreamchurch.org/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── public/
│   ├── images/
│   ├── social/
│   └── favicon assets
├── src/
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── UpdateCard.astro
│   │   ├── ShareButtons.astro
│   │   └── ui/
│   ├── content/
│   │   └── updates/
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── UpdateLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── 404.astro
│   │   └── [...slug].astro
│   ├── styles/
│   │   └── global.css
│   └── updates/
│       └── fiesta-de-las-naciones-2026/
│           ├── Landing.astro
│           └── components/
├── astro.config.mjs
├── package.json
├── tsconfig.json
└── README.md
```

The exact filenames may be adjusted during implementation if Astro conventions or build behavior make a nearby structure cleaner, but the separation of shared content metadata from custom per-update presentation is a firm requirement.

## 5. Content model

Each update has structured metadata used by the homepage, SEO, sitemap, social sharing, archives, and routing.

Required fields:

```yaml
title: string
slug: string
description: string
publishDate: date
category: string
featured: boolean
draft: boolean
template: string
image: string
imageAlt: string
```

Optional event-oriented fields:

```yaml
eventDate: date
eventTime: string
endDate: date
locationName: string
address: string
guestName: string
tags: string[]
```

Content metadata does not dictate the visual layout of the landing page. It supplies canonical facts and shared site data.

A post is public only when `draft` is false and `publishDate` is not in the future.

## 6. Custom landing-page model

Each update can have a dedicated presentation implementation.

Example:

```text
src/updates/fiesta-de-las-naciones-2026/Landing.astro
```

The dynamic update route will resolve the update metadata and select its custom landing component based on the `template` field.

This gives the project two layers:

1. Shared platform layer
   - navigation
   - footer
   - SEO
   - analytics hook
   - sharing
   - routing
   - publishing rules
   - accessibility baseline
   - metadata

2. Custom editorial layer
   - hero composition
   - section order
   - color palette
   - custom imagery
   - event-specific calls to action
   - unique visual storytelling

A new update should not require forking the global site shell.

## 7. Homepage

`https://updates.thestreamchurch.org/` will be a portal for current and recent church updates.

The homepage will include:

- The Stream Church branded header.
- A concise Updates intro.
- One featured update when available.
- A responsive grid/list of recent updates.
- Category and date metadata on cards.
- A clear distinction between upcoming events and general announcements where metadata allows it.
- The Stream Church branded footer.

Version 1 does not require search, pagination, or category filtering. These can be added once the content volume justifies them.

## 8. Shared visual identity

The subdomain should feel like part of The Stream Church ecosystem even though it is deployed as a separate Astro project.

Shared identity requirements:

- Use the current The Stream Church logo asset.
- Recreate the visual language of the church's main site header and footer closely enough that users perceive continuity.
- Preserve a dark navy foundation, warm neutral backgrounds, and restrained accent colors from the church brand.
- Use clean, modern typography.
- Do not use brush-style fonts or brush/splatter decorative elements.
- Keep layouts mobile-first and spacious.
- Avoid generic blog-template styling.

Each update can introduce its own supporting palette and cultural/art-direction system while preserving the shared shell.

## 9. First update: Fiesta de las Naciones 2026

The first custom landing page will be Fiesta de las Naciones 2026.

Its exact current date, time, guest details, and final event copy will be sourced from the latest approved church event materials at implementation time so the landing page does not publish stale event information.

The design direction is based on the approved flyer language and visual identity:

- navy blue
- vivid red
- warm cream
- restrained gold accents
- Latin American cultural motifs used as controlled accents
- floral and textile-inspired details where appropriate
- no brush textures

### Landing-page sections

1. Shared church header.
2. Event hero.
3. Primary event facts.
4. Event experience section.
5. Guest section when the latest approved event material includes one.
6. Invitation/community section.
7. Location and directions.
8. Share controls.
9. Final call to action.
10. Shared church footer.

### Hero content hierarchy

The hero should prioritize:

- Fiesta de las Naciones 2026
- event date
- event time
- short unifying message
- primary directions CTA
- secondary share/invite CTA

The hero should reinterpret the flyer for the web rather than simply placing the entire flyer image at the top of the page.

### Event themes

Where supported by the latest approved event content, the landing page will highlight concepts such as:

- food
- music
- culture
- Word of God
- free admission
- free food

## 10. Routing

Public URLs should be short and human readable.

Examples:

```text
https://updates.thestreamchurch.org/fiesta-de-las-naciones-2026
https://updates.thestreamchurch.org/bautismos-2026
https://updates.thestreamchurch.org/mision-costa-rica-2026
```

The subdomain already communicates that these are updates, so URLs will not repeat `/updates/`.

All public pages must have a single canonical URL.

## 11. SEO and machine-readable metadata

Every update page will provide:

- unique `<title>`
- unique meta description
- canonical URL
- Open Graph title
- Open Graph description
- Open Graph image
- Open Graph image alt text
- Twitter/X card metadata
- sitemap inclusion
- robots directives
- structured data where appropriate

For event pages, use Schema.org `Event` JSON-LD when required fields are available.

Event structured data should include, when known:

- name
- description
- start date/time
- end date/time if available
- event status
- event attendance mode
- physical location
- image
- organizer

General announcements should use a more appropriate page/article schema rather than forcing all updates into `Event`.

## 12. Social sharing

Shared controls should support:

- WhatsApp
- Facebook
- native Web Share API on supported devices when useful
- copy link

Sharing controls must be progressively enhanced. The page remains fully usable when JavaScript is unavailable.

## 13. Accessibility

Version 1 accessibility requirements:

- semantic landmarks
- logical heading hierarchy
- keyboard-accessible navigation
- visible focus states
- sufficient text/background contrast
- descriptive image alt text
- decorative imagery hidden from assistive technology
- buttons and links with accessible names
- reduced-motion consideration for decorative animation
- no information conveyed only by color

Custom landing pages must meet the same baseline as shared pages.

## 14. Performance

The site is static-first.

Requirements:

- no client-side framework unless a component genuinely needs it
- minimize JavaScript shipped to visitors
- responsive images
- modern image formats when practical
- width/height attributes to reduce layout shift
- lazy-load below-the-fold images
- preload only genuinely critical assets
- self-host fonts when practical
- fingerprinted Astro assets
- long-lived cache policy for fingerprinted assets

## 15. Cloudflare and caching

Cloudflare remains in front of the shared-hosting origin.

The `updates` DNS record should be proxied through Cloudflare.

Recommended caching behavior:

- Astro fingerprinted assets under `/_astro/`: long-lived cache, immutable.
- Stable hand-managed images: cache with revalidation or use versioned filenames when bytes change.
- HTML: conservative cache behavior at first so editorial corrections become visible quickly after deployment.

Cloudflare Workers are not required for version 1.

## 16. Hosting and deployment

The site will be hosted on the same shared-hosting account already used for church web properties.

The `updates.thestreamchurch.org` subdomain will have its own document root.

The deployment workflow will:

1. Trigger on merge/push to `main`.
2. Install dependencies with a locked dependency file.
3. Run tests.
4. Run the Astro production build.
5. Fail without deployment if tests or build fail.
6. Connect to the shared host using GitHub Actions secrets and SSH.
7. Deploy only the built static output.
8. Avoid exposing SSH credentials to collaborators.

The workflow must not store private keys or passwords directly in repository files.

## 17. Collaboration workflow

Default contribution flow:

```text
feature/<update-name>
  -> pull request
  -> preview/review using local or CI build artifacts
  -> approval
  -> merge to main
  -> automatic production deploy
```

Recommended branch protection for `main`:

- pull request required
- at least one approval for collaborators other than the repository owner
- build/test checks required
- no direct force pushes

The repository owner can adjust these rules if the team is initially very small.

## 18. Failure handling

### Build failure

If tests or Astro build fail, production is not modified.

### SSH/deployment failure

The action should fail visibly and keep the previous production deployment intact whenever the hosting layout allows atomic or staged file replacement.

The implementation plan will define the safest deployment technique supported by the existing hosting account after its current SSH deployment pattern is inspected.

### Missing custom template

A published update whose `template` value has no registered landing component must fail the build rather than publish a broken generic page silently.

### Missing required metadata

Content schema validation must fail the build for missing required SEO/publication fields.

## 19. Testing strategy

Automated validation should cover:

- content-schema validation
- publication filtering rules
- duplicate slug detection
- template registration
- canonical URL generation
- build success

The first implementation should also include manual responsive QA at common mobile, tablet, and desktop widths.

The Fiesta de las Naciones landing page should be checked for:

- hero hierarchy
- readable date/time/location
- CTA behavior
- social sharing links
- event structured data
- image alt text
- keyboard navigation
- mobile layout
- desktop layout

## 20. Acceptance criteria for version 1

Version 1 is complete when:

- `updates.thestreamchurch.org` loads from the shared hosting account through Cloudflare.
- The homepage lists published updates.
- Fiesta de las Naciones 2026 has a custom landing page.
- Header and footer visually connect the site to The Stream Church.
- Draft/future updates do not appear publicly.
- Each update has canonical, Open Graph, and social metadata.
- Event pages can output valid Event structured data.
- Social sharing works.
- The site is responsive and keyboard accessible.
- A merge to `main` can automatically build and deploy over SSH.
- A failed test/build cannot deploy broken output.
- Collaborators can contribute through GitHub without access to hosting credentials.

## 21. Future evolution

The architecture intentionally leaves room for:

- Sanity or another CMS
- richer editorial workflows
- search
- category pages
- scheduled publication automation
- forms
- registrations
- newsletter integration
- image storage/CDN changes
- Cloudflare Workers for narrow dynamic features
- APIs
- database-backed features

These should be added only when they solve an actual operational need.

## 22. Design decisions summary

- Separate repository: yes.
- Separate subdomain: yes.
- Shared hosting: yes.
- Cloudflare proxy/CDN: yes.
- GitHub remains source of truth: yes.
- GitHub Actions plus SSH deployment: yes.
- Fully static Astro for version 1: yes.
- Custom landing page per update: yes.
- Shared header/footer/SEO foundation: yes.
- CMS at launch: no.
- Workers/Pages hosting at launch: no.
