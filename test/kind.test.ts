import type Anthropic from "@anthropic-ai/sdk";
import { describe, expect, it } from "vitest";

import type { Provider } from "../src/ai/provider";
import { ReplayProvider } from "../src/ai/replay";
import { standInBackend } from "../src/desktop/backend";
import { Checker } from "../src/desktop/checks";
import { Desk } from "../src/desktop/desk";
import { decideKind, kindByWords, kindLabel } from "../src/desktop/kind";
import { Workspace } from "../src/desktop/workspace";
import { handbook } from "./helpers";

const said = (text: string) => ({ content: [{ type: "text", text, citations: null } as Anthropic.ContentBlock], stop_reason: "end_turn" as const });
const DUCKS = "A new widget which shows duck facts from https://duck.mobilserver.xyz/api/facts/random?lang=en (JSON: id, fact, lang)";

describe("the kind of a new plugin", () => {
  it("is what the smallest model says, in one short question", async () => {
    const provider = new ReplayProvider({ title: "kind", user: [DUCKS], answers: [said("code")] });
    expect(await decideKind(provider, DUCKS, "claude-haiku-5-5")).toBe("code");
    const asked = provider.requests[0]!;
    expect(asked.model).toBe("claude-haiku-5-5");
    expect(asked.max_tokens).toBeLessThanOrEqual(16);
    expect(asked.tools).toBeUndefined();
    const theme = new ReplayProvider({ title: "kind", user: ["A calm dark look"], answers: [said("data")] });
    expect(await decideKind(theme, "A calm dark look", "claude-haiku-5-5")).toBe("data");
  });

  it("is what the words say where the model cannot be asked", async () => {
    const offline: Provider = { label: "", eagerTools: false, send: async () => { throw new Error("offline"); } };
    expect(await decideKind(offline, DUCKS, "claude-haiku-5-5")).toBe("code");
    expect(await decideKind(offline, "Wider margins and a larger font", "claude-haiku-5-5")).toBe("data");
    expect(kindByWords("Ein Spiel für den Bildschirm")).toBe("code");
    expect(kindLabel("auto")).toBe("with or without code, as you ask");
    expect(kindLabel("code")).toBe("with code");
  });

  it("decides the project made by the first message, which then starts from the sample", async () => {
    const backend = standInBackend();
    backend.emulatorStart = async () => {};
    const provider = new ReplayProvider({ title: "ducks", user: [DUCKS], answers: [said("code"), said("I will make it.")] });
    const workspace = new Workspace(backend);
    workspace.freshKind = "auto";
    const book = handbook();
    workspace.codeSample = book.codeSample;
    const desk = new Desk(workspace, backend, new Checker({ pluginCheck: async () => [] }), book, provider, "claude");
    await desk.send(DUCKS);
    expect(workspace.project!.kind).toBe("code");
    expect(workspace.project!.files["how/en.txt"]).toBeDefined();
    expect(provider.requests[1]!.system).toEqual([{ type: "text", text: book.code, cache_control: { type: "ephemeral" } }]);
  });
});
