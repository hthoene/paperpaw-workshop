import type Anthropic from "@anthropic-ai/sdk";
import { describe, expect, it } from "vitest";

import { lines } from "../src/app/conversation";

describe("the conversation as it is shown", () => {
  it("shows words, and a line for each tool, marked when it failed", () => {
    const messages: Anthropic.MessageParam[] = [
      { role: "user", content: "A dark look" },
      {
        role: "assistant",
        content: [
          { type: "thinking", thinking: "", signature: "x" },
          { type: "text", text: "On it.", citations: null },
          { type: "tool_use", id: "a", name: "write_file", input: { path: "settings.ini", content: "x" } },
          { type: "tool_use", id: "b", name: "look", input: { device: "Boox Go 7" } },
          { type: "tool_use", id: "c", name: "write_file", input: { path: "run.js", content: "x" } },
        ],
      },
      {
        role: "user",
        content: [
          { type: "tool_result", tool_use_id: "a", content: "ok" },
          { type: "tool_result", tool_use_id: "b", content: "ok" },
          { type: "tool_result", tool_use_id: "c", content: "no", is_error: true },
        ],
      },
    ];
    expect(lines(messages)).toEqual([
      { kind: "me", text: "A dark look" },
      { kind: "ai", text: "On it." },
      { kind: "step", text: "Wrote settings.ini", failed: false },
      { kind: "step", text: "Looked at it on the Boox Go 7", failed: false },
      { kind: "step", text: "Wrote run.js: it did not work", failed: true },
    ]);
  });
});
