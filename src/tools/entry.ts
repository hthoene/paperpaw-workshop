// The plugin's entry in the store (`store/store.ini`): what the store
// shows of it, written from the conversation for the person to change.
// src/publish/draft.ts asks for it with this tool too.

import { z } from "zod";

import { DEVICES, GROUPS, LICENCES, MAX_DESCRIPTION, MAX_SUMMARY, MAX_TAG, MAX_TAGS, entryPath, readEntry, writeEntry } from "../project/entry";
import type { WorkshopTool } from "./tool";

export interface EntryInput {
  summary: string;
  description?: string;
  group: (typeof GROUPS)[number];
  tags?: string[];
  licence?: (typeof LICENCES)[number];
  devices?: (typeof DEVICES)[number][];
}

export const setEntry: WorkshopTool<EntryInput> = {
  name: "set_entry",
  description:
    "Write the plugin's store entry (store.ini in its store/ folder): one sentence the store shows (at most 160 characters), a longer description in plain words if useful (what it changes, for whom), its group in the store, up to five tags, and its licence (CC0-1.0 unless the person chose another). Screenshots only if the person wants them (screenshot). `devices` only for a plugin without code that is for some devices and not all (the store then shows it only there; leave it out for every device); a plugin with code is for the readers it is built for.",
  schema: z
    .object({
      summary: z.string().min(1).max(MAX_SUMMARY),
      description: z.string().max(MAX_DESCRIPTION).optional(),
      group: z.enum(GROUPS),
      tags: z
        .array(z.string().regex(new RegExp(`^[a-z0-9-]{1,${MAX_TAG}}$`)))
        .max(MAX_TAGS)
        .optional(),
      licence: z.enum(LICENCES).optional(),
      devices: z.array(z.enum(DEVICES)).max(DEVICES.length).optional(),
    })
    .strict(),
  async run({ summary, description, group, tags, licence, devices }, { files, sync }) {
    if (devices?.length && files.kind === "code") {
      return {
        content: "Not written: a plugin with code is for the readers it has builds for, so `devices` is for plugins without code. Leave it out.",
        isError: true,
        step: { key: "step.set_entry" },
      };
    }
    // What the person set already (a licence, the screenshots' words) stays.
    const entry = readEntry(files);
    entry.summary = summary;
    entry.description = description ?? entry.description;
    entry.group = group;
    entry.tags = tags ?? entry.tags;
    entry.licence = licence ?? (entry.licence || "CC0-1.0");
    // Every device is none named: a list of all of them is none.
    if (devices) entry.devices = devices.length === DEVICES.length ? [] : [...new Set(devices)];
    const problem = writeEntry(files, entry);
    if (problem) return { content: `Not written: ${problem}.`, isError: true, step: { key: "step.set_entry" } };
    await sync();
    return { content: `Wrote ${entryPath(files.kind)}.`, step: { key: "step.set_entry" } };
  },
};
