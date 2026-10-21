import fs from "node:fs";
import path from "node:path";

import type Anthropic from "@anthropic-ai/sdk";
import { describe, expect, it } from "vitest";

import { runTurn, type Session } from "../src/ai/loop";
import { MODELS } from "../src/ai/pricing";
import { ReplayProvider, type Recording } from "../src/ai/replay";
import type { Step } from "../src/tools/tool";
import { DATA_TOOLS } from "../src/tools/registry";
import { bench } from "./helpers";

function recording(name: string): Recording {
  return JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, "conversations", `${name}.json`), "utf8"));
}

function session(provider: ReplayProvider) {
  const b = bench();
  const s: Session = {
    provider,
    project: b.project,
    tools: DATA_TOOLS,
    handbook: b.handbook,
    context: b.context,
    model: MODELS.data,
    effort: "medium",
  };
  return { ...b, session: s };
}

/** The tool results of every user message, in order. */
function results(messages: Anthropic.MessageParam[]): Anthropic.ToolResultBlockParam[] {
  return messages.flatMap((m) =>
    m.role === "user" && Array.isArray(m.content)
      ? (m.content.filter((b) => b.type === "tool_result") as Anthropic.ToolResultBlockParam[])
      : [],
  );
}

describe("the AI loop, with a recorded conversation", () => {
  it("makes a theme, fixes what the checker finds, and looks at it", async () => {
    const rec = recording("night-owl");
    const provider = new ReplayProvider(rec);
    const { session: s, files, emulator, project } = session(provider);
    const steps: { step: Step; ok: boolean }[] = [];
    let text = "";

    const end = await runTurn(s, rec.user[0]!, {
      onText: (d) => (text += d),
      onStep: (step, ok) => steps.push({ step, ok }),
    });

    expect(end).toBe("done");
    expect(files.read("settings.ini")).toContain("ui-row = 220");
    expect(files.read("plugin.ini")).toContain("id = night-owl");
    expect(text).toContain("Here it is");

    // The first check found the row height out of range; the second did not.
    const checks = results(project.messages).filter((r) => String(r.content).includes("errors,"));
    expect(String(checks[0]!.content)).toContain("outside its range, 120 to 300");
    expect(String(checks[1]!.content)).toMatch(/^0 errors/);

    // It looked at the X4 and at the Boox in night mode, and got pictures.
    expect(emulator.screenshots).toEqual([
      { profile: "xteink-x4", dark: undefined, screen: undefined },
      { profile: "boox-go-7", dark: true, screen: undefined },
    ]);
    const pictures = results(project.messages).filter((r) => Array.isArray(r.content));
    expect((pictures[0]!.content as Anthropic.ContentBlockParam[])[0]!.type).toBe("image");

    expect(steps.map((s) => s.step.key)).toEqual([
      "step.lookup_docs",
      "step.write_file",
      "step.write_file",
      "step.check",
      "step.write_file",
      "step.check",
      "step.look",
      "step.look",
    ]);
    expect(steps.every((s) => s.ok)).toBe(true);

    // The second turn goes on in the same conversation.
    expect(await runTurn(s, rec.user[1]!)).toBe("done");
    expect(files.read("settings.ini")).toContain("ui-corners = core.corners.round");
    expect(provider.done).toBe(true);
  });

  it("sends requests that cache the handbook and keep the conversation whole", async () => {
    const rec = recording("night-owl");
    const provider = new ReplayProvider(rec);
    const { session: s, project, handbook } = session(provider);
    await runTurn(s, rec.user[0]!);
    await runTurn(s, rec.user[1]!);

    const first = provider.requests[0]!;
    expect(first.model).toBe("claude-haiku-5-5");
    expect(first.system).toEqual([{ type: "text", text: handbook.prompt, cache_control: { type: "ephemeral" } }]);
    expect(first.cache_control).toEqual({ type: "ephemeral" });
    expect(first.thinking).toEqual({ type: "adaptive" });
    expect(first.output_config).toEqual({ effort: "medium" });
    expect(first.tools!.map((t) => (t as Anthropic.Tool).name)).toEqual(DATA_TOOLS.map((t) => t.name));

    // Every request has the same prefix: system and tools never change.
    for (const r of provider.requests) {
      expect(r.system).toEqual(first.system);
      expect(r.tools).toEqual(first.tools);
    }
    // Append-only: each request's messages begin with the one before's.
    for (let i = 1; i < provider.requests.length; i++) {
      const before = provider.requests[i - 1]!.messages;
      expect(provider.requests[i]!.messages.slice(0, before.length)).toEqual(before);
    }
    // Roles alternate, and every tool call has its result next.
    project.messages.forEach((m, i) => expect(m.role).toBe(i % 2 === 0 ? "user" : "assistant"));
    project.messages.forEach((m, i) => {
      if (m.role !== "assistant" || !Array.isArray(m.content)) return;
      const calls = m.content.filter((b) => b.type === "tool_use").map((b) => (b as Anthropic.ToolUseBlock).id);
      const next = project.messages[i + 1];
      const answered = Array.isArray(next?.content)
        ? next.content.filter((b) => b.type === "tool_result").map((b) => (b as Anthropic.ToolResultBlockParam).tool_use_id)
        : [];
      expect(answered).toEqual(calls);
    });

    expect(project.usage.dollars).toBeGreaterThan(0);
    expect(project.usage.cacheReadTokens).toBeGreaterThan(project.usage.cacheWriteTokens);
  });

  it("answers bad tool calls with errors the model can act on", async () => {
    const provider = new ReplayProvider({
      title: "bad calls",
      user: ["x"],
      answers: [
        {
          stop_reason: "tool_use",
          content: [
            { type: "tool_use", id: "t1", name: "write_file", input: { path: "plugin.ini" } },
            { type: "tool_use", id: "t2", name: "write_file", input: { path: "../escape.ini", content: "x" } },
            { type: "tool_use", id: "t3", name: "write_file", input: { path: "run.js", content: "x" } },
            { type: "tool_use", id: "t4", name: "make_coffee", input: {} },
          ] as Anthropic.ContentBlock[],
        },
        { stop_reason: "end_turn", content: [{ type: "text", text: "ok", citations: null }] },
      ],
    });
    const { session: s, project, files } = session(provider);
    expect(await runTurn(s, "x")).toBe("done");
    const [missing, escape, kind, unknown] = results(project.messages);
    expect(missing).toMatchObject({ is_error: true });
    expect(String(missing!.content)).toContain("content");
    expect(String(escape!.content)).toContain("Not written");
    expect(String(kind!.content)).toContain("do not belong here");
    expect(String(unknown!.content)).toBe("There is no tool make_coffee.");
    expect(files.list()).toEqual([]);
  });

  it("never runs a call cut off at the length limit, and still answers it", async () => {
    const provider = new ReplayProvider({
      title: "cut",
      user: ["x"],
      answers: [
        {
          stop_reason: "max_tokens",
          content: [{ type: "tool_use", id: "t1", name: "write_file", input: { path: "plugin.ini", content: "[plu" } }] as Anthropic.ContentBlock[],
        },
        { stop_reason: "end_turn", content: [{ type: "text", text: "again", citations: null }] },
      ],
    });
    const { session: s, project, files } = session(provider);
    await runTurn(s, "x");
    expect(files.has("plugin.ini")).toBe(false);
    expect(String(results(project.messages)[0]!.content)).toContain("cut off");
  });

  it("stops at its round limit, and the next words join the last results", async () => {
    const call = { stop_reason: "tool_use" as const, content: [{ type: "tool_use", id: "t", name: "list_files", input: {} }] as Anthropic.ContentBlock[] };
    const end = { stop_reason: "end_turn" as const, content: [{ type: "text", text: "here", citations: null }] as Anthropic.ContentBlock[] };
    const provider = new ReplayProvider({ title: "loops", user: [], answers: [...Array.from({ length: 25 }, () => call), end] });
    const { session: s, project } = session(provider);
    expect(await runTurn(s, "go")).toBe("limit");
    expect(project.messages.at(-1)!.role).toBe("user");
    // The next turn: no second user message in a row.
    await runTurn(s, "go on");
    const last = project.messages.at(-2)!;
    expect(last.role).toBe("user");
    expect((last.content as Anthropic.ContentBlockParam[]).at(-1)).toEqual({ type: "text", text: "go on" });
  });

  it("takes back the person's words when the request fails", async () => {
    const provider = new ReplayProvider({ title: "empty", user: [], answers: [] });
    const { session: s, project } = session(provider);
    await expect(runTurn(s, "hello")).rejects.toThrow("has no answer");
    expect(project.messages).toEqual([]);
  });
});
