// The handbook's topics on demand: one module's docs, the settings of one
// plugin, the widgets, the actions, a sample; and the SDK's items by name
// or words, each with its signature and documentation.

import { z } from "zod";

import type { WorkshopTool } from "./tool";

export const lookupDocs: WorkshopTool<{ topic: string }> = {
  name: "lookup_docs",
  description:
    "Look up a topic of PaperPaw's documentation for this release: a section of the plugin docs (e.g. 'docs/widgets', 'docs/presets-and-home-screen-layouts'), the settings of a plugin ('settings/home', 'settings/reader', 'settings/widgets') or of a group ('settings-group/core.group.look'), 'widgets', 'actions', 'keymap/default', 'devices', a sample ('samples/theme-paw'), a module of the SDK ('sdk/ui'). Or the SDK's functions, types and methods by name or words ('draw_button', 'Canvas::fill', 'button', 'canvas text'): the answer gives each one's exact signature and documentation, and the closest topics.",
  schema: z.object({ topic: z.string().describe("A topic id or a few words") }).strict(),
  async run({ topic }, { handbook }) {
    const { topic: found, candidates } = handbook.find(topic);
    if (found) {
      return { content: await handbook.read(found), step: { key: "step.lookup_docs", vars: { topic: found.title } } };
    }
    const items = await handbook.items(topic);
    const list = candidates.map((t) => `- ${t.id}: ${t.title} (${t.tokens} tokens)`).join("\n");
    const parts = [];
    if (items.length) {
      parts.push(
        `The SDK's items for "${topic}" (paths in paperpaw_sdk):\n\n` +
          items.map((i) => `${i.signature}${i.doc ? `\n${i.doc.replace(/^/gm, "    ")}` : ""}`).join("\n\n"),
      );
    }
    if (candidates.length) parts.push(`${items.length ? "Topics" : `No topic is called "${topic}". The closest`}:\n${list}`);
    return {
      content: parts.length
        ? parts.join("\n\n")
        : `Nothing matches "${topic}". Topics start with docs/, settings/, settings-group/, samples/, sdk/, or are widgets, actions, keymap/default, devices; the SDK's items are found by name or words.`,
      step: { key: "step.lookup_docs", vars: { topic } },
    };
  },
};
