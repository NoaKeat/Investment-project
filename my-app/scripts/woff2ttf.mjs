// ממיר WOFF1 → TTF באמצעות zlib המובנה של Node (ללא תלות חיצונית).
// WOFF1 = טבלאות sfnt דחוסות ב-zlib. מפענחים ובונים מחדש קובץ sfnt/TTF תקין.
import { readFileSync, writeFileSync } from 'fs';
import zlib from 'zlib';

function woffToTtf(buf) {
  if (buf.toString('latin1', 0, 4) !== 'wOFF') throw new Error('not a WOFF1 file');
  const flavor    = buf.readUInt32BE(4);
  const numTables = buf.readUInt16BE(12);

  // table directory @44
  let p = 44;
  const tables = [];
  for (let i = 0; i < numTables; i++) {
    const tag        = buf.toString('latin1', p, p + 4);
    const offset     = buf.readUInt32BE(p + 4);
    const compLength = buf.readUInt32BE(p + 8);
    const origLength = buf.readUInt32BE(p + 12);
    const checksum   = buf.readUInt32BE(p + 16);
    p += 20;
    let data = buf.subarray(offset, offset + compLength);
    if (compLength !== origLength) data = zlib.inflateSync(data); // דחוס
    tables.push({ tag, checksum, origLength, data });
  }

  tables.sort((a, b) => (a.tag < b.tag ? -1 : a.tag > b.tag ? 1 : 0));
  const n = tables.length;
  let maxPow = 1, exp = 0;
  while (maxPow * 2 <= n) { maxPow *= 2; exp++; }
  const searchRange = maxPow * 16, entrySelector = exp, rangeShift = n * 16 - searchRange;

  const headerSize = 12 + n * 16;
  let off = headerSize;
  const offsets = tables.map((t) => { const o = off; off += t.data.length; off = (off + 3) & ~3; return o; });

  const out = Buffer.alloc(off);
  out.writeUInt32BE(flavor, 0);
  out.writeUInt16BE(n, 4);
  out.writeUInt16BE(searchRange, 6);
  out.writeUInt16BE(entrySelector, 8);
  out.writeUInt16BE(rangeShift, 10);
  let dp = 12;
  tables.forEach((t, i) => {
    out.write(t.tag, dp, 4, 'latin1');
    out.writeUInt32BE(t.checksum >>> 0, dp + 4);
    out.writeUInt32BE(offsets[i], dp + 8);
    out.writeUInt32BE(t.origLength, dp + 12);
    dp += 16;
    t.data.copy(out, offsets[i]);
  });
  return out;
}

const files = [
  'heebo-hebrew-400-normal', 'heebo-hebrew-700-normal',
  'heebo-latin-400-normal',  'heebo-latin-700-normal',
];
for (const f of files) {
  const src = new URL(`../public/fonts/${f}.woff`, import.meta.url);
  const dst = new URL(`../public/fonts/${f}.ttf`, import.meta.url);
  const ttf = woffToTtf(readFileSync(src));
  writeFileSync(dst, ttf);
  console.log(`${f}.woff -> ${f}.ttf  (${ttf.length} bytes, magic=${ttf.toString('hex', 0, 4)})`);
}
