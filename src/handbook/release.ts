// The SDK items of one PaperPaw release, made at run time from that
// release's handbook (its `api/` lists and `src/`, as versions.rs gives
// them by the paths of a PaperPaw tree), by the same code the handbook
// generator uses: so a new PaperPaw release needs no new workshop for the
// AI to know its API.

import { reachable, sdkItems } from "../../handbook/sdk-items.mjs";
import type { SdkItem } from "./handbook";

/** The items a plugin of interface 7 reaches in the SDK of `tree`. */
export function itemsOfRelease(tree: Record<string, string>): SdkItem[] {
  const paths = Object.keys(tree);
  return (sdkItems({
    read: (path: string) => tree[path] ?? "",
    exists: (path: string) => path in tree || paths.some((p) => p.startsWith(`${path}/`)),
    files: (folder: string) => paths.filter((p) => p.startsWith(`${folder}/`) && p.endsWith(".rs")),
  }) as SdkItem[]).filter((item) => reachable(item.path));
}
