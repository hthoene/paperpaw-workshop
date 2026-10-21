// The handbook's topics on demand: one module's docs, the settings of one
// plugin, the widgets, the actions, a sample.

import { z } from "zod";

import type { WorkshopTool } from "./tool";

export const lookupDocs: WorkshopTool<{ topic: string }> = {
  name: "lookup_docs",
  description:
    "Look up a topic of PaperPaw's documentation for this release: a section of the plugin docs (e.g. 'docs/widgets', 'docs/presets-and-home-screen-layouts'), the settings of a plugin ('settings/home', 'settings/reader', 'settings/widgets') or of a group ('settings-group/core.group.look'), 'widgets', 'actions', 'keymap/default', 'devices', a sample ('samples/theme-paw'). Words work too: the answer then lists the closest topics.",
  schema: z.object({ topic: z.string().describe("A topic id or a few words") }).strict(),
  async run({ topic }, { handbook }) {
    const { topic: found, candidates } = handbook.find(topic);
    if (found) {
      return { content: await handbook.read(found), step: { key: "step.lookup_docs", vars: { topic: found.title } } };
    }
    const list = candidates.map((t) => `- ${t.id}: ${t.title} (${t.tokens} tokens)`).join("\n");
    return {
      content: candidates.length
        ? `No topic is called "${topic}". The closest:\n${list}`
        : `Nothing matches "${topic}". Topics start with docs/, settings/, settings-group/, samples/, or are widgets, actions, keymap/default, devices.`,
      step: { key: "step.lookup_docs", vars: { topic } },
    };
  },
};
