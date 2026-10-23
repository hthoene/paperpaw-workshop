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

import { apiLines, sdkItems } from "./sdk-items.mjs";

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
const commit = run("git", ["-C", repo, "rev-parse", ref]).trim();
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
const plugins = sections(read("docs/plugins.md"));
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
  customisation ? customisation.body : "",
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

// 6b. The code handbook (the system prompt for plugins with code): the
// rules, PaperPaw's own docs on writing plugins, the sample complete.
const sampleCode = exists("samples/hello-plugin/src/lib.rs")
  ? [
      "# The sample plugin, complete\n\nPaperPaw's own sample (`samples/hello-plugin`), which a new project starts from.",
      "`src/lib.rs`:\n\n```rust\n" + read("samples/hello-plugin/src/lib.rs").trim() + "\n```",
      "`i18n/en.ini`:\n\n```ini\n" + read("samples/hello-plugin/i18n/en.ini").trim() + "\n```",
    ]
  : [];
// The recipes (handbook/recipes/): complete plugins for common tasks,
// which the workshop's tests build against this PaperPaw (code.rs,
// `the_handbook_s_recipes_build_without_a_warning`), so that they never
// go stale. The widget from the web is in the handbook whole, the others
// are topics.
const RECIPES = {
  "widget-fetch": "A widget with data from the web: JSON fetched over HTTP, shown wrapped",
  settings: "Settings of a plugin's own (text, choice, switch, number), read by a widget",
};
const recipeFiles = (name) => {
  const dir = path.join(here, "recipes", name);
  const walk = (rel) =>
    fs.readdirSync(path.join(dir, rel), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.posix.join(rel, e.name)) : [path.posix.join(rel, e.name)]));
  const first = ["src/lib.rs", "Cargo.toml", "plugin/plugin.ini", "i18n/en.ini"];
  return walk("")
    .sort((a, b) => (first.indexOf(a) + 1 || 99) - (first.indexOf(b) + 1 || 99) || a.localeCompare(b))
    .map((p) => ({ path: p, text: fs.readFileSync(path.join(dir, p), "utf8").replace(/\r\n/g, "\n").trim() }));
};
const fenceOf = (p) => (p.endsWith(".rs") ? "rust" : p.endsWith(".toml") ? "toml" : p.endsWith(".ini") ? "ini" : "text");
const recipeText = (name) => recipeFiles(name).map((f) => `\`${f.path}\`:\n\n\`\`\`${fenceOf(f.path)}\n${f.text}\n\`\`\``).join("\n\n");
const recipes = [
  "# Recipes",
  "Complete plugins for common tasks, built against this PaperPaw without a warning. Start from the one closest to what the person wants: write its files whole into the project (in place of the sample's), build, and only then change it. Look up only what a recipe does not show.\n\n" +
    Object.entries(RECIPES)
      .map(([name, title]) => `- \`recipes/${name}\`: ${title}.`)
      .join("\n") +
    "\n- A screen, an action in a menu, a text setting, an event and translations: the sample plugin the project starts with (below).",
  `## ${RECIPES["widget-fetch"]}\n\n` +
    "To see it: `build`, then `control` `widget` with its id (here `quote.today`), `wait` for a text of the reply, and `look`. The reader beside the conversation fetches from the internet as a reader does.\n\n" +
    recipeText("widget-fetch"),
].join("\n\n");

const code = [
  part("common.md"),
  part("code.md"),
  recipes,
  "# From PaperPaw's documentation",
  ...["The sample plugin", "Reading and changing: `Env` and commands", "Screens", "Settings", "Events", "Translations", "What plugins contribute", "Memory"]
    .filter((t) => plugins.some((s) => s.title === t))
    .map((t) => section(t)),
  ...sampleCode,
  "## The devices\n\n" + profilesTable,
]
  .filter(Boolean)
  .join("\n\n");

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
for (const s of plugins.filter((s) => s.level >= 2)) add(`docs/${slug(s.title)}`, s.title, s.body);
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
    const module = m ? m[1] : "root";
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
const sdkItemList = sdkItems({ read, exists, files: rustFiles });
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
// The project a plugin with code starts from: PaperPaw's sample, as the
// workshop and its builder take a project (builder/project.mjs).
if (exists("samples/hello-plugin/src/lib.rs")) {
  const sample = {
    "Cargo.toml": '[package]\nname = "hello"\nversion = "0.1.0"\n\n[package.metadata.paperpaw]\nplugin = "Hello"\n\n[dependencies]\npaperpaw-sdk = "0.5"\n',
    "src/lib.rs": read("samples/hello-plugin/src/lib.rs"),
    "i18n/en.ini": read("samples/hello-plugin/i18n/en.ini"),
    "plugin/plugin.ini": exists("samples/hello-native/plugin/plugin.ini")
      ? read("samples/hello-native/plugin/plugin.ini")
      : "[plugin]\nid = hello\nname = Hello\ndescription = A sample plugin to start from.\nversion = 0.1.0\n",
  };
  if (exists("samples/hello-plugin/i18n/de.ini")) sample["i18n/de.ini"] = read("samples/hello-plugin/i18n/de.ini");
  // How it works, which src/lib.rs includes (`include_str!("../how/en.txt")`).
  for (const lang of ["en", "de"]) {
    if (exists(`samples/hello-plugin/how/${lang}.txt`)) sample[`how/${lang}.txt`] = read(`samples/hello-plugin/how/${lang}.txt`);
  }
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
