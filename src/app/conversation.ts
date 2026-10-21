// What the conversation shows, made from the messages alone (one source
// of truth): the person's words, the AI's words, and a quiet line for
// each tool it used, marked when the tool failed.

import type Anthropic from "@anthropic-ai/sdk";

import { t } from "../i18n";

export type Line =
  | { kind: "me"; text: string }
  | { kind: "ai"; text: string }
  | { kind: "step"; text: string; failed: boolean };

export function lines(messages: Anthropic.MessageParam[]): Line[] {
  const out: Line[] = [];
  const failed = new Set<string>();
  for (const m of messages) {
    if (m.role !== "user" || !Array.isArray(m.content)) continue;
    for (const b of m.content) if (b.type === "tool_result" && b.is_error) failed.add(b.tool_use_id);
  }
  for (const m of messages) {
    if (typeof m.content === "string") {
      out.push({ kind: m.role === "user" ? "me" : "ai", text: m.content });
      continue;
    }
    for (const block of m.content) {
      if (block.type === "text" && block.text.trim()) {
        out.push({ kind: m.role === "user" ? "me" : "ai", text: block.text.trim() });
      } else if (block.type === "tool_use") {
        const step = stepText(block.name, block.input as Record<string, unknown>);
        const bad = failed.has(block.id);
        out.push({ kind: "step", text: bad ? t("step.failed", { step }) : step, failed: bad });
      }
    }
  }
  return out;
}

export function stepText(tool: string, input: Record<string, unknown>): string {
  const vars: Record<string, string> = {};
  for (const name of ["path", "topic", "device"]) {
    if (typeof input?.[name] === "string") vars[name] = input[name] as string;
  }
  if ((tool === "look" || tool === "press") && !vars.device) vars.device = "X4";
  return t(`step.${tool}`, vars);
}
