// What the conversation shows, made from the messages alone (one source
// of truth): the person's words, the AI's words, and a quiet line for
// each tool it used, marked when the tool failed.

import type Anthropic from "@anthropic-ai/sdk";

import { t } from "../i18n";
import { CARRIED, CHECKED } from "../project/project";
import { ADDED } from "../project/uploads";

export type Line =
  | { kind: "me"; text: string }
  | { kind: "ai"; text: string }
  | { kind: "step"; text: string; failed: boolean }
  /** An upload the person added to their message, by name. */
  | { kind: "added"; text: string };

export function lines(messages: Anthropic.MessageParam[]): Line[] {
  const out: Line[] = [];
  const failed = new Set<string>();
  for (const m of messages) {
    if (m.role !== "user" || !Array.isArray(m.content)) continue;
    for (const b of m.content) if (b.type === "tool_result" && b.is_error) failed.add(b.tool_use_id);
  }
  for (const m of messages) {
    const blocks: Anthropic.ContentBlockParam[] = typeof m.content === "string" ? [{ type: "text", text: m.content }] : m.content;
    for (const block of blocks) {
      const added = block.type === "text" && m.role === "user" && block.text.startsWith(ADDED) ? /"(.+?)"/.exec(block.text) : null;
      if (added) {
        out.push({ kind: "added", text: added[1]! });
      } else if (block.type === "text" && m.role === "user" && block.text.startsWith(CHECKED)) {
        const n = /^\S+ checks found (\d+)/.exec(block.text)?.[1] ?? "0";
        out.push({ kind: "step", text: t("workshop.checked", { n }), failed: false });
      } else if (block.type === "text" && m.role === "user" && block.text.startsWith(CARRIED)) {
        out.push({ kind: "step", text: t("workshop.carried"), failed: false });
      } else if (block.type === "text" && block.text.trim()) {
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
  for (const name of ["path", "topic", "device", "name"]) {
    if (typeof input?.[name] === "string") vars[name] = input[name] as string;
  }
  // The upload tools name their target `to` and their upload `upload`.
  if (typeof input?.to === "string") vars.path = input.to;
  if (typeof input?.upload === "string") vars.name = input.upload;
  if ((tool === "look" || tool === "press") && !vars.device) vars.device = "X4";
  return t(`step.${tool}`, vars);
}
