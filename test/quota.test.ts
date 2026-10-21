import Anthropic from "@anthropic-ai/sdk";
import { afterEach, describe, expect, it, vi } from "vitest";

import { QuotaProxy, QuotaRefused } from "../src/ai/quota";
import type { Request } from "../src/ai/provider";
import { message } from "../src/app/controller";

/** Anthropic's stream as the proxy passes it on: an answer with thinking,
 *  text and a tool call. */
const EVENTS = [
  { type: "message_start", message: { id: "msg_1", type: "message", role: "assistant", model: "claude-haiku-5-5", content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 100, output_tokens: 1 } } },
  { type: "content_block_start", index: 0, content_block: { type: "thinking", thinking: "", signature: "" } },
  { type: "content_block_delta", index: 0, delta: { type: "thinking_delta", thinking: "Margins first." } },
  { type: "content_block_delta", index: 0, delta: { type: "signature_delta", signature: "sig" } },
  { type: "content_block_stop", index: 0 },
  { type: "content_block_start", index: 1, content_block: { type: "text", text: "" } },
  { type: "content_block_delta", index: 1, delta: { type: "text_delta", text: "Writing " } },
  { type: "content_block_delta", index: 1, delta: { type: "text_delta", text: "the look." } },
  { type: "content_block_stop", index: 1 },
  { type: "content_block_start", index: 2, content_block: { type: "tool_use", id: "toolu_1", name: "look", input: {} } },
  { type: "content_block_delta", index: 2, delta: { type: "input_json_delta", partial_json: '{"device":' } },
  { type: "content_block_delta", index: 2, delta: { type: "input_json_delta", partial_json: '"X4"}' } },
  { type: "content_block_stop", index: 2 },
  { type: "message_delta", delta: { stop_reason: "tool_use", stop_sequence: null }, usage: { output_tokens: 80 } },
  { type: "message_stop" },
];

function sse(events: unknown[]): string {
  return events.map((e) => `event: ${(e as { type: string }).type}\ndata: ${JSON.stringify(e)}\n\n`).join("");
}

const request = {
  model: "claude-haiku-5-5",
  max_tokens: 32_000,
  messages: [{ role: "user", content: "A calm dark look" }],
} as unknown as Request;

const session = () => new Response(JSON.stringify({ store: "open", account: { name: "A" }, csrf: "token-1" }), { status: 200 });

describe("the free quota's provider", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("sends the conversation only, and reads the answer the proxy streams", async () => {
    const sent: { url: string; init: RequestInit }[] = [];
    // Split anywhere, as the network delivers it.
    const text = sse(EVENTS);
    const answers = [
      session(),
      new Response(
        new ReadableStream({
          start(c) {
            for (let i = 0; i < text.length; i += 37) c.enqueue(new TextEncoder().encode(text.slice(i, i + 37)));
            c.close();
          },
        }),
        { status: 200, headers: { "content-type": "text/event-stream" } },
      ),
    ];
    vi.stubGlobal("fetch", async (url: string, init: RequestInit) => {
      sent.push({ url, init: init ?? {} });
      return answers.shift()!;
    });
    let streamed = "";
    let thought = "";
    const answer = await new QuotaProxy("code").send(request, { onText: (d) => (streamed += d), onThinking: (d) => (thought += d) });

    // The kind, of which the site chooses the model; the model not.
    expect(sent[1]!.url).toBe("/api/v1/workshop/messages?kind=code");
    expect((sent[1]!.init.headers as Record<string, string>)["x-paperpaw-csrf"]).toBe("token-1");
    expect(JSON.parse(sent[1]!.init.body as string)).toEqual({ kind: "code", messages: request.messages });
    expect(streamed).toBe("Writing the look.");
    expect(thought).toBe("Margins first.");
    expect(answer.stop_reason).toBe("tool_use");
    expect(answer.content.map((b) => b.type)).toEqual(["thinking", "text", "tool_use"]);
    expect(answer.content[2]).toMatchObject({ name: "look", input: { device: "X4" } });
  });

  it("tells the site's refusals in its words, and Anthropic's errors as Anthropic's", async () => {
    const answers = [session(), new Response(JSON.stringify({ error: "budget", message: "This month's budget is used up." }), { status: 429 })];
    vi.stubGlobal("fetch", async () => answers.shift()!);
    const refused = await new QuotaProxy().send(request, {}).catch((e) => e);
    expect(refused).toBeInstanceOf(QuotaRefused);
    expect(message(refused)).toBe("This month's budget is used up.");

    const overloaded = { type: "error", error: { type: "overloaded_error", message: "Overloaded" } };
    const more = [session(), new Response(JSON.stringify(overloaded), { status: 529 })];
    vi.stubGlobal("fetch", async () => more.shift()!);
    const busy = await new QuotaProxy().send(request, {}).catch((e) => e);
    expect(busy).toBeInstanceOf(Anthropic.APIError);
    expect(busy.status).toBe(529);
  });

  it("ends with Anthropic's error when the stream says one", async () => {
    const events = [EVENTS[0], { type: "error", error: { type: "overloaded_error", message: "Overloaded" } }];
    const answers = [session(), new Response(sse(events), { status: 200 })];
    vi.stubGlobal("fetch", async () => answers.shift()!);
    const failed = await new QuotaProxy().send(request, {}).catch((e) => e);
    expect(failed).toBeInstanceOf(Anthropic.APIError);
    expect(failed.status).toBe(529);
    expect(message(failed)).toBe(message(Anthropic.APIError.generate(529, {}, "Overloaded", new Headers())));
  });
});
