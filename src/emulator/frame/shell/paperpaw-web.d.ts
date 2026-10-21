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
}
