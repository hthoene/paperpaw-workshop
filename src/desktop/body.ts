// A device's body around its screen and its keys where they sit on the
// real one, from the profile's body (PaperPaw's docs/web-emulator.md,
// "The body and its keys"): the layout of PaperPaw's own frame
// (shells/web/www/body.js), for the reader beside the conversation.

import type { Body, BodyKey } from "./backend";

/** How thick a key on an edge is drawn, and its gap to the body, in CSS
 *  pixels. */
export const EDGE_KEY = 22;
export const EDGE_GAP = 4;

/** A key's label: a word, or an icon with its name for screen readers. */
export interface Label {
  text?: string;
  icon?: "left" | "right" | "up" | "down" | "power";
  spoken: string;
}

const LABELS: Record<string, Label> = {
  back: { text: "Back", spoken: "Back" },
  confirm: { text: "Select", spoken: "Select" },
  home: { text: "Home", spoken: "Home" },
  menu: { text: "Menu", spoken: "Menu" },
  power: { icon: "power", spoken: "Power" },
  left: { icon: "left", spoken: "Left" },
  right: { icon: "right", spoken: "Right" },
  up: { icon: "up", spoken: "Up" },
  down: { icon: "down", spoken: "Down" },
  "page-back": { icon: "left", spoken: "Page back" },
  "page-forward": { icon: "right", spoken: "Page forward" },
};

/** Whether `place` runs from top to bottom (its keys stand upright). */
const upright = (place: BodyKey["place"]) => place === "left" || place === "right" || place === "beside";
/** Whether `place` is an edge (the key out of the body's side). */
export const isEdge = (place: BodyKey["place"]) => place === "top" || place === "right" || place === "bottom" || place === "left";

/** A key's label: page keys stacked on one upright place point up and
 *  down (the X4's rocker), elsewhere back and forward. */
export function label(key: BodyKey, keys: BodyKey[]): Label {
  const stacked = upright(key.place) && keys.filter((k) => k.place === key.place && k.button.startsWith("page-")).length > 1;
  if (stacked && key.button === "page-back") return { icon: "up", spoken: "Page back" };
  if (stacked && key.button === "page-forward") return { icon: "down", spoken: "Page forward" };
  return LABELS[key.button] ?? { text: key.button, spoken: key.button };
}

/** The room the keys on the edges take around the body, in CSS pixels:
 *  top, right, bottom, left. */
export function margins(body: Body): [number, number, number, number] {
  const out = EDGE_KEY + EDGE_GAP;
  const side = (place: BodyKey["place"]) => (body.keys.some((k) => k.place === place) ? out : 0);
  return [side("top"), side("right"), side("bottom"), side("left")];
}

/** The bezels in CSS pixels for a screen `width` wide: top, right,
 *  bottom, left. */
export function bezels(body: Body, width: number): [number, number, number, number] {
  const [t, r, b, l] = body.bezel.map((part) => Math.round((part * width) / 100));
  return [t!, r!, b!, l!];
}

/** Where a key sits on a body `width` by `height` (CSS pixels) with
 *  `bezel`: its box, from the body's top left corner. */
export interface Placed {
  key: BodyKey;
  label: Label;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function place(body: Body, width: number, height: number, bezel: [number, number, number, number]): Placed[] {
  const [, right, bottom] = bezel;
  return body.keys.map((key) => {
    const along = upright(key.place) ? height : width;
    const length = Math.round((key.length * along) / 100);
    const middle = (key.at * along) / 100;
    // Keys on the face: as thick as the bezel allows, with room around.
    const room = key.place === "below" ? bottom : key.place === "beside" ? right : EDGE_KEY;
    const thick = isEdge(key.place) ? EDGE_KEY : Math.max(18, Math.min(36, Math.round(room * 0.42)));
    const [w, h] = upright(key.place) ? [thick, length] : [length, thick];
    const at: Record<BodyKey["place"], [number, number]> = {
      top: [middle - w / 2, -EDGE_GAP - h],
      bottom: [middle - w / 2, height + EDGE_GAP],
      left: [-EDGE_GAP - w, middle - h / 2],
      right: [width + EDGE_GAP, middle - h / 2],
      below: [middle - w / 2, height - bottom + (bottom - h) / 2],
      beside: [width - right + (right - w) / 2, middle - h / 2],
    };
    const [x, y] = at[key.place];
    return { key, label: label(key, body.keys), x: Math.round(x), y: Math.round(y), width: w, height: h };
  });
}

/** The screen's width, in CSS pixels, at which the body with its keys
 *  around fits `room` (width, height) for a panel `width` by `height`:
 *  never wider than the panel itself. */
export function fit(body: Body, width: number, height: number, room: [number, number]): number {
  const [mt, mr, mb, ml] = margins(body);
  const [bt, br, bb, bl] = body.bezel;
  const across = (room[0] - ml - mr) / (1 + (bl + br) / 100);
  const down = (room[1] - mt - mb) / (height / width + (bt + bb) / 100);
  return Math.max(0, Math.floor(Math.min(across, down, width)));
}

/** The computer's keys that press the device's buttons: the body's own
 *  first, then `fallback` for buttons it places no key for. */
export function keyMap(body: Body | null, buttons: string[], fallback: Record<string, string>): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [key, button] of Object.entries(fallback)) if (buttons.includes(button)) map[key] = button;
  for (const key of body?.keys ?? []) for (const name of key.keys) map[name] = key.button;
  return map;
}
