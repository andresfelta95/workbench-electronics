/**
 * Regenerates tools/glyph-coverage.json: which code points each family in
 * `--pix-font` can draw *as Google Fonts serves it*.
 *
 *   node tools/glyph-coverage-gen.mjs
 *
 * Needs network; tools/check-glyphs.mjs does not (it reads the committed JSON).
 * Run it again when src/index.html changes the font request, or to pick up a
 * new upstream version of a family.
 *
 * Method (DESIGN-PIXEL-ART.md §Glyph coverage): request the same CSS2 URL as
 * src/index.html with a desktop Chrome user agent, so Google answers with the
 * per-script woff2 slices and their `unicode-range`s, exactly what a browser
 * gets. Download every slice, read its `cmap`, and count a code point only if
 * it is in the slice's `unicode-range` **and** mapped to a glyph in that
 * slice's `cmap`. A family's coverage is the union over its slices.
 *
 * No dependencies: WOFF2 is unpacked with node:zlib's Brotli, and the `cmap`
 * table (never transformed by WOFF2) is parsed by hand (formats 4 and 12).
 */
import { writeFile } from 'node:fs/promises';
import { brotliDecompressSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'tools', 'glyph-coverage.json');

/** The `--pix-font` families, at the weight the skin uses. */
const FAMILIES = ['VT323', 'JetBrains Mono', 'Iosevka Charon Mono'];
const CSS_URL =
  'https://fonts.googleapis.com/css2?' +
  FAMILIES.map((f) => `family=${f.replace(/ /g, '+')}`).join('&') +
  '&display=swap';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';

/* CSS -------------------------------------------------------------------- */

function parseCss(css) {
  const faces = [];
  // Google precedes each @font-face with a /* subset */ comment.
  const re = /\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g;
  let m;
  while ((m = re.exec(css)) !== null) {
    const body = m[2];
    const family = /font-family:\s*'([^']+)'/.exec(body)?.[1];
    const weight = /font-weight:\s*(\d+)/.exec(body)?.[1];
    const url = /src:\s*url\(([^)]+)\)\s*format\('woff2'\)/.exec(body)?.[1];
    const range = /unicode-range:\s*([^;]+);/.exec(body)?.[1];
    if (!family || !url || !range) throw new Error(`unparsed @font-face: ${body}`);
    faces.push({
      family,
      weight: Number(weight ?? 400),
      subset: m[1],
      url,
      ranges: parseRange(range),
    });
  }
  if (!faces.length) throw new Error('no @font-face blocks in the CSS2 response');
  return faces;
}

function parseRange(text) {
  return text.split(',').map((part) => {
    const t = part.trim().replace(/^U\+/i, '');
    if (t.includes('?')) {
      return [parseInt(t.replace(/\?/g, '0'), 16), parseInt(t.replace(/\?/g, 'F'), 16)];
    }
    const [a, b] = t.split('-');
    return [parseInt(a, 16), parseInt(b ?? a, 16)];
  });
}

/* WOFF2 ------------------------------------------------------------------ */

// WOFF2 §5.1 known table tags, by index.
const KNOWN_TAGS = (
  'cmap head hhea hmtx maxp name OS/2 post cvt  fpgm glyf loca prep CFF  VORG EBDT EBLC gasp ' +
  'hdmx kern LTSH PCLT VDMX vhea vmtx BASE GDEF GPOS GSUB EBSC JSTF MATH CBDT CBLC COLR CPAL ' +
  'SVG  sbix acnt avar bdat bloc bsln cvar fdsc feat fmtx fvar gvar hsty just lcar mort morx ' +
  'opbd prop trak Zapf Silf Glat Gloc Feat Sill'
)
  .match(/.{4}\s?/g)
  .map((s) => s.slice(0, 4));
if (KNOWN_TAGS.length !== 63 || KNOWN_TAGS[10] !== 'glyf')
  throw new Error('KNOWN_TAGS table is wrong');

function readBase128(buf, pos) {
  let value = 0;
  for (let i = 0; i < 5; i++) {
    const byte = buf[pos.at++];
    value = value * 128 + (byte & 0x7f);
    if (!(byte & 0x80)) return value;
  }
  throw new Error('bad UIntBase128');
}

/** Returns the raw `cmap` table of a WOFF2 file. */
function woff2Cmap(buf) {
  if (buf.toString('latin1', 0, 4) !== 'wOF2') throw new Error('not a WOFF2 file');
  if (buf.toString('latin1', 4, 8) === 'ttcf')
    throw new Error('font collections are not supported');
  const numTables = buf.readUInt16BE(12);
  const pos = { at: 48 };
  const tables = [];
  for (let i = 0; i < numTables; i++) {
    const flags = buf[pos.at++];
    let tag;
    if ((flags & 0x3f) === 0x3f) {
      tag = buf.toString('latin1', pos.at, pos.at + 4);
      pos.at += 4;
    } else {
      tag = KNOWN_TAGS[flags & 0x3f].trimEnd().padEnd(4);
    }
    const version = (flags >> 6) & 3;
    const origLength = readBase128(buf, pos);
    const transformed = tag === 'glyf' || tag === 'loca' ? version === 0 : version !== 0;
    const length = transformed ? readBase128(buf, pos) : origLength;
    tables.push({ tag, length, transformed });
  }
  const compressedLength = buf.readUInt32BE(20);
  const data = brotliDecompressSync(buf.subarray(pos.at, pos.at + compressedLength));
  let offset = 0;
  for (const t of tables) {
    if (t.tag === 'cmap') {
      if (t.transformed) throw new Error('transformed cmap');
      return data.subarray(offset, offset + t.length);
    }
    offset += t.length;
  }
  throw new Error('no cmap table');
}

/* cmap ------------------------------------------------------------------- */

/** Every code point the cmap maps to a real glyph (not .notdef). */
function cmapCodePoints(cmap) {
  const n = cmap.readUInt16BE(2);
  const subtables = [];
  for (let i = 0; i < n; i++) {
    const platform = cmap.readUInt16BE(4 + i * 8);
    const encoding = cmap.readUInt16BE(6 + i * 8);
    const offset = cmap.readUInt32BE(8 + i * 8);
    subtables.push({ platform, encoding, offset, format: cmap.readUInt16BE(offset) });
  }
  const unicode = (s) =>
    s.platform === 0 || (s.platform === 3 && (s.encoding === 1 || s.encoding === 10));
  const pick =
    subtables.find((s) => unicode(s) && s.format === 12) ??
    subtables.find((s) => unicode(s) && s.format === 4);
  if (!pick) throw new Error('no Unicode cmap subtable (format 4 or 12)');

  const points = new Set();
  const o = pick.offset;
  if (pick.format === 12) {
    const groups = cmap.readUInt32BE(o + 12);
    for (let g = 0; g < groups; g++) {
      const base = o + 16 + g * 12;
      const start = cmap.readUInt32BE(base);
      const end = cmap.readUInt32BE(base + 4);
      const glyph = cmap.readUInt32BE(base + 8);
      for (let c = start; c <= end; c++) if (glyph + (c - start) !== 0) points.add(c);
    }
  } else {
    const segX2 = cmap.readUInt16BE(o + 6);
    const ends = o + 14;
    const starts = ends + segX2 + 2;
    const deltas = starts + segX2;
    const rangeOffsets = deltas + segX2;
    for (let s = 0; s < segX2 / 2; s++) {
      const end = cmap.readUInt16BE(ends + s * 2);
      const start = cmap.readUInt16BE(starts + s * 2);
      const delta = cmap.readInt16BE(deltas + s * 2);
      const roAt = rangeOffsets + s * 2;
      const ro = cmap.readUInt16BE(roAt);
      for (let c = start; c <= end && c !== 0xffff; c++) {
        let glyph;
        if (ro === 0) {
          glyph = (c + delta) & 0xffff;
        } else {
          const g = cmap.readUInt16BE(roAt + ro + (c - start) * 2);
          glyph = g === 0 ? 0 : (g + delta) & 0xffff;
        }
        if (glyph !== 0) points.add(c);
      }
    }
  }
  return points;
}

/* Output ----------------------------------------------------------------- */

function toRanges(points) {
  const sorted = [...points].sort((a, b) => a - b);
  const ranges = [];
  for (const c of sorted) {
    const last = ranges[ranges.length - 1];
    if (last && c === last[1] + 1) last[1] = c;
    else ranges.push([c, c]);
  }
  return ranges;
}

const hex = (c) => c.toString(16).toUpperCase().padStart(4, '0');
const rangeText = (ranges) =>
  ranges.map(([a, b]) => (a === b ? hex(a) : `${hex(a)}-${hex(b)}`)).join(',');

async function fetchOk(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res;
}

async function main() {
  const css = await (await fetchOk(CSS_URL, { headers: { 'user-agent': UA } })).text();
  const faces = parseCss(css);
  const families = {};
  for (const name of FAMILIES) {
    const slices = faces.filter((f) => f.family === name && f.weight === 400);
    if (!slices.length) throw new Error(`no weight-400 slices for ${name}`);
    const union = new Set();
    const out = [];
    for (const slice of slices) {
      const buf = Buffer.from(await (await fetchOk(slice.url)).arrayBuffer());
      const inCmap = cmapCodePoints(woff2Cmap(buf));
      const served = new Set();
      for (const [a, b] of slice.ranges) {
        for (let c = a; c <= b; c++) if (inCmap.has(c)) served.add(c);
      }
      for (const c of served) union.add(c);
      out.push({ subset: slice.subset, url: slice.url, bytes: buf.length, glyphs: served.size });
    }
    // The URL path carries the family's version on Google Fonts (…/v17/…).
    const version = /\/s\/[^/]+\/(v\d+)\//.exec(slices[0].url)?.[1] ?? 'unknown';
    families[name] = { version, slices: out, coverage: rangeText(toRanges(union)) };
    console.log(`${name} ${version}: ${union.size} code points in ${slices.length} slices`);
  }
  const data = {
    $comment:
      'GENERATED by tools/glyph-coverage-gen.mjs; read by tools/check-glyphs.mjs. ' +
      "coverage = code points in a served slice's unicode-range AND its cmap, as hex ranges.",
    source: CSS_URL,
    userAgent: UA,
    generated: new Date().toISOString().slice(0, 10),
    families,
  };
  await writeFile(OUT, JSON.stringify(data, null, 2) + '\n');
  console.log(`wrote ${path.relative(ROOT, OUT)}`);
}

main().catch((err) => {
  console.error(`glyph-coverage-gen failed: ${err.message}`);
  process.exit(1);
});
