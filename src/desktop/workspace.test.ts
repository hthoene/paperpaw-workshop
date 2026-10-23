import { describe, expect, it } from "vitest";

import { standInBackend } from "./backend";
import { newProject, shownName } from "../project/project";
import { Workspace } from "./workspace";

const notMeasured = async () => ({ width: 0, height: 0 });

describe("the workspace", () => {
  it("makes a project for the first file, keeps the file and lists it", async () => {
    const backend = standInBackend();
    const workspace = new Workspace(backend);
    let told = 0;
    workspace.subscribe(() => told++);
    expect(workspace.project).toBeNull();
    const uploads = await workspace.uploads();
    const info = await uploads.add("Words List.txt", new TextEncoder().encode("hello words"), notMeasured);
    await workspace.save();
    expect(info.name).toBe("words-list.txt");
    expect(workspace.project?.uploads?.map((u) => u.name)).toEqual(["words-list.txt"]);
    expect(told).toBeGreaterThan(0);
    // Kept with the project: in its folder, and in its record.
    expect((await backend.uploadsList("New plugin")).map((f) => f.path)).toEqual(["words-list.txt"]);
    const loaded = await new Workspace(backend).folders.load("New plugin");
    expect(loaded.uploads?.map((u) => u.name)).toEqual(["words-list.txt"]);
  });

  it("opens a project from the list, and starts a fresh one", async () => {
    const backend = standInBackend();
    const workspace = new Workspace(backend);
    await workspace.ensure("Clock");
    workspace.fresh();
    expect(workspace.project).toBeNull();
    await workspace.refresh();
    expect(workspace.listed.map((p) => p.folder)).toEqual(["Clock"]);
    await workspace.open("Clock");
    expect(workspace.project?.key).toBe("Clock");
    expect(workspace.name).toBe("Clock");
  });
});

describe("a plugin's name", () => {
  it("is read from its English catalog where plugin.ini names a key", () => {
    const project = newProject();
    project.files["plugin.ini"] = "[plugin]\nid = calm\nname = calm.name\n";
    expect(shownName(project)).toBe("calm.name");
    project.files["i18n/en.ini"] = "[meta]\nlanguage = en\n\n[messages]\ncalm.name = Calm look\n";
    expect(shownName(project)).toBe("Calm look");
    project.files["plugin.ini"] = "[plugin]\nid = calm\nname = Just a name\n";
    expect(shownName(project)).toBe("Just a name");
  });
});

describe("many plugins", () => {
  it("are renamed, put away in the archive, brought back and binned", async () => {
    const backend = standInBackend();
    const workspace = new Workspace(backend);
    await workspace.ensure("Clock");
    await workspace.rename("Clock", "Big clock");
    expect(workspace.project?.key).toBe("Big clock");
    await workspace.archive("Big clock");
    expect(workspace.project).toBeNull();
    expect(workspace.listed).toEqual([]);
    expect((await workspace.folders.archived()).map((p) => p.folder)).toEqual(["Big clock"]);
    await workspace.restore("Big clock");
    expect(workspace.listed.map((p) => p.folder)).toEqual(["Big clock"]);
    await workspace.trash("Big clock");
    expect(workspace.listed).toEqual([]);
  });
});
