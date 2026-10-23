// What the conversation cost, said calmly and roughly: under each answer
// "about $0.03", in the bar what this plugin and this month came to (or,
// with a PaperPaw key, what is left on it), the details on hover. Amounts
// in US dollars, as Anthropic counts them, written as the computer's
// language writes money. No alarms; a quiet note only when one turn cost
// much more than this plugin's usual.

import type { Usage } from "../project/project";

/** One turn of the person (the automatic fixes after it included). */
export interface Turn {
  /** The conversation's messages up to here belong to it. */
  end: number;
  /** Which conversation (how many earlier ones there were). */
  conversation: number;
  at: string;
  model: string;
  dollars: number;
  input: number;
  output: number;
  /** Read from the cache. */
  cached: number;
}

/** The turn between two usages. */
export function turnOf(before: Usage, after: Usage, end: number, conversation: number, model: string, at = new Date()): Turn {
  return {
    end,
    conversation,
    at: at.toISOString(),
    model,
    dollars: after.dollars - before.dollars,
    input: after.inputTokens - before.inputTokens + (after.cacheWriteTokens - before.cacheWriteTokens),
    output: after.outputTokens - before.outputTokens,
    cached: after.cacheReadTokens - before.cacheReadTokens,
  };
}

/** An amount, roughly: "about $0.03", "less than $0.01". */
export function about(dollars: number, locale?: string): string {
  const money = (n: number) => new Intl.NumberFormat(locale, { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  if (dollars < 0.005) return `less than ${money(0.01)}`;
  return `about ${money(dollars)}`;
}

/** The details, for the hover. */
export function details(t: Turn, locale?: string): string {
  const n = (x: number) => new Intl.NumberFormat(locale).format(x);
  return `${n(t.input)} tokens sent, ${n(t.cached)} read from the cache, ${n(t.output)} written; ${t.model}`;
}

/** Whether a turn cost much more than this plugin's turns before it. */
export function unusual(turn: Turn, before: Turn[]): boolean {
  if (turn.dollars < 0.05 || before.length < 3) return false;
  const sorted = before.map((t) => t.dollars).sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)]!;
  return turn.dollars > 3 * median;
}

/** What turns cost in the month of `now`. */
export function thisMonth(turns: Turn[], now = new Date()): number {
  const month = now.toISOString().slice(0, 7);
  return turns.filter((t) => t.at.startsWith(month)).reduce((n, t) => n + t.dollars, 0);
}
