// A picture made for the readers a plugin is for: one file per screen
// size, gray, at the panel's grays, dithered (design 4.8).
//
// Until PaperPaw picks a file per screen size (`name@480x800.png` beside
// `name.png`, design question 12.1), a plugin for several screen sizes
// gets one file, made for the largest of them in 16 grays; the smaller
// readers scale and dither it themselves.

import type { Profile } from "../handbook/handbook";
import { crop, fit, looksDrawn, quantize, toGray, tone, type Dither, type Raster, type Rect, type Tone } from "./gray";
import { grayPng } from "./png";

/** Whether PaperPaw takes `name@WxH.png` in place of `name.png`. */
export const VARIANTS_IN_PAPERPAW = false;

/** The largest picture file the workshop writes into a plugin. */
export const MAX_PICTURE_FILE = 1_000_000;

/** The X4's width: sizes the AI gives in pixels are X4 pixels. */
const X4_WIDTH = 480;

/** Screens of one size, and the grays their panels show. */
export interface Target {
  width: number;
  height: number;
  grays: 4 | 16;
  /** The devices with this screen, by name. */
  devices: string[];
}

/** The screens of `profiles`, largest first. The X4 family shows four
 *  grays (2 bits a pixel), the others sixteen. */
export function targetsFor(profiles: Profile[]): Target[] {
  const bySize = new Map<string, Target>();
  for (const p of profiles) {
    const key = `${p.width}x${p.height}`;
    const grays = p.id.startsWith("xteink-") ? 4 : 16;
    const known = bySize.get(key);
    if (known) {
      known.devices.push(p.name);
      if (grays > known.grays) known.grays = grays;
    } else {
      bySize.set(key, { width: p.width, height: p.height, grays, devices: [p.name] });
    }
  }
  return [...bySize.values()].sort((a, b) => b.width * b.height - a.width * a.height);
}

export interface MakeOptions {
  /** Covering the box, cut at its edges, or all of it with paper around. */
  fit: "fill" | "whole";
  /** The part of the picture to use, in its own pixels. */
  crop?: Rect;
  /** A box smaller than the screen (a logo, a widget's picture), in X4
   *  pixels; scaled for the other screens. The whole screen if not given. */
  box?: { width: number; height: number };
  tone?: Tone;
  /** `auto`: line art for drawings, diffusion for photos. */
  dither?: Dither | "auto";
}

export interface Made {
  /** Its path in the plugin. */
  path: string;
  target: Target;
  png: Uint8Array;
}

/** The files to write for `raster` at `path` (e.g. `sleep/1.png`), and a
 *  preview of how the X4 shows it, as a PNG. */
export function makePicture(raster: Raster, path: string, targets: Target[], options: MakeOptions): { files: Made[]; preview: Uint8Array; drawn: boolean } {
  if (targets.length === 0) throw new Error("no screen to make it for");
  let gray = toGray(raster);
  if (options.crop) gray = crop(gray, options.crop);
  const drawn = looksDrawn(gray);
  const dither: Dither = !options.dither || options.dither === "auto" ? (drawn ? "lineart" : "diffusion") : options.dither;

  const render = (target: Target) => {
    const scale = target.width / X4_WIDTH;
    const width = options.box ? Math.max(1, Math.round(options.box.width * scale)) : target.width;
    const height = options.box ? Math.max(1, Math.round(options.box.height * scale)) : target.height;
    const shaped = tone(fit(gray, width, height, options.fit), options.tone);
    const levels = quantize(shaped, target.grays, dither);
    return grayPng(width, height, levels, target.grays === 4 ? 2 : 4);
  };

  // One file for all, unless PaperPaw picks one per screen size.
  const largest = targets[0]!;
  const one: Target = { ...largest, grays: Math.max(...targets.map((t) => t.grays)) as 4 | 16, devices: targets.flatMap((t) => t.devices) };
  const files: Made[] =
    VARIANTS_IN_PAPERPAW || targets.length === 1
      ? targets.map((target, i) => ({ path: i === 0 ? path : variantPath(path, target), target, png: render(target) }))
      : [{ path, target: one, png: render(one) }];

  // How the X4 shows it: four grays at its size.
  const x4: Target = { width: X4_WIDTH, height: 800, grays: 4, devices: ["X4"] };
  const preview = files.find((f) => f.target.width === X4_WIDTH && f.target.grays === 4)?.png ?? render(x4);
  return { files, preview, drawn };
}

/** `sleep/1.png` for a 480 x 800 screen: `sleep/1@480x800.png`. */
export function variantPath(path: string, target: Target): string {
  const dot = path.lastIndexOf(".");
  return `${path.slice(0, dot)}@${target.width}x${target.height}${path.slice(dot)}`;
}
