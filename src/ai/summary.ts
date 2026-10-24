// A long conversation goes on in a fresh one: a cheap model (Haiku) writes
// a short summary of it from a plain transcript, the old conversation is
// kept to read back ("The conversation before"), and the fresh one's first
// message carries the summary with the plugin's files. Nothing of the old
// conversation is sent again, its thinking neither: the summary is all the
// model has of it (the shape Anthropic's API keeps valid for thinking).

import type Anthropic from "@anthropic-ai/sdk";

import { CARRIED, CHECKED, Files, TODAY, type Project } from "../project/project";
import { ADDED } from "../project/uploads";

/** The most a summary may be, in tokens. */
export const SUMMARY_TOKENS = 4_000;

/** What the summariser is asked for. */
export const SUMMARY_PROMPT = `You summarise a conversation between a person and an AI that makes a plugin for PaperPaw, an e-reader system, so that the AI can go on in a fresh conversation without it. The AI will have only your summary and the plugin's files.

Write in English, short and concrete, at most 600 words, under these headings:
- Built: what the plugin does now and how it is made.
- Open: what the person asked for last, and what is not finished or still fails.
- Decided: what the person chose, wished or turned down, in their words where it matters.
- Learned: facts found on the way that the AI must not find out again: API names and details, gotchas, errors and what fixed them, what did not work.

Leave out file contents (the AI reads the files), greetings and costs. Write the summary only, nothing before or after it.`;

/** How much of each part the transcript keeps, in characters. */
const SAID = 4_000;
const WRITTEN = 2_000;
const INPUT = 300;
const RESULT = 400;

const cut = (text: string, most: number) => (text.length > most ? `${text.slice(0, most)} ...` : text);

/** The conversation as plain text for the summariser: the person's words,
 *  the AI's, each tool use with the start of its input and of its result;
 *  no pictures, no thinking. */
export function transcript(messages: Anthropic.MessageParam[]): string {
  const out: string[] = [];
  for (const m of messages) {
    const blocks: Anthropic.ContentBlockParam[] = typeof m.content === "string" ? [{ type: "text", text: m.content }] : m.content;
    for (const b of blocks) {
      if (b.type === "text") {
        const text = b.text.trim();
        if (!text || text.startsWith(TODAY)) continue;
        if (m.role === "assistant") out.push(`AI: ${cut(text, WRITTEN)}`);
        else if (text.startsWith(CARRIED)) out.push(`Summary of the conversation before:\n${text}`);
        else if (text.startsWith(CHECKED)) out.push(`Workshop: ${cut(text, WRITTEN)}`);
        else if (text.startsWith(ADDED)) out.push(`Workshop: ${text}`);
        else out.push(`Person: ${cut(text, SAID)}`);
      } else if (b.type === "image") {
        out.push(m.role === "user" ? "Person: (a picture)" : "(a picture)");
      } else if (b.type === "tool_use") {
        out.push(`AI used ${b.name}: ${cut(JSON.stringify(b.input), INPUT)}`);
      } else if (b.type === "tool_result") {
        const content =
          typeof b.content === "string"
            ? b.content
            : (b.content ?? []).map((c) => (c.type === "text" ? c.text : "(a picture)")).join("\n");
        out.push(`${b.is_error ? "Failed" : "Result"}: ${cut(content.trim(), RESULT)}`);
      }
    }
  }
  return out.join("\n\n");
}

/** What the person asked for in `messages`, the last 20, each cut short:
 *  the summary when no model wrote one. */
function asked(messages: Anthropic.MessageParam[]): string[] {
  return messages
    .filter((m) => m.role === "user")
    .flatMap((m) => (typeof m.content === "string" ? [m.content] : m.content.filter((b) => b.type === "text").map((b) => b.text)))
    .filter((text) => ![ADDED, CARRIED, CHECKED, TODAY].some((p) => text.startsWith(p)))
    .map((text) => `- ${text.length > 300 ? `${text.slice(0, 300)} ...` : text}`)
    .slice(-20);
}

/** What a fresh conversation's first message carries: the summary (or,
 *  without one, what the person asked for), the plugin's files and the
 *  person's uploads by name; `midTurn` when the AI was in the middle of
 *  the person's request. */
export function carriedText(project: Project, summary: string | undefined, midTurn = false): string {
  const files = new Files(project).list().map((f) => `- ${f.path} (${f.size} bytes)`);
  const uploads = (project.uploads ?? []).map((u) => `- ${u.name}`);
  return [
    ...(summary?.trim()
      ? [`${CARRIED}, summarised to keep it short:`, "", summary.trim()]
      : [`${CARRIED}, which grew long. What the person asked for in it:`, ...asked(project.messages)]),
    "",
    "The plugin's files now (read them with read_file before changing them):",
    ...(files.length ? files : ["(none)"]),
    ...(uploads.length ? ["", "The person's uploads (list_uploads, view_upload):", ...uploads] : []),
    ...(midTurn ? ["", "You were in the middle of the person's last request: go on with it where you left off."] : []),
  ].join("\n");
}

/** The conversation goes on in a fresh one: the old one kept to read back. */
export function startFresh(project: Project): void {
  (project.earlier ??= []).push(project.messages);
  project.messages = [];
  project.lastPrompt = 0;
  project.picturesShown = 0;
}

/** Today's date and the person's time zone, as the AI is told, with what
 *  a cleared tool result means (loop.ts `clearing`: Anthropic's
 *  placeholder says only that it was removed). */
export function todayLine(now: Date, timeZone: string): string {
  const date = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone });
  return `${TODAY} ${date}, ${timeZone}. Old tool results may be cleared to keep the conversation short: use the tool again if you need one.`;
}

/** Whether the conversation was told `line` already. */
export function told(messages: Anthropic.MessageParam[], line: string): boolean {
  return messages.some((m) => m.role === "user" && Array.isArray(m.content) && m.content.some((b) => b.type === "text" && b.text === line));
}
