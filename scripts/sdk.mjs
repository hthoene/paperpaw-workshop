// The SDK of a PaperPaw in work, for the installer: the emulator of a
// PaperPaw in work (`0.5.0-dev`) loads only code built against its very
// source, which crates.io does not have. So the installer brings it:
// `crates/paperpaw-sdk` of the checkout the emulator was built from, the
// PaperPaw crates it needs (by Cargo's metadata, unchanged: a PaperPaw in
// work fingerprints their very files), and the workspace's Cargo.toml
// with those as its only members, so that what they take from the
// workspace (`version.workspace = true`) resolves. `version.txt` says
// which PaperPaw it is; the app takes it only for that one
// (src-tauri/src/code.rs, `local_sdk`).

import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

/** The folders of `checkout`'s crates paperpaw-sdk needs, itself first,
 *  relative to the checkout with `/` (from `cargo metadata`). */
export function sdkCrates(metadata, checkout) {
  const local = new Map(metadata.packages.filter((p) => p.source === null).map((p) => [p.name, p]));
  const wanted = [];
  const queue = ["paperpaw-sdk"];
  while (queue.length) {
    const name = queue.shift();
    const found = local.get(name);
    if (!found || wanted.includes(found)) continue;
    wanted.push(found);
    // Their tests' too: a workspace loads every member's dependencies,
    // and no manifest may change (the fingerprint hashes them).
    for (const dep of found.dependencies) if (local.has(dep.name)) queue.push(dep.name);
  }
  if (!wanted.length) throw new Error(`no paperpaw-sdk in ${checkout}`);
  return wanted.map((p) => relative(checkout, join(p.manifest_path, "..")).split(sep).join("/"));
}

/** The workspace's Cargo.toml `text` with `members` as its only members
 *  and nothing excluded. */
export function workspaceOf(text, members) {
  const list = `members = [\n${members.map((m) => `    "${m}",`).join("\n")}\n]`;
  return text
    .replace(/^members\s*=\s*\[[\s\S]*?^\]/m, list)
    .replace(/^exclude\s*=\s*\[[^\]]*\]\n/m, "");
}

/** Copies the SDK of `checkout` (PaperPaw `version`) into `into`. */
export function bundleSdk(checkout, into, version) {
  const run = spawnSync("cargo", ["metadata", "--format-version", "1", "--manifest-path", join(checkout, "Cargo.toml")], {
    encoding: "utf8",
    maxBuffer: 256 << 20,
  });
  if (run.status !== 0) throw new Error(`cargo metadata failed: ${run.stderr}`);
  const crates = sdkCrates(JSON.parse(run.stdout), checkout);
  rmSync(into, { recursive: true, force: true });
  mkdirSync(into, { recursive: true });
  for (const krate of crates) {
    cpSync(join(checkout, krate), join(into, krate), {
      recursive: true,
      filter: (from) => !relative(join(checkout, krate), from).split(sep).includes("target"),
    });
  }
  const root = readFileSync(join(checkout, "Cargo.toml"), "utf8");
  writeFileSync(join(into, "Cargo.toml"), workspaceOf(root, crates));
  // Patched dependencies (`[patch.crates-io]`) lie in `patches/`.
  if (/^\[patch\./m.test(root) && existsSync(join(checkout, "patches"))) {
    cpSync(join(checkout, "patches"), join(into, "patches"), { recursive: true });
  }
  for (const file of ["LICENSE", "NOTICE"]) if (existsSync(join(checkout, file))) cpSync(join(checkout, file), join(into, file));
  writeFileSync(join(into, "version.txt"), `${version}\n`);
  return crates;
}
