// Types of PaperPaw's loader for its web emulator (paperpaw-web.js, copied
// from PaperPaw's shells/web/www; see public/emulator/README.md).

export const KEYS: Record<string, string>;

export interface DeviceInfo {
  id: string;
  name: string;
  width: number;
  height: number;
  dpi: number;
  grays: number;
  color: boolean;
  touch: boolean;
  buttons: string[];
  row: string[];
}

export interface Report {
  findings: {
    check: string;
    level: "error" | "warning" | "info";
    plugin: string | null;
    place: string;
    message: string;
    variants: string[];
  }[];
  errors: number;
  warnings: number;
}

export class PaperPawDevice {
  static load(url: URL | string): Promise<PaperPawDevice>;
  /** A device of a compiled module: a fresh instance, its own memory. */
  static from(module: WebAssembly.Module): Promise<PaperPawDevice>;
  /** The module's memory. */
  memory: WebAssembly.Memory;
  /** The module's own functions (`pp_...`). */
  exports: WebAssembly.Exports;
  create(options?: { profile?: string; language?: string; dark?: boolean }): void;
  putFile(plugin: string, path: string, bytes: Uint8Array): void;
  removePlugin(plugin: string): void;
  start(): void;
  device(): DeviceInfo;
  /** At `now`, as `advance` takes it. */
  button(name: string, pressed: boolean, now: number): boolean;
  pointer(phase: "down" | "move" | "up" | "cancel", x: number, y: number, now: number): void;
  /** After a trap: the allocation the device's heap budget refused, 0 if
   *  none was (then it was no lack of memory). */
  refused(): number;
  advance(now: number): number | null;
  size(): [number, number];
  animating(): boolean;
  frame(): ImageData;
  shown(): ImageData;
  /** paperpaw-dev's checks of the data plugins on the card, and of the
   *  plugins with code named (`plugins`, ids) the module adds. */
  check(commands?: string[], plugins?: string[]): Report;
  /** A fresh instance of the same module (after a panic). */
  fresh(): Promise<PaperPawDevice>;
  /** PaperPaw's version, and the commit it was built from. */
  version(): string;
  /** How often the device ran out of its memory. */
  outOfMemory(): number;
  /** Another device, night mode or the sleep screen, made apart. */
  snapshot(options?: { profile?: string; dark?: boolean; asleep?: boolean }): ImageData;
  /** The remote control's command (an x4-remote line) at `now`; its JSON. */
  command(line: string, now: number): Record<string, unknown>;
  /** Whether the screen shown is `text` (its id) or shows it. */
  shows(text: string): boolean;
  /** Recorded answers for plugins' requests, in place of those before. */
  setFixtures(fixtures?: { method?: string; url: string; status?: number; headers?: Record<string, string>; body?: unknown; delay?: number }[]): void;
  setNetwork(mode: "fixtures" | "real"): void;
  /** The requests plugins made since asked last. */
  requests(): { id: number; method: string; url: string; source: "fixture" | "none" | "fetch"; status: number | null }[];
  /** The requests for the page to fetch since asked last (`"real"`). */
  outbox(): { id: number; method: string; url: string; headers: [string, string][]; body: string | null; timeout_ms: number }[];
  /** The answer to request `id` the page fetched (status 0: failed). */
  fetched(id: number, status: number, headers: string, body: Uint8Array, now: number): void;
}
