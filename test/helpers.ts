// The handbook as generated into public/handbook, read from disk, and a
// tool context around a project with the fake emulator.

import fs from "node:fs";
import path from "node:path";

import { FakeEmulator } from "../src/emulator/fake";
import { Handbook, SHOWN_PROFILES } from "../src/handbook/handbook";
import type { Raster } from "../src/pictures/gray";
import type { PictureKit } from "../src/pictures/kit";
import { Files, newProject, type Project } from "../src/project/project";
import { MemoryUploads, Uploads } from "../src/project/uploads";
import type { ToolContext } from "../src/tools/tool";

const dir = path.resolve(import.meta.dirname, "../public/handbook");

export function handbook(): Handbook {
  const json = (name: string) => JSON.parse(fs.readFileSync(path.join(dir, name), "utf8"));
  return new Handbook(
    json("meta.json"),
    fs.readFileSync(path.join(dir, "data.md"), "utf8"),
    json("index.json"),
    json("registry.json"),
    async (file) => fs.readFileSync(path.join(dir, "topics", file), "utf8"),
    fs.readFileSync(path.join(dir, "code.md"), "utf8"),
    json("code-sample.json"),
    async () => json("sdk-items.json"),
  );
}

export interface Bench {
  project: Project;
  files: Files;
  emulator: FakeEmulator;
  uploads: Uploads;
  context: ToolContext;
  handbook: Handbook;
}

export function bench(project: Project = newProject()): Bench {
  const book = handbook();
  const files = new Files(project);
  const emulator = new FakeEmulator(book.registry);
  const profiles = SHOWN_PROFILES.map((id) => book.profile(id)!);
  const uploads = new Uploads(project, new MemoryUploads());
  let shown = profiles[0]!;
  const context: ToolContext = {
    files,
    emulator,
    handbook: book,
    profiles,
    sync: () => emulator.setFiles({ id: "plugin", files: files.bytes() }),
    uploads,
    pictures: fakeKit,
    reader: {
      shown: () => shown,
      show: async (profile) => {
        shown = profile;
        await emulator.start(profile, false, { id: "plugin", files: files.bytes() });
      },
      useModule: (url) => emulator.useModule(url),
    },
  };
  return { project, files, emulator, uploads, context, handbook: book };
}

/** A picture of `width` x `height`: a gradient with a darker square in
 *  the middle and some noise (a photo), or two flat grays (a drawing). */
export function testRaster(width: number, height: number, noisy = true): Raster {
  const data = new Uint8ClampedArray(width * height * 4);
  let seed = 7;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const inside = Math.abs(x - width / 2) < width / 5 && Math.abs(y - height / 2) < height / 5;
      const v = noisy ? (x / width) * 200 + random() * 40 + (inside ? -60 : 30) : inside ? 30 : 230;
      data.set([v, v, v, 255], (y * width + x) * 4);
    }
  }
  return { width, height, data };
}

/** A test picture: a PNG signature (so uploads take it for one), then
 *  its size in tens of pixels and whether it is a photo. The fake kit
 *  "decodes" it to `testRaster`. */
export function testPicture(width: number, height: number, noisy = true): Uint8Array {
  return new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, width / 10, height / 10, noisy ? 1 : 0]);
}

export const fakeKit: PictureKit = {
  async size(bytes) {
    return { width: bytes[8]! * 10, height: bytes[9]! * 10 };
  },
  async decode(bytes) {
    return testRaster(bytes[8]! * 10, bytes[9]! * 10, bytes[10] === 1);
  },
  async forAi(bytes, _type, crop) {
    return { data: "AAAA", mediaType: "image/png", width: crop?.width ?? bytes[8]! * 10, height: crop?.height ?? bytes[9]! * 10 };
  },
};
