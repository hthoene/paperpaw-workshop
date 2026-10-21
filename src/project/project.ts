// A plugin being made: its files, its conversation with the AI, and what
// that cost so far. Kept in the browser (see storage.ts); nothing of it
// goes to a server but the AI's requests.

import type Anthropic from "@anthropic-ai/sdk";

import { parseIni, iniValue } from "./ini";
import { isText, pathProblem } from "./rules";

export type Kind = "data";

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
  created: string;
  updated: string;
}

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
    return path in this.project.files;
  }

  /** Writes a text file; why not, if it may not be written. */
  write(path: string, content: string): string | null {
    const problem = pathProblem(path);
    if (problem) return problem;
    if (!isText(path)) return "only text files (.ini, .css, .txt, .md) can be written here";
    this.project.files[path] = content;
    this.touch();
    return null;
  }

  remove(path: string): boolean {
    if (!(path in this.project.files)) return false;
    delete this.project.files[path];
    this.touch();
    return true;
  }

  /** Every file as bytes, for the emulator and the ZIP. */
  bytes(): Record<string, Uint8Array> {
    const out: Record<string, Uint8Array> = {};
    for (const [path, content] of Object.entries(this.project.files)) {
      out[path] = typeof content === "string" ? new TextEncoder().encode(content) : content;
    }
    return out;
  }

  private touch(): void {
    this.project.updated = new Date().toISOString();
    this.changed();
  }
}
