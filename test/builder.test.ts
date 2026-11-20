import { describe, expect, it, vi } from "vitest";

import { BuilderRefused, HttpBuilder } from "../src/build/client";

describe("the build client", () => {
  const view = { id: "b1", state: "done", seconds: 1, problems: [], diagnostics: [], files: [], log_tail: "" };
  const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

  it("sends paperpaw.org's form token, and its refusals in its words", async () => {
    const sent: RequestInit[] = [];
    const answers = [json(200, { store: "open", csrf: "token-1" }), json(429, { error: "busy", message: "A build of yours is still running: one at a time." })];
    vi.stubGlobal("fetch", async (_url: string, init: RequestInit) => {
      sent.push(init ?? {});
      return answers.shift()!;
    });
    const builder = new HttpBuilder();
    const refused = await builder.build({ "src/lib.rs": { text: "" } }, ["web"]).catch((e) => e);
    expect(refused).toBeInstanceOf(BuilderRefused);
    expect(refused.message).toBe("A build of yours is still running: one at a time.");
    expect((sent[1]!.headers as Record<string, string>)["x-paperpaw-csrf"]).toBe("token-1");
    vi.unstubAllGlobals();
  });

  it("builds on its own without a token, where no site answers", async () => {
    const sent: RequestInit[] = [];
    const answers = [new Response("<!doctype html>", { status: 200 }), json(201, view)];
    vi.stubGlobal("fetch", async (_url: string, init: RequestInit) => {
      sent.push(init ?? {});
      return answers.shift()!;
    });
    const result = await new HttpBuilder().build({ "src/lib.rs": { text: "" } }, ["web"]);
    expect(result.state).toBe("done");
    expect((sent[1]!.headers as Record<string, string>)["x-paperpaw-csrf"]).toBeUndefined();
    vi.unstubAllGlobals();
  });
});
