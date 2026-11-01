import { describe, expect, it, vi } from "vitest";

import { standInBackend } from "./backend";
import { NativeEmulator, recorded } from "./native";

function emulator() {
  const emulatorNetwork = vi.fn(async () => {});
  const backend = { ...standInBackend(), emulatorNetwork };
  return { emulatorNetwork, native: new NativeEmulator(backend, () => null, {} as never, async () => {}) };
}

describe("where the preview's plugin requests go", () => {
  it("is the internet for real, with the recorded answers cleared away", async () => {
    const { native, emulatorNetwork } = emulator();
    await native.setNetwork([], "real");
    expect(emulatorNetwork).toHaveBeenCalledWith("real", []);
  });

  it("is the recorded answers alone for fixtures, each given as the emulator takes it", async () => {
    const { native, emulatorNetwork } = emulator();
    await native.setNetwork(
      [
        { url: "https://a.example/q", body: { quote: "Hi" } },
        { url: "https://a.example/t", method: "GET", status: 404, body: "gone", headers: { "Content-Type": "text/plain" }, delay: 50 },
      ],
      "fixtures",
    );
    expect(emulatorNetwork).toHaveBeenCalledWith("recorded", [
      { url: "https://a.example/q", body: '{"quote":"Hi"}', content_type: "application/json" },
      { url: "https://a.example/t", method: "GET", status: 404, body: "gone", content_type: "text/plain" },
    ]);
  });

  it("keeps a content type given without a body, and none where none is known", () => {
    expect(recorded({ url: "u", status: 204, headers: { "content-type": "text/html" } })).toEqual({ url: "u", status: 204, content_type: "text/html" });
    expect(recorded({ url: "u", body: "text" })).toEqual({ url: "u", body: "text" });
  });
});
