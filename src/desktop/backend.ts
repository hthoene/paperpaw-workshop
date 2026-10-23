// What the window asks of the app's Rust side (src-tauri): the key in the
// keychain and the emulated reader. In a plain browser (for looking at the
// window while working on it, and in tests) a stand-in answers instead.

import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

/** A frame of the reader's panel, as the Rust side sends it. */
export interface Frame {
  profile: string;
  width: number;
  height: number;
  /** A PNG in base64. */
  png: string;
  buttons: string[];
  touch: boolean;
}

export type Phase = "down" | "move" | "up" | "cancel";

export interface Backend {
  keyGet(): Promise<string | null>;
  keySet(key: string): Promise<void>;
  keyClear(): Promise<void>;
  emulatorStart(profile: string): Promise<void>;
  emulatorButton(name: string, pressed: boolean): Promise<void>;
  emulatorPointer(phase: Phase, x: number, y: number): Promise<void>;
  /** Calls `seen` with each new frame; returns how to stop. */
  onFrame(seen: (frame: Frame) => void): Promise<() => void>;
  onError(said: (message: string) => void): Promise<() => void>;
}

/** Whether the page runs in the app (Tauri), not in a plain browser. */
export function inApp(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export const appBackend: Backend = {
  keyGet: () => invoke<string | null>("key_get"),
  keySet: (key) => invoke("key_set", { key }),
  keyClear: () => invoke("key_clear"),
  emulatorStart: (profile) => invoke("emulator_start", { profile }),
  emulatorButton: (name, pressed) => invoke("emulator_button", { name, pressed }),
  emulatorPointer: (phase, x, y) => invoke("emulator_pointer", { phase, x, y }),
  onFrame: async (seen) => listen<Frame>("emulator-frame", (event) => seen(event.payload)),
  onError: async (said) => listen<string>("emulator-error", (event) => said(event.payload)),
};

/** The stand-in for a plain browser: the key in memory, a still picture
 *  of a reader. Nothing leaves the page. */
export function standInBackend(): Backend {
  let key: string | null = null;
  const frames = new Set<(frame: Frame) => void>();
  return {
    keyGet: async () => key,
    keySet: async (value) => { key = value; },
    keyClear: async () => { key = null; },
    emulatorStart: async (profile) => {
      const picture = await fetch(new URL("art/x4-home.png", document.baseURI)).then((r) => r.blob());
      const png = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
        reader.readAsDataURL(picture);
      });
      const frame = { profile, width: 480, height: 800, png, buttons: ["back", "confirm", "left", "right", "page-back", "page-forward", "power"], touch: false };
      frames.forEach((seen) => seen(frame));
    },
    emulatorButton: async () => {},
    emulatorPointer: async () => {},
    onFrame: async (seen) => {
      frames.add(seen);
      return () => frames.delete(seen);
    },
    onError: async () => () => {},
  };
}
