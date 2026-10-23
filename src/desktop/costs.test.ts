import { describe, expect, it } from "vitest";

import { about, details, thisMonth, turnOf, unusual, type Turn } from "./costs";

const usage = (dollars: number, input = 0, output = 0, read = 0, write = 0) => ({ inputTokens: input, outputTokens: output, cacheReadTokens: read, cacheWriteTokens: write, dollars });
const turn = (dollars: number, at = "2026-10-23T10:00:00Z"): Turn => ({ end: 2, conversation: 0, at, model: "Claude Haiku 5.5", dollars, input: 10, output: 5, cached: 100 });

describe("costs, said calmly", () => {
  it("are rough amounts in the computer's way of writing money", () => {
    expect(about(0.031, "en-US")).toBe("about $0.03");
    expect(about(0.002, "en-US")).toBe("less than $0.01");
    expect(about(1.234, "de-DE")).toBe("about 1,23 $");
  });

  it("are counted per turn, the cache apart", () => {
    const t = turnOf(usage(0.01, 100, 50, 1000, 200), usage(0.04, 150, 80, 3000, 400), 6, 0, "Claude Haiku 5.5");
    expect(t).toMatchObject({ end: 6, input: 250, output: 30, cached: 2000 });
    expect(t.dollars).toBeCloseTo(0.03);
    expect(details(t, "en-US")).toBe("250 tokens sent, 2,000 read from the cache, 30 written; Claude Haiku 5.5");
  });

  it("note a turn that cost much more than usual, and nothing else", () => {
    const before = [turn(0.004), turn(0.003), turn(0.005)];
    expect(unusual(turn(0.2), before)).toBe(true);
    expect(unusual(turn(0.012), before)).toBe(false);
    expect(unusual(turn(0.2), before.slice(0, 2))).toBe(false);
  });

  it("add up the month", () => {
    expect(thisMonth([turn(0.1, "2026-10-01T00:00:00Z"), turn(0.2, "2026-09-30T23:00:00Z")], new Date("2026-10-23T12:00:00Z"))).toBeCloseTo(0.1);
  });
});
