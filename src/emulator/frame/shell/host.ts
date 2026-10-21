// The frame's side of the emulator's worker (worker.ts): it passes the
// workshop's requests on, draws the frames the worker sends, and passes
// touches on in the device's pixels. And it watches: a request that takes
// longer than its time, or a worker that stops answering while nothing is
// asked of it (a plugin's code that never returns, in a timer), ends that
// worker; a new one starts with the same module and the same device, on
// its home screen, and the request says what happened.

import type { Request } from "../../protocol";
// The worker from a blob: this frame's origin is opaque (a sandbox), and
// such a page may start no worker from an address.
import ReaderWorker from "./worker?worker&inline";
import type { FromWorker, ToWorker } from "./worker";

/** How long each request may take before the worker is taken to be
 *  stuck, in milliseconds. Starting and a new module include fetching and
 *  compiling PaperPaw. */
const TIME: Record<Request["type"], number> = {
  start: 30_000,
  files: 30_000,
  input: 15_000,
  screenshot: 20_000,
  check: 60_000,
  module: 90_000,
  command: 15_000,
  // Its own wait is at most UNTIL_MOST (reader.ts).
  until: 40_000,
  network: 10_000,
  requests: 10_000,
};
/** How often an idle worker is asked whether it is there, and how long it
 *  may go without answering. */
const PING = 2_000;
const SILENT = 10_000;

/** What a request is told when the worker was stopped for it. */
export function stuck(seconds: number): string {
  return `PaperPaw did not answer in ${seconds} seconds (a loop that does not end, or work far too long for a reader) and was stopped. The reader was started again on its home screen.`;
}

interface Waiting {
  resolve(result: unknown): void;
  reject(error: Error): void;
  timer: ReturnType<typeof setTimeout>;
}

export class WorkerReader {
  private worker!: Worker;
  private next = 1;
  private waiting = new Map<number, Waiting>();
  private heard = Date.now();
  /** What a new worker needs to show the same device: the module and the
   *  last start, with the plugin's files as they are now. */
  private module: string | null = null;
  private lastStart: Extract<Request, { type: "start" }> | undefined;
  private size: [number, number] = [0, 0];
  /** A new worker being started: requests wait for it. */
  private restarting: Promise<void> = Promise.resolve();

  private constructor(
    private emulator: string,
    private canvas: HTMLCanvasElement,
    private onStopped: (why: string) => void,
  ) {
    this.touch();
    setInterval(() => this.watch(), PING);
  }

  /** The emulator from `emulator` (absolute) in a worker, drawing into
   *  `canvas`; fails if PaperPaw's module is not there. */
  static async load(emulator: string, canvas: HTMLCanvasElement, onStopped: (why: string) => void): Promise<WorkerReader> {
    const reader = new WorkerReader(emulator, canvas, onStopped);
    await reader.spawn();
    return reader;
  }

  /** Answers a request of the workshop's, or fails saying why. */
  async request(request: Request): Promise<unknown> {
    await this.restarting;
    return this.dispatch(request);
  }

  private dispatch(request: Request): Promise<unknown> {
    if (request.type === "start") this.lastStart = request;
    if (request.type === "files" && this.lastStart) this.lastStart = { ...this.lastStart, plugins: [request.plugin] };
    if (request.type === "module") this.module = request.url === null ? null : new URL(request.url, document.baseURI).href;
    const sent = request.type === "module" ? { ...request, url: this.module } : request;
    const id = this.next++;
    return new Promise((resolve, reject) => {
      const limit = TIME[request.type];
      const timer = setTimeout(() => void this.stuck(id, limit), limit);
      this.waiting.set(id, { resolve, reject, timer });
      this.send({ type: "request", id, request: sent });
    });
  }

  private send(message: ToWorker): void {
    this.worker.postMessage(message);
  }

  /** A new worker with the module; resolves once it can take requests. */
  private spawn(): Promise<void> {
    this.worker = new ReaderWorker();
    this.heard = Date.now();
    return new Promise((resolve, reject) => {
      this.worker.onmessage = (event: MessageEvent<FromWorker>) => {
        const message = event.data;
        this.heard = Date.now();
        switch (message.type) {
          case "ready":
            resolve();
            return;
          case "failed":
            reject(new Error(message.error));
            return;
          case "frame":
            this.paint(message);
            return;
          case "answer": {
            const waiting = this.waiting.get(message.id);
            if (!waiting) return;
            clearTimeout(waiting.timer);
            this.waiting.delete(message.id);
            if (message.ok) waiting.resolve(message.result);
            else waiting.reject(new Error(message.error));
          }
        }
      };
      this.send({ type: "init", emulator: this.emulator, module: this.module });
    });
  }

  /** The worker took too long for request `id`: it goes, the requests
   *  waiting fail, and a new one starts the device again. */
  private async stuck(id: number, limit: number): Promise<void> {
    if (!this.waiting.has(id)) return;
    await this.replace(stuck(Math.round(limit / 1000)));
  }

  /** An idle worker that stopped answering goes too. */
  private watch(): void {
    if (this.waiting.size === 0 && Date.now() - this.heard > SILENT) {
      // No request to fail: the page is told apart.
      const why = stuck(Math.round(SILENT / 1000));
      this.onStopped(why);
      void this.replace(why);
      return;
    }
    if (this.waiting.size === 0) this.send({ type: "ping" });
  }

  private replace(why: string): Promise<void> {
    this.worker.terminate();
    // The device as it was, on its home screen, before any request goes on.
    this.restarting = (async () => {
      try {
        await this.spawn();
        if (this.lastStart) await this.dispatch({ ...this.lastStart, screen: "home" });
      } catch (e) {
        console.error("paperpaw: the reader could not be started again:", e);
      }
    })();
    for (const waiting of this.waiting.values()) {
      clearTimeout(waiting.timer);
      waiting.reject(new Error(why));
    }
    this.waiting.clear();
    console.warn("paperpaw:", why);
    return this.restarting;
  }

  private paint(frame: { width: number; height: number; data: ArrayBuffer }): void {
    if (this.canvas.width !== frame.width || this.canvas.height !== frame.height) {
      this.canvas.width = frame.width;
      this.canvas.height = frame.height;
    }
    this.size = [frame.width, frame.height];
    const image = new ImageData(new Uint8ClampedArray(frame.data), frame.width, frame.height);
    this.canvas.getContext("2d")!.putImageData(image, 0, 0);
  }

  /** Fingers on the screen: the canvas's pointer events in the device's
   *  pixels, to the worker (which ignores them where there is no touch
   *  screen). */
  private touch(): void {
    const at = (event: PointerEvent): [number, number] => {
      // The canvas shows the panel whole (object-fit: contain), centred.
      const rect = this.canvas.getBoundingClientRect();
      const [width, height] = this.size;
      const scale = Math.min(rect.width / width, rect.height / height);
      const left = rect.left + (rect.width - width * scale) / 2;
      const top = rect.top + (rect.height - height * scale) / 2;
      return [(event.clientX - left) / scale, (event.clientY - top) / scale];
    };
    const phases = { pointerdown: "down", pointermove: "move", pointerup: "up", pointercancel: "cancel" } as const;
    for (const [type, phase] of Object.entries(phases)) {
      this.canvas.addEventListener(type, (event) => {
        const e = event as PointerEvent;
        if (!this.size[0] || (phase === "move" && !e.buttons)) return;
        if (phase === "down") this.canvas.setPointerCapture(e.pointerId);
        const [x, y] = at(e);
        this.send({ type: "pointer", phase, x, y });
      });
    }
  }
}
