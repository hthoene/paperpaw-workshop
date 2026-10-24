import { describe, expect, it } from "vitest";

import { Checker, forModel, summary, type Found } from "./checks";

const cut: Found = { check: "visual.text-cut", level: "error", place: "home.clock 2x1", message: "the text is cut at the right", seen: ["xteink-x4 de"] };

describe("the checks", () => {
  it("say ok, or how many to fix", async () => {
    const checker = new Checker({ pluginCheck: async () => [cut] });
    expect(summary(checker.checks)).toBe("");
    const states: string[] = [];
    checker.subscribe(() => states.push(summary(checker.checks)));
    await checker.run("Clock");
    expect(states).toEqual(["Checking…", "Checks: 1 to fix"]);
    expect(summary({ state: "done", found: [] })).toBe("Checks: ok");
  });

  it("give the model one short line each", () => {
    expect(forModel([cut])).toBe("PaperPaw's checks found 1 to fix:\n- error visual.text-cut at home.clock 2x1 (xteink-x4 de): the text is cut at the right");
    expect(forModel([])).toBe("PaperPaw's checks found nothing to fix.");
  });

  it("run once more after a change made while they ran, not once per change", async () => {
    let calls = 0;
    let release: () => void = () => {};
    const checker = new Checker({
      pluginCheck: () => {
        calls++;
        return new Promise((resolve) => { release = () => resolve([]); });
      },
    });
    const first = checker.run("Clock");
    const second = checker.run("Clock");
    const third = checker.run("Clock");
    release();
    await Promise.resolve();
    await new Promise((r) => setTimeout(r, 0));
    release();
    await Promise.all([first, second, third]);
    expect(calls).toBe(2);
    expect(summary(checker.checks)).toBe("Checks: ok");
  });
});

describe("a finding for the person", () => {
  it("says where it was seen in words, and stays away once ignored", async () => {
    const { where } = await import("./Findings");
    const { ignoredKey, shown } = await import("./checks");
    const f: Found = { ...cut, seen: ["xteink-x4 de light default", "xteink-x4-pro de light default", "xteink-x4 en light default", "boox-go-7 pseudo light default"] };
    expect(where(f)).toBe("on X4, X4 Pro and Boox Go 7, in German and English");
    expect(where({ ...cut, seen: [] })).toBe("");
    expect(shown([cut, f], [ignoredKey(cut)])).toEqual([]);
    expect(shown([cut], [])).toEqual([cut]);
  });
});
