import { describe, expect, it } from "vitest";

import { installedText, readerLabel, stepText } from "./sending";

describe("sending to a reader", () => {
  it("asks the person to allow it on the reader while the reader asks", () => {
    expect(stepText("asking")).toBe("Allow it on the reader.");
    expect(stepText("sending 2/5")).toBe("Sending file 2 of 5…");
    expect(stepText("installing")).toBe("Installing…");
    expect(stepText("something else")).toBe("");
  });

  it("says whether the reader must start again", () => {
    expect(installedText({ id: "clock", restart: true })).toContain("starts again");
    expect(installedText({ id: "calm", restart: false })).toBe("Installed calm. It is on the reader now.");
  });

  it("names a reader on the cable, or why it did not answer", () => {
    const reader = { port: "COM11", device: "xteink-x4-pro", name: "Xteink X4 Pro", version: "0.4.0", fingerprint: null, problem: null };
    expect(readerLabel(reader)).toBe("Xteink X4 Pro on COM11, PaperPaw 0.4.0");
    expect(readerLabel({ ...reader, name: null, version: null })).toBe("xteink-x4-pro on COM11");
    expect(readerLabel({ ...reader, problem: "It did not answer." })).toBe("COM11: It did not answer.");
  });
});
