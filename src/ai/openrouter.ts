// An OpenRouter key: requests go to OpenRouter's Anthropic-compatible
// endpoint (the same Messages API, with the key as a bearer token), so
// streaming, tool use and prompt caching are Anthropic's own, and the
// loop needs no second request path. Claude models only, as the Claude
// key's: OpenRouter names them `anthropic/claude-…`.

import Anthropic from "@anthropic-ai/sdk";
import { MessageStream } from "@anthropic-ai/sdk/lib/MessageStream";

import type { Provider, Request, Stream } from "./provider";
import { toolInputChecked } from "./tool-input";

/** OpenRouter's Anthropic-compatible API (the SDK adds `/v1/messages`). */
export const OPENROUTER_URL = "https://openrouter.ai/api";

/** What OpenRouter takes on top of the models' prices, when credits are
 *  bought (its pricing page: 5.5%); the cost display adds it, as an
 *  estimate. */
export const OPENROUTER_FEE = 0.055;

/** The workshop's models as OpenRouter names them. */
export const OPENROUTER_MODELS: Record<string, string> = {
  "claude-haiku-5-5": "anthropic/claude-haiku-5.5",
  "claude-sonnet-5-5": "anthropic/claude-sonnet-5.5",
  "claude-opus-5-5": "anthropic/claude-opus-5.5",
};

/** OpenRouter's name for a workshop model (one it does not know, as it is). */
export function openRouterModel(model: string): string {
  return OPENROUTER_MODELS[model] ?? model;
}

/** What went wrong, in the groups the window has words for. */
export type Trouble = "key" | "credit" | "tools" | "model" | "rate" | "busy" | "server" | "other";

/** An OpenRouter error, sorted: `trouble` picks the person's words, `said`
 *  is what OpenRouter said. */
export class OpenRouterError extends Error {
  constructor(
    readonly trouble: Trouble,
    readonly said: string,
    readonly status?: number,
  ) {
    super(said);
    this.name = "OpenRouterError";
  }
}

/** OpenRouter's refusal sorted by its status and words (its errors are
 *  `{ error: { code, message } }`; the SDK has the message). */
export function trouble(status: number | undefined, said: string): Trouble {
  const text = said.toLowerCase();
  if (status === 401) return "key";
  if (status === 402 || text.includes("insufficient credits") || text.includes("more credits")) return "credit";
  if (status === 403) return /moderation|flagged|guardrail/.test(text) ? "other" : "key";
  // "No endpoints found that support tool use": the model cannot call tools.
  if (/\btool/.test(text) && (status === 400 || status === 404)) return "tools";
  if (status === 404 || (status === 400 && /model/.test(text) && /not|valid|found|exist/.test(text))) return "model";
  if (status === 429) return "rate";
  if (status === 408 || status === 502 || status === 503 || status === 529) return "busy";
  if (status !== undefined && status >= 500) return "server";
  return "other";
}

/** The request as OpenRouter takes it: the model by its name there, what
 *  Anthropic's betas add (clearing old tool results, effort) left out, and
 *  the automatic cache mark moved onto the last block of the conversation,
 *  where OpenRouter passes a per-block mark on to Anthropic (at most four
 *  marks). */
export function forOpenRouter(request: Request): Request {
  const { context_management: _clearing, cache_control, output_config: _effort, ...rest } = request as Request & {
    output_config?: unknown;
  };
  const out: Request = { ...rest, model: openRouterModel(request.model) };
  if (cache_control) {
    const messages = out.messages.map((m) => ({ ...m }));
    const last = messages[messages.length - 1];
    if (last) {
      const blocks: Anthropic.ContentBlockParam[] =
        typeof last.content === "string" ? [{ type: "text", text: last.content }] : last.content.map((b) => ({ ...b }));
      const tail = blocks[blocks.length - 1] as { cache_control?: unknown } | undefined;
      if (tail && !tail.cache_control && marks(out) < 4) tail.cache_control = cache_control;
      last.content = blocks;
    }
    out.messages = messages;
  }
  return out;
}

/** The cache marks a request has already (system, tools and messages). */
function marks(request: Request): number {
  const count = (blocks: unknown): number =>
    Array.isArray(blocks) ? blocks.filter((b) => b && typeof b === "object" && "cache_control" in b && b.cache_control).length : 0;
  return count(request.system) + count(request.tools) + request.messages.reduce((n, m) => n + count(m.content), 0);
}

export class OpenRouter implements Provider {
  readonly eagerTools = true;
  readonly costFactor = 1 + OPENROUTER_FEE;
  private client: Anthropic;

  /** `fetch`: for the tests, in place of the network. */
  constructor(
    apiKey: string,
    readonly label = "provider.openrouter",
    fetch?: typeof globalThis.fetch,
  ) {
    // The key goes as a bearer token (OpenRouter's way); it is the person's
    // own, typed into this window, which the SDK's browser guard is not for.
    this.client = new Anthropic({ apiKey: null, authToken: apiKey, baseURL: OPENROUTER_URL, dangerouslyAllowBrowser: true, maxRetries: 2, fetch });
  }

  async send(request: Request, stream: Stream, signal?: AbortSignal): Promise<Anthropic.Message> {
    try {
      const events = await this.client.messages.create({ ...forOpenRouter(request), stream: true }, { signal });
      const s = MessageStream.fromReadableStream(events.toReadableStream().pipeThrough(toolInputChecked()));
      if (stream.onText) s.on("text", stream.onText);
      if (stream.onThinking) s.on("thinking", stream.onThinking);
      return await s.finalMessage();
    } catch (e) {
      throw refusal(e);
    }
  }
}

/** An error of the SDK as OpenRouter's, sorted; others as they are. */
function refusal(e: unknown): unknown {
  if (e instanceof Anthropic.APIConnectionError || !(e instanceof Anthropic.APIError)) return e;
  const body = e.error as { error?: { message?: unknown } } | undefined;
  const said = typeof body?.error?.message === "string" ? body.error.message : e.message;
  return new OpenRouterError(trouble(e.status, said), said, e.status);
}
