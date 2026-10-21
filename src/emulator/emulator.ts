// The workshop's side of the emulator: one interface, two kinds behind
// it. `FrameEmulator` talks to the frame in a sandboxed iframe (the stub
// now, PaperPaw's web shell later); tests use a fake (fake.ts).

import type { Finding } from "../checks/data";
import type { Profile, Registry } from "../handbook/handbook";
import type {
  Answer,
  CheckResult,
  Fixture,
  Hello,
  InputEvent,
  NetworkMode,
  PluginFiles,
  Ready,
  Request,
  Screen,
  ScreenshotResult,
  SeenRequest,
  Stopped,
} from "./protocol";

export interface Emulator {
  /** Whether it is the stub rather than PaperPaw's real emulator. */
  readonly stub: boolean;
  start(profile: Profile, dark: boolean, plugin: PluginFiles, screen?: Screen): Promise<void>;
  setFiles(plugin: PluginFiles): Promise<void>;
  input(event: InputEvent): Promise<void>;
  /** The screen of `profile` (the one shown, if none), as a PNG. */
  screenshot(profile?: Profile, dark?: boolean, screen?: Screen): Promise<ScreenshotResult>;
  /** paperpaw-dev's checks of the data plugin, and of `plugins` (ids of
   *  plugins with code the module runs). */
  check(plugins?: string[]): Promise<Finding[]>;
  /** Runs PaperPaw from another module (a build's), or `null` for the
   *  one the workshop brings. */
  useModule(url: string | null): Promise<void>;
  /** Why PaperPaw was stopped and started again while nothing was asked
   *  of it, since this was last asked; undefined if it was not. */
  takeStopped(): string | undefined;
  /** The remote control's command on the reader shown (an x4-remote line);
   *  its answer. */
  command(line: string): Promise<Record<string, unknown>>;
  /** Waits until the screen is `text` (its id) or shows it. */
  until(text: string, timeout?: number): Promise<void>;
  /** The recorded answers for plugins' requests, and the network's mode. */
  setNetwork(fixtures: Fixture[], mode: NetworkMode): Promise<void>;
  /** The requests plugins made since asked last. */
  requests(): Promise<SeenRequest[]>;
}

/** How long a request to the frame may take: longer than the frame's own
 *  watchdog (frame/shell/host.ts), which answers every request in time,
 *  if need be by stopping PaperPaw and starting it again. */
const TIMEOUT = 120_000;

export class FrameEmulator implements Emulator {
  stub = true;
  private next = 1;
  private waiting = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
  private ready: Promise<void>;
  private greeting: ReturnType<typeof setTimeout> | undefined;
  private listener: (event: MessageEvent) => void;
  private stopped: string | undefined;
  /** Told when PaperPaw was stopped with nothing asked (for the page). */
  onStopped: ((why: string) => void) | undefined;

  constructor(
    private frame: HTMLIFrameElement,
    private registry: Registry,
  ) {
    let resolveReady!: () => void;
    let isReady = false;
    this.ready = new Promise((r) => (resolveReady = r));
    // Either side may load first: greet the frame until it answers.
    const greet = () => {
      if (isReady) return;
      const hello: Hello = { type: "hello" };
      this.frame.contentWindow?.postMessage(hello, "*");
      this.greeting = setTimeout(greet, 200);
    };
    greet();
    this.listener = (event: MessageEvent) => {
      // The frame's origin is opaque ("null"): trust only its window.
      if (event.source !== this.frame.contentWindow) return;
      const data = event.data as Answer | Ready | Stopped;
      if ("type" in data && data.type === "stopped") {
        this.stopped = data.why;
        this.onStopped?.(data.why);
        return;
      }
      if ("type" in data && data.type === "ready") {
        this.stub = data.stub;
        isReady = true;
        resolveReady();
        return;
      }
      const answer = data as Answer;
      const pending = this.waiting.get(answer.id);
      if (!pending) return;
      this.waiting.delete(answer.id);
      if (answer.ok) pending.resolve(answer.result);
      else pending.reject(new Error(answer.error));
    };
    window.addEventListener("message", this.listener);
  }

  /** Stops listening and greeting: the page with the frame is gone. Requests
   *  still waiting fail. */
  dispose(): void {
    clearTimeout(this.greeting);
    window.removeEventListener("message", this.listener);
    for (const pending of this.waiting.values()) pending.reject(new Error("the reader was closed"));
    this.waiting.clear();
  }

  private async send<T>(request: Request): Promise<T> {
    await this.ready;
    const id = this.next++;
    return new Promise<T>((resolve, reject) => {
      this.waiting.set(id, { resolve: resolve as (v: unknown) => void, reject });
      // The frame has an opaque origin, so "*": nothing secret goes there.
      this.frame.contentWindow?.postMessage({ id, ...request }, "*");
      setTimeout(() => {
        if (this.waiting.delete(id)) reject(new Error(`the emulator did not answer ${request.type}`));
      }, TIMEOUT);
    });
  }

  start(profile: Profile, dark: boolean, plugin: PluginFiles, screen?: Screen): Promise<void> {
    return this.send({ type: "start", profile, dark, plugins: [plugin], registry: this.registry, screen });
  }

  setFiles(plugin: PluginFiles): Promise<void> {
    return this.send({ type: "files", plugin });
  }

  input(event: InputEvent): Promise<void> {
    return this.send({ type: "input", event });
  }

  screenshot(profile?: Profile, dark?: boolean, screen?: Screen): Promise<ScreenshotResult> {
    return this.send({ type: "screenshot", profile, dark, screen });
  }

  check(plugins?: string[]): Promise<CheckResult> {
    return this.send({ type: "check", plugins });
  }

  takeStopped(): string | undefined {
    const why = this.stopped;
    this.stopped = undefined;
    return why;
  }

  useModule(url: string | null): Promise<void> {
    // The frame may live on another origin (paperpaw.org's sandbox host):
    // the address as this page means it.
    return this.send({ type: "module", url: url && new URL(url, location.href).href });
  }

  command(line: string): Promise<Record<string, unknown>> {
    return this.send({ type: "command", line });
  }

  until(text: string, timeout?: number): Promise<void> {
    return this.send({ type: "until", text, timeout });
  }

  setNetwork(fixtures: Fixture[], mode: NetworkMode): Promise<void> {
    return this.send({ type: "network", fixtures, mode });
  }

  requests(): Promise<SeenRequest[]> {
    return this.send({ type: "requests" });
  }
}
