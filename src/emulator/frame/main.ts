// The emulator frame (frame.html): answers the workshop's requests
// (protocol.ts) with PaperPaw's own web emulator (shell/reader.ts), or
// with the stub (stub.ts) where the emulator's module is not there (a
// checkout without public/emulator/paperpaw-web.wasm). It runs in a
// sandboxed iframe without access to the workshop's storage.

import type { Answer, Hello, Ready, Request } from "../protocol";
import { ShellReader } from "./shell/reader";
import { StubDevice } from "./stub";

const canvas = document.getElementById("screen") as HTMLCanvasElement;

function answer(id: number, result?: unknown): void {
  const message: Answer = { id, ok: true, result };
  parent.postMessage(message, "*");
}

function fail(id: number, error: unknown): void {
  const message: Answer = { id, ok: false, error: error instanceof Error ? error.message : String(error) };
  parent.postMessage(message, "*");
}

/** What answers: the real emulator, or the stub. */
type Reader = { kind: "shell"; reader: ShellReader } | { kind: "stub"; device: StubDevice };

async function load(): Promise<Reader> {
  try {
    const reader = await ShellReader.load(new URL("emulator/paperpaw-web.wasm", document.baseURI), canvas);
    return { kind: "shell", reader };
  } catch (e) {
    console.warn("paperpaw: the emulator's module is not there, the stub answers:", e);
    return { kind: "stub", device: new StubDevice() };
  }
}

async function handle(reader: Reader, request: Request & { id: number }): Promise<unknown> {
  if (reader.kind === "shell") {
    const r = reader.reader;
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
        return r.check();
      case "module":
        return r.useModule(request.url === null ? null : new URL(request.url, document.baseURI));
    }
  } else {
    const device = reader.device;
    const redraw = () => device.draw(canvas);
    switch (request.type) {
      case "start":
        await device.start(request.profile, request.dark, request.plugins[0], request.registry, request.screen);
        return redraw();
      case "files":
        await device.setFiles(request.plugin);
        return redraw();
      case "input":
        device.input(request.event, device.items().length);
        return redraw();
      case "screenshot": {
        const off = document.createElement("canvas");
        device.draw(off, request.profile ?? device.profile, request.dark ?? device.dark, request.screen ?? device.screen);
        const png = off.toDataURL("image/png").replace(/^data:image\/png;base64,/, "");
        return { png, width: off.width, height: off.height };
      }
      case "check":
        return device.check();
      case "module":
        throw new Error("The stub runs no plugins with code: PaperPaw's emulator is not built here (npm run emulator).");
    }
  }
  throw new Error("unknown request");
}

const loaded = load();
let queue: Promise<void> = Promise.resolve();

void loaded.then((reader) => {
  const ready: Ready = { type: "ready", stub: reader.kind === "stub", version: reader.kind === "stub" ? "stub-1" : "paperpaw-web" };
  window.addEventListener("message", (event: MessageEvent) => {
    if (event.source !== parent) return;
    if ((event.data as Hello).type === "hello") {
      parent.postMessage(ready, "*");
      return;
    }
    const request = event.data as Request & { id: number };
    // One at a time, in the order sent: a restart finishes before the
    // screenshot asked for after it.
    queue = queue.then(() =>
      handle(reader, request).then(
        (result) => answer(request.id, result),
        (e) => fail(request.id, e),
      ),
    );
  });
  parent.postMessage(ready, "*");
});
