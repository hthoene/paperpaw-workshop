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
    const [render] = await book.items("Font::render_text");
    expect(render).toMatchObject({ path: "native::fonts::Font::render_text", kind: "fn" });
    expect(render!.doc).toContain("Draw text inside this callback's frame clip");
    expect((await book.items("paperpaw_sdk::native::fonts::Font::render_text"))[0]?.path).toBe("native::fonts::Font::render_text");
    expect((await book.items("render text")).map((i) => i.path)).toContain("native::fonts::Font::render_text");
    expect((await book.items("widget cells")).map((i) => i.path)).toContain("native::declare::WidgetDecl::cells");
    // Nothing of the interface before 7 is offered: the old Ui and Widget are not found.
    expect((await book.items("Ui::button")).map((i) => i.path)).not.toContain("ui::Ui::button");
    expect((await book.items("widgets::Widget")).map((i) => i.path)).not.toContain("widgets::Widget");
    expect(await book.items("xyzzyqq")).toEqual([]);
  });

  it("gives a trait whole: every method, required or with a default, with its documentation", async () => {
    const text = await book.lookup("Plugin");
    const [required, provided] = text.split("Provided methods");
    expect(text.startsWith("pub trait paperpaw_sdk::native::Plugin")).toBe(true);
    expect(required).toContain("fn make(host: &Host<'_>) -> Result<Self, Error>");
    expect(required).toContain("Construct the instance and submit its registrations");
    expect(required).not.toContain("fn draw(");
    for (const method of ["event", "draw", "input"]) expect(provided).toContain(`fn ${method}(`);
    // Asked as a trait, or by its path, the same.
    expect(await book.lookup("trait Plugin")).toContain("Required methods");
    expect(await book.lookup("paperpaw_sdk::native::Plugin")).toContain("Required methods");
  });

  it("gives a struct whole: how it is made, its methods", async () => {
    const text = await book.lookup("WidgetDecl");
    expect(text.startsWith("pub struct paperpaw_sdk::native::declare::WidgetDecl")).toBe(true);
    expect(text).toMatch(/Made with:[\s\S]*pub const fn WidgetDecl<'a>::cells\(self, u8, u8\) -> Self/);
    expect(text).toContain("Declare grid columns and rows");
  });

  it("lists a long module's types and functions whole, their members by a lookup of the type", async () => {
    const topic = book.find("sdk/native/canvas").topic!;
    const text = await book.read(topic);
    expect(text.length).toBeLessThanOrEqual(MAX_TOPIC_TOKENS * 3.6 + 4_000);
    const [listed] = text.split("\n```\n");
    expect(listed!.split("\n")[1]).toMatch(/^pub struct paperpaw_sdk::native::canvas::/);
    // Every line whole: an item of the SDK each, no member of a type.
    for (const line of listed!.split("\n").slice(1)) expect(line).toMatch(/^(pub|impl) /);
    expect(listed).not.toContain("Canvas<'a>::fill_rectangle(");
  });

  it("answers lookup_docs with the items when no topic is called so", async () => {
    const { context } = bench();
    const answer = await lookupDocs.run({ topic: "font render text" }, context);
    expect(answer.content).toContain("pub fn paperpaw_sdk::native::fonts::Font<'cb>::render_text(");
    expect(answer.content).toContain("Draw text inside this callback's frame clip");
    const module = await lookupDocs.run({ topic: "sdk/native/canvas" }, context);
    expect(module.content).toContain("pub struct paperpaw_sdk::native::canvas::");
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
    for (const name of ["hello", "motto"]) {
      const main = fs.readFileSync(path.resolve(import.meta.dirname, `../handbook/recipes/${name}/src/main.rs`), "utf8").replace(/\r\n/g, "\n").trim();
      expect(book.code).toContain(main);
      expect(book.find(`recipes/${name}`).topic).toBeDefined();
    }
    // The sample the project starts from is the recipe `hello`: a program, its list of calls and its folder.
    expect(Object.keys(book.codeSample)).toEqual(expect.arrayContaining(["src/main.rs", "native/metadata.json", "plugin/plugin.ini", "plugin/i18n/en.ini"]));
    expect(book.codeSample["src/main.rs"]).toContain("paperpaw_sdk::native_plugin!(Hello, metadata = CALLS);");
    expect(Object.keys(book.codeSample)).not.toContain("src/lib.rs");
  });

  it("names no item of the plugin interface before 7, in the prompts or in the topics", async () => {
    const old = /Registrar|\bplugin!\(|native::take|native::support|Native::fits|Native::problem\b|\bScreenSpec\b|\bWidgetSpec\b|\bactions::|fn register\(/;
    expect(book.code).not.toMatch(old);
    expect(book.promptFor("data")).not.toMatch(old);
    const fs = await import("node:fs");
    const path = await import("node:path");
    const topics = path.resolve(import.meta.dirname, "../public/handbook/topics");
    const found = fs.readdirSync(topics).filter((file) => old.test(fs.readFileSync(path.join(topics, file), "utf8")));
    expect(found).toEqual([]);
  });
});
