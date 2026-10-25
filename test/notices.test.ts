// The notices the workshop ships (scripts/notices.mjs): licences chosen
// as the script chooses them, and the file holding what the licences
// ask for. That it is what the lockfiles say, `npm run notices:check`
// checks (the release workflow runs it).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
// @ts-expect-error: a script, without types
import { choose } from "../scripts/notices.mjs";

const notices = readFileSync(join(import.meta.dirname, "..", "public", "THIRD-PARTY-NOTICES.txt"), "utf8");

describe("third-party notices", () => {
  it("take MIT where it is offered, and every part of an AND", () => {
    expect(choose("MIT OR Apache-2.0")).toEqual(["MIT"]);
    expect(choose("Apache-2.0/MIT")).toEqual(["MIT"]);
    expect(choose("Apache-2.0 AND ISC")).toEqual(["Apache-2.0", "ISC"]);
    expect(choose("(MIT OR Apache-2.0) AND Unicode-3.0")).toEqual(["MIT", "Unicode-3.0"]);
    expect(choose("Apache-2.0 WITH LLVM-exception OR MIT")).toEqual(["MIT"]);
    expect(() => choose("GPL-3.0-only")).toThrow(/no licence/);
  });

  it("hold libgit2's licence with its linking exception, and where MPL sources are", () => {
    expect(notices).toContain("libgit2");
    expect(notices).toContain("linking exception");
    expect(notices).toMatch(/Source, used unchanged: https:\/\/crates\.io\/crates\/cssparser\//);
    expect(notices).toContain("Mozilla Public License Version 2.0");
  });

  it("name the npm packages the page bundles, and no dev dependency", () => {
    expect(notices).toContain("npm preact ");
    expect(notices).toContain("npm @anthropic-ai/sdk ");
    expect(notices).not.toContain("npm vite ");
    expect(notices).not.toContain("npm vitest ");
  });
});
