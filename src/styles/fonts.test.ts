import { readdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

/**
 * The display webfont is self-hosted, content-hashed and subset by hand. Each of
 * those is easy to break silently, so each is asserted here:
 *
 *  - the site must keep making zero third-party requests;
 *  - the filename, the @font-face, the preload and the cache header must agree,
 *    because public/.htaccess marks .woff2 immutable for a year;
 *  - the subset must still cover every character the site actually renders, or a
 *    Spanish accent turns into a tofu box in production.
 */

const css = readFileSync('src/styles/global.css', 'utf8');
const layout = readFileSync('src/layouts/BaseLayout.astro', 'utf8');
const htaccess = readFileSync('public/.htaccess', 'utf8');

const fontFiles = readdirSync('public/fonts').filter((name) => name.endsWith('.woff2'));

describe('display webfont', () => {
  it('ships exactly one self-hosted woff2 and no other font format', () => {
    expect(fontFiles).toHaveLength(1);
    const everything = readdirSync('public/fonts');
    expect(everything.filter((n) => /\.(woff|ttf|otf|eot)$/.test(n))).toEqual([]);
  });

  it('names the file after its own content hash', () => {
    const [name] = fontFiles;
    const declared = /^fraunces-display\.([0-9a-f]{8})\.woff2$/.exec(name);
    expect(declared, `unexpected font filename: ${name}`).not.toBeNull();
    const actual = createHash('sha256')
      .update(readFileSync(`public/fonts/${name}`))
      .digest('hex')
      .slice(0, 8);
    expect(declared?.[1]).toBe(actual);
  });

  it('is referenced by the same path from the stylesheet and the preload', () => {
    const href = `/fonts/${fontFiles[0]}`;
    expect(css).toContain(`url("${href}") format("woff2")`);
    expect(layout).toContain(`href="${href}"`);
  });

  it('preloads the face as a CORS font request', () => {
    const preload = /<link\s+rel="preload"[\s\S]*?\/>/.exec(layout)?.[0] ?? '';
    expect(preload).toContain('as="font"');
    expect(preload).toContain('type="font/woff2"');
    expect(preload).toContain('crossorigin');
  });

  it('swaps rather than hiding text while the face loads', () => {
    expect(css).toMatch(/font-family:\s*"Fraunces";[\s\S]*?font-display:\s*swap;/);
  });

  it('keeps Georgia in the fallback stack behind metric-matched stand-ins', () => {
    const token = /--font-display:([\s\S]*?);/.exec(css)?.[1].replace(/\s+/g, ' ').trim();
    expect(token).toBeTruthy();
    expect(token).toMatch(/^"Fraunces", "Fraunces Fallback Georgia", "Fraunces Fallback Times", Georgia,/);
    expect(token).toMatch(/serif$/);
  });

  it('overrides fallback metrics so the swap cannot shift the layout', () => {
    for (const family of ['Fraunces Fallback Georgia', 'Fraunces Fallback Times']) {
      const face = new RegExp(`font-family: "${family}";[\\s\\S]*?\\}`).exec(css)?.[0] ?? '';
      expect(face, `${family} @font-face missing`).toContain('size-adjust:');
      expect(face).toContain('ascent-override:');
      expect(face).toContain('descent-override:');
      expect(face).toContain('line-gap-override:');
      // A metric stand-in must resolve locally; a URL would be a second download.
      expect(face).not.toContain('url(');
    }
  });

  it('never reaches a third-party font host', () => {
    for (const source of [css, layout]) {
      expect(source).not.toMatch(/fonts\.googleapis\.com|fonts\.gstatic\.com|use\.typekit|cdn\.jsdelivr|unpkg\.com/);
    }
  });

  it('serves fonts as immutable with a known media type', () => {
    expect(htaccess).toContain('AddType font/woff2 .woff2');
    expect(htaccess).toMatch(/<FilesMatch "\\\.woff2\$">[\s\S]*?immutable/);
  });
});

describe('display webfont subset coverage', () => {
  /** Every codepoint in the shipped font, read straight out of its cmap. */
  const covered = readFontCoverage(`public/fonts/${fontFiles[0]}`);

  it('reads a real coverage set, not an empty or everything set', () => {
    // Guards the reader itself: 'a' is in the subset, CJK and the arrow are not.
    expect(covered.has(0x61)).toBe(true);
    expect(covered.has(0x4e00)).toBe(false);
    expect(covered.has(0x2192)).toBe(false);
    expect(covered.size).toBeGreaterThan(180);
    expect(covered.size).toBeLessThan(400);
  });

  it('covers the Spanish letters and marks the site is written in', () => {
    const spanish = 'áéíóúüñÁÉÍÓÚÜÑ¿¡';
    expect([...spanish].filter((c) => !covered.has(c.codePointAt(0)!))).toEqual([]);
  });

  it('covers every character the repository renders in display type', () => {
    const text = collectRenderedText();
    const missing = [...new Set(text)]
      .filter((c) => c.codePointAt(0)! > 0x20)
      .filter((c) => !covered.has(c.codePointAt(0)!))
      // Upstream Fraunces has no arrow; the only one on the site is in
      // .text-link, which renders in --font-sans.
      .filter((c) => c !== '→');
    expect(missing).toEqual([]);
  });
});

/**
 * Minimal woff2 cmap reader. Decompressing woff2 needs Brotli, which Node ships,
 * but the woff2 table directory is a custom format, so this walks it directly
 * rather than pulling in a font library for one assertion.
 */
function readFontCoverage(path: string): Set<number> {
  const { brotliDecompressSync } = require('node:zlib') as typeof import('node:zlib');
  const woff2 = readFileSync(path);
  expect(woff2.subarray(0, 4).toString('latin1')).toBe('wOF2');

  const KNOWN_TAGS = [
    'cmap', 'head', 'hhea', 'hmtx', 'maxp', 'name', 'OS/2', 'post', 'cvt ', 'fpgm',
    'glyf', 'loca', 'prep', 'CFF ', 'VORG', 'EBDT', 'EBLC', 'gasp', 'hdmx', 'kern',
    'LTSH', 'PCLT', 'VDMX', 'vhea', 'vmtx', 'BASE', 'GDEF', 'GPOS', 'GSUB', 'EBSC',
    'JSTF', 'MATH', 'CBDT', 'CBLC', 'COLR', 'CPAL', 'SVG ', 'sbix', 'acnt', 'avar',
    'bdat', 'bloc', 'bsln', 'cvar', 'fdsc', 'feat', 'fmtx', 'fvar', 'gvar', 'hsty',
    'just', 'lcar', 'mort', 'morx', 'opbd', 'prop', 'trak', 'Zapf', 'Silf', 'Glat',
    'Gloc', 'Feat', 'Sill',
  ];

  let p = 48;
  const numTables = woff2.readUInt16BE(12);
  const entries: { tag: string; length: number }[] = [];
  for (let i = 0; i < numTables; i += 1) {
    const flags = woff2.readUInt8(p);
    p += 1;
    let tag: string;
    if ((flags & 0x3f) === 0x3f) {
      tag = woff2.subarray(p, p + 4).toString('latin1');
      p += 4;
    } else {
      tag = KNOWN_TAGS[flags & 0x3f];
    }
    const [origLength, afterLength] = readUIntBase128(woff2, p);
    p = afterLength;
    // A transformLength follows only when the table is actually transformed:
    // null transform is version 3 for glyf/loca and version 0 for everything else.
    let length = origLength;
    const transform = (flags >> 6) & 0x03;
    const transformed = tag === 'glyf' || tag === 'loca' ? transform !== 3 : transform !== 0;
    if (transformed) [length, p] = readUIntBase128(woff2, p);
    entries.push({ tag, length });
  }

  const sfnt = brotliDecompressSync(woff2.subarray(p, p + woff2.readUInt32BE(20)));
  let offset = 0;
  let cmap: Buffer | undefined;
  for (const entry of entries) {
    if (entry.tag === 'cmap') cmap = sfnt.subarray(offset, offset + entry.length);
    // Tables sit back to back in the decompressed stream, with no padding.
    offset += entry.length;
  }
  expect(cmap, 'cmap table not found in woff2').toBeTruthy();
  return readCmap(cmap!);
}

function readUIntBase128(buf: Buffer, start: number): [number, number] {
  let value = 0;
  let p = start;
  for (let i = 0; i < 5; i += 1) {
    const byte = buf.readUInt8(p);
    p += 1;
    value = value * 128 + (byte & 0x7f);
    if ((byte & 0x80) === 0) return [value, p];
  }
  throw new Error('malformed UIntBase128');
}

function readCmap(cmap: Buffer): Set<number> {
  const codepoints = new Set<number>();
  const numTables = cmap.readUInt16BE(2);
  for (let i = 0; i < numTables; i += 1) {
    const record = 4 + i * 8;
    const subtable = cmap.readUInt32BE(record + 4);
    if (cmap.readUInt16BE(subtable) !== 4) continue;
    const segX2 = cmap.readUInt16BE(subtable + 6);
    const endBase = subtable + 14;
    const startBase = endBase + segX2 + 2;
    const deltaBase = startBase + segX2;
    const rangeBase = deltaBase + segX2;
    for (let s = 0; s < segX2 / 2; s += 1) {
      const end = cmap.readUInt16BE(endBase + s * 2);
      const start = cmap.readUInt16BE(startBase + s * 2);
      const delta = cmap.readInt16BE(deltaBase + s * 2);
      const rangeOffset = cmap.readUInt16BE(rangeBase + s * 2);
      if (start === 0xffff) continue;
      for (let c = start; c <= end; c += 1) {
        let glyph: number;
        if (rangeOffset === 0) {
          glyph = (c + delta) & 0xffff;
        } else {
          const at = rangeBase + s * 2 + rangeOffset + (c - start) * 2;
          if (at + 1 >= cmap.length) continue;
          glyph = cmap.readUInt16BE(at);
          if (glyph !== 0) glyph = (glyph + delta) & 0xffff;
        }
        if (glyph !== 0) codepoints.add(c);
      }
    }
  }
  return codepoints;
}

/** Author-visible strings: update copy, component markup and CSS content values. */
function collectRenderedText(): string {
  const { globSync } = require('node:fs') as typeof import('node:fs');
  const files = [
    ...globSync('src/content/updates/*.md'),
    ...globSync('src/**/*.astro'),
    'src/styles/global.css',
  ];
  return files.map((file) => readFileSync(file, 'utf8')).join('');
}
