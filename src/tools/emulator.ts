// What the AI sees of the reader: the checker's findings, a screen, the
// screen after pressing buttons. The stub is said to be one in every
// answer, so the model weighs its pictures accordingly.

import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

import { AI_LONG_SIDE } from "../pictures/kit";
import { deviceNamed, shortName, type ToolContext, type WorkshopTool } from "./tool";

const DEVICE = z.string().describe('"X4", "X4 Pro" or "Boox Go 7"');

const STUB_NOTE =
  "(This picture is the workshop's preview, not PaperPaw's real emulator yet: it shows the look settings and home layouts roughly. Trust the checker for ids and values.)";

export const check: WorkshopTool<Record<string, never>> = {
  name: "check",
  description:
    "Check the plugin as the store and PaperPaw would: its folder, the ini files, every setting, widget and action against this PaperPaw, values in range; a plugin with code once built, on the reader: its texts, its screens drawn, reach by buttons and touch, frame times and memory. Returns the findings, errors first. Run it after writing files, or after a build.",
  schema: z.object({}).strict(),
  async run(_input, context) {
    await context.sync();
    const code = context.codePlugin?.();
    const findings = await context.emulator.check(code ? [code] : undefined);
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

async function screen(context: ToolContext, device: string | undefined, dark: boolean | undefined, which?: "home" | "sleep") {
  const profile = deviceNamed(context, device);
  const shot = await context.emulator.screenshot(profile, dark, which);
  return { profile, shot };
}

/** What happened to PaperPaw since the AI last looked, if it was stopped
 *  with nothing asked (a timer of the plugin's that never returned). */
function since(context: ToolContext): string {
  const why = context.emulator.takeStopped();
  return why ? ` Meanwhile: ${why} So the screen is the home screen now; look for the plugin's timer that does not return.` : "";
}

/** A screenshot as the AI sees it: no side longer than AI_LONG_SIDE (the
 *  Boox's screen is), as every picture it is sent. Anthropic would reduce
 *  it anyway; the free quota's proxy takes none larger. */
async function seen(context: ToolContext, shot: { png: string; width: number; height: number }): Promise<Anthropic.ImageBlockParam> {
  if (Math.max(shot.width, shot.height) <= AI_LONG_SIDE) {
    return { type: "image", source: { type: "base64", media_type: "image/png", data: shot.png } };
  }
  const bytes = Uint8Array.from(atob(shot.png), (c) => c.charCodeAt(0));
  const small = await context.pictures.forAi(bytes, "image/png");
  return { type: "image", source: { type: "base64", media_type: small.mediaType, data: small.data } };
}

export const look: WorkshopTool<{ device?: string; dark?: boolean; screen?: "home" | "sleep" }> = {
  name: "look",
  description:
    "See the reader's screen with the plugin, as a picture: the home screen of a device, or what it shows asleep (screen: sleep, with its sleep picture or logo), light or dark (night mode). Use it to judge the result as a careful designer would.",
  schema: z.object({ device: DEVICE.optional(), dark: z.boolean().optional(), screen: z.enum(["home", "sleep"]).optional() }).strict(),
  async run({ device, dark, screen: which }, context) {
    await context.sync();
    const { profile, shot } = await screen(context, device, dark, which);
    const note = context.emulator.stub ? ` ${STUB_NOTE}` : "";
    return {
      content: [
        await seen(context, shot),
        { type: "text", text: `${profile.name}, ${shot.width} x ${shot.height}${dark ? ", night mode" : ""}.${note}${since(context)}` },
      ],
      step: { key: "step.look", vars: { device: shortName(profile) } },
    };
  },
};

export const press: WorkshopTool<{ device?: string; buttons: string[] }> = {
  name: "press",
  description:
    'Press buttons of the reader the person sees, in order, as on the device, then see its screen. Each device has its own: the X4 back, confirm (OK, "Select"), left, right, page-back, page-forward, power; the X4 Pro page-back, page-forward, home, power (and a touch screen); the Boox Go 7 page-back, page-forward, back. Add ":long" for a long press ("confirm:long"). Naming another device shows that one first.',
  schema: z
    .object({
      device: DEVICE.optional(),
      buttons: z
        .array(z.string().regex(/^[a-z-]+(:long)?$/))
        .min(1)
        .max(20),
    })
    .strict(),
  async run({ device, buttons }, context) {
    await context.sync();
    const profile = device ? deviceNamed(context, device) : context.reader.shown();
    const wrong = buttons.map((b) => b.replace(/:long$/, "")).filter((b) => !profile.buttons.includes(b));
    if (wrong.length) {
      return {
        content: `The ${profile.name} has no ${wrong.join(", ")}: its buttons are ${profile.buttons.join(", ")}.`,
        isError: true,
        step: { key: "step.press", vars: { device: shortName(profile) } },
      };
    }
    if (profile.id !== context.reader.shown().id) await context.reader.show(profile);
    for (const b of buttons) await context.emulator.input({ kind: "button", name: b.replace(/:long$/, ""), long: b.endsWith(":long") });
    const shot = await context.emulator.screenshot(profile, undefined);
    return {
      content: [
        await seen(context, shot),
        { type: "text", text: `${profile.name} after ${buttons.join(", ")}.${since(context)}` },
      ],
      step: { key: "step.press", vars: { device: shortName(profile) } },
    };
  },
};
