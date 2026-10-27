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

/** Where a device's key sits on its body (PaperPaw's docs/web-emulator.md,
 *  "The body and its keys"): an edge, or the face below or beside the
 *  screen; its middle and length along that place, in hundredths. */
export interface BodyKey {
  button: string;
  place: "top" | "right" | "bottom" | "left" | "below" | "beside";
  at: number;
  length: number;
  /** The computer's keys that press it, as KeyboardEvent.key names them. */
  keys: string[];
}

/** A device's body around its screen: the bezel, top, right, bottom and
 *  left, in hundredths of the screen's width, and its keys. */
export interface Body {
  bezel: [number, number, number, number];
  keys: BodyKey[];
}

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

/** The one file for the store's form and what it holds: `package`, each
 *  reader built for (`x4`), `source` (src-tauri's publish.rs). */
/** Who is signed in at GitHub, and how one could sign in. */
export interface GitHubAccount {
  login: string | null;
  /** A sign-in is kept, but GitHub refuses it (it expired). */
  expired: boolean;
  /** The GitHub CLI is installed and signed in. */
  gh: boolean;
  /** Signing in through the browser is ready. */
  browser: boolean;
}

/** GitHub's device flow, begun: the code to type at the address. */
export interface DeviceCode {
  device_code: string;
  user_code: string;
  verification_uri: string;
  interval: number;
  expires_in: number;
}

/** The repository as it will be, checked as the store will check it. */
export interface GitHubPrepared {
  place: { repo: string; exists: boolean; released: boolean };
  passes: boolean;
  /** check-publish's lines, errors first. */
  problems: string[];
  files: number;
}

export interface GitHubPublished {
  repo: string;
  tag: string;
  sha: string;
  url: string;
}

/** The release workflow's run. */
export interface GitHubRun {
  /** `waiting`, `queued`, `in_progress`, `success`, `failure`, … */
  state: string;
  url: string;
  failed_step: string | null;
  log: string | null;
}

/** What paperpaw.org says of a repository's newest release. */
export interface SiteStatus {
  found: boolean;
  tag: string | null;
  version: string | null;
  /** `offered`, `submitted`, `failed`, `held` or `none`. */
  state: string | null;
  listed: boolean;
  problems: string[];
}

export interface StoreFile {
  path: string;
  name: string;
  parts: string[];
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
  /** Widget `widget` alone on the first page of the home screen; the
   *  reader starts again so. */
  emulatorWidget(widget: string): Promise<void>;
  emulatorRun(action: string): Promise<void>;
  /** Opens the screen bound to `slot`; false where the emulator has no
   *  slots yet (an older protocol). */
  emulatorSlot(slot: string, params?: Record<string, string>): Promise<boolean>;
  /** The devices' bodies with their keys, by profile id; none for an
   *  emulator from before bodies. */
  emulatorBodies(): Promise<Record<string, Body>>;
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
  /** Packs the one file for the store's upload form,
   *  `<id>-<version>-store.zip`, in the project's `.workshop/publish/`:
   *  the package (in base64) and, for a plugin with code, what
   *  `deviceBuild` made. */
  publishPack(project: string, id: string, version: string, base64: string, code: boolean): Promise<StoreFile>;
  /** Opens the store's upload form in the browser and shows the store
   *  file in its folder. */
  publishShow(path: string): Promise<void>;
  /** Who is signed in at GitHub. */
  githubAccount(): Promise<GitHubAccount>;
  /** Signs in with the GitHub CLI's account. */
  githubUseGh(): Promise<GitHubAccount>;
  /** Begins signing in through the browser (the page opened); `more`:
   *  with the access to keep a secret, which only a plugin with code needs. */
  githubDeviceStart(more: boolean): Promise<DeviceCode>;
  /** `pending`, `slow_down`, or `done` once the code was typed. */
  githubDevicePoll(deviceCode: string): Promise<string>;
  githubSignOut(): Promise<void>;
  /** The plugin's repository laid out and checked as the store will
   *  (`source`: a plugin with code's source ZIP, as its build made it). */
  githubPrepare(project: string, id: string, version: string, known: string | null, source: string | null, name: string | null): Promise<GitHubPrepared>;
  /** The repository made or brought up to date, listed, its key kept,
   *  the version tagged: its release workflow starts. */
  githubPublish(project: string, id: string, version: string, description: string, known: string | null, source: string | null, name: string | null): Promise<GitHubPublished>;
  githubRun(repo: string, sha: string): Promise<GitHubRun>;
  /** What paperpaw.org says; `check`: asked to look now. */
  githubSite(repo: string, check: boolean): Promise<SiteStatus>;
  /** Opens a page of GitHub's in the browser. */
  githubOpen(url: string): Promise<void>;
  /** Calls `told` with each step of publishing on GitHub. */
  onGitHubProgress(told: (text: string) => void): Promise<() => void>;
  /** What building a plugin with code for the readers needs, and has. */
  deviceReadiness(): Promise<DeviceReadiness>;
  /** Fetches the X4's part of Rust (about `x4_mb` MB). */
  deviceToolchainInstall(): Promise<void>;
  /** Builds the project's plugin with code for the X4, signed, with its
   *  source as a ZIP, into the project's `.workshop/publish/parts/`. */
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
  /** An example of what `url` answers (sample.rs): public addresses,
   *  GET, cut to 4 KB. */
  sampleFetch(url: string): Promise<import("../tools/sample").Sample>;
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
  emulatorWidget: (widget) => invoke("emulator_widget", { widget }),
  emulatorRun: (action) => invoke("emulator_run", { action }),
  emulatorSlot: (slot, params) => invoke("emulator_slot", { slot, params }),
  emulatorBodies: () => invoke("emulator_bodies"),
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
  publishPack: (project, id, version, base64, code) => invoke("publish_pack", { project, id, version, base64, code }),
  publishShow: (path) => invoke("publish_show", { path }),
  githubAccount: () => invoke("github_account"),
  githubUseGh: () => invoke("github_use_gh"),
  githubDeviceStart: (more) => invoke("github_device_start", { more }),
  githubDevicePoll: (deviceCode) => invoke("github_device_poll", { deviceCode }),
  githubSignOut: () => invoke("github_sign_out"),
  githubPrepare: (project, id, version, known, source, name) => invoke("github_prepare", { project, id, version, known, source, name }),
  githubPublish: (project, id, version, description, known, source, name) =>
    invoke("github_publish", { project, id, version, description, known, source, name }),
  githubRun: (repo, sha) => invoke("github_run", { repo, sha }),
  githubSite: (repo, check) => invoke("github_site", { repo, check }),
  githubOpen: (url) => invoke("github_open", { url }),
  onGitHubProgress: async (told) => listen<string>("github-progress", (event) => told(event.payload)),
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
  sampleFetch: (url) => invoke("sample_fetch", { url }),
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
    emulatorWidget: async () => {},
    emulatorRun: async () => {},
    emulatorSlot: async () => false,
    emulatorBodies: async () => ({}),
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
    // A plain browser keeps no file and opens no form.
    publishPack: async (project, id, version, _base64, code) => ({
      path: `${project}/.workshop/publish/${id}-${version}-store.zip`,
      name: `${id}-${version}-store.zip`,
      parts: code ? ["package", "x4", "source"] : ["package"],
    }),
    publishShow: async () => {},
    // GitHub needs the app.
    githubAccount: async () => ({ login: null, expired: false, gh: false, browser: false }),
    githubUseGh: async () => { throw new Error("Publishing on GitHub needs the app."); },
    githubDeviceStart: async (_more) => { throw new Error("Publishing on GitHub needs the app."); },
    githubDevicePoll: async () => "pending",
    githubSignOut: async () => {},
    githubPrepare: async () => { throw new Error("Publishing on GitHub needs the app."); },
    githubPublish: async () => { throw new Error("Publishing on GitHub needs the app."); },
    githubRun: async () => ({ state: "waiting", url: "", failed_step: null, log: null }),
    githubSite: async () => ({ found: false, tag: null, version: null, state: null, listed: false, problems: [] }),
    githubOpen: async (url) => void window.open(url, "_blank"),
    onGitHubProgress: async () => () => {},
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
    sampleFetch: async () => { throw new Error("Fetching an example needs the app."); },
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
