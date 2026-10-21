import { unzlibSync } from "fflate";
import { describe, expect, it } from "vitest";

import type Anthropic from "@anthropic-ai/sdk";

import { runTurn } from "../src/ai/loop";
import sleepPicture from "../src/ai/examples/sleep-picture.json";
import { ReplayProvider, type Recording } from "../src/ai/replay";
import { lines } from "../src/app/conversation";
import { checkDataPlugin } from "../src/checks/data";
import { makePicture, targetsFor, variantPath } from "../src/pictures/convert";
import { fit, looksDrawn, quantize, resize, toGray, tone, type Gray } from "../src/pictures/gray";
import { grayPng, pngHeader } from "../src/pictures/png";
import { pictureSize } from "../src/pictures/size";
import { ADDED, MemoryUploads, sniff, uploadName, Uploads, UploadRefused, MAX_UPLOADS } from "../src/project/uploads";
import { newProject } from "../src/project/project";
import { DATA_TOOLS } from "../src/tools/registry";
import { look } from "../src/tools/emulator";
import { convertPicture, listUploads, placeFile, viewUpload } from "../src/tools/uploads";
import { bench, fakeKit, testPicture, testRaster } from "./helpers";

const flat = (width: number, height: number, v: number): Gray => ({ width, height, data: new Float32Array(width * height).fill(v) });
const mean = (g: Gray) => g.data.reduce((a, b) => a + b, 0) / g.data.length;
const PLUGIN_INI = "[plugin]\nid = owl\nname = Owl\ndescription = A sleeping owl.\nversion = 1.0.0\nformats = 1\n";

/** The pixel levels of a gray PNG the writer made (one IDAT, no filters). */
function levelsOf(png: Uint8Array): { width: number; height: number; bits: number; levels: number[] } {
  const view = new DataView(png.buffer, png.byteOffset);
  const width = view.getUint32(16);
  const height = view.getUint32(20);
  const bits = png[24]!;
  const idatLength = view.getUint32(33);
  const raw = unzlibSync(png.subarray(41, 41 + idatLength));
  const rowBytes = Math.ceil((width * bits) / 8);
  const levels: number[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const byte = raw[y * (rowBytes + 1) + 1 + Math.floor((x * bits) / 8)]!;
      const shift = 8 - bits - ((x * bits) % 8);
      levels.push((byte >> shift) & ((1 << bits) - 1));
    }
  }
  return { width, height, bits, levels };
}

describe("pictures for e-ink", () => {
  it("are gray, transparency over white paper", () => {
    const g = toGray({ width: 2, height: 1, data: new Uint8ClampedArray([0, 0, 0, 255, 0, 0, 0, 0]) });
    expect([...g.data]).toEqual([0, 255]);
  });

  it("keep their brightness when made smaller, and fit a box", () => {
    const photo = toGray(testRaster(300, 200));
    const small = resize(photo, 75, 50);
    expect(Math.abs(mean(small) - mean(photo))).toBeLessThan(1);
    const filled = fit(flat(400, 100, 0), 48, 80, "fill");
    expect([filled.width, filled.height, mean(filled)]).toEqual([48, 80, 0]);
    // All of a wide picture in a tall box: paper above and below.
    const whole = fit(flat(400, 100, 0), 48, 80, "whole");
    expect(whole.data[0]).toBe(255);
    expect(whole.data[40 * 48 + 24]).toBe(0);
  });

  it("are stretched to all grays, then lightened or darkened as asked", () => {
    const dull = { width: 2, height: 1, data: new Float32Array([100, 150]) };
    expect([...tone(structuredClone(dull)).data]).toEqual([0, 255]);
    const light = tone({ width: 1, height: 1, data: new Float32Array([128]) }, { levels: false, brightness: 0.5 });
    expect(light.data[0]).toBeGreaterThan(180);
  });

  it("are dithered to the panel's grays, keeping the shade on average", () => {
    const gray = flat(64, 64, 100);
    const four = quantize(gray, 4, "diffusion");
    expect(new Set(four)).toEqual(new Set([1, 2]));
    const shade = [...four].reduce((a, b) => a + b * 85, 0) / four.length;
    expect(Math.abs(shade - 100)).toBeLessThan(2);
    expect(new Set(quantize(gray, 4, "none"))).toEqual(new Set([1]));
  });

  it("tell drawings from photos", () => {
    expect(looksDrawn(toGray(testRaster(200, 200, false)))).toBe(true);
    expect(looksDrawn(toGray(testRaster(200, 200, true)))).toBe(false);
  });

  it("are written as small gray PNGs PaperPaw reads", () => {
    const png = grayPng(5, 2, new Uint8Array([0, 1, 2, 3, 0, 3, 2, 1, 0, 3]), 2);
    expect(pngHeader(png)).toEqual({ width: 5, height: 2, interlaced: false });
    expect(levelsOf(png)).toEqual({ width: 5, height: 2, bits: 2, levels: [0, 1, 2, 3, 0, 3, 2, 1, 0, 3] });
    expect(pngHeader(new Uint8Array([1, 2, 3]))).toBeUndefined();
  });
});

describe("pictures for the readers", () => {
  const { context } = bench();

  it("are made per screen size: the X4 family in four grays", () => {
    expect(targetsFor(context.profiles).map((t) => [t.width, t.height, t.grays, t.devices])).toEqual([
      [1264, 1680, 16, ["Boox Go 7"]],
      [480, 800, 4, ["Xteink X4", "Xteink X4 Pro"]],
    ]);
  });

  it("for the X4 alone: one 2-bit file at its size, dithered", () => {
    const x4 = targetsFor(context.profiles.filter((p) => p.id.startsWith("xteink-")));
    const made = makePicture(testRaster(1200, 900), "sleep/1.png", x4, { fit: "fill" });
    expect(made.files).toHaveLength(1);
    const { width, height, bits, levels } = levelsOf(made.files[0]!.png);
    expect([width, height, bits]).toEqual([480, 800, 2]);
    expect(new Set(levels).size).toBeGreaterThan(2);
    expect(made.preview).toBe(made.files[0]!.png);
    expect(made.drawn).toBe(false);
  });

  it("for several screen sizes: one file for the largest, all grays and not dithered, until PaperPaw picks per size", () => {
    const made = makePicture(testRaster(1200, 900, false), "sleep/1.png", targetsFor(context.profiles), { fit: "fill" });
    expect(made.files.map((f) => [f.path, f.target.width, f.target.grays])).toEqual([["sleep/1.png", 1264, 256]]);
    const { bits, levels } = levelsOf(made.files[0]!.png);
    expect(bits).toBe(8);
    // A drawing of two grays stays two grays, but for the smoothed edges:
    // nothing is dithered in between.
    const [low, high] = levels.reduce(([lo, hi], l) => [Math.min(lo, l), Math.max(hi, l)], [255, 0]);
    const two = levels.filter((l) => l === low || l === high).length;
    expect(two / levels.length).toBeGreaterThan(0.97);
    // A noisy photo too large in all grays comes in sixteen, not dithered.
    const photo = makePicture(testRaster(1200, 900), "sleep/1.png", targetsFor(context.profiles), { fit: "fill" });
    expect([photo.files[0]!.target.grays, levelsOf(photo.files[0]!.png).bits]).toEqual([16, 4]);
    // The preview is still the X4's.
    expect(levelsOf(made.preview)).toMatchObject({ width: 480, height: 800, bits: 2 });
  });

  it("in a box: scaled for each screen", () => {
    const made = makePicture(testRaster(500, 500, false), "logo.png", targetsFor(context.profiles), { fit: "whole", box: { width: 160, height: 160 } });
    expect(levelsOf(made.files[0]!.png)).toMatchObject({ width: 421, height: 421 });
    expect(made.drawn).toBe(true);
    expect(variantPath("sleep/1.png", { width: 480, height: 800, grays: 4, devices: [] })).toBe("sleep/1@480x800.png");
  });
});

describe("uploads", () => {
  const measure = fakeKit.size;

  it("are known by their bytes, not their names", () => {
    expect(sniff("a.txt", testPicture(10, 10))).toEqual({ kind: "picture", type: "image/png" });
    expect(sniff("photo.png", new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toEqual({ kind: "picture", type: "image/jpeg" });
    expect(sniff("x.svg", new TextEncoder().encode('<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"/>'))?.type).toBe("image/svg+xml");
    expect(sniff("Owl.ttf", new Uint8Array([0, 1, 0, 0, 0]))?.kind).toBe("font");
    expect(sniff("notes.md", new TextEncoder().encode("# Notes"))?.kind).toBe("text");
    expect(sniff("run.exe", new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0xff, 0xfe]))).toBeUndefined();
    expect(sniff("page.html", new TextEncoder().encode("<html></html>"))).toBeUndefined();
  });

  it("get names of their own", () => {
    expect(uploadName("My Photo (2).JPG", [])).toBe("my-photo-2.jpg");
    expect(uploadName("Füchse.png", ["fuchse.png"])).toBe("fuchse-2.png");
  });

  it("are kept apart from the project, within limits", async () => {
    const project = newProject();
    const store = new MemoryUploads();
    const uploads = new Uploads(project, store);
    const info = await uploads.add("Owl.png", testPicture(1200, 900), measure);
    expect(info).toMatchObject({ name: "owl.png", kind: "picture", width: 1200, height: 900 });
    expect(project.uploads).toHaveLength(1);
    expect(await store.get(project.key, "owl.png")).toEqual(testPicture(1200, 900));
    expect(await uploads.add("owl again.png", testPicture(1200, 900), measure)).toBe(info);
    await expect(uploads.add("run.exe", new Uint8Array([0x4d, 0x5a, 0, 0xff]), measure)).rejects.toMatchObject({ key: "upload.refused.kind" });
    await expect(uploads.add("huge.png", testPicture(10, 10), async () => ({ width: 8000, height: 6000 }))).rejects.toMatchObject({ key: "upload.refused.pixels" });
    await uploads.remove("owl.png");
    expect(project.uploads).toEqual([]);
    expect(await store.get(project.key, "owl.png")).toBeUndefined();
    for (let i = 0; i < MAX_UPLOADS; i++) await uploads.add(`n${i}.png`, testPicture(10 * (i + 1), 10), measure);
    const refused = await uploads.add("one-more.png", testPicture(20, 20), measure).catch((e: unknown) => e);
    expect(refused).toBeInstanceOf(UploadRefused);
    expect((refused as UploadRefused).key).toBe("upload.refused.count");
  });
});

describe("the AI's tools for uploads", () => {
  async function owl() {
    const b = bench();
    b.files.write("plugin.ini", PLUGIN_INI);
    await b.uploads.add("owl.jpg", testPicture(1200, 900), fakeKit.size);
    await b.uploads.add("Owl Sans.ttf", new Uint8Array([0, 1, 0, 0, 9, 9]), fakeKit.size);
    return b;
  }

  it("lists them and shows a picture, counting it", async () => {
    const { context, uploads } = await owl();
    const list = await listUploads.run({}, context);
    expect(list.content).toContain("owl.jpg: picture, image/png, 11 bytes, 1200 x 900 pixels");
    expect(list.content).toContain("owl-sans.ttf: font");
    const view = await viewUpload.run({ name: "owl.jpg", crop: { x: 0, y: 0, width: 600, height: 450 } }, context);
    expect(Array.isArray(view.content) && view.content[0]!.type).toBe("image");
    expect(uploads.showable).toBe(11);
    expect((await viewUpload.run({ name: "owl-sans.ttf" }, context)).isError).toBe(true);
  });

  it("make a picture into the plugin, and show how the X4 shows it", async () => {
    const { context, files } = await owl();
    const result = await convertPicture.run({ upload: "owl.jpg", to: "sleep/1.png", fit: "fill", devices: ["X4", "X4 Pro"] }, context);
    expect(result.isError).toBeFalsy();
    const content = result.content as Anthropic.ToolResultBlockParam["content"] & unknown[];
    expect((content[0] as { text: string }).text).toContain("sleep/1.png: 480 x 800, 4 grays");
    expect((content[1] as { type: string }).type).toBe("image");
    expect(pngHeader(files.bytes()["sleep/1.png"]!)).toEqual({ width: 480, height: 800, interlaced: false });
    expect((await convertPicture.run({ upload: "owl-sans.ttf", to: "x.png", fit: "fill" }, context)).isError).toBe(true);
  });

  it("copy fonts and texts as they are", async () => {
    const { context, files } = await owl();
    expect((await placeFile.run({ upload: "owl-sans.ttf", to: "fonts/OwlSans.ttf" }, context)).isError).toBeFalsy();
    expect(files.bytes()["fonts/OwlSans.ttf"]).toEqual(new Uint8Array([0, 1, 0, 0, 9, 9]));
    expect((await placeFile.run({ upload: "owl.jpg", to: "owl.png" }, context)).isError).toBe(true);
  });
});

describe("the checks of pictures", () => {
  it("find a picture PaperPaw cannot read, and settings naming pictures that are not there", () => {
    const { handbook } = bench();
    const interlaced = grayPng(2, 2, new Uint8Array(4), 2);
    interlaced[28] = 1;
    const findings = checkDataPlugin(
      {
        "plugin.ini": PLUGIN_INI,
        "settings.ini": "[core]\nlogo = plugins/owl/logo.png\n\n[sleep]\nshow = sleep.show.picture\nfolder = plugins/owl/sleep\n",
        "art/owl.png": interlaced,
        "art/not.png": new Uint8Array([1, 2, 3]),
      },
      handbook.registry,
    );
    const pictures = findings.filter((f) => f.check.startsWith("picture."));
    expect(pictures.map((f) => [f.check, f.place])).toEqual([
      ["picture.format", "art/owl.png"],
      ["picture.format", "art/not.png"],
      ["picture.missing", "settings.ini:2"],
      ["picture.missing", "settings.ini:6"],
    ]);
  });
});

describe("a conversation with a picture", () => {
  // The author adds a photo for the sleep screen; the model makes it for
  // the X4, sets the sleep screen to show it, and looks.
  const recording: Recording = {
    title: "A sleep picture",
    user: ["Use my owl while the reader sleeps."],
    answers: [
      {
        stop_reason: "tool_use",
        content: [
          { type: "text", text: "I'll make your owl the sleep picture.", citations: null },
          { type: "tool_use", id: "a", name: "convert_picture", input: { upload: "owl.jpg", to: "sleep/1.png", fit: "fill", gamma: 1.3 } },
          {
            type: "tool_use",
            id: "b",
            name: "write_file",
            input: { path: "settings.ini", content: "[sleep]\nshow = sleep.show.picture\nfolder = plugins/owl/sleep\n" },
          },
          { type: "tool_use", id: "c", name: "check", input: {} },
          { type: "tool_use", id: "d", name: "look", input: { device: "X4", screen: "sleep" } },
        ],
      },
      { stop_reason: "end_turn", content: [{ type: "text", text: "Done: your owl shows while the reader sleeps.", citations: null }] },
    ] as Recording["answers"],
  };

  it("sends the picture with the words, and the tools build it in", async () => {
    const b = bench();
    b.files.write("plugin.ini", PLUGIN_INI);
    await b.uploads.add("owl.jpg", testPicture(1200, 900), fakeKit.size);
    const provider = new ReplayProvider(recording);
    const said: Anthropic.ContentBlockParam[] = [
      { type: "image", source: { type: "base64", media_type: "image/png", data: "AAAA" } },
      { type: "text", text: `${ADDED} picture "owl.jpg" (1200 x 900 pixels).` },
      { type: "text", text: recording.user[0]! },
    ];
    const end = await runTurn(
      { provider, project: b.project, tools: DATA_TOOLS, handbook: b.handbook, context: b.context, model: "claude-haiku-5-5", effort: "medium" },
      said,
    );
    expect(end).toBe("done");
    expect(provider.requests[0]!.messages[0]!.content).toEqual(said);
    // Every tool worked: no result is an error.
    const results = b.project.messages.flatMap((m) => (Array.isArray(m.content) ? m.content : [])).filter((c) => c.type === "tool_result");
    expect(results.filter((r) => (r as Anthropic.ToolResultBlockParam).is_error)).toEqual([]);
    expect(pngHeader(b.files.bytes()["sleep/1.png"]!)?.width).toBe(1264);
    expect(b.emulator.screenshots.at(-1)).toMatchObject({ profile: "xteink-x4", screen: "sleep" });
    expect(checkDataPlugin(b.files.bytes(), b.handbook.registry).filter((f) => f.level === "error")).toEqual([]);
    expect(lines(b.project.messages).slice(0, 3)).toEqual([
      { kind: "added", text: "owl.jpg" },
      { kind: "me", text: "Use my owl while the reader sleeps." },
      { kind: "ai", text: "I'll make your owl the sleep picture." },
    ]);
  });
});

describe("the example with a picture", () => {
  it("plays through with the real tools, no tool failing", async () => {
    const b = bench();
    const recording = sleepPicture as Recording;
    for (const name of recording.attach ?? []) await b.uploads.add(name, testPicture(1600, 1200), fakeKit.size);
    const provider = new ReplayProvider(recording);
    const end = await runTurn(
      { provider, project: b.project, tools: DATA_TOOLS, handbook: b.handbook, context: b.context, model: "claude-haiku-5-5", effort: "medium" },
      recording.user[0]!,
    );
    expect(end).toBe("done");
    expect(provider.done).toBe(true);
    const results = b.project.messages.flatMap((m) => (Array.isArray(m.content) ? m.content : [])).filter((c) => c.type === "tool_result");
    expect(results.filter((r) => (r as Anthropic.ToolResultBlockParam).is_error)).toEqual([]);
    expect(checkDataPlugin(b.files.bytes(), b.handbook.registry).filter((f) => f.level !== "info")).toEqual([]);
  });
});

describe("the plugin's limits, kept as files are written", () => {
  it("counts files, bytes and the size of a text file", () => {
    const { files } = bench();
    expect(files.write("settings.ini", "x".repeat(300 * 1024))).toContain("at most 256 KB");
    for (let i = 0; i < 64; i++) expect(files.write(`i18n/l${i}.ini`, "[meta]")).toBeNull();
    expect(files.write("one-more.ini", "x")).toContain("at most 64 files");
    expect(files.write("i18n/l0.ini", "[meta]\nlanguage = de\n")).toBeNull();
    expect(files.write("store/store.ini", "[store]")).toBeNull();
    expect(files.has("toString")).toBe(false);
    expect(files.remove("toString")).toBe(false);
  });

  it("puts a font where fonts go, and a text where texts go", async () => {
    const { context, uploads } = bench();
    await uploads.add("Owl.ttf", new Uint8Array([0, 1, 0, 0, 7]), fakeKit.size);
    expect((await placeFile.run({ upload: "owl.ttf", to: "settings.ini" }, context)).isError).toBe(true);
    expect((await placeFile.run({ upload: "owl.ttf", to: "fonts/Owl.otf" }, context)).isError).toBe(true);
    expect((await placeFile.run({ upload: "owl.ttf", to: "fonts/Owl.ttf" }, context)).isError).toBeFalsy();
  });
});

describe("a picture's size from its header", () => {
  it("reads PNG, GIF, WebP and JPEG without decoding", () => {
    expect(pictureSize(grayPng(7, 3, new Uint8Array(21), 8))).toEqual({ width: 7, height: 3 });
    const gif = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x40, 0x01, 0xc8, 0x00]);
    expect(pictureSize(gif)).toEqual({ width: 320, height: 200 });
    // A JPEG: SOI, an APP0 of 16 bytes, then a baseline frame of 6000 x 4000.
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, ...new Array(14).fill(0), 0xff, 0xc0, 0x00, 0x11, 0x08, 0x0f, 0xa0, 0x17, 0x70, 0x03]);
    expect(pictureSize(jpeg)).toEqual({ width: 6000, height: 4000 });
    const webp = new Uint8Array(30);
    webp.set([..."RIFF"].map((c) => c.charCodeAt(0)), 0);
    webp.set([..."WEBPVP8X"].map((c) => c.charCodeAt(0)), 8);
    webp.set([0xff, 0x0f, 0x00, 0x9f, 0x0f, 0x00], 24);
    expect(pictureSize(webp)).toEqual({ width: 4096, height: 4000 });
    expect(pictureSize(new Uint8Array([1, 2, 3]))).toBeUndefined();
  });

  it("scales a crop for a picture decoded smaller", () => {
    const { context } = bench();
    const x4 = targetsFor(context.profiles.filter((p) => p.id === "xteink-x4"));
    // The picture is 2000 x 2000; decoded at half its size.
    const half = { ...testRaster(1000, 1000, false), scale: 0.5 };
    const whole = { ...testRaster(2000, 2000, false) };
    const crop = { x: 800, y: 800, width: 400, height: 400 };
    const a = makePicture(half, "a.png", x4, { fit: "fill", crop, dither: "none" });
    const b = makePicture(whole, "a.png", x4, { fit: "fill", crop, dither: "none" });
    // The same part of it: the dark square in the middle, both times.
    const dark = (png: Uint8Array) => levelsOf(png).levels.filter((l) => l === 0).length / (480 * 800);
    expect(dark(a.files[0]!.png)).toBeGreaterThan(0.9);
    expect(dark(b.files[0]!.png)).toBeGreaterThan(0.9);
  });
});

describe("screenshots for the AI", () => {
  it("are no larger than any picture it is sent (the Boox's screen is)", async () => {
    const b = bench();
    const shots: { width: number; height: number }[] = [{ width: 1264, height: 1680 }, { width: 480, height: 800 }];
    b.emulator.screenshot = async () => ({ png: btoa(String.fromCharCode(...testPicture(126, 168))), ...shots.shift()! });
    const boox = await look.run({ device: "Boox Go 7" }, { ...b.context, pictures: fakeKit });
    const x4 = await look.run({ device: "X4" }, { ...b.context, pictures: fakeKit });
    const picture = (r: { content: unknown }) => (r.content as Anthropic.ImageBlockParam[])[0]!.source as Anthropic.Base64ImageSource;
    // The reduced copy (the fake kit's) for the Boox, the screenshot itself for the X4.
    expect(picture(boox).data).toBe("AAAA");
    expect(picture(x4).data).not.toBe("AAAA");
    expect(JSON.stringify(boox.content)).toContain("1264 x 1680");
  });
});

describe("PaperPaw stopped while nothing was asked", () => {
  it("is told to the AI at its next look, once", async () => {
    const b = bench();
    b.emulator.stopped = "PaperPaw did not answer in 10 seconds (a loop that does not end, or work far too long for a reader) and was stopped.";
    const first = JSON.stringify((await look.run({ device: "X4" }, b.context)).content);
    const second = JSON.stringify((await look.run({ device: "X4" }, b.context)).content);
    expect(first).toContain("Meanwhile: PaperPaw did not answer in 10 seconds");
    expect(second).not.toContain("Meanwhile");
  });
});
