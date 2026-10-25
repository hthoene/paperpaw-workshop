// The store's screenshots, taken on the emulator so nobody has to make
// their own. They go into the plugin's `store/` folder as the store reads
// them: at most four, each at most 500 KB, shown in the order of their
// names (`1-x4-pro.png`, `2-boox-go-7-night.png`), each with what it
// shows in store.ini's `[screenshots]`. The person takes them with the
// camera beside the reader, the AI with its `screenshot` tool; Publish
// shows them to delete and reorder.

import type { Emulator } from "../emulator/emulator";
import type { Profile } from "../handbook/handbook";
import { entryPath, MAX_ALT, MAX_SCREENSHOT_BYTES, MAX_SCREENSHOTS } from "../project/entry";
import { parseIni } from "../project/ini";
import { storeFolder, type Files } from "../project/project";
import { validId } from "../project/rules";

/** A screenshot's file name in the store's folder. */
const SHOT = /^[a-z0-9-]+\.(png|jpe?g|webp)$/;

export interface StoreShot {
  /** Its name in the store's folder, e.g. `1-x4-pro.png`. */
  file: string;
  /** Its path in the project. */
  path: string;
  /** What it shows, for those who cannot see it ("" where none is said). */
  alt: string;
}

/** The screenshots in the store's folder now, in the store's order. */
export function storeShots(files: Files): StoreShot[] {
  const folder = storeFolder(files.kind);
  const alts = altsIn(files);
  return files
    .list()
    .map((f) => f.path)
    .filter((p) => p.startsWith(folder) && SHOT.test(p.slice(folder.length)))
    .map((path) => {
      const file = path.slice(folder.length);
      return { file, path, alt: alts[file] ?? "" };
    })
    .sort((a, b) => order(a.file) - order(b.file) || a.file.localeCompare(b.file));
}

/** The screenshots' names in the store's folder, in the store's order. */
export function shotsIn(files: Files): string[] {
  return storeShots(files).map((s) => s.file);
}

export type Kept = { ok: true; file: string } | { ok: false; why: string };

/** Keeps `png`, a screenshot of `profile` (`dark`: in night mode), as
 *  the store's screenshot that shows `alt`: in place of `replace` (a
 *  file of the store's folder), else after the others. */
export function keepShot(files: Files, png: Uint8Array, profile: Profile, dark: boolean, alt: string, replace?: string): Kept {
  const shots = storeShots(files);
  const replaced = replace === undefined ? -1 : shots.findIndex((s) => s.file === replace);
  if (replace !== undefined && replaced < 0) {
    return { ok: false, why: `there is no screenshot ${replace}: the store has ${list(shots)}` };
  }
  if (replaced < 0 && shots.length >= MAX_SCREENSHOTS) {
    return { ok: false, why: `the store takes at most ${MAX_SCREENSHOTS} screenshots: replace or delete one first (${list(shots)})` };
  }
  if (png.length > MAX_SCREENSHOT_BYTES) {
    return { ok: false, why: `it is ${Math.ceil(png.length / 1000)} KB, the store takes at most ${MAX_SCREENSHOT_BYTES / 1000} KB: a calmer screen is smaller` };
  }
  const at = replaced < 0 ? shots.length : replaced;
  const file = `${at + 1}-${slug(profile)}${dark ? "-night" : ""}.png`;
  const kept: Written[] = shots.map((s) => ({ ...s, bytes: bytesOf(files, s.path) }));
  const shot = { file, alt: oneLine(alt).slice(0, MAX_ALT), bytes: png };
  if (replaced < 0) kept.push(shot);
  else kept[replaced] = shot;
  const problem = rewrite(files, kept);
  return problem ? { ok: false, why: problem } : { ok: true, file };
}

/** Deletes the screenshot `file`; why not, where it could not. */
export function removeShot(files: Files, file: string): string | null {
  const shots = storeShots(files);
  if (!shots.some((s) => s.file === file)) return `there is no screenshot ${file}`;
  return rewrite(
    files,
    shots.filter((s) => s.file !== file).map((s) => ({ ...s, bytes: bytesOf(files, s.path) })),
  );
}

/** Moves the screenshot `file` one place earlier (-1) or later (1). */
export function moveShot(files: Files, file: string, by: -1 | 1): string | null {
  const shots = storeShots(files).map((s) => ({ ...s, bytes: bytesOf(files, s.path) }));
  const from = shots.findIndex((s) => s.file === file);
  const to = from + by;
  if (from < 0) return `there is no screenshot ${file}`;
  if (to < 0 || to >= shots.length) return null;
  [shots[from], shots[to]] = [shots[to]!, shots[from]!];
  return rewrite(files, shots);
}

/** Changes what the screenshot `file` shows, in words. */
export function describeShot(files: Files, file: string, alt: string): string | null {
  const shots = storeShots(files);
  const shot = shots.find((s) => s.file === file);
  if (!shot) return `there is no screenshot ${file}`;
  shot.alt = oneLine(alt).slice(0, MAX_ALT);
  return writeAlts(files, shots);
}

export interface Shot {
  /** Its file name in `store/`, as the store wants it: `2-x4-pro.png`.
   *  The store shows them in the order of their names, hence the number. */
  file: string;
  profile: Profile;
  dark: boolean;
  /** What it shows, for those who cannot see it. */
  alt: string;
}

/** The screenshots to take, in the store's order: each device, then the
 *  first one at night. */
export function plannedShots(profiles: Profile[], alt: (device: string, dark: boolean) => string): Shot[] {
  const wanted = profiles.map((profile) => ({ profile, dark: false }));
  if (profiles[0]) wanted.push({ profile: profiles[0], dark: true });
  return wanted.slice(0, MAX_SCREENSHOTS).map(({ profile, dark }, i) => ({
    file: `${i + 1}-${slug(profile)}${dark ? "-night" : ""}.png`,
    profile,
    dark,
    alt: alt(short(profile), dark),
  }));
}

/** Takes `shots` and keeps them in `store/`, in place of earlier ones.
 *  Returns the files kept and those too large to keep. */
export async function takeShots(emulator: Emulator, files: Files, shots: Shot[]): Promise<{ kept: string[]; tooLarge: string[] }> {
  for (const old of storeShots(files)) files.remove(old.path);
  const folder = storeFolder(files.kind);
  const kept: string[] = [];
  const tooLarge: string[] = [];
  for (const shot of shots) {
    const taken = await emulator.screenshot(shot.profile, shot.dark);
    const bytes = base64Bytes(taken.png);
    if (bytes.length > MAX_SCREENSHOT_BYTES) {
      tooLarge.push(shot.file);
      continue;
    }
    const problem = files.writeBytes(`${folder}${shot.file}`, bytes);
    if (problem) throw new Error(`${shot.file}: ${problem}`);
    kept.push(shot.file);
  }
  return { kept, tooLarge };
}

/** `Xteink X4 Pro` as a file name: `x4-pro`. */
function slug(profile: Profile): string {
  const name = short(profile)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return validId(name) ? name : "reader";
}

function short(profile: Profile): string {
  return profile.name.replace(/^Xteink\s+/, "");
}

export function base64Bytes(base64: string): Uint8Array {
  const raw = atob(base64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

/** A screenshot with its bytes, to write again. */
type Written = Pick<StoreShot, "file" | "alt"> & { bytes: Uint8Array };

/** The store's screenshots as `shots`, in that order: numbered afresh
 *  from 1, the others deleted, their words with them. */
function rewrite(files: Files, shots: Written[]): string | null {
  const folder = storeFolder(files.kind);
  for (const old of storeShots(files)) files.remove(old.path);
  const named = shots.map((s, i) => ({ ...s, file: `${i + 1}-${s.file.replace(/^\d+-/, "")}` }));
  for (const shot of named) {
    const problem = files.writeBytes(`${folder}${shot.file}`, shot.bytes);
    if (problem) return `${shot.file}: ${problem}`;
  }
  return writeAlts(files, named);
}

/** store.ini with `[screenshots]` saying what each of `shots` shows, the
 *  rest of it as it was. */
function writeAlts(files: Files, shots: Pick<StoreShot, "file" | "alt">[]): string | null {
  const path = entryPath(files.kind);
  const old = files.read(path) ?? "";
  const lines: string[] = [];
  let inShots = false;
  for (const line of old.replace(/\r\n/g, "\n").split("\n")) {
    const section = /^\s*\[([^\]]*)\]\s*$/.exec(line);
    if (section) inShots = section[1]!.trim() === "screenshots";
    if (!inShots) lines.push(line);
  }
  while (lines.length && !lines[lines.length - 1]!.trim()) lines.pop();
  const said = shots.filter((s) => s.alt.trim());
  if (said.length) {
    if (lines.length) lines.push("");
    lines.push("[screenshots]", ...said.map((s) => `${s.file} = ${oneLine(s.alt)}`));
  }
  if (!lines.length && !old) return null;
  return files.write(path, lines.join("\n") + "\n");
}

function altsIn(files: Files): Record<string, string> {
  const text = files.read(entryPath(files.kind));
  const alts: Record<string, string> = {};
  if (!text) return alts;
  for (const e of parseIni(text).entries) if (e.section === "screenshots") alts[e.key] = e.value;
  return alts;
}

function bytesOf(files: Files, path: string): Uint8Array {
  const content = files.all()[path];
  return typeof content === "string" ? new TextEncoder().encode(content) : (content ?? new Uint8Array());
}

/** A screenshot's place by its number: `2-x4.png` is 2, unnumbered last. */
function order(file: string): number {
  const n = /^(\d+)-/.exec(file);
  return n ? Number(n[1]) : Number.MAX_SAFE_INTEGER;
}

function list(shots: StoreShot[]): string {
  return shots.length ? shots.map((s) => s.file).join(", ") : "none";
}

function oneLine(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
