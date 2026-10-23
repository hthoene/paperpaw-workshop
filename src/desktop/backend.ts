// What the window asks of the app's Rust side (src-tauri): the key in the
// keychain and the emulated reader. In a plain browser (for looking at the
// window while working on it, and in tests) a stand-in answers instead.

import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { open, save } from "@tauri-apps/plugin-dialog";

import type { BuildResult } from "../build/client";
import type { CheckApi } from "./checks";
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

export interface Backend extends FolderApi, PictureApi, CheckApi {
  keyGet(): Promise<string | null>;
  keySet(key: string): Promise<void>;
  keyClear(): Promise<void>;
  emulatorStart(profile: string): Promise<void>;
  emulatorButton(name: string, pressed: boolean): Promise<void>;
  emulatorPointer(phase: Phase, x: number, y: number): Promise<void>;
  /** Calls `seen` with each new frame; returns how to stop. */
  onFrame(seen: (frame: Frame) => void): Promise<() => void>;
  onError(said: (message: string) => void): Promise<() => void>;
  /** The project's plugin put on the reader shown, which starts again. */
  emulatorSync(project: string): Promise<void>;
  /** What the screen shows, part by part. */
  emulatorDescribe(): Promise<{ parts: Part[] }>;
  /** The panel as a PNG in base64. */
  emulatorShot(): Promise<string>;
  emulatorOpen(screen: string, params?: Record<string, string>): Promise<void>;
  emulatorRun(action: string): Promise<void>;
  /** The plugins' warnings and requests since asked last. */
  emulatorTold(): Promise<[string[], string[]]>;
  /** Which PaperPaw answers, once it said so. */
  emulatorReady(): Promise<Ready | null>;
  /** The project's plugin to a reader over Wi-Fi, at the transfer address
   *  it shows; the plugin's id. */
  sendWifi(project: string, address: string): Promise<string>;
  /** The project's plugin onto a reader's card at `card`; where it went. */
  sendCard(project: string, card: string): Promise<string>;
  /** Where to save a file, asked of the person; null if they did not say. */
  askSave(name: string): Promise<string | null>;
  /** A folder (a reader's card), asked of the person. */
  askFolder(): Promise<string | null>;
  saveFile(path: string, base64: string): Promise<void>;
  /** Builds the project's plugin with code for the reader beside the
   *  conversation (Rust set up first, the first time). */
  codeBuild(project: string): Promise<BuildResult>;
  /** Calls `told` with what a build is doing, in the person's words. */
  onBuildProgress(told: (text: string) => void): Promise<() => void>;
  /** Microsoft's C++ build tools through winget (Windows). */
  buildToolsInstall(): Promise<void>;
}

/** A part of the screen, as PaperPaw describes it. */
export interface Part {
  role: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  focused?: boolean;
  on?: boolean;
}

/** Who answers: PaperPaw's version, and what code plugins are built for. */
export interface Ready {
  protocol: number;
  paperpaw: string;
  profiles: string[];
  fingerprint: string;
  toolchain: string;
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
  emulatorSync: (project) => invoke("emulator_sync", { project }),
  emulatorDescribe: () => invoke("emulator_describe"),
  emulatorShot: () => invoke("emulator_shot"),
  emulatorOpen: (screen, params) => invoke("emulator_open", { screen, params }),
  emulatorRun: (action) => invoke("emulator_run", { action }),
  emulatorTold: () => invoke("emulator_told"),
  emulatorReady: () => invoke("emulator_ready"),
  sendWifi: (project, address) => invoke("send_wifi", { project, address }),
  sendCard: (project, card) => invoke("send_card", { project, card }),
  askSave: (name) => save({ defaultPath: name, filters: [{ name: "Plugin", extensions: ["zip"] }] }),
  askFolder: async () => {
    const chosen = await open({ directory: true, title: "The reader's card" });
    return typeof chosen === "string" ? chosen : null;
  },
  saveFile: (path, base64) => invoke("save_file", { path, base64 }),
  codeBuild: (project) => invoke("code_build", { project }),
  onBuildProgress: async (told) => listen<string>("build-progress", (event) => told(event.payload)),
  buildToolsInstall: () => invoke("build_tools_install"),
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
  projectRename: (project, name) => invoke("project_rename", { project, name }),
  projectArchive: (project) => invoke("project_archive", { project }),
  projectRestore: (name) => invoke("project_restore", { name }),
  projectsArchived: () => invoke("projects_archived"),
  projectTrash: (project, archived) => invoke("project_trash", { project, archived }),
  pictureMake: (base64, mode, maxWidth, maxHeight, shape) => invoke("picture_make", { base64, mode, maxWidth, maxHeight, shape: shape ?? null }),
  pictureInfo: (base64) => invoke("picture_info", { base64 }),
  pluginCheck: (project) => invoke("plugin_check", { project }),
};

/** The stand-in for a plain browser: the key in memory, a still picture
 *  of a reader. Nothing leaves the page. */
export function standInBackend(): Backend {
  let key: string | null = null;
  const folders = new Map<string, { meta: string; conversation: string; files: Map<string, string>; uploads: Map<string, string> }>();
  const archive = new Map<string, { meta: string; conversation: string; files: Map<string, string>; uploads: Map<string, string> }>();
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
    emulatorSync: async () => {},
    emulatorDescribe: async () => ({ parts: [] }),
    emulatorShot: async () => "",
    emulatorOpen: async () => {},
    emulatorRun: async () => {},
    emulatorTold: async () => [[], []],
    emulatorReady: async () => null,
    sendWifi: async () => { throw new Error("Sending to a reader needs the app."); },
    sendCard: async () => { throw new Error("Sending to a reader needs the app."); },
    askSave: async () => null,
    askFolder: async () => null,
    saveFile: async () => {},
    codeBuild: async () => {
      throw new Error("Plugins with code are built in the app.");
    },
    onBuildProgress: async () => () => {},
    buildToolsInstall: async () => {},
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
    projectRename: async (project, name) => {
      let to = name || "New plugin";
      for (let n = 2; folders.has(to); n++) to = `${name} ${n}`;
      folders.set(to, at(project));
      folders.delete(project);
      return to;
    },
    projectArchive: async (project) => {
      archive.set(project, at(project));
      folders.delete(project);
      return project;
    },
    projectRestore: async (name) => {
      const found = archive.get(name);
      if (!found) throw new Error(`no project ${name}`);
      folders.set(name, found);
      archive.delete(name);
      return name;
    },
    projectsArchived: async () => [...archive].map(([folder, f]) => ({ folder, meta: f.meta })),
    projectTrash: async (project, archived) => { (archived ? archive : folders).delete(project); },
    // No pictures made in a plain browser: they stay as they are.
    pictureMake: async (base64) => [base64, 0, 0],
    pictureInfo: async (base64) => ({ width: 0, height: 0, bytes: Math.floor((base64.length * 3) / 4), colour: false }),
    // No checks in a plain browser: nothing found.
    pluginCheck: async () => [],
  };
}
