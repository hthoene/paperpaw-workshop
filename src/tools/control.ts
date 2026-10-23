// The reader driven directly, as PaperPaw's remote control does (its
// docs/web-emulator.md): what the screen shows part by part, a screen, a
// slot or an action opened at once, an event sent, a setting set, waiting
// until a screen shows. And the recorded answers a plugin's requests get
// in the workshop, where nothing goes to the internet.

import { z } from "zod";

import type { Fixture, SeenRequest } from "../emulator/protocol";
import { deviceNamed, shortName, type ToolContext, type WorkshopTool } from "./tool";

/** Text as the remote's lines carry it: hexadecimal, `-` for none. */
export function hex(text: string): string {
  const bytes = new TextEncoder().encode(text);
  return bytes.length ? Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("") : "-";
}

/** Parameters as the remote's lines carry them: `key=hex` words. */
function pairs(params: Record<string, string> | undefined): string[] {
  return Object.entries(params ?? {}).map(([key, value]) => `${key}=${hex(value)}`);
}

/** An id as the remote takes it: no spaces, nothing to escape. */
const ID = z.string().regex(/^[A-Za-z0-9._:/-]{1,120}$/);

/** What the screen shows, part by part, in a few lines. */
export function described(answer: Record<string, unknown>): string {
  const parts = Array.isArray(answer.parts) ? (answer.parts as Record<string, unknown>[]) : [];
  const lines = parts.slice(0, 60).map((p) => {
    const state = typeof p.state === "string" && p.state !== "-" ? ` [${p.state}]` : "";
    const label = typeof p.label === "string" && p.label ? ` "${p.label}"` : "";
    return `- ${p.role}${label} at ${p.x},${p.y} ${p.width}x${p.height}${state}`;
  });
  const more = parts.length > 60 ? `\n(and ${parts.length - 60} parts more)` : "";
  return `Screen ${String(answer.screen ?? "?")}: ${parts.length} parts.${lines.length ? "\n" + lines.join("\n") : ""}${more}`;
}

/** The requests the plugin made since the AI last heard, in lines; "" if
 *  none. */
export async function requestsSince(context: ToolContext): Promise<string> {
  const seen = await context.emulator.requests().catch(() => [] as SeenRequest[]);
  if (!seen.length) return "";
  const said = seen.slice(-20).map((r) => {
    const how =
      r.source === "fixture" ? `answered by a recorded answer, ${r.status}` : r.source === "fetch" ? "fetched from the internet" : "no recorded answer: failed as without a network";
    return `- ${r.method} ${r.url}: ${how}`;
  });
  const more = seen.length > 20 ? ` (the last 20 of ${seen.length})` : "";
  return `\nThe plugin's requests since${more}:\n${said.join("\n")}`;
}

/** How often a wait for a change looks at the screen. */
const CHANGE_MS = 400;

/** Waits until what the screen shows differs from what it showed at
 *  first, at most `timeout` ms: whether it did, and what it shows then. */
async function changes(context: ToolContext, timeout: number): Promise<[boolean, string]> {
  const first = described(await context.emulator.command("describe"));
  const end = Date.now() + timeout;
  for (;;) {
    await new Promise((r) => setTimeout(r, Math.min(CHANGE_MS, Math.max(0, end - Date.now()))));
    const now = described(await context.emulator.command("describe"));
    if (now !== first) return [true, now];
    if (Date.now() >= end) return [false, now];
  }
}

type Do = "describe" | "screens" | "show" | "slot" | "run" | "emit" | "set" | "setting" | "actions" | "wait" | "widget";

export const control: WorkshopTool<{
  do: Do;
  id?: string;
  params?: Record<string, string>;
  value?: string;
  timeout_ms?: number;
  device?: string;
}> = {
  name: "control",
  description: [
    "Drive the reader the person sees directly, instead of pressing through menus, and read what it shows. `do`:",
    "describe (what the screen shows, part by part: role, label, place, state: read this instead of guessing from a picture),",
    "screens (the screens open, the one shown last),",
    "show (open the screen `id`, e.g. your plugin's own, with `params`),",
    "widget (show the widget `id`, e.g. your plugin's own, alone on the first page of the home screen, as a person who placed it there sees it: the reader starts again so),",
    "slot (open a slot: `id` core.settings, core.home, core.library ..., `params` e.g. {id: reader}),",
    "run (run the action `id`, as a button bound to it would),",
    "emit (send the event `id` with `params`, as a plugin would),",
    "set (set the setting `id` to `value`, as configuration files write it: on, 14),",
    "setting (read the setting `id`),",
    "actions (the action ids there are, starting with `id` if given),",
    "wait (until the screen is `id` or shows it in a label; without `id`, until what the screen shows changes, e.g. a reply from the network arrives or something loads: at most `timeout_ms`, 10000 unless said).",
    "After show, widget, slot, run, emit and set it answers what the screen shows then, and the requests the plugin made since and how each was answered.",
  ].join(" "),
  schema: z
    .object({
      do: z.enum(["describe", "screens", "show", "slot", "run", "emit", "set", "setting", "actions", "wait", "widget"]),
      id: z.string().max(200).optional().describe("The screen, slot, action, event or setting; for wait the screen id or a text it shows, or none to wait for a change"),
      params: z.record(z.string(), z.string().max(2000)).optional(),
      value: z.string().max(2000).optional(),
      timeout_ms: z.number().int().min(0).max(30_000).optional(),
      device: z.string().optional().describe('"X4", "X4 Pro" or "Boox Go 7": that device is shown first'),
    })
    .strict(),
  async run(input, context) {
    await context.sync();
    const profile = input.device ? deviceNamed(context, input.device) : context.reader.shown();
    if (profile.id !== context.reader.shown().id) await context.reader.show(profile);
    const step = { key: "step.control", vars: { what: input.do, device: shortName(profile) } };
    const fail = (content: string) => ({ content, isError: true, step });
    const needsId = !["describe", "screens", "actions", "wait"].includes(input.do);
    if (needsId && !input.id) return fail(`"${input.do}" needs an id.`);
    if (input.id && input.do !== "wait" && !ID.safeParse(input.id).success) return fail(`"${input.id}" is no id.`);
    if (input.do === "set" && input.value === undefined) return fail(`"set" needs a value.`);
    try {
      if (input.do === "wait" && !input.id) {
        const [changed, now] = await changes(context, input.timeout_ms ?? 10_000);
        const said = changed ? "The screen changed." : `Nothing changed within ${input.timeout_ms ?? 10_000} ms.`;
        return { content: `${said}
${now}${await requestsSince(context)}`, step };
      }
      if (input.do === "wait") {
        await context.emulator.until(input.id!, input.timeout_ms ?? 10_000);
        const now = described(await context.emulator.command("describe"));
        return { content: `Shown: ${input.id}.\n${now}${await requestsSince(context)}`, step };
      }
      const line = {
        describe: ["describe"],
        screens: ["screens"],
        show: ["show", input.id!, ...pairs(input.params)],
        slot: ["slot", input.id!, ...pairs(input.params)],
        run: ["run", input.id!],
        emit: ["emit", input.id!, ...pairs(input.params)],
        set: ["set", input.id!, hex(input.value ?? "")],
        setting: ["setting", input.id!],
        actions: input.id ? ["actions", input.id] : ["actions"],
        widget: ["widget", input.id!],
      }[input.do].join(" ");
      const answer = await context.emulator.command(line);
      let content: string;
      if (input.do === "describe") content = described(answer);
      else if (["show", "slot", "run", "emit", "set", "widget"].includes(input.do)) {
        content = `Done on the ${profile.name}. Now:\n${described(await context.emulator.command("describe"))}`;
      } else content = JSON.stringify(answer);
      return { content: content + (await requestsSince(context)), step };
    } catch (e) {
      return fail(`${input.do} ${input.id ?? ""}: ${e instanceof Error ? e.message : String(e)}`.trim());
    }
  },
};

/** The most recorded answers, and the most bytes of their bodies. */
export const MAX_FIXTURES = 50;
export const MAX_FIXTURE_BYTES = 512 * 1024;

const FIXTURE = z
  .object({
    method: z.string().regex(/^[A-Z]{1,10}$/).optional(),
    url: z.string().min(1).max(2000).describe("The address, `*` for any text: https://api.example.com/v1/*"),
    status: z.number().int().min(100).max(599).optional(),
    headers: z.record(z.string(), z.string().max(1000)).optional(),
    body: z.unknown().optional().describe("Text, or a JSON value sent as JSON"),
    delay: z.number().int().min(0).max(30_000).optional(),
  })
  .strict();

export const setFixtures: WorkshopTool<{ fixtures: Fixture[] }> = {
  name: "set_fixtures",
  description:
    "Recorded answers for the plugin's network requests in the workshop, in place of those before: nothing goes to the internet here, a request gets the first answer whose method (any if none) and url (`*` for any text) match, or fails as without a network. Write realistic answers for every address the plugin asks (and one failing, status 500, to try that too); they stay with the project, not with the plugin. The reader uses them at once; look, press and control then say which requests the plugin made and how they were answered.",
  schema: z.object({ fixtures: z.array(FIXTURE).max(MAX_FIXTURES) }).strict(),
  async run({ fixtures }, context) {
    const step = { key: "step.set_fixtures", vars: { n: String(fixtures.length) } };
    const bytes = fixtures.reduce((n, f) => n + (typeof f.body === "string" ? f.body.length : JSON.stringify(f.body ?? "").length), 0);
    if (bytes > MAX_FIXTURE_BYTES) {
      return { content: `Not kept: their bodies hold ${bytes} bytes, at most ${MAX_FIXTURE_BYTES}.`, isError: true, step };
    }
    if (!context.network) return { content: "This workshop keeps no recorded answers.", isError: true, step };
    try {
      await context.network.set(fixtures);
    } catch (e) {
      return { content: `Not used: ${e instanceof Error ? e.message : String(e)}`, isError: true, step };
    }
    const real = context.network.real() ? " On this computer requests no recorded answer answers go to the internet." : "";
    return { content: `${fixtures.length} recorded answers; the reader answers the plugin's requests with them from now on.${real}`, step };
  },
};
