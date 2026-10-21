// What a request costs, from the usage Anthropic reports and the model's
// prices (US dollars per million tokens). Cache reads cost a tenth of the
// input price (a twentieth on Opus 5.5), cache writes 1.25 times it
// (5-minute cache).

import type { Usage } from "../project/project";

export interface Prices {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  /** Above this many prompt tokens a request costs `above` instead. */
  tier?: { tokens: number; above: Omit<Prices, "tier"> };
}

export const MODELS = {
  data: "claude-haiku-5-5",
  code: "claude-sonnet-5-5",
} as const;

/** The model one may choose instead, with one's own key only. */
export const STRONGER = "claude-opus-5-5";

export const PRICES: Record<string, Prices> = {
  "claude-haiku-5-5": {
    input: 0.1,
    output: 0.5,
    cacheRead: 0.01,
    cacheWrite: 0.125,
    tier: { tokens: 100_000, above: { input: 0.5, output: 2.5, cacheRead: 0.05, cacheWrite: 0.625 } },
  },
  "claude-sonnet-5-5": { input: 2, output: 10, cacheRead: 0.2, cacheWrite: 2.5 },
  "claude-opus-5-5": { input: 4, output: 20, cacheRead: 0.2, cacheWrite: 5 },
};

/** The model's name as people read it. */
export function modelName(model: string): string {
  return (
    { "claude-haiku-5-5": "Claude Haiku 5.5", "claude-sonnet-5-5": "Claude Sonnet 5.5", "claude-opus-5-5": "Claude Opus 5.5" }[
      model
    ] ?? model
  );
}

export interface ApiUsage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
}

/** The usage of one request, priced. */
export function priced(model: string, usage: ApiUsage): Usage {
  const write = usage.cache_creation_input_tokens ?? 0;
  const read = usage.cache_read_input_tokens ?? 0;
  const base = PRICES[model] ?? PRICES["claude-sonnet-5-5"]!;
  const prompt = usage.input_tokens + write + read;
  const p = base.tier && prompt > base.tier.tokens ? base.tier.above : base;
  const dollars =
    (usage.input_tokens * p.input + usage.output_tokens * p.output + read * p.cacheRead + write * p.cacheWrite) / 1_000_000;
  return {
    inputTokens: usage.input_tokens,
    cacheWriteTokens: write,
    cacheReadTokens: read,
    outputTokens: usage.output_tokens,
    dollars,
  };
}

export function addUsage(a: Usage, b: Usage): Usage {
  return {
    inputTokens: a.inputTokens + b.inputTokens,
    cacheWriteTokens: a.cacheWriteTokens + b.cacheWriteTokens,
    cacheReadTokens: a.cacheReadTokens + b.cacheReadTokens,
    outputTokens: a.outputTokens + b.outputTokens,
    dollars: a.dollars + b.dollars,
  };
}
