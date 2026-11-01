// OpenRouter as a key: no network, its answers are made up here.
import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  forOpenRouter,
  OPENROUTER_FEE,
  OPENROUTER_MODELS,
  OPENROUTER_URL,
  OpenRouter,
  OpenRouterError,
  openRouterModel,
  trouble,
} from "../src/ai/openrouter";
import { priced } from "../src/ai/pricing";
import { MODELS } from "../src/ai/pricing";
import type { Request } from "../src/ai/provider";
import { message } from "../src/app/controller";
import { keyKind, providerFor } from "../src/desktop/App";
import { offered } from "../src/desktop/models";

const KEY = "sk-or-v1-" + "a1b2c3d4".repeat(8);

/** What OpenRouter streams for one text answer, then a tool call. */
function events(): string {
  const e = (name: string, data: unknown) => `event: ${name}\ndata: ${JSON.stringify(data)}\n\n`;
  return [
    e("message_start", { type: "message_start", message: { id: "m", type: "message", role: "assistant", model: "anthropic/claude-sonnet-5.5", content: [], stop_reason: null, usage: { input_tokens: 100, cache_read_input_tokens: 900, cache_creation_input_tokens: 0, output_tokens: 1 } } }),
    e("content_block_start", { type: "content_block_start", index: 0, content_block: { type: "text", text: "" } }),
    e("content_block_delta", { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: "Hello" } }),
    e("content_block_stop", { type: "content_block_stop", index: 0 }),
    e("content_block_start", { type: "content_block_start", index: 1, content_block: { type: "tool_use", id: "t1", name: "write_file", input: {} } }),
    e("content_block_delta", { type: "content_block_delta", index: 1, delta: { type: "input_json_delta", partial_json: '{"path":"a.txt"}' } }),
    e("content_block_stop", { type: "content_block_stop", index: 1 }),
    e("message_delta", { type: "message_delta", delta: { stop_reason: "tool_use" }, usage: { output_tokens: 20 } }),
    e("message_stop", { type: "message_stop" }),
  ].join("");
}

interface Seen {
  url: string;
  headers: Headers;
  body: Record<string, unknown>;
}

/** A network that answers `reply` and keeps what was asked. */
function network(reply: () => Response) {
  const seen: Seen[] = [];
  const fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    seen.push({ url: String(input), headers: new Headers(init?.headers), body: JSON.parse(String(init?.body)) });
    return reply();
  };
  return { seen, fetch: fetch as typeof globalThis.fetch };
}

const sse = () => new Response(events(), { status: 200, headers: { "content-type": "text/event-stream" } });
const refusal = (status: number, text: string) =>
  new Response(JSON.stringify({ error: { code: status, message: text } }), { status, headers: { "content-type": "application/json" } });

const request = (over: Partial<Request> = {}): Request => ({
  model: MODELS.code,
  max_tokens: 1000,
  system: [{ type: "text", text: "Handbook", cache_control: { type: "ephemeral" } }],
  messages: [{ role: "user", content: [{ type: "text", text: "Make it" }] }],
  cache_control: { type: "ephemeral" },
  ...over,
});

describe("what a key looks like", () => {
  it("tells Claude's, OpenRouter's and PaperPaw's keys apart", () => {
    expect(keyKind(KEY)).toBe("openrouter");
    expect(keyKind(`  ${KEY}\n`)).toBe("openrouter");
    expect(keyKind("sk-ant-api03-" + "x".repeat(40))).toBe("claude");
    expect(keyKind("ppw-" + "x".repeat(20))).toBe("paperpaw");
    expect(keyKind("sk-or-short")).toBeNull();
    expect(keyKind("sk-proj-" + "x".repeat(40))).toBeNull();
    expect(keyKind("")).toBeNull();
  });

  it("gives the OpenRouter key its own provider, and the same models as a Claude key", () => {
    const provider = providerFor("openrouter", KEY);
    expect(provider).toBeInstanceOf(OpenRouter);
    expect(provider.label).toBe("provider.openrouter");
    expect(providerFor("claude", "sk-ant-x").label).toBe("provider.key");
    expect(offered("openrouter")).toEqual(offered("claude"));
  });
});

describe("the models the workshop asks", () => {
  it("are named as OpenRouter names them, the cheap one for summaries and drafts too", () => {
    expect(openRouterModel(MODELS.data)).toBe("anthropic/claude-haiku-5.5");
    expect(openRouterModel(MODELS.code)).toBe("anthropic/claude-sonnet-5.5");
    expect(openRouterModel("claude-opus-5-5")).toBe("anthropic/claude-opus-5.5");
    expect(Object.values(OPENROUTER_MODELS).every((m) => m.startsWith("anthropic/claude-"))).toBe(true);
    // One it does not know goes as it is.
    expect(openRouterModel("anthropic/other")).toBe("anthropic/other");
  });
});

describe("the request OpenRouter gets", () => {
  it("has its model name, and leaves out what only Anthropic takes", () => {
    const sent = forOpenRouter(
      request({
        context_management: { edits: [] },
        ...({ output_config: { effort: "low" } } as object),
      }),
    ) as unknown as Record<string, unknown>;
    expect(sent.model).toBe("anthropic/claude-sonnet-5.5");
    expect(sent).not.toHaveProperty("context_management");
    expect(sent).not.toHaveProperty("output_config");
  });

  it("moves the automatic cache mark to the last block of the conversation", () => {
    const original = request();
    const sent = forOpenRouter(original);
    expect(sent).not.toHaveProperty("cache_control");
    const last = sent.messages[0]!.content as { cache_control?: unknown }[];
    expect(last[0]!.cache_control).toEqual({ type: "ephemeral" });
    // The caller's request is left as it was.
    expect((original.messages[0]!.content as { cache_control?: unknown }[])[0]!.cache_control).toBeUndefined();
    // Text content becomes a block to carry it.
    const plain = forOpenRouter(request({ messages: [{ role: "user", content: "Hi" }] }));
    expect(plain.messages[0]!.content).toEqual([{ type: "text", text: "Hi", cache_control: { type: "ephemeral" } }]);
  });

  it("keeps to four cache marks", () => {
    const marked = { type: "text" as const, text: "x", cache_control: { type: "ephemeral" as const } };
    const sent = forOpenRouter(
      request({
        system: [marked, marked, marked],
        messages: [{ role: "user", content: [{ type: "text", text: "a" }, marked] }, { role: "assistant", content: [{ type: "text", text: "b" }] }],
      }),
    );
    const tail = (sent.messages[1]!.content as { cache_control?: unknown }[])[0]!;
    expect(tail.cache_control).toBeUndefined();
  });
});

describe("OpenRouter as the provider", () => {
  it("asks OpenRouter's Anthropic API with the key as a bearer token, and reads the stream with its tool call", async () => {
    const net = network(sse);
    const provider = new OpenRouter(KEY, "provider.openrouter", net.fetch);
    const text: string[] = [];
    const answer = await provider.send(request({ model: MODELS.data }), { onText: (d) => text.push(d) });

    expect(net.seen).toHaveLength(1);
    const asked = net.seen[0]!;
    expect(asked.url).toBe(`${OPENROUTER_URL}/v1/messages`);
    expect(asked.headers.get("authorization")).toBe(`Bearer ${KEY}`);
    expect(asked.headers.get("x-api-key")).toBeNull();
    expect(asked.headers.get("anthropic-beta")).toBeNull();
    expect(asked.body.model).toBe("anthropic/claude-haiku-5.5");
    expect(asked.body.stream).toBe(true);

    expect(text.join("")).toBe("Hello");
    expect(answer.stop_reason).toBe("tool_use");
    expect(answer.content.map((b) => b.type)).toEqual(["text", "tool_use"]);
    const tool = answer.content[1] as { name: string; input: unknown };
    expect(tool.name).toBe("write_file");
    expect(tool.input).toEqual({ path: "a.txt" });
    expect(answer.usage.cache_read_input_tokens).toBe(900);
  });

  it("costs the model's price and OpenRouter's fee on it", async () => {
    const provider = new OpenRouter(KEY);
    expect(provider.costFactor).toBeCloseTo(1 + OPENROUTER_FEE);
    const usage = { input_tokens: 1_000_000, output_tokens: 0 };
    const plain = priced(MODELS.code, usage);
    const fee = priced(MODELS.code, usage, provider.costFactor);
    expect(fee.dollars).toBeCloseTo(plain.dollars * 1.055);
    expect(fee.inputTokens).toBe(plain.inputTokens);
  });

  it.each([
    [401, "User not found.", "key"],
    [402, "Insufficient credits. Add more using https://openrouter.ai/settings/credits", "credit"],
    [400, "No endpoints found that support tool use. To learn more about provider routing, visit: https://openrouter.ai/docs", "tools"],
    [404, "No endpoints found for anthropic/claude-haiku-5.5.", "model"],
  ] as const)("says why a %i answer failed (%s)", async (status, said, expected) => {
    const net = network(() => refusal(status, said));
    const provider = new OpenRouter(KEY, "provider.openrouter", net.fetch);
    const error = await provider.send(request(), {}).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(OpenRouterError);
    expect((error as OpenRouterError).trouble).toBe(expected);
    expect((error as OpenRouterError).said).toBe(said);
    // A refusal that will not change is not asked again.
    expect(net.seen).toHaveLength(1);
  });

  it("leaves a lost connection as it is", async () => {
    const provider = new OpenRouter(KEY, "provider.openrouter", (async () => {
      throw new TypeError("fetch failed");
    }) as unknown as typeof fetch);
    const error = await provider.send(request(), {}).catch((e: unknown) => e);
    expect(error).not.toBeInstanceOf(OpenRouterError);
  });
});

describe("sorting what OpenRouter says", () => {
  it("by its status and words", () => {
    expect(trouble(401, "Invalid credentials")).toBe("key");
    expect(trouble(403, "Your key is not allowed")).toBe("key");
    expect(trouble(403, "Your input was flagged by moderation")).toBe("other");
    expect(trouble(402, "")).toBe("credit");
    expect(trouble(400, "This model does not support tools")).toBe("tools");
    expect(trouble(400, "anthropic/nothing is not a valid model ID")).toBe("model");
    expect(trouble(404, "No such thing")).toBe("model");
    expect(trouble(429, "Rate limited")).toBe("rate");
    expect(trouble(502, "Provider returned error")).toBe("busy");
    expect(trouble(503, "No provider meets your routing requirements")).toBe("busy");
    expect(trouble(500, "oops")).toBe("server");
    expect(trouble(400, "max_tokens is too large")).toBe("other");
    expect(trouble(undefined, "?")).toBe("other");
  });

  it("is told to the person in words that name OpenRouter and what to do", () => {
    expect(message(new OpenRouterError("key", "x", 401))).toMatch(/OpenRouter did not accept the key/);
    expect(message(new OpenRouterError("credit", "x", 402))).toMatch(/OpenRouter account has no credit/);
    expect(message(new OpenRouterError("tools", "x", 400))).toMatch(/tools.*Pick another model/);
    expect(message(new OpenRouterError("model", "x", 404))).toMatch(/does not know this model/);
    expect(message(new OpenRouterError("other", "max_tokens is too large", 400))).toContain("max_tokens is too large");
    expect(message(new OpenRouterError("other", "x", 413))).toMatch(/long/);
  });
});

describe("what the window may reach", () => {
  it("names OpenRouter's address in the app's content security policy, and only the services it uses besides", () => {
    const conf = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "..", "src-tauri", "tauri.conf.json"), "utf8"));
    const connect = String(conf.app.security.csp)
      .split(";")
      .map((d: string) => d.trim())
      .find((d: string) => d.startsWith("connect-src"))!
      .split(/\s+/)
      .filter((h: string) => h.startsWith("https://"));
    expect(connect).toContain(new URL(OPENROUTER_URL).origin);
    expect(connect.sort()).toEqual(["https://api.anthropic.com", "https://openrouter.ai", "https://workshop.paperpaw.org"]);
  });
});
