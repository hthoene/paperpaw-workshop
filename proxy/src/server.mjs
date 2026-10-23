// The free quota of the PaperPaw Workshop: a PaperPaw key (`ppw-…`) in
// place of one's own Claude key. The proxy speaks Anthropic's Messages API
// (POST /v1/messages, streamed or not) and passes a request on with
// paperpaw.org's own key when the PaperPaw key allows it: known, not
// withdrawn or expired, budget left, the model among its models, one
// request at a time; max_tokens is held to the key's limit. What each
// answer used is counted against the key, as numbers only: nothing said
// in a conversation is kept or logged.
//
// Also: GET /v1/key (what a key allows, for the workshop's Settings), and
// the form to ask for a key (GET/POST /apply), which an admin approves
// with the command line (admin.mjs); the key goes out by mail.

import { createServer } from "node:http";

import { cost } from "./prices.mjs";

/** The largest request taken: a conversation with pictures. */
export const MAX_BODY = 32 * 1024 * 1024;
/** Betas a request may name (the workshop's context management). */
const BETAS = ["context-management-2025-06-27"];
/** Applications taken a day, from one address and from all. */
const PER_EMAIL = 3;
const PER_DAY = 50;

/** An answer in Anthropic's error shape, so that its SDK reads it. */
function failure(res, status, type, message) {
  send(res, status, { "content-type": "application/json" }, JSON.stringify({ type: "error", error: { type, message } }));
}

function send(res, status, headers, body) {
  res.writeHead(status, headers);
  res.end(body);
}

/** CORS: the workshop's window calls from its own origin; a key is a
 *  bearer secret, no cookie is ever used. */
function cors(req, res) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "GET, POST, OPTIONS");
  res.setHeader("access-control-allow-headers", req.headers["access-control-request-headers"] ?? "content-type, x-api-key, anthropic-version, anthropic-beta");
  res.setHeader("access-control-max-age", "600");
}

async function body(req, limit) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw Object.assign(new Error("too large"), { status: 413 });
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/** The key a request names, and why it may not be used if it may not. */
function checked(store, req, now) {
  const key = store.key(req.headers["x-api-key"]);
  if (!key) return { status: 401, type: "authentication_error", message: "This PaperPaw key is not known. Check it, or ask for one at workshop.paperpaw.org/apply." };
  if (key.revoked) return { status: 401, type: "authentication_error", message: "This PaperPaw key was withdrawn." };
  if (key.expires < now.toISOString()) return { status: 401, type: "authentication_error", message: "This PaperPaw key has expired. Ask for a new one at workshop.paperpaw.org/apply." };
  return { key };
}

/** What an answer used: from its JSON, or from its stream's events
 *  (`message_start`, then `message_delta`, whose counts are the latest). */
export class UsageReader {
  constructor() {
    this.usage = {};
    this.rest = "";
  }

  /** A piece of a stream (`text/event-stream`). */
  stream(text) {
    this.rest += text;
    const lines = this.rest.split("\n");
    this.rest = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      try {
        const event = JSON.parse(line.slice(5));
        if (event.type === "message_start") Object.assign(this.usage, event.message?.usage);
        if (event.type === "message_delta") Object.assign(this.usage, event.usage);
      } catch {
        // Not JSON: not an event the proxy reads.
      }
    }
  }

  /** A whole answer (`application/json`). */
  whole(text) {
    try {
      Object.assign(this.usage, JSON.parse(text).usage);
    } catch {
      // An error's answer: nothing used.
    }
  }
}

const FORM = (said = "") => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>A PaperPaw key</title>
<style>
body { margin: 0; padding: 3rem 1rem; background: #e6e0d4; color: #1d1b18; font: 17px/1.55 system-ui, sans-serif; }
main { max-width: 32rem; margin: 0 auto; }
h1 { font: 600 1.8rem/1.2 Georgia, serif; margin: 0 0 .6rem; }
label { display: block; margin: 1.1rem 0 .3rem; font-weight: 600; }
input, textarea { width: 100%; box-sizing: border-box; padding: .7rem 1rem; border: 0; border-radius: .8rem; background: #ddd6c9; box-shadow: inset 0 0 0 1px #7d7568; font: inherit; color: inherit; }
textarea { min-height: 7rem; }
button { margin-top: 1.3rem; padding: .7rem 1.5rem; border: 0; border-radius: 999px; background: #1d1b18; color: #e6e0d4; font: 600 1rem/1 Georgia, serif; cursor: pointer; }
.trap { position: absolute; left: -10000px; }
p.said { font-weight: 600; }
</style></head><body><main>
<h1>A PaperPaw key</h1>
<p>A PaperPaw key lets you try the PaperPaw Workshop without a Claude key of your own, for a while and up to a small budget. Say who you are and what you would like to make.</p>
${said ? `<p class="said">${said}</p>` : ""}
<form method="post" action="/apply">
<label for="email">Your email</label>
<input id="email" name="email" type="email" required maxlength="200" autocomplete="email">
<label for="purpose">What would you like to make?</label>
<textarea id="purpose" name="purpose" required minlength="10" maxlength="1000"></textarea>
<input class="trap" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<button type="submit">Ask for a key</button>
</form>
<p>Your email is used for this key only. Nothing you say in the workshop is kept here.</p>
</main></body></html>`;

const THANKS = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Thank you</title>
<style>body { margin: 0; padding: 3rem 1rem; background: #e6e0d4; color: #1d1b18; font: 17px/1.55 system-ui, sans-serif; } main { max-width: 32rem; margin: 0 auto; } h1 { font: 600 1.8rem/1.2 Georgia, serif; }</style>
</head><body><main><h1>Thank you</h1><p>A person reads every request. If it is approved, the key comes by email.</p></main></body></html>`;

/**
 * The proxy. `store`: db.mjs; `upstream`: Anthropic's API (its origin);
 * `apiKey`: paperpaw.org's key; `mailer`: `{ send({ to, subject, text }) }`
 * or none; `adminEmail`: told of new applications; `now`: the clock.
 */
export function createProxy({ store, upstream = "https://api.anthropic.com", apiKey, mailer, adminEmail, now = () => new Date() }) {
  const busy = new Set();

  async function messages(req, res) {
    const at = now();
    const { key, ...refused } = checked(store, req, at);
    if (!key) return failure(res, refused.status, refused.type, refused.message);
    if (key.spent >= key.budget) return failure(res, 403, "permission_error", "This PaperPaw key's budget is used up. Thank you for trying the workshop: a Claude key of your own goes on from here.");
    let request;
    try {
      request = JSON.parse((await body(req, MAX_BODY)).toString("utf8"));
    } catch (e) {
      return e.status === 413 ? failure(res, 413, "request_too_large", "The request is too large.") : failure(res, 400, "invalid_request_error", "The request is not JSON.");
    }
    if (!key.models.includes(request.model)) {
      return failure(res, 403, "permission_error", `This PaperPaw key does not include ${request.model}; it includes ${key.models.join(", ")}.`);
    }
    request.max_tokens = Math.min(Number(request.max_tokens) || key.max_tokens, key.max_tokens);
    if (busy.has(key.id)) return failure(res, 429, "rate_limit_error", "One request at a time with a PaperPaw key.");
    busy.add(key.id);
    const reader = new UsageReader();
    try {
      const betas = String(req.headers["anthropic-beta"] ?? "")
        .split(",")
        .map((b) => b.trim())
        .filter((b) => BETAS.includes(b));
      const answer = await fetch(`${upstream}/v1/messages`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": String(req.headers["anthropic-version"] ?? "2023-06-01"),
          ...(betas.length ? { "anthropic-beta": betas.join(",") } : {}),
        },
        body: JSON.stringify(request),
      });
      const type = answer.headers.get("content-type") ?? "application/json";
      res.writeHead(answer.status, { "content-type": type, "cache-control": "no-cache" });
      const decoder = new TextDecoder();
      let whole = "";
      for await (const chunk of answer.body ?? []) {
        res.write(chunk);
        const text = decoder.decode(chunk, { stream: true });
        if (type.includes("event-stream")) reader.stream(text);
        else whole += text;
      }
      if (!type.includes("event-stream")) reader.whole(whole);
      res.end();
    } catch {
      if (!res.headersSent) failure(res, 502, "api_error", "Anthropic could not be reached. Try again in a moment.");
      else res.end();
    } finally {
      busy.delete(key.id);
      const used = reader.usage;
      if ((used.input_tokens ?? 0) + (used.output_tokens ?? 0) > 0) store.used(key.id, request.model, used, cost(request.model, used), now());
    }
  }

  function keyInfo(req, res) {
    const { key, ...refused } = checked(store, req, now());
    if (!key) return failure(res, refused.status, refused.type, refused.message);
    send(
      res,
      200,
      { "content-type": "application/json" },
      JSON.stringify({ models: key.models, budget: key.budget, spent: Math.round(key.spent * 10_000) / 10_000, max_tokens: key.max_tokens, expires: key.expires }),
    );
  }

  async function apply(req, res) {
    let form;
    try {
      form = new URLSearchParams((await body(req, 16 * 1024)).toString("utf8"));
    } catch {
      return send(res, 413, { "content-type": "text/plain" }, "Too large.");
    }
    const html = { "content-type": "text/html; charset=utf-8" };
    // A field people do not see: filled, it was not a person.
    if (form.get("website")) return send(res, 200, html, THANKS);
    const email = (form.get("email") ?? "").trim();
    const purpose = (form.get("purpose") ?? "").trim();
    if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || email.length > 200) return send(res, 400, html, FORM("That email does not look right."));
    if (purpose.length < 10 || purpose.length > 1000) return send(res, 400, html, FORM("Say in a sentence or two what you would like to make."));
    const day = new Date(now().getTime() - 86_400_000).toISOString();
    if (store.appliedSince(day, email) >= PER_EMAIL || store.appliedSince(day) >= PER_DAY) {
      return send(res, 429, html, FORM("Many requests came today. Please try again tomorrow."));
    }
    const id = store.apply(email, purpose, now());
    if (mailer && adminEmail) {
      await mailer
        .send({ to: adminEmail, subject: `PaperPaw key requested (#${id})`, text: `${email} asks for a PaperPaw key:\n\n${purpose}\n\nApprove: node proxy/src/admin.mjs approve ${id}` })
        .catch(() => {});
    }
    send(res, 200, html, THANKS);
  }

  return createServer((req, res) => {
    cors(req, res);
    const path = new URL(req.url ?? "/", "http://proxy").pathname;
    if (req.method === "OPTIONS") return send(res, 204, {}, "");
    if (req.method === "POST" && path === "/v1/messages") return void messages(req, res);
    if (req.method === "GET" && path === "/v1/key") return keyInfo(req, res);
    if (req.method === "GET" && path === "/apply") return send(res, 200, { "content-type": "text/html; charset=utf-8" }, FORM());
    if (req.method === "POST" && path === "/apply") return void apply(req, res);
    if (req.method === "GET" && path === "/health") return send(res, 200, { "content-type": "text/plain" }, "ok");
    if (req.method === "GET" && path === "/") return send(res, 302, { location: "/apply" }, "");
    failure(res, 404, "not_found_error", "Not here.");
  });
}
