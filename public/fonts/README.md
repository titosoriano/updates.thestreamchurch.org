# Self-hosted display webfont

The site makes **zero third-party requests**. The display typeface is vendored here and
served from our own origin. Do not replace these files with a Google Fonts (or any CDN)
`<link>`.

## What ships

| File | Purpose |
| --- | --- |
| `fraunces-display.2ba51752.woff2` | Fraunces, variable weight axis `400–900`, Latin subset. 33,448 bytes (32.7 KB). |
| `Fraunces-OFL.txt` | The upstream SIL Open Font License 1.1 text, as required for redistribution. |

`woff2` only. Every browser that meets the site's baseline supports it, so a `woff`/`ttf`
fallback would be dead weight.

The filename carries the first 8 hex characters of the file's SHA-256. `public/.htaccess`
serves `.woff2` as `immutable` for one year, which is only safe because the name changes
whenever the bytes change. **If you regenerate the font, rename the file to the new hash
and update every reference** (`src/styles/global.css`, `src/layouts/BaseLayout.astro`,
`src/styles/fonts.test.ts`, and this table).

## Typeface

- **Family:** Fraunces
- **Designers:** Phaedra Charles and Flavia Zimbardi (Undercase Type)
- **License:** SIL Open Font License, Version 1.1 — permits web embedding, modification
  (including subsetting) and redistribution inside a public repository.
- **Upstream source:** <https://github.com/undercasetype/Fraunces> /
  <https://fonts.google.com/specimen/Fraunces>
- **Obtained from:** the npm package `@fontsource-variable/fraunces@5.3.0`
  (`files/fraunces-latin-full-normal.woff2`), which republishes the Google Fonts build
  verbatim under the same OFL.

## Instance and subset

Fraunces has four variable axes. Three are pinned so the shipped file carries only the
weight axis:

| Axis | Value | Why |
| --- | --- | --- |
| `opsz` | `48` | Optical size tuned for headings, not body copy. |
| `SOFT` | `35` | Softens the terminals — warmer and more welcoming than the default `0`. |
| `WONK` | `0` | Turns off the quirky alternates; steadier for a church masthead. |
| `wght` | `400–900` (variable) | Covers the `600` / `700` / `800` headings in `global.css` in one file. |

One variable file (32.7 KB) is smaller than the two static instances it replaces
(17.2 KB + 17.2 KB = 34.4 KB over two requests) and keeps the 600/700/800 hierarchy exact
instead of collapsing it onto the nearest shipped weight.

Subset codepoints — full ASCII, all of Latin-1 (so every Spanish accent, `ñ`, `¿` and `¡`
are present, along with the accented names an international "Fiesta de las Naciones"
audience brings), plus the typographic punctuation the site sets:

```
U+0020-007E,U+00A0-00FF,U+0152-0153,U+0160-0161,U+0178,U+017D-017E,
U+2010-2015,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,
U+2039-203A,U+2044,U+20AC,U+2122,U+2212
```

`src/styles/fonts.test.ts` asserts the shipped file still covers every character the
repository's content and components actually render, so a bad subset fails CI rather than
shipping a tofu box.

Upstream Fraunces has no `U+2192` (`→`). The one arrow on the site lives in
`.text-link`, which uses `--font-sans`, so no display text depends on it.

## Regenerating

```bash
python3 -m pip install 'fonttools[woff]' brotli
npm pack @fontsource-variable/fraunces@5.3.0
tar xzf fontsource-variable-fraunces-5.3.0.tgz

python3 -m fontTools.varLib.instancer \
  package/files/fraunces-latin-full-normal.woff2 \
  opsz=48 SOFT=35 WONK=0 wght=400:900 \
  -o fraunces-instance.ttf

python3 -m fontTools.subset fraunces-instance.ttf \
  --unicodes="U+0020-007E,U+00A0-00FF,U+0152-0153,U+0160-0161,U+0178,U+017D-017E,U+2010-2015,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122,U+2212" \
  --layout-features='kern,liga,calt,ccmp,mark,mkmk,locl,rlig' \
  --no-hinting --desubroutinize \
  --flavor=woff2 --output-file=fraunces-display.woff2

mv fraunces-display.woff2 "fraunces-display.$(sha256sum fraunces-display.woff2 | cut -c1-8).woff2"
```
