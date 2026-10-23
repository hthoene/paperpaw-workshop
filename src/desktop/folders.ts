// Projects as folders (src-tauri/src/projects.rs): the plugin's files in
// the folder itself, the workshop's record beside them in `.workshop/`.
// A project loads whole and saves what changed since: the files written or
// removed, then its record (project.json, conversation.json).

import { NO_USAGE, type Kind, type Project } from "../project/project";
import { isText } from "../project/rules";
import type { UploadStore } from "../project/uploads";

/** The Rust side's project calls (or a stand-in's). */
export interface FolderApi {
  projectsList(): Promise<{ folder: string; meta: string }[]>;
  projectCreate(name: string, meta: string): Promise<string>;
  projectFiles(project: string): Promise<{ path: string; size: number }[]>;
  projectRead(project: string, path: string): Promise<string>;
  projectWrite(project: string, path: string, base64: string): Promise<void>;
  projectRemove(project: string, path: string): Promise<void>;
  projectLoad(project: string): Promise<[string, string]>;
  projectSave(project: string, meta: string, conversation: string): Promise<void>;
  uploadsList(project: string): Promise<{ path: string; size: number }[]>;
  uploadRead(project: string, name: string): Promise<string>;
  uploadWrite(project: string, name: string, base64: string): Promise<void>;
  uploadRemove(project: string, name: string): Promise<void>;
}

/** A project in the list: its folder, the plugin's name if it has one. */
export interface Listed {
  folder: string;
  name: string;
  kind: Kind;
  updated: string;
}

export function toBase64(bytes: Uint8Array): string {
  let text = "";
  for (let i = 0; i < bytes.length; i += 0x8000) text += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(text);
}

export function fromBase64(base64: string): Uint8Array {
  const text = atob(base64);
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) bytes[i] = text.charCodeAt(i);
  return bytes;
}

const utf8 = new TextEncoder();
const fromUtf8 = new TextDecoder();

/** What project.json keeps: everything but the files and the messages. */
function metaOf(project: Project): string {
  const { files: _files, messages: _messages, earlier: _earlier, key: _key, ...meta } = project;
  return JSON.stringify(meta, null, 2);
}

function conversationOf(project: Project): string {
  return JSON.stringify({ messages: project.messages, earlier: project.earlier ?? [] });
}

/** The name a project shows: its plugin's (plugin.ini), else its folder's. */
function nameOf(meta: Record<string, unknown>, folder: string): string {
  return typeof meta.name === "string" && meta.name ? meta.name : folder;
}

export class Folders {
  /** What each project's files were when last loaded or saved, to write
   *  only what changed. */
  private saved = new Map<string, Map<string, string | Uint8Array>>();

  constructor(private api: FolderApi) {}

  async list(): Promise<Listed[]> {
    const found = await this.api.projectsList();
    return found.map(({ folder, meta }) => {
      const parsed = JSON.parse(meta) as Record<string, unknown>;
      return {
        folder,
        name: nameOf(parsed, folder),
        kind: parsed.kind === "code" ? "code" : "data",
        updated: typeof parsed.updated === "string" ? parsed.updated : "",
      };
    });
  }

  /** A new project in a folder named `name`; its plugin starts from `files`. */
  async create(name: string, kind: Kind = "data", files: Record<string, string> = {}, model?: string): Promise<Project> {
    const now = new Date().toISOString();
    const project: Project = {
      key: "",
      kind,
      ...(model ? { model } : {}),
      files: { ...files },
      messages: [],
      usage: { ...NO_USAGE },
      created: now,
      updated: now,
    };
    project.key = await this.api.projectCreate(name, metaOf(project));
    this.saved.set(project.key, new Map());
    await this.save(project);
    return project;
  }

  async load(folder: string): Promise<Project> {
    const [meta, conversation] = await this.api.projectLoad(folder);
    const record = JSON.parse(meta) as Omit<Project, "key" | "files" | "messages">;
    const talk = conversation ? (JSON.parse(conversation) as Pick<Project, "messages" | "earlier">) : { messages: [] };
    const files: Record<string, string | Uint8Array> = {};
    for (const { path } of await this.api.projectFiles(folder)) {
      const bytes = fromBase64(await this.api.projectRead(folder, path));
      files[path] = isText(path) ? fromUtf8.decode(bytes) : bytes;
    }
    this.saved.set(folder, new Map(Object.entries(files)));
    return {
      ...record,
      usage: record.usage ?? { ...NO_USAGE },
      key: folder,
      files,
      messages: talk.messages ?? [],
      ...(talk.earlier?.length ? { earlier: talk.earlier } : {}),
    };
  }

  /** Writes the files changed since loading or saving, removes those gone,
   *  then the record. */
  async save(project: Project): Promise<void> {
    const before = this.saved.get(project.key) ?? new Map<string, string | Uint8Array>();
    const now = new Map(Object.entries(project.files));
    for (const [path, content] of now) {
      if (same(before.get(path), content)) continue;
      const bytes = typeof content === "string" ? utf8.encode(content) : content;
      await this.api.projectWrite(project.key, path, toBase64(bytes));
    }
    for (const path of before.keys()) {
      if (!now.has(path)) await this.api.projectRemove(project.key, path);
    }
    await this.api.projectSave(project.key, metaOf(project), conversationOf(project));
    this.saved.set(project.key, new Map([...now].map(([p, c]) => [p, typeof c === "string" ? c : c.slice()])));
  }

  /** The drawer's files of the projects, through the same folders. */
  uploads(): UploadStore {
    return {
      get: async (project, name) => {
        try {
          return fromBase64(await this.api.uploadRead(project, name));
        } catch {
          return undefined;
        }
      },
      put: (project, name, bytes) => this.api.uploadWrite(project, name, toBase64(bytes)),
      remove: (project, name) => this.api.uploadRemove(project, name),
    };
  }
}

function same(a: string | Uint8Array | undefined, b: string | Uint8Array): boolean {
  if (a === undefined) return false;
  if (typeof a === "string" || typeof b === "string") return a === b;
  return a.length === b.length && a.every((v, i) => v === b[i]);
}
