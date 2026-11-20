#!/usr/bin/env node
// Generates the AI handbook from PaperPaw's own docs and its standard
// app, at a tag or branch, into public/handbook/ (served with the
// workshop):
//
//   npm run handbook -- --repo ../paperpaw --ref plugin-store
//
// - data.md: the system prompt for data plugins (handbook/parts/*.md,
//   sections of PaperPaw's docs, the samples, tables of the settings,
//   widgets and actions that matter most);
// - topics/*.md and index.json: what `lookup_docs` serves, one topic each
//   (every section of docs/plugins.md, the settings of each plugin or
//   group, widgets, actions, key maps, samples, device profiles);
// - sdk-items.json: every public item of the SDK (api.txt) with its
//   documentation from the SDK's source, which `lookup_docs` searches by
//   name and words;
// - registry.json: every setting, widget, action and profile, as the
//   standard app at that ref reports them (handbook/registry), for the
//   workshop's own checks;
// - meta.json: the ref, its commit, when.
//
// Options: --repo <path to a PaperPaw clone> (default ../paperpaw),
// --ref <tag or branch> (default main), --skip-registry (reuse the last
// handbook/.work/registry.json), --registry <file> (what that ref's
// `paperpaw-emu --registry` wrote, in place of building the dump),
// --out <folder> (default public/handbook).

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { apiLines, reachable, sdkItems } from "./sdk-items.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const work = path.join(here, ".work");

function option(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
const repo = path.resolve(root, option("repo", "../paperpaw"));
const ref = option("ref", "main");
const out = path.resolve(root, option("out", "public/handbook"));
const skipRegistry = process.argv.includes("--skip-registry");
const givenRegistry = option("registry", "");

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: "utf8", maxBuffer: 1 << 28, ...opts });
  if (r.status !== 0) {
    throw new Error(`${cmd} ${args.join(" ")} failed:\n${r.stderr || r.error}`);
  }
  return r.stdout;
}

// 1. PaperPaw at the ref, unpacked (never the working tree: what the ref says).
const commit = run("git", ["-C", repo, "rev-parse", `${ref}^{commit}`]).trim();
const tree = path.join(work, "paperpaw");
fs.rmSync(tree, { recursive: true, force: true });
fs.mkdirSync(tree, { recursive: true });
const archive = path.join(work, "paperpaw.tar");
run("git", ["-C", repo, "archive", "--format=tar", "-o", archive, ref]);
// Relative paths: GNU tar takes "C:" in a path for a host.
run("tar", ["-x", "-f", "../paperpaw.tar"], { cwd: tree });
fs.rmSync(archive);
const read = (p) => fs.readFileSync(path.join(tree, p), "utf8").replace(/\r\n/g, "\n");
const exists = (p) => fs.existsSync(path.join(tree, p));
console.log(`handbook: PaperPaw ${ref} (${commit.slice(0, 10)})`);

// 2. The registry, from the standard app at that ref.
const registryFile = path.join(work, "registry.json");
if (givenRegistry) {
  fs.copyFileSync(path.resolve(givenRegistry), registryFile);
} else if (!skipRegistry) {
  fs.copyFileSync(path.join(tree, "Cargo.lock"), path.join(here, "registry", "Cargo.lock"));
  console.log("handbook: building the registry dump (the first time takes minutes)");
  const r = spawnSync(
    "cargo",
    ["run", "--release", "--manifest-path", path.join(here, "registry", "Cargo.toml"), "--", registryFile],
    { stdio: "inherit", env: { ...process.env, CARGO_TARGET_DIR: path.join(work, "target") } },
  );
  if (r.status !== 0) throw new Error("the registry dump failed");
}
const registry = JSON.parse(fs.readFileSync(registryFile, "utf8"));

// 3. Sections of markdown, by heading.
function sections(markdown) {
  const lines = markdown.split("\n");
  const found = [];
  let fence = false;
  lines.forEach((line, i) => {
    if (line.startsWith("```")) fence = !fence;
    const m = !fence && /^(#{1,4}) (.+)$/.exec(line);
    if (m) found.push({ level: m[1].length, title: m[2].trim(), start: i });
  });
  return found.map((s, n) => {
    const next = found.slice(n + 1).find((t) => t.level <= s.level);
    const end = next ? next.start : lines.length;
    return { ...s, body: lines.slice(s.start, end).join("\n").trim() };
  });
}
/** Names of the plugin interface before 7 (the closure-and-registrar API,
 *  removed with Beta 4): a paragraph of PaperPaw's docs that names one is left
 *  out of everything the AI reads, until the docs themselves are rewritten. */
const OLD_API =
  /\bRegistrar\b|\bplugin!|\bnative::(take|support)\b|Native::(fits|problem)|\b(ScreenSpec|ActionSpec|SettingSpec|WidgetSpec|MenuEntry|Manifest)::|\bimpl (Plugin|Screen|Widget) for\b|\bfn register\(|\b(add_screen|add_action|add_setting|add_settings|add_widget|add_stylesheet|add_presets|add_translations|add_icon|add_choice|add_reader|add_render_hook|add_gatt_service|add_setting_group)\b|paperpaw_sdk::Plugin\b|`(Env|Plugin|Screen|Widget|Cx)`|\b(actions|menus|readers)::[a-z_A-Z]+|code-host|`outline` feature/;
function withoutOldApi(markdown) {
  // A passing mention of the old name ("(interface 6 `WidgetSpec`)") goes; the sentence stays.
  markdown = markdown.replace(/\s*\((?:the )?interface 6 `\w+`\)/g, "");
  const out = [];
  let paragraph = [];
  let fence = false;
  const flush = () => {
    if (paragraph.length && !OLD_API.test(paragraph.join("\n"))) out.push(paragraph.join("\n"));
    paragraph = [];
  };
  for (const line of markdown.split("\n")) {
    if (line.startsWith("```")) {
      fence = !fence;
      paragraph.push(line);
    } else if (!fence && line.trim() === "") {
      flush();
    } else {
      paragraph.push(line);
    }
  }
  flush();
  return out.join("\n\n");
}
const plugins = sections(read("docs/plugins.md")).map((s) => ({ ...s, body: withoutOldApi(s.body) }));
/** The section `title` of the plugin guide; several titles: the first
 *  there is (a section renamed between releases). */
const section = (...titles) => {
  const s = titles.map((t) => plugins.find((x) => x.title === t)).find(Boolean);
  if (!s) throw new Error(`docs/plugins.md has no section "${titles.join('" or "')}" at ${ref}`);
  return s.body;
};
const readme = sections(read("README.md"));
const customisation = (() => {
  const s = readme.find((x) => x.title === "Customisation at a glance");
  // Without its subsections: "Plugins without code" there repeats the docs.
  return s && { ...s, body: s.body.split("\n### ")[0].trim() };
})();

// 4. Tables from the registry.
const cell = (t) => String(t ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
function valuesOf(s) {
  switch (s.kind) {
    case "number":
      return `${s.min} to ${s.max}`;
    case "choice":
      return s.choices.map((c) => `\`${c.value}\``).join(", ");
    case "switch":
      return "`true`, `false`";
    default:
      return s.kind;
  }
}
function settingsTable(list) {
  const rows = list.map((s) => {
    const [section, ...key] = s.id.split(".");
    return `| \`[${section}] ${key.join(".")}\` | ${cell(s.title)} | ${valuesOf(s)} | \`${cell(s.default)}\` | ${cell(s.help)} |`;
  });
  return ["| Setting | Name | Values | Default | What it does |", "|---|---|---|---|---|", ...rows].join("\n");
}
const widgetsTable = [
  "| Widget id | Name |",
  "|---|---|",
  ...registry.widgets.map((w) => `| \`${w.id}\` | ${cell(w.title)} |`),
].join("\n");
const actionsTable = [
  "| Action id | Name |",
  "|---|---|",
  ...registry.actions.map((a) => `| \`${a.id}\` | ${cell(a.title)} |`),
].join("\n");
const profilesTable = [
  "| Profile | Device | Screen | Touch | Buttons |",
  "|---|---|---|---|---|",
  ...registry.profiles.map(
    (p) => `| \`${p.id}\` | ${p.name} | ${p.width} x ${p.height}, ${p.dpi} dpi | ${p.touch ? "yes" : "no"} | ${p.buttons.join(", ")} |`,
  ),
].join("\n");
const inGroup = (g) => registry.settings.filter((s) => s.group === g);

// 5. The samples: every file of samples/plugins, by plugin.
function samples() {
  const dir = path.join(tree, "samples/plugins");
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const files = [];
      const walk = (rel) => {
        for (const e of fs.readdirSync(path.join(dir, d.name, rel), { withFileTypes: true })) {
          const p = rel ? `${rel}/${e.name}` : e.name;
          if (e.isDirectory()) walk(p);
          else files.push(p);
        }
      };
      walk("");
      files.sort((a, b) => (a === "plugin.ini" ? -1 : b === "plugin.ini" ? 1 : a.localeCompare(b)));
      const body = files
        .map((f) => `\`${f}\`:\n\n\`\`\`ini\n${read(`samples/plugins/${d.name}/${f}`).trim()}\n\`\`\``)
        .join("\n\n");
      return { id: d.name, body: `## Sample: ${d.name}\n\n${body}` };
    });
}
const sampleList = samples();
const keymap = exists("crates/paperpaw-core/keymaps/default.ini")
  ? read("crates/paperpaw-core/keymaps/default.ini").trim()
  : "";

// 6. The data handbook (the system prompt).
const part = (name) => fs.readFileSync(path.join(here, "parts", name), "utf8").trim();
const data = [
  part("common.md"),
  part("data.md"),
  // PaperPaw's facts the guide does not gather yet (the data files and
  // their formats, home screens): until docs/data-files.md has them.
  part("data-interim.md"),
  "# From PaperPaw's documentation",
  section("What is uploaded"),
  section("Plugins without code").replace(/^## /, "## "),
  section("Presets and home screen layouts", "Presets"),
  customisation ? withoutOldApi(customisation.body) : "",
  "## The default key map\n\nInputs (`button.<name>`, `long.<name>`, `tap.<zone>`, `swipe.<direction>` ...) and the actions they run, as PaperPaw ships them; a plugin's `keymap.ini` overrides single bindings in the same layers.\n\n```ini\n" +
    keymap +
    "\n```",
  "# Samples\n\nComplete data plugins that come with PaperPaw.",
  ...sampleList.filter((s) => ["airy-theme", "reading-nook", "large-print", "theme-paw"].includes(s.id)).map((s) => s.body),
  "# What this PaperPaw has\n\nOnly these ids exist. `lookup_docs` has the settings of every other plugin (`settings/<plugin>`) and more.",
  "## The look settings\n\n" + settingsTable(inGroup("core.group.look")),
  "## The reading settings\n\n" + settingsTable(inGroup("core.group.reading")),
  "## Widgets for home screen layouts\n\n" + widgetsTable,
  "## Actions for key maps\n\n" + actionsTable,
  "## The devices\n\n" + profilesTable,
]
  .filter(Boolean)
  .join("\n\n");

// 6b. The code handbook (the system prompt for plugins with code, plugin
// interface 7): the rules (handbook/parts/code.md), the recipes complete
// (handbook/recipes/, which the workshop's tests build and run against this
// PaperPaw, code.rs `the_handbook_s_recipes_build_without_a_warning_and_run`,
// so that they never go stale), and the device's functions a plugin may list
// in native/metadata.json, from the table of the `paperpaw-dev` of that ref.
// PaperPaw's docs/plugins.md describes the interface before 7 for most of its
// code chapters: none of it goes into the handbook, and every topic below it
// comes from the interface 7 docs (docs/abi) and the SDK's own items.
const RECIPES = {
  hello: "A screen with an action in the tools menu, a setting, an event and translations (the sample a new project starts with)",
  motto: "A widget for the home screen with a setting of its own",
};
const recipeFiles = (name) => {
  const dir = path.join(here, "recipes", name);
  const walk = (rel) =>
    fs.readdirSync(path.join(dir, rel), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.posix.join(rel, e.name)) : [path.posix.join(rel, e.name)]));
  const first = ["src/main.rs", "Cargo.toml", "native/metadata.json", "plugin/plugin.ini", "plugin/i18n/en.ini"];
  return walk("")
    .sort((a, b) => (first.indexOf(a) + 1 || 99) - (first.indexOf(b) + 1 || 99) || a.localeCompare(b))
    .map((p) => ({ path: p, text: fs.readFileSync(path.join(dir, p), "utf8").replace(/\r\n/g, "\n").trim() }));
};
const fenceOf = (p) => (p.endsWith(".rs") ? "rust" : p.endsWith(".toml") ? "toml" : p.endsWith(".ini") ? "ini" : p.endsWith(".json") ? "json" : "text");
const recipeText = (name) => recipeFiles(name).map((f) => `\`${f.path}\`:\n\n\`\`\`${fenceOf(f.path)}\n${f.text}\n\`\`\``).join("\n\n");
const recipes = [
  "# Recipes",
  "Complete plugins for common tasks, built against this PaperPaw without a warning and run in its emulator. Start from the one closest to what the person wants: write its files whole into the project (in place of the sample's), rename it, build, and only then change it. Look up only what a recipe does not show.\n\n" +
    Object.entries(RECIPES)
      .map(([name, title]) => `- \`recipes/${name}\`: ${title}.`)
      .join("\n"),
  ...Object.entries(RECIPES).map(([name, title]) => `## Recipe \`${name}\`: ${title}\n\n` + recipeText(name)),
].join("\n\n");

// What native/metadata.json may name: the interface's table of this ref.
const metadataTable = (() => {
  const file = "tools/dev/src/metadata/table.txt";
  if (!exists(file)) return "";
  const lines = read(file).split("\n");
  const names = (kind) => lines.filter((l) => l.startsWith(`${kind} `)).map((l) => l.split(" ")[1]);
  const keys = (kind) => lines.filter((l) => l.startsWith(`${kind} `)).map((l) => l.split(" ")[1]);
  const [major, minor] = (lines.find((l) => l.startsWith("abi ")) ?? "abi 7 1").split(" ").slice(1);
  return [
    "## The device's functions a plugin may list",
    `Plugin interface ${major}, minor ${minor}. The \`used\` lines of \`native/metadata.json\` are \`{"kind": "host", "name": "<function>"}\` and \`{"kind": "callback", "name": "<callback>"}\`; \`floor\` is ${minor} unless the plugin should also run where the device has an older minor (then \`used\` must list what it needs).`,
    "Functions of the device (`host`): " + names("host").map((n) => `\`${n}\``).join(", ") + ".",
    "Callbacks a plugin has (`callback`): " + names("callback").map((n) => `\`${n}\``).join(", ") + ".",
    "`services` the plugin may ask to use (each a consent): " + keys("service").map((n) => `\`${n}\``).join(", ") + ".",
    "`features` it may ask for, as `{\"key\": \"uses.network\", \"required\": false}`: " + keys("feature").map((n) => `\`${n}\``).join(", ") + ".",
  ].join("\n\n");
})();

const code = [
  part("common.md"),
  part("code.md"),
  recipes,
  metadataTable,
  "## The devices\n\n" + profilesTable,
]
  .filter(Boolean)
  .join("\n\n");

// What a plugin of interface 7 reaches of the SDK: `native` (the interface),
// `builtin` (the ids the device has) and the few types the interface shares.
// The rest of the SDK's items (`ui`, `widgets`, `Canvas` ...) are the
// interface before 7, which Beta 4 no longer runs; the AI is not shown them.

// 7. Topics for lookup_docs.
const slug = (t) =>
  t
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const topics = [];
const add = (id, title, body) => topics.push({ id, title, body: body.trim() });

/** A module's api.txt `lines` in the order a plugin needs them, so that a
 *  topic cut short keeps what matters: its traits, then its structs and
 *  enums, each followed by its members, then its functions, then the
 *  rest (constants, re-exports). */
function byImportance(lines) {
  const rank = { trait: 0, struct: 1, enum: 2, type: 3, fn: 4, const: 5, static: 5 };
  const parse = (line) => {
    const m = /^pub (?:([a-z]+(?: [a-z]+)*) )?paperpaw_sdk::([\w:]+)/.exec(line);
    const kind = m?.[1]?.split(" ").at(-1) ?? "field";
    const segs = (m?.[2] ?? "").split("::");
    const at = segs.findIndex((s) => /^[A-Z]/.test(s));
    return { kind, owner: at >= 0 ? segs.slice(0, at + 1).join("::") : null, self: at === segs.length - 1 };
  };
  const parsed = lines.map((line, i) => ({ line, i, ...parse(line) }));
  const typeKind = new Map(parsed.filter((p) => p.owner && p.self).map((p) => [p.owner, p.kind]));
  const key = (p) => {
    if (p.owner && typeKind.has(p.owner)) return [rank[typeKind.get(p.owner)] ?? 3, p.owner, p.self ? 0 : 1, p.i];
    return [p.kind === "fn" ? 6 : 7, "", 0, p.i];
  };
  return parsed
    .sort((a, b) => {
      const [x, y] = [key(a), key(b)];
      for (let n = 0; n < x.length; n++) if (x[n] !== y[n]) return x[n] < y[n] ? -1 : 1;
      return 0;
    })
    .map((p) => p.line);
}
// The chapters about plugins with code describe the interface before 7: the
// recipes, the SDK's items and docs/abi replace them (below).
const CODE_CHAPTERS = new Set(["Your first plugin with code", "Plugins as files", "Memory"]);
const inCodeChapter = (() => {
  let current = "";
  const inside = new Map();
  for (const s of plugins) {
    if (s.level === 2) current = s.title;
    inside.set(s, current);
  }
  return (s) => CODE_CHAPTERS.has(inside.get(s)) || CODE_CHAPTERS.has(s.title);
})();
for (const s of plugins.filter((s) => s.level >= 2 && !inCodeChapter(s) && s.body.split("\n").length > 1)) add(`docs/${slug(s.title)}`, s.title, s.body);
// What the device does for each area of plugin interface 7.
if (exists("docs/abi")) {
  for (const file of fs.readdirSync(path.join(tree, "docs/abi")).filter((f) => f.endsWith(".md")).sort()) {
    add(`abi/${file.replace(/\.md$/, "")}`, `Plugin interface 7: ${file.replace(/\.md$/, "").replace(/-/g, " ")}`, withoutOldApi(read(`docs/abi/${file}`)));
  }
}
if (customisation) add("docs/customisation", "Customisation at a glance (paperpaw.ini)", customisation.body);
add("keymap/default", "The default key map", "```ini\n" + keymap + "\n```");
for (const s of sampleList) add(`samples/${s.id}`, `Sample data plugin: ${s.id}`, s.body);
for (const [name, title] of Object.entries(RECIPES)) add(`recipes/${name}`, `Recipe: ${title}`, recipeText(name));
add("widgets", "Widgets for home screen layouts", widgetsTable);
add("actions", "Actions for key maps", actionsTable);
add("devices", "The devices (emulator profiles)", profilesTable);
// The SDK's public items with their signatures (crates/paperpaw-sdk/api.txt),
// by module: what a plugin with code may call, exactly.
if (exists("crates/paperpaw-sdk/api.txt")) {
  const byModule = new Map();
  for (const line of apiLines(read("crates/paperpaw-sdk/api.txt"))) {
    const m = /^pub (?:[a-z ]+ )?paperpaw_sdk::([a-z_]+)::/.exec(line);
    if (!line.startsWith("pub ")) continue;
    // Where the item lives: after `paperpaw_sdk::`, without what it is.
    const at = /paperpaw_sdk::([\w:]+)/.exec(line)?.[1] ?? "";
    if (!reachable(at)) continue;
    // `native` is most of what a plugin reaches: a topic for each of its modules.
    const sub = /^native::([a-z][a-z0-9_]*)::/.exec(at)?.[1];
    const module = sub ? `native/${sub}` : m ? m[1] : "root";
    byModule.set(module, [...(byModule.get(module) || []), line]);
  }
  for (const [module, lines] of byModule) {
    add(`sdk/${module}`, module === "root" ? "The SDK's top level (paperpaw_sdk::...)" : `The SDK's module ${module}`, "```rust\n" + byImportance(lines).join("\n") + "\n```");
  }
}

// 7b. Every public item a plugin reaches through the SDK, with its
// documentation, to search by name (sdk-items.mjs).
const rustFiles = (rel) =>
  fs
    .readdirSync(path.join(tree, rel), { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? rustFiles(`${rel}/${e.name}`) : e.name.endsWith(".rs") ? [`${rel}/${e.name}`] : []));
const sdkItemList = sdkItems({ read, exists, files: rustFiles }).filter((i) => reachable(i.path));
const byPlugin = new Map();
for (const s of registry.settings) {
  const plugin = s.id.split(".")[0];
  byPlugin.set(plugin, [...(byPlugin.get(plugin) || []), s]);
}
for (const [plugin, list] of byPlugin) add(`settings/${plugin}`, `Settings of ${plugin}`, settingsTable(list));
const groups = new Map();
for (const s of registry.settings) groups.set(s.group, [...(groups.get(s.group) || []), s]);
for (const [group, list] of groups) add(`settings-group/${group}`, `Settings in the group ${group}`, settingsTable(list));

// 8. Write it out.
const tokens = (text) => Math.round(text.length / 3.6);
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, "topics"), { recursive: true });
fs.writeFileSync(path.join(out, "data.md"), data + "\n");
fs.writeFileSync(path.join(out, "code.md"), code + "\n");
// The project a plugin with code starts from: the recipe `hello`, as the
// workshop takes a project (src-tauri/src/code.rs).
{
  const sample = Object.fromEntries(recipeFiles("hello").map((f) => [f.path, f.text + "\n"]));
  fs.writeFileSync(path.join(out, "code-sample.json"), JSON.stringify(sample, null, 1) + "\n");
}
const index = topics.map((t) => {
  const file = `${t.id.replace(/\//g, "--")}.md`;
  fs.writeFileSync(path.join(out, "topics", file), t.body + "\n");
  const summary = t.body
    .replace(/^#+ .*\n+/, "")
    .split(/(?<=\.)\s/)[0]
    .slice(0, 160);
  return { id: t.id, title: t.title, file, summary, tokens: tokens(t.body) };
});
fs.writeFileSync(path.join(out, "index.json"), JSON.stringify(index, null, 1) + "\n");
fs.writeFileSync(path.join(out, "registry.json"), JSON.stringify(registry) + "\n");
fs.writeFileSync(path.join(out, "sdk-items.json"), JSON.stringify(sdkItemList) + "\n");
fs.writeFileSync(
  path.join(out, "meta.json"),
  JSON.stringify({ ref, commit, generated: new Date().toISOString().slice(0, 10), dataTokens: tokens(data), codeTokens: tokens(code) }, null, 2) + "\n",
);
console.log(
  `handbook: data.md about ${tokens(data)} tokens, code.md about ${tokens(code)}, ${topics.length} topics, ${sdkItemList.length} SDK items (${sdkItemList.filter((i) => i.doc).length} documented), in ${path.relative(root, out)}`,
);
