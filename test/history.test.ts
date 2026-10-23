import type Anthropic from "@anthropic-ai/sdk";
import { zipSync } from "fflate";
import { describe, expect, it } from "vitest";

import { ReplayProvider, type Answer } from "../src/ai/replay";
import { standInBackend } from "../src/desktop/backend";
import { Checker } from "../src/desktop/checks";
import { Desk } from "../src/desktop/desk";
import { toBase64 } from "../src/desktop/folders";
import { afterAnswers, packedVersions, shownDate, today } from "../src/desktop/history";
import { Workspace } from "../src/desktop/workspace";
import { handbook } from "./helpers";

const INI = "[plugin]\nid = calm\nname = Calm\nversion = 1.0.0\n";

function call(id: string, name: string, input: Record<string, unknown>): Answer {
  return { content: [{ type: "tool_use", id, name, input } as Anthropic.ContentBlock], stop_reason: "tool_use" };
}

function said(text: string): Answer {
  return { content: [{ type: "text", text, citations: null } as Anthropic.ContentBlock], stop_reason: "end_turn" };
}

function bench(answers: Answer[], user: string[]) {
  const backend = standInBackend();
  backend.emulatorStart = async () => {};
  const provider = new ReplayProvider({ title: "history", user, answers });
  const workspace = new Workspace(backend);
  const desk = new Desk(workspace, backend, new Checker({ pluginCheck: async () => [] }), handbook(), provider, "claude");
  return { backend, workspace, desk };
}

describe("the history", () => {
  it("keeps the plugin before the first change and after each answer that changed it", async () => {
    const { desk, workspace } = bench(
      [
        call("t1", "write_file", { path: "plugin.ini", content: INI }),
        said("Made."),
        said("Hello again."),
        call("t2", "write_file", { path: "plugin.ini", content: INI.replace("1.0.0", "1.1.0") }),
        said("Raised."),
      ],
      ["A calm look", "Hello", "Raise it"],
    );
    await desk.send("A calm look");
    const first = workspace.project!.messages.length;
    expect(desk.history.snapshots.map((s) => s.kind)).toEqual(["answer", "start"]);
    await desk.send("Hello");
    expect(desk.history.snapshots).toHaveLength(2);
    await desk.send("Raise it");
    const project = workspace.project!;
    expect(desk.history.snapshots.map((s) => s.kind)).toEqual(["answer", "answer", "start"]);
    // Each answer that changed the plugin has its state, where its turn ends.
    const states = afterAnswers(desk.history, 0);
    expect([...states.keys()].sort((a, b) => a - b)).toEqual([0, first, project.messages.length]);
    expect(project.turns!.map((t) => t.end)).toContain(first);
  });

  it("goes back to a state after a look at it, and forward again", async () => {
    const { desk, workspace, backend } = bench(
      [
        call("t1", "write_file", { path: "plugin.ini", content: INI }),
        said("Made."),
        call("t2", "write_file", { path: "home.ini", content: "[home]\n" }),
        said("Added a home screen."),
      ],
      ["A calm look", "A home screen"],
    );
    await desk.send("A calm look");
    const made = desk.history.current!;
    await desk.send("A home screen");
    const later = desk.history.current!;
    let synced = 0;
    backend.emulatorSync = async () => void synced++;
    // A look first: the project stays as it is, nothing can be sent.
    await desk.preview(made);
    expect(desk.previewing).toEqual({ id: made, ready: true, problem: "" });
    expect(workspace.project!.files["home.ini"]).toBe("[home]\n");
    expect(await desk.send("Something else")).toBe(false);
    await desk.endPreview();
    expect(desk.previewing).toBeNull();
    expect(synced).toBe(1);
    // Back: the home screen gone, kept as a state of its own.
    await desk.preview(made);
    await desk.restore(made);
    expect(workspace.project!.files["home.ini"]).toBeUndefined();
    expect(workspace.project!.files["plugin.ini"]).toBe(INI);
    expect(desk.history.snapshots[0]).toMatchObject({ kind: "restore", from: made });
    expect(desk.previewing).toBeNull();
    // Forward again, the same way.
    await desk.restore(later);
    expect(workspace.project!.files["home.ini"]).toBe("[home]\n");
    expect(desk.history.snapshots.map((s) => s.kind)).toEqual(["restore", "restore", "answer", "answer", "start"]);
    // The conversation stays as it was.
    expect(workspace.project!.messages.length).toBeGreaterThan(4);
  });

  it("marks the versions packed for the store", async () => {
    const { desk } = bench([call("t1", "write_file", { path: "plugin.ini", content: INI }), said("Made.")], ["A calm look"]);
    await desk.send("A calm look");
    await desk.markPublished("1.0.0");
    expect(packedVersions(desk.history)).toEqual([{ version: "1.0.0", date: today(), id: desk.history.current }]);
    expect(shownDate("2026-10-23")).toBe("23 Oct 2026");
  });

  it("imports a plugin's ZIP as a new project whose history starts there", async () => {
    const { desk, workspace, backend } = bench([], []);
    const zip = zipSync({ "calm/plugin.ini": new TextEncoder().encode(INI), "calm/i18n/en.ini": new TextEncoder().encode("[messages]\n") });
    backend.importRead = async () => toBase64(zip);
    const said = await desk.importFile("calm.zip");
    expect(said).toBe("Imported 2 files.");
    expect(workspace.project!.files["plugin.ini"]).toBe(INI);
    expect(workspace.project!.key).toBe("Calm");
    expect(desk.history.snapshots.map((s) => s.kind)).toEqual(["import"]);
  });

  it("brings back an export of the workshop beside the projects there", async () => {
    const { desk, workspace, backend } = bench([], []);
    const folder = await backend.projectCreate("Clock 2", JSON.stringify({ kind: "data", usage: {} }));
    backend.projectsImport = async () => [[folder, false], ["Old", true]];
    expect(await desk.importFile("all.zip")).toBe("2 plugins are back, with their history and conversations.");
    expect(workspace.project!.key).toBe("Clock 2");
  });
});
