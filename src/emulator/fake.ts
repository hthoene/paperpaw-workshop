// An emulator without a browser, for tests: it keeps what it is given,
// checks with the workshop's own checks, and answers screenshots with a
// tiny picture.

import { checkDataPlugin, type Finding } from "../checks/data";
import type { Profile, Registry } from "../handbook/handbook";
import type { Emulator } from "./emulator";
import type { Fixture, InputEvent, NetworkMode, PluginFiles, Screen, ScreenshotResult, SeenRequest } from "./protocol";

/** A 1x1 grey PNG. */
export const TINY_PNG =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVR4nGNoAAAAggCBd81ytgAAAABJRU5ErkJggg==";

export class FakeEmulator implements Emulator {
  readonly stub = true;
  plugin: PluginFiles | undefined;
  profile: Profile | undefined;
  inputs: InputEvent[] = [];
  screenshots: { profile?: string; dark?: boolean; screen?: string }[] = [];

  constructor(private registry: Registry) {}

  async start(profile: Profile, _dark: boolean, plugin: PluginFiles): Promise<void> {
    this.profile = profile;
    this.plugin = plugin;
  }

  async setFiles(plugin: PluginFiles): Promise<void> {
    this.plugin = plugin;
  }

  async input(event: InputEvent): Promise<void> {
    this.inputs.push(event);
  }

  async screenshot(profile?: Profile, dark?: boolean, screen?: Screen): Promise<ScreenshotResult> {
    this.screenshots.push({ profile: profile?.id, dark, screen });
    return { png: TINY_PNG, width: 1, height: 1 };
  }

  /** The modules it was told to run, in order. */
  modules: (string | null)[] = [];

  /** Set by a test: PaperPaw stopped with nothing asked. */
  stopped: string | undefined;

  takeStopped(): string | undefined {
    const why = this.stopped;
    this.stopped = undefined;
    return why;
  }

  async useModule(url: string | null): Promise<void> {
    this.modules.push(url);
  }

  /** The commands it was given, and what a test has them answer (by the
   *  line's first word); `describe` answers the home screen unless set. */
  commands: string[] = [];
  answers: Record<string, Record<string, unknown>> = {};
  /** The screen `until` finds (a test sets it); others are not shown. */
  showing = "core.home";
  network: { fixtures: Fixture[]; mode: NetworkMode } = { fixtures: [], mode: "fixtures" };
  /** Requests a test has plugins make, told once. */
  made: SeenRequest[] = [];

  async command(line: string): Promise<Record<string, unknown>> {
    this.commands.push(line);
    const word = line.split(" ")[0]!;
    return this.answers[word] ?? (word === "describe" ? { screen: this.showing, parts: [] } : {});
  }

  async until(text: string): Promise<void> {
    if (text !== this.showing) throw new Error(`Not shown in 10000 ms: ${text}.`);
  }

  async setNetwork(fixtures: Fixture[], mode: NetworkMode): Promise<void> {
    this.network = { fixtures, mode };
  }

  async requests(): Promise<SeenRequest[]> {
    const made = this.made;
    this.made = [];
    return made;
  }

  /** The plugins with code asked to be checked, in order. */
  checked: (string[] | undefined)[] = [];

  async check(plugins?: string[]): Promise<Finding[]> {
    this.checked.push(plugins);
    return checkDataPlugin(this.plugin?.files ?? {}, this.registry);
  }
}
