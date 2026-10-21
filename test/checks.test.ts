import { describe, expect, it } from "vitest";

import { checkDataPlugin, type Finding } from "../src/checks/data";
import { handbook } from "./helpers";

const registry = handbook().registry;

const MANIFEST = "[plugin]\nid = night-owl\nname = Night owl\ndescription = A calm dark look.\nversion = 1.0.0\nformats = 1\n";

const errors = (findings: Finding[]) => findings.filter((f) => f.level === "error").map((f) => f.check);

describe("the workshop's checks of a data plugin", () => {
  it("pass a theme as PaperPaw's samples have them", () => {
    const findings = checkDataPlugin(
      {
        "plugin.ini": MANIFEST,
        "settings.ini": "[core]\nui-header = core.header.light\nui-margin = 6\nui-row = 220\nui-corners = core.corners.small\n",
      },
      registry,
    );
    expect(errors(findings)).toEqual([]);
    expect(findings.map((f) => f.check)).toEqual(["package.ok"]);
  });

  it("name what is missing or wrong in plugin.ini", () => {
    expect(errors(checkDataPlugin({}, registry))).toEqual(["package.manifest"]);
    const bad = checkDataPlugin({ "plugin.ini": "[plugin]\nid = Night Owl\nversion = 1.0\n" }, registry);
    expect(errors(bad)).toEqual(["package.id", "package.name", "package.version"]);
  });

  it("know every setting and its values", () => {
    const findings = checkDataPlugin(
      {
        "plugin.ini": MANIFEST,
        "settings.ini": "[core]\nui-row = 400\nui-header = core.header.purple\nui-roww = 200\nnight-mode = maybe\n",
      },
      registry,
    );
    const messages = findings.filter((f) => f.level === "error").map((f) => f.message);
    expect(messages[0]).toContain("outside its range, 120 to 300");
    expect(messages[1]).toContain("core.header.plain, core.header.light, core.header.dark");
    expect(messages[2]).toContain("there is no setting core.ui-roww; did you mean core.ui-row");
    expect(messages[3]).toContain("is a switch");
    expect(findings.find((f) => f.message.includes("400"))?.place).toBe("settings.ini:2");
  });

  it("check a home screen layout's widgets and grid", () => {
    const findings = checkDataPlugin(
      {
        "plugin.ini": MANIFEST,
        "presets.ini":
          "[nook]\nkind = home.layout\nname = night-owl.nook\nhome.columns = 4\nhome.rows = 6\n" +
          "home.page-1 = widgets.word-clock@1 0/0 4x2, home.nothing@1 0/2 4x2, home.recent@1 2/4 4x2\n" +
          "home.recent@1.heading = off\n",
      },
      registry,
    );
    expect(errors(findings)).toEqual(["layout.widget", "layout.outside"]);
  });

  it("check key maps against the actions there are", () => {
    const findings = checkDataPlugin(
      {
        "plugin.ini": MANIFEST,
        "keymap.ini": "[keymap.global]\nlong.page-forward = core.toggle-night-mode\ntap.center = none\nlong.page-back = core.make-tea\nwiggle = core.menu\n",
      },
      registry,
    );
    expect(errors(findings)).toEqual(["keymap.action", "keymap.input"]);
  });

  it("keep to the store's rules for files", () => {
    const findings = checkDataPlugin(
      { "plugin.ini": MANIFEST, "script.js": "alert(1)", ".hidden.ini": "", "store/shot.png": new Uint8Array(4) },
      registry,
    );
    expect(errors(findings)).toEqual(["package.path", "package.path"]);
  });

  it("want translation keys in the plugin's own namespace", () => {
    const findings = checkDataPlugin(
      { "plugin.ini": MANIFEST, "i18n/en.ini": "[meta]\nlanguage = en\n\n[messages]\nnight-owl.nook = Nook\nhome.title = Mine\n" },
      registry,
    );
    expect(findings.filter((f) => f.level === "warning").map((f) => f.check)).toEqual(["lint.namespace"]);
  });
});
