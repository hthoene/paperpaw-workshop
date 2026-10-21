// The plugin's entry in the store (`store/store.ini`): what the store
// shows of it, written from the conversation for the person to change.

import { z } from "zod";

import type { WorkshopTool } from "./tool";

const LICENCES = ["CC0-1.0", "MIT", "Apache-2.0", "CC-BY-4.0", "GPL-3.0-or-later"] as const;

export const setEntry: WorkshopTool<{ summary: string; description?: string; tags?: string[]; licence?: string }> = {
  name: "set_entry",
  description:
    "Write the plugin's store entry (store/store.ini): one sentence the store shows (at most 160 characters), a longer description if useful, up to five tags, and its licence (CC0-1.0 unless the person chose another).",
  schema: z
    .object({
      summary: z.string().max(160),
      description: z.string().max(2000).optional(),
      tags: z.array(z.string().regex(/^[a-z0-9-]{1,24}$/)).max(5).optional(),
      licence: z.enum(LICENCES).optional(),
    })
    .strict(),
  async run({ summary, description, tags, licence }, { files, sync }) {
    const lines = ["[store]", `summary = ${oneLine(summary)}`];
    if (description) lines.push(`description = ${oneLine(description)}`);
    if (tags?.length) lines.push(`tags = ${tags.join(", ")}`);
    lines.push(`licence = ${licence ?? "CC0-1.0"}`);
    const problem = files.write("store/store.ini", lines.join("\n") + "\n");
    if (problem) return { content: `Not written: ${problem}.`, isError: true, step: { key: "step.set_entry" } };
    await sync();
    return { content: "Wrote store/store.ini.", step: { key: "step.set_entry" } };
  },
};

function oneLine(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
