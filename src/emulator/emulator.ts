// The workshop's side of the emulator: one interface, two kinds behind
// it. `FrameEmulator` talks to the frame in a sandboxed iframe (the stub
// now, PaperPaw's web shell later); tests use a fake (fake.ts).

import type { Finding } from "../checks/data";
import type { Profile, Registry } from "../handbook/handbook";
import type { Answer, CheckResult, Hello, InputEvent, PluginFiles, Ready, Request, Screen, ScreenshotResult } from "./protocol";

export interface Emulator {
  /** Whether it is the stub rather than PaperPaw's real emulator. */
  readonly stub: boolean;
  start(profile: Profile, dark: boolean, plugin: PluginFiles, screen?: Screen): Promise<void>;
  setFiles(plugin: PluginFiles): Promise<void>;
  input(event: InputEvent): Promise<void>;
  /** The screen of `profile` (the one shown, if none), as a PNG. */
  screenshot(profile?: Profile, dark?: boolean, screen?: Screen): Promise<ScreenshotResult>;
  check(): Promise<Finding[]>;
}

/** How long a request to the frame may take. */
const TIMEOUT = 20_000;

export class FrameEmulator implements Emulator {
  stub = true;
  private next = 1;
  private waiting = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
  private ready: Promise<void>;
  private greeting: ReturnType<typeof setTimeout> | undefined;
  private listener: (event: MessageEvent) => void;

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
      const data = event.data as Answer | Ready;
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

  check(): Promise<CheckResult> {
    return this.send({ type: "check" });
  }
}
