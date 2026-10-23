// The reader for the AI's tools in the app: PaperPaw's own emulator,
// `paperpaw-emu --stdio` behind the Rust side (src-tauri's emulator.rs),
// as the tools know an emulator (src/emulator/emulator.ts). One reader at
// a time: a screenshot of another starts that one, then the one shown
// again. The checks are the window's (checks.ts), so a turn's check and
// the one after a save are one run.

import type { Finding } from "../checks/data";
import type { Emulator } from "../emulator/emulator";
import type { Fixture, InputEvent, NetworkMode, PluginFiles, ScreenshotResult, Screen, SeenRequest } from "../emulator/protocol";
import type { Profile } from "../handbook/handbook";
import type { Project } from "../project/project";
import type { Backend, Part } from "./backend";
import type { Checker } from "./checks";

/** How long a long press is held. */
const LONG_MS = 800;
/** How often `until` looks. */
const LOOK_MS = 250;

/** What `paperpaw-emu --stdio` cannot do yet (PaperPaw's protocol 1). */
export class NotYet extends Error {
  constructor(what: string) {
    super(`${what} is not in this PaperPaw's emulator yet.`);
  }
}

export class NativeEmulator implements Emulator {
  readonly stub = false;
  private shown: Profile | undefined;
  private requestsSeen = 0;

  constructor(
    private backend: Backend,
    /** The project (its folder's name and its files), for the reader and
     *  the checks. */
    private project: () => Project | null,
    private checker: Checker,
    /** Saves the project's files to its folder, before the reader takes
     *  them. */
    private saved: () => Promise<void>,
  ) {}

  async start(profile: Profile, _dark: boolean, plugin: PluginFiles, _screen?: Screen): Promise<void> {
    this.shown = profile;
    await this.backend.emulatorStart(profile.id);
    await this.setFiles(plugin);
  }

  /** The plugin onto the reader shown: the project's folder saved first,
   *  the reader takes it from there and starts again. */
  async setFiles(_plugin: PluginFiles): Promise<void> {
    await this.saved();
    const project = this.project();
    if (project) await this.backend.emulatorSync(project.key);
  }

  async input(event: InputEvent): Promise<void> {
    if (event.kind === "tap") {
      await this.backend.emulatorPointer("down", event.x, event.y);
      await this.backend.emulatorPointer("up", event.x, event.y);
      return;
    }
    await this.backend.emulatorButton(event.name, true);
    await new Promise((r) => setTimeout(r, event.long ? LONG_MS : 60));
    await this.backend.emulatorButton(event.name, false);
  }

  async screenshot(profile?: Profile, _dark?: boolean, _screen?: Screen): Promise<ScreenshotResult> {
    const shown = this.shown;
    const other = profile && shown && profile.id !== shown.id;
    if (other) await this.backend.emulatorStart(profile.id);
    try {
      const png = await this.backend.emulatorShot();
      const at = profile ?? shown;
      return { png, width: at?.width ?? 0, height: at?.height ?? 0 };
    } finally {
      if (other) await this.backend.emulatorStart(shown.id);
    }
  }

  async check(plugins?: string[]): Promise<Finding[]> {
    if (plugins?.length) throw new NotYet("Checking plugins with code");
    const project = this.project();
    if (!project) return [];
    const done = await this.checker.plugin(project);
    if (done.state === "failed") throw new Error(done.message);
    return done.state === "done" ? done.found.map(({ check, level, place, message }) => ({ check, level, place, message })) : [];
  }

  async useModule(url: string | null): Promise<void> {
    if (url) throw new NotYet("Running a plugin with code");
  }

  takeStopped(): string | undefined {
    return undefined;
  }

  /** The remote control's lines the tools send (tools/control.ts), as far
   *  as PaperPaw's protocol has them: describe, show, run. */
  async command(line: string): Promise<Record<string, unknown>> {
    const [what, id, ...rest] = line.split(" ");
    switch (what) {
      case "describe": {
        const described = await this.backend.emulatorDescribe();
        return { parts: described.parts.map(asPart) };
      }
      case "show":
        await this.backend.emulatorOpen(id!, Object.fromEntries(rest.map(unpair)));
        await settle();
        return { ok: true };
      case "run":
        await this.backend.emulatorRun(id!);
        await settle();
        return { ok: true };
      default:
        throw new NotYet(`"${what}"`);
    }
  }

  /** Until a part's label shows `text`, at most `timeout` ms. */
  async until(text: string, timeout = 10_000): Promise<void> {
    const end = Date.now() + timeout;
    for (;;) {
      const { parts } = await this.backend.emulatorDescribe();
      if (parts.some((p) => p.label.includes(text))) return;
      if (Date.now() > end) throw new Error(`"${text}" was not shown within ${timeout} ms`);
      await new Promise((r) => setTimeout(r, LOOK_MS));
    }
  }

  async setNetwork(fixtures: Fixture[], _mode: NetworkMode): Promise<void> {
    if (fixtures.length) throw new NotYet("Recorded answers for a plugin's requests");
  }

  /** The requests the plugin made since asked last, as PaperPaw tells them. */
  async requests(): Promise<SeenRequest[]> {
    const [, requests] = await this.backend.emulatorTold();
    return requests.map((said) => {
      const [method, ...url] = said.split(" ");
      return { id: ++this.requestsSeen, method: method ?? "GET", url: url.join(" "), source: "fetch", status: null };
    });
  }
}

/** A part as the tools describe it: its state in one word. */
function asPart(p: Part): Record<string, unknown> {
  const state = p.focused ? "focused" : p.on ? "on" : "-";
  return { role: p.role, label: p.label, x: p.x, y: p.y, width: p.width, height: p.height, state };
}

/** `key=hex` as the remote's lines carry parameters. */
function unpair(word: string): [string, string] {
  const [key, hex = "-"] = word.split("=");
  const bytes = hex === "-" ? [] : (hex.match(/../g) ?? []).map((b) => parseInt(b, 16));
  return [key ?? "", new TextDecoder().decode(new Uint8Array(bytes))];
}

/** A moment for the reader to draw what was opened. */
function settle(): Promise<void> {
  return new Promise((r) => setTimeout(r, 300));
}
