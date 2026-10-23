import { describe, expect, it } from "vitest";

import { Folders, fromBase64, toBase64, type FolderApi } from "./folders";

/** The Rust side's project calls, in memory: folders of path to base64. */
function memoryApi() {
  const folders = new Map<string, { meta: string; conversation: string; files: Map<string, string>; uploads: Map<string, string> }>();
  const writes: string[] = [];
  const api: FolderApi = {
    projectsList: async () => [...folders].map(([folder, f]) => ({ folder, meta: f.meta })),
    projectCreate: async (name, meta) => {
      let folder = name;
      for (let n = 2; folders.has(folder); n++) folder = `${name} ${n}`;
      folders.set(folder, { meta, conversation: "", files: new Map(), uploads: new Map() });
      return folder;
    },
    projectFiles: async (p) => [...folders.get(p)!.files].map(([path, b]) => ({ path, size: fromBase64(b).length })),
    projectRead: async (p, path) => folders.get(p)!.files.get(path)!,
    projectWrite: async (p, path, b) => { writes.push(path); folders.get(p)!.files.set(path, b); },
    projectRemove: async (p, path) => { folders.get(p)!.files.delete(path); },
    projectLoad: async (p) => [folders.get(p)!.meta, folders.get(p)!.conversation],
    projectSave: async (p, meta, conversation) => { Object.assign(folders.get(p)!, { meta, conversation }); },
    uploadsList: async (p) => [...folders.get(p)!.uploads].map(([path, b]) => ({ path, size: fromBase64(b).length })),
    uploadRead: async (p, n) => { const b = folders.get(p)!.uploads.get(n); if (!b) throw new Error("missing"); return b; },
    uploadWrite: async (p, n, b) => { folders.get(p)!.uploads.set(n, b); },
    uploadRemove: async (p, n) => { folders.get(p)!.uploads.delete(n); },
  };
  return { api, folders, writes };
}

describe("projects as folders", () => {
  it("keeps a project's files, conversation and record, and loads them back", async () => {
    const { api } = memoryApi();
    const folders = new Folders(api);
    const project = await folders.create("Night owl", "data", { "plugin.ini": "[plugin]\nid = night-owl\n" });
    expect(project.key).toBe("Night owl");
    project.files["style.ini"] = "[style]\n";
    project.files["icon.png"] = new Uint8Array([137, 80, 78, 71, 1, 2, 3]);
    project.messages.push({ role: "user", content: "a dark look" });
    project.usage.dollars = 0.004;
    await folders.save(project);

    const loaded = await new Folders(api).load("Night owl");
    expect(loaded.files["plugin.ini"]).toBe("[plugin]\nid = night-owl\n");
    expect(loaded.files["style.ini"]).toBe("[style]\n");
    expect(loaded.files["icon.png"]).toEqual(new Uint8Array([137, 80, 78, 71, 1, 2, 3]));
    expect(loaded.messages).toEqual([{ role: "user", content: "a dark look" }]);
    expect(loaded.usage.dollars).toBe(0.004);
    expect(loaded.kind).toBe("data");
    // The record keeps neither the files nor the conversation.
    expect(JSON.parse((await api.projectLoad("Night owl"))[0])).not.toHaveProperty("files");
  });

  it("writes only what changed, and removes what is gone", async () => {
    const { api, writes, folders: store } = memoryApi();
    const folders = new Folders(api);
    const project = await folders.create("P", "data", { "plugin.ini": "a", "style.ini": "b" });
    writes.length = 0;
    project.files["style.ini"] = "c";
    delete project.files["plugin.ini"];
    await folders.save(project);
    expect(writes).toEqual(["style.ini"]);
    expect([...store.get("P")!.files.keys()]).toEqual(["style.ini"]);
  });

  it("lists projects by their plugin's name or their folder", async () => {
    const { api } = memoryApi();
    const folders = new Folders(api);
    await folders.create("Clock", "code");
    expect(await folders.list()).toEqual([{ folder: "Clock", name: "Clock", kind: "code", updated: expect.any(String) }]);
  });

  it("keeps the drawer's files apart, by name", async () => {
    const { api } = memoryApi();
    const folders = new Folders(api);
    await folders.create("P");
    const uploads = folders.uploads();
    await uploads.put("P", "cat.png", new Uint8Array([1, 2]));
    expect(await uploads.get("P", "cat.png")).toEqual(new Uint8Array([1, 2]));
    expect(await uploads.get("P", "missing.png")).toBeUndefined();
    await uploads.remove("P", "cat.png");
    expect(await uploads.get("P", "cat.png")).toBeUndefined();
  });

  it("carries bytes through base64 unchanged", () => {
    const bytes = new Uint8Array(70_000).map((_, i) => i % 256);
    expect(fromBase64(toBase64(bytes))).toEqual(bytes);
  });
});
