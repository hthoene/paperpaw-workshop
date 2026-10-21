// A plugin brought back into the workshop: a folder or a ZIP of what the
// workshop gives (the folder for a reader's card, the package for the
// store) or of a plugin's source (a crate with `plugin/`, as a forge's
// ZIP of a repository has it). It becomes a new project with every file
// the store's rules let a project hold; what is left out, and why, is said.

import { unzipSync } from "fflate";

import { Files, newProject, type Kind, type Project } from "./project";
import { MAX_BYTES, isText } from "./rules";

/** The largest ZIP or folder taken, in bytes. */
export const MAX_IMPORT = 50 * 1024 * 1024;
/** The most files looked at in one import. */
export const MAX_IMPORT_FILES = 2000;

/** Why nothing could be imported, in the person's words. */
export class ImportProblem extends Error {}

export interface Imported {
  project: Project;
  /** The files the project holds now. */
  taken: string[];
  /** The files left out, with why. */
  skipped: { path: string; why: string }[];
}

/** The files of a ZIP, by their paths in it, without reading more than
 *  [`MAX_BYTES`] of them (as their headers say). */
export function zipEntries(zip: Uint8Array): Record<string, Uint8Array> {
  if (zip.length > MAX_IMPORT) throw new ImportProblem(`The ZIP is larger than ${MAX_IMPORT / 1024 / 1024} MB.`);
  let count = 0;
  let total = 0;
  try {
    return unzipSync(zip, {
      filter: (file) => {
        if (file.name.endsWith("/")) return false;
        count += 1;
        total += file.originalSize;
        return count <= MAX_IMPORT_FILES && total <= MAX_BYTES && file.originalSize <= MAX_BYTES;
      },
    });
  } catch {
    throw new ImportProblem("This is not a ZIP the workshop can read.");
  }
}

/** A new project of `entries` (paths as in the ZIP or the folder chosen,
 *  their bytes): the plugin found in them, at the shallowest place it is. */
export function importPlugin(entries: Record<string, Uint8Array>): Imported {
  const paths = Object.keys(entries)
    .map((p) => [p.replace(/\\/g, "/").replace(/^\.?\//, ""), p] as const)
    .filter(([p]) => p && !p.endsWith("/"));
  if (paths.length > MAX_IMPORT_FILES) throw new ImportProblem(`It holds more than ${MAX_IMPORT_FILES} files.`);
  const has = new Set(paths.map(([p]) => p));
  const folders = [...new Set(paths.map(([p]) => p.slice(0, p.lastIndexOf("/") + 1)))];
  const shallowest = (wanted: (dir: string) => boolean) =>
    folders.filter(wanted).sort((a, b) => a.split("/").length - b.split("/").length || a.length - b.length)[0];
  // A crate with its plugin's folder is a plugin with code; a folder with
  // plugin.ini a data plugin, unless it is a code plugin's build alone.
  let kind: Kind = "code";
  let root = shallowest((d) => has.has(`${d}Cargo.toml`) && has.has(`${d}plugin/plugin.ini`));
  if (root === undefined) {
    kind = "data";
    root = shallowest((d) => has.has(`${d}plugin.ini`));
    if (root === undefined) throw new ImportProblem("No plugin found: there is no plugin.ini in it.");
    if (has.has(`${root}code.ppn`)) {
      throw new ImportProblem(
        "This is a plugin with code as a reader takes it (code.ppn, a build): the workshop needs its source, the folder with Cargo.toml, src/ and plugin/.",
      );
    }
  }
  const project = newProject(kind);
  const files = new Files(project);
  const taken: string[] = [];
  const skipped: { path: string; why: string }[] = [];
  let outside = 0;
  for (const [path, original] of paths.sort(([a], [b]) => a.localeCompare(b))) {
    if (!path.startsWith(root)) {
      outside += 1;
      continue;
    }
    const inside = path.slice(root.length);
    const bytes = entries[original]!;
    let problem: string | null;
    if (kind === "code" && inside === "plugin/code.ppn") problem = "a build: the workshop builds the plugin itself";
    else if (isText(inside)) {
      const text = decodeText(bytes);
      problem = text === undefined ? "not text in UTF-8" : files.write(inside, text);
    } else problem = files.writeBytes(inside, bytes);
    if (problem) skipped.push({ path: inside, why: problem });
    else taken.push(inside);
  }
  if (outside) skipped.push({ path: `(${outside} files outside ${root || "the plugin's folder"})`, why: "not the plugin's" });
  if (!taken.length) throw new ImportProblem("None of its files belong in a plugin.");
  return { project, taken, skipped };
}

function decodeText(bytes: Uint8Array): string | undefined {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes).replace(/^﻿/, "");
  } catch {
    return undefined;
  }
}

/** The files of a folder the person chose (`<input webkitdirectory>`), by
 *  their paths in it. */
export async function folderEntries(chosen: Iterable<File>): Promise<Record<string, Uint8Array>> {
  const out: Record<string, Uint8Array> = {};
  let total = 0;
  let count = 0;
  for (const file of chosen) {
    count += 1;
    total += file.size;
    if (count > MAX_IMPORT_FILES) throw new ImportProblem(`The folder holds more than ${MAX_IMPORT_FILES} files.`);
    if (total > MAX_IMPORT) throw new ImportProblem(`The folder is larger than ${MAX_IMPORT / 1024 / 1024} MB.`);
    out[file.webkitRelativePath || file.name] = new Uint8Array(await file.arrayBuffer());
  }
  return out;
}
