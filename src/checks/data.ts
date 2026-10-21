// The workshop's own checks of a data plugin: the store's rules for its
// folder, the ini files' syntax, and every setting, widget, action and
// value against the registry of the PaperPaw it is made for. They answer
// in the shape of paperpaw-dev's findings, which take their place once
// PaperPaw's web emulator runs paperpaw-dev's checks itself.

import type { Registry, SettingInfo } from "../handbook/handbook";
import { parseIni, iniValue, type Ini } from "../project/ini";
import { MAX_BYTES, MAX_FILES, pathProblem, validId, validVersion } from "../project/rules";

export type Level = "error" | "warning" | "info";

export interface Finding {
  /** `area.name`, as paperpaw-dev names its checks. */
  check: string;
  level: Level;
  /** A file, and its line where there is one. */
  place: string;
  message: string;
}

/** Inputs a key map binds: `button.<name>`, `long.<name>`, `tap.<zone>` ... */
const INPUT = /^(button|long|tap|long-tap|swipe|edge)\.[a-z0-9-]+$/;

export function checkDataPlugin(files: Record<string, string | Uint8Array>, registry: Registry): Finding[] {
  const findings: Finding[] = [];
  const add = (check: string, level: Level, place: string, message: string) =>
    findings.push({ check, level, place, message });
  const text = (path: string) => {
    const c = files[path];
    return typeof c === "string" ? c : c ? new TextDecoder().decode(c) : undefined;
  };

  // The folder.
  const paths = Object.keys(files);
  const outside = paths.filter((p) => !p.startsWith("store/"));
  if (outside.length > MAX_FILES) {
    add("package.files", "error", "(folder)", `${outside.length} files: a data plugin holds at most ${MAX_FILES}`);
  }
  const bytes = paths.reduce((n, p) => n + (typeof files[p] === "string" ? (files[p] as string).length : (files[p] as Uint8Array).length), 0);
  if (bytes > MAX_BYTES) add("package.size", "error", "(folder)", "the plugin is larger than 40 MB");
  for (const path of paths) {
    const problem = pathProblem(path);
    if (problem) add("package.path", "error", path, problem);
  }

  // plugin.ini.
  const manifest = text("plugin.ini");
  let id: string | undefined;
  if (manifest === undefined) {
    add("package.manifest", "error", "plugin.ini", "every plugin needs plugin.ini with [plugin] id, name, description, version");
  } else {
    const ini = parsed("plugin.ini", manifest, findings);
    id = iniValue(ini, "plugin", "id");
    const name = iniValue(ini, "plugin", "name");
    const version = iniValue(ini, "plugin", "version");
    const formats = iniValue(ini, "plugin", "formats");
    if (!id) add("package.id", "error", "plugin.ini", "[plugin] needs an id");
    else if (!validId(id)) {
      add("package.id", "error", "plugin.ini", `the id "${id}" may hold only lower-case letters, digits and hyphens (at most 40)`);
    }
    if (!name) add("package.name", "error", "plugin.ini", "[plugin] needs a name");
    if (!iniValue(ini, "plugin", "description")) {
      add("package.description", "warning", "plugin.ini", "[plugin] should have a description: one sentence on what it does");
    }
    if (!version) add("package.version", "error", "plugin.ini", "[plugin] needs a version, such as 1.0.0");
    else if (!validVersion(version)) add("package.version", "error", "plugin.ini", `the version "${version}" is not three numbers, such as 1.0.0`);
    if (formats && !["1", "2"].includes(formats)) {
      add("package.formats", "error", "plugin.ini", `formats = ${formats}: this PaperPaw reads formats 1 and 2`);
    }
    if (formats !== "2" && files["marks.ini"] !== undefined) {
      add("package.formats", "error", "plugin.ini", "marks.ini needs formats = 2 in [plugin]");
    }
  }

  // Every other ini file: its syntax first.
  const inis: Record<string, Ini> = {};
  for (const path of paths.filter((p) => p.endsWith(".ini") && p !== "plugin.ini" && !p.startsWith("store/"))) {
    inis[path] = parsed(path, text(path) ?? "", findings);
  }

  const settings = new Map(registry.settings.map((s) => [s.id, s]));
  const widgets = new Set(registry.widgets.map((w) => w.id));
  const actions = new Set(registry.actions.map((a) => a.id));

  // settings.ini: known settings, valid values.
  const settingsIni = inis["settings.ini"];
  if (settingsIni) {
    for (const e of settingsIni.entries) {
      checkSetting(`${e.section}.${e.key}`, e.value, `settings.ini:${e.line}`, settings, add);
    }
  }

  // presets.ini: kinds, names, the settings they set, layouts' widgets.
  const presets = inis["presets.ini"];
  if (presets) {
    for (const section of presets.sections) {
      const entries = presets.entries.filter((e) => e.section === section);
      const at = (key: string) => entries.find((e) => e.key === key);
      const kind = at("kind");
      const place = `presets.ini [${section}]`;
      if (!kind) add("presets.kind", "error", place, "a preset needs its kind, such as kind = home.layout");
      else if (kind.value !== "home.layout") {
        add("presets.kind", "warning", place, `the kind ${kind.value} is not one this PaperPaw offers presets of (home.layout)`);
      }
      if (!at("name")) add("presets.name", "error", place, "a preset needs a name (a translation key or the text)");
      for (const e of entries.filter((x) => !["kind", "name", "description"].includes(x.key))) {
        if (/^home\.page-\d$/.test(e.key)) checkLayout(e.value, `presets.ini:${e.line}`, widgets, entries, settings, add);
        else checkSetting(e.key, e.value, `presets.ini:${e.line}`, settings, add);
      }
      // A name that is a translation key is one of the plugin's own.
      const name = at("name")?.value ?? "";
      if (id && /^[a-z0-9-]+\.[a-z0-9.-]+$/.test(name) && !name.startsWith(`${id}.`)) {
        add("lint.namespace", "warning", place, `the name key ${name} should start with "${id}."`);
      }
    }
  }

  // keymap.ini: layers, inputs, actions.
  const keymap = inis["keymap.ini"];
  if (keymap) {
    for (const e of keymap.entries) {
      const place = `keymap.ini:${e.line}`;
      if (!e.section.startsWith("keymap.")) {
        add("keymap.layer", "error", place, `[${e.section}] is no key map layer: write [keymap.global] or [keymap.<screen>]`);
      }
      if (!INPUT.test(e.key)) {
        add("keymap.input", "error", place, `"${e.key}" is no input: button.<name>, long.<name>, tap.<zone>, long-tap.<zone>, swipe.<direction>, edge.<side>`);
      }
      if (e.value !== "none" && !actions.has(e.value)) {
        add("keymap.action", "error", place, `there is no action ${e.value} (lookup_docs: actions)`);
      }
    }
  }

  // Translations: a language, and keys in the plugin's namespace.
  for (const [path, ini] of Object.entries(inis).filter(([p]) => p.startsWith("i18n/"))) {
    if (!iniValue(ini, "meta", "language")) add("lint.catalog", "error", path, "a catalog needs [meta] language = <code>");
    for (const e of ini.entries.filter((x) => x.section === "messages")) {
      if (id && !e.key.startsWith(`${id}.`) && !e.key.startsWith(`${id}@`)) {
        add("lint.namespace", "warning", `${path}:${e.line}`, `the key ${e.key} should start with "${id}." (other plugins' texts are theirs)`);
      }
    }
  }

  if (findings.length === 0) {
    add("package.ok", "info", "(folder)", `${paths.length} files, as the store takes them`);
  }
  return findings;
}

function parsed(path: string, text: string, findings: Finding[]): Ini {
  const ini = parseIni(text);
  for (const p of ini.problems) {
    findings.push({ check: "package.ini", level: "error", place: `${path}:${p.line}`, message: p.message });
  }
  return ini;
}

type Add = (check: string, level: Level, place: string, message: string) => void;

/** `id` set to `value`: a setting this PaperPaw has, and a value it takes.
 *  Settings of a widget placed in a layout (`home.recent@1.count`) are
 *  the widget's settings (`home.recent.count`). */
function checkSetting(id: string, value: string, place: string, settings: Map<string, SettingInfo>, add: Add): void {
  const plain = id.replace(/@\d+/, "");
  const spec = settings.get(plain);
  if (!spec) {
    const near = [...settings.keys()].filter((s) => s.split(".")[0] === plain.split(".")[0] && similar(s, plain)).slice(0, 3);
    add("settings.unknown", "error", place, `there is no setting ${plain}${near.length ? `; did you mean ${near.join(", ")}?` : ""}`);
    return;
  }
  switch (spec.kind) {
    case "number": {
      const n = Number(value);
      if (!Number.isInteger(n)) add("settings.value", "error", place, `${spec.id} takes a whole number, not "${value}"`);
      else if (n < (spec.min ?? -Infinity) || n > (spec.max ?? Infinity)) {
        add("settings.value", "error", place, `${spec.id} = ${n} is outside its range, ${spec.min} to ${spec.max}`);
      }
      break;
    }
    case "switch":
      if (!["true", "false", "on", "off"].includes(value)) add("settings.value", "error", place, `${spec.id} is a switch: true or false`);
      break;
    case "choice": {
      const values = spec.choices?.map((c) => c.value) ?? [];
      if (values.length > 0 && !values.includes(value)) {
        add("settings.value", "error", place, `${spec.id} takes one of ${values.join(", ")}, not "${value}"`);
      }
      break;
    }
    default:
      break;
  }
}

/** A home screen page: `<widget>@<n> <col>/<row> <w>x<h>, ...`. */
function checkLayout(
  value: string,
  place: string,
  widgets: Set<string>,
  entries: { key: string; value: string }[],
  settings: Map<string, SettingInfo>,
  add: Add,
): void {
  const number = (key: string) => {
    const set = entries.find((e) => e.key === key)?.value;
    const fallback = settings.get(key)?.default;
    return Number(set ?? fallback ?? 0);
  };
  const columns = number("home.columns");
  const rows = number("home.rows");
  for (const item of value.split(",").map((v) => v.trim()).filter(Boolean)) {
    const m = /^([a-z0-9.-]+)(?:@\d+)?(?:\s+(\d+)\/(\d+)\s+(\d+)x(\d+))?$/.exec(item);
    if (!m) {
      add("layout.syntax", "error", place, `"${item}" is no placement: <widget>@1 <column>/<row> <width>x<height>`);
      continue;
    }
    const [, widget, col, row, w, h] = m;
    if (!widgets.has(widget!)) add("layout.widget", "error", place, `there is no widget ${widget} (lookup_docs: widgets)`);
    if (col !== undefined) {
      const [c, r, ww, hh] = [col, row, w, h].map(Number) as [number, number, number, number];
      // Rows 0: as many as the screen has room for; only columns are known.
      if ((columns > 0 && c + ww > columns) || (rows > 0 && r + hh > rows)) {
        const grid = rows > 0 ? `${columns} x ${rows}` : `${columns} columns`;
        add("layout.outside", "error", place, `${widget} at ${col}/${row}, ${w}x${h} goes past the grid of ${grid}`);
      }
    }
  }
}

function similar(a: string, b: string): boolean {
  const tail = (s: string) => s.split(".").slice(1).join(".");
  const x = tail(a);
  const y = tail(b);
  return x.includes(y) || y.includes(x) || (x.length > 3 && y.length > 3 && x.slice(0, 4) === y.slice(0, 4));
}
