// The AI loop: one turn of the person, as many rounds of the model and
// its tools as it takes: nothing stops it but the end of the work, the
// person (the abort signal) or an error. The conversation is append-only
// (the model's thinking stays valid only so), every tool call gets its
// result, and a tool's input is checked against its schema before it runs.
// A conversation that grows long is kept short in two steps (length.ts):
// old tool results cleared on Anthropic's side, then a summary and a fresh
// conversation (summary.ts), within the turn if need be.

import type Anthropic from "@anthropic-ai/sdk";

import type { Handbook } from "../handbook/handbook";
import type { Project } from "../project/project";
import { definition, type Step, type ToolContext, type WorkshopTool } from "../tools/tool";
import { LENGTHS, type LengthRules } from "./length";
import { addUsage, MODELS, priced } from "./pricing";
import type { ContextManagement, Provider, Request } from "./provider";
import { carriedText, startFresh, SUMMARY_PROMPT, SUMMARY_TOKENS, todayLine, told, transcript } from "./summary";
import { invalidJson } from "./tool-input";

/** The most one answer may hold, thinking included. */
export const MAX_TOKENS = 32_000;

/** Tools that only look. Asked again in one turn with the same input,
 *  they answer with where the first answer is, not with it again, while
 *  that answer is among the tool uses never cleared. */
export const LOOKING_TOOLS = ["lookup_docs", "read_file", "list_files", "list_uploads", "fetch_sample"];

/** The tools whose results are never cleared: small, and what the project
 *  holds. What the docs and the files said is cleared once old (a file
 *  read is often stale by then); the model looks it up again if need be. */
export const KEPT_TOOLS = ["list_files", "list_uploads"];

/** The tools whose inputs are cleared with their results: whole file
 *  contents, stale once the file changed (read_file says what it is now). */
export const WRITING_TOOLS = ["write_file", "edit_file"];
/** The most uses of a tool in one turn, where there is a most. */
export const PER_TURN: Record<string, number> = { fetch_sample: 5 };

/** Tools that change the plugin's files (and so what reading them gives). */
export const CHANGING_TOOLS = ["write_file", "edit_file", "delete_file", "place_file", "convert_picture", "set_entry"];
/** After this many looks in a turn without a change, the model is told
 *  to write with what it has, or to ask; again every ten after. */
export const LOOKS_BEFORE_WRITING = 15;

/** What the model is told when its answer reached the length limit. */
const CUT_OFF = "Your last answer reached its length limit and was cut off. Go on from where it stopped.";

/** A tool's input as a key: the same input, the same key. */
function inputKey(name: string, input: unknown): string {
  const sorted = (value: unknown): unknown =>
    value && typeof value === "object" && !Array.isArray(value)
      ? Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, sorted(v)]))
      : typeof value === "string"
        ? value.trim().toLowerCase()
        : value;
  return `${name} ${JSON.stringify(sorted(input))}`;
}

/** What the model is told after `looks` looks without a change. */
export function writeNow(looks: number): string {
  return `(You have looked things up ${looks} times in this turn without changing a file. That is enough to start: write the code now with what the answers above say, then build, and the compiler tells you what is still wrong. Or ask the person what is unclear.)`;
}

/** `result` with `note` after what it says. */
function withNote(result: Anthropic.ToolResultBlockParam, note: string): Anthropic.ToolResultBlockParam {
  if (typeof result.content === "string" || result.content === undefined) return { ...result, content: `${result.content ?? ""}\n\n${note}` };
  return { ...result, content: [...result.content, { type: "text", text: note }] };
}

/** Old tool results (docs, files read, screenshots, builds, checks), and
 *  the inputs of [`WRITING_TOOLS`], cleared on Anthropic's side once the
 *  prompt passes `trimAt`, never those of [`KEPT_TOOLS`] nor the last
 *  `keep` tool uses: the conversation here stays
 *  whole (append-only, so thinking holds; server-side edits are no edits
 *  of it), and at least `clearAtLeast` goes at a time, so the cache is
 *  written again only now and then. */
export function clearing(rules: LengthRules): ContextManagement {
  return {
    edits: [
      {
        type: "clear_tool_uses_20250919",
        trigger: { type: "input_tokens", value: rules.trimAt },
        keep: { type: "tool_uses", value: rules.keep },
        clear_at_least: { type: "input_tokens", value: rules.clearAtLeast },
        exclude_tools: KEPT_TOOLS,
        clear_tool_inputs: WRITING_TOOLS,
      },
    ],
  };
}

export interface Session {
  provider: Provider;
  project: Project;
  tools: WorkshopTool<any>[];
  handbook: Handbook;
  context: ToolContext;
  model: string;
  /** What is made: data (settings, texts) or code. */
  kind: "data" | "code";
  /** More thought, for a turn after PaperPaw's checks kept failing. */
  escalated?: boolean;
  /** The system prompt: the handbook for the plugin's kind (data's if not
   *  given). */
  prompt?: string;
  /** The most uses of tools in one turn, over [`PER_TURN`] (the looks the
   *  person allows). */
  perTurn?: Record<string, number>;
  /** A note after a tool's results, by its name (what the person asked
   *  of it). */
  notes?: Record<string, string>;
  /** When old tool results are cleared and the conversation summarised
   *  (Normal's if not given). */
  length?: LengthRules;
  /** The model that writes the summary (Haiku if not given). */
  summariser?: string;
  /** Now, and the person's time zone (the computer's if not given). */
  now?: () => Date;
  timeZone?: string;
}

export interface TurnEvents {
  /** Text of the model as it is written. */
  onText?(delta: string): void;
  /** The summary of its thinking as it is written. */
  onThinking?(delta: string): void;
  /** A tool ran: the line the conversation shows. */
  onStep?(step: Step, ok: boolean): void;
  /** A round ended: the project changed (messages, usage). */
  onRound?(): void;
}

/** How a turn ended: the work is `done`, the person `stopped` it, or the
 *  model `refusal`. A turn never ends for being long or costly: the
 *  person decides when to stop it. */
export type TurnEnd = "done" | "stopped" | "refusal";

type Effort = "low" | "medium" | "high";

/** How much the model thinks: as little as each model allows, and the
 *  effort for the kind, unless PaperPaw's checks kept failing; then
 *  adaptive thinking (its summary shown) at more effort. Haiku 5.5 may
 *  think not at all, Sonnet 5.5 at least `between_tools` (no thinking,
 *  short notes between tools), Opus 5.5 always thinks: effort alone
 *  steers it. Thinking blocks stay in the conversation whatever is
 *  chosen (append-only; a model reads what it can). */
export function thinkingFor(
  model: string,
  kind: "data" | "code",
  escalated: boolean,
): { thinking: Request["thinking"]; output_config: { effort: Effort } } {
  if (escalated) {
    return { thinking: { type: "adaptive", display: "summarized" } as Request["thinking"], output_config: { effort: kind === "code" ? "high" : "medium" } };
  }
  const effort: Effort = kind === "code" ? "medium" : "low";
  if (model.startsWith("claude-haiku-")) return { thinking: { type: "disabled" }, output_config: { effort } };
  if (model.startsWith("claude-sonnet-")) return { thinking: { type: "between_tools" } as unknown as Request["thinking"], output_config: { effort } };
  return { thinking: { type: "adaptive", display: "summarized" } as Request["thinking"], output_config: { effort } };
}

/** The prompt's size in the last request, in tokens. */
export function lastPrompt(project: Project): number {
  return project.lastPrompt ?? 0;
}

/** The person's words, and the pictures they added (image blocks). */
export type Said = string | Anthropic.ContentBlockParam[];

export async function runTurn(session: Session, said: Said, events: TurnEvents = {}, signal?: AbortSignal): Promise<TurnEnd> {
  const { project, provider } = session;
  const rules = session.length ?? LENGTHS.normal;
  const today = todayLine(session.now?.() ?? new Date(), session.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone);
  // Today's date, once a conversation and again when it changed: in the
  // person's message, so the cached prompt before it stays the same.
  const dated = (blocks: Anthropic.ContentBlockParam[]): Anthropic.ContentBlockParam[] =>
    told(project.messages, today) ? blocks : [{ type: "text", text: today }, ...blocks];

  // Grown long: on in a fresh conversation, the person's words after the
  // summary (kept to be carried again if the request fails).
  let carried: string | undefined;
  if (lastPrompt(project) > rules.summariseAt) {
    try {
      carried = await goOnFresh(session, false, signal);
    } catch (error) {
      if (signal?.aborted) return "stopped";
      throw error;
    }
  }

  // A turn that stopped after its tools ran ends with their results: the
  // person's words join that message rather than following it.
  const last = project.messages.at(-1);
  const words: Anthropic.ContentBlockParam[] = typeof said === "string" ? [{ type: "text", text: said }] : said;
  const blocks = dated(carried ? [{ type: "text", text: carried }, ...words] : words);
  let added: "message" | number;
  if (last?.role === "user" && Array.isArray(last.content)) {
    last.content.push(...blocks);
    added = blocks.length;
  } else {
    project.messages.push({ role: "user", content: typeof said === "string" && blocks.length === 1 ? said : blocks });
    added = "message";
  }

  const tools = session.tools.map((t) => definition(t, provider.eagerTools));
  const system: Anthropic.TextBlockParam[] = [
    { type: "text", text: session.prompt ?? session.handbook.prompt, cache_control: { type: "ephemeral" } },
  ];

  // What this turn looked at (by input, the call that answered and how
  // many uses before it), how often since the last change, and whether it
  // changed a file.
  const seen = new Map<string, { id: string; at: number }>();
  const used = new Map<string, number>();
  let uses = 0;
  let looks = 0;

  for (let round = 0; ; round++) {
    // Every round, not only the first: a long turn grows the prompt too,
    // and goes on in a fresh conversation where it was. A fresh one is
    // empty, so the next one comes only after a round of work.
    if (round > 0 && lastPrompt(project) > rules.summariseAt) {
      let text: string;
      try {
        text = await goOnFresh(session, true, signal);
      } catch (error) {
        if (signal?.aborted) return "stopped";
        throw error;
      }
      project.messages.push({ role: "user", content: dated([{ type: "text", text }]) });
      seen.clear();
      events.onRound?.();
    }
    const request: Request = {
      model: session.model,
      max_tokens: MAX_TOKENS,
      system,
      tools,
      messages: project.messages,
      // The conversation so far is cached too, up to its last block.
      cache_control: { type: "ephemeral" },
      ...thinkingFor(session.model, session.kind, session.escalated ?? false),
      context_management: clearing(rules),
    };
    let message: Anthropic.Message;
    try {
      message = await provider.send(request, { onText: events.onText, onThinking: events.onThinking }, signal);
    } catch (error) {
      if (round === 0) {
        undo(project, added);
        // The summary goes with the person's next words.
        if (carried) project.carried = carried;
      }
      if (signal?.aborted) return "stopped";
      throw error;
    }
    project.usage = addUsage(project.usage, priced(session.model, message.usage));
    project.lastPrompt =
      message.usage.input_tokens + (message.usage.cache_read_input_tokens ?? 0) + (message.usage.cache_creation_input_tokens ?? 0);
    project.messages.push({ role: "assistant", content: message.content });
    events.onRound?.();

    if (message.stop_reason === "refusal") return "refusal";
    if (message.stop_reason === "pause_turn") continue;

    const calls = message.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
    if (calls.length === 0) {
      if (message.stop_reason !== "max_tokens") return "done";
      // An answer that reached its length limit goes on by itself.
      project.messages.push({ role: "user", content: [{ type: "text", text: CUT_OFF }] });
      events.onRound?.();
      continue;
    }

    const results: Anthropic.ToolResultBlockParam[] = [];
    for (const call of calls) {
      const looking = LOOKING_TOOLS.includes(call.name);
      const key = looking ? inputKey(call.name, call.input) : "";
      // An answer older than the uses never cleared may be gone: asked again.
      const found = looking ? seen.get(key) : undefined;
      const earlier = found && uses - found.at < rules.keep ? found.id : undefined;
      uses += 1;
      let result: Anthropic.ToolResultBlockParam;
      const most = { ...PER_TURN, ...session.perTurn }[call.name];
      if (!earlier && most !== undefined && (used.get(call.name) ?? 0) >= most) {
        result = { type: "tool_result", tool_use_id: call.id, content: `${call.name} is used at most ${most} times in one turn.`, is_error: true };
        results.push(result);
        continue;
      }
      if (!earlier && most !== undefined) used.set(call.name, (used.get(call.name) ?? 0) + 1);
      const count = most !== undefined && !earlier ? `(${call.name} ${used.get(call.name)} of at most ${most} in this turn.)` : "";
      if (earlier) {
        // Answered in this turn already, and still so: where, not again.
        result = {
          type: "tool_result",
          tool_use_id: call.id,
          content: `Already answered above in this turn: ${call.name} with the same input (call ${earlier}). Read that answer; it has not changed since.`,
        };
      } else {
        result = await runTool(session, call, message.stop_reason === "max_tokens", events);
        if (looking && !result.is_error) seen.set(key, { id: call.id, at: uses - 1 });
      }
      if (CHANGING_TOOLS.includes(call.name) && !result.is_error) {
        looks = 0;
        // What the files say may differ now; the docs say the same.
        for (const k of [...seen.keys()]) if (!k.startsWith("lookup_docs ")) seen.delete(k);
      } else if (looking) {
        looks += 1;
        if (looks >= LOOKS_BEFORE_WRITING && (looks - LOOKS_BEFORE_WRITING) % 10 === 0) result = withNote(result, writeNow(looks));
      }
      // How many are left, and what the person asked of this tool.
      const note = [count, session.notes?.[call.name] ?? ""].filter(Boolean).join(" ");
      if (note && !result.is_error) result = withNote(result, note);
      results.push(result);
    }
    project.messages.push({ role: "user", content: results });
    events.onRound?.();
    if (signal?.aborted) return "stopped";
  }
}

/** The conversation summarised (by the summariser, from a transcript)
 *  and on in a fresh one; what its first message carries. Where no
 *  summary comes (the provider sends its own prompt, the model refused or
 *  failed), what the person asked for stands in for one. What the summary
 *  cost is the turn's. */
async function goOnFresh(session: Session, midTurn: boolean, signal?: AbortSignal): Promise<string> {
  const { project, provider } = session;
  let summary: string | undefined;
  if (!provider.ownPrompt) {
    const model = session.summariser ?? MODELS.data;
    const request: Request = {
      model,
      max_tokens: SUMMARY_TOKENS,
      system: [{ type: "text", text: SUMMARY_PROMPT }],
      messages: [{ role: "user", content: transcript(project.messages) }],
      ...thinkingFor(model, "data", false),
    };
    try {
      const message = await provider.send(request, {}, signal);
      project.usage = addUsage(project.usage, priced(model, message.usage));
      if (message.stop_reason !== "refusal") {
        summary = message.content
          .filter((b): b is Anthropic.TextBlock => b.type === "text")
          .map((b) => b.text)
          .join("");
      }
    } catch (error) {
      if (signal?.aborted) throw error;
      // No summary: the person's requests stand in for one.
    }
  }
  const carried = carriedText(project, summary, midTurn);
  startFresh(project);
  return carried;
}

async function runTool(session: Session, call: Anthropic.ToolUseBlock, cut: boolean, events: TurnEvents): Promise<Anthropic.ToolResultBlockParam> {
  const error = (content: string): Anthropic.ToolResultBlockParam => ({ type: "tool_result", tool_use_id: call.id, content, is_error: true });
  const tool = session.tools.find((t) => t.name === call.name);
  if (!tool) return error(`There is no tool ${call.name}.`);
  // An answer cut off at its length limit may hold a cut-off input.
  if (cut) {
    events.onStep?.({ key: `step.${call.name}` }, false);
    return error("Your answer was cut off before this call was complete. Do it again, in smaller parts if it is long.");
  }
  // Its input came as JSON that was not valid (tool-input.ts): not run.
  if (invalidJson(call.input)) {
    events.onStep?.({ key: `step.${call.name}` }, false);
    return error("The input of this call was not valid JSON, so nothing was done. Make the call again with valid JSON.");
  }
  const input = tool.schema.safeParse(call.input);
  if (!input.success) {
    events.onStep?.({ key: `step.${call.name}` }, false);
    return error(`The input does not fit the tool: ${input.error.issues.map((i) => `${i.path.join(".") || "input"}: ${i.message}`).join("; ")}`);
  }
  try {
    const result = await tool.run(input.data, session.context);
    events.onStep?.(result.step, !result.isError);
    return { type: "tool_result", tool_use_id: call.id, content: result.content, ...(result.isError ? { is_error: true } : {}) };
  } catch (e) {
    events.onStep?.({ key: `step.${call.name}` }, false);
    return error(`The tool failed: ${e instanceof Error ? e.message : String(e)}`);
  }
}

/** Takes back the person's words of a turn that never reached the model. */
function undo(project: Project, added: "message" | number): void {
  const last = project.messages.at(-1);
  if (added === "message") project.messages.pop();
  else if (last && Array.isArray(last.content)) last.content.splice(last.content.length - added, added);
}
