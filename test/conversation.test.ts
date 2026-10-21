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

describe("a conversation grown too long", () => {
  it("goes on in a fresh one: files stay, the earlier one is kept, a summary is carried", async () => {
    const { Workshop } = await import("../src/app/controller");
    const { ReplayProvider } = await import("../src/ai/replay");
    const { MemoryUploads } = await import("../src/project/uploads");
    const { CARRIED, newProject } = await import("../src/project/project");
    const { fakeKit, handbook } = await import("./helpers");
    const project = newProject();
    const workshop = new Workshop(project, handbook(), new ReplayProvider({ title: "", user: [], answers: [] }), fakeKit, new MemoryUploads());
    workshop.files.write("settings.ini", "[core]\nnight-mode = true\n");
    project.messages.push({ role: "user", content: "A calm dark look" }, { role: "assistant", content: [{ type: "text", text: "Done.", citations: null }] });
    project.lastPrompt = 95_000;

    workshop.freshConversation();
    expect(project.messages).toEqual([]);
    expect(project.earlier).toHaveLength(1);
    expect(project.lastPrompt).toBe(0);
    expect(project.carried).toContain("- A calm dark look");
    expect(project.carried).toContain("- settings.ini");
    expect(workshop.files.read("settings.ini")).toContain("night-mode");

    // The carried summary shows as a line of its own, not as the person's.
    expect(lines([{ role: "user", content: [{ type: "text", text: project.carried! }, { type: "text", text: "Rounder corners" }] }])).toEqual([
      { kind: "step", text: "A fresh conversation: the AI got a summary of the earlier one", failed: false },
      { kind: "me", text: "Rounder corners" },
    ]);
    expect(project.carried!.startsWith(CARRIED)).toBe(true);
  });
});
