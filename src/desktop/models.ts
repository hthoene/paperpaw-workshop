// Which Claude model the workshop asks: Automatic (Haiku for data plugins
// and small edits, Sonnet for code) unless the person picks one in
// Settings, or one for a plugin. With a PaperPaw key only what the proxy
// allows that key; with one's own Claude key every model.

import { MODELS, PRICES } from "../ai/pricing";
import type { Project } from "../project/project";

export const HAIKU = "claude-haiku-5-5";
export const SONNET = "claude-sonnet-5-5";
export const OPUS = "claude-opus-5-5";

export type ModelChoice = "auto" | typeof HAIKU | typeof SONNET | typeof OPUS;

/** What a turn is: a data plugin or a small edit, or code. */
export type Task = "data" | "code";

const times = (model: string) => Math.round(PRICES[model]!.input / PRICES[HAIKU]!.input);

export const CHOICES: { choice: ModelChoice; label: string; hint: string }[] = [
  { choice: "auto", label: "Automatic (recommended)", hint: "Haiku for looks and small changes, Sonnet for code." },
  { choice: HAIKU, label: "Haiku", hint: "Fastest and cheapest. Good for looks and settings." },
  { choice: SONNET, label: "Sonnet", hint: `Careful with code. About ${times(SONNET)} times Haiku's price.` },
  { choice: OPUS, label: "Opus", hint: `Strongest, slower. About ${times(OPUS)} times Haiku's price.` },
];

/** The models one may pick: with a PaperPaw key those the proxy allows it
 *  (none known yet: Automatic only), with one's own key all. */
export function offered(key: "claude" | "paperpaw" | null, allowed: string[] = []): ModelChoice[] {
  if (key === "claude") return CHOICES.map((c) => c.choice);
  return ["auto", ...CHOICES.map((c) => c.choice).filter((c) => c !== "auto" && allowed.includes(c))];
}

/** A choice that may be used, else Automatic. */
export function usable(choice: ModelChoice | undefined, may: ModelChoice[]): ModelChoice {
  return choice && may.includes(choice) ? choice : "auto";
}

/** The model a turn uses: the plugin's own choice, else the app's, else
 *  by the task. */
export function modelFor(app: ModelChoice, project: Pick<Project, "model"> | null, task: Task, may: ModelChoice[]): string {
  const chosen = usable(project?.model as ModelChoice | undefined, may);
  if (chosen !== "auto") return chosen;
  const general = usable(app, may);
  if (general !== "auto") return general;
  return MODELS[task];
}

const KEY = "workshop.model";

/** The app's choice, kept in this computer's webview (a convenience: lost,
 *  it is Automatic again). */
export function savedChoice(): ModelChoice {
  try {
    const kept = localStorage.getItem(KEY);
    return CHOICES.some((c) => c.choice === kept) ? (kept as ModelChoice) : "auto";
  } catch {
    return "auto";
  }
}

export function saveChoice(choice: ModelChoice): void {
  try {
    localStorage.setItem(KEY, choice);
  } catch {
    // Kept for this run only.
  }
}
