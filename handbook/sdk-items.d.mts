// The types of sdk-items.mjs, for the tests.

export interface ReadItem {
  owner: string | null;
  name: string;
  kind: string;
  decl: string;
  /** A trait's method: whether it has a default. */
  provided?: boolean;
  doc: string;
}

export function readItems(source: string): ReadItem[];
export function apiLines(text: string): string[];
export function sdkItems(tree: { read(path: string): string; exists(path: string): boolean; files(folder: string): string[] }): unknown[];
