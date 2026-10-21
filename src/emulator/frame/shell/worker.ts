// PaperPaw's emulator in a worker of the frame's (host.ts starts it): a
// plugin's code that never returns, or a check that takes long, blocks
// this worker only. The frame's main thread stays free to draw, to take
// touches and to start a new worker when this one stops answering.

import type { Request } from "../../protocol";
import { ShellReader } from "./reader";

/** From the frame. */
export type ToWorker =
  /** The emulator's module (absolute: a worker made from a blob has no
   *  address of its own to resolve against), and a build's to run, if any. */
  | { type: "init"; emulator: string; module: string | null }
  | { type: "request"; id: number; request: Request }
  | { type: "pointer"; phase: "down" | "move" | "up" | "cancel"; x: number; y: number }
  | { type: "ping" };

/** To the frame. */
export type FromWorker =
  | { type: "ready" }
  | { type: "failed"; error: string }
  | { type: "answer"; id: number; ok: true; result?: unknown }
  | { type: "answer"; id: number; ok: false; error: string }
  | { type: "frame"; width: number; height: number; data: ArrayBuffer }
  | { type: "pong" };

/** The worker's own scope (the "webworker" library is not in this
 *  project's types). */
const scope = self as unknown as {
  postMessage(message: unknown, transfer: Transferable[]): void;
  addEventListener(type: "message", listener: (event: MessageEvent<ToWorker>) => void): void;
};
const post = (message: FromWorker, transfer: Transferable[] = []) => scope.postMessage(message, transfer);

let reader: ShellReader | undefined;
// One at a time, in the order sent.
let queue: Promise<void> = Promise.resolve();

function draw(frame: ImageData): void {
  const data = frame.data.buffer as ArrayBuffer;
  post({ type: "frame", width: frame.width, height: frame.height, data }, [data]);
}

async function handle(r: ShellReader, request: Request): Promise<unknown> {
  switch (request.type) {
    case "start":
      return r.start(request.profile, request.dark, request.plugins[0], request.screen);
    case "files":
      return r.setFiles(request.plugin);
    case "input":
      return r.input(request.event);
    case "screenshot":
      return r.screenshot(request.profile, request.dark, request.screen);
    case "check":
      return r.check(request.plugins);
    case "module":
      return r.useModule(request.url === null ? null : new URL(request.url));
  }
}

scope.addEventListener("message", (event: MessageEvent<ToWorker>) => {
  const message = event.data;
  switch (message.type) {
    case "ping":
      post({ type: "pong" });
      return;
    case "init":
      queue = queue.then(async () => {
        try {
          reader = await ShellReader.load(new URL(message.emulator), draw);
          if (message.module) await reader.useModule(new URL(message.module));
          post({ type: "ready" });
        } catch (e) {
          post({ type: "failed", error: e instanceof Error ? e.message : String(e) });
        }
      });
      return;
    case "pointer":
      queue = queue.then(() => reader?.pointer(message.phase, message.x, message.y).catch(() => {}));
      return;
    case "request": {
      const { id, request } = message;
      queue = queue.then(async () => {
        try {
          if (!reader) throw new Error("PaperPaw's emulator is not loaded.");
          post({ type: "answer", id, ok: true, result: await handle(reader, request) });
        } catch (e) {
          post({ type: "answer", id, ok: false, error: e instanceof Error ? e.message : String(e) });
        }
      });
    }
  }
});
