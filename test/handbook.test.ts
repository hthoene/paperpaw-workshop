import { describe, expect, it } from "vitest";

import { MAX_TOPIC_TOKENS, SHOWN_PROFILES } from "../src/handbook/handbook";
import { lookupDocs } from "../src/tools/docs";
import { bench, handbook } from "./helpers";

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

  it("finds the SDK's items by name and by words, with their documentation", async () => {
    const [button] = await book.items("draw_button");
    expect(button).toMatchObject({ path: "ui::draw_button", kind: "fn" });
    expect(button!.doc).toContain("A button");
    expect((await book.items("paperpaw_sdk::ui::draw_button"))[0]?.path).toBe("ui::draw_button");
    expect((await book.items("button")).map((i) => i.path)).toContain("ui::draw_button");
    // The methods of what the SDK passes on, from crates without api.txt.
    expect((await book.items("Canvas::fill"))[0]).toMatchObject({ path: "Canvas::fill", kind: "fn" });
    expect((await book.items("canvas rect")).map((i) => i.path)).toContain("Canvas::fill_rect");
    // By the paths a plugin uses, with their own crate's docs.
    expect((await book.items("config::parse"))[0]?.doc).toContain("entries");
    expect(await book.items("xyzzyqq")).toEqual([]);
  });

  it("answers lookup_docs with the items when no topic is called so", async () => {
    const { context } = bench();
    const answer = await lookupDocs.run({ topic: "draw button" }, context);
    expect(answer.content).toContain("pub fn paperpaw_sdk::ui::draw_button(");
    expect(answer.content).toContain("A button");
    const module = await lookupDocs.run({ topic: "sdk/ui" }, context);
    expect(module.content).toContain("draw_button");
  });
});
