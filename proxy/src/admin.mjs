#!/usr/bin/env node
// The admin's side, on the server (docker compose exec proxy node
// src/admin.mjs …): the requests waiting, approving one (a key made and
// mailed to who asked), declining, the keys with what they spent,
// withdrawing one. The key itself is shown to no one but its owner: it is
// mailed, and printed only with --print where no mail is configured.

import path from "node:path";
import { pathToFileURL } from "node:url";

import { Store } from "./db.mjs";
import { keyMail, smtpMailer } from "./mail.mjs";
import { DEFAULT_MODELS, PRICES } from "./prices.mjs";

const USAGE = `node src/admin.mjs <command>

  requests                      the requests waiting
  approve <id> [options]        make a key for request <id> and mail it
  decline <id>                  decline request <id>
  add <email> [options]         make a key without a request and mail it
  keys                          every key with what it spent
  revoke <key-id>               withdraw a key

options: --budget <dollars> (5)  --days <n> (90)  --models haiku,sonnet
         --max-tokens <n> (32000)  --note <text>  --print (no mail: show the key once)`;

/** `--name value` options and the words before them. */
export function parse(args) {
  const words = [];
  const options = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const name = args[i].slice(2);
      if (name === "print") options.print = true;
      else options[name] = args[++i];
    } else words.push(args[i]);
  }
  return { words, options };
}

/** A key's settings from the options. */
export function settings(options) {
  const models = options.models
    ? options.models.split(",").map((m) => {
        const full = m.startsWith("claude-") ? m : `claude-${m}-5-5`;
        if (!PRICES[full]) throw new Error(`no model ${m} (${Object.keys(PRICES).join(", ")})`);
        return full;
      })
    : DEFAULT_MODELS;
  const number = (value, fallback) => {
    if (value === undefined) return fallback;
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) throw new Error(`not a number: ${value}`);
    return n;
  };
  return {
    models,
    budget: number(options.budget, 5),
    days: number(options.days, 90),
    maxTokens: Math.round(number(options["max-tokens"], 32_000)),
    note: options.note ?? "",
  };
}

/** Runs one command; what it says, in lines. */
export async function run(store, args, mailer, out = console.log) {
  const { words, options } = parse(args);
  const [command, what] = words;
  const give = async (email, applicationId) => {
    if (!mailer && !options.print) throw new Error("No mail is configured (SMTP_URL, MAIL_FROM): add --print to show the key once instead.");
    const made = settings(options);
    const { key, id } = store.addKey({ email, ...made });
    const row = store.keys().find((k) => k.id === id);
    if (applicationId) store.decide(applicationId, "approved", id);
    if (mailer) {
      await mailer.send({ to: email, subject: "Your PaperPaw key", text: keyMail({ key, models: made.models, budget: made.budget, expires: row.expires }) });
      out(`Key ${id} made for ${email} and mailed (${made.models.join(", ")}, $${made.budget}, until ${row.expires.slice(0, 10)}).`);
    } else {
      out(`Key ${id} made for ${email}. It is shown once, give it to them yourself:\n${key}`);
    }
  };
  switch (command) {
    case "requests":
      for (const a of store.applications()) out(`#${a.id} ${a.created.slice(0, 10)} ${a.email}: ${a.purpose.replace(/\s+/g, " ")}`);
      break;
    case "approve": {
      const a = store.application(Number(what));
      if (!a || a.state !== "waiting") throw new Error(`no request #${what} waiting`);
      await give(a.email, a.id);
      break;
    }
    case "decline": {
      const a = store.application(Number(what));
      if (!a || a.state !== "waiting") throw new Error(`no request #${what} waiting`);
      store.decide(a.id, "declined");
      out(`Request #${a.id} declined.`);
      break;
    }
    case "add":
      if (!what?.includes("@")) throw new Error("add needs an email");
      await give(what);
      break;
    case "keys":
      for (const k of store.keys()) {
        const state = k.revoked ? "withdrawn" : k.expires < new Date().toISOString() ? "expired" : "active";
        out(`${k.id} ${k.email} ${state}: $${k.spent.toFixed(2)} of $${k.budget.toFixed(2)}, ${JSON.parse(k.models).join(" ")}, until ${k.expires.slice(0, 10)}${k.note ? `, ${k.note}` : ""}`);
      }
      break;
    case "revoke":
      out(store.revoke(Number(what)) ? `Key ${what} withdrawn.` : `No active key ${what}.`);
      break;
    default:
      out(USAGE);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const store = new Store(path.join(process.env.DATA_DIR ?? "data", "proxy.db"));
  run(store, process.argv.slice(2), await smtpMailer()).catch((e) => {
    console.error(String(e.message ?? e));
    process.exitCode = 1;
  });
}
