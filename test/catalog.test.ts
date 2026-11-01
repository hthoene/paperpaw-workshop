import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import en from "../src/i18n/en.json";
import { t } from "../src/i18n";
import { DATA_TOOLS } from "../src/tools/registry";

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
    // A text with a number may have plural forms only (key.one, key.other).
    const missing = [...used].filter((k) => !(k in en) && !(`${k}.other` in en));
    expect(missing).toEqual([]);
    expect(used.size).toBeGreaterThan(10);
  });

  it("has a text for each tool's step", () => {
    for (const tool of DATA_TOOLS.map((t) => t.name)) {
      expect(en).toHaveProperty(`step.${tool}`);
    }
  });

  it("fills in values and shows a missing key as itself", () => {
    expect(t("step.write_file", { path: "settings.ini" })).toBe("Wrote settings.ini");
    expect(t("no.such.key")).toBe("no.such.key");
  });

  it("has no dashes in its texts", () => {
    const dashes = Object.entries(en).filter(([, v]) => /[\u2013\u2014]/.test(v));
    expect(dashes).toEqual([]);
  });

  it("picks the plural form for the number", () => {
    expect(t("share.problem.tags", { n: 1 })).toBe("at most 1 tag");
    expect(t("share.problem.tags", { n: 5 })).toBe("at most 5 tags");
    // Every text with plural forms has its "other" form.
    const forms = Object.keys(en).filter((k) => /\.(zero|one|two|few|many)$/.test(k));
    expect(forms.filter((k) => !(k.replace(/\.[a-z]+$/, ".other") in en))).toEqual([]);
  });
});
