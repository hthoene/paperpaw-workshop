// An emulator without a browser, for tests: it keeps what it is given,
// checks with the workshop's own checks, and answers screenshots with a
// tiny picture.

import { checkDataPlugin, type Finding } from "../checks/data";
import type { Profile, Registry } from "../handbook/handbook";
import type { Emulator } from "./emulator";
import type { InputEvent, PluginFiles, Screen, ScreenshotResult } from "./protocol";

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

  /** The plugins with code asked to be checked, in order. */
  checked: (string[] | undefined)[] = [];

  async check(plugins?: string[]): Promise<Finding[]> {
    this.checked.push(plugins);
    return checkDataPlugin(this.plugin?.files ?? {}, this.registry);
  }
}
