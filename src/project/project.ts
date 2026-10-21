// A plugin being made: its files, its conversation with the AI, and what
// that cost so far. Kept in the browser (see storage.ts); nothing of it
// goes to a server but the AI's requests.

import type Anthropic from "@anthropic-ai/sdk";

import { parseIni, iniValue } from "./ini";
import { MAX_BYTES, MAX_FILES, MAX_TEXT_FILE, isText, pathProblem } from "./rules";
import type { UploadInfo } from "./uploads";

export type Kind = "data";

/** What only the store reads: the entry and the screenshots. */
export const STORE_FOLDER = "store/";

export interface Usage {
  inputTokens: number;
  cacheWriteTokens: number;
  cacheReadTokens: number;
  outputTokens: number;
  /** What it cost, in US dollars, at the model's prices. */
  dollars: number;
}

export interface Project {
  /** A random id of the browser's own. */
  key: string;
  kind: Kind;
  /** Path to contents: text for text files, bytes for pictures and fonts. */
  files: Record<string, string | Uint8Array>;
  /** The conversation as the API has it, append-only. */
  messages: Anthropic.MessageParam[];
  usage: Usage;
  /** The prompt's size in the last request, in tokens. */
  lastPrompt?: number;
  /** The author's pictures and files (their bytes are kept apart, see
   *  uploads.ts). */
  uploads?: UploadInfo[];
  /** How many uploaded pictures the AI was shown in this conversation. */
  picturesShown?: number;
  /** Conversations before this one, kept to read back: a conversation that
   *  grew too long goes on in a fresh one (append-only, never cut). */
  earlier?: Anthropic.MessageParam[][];
  /** What the next message carries into a fresh conversation: a summary
   *  of the one before. */
  carried?: string;
  created: string;
  updated: string;
}

/** How a fresh conversation's first message begins: the summary of the
 *  one before (the conversation shows it as such, not as the person's). */
export const CARRIED = "This conversation continues an earlier one about the same plugin";

export const NO_USAGE: Usage = {
  inputTokens: 0,
  cacheWriteTokens: 0,
  cacheReadTokens: 0,
  outputTokens: 0,
  dollars: 0,
};

export function newProject(kind: Kind = "data"): Project {
  const now = new Date().toISOString();
  return {
    key: randomKey(),
    kind,
    files: {},
    messages: [],
    usage: { ...NO_USAGE },
    created: now,
    updated: now,
  };
}

function randomKey(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** The plugin's id and name as its `plugin.ini` says, if it says. */
export function identity(project: Project): { id?: string; name?: string; version?: string } {
  const ini = project.files["plugin.ini"];
  if (typeof ini !== "string") return {};
  const parsed = parseIni(ini);
  return {
    id: iniValue(parsed, "plugin", "id"),
    name: iniValue(parsed, "plugin", "name"),
    version: iniValue(parsed, "plugin", "version"),
  };
}

/** The files as the AI and the emulator see them: text as text, the
 *  rest as bytes. Writing checks the store's rules first. */
export class Files {
  constructor(private project: Project, private changed: () => void = () => {}) {}

  list(): { path: string; size: number }[] {
    return Object.entries(this.project.files)
      .map(([path, content]) => ({
        path,
        size: typeof content === "string" ? new TextEncoder().encode(content).length : content.length,
      }))
      .sort((a, b) => a.path.localeCompare(b.path));
  }

  read(path: string): string | undefined {
    const content = this.project.files[path];
    return typeof content === "string" ? content : undefined;
  }

  has(path: string): boolean {
    return Object.hasOwn(this.project.files, path);
  }

  /** Writes a text file; why not, if it may not be written. */
  write(path: string, content: string): string | null {
    const problem = pathProblem(path);
    if (problem) return problem;
    if (!isText(path)) return "only text files (.ini, .css, .txt, .md) can be written here";
    const size = new TextEncoder().encode(content).length;
    if (size > MAX_TEXT_FILE) return `a text file holds at most ${MAX_TEXT_FILE / 1024} KB`;
    const limit = this.limits(path, size);
    if (limit) return limit;
    this.project.files[path] = content;
    this.touch();
    return null;
  }

  /** Writes a picture or a font; why not, if it may not be written. */
  writeBytes(path: string, bytes: Uint8Array): string | null {
    const problem = pathProblem(path) ?? this.limits(path, bytes.length);
    if (problem) return problem;
    this.project.files[path] = bytes;
    this.touch();
    return null;
  }

  /** Why `size` bytes at `path` would break the store's limits, if they
   *  would: the files a plugin holds (outside `store/`), its bytes. */
  private limits(path: string, size: number): string | null {
    const files = this.list();
    const known = files.find((f) => f.path === path);
    const counted = (p: string) => !p.startsWith(STORE_FOLDER);
    if (!known && counted(path) && files.filter((f) => counted(f.path)).length >= MAX_FILES) {
      return `a plugin holds at most ${MAX_FILES} files: delete one first`;
    }
    const total = files.reduce((n, f) => n + f.size, 0) - (known?.size ?? 0) + size;
    if (total > MAX_BYTES) return `a plugin holds at most ${MAX_BYTES / 1024 / 1024} MB`;
    return null;
  }

  remove(path: string): boolean {
    if (!Object.hasOwn(this.project.files, path)) return false;
    delete this.project.files[path];
    this.touch();
    return true;
  }

  /** Every file as bytes, for the emulator and the ZIPs. `store: false`
   *  leaves out the store's folder, which readers do not install. */
  bytes({ store = true } = {}): Record<string, Uint8Array> {
    const out: Record<string, Uint8Array> = {};
    for (const [path, content] of Object.entries(this.project.files)) {
      if (!store && path.startsWith(STORE_FOLDER)) continue;
      out[path] = typeof content === "string" ? new TextEncoder().encode(content) : content;
    }
    return out;
  }

  private touch(): void {
    this.project.updated = new Date().toISOString();
    this.changed();
  }
}
