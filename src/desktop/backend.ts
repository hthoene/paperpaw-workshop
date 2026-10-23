// What the window asks of the app's Rust side (src-tauri): the key in the
// keychain and the emulated reader. In a plain browser (for looking at the
// window while working on it, and in tests) a stand-in answers instead.

import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

import type { FolderApi } from "./folders";
import type { PictureApi } from "./pictures";

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

export interface Backend extends FolderApi, PictureApi {
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
  projectsList: () => invoke("projects_list"),
  projectCreate: (name, meta) => invoke("project_create", { name, meta }),
  projectFiles: (project) => invoke("project_files", { project }),
  projectRead: (project, path) => invoke("project_read", { project, path }),
  projectWrite: (project, path, base64) => invoke("project_write", { project, path, base64 }),
  projectRemove: (project, path) => invoke("project_remove", { project, path }),
  projectLoad: (project) => invoke("project_load", { project }),
  projectSave: (project, meta, conversation) => invoke("project_save", { project, meta, conversation }),
  uploadsList: (project) => invoke("uploads_list", { project }),
  uploadRead: (project, name) => invoke("upload_read", { project, name }),
  uploadWrite: (project, name, base64) => invoke("upload_write", { project, name, base64 }),
  uploadRemove: (project, name) => invoke("upload_remove", { project, name }),
  pictureMake: (base64, mode, maxWidth, maxHeight) => invoke("picture_make", { base64, mode, maxWidth, maxHeight }),
  pictureInfo: (base64) => invoke("picture_info", { base64 }),
};

/** The stand-in for a plain browser: the key in memory, a still picture
 *  of a reader. Nothing leaves the page. */
export function standInBackend(): Backend {
  let key: string | null = null;
  const folders = new Map<string, { meta: string; conversation: string; files: Map<string, string>; uploads: Map<string, string> }>();
  const at = (project: string) => {
    const found = folders.get(project);
    if (!found) throw new Error(`no project ${project}`);
    return found;
  };
  const sizes = (files: Map<string, string>) => [...files].map(([path, b]) => ({ path, size: Math.floor((b.length * 3) / 4) }));
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
    projectsList: async () => [...folders].map(([folder, f]) => ({ folder, meta: f.meta })),
    projectCreate: async (name, meta) => {
      let folder = name || "New plugin";
      for (let n = 2; folders.has(folder); n++) folder = `${name} ${n}`;
      folders.set(folder, { meta, conversation: "", files: new Map(), uploads: new Map() });
      return folder;
    },
    projectFiles: async (project) => sizes(at(project).files),
    projectRead: async (project, path) => at(project).files.get(path) ?? "",
    projectWrite: async (project, path, base64) => { at(project).files.set(path, base64); },
    projectRemove: async (project, path) => { at(project).files.delete(path); },
    projectLoad: async (project) => [at(project).meta, at(project).conversation],
    projectSave: async (project, meta, conversation) => { Object.assign(at(project), { meta, conversation }); },
    uploadsList: async (project) => sizes(at(project).uploads),
    uploadRead: async (project, name) => {
      const found = at(project).uploads.get(name);
      if (found === undefined) throw new Error(`no file ${name}`);
      return found;
    },
    uploadWrite: async (project, name, base64) => { at(project).uploads.set(name, base64); },
    uploadRemove: async (project, name) => { at(project).uploads.delete(name); },
    // No pictures made in a plain browser: they stay as they are.
    pictureMake: async (base64) => [base64, 0, 0],
    pictureInfo: async (base64) => ({ width: 0, height: 0, bytes: Math.floor((base64.length * 3) / 4), colour: false }),
  };
}
