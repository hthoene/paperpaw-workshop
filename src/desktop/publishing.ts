// "Publish…": the plugin made ready for paperpaw.org's upload form. The
// workshop checks it (PaperPaw's checks, its version), packs it as the
// form takes it, and opens the form; the person uploads it and sends it
// to the moderators. Nothing is uploaded from here.
//
// The package is one part of the store file the form takes (made in
// src-tauri's publish.rs): the plugin's folder as a ZIP, the
// folder named as the plugin's id, `store/` (the store's page and
// screenshots) inside it, within the site's limits. Its files go in name
// order with fixed times, so the same plugin packs to the same bytes.

import { zipSync } from "fflate";

import { MAX_SCREENSHOT_BYTES } from "../project/entry";
import { iniValue, parseIni } from "../project/ini";
import { identity, type Project } from "../project/project";
import { MAX_BYTES, MAX_FILES, pathProblem, validId, validVersion } from "../project/rules";

/** The store's upload form. */
export const SUBMIT = "https://paperpaw.org/submit";
/** The largest package the form takes. */
export const MAX_PACKAGE = 20 * 1024 * 1024;
/** Fixed times for the ZIP's files (a ZIP's dates start in 1980). */
const PACKED_AT = new Date("1980-01-01T00:00:00");

/** A version as three numbers, to compare. */
function numbers(version: string): [number, number, number] {
  const [a, b, c] = version.split(".").map(Number);
  return [a ?? 0, b ?? 0, c ?? 0];
}

/** Whether version `a` is higher than `b`. */
export function higher(a: string, b: string): boolean {
  const [x, y] = [numbers(a), numbers(b)];
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i]! > y[i]!;
  return false;
}

/** The next version: its last number raised (1.0.0 to 1.0.1). */
export function raised(version: string): string {
  const [a, b, c] = numbers(version);
  return `${a}.${b}.${c + 1}`;
}

/** The last version packed for the store from this project. */
export function lastPublished(project: Project): { version: string; packed: string } | undefined {
  return project.published?.at(-1);
}

/** What stands in the way of the version: none, not three numbers, or
 *  not higher than the last one packed for the store (`again` when it is
 *  that one: packed, but perhaps never sent). */
export type VersionState =
  | { ok: true; version: string }
  | { ok: false; why: "missing" | "invalid"; version?: string }
  | { ok: false; why: "not-higher"; version: string; last: string; again: boolean };

export function versionState(project: Project): VersionState {
  const { version } = identity(project);
  if (!version) return { ok: false, why: "missing" };
  if (!validVersion(version)) return { ok: false, why: "invalid", version };
  const last = lastPublished(project);
  if (last && !higher(version, last.version)) return { ok: false, why: "not-higher", version, last: last.version, again: version === last.version };
  return { ok: true, version };
}

/** plugin.ini with its version raised to `version`. */
export function withVersion(ini: string, version: string): string {
  let inPlugin = false;
  let done = false;
  const lines = ini.split("\n").map((line) => {
    const section = /^\s*\[([^\]]+)\]\s*$/.exec(line);
    if (section) inPlugin = section[1]!.trim() === "plugin";
    else if (inPlugin && !done && /^\s*version\s*=/.test(line)) {
      done = true;
      return `version = ${version}`;
    }
    return line;
  });
  return lines.join("\n");
}

/** Cargo.toml with its package's version raised to `version` (a plugin
 *  with code says its version there as well as in plugin/plugin.ini). */
export function withCrateVersion(manifest: string, version: string): string {
  let inPackage = false;
  let done = false;
  return manifest
    .split("\n")
    .map((line) => {
      const section = /^\s*\[([^\]]+)\]\s*$/.exec(line);
      if (section) inPackage = section[1]!.trim() === "package";
      else if (inPackage && !done && /^\s*version\s*=/.test(line)) {
        done = true;
        return `version = "${version}"`;
      }
      return line;
    })
    .join("\n");
}

/** The package for the form, or what keeps it from being made. */
export type Packed = { ok: true; name: string; zip: Uint8Array; id: string; version: string } | { ok: false; problems: string[] };

/** The plugin without code as the upload form takes it. */
export function uploadPackage(project: Project): Packed {
  const { id, version } = identity(project);
  // A plugin with code: its folder is plugin/, its builds go apart.
  const folder = project.kind === "code" ? "plugin/" : "";
  const problems: string[] = [];
  if (!id) problems.push("plugin.ini names no id");
  else if (!validId(id)) problems.push(`the id "${id}" is not lower-case letters, digits and hyphens, at most 40`);
  if (!version || !validVersion(version)) problems.push("plugin.ini's version is not three numbers, such as 1.0.0");
  const files: Record<string, Uint8Array> = {};
  let installed = 0;
  let total = 0;
  const encoder = new TextEncoder();
  // A plugin with code says how it works in how/<lang>.txt beside its
  // crate (its manifest includes them); the store reads them in the
  // folder, so they go there too, unless the folder has its own.
  const shared = (whole: string) => !!folder && whole.startsWith("how/") && project.files[`${folder}${whole}`] === undefined;
  for (const whole of Object.keys(project.files).sort()) {
    if (!whole.startsWith(folder) && !shared(whole)) continue;
    const path = shared(whole) ? whole : whole.slice(folder.length);
    if (folder && path === "code.ppn") continue;
    const content = project.files[whole]!;
    const bytes = typeof content === "string" ? encoder.encode(content) : content;
    const problem = pathProblem(path);
    if (problem) problems.push(`${path}: ${problem}`);
    if (path.startsWith("store/")) {
      if (/\.(png|jpe?g|webp)$/i.test(path) && bytes.length > MAX_SCREENSHOT_BYTES) {
        problems.push(`${path}: a screenshot may have at most ${MAX_SCREENSHOT_BYTES / 1000} KB`);
      }
    } else installed++;
    total += bytes.length;
    files[path] = bytes;
  }
  if (!files["plugin.ini"]) problems.push("there is no plugin.ini");
  // A plugin with code gets its build as one more file.
  const room = folder ? MAX_FILES - 1 : MAX_FILES;
  if (installed > room) problems.push(`a reader installs at most ${room} files of this plugin; this one has ${installed}`);
  if (total > MAX_BYTES) problems.push("more than 40 MB unpacked");
  if (problems.length || !id || !version) return { ok: false, problems };
  const tree: Record<string, [Uint8Array, { mtime: Date }]> = {};
  for (const [path, bytes] of Object.entries(files)) tree[`${id}/${path}`] = [bytes, { mtime: PACKED_AT }];
  const zip = zipSync(tree, { level: 9, mtime: PACKED_AT });
  if (zip.length > MAX_PACKAGE) return { ok: false, problems: ["the package is larger than 20 MB"] };
  return { ok: true, name: `${id}-${version}-upload.zip`, zip, id, version };
}

/** Remembers that `version` was packed for the store. */
export function recordPublished(project: Project, version: string, at = new Date()): void {
  const list = (project.published ??= []);
  if (list.at(-1)?.version === version) list[list.length - 1] = { version, packed: at.toISOString() };
  else list.push({ version, packed: at.toISOString() });
}

/** What a store file holds (its parts as the workshop names them:
 *  `package`, each reader built for, `source`), in words: "the plugin,
 *  its build for the X4 and its source". */
export function holds(parts: string[]): string {
  const said = parts.map((part) =>
    part === "package" ? "the plugin" : part === "source" ? "its source" : `its build for the ${part === "x4-pro" ? "X4 Pro" : part.toUpperCase()}`,
  );
  if (said.length < 2) return said[0] ?? "";
  return `${said.slice(0, -1).join(", ")} and ${said.at(-1)}`;
}

/** The store's groups, in its order (paperpaw.org's `catalogue.rs`,
 *  PaperPaw's store plugin), each with a short name and what goes there. */
export const GROUPS: readonly { id: string; name: string; what: string }[] = [
  { id: "reading", name: "Reading", what: "while reading a book: looking up, reading aids, statistics" },
  { id: "formats", name: "Formats", what: "opening a kind of book file" },
  { id: "library", name: "Library", what: "finding, fetching and keeping books" },
  { id: "sync", name: "Sync", what: "keeping progress and books in step with other apps" },
  { id: "home", name: "Home and menus", what: "the home screen, its widgets, buttons and menus" },
  { id: "look", name: "Look", what: "fonts, colours and the look of screens" },
  { id: "notes", name: "Notes", what: "notes, highlights and their export, journals" },
  { id: "learning", name: "Learning", what: "vocabulary, languages, flash cards" },
  { id: "news", name: "News", what: "news, feeds, articles, reading the web" },
  { id: "tools", name: "Tools", what: "calculators, timers and other small helpers" },
  { id: "games", name: "Games", what: "games and puzzles" },
  { id: "system", name: "System", what: "the device itself: power, Wi-Fi, updates, settings" },
];

/** Licences to choose from, as SPDX identifiers; the first is the default. */
export const LICENCES: readonly { id: string; name: string }[] = [
  { id: "MIT", name: "MIT: anyone may use and change it, naming you" },
  { id: "Apache-2.0", name: "Apache 2.0: as MIT, with a patent grant" },
  { id: "GPL-3.0-or-later", name: "GPL 3.0: changed versions stay open too" },
  { id: "CC0-1.0", name: "CC0: no rights kept" },
];

/** Where a project keeps its store entry: in the plugin's folder, under
 *  `store/` (a plugin with code has its folder in `plugin/`). */
export function storeIniPath(project: Pick<Project, "kind">): string {
  return project.kind === "code" ? "plugin/store/store.ini" : "store/store.ini";
}

/** What the project's store entry says in `[store]`. */
export function storeEntry(project: Pick<Project, "kind" | "files">): { licence?: string; group?: string; sdk?: string } {
  const text = project.files[storeIniPath(project)];
  if (typeof text !== "string") return {};
  const ini = parseIni(text);
  const said = (key: string) => iniValue(ini, "store", key)?.trim() || undefined;
  const group = said("group");
  return { licence: said("licence"), group: GROUPS.some((g) => g.id === group) ? group : undefined, sdk: said("sdk") };
}

/** `ini` (a store.ini, perhaps empty) with `values` in `[store]`: a key
 *  there is changed, one missing added at the section's end; the section
 *  is added when there is none. */
export function withStore(ini: string, values: Record<string, string>): string {
  const lines = ini.length ? ini.replace(/\n$/, "").split("\n") : [];
  const left = new Map(Object.entries(values));
  let section = "";
  let end = -1;
  lines.forEach((line, i) => {
    const head = /^\s*\[([^\]]+)\]\s*$/.exec(line);
    if (head) {
      section = head[1]!.trim();
      return;
    }
    if (section !== "store") return;
    if (line.trim()) end = i;
    const key = /^\s*([A-Za-z0-9_.-]+)\s*=/.exec(line)?.[1];
    if (key && left.has(key)) {
      lines[i] = `${key} = ${left.get(key)}`;
      left.delete(key);
    }
  });
  const added = [...left].map(([key, value]) => `${key} = ${value}`);
  if (added.length) {
    if (end >= 0) lines.splice(end + 1, 0, ...added);
    else if (lines.some((l) => /^\s*\[store\]\s*$/.test(l))) lines.splice(lines.findIndex((l) => /^\s*\[store\]\s*$/.test(l)) + 1, 0, ...added);
    else lines.unshift("[store]", ...added, ...(lines.length ? [""] : []));
  }
  return `${lines.join("\n")}\n`;
}

/** The SDK a PaperPaw version names, as the store wants it: 0.5.0-beta.4
 *  is 0.5. */
export function sdkOf(paperpaw: string): string {
  const [major, minor] = paperpaw.trim().split(/[.-]/);
  return `${major ?? "0"}.${minor ?? "0"}`;
}
