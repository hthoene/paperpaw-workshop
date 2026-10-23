//! Plugins with code, built on this computer for the reader beside the
//! conversation: the project's crate (Cargo.toml, src/, the plugin's
//! folder `plugin/`) checked first (what it may hold, the SDK its only
//! crate), then built for this computer as PaperPaw's emulator loads code
//! (`code-host.dll`, `.so`, `.dylib`: a `cdylib` with the `plugin!` line,
//! the SDK's `outline` feature), by the compiler the emulator names
//! (toolchain.rs), against its SDK. The compiler's messages come back as
//! the AI reads them. Builds live in the app's folder (`builds/<project>/`),
//! so that the next one is quick.
//!
//! The SDK: the release's on crates.io (`paperpaw-sdk = "=<version>"`);
//! `PAPERPAW_SDK` names a local checkout's `crates/paperpaw-sdk` while the
//! workshop is worked on, as long as a PaperPaw in work (`0.4.0-dev`) is
//! fingerprinted by its very source.

use std::collections::BTreeMap;
use std::path::{Path, PathBuf};
use std::time::Instant;

use serde::Serialize;
use serde_json::Value;

/// What a project may hold, and the most bytes of each kind.
const KINDS: &[(&str, usize)] = &[
    ("Cargo.toml", 16 << 10),
    ("src/", 256 << 10),
    ("i18n/", 128 << 10),
    // "How it works" texts, by language, as PaperPaw's sample has them.
    ("how/", 16 << 10),
    ("plugin/", 8 << 20),
    ("README", 64 << 10),
    ("LICENCE", 64 << 10),
    ("LICENSE", 64 << 10),
    ("store/", 8 << 20),
];
const MAX_FILES: usize = 200;
const MAX_BYTES: usize = 32 << 20;
/// Crates a plugin may name: the SDK, so far.
const ALLOWED: &[&str] = &["paperpaw-sdk"];

/// One message of the compiler about the plugin's own files.
#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct Diagnostic {
    pub level: String,
    pub file: Option<String>,
    pub line: Option<u64>,
    pub column: Option<u64>,
    pub message: String,
    pub rendered: String,
}

/// A build, as the workshop's tools know one (src/build/client.ts).
#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct Built {
    pub id: String,
    pub state: String,
    pub seconds: Option<u64>,
    pub problems: Vec<String>,
    pub diagnostics: Vec<Diagnostic>,
    pub files: Vec<Value>,
    pub log_tail: String,
}

/// The crate as Cargo.toml says it: its name, version and plugin type.
#[derive(Debug, Clone, PartialEq)]
pub struct Crate {
    pub name: String,
    pub version: String,
    pub plugin: String,
}

/// Cargo.toml read as a plugin's is written: sections of `key = value`.
fn sections(text: &str) -> (BTreeMap<String, BTreeMap<String, String>>, Vec<String>) {
    let mut out: BTreeMap<String, BTreeMap<String, String>> = BTreeMap::new();
    let mut problems = Vec::new();
    let mut section = String::new();
    for (i, raw) in text.lines().enumerate() {
        let line = raw.split(" #").next().unwrap_or("").trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }
        if let Some(head) = line.strip_prefix('[').and_then(|l| l.strip_suffix(']')) {
            section = head.trim().to_string();
            out.entry(section.clone()).or_default();
            continue;
        }
        match line.split_once('=') {
            Some((key, value)) if !key.trim().is_empty() => {
                out.entry(section.clone()).or_default().insert(key.trim().to_string(), value.trim().to_string());
            }
            _ => problems.push(format!("Cargo.toml line {}: write key = value (a string, or {{ version = \"...\" }}).", i + 1)),
        }
    }
    (out, problems)
}

fn string(value: Option<&String>) -> Option<String> {
    let v = value?;
    (v.len() >= 2 && v.starts_with('"') && v.ends_with('"')).then(|| v[1..v.len() - 1].to_string())
}

/// The crate of `manifest`, and why it cannot be built if it cannot.
pub fn cargo(manifest: &str) -> (Option<Crate>, Vec<String>) {
    let (sections, mut problems) = sections(manifest);
    let package = sections.get("package").cloned().unwrap_or_default();
    let name = string(package.get("name")).filter(|n| {
        n.len() <= 64 && n.starts_with(|c: char| c.is_ascii_lowercase()) && n.chars().all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '-')
    });
    let version = string(package.get("version")).unwrap_or_else(|| "0.1.0".into());
    let plugin = string(sections.get("package.metadata.paperpaw").and_then(|s| s.get("plugin")))
        .filter(|p| p.starts_with(|c: char| c.is_ascii_uppercase()) && p.chars().all(|c| c.is_ascii_alphanumeric() || c == '_'));
    if name.is_none() {
        problems.push("Cargo.toml: [package] name = \"my-plugin\" (lower case, digits, hyphens).".into());
    }
    if plugin.is_none() {
        problems.push("Cargo.toml: [package.metadata.paperpaw] plugin = \"MyPlugin\", the type in src/lib.rs that implements Plugin.".into());
    }
    for known in sections.keys() {
        if !["package", "package.metadata.paperpaw", "dependencies", "lib"].contains(&known.as_str()) {
            problems.push(format!("Cargo.toml: [{known}] is not taken here; the workshop sets profiles, features and targets itself."));
        }
    }
    let deps: Vec<&String> = sections.get("dependencies").map(|d| d.keys().collect()).unwrap_or_default();
    for dep in &deps {
        if !ALLOWED.contains(&dep.as_str()) {
            problems.push(format!("Cargo.toml: the crate {dep} is not available; a plugin may use {}.", ALLOWED.join(", ")));
        }
    }
    if !deps.iter().any(|d| *d == "paperpaw-sdk") {
        problems.push("Cargo.toml: [dependencies] paperpaw-sdk is needed.".into());
    }
    let krate = match (name, plugin) {
        (Some(name), Some(plugin)) if problems.is_empty() => Some(Crate { name, version, plugin }),
        _ => None,
    };
    (krate, problems)
}

/// Why `files` cannot be built, in sentences the AI can act on; empty
/// when they can.
pub fn problems(files: &[(String, Vec<u8>)]) -> Vec<String> {
    let mut out = Vec::new();
    if files.len() > MAX_FILES {
        out.push(format!("A project holds at most {MAX_FILES} files."));
    }
    let total: usize = files.iter().map(|(_, b)| b.len()).sum();
    if total > MAX_BYTES {
        out.push(format!("The project is larger than {} MB.", MAX_BYTES >> 20));
    }
    for (path, bytes) in files {
        if path.split('/').any(|p| p.is_empty() || p == ".." || p.starts_with('.')) {
            out.push(format!("{path}: not a path inside the project."));
            continue;
        }
        match KINDS.iter().find(|(start, _)| path == start || path.starts_with(start)) {
            None => out.push(format!("{path}: a project holds Cargo.toml, src/*.rs, i18n/<lang>.ini, how/<lang>.txt, the plugin's folder plugin/ and a README.")),
            Some((_, max)) if bytes.len() > *max => out.push(format!("{path}: larger than {} KB.", max >> 10)),
            Some(_) => {}
        }
    }
    let has = |p: &str| files.iter().any(|(path, _)| path == p);
    if !has("src/lib.rs") {
        out.push("src/lib.rs is missing: the plugin crate's root.".into());
    }
    if !has("plugin/plugin.ini") {
        out.push("plugin/plugin.ini is missing: the plugin's folder, as readers install it.".into());
    }
    match files.iter().find(|(p, _)| p == "Cargo.toml") {
        None => out.push("Cargo.toml is missing.".into()),
        Some((_, bytes)) => out.extend(cargo(&String::from_utf8_lossy(bytes)).1),
    }
    out
}

/// How Cargo.toml names the SDK: a local checkout's, or the release's.
pub fn sdk(paperpaw: &str) -> String {
    match std::env::var("PAPERPAW_SDK") {
        Ok(path) if !path.is_empty() => format!("{{ path = {:?}, features = [\"outline\"] }}", path.replace('\\', "/")),
        _ => format!("{{ version = \"={paperpaw}\", features = [\"outline\"] }}"),
    }
}

/// The plugin's crate as the workshop builds it: its name and version,
/// the SDK named as `sdk` says.
pub fn plugin_manifest(krate: &Crate, sdk: &str) -> String {
    format!(
        "[package]\nname = \"{}\"\nversion = \"{}\"\nedition = \"2024\"\npublish = false\n\n[dependencies]\npaperpaw-sdk = {sdk}\n",
        krate.name, krate.version
    )
}

/// The library the emulator loads: the plugin behind PaperPaw's
/// `plugin!` line, built apart as a plugin's own repository builds it.
pub fn host_harness(krate: &Crate, sdk: &str) -> [(&'static str, String); 2] {
    let lib = krate.name.replace('-', "_");
    [
        (
            "Cargo.toml",
            format!(
                "[package]\nname = \"code-host\"\nversion = \"0.1.0\"\nedition = \"2024\"\npublish = false\n\n\
                 # A workspace of its own: the file must fit the emulator built elsewhere.\n[workspace]\n\n\
                 [lib]\ncrate-type = [\"cdylib\"]\n\n[dependencies]\npaperpaw-sdk = {sdk}\n{} = {{ path = \"../plugin\" }}\n\n\
                 # Quick to build again; it runs on this computer only.\n[profile.release]\nopt-level = 1\npanic = \"abort\"\nlto = false\ncodegen-units = 16\nincremental = true\n",
                krate.name
            ),
        ),
        ("src/lib.rs", format!("//! The plugin {} for PaperPaw's emulator.\n#![no_std]\n\npaperpaw_sdk::plugin!({lib}::{});\n", krate.name, krate.plugin)),
    ]
}

/// The compiler's messages (`--message-format=json`) about the plugin's
/// own files, errors first, at most 30.
pub fn diagnostics(output: &str, root: &str) -> Vec<Diagnostic> {
    let root = root.replace('\\', "/");
    let mut out: Vec<Diagnostic> = Vec::new();
    for line in output.lines().filter(|l| l.starts_with('{')) {
        let Ok(message) = serde_json::from_str::<Value>(line) else { continue };
        if message["reason"] != "compiler-message" {
            continue;
        }
        let m = &message["message"];
        let level = m["level"].as_str().unwrap_or_default();
        if level != "error" && level != "warning" {
            continue;
        }
        let spans = m["spans"].as_array().cloned().unwrap_or_default();
        let span = spans.iter().find(|s| s["is_primary"] == true).or(spans.first());
        let file = span
            .and_then(|s| s["file_name"].as_str())
            .map(|f| f.replace('\\', "/").replace(&format!("{root}/plugin/"), "").replace(&format!("{root}/"), ""));
        // Only what the plugin's own files say; PaperPaw's warnings are not its.
        let own = file.as_deref().is_some_and(|f| f.starts_with("src/") || f.starts_with("plugin/"));
        if level == "warning" && !own {
            continue;
        }
        let rendered = m["rendered"].as_str().or(m["message"].as_str()).unwrap_or_default().replace('\\', "/").replace(&format!("{root}/plugin/"), "").replace(&format!("{root}/"), "");
        if out.iter().any(|d| d.rendered == rendered) {
            continue;
        }
        out.push(Diagnostic {
            level: level.into(),
            file,
            line: span.and_then(|s| s["line_start"].as_u64()),
            column: span.and_then(|s| s["column_start"].as_u64()),
            message: m["message"].as_str().unwrap_or_default().into(),
            rendered,
        });
    }
    out.sort_by_key(|d| d.level != "error");
    out.truncate(30);
    out
}

/// Writes the plugin's crate and the harness into `dir` (`plugin/`,
/// `host/`), what was there before of the plugin's sources replaced.
fn lay_out(dir: &Path, files: &[(String, Vec<u8>)], krate: &Crate, sdk: &str) -> Result<(), String> {
    let plugin = dir.join("plugin");
    // The sources anew (a file removed is gone), the build's target kept.
    for gone in ["src", "i18n", "how"] {
        let _ = std::fs::remove_dir_all(plugin.join(gone));
    }
    let write = |path: PathBuf, bytes: &[u8]| -> Result<(), String> {
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
        std::fs::write(&path, bytes).map_err(|e| format!("{}: {e}", path.display()))
    };
    for (path, bytes) in files.iter().filter(|(p, _)| p.starts_with("src/") || p.starts_with("i18n/") || p.starts_with("how/")) {
        write(plugin.join(path), bytes)?;
    }
    write(plugin.join("Cargo.toml"), plugin_manifest(krate, sdk).as_bytes())?;
    for (path, text) in host_harness(krate, sdk) {
        write(dir.join("host").join(path), text.as_bytes())?;
    }
    Ok(())
}

/// The library a build made, as the emulator names it.
pub fn host_file() -> String {
    format!("code-host{}", std::env::consts::DLL_SUFFIX)
}

/// Builds the plugin of `files` in `dir` with `rust` for the emulator;
/// where the library is, if it was built.
pub fn build(dir: &Path, files: &[(String, Vec<u8>)], rust: &crate::toolchain::Rust, paperpaw: &str) -> (Built, Option<PathBuf>) {
    let started = Instant::now();
    let mut built = Built {
        id: format!("{}", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).map(|d| d.as_millis()).unwrap_or(0)),
        state: "failed".into(),
        seconds: None,
        problems: problems(files),
        diagnostics: Vec::new(),
        files: Vec::new(),
        log_tail: String::new(),
    };
    if paperpaw.contains('-') && std::env::var_os("PAPERPAW_SDK").is_none() {
        built.problems.push(format!(
            "PaperPaw {paperpaw} is a version in work: its SDK is not published, so plugins with code cannot be built for it. Say so to the person: plugins with code are built for released PaperPaw versions."
        ));
    }
    if !built.problems.is_empty() {
        return (built, None);
    }
    let manifest = files.iter().find(|(p, _)| p == "Cargo.toml").map(|(_, b)| String::from_utf8_lossy(b).into_owned()).unwrap_or_default();
    let Some(krate) = cargo(&manifest).0 else { return (built, None) };
    if let Err(e) = lay_out(dir, files, &krate, &sdk(paperpaw)) {
        built.problems.push(e);
        return (built, None);
    }
    let host = dir.join("host");
    let mut command = rust.cargo();
    command.args(["build", "--release", "--message-format=json-diagnostic-rendered-ansi"]).current_dir(&host);
    // Plain text for the AI, not the terminal's colours.
    command.args(["--config", "term.color='never'"]);
    let ran = match command.output() {
        Ok(ran) => ran,
        Err(e) => {
            built.log_tail = format!("cargo: {e}");
            return (built, None);
        }
    };
    built.seconds = Some(started.elapsed().as_secs());
    let stdout = String::from_utf8_lossy(&ran.stdout);
    built.diagnostics = diagnostics(&stdout, &dir.to_string_lossy());
    for d in &mut built.diagnostics {
        d.rendered = strip_ansi(&d.rendered);
    }
    let stderr = String::from_utf8_lossy(&ran.stderr);
    built.log_tail = stderr.lines().rev().take(20).collect::<Vec<_>>().into_iter().rev().collect::<Vec<_>>().join("\n");
    let library = host.join("target").join("release").join(format!("{}code_host{}", std::env::consts::DLL_PREFIX, std::env::consts::DLL_SUFFIX));
    if !ran.status.success() || !library.exists() {
        return (built, None);
    }
    built.state = "done".into();
    built.files.push(serde_json::json!({ "target": "host", "name": host_file(), "size": std::fs::metadata(&library).map(|m| m.len()).unwrap_or(0), "url": "" }));
    (built, Some(library))
}

fn strip_ansi(text: &str) -> String {
    let mut out = String::with_capacity(text.len());
    let mut chars = text.chars().peekable();
    while let Some(c) = chars.next() {
        if c == '\u{1b}' && chars.peek() == Some(&'[') {
            for d in chars.by_ref() {
                if d.is_ascii_alphabetic() {
                    break;
                }
            }
        } else {
            out.push(c);
        }
    }
    out
}

/// The plugin as the reader beside the conversation has it: a plugin
/// with code, its folder (`plugin/`) and its last build; a data plugin,
/// its files as they are.
pub fn for_emulator(project_dir: &Path, files: Vec<(String, Vec<u8>)>) -> Vec<(String, Vec<u8>)> {
    let code = files.iter().any(|(p, _)| p == "Cargo.toml") && files.iter().any(|(p, _)| p == "plugin/plugin.ini");
    if !code {
        return files;
    }
    let mut out: Vec<(String, Vec<u8>)> = files.into_iter().filter_map(|(p, b)| p.strip_prefix("plugin/").map(|p| (p.to_string(), b))).collect();
    if let Ok(library) = std::fs::read(build_dir(project_dir).join(host_file())) {
        out.push((host_file(), library));
    }
    out
}

/// Where a project's builds are kept: the app's folder, by the project's.
fn build_dir(project_dir: &Path) -> PathBuf {
    let name = project_dir.file_name().map(|n| n.to_string_lossy().into_owned()).unwrap_or_default();
    crate::paths::app_data().unwrap_or_default().join("builds").join(name)
}

/// Builds the project's plugin for the reader beside the conversation:
/// Rust set up first if need be (what happens told as `build-progress`),
/// then the build, its library kept with the project's builds.
#[tauri::command]
pub async fn code_build(app: tauri::AppHandle, emulator: tauri::State<'_, crate::emulator::Emulator>, project: String) -> Result<Built, String> {
    use tauri::Emitter;
    let ready = emulator.ready().ok_or("PaperPaw's emulator has not started yet.")?;
    tauri::async_runtime::spawn_blocking(move || {
        let root = crate::paths::projects()?;
        let files = crate::projects::plugin_files(&root, &project)?;
        let (version, target) = crate::toolchain::wanted(&ready.toolchain)?;
        crate::toolchain::can_link(&target)?;
        let told = |text: &str| {
            let _ = app.emit("build-progress", text.to_string());
        };
        let rust = crate::toolchain::ready(&crate::paths::app_data()?.join("rust"), &version, &told)?;
        told("Building…");
        let dir = build_dir(&crate::projects::folder(&root, &project)?);
        std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
        let (built, library) = build(&dir, &files, &rust, &ready.paperpaw);
        if let Some(library) = library {
            std::fs::copy(&library, dir.join(host_file())).map_err(|e| e.to_string())?;
        }
        Ok(built)
    })
    .await
    .map_err(|e| e.to_string())?
}

#[cfg(test)]
mod tests {
    use super::*;

    const MANIFEST: &str = "[package]\nname = \"my-clock\"\nversion = \"0.2.0\"\n\n[package.metadata.paperpaw]\nplugin = \"MyClock\"\n\n[dependencies]\npaperpaw-sdk = \"0.4\"\n";

    fn project() -> Vec<(String, Vec<u8>)> {
        vec![
            ("Cargo.toml".into(), MANIFEST.as_bytes().to_vec()),
            ("src/lib.rs".into(), b"// the plugin".to_vec()),
            ("plugin/plugin.ini".into(), b"[plugin]\nid = my-clock\n".to_vec()),
        ]
    }

    #[test]
    fn a_project_is_read_and_checked_before_it_is_built() {
        assert!(problems(&project()).is_empty(), "{:?}", problems(&project()));
        let krate = cargo(MANIFEST).0.unwrap();
        assert_eq!((krate.name.as_str(), krate.version.as_str(), krate.plugin.as_str()), ("my-clock", "0.2.0", "MyClock"));
        let mut bad = project();
        bad.push(("build.rs".into(), Vec::new()));
        bad.push((".cargo/config.toml".into(), Vec::new()));
        bad[0].1 = MANIFEST.replace("[dependencies]", "[dependencies]\nserde = \"1\"").into_bytes();
        let said = problems(&bad).join("\n");
        assert!(said.contains("build.rs:"), "{said}");
        assert!(said.contains(".cargo/config.toml: not a path"), "{said}");
        assert!(said.contains("the crate serde is not available"), "{said}");
    }

    #[test]
    fn the_harness_loads_the_plugin_as_the_emulator_takes_code() {
        let krate = cargo(MANIFEST).0.unwrap();
        let [(_, manifest), (_, lib)] = host_harness(&krate, "{ version = \"=0.4.0\", features = [\"outline\"] }");
        assert!(manifest.contains("crate-type = [\"cdylib\"]"));
        assert!(manifest.contains("my-clock = { path = \"../plugin\" }"));
        assert!(manifest.contains("[workspace]"));
        assert!(lib.contains("paperpaw_sdk::plugin!(my_clock::MyClock);"));
        assert!(plugin_manifest(&krate, "{ path = \"x\" }").contains("paperpaw-sdk = { path = \"x\" }"));
    }

    #[test]
    fn the_compiler_s_messages_about_the_plugin_are_kept() {
        let root = "C:/work/build";
        let line = |level: &str, file: &str, text: &str| {
            serde_json::json!({"reason": "compiler-message", "message": {"level": level, "message": text, "rendered": format!("{level}: {text}\n --> {root}/plugin/{file}:3:5"), "spans": [{"is_primary": true, "file_name": format!("{root}/plugin/{file}"), "line_start": 3, "column_start": 5}]}}).to_string()
        };
        let theirs = serde_json::json!({"reason": "compiler-message", "message": {"level": "warning", "message": "unused", "rendered": "warning: unused", "spans": [{"is_primary": true, "file_name": "C:/cargo/registry/paperpaw-sdk/src/lib.rs", "line_start": 1, "column_start": 1}]}}).to_string();
        let output = [line("warning", "src/lib.rs", "unused variable"), theirs, line("error", "src/lib.rs", "mismatched types")].join("\n");
        let found = diagnostics(&output, root);
        assert_eq!(found.iter().map(|d| d.message.as_str()).collect::<Vec<_>>(), ["mismatched types", "unused variable"]);
        assert_eq!(found[0].file.as_deref(), Some("src/lib.rs"));
        assert!(found[0].rendered.contains("--> src/lib.rs:3:5"), "{}", found[0].rendered);
        assert_eq!(strip_ansi("\u{1b}[1mbold\u{1b}[0m"), "bold");
    }

    /// A plugin with code built here and loaded by PaperPaw's emulator:
    /// with `PAPERPAW_EMU` and `PAPERPAW_SDK` (the checkout it was built
    /// from), else skipped. Sets up Rust in the app's folder the first
    /// time (some minutes).
    #[test]
    fn a_plugin_with_code_is_built_and_runs_in_paperpaw_s_emulator() {
        let (Some(program), true) = (std::env::var_os("PAPERPAW_EMU").map(PathBuf::from), std::env::var_os("PAPERPAW_SDK").is_some()) else {
            eprintln!("skipped: PAPERPAW_EMU and PAPERPAW_SDK name no PaperPaw");
            return;
        };
        let (events, seen) = std::sync::mpsc::channel();
        let emulator = crate::emulator::Emulator::new(move || Ok(program.clone()), move |e| {
            let _ = events.send(e);
        });
        let library = tempfile::tempdir().unwrap();
        emulator.start("xteink-x4", library.path()).unwrap();
        let ready = emulator.ready().unwrap();
        let (version, target) = crate::toolchain::wanted(&ready.toolchain).unwrap();
        crate::toolchain::can_link(&target).unwrap();
        let rust = crate::toolchain::ready(&crate::paths::app_data().unwrap().join("rust"), &version, &|t| eprintln!("{t}")).unwrap();

        let manifest = MANIFEST.replace("my-clock", "calm-code").replace("MyClock", "Calm");
        let lib = r#"#![no_std]
extern crate alloc;

use alloc::boxed::Box;
use paperpaw_sdk::ui::{self, UiStyle};
use paperpaw_sdk::{Canvas, Cx, Env, Handled, Id, Manifest, Plugin, Rect, RegisterError, Registrar, Screen, ScreenSpec, Version};

pub struct Calm;

struct Here(UiStyle);

impl Screen for Here {
    fn draw(&mut self, canvas: &mut Canvas<'_>, env: &Env<'_>) {
        let d = env.device.display;
        ui::draw_message(canvas, env, &self.0, Rect::new(0, 0, d.width, d.height), "Calm code here");
    }

    fn on_action(&mut self, _: &Id, _: &mut Cx<'_, '_>) -> Handled {
        Handled::No
    }
}

impl Plugin for Calm {
    fn manifest(&self) -> Manifest {
        Manifest::new(Id::new_static("calm-code"), "Calm", Version::new(0, 1, 0)).uses(paperpaw_sdk::Uses::NOTHING)
    }

    fn register(&self, r: &mut Registrar) -> Result<(), RegisterError> {
        r.add_screen(ScreenSpec::new(
            Id::new_static("calm-code.screen"),
            "calm-code.title",
            Box::new(|env, _| Box::new(Here(UiStyle::new(env)))),
        ))
    }
}
"#;
        let files = vec![
            ("Cargo.toml".to_string(), manifest.into_bytes()),
            ("src/lib.rs".to_string(), lib.as_bytes().to_vec()),
            ("plugin/plugin.ini".to_string(), b"[plugin]\nid = calm-code\nname = Calm\nversion = 0.1.0\n".to_vec()),
        ];
        let dir = tempfile::tempdir().unwrap();
        let (built, made) = build(dir.path(), &files, &rust, &ready.paperpaw);
        assert_eq!(built.state, "done", "{:#?}\n{}", built.diagnostics, built.log_tail);
        let mut on_reader: Vec<(String, Vec<u8>)> = vec![("plugin.ini".into(), files[2].1.clone())];
        on_reader.push((host_file(), std::fs::read(made.unwrap()).unwrap()));
        // Its screen opened, what the reader shows.
        let shown = |on_reader: &[(String, Vec<u8>)]| {
            crate::emulator::place_plugin(library.path(), "calm-code", on_reader).unwrap();
            emulator.reload().unwrap();
            let _ = emulator.open("calm-code.screen", &serde_json::json!({}));
            std::thread::sleep(std::time::Duration::from_secs(2));
            emulator.describe().unwrap().to_string()
        };
        assert!(shown(&on_reader).contains("Calm code here"), "the plugin's screen");

        // A library not built so does not run.
        on_reader[1].1 = b"not a library".to_vec();
        assert!(!shown(&on_reader).contains("Calm code here"));
        emulator.quit();
        drop(seen);
    }

    #[test]
    fn the_reader_gets_the_plugin_s_folder_and_its_build() {
        let folder = tempfile::tempdir().unwrap();
        let files = for_emulator(folder.path(), project());
        assert_eq!(files.iter().map(|(p, _)| p.as_str()).collect::<Vec<_>>(), ["plugin.ini"]);
        let data = vec![("plugin.ini".to_string(), b"x".to_vec())];
        assert_eq!(for_emulator(folder.path(), data.clone()), data);
    }
}
