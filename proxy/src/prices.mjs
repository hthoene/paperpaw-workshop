// What a request costs, in US dollars per million tokens, as the
// workshop counts it (src/ai/pricing.ts; a test keeps the two the same).
// Cache reads cost a tenth of the input price (a twentieth on Opus 5.5),
// cache writes 1.25 times it (5-minute cache).

export const PRICES = {
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

/** The models a key may use unless it says otherwise. */
export const DEFAULT_MODELS = ["claude-haiku-5-5", "claude-sonnet-5-5"];

/** The cost of one answer's `usage` (Anthropic's field names). */
export function cost(model, usage) {
  const base = PRICES[model];
  if (!base || !usage) return 0;
  const input = usage.input_tokens ?? 0;
  const write = usage.cache_creation_input_tokens ?? 0;
  const read = usage.cache_read_input_tokens ?? 0;
  const output = usage.output_tokens ?? 0;
  const p = base.tier && input + write + read > base.tier.tokens ? base.tier.above : base;
  return (input * p.input + write * p.cacheWrite + read * p.cacheRead + output * p.output) / 1_000_000;
}
