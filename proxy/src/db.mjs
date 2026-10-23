// What the proxy keeps (SQLite, in DATA_DIR): the keys (only their
// SHA-256, never the key), the requests for one, and what each key used,
// as numbers: the model, the tokens, the cost. Never what was said.

import { createHash, randomBytes } from "node:crypto";
import { DatabaseSync } from "node:sqlite";

import { DEFAULT_MODELS } from "./prices.mjs";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS keys (
  id INTEGER PRIMARY KEY,
  hash TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  models TEXT NOT NULL,
  budget REAL NOT NULL,
  spent REAL NOT NULL DEFAULT 0,
  max_tokens INTEGER NOT NULL,
  expires TEXT NOT NULL,
  created TEXT NOT NULL,
  revoked TEXT
);
CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL,
  purpose TEXT NOT NULL,
  created TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'waiting',
  key_id INTEGER
);
CREATE TABLE IF NOT EXISTS usage (
  key_id INTEGER NOT NULL,
  at TEXT NOT NULL,
  model TEXT NOT NULL,
  input INTEGER NOT NULL,
  output INTEGER NOT NULL,
  cache_read INTEGER NOT NULL,
  cache_write INTEGER NOT NULL,
  dollars REAL NOT NULL
);
`;

export function hashOf(key) {
  return createHash("sha256").update(key).digest("hex");
}

/** A new key: `ppw-` and 32 random characters. */
export function newKey() {
  return `ppw-${randomBytes(24).toString("base64url")}`;
}

export class Store {
  /** `file`: the database's path, ":memory:" for tests. */
  constructor(file) {
    this.db = new DatabaseSync(file);
    this.db.exec(SCHEMA);
  }

  /** The key `key` if it is one, as the proxy checks it. */
  key(key) {
    if (typeof key !== "string" || !key.startsWith("ppw-")) return undefined;
    const row = this.db.prepare("SELECT * FROM keys WHERE hash = ?").get(hashOf(key));
    return row ? { ...row, models: JSON.parse(row.models) } : undefined;
  }

  /** Makes a key; the key itself, shown once, and its row's id. */
  addKey({ email, note = "", models = DEFAULT_MODELS, budget = 5, maxTokens = 32_000, days = 90, now = new Date() }) {
    const key = newKey();
    const expires = new Date(now.getTime() + days * 86_400_000).toISOString();
    const { lastInsertRowid } = this.db
      .prepare("INSERT INTO keys (hash, email, note, models, budget, max_tokens, expires, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .run(hashOf(key), email, note, JSON.stringify(models), budget, maxTokens, expires, now.toISOString());
    return { key, id: Number(lastInsertRowid) };
  }

  revoke(id, now = new Date()) {
    return this.db.prepare("UPDATE keys SET revoked = ? WHERE id = ? AND revoked IS NULL").run(now.toISOString(), id).changes > 0;
  }

  /** Counts what a request used against its key. */
  used(keyId, model, usage, dollars, now = new Date()) {
    this.db
      .prepare("INSERT INTO usage (key_id, at, model, input, output, cache_read, cache_write, dollars) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .run(keyId, now.toISOString(), model, usage.input_tokens ?? 0, usage.output_tokens ?? 0, usage.cache_read_input_tokens ?? 0, usage.cache_creation_input_tokens ?? 0, dollars);
    this.db.prepare("UPDATE keys SET spent = spent + ? WHERE id = ?").run(dollars, keyId);
  }

  apply(email, purpose, now = new Date()) {
    const { lastInsertRowid } = this.db.prepare("INSERT INTO applications (email, purpose, created) VALUES (?, ?, ?)").run(email, purpose, now.toISOString());
    return Number(lastInsertRowid);
  }

  applications(state = "waiting") {
    return this.db.prepare("SELECT * FROM applications WHERE state = ? ORDER BY id").all(state);
  }

  application(id) {
    return this.db.prepare("SELECT * FROM applications WHERE id = ?").get(id);
  }

  decide(id, state, keyId = null) {
    this.db.prepare("UPDATE applications SET state = ?, key_id = ? WHERE id = ?").run(state, keyId, id);
  }

  /** Every key with what it spent, for the admin. */
  keys() {
    return this.db.prepare("SELECT id, email, note, models, budget, spent, max_tokens, expires, created, revoked FROM keys ORDER BY id").all();
  }

  /** How many applications came from `email` (or at all) since `since`. */
  appliedSince(since, email) {
    const sql = email ? "SELECT COUNT(*) AS n FROM applications WHERE created >= ? AND email = ?" : "SELECT COUNT(*) AS n FROM applications WHERE created >= ?";
    return (email ? this.db.prepare(sql).get(since, email) : this.db.prepare(sql).get(since)).n;
  }
}
