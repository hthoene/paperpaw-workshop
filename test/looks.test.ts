import type Anthropic from "@anthropic-ai/sdk";
import { afterEach, describe, expect, it } from "vitest";

import { runTurn, type Session } from "../src/ai/loop";
import { ReplayProvider } from "../src/ai/replay";
import { standInBackend } from "../src/desktop/backend";
import { Checker } from "../src/desktop/checks";
import { Desk } from "../src/desktop/desk";
import { lookRules, saveLooks, savedLooks } from "../src/desktop/looks";
import { Workspace } from "../src/desktop/workspace";
import { look } from "../src/tools/emulator";
import { bench, handbook } from "./helpers";

const use = (id: string, input: Record<string, unknown> = {}) => ({ type: "tool_use", id, name: "look", input }) as Anthropic.ContentBlock;
const done = { content: [{ type: "text", text: "Done.", citations: null } as Anthropic.ContentBlock], stop_reason: "end_turn" as const };
const texts = (r: Anthropic.ToolResultBlockParam) => (typeof r.content === "string" ? r.content : (r.content ?? []).map((c) => (c.type === "text" ? c.text : "")).join(" "));

afterEach(() => localStorage.clear());

describe("checking the look", () => {
  it("is off, sparing (3 a turn) or thorough (6, both devices), sparing unless chosen", () => {
    expect(lookRules("off")).toEqual({ without: ["look"], perTurn: {}, notes: {} });
    expect(lookRules("sparingly").perTurn).toEqual({ look: 3 });
    expect(lookRules("thoroughly").perTurn).toEqual({ look: 6 });
    expect(lookRules("thoroughly").notes.look).toContain("X4 and on the Boox Go 7");
    expect(savedLooks()).toBe("sparingly");
    saveLooks("thoroughly");
    expect(savedLooks()).toBe("thoroughly");
  });

  it("counts the looks of a turn, says how many, and refuses one more", async () => {
    const provider = new ReplayProvider({
      title: "looks",
      user: ["A widget"],
      answers: [{ content: [use("l1"), use("l2", { dark: true }), use("l3", { device: "X4" }), use("l4", { device: "Boox Go 7" })], stop_reason: "tool_use" }, done],
    });
    const b = bench();
    const s: Session = { provider, project: b.project, tools: [look], handbook: b.handbook, context: b.context, model: "claude-sonnet-5-5", kind: "code", perTurn: { look: 3 }, notes: { look: "Thorough." } };
    await runTurn(s, "A widget");
    const results = b.project.messages.flatMap((m) => (Array.isArray(m.content) ? m.content : [])).filter((r): r is Anthropic.ToolResultBlockParam => r.type === "tool_result");
    expect(texts(results[0]!)).toContain("(look 1 of at most 3 in this turn.) Thorough.");
    expect(texts(results[2]!)).toContain("(look 3 of at most 3 in this turn.)");
    expect(results[3]).toMatchObject({ is_error: true, content: "look is used at most 3 times in one turn." });
  });

  it("off, the AI has no look at all", async () => {
    saveLooks("off");
    const backend = standInBackend();
    backend.emulatorStart = async () => {};
    const provider = new ReplayProvider({ title: "off", user: ["A look"], answers: [done] });
    const workspace = new Workspace(backend);
    const desk = new Desk(workspace, backend, new Checker({ pluginCheck: async () => [] }), handbook(), provider, "claude");
    await desk.send("A look");
    const names = provider.requests[0]!.tools!.map((t) => (t as Anthropic.Tool).name);
    expect(names).not.toContain("look");
    expect(names).toContain("control");
  });
});
