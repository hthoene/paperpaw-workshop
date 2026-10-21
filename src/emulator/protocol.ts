// The messages between the workshop and the emulator frame (design 4.4).
// The frame is PaperPaw's web shell (`shells/web`) once it lands; until
// then a stub (frame/stub.ts) answers the same messages. Every request
// carries an `id`; the frame answers each with the same `id`.

import type { Finding } from "../checks/data";
import type { Profile, Registry } from "../handbook/handbook";

/** A data plugin's files, by path. */
export interface PluginFiles {
  id: string;
  files: Record<string, Uint8Array>;
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
      /** For the stub's checks; the real shell knows its own. */
      registry: Registry;
    }
  | { type: "files"; plugin: PluginFiles }
  | { type: "input"; event: InputEvent }
  | { type: "screenshot"; profile?: Profile; dark?: boolean; screen?: string }
  | { type: "check" };

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

export interface ScreenshotResult {
  /** A PNG, base64 without the `data:` prefix. */
  png: string;
  width: number;
  height: number;
}

export type CheckResult = Finding[];
