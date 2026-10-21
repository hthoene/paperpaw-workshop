// The messages between the workshop and the emulator frame.
// The frame is PaperPaw's web shell (`shells/web`) once it lands; until
// then a stub (frame/stub.ts) answers the same messages. Every request
// carries an `id`; the frame answers each with the same `id`.

import type { Finding } from "../checks/data";
import type { Profile, Registry } from "../handbook/handbook";

/** The screens the workshop asks for: the home screen, and what the
 *  reader shows while it sleeps. */
export type Screen = "home" | "sleep";

/** Whether PaperPaw draws a sleep screen of its own on a device: on
 *  readers with a power button (Android readers sleep by themselves). */
export function canSleep(profile: { buttons: string[] }): boolean {
  return profile.buttons.includes("power");
}

/** A data plugin's files, by path. */
export interface PluginFiles {
  id: string;
  files: Record<string, Uint8Array>;
}

/** A recorded answer for a plugin's requests (PaperPaw's
 *  docs/web-emulator.md): `url` a pattern where `*` stands for any text,
 *  `method` any where none is named, `status` 200 unless said, `body`
 *  text or a JSON value, `delay` in ms of the device's time. */
export interface Fixture {
  method?: string;
  url: string;
  status?: number;
  headers?: Record<string, string>;
  body?: unknown;
  delay?: number;
}

/** Whether a request no recorded answer answers fails as without a
 *  network (`fixtures`), or the frame fetches it (`real`: only on one's
 *  own computer, never on paperpaw.org). */
export type NetworkMode = "fixtures" | "real";

/** A request a plugin made, as the reader reports it: answered by a
 *  recorded answer (`fixture`, with its status), by none (`none`, failed
 *  as without a network) or fetched (`fetch`). */
export interface SeenRequest {
  id: number;
  method: string;
  url: string;
  source: "fixture" | "none" | "fetch";
  status: number | null;
}

/** What a person or the AI does on the reader. */
export type InputEvent =
  | { kind: "button"; name: string; long?: boolean }
  | { kind: "tap"; x: number; y: number };

export type Request =
  | {
      type: "start";
      profile: Profile;
      dark: boolean;
      plugins: PluginFiles[];
      /** The screen to show: `home` (the default) or `sleep`. */
      screen?: Screen;
      /** For the stub's checks; the real shell knows its own. */
      registry: Registry;
    }
  | { type: "files"; plugin: PluginFiles }
  | { type: "input"; event: InputEvent }
  | { type: "screenshot"; profile?: Profile; dark?: boolean; screen?: Screen }
  /** paperpaw-dev's checks: of the data plugin on the card, and of the
   *  plugins with code (ids) the module runs. */
  | { type: "check"; plugins?: string[] }
  /** Another module for the reader: PaperPaw with a plugin with code
   *  compiled in (a build's), or `null` for PaperPaw as it is. */
  | { type: "module"; url: string | null }
  /** The remote control's command on the reader shown, a line as PaperPaw's
   *  x4-remote sends it (`describe`, `show <screen> key=<hex>` ...); the
   *  answer is the command's JSON. */
  | { type: "command"; line: string }
  /** Waits until the screen is `text` (its id) or shows it, the device
   *  running meanwhile, at most `timeout` ms. */
  | { type: "until"; text: string; timeout?: number }
  /** The recorded answers for plugins' requests, and the network's mode,
   *  for this device and every one started after. */
  | { type: "network"; fixtures: Fixture[]; mode: NetworkMode }
  /** The requests plugins made since asked last (`SeenRequest[]`). */
  | { type: "requests" };

export type Answer =
  | { id: number; ok: true; result?: unknown }
  | { id: number; ok: false; error: string };

/** Sent by the workshop until the frame answers with `Ready`: either may
 *  load first. */
export interface Hello {
  type: "hello";
}

/** Sent by the frame when it can take requests, and to every `Hello`. */
export interface Ready {
  type: "ready";
  /** True for the stub, false for PaperPaw's web shell. */
  stub: boolean;
  version: string;
}

/** Sent by the frame when its watchdog stopped PaperPaw while nothing was
 *  asked of it (a plugin's code that never returned, in a timer): the
 *  reader was started again on its home screen. */
export interface Stopped {
  type: "stopped";
  why: string;
}

export interface ScreenshotResult {
  /** A PNG, base64 without the `data:` prefix. */
  png: string;
  width: number;
  height: number;
}

export type CheckResult = Finding[];
