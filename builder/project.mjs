// What a plugin with code may be, checked before anything is built (design
// 4.3 and 7.1): which files, how large, and a Cargo.toml that names only
// what the builder has (the SDK of the PaperPaw in the image). The
// builder writes the Cargo.toml it builds with itself; the author's says
// only the crate's name, its version and the plugin's type.

/** Paths a project may hold, and the most bytes of each kind. */
const KINDS = [
  { pattern: /^Cargo\.toml$/, max: 16 * 1024 },
  { pattern: /^src\/[a-z0-9_/]+\.rs$/, max: 256 * 1024 },
  { pattern: /^i18n\/[a-z]{2,3}(-[A-Za-z]+)?\.ini$/, max: 128 * 1024 },
  { pattern: /^plugin\/[A-Za-z0-9._/-]+$/, max: 8 * 1024 * 1024 },
  { pattern: /^(README|LICENCE|LICENSE)(\.md|\.txt)?$/, max: 64 * 1024 },
];
export const MAX_FILES = 200;
export const MAX_BYTES = 32 * 1024 * 1024;

/** Crates a plugin may name: the SDK only, so far (the list grows by
 *  request, design question 5). */
export const ALLOWED = ["paperpaw-sdk"];

/** Why the project cannot be built, in sentences the AI can act on; empty
 *  when it can. */
export function problems(files) {
  const out = [];
  const paths = Object.keys(files);
  if (paths.length > MAX_FILES) out.push(`A project holds at most ${MAX_FILES} files.`);
  let total = 0;
  for (const path of paths) {
    const size = bytesOf(files[path]).length;
    total += size;
    if (path.split("/").some((part) => part === ".." || part === "" || part.startsWith("."))) {
      out.push(`${path}: not a path inside the project.`);
      continue;
    }
    const kind = KINDS.find((k) => k.pattern.test(path));
    if (!kind) out.push(`${path}: a project holds Cargo.toml, src/*.rs, i18n/<lang>.ini, the plugin's folder plugin/ and a README.`);
    else if (size > kind.max) out.push(`${path}: larger than ${kind.max / 1024} KB.`);
  }
  if (total > MAX_BYTES) out.push(`The project is larger than ${MAX_BYTES / 1024 / 1024} MB.`);
  if (!files["src/lib.rs"]) out.push("src/lib.rs is missing: the plugin crate's root.");
  if (!files["plugin/plugin.ini"]) out.push("plugin/plugin.ini is missing: the plugin's folder, as readers install it.");
  if (!files["Cargo.toml"]) out.push("Cargo.toml is missing.");
  else {
    const manifest = cargo(textOf(files["Cargo.toml"]));
    out.push(...manifest.problems);
  }
  return out;
}

/** The parts of Cargo.toml the builder takes: the crate's name and
 *  version, the plugin's type (`[package.metadata.paperpaw] plugin`),
 *  and its dependencies, each of which must be allowed. A small TOML
 *  reader for what such a file holds; anything else is a problem. */
export function cargo(text) {
  const problems = [];
  const sections = {};
  let section = "";
  for (const [i, raw] of text.split(/\r?\n/).entries()) {
    const line = raw.replace(/\s+#.*$/, "").trim();
    if (!line || line.startsWith("#")) continue;
    const head = /^\[([A-Za-z0-9_.-]+)\]$/.exec(line);
    if (head) {
      section = head[1];
      sections[section] ??= {};
      continue;
    }
    const pair = /^([A-Za-z0-9_-]+)\s*=\s*(.+)$/.exec(line);
    if (!pair) {
      problems.push(`Cargo.toml line ${i + 1}: write key = value (a string, or { version = "..." }).`);
      continue;
    }
    (sections[section] ??= {})[pair[1]] = pair[2].trim();
  }
  const string = (v) => (v && /^"[^"]*"$/.test(v) ? v.slice(1, -1) : undefined);
  const pkg = sections.package ?? {};
  const name = string(pkg.name);
  const version = string(pkg.version) ?? "0.1.0";
  const plugin = string(sections["package.metadata.paperpaw"]?.plugin);
  if (!name || !/^[a-z][a-z0-9-]{0,63}$/.test(name)) problems.push('Cargo.toml: [package] name = "my-plugin" (lower case, digits, hyphens).');
  if (!plugin || !/^[A-Z][A-Za-z0-9_]*$/.test(plugin)) {
    problems.push('Cargo.toml: [package.metadata.paperpaw] plugin = "MyPlugin", the type in src/lib.rs that implements Plugin.');
  }
  for (const known of Object.keys(sections)) {
    if (!["package", "package.metadata.paperpaw", "dependencies", "lib"].includes(known)) {
      problems.push(`Cargo.toml: [${known}] is not taken here; the builder sets profiles, features and targets itself.`);
    }
  }
  const dependencies = Object.keys(sections.dependencies ?? {});
  for (const dep of dependencies) {
    if (!ALLOWED.includes(dep)) problems.push(`Cargo.toml: the crate ${dep} is not available; a plugin may use ${ALLOWED.join(", ")}.`);
  }
  if (!dependencies.includes("paperpaw-sdk")) problems.push('Cargo.toml: [dependencies] paperpaw-sdk = "0.5" is needed.');
  return { name, version, plugin, problems };
}

/** The Cargo.toml the builder builds the plugin crate with: the author's
 *  name and version, the SDK of the image's PaperPaw. */
export function pluginManifest(name, version, sdk) {
  return `[package]
name = "${name}"
version = "${version}"
edition = "2024"
publish = false

[dependencies]
paperpaw-sdk = { path = "${sdk}" }
`;
}

/** The harness: PaperPaw's web shell with the plugin added (`pp_plugins`,
 *  called by the page once the module is loaded). */
export function harness(crate, plugin, web) {
  const lib = crate.replaceAll("-", "_");
  return {
    "Cargo.toml": `[package]
name = "workshop-web"
version = "0.1.0"
edition = "2024"
publish = false

[workspace]

[lib]
crate-type = ["cdylib"]

[dependencies]
paperpaw-web = { path = "${web}" }
${crate} = { path = "../plugin" }

# Fast to build: no LTO, many units. The module is larger than a release's;
# it runs in the author's browser only.
[profile.release]
opt-level = "s"
panic = "abort"
lto = false
codegen-units = 16
incremental = true
`,
    "src/lib.rs": `//! PaperPaw's web emulator with the plugin ${crate} compiled in.
pub use paperpaw_web;

/// Called by the page once the module is loaded: the plugin is added to
/// every device started after.
#[unsafe(no_mangle)]
pub extern "C" fn pp_plugins() {
    paperpaw_web::emulator::set_plugins(|app| app.plugin(${lib}::${plugin}));
}
`,
  };
}

/** The native wrapper: the plugin as a file for a reader, as PaperPaw's
 *  sample (samples/hello-native) builds it. */
export function native(crate, plugin, sdk) {
  const lib = crate.replaceAll("-", "_");
  return {
    "Cargo.toml": `[package]
name = "workshop-native"
version = "0.1.0"
edition = "2024"
publish = false

[workspace]

[[bin]]
name = "plugin"
path = "src/main.rs"
test = false
bench = false

[dependencies]
paperpaw-sdk = { path = "${sdk}" }
${crate} = { path = "../plugin" }

[profile.release]
opt-level = "s"
lto = "fat"
codegen-units = 1
panic = "abort"
debug = "line-tables-only"
`,
    "src/main.rs": `#![no_std]
#![no_main]

paperpaw_sdk::plugin!(${lib}::${plugin});
`,
    ".cargo/config.toml": `[target.riscv32imc-unknown-none-elf]
rustflags = [
    "-C", "link-arg=-Tpaperpaw-plugin.x",
    "-C", "link-arg=--emit-relocs",
    "-C", "code-model=medium",
    "-C", "relocation-model=static",
    "-C", "force-frame-pointers",
    "--cfg", "paperpaw_plugin",
    "--remap-path-prefix=/work=/plugin",
    "--remap-path-prefix=/usr/local/cargo=/cargo",
]
`,
  };
}

/** The compiler's messages (cargo --message-format=json), as diagnostics
 *  the AI reads: errors and warnings in the plugin's own files, with
 *  their place and the compiler's own text. */
export function diagnostics(output, root) {
  const out = [];
  const seen = new Set();
  for (const line of output.split(/\r?\n/)) {
    if (!line.startsWith("{")) continue;
    let message;
    try {
      message = JSON.parse(line);
    } catch {
      continue;
    }
    if (message.reason !== "compiler-message") continue;
    const m = message.message;
    if (!["error", "warning"].includes(m.level)) continue;
    const span = m.spans?.find((s) => s.is_primary) ?? m.spans?.[0];
    const file = span?.file_name?.replaceAll("\\", "/").replace(`${root}/`, "");
    // Only what the plugin's own files say; the rest is PaperPaw's.
    if (file && !file.startsWith("src/") && !file.startsWith("plugin/") && m.level === "warning") continue;
    const rendered = (m.rendered ?? m.message).replaceAll(root + "/", "");
    if (seen.has(rendered)) continue;
    seen.add(rendered);
    out.push({ level: m.level, file: file ?? null, line: span?.line_start ?? null, column: span?.column_start ?? null, message: m.message, rendered });
  }
  // Errors first, at most 30 in all.
  return out.sort((a, b) => (a.level === b.level ? 0 : a.level === "error" ? -1 : 1)).slice(0, 30);
}

export function bytesOf(file) {
  return typeof file.text === "string" ? Buffer.from(file.text, "utf8") : Buffer.from(file.base64 ?? "", "base64");
}

function textOf(file) {
  return bytesOf(file).toString("utf8");
}
