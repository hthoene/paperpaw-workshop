// The plugin's entry in the store (`store/store.ini`): what the store
// shows of it, written from the conversation for the person to change.
// The share page asks for it with this tool too (src/publish/draft.ts).

import { z } from "zod";

import { GROUPS, LICENCES, MAX_DESCRIPTION, MAX_SUMMARY, MAX_TAG, MAX_TAGS, entryPath, readEntry, writeEntry } from "../project/entry";
import type { WorkshopTool } from "./tool";

export interface EntryInput {
  summary: string;
  description?: string;
  group: (typeof GROUPS)[number];
  tags?: string[];
  licence?: (typeof LICENCES)[number];
}

export const setEntry: WorkshopTool<EntryInput> = {
  name: "set_entry",
  description:
    "Write the plugin's store entry (store.ini in its store/ folder): one sentence the store shows (at most 160 characters), a longer description in plain words if useful (what it changes, for whom), its group in the store, up to five tags, and its licence (CC0-1.0 unless the person chose another). Screenshots are taken with screenshot.",
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
    })
    .strict(),
  async run({ summary, description, group, tags, licence }, { files, sync }) {
    // What the person set already (a licence, the screenshots' words) stays.
    const entry = readEntry(files);
    entry.summary = summary;
    entry.description = description ?? entry.description;
    entry.group = group;
    entry.tags = tags ?? entry.tags;
    entry.licence = licence ?? (entry.licence || "CC0-1.0");
    const problem = writeEntry(files, entry);
    if (problem) return { content: `Not written: ${problem}.`, isError: true, step: { key: "step.set_entry" } };
    await sync();
    return { content: `Wrote ${entryPath(files.kind)}.`, step: { key: "step.set_entry" } };
  },
};
