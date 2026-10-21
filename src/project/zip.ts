// The plugin as a ZIP: its folder, ready for a reader's card or the
// store's upload form.

import { zipSync } from "fflate";

/** A ZIP with `files` inside one folder named `id`. */
export function pluginZip(id: string, files: Record<string, Uint8Array>): Uint8Array {
  const tree: Record<string, Uint8Array> = {};
  for (const [path, bytes] of Object.entries(files)) tree[`${id}/${path}`] = bytes;
  return zipSync(tree, { level: 6 });
}
