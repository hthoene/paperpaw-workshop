// The notices every copy of the workshop must carry, from its lockfiles:
// public/THIRD-PARTY-NOTICES.txt, which the app shows (Settings,
// Licences) and the installer puts beside it.
//
// What ships: the Rust crates the app (src-tauri) links on Windows, read
// with `cargo metadata`, normal dependencies only (no build scripts,
// proc macros or dev dependencies); the npm packages the page bundles,
// those of package-lock.json that are no dev dependency. Each is listed
// under the licence it is used under (MIT where it offers it), with the
// copyright lines of its licence files (or its authors, where they hold
// none); each licence's text follows once. MPL-2.0 crates say where their
// source is (they are used unchanged). libgit2, which git2 links in
// statically, has its COPYING: GPL-2.0 with the linking exception, and
// the libraries it bundles. PaperPaw's emulator and web build carry their
// own notices (emulator/NOTICE and the emulator's NOTICE.txt).
//
//   node scripts/notices.mjs           writes it
//   node scripts/notices.mjs --check   fails where it is not what the
//                                      lockfiles say (npm test runs it)
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public", "THIRD-PARTY-NOTICES.txt");
const texts = join(root, "scripts", "licence-texts");

// The licence a package is used under where it offers several: the first
// of these it offers.
const PREFER = [
  "MIT", "Apache-2.0", "ISC", "BSD-3-Clause", "BSD-2-Clause", "0BSD", "Zlib", "Unicode-3.0",
  "CDLA-Permissive-2.0", "MPL-2.0", "Unlicense",
];
const NAMES = {
  "MIT": "MIT License",
  "Apache-2.0": "Apache License 2.0",
  "ISC": "ISC License",
  "BSD-3-Clause": "BSD 3-Clause License",
  "BSD-2-Clause": "BSD 2-Clause License",
  "0BSD": "BSD Zero Clause License",
  "Zlib": "zlib License",
  "Unicode-3.0": "Unicode License v3",
  "CDLA-Permissive-2.0": "Community Data License Agreement Permissive 2.0",
  "MPL-2.0": "Mozilla Public License 2.0",
  "Unlicense": "The Unlicense",
};

/** The licences used, one of each AND part: the first of PREFER it offers. */
export function choose(expression) {
  const parts = (expression ?? "").replaceAll("/", " OR ").split(/\s+AND\s+/);
  return parts.map((part) => {
    const offers = part
      .replace(/^[\s(]+|[\s)]+$/g, "")
      .split(/\s+OR\s+/)
      .map((o) => o.replace(/\s+WITH\s+.*/, "").replace(/^[\s(]+|[\s)]+$/g, ""));
    const pick = PREFER.find((p) => offers.includes(p));
    if (!pick) throw new Error(`no licence of ${PREFER.join(", ")} in \`${expression}\`: add its text and name`);
    return pick;
  });
}

const LICENCE_FILE = /^(licen[cs]e|copying|copyright|notice|unlicense)/i;
const COPYRIGHT = /^(Copyright|COPYRIGHT|copyright)(\s+(\(c\)|\(C\)|©))?:?\s+(\d{4}|[A-Z©]|the\b)|^(\(c\)|\(C\)|©)\s*\d{4}/;
const TEMPLATE = /\[yyyy\]|<year>|\{yyyy\}|\[name of|<copyright|<owner>|\[fullname\]/i;

/** The copyright lines of the licence files in `folder`, or `fallback`. */
function copyrights(folder, fallback) {
  const lines = [];
  for (const name of existsSync(folder) ? readdirSync(folder).sort() : []) {
    const path = join(folder, name);
    if (!LICENCE_FILE.test(name) || !statSync(path).isFile()) continue;
    for (let line of readFileSync(path, "utf8").split(/\r?\n/)) {
      line = line.trim().replace(/^[/#*!\-\s]+/, "").trim();
      if (COPYRIGHT.test(line) && !TEMPLATE.test(line)) {
        line = line.slice(0, 200);
        if (!lines.includes(line)) lines.push(line);
      }
    }
  }
  return lines.length ? lines : [fallback];
}

function byWho(name, authors, repository) {
  const who = (authors ?? []).map((a) => a.replace(/\s*<[^>]*>/, "").trim()).filter(Boolean);
  return `Copyright ${who.length ? who.join(", ") : `the ${name} contributors`}${repository ? ` (${repository})` : ""}`;
}

/** The crates the app links on Windows, by name and version. */
function crates() {
  const meta = spawnSync("cargo", [
    "metadata", "--format-version", "1", "--locked", "--filter-platform", "x86_64-pc-windows-msvc",
    "--manifest-path", join(root, "src-tauri", "Cargo.toml"),
  ], { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
  if (meta.status !== 0) throw new Error(`cargo metadata: ${meta.stderr}`);
  const m = JSON.parse(meta.stdout);
  const packages = new Map(m.packages.map((p) => [p.id, p]));
  const nodes = new Map(m.resolve.nodes.map((n) => [n.id, n]));
  const seen = new Set();
  const todo = [...m.workspace_members];
  while (todo.length) {
    const at = todo.pop();
    if (seen.has(at)) continue;
    seen.add(at);
    for (const dep of nodes.get(at).deps) {
      if (dep.dep_kinds.some((k) => k.kind === null)) todo.push(dep.pkg);
    }
  }
  return [...seen]
    .map((id) => packages.get(id))
    .filter((p) => p.source !== null)
    .map((p) => {
      const folder = dirname(p.manifest_path);
      return {
        kind: "crate",
        name: p.name,
        version: p.version,
        licence: p.license,
        folder,
        repository: p.repository,
        lines: copyrights(folder, byWho(p.name, p.authors, p.repository)),
      };
    });
}

/** The npm packages the page bundles. */
function npm() {
  const lock = JSON.parse(readFileSync(join(root, "package-lock.json"), "utf8"));
  return Object.entries(lock.packages)
    .filter(([path, p]) => path && !p.dev)
    .map(([path, p]) => {
      const name = path.replace(/^.*node_modules\//, "");
      const folder = join(root, path);
      let info = {};
      try { info = JSON.parse(readFileSync(join(folder, "package.json"), "utf8")); } catch { /* none */ }
      const author = typeof info.author === "string" ? info.author : info.author?.name;
      const repository = typeof info.repository === "string" ? info.repository : info.repository?.url;
      return {
        kind: "npm",
        name,
        version: p.version,
        licence: p.license,
        folder,
        repository,
        lines: copyrights(folder, byWho(name, author ? [author] : [], repository)),
      };
    });
}

function textOf(licence) {
  if (licence === "Apache-2.0") return "Its text is in the LICENSE file beside the app.";
  return readFileSync(join(texts, `${licence}.txt`), "utf8").trim();
}

/** The notices, by licence; libgit2's COPYING after them. */
export function notices() {
  const all = [...crates(), ...npm()].sort((a, b) =>
    a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name) || a.version.localeCompare(b.version));
  const groups = new Map(PREFER.map((l) => [l, []]));
  for (const p of all) for (const licence of choose(p.licence)) groups.get(licence).push(p);
  const out = [
    "PaperPaw Workshop: third-party notices",
    "",
    "The workshop is licensed under the Apache License, Version 2.0 (LICENSE).",
    "It contains the Rust crates and npm packages below, each under the licence",
    "it is used under, and libgit2 (below them). PaperPaw's emulator and web",
    "build, which it brings, carry PaperPaw's notices beside them (NOTICE).",
    "Generated by scripts/notices.mjs from Cargo.lock and package-lock.json.",
  ];
  for (const [licence, packages] of groups) {
    if (!packages.length) continue;
    out.push("", "=".repeat(72), `${NAMES[licence]} (${licence})`, "=".repeat(72), "");
    for (const p of packages) {
      const used = p.licence?.trim() === licence ? "" : `, used under ${licence}`;
      out.push(`${p.kind === "npm" ? "npm " : ""}${p.name} ${p.version} (${p.licence}${used})`);
      for (const line of p.lines) out.push(`    ${line}`);
      // The MPL asks where the source of what is used can be had.
      if (licence === "MPL-2.0") {
        out.push(`    Source, used unchanged: https://crates.io/crates/${p.name}/${p.version}${p.repository ? `, ${p.repository}` : ""}`);
      }
    }
    out.push("", textOf(licence));
  }
  const git = all.find((p) => p.name === "libgit2-sys");
  if (git) {
    out.push(
      "", "=".repeat(72), "libgit2", "=".repeat(72), "",
      `libgit2 (https://libgit2.org), linked into the app by ${git.name} ${git.version}, is licensed`,
      "under the GNU General Public License, version 2, with the linking exception",
      "below: linking it into another program, as the workshop does, makes no",
      "condition of the GPL apply to that program. Its COPYING, with the licences of",
      "the libraries it bundles:", "",
      readFileSync(join(git.folder, "libgit2", "COPYING"), "utf8").trim(),
    );
  }
  return out.join("\n").trimEnd() + "\n";
}

if (import.meta.url === `file://${process.argv[1]?.replaceAll("\\", "/").replace(/^\/?/, "/")}` ||
    process.argv[1]?.endsWith("notices.mjs")) {
  const text = notices();
  if (process.argv.includes("--check")) {
    const held = existsSync(out) ? readFileSync(out, "utf8").replaceAll("\r\n", "\n") : "";
    if (held !== text) {
      console.error("public/THIRD-PARTY-NOTICES.txt is not what the lockfiles say (a dependency added, removed or updated): run `node scripts/notices.mjs` and commit it.");
      process.exit(1);
    }
  } else {
    writeFileSync(out, text);
  }
}
