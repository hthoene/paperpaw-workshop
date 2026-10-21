// The author's uploads: pictures and files given to the workshop, kept
// with the project but apart from the plugin (design 4.8). Only a
// converted copy that the AI or the author puts into the plugin's folder
// is part of the plugin. The bytes live in their own store (storage.ts),
// so a project's record stays small; the project lists what there is.

import type { Project } from "./project";

export type UploadKind = "picture" | "font" | "text";

export interface UploadInfo {
  /** A name of its own in the project: lower case, `my-photo.jpg`. */
  name: string;
  kind: UploadKind;
  /** Its media type, from its bytes. */
  type: string;
  bytes: number;
  /** A picture's size in pixels. */
  width?: number;
  height?: number;
  added: string;
}

/** Where the bytes are kept: IndexedDB in the browser, memory in tests. */
export interface UploadStore {
  get(project: string, name: string): Promise<Uint8Array | undefined>;
  put(project: string, name: string, bytes: Uint8Array): Promise<void>;
  remove(project: string, name: string): Promise<void>;
}

export const MAX_UPLOADS = 30;
export const MAX_UPLOAD_TOTAL = 100 * 1024 * 1024;
export const MAX_PICTURE_BYTES = 15 * 1024 * 1024;
export const MAX_PICTURE_PIXELS = 40_000_000;
export const MAX_FONT_BYTES = 15 * 1024 * 1024;
export const MAX_TEXT_BYTES = 1024 * 1024;
/** Pictures the author may add to one message, and the AI may be shown
 *  in one conversation (each is paid for once, then read from the cache). */
export const MAX_PICTURES_A_MESSAGE = 4;
export const MAX_PICTURES_SHOWN = 12;

/** How a message names what the author added to it: `The author added
 *  picture "owl.jpg" (...)`. The conversation shows these as uploads. */
export const ADDED = "The author added";

/** Why an upload was refused: a catalog key and its values. */
export class UploadRefused extends Error {
  constructor(
    readonly key: string,
    readonly vars: Record<string, string> = {},
  ) {
    super(key);
  }
}

/** What the bytes are, by their first bytes (not by the name, which may
 *  say anything); text by its name and by being UTF-8. */
export function sniff(name: string, bytes: Uint8Array): { kind: UploadKind; type: string } | undefined {
  const starts = (...b: number[]) => b.every((v, i) => bytes[i] === v);
  const ascii = (at: number, text: string) => [...text].every((c, i) => bytes[at + i] === c.charCodeAt(0));
  if (starts(0x89, 0x50, 0x4e, 0x47)) return { kind: "picture", type: "image/png" };
  if (starts(0xff, 0xd8, 0xff)) return { kind: "picture", type: "image/jpeg" };
  if (ascii(0, "GIF8")) return { kind: "picture", type: "image/gif" };
  if (ascii(0, "RIFF") && ascii(8, "WEBP")) return { kind: "picture", type: "image/webp" };
  if (starts(0x00, 0x01, 0x00, 0x00) || ascii(0, "true")) return { kind: "font", type: "font/ttf" };
  if (ascii(0, "OTTO")) return { kind: "font", type: "font/otf" };
  const ext = name.toLowerCase().split(".").pop() ?? "";
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(0, 64 * 1024));
  } catch {
    return undefined;
  }
  if (ext === "svg" || /^\s*(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*<svg[\s>]/i.test(text)) {
    return /<svg[\s>]/i.test(text) ? { kind: "picture", type: "image/svg+xml" } : undefined;
  }
  if (["txt", "md", "ini", "css"].includes(ext)) return { kind: "text", type: "text/plain" };
  return undefined;
}

/** `My Photo (2).JPG` as a name of the project's: `my-photo-2.jpg`. */
export function uploadName(name: string, taken: string[]): string {
  const dot = name.lastIndexOf(".");
  const ext = (dot > 0 ? name.slice(dot + 1) : "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const stem =
    (dot > 0 ? name.slice(0, dot) : name)
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "upload";
  const named = (n: number) => `${stem}${n > 1 ? `-${n}` : ""}${ext ? `.${ext}` : ""}`;
  let n = 1;
  while (taken.includes(named(n))) n++;
  return named(n);
}

export class Uploads {
  constructor(
    private project: Project,
    private store: UploadStore,
    private changed: () => void = () => {},
  ) {
    project.uploads ??= [];
  }

  list(): UploadInfo[] {
    return this.project.uploads ?? [];
  }

  info(name: string): UploadInfo | undefined {
    return this.list().find((u) => u.name === name);
  }

  read(name: string): Promise<Uint8Array | undefined> {
    return this.store.get(this.project.key, name);
  }

  /** Takes a file the author gave, if the workshop may keep it. A
   *  picture's size comes from `measure` (the browser decodes it). */
  async add(fileName: string, bytes: Uint8Array, measure: (bytes: Uint8Array, type: string) => Promise<{ width: number; height: number }>): Promise<UploadInfo> {
    const what = sniff(fileName, bytes);
    if (!what) throw new UploadRefused("upload.refused.kind", { name: fileName });
    // The same file again is the upload it already is.
    for (const known of this.list().filter((u) => u.bytes === bytes.length && u.type === what.type)) {
      const kept = await this.read(known.name);
      if (kept && kept.every((b, i) => b === bytes[i])) return known;
    }
    const limit = { picture: MAX_PICTURE_BYTES, font: MAX_FONT_BYTES, text: MAX_TEXT_BYTES }[what.kind];
    if (bytes.length > limit) throw new UploadRefused("upload.refused.large", { name: fileName, mb: String(Math.round(limit / 1024 / 1024)) });
    if (this.list().length >= MAX_UPLOADS) throw new UploadRefused("upload.refused.count", { n: String(MAX_UPLOADS) });
    const total = this.list().reduce((n, u) => n + u.bytes, 0);
    if (total + bytes.length > MAX_UPLOAD_TOTAL) throw new UploadRefused("upload.refused.total", { mb: String(MAX_UPLOAD_TOTAL / 1024 / 1024) });
    const info: UploadInfo = {
      name: uploadName(fileName, this.list().map((u) => u.name)),
      kind: what.kind,
      type: what.type,
      bytes: bytes.length,
      added: new Date().toISOString(),
    };
    if (what.kind === "picture") {
      let size: { width: number; height: number };
      try {
        size = await measure(bytes, what.type);
      } catch {
        throw new UploadRefused("upload.refused.broken", { name: fileName });
      }
      if (size.width * size.height > MAX_PICTURE_PIXELS) throw new UploadRefused("upload.refused.pixels", { name: fileName, mp: String(MAX_PICTURE_PIXELS / 1_000_000) });
      info.width = size.width;
      info.height = size.height;
    }
    await this.store.put(this.project.key, info.name, bytes);
    this.list().push(info);
    this.changed();
    return info;
  }

  /** How many more pictures the AI may still be shown. */
  get showable(): number {
    return Math.max(0, MAX_PICTURES_SHOWN - (this.project.picturesShown ?? 0));
  }

  /** Counts `n` pictures shown to the AI. */
  shown(n = 1): void {
    this.project.picturesShown = (this.project.picturesShown ?? 0) + n;
  }

  async remove(name: string): Promise<void> {
    await this.store.remove(this.project.key, name);
    this.project.uploads = this.list().filter((u) => u.name !== name);
    this.changed();
  }
}

/** Uploads kept in memory, for tests. */
export class MemoryUploads implements UploadStore {
  private kept = new Map<string, Uint8Array>();
  async get(project: string, name: string) {
    return this.kept.get(`${project}/${name}`);
  }
  async put(project: string, name: string, bytes: Uint8Array) {
    this.kept.set(`${project}/${name}`, bytes);
  }
  async remove(project: string, name: string) {
    this.kept.delete(`${project}/${name}`);
  }
}
