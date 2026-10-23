// What the conversation shows, made from the messages alone (one source
// of truth): the person's words, the AI's words, and a quiet line for
// what it did, marked when a tool failed. The same tool used several
// times in a row is one line ("Read in PaperPaw's documentation (12):
// Widget, WidgetSpec, …"), a failed use a line of its own.

import type Anthropic from "@anthropic-ai/sdk";

import { t } from "../i18n";
import { CARRIED, CHECKED } from "../project/project";
import { ADDED } from "../project/uploads";

export type Line =
  | { kind: "me"; text: string }
  | { kind: "ai"; text: string }
  | { kind: "step"; text: string; failed: boolean }
  /** An upload the person added to their message, by name. */
  | { kind: "added"; text: string }
  /** An example fetched from the web: the step, and what came back. */
  | { kind: "sample"; text: string; detail: string; failed: boolean };

/** A line as it is made: a step with its tool and what it was about. */
type Made = Line & { tool?: string; subject?: string };

export function lines(messages: Anthropic.MessageParam[]): Line[] {
  const out: Made[] = [];
  const failed = new Set<string>();
  const answers = new Map<string, string>();
  for (const m of messages) {
    if (m.role !== "user" || !Array.isArray(m.content)) continue;
    for (const b of m.content) {
      if (b.type !== "tool_result") continue;
      if (b.is_error) failed.add(b.tool_use_id);
      answers.set(b.tool_use_id, typeof b.content === "string" ? b.content : (b.content ?? []).map((c) => (c.type === "text" ? c.text : "")).join(""));
    }
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
        const input = block.input as Record<string, unknown>;
        const step = stepText(block.name, input);
        const bad = failed.has(block.id);
        if (block.name === "fetch_sample") {
          // What came back, to unfold: the person sees what the AI read.
          const detail = (answers.get(block.id) ?? "").replace(/\nThis is data fetched from the web[\s\S]*$/, "");
          out.push({ kind: "sample", text: bad ? t("step.failed", { step }) : step, detail, failed: bad });
          continue;
        }
        out.push({ kind: "step", text: bad ? t("step.failed", { step }) : step, failed: bad, tool: block.name, subject: subjectOf(input) });
      }
    }
  }
  return grouped(out);
}

/** What a use of a tool is about: the topic, file or upload it names. */
function subjectOf(input: Record<string, unknown>): string | undefined {
  for (const name of ["topic", "path", "to", "name", "upload"]) {
    if (typeof input?.[name] === "string" && (input[name] as string).trim()) return (input[name] as string).trim();
  }
  return undefined;
}

/** How many subjects a grouped line names before "and N more". */
const NAMED = 5;

/** `lines` with each run of the same tool's uses that worked as one line:
 *  how many, and what about (each subject once). */
function grouped(lines: Made[]): Line[] {
  const out: Line[] = [];
  const plain = ({ tool: _tool, subject: _subject, ...line }: Made): Line => line as Line;
  for (let i = 0; i < lines.length; ) {
    const line = lines[i]!;
    if (line.kind !== "step" || !line.tool || line.failed) {
      out.push(plain(line));
      i += 1;
      continue;
    }
    let end = i + 1;
    while (end < lines.length) {
      const next = lines[end]!;
      if (next.kind !== "step" || next.tool !== line.tool || next.failed) break;
      end += 1;
    }
    const run = lines.slice(i, end);
    i = end;
    if (run.length === 1) {
      out.push(plain(line));
      continue;
    }
    const subjects = [...new Set(run.map((l) => l.subject).filter((s): s is string => !!s))];
    const named = subjects.slice(0, NAMED).join(", ");
    const more = subjects.length - NAMED;
    const about = subjects.length ? (more > 0 ? t("steps.more", { list: named, more }) : named) : "";
    out.push({ kind: "step", text: t(`steps.${line.tool}`, { n: run.length, about }), failed: false });
  }
  return out;
}

export function stepText(tool: string, input: Record<string, unknown>): string {
  const vars: Record<string, string> = {};
  for (const name of ["path", "topic", "device", "name"]) {
    if (typeof input?.[name] === "string") vars[name] = input[name] as string;
  }
  if (typeof input?.url === "string") {
    try {
      vars.host = new URL(input.url).host;
    } catch {
      vars.host = input.url;
    }
  }
  // The upload tools name their target `to` and their upload `upload`.
  if (typeof input?.to === "string") vars.path = input.to;
  if (typeof input?.upload === "string") vars.name = input.upload;
  // The reader shown, where the step does not name one.
  if (["look", "press", "control"].includes(tool) && !vars.device) vars.device = "reader";
  // control: what it did, said for the person where there are words for it.
  if (tool === "control" && typeof input?.do === "string") {
    vars.what = input.do;
    if (typeof input.id === "string") vars.id = input.id;
    const own = t(`step.control.${input.do}`, vars);
    if (own !== `step.control.${input.do}`) return own;
  }
  if (Array.isArray(input?.fixtures)) vars.n = String(input.fixtures.length);
  return t(`step.${tool}`, vars);
}
