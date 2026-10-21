// The store's screenshots, taken on the emulator so nobody has to make
// their own: the home screen on each device shown, and one in night mode.
// They go into `store/` as the store's form reads them.

import type { Emulator } from "../emulator/emulator";
import type { Profile } from "../handbook/handbook";
import { MAX_SCREENSHOT_BYTES, MAX_SCREENSHOTS } from "../project/entry";
import { STORE_FOLDER, type Files } from "../project/project";
import { validId } from "../project/rules";

export interface Shot {
  /** Its file name in `store/`, as the store wants it: `2-x4-pro.png`.
   *  The store shows them in the order of their names, hence the number. */
  file: string;
  profile: Profile;
  dark: boolean;
  /** What it shows, for those who cannot see it. */
  alt: string;
}

/** The screenshots to take, in the store's order: each device, then the
 *  first one at night. */
export function plannedShots(profiles: Profile[], alt: (device: string, dark: boolean) => string): Shot[] {
  const wanted = profiles.map((profile) => ({ profile, dark: false }));
  if (profiles[0]) wanted.push({ profile: profiles[0], dark: true });
  return wanted.slice(0, MAX_SCREENSHOTS).map(({ profile, dark }, i) => ({
    file: `${i + 1}-${slug(profile)}${dark ? "-night" : ""}.png`,
    profile,
    dark,
    alt: alt(short(profile), dark),
  }));
}

/** Takes `shots` and keeps them in `store/`, in place of earlier ones.
 *  Returns the files kept and those too large to keep. */
export async function takeShots(emulator: Emulator, files: Files, shots: Shot[]): Promise<{ kept: string[]; tooLarge: string[] }> {
  for (const old of files.list()) {
    if (old.path.startsWith(STORE_FOLDER) && /\.(png|jpe?g|webp)$/.test(old.path)) files.remove(old.path);
  }
  const kept: string[] = [];
  const tooLarge: string[] = [];
  for (const shot of shots) {
    const taken = await emulator.screenshot(shot.profile, shot.dark);
    const bytes = base64Bytes(taken.png);
    if (bytes.length > MAX_SCREENSHOT_BYTES) {
      tooLarge.push(shot.file);
      continue;
    }
    const problem = files.writeBytes(`${STORE_FOLDER}${shot.file}`, bytes);
    if (problem) throw new Error(`${shot.file}: ${problem}`);
    kept.push(shot.file);
  }
  return { kept, tooLarge };
}

/** The screenshots in `store/` now, by file name. */
export function shotsIn(files: Files): string[] {
  return files
    .list()
    .map((f) => f.path)
    .filter((p) => p.startsWith(STORE_FOLDER) && /^store\/[a-z0-9-]+\.(png|jpe?g|webp)$/.test(p))
    .map((p) => p.slice(STORE_FOLDER.length));
}

/** `Xteink X4 Pro` as a file name: `x4-pro`. */
function slug(profile: Profile): string {
  const name = short(profile)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return validId(name) ? name : "reader";
}

function short(profile: Profile): string {
  return profile.name.replace(/^Xteink\s+/, "");
}

function base64Bytes(base64: string): Uint8Array {
  const raw = atob(base64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}
