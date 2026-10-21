// Pictures as e-ink shows them: gray, fitted to a screen, toned so they
// do not go muddy, and dithered to the panel's few grays. Pure functions
// on pixel arrays, so they are tested without a browser; decoding and
// encoding for the AI happen in kit.ts.

/** A decoded picture: RGBA, 8 bits a channel, rows top to bottom. */
export interface Raster {
  width: number;
  height: number;
  data: Uint8ClampedArray;
  /** Its pixels per pixel of the picture it was decoded from, if it was
   *  decoded smaller (a crop is given in the picture's own pixels). */
  scale?: number;
}

/** A gray picture: one lightness a pixel, 0 (black) to 255 (white). */
export interface Gray {
  width: number;
  height: number;
  data: Float32Array;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Its lightness, transparency over white paper (as PaperPaw draws it). */
export function toGray(raster: Raster): Gray {
  const { width, height, data } = raster;
  const out = new Float32Array(width * height);
  for (let i = 0; i < out.length; i++) {
    const r = data[i * 4]!;
    const g = data[i * 4 + 1]!;
    const b = data[i * 4 + 2]!;
    const a = data[i * 4 + 3]! / 255;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    out[i] = luma * a + 255 * (1 - a);
  }
  return { width, height, data: out };
}

/** The part `rect` of `gray` (clamped to it). */
export function crop(gray: Gray, rect: Rect): Gray {
  const x0 = clamp(Math.round(rect.x), 0, gray.width - 1);
  const y0 = clamp(Math.round(rect.y), 0, gray.height - 1);
  const width = clamp(Math.round(rect.width), 1, gray.width - x0);
  const height = clamp(Math.round(rect.height), 1, gray.height - y0);
  const out = new Float32Array(width * height);
  for (let y = 0; y < height; y++) out.set(gray.data.subarray((y0 + y) * gray.width + x0, (y0 + y) * gray.width + x0 + width), y * width);
  return { width, height, data: out };
}

/** Scaled to `width` x `height`: each new pixel the average of the old
 *  ones it covers when smaller (no shimmer on fine detail), bilinear when
 *  larger. */
export function resize(gray: Gray, width: number, height: number): Gray {
  const across = resample(gray.data, gray.width, gray.height, width, true);
  const data = resample(across, width, gray.height, height, false);
  return { width, height, data };
}

/** One direction of `resize`: along rows (`horizontal`) or columns. */
function resample(src: Float32Array, w: number, h: number, size: number, horizontal: boolean): Float32Array {
  const from = horizontal ? w : h;
  const lines = horizontal ? h : w;
  const out = new Float32Array(horizontal ? size * h : w * size);
  const at = (line: number, i: number) => (horizontal ? src[line * w + i]! : src[i * w + line]!);
  const put = (line: number, i: number, v: number) => {
    if (horizontal) out[line * size + i] = v;
    else out[i * w + line] = v;
  };
  const scale = from / size;
  for (let line = 0; line < lines; line++) {
    for (let i = 0; i < size; i++) {
      if (scale > 1) {
        // The average over [start, end) in source pixels, partial ones weighed.
        const start = i * scale;
        const end = start + scale;
        let sum = 0;
        for (let s = Math.floor(start); s < Math.ceil(end); s++) {
          const weight = Math.min(end, s + 1) - Math.max(start, s);
          sum += at(line, Math.min(s, from - 1)) * weight;
        }
        put(line, i, sum / scale);
      } else {
        const pos = Math.max(0, (i + 0.5) * scale - 0.5);
        const a = Math.min(Math.floor(pos), from - 1);
        const b = Math.min(a + 1, from - 1);
        const t = pos - a;
        put(line, i, at(line, a) * (1 - t) + at(line, b) * t);
      }
    }
  }
  return out;
}

/** `gray` in a `width` x `height` box: `fill` covers it, cut at the edges
 *  (around the middle); `whole` shows all of it, paper around. */
export function fit(gray: Gray, width: number, height: number, how: "fill" | "whole"): Gray {
  const scale = how === "fill" ? Math.max(width / gray.width, height / gray.height) : Math.min(width / gray.width, height / gray.height);
  if (how === "fill") {
    // Cut first, at the source's size, then scale: less work, same result.
    const w = width / scale;
    const h = height / scale;
    const part = crop(gray, { x: (gray.width - w) / 2, y: (gray.height - h) / 2, width: w, height: h });
    return resize(part, width, height);
  }
  const w = Math.max(1, Math.round(gray.width * scale));
  const h = Math.max(1, Math.round(gray.height * scale));
  const scaled = resize(gray, w, h);
  const out = new Float32Array(width * height).fill(255);
  const x0 = Math.floor((width - w) / 2);
  const y0 = Math.floor((height - h) / 2);
  for (let y = 0; y < h; y++) out.set(scaled.data.subarray(y * w, y * w + w), (y0 + y) * width + x0);
  return { width, height, data: out };
}

export interface Tone {
  /** -1 (darker) to 1 (lighter); 0 leaves it. */
  brightness?: number;
  /** -1 (flatter) to 1 (harder); 0 leaves it. */
  contrast?: number;
  /** Above 1 lightens the middle grays, below 1 darkens them. */
  gamma?: number;
  /** Stretched so its darkest and lightest parts use all grays (on by
   *  default: e-ink shows fewer grays than a screen). */
  levels?: boolean;
  invert?: boolean;
}

/** Toned for e-ink, in place. */
export function tone(gray: Gray, t: Tone = {}): Gray {
  const d = gray.data;
  let lo = 0;
  let hi = 255;
  if (t.levels !== false) [lo, hi] = percentiles(d, 0.005, 0.995);
  if (hi - lo < 16) [lo, hi] = [0, 255];
  const contrast = 1 + (t.contrast ?? 0);
  const brightness = (t.brightness ?? 0) * 128;
  const gamma = t.gamma ?? 1;
  for (let i = 0; i < d.length; i++) {
    let v = (d[i]! - lo) / (hi - lo);
    v = Math.pow(clamp(v, 0, 1), 1 / gamma);
    v = (v - 0.5) * contrast + 0.5;
    v = v * 255 + brightness;
    if (t.invert) v = 255 - v;
    d[i] = clamp(v, 0, 255);
  }
  return gray;
}

function percentiles(d: Float32Array, low: number, high: number): [number, number] {
  const counts = new Uint32Array(256);
  for (let i = 0; i < d.length; i++) counts[clamp(Math.round(d[i]!), 0, 255)]!++;
  const find = (share: number) => {
    let seen = 0;
    for (let v = 0; v < 256; v++) {
      seen += counts[v]!;
      if (seen >= share * d.length) return v;
    }
    return 255;
  };
  return [find(low), find(high)];
}

export type Dither = "diffusion" | "lineart" | "none";

/** Whether it looks drawn (few grays: a logo, line art, a screenshot of
 *  flat colours) rather than photographed. */
export function looksDrawn(gray: Gray): boolean {
  const seen = new Set<number>();
  const step = Math.max(1, Math.floor(gray.data.length / 20_000));
  for (let i = 0; i < gray.data.length; i += step) {
    seen.add(Math.round(gray.data[i]! / 4));
    if (seen.size > 24) return false;
  }
  return true;
}

/** `gray` at `levels` grays (2, 4, 16, 256), as level numbers from 0
 *  (black) up. Diffusion (Floyd-Steinberg, alternating direction) keeps
 *  photos' shades; line art (Atkinson) keeps drawings crisp; none takes
 *  the nearest gray. */
export function quantize(gray: Gray, levels: number, dither: Dither): Uint8Array {
  const { width, height } = gray;
  const work = Float32Array.from(gray.data);
  const out = new Uint8Array(width * height);
  const step = 255 / (levels - 1);
  const spread = (x: number, y: number, error: number) => {
    if (x >= 0 && x < width && y < height) work[y * width + x]! += error;
  };
  for (let y = 0; y < height; y++) {
    const backwards = dither === "diffusion" && y % 2 === 1;
    for (let n = 0; n < width; n++) {
      const x = backwards ? width - 1 - n : n;
      const i = y * width + x;
      const old = clamp(work[i]!, 0, 255);
      const level = Math.round(old / step);
      out[i] = level;
      if (dither === "none") continue;
      const error = old - level * step;
      if (dither === "diffusion") {
        const ahead = backwards ? -1 : 1;
        spread(x + ahead, y, (error * 7) / 16);
        spread(x - ahead, y + 1, (error * 3) / 16);
        spread(x, y + 1, (error * 5) / 16);
        spread(x + ahead, y + 1, error / 16);
      } else {
        // Atkinson: three quarters of the error, so flat areas stay flat.
        const e = error / 8;
        spread(x + 1, y, e);
        spread(x + 2, y, e);
        spread(x - 1, y + 1, e);
        spread(x, y + 1, e);
        spread(x + 1, y + 1, e);
        spread(x, y + 2, e);
      }
    }
  }
  return out;
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}
