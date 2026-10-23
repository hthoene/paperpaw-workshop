// The AI loop: one turn of the person, as many rounds of the model and
// its tools as it takes, up to a limit. The conversation is append-only
// (the model's thinking stays valid only so), every tool call gets its
// result, and a tool's input is checked against its schema before it runs.

import type Anthropic from "@anthropic-ai/sdk";

import type { Handbook } from "../handbook/handbook";
import type { Project } from "../project/project";
import { definition, type Step, type ToolContext, type WorkshopTool } from "../tools/tool";
import { addUsage, priced } from "./pricing";
import type { ContextManagement, Provider, Request } from "./provider";

/** The most rounds (requests) one turn of the person may take. */
export const MAX_ROUNDS = 25;
/** Past this many prompt tokens the conversation is too long to go on
 *  cheaply (Haiku's lower price holds up to 100,000): checked before every
 *  round, as one turn of 25 rounds could pass it. */
export const MAX_PROMPT = 90_000;
/** The most one answer may hold, thinking included. */
export const MAX_TOKENS = 32_000;

/** Old tool results (screenshots, files read) cleared on Anthropic's side
 *  once the prompt grows: the conversation here stays whole (append-only,
 *  so thinking and the cache hold), the model sees the recent ones. */
export const CLEARING: ContextManagement = {
  edits: [
    {
      type: "clear_tool_uses_20250919",
      trigger: { type: "input_tokens", value: 40_000 },
      keep: { type: "tool_uses", value: 6 },
      clear_at_least: { type: "input_tokens", value: 10_000 },
    },
  ],
};

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

/** How a turn ended: `cut` when an answer reached its length limit with
 *  nothing more to do, so the person should know it is not finished. */
export type TurnEnd = "done" | "stopped" | "limit" | "refusal" | "too_long" | "cut";

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
  if (lastPrompt(project) > MAX_PROMPT) return "too_long";

  // A turn that stopped after its tools ran ends with their results: the
  // person's words join that message rather than following it.
  const last = project.messages.at(-1);
  const blocks: Anthropic.ContentBlockParam[] = typeof said === "string" ? [{ type: "text", text: said }] : said;
  let added: "message" | number;
  if (last?.role === "user" && Array.isArray(last.content)) {
    last.content.push(...blocks);
    added = blocks.length;
  } else {
    project.messages.push({ role: "user", content: typeof said === "string" ? said : blocks });
    added = "message";
  }

  const tools = session.tools.map((t) => definition(t, provider.eagerTools));
  const system: Anthropic.TextBlockParam[] = [
    { type: "text", text: session.prompt ?? session.handbook.prompt, cache_control: { type: "ephemeral" } },
  ];

  for (let round = 0; round < MAX_ROUNDS; round++) {
    // Every round, not only the first: a long turn grows the prompt too.
    if (round > 0 && lastPrompt(project) > MAX_PROMPT) return "too_long";
    const request: Request = {
      model: session.model,
      max_tokens: MAX_TOKENS,
      system,
      tools,
      messages: project.messages,
      // The conversation so far is cached too, up to its last block.
      cache_control: { type: "ephemeral" },
      ...thinkingFor(session.model, session.kind, session.escalated ?? false),
      context_management: CLEARING,
    };
    let message: Anthropic.Message;
    try {
      message = await provider.send(request, { onText: events.onText, onThinking: events.onThinking }, signal);
    } catch (error) {
      if (round === 0) undo(project, added);
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
    if (calls.length === 0) return message.stop_reason === "max_tokens" ? "cut" : "done";

    const results: Anthropic.ToolResultBlockParam[] = [];
    for (const call of calls) {
      results.push(await runTool(session, call, message.stop_reason === "max_tokens", events));
    }
    project.messages.push({ role: "user", content: results });
    events.onRound?.();
    if (signal?.aborted) return "stopped";
  }
  return "limit";
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
