// What the AI sees of the reader: the checker's findings, a screen, the
// screen after pressing buttons. The stub is said to be one in every
// answer, so the model weighs its pictures accordingly.

import { z } from "zod";

import { deviceNamed, shortName, type ToolContext, type WorkshopTool } from "./tool";

const DEVICE = z.string().describe('"X4", "X4 Pro" or "Boox Go 7"');

const STUB_NOTE =
  "(This picture is the workshop's preview, not PaperPaw's real emulator yet: it shows the look settings and home layouts roughly. Trust the checker for ids and values.)";

export const check: WorkshopTool<Record<string, never>> = {
  name: "check",
  description:
    "Check the plugin as the store and PaperPaw would: its folder, the ini files, every setting, widget and action against this PaperPaw, values in range. Returns the findings, errors first. Run it after writing files.",
  schema: z.object({}).strict(),
  async run(_input, context) {
    await context.sync();
    const findings = await context.emulator.check();
    const order = { error: 0, warning: 1, info: 2 } as const;
    findings.sort((a, b) => order[a.level] - order[b.level]);
    const lines = findings.map((f) => `${f.level}: [${f.check}] ${f.place}: ${f.message}`);
    const errors = findings.filter((f) => f.level === "error").length;
    const warnings = findings.filter((f) => f.level === "warning").length;
    return {
      content: `${errors} errors, ${warnings} warnings.\n${lines.join("\n")}`,
      step: { key: "step.check" },
    };
  },
};

async function screen(context: ToolContext, device: string | undefined, dark: boolean | undefined) {
  const profile = deviceNamed(context, device);
  const shot = await context.emulator.screenshot(profile, dark);
  return { profile, shot };
}

export const look: WorkshopTool<{ device?: string; dark?: boolean }> = {
  name: "look",
  description:
    "See the reader's screen with the plugin, as a picture: the home screen of a device, light or dark (night mode). Use it to judge the result as a careful designer would.",
  schema: z.object({ device: DEVICE.optional(), dark: z.boolean().optional() }).strict(),
  async run({ device, dark }, context) {
    await context.sync();
    const { profile, shot } = await screen(context, device, dark);
    const note = context.emulator.stub ? ` ${STUB_NOTE}` : "";
    return {
      content: [
        { type: "image", source: { type: "base64", media_type: "image/png", data: shot.png } },
        { type: "text", text: `${profile.name}, ${shot.width} x ${shot.height}${dark ? ", night mode" : ""}.${note}` },
      ],
      step: { key: "step.look", vars: { device: shortName(profile) } },
    };
  },
};

export const press: WorkshopTool<{ device?: string; buttons: string[] }> = {
  name: "press",
  description:
    "Press the reader's buttons in order (up, down, left, right, confirm, back, page-forward, page-back), then see the screen. For checking how the focus moves.",
  schema: z
    .object({
      device: DEVICE.optional(),
      buttons: z.array(z.enum(["up", "down", "left", "right", "confirm", "back", "page-forward", "page-back"])).min(1).max(20),
    })
    .strict(),
  async run({ device, buttons }, context) {
    await context.sync();
    for (const name of buttons) await context.emulator.input({ kind: "button", name });
    const { profile, shot } = await screen(context, device, undefined);
    return {
      content: [
        { type: "image", source: { type: "base64", media_type: "image/png", data: shot.png } },
        { type: "text", text: `${profile.name} after ${buttons.join(", ")}.` },
      ],
      step: { key: "step.press", vars: { device: shortName(profile) } },
    };
  },
};
