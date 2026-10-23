import { describe, expect, it } from "vitest";

import type { Body } from "../src/desktop/backend";
import { EDGE_GAP, EDGE_KEY, bezels, fit, keyMap, label, margins, place } from "../src/desktop/body";

/** The X4's body, as PaperPaw's profile has it. */
const X4: Body = {
  bezel: [7, 7, 30, 7],
  keys: [
    { button: "back", place: "below", at: 19, length: 17, keys: ["Escape", "Backspace"] },
    { button: "confirm", place: "below", at: 37, length: 17, keys: ["Enter"] },
    { button: "power", place: "right", at: 14, length: 8, keys: ["p"] },
    { button: "page-back", place: "right", at: 36, length: 13, keys: ["PageUp", "ArrowUp"] },
    { button: "page-forward", place: "right", at: 50, length: 13, keys: ["PageDown", "ArrowDown", " "] },
  ],
};

describe("a device's body and its keys", () => {
  it("takes room around the body only on the edges with keys", () => {
    expect(margins(X4)).toEqual([0, EDGE_KEY + EDGE_GAP, 0, 0]);
    expect(bezels(X4, 300)).toEqual([21, 21, 90, 21]);
  });

  it("puts a key on an edge outside the body, one on the face in its bezel", () => {
    const bezel = bezels(X4, 300);
    const [w, h] = [300 + 42, 500 + 111];
    const keys = place(X4, w, h, bezel);
    const power = keys.find((k) => k.key.button === "power")!;
    expect(power.x).toBe(w + EDGE_GAP);
    expect(power.width).toBe(EDGE_KEY);
    const back = keys.find((k) => k.key.button === "back")!;
    expect(back.y).toBeGreaterThan(h - bezel[2]);
    expect(back.y + back.height).toBeLessThan(h);
    expect(back.label.text).toBe("Back");
  });

  it("names stacked page keys up and down, as the X4's rocker", () => {
    expect(label(X4.keys[3]!, X4.keys).icon).toBe("up");
    expect(label(X4.keys[4]!, X4.keys).spoken).toBe("Page forward");
    const pro: Body["keys"][number] = { button: "page-back", place: "left", at: 45, length: 14, keys: [] };
    expect(label(pro, [pro]).icon).toBe("left");
  });

  it("fits the body with its keys into the room, never larger than the panel", () => {
    // Narrow: the width decides.
    const narrow = fit(X4, 480, 800, [354, 2000]);
    expect(narrow + bezels(X4, narrow)[1] + bezels(X4, narrow)[3] + margins(X4)[1]).toBeLessThanOrEqual(354);
    // Low: the height decides.
    const low = fit(X4, 480, 800, [2000, 600]);
    expect(Math.round((low * 800) / 480) + bezels(X4, low)[0] + bezels(X4, low)[2]).toBeLessThanOrEqual(600);
    expect(fit(X4, 480, 800, [5000, 5000])).toBe(480);
  });

  it("maps the computer's keys: the body's first, the rest for buttons without a key", () => {
    const map = keyMap(X4, ["back", "confirm", "power", "page-back", "page-forward", "menu"], { m: "menu", ArrowUp: "up", Escape: "back" });
    expect(map[" "]).toBe("page-forward");
    expect(map.ArrowUp).toBe("page-back");
    expect(map.m).toBe("menu");
    expect(keyMap(null, ["back"], { Escape: "back", ArrowUp: "up" })).toEqual({ Escape: "back" });
  });
});
