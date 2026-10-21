// The store entry drafted by the AI from the conversation, for the author
// to change: one request whose only tool is `set_entry`, asked for by
// name in the prompt (current models refuse a forced `tool_choice`). It
// is not part of the conversation (so its cache stays as it is), and at
// low effort: it only sums up what was made.

import type Anthropic from "@anthropic-ai/sdk";

import { priced, addUsage } from "../ai/pricing";
import type { Provider } from "../ai/provider";
import { identity, type Files, type Project } from "../project/project";
import { setEntry, type EntryInput } from "../tools/entry";
import { definition, type ToolContext } from "../tools/tool";

const SYSTEM = `You write the store entry of a PaperPaw plugin, for people who browse paperpaw.org's plugin store on their way to a calmer e-reader.

Call set_entry once:
- summary: one plain sentence, at most 160 characters, saying what changes on the reader. No "This plugin".
- description: two to four short sentences: what it changes, for whom, and anything to know (which devices, light or dark). Plain words, no file or setting names, no marketing.
- group: where it belongs (look for themes, home for home screens, reading for the reading view, system for buttons and the rest).
- tags: up to five, lower-case words with hyphens.
- licence: leave it out unless the person chose one.`;

/** What the AI is shown: the plugin's files and the conversation's words. */
export function draftPrompt(project: Project, files: Files): string {
  const { name, id } = identity(project);
  const said = words(project.messages).join("\n");
  const shown = files
    .list()
    .filter((f) => !f.path.startsWith("store/") || f.path === "store/store.ini")
    .map((f) => {
      const text = files.read(f.path);
      return text !== undefined && text.length < 4000 ? `--- ${f.path}\n${text}` : `--- ${f.path} (${f.size} bytes)`;
    })
    .join("\n");
  return `The plugin "${name ?? id ?? "?"}".\n\nIts files:\n${shown}\n\nHow it was made:\n${said}`;
}

/** Drafts the entry into `store/store.ini`. Returns what was written. */
export async function draftEntry(
  provider: Provider,
  model: string,
  project: Project,
  context: ToolContext,
  signal?: AbortSignal,
): Promise<EntryInput> {
  const request: Anthropic.MessageCreateParamsNonStreaming = {
    model,
    max_tokens: 1500,
    system: SYSTEM,
    tools: [definition(setEntry, false)],
    // Thinking as the model likes (current models refuse it switched off),
    // and little of it: the entry only sums up what was made.
    output_config: { effort: "low" },
    messages: [{ role: "user", content: draftPrompt(project, context.files) }],
  };
  const answer = await provider.send(request, {}, signal);
  project.usage = addUsage(project.usage, priced(model, answer.usage));
  const call = answer.content.find((b): b is Anthropic.ToolUseBlock => b.type === "tool_use" && b.name === setEntry.name);
  if (!call) throw new Error("The AI wrote no entry.");
  const input = setEntry.schema.parse(call.input);
  const result = await setEntry.run(input, context);
  if (result.isError) throw new Error(String(result.content));
  return input;
}

/** The person's and the AI's words, without tools and pictures. */
function words(messages: Anthropic.MessageParam[]): string[] {
  const out: string[] = [];
  for (const m of messages) {
    const who = m.role === "user" ? "Person" : "AI";
    if (typeof m.content === "string") out.push(`${who}: ${m.content}`);
    else for (const b of m.content) if (b.type === "text" && b.text.trim()) out.push(`${who}: ${b.text.trim()}`);
  }
  return out;
}
