//! Plugins with code, built on this computer for the reader beside the
//! conversation, as PaperPaw's plugin interface 7 has them: the project
//! (Cargo.toml, src/main.rs with `native_plugin!`, native/metadata.json, the
//! plugin's folder `plugin/`) checked first (what it may hold, the SDK its
//! only crate), then laid out as `paperpaw-dev new --code` lays a plugin
//! out and built with `paperpaw-dev build --device emulator` (a library the
//! emulator loads as `code-host.so`, Linux x86-64), by the compiler the
//! emulator names (toolchain.rs), against its SDK. The compiler's messages
//! come back as the AI reads them. Builds live in the app's folder
//! (`builds/<project>/`), so that the next one is quick.
//!
//! The SDK: the one the installer brought with the emulator (`sdk/` beside
//! the app, of the same PaperPaw), or `PAPERPAW_SDK`, a local checkout's
//! `crates/paperpaw-sdk`, while the workshop is worked on (see
//! `local_sdk`); else the release's on crates.io.

use std::collections::BTreeMap;
use std::path::{Path, PathBuf};
use std::time::Instant;

use serde::Serialize;
use serde_json::Value;

/// What a project may hold, and the most bytes of each kind.
const KINDS: &[(&str, usize)] = &[
    ("Cargo.toml", 16 << 10),
    ("src/", 256 << 10),
    // What the code may call of the device, the plugin's own list.
    ("native/metadata.json", 16 << 10),
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

/// The crate as Cargo.toml says it: its name (the plugin's id) and version.
#[derive(Debug, Clone, PartialEq)]
pub struct Crate {
    pub name: String,
    pub version: String,
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
        n.len() <= 40 && n.starts_with(|c: char| c.is_ascii_lowercase()) && n.chars().all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '-')
    });
    let version = string(package.get("version")).unwrap_or_else(|| "0.1.0".into());
    if name.is_none() {
        problems.push("Cargo.toml: [package] name = \"my-plugin\": the plugin's id (lower case, digits, hyphens, beginning with a letter).".into());
    }
    for known in sections.keys() {
        if !["package", "dependencies"].contains(&known.as_str()) {
            problems.push(format!("Cargo.toml: [{known}] is not taken here; the workshop writes the crate's targets, profiles and features itself: keep [package] and [dependencies]."));
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
    let krate = match name {
        Some(name) if problems.is_empty() => Some(Crate { name, version }),
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
            None => out.push(format!("{path}: a project holds Cargo.toml, src/*.rs, native/metadata.json, the plugin's folder plugin/ (plugin.ini, i18n/<lang>.ini, how/<lang>.txt ...) and a README.")),
            Some((_, max)) if bytes.len() > *max => out.push(format!("{path}: larger than {} KB.", max >> 10)),
            Some(_) => {}
        }
    }
    let has = |p: &str| files.iter().any(|(path, _)| path == p);
    if !has("src/main.rs") {
        out.push("src/main.rs is missing: the plugin crate's root (`#![no_std]`, `#![no_main]` and the `native_plugin!` line).".into());
    }
    if has("src/lib.rs") {
        out.push("src/lib.rs: a plugin is a program, not a library: its root is src/main.rs (modules beside it are `mod name;`).".into());
    }
    if !has("plugin/plugin.ini") {
        out.push("plugin/plugin.ini is missing: the plugin's folder, as readers install it.".into());
    }
    let id = match files.iter().find(|(p, _)| p == "Cargo.toml") {
        None => {
            out.push("Cargo.toml is missing.".into());
            None
        }
        Some((_, bytes)) => {
            let (krate, said) = cargo(&String::from_utf8_lossy(bytes));
            out.extend(said);
            krate.map(|k| k.name)
        }
    };
    // The crate's name is the plugin's id: the build names its folder by it.
    let ini = files.iter().find(|(p, _)| p == "plugin/plugin.ini").map(|(_, b)| String::from_utf8_lossy(b).into_owned());
    if let (Some(id), Some(ini)) = (id, ini) {
        let named = ini.lines().find_map(|l| l.split_once('=').filter(|(k, _)| k.trim() == "id").map(|(_, v)| v.trim().to_string()));
        if named.as_deref().is_some_and(|n| n != id) {
            out.push(format!("plugin/plugin.ini: id = {} is not the crate's name {id} (Cargo.toml [package] name): they are the same.", named.unwrap_or_default()));
        }
    }
    out
}

/// The SDK's crate on this computer for PaperPaw `paperpaw`, if there is
/// one: `PAPERPAW_SDK` (a checkout's `crates/paperpaw-sdk`), else the
/// one the installer brought beside the app (`sdk/`), where it is of
/// that very PaperPaw (`sdk/version.txt`).
pub fn local_sdk(paperpaw: &str) -> Option<PathBuf> {
    if let Some(path) = std::env::var_os("PAPERPAW_SDK").filter(|p| !p.is_empty()) {
        return Some(PathBuf::from(path));
    }
    bundled_sdk(&std::env::current_exe().ok()?.parent()?.join("sdk"), paperpaw)
}

/// The SDK's crate in `dir` (as scripts/installer.mjs lays it out), if it
/// is of PaperPaw `paperpaw`.
pub fn bundled_sdk(dir: &Path, paperpaw: &str) -> Option<PathBuf> {
    let version = std::fs::read_to_string(dir.join("version.txt")).ok()?;
    let krate = dir.join("crates").join("paperpaw-sdk");
    (version.trim() == paperpaw && krate.join("Cargo.toml").is_file()).then_some(krate)
}

/// The SDK the crate is built against: the one on this computer (see
/// `local_sdk`), else none, and then the release's own on crates.io
/// (`paperpaw-dev new` names it).
pub fn sdk(paperpaw: &str) -> Option<PathBuf> {
    local_sdk(paperpaw)
}

/// The compiler's messages in Cargo's plain text (what `paperpaw-dev
/// build` lets through), as one message each: its first line, where it
/// points (`--> src/main.rs:3:5`) and all of it. Errors first, at most 30;
/// a warning only where it is about the plugin's own files.
pub fn diagnostics(output: &str) -> Vec<Diagnostic> {
    let output = strip_ansi(output).replace('\\', "/");
    let mut blocks: Vec<Vec<&str>> = Vec::new();
    for line in output.lines() {
        let header = ["error", "warning"].iter().any(|w| line.strip_prefix(w).is_some_and(|r| r.starts_with(':') || r.starts_with('[')));
        let end = ["   Compiling", "    Finished", "    Building", "For more information", "Some errors have"].iter().any(|p| line.starts_with(p));
        if header {
            blocks.push(vec![line]);
        } else if end {
            blocks.push(Vec::new());
        } else if let Some(last) = blocks.last_mut().filter(|b| !b.is_empty()) {
            last.push(line);
        }
    }
    let mut out: Vec<Diagnostic> = Vec::new();
    for block in blocks.iter().filter(|b| !b.is_empty()) {
        let first = block[0];
        let (level, message) = match first.split_once(": ") {
            Some((head, message)) => (if head.starts_with("error") { "error" } else { "warning" }, message.trim().to_string()),
            None => continue,
        };
        // Cargo's own summaries, not about the plugin's code.
        if message.starts_with("could not compile") || message.starts_with("aborting due to") || message.contains("generated ") && message.contains("warning") {
            continue;
        }
        let at = block.iter().find_map(|l| l.trim_start().strip_prefix("--> "));
        let mut parts = at.map(|a| a.rsplitn(3, ':').collect::<Vec<_>>()).unwrap_or_default();
        parts.reverse();
        let (file, line, column) = match parts.as_slice() {
            [file, line, column] => (Some(file.to_string()), line.parse().ok(), column.parse().ok()),
            _ => (None, None, None),
        };
        let own = file.as_deref().is_some_and(|f| f.starts_with("src/") || f.starts_with("plugin/"));
        if level == "warning" && !own {
            continue;
        }
        let rendered = block.join("\n").trim_end().to_string();
        if out.iter().any(|d| d.rendered == rendered) {
            continue;
        }
        out.push(Diagnostic { level: level.into(), file, line, column, message, rendered });
    }
    out.sort_by_key(|d| d.level != "error");
    out.truncate(30);
    out
}

/// The link in a plugin's folder to the PaperPaw checkout its SDK is taken
/// from, as `paperpaw-dev new --code --sdk` makes it; no part of its source.
pub const SDK_LINK: &str = ".paperpaw";

/// Makes `link` a link to the folder `to`.
fn link_folder(to: &Path, link: &Path) -> std::io::Result<()> {
    #[cfg(unix)]
    return std::os::unix::fs::symlink(to, link);
    #[cfg(windows)]
    return std::os::windows::fs::symlink_dir(to, link);
}

/// What the plugin's crate is laid out with, as `paperpaw-dev new --code`
/// lays it out: the crate's own `Cargo.toml` (targets, profiles, the SDK),
/// how it is linked and the compiler. Made by the release's own tool, so
/// that it never goes stale.
const SCAFFOLD: &[&str] = &["Cargo.toml", ".cargo/config.toml", "rust-toolchain.toml", "paperpaw-plugin7.x", "native/metadata.json"];

/// Writes the plugin's crate into `dir` (and `dev`'s scaffold apart, in
/// `dir/.scaffold`), what was there before of the plugin's sources
/// replaced, its `target/` and lock file kept. The compiler is
/// `compiler`'s, whatever the scaffold names.
pub fn lay_out(dev: &Path, dir: &Path, files: &[(String, Vec<u8>)], krate: &Crate, sdk: Option<&Path>, compiler: &str) -> Result<(), String> {
    let scaffold = dir.join(".scaffold");
    let _ = std::fs::remove_dir_all(&scaffold);
    let mut command = std::process::Command::new(dev);
    command.args(["new", "--github", &krate.name, "--code", "--dir"]).arg(&scaffold);
    if let Some(sdk) = sdk {
        command.arg("--sdk").arg(sdk);
    }
    crate::toolchain::quiet(&mut command);
    let ran = command.output().map_err(|e| format!("{}: {e}", dev.display()))?;
    if !ran.status.success() {
        return Err(format!("paperpaw-dev new: {}", crate::toolchain::last_line(&ran.stderr)));
    }
    for gone in ["src", "plugin", "native"] {
        let _ = std::fs::remove_dir_all(dir.join(gone));
    }
    let write = |path: PathBuf, bytes: &[u8]| -> Result<(), String> {
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
        std::fs::write(&path, bytes).map_err(|e| format!("{}: {e}", path.display()))
    };
    for name in SCAFFOLD {
        let mut bytes = std::fs::read(scaffold.join(name)).map_err(|e| format!("paperpaw-dev new made no {name}: {e}"))?;
        if *name == "rust-toolchain.toml" {
            // The compiler the emulator names, which the workshop set up.
            bytes = format!("[toolchain]\nchannel = \"{compiler}\"\nprofile = \"minimal\"\n").into_bytes();
        }
        write(dir.join(name), &bytes)?;
    }
    // A checkout's SDK (the one beside the app, `PAPERPAW_SDK`) is reached
    // through a link in the plugin's folder, `.paperpaw`, and named by it:
    // so the build is the same file on any computer, and the store can
    // rebuild it. `paperpaw-dev new` made the link in its scaffold; the
    // plugin's folder gets the same one.
    let link = dir.join(SDK_LINK);
    let wanted = std::fs::read_link(scaffold.join(SDK_LINK)).ok();
    if std::fs::read_link(&link).ok() != wanted {
        // A link to a folder is a file on Linux and macOS, a folder on Windows.
        let _ = std::fs::remove_file(&link).or_else(|_| std::fs::remove_dir(&link));
        if let Some(checkout) = &wanted {
            link_folder(checkout, &link).map_err(|e| format!("{}: {e}", link.display()))?;
        }
    }
    let _ = std::fs::remove_dir_all(&scaffold);
    for (path, bytes) in files.iter().filter(|(p, _)| p.starts_with("src/") || p.starts_with("plugin/") || p == "native/metadata.json") {
        // The folder as a reader installs it never holds a build.
        if path.starts_with("plugin/") && path.ends_with("code.ppn") {
            continue;
        }
        write(dir.join(path), bytes)?;
    }
    Ok(())
}

/// The library a build made, as the emulator names it.
pub fn host_file() -> String {
    "code-host.so".to_string()
}

/// Whether the emulator runs a plugin's code on this computer: PaperPaw's
/// emulator loads it on Linux (x86-64) only, so far.
pub fn emulator_runs_code() -> bool {
    cfg!(all(target_os = "linux", target_arch = "x86_64"))
}

/// Builds the plugin of `files` in `dir` with `rust` and `dev`
/// (`paperpaw-dev`) for the emulator; where the library is, if it was
/// built.
pub fn build(dir: &Path, files: &[(String, Vec<u8>)], rust: &crate::toolchain::Rust, dev: &Path, paperpaw: &str) -> (Built, Option<PathBuf>) {
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
    if !emulator_runs_code() {
        built.problems.push("In this PaperPaw release the emulator runs a plugin's code on Linux (x86-64) only, so the reader beside the conversation cannot show a plugin with code on this computer. Say so to the person; the plugin can still be built for a reader (Send to reader).".into());
    }
    // A version in work (`-dev`) has no SDK on crates.io; a beta or a
    // release candidate (`-beta.1`, `-rc.1`) has, like a release.
    if paperpaw.contains("-dev") && local_sdk(paperpaw).is_none() {
        built.problems.push(format!(
            "PaperPaw {paperpaw} is a version in work: its SDK is not published, so plugins with code cannot be built for it. Say so to the person: plugins with code are built for released PaperPaw versions, betas included."
        ));
    }
    if !built.problems.is_empty() {
        return (built, None);
    }
    let manifest = files.iter().find(|(p, _)| p == "Cargo.toml").map(|(_, b)| String::from_utf8_lossy(b).into_owned()).unwrap_or_default();
    let Some(krate) = cargo(&manifest).0 else { return (built, None) };
    if let Err(e) = lay_out(dev, dir, files, &krate, sdk(paperpaw).as_deref(), &rust.version) {
        built.problems.push(e);
        return (built, None);
    }
    let mut command = rust.tool(dev);
    command.args(["build", "--device", "emulator"]).current_dir(dir);
    let ran = match command.output() {
        Ok(ran) => ran,
        Err(e) => {
            built.log_tail = format!("paperpaw-dev: {e}");
            return (built, None);
        }
    };
    built.seconds = Some(started.elapsed().as_secs());
    let text = format!("{}\n{}", String::from_utf8_lossy(&ran.stdout), String::from_utf8_lossy(&ran.stderr));
    built.diagnostics = diagnostics(&text);
    built.log_tail = strip_ansi(&text).lines().filter(|l| !l.trim().is_empty()).rev().take(30).collect::<Vec<_>>().into_iter().rev().collect::<Vec<_>>().join("\n");
    let library = dir.join("dist").join("emulator").join("plugins").join(&krate.name).join(host_file());
    if !ran.status.success() || !library.exists() {
        // What `paperpaw-dev` refuses in its own words (the list of what the
        // code calls, a compiler that is missing) is no compiler message.
        if built.diagnostics.is_empty() {
            built.problems.push(built.log_tail.clone());
        }
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
        let dev = crate::checks::dev_beside(&crate::paths::emulator_program()?);
        let (built, library) = build(&dir, &files, &rust, &dev, &ready.paperpaw);
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

    const MANIFEST: &str = "[package]\nname = \"my-clock\"\nversion = \"0.2.0\"\n\n[dependencies]\npaperpaw-sdk = \"0.6\"\n";

    fn project() -> Vec<(String, Vec<u8>)> {
        vec![
            ("Cargo.toml".into(), MANIFEST.as_bytes().to_vec()),
            ("src/main.rs".into(), b"// the plugin".to_vec()),
            ("plugin/plugin.ini".into(), b"[plugin]\nid = my-clock\n".to_vec()),
        ]
    }

    #[test]
    fn a_project_is_read_and_checked_before_it_is_built() {
        assert!(problems(&project()).is_empty(), "{:?}", problems(&project()));
        let krate = cargo(MANIFEST).0.unwrap();
        assert_eq!((krate.name.as_str(), krate.version.as_str()), ("my-clock", "0.2.0"));
        let mut bad = project();
        bad.push(("build.rs".into(), Vec::new()));
        bad.push((".cargo/config.toml".into(), Vec::new()));
        bad.push(("src/lib.rs".into(), Vec::new()));
        bad[0].1 = MANIFEST.replace("[dependencies]", "[dependencies]\nserde = \"1\"").into_bytes();
        let said = problems(&bad).join("\n");
        assert!(said.contains("build.rs:"), "{said}");
        assert!(said.contains(".cargo/config.toml: not a path"), "{said}");
        assert!(said.contains("the crate serde is not available"), "{said}");
        assert!(said.contains("src/lib.rs: a plugin is a program"), "{said}");
        // The plugin's id is the crate's name.
        let mut other = project();
        other[2].1 = b"[plugin]\nid = other\n".to_vec();
        assert!(problems(&other).join("\n").contains("id = other is not the crate's name my-clock"));
        // The old layout: nothing of it is taken.
        let old = [("i18n/en.ini", ""), ("how/en.txt", "")].map(|(p, b)| (p.to_string(), b.as_bytes().to_vec()));
        let said = problems(&[project(), old.to_vec()].concat()).join("\n");
        assert!(said.contains("i18n/en.ini: a project holds") && said.contains("how/en.txt: a project holds"), "{said}");
        let old = MANIFEST.replace("[dependencies]", "[package.metadata.paperpaw]\nplugin = \"MyClock\"\n\n[dependencies]");
        assert!(cargo(&old).1.join("\n").contains("[package.metadata.paperpaw] is not taken here"));
    }

    #[test]
    fn the_compiler_s_messages_about_the_plugin_are_kept() {
        let output = "   Compiling hello v0.1.0 (/home/me/hello)\n\
warning: unused variable: `x`\n --> src/main.rs:3:5\n  |\n3 |     let x = 1;\n  |         ^ help: remove it\n\n\
warning: unused import: `foo`\n --> /home/me/paperpaw/crates/paperpaw-sdk/src/lib.rs:1:5\n\n\
error[E0308]: mismatched types\n --> src/main.rs:8:9\n  |\n8 |     1u8\n  |     ^^^ expected `u32`\n\n\
warning: `hello` (bin \"hello\") generated 1 warning\n\
error: could not compile `hello` (bin \"hello\") due to 1 previous error\n";
        let found = diagnostics(output);
        assert_eq!(found.iter().map(|d| d.message.as_str()).collect::<Vec<_>>(), ["mismatched types", "unused variable: `x`"]);
        assert_eq!((found[0].file.as_deref(), found[0].line, found[0].column), (Some("src/main.rs"), Some(8), Some(9)));
        assert!(found[0].rendered.contains("expected `u32`"), "{}", found[0].rendered);
        assert_eq!(strip_ansi("\u{1b}[1mbold\u{1b}[0m"), "bold");
    }

    /// The files of the handbook's recipe `name` (handbook/recipes/), as
    /// a project holds them.
    fn recipe(name: &str) -> Vec<(String, Vec<u8>)> {
        let dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("../handbook/recipes").join(name);
        let mut files = Vec::new();
        crate::emulator::collect_files(&dir, &mut files);
        files
            .into_iter()
            .map(|path| {
                let relative = path.strip_prefix(&dir).unwrap().to_string_lossy().replace('\\', "/");
                (relative, std::fs::read(&path).unwrap())
            })
            .collect()
    }

    /// The program of `PAPERPAW_EMU`, else the test is skipped.
    fn emu() -> Option<PathBuf> {
        let program = std::env::var_os("PAPERPAW_EMU").map(PathBuf::from);
        if program.is_none() {
            eprintln!("skipped: PAPERPAW_EMU names no PaperPaw");
        }
        program
    }

    /// The recipes the AI's handbook gives in full build as the workshop
    /// builds a project, without a warning, and each runs in PaperPaw's
    /// emulator (the screen it opens, or the widget alone on the home
    /// screen, shows what the recipe says): with `PAPERPAW_EMU` and
    /// `PAPERPAW_SDK` (the checkout it was built from).
    #[test]
    fn the_handbook_s_recipes_build_without_a_warning_and_run() {
        let Some(program) = emu() else { return };
        let (events, seen) = std::sync::mpsc::channel();
        let emulator = crate::emulator::Emulator::new({ let program = program.clone(); move || Ok(program.clone()) }, move |e| {
            let _ = events.send(e);
        });
        let library = tempfile::tempdir().unwrap();
        emulator.start("xteink-x4", library.path()).unwrap();
        let ready = emulator.ready().unwrap();
        let (version, _) = crate::toolchain::wanted(&ready.toolchain).unwrap();
        let rust = crate::toolchain::ready(&crate::paths::app_data().unwrap().join("rust"), &version, &|t| eprintln!("{t}")).unwrap();
        let dev = crate::checks::dev_beside(&program);
        let recipes = Path::new(env!("CARGO_MANIFEST_DIR")).join("../handbook/recipes");
        for entry in std::fs::read_dir(recipes).unwrap().flatten() {
            let name = entry.file_name().to_string_lossy().into_owned();
            let files = recipe(&name);
            assert!(problems(&files).is_empty(), "{name}: {:?}", problems(&files));
            let dir = tempfile::tempdir().unwrap();
            let (built, made) = build(dir.path(), &files, &rust, &dev, &ready.paperpaw);
            assert_eq!(built.state, "done", "{name}: {:#?}\n{}\n{:?}", built.diagnostics, built.log_tail, built.problems);
            assert!(built.diagnostics.is_empty(), "{name}: {:#?}", built.diagnostics);
            let made = made.unwrap_or_else(|| panic!("{name}: no library"));
            // It runs: the screen the recipe opens, or its widget alone on the
            // home screen, shows its text.
            let (screen, widget, text) = match name.as_str() {
                "hello" => (Some("hello.screen"), None, "Hello someone, from Hello"),
                "motto" => (None, Some("motto.note"), "Be kind to the page."),
                other => panic!("the recipe {other} has no check of what it shows"),
            };
            let mut on_reader: Vec<(String, Vec<u8>)> = files.iter().filter_map(|(p, b)| p.strip_prefix("plugin/").map(|p| (p.to_string(), b.clone()))).collect();
            on_reader.push((host_file(), std::fs::read(made).unwrap()));
            crate::emulator::place_plugin(library.path(), &name, &on_reader).unwrap();
            emulator.show_plugin(Some(&name)).unwrap();
            if let Some(widget) = widget {
                emulator.show_widget(widget).unwrap();
            }
            emulator.reload().unwrap();
            if let Some(screen) = screen {
                let _ = emulator.open(screen, &serde_json::json!({}));
            }
            std::thread::sleep(std::time::Duration::from_secs(2));
            let described = emulator.describe().unwrap().to_string();
            assert!(described.contains(text), "{name}: {described}");
        }
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
