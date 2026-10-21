import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import en from "../src/i18n/en.json";
import { t } from "../src/i18n";

/** Every file under `dir` ending in one of `ends`. */
function files(dir: string, ends: string[]): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? files(p, ends) : ends.some((x) => p.endsWith(x)) ? [p] : [];
  });
}

describe("the catalog", () => {
  it("has every text the code asks for by name", () => {
    const src = path.resolve(import.meta.dirname, "../src");
    const used = new Set<string>();
    for (const file of files(src, [".ts", ".tsx"])) {
      for (const m of fs.readFileSync(file, "utf8").matchAll(/\bt\("([a-z0-9.-]+)"/g)) used.add(m[1]!);
    }
    const missing = [...used].filter((k) => !(k in en));
    expect(missing).toEqual([]);
    expect(used.size).toBeGreaterThan(30);
  });

  it("has a text for each tool's step, button and finding level", () => {
    for (const tool of ["list_files", "read_file", "write_file", "delete_file", "lookup_docs", "check", "look", "press", "set_entry"]) {
      expect(en).toHaveProperty(`step.${tool}`);
    }
    for (const b of ["page-back", "up", "down", "left", "right", "confirm", "back", "page-forward"]) {
      expect(en).toHaveProperty(`reader.button.${b}`);
    }
    for (const level of ["error", "warning", "info"]) expect(en).toHaveProperty(`findings.level.${level}`);
  });

  it("fills in values and shows a missing key as itself", () => {
    expect(t("step.write_file", { path: "settings.ini" })).toBe("Wrote settings.ini");
    expect(t("no.such.key")).toBe("no.such.key");
  });

  it("has no dashes in its texts", () => {
    const dashes = Object.entries(en).filter(([, v]) => /[\u2013\u2014]/.test(v));
    expect(dashes).toEqual([]);
  });
});
