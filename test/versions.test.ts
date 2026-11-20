// @vitest-environment node
import { describe, expect, it } from "vitest";

import { Handbook } from "../src/handbook/handbook";
import { itemsOfRelease } from "../src/handbook/release";
import { pickOf, valueOf } from "../src/desktop/Versions";

/** The SDK of a release as versions.rs gives it: a PaperPaw tree's paths. */
function tree(calls: string[]): Record<string, string> {
  return {
    "crates/paperpaw-sdk/api.txt": ["pub mod paperpaw_sdk", ...calls.map((c) => `pub fn paperpaw_sdk::native::${c}()`), "pub fn paperpaw_sdk::Canvas::fill()"].join("\n"),
    "crates/paperpaw-sdk/src/native.rs": calls.map((c) => `/// Does ${c}.\npub fn ${c}() {}`).join("\n"),
  };
}

describe("the API of the release plugins are made for", () => {
  it("has the items of that release only, as an older one lacks what a newer one added", async () => {
    const older = itemsOfRelease(tree(["draw"]));
    const newer = itemsOfRelease(tree(["draw", "vibrate"]));
    expect(older.map((i) => i.path)).toEqual(["native::draw"]);
    expect(newer.map((i) => i.path)).toEqual(["native::draw", "native::vibrate"]);
    expect(older[0]!.doc).toBe("Does draw.");
    const base = new Handbook({ ref: "x", commit: "", generated: "", dataTokens: 0 }, "data", [], { settings: [], widgets: [], actions: [], profiles: [] }, async () => "", "code prompt", {}, async () => newer);
    const target = base.retarget({ version: "0.6.0", interface: 7, minor: 1 }, older);
    expect(target.promptFor("code")).toContain("PaperPaw 0.6.0 (plugin interface 7, minor 1)");
    expect(target.promptFor("code").startsWith("code prompt")).toBe(true);
    expect(target.promptFor("data")).toBe("data");
    expect((await target.items("vibrate")).length).toBe(0);
    expect((await target.items("draw")).length).toBe(1);
  });

  it("names the choice as the select does", () => {
    expect(valueOf({ mode: "latest" })).toBe("latest");
    expect(pickOf("v:0.6.0-beta.2")).toEqual({ mode: "pinned", version: "0.6.0-beta.2" });
    expect(valueOf(pickOf("v:0.6.0"))).toBe("v:0.6.0");
    expect(pickOf("latest")).toEqual({ mode: "latest" });
  });
});
