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
    expect(candidates.map((t) => t.id)).toContain("docs/presets");
  });

  it("cuts long topics and says where to look instead", async () => {
    const long = book.topics.find((t) => t.id === "settings/widgets")!;
    expect(long.tokens).toBeGreaterThan(MAX_TOPIC_TOKENS);
    const text = await book.read(long);
    expect(text.length).toBeLessThanOrEqual(MAX_TOPIC_TOKENS * 3.6 + 300);
    expect(text).toContain("settings-group/");
  });

  it("finds the SDK's items by name and by words, with their documentation", async () => {
    const [button] = await book.items("Ui::button");
    expect(button).toMatchObject({ path: "ui::Ui::button", kind: "fn" });
    expect(button!.doc).toContain("A button");
    expect((await book.items("paperpaw_sdk::ui::Ui::button"))[0]?.path).toBe("ui::Ui::button");
    expect((await book.items("button")).map((i) => i.path)).toContain("ui::Ui::button");
    // The methods of what the SDK passes on, from crates without api.txt.
    expect((await book.items("Canvas::fill"))[0]).toMatchObject({ path: "Canvas::fill", kind: "fn" });
    expect((await book.items("canvas rect")).map((i) => i.path)).toContain("Canvas::fill_rect");
    // By the paths a plugin uses, with their own crate's docs.
    expect((await book.items("config::parse"))[0]?.doc).toContain("entries");
    expect(await book.items("xyzzyqq")).toEqual([]);
  });

  it("gives a trait whole: every method, required or with a default, with its documentation", async () => {
    const text = await book.lookup("Widget");
    const [required, provided] = text.split("Provided methods");
    expect(text.startsWith("pub trait paperpaw_sdk::widgets::Widget")).toBe(true);
    expect(required).toContain("fn height(&self, env: &Env<'_>, width: u16) -> u16");
    expect(required).toContain("fn draw(&self, canvas: &mut Canvas<'_>, env: &Env<'_>, area: Rect)");
    expect(required).not.toContain("fn update(");
    expect(provided).toContain("fn update(&mut self, env: &Env<'_>) -> bool");
    expect(provided).toContain("Reads what it shows anew");
    for (const method of ["live", "place", "targets", "min_height", "on_input", "context", "draw_focus"]) expect(provided).toContain(`fn ${method}(`);
    // Asked as a trait, or by its path, the same.
    expect(await book.lookup("trait Widget")).toContain("Required methods");
    expect(await book.lookup("paperpaw_sdk::widgets::Widget")).toContain("Required methods");
  });

  it("gives a struct whole: its fields, how it is made, its methods", async () => {
    const text = await book.lookup("WidgetSpec");
    expect(text.startsWith("pub struct paperpaw_sdk::widgets::WidgetSpec")).toBe(true);
    expect(text).toMatch(/Fields:[\s\S]*pub category: Cow<'static, str>/);
    expect(text).toMatch(/Made with:[\s\S]*pub fn new\(Id, impl Into<Cow<'static, str>>, impl Fn\(&Env<'_>\) -> Box<dyn Widget>/);
    const reply = await book.lookup("HttpReply");
    expect(reply).toContain("pub body: Vec<u8>");
    expect(reply).toContain("pub fn ok(&self) -> bool");
    expect(reply).toContain("pub fn text(&self)");
  });

  it("lists a long module's types and functions whole, their members by a lookup of the type", async () => {
    const topic = book.find("sdk/widgets").topic!;
    const text = await book.read(topic);
    expect(text.length).toBeLessThanOrEqual(MAX_TOPIC_TOKENS * 3.6 + 4_000);
    const [listed, rest] = text.split("\n```\n");
    expect(listed!.split("\n")[1]).toBe("pub trait paperpaw_sdk::widgets::Widget");
    // Every line whole: an item of the SDK each, no member of a type.
    for (const line of listed!.split("\n").slice(1)) expect(line).toMatch(/^(pub|impl) /);
    expect(listed).not.toContain("widgets::Widget::draw(");
    expect(listed).toContain("pub fn paperpaw_sdk::widgets::draw_wrapped(");
    expect(rest).toContain("look a type up by name for it whole");
  });

  it("answers lookup_docs with the items when no topic is called so", async () => {
    const { context } = bench();
    const answer = await lookupDocs.run({ topic: "ui button" }, context);
    expect(answer.content).toContain("pub fn paperpaw_sdk::ui::Ui<'c>::button(");
    expect(answer.content).toContain("A button");
    const module = await lookupDocs.run({ topic: "sdk/ui" }, context);
    expect(module.content).toContain("pub fn paperpaw_sdk::ui::");
  });
});

describe("the SDK's items, as the handbook reads them from PaperPaw's source", () => {
  it("reads a public trait's methods: their declaration and whether they have a default", async () => {
    const { readItems } = await import("../handbook/sdk-items.mjs");
    const source = [
      "/// A thing shown.",
      "pub trait Shown {",
      "    /// How high it is.",
      "    fn height(&self, width: u16) -> u16;",
      "",
      "    /// Whether it changes by itself.",
      "    fn live(&self) -> bool { true }",
      "",
      "    /// Reads it anew.",
      "    fn update(",
      "        &mut self,",
      "        now: u64,",
      "    ) -> bool {",
      "        false",
      "    }",
      "}",
      "",
      "fn private() {}",
    ].join("\n");
    const items = readItems(source);
    expect(items.map((i) => [i.owner, i.name, i.provided])).toEqual([
      [null, "Shown", undefined],
      ["Shown", "height", false],
      ["Shown", "live", true],
      ["Shown", "update", true],
    ]);
    expect(items[1]).toMatchObject({ decl: "fn height(&self, width: u16) -> u16", doc: "How high it is." });
    expect(items[2]!.decl).toBe("fn live(&self) -> bool");
    expect(items[3]!.decl).toBe("fn update(&mut self, now: u64) -> bool");
  });

  it("keeps the recipes in the code handbook as the tests build them", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const lib = fs.readFileSync(path.resolve(import.meta.dirname, "../handbook/recipes/widget-fetch/src/lib.rs"), "utf8").replace(/\r\n/g, "\n").trim();
    expect(book.code).toContain(lib);
    expect(book.find("recipes/settings").topic).toBeDefined();
    // The sample the project starts from builds: what it includes is in it.
    expect(Object.keys(book.codeSample)).toEqual(expect.arrayContaining(["how/en.txt", "how/de.txt"]));
    expect(book.codeSample["src/lib.rs"]).toContain('include_str!("../how/en.txt")');
  });
});
