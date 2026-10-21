// The emulator frame (frame.html): answers the workshop's requests
// (protocol.ts) with the stub until PaperPaw's web shell takes its place.
// It runs in a sandboxed iframe without access to the workshop's storage.

import type { Answer, Ready, Request } from "../protocol";
import { StubDevice } from "./stub";

const device = new StubDevice();
const canvas = document.getElementById("screen") as HTMLCanvasElement;

function redraw(): void {
  device.draw(canvas);
}

function answer(id: number, result?: unknown): void {
  const message: Answer = { id, ok: true, result };
  parent.postMessage(message, "*");
}

function fail(id: number, error: unknown): void {
  const message: Answer = { id, ok: false, error: error instanceof Error ? error.message : String(error) };
  parent.postMessage(message, "*");
}

window.addEventListener("message", (event: MessageEvent) => {
  if (event.source !== parent) return;
  const request = event.data as Request & { id: number };
  try {
    switch (request.type) {
      case "start":
        device.start(request.profile, request.dark, request.plugins[0], request.registry);
        redraw();
        return answer(request.id);
      case "files":
        device.setFiles(request.plugin);
        redraw();
        return answer(request.id);
      case "input":
        device.input(request.event, device.items().length);
        redraw();
        return answer(request.id);
      case "screenshot": {
        const off = document.createElement("canvas");
        device.draw(off, request.profile ?? device.profile, request.dark ?? device.dark);
        const png = off.toDataURL("image/png").replace(/^data:image\/png;base64,/, "");
        return answer(request.id, { png, width: off.width, height: off.height });
      }
      case "check":
        return answer(request.id, device.check());
      default:
        return fail((request as { id: number }).id, "unknown request");
    }
  } catch (e) {
    fail(request.id, e);
  }
});

const ready: Ready = { type: "ready", stub: true, version: "stub-1" };
parent.postMessage(ready, "*");
