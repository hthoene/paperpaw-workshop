// A small PNG writer for gray pictures at 1, 2, 4 or 8 bits a pixel: the
// smallest files PaperPaw reads (non-interlaced, as it wants them), and
// nothing in them but the pixels.

import { zlibSync } from "fflate";

/** `levels` (one level number a pixel, 0 = black) as a gray PNG of
 *  `bits` bits a pixel; level `2^bits - 1` is white. */
export function grayPng(width: number, height: number, levels: Uint8Array, bits: 1 | 2 | 4 | 8): Uint8Array {
  const perByte = 8 / bits;
  const rowBytes = Math.ceil(width / perByte);
  // Each row: filter byte 0 (none), then the packed pixels.
  const raw = new Uint8Array((rowBytes + 1) * height);
  for (let y = 0; y < height; y++) {
    const row = y * (rowBytes + 1) + 1;
    for (let x = 0; x < width; x++) {
      const shift = 8 - bits * ((x % perByte) + 1);
      raw[row + Math.floor(x / perByte)]! |= levels[y * width + x]! << shift;
    }
  }
  const header = new Uint8Array(13);
  const view = new DataView(header.buffer);
  view.setUint32(0, width);
  view.setUint32(4, height);
  header.set([bits, 0, 0, 0, 0], 8); // gray, deflate, adaptive filtering, no interlace
  return concat([
    new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", zlibSync(raw, { level: 9 })),
    chunk("IEND", new Uint8Array()),
  ]);
}

/** The width, height and whether it is interlaced, of a PNG; undefined
 *  for anything that is not one. */
export function pngHeader(bytes: Uint8Array): { width: number; height: number; interlaced: boolean } | undefined {
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length < 29 || sig.some((b, i) => bytes[i] !== b)) return undefined;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (String.fromCharCode(...bytes.subarray(12, 16)) !== "IHDR") return undefined;
  return { width: view.getUint32(16), height: view.getUint32(20), interlaced: bytes[28] !== 0 };
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
}

let table: Uint32Array | undefined;

function crc32(bytes: Uint8Array): number {
  if (!table) {
    table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (const b of bytes) crc = table[(crc ^ b) & 0xff]! ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function concat(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}
