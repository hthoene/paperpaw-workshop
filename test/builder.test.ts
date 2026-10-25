import { describe, expect, it, vi } from "vitest";

import { BuilderRefused, HttpBuilder } from "../src/build/client";

// @ts-expect-error: the builder is plain JavaScript (builder/), run by Node.
import { cargo, diagnostics, harness, native, pluginManifest, problems } from "../builder/project.mjs";

const text = (t: string) => ({ text: t });
const MANIFEST = '[package]\nname = "quotes"\nversion = "0.2.0"\n\n[package.metadata.paperpaw]\nplugin = "Quotes"\n\n[dependencies]\npaperpaw-sdk = "0.5"\n';

const project = (extra: Record<string, { text: string }> = {}) => ({
  "Cargo.toml": text(MANIFEST),
  "src/lib.rs": text("#![no_std]\n"),
  "plugin/plugin.ini": text("[plugin]\nid = quotes\n"),
  ...extra,
});

describe("a project the builder takes", () => {
  it("reads the crate's name, version and plugin type", () => {
    expect(cargo(MANIFEST)).toEqual({ name: "quotes", version: "0.2.0", plugin: "Quotes", problems: [] });
    expect(problems(project())).toEqual([]);
  });

  it("names only crates it has, and no sections of its own", () => {
    const more = cargo(MANIFEST + 'serde = "1"\n\n[profile.release]\nopt-level = 3\n').problems;
    expect(more.join(" ")).toContain("the crate serde is not available");
    expect(more.join(" ")).toContain("[profile.release] is not taken");
    expect(cargo('[package]\nname = "Bad Name"\n').problems.length).toBeGreaterThanOrEqual(3);
  });

  it("refuses files a plugin crate does not hold, and paths outside it", () => {
    const found = problems(project({ "build.rs": text("fn main() {}"), "src/../../etc/passwd": text("x"), ".cargo/config.toml": text("x") }));
    expect(found.some((p: string) => p.startsWith("build.rs:"))).toBe(true);
    expect(found.some((p: string) => p.startsWith("src/../../etc/passwd:"))).toBe(true);
    expect(found.some((p: string) => p.startsWith(".cargo/config.toml:"))).toBe(true);
    expect(problems({ "src/lib.rs": text("") }).join(" ")).toContain("plugin/plugin.ini is missing");
  });

  it("builds with its own Cargo.toml, the harness and the native wrapper", () => {
    expect(pluginManifest("quotes", "0.2.0", "/paperpaw/crates/paperpaw-sdk")).toContain('paperpaw-sdk = { path = "/paperpaw/crates/paperpaw-sdk" }');
    const web = harness("quotes", "Quotes", "/paperpaw/shells/web");
    expect(web["src/lib.rs"]).toContain("app.plugin(quotes::Quotes)");
    expect(web["Cargo.toml"]).toContain('crate-type = ["cdylib"]');
    const x4 = native("my-quotes", "Quotes", "/paperpaw/crates/paperpaw-sdk");
    expect(x4["src/main.rs"]).toContain("paperpaw_sdk::plugin!(my_quotes::Quotes);");
    expect(x4[".cargo/config.toml"]).toContain("-Tpaperpaw-plugin.x");
    expect(x4[".cargo/config.toml"]).toContain("link-arg=--no-relax");
    // The X4 Pro's flags: linked through the Xtensa GCC, its sysroot's
    // paths written as /rust, as PaperPaw's own plugin files are.
    expect(x4[".cargo/config.toml"]).toContain("[target.xtensa-esp32s3-none-elf]");
    expect(x4[".cargo/config.toml"]).toContain("-Wl,-Tpaperpaw-plugin.x");
    expect(x4[".cargo/config.toml"]).toContain("--remap-path-prefix=/usr/local/rustup/toolchains/esp=/rust");
  });
});

describe("the compiler's messages", () => {
  it("become diagnostics of the plugin's own files, errors first", () => {
    const message = (level: string, file: string, line: number, text: string) =>
      JSON.stringify({
        reason: "compiler-message",
        message: { level, message: text, rendered: `${level}: ${text}\n --> ${file}:${line}:5`, spans: [{ is_primary: true, file_name: file, line_start: line, column_start: 5 }] },
      });
    const output = [
      '{"reason":"compiler-artifact"}',
      message("warning", "/work/plugin/src/lib.rs", 3, "unused variable"),
      message("error", "/work/plugin/src/lib.rs", 9, "cannot find value `x`"),
      message("warning", "/paperpaw/crates/paperpaw-core/src/lib.rs", 1, "PaperPaw's own"),
      message("error", "/work/plugin/src/lib.rs", 9, "cannot find value `x`"),
      "not json",
    ].join("\n");
    const found = diagnostics(output, "/work/plugin");
    expect(found.map((d: { level: string; file: string; line: number }) => [d.level, d.file, d.line])).toEqual([
      ["error", "src/lib.rs", 9],
      ["warning", "src/lib.rs", 3],
    ]);
    expect(found[0].rendered).toContain("--> src/lib.rs:9:5");
  });
});

describe("the build client", () => {
  const view = { id: "b1", state: "done", seconds: 1, problems: [], diagnostics: [], files: [], log_tail: "" };
  const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

  it("sends paperpaw.org's form token, and its refusals in its words", async () => {
    const sent: RequestInit[] = [];
    const answers = [json(200, { store: "open", csrf: "token-1" }), json(429, { error: "busy", message: "A build of yours is still running: one at a time." })];
    vi.stubGlobal("fetch", async (_url: string, init: RequestInit) => {
      sent.push(init ?? {});
      return answers.shift()!;
    });
    const builder = new HttpBuilder();
    const refused = await builder.build({ "src/lib.rs": { text: "" } }, ["web"]).catch((e) => e);
    expect(refused).toBeInstanceOf(BuilderRefused);
    expect(refused.message).toBe("A build of yours is still running: one at a time.");
    expect((sent[1]!.headers as Record<string, string>)["x-paperpaw-csrf"]).toBe("token-1");
    vi.unstubAllGlobals();
  });

  it("builds on its own without a token, where no site answers", async () => {
    const sent: RequestInit[] = [];
    const answers = [new Response("<!doctype html>", { status: 200 }), json(201, view)];
    vi.stubGlobal("fetch", async (_url: string, init: RequestInit) => {
      sent.push(init ?? {});
      return answers.shift()!;
    });
    const result = await new HttpBuilder().build({ "src/lib.rs": { text: "" } }, ["web"]);
    expect(result.state).toBe("done");
    expect((sent[1]!.headers as Record<string, string>)["x-paperpaw-csrf"]).toBeUndefined();
    vi.unstubAllGlobals();
  });
});
