import { unzipSync } from "fflate";
import { describe, expect, it } from "vitest";

import { GROUPS as ENTRY_GROUPS } from "../project/entry";
import { newProject } from "../project/project";
import {
  GROUPS,
  higher,
  holds,
  raised,
  recordPublished,
  sdkOf,
  storeEntry,
  storeIniPath,
  uploadPackage,
  versionState,
  withCrateVersion,
  withStore,
  withVersion,
} from "./publishing";

const INI = "[plugin]\nid = night-owl\nname = Night owl\nversion = 1.0.0\nformats = 1\n";

function owl() {
  return newProject("data", { "plugin.ini": INI, "settings.ini": "[core]\nui-row = 180\n", "store/store.ini": "[store]\ngroup = look\n" });
}

describe("publishing a plugin", () => {
  it("packs it as the upload form takes it: its folder named as its id, store/ inside, the same bytes each time", () => {
    const project = owl();
    project.files["store/home.png"] = new Uint8Array([137, 80, 78, 71]);
    const packed = uploadPackage(project);
    if (!packed.ok) throw new Error(packed.problems.join("; "));
    expect(packed.name).toBe("night-owl-1.0.0-upload.zip");
    const files = unzipSync(packed.zip);
    expect(Object.keys(files)).toEqual(["night-owl/plugin.ini", "night-owl/settings.ini", "night-owl/store/home.png", "night-owl/store/store.ini"]);
    expect(new TextDecoder().decode(files["night-owl/plugin.ini"])).toBe(INI);
    const again = uploadPackage({ ...project, files: { ...project.files } });
    expect(again.ok && again.zip).toEqual(packed.zip);
  });

  it("says what the form would refuse instead of packing it", () => {
    const project = owl();
    project.files["notes.docx"] = new Uint8Array([1]);
    project.files["store/huge.png"] = new Uint8Array(600_000);
    for (let i = 0; i < 64; i++) project.files[`i18n/x${i}.ini`] = "[messages]\n";
    const packed = uploadPackage(project);
    expect(packed.ok).toBe(false);
    const problems = packed.ok ? [] : packed.problems;
    expect(problems.some((p) => p.startsWith("notes.docx:"))).toBe(true);
    expect(problems.some((p) => p.startsWith("store/huge.png: a screenshot"))).toBe(true);
    expect(problems.some((p) => p.includes("at most 64 files"))).toBe(true);
    expect(uploadPackage(newProject("data", { "settings.ini": "" })).ok).toBe(false);
  });

  it("wants a version higher than the last one packed, and raises it", () => {
    expect(higher("1.0.10", "1.0.9")).toBe(true);
    expect(higher("1.0.0", "1.0.0")).toBe(false);
    expect(higher("0.9.9", "1.0.0")).toBe(false);
    expect(raised("1.2.3")).toBe("1.2.4");
    expect(withVersion("[plugin]\nid = a\nversion = 1.0.0\n\n[other]\nversion = 7\n", "1.0.1")).toBe("[plugin]\nid = a\nversion = 1.0.1\n\n[other]\nversion = 7\n");

    const project = owl();
    expect(versionState(project)).toEqual({ ok: true, version: "1.0.0" });
    recordPublished(project, "1.0.0", new Date("2026-10-23T10:00:00Z"));
    expect(versionState(project)).toEqual({ ok: false, why: "not-higher", version: "1.0.0", last: "1.0.0", again: true });
    project.files["plugin.ini"] = withVersion(INI, "0.9.0");
    expect(versionState(project)).toMatchObject({ ok: false, why: "not-higher", again: false });
    project.files["plugin.ini"] = withVersion(INI, "1.0.1");
    expect(versionState(project)).toEqual({ ok: true, version: "1.0.1" });
    project.files["plugin.ini"] = withVersion(INI, "1.0");
    expect(versionState(project)).toMatchObject({ ok: false, why: "invalid" });

    // Packed again as the same version: one record, its time the last.
    recordPublished(project, "1.0.0", new Date("2026-10-24T10:00:00Z"));
    expect(project.published).toEqual([{ version: "1.0.0", packed: "2026-10-24T10:00:00.000Z" }]);
  });

  it("packs a plugin with code as its folder plugin/, its crate and its build apart", () => {
    const project = newProject("code", {
      "Cargo.toml": "[package]\nname = \"night-owl\"\n",
      "src/lib.rs": "#![no_std]",
      "plugin/plugin.ini": INI,
      "plugin/i18n/de.ini": "[messages]\n",
    });
    project.files["plugin/code.ppn"] = new Uint8Array([1, 2, 3]);
    const packed = uploadPackage(project);
    if (!packed.ok) throw new Error(packed.problems.join("; "));
    expect(Object.keys(unzipSync(packed.zip))).toEqual(["night-owl/i18n/de.ini", "night-owl/plugin.ini"]);
  });

  it("raises a plugin with code's version in its crate too", () => {
    expect(withCrateVersion("[package]\nname = \"a\"\nversion = \"1.0.0\"\n\n[dependencies]\nx = { version = \"1.0.0\" }\n", "1.0.1")).toBe(
      "[package]\nname = \"a\"\nversion = \"1.0.1\"\n\n[dependencies]\nx = { version = \"1.0.0\" }\n",
    );
  });
});

describe("the store file", () => {
  it("says what it holds in plain words", () => {
    expect(holds(["package"])).toBe("the plugin");
    expect(holds(["package", "x4", "source"])).toBe("the plugin, its build for the X4 and its source");
    expect(holds(["package", "x4", "x4-pro", "source"])).toBe("the plugin, its build for the X4, its build for the X4 Pro and its source");
  });
});

describe("the store entry", () => {
  it("takes how it works into a plugin with code's folder, where the store reads it", () => {
    const project = newProject("code", {
      "Cargo.toml": "[package]\nname = \"snake\"\n",
      "src/lib.rs": "#![no_std]",
      "how/en.txt": "Steer the snake with the buttons.",
      "how/de.txt": "Steuere die Schlange mit den Tasten.",
      "plugin/plugin.ini": "[plugin]\nid = snake\nname = Snake\nversion = 0.1.1\n",
    });
    const packed = uploadPackage(project);
    if (!packed.ok) throw new Error(packed.problems.join("; "));
    const files = unzipSync(packed.zip);
    expect(Object.keys(files)).toEqual(["snake/how/de.txt", "snake/how/en.txt", "snake/plugin.ini"]);
    expect(new TextDecoder().decode(files["snake/how/en.txt"])).toBe("Steer the snake with the buttons.");
    // The folder's own how/ wins.
    project.files["plugin/how/en.txt"] = "Its own.";
    const own = uploadPackage(project);
    if (!own.ok) throw new Error(own.problems.join("; "));
    expect(new TextDecoder().decode(unzipSync(own.zip)["snake/how/en.txt"])).toBe("Its own.");
  });

  it("is read and completed in store.ini, in the plugin's folder", () => {
    const code = newProject("code", { "plugin/store/store.ini": "# For the store.\n[store]\nsummary = A game.\ngroup = games\n" });
    expect(storeIniPath(code)).toBe("plugin/store/store.ini");
    expect(storeEntry(code)).toEqual({ licence: undefined, group: "games", sdk: undefined });
    expect(storeEntry(newProject("data", { "store/store.ini": "[store]\ngroup = fun\n" })).group).toBeUndefined();
    expect(withStore(code.files["plugin/store/store.ini"] as string, { licence: "MIT", sdk: "0.5", group: "tools" })).toBe(
      "# For the store.\n[store]\nsummary = A game.\ngroup = tools\nlicence = MIT\nsdk = 0.5\n",
    );
    expect(withStore("", { group: "games" })).toBe("[store]\ngroup = games\n");
    expect(withStore("[screenshots]\nhome.png = The board\n", { licence: "MIT" })).toBe(
      "[store]\nlicence = MIT\n\n[screenshots]\nhome.png = The board\n",
    );
    expect(withStore("[store]\n\n[i18n.de]\nname = Schlange\n", { sdk: "0.5" })).toBe("[store]\nsdk = 0.5\n\n[i18n.de]\nname = Schlange\n");
  });

  it("names the SDK as the store wants it, and the store's groups", () => {
    expect(sdkOf("0.5.0-beta.4")).toBe("0.5");
    expect(sdkOf("1.2.3\n")).toBe("1.2");
    expect(GROUPS.map((g) => g.id)).toEqual([
      "reading", "formats", "library", "sync", "home", "look", "notes", "learning", "news", "tools", "games", "system",
    ]);
    // The same as the store entry the AI drafts knows.
    expect(GROUPS.map((g) => g.id).sort()).toEqual([...ENTRY_GROUPS].sort());
  });
});
