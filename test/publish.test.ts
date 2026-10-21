import { unzipSync } from "fflate";
import { afterEach, describe, expect, it, vi } from "vitest";

import example from "../src/ai/examples/night-owl.json";
import { ReplayProvider, type Recording } from "../src/ai/replay";
import { entryProblems, readEntry, tagsFrom, writeEntry, EMPTY_ENTRY } from "../src/project/entry";
import { setIniValue } from "../src/project/ini";
import { pluginZip } from "../src/project/zip";
import { draftEntry } from "../src/publish/draft";
import { FakeStore } from "../src/publish/fake";
import { plannedShots, shotsIn, takeShots } from "../src/publish/screenshots";
import { SiteStore, StoreError } from "../src/publish/store";
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
    expect(request.thinking).toEqual({ type: "disabled" });
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

describe("the site's store", () => {
  afterEach(() => vi.unstubAllGlobals());

  const answer = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

  it("is none where the site has no such address", async () => {
    vi.stubGlobal("fetch", async () => new Response("<!doctype html>", { status: 200, headers: { "content-type": "text/html" } }));
    expect(await new SiteStore("http://localhost:8080").state("/workshop/")).toEqual({ kind: "none" });
    vi.stubGlobal("fetch", async () => {
      throw new TypeError("offline");
    });
    expect(await new SiteStore("http://localhost:8080").state("/workshop/")).toEqual({ kind: "none" });
  });

  it("says whether it is open and who is signed in", async () => {
    const store = new SiteStore("https://paperpaw.org");
    vi.stubGlobal("fetch", async () => answer(200, { store: "closed" }));
    expect(await store.state("/workshop/")).toEqual({ kind: "closed" });
    vi.stubGlobal("fetch", async () => answer(200, { store: "open", account: null }));
    expect(await store.state("/workshop/#/p/ab/share")).toEqual({
      kind: "signed-out",
      signIn: "https://paperpaw.org/account/sign-in?next=%2Fworkshop%2F%23%2Fp%2Fab%2Fshare",
    });
    vi.stubGlobal("fetch", async () => answer(200, { store: "open", account: { name: "Ada" }, csrf: "c" }));
    expect(await store.state("/workshop/")).toEqual({ kind: "signed-in", name: "Ada", csrf: "c" });
  });

  it("uploads as the form does and reads the draft", async () => {
    const calls: { url: string; init: RequestInit }[] = [];
    vi.stubGlobal("fetch", async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return answer(201, { submission: 7, passed: true, checks: [{ check: "manifest", status: "pass", message: "ok" }], draft: "/submit/7", page: "/submit/7/page" });
    });
    const store = new SiteStore("https://paperpaw.org");
    const draft = await store.upload({ package: pluginZip("night-owl", { "plugin.ini": new TextEncoder().encode(PLUGIN_INI) }) }, "c");
    expect(draft).toEqual({
      submission: 7,
      passed: true,
      checks: [{ check: "manifest", status: "pass", message: "ok" }],
      draftUrl: "https://paperpaw.org/submit/7",
      pageUrl: "https://paperpaw.org/submit/7/page",
    });
    const { url, init } = calls[0]!;
    expect(url).toBe("https://paperpaw.org/submit");
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>).Accept).toBe("application/json");
    const form = init.body as FormData;
    expect(form.get("csrf")).toBe("c");
    const zip = unzipSync(new Uint8Array(await (form.get("package") as Blob).arrayBuffer()));
    expect(Object.keys(zip)).toEqual(["night-owl/plugin.ini"]);
  });

  it("turns a refusal into the workshop's words, with the store's checks", async () => {
    vi.stubGlobal("fetch", async () =>
      answer(422, { error: "refused", message: "plugin.ini names no version.", checks: [{ check: "manifest", status: "fail", message: "no version" }] }),
    );
    const error = await new SiteStore("https://paperpaw.org").upload({ package: new Uint8Array() }, "c").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(StoreError);
    expect((error as StoreError).code).toBe("refused");
    expect((error as StoreError).checks).toEqual([{ check: "manifest", status: "fail", message: "no version" }]);
  });

  it("sends a draft with the session's token", async () => {
    let sent: { url: string; body: string } | undefined;
    vi.stubGlobal("fetch", async (url: string, init: RequestInit) => {
      sent = { url, body: String(init.body) };
      return answer(200, { submission: 7, state: "pending" });
    });
    await new SiteStore("https://paperpaw.org").send(7, "c");
    expect(sent).toEqual({ url: "https://paperpaw.org/submit/7/send", body: "csrf=c" });
  });
});

describe("the pretend store", () => {
  it("takes a package with plugin.ini from the signed-in author only", async () => {
    const store = new FakeStore();
    const pkg = pluginZip("night-owl", { "plugin.ini": new TextEncoder().encode(PLUGIN_INI) });
    await expect(store.upload({ package: pkg }, "wrong")).rejects.toMatchObject({ code: "expired" });
    const draft = await store.upload({ package: pkg }, "test-csrf");
    expect(draft.passed).toBe(true);
    await store.send(draft.submission, "test-csrf");
    expect(store.sent).toEqual([1]);
    await expect(store.upload({ package: pluginZip("x", {}) }, "test-csrf")).rejects.toMatchObject({ code: "refused" });
  });
});
