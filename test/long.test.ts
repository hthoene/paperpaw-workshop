// Long conversations: old tool results cleared on Anthropic's side (the
// conversation here stays whole), a summary by Haiku and a fresh
// conversation near the limit, the person's choice of how long, and
// today's date in the request. A scripted provider answers; nothing is
// sent anywhere.

import type Anthropic from "@anthropic-ai/sdk";
import { afterEach, describe, expect, it } from "vitest";

import { LENGTHS, lengthRules } from "../src/ai/length";
import { clearing, runTurn, type Session } from "../src/ai/loop";
import { MODELS, priced } from "../src/ai/pricing";
import type { Provider, Request } from "../src/ai/provider";
import { ReplayProvider } from "../src/ai/replay";
import { SUMMARY_PROMPT } from "../src/ai/summary";
import { lines } from "../src/app/conversation";
import { standInBackend } from "../src/desktop/backend";
import { Checker } from "../src/desktop/checks";
import { Desk } from "../src/desktop/desk";
import { saveLength, savedLength } from "../src/desktop/length";
import { Workspace } from "../src/desktop/workspace";
import { CARRIED, TODAY } from "../src/project/project";
import { DATA_TOOLS } from "../src/tools/registry";
import { bench, handbook } from "./helpers";

interface Scripted {
  content: Anthropic.ContentBlock[];
  stop_reason: Anthropic.Message["stop_reason"];
  /** The prompt's size the answer reports, in tokens. */
  prompt?: number;
}

/** Answers as `script` says, each request kept. */
class ScriptedProvider implements Provider {
  readonly label = "provider.key";
  readonly eagerTools = false;
  readonly requests: Request[] = [];
  ownPrompt = false;

  constructor(private script: (request: Request) => Scripted) {}

  async send(request: Request): Promise<Anthropic.Message> {
    this.requests.push(structuredClone(request));
    const answer = this.script(request);
    return {
      id: `msg_${this.requests.length}`,
      type: "message",
      role: "assistant",
      model: request.model,
      content: answer.content,
      stop_reason: answer.stop_reason,
      stop_sequence: null,
      usage: { input_tokens: answer.prompt ?? 1_000, output_tokens: 100, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 },
    } as unknown as Anthropic.Message;
  }

  get main(): Request[] {
    return this.requests.filter((r) => !summary(r));
  }
}

const summary = (r: Request) => (r.system as Anthropic.TextBlockParam[] | undefined)?.[0]?.text === SUMMARY_PROMPT;
const use = (id: string, name: string, input: Record<string, unknown>): Scripted => ({
  content: [{ type: "tool_use", id, name, input } as Anthropic.ContentBlock],
  stop_reason: "tool_use",
});
const said = (text: string, prompt?: number): Scripted => ({
  content: [{ type: "text", text, citations: null } as Anthropic.ContentBlock],
  stop_reason: "end_turn",
  prompt,
});

/** The answers in order, the summary's by itself. */
function inOrder(answers: Scripted[], written = "Built: a clock.\nLearned: the clock needs a font."): (request: Request) => Scripted {
  return (request) => (summary(request) ? { ...said(written), prompt: 20_000 } : answers.shift()!);
}

function session(provider: Provider, extra: Partial<Session> = {}): Session {
  const b = bench();
  return {
    provider,
    project: b.project,
    tools: DATA_TOOLS,
    handbook: b.handbook,
    context: b.context,
    model: MODELS.data,
    kind: "data",
    now: () => new Date("2026-10-24T10:00:00Z"),
    timeZone: "Europe/Berlin",
    ...extra,
  };
}

const texts = (m: Anthropic.MessageParam) =>
  typeof m.content === "string" ? [m.content] : m.content.flatMap((b) => (b.type === "text" ? [b.text] : []));

/** Every tool call answered in the next message, in order, by its id. */
function paired(messages: Anthropic.MessageParam[]): void {
  messages.forEach((m, i) => {
    if (m.role !== "assistant" || typeof m.content === "string") return;
    const calls = m.content.filter((b) => b.type === "tool_use").map((b) => (b as Anthropic.ToolUseBlockParam).id);
    if (!calls.length) return;
    const next = messages[i + 1];
    expect(next?.role).toBe("user");
    const answered = (next!.content as Anthropic.ContentBlockParam[]).filter((b) => b.type === "tool_result").map((b) => (b as Anthropic.ToolResultBlockParam).tool_use_id);
    expect(answered).toEqual(calls);
  });
}

const INI = "[plugin]\nid = clock\nname = Clock\nversion = 1.0.0\n";

describe("old tool results trimmed", () => {
  it("are cleared on Anthropic's side as the setting says, the conversation here whole and paired", async () => {
    let prompt = 0;
    const answers = [
      use("w1", "write_file", { path: "plugin.ini", content: INI }),
      use("r1", "read_file", { path: "plugin.ini" }),
      use("l1", "list_files", {}),
      use("r2", "read_file", { path: "plugin.ini" }),
      said("Done"),
    ];
    const provider = new ScriptedProvider(() => ({ ...answers.shift()!, prompt: (prompt += 12_000) }));
    const s = session(provider, { length: LENGTHS.short });
    expect(await runTurn(s, "Make a clock")).toBe("done");

    // Past 25,000 tokens the oldest results go, with the files written
    // in them, at least 12,000 at a time, the last 6 tool uses and the
    // small lists never.
    for (const r of provider.requests) {
      expect(r.context_management).toEqual(clearing(LENGTHS.short));
      expect(r.context_management!.edits[0]).toMatchObject({
        trigger: { type: "input_tokens", value: 25_000 },
        keep: { type: "tool_uses", value: 6 },
        clear_at_least: { type: "input_tokens", value: 12_000 },
        exclude_tools: ["list_files", "list_uploads"],
        clear_tool_inputs: ["write_file", "edit_file"],
      });
      paired(r.messages);
    }
    // Append-only: each request begins with the one before (so the cache
    // and the model's thinking hold).
    for (let i = 1; i < provider.requests.length; i++) {
      const before = provider.requests[i - 1]!.messages;
      expect(provider.requests[i]!.messages.slice(0, before.length)).toEqual(before);
    }
    paired(s.project.messages);
    expect(s.project.messages.at(-1)!.role).toBe("assistant");
  });

  it("asks a look again when its answer is older than the uses never cleared", async () => {
    const answers = [
      use("w1", "write_file", { path: "plugin.ini", content: INI }),
      use("l1", "list_files", {}),
      use("l2", "list_files", {}),
      use("r1", "read_file", { path: "plugin.ini" }),
      use("l3", "list_files", {}),
      said("Done"),
    ];
    const provider = new ScriptedProvider(() => answers.shift()!);
    const s = session(provider, { length: { ...LENGTHS.normal, keep: 2 } });
    await runTurn(s, "Make a clock");
    const result = (id: string) =>
      s.project.messages
        .flatMap((m) => (Array.isArray(m.content) ? m.content : []))
        .find((b): b is Anthropic.ToolResultBlockParam => b.type === "tool_result" && b.tool_use_id === id)!;
    // Right after: pointed to. Two uses later it may be cleared: run again.
    expect(String(result("l2").content)).toMatch(/^Already answered above/);
    expect(String(result("l3").content)).toContain("plugin.ini");
    expect(String(result("l3").content)).not.toMatch(/^Already answered/);
  });
});

describe("a long conversation summarised", () => {
  it("before a turn: Haiku summarises a transcript, the fresh conversation carries it, the old one is kept", async () => {
    const answers = [use("w1", "write_file", { path: "plugin.ini", content: INI }), said("Here is your clock.", 95_000), said("Bigger now.")];
    const provider = new ScriptedProvider(inOrder(answers));
    const s = session(provider, { model: MODELS.code });
    await runTurn(s, "Make a clock");
    const old = [...s.project.messages];
    const before = s.project.usage.dollars;

    expect(await runTurn(s, "Make it bigger")).toBe("done");

    // The summary: Haiku, from a plain transcript, no tools, no thinking.
    const asked = provider.requests.find(summary)!;
    expect(asked.model).toBe("claude-haiku-5-5");
    expect(asked.tools).toBeUndefined();
    expect(asked.context_management).toBeUndefined();
    expect(asked.thinking).toEqual({ type: "disabled" });
    const transcript = asked.messages[0]!.content as string;
    expect(transcript).toContain("Person: Make a clock");
    expect(transcript).toContain("AI used write_file");
    expect(transcript).toContain("AI: Here is your clock.");
    expect(transcript).not.toContain(TODAY);

    // The fresh conversation: one message with the summary, the files and
    // the person's words; the same prompt and tools (the cache holds).
    const next = provider.main.at(-1)!;
    expect(next.messages).toHaveLength(1);
    const carried = texts(next.messages[0]!);
    expect(carried[0]).toMatch(new RegExp(`^${TODAY}`));
    expect(carried[1]!.startsWith(CARRIED)).toBe(true);
    expect(carried[1]).toContain("Built: a clock.");
    expect(carried[1]).toContain("- plugin.ini (");
    expect(carried[2]).toBe("Make it bigger");
    expect(next.system).toEqual(provider.main[0]!.system);
    expect(next.tools).toEqual(provider.main[0]!.tools);

    // The old conversation is kept to read back, whole.
    expect(s.project.earlier).toEqual([old]);
    expect(s.project.carried).toBeUndefined();
    // The person sees one quiet line for it.
    expect(lines(s.project.messages)).toEqual([
      { kind: "step", text: "Summarised the conversation so far", failed: false },
      { kind: "me", text: "Make it bigger" },
      { kind: "ai", text: "Bigger now." },
    ]);
    // What the summary cost is the turn's: Haiku's price, with the turn's request.
    const haiku = priced("claude-haiku-5-5", { input_tokens: 20_000, output_tokens: 100 }).dollars;
    const turn = priced(MODELS.code, { input_tokens: 1_000, output_tokens: 100 }).dollars;
    expect(s.project.usage.dollars - before).toBeCloseTo(haiku + turn, 10);
  });

  it("within a turn: it goes on where it was, the tool round answered first", async () => {
    const answers = [use("w1", "write_file", { path: "plugin.ini", content: INI }), { ...use("r1", "read_file", { path: "plugin.ini" }), prompt: 95_000 }, said("Done.")];
    const provider = new ScriptedProvider(inOrder(answers));
    const s = session(provider);
    expect(await runTurn(s, "Make a clock")).toBe("done");

    expect(provider.requests.filter(summary)).toHaveLength(1);
    // The old conversation ends with the read's result: no call open.
    const old = s.project.earlier![0]!;
    paired(old);
    expect(old.at(-1)!.role).toBe("user");
    // The fresh one says to go on.
    const fresh = provider.main.at(-1)!.messages;
    expect(fresh).toHaveLength(1);
    const carried = texts(fresh[0]!);
    expect(carried[0]).toMatch(new RegExp(`^${TODAY}`));
    expect(carried[1]).toContain("Built: a clock.");
    expect(carried[1]).toContain("go on with it where you left off");
  });

  it("without a summary (the summariser failed, or the provider sends its own prompt): the person's requests stand in", async () => {
    const answers = [said("Here is your clock.", 95_000), said("Bigger now.")];
    const failing = new ScriptedProvider((request) => {
      if (summary(request)) throw new Error("overloaded");
      return answers.shift()!;
    });
    const s = session(failing);
    await runTurn(s, "Make a clock");
    expect(await runTurn(s, "Make it bigger")).toBe("done");
    const carried = texts(failing.main.at(-1)!.messages[0]!)[1]!;
    expect(carried).toContain("What the person asked for in it:");
    expect(carried).toContain("- Make a clock");

    const proxied = new ScriptedProvider(inOrder([said("Here is your clock.", 95_000), said("Bigger now.")]));
    proxied.ownPrompt = true;
    const p = session(proxied);
    await runTurn(p, "Make a clock");
    await runTurn(p, "Make it bigger");
    expect(proxied.requests.some(summary)).toBe(false);
    expect(p.project.earlier).toHaveLength(1);
  });

  it("keeps a summary the first request did not take, for the person's next words", async () => {
    let fail = false;
    const provider = new ScriptedProvider((request) => {
      if (summary(request)) return { ...said("Built: a clock."), prompt: 20_000 };
      if (fail) throw new Error("no network");
      return said("Here is your clock.", 95_000);
    });
    const s = session(provider);
    await runTurn(s, "Make a clock");
    fail = true;
    await expect(runTurn(s, "Make it bigger")).rejects.toThrow("no network");
    expect(s.project.messages).toEqual([]);
    expect(s.project.carried).toContain("Built: a clock.");
  });

  it("ends a turn that alone fills fresh conversations as too long", async () => {
    let n = 0;
    const provider = new ScriptedProvider((request) => (summary(request) ? said("Built: a clock.") : { ...use(`l${n++}`, "list_files", {}), prompt: 95_000 }));
    const s = session(provider);
    expect(await runTurn(s, "Go")).toBe("too_long");
    expect(s.project.earlier).toHaveLength(2);
    paired(s.project.messages);
    expect(s.project.messages.at(-1)!.role).toBe("user");
  });
});

describe("the setting Conversation length", () => {
  afterEach(() => localStorage.clear());

  it("sets where trimming and summarising happen", () => {
    expect(lengthRules("short", MODELS.code)).toEqual(LENGTHS.short);
    expect(lengthRules("normal", MODELS.code)).toEqual(LENGTHS.normal);
    expect(lengthRules("long", MODELS.code)).toEqual(LENGTHS.long);
    const points = (["short", "normal", "long"] as const).map((c) => lengthRules(c, MODELS.code));
    for (const p of points) expect(p.trimAt + p.clearAtLeast).toBeLessThanOrEqual(p.summariseAt);
    expect(points.map((p) => p.summariseAt)).toEqual([50_000, 90_000, 160_000]);
    expect(points.map((p) => p.clearAtLeast)).toEqual([12_000, 20_000, 30_000]);
    // Haiku stays below its higher price past 100,000 tokens.
    expect(lengthRules("normal", MODELS.data)).toEqual(LENGTHS.normal);
    const long = lengthRules("long", MODELS.data);
    expect(long.summariseAt).toBe(90_000);
    expect(long.trimAt).toBeLessThan(long.summariseAt);
    expect(long.trimAt).toBeGreaterThan(LENGTHS.normal.trimAt);
  });

  it("summarises sooner when short", async () => {
    for (const [choice, summarised] of [["short", 1], ["normal", 0]] as const) {
      const provider = new ScriptedProvider(inOrder([said("Here is your clock.", 60_000), said("Bigger now.")]));
      const s = session(provider, { length: lengthRules(choice, MODELS.data) });
      await runTurn(s, "Make a clock");
      await runTurn(s, "Make it bigger");
      expect(provider.requests.filter(summary)).toHaveLength(summarised);
    }
  });

  it("is kept on this computer and reaches the requests", async () => {
    expect(savedLength()).toBe("normal");
    localStorage.setItem("workshop.length", "endless");
    expect(savedLength()).toBe("normal");
    saveLength("short");
    expect(savedLength()).toBe("short");

    const backend = standInBackend();
    backend.emulatorStart = async () => {};
    const provider = new ReplayProvider({ title: "short", user: ["Hello"], answers: [said("Hello.")] });
    const desk = new Desk(new Workspace(backend), backend, new Checker({ pluginCheck: async () => [] }), handbook(), provider, "claude");
    await desk.send("Hello");
    expect(provider.requests[0]!.context_management).toEqual(clearing(LENGTHS.short));
  });
});

describe("today's date", () => {
  it("is in the person's first message, with the time zone, and again when the day changed", async () => {
    let now = new Date("2026-10-24T10:00:00Z");
    const provider = new ScriptedProvider(inOrder([said("Hi."), said("Still here."), said("A new day.")]));
    const s = session(provider, { now: () => now });
    await runTurn(s, "Hello");
    await runTurn(s, "And now?");
    now = new Date("2026-10-25T10:00:00Z");
    await runTurn(s, "Good morning");

    const user = s.project.messages.filter((m) => m.role === "user").map(texts);
    expect(user[0]![0]).toBe(
      `${TODAY} Saturday, 24 October 2026, Europe/Berlin. Old tool results may be cleared to keep the conversation short: use the tool again if you need one.`,
    );
    expect(user[1]).toEqual(["And now?"]);
    expect(user[2]![0]).toContain("Sunday, 25 October 2026, Europe/Berlin");
    // Not in the system prompt: that stays the same, cached.
    for (const r of provider.requests) expect(JSON.stringify(r.system)).not.toContain("2026");
    // The person does not see it.
    expect(lines(s.project.messages).filter((l) => l.kind === "me").map((l) => l.text)).toEqual(["Hello", "And now?", "Good morning"]);
  });

  it("is the person's own day in their time zone", async () => {
    const provider = new ScriptedProvider(inOrder([said("Hi.")]));
    const s = session(provider, { now: () => new Date("2026-10-24T12:00:00Z"), timeZone: "Pacific/Auckland" });
    await runTurn(s, "Hello");
    expect(texts(provider.requests[0]!.messages[0]!)[0]).toContain("Sunday, 25 October 2026, Pacific/Auckland");
  });
});
