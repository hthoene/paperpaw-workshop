// How long a conversation grows before it is made shorter ("Conversation
// length" in Settings). Two steps, both at a point in prompt tokens: old
// tool results are cleared on Anthropic's side (context editing, in steps
// of at least `clearAtLeast`, so the prompt cache holds between them; set
// high, as Anthropic counts what a clearing takes away far above what the
// prompt then loses), and later the conversation is summarised and goes
// on in a fresh one. Every
// round reads the whole prompt again (from the cache), so a longer
// conversation costs more a round: Short is cheapest, Long remembers more
// word for word.

import { PRICES } from "./pricing";

export type LengthChoice = "short" | "normal" | "long";

export interface LengthRules {
  /** Past this many prompt tokens old tool results are cleared. */
  trimAt: number;
  /** The most recent tool uses never cleared. */
  keep: number;
  /** The least a clearing takes away, in tokens: fewer, larger steps. */
  clearAtLeast: number;
  /** Past this many prompt tokens the conversation is summarised and goes
   *  on in a fresh one. */
  summariseAt: number;
}

export const LENGTHS: Record<LengthChoice, LengthRules> = {
  short: { trimAt: 25_000, keep: 6, clearAtLeast: 12_000, summariseAt: 50_000 },
  normal: { trimAt: 40_000, keep: 10, clearAtLeast: 20_000, summariseAt: 90_000 },
  long: { trimAt: 70_000, keep: 15, clearAtLeast: 30_000, summariseAt: 160_000 },
};

/** Below a model's higher price for long prompts, with room for a round's
 *  tool results (Haiku costs five times as much past 100,000). */
const BELOW_TIER = 10_000;

/** The rules of `choice` for `model`: a model with a higher price for long
 *  prompts summarises before it (Long on Haiku clears later, no more). */
export function lengthRules(choice: LengthChoice, model: string): LengthRules {
  const rules = LENGTHS[choice];
  const tier = PRICES[model]?.tier?.tokens;
  if (!tier || rules.summariseAt <= tier - BELOW_TIER) return rules;
  const summariseAt = tier - BELOW_TIER;
  return { ...rules, summariseAt, trimAt: Math.min(rules.trimAt, summariseAt - rules.clearAtLeast) };
}
