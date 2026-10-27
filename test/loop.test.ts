import fs from "node:fs";
import path from "node:path";

import type Anthropic from "@anthropic-ai/sdk";
import { describe, expect, it } from "vitest";

import { LENGTHS } from "../src/ai/length";
import { clearing, runTurn, thinkingFor, type Session } from "../src/ai/loop";
import { MODELS } from "../src/ai/pricing";
import { ReplayProvider, type Recording } from "../src/ai/replay";
import type { Step } from "../src/tools/tool";
import { press } from "../src/tools/emulator";
import type { BuildResult, Builder } from "../src/build/client";
import { newProject } from "../src/project/project";
import { CODE_TOOLS, DATA_TOOLS } from "../src/tools/registry";
import { bench, handbook } from "./helpers";

function recording(name: string): Recording {
  return JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, "../src/ai/examples", `${name}.json`), "utf8"));
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
    kind: "data",
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

    // It looked at the X4, changed what it saw, and looked at the X4 and
    // at the Boox in night mode again, and got pictures.
    expect(files.read("settings.ini")).not.toContain("ui-margin");
    expect(emulator.screenshots).toEqual([
      { profile: "xteink-x4", dark: undefined, screen: undefined },
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
    // Haiku for data: no thinking, low effort, until the checks keep failing.
    expect(first.thinking).toEqual({ type: "disabled" });
    expect(first.output_config).toEqual({ effort: "low" });
    expect(first.max_tokens).toBe(32_000);
    // Old tool results are cleared on Anthropic's side, not here.
    expect(first.context_management).toEqual(clearing(LENGTHS.normal));
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

  it("never runs a call whose input was not valid JSON, and answers it", async () => {
    const provider = new ReplayProvider({
      title: "invalid",
      user: ["x"],
      answers: [
        {
          stop_reason: "tool_use",
          content: [{ type: "tool_use", id: "t1", name: "write_file", input: { INVALID_JSON: '{"path":"plugin.ini","content"}' } }] as Anthropic.ContentBlock[],
        },
        { stop_reason: "end_turn", content: [{ type: "text", text: "again", citations: null }] },
      ],
    });
    const { session: s, project, files } = session(provider);
    expect(await runTurn(s, "x")).toBe("done");
    expect(files.has("plugin.ini")).toBe(false);
    const [result] = results(project.messages);
    expect(result!.is_error).toBe(true);
    expect(String(result!.content)).toContain("not valid JSON");
  });

  it("goes on for as many rounds as the work takes: no number of steps ends a turn", async () => {
    const call = { stop_reason: "tool_use" as const, content: [{ type: "tool_use", id: "t", name: "list_files", input: {} }] as Anthropic.ContentBlock[] };
    const end = { stop_reason: "end_turn" as const, content: [{ type: "text", text: "here", citations: null }] as Anthropic.ContentBlock[] };
    const provider = new ReplayProvider({ title: "loops", user: [], answers: [...Array.from({ length: 60 }, () => call), end] });
    const { session: s, project } = session(provider);
    expect(await runTurn(s, "go")).toBe("done");
    expect(provider.requests).toHaveLength(61);
    expect(project.messages.at(-1)!.role).toBe("assistant");
  });

  it("goes on by itself where an answer reached its length limit", async () => {
    const cut = { stop_reason: "max_tokens" as const, content: [{ type: "text", text: "The first half", citations: null }] as Anthropic.ContentBlock[] };
    const end = { stop_reason: "end_turn" as const, content: [{ type: "text", text: "and the rest.", citations: null }] as Anthropic.ContentBlock[] };
    const provider = new ReplayProvider({ title: "cut", user: [], answers: [cut, end] });
    const { session: s, project } = session(provider);
    expect(await runTurn(s, "write it")).toBe("done");
    expect(provider.requests).toHaveLength(2);
    // Answer, the nudge to go on, answer: the roles still alternate.
    expect(project.messages.map((m) => m.role)).toEqual(["user", "assistant", "user", "assistant"]);
    expect(JSON.stringify(project.messages[2])).toContain("cut off");
  });

  it("takes back the person's words when the request fails", async () => {
    const provider = new ReplayProvider({ title: "empty", user: [], answers: [] });
    const { session: s, project } = session(provider);
    await expect(runTurn(s, "hello")).rejects.toThrow("has no answer");
    expect(project.messages).toEqual([]);
  });
});

describe("the press tool", () => {
  it("presses the device's own buttons, on the reader the person sees", async () => {
    const { context, emulator } = bench();
    const pro = context.profiles.find((p) => p.id === "xteink-x4-pro")!;
    const wrong = await press.run({ device: "X4 Pro", buttons: ["confirm"] }, context);
    expect(wrong.isError).toBe(true);
    expect(String(wrong.content)).toContain("page-back, page-forward, home, power");
    expect(emulator.inputs).toEqual([]);

    const ok = await press.run({ device: "X4 Pro", buttons: ["page-forward", "home:long"] }, context);
    expect(ok.isError).toBeFalsy();
    expect(context.reader.shown().id).toBe(pro.id);
    expect(emulator.inputs).toEqual([
      { kind: "button", name: "page-forward", long: false },
      { kind: "button", name: "home", long: true },
    ]);
    expect(emulator.screenshots.at(-1)?.profile).toBe(pro.id);

    // Without a device: the one shown.
    await press.run({ buttons: ["power"] }, context);
    expect(emulator.inputs.at(-1)).toEqual({ kind: "button", name: "power", long: false });
  });
});

describe("a turn's ends", () => {
  it("writes a plugin with code, gives the compiler's error back, and runs the build", async () => {
    const rec = recording("quote-a-day");
    expect(rec.kind).toBe("code");
    const provider = new ReplayProvider(rec);
    // The builder: the field LocalTime does not have fails, the rest builds.
    const sent: Record<string, unknown>[] = [];
    const builder: Builder = {
      async build(files) {
        sent.push(files);
        const lib = (files["src/lib.rs"] as { text: string }).text;
        const wrong = lib.includes("t.day_of_year");
        const result: BuildResult = {
          id: `b${sent.length}`,
          state: wrong ? "failed" : "done",
          seconds: 1,
          problems: [],
          diagnostics: wrong
            ? [{ level: "error", file: "src/lib.rs", line: 70, column: 53, message: "no field `day_of_year` on type `LocalTime`", rendered: "error[E0609]: no field `day_of_year` on type `LocalTime`" }]
            : [],
          files: wrong ? [] : [{ target: "web", name: "web.wasm", size: 1, url: "/api/v1/workshop/builds/b2/files/web.wasm" }],
          log_tail: "",
        };
        return result;
      },
    };
    const b = bench(newProject("code", handbook().codeSample));
    const s: Session = {
      provider,
      project: b.project,
      tools: CODE_TOOLS,
      handbook: b.handbook,
      prompt: b.handbook.promptFor("code"),
      context: { ...b.context, builder },
      model: MODELS.code,
      kind: "code",
    };

    expect(await runTurn(s, rec.user[0]!)).toBe("done");
    expect(provider.done).toBe(true);
    expect(sent).toHaveLength(2);
    expect(b.files.read("Cargo.toml")).toContain('plugin = "QuoteOfTheDay"');
    // The compiler's error went back to the AI as a failed tool result.
    const failed = results(b.project.messages).find((r) => r.is_error);
    expect(JSON.stringify(failed?.content)).toContain("no field `day_of_year`");
    // The reader runs the second build's module.
    expect(b.emulator.modules).toEqual(["/api/v1/workshop/builds/b2/files/web.wasm"]);
    expect(provider.requests[0]!.system?.[0]).toMatchObject({ text: b.handbook.promptFor("code") });
  });
});

describe("how much the model thinks", () => {
  it("is as little as each model allows, more once the checks kept failing", () => {
    expect(thinkingFor("claude-haiku-5-5", "data", false)).toEqual({ thinking: { type: "disabled" }, output_config: { effort: "low" } });
    expect(thinkingFor("claude-sonnet-5-5", "code", false)).toEqual({ thinking: { type: "between_tools" }, output_config: { effort: "medium" } });
    expect(thinkingFor("claude-opus-5-5", "data", false)).toEqual({ thinking: { type: "adaptive", display: "summarized" }, output_config: { effort: "low" } });
    expect(thinkingFor("claude-sonnet-5-5", "code", true)).toEqual({ thinking: { type: "adaptive", display: "summarized" }, output_config: { effort: "high" } });
    expect(thinkingFor("claude-haiku-5-5", "data", true).output_config).toEqual({ effort: "medium" });
  });
});

describe("the loop's guards", () => {
  const use = (id: string, name: string, input: Record<string, unknown>) => ({ type: "tool_use", id, name, input }) as Anthropic.ContentBlock;
  const answer = (...content: Anthropic.ContentBlock[]) => ({ content, stop_reason: "tool_use" as const });
  const done = { content: [{ type: "text", text: "Done.", citations: null } as Anthropic.ContentBlock], stop_reason: "end_turn" as const };

  it("clears old docs and file reads too, and the files written, never the small lists", () => {
    const edit = clearing(LENGTHS.normal).edits[0]!;
    expect(edit.exclude_tools).toEqual(["list_files", "list_uploads"]);
    // Only the writes' inputs: what the other tools were asked stays.
    expect(edit.clear_tool_inputs).toEqual(["write_file", "edit_file"]);
    expect(edit.trigger.value).toBeLessThan(LENGTHS.normal.summariseAt);
  });

  it("points to the answer of a lookup or read asked again in the same turn, until a file changes", async () => {
    const provider = new ReplayProvider({
      title: "again",
      user: ["A widget"],
      answers: [
        answer(use("t1", "lookup_docs", { topic: "Widget" }), use("t2", "read_file", { path: "plugin.ini" })),
        answer(use("t3", "lookup_docs", { topic: " widget" }), use("t4", "read_file", { path: "plugin.ini" })),
        answer(use("t5", "write_file", { path: "plugin.ini", content: "[plugin]\nid = calm\nname = Calm\nversion = 1.0.0\n" })),
        answer(use("t6", "read_file", { path: "plugin.ini" }), use("t7", "lookup_docs", { topic: "Widget" })),
        done,
      ],
    });
    const { session: s, files, project } = session(provider);
    files.write("plugin.ini", "[plugin]\nid = calm\n");
    expect(await runTurn(s, "A widget")).toBe("done");
    const said = Object.fromEntries(results(project.messages).map((r) => [r.tool_use_id, String(r.content)]));
    expect(said.t3).toContain("Already answered above in this turn: lookup_docs with the same input (call t1)");
    expect(said.t4).toContain("(call t2)");
    // After a change the file is read again; the docs say the same.
    expect(said.t6).toContain("version = 1.0.0");
    expect(said.t7).toContain("(call t1)");
  });

  it("tells the model to write once it has looked fifteen times without a change", async () => {
    const looks = Array.from({ length: 16 }, (_, i) => use(`l${i}`, "lookup_docs", { topic: `topic ${i}` }));
    const provider = new ReplayProvider({ title: "looks", user: ["A widget"], answers: [answer(...looks), done] });
    const { session: s, project } = session(provider);
    await runTurn(s, "A widget");
    const said = results(project.messages).map((r) => String(r.content));
    expect(said[13]).not.toContain("That is enough to start");
    expect(said[14]).toContain("You have looked things up 15 times in this turn without changing a file");
    expect(said[15]).not.toContain("That is enough to start");
  });

  it("does not pause a turn for what it costs: only the person stops it", async () => {
    const reading = new ReplayProvider({
      title: "dear",
      user: ["A widget"],
      answers: [answer(use("t1", "lookup_docs", { topic: "Widget" })), answer(use("t2", "lookup_docs", { topic: "WidgetSpec" })), done],
    });
    const { session: s } = session(reading);
    expect(await runTurn(s, "A widget")).toBe("done");
    expect(reading.requests).toHaveLength(3);

    const stopping = new AbortController();
    const again = new ReplayProvider({
      title: "stopped",
      user: ["A widget"],
      answers: [answer(use("t1", "lookup_docs", { topic: "Widget" })), done],
    });
    const second = session(again);
    stopping.abort();
    expect(await runTurn(second.session, "A widget", {}, stopping.signal)).toBe("stopped");
  });
});
