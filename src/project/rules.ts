// The plugin store's rules for a data plugin's folder, as paperpaw.org's
// checker has them (ids, versions, paths, file kinds, counts): the
// workshop keeps to them from the first file on.

/** The most characters of a plugin's id. */
export const MAX_ID = 40;
/** The most files a data plugin holds, outside `store/`. */
export const MAX_FILES = 64;
/** The longest path inside the folder. */
export const MAX_PATH = 100;
/** The most bytes of a data plugin, unpacked. */
export const MAX_BYTES = 40 * 1024 * 1024;
/** The most bytes of one text file the AI writes: settings, layouts and
 *  translations are a few kilobytes; more is a mistake. */
export const MAX_TEXT_FILE = 256 * 1024;

/** File kinds a data plugin may hold outside `store/`. */
export const DATA_KINDS = [".ini", ".css", ".ttf", ".otf", ".ttc", ".ppfp", ".txt", ".md", ".png"];
/** File kinds of `store/` (the store page: its entry, screenshots). */
export const STORE_KINDS = [".ini", ".png", ".jpg", ".jpeg", ".webp", ".md", ".txt"];

/** Whether `id` is a plugin's id: lower-case letters, digits, hyphens. */
export function validId(id: string): boolean {
  return (
    id.length > 0 &&
    id.length <= MAX_ID &&
    /^[a-z0-9-]+$/.test(id) &&
    !id.startsWith("-") &&
    !id.endsWith("-")
  );
}

/** Whether `version` is three numbers, such as `1.0.0`. */
export function validVersion(version: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(version);
}

/** Why `path` cannot be in a plugin's folder, or null if it can. */
export function pathProblem(path: string): string | null {
  if (path.length === 0) return "the path is empty";
  if (path.length > MAX_PATH) return `the path is longer than ${MAX_PATH} characters`;
  const parts = path.split("/");
  for (const part of parts) {
    if (part.length === 0) return "the path has an empty folder name";
    if (part.startsWith(".")) return "a name starts with a dot";
    if (!/^[A-Za-z0-9._-]+$/.test(part)) {
      return "names may hold only letters, digits, '.', '_' and '-'";
    }
  }
  const kind = extension(path);
  const allowed = parts[0] === "store" && parts.length > 1 ? STORE_KINDS : DATA_KINDS;
  if (!allowed.includes(kind)) {
    return `files of the kind ${kind || "(none)"} do not belong here; allowed: ${allowed.join(", ")}`;
  }
  return null;
}

/** The extension of `path`, lower-case with its dot, or "". */
export function extension(path: string): string {
  const name = path.split("/").pop() ?? "";
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot).toLowerCase() : "";
}

/** Whether `path` holds text (what the AI writes and reads). */
export function isText(path: string): boolean {
  return [".ini", ".css", ".txt", ".md"].includes(extension(path));
}
