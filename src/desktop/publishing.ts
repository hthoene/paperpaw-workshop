// "Publish…": the plugin made ready for paperpaw.org's upload form. The
// workshop checks it (PaperPaw's checks, its version), packs it as the
// form takes it, and opens the form; the person uploads it and sends it
// to the moderators. Nothing is uploaded from here.
//
// The package is the form's `package`: the plugin's folder as a ZIP, the
// folder named as the plugin's id, `store/` (the store's page and
// screenshots) inside it, within the site's limits. Its files go in name
// order with fixed times, so the same plugin packs to the same bytes.

import { zipSync } from "fflate";

import { MAX_SCREENSHOT_BYTES } from "../project/entry";
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
  for (const whole of Object.keys(project.files).sort()) {
    if (!whole.startsWith(folder)) continue;
    const path = whole.slice(folder.length);
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
