import { MessageStream } from "@anthropic-ai/sdk/lib/MessageStream";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AnthropicDirect } from "../src/ai/anthropic";
import type { Request } from "../src/ai/provider";
import { INVALID_JSON, invalidJson, toolInputChecked } from "../src/ai/tool-input";

/** An answer with one call to edit_file, its input in `parts`. */
function events(parts: string[]) {
  return [
    { type: "message_start", message: { id: "msg_1", type: "message", role: "assistant", model: "claude-sonnet-5-5", content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 10, output_tokens: 1 } } },
    { type: "content_block_start", index: 0, content_block: { type: "text", text: "" } },
    { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: "Changing it." } },
    { type: "content_block_stop", index: 0 },
    { type: "content_block_start", index: 1, content_block: { type: "tool_use", id: "toolu_1", name: "edit_file", input: {} } },
    ...parts.map((partial_json) => ({ type: "content_block_delta", index: 1, delta: { type: "input_json_delta", partial_json } })),
    { type: "content_block_stop", index: 1 },
    { type: "message_delta", delta: { stop_reason: "tool_use", stop_sequence: null }, usage: { output_tokens: 40 } },
    { type: "message_stop" },
  ];
}

/** As JSON lines, split anywhere as the network delivers them. */
function lines(list: unknown[]): ReadableStream<Uint8Array> {
  const text = list.map((e) => JSON.stringify(e) + "\n").join("");
  return new ReadableStream({
    start(c) {
      for (let i = 0; i < text.length; i += 23) c.enqueue(new TextEncoder().encode(text.slice(i, i + 23)));
      c.close();
    },
  });
}

// What the model sent in the run that failed: a property name without its
// value, so not JSON.
const BROKEN = ['{"path":"src/lib.rs","edits":[{"old":"a",', '"new":"b"},{"old"}]}'];

describe("a tool call's input as it streams", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("lost the whole answer when the input was not valid JSON", async () => {
    const s = MessageStream.fromReadableStream(lines(events(BROKEN)));
    await expect(s.finalMessage()).rejects.toThrow(/Expected ':' after property name/);
  });

  it("comes whole when it is valid", async () => {
    const s = MessageStream.fromReadableStream(lines(events(['{"path":"src/li', 'b.rs","edits":[{"old":"a","new":"b \\"c\\""}]}'])).pipeThrough(toolInputChecked()));
    let text = "";
    s.on("text", (d) => (text += d));
    const answer = await s.finalMessage();
    expect(text).toBe("Changing it.");
    expect(answer.content[1]).toMatchObject({ type: "tool_use", input: { path: "src/lib.rs", edits: [{ old: "a", new: 'b "c"' }] } });
    expect(invalidJson((answer.content[1] as { input: unknown }).input)).toBe(false);
  });

  it("says it was not valid JSON, and the answer stays", async () => {
    const s = MessageStream.fromReadableStream(lines(events(BROKEN)).pipeThrough(toolInputChecked()));
    const answer = await s.finalMessage();
    const input = (answer.content[1] as { input: unknown }).input;
    expect(input).toEqual({ [INVALID_JSON]: BROKEN.join("") });
    expect(invalidJson(input)).toBe(true);
    expect(answer.stop_reason).toBe("tool_use");
  });

  it("leaves a call without input as it is", async () => {
    const answer = await MessageStream.fromReadableStream(lines(events([])).pipeThrough(toolInputChecked())).finalMessage();
    expect(answer.content[1]).toMatchObject({ type: "tool_use", input: {} });
  });

  it("is checked with the person's own key too", async () => {
    const sse = events(BROKEN)
      .map((e) => `event: ${(e as { type: string }).type}\ndata: ${JSON.stringify(e)}\n\n`)
      .join("");
    const sent: string[] = [];
    const fetch = vi.fn(async (_url: string, init: RequestInit) => {
      sent.push(String(init.body));
      return new Response(sse, { status: 200, headers: { "content-type": "text/event-stream" } });
    });
    vi.stubGlobal("fetch", fetch);
    const provider = new AnthropicDirect("sk-ant-test");
    const request = { model: "claude-sonnet-5-5", max_tokens: 1000, messages: [{ role: "user", content: "x" }] } as unknown as Request;
    let text = "";
    const answer = await provider.send(request, { onText: (d) => (text += d) });
    expect(JSON.parse(sent[0]!)).toMatchObject({ model: "claude-sonnet-5-5", stream: true });
    expect(text).toBe("Changing it.");
    expect(invalidJson((answer.content[1] as { input: unknown }).input)).toBe(true);
  });
});
