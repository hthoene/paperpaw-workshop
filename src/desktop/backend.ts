// What the window asks of the app's Rust side (src-tauri): the key in the
// keychain and the emulated reader. In a plain browser (for looking at the
// window while working on it, and in tests) a stand-in answers instead.

import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { open, save } from "@tauri-apps/plugin-dialog";
import { relaunch } from "@tauri-apps/plugin-process";
import { check } from "@tauri-apps/plugin-updater";

import type { BuildResult } from "../build/client";
import type { CheckApi } from "./checks";
import type { FolderApi } from "./folders";
import { memoryHistory, type History, type HistoryApi } from "./history";
import type { PictureApi } from "./pictures";

/** A plugin installed on a reader: its id, and whether its code runs
 *  only after the reader starts again. */
export interface Installed {
  id: string;
  restart: boolean;
}

/** A newer workshop, as its release says. */
export interface AppUpdate {
  version: string;
  notes: string | null;
}

/** A reader found on the USB cable, as it says what it is. */
export interface CableReader {
  port: string;
  device: string | null;
  name: string | null;
  version: string | null;
  fingerprint: string | null;
  /** Why it did not answer, where it did not. */
  problem: string | null;
}

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

/** What building for the readers needs (src-tauri's device.rs). */
export interface DeviceReadiness {
  x4: boolean;
  x4_mb: number;
  x4_pro: boolean;
  sign: boolean;
}

/** A build for the readers. */
export interface DeviceBuilt {
  state: "done" | "failed";
  problems: string[];
  diagnostics: { level: string; file?: string | null; rendered: string; message: string }[];
  log_tail: string;
  ppn: string | null;
  source: string | null;
  fingerprint: string | null;
  size: number;
}

/** The author key as the window knows it (src-tauri's author.rs). */
export interface AuthorStatus {
  public: string | null;
  fingerprint: string | null;
  /** When it was last backed up, in seconds since 1970. */
  backed_up: number | null;
}

export interface Backend extends FolderApi, PictureApi, CheckApi, HistoryApi {
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
  /** The project's plugin installed on a reader over Wi-Fi, at the
   *  transfer address it shows. */
  sendWifi(project: string, address: string): Promise<Installed>;
  /** A newer workshop, if its releases have one; null if not, or where
   *  it could not be asked (offline). */
  updateCheck(): Promise<AppUpdate | null>;
  /** Fetches and installs the newer workshop, then starts it again. */
  updateInstall(): Promise<void>;
  /** The readers on the USB cable. */
  usbReaders(): Promise<CableReader[]>;
  /** The project's plugin installed on the reader on the cable at `port`. */
  sendUsb(project: string, port: string): Promise<Installed>;
  /** How sending goes: `asking` while the reader asks on its screen,
   *  `sending n/m`, `installing`. */
  onSendProgress(told: (step: string) => void): Promise<() => void>;
  /** The project's plugin onto a reader's card at `card`; where it went. */
  sendCard(project: string, card: string): Promise<string>;
  /** Where to save a file, asked of the person; null if they did not say. */
  askSave(name: string): Promise<string | null>;
  /** A folder (a reader's card), asked of the person. */
  askFolder(): Promise<string | null>;
  saveFile(path: string, base64: string): Promise<void>;
  /** Keeps a package for the store's upload form in the project's
   *  `.workshop/publish/`; its path. */
  publishSave(project: string, name: string, base64: string): Promise<string>;
  /** Opens the store's upload form in the browser and shows the package
   *  in its folder. */
  publishShow(path: string): Promise<void>;
  /** What building a plugin with code for the readers needs, and has. */
  deviceReadiness(): Promise<DeviceReadiness>;
  /** Fetches the X4's part of Rust (about `x4_mb` MB). */
  deviceToolchainInstall(): Promise<void>;
  /** Builds the project's plugin with code for the X4, signed, with its
   *  source as a ZIP, into the project's `.workshop/publish/`. */
  deviceBuild(project: string, id: string, version: string): Promise<DeviceBuilt>;
  /** The author key that signs plugins with code: never its secret. */
  authorStatus(): Promise<AuthorStatus>;
  /** Makes the author key, if there is none yet. */
  authorCreate(): Promise<AuthorStatus>;
  /** Saves the key's backup file where the person chose. */
  authorBackup(path: string): Promise<AuthorStatus>;
  /** Takes the key from a backup file. */
  authorImport(path: string): Promise<AuthorStatus>;
  /** Where to save the key's backup, or which backup to take, asked of
   *  the person. */
  askSaveKey(): Promise<string | null>;
  askOpenKey(): Promise<string | null>;
  /** Builds the project's plugin with code for the reader beside the
   *  conversation (Rust set up first, the first time). */
  codeBuild(project: string): Promise<BuildResult>;
  /** Calls `told` with what a build is doing, in the person's words. */
  onBuildProgress(told: (text: string) => void): Promise<() => void>;
  /** Microsoft's C++ build tools through winget (Windows). */
  buildToolsInstall(): Promise<void>;
  /** Writes projects (none named: all, the archive's too) into one file
   *  at `path`; how many. */
  projectsExport(projects: string[], path: string): Promise<number>;
  /** Brings back the projects of an export at `path`, beside those there:
   *  their folders and whether archived; null if it is not an export. */
  projectsImport(path: string): Promise<[string, boolean][] | null>;
  /** A plugin's ZIP at `path`, in base64. */
  importRead(path: string): Promise<string>;
  /** Where to save an export, or which file to import, asked of the person. */
  askSaveExport(name: string): Promise<string | null>;
  askOpenImport(): Promise<string | null>;
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
  updateCheck: async () => {
    try {
      const found = await check();
      return found ? { version: found.version, notes: found.body ?? null } : null;
    } catch {
      // Offline, or the releases not reached: asked again next time.
      return null;
    }
  },
  updateInstall: async () => {
    const found = await check();
    if (!found) return;
    await found.downloadAndInstall();
    await relaunch();
  },
  usbReaders: () => invoke("usb_readers"),
  sendUsb: (project, port) => invoke("send_usb", { project, port }),
  onSendProgress: async (told) => listen<string>("send-progress", (event) => told(event.payload)),
  sendCard: (project, card) => invoke("send_card", { project, card }),
  askSave: (name) => save({ defaultPath: name, filters: [{ name: "Plugin", extensions: ["zip"] }] }),
  askFolder: async () => {
    const chosen = await open({ directory: true, title: "The reader's card" });
    return typeof chosen === "string" ? chosen : null;
  },
  saveFile: (path, base64) => invoke("save_file", { path, base64 }),
  publishSave: (project, name, base64) => invoke("publish_save", { project, name, base64 }),
  publishShow: (path) => invoke("publish_show", { path }),
  deviceReadiness: () => invoke("device_readiness"),
  deviceToolchainInstall: () => invoke("device_toolchain_install"),
  deviceBuild: (project, id, version) => invoke("device_build", { project, id, version }),
  authorStatus: () => invoke("author_status"),
  authorCreate: () => invoke("author_create"),
  authorBackup: (path) => invoke("author_backup", { path }),
  authorImport: (path) => invoke("author_import", { path }),
  askSaveKey: () => save({ title: "Save the backup of your author key", defaultPath: "paperpaw-author.key", filters: [{ name: "Author key", extensions: ["key"] }] }),
  askOpenKey: async () => {
    const chosen = await open({ title: "The backup of your author key", filters: [{ name: "Author key", extensions: ["key"] }] });
    return typeof chosen === "string" ? chosen : null;
  },
  codeBuild: (project) => invoke("code_build", { project }),
  onBuildProgress: async (told) => listen<string>("build-progress", (event) => told(event.payload)),
  buildToolsInstall: () => invoke("build_tools_install"),
  historyBegin: (project, at, conversation) => invoke<History>("history_begin", { project, at, conversation }),
  historySnapshot: (project, kind, at, conversation) => invoke<History>("history_snapshot", { project, kind, at: at ?? null, conversation: conversation ?? null }),
  historyList: (project) => invoke<History>("history_list", { project }),
  historyRestore: (project, id) => invoke<History>("history_restore", { project, id }),
  historyMark: (project, version, date) => invoke<History>("history_mark", { project, version, date }),
  historyPreview: (project, id) => invoke("history_preview", { project, id }),
  projectsExport: (projects, path) => invoke("projects_export", { projects, path }),
  projectsImport: (path) => invoke("projects_import", { path }),
  importRead: (path) => invoke("import_read", { path }),
  askSaveExport: (name) => save({ title: "Export", defaultPath: name, filters: [{ name: "Workshop export", extensions: ["zip"] }] }),
  askOpenImport: async () => {
    const chosen = await open({ title: "Import", filters: [{ name: "A workshop export or a plugin", extensions: ["zip"] }] });
    return typeof chosen === "string" ? chosen : null;
  },
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
    updateCheck: async () => null,
    updateInstall: async () => {},
    usbReaders: async () => [],
    sendUsb: async () => { throw new Error("Sending to a reader needs the app."); },
    onSendProgress: async () => () => {},
    sendCard: async () => { throw new Error("Sending to a reader needs the app."); },
    askSave: async () => null,
    askFolder: async () => null,
    saveFile: async () => {},
    // A plain browser keeps no package and opens no form.
    publishSave: async (project, name) => `${project}/.workshop/publish/${name}`,
    publishShow: async () => {},
    // No builds for the readers in a plain browser.
    deviceReadiness: async () => ({ x4: false, x4_mb: 62, x4_pro: false, sign: false }),
    deviceToolchainInstall: async () => { throw new Error("Building for the readers needs the app."); },
    deviceBuild: async () => { throw new Error("Building for the readers needs the app."); },
    // An author key in memory, its backup said done when asked.
    ...memoryAuthor(),
    codeBuild: async () => {
      throw new Error("Plugins with code are built in the app.");
    },
    onBuildProgress: async () => () => {},
    buildToolsInstall: async () => {},
    ...memoryHistory((project) => at(project).files),
    projectsExport: async () => { throw new Error("Exporting needs the app."); },
    projectsImport: async () => null,
    importRead: async () => { throw new Error("Importing needs the app."); },
    askSaveExport: async () => null,
    askOpenImport: async () => null,
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

/** The author key of the stand-in: in memory, never a real key. */
function memoryAuthor(): Pick<Backend, "authorStatus" | "authorCreate" | "authorBackup" | "authorImport" | "askSaveKey" | "askOpenKey"> {
  let status: AuthorStatus = { public: null, fingerprint: null, backed_up: null };
  const made: AuthorStatus = { public: "0".repeat(64), fingerprint: "0000 0000 0000 0000", backed_up: null };
  return {
    authorStatus: async () => status,
    authorCreate: async () => (status = status.public ? status : { ...made }),
    authorBackup: async () => (status = { ...status, backed_up: Math.floor(Date.now() / 1000) }),
    authorImport: async () => (status = { ...made, backed_up: Math.floor(Date.now() / 1000) }),
    askSaveKey: async () => "paperpaw-author.key",
    askOpenKey: async () => "paperpaw-author.key",
  };
}
