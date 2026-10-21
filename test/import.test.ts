import { zipSync } from "fflate";
import { describe, expect, it } from "vitest";

import { ImportProblem, importPlugin, zipEntries } from "../src/project/import";
import { Files, newProject } from "../src/project/project";
import { pluginZip } from "../src/project/zip";
import { handbook } from "./helpers";

const text = (s: string) => new TextEncoder().encode(s);
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]);

describe("importing a plugin", () => {
  it("takes back what the workshop gives for the store, pictures included", () => {
    const made = newProject("data");
    const files = new Files(made);
    files.write("plugin.ini", "[plugin]\nid = calm\nname = Calm\nversion = 1.0.0\n");
    files.write("i18n/de.ini", "[messages]\ncalm.title = Ruhig\n");
    files.writeBytes("store/screenshots/home.png", PNG);
    const back = importPlugin(zipEntries(pluginZip("calm", files.bytes())));
    expect(back.project.kind).toBe("data");
    expect(back.taken).toEqual(["i18n/de.ini", "plugin.ini", "store/screenshots/home.png"]);
    expect(back.project.files["plugin.ini"]).toBe(made.files["plugin.ini"]);
    expect(back.project.files["store/screenshots/home.png"]).toEqual(PNG);
    expect(back.skipped).toEqual([]);
    expect(back.project.key).not.toBe(made.key);
  });

  it("takes a plugin with code from its source, as a forge's ZIP has it", () => {
    const sample = handbook().codeSample;
    const repo: Record<string, Uint8Array> = {};
    for (const [path, content] of Object.entries(sample)) repo[`clock-1.0.0/${path}`] = text(content);
    repo["clock-1.0.0/.github/workflows/build.yml"] = text("name: Build\n");
    repo["clock-1.0.0/build.sh"] = text("#!/bin/sh\n");
    repo["clock-1.0.0/plugin/code.ppn"] = new Uint8Array([1, 2, 3]);
    const back = importPlugin(zipEntries(zipSync(repo)));
    expect(back.project.kind).toBe("code");
    expect(back.taken).toContain("src/lib.rs");
    expect(back.taken).toContain("plugin/plugin.ini");
    expect(back.project.files["src/lib.rs"]).toBe(sample["src/lib.rs"]);
    const why = Object.fromEntries(back.skipped.map((s) => [s.path, s.why]));
    expect(why[".github/workflows/build.yml"]).toContain("dot");
    expect(Object.keys(why)).toContain("build.sh");
    expect(why["plugin/code.ppn"]).toContain("build");
  });

  it("finds the plugin in a folder chosen around it, and says what is outside", () => {
    const back = importPlugin({
      "Downloads/notes.txt": text("x"),
      "Downloads/calm/plugin.ini": text("[plugin]\nid = calm\n"),
      "Downloads/calm/settings.ini": text("[core]\n"),
    });
    expect(back.taken).toEqual(["plugin.ini", "settings.ini"]);
    expect(back.skipped).toEqual([{ path: "(1 files outside Downloads/calm/)", why: "not the plugin's" }]);
  });

  it("says why it takes nothing", () => {
    expect(() => importPlugin({ "readme.md": text("hi") })).toThrow(ImportProblem);
    expect(() => importPlugin({ "clock/plugin.ini": text("[plugin]\n"), "clock/code.ppn": new Uint8Array([1]) })).toThrow(/source/);
    expect(() => zipEntries(text("not a zip"))).toThrow(ImportProblem);
  });
});
