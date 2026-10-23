// Pictures in the plugin, made smaller on this computer (src-tauri's
// pictures.rs), as the person chooses: per picture in the files drawer
// (keep it, smaller in colour, smaller in grays), by default as the
// project's "Optimise images for e-ink" says. The upload stays as it was;
// the plugin gets the picture made from it. The AI never chooses a mode:
// what it makes of an upload (convert_picture: the part, the fit, the
// tone) is made so here too, in the mode the person chose.

import type { Profile } from "../handbook/handbook";
import type { Project } from "../project/project";
import type { PictureMode, PictureShape, UploadInfo, Uploads } from "../project/uploads";
import { fromBase64, toBase64 } from "./folders";

export type { PictureMode, PictureShape };

export const MODES: { mode: PictureMode; label: string }[] = [
  { mode: "keep", label: "Keep as it is" },
  { mode: "smaller-colour", label: "Smaller, keep colours" },
  { mode: "smaller-grays", label: "Smaller, grays only" },
];

/** The Rust side's picture calls (or a stand-in's). */
export interface PictureApi {
  pictureMake(base64: string, mode: PictureMode, maxWidth: number, maxHeight: number, shape?: PictureShape): Promise<[string, number, number]>;
  pictureInfo(base64: string): Promise<{ width: number; height: number; bytes: number; colour: boolean }>;
}

/** A reader's screen, as much as pictures need of it. */
export type Screen = Pick<Profile, "id" | "width" | "height" | "summary" | "colour_screen">;

/** The readers the workshop shows (the handbook's registry). */
export const WORKSHOP_SCREENS: Screen[] = [
  { id: "xteink-x4", width: 480, height: 800, summary: 'ESP32-C3, 4.3" 800x480, buttons only' },
  { id: "xteink-x4-pro", width: 480, height: 800, summary: 'ESP32-S3 with 8 MB PSRAM, 4.3" 800x480, touch + buttons' },
  { id: "boox-go-7", width: 1264, height: 1680, summary: 'Android, 7" Carta 1300 1264x1680, touch + page buttons' },
];

/** Whether a screen shows colours: the registry says so (version 2);
 *  before, its summary named the panel. (`colors` says whether a theme may
 *  set colours, not this.) */
export function colourScreen(screen: Screen): boolean {
  return screen.colour_screen ?? /kaleido|gallery|colou?r\b/i.test(screen.summary);
}

/** Whether the project makes its pictures smaller unless one says
 *  otherwise (on unless turned off). */
export function optimising(project: Project): boolean {
  return project.optimisePictures !== false;
}

/** What becomes of `upload` in the plugin: the person's choice, else the
 *  project's; colours are kept when a reader shows them. */
export function modeFor(project: Project, upload: UploadInfo, screens: Screen[]): PictureMode {
  if (upload.mode) return upload.mode;
  if (!optimising(project)) return "keep";
  return screens.some(colourScreen) ? "smaller-colour" : "smaller-grays";
}

/** The most pixels a picture needs: a slot's own size where known, else the
 *  largest screen's. */
export function needed(screens: Screen[], slot?: { width: number; height: number }): [number, number] {
  if (slot) return [slot.width, slot.height];
  const largest = [...screens].sort((a, b) => b.width * b.height - a.width * a.height)[0];
  return largest ? [largest.width, largest.height] : [480, 800];
}

/** The picture made of upload `name` for `to` in the plugin, as its mode
 *  says (and the AI's shape, if it made one), remembered as made from there
 *  (a changed mode makes it again); not written. */
export async function pictureOf(
  project: Project,
  uploads: Uploads,
  name: string,
  to: string,
  screens: Screen[],
  api: PictureApi,
  how: { slot?: { width: number; height: number }; shape?: PictureShape } = {},
): Promise<{ png: Uint8Array; width: number; height: number; mode: PictureMode }> {
  const upload = uploads.info(name);
  const original = upload && (await uploads.read(name));
  if (!upload || !original) throw new Error(`There is no upload ${name}.`);
  if (upload.kind !== "picture") throw new Error(`${name} is a ${upload.kind}, not a picture.`);
  const { slot, shape } = how;
  const [width, height] = shape ? [shape.width, shape.height] : needed(screens, slot);
  const mode = modeFor(project, upload, screens);
  const [made, w, h] = await api.pictureMake(toBase64(original), mode, width, height, shape);
  const placed = (upload.placed ??= []);
  const entry = { path: to, ...(slot && { slot }), ...(shape && { shape }) };
  const at = placed.findIndex((p) => p.path === to);
  if (at >= 0) placed[at] = entry;
  else placed.push(entry);
  return { png: fromBase64(made), width: w, height: h, mode };
}

/** Writes the picture made of upload `name` at `to` in the plugin
 *  (pictureOf). */
export async function placePicture(
  project: Project,
  uploads: Uploads,
  name: string,
  to: string,
  screens: Screen[],
  api: PictureApi,
  slot?: { width: number; height: number },
  shape?: PictureShape,
): Promise<{ bytes: number; width: number; height: number }> {
  const made = await pictureOf(project, uploads, name, to, screens, api, { slot, shape });
  project.files[to] = made.png;
  return { bytes: made.png.length, width: made.width, height: made.height };
}

/** Makes again every plugin picture made of `upload` that is still there,
 *  after its mode or the project's setting changed. */
export async function remake(project: Project, uploads: Uploads, upload: UploadInfo, screens: Screen[], api: PictureApi): Promise<void> {
  upload.placed = (upload.placed ?? []).filter((p) => project.files[p.path] !== undefined);
  for (const p of [...upload.placed]) await placePicture(project, uploads, upload.name, p.path, screens, api, p.slot, p.shape);
}

/** A picture the check before sending would make smaller. */
export interface Suggestion {
  path: string;
  why: string;
  mode: PictureMode;
}

const PICTURE = /\.(png|jpe?g)$/i;
/** Above this a picture is worth making smaller, even at its size. */
const HEAVY = 300 * 1024;

/** What the check before sending or exporting suggests: pictures larger
 *  than the readers need, in colour where none shows it, or heavy. Only
 *  suggests; nothing is changed until the person says so. Pictures the
 *  person chose to keep as they are, or every picture when the project
 *  does not optimise, are left alone. */
export async function suggestions(project: Project, screens: Screen[], api: PictureApi): Promise<Suggestion[]> {
  if (!optimising(project)) return [];
  const kept = new Set((project.uploads ?? []).filter((u) => modeFor(project, u, screens) === "keep").flatMap((u) => (u.placed ?? []).map((p) => p.path)));
  const colour = screens.some(colourScreen);
  const [long, short] = ((n) => [Math.max(...n), Math.min(...n)])(needed(screens));
  const found: Suggestion[] = [];
  for (const [path, content] of Object.entries(project.files)) {
    if (!PICTURE.test(path) || path.startsWith("store/") || kept.has(path) || !(content instanceof Uint8Array)) continue;
    const info = await api.pictureInfo(toBase64(content));
    const mode: PictureMode = info.colour && colour ? "smaller-colour" : "smaller-grays";
    const [a, b] = [Math.max(info.width, info.height), Math.min(info.width, info.height)];
    const why = a > long || b > short ? `${info.width}×${info.height}, more than the readers show`
      : info.colour && !colour ? "in colour, the readers show grays"
      : content.length > HEAVY ? `${Math.round(content.length / 1024)} KB, slow to draw`
      : "";
    if (why) found.push({ path, why, mode });
  }
  return found;
}

/** "Make smaller", for one suggestion: the picture in the plugin made as
 *  the suggestion says. */
export async function makeSmaller(project: Project, suggestion: Suggestion, screens: Screen[], api: PictureApi): Promise<void> {
  const content = project.files[suggestion.path];
  if (!(content instanceof Uint8Array)) return;
  const [width, height] = needed(screens);
  const [made] = await api.pictureMake(toBase64(content), suggestion.mode, width, height);
  project.files[suggestion.path] = fromBase64(made);
}
