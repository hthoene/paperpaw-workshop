import type Anthropic from "@anthropic-ai/sdk";
import { describe, expect, it, vi } from "vitest";

import { ReplayProvider, type Answer } from "../src/ai/replay";
import { lines } from "../src/app/conversation";
import { standInBackend } from "../src/desktop/backend";
import { Checker, type Found } from "../src/desktop/checks";
import { Desk } from "../src/desktop/desk";
import { Workspace } from "../src/desktop/workspace";
import { CHECKED } from "../src/project/project";
import { handbook } from "./helpers";

const INI = "[plugin]\nid = calm\nname = calm.name\nversion = 1.0.0\n";

function call(id: string, name: string, input: Record<string, unknown>): Answer {
  return { content: [{ type: "tool_use", id, name, input } as Anthropic.ContentBlock], stop_reason: "tool_use" };
}

function said(text: string): Answer {
  return { content: [{ type: "text", text, citations: null } as Anthropic.ContentBlock], stop_reason: "end_turn" };
}

const cut: Found = { check: "package.settings", level: "error", place: "plugin.ini:3", message: "no such name", seen: ["xteink-x4 en light default"] };

describe("the desk", () => {
  it("gives the AI what PaperPaw's checks find after a change, until they pass", async () => {
    const backend = standInBackend();
    backend.emulatorStart = async () => {};
    const found = [[cut], []];
    const checker = new Checker({ pluginCheck: async () => found.shift() ?? [] });
    const provider = new ReplayProvider({
      title: "calm",
      user: ["A calm look"],
      answers: [
        call("t1", "write_file", { path: "plugin.ini", content: INI }),
        said("I made a calm look."),
        call("t2", "edit_file", { path: "plugin.ini", edits: [{ old: "name = calm.name", new: "name = Calm" }] }),
        said("Fixed the name."),
      ],
    });
    const workspace = new Workspace(backend);
    const desk = new Desk(workspace, backend, checker, handbook(), provider, "claude");

    await desk.send("A calm look");

    expect(provider.done).toBe(true);
    const fix = provider.requests[2]!;
    const last = fix.messages.at(-1)!;
    const text = typeof last.content === "string" ? last.content : (last.content.at(-1) as Anthropic.TextBlockParam).text;
    expect(text.startsWith(`${CHECKED} 1 to fix`)).toBe(true);
    expect(text).toContain("plugin.ini:3");
    // The first fix as calm as the turn: Haiku without thinking.
    expect(fix.thinking).toEqual({ type: "disabled" });
    const project = workspace.project!;
    expect(project.files["plugin.ini"]).toContain("name = Calm");
    // The person sees a quiet line for it, and what the turn cost.
    expect(lines(project.messages).map((l) => l.text)).toContain("Checks: 1 to fix, given to the AI");
    expect(desk.lastTurn?.dollars).toBeGreaterThan(0);
    expect(desk.lastTurn?.model).toBe("Claude Haiku 5.5");
  });

  it("thinks more when the checks keep failing, and stops after two tries", async () => {
    const backend = standInBackend();
    backend.emulatorStart = async () => {};
    const checker = new Checker({ pluginCheck: async () => [cut] });
    const provider = new ReplayProvider({
      title: "stubborn",
      user: ["A calm look"],
      answers: [
        call("t1", "write_file", { path: "plugin.ini", content: INI }),
        said("Made."),
        call("t2", "write_file", { path: "plugin.ini", content: `${INI}; one
` }),
        said("Tried."),
        call("t3", "write_file", { path: "plugin.ini", content: `${INI}; two
` }),
        said("Tried again."),
      ],
    });
    const desk = new Desk(new Workspace(backend), backend, checker, handbook(), provider, "claude");
    await desk.send("A calm look");
    expect(provider.done).toBe(true);
    expect(provider.requests[2]!.thinking).toEqual({ type: "disabled" });
    expect(provider.requests[4]!.thinking).toEqual({ type: "adaptive", display: "summarized" });
    expect(provider.requests[4]!.output_config).toEqual({ effort: "medium" });
    expect(desk.workshop?.escalated).toBe(false);
  });

  it("asks nothing more of the AI when the checks pass or nothing changed", async () => {
    const backend = standInBackend();
    backend.emulatorStart = async () => {};
    let checked = 0;
    const checker = new Checker({ pluginCheck: async () => (checked++, []) });
    const provider = new ReplayProvider({ title: "talk", user: ["Hello"], answers: [said("Hello! What should your reader do?")] });
    const desk = new Desk(new Workspace(backend), backend, checker, handbook(), provider, "claude");
    await desk.send("Hello");
    expect(provider.requests).toHaveLength(1);
    expect(checked).toBe(0);
  });

  it("offers what a PaperPaw key's proxy allows, and Automatic where it does not answer", async () => {
    const backend = standInBackend();
    const provider = new ReplayProvider({ title: "none", user: [], answers: [] });
    const desk = new Desk(new Workspace(backend), backend, new Checker({ pluginCheck: async () => [] }), handbook(), provider, "paperpaw");
    expect(desk.may).toEqual(["auto"]);
    const fetched = vi.fn(async () => new Response(JSON.stringify({ models: ["claude-haiku-5-5", "claude-sonnet-5-5"] })));
    vi.stubGlobal("fetch", fetched);
    await desk.askProxy("https://proxy.test", "ppw-abcdefghijklmnop");
    expect(desk.may).toEqual(["auto", "claude-haiku-5-5", "claude-sonnet-5-5"]);
    expect(fetched).toHaveBeenCalledWith("https://proxy.test/v1/key", { headers: { "x-api-key": "ppw-abcdefghijklmnop" } });
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("offline"); }));
    await desk.askProxy("https://proxy.test", "ppw-abcdefghijklmnop");
    expect(desk.may).toEqual(["auto", "claude-haiku-5-5", "claude-sonnet-5-5"]);
    vi.unstubAllGlobals();
  });
});
