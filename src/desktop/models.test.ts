import { describe, expect, it } from "vitest";

import { CHOICES, HAIKU, OPUS, SONNET, modelFor, offered } from "./models";

describe("the model", () => {
  it("is chosen by the task when Automatic", () => {
    const all = offered("claude");
    expect(modelFor("auto", null, "data", all)).toBe(HAIKU);
    expect(modelFor("auto", null, "code", all)).toBe(SONNET);
  });

  it("is the app's choice, and a plugin's own over it", () => {
    const all = offered("claude");
    expect(modelFor(OPUS, null, "data", all)).toBe(OPUS);
    expect(modelFor(OPUS, { model: HAIKU }, "code", all)).toBe(HAIKU);
  });

  it("is only what a PaperPaw key may use, else Automatic", () => {
    expect(offered("paperpaw")).toEqual(["auto"]);
    const may = offered("paperpaw", [HAIKU, SONNET]);
    expect(may).toEqual(["auto", HAIKU, SONNET]);
    expect(modelFor(OPUS, null, "data", may)).toBe(HAIKU);
    expect(modelFor("auto", { model: OPUS }, "code", may)).toBe(SONNET);
  });

  it("has a hint on cost and speed for each choice", () => {
    expect(CHOICES.find((c) => c.choice === SONNET)!.hint).toBe("Careful with code. About 20 times Haiku's price.");
    expect(CHOICES.find((c) => c.choice === OPUS)!.hint).toBe("Strongest, slower. About 40 times Haiku's price.");
  });
});
