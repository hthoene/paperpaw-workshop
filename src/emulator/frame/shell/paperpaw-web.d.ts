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
  create(options?: { profile?: string; language?: string; dark?: boolean }): void;
  putFile(plugin: string, path: string, bytes: Uint8Array): void;
  removePlugin(plugin: string): void;
  start(): void;
  device(): DeviceInfo;
  button(name: string, pressed: boolean): boolean;
  pointer(phase: "down" | "move" | "up" | "cancel", x: number, y: number): void;
  advance(now: number): number | null;
  size(): [number, number];
  animating(): boolean;
  frame(): ImageData;
  shown(): ImageData;
  check(commands?: string[]): Report;
}
