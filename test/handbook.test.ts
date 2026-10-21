import { describe, expect, it } from "vitest";

import { MAX_TOPIC_TOKENS, SHOWN_PROFILES } from "../src/handbook/handbook";
import { handbook } from "./helpers";

const book = handbook();

describe("the generated handbook", () => {
  it("is a prompt of a cacheable, modest size", () => {
    expect(book.meta.ref).toBeTruthy();
    expect(book.prompt).toContain("# You are the PaperPaw plugin workshop");
    expect(book.prompt).toContain("`[core] ui-row`");
    // Big enough to cache, small enough to stay cheap.
    expect(book.prompt.length / 3.6).toBeGreaterThan(2_000);
    expect(book.prompt.length / 3.6).toBeLessThan(25_000);
  });

  it("knows the devices the workshop shows", () => {
    for (const id of SHOWN_PROFILES) expect(book.profile(id)).toBeDefined();
    expect(book.profile("xteink-x4")).toMatchObject({ width: 480, height: 800, touch: false });
  });

  it("finds topics by id and by words", async () => {
    expect(book.find("widgets").topic?.id).toBe("widgets");
    expect(book.find("settings/home").topic?.title).toBe("Settings of home");
    const { topic, candidates } = book.find("home screen layout presets");
    expect(topic).toBeUndefined();
    expect(candidates.map((t) => t.id)).toContain("docs/presets-and-home-screen-layouts");
  });

  it("cuts long topics and says where to look instead", async () => {
    const long = book.topics.find((t) => t.id === "settings/widgets")!;
    expect(long.tokens).toBeGreaterThan(MAX_TOPIC_TOKENS);
    const text = await book.read(long);
    expect(text.length).toBeLessThanOrEqual(MAX_TOPIC_TOKENS * 3.6 + 300);
    expect(text).toContain("settings-group/");
  });
});
