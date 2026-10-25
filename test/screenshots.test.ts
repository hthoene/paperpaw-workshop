// The store's screenshots as the person and the AI keep them: numbered in
// the store's order, at most four of at most 500 KB, each with its words
// in store.ini, in the store folder of either kind of plugin.

import { describe, expect, it } from "vitest";

import { MAX_SCREENSHOT_BYTES } from "../src/project/entry";
import { Files, newProject } from "../src/project/project";
import { describeShot, keepShot, moveShot, removeShot, storeShots } from "../src/publish/screenshots";
import { screenshot } from "../src/tools/screenshot";
import { bench, handbook } from "./helpers";

const PNG = new Uint8Array([137, 80, 78, 71, 1, 2, 3]);
const book = handbook();
const x4 = book.profile("xteink-x4")!;
const pro = book.profile("xteink-x4-pro")!;

function data(): Files {
  const files = new Files(newProject("data"));
  files.write("store/store.ini", "[store]\nsummary = A calm clock.\nsdk = 0.5\n");
  return files;
}

describe("the store's screenshots", () => {
  it("are kept after each other, numbered, each with its words, the entry kept", () => {
    const files = data();
    expect(keepShot(files, PNG, pro, false, "The clock on the home screen", undefined)).toEqual({ ok: true, file: "1-x4-pro.png" });
    expect(keepShot(files, PNG, x4, true, "At night", undefined)).toEqual({ ok: true, file: "2-x4-night.png" });
    expect(storeShots(files).map((s) => [s.file, s.alt])).toEqual([
      ["1-x4-pro.png", "The clock on the home screen"],
      ["2-x4-night.png", "At night"],
    ]);
    expect(files.read("store/store.ini")).toBe(
      "[store]\nsummary = A calm clock.\nsdk = 0.5\n\n[screenshots]\n1-x4-pro.png = The clock on the home screen\n2-x4-night.png = At night\n",
    );
  });

  it("are at most four of at most 500 KB, a fifth replacing one", () => {
    const files = data();
    for (let i = 0; i < 4; i++) expect(keepShot(files, PNG, x4, false, `shot ${i}`).ok).toBe(true);
    const fifth = keepShot(files, PNG, pro, false, "fifth");
    expect(fifth.ok).toBe(false);
    expect(keepShot(files, PNG, pro, false, "better", "2-x4.png")).toEqual({ ok: true, file: "2-x4-pro.png" });
    expect(storeShots(files).map((s) => s.file)).toEqual(["1-x4.png", "2-x4-pro.png", "3-x4.png", "4-x4.png"]);
    expect(storeShots(files)[1]!.alt).toBe("better");
    const large = new Uint8Array(MAX_SCREENSHOT_BYTES + 1);
    expect(keepShot(files, large, x4, false, "large", "1-x4.png")).toMatchObject({ ok: false });
    expect(keepShot(files, PNG, x4, false, "none", "9-x4.png")).toMatchObject({ ok: false });
  });

  it("are deleted and moved, numbered afresh with their words", () => {
    const files = data();
    keepShot(files, PNG, x4, false, "one");
    keepShot(files, new Uint8Array([2]), pro, false, "two");
    keepShot(files, new Uint8Array([3]), x4, true, "three");
    expect(moveShot(files, "3-x4-night.png", -1)).toBeNull();
    expect(storeShots(files).map((s) => [s.file, s.alt])).toEqual([
      ["1-x4.png", "one"],
      ["2-x4-night.png", "three"],
      ["3-x4-pro.png", "two"],
    ]);
    expect(files.all()["store/2-x4-night.png"]).toEqual(new Uint8Array([3]));
    expect(removeShot(files, "1-x4.png")).toBeNull();
    expect(storeShots(files).map((s) => [s.file, s.alt])).toEqual([
      ["1-x4-night.png", "three"],
      ["2-x4-pro.png", "two"],
    ]);
    expect(files.has("store/3-x4-pro.png")).toBe(false);
    expect(describeShot(files, "2-x4-pro.png", "The clock, large")).toBeNull();
    expect(files.read("store/store.ini")).toContain("2-x4-pro.png = The clock, large");
    while (storeShots(files).length) removeShot(files, storeShots(files)[0]!.file);
    expect(files.read("store/store.ini")).toBe("[store]\nsummary = A calm clock.\nsdk = 0.5\n");
  });

  it("of a plugin with code go into its folder's store/", () => {
    const files = new Files(newProject("code"));
    expect(keepShot(files, PNG, x4, false, "The widget")).toEqual({ ok: true, file: "1-x4.png" });
    expect(files.has("plugin/store/1-x4.png")).toBe(true);
    expect(files.read("plugin/store/store.ini")).toBe("[screenshots]\n1-x4.png = The widget\n");
  });
});

describe("the screenshot tool", () => {
  it("keeps what the device shows and shows it back, then deletes on asking", async () => {
    const { context, files, emulator } = bench();
    const taken = await screenshot.run({ device: "X4 Pro", dark: true, alt: "The clock at night" }, context);
    expect(taken.isError).toBeFalsy();
    expect(emulator.screenshots.at(-1)).toMatchObject({ profile: "xteink-x4-pro", dark: true });
    const content = taken.content as { type: string; text?: string }[];
    expect(content[0]!.type).toBe("image");
    expect(content[1]!.text).toContain("Kept as 1-x4-pro-night.png");
    expect(files.read("store/store.ini")).toContain("1-x4-pro-night.png = The clock at night");
    const removed = await screenshot.run({ remove: "1-x4-pro-night.png" }, context);
    expect(removed.isError).toBeFalsy();
    expect(storeShots(files)).toEqual([]);
  });

  it("asks for words for what it shows", async () => {
    const { context } = bench();
    expect((await screenshot.run({ device: "X4" }, context)).isError).toBe(true);
  });
});
