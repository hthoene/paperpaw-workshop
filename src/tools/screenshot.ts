// The store's screenshots, taken by the AI: what a device shows now, kept
// in the plugin's store/ folder (src/publish/screenshots.ts), with the
// picture back to look at before it is kept for good.

import { z } from "zod";

import { MAX_ALT, MAX_SCREENSHOTS } from "../project/entry";
import { base64Bytes, keepShot, removeShot, storeShots } from "../publish/screenshots";
import { seen, STUB_NOTE } from "./emulator";
import { deviceNamed, shortName, type WorkshopTool } from "./tool";

export interface ScreenshotInput {
  device?: string;
  dark?: boolean;
  alt?: string;
  replace?: string;
  remove?: string;
}

const FILE = z.string().regex(/^[a-z0-9-]+\.(png|jpe?g|webp)$/);

export const screenshot: WorkshopTool<ScreenshotInput> = {
  name: "screenshot",
  description:
    `Keep what a device shows now as one of the store's screenshots (2 to ${MAX_SCREENSHOTS}; the store shows them in order, the first one first). Set the scene before (control, press): the plugin's best screen with realistic content. The picture comes back: look at it, and replace a weak one (replace: its file) or delete it (remove: its file, nothing else needed). alt: one sentence of what it shows. Another device starts at its home screen.`,
  schema: z
    .object({
      device: z.string().describe('"X4", "X4 Pro" or "Boox Go 7"; the one shown if none').optional(),
      dark: z.boolean().describe("night mode").optional(),
      alt: z.string().min(1).max(MAX_ALT).optional(),
      replace: FILE.optional(),
      remove: FILE.optional(),
    })
    .strict(),
  async run({ device, dark, alt, replace, remove }, context) {
    const { files } = context;
    const kept = () => {
      const shots = storeShots(files);
      return shots.length
        ? `The store's screenshots now (${shots.length} of ${MAX_SCREENSHOTS}): ${shots.map((s) => `${s.file}${s.alt ? ` (${s.alt})` : ""}`).join(", ")}.`
        : "The store has no screenshots now.";
    };
    if (remove) {
      const problem = removeShot(files, remove);
      await context.sync();
      return {
        content: problem ? `Not deleted: ${problem}. ${kept()}` : `Deleted ${remove}. ${kept()}`,
        isError: !!problem,
        step: { key: "step.screenshot.remove", vars: { file: remove } },
      };
    }
    const profile = device ? deviceNamed(context, device) : context.reader.shown();
    const step = { key: "step.screenshot", vars: { device: shortName(profile) } };
    if (!alt) return { content: "Say in alt what the screenshot shows, in one sentence.", isError: true, step };
    await context.sync();
    const shot = await context.emulator.screenshot(profile, dark);
    const done = keepShot(files, base64Bytes(shot.png), profile, !!dark, alt, replace);
    if (!done.ok) return { content: `Not kept: ${done.why}. ${kept()}`, isError: true, step };
    await context.sync();
    const note = context.emulator.stub ? ` ${STUB_NOTE}` : "";
    return {
      content: [
        await seen(context, shot),
        {
          type: "text",
          text: `Kept as ${done.file}: ${profile.name}${dark ? ", night mode" : ""}. Look at it: if it is not among the plugin's best, replace it.${note} ${kept()}`,
        },
      ],
      step,
    };
  },
};
