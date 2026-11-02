import { describe, expect, it } from "vitest";

import example from "../src/ai/examples/night-owl.json";
import { ReplayProvider, type Recording } from "../src/ai/replay";
import { entryProblems, readEntry, tagsFrom, writeEntry, EMPTY_ENTRY } from "../src/project/entry";
import { newProject } from "../src/project/project";
import { setIniValue } from "../src/project/ini";
import { draftStoreEntry } from "../src/desktop/publishing";
import { draftEntry } from "../src/publish/draft";
import { plannedShots, shotsIn, takeShots } from "../src/publish/screenshots";
import { setEntry } from "../src/tools/entry";
import { bench } from "./helpers";

const PLUGIN_INI = "[plugin]\nid = night-owl\nname = Night owl\nversion = 1.0.0\nformats = 1\n";

describe("the store entry", () => {
  it("is written and read back as the store's form reads it", () => {
    const { files } = bench();
    const entry = {
      summary: "A calm dark look.",
      description: "Light letters\non a dark page.",
      group: "look" as const,
      tags: ["dark", "night"],
      licence: "CC0-1.0",
      source: "",
      devices: [] as never[],
      alts: { "1-x4.png": "Night owl on the X4" },
    };
    expect(writeEntry(files, entry)).toBeNull();
    expect(files.read("store/store.ini")).toBe(
      "[store]\nsummary = A calm dark look.\ndescription = Light letters on a dark page.\ngroup = look\ntags = dark, night\nlicence = CC0-1.0\n\n[screenshots]\n1-x4.png = Night owl on the X4\n",
    );
    expect(readEntry(files)).toEqual({ ...entry, description: "Light letters on a dark page." });
  });

  it("says what the store would refuse, in catalog keys", () => {
    expect(entryProblems(EMPTY_ENTRY, "").map((p) => p.key)).toEqual([
      "share.problem.name",
      "share.problem.summary",
      "share.problem.group",
      "share.problem.licence",
    ]);
    const fine = { ...EMPTY_ENTRY, summary: "Calm.", group: "look" as const, licence: "MIT", tags: ["dark"] };
    expect(entryProblems(fine, "Night owl")).toEqual([]);
    expect(entryProblems({ ...fine, tags: ["Dark Mode"] }, "Night owl").map((p) => p.key)).toEqual(["share.problem.tag"]);
  });

  it("takes tags as people type them", () => {
    expect(tagsFrom("Dark, big letters,, dark ")).toEqual(["dark", "big-letters"]);
  });

  it("is drafted by set_entry, keeping what the author chose", async () => {
    const { files, context } = bench();
    writeEntry(files, { ...EMPTY_ENTRY, licence: "MIT", alts: { "1-x4.png": "Mine" } });
    const result = await setEntry.run({ summary: "Calm.", group: "look" }, context);
    expect(result.isError).toBeFalsy();
    expect(readEntry(files)).toMatchObject({ summary: "Calm.", group: "look", licence: "MIT", alts: { "1-x4.png": "Mine" } });
  });

  it("names the devices a plugin is for, as the store's form takes them, and keeps them", async () => {
    const { files, context } = bench();
    const result = await setEntry.run({ summary: "Calm.", group: "look", devices: ["x4", "x4-pro"] }, context);
    expect(result.isError).toBeFalsy();
    expect(files.read("store/store.ini")).toContain("devices = x4, x4-pro\n");
    expect(readEntry(files).devices).toEqual(["x4", "x4-pro"]);
    // Drafting again without devices leaves them; every device is none named.
    await setEntry.run({ summary: "Calmer.", group: "look" }, context);
    expect(readEntry(files).devices).toEqual(["x4", "x4-pro"]);
    await setEntry.run({ summary: "Calmer.", group: "look", devices: ["android", "x4", "x4-pro", "x4-classic"] }, context);
    expect(readEntry(files).devices).toEqual([]);
    expect(files.read("store/store.ini")).not.toContain("devices");
    // A name the store does not know is not kept.
    files.write("store/store.ini", "[store]\nsummary = A.\ngroup = look\ndevices = x4, x9, android\n");
    expect(readEntry(files).devices).toEqual(["x4", "android"]);
  });

  it("refuses devices for a plugin with code: it is for the readers it has builds for", async () => {
    const { files, context } = bench(newProject("code"));
    const result = await setEntry.run({ summary: "Calm.", group: "look", devices: ["x4"] }, context);
    expect(result.isError).toBe(true);
    expect(result.content).toMatch(/builds/);
    expect(files.read("plugin/store/store.ini")).toBeUndefined();
  });

  it("is drafted from the desktop's Publish view with the workshop's AI and the data model", async () => {
    const { project, files, context } = bench();
    files.write("plugin.ini", PLUGIN_INI);
    project.messages.push({ role: "user", content: "A calm dark look for reading at night." });
    const provider = new ReplayProvider(example as Recording);
    const input = await draftStoreEntry({ ai: provider, project, toolContext: () => context });
    expect(input.group).toBe("look");
    expect(readEntry(files).summary).toMatch(/^A calm dark look/);
    expect(provider.requests).toHaveLength(1);
    expect(provider.requests[0]!.model).toBe("claude-haiku-5-5");
  });

  it("is drafted from the conversation in one request that offers set_entry alone", async () => {
    const { project, files, context } = bench();
    files.write("plugin.ini", PLUGIN_INI);
    project.messages.push({ role: "user", content: "A calm dark look for reading at night." });
    const provider = new ReplayProvider(example as Recording);
    const input = await draftEntry(provider, "claude-haiku-5-5", project, context);
    expect(input.group).toBe("look");
    expect(readEntry(files).summary).toMatch(/^A calm dark look/);
    const request = provider.requests[0]!;
    // Named in the prompt, not forced: current models refuse a forced choice.
    expect(request.tool_choice).toBeUndefined();
    expect(request.tools?.map((t) => ("name" in t ? t.name : ""))).toEqual(["set_entry"]);
    expect(request.system).toContain("Call set_entry once");
    // No thinking switch (Sonnet and Opus 5.5 refuse "disabled"); low effort.
    expect(request.thinking).toBeUndefined();
    expect(request.output_config).toEqual({ effort: "low" });
    expect(JSON.stringify(request.messages)).toContain("A calm dark look for reading at night.");
    // Not part of the conversation, but paid for.
    expect(project.messages).toHaveLength(1);
    expect(project.usage.dollars).toBeGreaterThan(0);
  });
});

describe("the screenshots", () => {
  it("are taken on each device and once at night, numbered in the store's order", async () => {
    const { files, emulator, context } = bench();
    files.writeBytes("store/old.png", new Uint8Array([1]));
    const shots = plannedShots(context.profiles, (device, dark) => `${device}${dark ? " at night" : ""}`);
    expect(shots.map((s) => [s.file, s.alt])).toEqual([
      ["1-x4.png", "X4"],
      ["2-x4-pro.png", "X4 Pro"],
      ["3-boox-go-7.png", "Boox Go 7"],
      ["4-x4-night.png", "X4 at night"],
    ]);
    const { kept } = await takeShots(emulator, files, shots);
    expect(kept).toHaveLength(4);
    expect(shotsIn(files)).toEqual(["1-x4.png", "2-x4-pro.png", "3-boox-go-7.png", "4-x4-night.png"]);
    expect(emulator.screenshots.map((s) => [s.profile, s.dark])).toEqual([
      ["xteink-x4", false],
      ["xteink-x4-pro", false],
      ["boox-go-7", false],
      ["xteink-x4", true],
    ]);
  });

  it("go to the store but not onto a reader", () => {
    const { files } = bench();
    files.write("plugin.ini", PLUGIN_INI);
    files.writeBytes("store/1-x4.png", new Uint8Array([1]));
    expect(Object.keys(files.bytes())).toEqual(["plugin.ini", "store/1-x4.png"]);
    expect(Object.keys(files.bytes({ store: false }))).toEqual(["plugin.ini"]);
  });
});

describe("plugin.ini", () => {
  it("has a value changed in place, or added to its section", () => {
    expect(setIniValue(PLUGIN_INI, "plugin", "name", "Owl")).toBe(PLUGIN_INI.replace("Night owl", "Owl"));
    expect(setIniValue("[plugin]\nid = a\n\n[other]\nx = 1\n", "plugin", "name", "A")).toBe("[plugin]\nid = a\nname = A\n\n[other]\nx = 1\n");
    expect(setIniValue("", "plugin", "name", "A")).toBe("[plugin]\nname = A\n");
  });
});
