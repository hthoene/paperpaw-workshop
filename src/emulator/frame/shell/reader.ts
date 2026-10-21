// The real reader: PaperPaw's web emulator (its `shells/web`, built to
// public/emulator/paperpaw-web.wasm by `npm run emulator`), the same
// kernel, plugins, device profiles and panel as PaperPaw on the X4, the
// X4 Pro and the Boox.
//
// The frame answers the workshop's messages (../../protocol.ts) with it.
// One instance of the module is the reader the author sees and presses;
// a second one, made when first needed, takes the screenshots the AI asks
// for on another device, in night mode or asleep, so the author's reader
// stays as it is.
//
// A module that stops (a WebAssembly trap: PaperPaw panicked or ran out
// of the device's memory) cannot go on; it is loaded anew and the reader
// started again on its home screen, and the request says what happened.

import type { Finding } from "../../../checks/data";
import type { Profile } from "../../../handbook/handbook";
import { canSleep, type InputEvent, type PluginFiles, type Screen } from "../../protocol";
import { PaperPawDevice } from "./paperpaw-web.js";

/** paperpaw-dev's checks the module runs here. Not `reach`: it measures
 *  time with std::time, which panics in WebAssembly (and leaves the
 *  module unusable), so it waits for PaperPaw's fix. */
const CHECKS = ["package", "lint", "visual"];
/** A plugin of the workshop's own on every card: it switches off the tip on
 *  gestures that PaperPaw shows over everything on a touch screen's first
 *  start, as PaperPaw's own tests do. Its findings are left out. */
const PREVIEW_ID = "workshop-preview";
const PREVIEW: Record<string, Uint8Array> = {
  "plugin.ini": new TextEncoder().encode("[plugin]\nid = workshop-preview\nname = Workshop preview\nversion = 1.0.0\nformats = 1\n"),
  "settings.ini": new TextEncoder().encode("[home]\ngesture-tips = false\n"),
};
/** How long a press holds, in the device's time: a short one, a long one. */
const SHORT_PRESS = 150;
const LONG_PRESS = 1000;
/** How far a screenshot lets the device's time run to settle, at most. */
const SETTLE = 10_000;

/** What a request is told when the module stopped. */
export const STOPPED =
  "PaperPaw stopped on this reader while doing this (it panicked or ran out of the device's memory). The reader was started again on its home screen.";

export class ShellReader {
  profile: Profile | undefined;
  dark = false;
  screen: Screen = "home";
  private plugin: PluginFiles | undefined;
  private shots: PaperPawDevice | undefined;
  private started = performance.now();
  /** Device time added to the clock: a long press holds without waiting. */
  private skew = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private drawing = false;

  private constructor(
    private live: PaperPawDevice,
    private url: URL,
    private canvas: HTMLCanvasElement,
  ) {
    this.touch();
  }

  /** The module from `url`, drawing into `canvas`. */
  static async load(url: URL, canvas: HTMLCanvasElement): Promise<ShellReader> {
    return new ShellReader(await PaperPawDevice.load(url), url, canvas);
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
        this.live.button("power", true);
        this.skew += 200;
        this.step();
        this.live.button("power", false);
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
        this.live.pointer("down", event.x, event.y);
        this.skew += SHORT_PRESS;
        this.step();
        this.live.pointer("up", event.x, event.y);
        this.step();
        return;
      }
      if (!this.live.button(event.name, true)) throw new Error(`The ${this.profile?.name ?? "reader"} has no button ${event.name}.`);
      this.skew += event.long ? LONG_PRESS : SHORT_PRESS;
      this.step();
      this.live.button(event.name, false);
      this.step();
    });
  }

  /** Fingers on the screen, where the device has a touch screen: the
   *  canvas's pointer events as the device's own, in its pixels. */
  private touch(): void {
    const at = (event: PointerEvent): [number, number] => {
      // The canvas shows the panel whole (object-fit: contain), centred.
      const rect = this.canvas.getBoundingClientRect();
      const scale = Math.min(rect.width / this.canvas.width, rect.height / this.canvas.height);
      const left = rect.left + (rect.width - this.canvas.width * scale) / 2;
      const top = rect.top + (rect.height - this.canvas.height * scale) / 2;
      return [(event.clientX - left) / scale, (event.clientY - top) / scale];
    };
    const phases = { pointerdown: "down", pointermove: "move", pointerup: "up", pointercancel: "cancel" } as const;
    for (const [type, phase] of Object.entries(phases)) {
      this.canvas.addEventListener(type, (event) => {
        const e = event as PointerEvent;
        if (!this.profile?.touch || (phase === "move" && !e.buttons)) return;
        if (phase === "down") {
          this.canvas.setPointerCapture(e.pointerId);
          this.step();
        }
        const [x, y] = at(e);
        void this.guard(() => {
          this.live.pointer(phase, x, y);
          this.step();
        }).catch(() => {});
      });
    }
  }

  /** A screen as a PNG: the author's reader, or another device, in night
   *  mode or asleep, from the second instance. */
  async screenshot(profile?: Profile, dark?: boolean, screen?: Screen): Promise<{ png: string; width: number; height: number }> {
    const target = profile ?? this.profile!;
    const asleep = (screen ?? this.screen) === "sleep";
    if (asleep && !canSleep(target)) {
      throw new Error(`The ${target.name} runs Android, which shows its own screen while it sleeps: PaperPaw draws none there.`);
    }
    const same = target.id === this.profile?.id && (dark ?? this.dark) === this.dark && asleep === (this.screen === "sleep");
    let image: ImageData;
    if (same) {
      image = await this.guard(() => {
        this.step();
        return this.live.shown();
      });
    } else {
      this.shots ??= await PaperPawDevice.load(this.url);
      const device = this.shots;
      try {
        boot(device, target, dark ?? this.dark, this.plugin);
        settle(device);
        if (asleep) this.sleep(device, target);
        image = device.shown();
      } catch (e) {
        if (!(e instanceof WebAssembly.RuntimeError)) throw e;
        this.shots = undefined;
        throw new Error(STOPPED.replace(" The reader was started again on its home screen.", ""));
      }
    }
    return { png: await png(image), width: image.width, height: image.height };
  }

  /** paperpaw-dev's checks of the plugin, on the author's device: its
   *  folder, its files, and its screens drawn. */
  check(): Promise<Finding[]> {
    return this.guard(() => {
      if (!this.plugin || Object.keys(this.plugin.files).length === 0) return [];
      const report = this.live.check(CHECKS);
      return report.findings.filter((f) => f.plugin !== PREVIEW_ID).map((f) => ({
        check: f.check,
        level: f.level,
        place: f.place || "(folder)",
        message: f.message + (f.variants.length > 1 ? ` (${f.variants.join(", ")})` : ""),
      }));
    });
  }

  /** Runs `work` on the author's reader; if the module stops, it is loaded
   *  anew, started on its home screen, and the request fails saying so. */
  private async guard<T>(work: () => T): Promise<T> {
    try {
      return work();
    } catch (e) {
      if (!(e instanceof WebAssembly.RuntimeError)) throw e;
      await this.reload();
      throw new Error(STOPPED);
    }
  }

  private async reload(): Promise<void> {
    clearTimeout(this.timer);
    this.live = await PaperPawDevice.load(this.url);
    this.screen = "home";
    if (this.profile) {
      boot(this.live, this.profile, this.dark, this.plugin);
      this.step();
    }
  }

  /** Puts the device to sleep, as its power button does. */
  private sleep(device: PaperPawDevice, profile: Profile): void {
    if (!canSleep(profile)) return;
    device.button("power", true);
    settle(device);
    device.button("power", false);
    settle(device);
  }

  /** Lets the author's device's time pass, draws, and waits for what is
   *  due next. */
  private step(): void {
    clearTimeout(this.timer);
    const next = this.live.advance(performance.now() - this.started + this.skew);
    this.requestDraw();
    if (next !== null) this.timer = setTimeout(() => this.tick(), Math.max(next, 1));
  }

  /** A step of its own (a timer, a frame drawn): a stop reloads it. */
  private tick(): void {
    try {
      this.step();
    } catch (e) {
      if (e instanceof WebAssembly.RuntimeError) void this.reload();
      else throw e;
    }
  }

  private requestDraw(): void {
    if (this.drawing) return;
    this.drawing = true;
    requestAnimationFrame(() => {
      this.drawing = false;
      try {
        const [width, height] = this.live.size();
        if (this.canvas.width !== width || this.canvas.height !== height) {
          this.canvas.width = width;
          this.canvas.height = height;
        }
        this.canvas.getContext("2d")!.putImageData(this.live.frame(), 0, 0);
        if (this.live.animating()) this.requestDraw();
      } catch (e) {
        if (e instanceof WebAssembly.RuntimeError) void this.reload();
        else throw e;
      }
    });
  }
}

/** A device of `profile`, the plugin on its card, started. */
function boot(device: PaperPawDevice, profile: Profile, dark: boolean, plugin: PluginFiles | undefined): void {
  device.create({ profile: profile.id, language: "en", dark });
  for (const [path, bytes] of Object.entries(PREVIEW)) device.putFile(PREVIEW_ID, path, bytes);
  for (const [path, bytes] of Object.entries(plugin?.files ?? {})) device.putFile(plugin!.id, path, bytes);
  device.start();
}

/** Each device's own clock, run by `settle`. */
const clocks = new WeakMap<PaperPawDevice, number>();

/** Lets a device's time run, without waiting, until nothing is due soon. */
function settle(device: PaperPawDevice): void {
  let now = clocks.get(device) ?? 0;
  const end = now + SETTLE;
  for (let i = 0; i < 500 && now < end; i++) {
    const next = device.advance(now);
    if (next === null || next > 2000) break;
    now += Math.max(next, 1);
  }
  clocks.set(device, now);
}

async function png(image: ImageData): Promise<string> {
  const canvas = new OffscreenCanvas(image.width, image.height);
  canvas.getContext("2d")!.putImageData(image, 0, 0);
  const bytes = new Uint8Array(await (await canvas.convertToBlob({ type: "image/png" })).arrayBuffer());
  let text = "";
  for (let i = 0; i < bytes.length; i += 0x8000) text += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(text);
}
