//! Plugins with code built for the readers themselves, to send or to
//! publish: the project laid out as `paperpaw-dev new --code` lays a plugin
//! out (see `code::lay_out`), built and packed by the release's
//! `paperpaw-dev build --device x4|x4-pro` (the compiler, the chip's
//! record of what the code calls, `paperpaw-sign pack`), then signed with
//! the author's key by `paperpaw-sign sign-plugin`; and the very source as
//! a ZIP for the store's form.
//!
//! The X4 (ESP32-C3) builds with the compiler the emulator names, for
//! `riscv32imc-unknown-none-elf`. The X4 Pro (ESP32-S3) needs espup's
//! Xtensa compiler (`paperpaw-dev` says what is missing).
//!
//! The store's own rebuild of a community plugin's code for interface 7 is
//! not there yet (PaperPaw's author path, step 7): such a file is not
//! uploaded to the store as one that is rebuilt and compared.

use std::io::Write;
use std::path::{Path, PathBuf};

use serde::Serialize;

use crate::xtensa::Reader;

/// The X4's target.
pub const X4_TARGET: &str = "riscv32imc-unknown-none-elf";
/// About what the X4's part of Rust takes on disk, for the person to know
/// before it is fetched.
pub const X4_TARGET_MB: u32 = 62;

/// `path` with `/` between its parts.
fn forward(path: &Path) -> String {
    path.to_string_lossy().replace('\\', "/")
}

/// The source as a ZIP for the store's form (`source-zip`): the crate's
/// files in name order with fixed times, inside one folder named as the
/// crate. What is built from it (`target/`, `dist/`) is left out, and so is
/// every link: the one to the PaperPaw checkout the SDK is taken from
/// (`.paperpaw`) is this computer's, and the store has that release's own.
pub fn source_zip(dir: &Path, name: &str) -> Result<Vec<u8>, String> {
    let mut files = Vec::new();
    let mut stack = vec![dir.to_path_buf()];
    while let Some(here) = stack.pop() {
        for entry in std::fs::read_dir(&here).map_err(|e| e.to_string())?.flatten() {
            let path = entry.path();
            if entry.file_type().map_err(|e| e.to_string())?.is_symlink() {
                continue;
            }
            if path.is_dir() {
                let built = here == dir && (entry.file_name() == "target" || entry.file_name() == "dist");
                if !built {
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
    /// The reader it is for (`x4`, `x4-pro`).
    pub reader: String,
    /// Built without the release's core libraries (X4 Pro): it runs on a
    /// reader, but is not what the store's rebuild makes, so it stays out
    /// of a store file.
    pub trial: bool,
}

/// `paperpaw-sign`, beside the emulator, as the release puts it.
pub fn sign_program(emulator: &Path) -> PathBuf {
    if let Some(program) = std::env::var_os("PAPERPAW_SIGN") {
        return PathBuf::from(program);
    }
    emulator.with_file_name(format!("paperpaw-sign{}", std::env::consts::EXE_SUFFIX))
}

/// What `paperpaw-sign plugin` says of `file` that names it: the digest
/// of its code and the interface it is built for.
fn fingerprint(sign: &Path, file: &Path) -> Option<String> {
    let mut command = std::process::Command::new(sign);
    command.arg("plugin").arg(file);
    crate::toolchain::quiet(&mut command);
    let out = command.output().ok()?;
    let said = String::from_utf8_lossy(&out.stdout);
    let field = |key: &str| said.lines().find_map(|l| l.strip_prefix(key).map(|f| f.trim().to_string()));
    Some(format!("interface {}, {}", field("interface:")?.split(',').next()?.trim(), field("digest:")?))
}

/// Writes the crate of `files` into `dir`, builds it for `reader` with
/// `dev` (`paperpaw-dev build`, which packs it with `sign`) and signs the
/// file with `seed`, the author's key; the plugin file and the source ZIP
/// go to `out`. The X4 builds with `rust` (the emulator's compiler); the X4
/// Pro (and the Classic) with `esp`, espup's toolchain; the file's chip is
/// checked to be the reader's.
#[allow(clippy::too_many_arguments)]
pub fn build_for(
    reader: Reader,
    esp: Option<&crate::xtensa::Esp>,
    dir: &Path,
    files: &[(String, Vec<u8>)],
    rust: &crate::toolchain::Rust,
    sdk: Option<&Path>,
    (dev, sign): (&Path, &Path),
    seed: &[u8; 32],
    out: &Path,
    plugin_id: &str,
    plugin_version: &str,
) -> DeviceBuilt {
    let mut built = DeviceBuilt { state: "failed".into(), reader: reader.id().into(), ..DeviceBuilt::default() };
    // What an earlier build of this reader left goes first: a failed build
    // leaves none, and none can be taken for this one later.
    let _ = std::fs::remove_file(out.join(format!("{plugin_id}-{plugin_version}-{}.ppn", reader.id())));
    if reader == Reader::X4Pro && esp.is_none() {
        built.problems.push(crate::xtensa::how_to_get_it());
        return built;
    }
    let problems = crate::code::problems(files);
    let manifest = files.iter().find(|(p, _)| p == "Cargo.toml").map(|(_, b)| String::from_utf8_lossy(b).into_owned()).unwrap_or_default();
    let Some(krate) = crate::code::cargo(&manifest).0.filter(|_| problems.is_empty()) else {
        built.problems = problems;
        return built;
    };
    for (program, what) in [(sign, "paperpaw-sign, which packs the file for the readers"), (dev, "paperpaw-dev, which builds it")] {
        if !program.exists() {
            built.problems.push(format!("PaperPaw's {what}, is not here ({}).", program.display()));
            return built;
        }
    }
    if let Err(e) = crate::code::lay_out(dev, dir, files, &krate, sdk, &rust.version) {
        built.problems.push(e);
        return built;
    }
    let device = match reader {
        Reader::X4 => "x4",
        Reader::X4Pro => "x4-pro",
    };
    let mut command = match (reader, esp) {
        (Reader::X4Pro, Some(esp)) => {
            // espup's toolchain is in the computer's rustup, not the workshop's own.
            let mut command = std::process::Command::new(dev);
            for (key, value) in &esp.env {
                command.env(key, value);
            }
            command.env_remove("RUSTUP_HOME").env_remove("RUSTUP_TOOLCHAIN").env_remove("CARGO_TARGET_DIR").env_remove("RUSTFLAGS");
            if let Some((_, home)) = &rust.homes {
                command.env("CARGO_HOME", home);
            }
            crate::toolchain::quiet(&mut command);
            command
        }
        _ => rust.tool(dev),
    };
    command.args(["build", "--device", device, "--sign-tool"]).arg(sign).current_dir(dir);
    let ran = match command.output() {
        Ok(ran) => ran,
        Err(e) => {
            built.log_tail = format!("paperpaw-dev: {e}");
            return built;
        }
    };
    let text = format!("{}\n{}", String::from_utf8_lossy(&ran.stdout), String::from_utf8_lossy(&ran.stderr));
    built.diagnostics = crate::code::diagnostics(&text);
    built.log_tail = text.lines().filter(|l| !l.trim().is_empty()).rev().take(30).collect::<Vec<_>>().into_iter().rev().collect::<Vec<_>>().join("\n");
    let unsigned = dir.join("dist").join(device).join(&krate.name).join("code.ppn");
    if !ran.status.success() || !unsigned.exists() {
        if built.diagnostics.is_empty() {
            built.problems.push(built.log_tail.clone());
        }
        return built;
    }
    // The file names the chip it runs on, and a wrong one would be refused by the reader.
    let mut shown = std::process::Command::new(sign);
    shown.arg("plugin").arg(&unsigned);
    crate::toolchain::quiet(&mut shown);
    let said = shown.output().map(|o| String::from_utf8_lossy(&o.stdout).into_owned()).unwrap_or_default();
    if let Some(why) = crate::xtensa::not_for(reader, &said) {
        built.problems.push(why);
        return built;
    }
    let _ = std::fs::create_dir_all(out);
    // A trial build has a name of its own: the store file takes only `-x4-pro.ppn`.
    let ppn = out.join(format!("{plugin_id}-{plugin_version}-{}{}.ppn", reader.id(), if esp.is_some_and(|e| !e.libraries) { "-trial" } else { "" }));
    built.trial = esp.is_some_and(|e| !e.libraries);
    if let Err(e) = std::fs::copy(&unsigned, &ppn) {
        built.problems.push(format!("{}: {e}", ppn.display()));
        return built;
    }
    // Signed with the author's key: its trailer at the end of the file.
    let signed = std::fs::read(&ppn).map(|mut file| {
        let trailer = crate::author::sign(&file, seed);
        file.extend_from_slice(&trailer);
        file
    });
    match signed.and_then(|file| std::fs::write(&ppn, file)) {
        Ok(()) => {}
        Err(e) => {
            built.problems.push(format!("{}: {e}", ppn.display()));
            return built;
        }
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
    built.size = std::fs::metadata(&ppn).map(|m| m.len()).unwrap_or(0);
    built.ppn = Some(ppn.display().to_string());
    built.source = Some(source.display().to_string());
    built.state = "done".into();
    built
}

#[cfg(test)]
mod tests {
    use super::*;

    /// A plugin with code built for the X4 as the store takes it, signed
    /// with an author's key and its source zipped: with `PAPERPAW_EMU`
    /// (`paperpaw-dev` and `paperpaw-sign` beside it) and `PAPERPAW_SDK`
    /// (the checkout's SDK), on this computer's Rust with the X4's target.
    #[test]
    #[ignore = "builds for the X4: PAPERPAW_EMU, PAPERPAW_SDK, cargo test -- --ignored"]
    fn the_hello_recipe_is_built_for_the_x4_signed_with_its_source() {
        let (Some(emu), Some(sdk)) = (std::env::var_os("PAPERPAW_EMU"), std::env::var_os("PAPERPAW_SDK")) else {
            panic!("PAPERPAW_EMU and PAPERPAW_SDK name no PaperPaw");
        };
        let emu = PathBuf::from(emu);
        let (dev, sign) = (crate::checks::dev_beside(&emu), sign_program(&emu));
        let recipes = Path::new(env!("CARGO_MANIFEST_DIR")).join("../handbook/recipes/hello");
        let mut paths = Vec::new();
        crate::emulator::collect_files(&recipes, &mut paths);
        let files: Vec<(String, Vec<u8>)> = paths
            .into_iter()
            .map(|p| (p.strip_prefix(&recipes).unwrap().to_string_lossy().replace('\\', "/"), std::fs::read(&p).unwrap()))
            .collect();
        let rust = crate::toolchain::Rust { cargo: PathBuf::from("cargo"), version: "1.99.0".into(), homes: None };
        assert!(rust.has_target(X4_TARGET), "rustup target add {X4_TARGET}");
        let dir = tempfile::tempdir().unwrap();
        let (work, out) = (dir.path().join("crate"), dir.path().join("out"));
        std::fs::create_dir_all(&work).unwrap();
        let sdk = PathBuf::from(sdk);
        let built = build_for(Reader::X4, None, &work, &files, &rust, Some(&sdk), (&dev, &sign), &[7; 32], &out, "hello", "0.1.0");
        assert_eq!(built.state, "done", "{built:?}");
        let ppn = PathBuf::from(built.ppn.unwrap());
        let check = std::process::Command::new(&sign).arg("check-plugin").arg(&ppn).output().unwrap();
        let said = String::from_utf8_lossy(&check.stdout);
        assert!(said.contains(&crate::author::fingerprint(&crate::author::public_key(&[7; 32]))), "{said}{}", String::from_utf8_lossy(&check.stderr));
        assert!(built.fingerprint.as_deref().is_some_and(|f| f.starts_with("interface 7, ")), "{:?}", built.fingerprint);
        let source = std::fs::read(built.source.unwrap()).unwrap();
        let mut archive = zip::ZipArchive::new(std::io::Cursor::new(source)).unwrap();
        let names: Vec<String> = (0..archive.len()).map(|i| archive.by_index(i).unwrap().name().to_string()).collect();
        for name in ["hello/Cargo.toml", "hello/src/main.rs", "hello/native/metadata.json", "hello/plugin/plugin.ini"] {
            assert!(names.iter().any(|n| n == name), "{name}: {names:?}");
        }
    }

    /// The handbook's recipes as "Publish…" hands them to the store: built
    /// for the X4, the X4 Pro and the emulator, each signed with an author's
    /// key, and packed with their source into the store file. With
    /// `PAPERPAW_EMU` and `PAPERPAW_SDK` as above, espup's `esp` toolchain
    /// with the release's core libraries, on Linux (x86-64); the store files
    /// are kept in `PAPERPAW_STORE_OUT` if that names a folder.
    #[test]
    #[ignore = "builds for every device: PAPERPAW_EMU, PAPERPAW_SDK, cargo test -- --ignored"]
    fn the_recipes_are_packed_for_the_store_with_a_build_for_every_device() {
        let (Some(emu), Some(sdk)) = (std::env::var_os("PAPERPAW_EMU"), std::env::var_os("PAPERPAW_SDK")) else {
            panic!("PAPERPAW_EMU and PAPERPAW_SDK name no PaperPaw");
        };
        let (emu, sdk) = (PathBuf::from(emu), PathBuf::from(sdk));
        let (dev, sign) = (crate::checks::dev_beside(&emu), sign_program(&emu));
        let rust = crate::toolchain::Rust { cargo: PathBuf::from("cargo"), version: "1.99.0".into(), homes: None };
        let esp = crate::xtensa::find().expect("espup's esp toolchain");
        assert!(esp.libraries, "the release's core libraries for the X4 Pro are not installed");
        let seed = [7; 32];
        for recipe in ["hello", "motto"] {
            let recipes = Path::new(env!("CARGO_MANIFEST_DIR")).join("../handbook/recipes").join(recipe);
            let mut paths = Vec::new();
            crate::emulator::collect_files(&recipes, &mut paths);
            let files: Vec<(String, Vec<u8>)> = paths
                .into_iter()
                .map(|p| (p.strip_prefix(&recipes).unwrap().to_string_lossy().replace('\\', "/"), std::fs::read(&p).unwrap()))
                .collect();
            let dir = tempfile::tempdir().unwrap();
            let (publish, parts) = (dir.path().join("publish"), dir.path().join("publish").join("parts"));
            let version = "0.1.0";
            let work = |device: &str| {
                let work = dir.path().join("builds").join(device);
                std::fs::create_dir_all(&work).unwrap();
                work
            };
            let x4 = build_for(Reader::X4, None, &work("x4"), &files, &rust, Some(&sdk), (&dev, &sign), &seed, &parts, recipe, version);
            assert_eq!(x4.state, "done", "{x4:?}");
            let pro = build_for(Reader::X4Pro, Some(&esp), &work("x4-pro"), &files, &rust, Some(&sdk), (&dev, &sign), &seed, &parts, recipe, version);
            assert_eq!(pro.state, "done", "{pro:?}");
            assert!(!pro.trial);
            let host = build_for_emulator(&work(EMULATOR), &files, &rust, &dev, "0.6.0", &seed, &parts, recipe, version);
            assert_eq!(host.state, "done", "{host:?}");
            // The SDK is reached through the plugin's own link, which is no part of the source.
            assert!(work("x4").join(crate::code::SDK_LINK).join("crates/paperpaw-sdk/Cargo.toml").is_file());
            let source = std::fs::read(parts.join(format!("{recipe}-{version}-source.zip"))).unwrap();
            let mut archive = zip::ZipArchive::new(std::io::Cursor::new(source)).unwrap();
            let names: Vec<String> = (0..archive.len()).map(|i| archive.by_index(i).unwrap().name().to_string()).collect();
            assert!(names.contains(&format!("{recipe}/Cargo.lock")), "{names:?}");
            assert!(names.iter().all(|n| !n.contains(".paperpaw") && !n.contains("/dist/") && !n.contains("/target/")), "{names:?}");
            // The plugin's folder as the window packs it, with what the store's page needs.
            let mut package = zip::ZipWriter::new(std::io::Cursor::new(Vec::new()));
            let options = zip::write::SimpleFileOptions::default();
            for (path, bytes) in &files {
                if let Some(rest) = path.strip_prefix("plugin/") {
                    package.start_file(format!("{recipe}/{rest}"), options).unwrap();
                    package.write_all(bytes).unwrap();
                }
            }
            package.start_file(format!("{recipe}/store/store.ini"), options).unwrap();
            package
                .write_all(b"[store]\ngroup = tools\ntags = sample\nlicence = MIT\nsource = https://github.com/hthoene/paperpaw-workshop\nsdk = 0.6\n")
                .unwrap();
            let package = package.finish().unwrap().into_inner();
            let made = crate::publish::pack(&publish, &parts, recipe, version, &package, true, &crate::publish::READERS).unwrap();
            assert_eq!(made.parts, ["package", "x4", "x4-pro", EMULATOR, "source"]);
            if let Some(out) = std::env::var_os("PAPERPAW_STORE_OUT") {
                std::fs::create_dir_all(&out).unwrap();
                std::fs::copy(&made.path, Path::new(&out).join(&made.name)).unwrap();
            }
        }
    }

    #[test]
    fn a_new_build_clears_what_an_earlier_one_of_that_reader_left_even_when_it_fails() {
        let dir = tempfile::tempdir().unwrap();
        let out = dir.path().join("out");
        std::fs::create_dir_all(&out).unwrap();
        for file in ["clock-1.0.0-x4.ppn", "clock-1.0.0-source.zip", "clock-1.1.0-x4.ppn"] {
            std::fs::write(out.join(file), b"old").unwrap();
        }
        let rust = crate::toolchain::Rust { cargo: PathBuf::from("cargo"), version: "+none".into(), homes: None };
        // No crate to build (no Cargo.toml): it fails, after the clearing.
        let none = Path::new("none");
        let built = build_for(Reader::X4, None, &dir.path().join("crate"), &[], &rust, None, (none, none), &[7; 32], &out, "clock", "1.0.0");
        assert_eq!(built.state, "failed");
        let mut left: Vec<String> = std::fs::read_dir(&out).unwrap().map(|e| e.unwrap().file_name().into_string().unwrap()).collect();
        left.sort();
        // This version's file of this reader is gone; the source and another
        // version's file are not this build's to remove.
        assert_eq!(left, ["clock-1.0.0-source.zip", "clock-1.1.0-x4.ppn"]);
    }

    #[test]
    fn the_source_zip_is_the_crate_the_same_bytes_each_time() {
        let dir = tempfile::tempdir().unwrap();
        for (f, text) in [("Cargo.toml", "a"), ("Cargo.lock", "b"), ("src/main.rs", "c"), ("target/release/x", "no")] {
            let p = dir.path().join(f);
            std::fs::create_dir_all(p.parent().unwrap()).unwrap();
            std::fs::write(p, text).unwrap();
        }
        let one = source_zip(dir.path(), "my-clock").unwrap();
        assert_eq!(one, source_zip(dir.path(), "my-clock").unwrap());
        let mut archive = zip::ZipArchive::new(std::io::Cursor::new(one)).unwrap();
        let names: Vec<String> = (0..archive.len()).map(|i| archive.by_index(i).unwrap().name().to_string()).collect();
        assert_eq!(names, ["my-clock/Cargo.lock", "my-clock/Cargo.toml", "my-clock/src/main.rs"]);
    }
}

/// What building for each reader needs, as the window shows it.
#[derive(Debug, Clone, Serialize)]
pub struct Readiness {
    /// The X4's part of Rust is there.
    pub x4: bool,
    /// About how much it takes, if not.
    pub x4_mb: u32,
    /// The X4 Pro (and the Classic): espup's `esp` toolchain is there and fits.
    pub x4_pro: bool,
    /// ... but the release's core libraries are not installed: its builds are
    /// for trying on a reader, not for the store.
    pub x4_pro_trial: bool,
    /// What to do about it, where it is not there.
    pub x4_pro_help: Option<String>,
    /// paperpaw-sign beside the emulator.
    pub sign: bool,
    /// The emulator runs a plugin's code on this computer (Linux x86-64):
    /// its library can go to the store beside the readers' files.
    pub emulator: bool,
}

/// The store's name for the library the emulator on Linux loads, and the
/// end of its file's name.
pub const EMULATOR: &str = "emulator-linux-x86_64";

/// Builds the plugin of `files` in `dir` for PaperPaw's emulator on this
/// computer (Linux x86-64), as the reader beside the conversation runs it,
/// and signs the library with `seed`, the author's key: the store lists it
/// for the emulator (`<id>-<version>-emulator-linux-x86_64.so` in `out`).
#[allow(clippy::too_many_arguments)]
pub fn build_for_emulator(
    dir: &Path,
    files: &[(String, Vec<u8>)],
    rust: &crate::toolchain::Rust,
    dev: &Path,
    paperpaw: &str,
    seed: &[u8; 32],
    out: &Path,
    plugin_id: &str,
    plugin_version: &str,
) -> DeviceBuilt {
    let mut built = DeviceBuilt { state: "failed".into(), reader: EMULATOR.into(), ..DeviceBuilt::default() };
    let file = out.join(format!("{plugin_id}-{plugin_version}-{EMULATOR}.so"));
    let _ = std::fs::remove_file(&file);
    let (made, library) = crate::code::build(dir, files, rust, dev, paperpaw);
    built.problems = made.problems;
    built.diagnostics = made.diagnostics;
    built.log_tail = made.log_tail;
    let Some(library) = library else { return built };
    // Signed as a reader's file is: the author's trailer after the library.
    let signed = std::fs::read(&library).map(|mut bytes| {
        let trailer = crate::author::sign(&bytes, seed);
        bytes.extend_from_slice(&trailer);
        bytes
    });
    let written = signed.and_then(|bytes| {
        std::fs::create_dir_all(out)?;
        built.size = bytes.len() as u64;
        std::fs::write(&file, bytes)
    });
    if let Err(e) = written {
        built.problems.push(format!("{}: {e}", file.display()));
        return built;
    }
    built.ppn = Some(file.display().to_string());
    built.state = "done".into();
    built
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
        let (x4_pro, x4_pro_trial, x4_pro_help) = match crate::xtensa::find() {
            Ok(esp) => (true, !esp.libraries, None),
            Err(help) => (false, false, Some(help)),
        };
        Ok(Readiness { x4: rust.has_target(X4_TARGET), x4_mb: X4_TARGET_MB, x4_pro, x4_pro_trial, x4_pro_help, sign: sign_program(&program).exists(), emulator: crate::code::emulator_runs_code() })
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
    reader: Option<String>,
) -> Result<DeviceBuilt, String> {
    use tauri::Emitter;
    let for_emulator = reader.as_deref() == Some(EMULATOR);
    let reader = match reader.as_deref() {
        None => Reader::X4,
        Some(_) if for_emulator => Reader::X4,
        Some(id) => Reader::from_id(id).ok_or_else(|| format!("{id}: no reader the workshop builds for."))?,
    };
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
        if for_emulator {
            let root = crate::paths::projects()?;
            let files = crate::projects::plugin_files(&root, &project)?;
            let dir = crate::paths::app_data()?.join("builds").join(&project).join(EMULATOR);
            std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
            let out = crate::publish::parts(&root, &project)?;
            told("Building for the emulator…");
            let dev = crate::checks::dev_beside(&crate::paths::emulator_program()?);
            return Ok(build_for_emulator(&dir, &files, &rust, &dev, &ready.paperpaw, &seed, &out, &id, &version));
        }
        if reader == Reader::X4 && !rust.has_target(X4_TARGET) {
            return Err("The X4's part of Rust is not set up yet.".into());
        }
        let esp = if reader == Reader::X4Pro { Some(crate::xtensa::find()?) } else { None };
        let root = crate::paths::projects()?;
        let files = crate::projects::plugin_files(&root, &project)?;
        let dir = crate::paths::app_data()?.join("builds").join(&project).join(reader.id());
        std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
        let out = crate::publish::parts(&root, &project)?;
        let sign = sign_program(&crate::paths::emulator_program()?);
        told(if reader == Reader::X4Pro { "Building for the X4 Pro…" } else { "Building for the X4…" });
        Ok(build_for(reader, esp.as_ref(), &dir, &files, &rust, crate::code::sdk(&ready.paperpaw).as_deref(), (&crate::checks::dev_beside(&crate::paths::emulator_program()?), &sign), &seed, &out, &id, &version))
    })
    .await
    .map_err(|e| e.to_string())?
}
