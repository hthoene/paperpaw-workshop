// Which kind of plugin a new project is: decided from the person's first
// words, so they need not know what a plugin with code is. The smallest
// model answers one short question ("code" or "data"); where it cannot be
// asked, the words decide (data from the web, a game, logic of its own
// need code). A project's kind shows beside its name in the bar.

import type Anthropic from "@anthropic-ai/sdk";

import type { Provider, Request } from "../ai/provider";
import type { Kind } from "../project/project";

/** The question, as the model reads it. */
export const KIND_PROMPT = `You sort requests for PaperPaw plugins (PaperPaw is the firmware of e-ink readers). Answer with one word.

data: what settings, files and pictures can do. A look or theme, fonts, margins, colours, a home screen arranged from the widgets PaperPaw has, key maps, presets, texts and translations, pictures (a sleep picture, a logo), a dictionary or word list given as a file.

code: anything that needs logic of its own. Data fetched from the web or an API (JSON, feeds, a URL), a new widget that shows or computes something of its own, a new screen or tool, a game, timers, counters, calculations, talking to a service.

Answer "code" or "data", nothing else.`;

/** What the words alone say: code for what needs logic of its own. */
export function kindByWords(text: string): Kind {
  return /\b(https?:\/\/|api|json|fetch|download|web|internet|online|feed|rss|url|game|spiel|timer|counter|z[äa]hl|calculat|rechne|widget|screen|bildschirm)/i.test(text) ? "code" : "data";
}

/** The kind of plugin `text` asks for, asked of `model` with `provider`;
 *  by the words where that fails. */
export async function decideKind(provider: Provider, text: string, model: string, signal?: AbortSignal): Promise<Kind> {
  const request: Request = {
    model,
    max_tokens: 8,
    system: [{ type: "text", text: KIND_PROMPT }],
    messages: [{ role: "user", content: text.slice(0, 2000) }],
    thinking: { type: "disabled" },
  };
  try {
    const answer = await provider.send(request, {}, signal);
    const said = answer.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .toLowerCase();
    if (said.includes("code")) return "code";
    if (said.includes("data")) return "data";
  } catch {
    // Not asked: the words decide.
  }
  return kindByWords(text);
}

/** The kind as the bar says it beside the name. */
export function kindLabel(kind: Kind | "auto"): string {
  if (kind === "auto") return "with or without code, as you ask";
  return kind === "code" ? "with code" : "without code";
}
