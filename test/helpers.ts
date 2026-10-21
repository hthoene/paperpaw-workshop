// The handbook as generated into public/handbook, read from disk, and a
// tool context around a project with the fake emulator.

import fs from "node:fs";
import path from "node:path";

import { FakeEmulator } from "../src/emulator/fake";
import { Handbook, SHOWN_PROFILES } from "../src/handbook/handbook";
import { Files, newProject, type Project } from "../src/project/project";
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
  );
}

export interface Bench {
  project: Project;
  files: Files;
  emulator: FakeEmulator;
  context: ToolContext;
  handbook: Handbook;
}

export function bench(project: Project = newProject()): Bench {
  const book = handbook();
  const files = new Files(project);
  const emulator = new FakeEmulator(book.registry);
  const profiles = SHOWN_PROFILES.map((id) => book.profile(id)!);
  const context: ToolContext = {
    files,
    emulator,
    handbook: book,
    profiles,
    sync: () => emulator.setFiles({ id: "plugin", files: files.bytes() }),
  };
  return { project, files, emulator, context, handbook: book };
}
