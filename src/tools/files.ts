// The plugin's files: list, read, write, delete. Paths are inside the
// plugin's folder; writing keeps to the store's rules (rules.ts). The
// translations stay: a language file (`i18n/<lang>.ini`) is removed only
// when the person asked (`person_asked`).

import { z } from "zod";

import type { WorkshopTool } from "./tool";

/** The language of a translation file at `path`, if it is one. */
export function languageOf(path: string): string | undefined {
  return /(?:^|\/)i18n\/([^/]+)\.ini$/.exec(path)?.[1];
}


export const listFiles: WorkshopTool<Record<string, never>> = {
  name: "list_files",
  description: "List the files of the plugin being made, with their sizes in bytes.",
  schema: z.object({}).strict(),
  async run(_input, { files }) {
    const list = files.list();
    return {
      content: list.length ? list.map((f) => `${f.path} (${f.size} bytes)`).join("\n") : "(no files yet)",
      step: { key: "step.list_files" },
    };
  },
};

export const readFile: WorkshopTool<{ path: string }> = {
  name: "read_file",
  description: "Read a text file of the plugin being made.",
  schema: z.object({ path: z.string().describe("Path inside the plugin's folder, e.g. settings.ini") }).strict(),
  async run({ path }, { files }) {
    const text = files.read(path);
    if (text === undefined) {
      const why = files.has(path) ? "it is not a text file" : "there is no such file";
      return { content: `Cannot read ${path}: ${why}.`, isError: true, step: { key: "step.read_file", vars: { path } } };
    }
    return { content: text, step: { key: "step.read_file", vars: { path } } };
  },
};

export const writeFile: WorkshopTool<{ path: string; content: string }> = {
  name: "write_file",
  description:
    "Write a whole text file of the plugin being made: a new one, or one changed throughout (for a change to part of a file, edit_file). Paths are inside the plugin's folder: plugin.ini, settings.ini, presets.ini, keymap.ini, i18n/en.ini, styles.css ... The reader on screen shows the change at once.",
  schema: z
    .object({
      path: z.string().describe("Path inside the plugin's folder"),
      content: z.string().describe("The file's whole new content"),
    })
    .strict(),
  eager: true,
  async run({ path, content }, { files, sync }) {
    const problem = files.write(path, content);
    if (problem) {
      return { content: `Not written: ${problem}.`, isError: true, step: { key: "step.write_file", vars: { path } } };
    }
    await sync();
    return { content: `Wrote ${path} (${content.length} characters).`, step: { key: "step.write_file", vars: { path } } };
  },
};

/** Changes to one file in one call, at most. */
export const MAX_EDITS = 20;

export const editFile: WorkshopTool<{ path: string; edits: { old: string; new: string }[] }> = {
  name: "edit_file",
  description:
    "Change part of a text file of the plugin: each edit replaces `old` (text copied exactly from the file, found exactly once) with `new`. Prefer this to write_file for any change to a file that exists: it costs far less. All edits apply or none.",
  schema: z
    .object({
      path: z.string().describe("Path inside the plugin's folder"),
      edits: z
        .array(z.object({ old: z.string().min(1), new: z.string() }).strict())
        .min(1)
        .max(MAX_EDITS)
        .describe("In order; each `old` must occur exactly once in the file as the edits before left it"),
    })
    .strict(),
  eager: true,
  async run({ path, edits }, { files, sync }) {
    const step = { key: "step.edit_file", vars: { path } };
    let text = files.read(path);
    if (text === undefined) {
      const why = files.has(path) ? "it is not a text file" : "there is no such file (write_file makes one)";
      return { content: `Not changed: ${why}.`, isError: true, step };
    }
    for (const [i, edit] of edits.entries()) {
      const at = text.indexOf(edit.old);
      if (at < 0) return { content: `Not changed: edit ${i + 1}'s old text is not in ${path}. read_file shows it as it is.`, isError: true, step };
      if (text.indexOf(edit.old, at + 1) >= 0) {
        return { content: `Not changed: edit ${i + 1}'s old text occurs more than once in ${path}; take more of the lines around it.`, isError: true, step };
      }
      text = text.slice(0, at) + edit.new + text.slice(at + edit.old.length);
    }
    const problem = files.write(path, text);
    if (problem) return { content: `Not changed: ${problem}.`, isError: true, step };
    await sync();
    return { content: `Changed ${path} (${edits.length} edit${edits.length > 1 ? "s" : ""}).`, step };
  },
};

export const deleteFile: WorkshopTool<{ path: string; person_asked?: boolean }> = {
  name: "delete_file",
  description:
    "Remove a file from the plugin being made. A language file (i18n/<lang>.ini) is removed only when the person asked for it, with person_asked: true.",
  schema: z
    .object({
      path: z.string(),
      person_asked: z.boolean().optional().describe("For a language file (i18n/<lang>.ini) only: true when the person asked to remove that language"),
    })
    .strict(),
  async run({ path, person_asked }, { files, sync }) {
    const language = languageOf(path);
    if (language && files.has(path) && !person_asked) {
      return {
        content: `Not removed: ${path} is the plugin's translation into "${language}", and the translations stay. Writing another language never needs it gone; remove a language only when the person asks for it, then with person_asked: true.`,
        isError: true,
        step: { key: "step.delete_file", vars: { path } },
      };
    }
    const removed = files.remove(path);
    if (removed) await sync();
    return {
      content: removed ? `Removed ${path}.` : `There is no file ${path}.`,
      isError: !removed,
      step: { key: "step.delete_file", vars: { path } },
    };
  },
};
