//! Plugins with code built for the readers themselves, to publish: the
//! project as a crate of its own (the plugin's library and the binary
//! with PaperPaw's `plugin!` line, in one package), built as PaperPaw's
//! sample builds it and paperpaw.org rebuilds it, packed with the
//! release's `paperpaw-sign` and signed with the author's key; and the
//! very source built, as a ZIP for the store's form.
//!
//! The store rebuilds each build from that source on Linux and compares
//! it byte for byte. So paths are written as everywhere: the source's top
//! as `/plugin`, Cargo's home as `/cargo`, and each folder on its own, so
//! that Windows' `\` never gets into the file (`remaps`).
//!
//! The X4 (ESP32-C3) builds with the compiler the emulator names, for
//! `riscv32imc-unknown-none-elf`. The X4 Pro (ESP32-S3) needs espup's
//! Xtensa compiler and `core` and `alloc` built ahead for it, which a
//! PaperPaw release is to bring: until then it is not offered.

use std::io::Write;
use std::path::{Path, PathBuf};

use serde::Serialize;

use crate::code::Crate;

/// The X4's target.
pub const X4_TARGET: &str = "riscv32imc-unknown-none-elf";
/// About what the X4's part of Rust takes on disk, for the person to know
/// before it is fetched.
pub const X4_TARGET_MB: u32 = 62;

/// How a plugin is linked for the readers, as PaperPaw's sample has it
/// (`samples/hello-native/.cargo/config.toml`), and its aliases, which the
/// store's rebuild runs (`cargo x4`, `cargo +esp x4pro`).
pub const CARGO_CONFIG: &str = r#"# How a native plugin is built (PaperPaw's docs/plugins.md): linked with
# `paperpaw-plugin.x` (the copy beside this folder, as the PaperPaw
# release has it), its relocations kept for the packer. Keep both as they
# are: paperpaw.org rebuilds the plugin with them.
#
# - The X4 (ESP32-C3, RISC-V): `cargo x4`, with the toolchain the
#   PaperPaw release names.
# - The X4 Pro (ESP32-S3, Xtensa): `cargo +esp x4pro`, with espup's `esp`
#   toolchain and the core libraries of the PaperPaw release
#   (`paperpaw-xtensa-std-<version>.tar.gz`, installed with PaperPaw's
#   tools/xtensa-std/install.sh), so that the plugin's code is the same
#   on every computer.
[alias]
x4 = "build --release --target riscv32imc-unknown-none-elf"
x4pro = "build --release --target xtensa-esp32s3-none-elf"

[target.riscv32imc-unknown-none-elf]
rustflags = [
    "-C", "link-arg=-Tpaperpaw-plugin.x",
    "-C", "link-arg=--emit-relocs",
    "-C", "code-model=medium",
    "-C", "relocation-model=static",
    "-C", "force-frame-pointers",
    "--cfg", "paperpaw_plugin",
]

[target.xtensa-esp32s3-none-elf]
rustflags = [
    "-C", "link-arg=-nostartfiles",
    "-C", "link-arg=-nostdlib",
    "-C", "link-arg=-Wl,-Tpaperpaw-plugin.x",
    "-C", "link-arg=-Wl,--emit-relocs",
    "--cfg", "paperpaw_plugin",
]
"#;

/// The linker script a plugin is linked with, beside `.cargo/config.toml`.
pub const LINKER_SCRIPT: &str = "paperpaw-plugin.x";

/// The linker script of the SDK `sdk` names (a Cargo.toml line, see
/// `code::sdk`): PaperPaw's `paperpaw-native` brings it, and since its
/// plugin interface 2 no build script puts it where the linker looks, so
/// the crate keeps a copy, as PaperPaw's sample does. From the checkout
/// `repository` of an SDK on this computer, else from Cargo's registry in
/// `cargo_home` once the SDK is fetched.
pub fn linker_script(sdk: &str, repository: Option<&Path>, cargo_home: &Path) -> Option<Vec<u8>> {
    if let Some(repository) = repository {
        return std::fs::read(repository.join("crates").join("paperpaw-native").join(LINKER_SCRIPT)).ok();
    }
    let version = sdk.split_once("version = \"=")?.1.split('"').next()?;
    let crate_dir = format!("paperpaw-native-{version}");
    std::fs::read_dir(cargo_home.join("registry").join("src"))
        .ok()?
        .flatten()
        .find_map(|index| std::fs::read(index.path().join(&crate_dir).join(LINKER_SCRIPT)).ok())
}

/// Where the binary's source lies in the crate: apart from `src/`, so that
/// no file of the project's can be it.
const BIN_PATH: &str = "device/main.rs";

/// The crate built for the readers, from the project's `files`: its path
/// and contents each, the lock file left to Cargo.
pub fn publish_crate(files: &[(String, Vec<u8>)], krate: &Crate, sdk: &str, compiler: &str) -> Vec<(String, Vec<u8>)> {
    let lib = krate.name.replace('-', "_");
    let manifest = format!(
        "[package]\nname = \"{name}\"\nversion = \"{version}\"\nedition = \"2024\"\npublish = false\n\n\
         # A workspace of its own: the file it makes must fit firmware built elsewhere.\n[workspace]\n\n\
         # The plugin, tested and tried in the emulator as a library.\n[lib]\npath = \"src/lib.rs\"\n\n\
         # The file for the readers: the plugin behind PaperPaw's `plugin!` line.\n\
         [[bin]]\nname = \"{name}\"\npath = \"{BIN_PATH}\"\ntest = false\nbench = false\n\n\
         [dependencies]\npaperpaw-sdk = {sdk}\n\n\
         # As the firmware is built: small code, one unit, no unwinding.\n\
         [profile.release]\nopt-level = \"s\"\nlto = \"fat\"\ncodegen-units = 1\npanic = \"abort\"\n\
         # Lines in the ELF, for naming the functions of a crash's calls.\ndebug = \"line-tables-only\"\n",
        name = krate.name,
        version = krate.version,
    );
    let main = format!(
        "//! {name} for the readers: the plugin behind PaperPaw's `plugin!` line.\n#![no_std]\n#![no_main]\n\npaperpaw_sdk::plugin!({lib}::{plugin});\n",
        name = krate.name,
        plugin = krate.plugin,
    );
    let toolchain = format!(
        "# The compiler of the PaperPaw release the plugin is built for: a plugin\n\
         # file runs only on firmware built by the same one.\n\
         [toolchain]\nchannel = \"{compiler}\"\ntargets = [\"{X4_TARGET}\"]\nprofile = \"minimal\"\n"
    );
    let mut out: Vec<(String, Vec<u8>)> = vec![
        ("Cargo.toml".into(), manifest.into_bytes()),
        (BIN_PATH.into(), main.into_bytes()),
        (".cargo/config.toml".into(), CARGO_CONFIG.as_bytes().to_vec()),
        ("rust-toolchain.toml".into(), toolchain.into_bytes()),
    ];
    for (path, bytes) in files {
        let source = ["src/", "i18n/", "how/", "plugin/"].iter().any(|p| path.starts_with(p));
        if source && !path.ends_with("code.ppn") {
            out.push((path.clone(), bytes.clone()));
        }
    }
    out.sort_by(|a, b| a.0.cmp(&b.0));
    out
}

/// `path` with `/` between its parts, as `--remap-path-prefix` matches it.
fn forward(path: &Path) -> String {
    path.to_string_lossy().replace('\\', "/")
}

/// Every folder under `root` that holds Rust files, and the folders on the
/// way to them, as paths relative to it.
fn rust_folders(root: &Path) -> Vec<String> {
    let mut found = std::collections::BTreeSet::new();
    let mut stack = vec![root.to_path_buf()];
    while let Some(dir) = stack.pop() {
        let Ok(entries) = std::fs::read_dir(&dir) else { continue };
        let mut has_rust = false;
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                let name = entry.file_name();
                if name != "target" && name != ".git" {
                    stack.push(path);
                }
            } else if path.extension().is_some_and(|x| x == "rs") {
                has_rust = true;
            }
        }
        if let (true, Ok(rel)) = (has_rust, dir.strip_prefix(root)) {
            let rel = forward(rel);
            let parts: Vec<&str> = rel.split('/').filter(|p| !p.is_empty()).collect();
            for i in 1..=parts.len() {
                found.insert(parts[..i].join("/"));
            }
        }
    }
    let mut found: Vec<String> = found.into_iter().collect();
    found.sort_by_key(|f| (f.matches('/').count(), f.clone()));
    found
}

/// The compiler's `--remap-path-prefix` arguments, as the store's rebuild
/// writes paths: `top` as `/plugin`, `cargo_home` as `/cargo`, and each
/// folder with Rust files under them on its own (`<dir>=/plugin/<dir>/`),
/// so that every part of a path keeps `/` (a prefix's rest would keep
/// Windows' `\`). Deeper folders last: the compiler takes the last match.
pub fn remaps(top: &Path, cargo_home: &Path, local_sdk: Option<&Path>) -> Vec<String> {
    let mut out = vec![
        format!("--remap-path-prefix={}=/plugin", forward(top)),
        format!("--remap-path-prefix={}=/cargo", forward(cargo_home)),
    ];
    // An SDK on this computer (the installer's, or a checkout's while the
    // workshop is worked on): its repository as `/paperpaw`, so no path of this computer's is in
    // the file. A published SDK lies under Cargo's home.
    if let Some(repo) = local_sdk {
        out.push(format!("--remap-path-prefix={}=/paperpaw", forward(repo)));
        for dir in rust_folders(repo) {
            out.push(format!("--remap-path-prefix={}/{dir}=/paperpaw/{dir}/", forward(repo)));
        }
    }
    for dir in rust_folders(top) {
        out.push(format!("--remap-path-prefix={}/{dir}=/plugin/{dir}/", forward(top)));
    }
    let registry = cargo_home.join("registry").join("src");
    for dir in rust_folders(&registry) {
        out.push(format!("--remap-path-prefix={}/{dir}=/cargo/registry/src/{dir}/", forward(&registry)));
    }
    out
}

/// The source as a ZIP for the store's form (`source-zip`): the crate's
/// files in name order with fixed times, inside one folder named as the
/// crate, `target/` left out.
pub fn source_zip(dir: &Path, name: &str) -> Result<Vec<u8>, String> {
    let mut files = Vec::new();
    let mut stack = vec![dir.to_path_buf()];
    while let Some(here) = stack.pop() {
        for entry in std::fs::read_dir(&here).map_err(|e| e.to_string())?.flatten() {
            let path = entry.path();
            if path.is_dir() {
                if entry.file_name() != "target" {
                    stack.push(path);
                }
            } else {
                let rel = forward(path.strip_prefix(dir).map_err(|e| e.to_string())?);
                files.push((rel, path));
            }
        }
    }
    files.sort();
    let mut zip = zip::ZipWriter::new(std::io::Cursor::new(Vec::new()));
    let options = zip::write::SimpleFileOptions::default()
        .compression_method(zip::CompressionMethod::Deflated)
        .last_modified_time(zip::DateTime::default())
        .unix_permissions(0o644);
    for (rel, path) in files {
        let bytes = std::fs::read(&path).map_err(|e| format!("{rel}: {e}"))?;
        zip.start_file(format!("{name}/{rel}"), options).map_err(|e| e.to_string())?;
        zip.write_all(&bytes).map_err(|e| e.to_string())?;
    }
    Ok(zip.finish().map_err(|e| e.to_string())?.into_inner())
}

/// What a build for a reader made.
#[derive(Debug, Clone, Serialize, Default)]
pub struct DeviceBuilt {
    /// `done` or `failed`.
    pub state: String,
    pub problems: Vec<String>,
    pub diagnostics: Vec<crate::code::Diagnostic>,
    pub log_tail: String,
    /// The signed plugin file, the source ZIP, kept in the project's
    /// `.workshop/publish/parts/` for its store file.
    pub ppn: Option<String>,
    pub source: Option<String>,
    /// As `paperpaw-sign plugin` reads the file.
    pub fingerprint: Option<String>,
    pub size: u64,
}

/// `paperpaw-sign`, beside the emulator, as the release puts it.
pub fn sign_program(emulator: &Path) -> PathBuf {
    if let Some(program) = std::env::var_os("PAPERPAW_SIGN") {
        return PathBuf::from(program);
    }
    emulator.with_file_name(format!("paperpaw-sign{}", std::env::consts::EXE_SUFFIX))
}

/// The fingerprint `paperpaw-sign plugin` reads in `file`.
fn fingerprint(sign: &Path, file: &Path) -> Option<String> {
    let mut command = std::process::Command::new(sign);
    command.arg("plugin").arg(file);
    crate::toolchain::quiet(&mut command);
    let out = command.output().ok()?;
    String::from_utf8_lossy(&out.stdout)
        .lines()
        .find_map(|l| l.strip_prefix("fingerprint:").map(|f| f.trim().to_string()))
}

/// Writes the crate of `files` into `dir`, builds it for the X4 with
/// `rust` as the store rebuilds it, packs it with `sign` and signs it with
/// `seed`; the plugin file and the source ZIP go to `out`.
#[allow(clippy::too_many_arguments)]
pub fn build_x4(
    dir: &Path,
    files: &[(String, Vec<u8>)],
    rust: &crate::toolchain::Rust,
    sdk: &str,
    sign: &Path,
    seed: &[u8; 32],
    out: &Path,
    plugin_id: &str,
    plugin_version: &str,
) -> DeviceBuilt {
    let mut built = DeviceBuilt { state: "failed".into(), ..DeviceBuilt::default() };
    let manifest = files.iter().find(|(p, _)| p == "Cargo.toml").map(|(_, b)| String::from_utf8_lossy(b).into_owned()).unwrap_or_default();
    let Some(krate) = crate::code::cargo(&manifest).0 else {
        built.problems = crate::code::problems(files);
        return built;
    };
    if !sign.exists() {
        built.problems.push(format!("PaperPaw's paperpaw-sign is not here ({}): it packs the file for the readers.", sign.display()));
        return built;
    }
    // The crate anew, the lock file and the build's target kept; the lock
    // file only while the manifest it was made for is the same.
    for gone in ["src", "i18n", "how", "plugin", "device"] {
        let _ = std::fs::remove_dir_all(dir.join(gone));
    }
    let crate_files = publish_crate(files, &krate, sdk, &rust.version);
    let manifest_now = crate_files.iter().find(|(p, _)| p == "Cargo.toml").map(|(_, b)| b.as_slice());
    if std::fs::read(dir.join("Cargo.toml")).ok().as_deref() != manifest_now {
        let _ = std::fs::remove_file(dir.join("Cargo.lock"));
    }
    for (path, bytes) in crate_files {
        let to = dir.join(&path);
        if let Some(parent) = to.parent() {
            let _ = std::fs::create_dir_all(parent);
        }
        if let Err(e) = std::fs::write(&to, bytes) {
            built.problems.push(format!("{path}: {e}"));
            return built;
        }
    }
    let cargo_home = rust.homes.as_ref().map(|(_, c)| c.clone()).unwrap_or_else(|| PathBuf::from(std::env::var("CARGO_HOME").unwrap_or_default()));
    // The lock file first, so that the registry's folders are there to remap.
    let mut lock = rust.cargo();
    lock.args(["generate-lockfile"]).current_dir(dir).env_remove("RUSTC_WRAPPER");
    if !dir.join("Cargo.lock").exists() {
        match lock.output() {
            Ok(ran) if ran.status.success() => {}
            Ok(ran) => {
                built.log_tail = crate::toolchain::last_line(&ran.stderr);
                return built;
            }
            Err(e) => {
                built.log_tail = format!("cargo: {e}");
                return built;
            }
        }
    }
    let mut fetch = rust.cargo();
    fetch.args(["fetch", "--target", X4_TARGET]).current_dir(dir).env_remove("RUSTC_WRAPPER");
    let _ = fetch.output();
    let args = dir.join("target").join("remap.args");
    let _ = std::fs::create_dir_all(args.parent().unwrap_or(dir));
    // The checkout around an SDK on this computer
    // (`<repository>/crates/paperpaw-sdk`, see `code::local_sdk`).
    let local_sdk = crate::code::sdk_path(sdk).and_then(|sdk| Some(sdk.parent()?.parent()?.to_path_buf()));
    // The linker script beside .cargo/config.toml, in the source too, so
    // that the store's rebuild links with the very same.
    let Some(script) = linker_script(sdk, local_sdk.as_deref(), &cargo_home) else {
        built.problems.push(format!("{LINKER_SCRIPT} of PaperPaw's SDK is not here: it links the plugin."));
        return built;
    };
    if let Err(e) = std::fs::write(dir.join(LINKER_SCRIPT), script) {
        built.problems.push(format!("{LINKER_SCRIPT}: {e}"));
        return built;
    }
    let lines = remaps(dir, &cargo_home, local_sdk.as_deref());
    if let Err(e) = std::fs::write(&args, lines.join("\n") + "\n") {
        built.problems.push(e.to_string());
        return built;
    }
    let mut command = rust.cargo();
    command
        .args(["x4", "--locked", "--message-format=json-diagnostic-rendered-ansi"])
        .args(["--config", "term.color='never'"])
        .args(["--config", &format!("target.{X4_TARGET}.rustflags = ['@{}']", forward(&args))])
        // A wrapper (sccache), from the environment or Cargo's settings,
        // takes no argument file, and caches nothing here.
        .args(["--config", "build.rustc-wrapper=''"])
        .current_dir(dir)
        .env_remove("RUSTC_WRAPPER")
        .env_remove("RUSTFLAGS");
    let ran = match command.output() {
        Ok(ran) => ran,
        Err(e) => {
            built.log_tail = format!("cargo: {e}");
            return built;
        }
    };
    let stdout = String::from_utf8_lossy(&ran.stdout);
    built.diagnostics = crate::code::diagnostics(&stdout, &dir.to_string_lossy());
    let stderr = String::from_utf8_lossy(&ran.stderr);
    built.log_tail = stderr.lines().rev().take(20).collect::<Vec<_>>().into_iter().rev().collect::<Vec<_>>().join("\n");
    let elf = dir.join("target").join(X4_TARGET).join("release").join(&krate.name);
    if !ran.status.success() || !elf.exists() {
        return built;
    }
    // Packed unsigned, then signed here with the author's key.
    let _ = std::fs::create_dir_all(out);
    let unsigned = dir.join("target").join("plugin-unsigned.ppn");
    let mut pack = std::process::Command::new(sign);
    pack.arg("pack").arg(&elf).arg(&unsigned);
    crate::toolchain::quiet(&mut pack);
    match pack.output() {
        Ok(ran) if ran.status.success() => {}
        Ok(ran) => {
            built.problems.push(format!("paperpaw-sign: {}", crate::toolchain::last_line(&ran.stderr)));
            return built;
        }
        Err(e) => {
            built.problems.push(format!("paperpaw-sign: {e}"));
            return built;
        }
    }
    let Ok(mut file) = std::fs::read(&unsigned) else {
        built.problems.push("paperpaw-sign wrote no file".into());
        return built;
    };
    let trailer = crate::author::sign(&file, seed);
    file.extend_from_slice(&trailer);
    let ppn = out.join(format!("{plugin_id}-{plugin_version}-x4.ppn"));
    if let Err(e) = std::fs::write(&ppn, &file) {
        built.problems.push(e.to_string());
        return built;
    }
    let source = out.join(format!("{plugin_id}-{plugin_version}-source.zip"));
    match source_zip(dir, &krate.name).and_then(|z| std::fs::write(&source, z).map_err(|e| e.to_string())) {
        Ok(()) => {}
        Err(e) => {
            built.problems.push(format!("the source ZIP: {e}"));
            return built;
        }
    }
    built.fingerprint = fingerprint(sign, &ppn);
    built.size = file.len() as u64;
    built.ppn = Some(ppn.display().to_string());
    built.source = Some(source.display().to_string());
    built.state = "done".into();
    built
}

#[cfg(test)]
mod tests {
    use super::*;

    const MANIFEST: &str = "[package]\nname = \"my-clock\"\nversion = \"0.2.0\"\n\n[package.metadata.paperpaw]\nplugin = \"MyClock\"\n\n[dependencies]\npaperpaw-sdk = \"0.5\"\n";

    #[test]
    fn the_linker_script_comes_from_the_sdk_a_checkout_or_the_registry() {
        let at = tempfile::tempdir().unwrap();
        // A checkout's: crates/paperpaw-native beside the SDK.
        let repository = at.path().join("paperpaw");
        std::fs::create_dir_all(repository.join("crates/paperpaw-native")).unwrap();
        std::fs::write(repository.join("crates/paperpaw-native").join(LINKER_SCRIPT), b"checkout").unwrap();
        let local = "{ path = \"x/crates/paperpaw-sdk\", features = [\"outline\"] }";
        assert_eq!(linker_script(local, Some(&repository), at.path()).as_deref(), Some(&b"checkout"[..]));
        // A release's: the registry's paperpaw-native of the SDK's very version.
        let home = at.path().join("cargo");
        let index = home.join("registry/src/index.crates.io-1949cf8c6b5b557f");
        for (version, text) in [("0.5.0", "release"), ("0.5.1", "next")] {
            std::fs::create_dir_all(index.join(format!("paperpaw-native-{version}"))).unwrap();
            std::fs::write(index.join(format!("paperpaw-native-{version}")).join(LINKER_SCRIPT), text).unwrap();
        }
        let released = "{ version = \"=0.5.0\", features = [\"outline\"] }";
        assert_eq!(linker_script(released, None, &home).as_deref(), Some(&b"release"[..]));
        assert_eq!(linker_script("{ version = \"=0.6.0\" }", None, &home), None);
        assert!(CARGO_CONFIG.contains("-Tpaperpaw-plugin.x"));
        // The X4 Pro links with the release's core libraries, as PaperPaw's sample.
        assert!(!CARGO_CONFIG.contains("build-std"));
    }

    #[test]
    fn the_crate_for_the_readers_is_one_package_as_the_store_rebuilds_it() {
        let files = vec![
            ("Cargo.toml".to_string(), MANIFEST.as_bytes().to_vec()),
            ("src/lib.rs".into(), b"#![no_std]".to_vec()),
            ("i18n/en.ini".into(), b"[messages]".to_vec()),
            ("plugin/plugin.ini".into(), b"[plugin]".to_vec()),
            ("plugin/code.ppn".into(), b"old".to_vec()),
        ];
        let krate = crate::code::cargo(MANIFEST).0.unwrap();
        let made = publish_crate(&files, &krate, "\"=0.5.0\"", "1.99.0");
        let paths: Vec<&str> = made.iter().map(|(p, _)| p.as_str()).collect();
        assert_eq!(
            paths,
            [".cargo/config.toml", "Cargo.toml", "device/main.rs", "i18n/en.ini", "plugin/plugin.ini", "rust-toolchain.toml", "src/lib.rs"]
        );
        let text = |p: &str| String::from_utf8(made.iter().find(|(path, _)| path == p).unwrap().1.clone()).unwrap();
        let manifest = text("Cargo.toml");
        // One package: no path to another crate, whose hash would carry `\`.
        assert!(!manifest.contains("path = \"../"));
        assert!(manifest.contains("[[bin]]\nname = \"my-clock\"") && manifest.contains("[workspace]"));
        assert!(manifest.contains("paperpaw-sdk = \"=0.5.0\""));
        assert!(manifest.contains("lto = \"fat\"") && manifest.contains("panic = \"abort\""));
        assert!(text("device/main.rs").contains("paperpaw_sdk::plugin!(my_clock::MyClock);"));
        assert!(text(".cargo/config.toml").contains("x4 = \"build --release --target riscv32imc-unknown-none-elf\""));
        assert!(text("rust-toolchain.toml").contains("channel = \"1.99.0\""));
    }

    #[test]
    fn every_folder_with_rust_keeps_its_slashes() {
        let dir = tempfile::tempdir().unwrap();
        let top = dir.path().join("crate");
        let home = dir.path().join("cargo");
        for f in ["src/lib.rs", "src/ui/text.rs", "device/main.rs", "target/x/y.rs"] {
            let p = top.join(f);
            std::fs::create_dir_all(p.parent().unwrap()).unwrap();
            std::fs::write(p, "").unwrap();
        }
        let sdk = home.join("registry/src/index.crates.io-1949cf8c6b5b557f/paperpaw-sdk-0.5.0/src");
        std::fs::create_dir_all(&sdk).unwrap();
        std::fs::write(sdk.join("lib.rs"), "").unwrap();
        let args = remaps(&top, &home, None);
        let t = forward(&top);
        assert_eq!(args[0], format!("--remap-path-prefix={t}=/plugin"));
        assert!(args.contains(&format!("--remap-path-prefix={t}/src=/plugin/src/")));
        assert!(args.contains(&format!("--remap-path-prefix={t}/src/ui=/plugin/src/ui/")));
        assert!(args.contains(&format!("--remap-path-prefix={t}/device=/plugin/device/")));
        assert!(!args.iter().any(|a| a.contains("/target")), "the build's own folder is no source");
        let r = format!("{}/registry/src", forward(&home));
        assert!(args.contains(&format!(
            "--remap-path-prefix={r}/index.crates.io-1949cf8c6b5b557f/paperpaw-sdk-0.5.0/src=/cargo/registry/src/index.crates.io-1949cf8c6b5b557f/paperpaw-sdk-0.5.0/src/"
        )));
        // Deeper after shallower: the compiler takes the last that matches.
        let at = |s: &str| args.iter().position(|a| a.ends_with(s)).unwrap();
        assert!(at("=/plugin/src/") < at("=/plugin/src/ui/"));
        assert!(args.iter().all(|a| !a.contains('\\')));
    }

    /// PaperPaw's sample plugin built for the X4, packed, signed and its
    /// source zipped, as the store takes them: with `PAPERPAW_SDK` (the
    /// checkout's SDK) and `PAPERPAW_SIGN` (its paperpaw-sign), on this
    /// computer's Rust (`PAPERPAW_RUST=system`) or the app's.
    #[test]
    #[ignore = "builds for the X4: PAPERPAW_SDK, PAPERPAW_SIGN, cargo test -- --ignored"]
    fn the_sample_is_built_for_the_x4_signed_with_its_source() {
        let (Some(sdk), Some(sign)) = (std::env::var_os("PAPERPAW_SDK"), std::env::var_os("PAPERPAW_SIGN")) else {
            panic!("PAPERPAW_SDK and PAPERPAW_SIGN name no PaperPaw");
        };
        let samples = PathBuf::from(&sdk).join("../../samples/hello-plugin");
        let read = |p: &str| std::fs::read(samples.join(p)).unwrap();
        let manifest = "[package]\nname = \"hello\"\nversion = \"1.0.0\"\n\n[package.metadata.paperpaw]\nplugin = \"Hello\"\n\n[dependencies]\npaperpaw-sdk = \"0.5\"\n";
        let lib = String::from_utf8(read("src/lib.rs")).unwrap();
        let files: Vec<(String, Vec<u8>)> = vec![
            ("Cargo.toml".into(), manifest.as_bytes().to_vec()),
            ("src/lib.rs".into(), lib.into_bytes()),
            ("how/en.txt".into(), read("how/en.txt")),
            ("how/de.txt".into(), read("how/de.txt")),
            ("i18n/en.ini".into(), read("i18n/en.ini")),
            ("i18n/de.ini".into(), read("i18n/de.ini")),
            ("plugin/plugin.ini".into(), b"[plugin]\nid = hello\nversion = 1.0.0\n".to_vec()),
        ];
        let rust = crate::toolchain::ready(&crate::paths::app_data().unwrap().join("rust"), "1.99.0", &|t| eprintln!("{t}")).unwrap();
        assert!(rust.has_target(X4_TARGET), "rustup target add {X4_TARGET}");
        let dir = tempfile::tempdir().unwrap();
        let (work, out) = (dir.path().join("crate"), dir.path().join("out"));
        let sdk = format!("{{ path = {:?} }}", sdk.to_string_lossy().replace('\\', "/"));
        let built = build_x4(&work, &files, &rust, &sdk, Path::new(&sign), &[7; 32], &out, "hello", "1.0.0");
        assert_eq!(built.state, "done", "{built:?}");
        let ppn = PathBuf::from(built.ppn.unwrap());
        let check = std::process::Command::new(&sign).arg("check-plugin").arg(&ppn).output().unwrap();
        let said = String::from_utf8_lossy(&check.stdout);
        assert!(said.contains("holds"), "{said}{}", String::from_utf8_lossy(&check.stderr));
        assert!(said.contains(&crate::author::fingerprint(&crate::author::public_key(&[7; 32]))), "{said}");
        assert!(built.fingerprint.is_some());
        let source = std::fs::read(built.source.unwrap()).unwrap();
        let mut archive = zip::ZipArchive::new(std::io::Cursor::new(source)).unwrap();
        let names: Vec<String> = (0..archive.len()).map(|i| archive.by_index(i).unwrap().name().to_string()).collect();
        for name in ["hello/Cargo.lock", "hello/Cargo.toml", "hello/device/main.rs", "hello/.cargo/config.toml", "hello/src/lib.rs"] {
            assert!(names.iter().any(|n| n == name), "{name}: {names:?}");
        }
        let bytes = std::fs::read(&ppn).unwrap();
        let text = String::from_utf8_lossy(&bytes);
        // No path of this computer in it, with `\` or with `/`.
        let here = dir.path().to_string_lossy().to_string();
        assert!(!text.contains(&here) && !text.contains(&here.replace('\\', "/")), "this computer's path in the build");
        let paths: Vec<&str> = text.split(|c: char| c.is_control()).filter(|s| s.contains(".rs")).collect();
        eprintln!("paths in the build: {paths:#?}");
        assert!(!paths.iter().any(|p| p.contains('\\')), "a Windows separator in the build: {paths:#?}");
    }

    #[test]
    fn the_source_zip_is_the_crate_the_same_bytes_each_time() {
        let dir = tempfile::tempdir().unwrap();
        for (f, text) in [("Cargo.toml", "a"), ("Cargo.lock", "b"), ("src/lib.rs", "c"), ("target/release/x", "no")] {
            let p = dir.path().join(f);
            std::fs::create_dir_all(p.parent().unwrap()).unwrap();
            std::fs::write(p, text).unwrap();
        }
        let one = source_zip(dir.path(), "my-clock").unwrap();
        assert_eq!(one, source_zip(dir.path(), "my-clock").unwrap());
        let mut archive = zip::ZipArchive::new(std::io::Cursor::new(one)).unwrap();
        let names: Vec<String> = (0..archive.len()).map(|i| archive.by_index(i).unwrap().name().to_string()).collect();
        assert_eq!(names, ["my-clock/Cargo.lock", "my-clock/Cargo.toml", "my-clock/src/lib.rs"]);
    }
}

/// What building for each reader needs, as the window shows it.
#[derive(Debug, Clone, Serialize)]
pub struct Readiness {
    /// The X4's part of Rust is there.
    pub x4: bool,
    /// About how much it takes, if not.
    pub x4_mb: u32,
    /// The X4 Pro: not yet (its `core` and `alloc` come with a release).
    pub x4_pro: bool,
    /// paperpaw-sign beside the emulator.
    pub sign: bool,
}

/// Rust for the emulator's compiler, set up if needed; the compiler's version.
fn rust_for(ready: &crate::emulator::Ready, told: &dyn Fn(&str)) -> Result<crate::toolchain::Rust, String> {
    let (version, _) = crate::toolchain::wanted(&ready.toolchain)?;
    crate::toolchain::ready(&crate::paths::app_data()?.join("rust"), &version, told)
}

#[tauri::command]
pub async fn device_readiness(emulator: tauri::State<'_, crate::emulator::Emulator>) -> Result<Readiness, String> {
    let ready = emulator.ready().ok_or("PaperPaw's emulator has not started yet.")?;
    tauri::async_runtime::spawn_blocking(move || {
        let rust = rust_for(&ready, &|_| {})?;
        let program = crate::paths::emulator_program()?;
        Ok(Readiness { x4: rust.has_target(X4_TARGET), x4_mb: X4_TARGET_MB, x4_pro: false, sign: sign_program(&program).exists() })
    })
    .await
    .map_err(|e| e.to_string())?
}

/// Fetches the X4's part of Rust (the person agreed, its size shown).
#[tauri::command]
pub async fn device_toolchain_install(emulator: tauri::State<'_, crate::emulator::Emulator>) -> Result<(), String> {
    let ready = emulator.ready().ok_or("PaperPaw's emulator has not started yet.")?;
    tauri::async_runtime::spawn_blocking(move || rust_for(&ready, &|_| {})?.add_target(X4_TARGET))
        .await
        .map_err(|e| e.to_string())?
}

/// Builds the project's plugin with code for the X4, signed with the
/// author's key (which must have been backed up), with its source as a
/// ZIP, into the project's `.workshop/publish/parts/`, where
/// `publish_pack` takes them into the store file.
#[tauri::command]
pub async fn device_build(
    app: tauri::AppHandle,
    emulator: tauri::State<'_, crate::emulator::Emulator>,
    project: String,
    id: String,
    version: String,
) -> Result<DeviceBuilt, String> {
    use tauri::Emitter;
    let ready = emulator.ready().ok_or("PaperPaw's emulator has not started yet.")?;
    let names = |s: &str| !s.is_empty() && s.len() <= 40 && s.bytes().all(|b| b.is_ascii_alphanumeric() || b == b'-' || b == b'.');
    if !names(&id) || !names(&version) {
        return Err("plugin.ini names no id or version to build.".into());
    }
    tauri::async_runtime::spawn_blocking(move || {
        let author = crate::author::Author { secrets: &crate::author::Keychain::AUTHOR, dir: crate::paths::app_data()? };
        let status = author.status()?;
        let seed = match (author.seed()?, status.backed_up) {
            (Some(seed), Some(_)) => seed,
            _ => return Err("Save a backup of your author key first.".to_string()),
        };
        let told = |text: &str| {
            let _ = app.emit("build-progress", text.to_string());
        };
        let rust = rust_for(&ready, &told)?;
        if !rust.has_target(X4_TARGET) {
            return Err("The X4's part of Rust is not set up yet.".into());
        }
        let root = crate::paths::projects()?;
        let files = crate::projects::plugin_files(&root, &project)?;
        let dir = crate::paths::app_data()?.join("builds").join(&project).join("x4");
        std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
        let out = crate::publish::parts(&root, &project)?;
        let sign = sign_program(&crate::paths::emulator_program()?);
        told("Building for the X4…");
        Ok(build_x4(&dir, &files, &rust, &crate::code::device_sdk(&ready.paperpaw), &sign, &seed, &out, &id, &version))
    })
    .await
    .map_err(|e| e.to_string())?
}
