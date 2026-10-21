// The plugin's files: list, read, write, delete. Paths are inside the
// plugin's folder; writing keeps to the store's rules (rules.ts).

import { z } from "zod";

import type { WorkshopTool } from "./tool";

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
    "Write a whole text file of the plugin being made (create or replace). Paths are inside the plugin's folder: plugin.ini, settings.ini, presets.ini, keymap.ini, i18n/en.ini, styles.css ... The reader on screen shows the change at once.",
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

export const deleteFile: WorkshopTool<{ path: string }> = {
  name: "delete_file",
  description: "Remove a file from the plugin being made.",
  schema: z.object({ path: z.string() }).strict(),
  async run({ path }, { files, sync }) {
    const removed = files.remove(path);
    if (removed) await sync();
    return {
      content: removed ? `Removed ${path}.` : `There is no file ${path}.`,
      isError: !removed,
      step: { key: "step.delete_file", vars: { path } },
    };
  },
};
