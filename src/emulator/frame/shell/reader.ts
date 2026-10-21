// The real reader: PaperPaw's web emulator (its `shells/web`, built to
// public/emulator/paperpaw-web.wasm by `npm run emulator`), the same
// kernel, plugins, device profiles and panel as PaperPaw on the X4, the
// X4 Pro and the Boox; for a plugin with code, a build's module with the
// plugin compiled in.
//
// It runs in a worker of the frame's (worker.ts), so a plugin's code that
// never returns blocks the worker, not the frame or the workshop's page;
// the frame's watchdog (host.ts) then starts a new one. The frames it
// draws go to the frame by `draw`.
//
// The device the author sees and presses stays as it is while the AI looks
// at another device, at night mode or at the sleep screen: those are made
// apart (`snapshot`).
//
// A module that stops (a WebAssembly trap: PaperPaw panicked, or its
// memory reached the cap a build links it with) cannot go on; a fresh
// instance of it starts the reader again on its home screen, and the
// request says what happened.

import type { Finding } from "../../../checks/data";
import type { Profile } from "../../../handbook/handbook";
import { canSleep, type InputEvent, type PluginFiles, type Screen } from "../../protocol";
import { PaperPawDevice } from "./paperpaw-web.js";

/** paperpaw-dev's checks the module runs here: of the data plugin on the
 *  card, and of a plugin with code as `paperpaw-dev check --plugin` does
 *  (its frame times and heap too). */
const CHECKS = ["package", "lint", "visual"];
const CODE_CHECKS = ["lint", "visual", "reach", "perf"];
/** How long a press holds, in the device's time: a short one, a long one. */
const SHORT_PRESS = 150;
const LONG_PRESS = 1000;
/** How far the device's time runs on after a press for what it set off
 *  (a page turning, a screen opening), so the next press finds it done:
 *  what is due within SOON, up to SETTLE in all. */
const SOON = 400;
const SETTLE = 1500;

/** The largest module the reader runs: PaperPaw's own is some 13 MB, a
 *  build's some 16. */
export const MAX_MODULE = 48 * 1024 * 1024;

/** What a request is told when the module stopped: `refused`, the
 *  allocation the device's heap budget refused, if that was why. */
export function stopped(refused: number): string {
  const why = refused
    ? `it ran out of the device's memory: ${refused} bytes more were refused`
    : "it panicked";
  return `PaperPaw stopped on this reader while doing this (${why}). The reader was started again on its home screen.`;
}

export class ShellReader {
  profile: Profile | undefined;
  dark = false;
  screen: Screen = "home";
  private plugin: PluginFiles | undefined;
  private started = performance.now();
  /** Device time added to the clock: a press holds without waiting. */
  private skew = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private drawing: ReturnType<typeof setTimeout> | undefined;
  /** The module the workshop brings, for going back to it. */
  private readonly standard: URL;

  private constructor(
    private live: PaperPawDevice,
    private url: URL,
    private draw: (frame: ImageData) => void,
  ) {
    this.standard = url;
  }

  /** The module from `url`, its frames to `draw`. */
  static async load(url: URL, draw: (frame: ImageData) => void): Promise<ShellReader> {
    return new ShellReader(await device(url), url, draw);
  }

  /** Runs PaperPaw from another module: a build's, with a plugin with code
   *  compiled in, or `null` for the standard one. The device starts again
   *  as it was. */
  async useModule(url: URL | null): Promise<void> {
    clearTimeout(this.timer);
    this.url = url ?? this.standard;
    this.live = await device(this.url);
    if (this.profile) await this.start(this.profile, this.dark, this.plugin, this.screen);
  }

  start(profile: Profile, dark: boolean, plugin: PluginFiles | undefined, screen: Screen = "home"): Promise<void> {
    this.profile = profile;
    this.dark = dark;
    this.plugin = plugin;
    this.screen = screen;
    return this.guard(() => {
      boot(this.live, profile, dark, plugin);
      this.step();
      if (screen === "sleep" && canSleep(profile)) {
        // The power button, pressed and let go in the device's own time.
        this.live.button("power", true, this.clock());
        this.skew += SHORT_PRESS;
        this.step();
        this.live.button("power", false, this.clock());
        this.skew += 2000;
        this.step();
      }
    });
  }

  /** The plugin's files as they are now: the device starts again. */
  async setFiles(plugin: PluginFiles): Promise<void> {
    if (!this.profile) return;
    await this.start(this.profile, this.dark, plugin, this.screen);
  }

  /** A button pressed and let go (or a tap), as on the device. The
   *  device's clock is brought to now first: its time stands while nothing
   *  is due, and a press taken in at the old time would last until now, a
   *  long press. */
  input(event: InputEvent): Promise<void> {
    return this.guard(() => {
      this.step();
      if (event.kind === "tap") {
        this.live.pointer("down", event.x, event.y, this.clock());
        this.skew += SHORT_PRESS;
        this.step();
        this.live.pointer("up", event.x, event.y, this.clock());
        this.settle();
        return;
      }
      if (!this.live.button(event.name, true, this.clock())) throw new Error(`The ${this.profile?.name ?? "reader"} has no button ${event.name}.`);
      this.skew += event.long ? LONG_PRESS : SHORT_PRESS;
      this.step();
      this.live.button(event.name, false, this.clock());
      this.settle();
    });
  }

  /** A screen as a PNG: the author's reader as it shows, or another device,
   *  night mode or the sleep screen, made apart. */
  async screenshot(profile?: Profile, dark?: boolean, screen?: Screen): Promise<{ png: string; width: number; height: number }> {
    const target = profile ?? this.profile!;
    const asleep = (screen ?? this.screen) === "sleep";
    if (asleep && !canSleep(target)) {
      throw new Error(`The ${target.name} runs Android, which shows its own screen while it sleeps: PaperPaw draws none there.`);
    }
    const same = target.id === this.profile?.id && (dark ?? this.dark) === this.dark && asleep === (this.screen === "sleep");
    const image = await this.guard(() => {
      this.step();
      return same ? this.live.shown() : this.live.snapshot({ profile: target.id, dark: dark ?? this.dark, asleep });
    });
    return { png: await png(image), width: image.width, height: image.height };
  }

  /** paperpaw-dev's checks on the author's device: of the data plugin on
   *  the card (its folder, its files, its screens drawn), and of the
   *  plugins with code named (`plugins`, ids) as `check --plugin` does. */
  check(plugins: string[] = []): Promise<Finding[]> {
    return this.guard(() => {
      const data = !!this.plugin && Object.keys(this.plugin.files).length > 0;
      if (!data && plugins.length === 0) return [];
      const report = this.live.check(plugins.length ? CODE_CHECKS : CHECKS, plugins);
      return report.findings.map((f) => ({
        check: f.check,
        level: f.level,
        place: f.place || "(folder)",
        message: f.message + (f.variants.length > 1 ? ` (${f.variants.join(", ")})` : ""),
      }));
    });
  }

  /** Runs `work` on the author's reader; if the module stops, a fresh
   *  instance starts on the home screen, and the request fails saying so. */
  private async guard<T>(work: () => T): Promise<T> {
    try {
      return work();
    } catch (e) {
      if (!(e instanceof WebAssembly.RuntimeError)) throw e;
      const refused = this.live.refused();
      await this.recover();
      throw new Error(stopped(refused));
    }
  }

  private async recover(): Promise<void> {
    clearTimeout(this.timer);
    this.live = await this.live.fresh();
    this.screen = "home";
    if (this.profile) {
      boot(this.live, this.profile, this.dark, this.plugin);
      this.step();
    }
  }

  /** A finger on the screen (the frame maps it to the device's pixels). */
  pointer(phase: "down" | "move" | "up" | "cancel", x: number, y: number): Promise<void> {
    if (!this.profile?.touch) return Promise.resolve();
    return this.guard(() => {
      if (phase === "down") this.step();
      this.live.pointer(phase, x, y, this.clock());
      this.step();
    });
  }

  /** The device's time: the page's, and what presses held on top. */
  private clock(): number {
    return performance.now() - this.started + this.skew;
  }

  /** Lets the author's device's time pass, draws, and waits for what is
   *  due next; answers how soon that is. */
  private step(): number | null {
    clearTimeout(this.timer);
    const next = this.live.advance(this.clock());
    this.requestDraw();
    if (next !== null) this.timer = setTimeout(() => this.tick(), Math.max(next, 1));
    return next;
  }

  /** After a press: the device's time runs on while what the press set off
   *  is due soon, as when a person waits a moment between presses. */
  private settle(): void {
    let ran = 0;
    for (let next = this.step(); next !== null && next <= SOON && ran < SETTLE; next = this.step()) {
      const wait = Math.max(next, 1);
      this.skew += wait;
      ran += wait;
    }
  }

  /** A step of its own (a timer): a stop starts it fresh. */
  private tick(): void {
    try {
      this.step();
    } catch (e) {
      if (e instanceof WebAssembly.RuntimeError) void this.recover();
      else throw e;
    }
  }

  /** The next frame to the frame, soon: one at a time, and on while the
   *  device animates. */
  private requestDraw(): void {
    if (this.drawing) return;
    this.drawing = setTimeout(() => {
      this.drawing = undefined;
      try {
        this.draw(this.live.frame());
        if (this.live.animating()) this.requestDraw();
      } catch (e) {
        if (e instanceof WebAssembly.RuntimeError) void this.recover();
        else throw e;
      }
    }, 16);
  }
}

/** The module at `url`, if it is not too large, compiled. */
async function device(url: URL): Promise<PaperPawDevice> {
  const answer = await fetch(url);
  if (!answer.ok) throw new Error(`The reader's module could not be fetched (${answer.status}).`);
  const size = Number(answer.headers.get("content-length") ?? 0);
  if (size > MAX_MODULE) throw new Error(`The reader's module is larger than ${MAX_MODULE / 1024 / 1024} MB.`);
  const bytes = await answer.arrayBuffer();
  if (bytes.byteLength > MAX_MODULE) throw new Error(`The reader's module is larger than ${MAX_MODULE / 1024 / 1024} MB.`);
  return PaperPawDevice.from(await WebAssembly.compile(bytes));
}


/** A device of `profile`, the plugin on its card, started. */
function boot(device: PaperPawDevice, profile: Profile, dark: boolean, plugin: PluginFiles | undefined): void {
  device.create({ profile: profile.id, language: "en", dark });
  for (const [path, bytes] of Object.entries(plugin?.files ?? {})) device.putFile(plugin!.id, path, bytes);
  device.start();
}

async function png(image: ImageData): Promise<string> {
  const canvas = new OffscreenCanvas(image.width, image.height);
  canvas.getContext("2d")!.putImageData(image, 0, 0);
  const bytes = new Uint8Array(await (await canvas.convertToBlob({ type: "image/png" })).arrayBuffer());
  let text = "";
  for (let i = 0; i < bytes.length; i += 0x8000) text += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(text);
}
