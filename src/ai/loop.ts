// The AI loop: one turn of the person, as many rounds of the model and
// its tools as it takes, up to a limit. The conversation is append-only
// (the model's thinking stays valid only so), every tool call gets its
// result, and a tool's input is checked against its schema before it runs.

import type Anthropic from "@anthropic-ai/sdk";

import type { Handbook } from "../handbook/handbook";
import type { Project } from "../project/project";
import { definition, type Step, type ToolContext, type WorkshopTool } from "../tools/tool";
import { addUsage, priced } from "./pricing";
import type { Provider, Request } from "./provider";

/** The most rounds (requests) one turn of the person may take. */
export const MAX_ROUNDS = 25;
/** Past this many prompt tokens the conversation is too long to go on
 *  cheaply (Haiku's lower price holds up to 100,000). */
export const MAX_PROMPT = 90_000;

export interface Session {
  provider: Provider;
  project: Project;
  tools: WorkshopTool<any>[];
  handbook: Handbook;
  context: ToolContext;
  model: string;
  effort: "low" | "medium" | "high";
}

export interface TurnEvents {
  /** Text of the model as it is written. */
  onText?(delta: string): void;
  /** A tool ran: the line the conversation shows. */
  onStep?(step: Step, ok: boolean): void;
  /** A round ended: the project changed (messages, usage). */
  onRound?(): void;
}

export type TurnEnd = "done" | "stopped" | "limit" | "refusal" | "too_long";

/** The prompt's size in the last request, in tokens. */
export function lastPrompt(project: Project): number {
  return project.lastPrompt ?? 0;
}

export async function runTurn(session: Session, text: string, events: TurnEvents = {}, signal?: AbortSignal): Promise<TurnEnd> {
  const { project, provider } = session;
  if (lastPrompt(project) > MAX_PROMPT) return "too_long";

  // A turn that stopped after its tools ran ends with their results: the
  // person's words join that message rather than following it.
  const last = project.messages.at(-1);
  let added: "message" | "block";
  if (last?.role === "user" && Array.isArray(last.content)) {
    last.content.push({ type: "text", text });
    added = "block";
  } else {
    project.messages.push({ role: "user", content: text });
    added = "message";
  }

  const tools = session.tools.map((t) => definition(t, provider.eagerTools));
  const system: Anthropic.TextBlockParam[] = [
    { type: "text", text: session.handbook.prompt, cache_control: { type: "ephemeral" } },
  ];

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const request: Request = {
      model: session.model,
      max_tokens: 16_000,
      system,
      tools,
      messages: project.messages,
      // The conversation so far is cached too, up to its last block.
      cache_control: { type: "ephemeral" },
      thinking: { type: "adaptive" },
      output_config: { effort: session.effort },
    };
    let message: Anthropic.Message;
    try {
      message = await provider.send(request, { onText: events.onText }, signal);
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
    if (calls.length === 0) return "done";

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
function undo(project: Project, added: "message" | "block"): void {
  const last = project.messages.at(-1);
  if (added === "message") project.messages.pop();
  else if (last && Array.isArray(last.content)) last.content.pop();
}
