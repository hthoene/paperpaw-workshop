// @vitest-environment node
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";

import { afterEach, describe, expect, it } from "vitest";

import { PRICES as WORKSHOP_PRICES } from "../src/ai/pricing";
// @ts-expect-error: the proxy is plain JavaScript (proxy/), run by Node.
import { run } from "../proxy/src/admin.mjs";
// @ts-expect-error: as above.
import { Store } from "../proxy/src/db.mjs";
// @ts-expect-error: as above.
import { cost, PRICES } from "../proxy/src/prices.mjs";
// @ts-expect-error: as above.
import { createProxy, UsageReader } from "../proxy/src/server.mjs";

const servers: Server[] = [];
afterEach(() => servers.splice(0).forEach((s) => s.close()));

function listen(server: Server): Promise<string> {
  servers.push(server);
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(`http://127.0.0.1:${(server.address() as AddressInfo).port}`)));
}

/** Anthropic as the tests want it: every request kept, a fixed answer. */
async function anthropic(stream = false) {
  const seen: { headers: Record<string, unknown>; body: Record<string, unknown> }[] = [];
  const url = await listen(
    createServer(async (req, res) => {
      const chunks: Buffer[] = [];
      for await (const c of req) chunks.push(c as Buffer);
      const body = JSON.parse(Buffer.concat(chunks).toString());
      seen.push({ headers: req.headers, body });
      if (stream) {
        res.writeHead(200, { "content-type": "text/event-stream" });
        res.write(`event: message_start\ndata: ${JSON.stringify({ type: "message_start", message: { usage: { input_tokens: 1000, cache_read_input_tokens: 9000, output_tokens: 1 } } })}\n\n`);
        res.write(`event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Hi"}}\n\n`);
        res.end(`event: message_delta\ndata: ${JSON.stringify({ type: "message_delta", usage: { output_tokens: 500 } })}\n\n`);
      } else {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ type: "message", content: [{ type: "text", text: "Hi" }], usage: { input_tokens: 2000, output_tokens: 1000 } }));
      }
    }),
  );
  return { url, seen };
}

async function proxy(store: Store, upstream: string, mailer?: { send(m: { to: string; subject: string; text: string }): Promise<void> }) {
  return listen(createProxy({ store, upstream, apiKey: "sk-ant-site-key", mailer, adminEmail: "admin@paperpaw.test" }));
}

const ask = (base: string, key: string, body: Record<string, unknown>) =>
  fetch(`${base}/v1/messages`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01", "anthropic-beta": "context-management-2025-06-27,other-beta" },
    body: JSON.stringify({ max_tokens: 64_000, messages: [{ role: "user", content: "Hi" }], ...body }),
  });

describe("the proxy", () => {
  it("passes a PaperPaw key's request on with the site's key, and counts what it used", async () => {
    const store = new Store(":memory:");
    const { key, id } = store.addKey({ email: "a@b.test", budget: 1, maxTokens: 32_000 });
    const up = await anthropic();
    const base = await proxy(store, up.url);
    const answer = await ask(base, key, { model: "claude-haiku-5-5" });
    expect(answer.status).toBe(200);
    expect((await answer.json()).content[0].text).toBe("Hi");
    const sent = up.seen[0]!;
    expect(sent.headers["x-api-key"]).toBe("sk-ant-site-key");
    expect(sent.headers["anthropic-beta"]).toBe("context-management-2025-06-27");
    expect(sent.body.max_tokens).toBe(32_000);
    const row = store.keys().find((k: { id: number }) => k.id === id);
    expect(row.spent).toBeCloseTo(cost("claude-haiku-5-5", { input_tokens: 2000, output_tokens: 1000 }), 10);
  });

  it("reads what a streamed answer used, and streams it on", async () => {
    const store = new Store(":memory:");
    const { key } = store.addKey({ email: "a@b.test", models: ["claude-sonnet-5-5"] });
    const up = await anthropic(true);
    const base = await proxy(store, up.url);
    const text = await (await ask(base, key, { model: "claude-sonnet-5-5", stream: true })).text();
    expect(text).toContain("text_delta");
    expect(store.keys()[0].spent).toBeCloseTo(cost("claude-sonnet-5-5", { input_tokens: 1000, cache_read_input_tokens: 9000, output_tokens: 500 }), 10);
  });

  it("refuses keys it does not know, withdrawn or expired ones, used budgets and other models", async () => {
    const store = new Store(":memory:");
    const up = await anthropic();
    const base = await proxy(store, up.url);
    const status = async (key: string, model = "claude-haiku-5-5") => {
      const r = await ask(base, key, { model });
      return [r.status, (await r.json()).error.message as string] as const;
    };
    expect((await status("ppw-unknown"))[0]).toBe(401);
    expect((await status("sk-ant-not-a-paperpaw-key"))[0]).toBe(401);
    const withdrawn = store.addKey({ email: "a@b.test" });
    store.revoke(withdrawn.id);
    expect(await status(withdrawn.key)).toEqual([401, "This PaperPaw key was withdrawn."]);
    const old = store.addKey({ email: "a@b.test", days: 1, now: new Date(Date.now() - 2 * 86_400_000) });
    expect((await status(old.key))[1]).toContain("expired");
    const used = store.addKey({ email: "a@b.test", budget: 0.001 });
    store.used(used.id, "claude-haiku-5-5", {}, 0.002);
    expect((await status(used.key))[1]).toContain("budget is used up");
    const haiku = store.addKey({ email: "a@b.test", models: ["claude-haiku-5-5"] });
    expect((await status(haiku.key, "claude-opus-5-5"))[1]).toContain("does not include claude-opus-5-5");
    expect(up.seen).toHaveLength(0);
  });

  it("says what a key allows, for the workshop's Settings", async () => {
    const store = new Store(":memory:");
    const { key } = store.addKey({ email: "a@b.test", budget: 3 });
    const base = await proxy(store, (await anthropic()).url);
    const info = await (await fetch(`${base}/v1/key`, { headers: { "x-api-key": key } })).json();
    expect(info).toMatchObject({ models: ["claude-haiku-5-5", "claude-sonnet-5-5"], budget: 3, spent: 0 });
    const preflight = await fetch(`${base}/v1/messages`, { method: "OPTIONS", headers: { "access-control-request-headers": "x-api-key, anthropic-version" } });
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get("access-control-allow-headers")).toBe("x-api-key, anthropic-version");
  });

  it("takes requests for a key, and the admin's approval mails the key", async () => {
    const store = new Store(":memory:");
    const mails: { to: string; subject: string; text: string }[] = [];
    const mailer = { send: async (m: { to: string; subject: string; text: string }) => void mails.push(m) };
    const base = await proxy(store, (await anthropic()).url, mailer);
    expect(await (await fetch(`${base}/apply`)).text()).toContain("A PaperPaw key");
    const form = (fields: Record<string, string>) => fetch(`${base}/apply`, { method: "POST", body: new URLSearchParams(fields) });
    expect((await form({ email: "not an email", purpose: "A clock for my reader" })).status).toBe(400);
    expect((await form({ email: "reader@example.org", purpose: "A clock for my reader" })).status).toBe(200);
    // Filled by a program, not a person: thanked, not kept.
    await form({ email: "bot@example.org", purpose: "A clock for my reader", website: "spam" });
    expect(store.applications().map((a: { email: string }) => a.email)).toEqual(["reader@example.org"]);
    expect(mails[0]).toMatchObject({ to: "admin@paperpaw.test" });

    const said: string[] = [];
    await run(store, ["approve", "1", "--budget", "2", "--models", "haiku"], mailer, (l: string) => said.push(l));
    const mail = mails[1]!;
    expect(mail.to).toBe("reader@example.org");
    const key = /ppw-[A-Za-z0-9_-]+/.exec(mail.text)![0];
    expect(store.key(key)).toMatchObject({ email: "reader@example.org", budget: 2, models: ["claude-haiku-5-5"] });
    expect(said.join("\n")).not.toContain(key);
    expect(store.applications()).toEqual([]);
    // No mail configured: the key only with --print.
    await expect(run(store, ["add", "x@example.org"], undefined, () => {})).rejects.toThrow("--print");
  });

  it("counts as the workshop counts", () => {
    expect(PRICES).toEqual(WORKSHOP_PRICES);
    const reader = new UsageReader();
    reader.stream('data: {"type":"message_start","message":{"usage":{"input_tokens":5,"output_tokens":1}}}\n');
    reader.stream('data: {"type":"message_delta","usage":{"output_tokens":9}}\n');
    expect(reader.usage).toEqual({ input_tokens: 5, output_tokens: 9 });
  });
});
