// Builds the reader: PaperPaw's web emulator (shells/web) at a tag or
// branch, into public/emulator/paperpaw-web.wasm, with its loader copied
// to src/emulator/frame/shell/paperpaw-web.js and what it was made from in
// public/emulator/meta.json.
//
//   npm run emulator -- --repo ../paperpaw --ref plugin-store
//
// Needs Rust with the target wasm32-unknown-unknown
// (rustup target add wasm32-unknown-unknown). The ref is built in a
// worktree of its own (never the checkout as it is), and the module's
// names section, only for stack traces, is left out. Its memory may grow
// to 512 MB at most, as a build's module (builder/server.mjs): PaperPaw
// needs some 70; without a cap it could grow to 4 GB in the browser.

import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const here = path.resolve(import.meta.dirname, "..");
const option = (name, fallback) => {
  const at = process.argv.indexOf(`--${name}`);
  return at > 0 ? process.argv[at + 1] : fallback;
};
const repo = path.resolve(option("repo", "../paperpaw"));
const ref = option("ref", "main");
const run = (command, args, cwd) => execFileSync(command, args, { cwd, stdio: ["ignore", "pipe", "inherit"], encoding: "utf8" });

const commit = run("git", ["-C", repo, "rev-parse", ref]).trim();
const work = path.join(here, ".work", `paperpaw-${commit.slice(0, 12)}`);
if (!fs.existsSync(work)) run("git", ["-C", repo, "worktree", "add", "--detach", work, commit]);
console.log(`emulator: PaperPaw ${ref} (${commit.slice(0, 10)}), building ...`);
// `cargo rustc`: the cap for the module's own link only.
execFileSync(
  "cargo",
  ["rustc", "-p", "paperpaw-web", "--lib", "--release", "--target", "wasm32-unknown-unknown", "--", "-C", `link-arg=--max-memory=${512 * 1024 * 1024}`],
  { cwd: work, stdio: "inherit" },
);

const target = JSON.parse(run("cargo", ["metadata", "--format-version", "1", "--no-deps"], work)).target_directory;
const built = fs.readFileSync(path.join(target, "wasm32-unknown-unknown", "release", "paperpaw_web.wasm"));
const wasm = withoutNames(built);
const out = path.join(here, "public", "emulator");
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "paperpaw-web.wasm"), wasm);
fs.copyFileSync(path.join(work, "shells", "web", "www", "paperpaw-web.js"), path.join(here, "src", "emulator", "frame", "shell", "paperpaw-web.js"));
const meta = {
  ref,
  commit,
  built: new Date().toISOString().slice(0, 10),
  bytes: wasm.length,
  sha256: crypto.createHash("sha256").update(wasm).digest("hex"),
};
fs.writeFileSync(path.join(out, "meta.json"), JSON.stringify(meta, null, 2) + "\n");
run("git", ["-C", repo, "worktree", "remove", "--force", work]);
console.log(`emulator: public/emulator/paperpaw-web.wasm, ${(wasm.length / 1048576).toFixed(1)} MB`);

/** The module without its custom section `name` (function names, for
 *  stack traces only). */
function withoutNames(bytes) {
  const parts = [bytes.subarray(0, 8)];
  let i = 8;
  const leb = () => {
    let value = 0;
    let shift = 0;
    let byte;
    do {
      byte = bytes[i++];
      value |= (byte & 0x7f) << shift;
      shift += 7;
    } while (byte & 0x80);
    return value >>> 0;
  };
  while (i < bytes.length) {
    const start = i;
    const id = bytes[i++];
    const size = leb();
    const body = i;
    i = body + size;
    if (id === 0) {
      const at = i;
      i = body;
      const length = leb();
      const name = Buffer.from(bytes.subarray(i, i + length)).toString();
      i = at;
      if (name === "name") continue;
    }
    parts.push(bytes.subarray(start, i));
  }
  return Buffer.concat(parts);
}
