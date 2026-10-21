import { describe, expect, it } from "vitest";

import { deleteFile, languageOf, writeFile } from "../src/tools/files";
import { bench } from "./helpers";

const DE = "[messages]\nquote.title = Zitat des Tages\nquote.next = Weiter\n";

describe("the files' tools keep the translations", () => {
  it("know a language file by its place", () => {
    expect(languageOf("i18n/de.ini")).toBe("de");
    expect(languageOf("plugin/i18n/en.ini")).toBe("en");
    expect(languageOf("settings.ini")).toBeUndefined();
  });

  it("write another language without removing one", async () => {
    const { context, files } = bench();
    files.write("i18n/de.ini", DE);
    const en = await writeFile.run({ path: "i18n/en.ini", content: "[messages]\nquote.title = Quote of the day\n" }, context);
    expect(en.isError).toBeFalsy();
    expect(files.read("i18n/de.ini")).toBe(DE);
  });

  it("remove no language the person did not ask to remove", async () => {
    const { context, files } = bench();
    files.write("i18n/de.ini", DE);
    const gone = await deleteFile.run({ path: "i18n/de.ini" }, context);
    expect(gone.isError).toBe(true);
    expect(gone.content).toContain("person_asked");
    expect(files.read("i18n/de.ini")).toBe(DE);
    // Its texts change as the plugin does.
    const changed = await writeFile.run({ path: "i18n/de.ini", content: "[messages]\nquote.title = Zitat\n" }, context);
    expect(changed.isError).toBeFalsy();
    // Asked: removed.
    expect((await deleteFile.run({ path: "i18n/de.ini", person_asked: true }, context)).isError).toBeFalsy();
    expect(files.has("i18n/de.ini")).toBe(false);
    // Other files as ever.
    files.write("presets.ini", "[x]\n");
    expect((await deleteFile.run({ path: "presets.ini" }, context)).isError).toBeFalsy();
  });
});
