// The plugin's page in the store, as `store/store.ini` holds it: what the
// AI drafts (the `set_entry` tool) and the person changes on the share
// page. The rules are paperpaw.org's (catalogue.rs and upload.rs there),
// so what passes here passes the store's form.

import { parseIni } from "./ini";
import { storeFolder, type Files, type Kind } from "./project";
import { validId } from "./rules";

/** Where a plugin of `kind` keeps its entry. */
export function entryPath(kind: Kind): string {
  return `${storeFolder(kind)}store.ini`;
}

/** Where a plugin belongs in the store. */
export const GROUPS = ["look", "home", "reading", "library", "formats", "sync", "notes", "learning", "news", "tools", "games", "system"] as const;
export type Group = (typeof GROUPS)[number];

/** The licences offered in one click, most open first. Any SPDX id is
 *  taken by the store; these are the ones a beginner needs. */
export const LICENCES = ["CC0-1.0", "CC-BY-4.0", "MIT", "Apache-2.0", "GPL-3.0-or-later"] as const;

export const MAX_NAME = 60;
export const MAX_SUMMARY = 160;
export const MAX_DESCRIPTION = 2000;
export const MAX_TAGS = 5;
export const MAX_TAG = 24;
export const MAX_ALT = 200;
export const MAX_SCREENSHOTS = 4;
export const MAX_SCREENSHOT_BYTES = 500_000;

export interface Entry {
  /** One sentence. */
  summary: string;
  description: string;
  group: Group | "";
  tags: string[];
  licence: string;
  /** A home page or repository, if there is one. */
  source: string;
  /** What each screenshot shows, by its file name in `store/`. */
  alts: Record<string, string>;
}

export const EMPTY_ENTRY: Entry = { summary: "", description: "", group: "", tags: [], licence: "", source: "", alts: {} };

export function readEntry(files: Files): Entry {
  const text = files.read(entryPath(files.kind));
  if (!text) return structuredClone(EMPTY_ENTRY);
  const ini = parseIni(text);
  const said = (key: string) => ini.entries.find((e) => e.section === "store" && e.key === key)?.value ?? "";
  const group = said("group");
  const alts: Record<string, string> = {};
  for (const e of ini.entries) if (e.section === "screenshots") alts[e.key] = e.value;
  return {
    summary: said("summary"),
    description: said("description"),
    group: (GROUPS as readonly string[]).includes(group) ? (group as Group) : "",
    tags: said("tags")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    licence: said("licence"),
    source: said("source"),
    alts,
  };
}

/** Writes the entry; why not, if it could not be written. */
export function writeEntry(files: Files, entry: Entry): string | null {
  const lines = ["[store]"];
  const put = (key: string, value: string) => {
    if (value.trim()) lines.push(`${key} = ${oneLine(value)}`);
  };
  put("summary", entry.summary);
  put("description", entry.description);
  put("group", entry.group);
  put("tags", entry.tags.join(", "));
  put("licence", entry.licence);
  put("source", entry.source);
  const shots = Object.entries(entry.alts).filter(([, alt]) => alt.trim());
  if (shots.length) {
    lines.push("", "[screenshots]");
    for (const [file, alt] of shots) lines.push(`${file} = ${oneLine(alt)}`);
  }
  return files.write(entryPath(files.kind), lines.join("\n") + "\n");
}

/** What the store would refuse in the entry, as catalog keys with
 *  values. The name is plugin.ini's. */
export function entryProblems(entry: Entry, name: string): { key: string; vars?: Record<string, string | number> }[] {
  const problems: { key: string; vars?: Record<string, string | number> }[] = [];
  if (!name.trim()) problems.push({ key: "share.problem.name" });
  if ([...name].length > MAX_NAME) problems.push({ key: "share.problem.name-long", vars: { n: MAX_NAME } });
  if (!entry.summary.trim()) problems.push({ key: "share.problem.summary" });
  if ([...entry.summary].length > MAX_SUMMARY) problems.push({ key: "share.problem.summary-long", vars: { n: MAX_SUMMARY } });
  if ([...entry.description].length > MAX_DESCRIPTION)
    problems.push({ key: "share.problem.description-long", vars: { n: MAX_DESCRIPTION } });
  if (!entry.group) problems.push({ key: "share.problem.group" });
  if (!entry.licence.trim()) problems.push({ key: "share.problem.licence" });
  if (entry.tags.length > MAX_TAGS) problems.push({ key: "share.problem.tags", vars: { n: MAX_TAGS } });
  for (const tag of entry.tags) {
    if (!validId(tag) || tag.length > MAX_TAG) problems.push({ key: "share.problem.tag", vars: { tag } });
  }
  return problems;
}

/** Tags as a person types them ("Dark, big letters") as the store takes
 *  them ("dark", "big-letters"). */
export function tagsFrom(text: string): string[] {
  const tags = text
    .split(",")
    .map((t) => t.trim().toLowerCase().replace(/\s+/g, "-"))
    .filter(Boolean);
  return [...new Set(tags)];
}

function oneLine(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
