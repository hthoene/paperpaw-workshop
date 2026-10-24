// paperpaw.org's free quota: the conversation goes to the site's counting
// proxy (POST /api/v1/workshop/messages), which sends it to Anthropic on
// the site's key with the workshop's own prompt and tools, and streams the
// answer back unchanged. Only the conversation and the project's kind
// leave the page; the session's cookie and its form token say who asks.
// The site chooses the model by the kind (Haiku for data plugins, Sonnet
// for code), never the page.

import Anthropic from "@anthropic-ai/sdk";
import { MessageStream } from "@anthropic-ai/sdk/lib/MessageStream";

import type { Provider, Request, Stream } from "./provider";
import { toolInputChecked } from "./tool-input";

/** Why the site did not pass a request on, in its words: not accepted,
 *  the month's budget used, the quota closed, one at a time. */
export class QuotaRefused extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export class QuotaProxy implements Provider {
  readonly label = "provider.quota";
  // The proxy sends its own copy of the tools; this only keeps the
  // definitions the loop makes the same as with a key.
  readonly eagerTools = true;
  readonly ownPrompt = true;
  private csrf: string | null = null;

  constructor(
    private kind: "data" | "code" = "data",
    private base = "",
  ) {}

  async send(request: Request, stream: Stream, signal?: AbortSignal): Promise<Anthropic.Message> {
    let answer = await this.post(request, signal);
    if (answer.status === 403 && (await errorOf(answer.clone()))?.error === "expired") {
      this.csrf = null;
      answer = await this.post(request, signal);
    }
    if (!answer.ok || !answer.body) {
      const body = await errorOf(answer);
      // The site's own refusals: { error, message }.
      if (body && typeof body.error === "string") throw new QuotaRefused(body.error, body.message ?? body.error);
      // Anthropic's, passed on as they came.
      throw Anthropic.APIError.generate(answer.status, body ?? undefined, undefined, answer.headers);
    }
    const s = MessageStream.fromReadableStream(answer.body.pipeThrough(sseToLines()).pipeThrough(toolInputChecked()));
    if (stream.onText) s.on("text", stream.onText);
    if (stream.onThinking) s.on("thinking", stream.onThinking);
    return s.finalMessage();
  }

  private async post(request: Request, signal?: AbortSignal): Promise<Response> {
    const csrf = await this.token();
    // The kind in the address too: the site reserves what a request may
    // cost before it reads the body.
    return fetch(`${this.base}/api/v1/workshop/messages?kind=${this.kind}`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "text/event-stream", ...(csrf ? { "x-paperpaw-csrf": csrf } : {}) },
      body: JSON.stringify({ kind: this.kind, messages: request.messages }),
      signal,
    });
  }

  private async token(): Promise<string | null> {
    if (this.csrf) return this.csrf;
    const answer = await fetch(`${this.base}/api/v1/workshop/session`, { headers: { accept: "application/json" }, cache: "no-store" });
    const session = answer.ok ? ((await answer.json()) as { csrf?: unknown }) : {};
    this.csrf = typeof session.csrf === "string" ? session.csrf : null;
    return this.csrf;
  }
}

async function errorOf(answer: Response): Promise<{ error?: unknown; message?: string; type?: string } | null> {
  return (await answer.json().catch(() => null)) as { error?: unknown; message?: string } | null;
}

/** Anthropic's error types and the status each comes with. */
const STATUS_OF: Record<string, number> = {
  invalid_request_error: 400,
  authentication_error: 401,
  permission_error: 403,
  not_found_error: 404,
  request_too_large: 413,
  rate_limit_error: 429,
  api_error: 500,
  overloaded_error: 529,
};

/** Server-sent events (Anthropic's stream, through the proxy) as the
 *  lines of JSON the SDK's MessageStream reads; an error event ends it
 *  with Anthropic's error. */
export function sseToLines(): TransformStream<Uint8Array, Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  const events = (controller: TransformStreamDefaultController<Uint8Array>, flush: boolean) => {
    const parts = buffer.split(/\r?\n\r?\n/);
    buffer = flush ? "" : parts.pop()!;
    for (const part of parts) {
      const data = part
        .split(/\r?\n/)
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trimStart())
        .join("\n");
      if (!data) continue;
      const event = JSON.parse(data) as { type?: string; error?: unknown };
      if (event.type === "ping") continue;
      if (event.type === "error") {
        // As the error would have come before the stream began.
        const kind = (event.error as { type?: string } | undefined)?.type ?? "api_error";
        controller.error(Anthropic.APIError.generate(STATUS_OF[kind] ?? 500, event, undefined, new Headers()));
        return;
      }
      controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
    }
  };
  return new TransformStream({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      events(controller, false);
    },
    flush(controller) {
      buffer += decoder.decode();
      events(controller, true);
    },
  });
}

/** Where the free quota stands for whoever uses the page: on paperpaw.org
 *  only, for signed-in authors whose application was accepted. */
export type QuotaStanding =
  | { kind: "none" }
  | { kind: "signed-out"; signIn: string }
  | {
      kind: "signed-in";
      /** none, waiting, accepted, declined or revoked. */
      state: string;
      /** Why a request would not go out now, if it would not. */
      refusal: string | null;
      left: number;
      budget: number;
      eurosPerDollar: number;
    };

export async function quotaStanding(base = ""): Promise<QuotaStanding> {
  try {
    const answer = await fetch(`${base}/api/v1/workshop/session`, { headers: { accept: "application/json" }, cache: "no-store" });
    const body = (await answer.json()) as { store?: string; account?: unknown; quota?: Record<string, unknown> | null };
    if (!answer.ok || body.store !== "open") return { kind: "none" };
    if (!body.account) return { kind: "signed-out", signIn: `${base}/account/sign-in?next=${encodeURIComponent(location.pathname)}` };
    const q = body.quota ?? {};
    return {
      kind: "signed-in",
      state: typeof q.state === "string" ? q.state : "none",
      refusal: typeof q.refusal === "string" ? q.refusal : null,
      left: Number(q.left_dollars ?? 0),
      budget: Number(q.budget_dollars ?? 0),
      eurosPerDollar: Number(q.euros_per_dollar ?? 0),
    };
  } catch {
    // On its own (docker compose, npm run dev) there is no site.
    return { kind: "none" };
  }
}
