//! The X4 Pro's and the X4 Classic's side of building a plugin with code:
//! both are an ESP32-S3 (Xtensa, chip 9) and take the same file. Rust
//! has no `core` for Xtensa; espup's `esp` toolchain, which the person
//! installs once (about 1.2 GB), brings the compiler, the Xtensa linker
//! and the source of `core`.
//!
//! Until a PaperPaw release's `paperpaw-xtensa-std` archive is installed
//! into that toolchain, a plugin is built with `-Zbuild-std`, as the
//! hosted builder does (`builder/server.mjs`). Such a file runs on a reader,
//! but the store's rebuild would not match it byte for byte, so it is a
//! *trial* build: kept apart, never put into a store file.

use std::path::{Path, PathBuf};
use std::process::Command;

/// The Rust of espup's `esp` toolchain a reader's firmware is built with
/// (`shells/xteink/versions.env` of the PaperPaw release the workshop
/// bundles: a plugin file runs only on firmware built by the same compiler).
pub const ESP_RUST_VERSION: &str = "1.97.0.0";
/// espup and the Xtensa GCC of that release, for the instructions.
pub const ESPUP_VERSION: &str = "0.17.1";
pub const ESP_GCC_VERSION: &str = "14.2.0_20241119";
/// About what the `esp` toolchain takes on disk, for the person to know.
pub const ESP_MB: u32 = 1200;
/// The Pro's target.
pub const TARGET: &str = "xtensa-esp32s3-none-elf";

/// A reader a plugin file is built for. The Classic takes the Pro's file.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Reader {
    X4,
    X4Pro,
}

impl Reader {
    /// The store's name for its build, which a file's name ends with.
    pub fn id(self) -> &'static str {
        match self {
            Reader::X4 => "x4",
            Reader::X4Pro => "x4-pro",
        }
    }

    pub fn from_id(id: &str) -> Option<Reader> {
        match id {
            "x4" => Some(Reader::X4),
            "x4-pro" => Some(Reader::X4Pro),
            _ => None,
        }
    }

    /// The chip in the plugin file's header.
    pub fn chip(self) -> u16 {
        match self {
            Reader::X4 => 5,
            Reader::X4Pro => 9,
        }
    }

    /// The build for the reader a cable finds, by the id it says
    /// (`xteink-x4-pro`); the X4 Classic runs the Pro's, the X3 the X4's.
    pub fn of_device(device: &str) -> Option<Reader> {
        match device {
            "xteink-x4" | "xteink-x3" => Some(Reader::X4),
            "xteink-x4-pro" | "xteink-x4-classic" => Some(Reader::X4Pro),
            _ => None,
        }
    }
}

/// The `esp` toolchain as found.
#[derive(Debug, Clone)]
pub struct Esp {
    /// What espup's export file sets (the Xtensa GCC on `PATH`, `LIBCLANG_PATH`).
    pub env: Vec<(String, String)>,
    /// Whether the release's core libraries are installed (else `-Zbuild-std`).
    pub libraries: bool,
}

impl Esp {
    /// `cargo +esp` with espup's environment. The registry is `cargo_home`'s
    /// (where the workshop fetched the crates), the toolchain the computer's.
    pub fn cargo(&self, cargo_home: Option<&Path>) -> Command {
        let mut command = Command::new(format!("cargo{}", std::env::consts::EXE_SUFFIX));
        command.arg("+esp");
        for (key, value) in &self.env {
            command.env(key, value);
        }
        // The toolchain is in the computer's rustup, not the workshop's own.
        command.env_remove("RUSTUP_HOME").env_remove("CARGO_TARGET_DIR").env_remove("CARGO_BUILD_TARGET_DIR");
        if let Some(home) = cargo_home {
            command.env("CARGO_HOME", home);
        }
        crate::toolchain::quiet(&mut command);
        command
    }
}

/// How to get the toolchain, in the person's words.
pub fn how_to_get_it() -> String {
    format!(
        "Plugins for the X4 Pro need espup's Xtensa tools (about {} GB), which are not on this computer yet. \
         In a terminal: cargo install espup --version {ESPUP_VERSION} --locked, then espup install --targets esp32s3 \
         --toolchain-version {ESP_RUST_VERSION} --crosstool-toolchain-version {ESP_GCC_VERSION}. Then start the workshop again.",
        ESP_MB as f32 / 1000.0
    )
}

/// What an espup export file sets: `export KEY="value"` lines (Linux, macOS)
/// or `$Env:KEY = "value"` (PowerShell), with `$PATH` / `$Env:PATH` meaning
/// `path`. Not run: read, so that nothing in the file can do more than set variables.
pub fn parse_export(text: &str, path: &str) -> Vec<(String, String)> {
    let mut out = Vec::new();
    for line in text.lines() {
        let line = line.trim();
        let rest = line
            .strip_prefix("export ")
            .or_else(|| line.strip_prefix("$Env:").or_else(|| line.strip_prefix("$env:")));
        let Some(rest) = rest else { continue };
        let Some((key, value)) = rest.split_once('=') else { continue };
        let key = key.trim();
        if key.is_empty() || !key.bytes().all(|b| b.is_ascii_alphanumeric() || b == b'_') {
            continue;
        }
        // `"…:$PATH"` or `"…;" + $Env:PATH`
        let mut value = value.trim().to_string();
        let tail = ["+ $Env:PATH", "+ $env:PATH"];
        let appends = tail.iter().any(|t| value.ends_with(t));
        if let Some(t) = tail.iter().find(|t| value.ends_with(**t)) {
            value.truncate(value.len() - t.len());
        }
        let value = value.trim().trim_matches('"').replace("${PATH}", path).replace("$PATH", path);
        out.push((key.to_string(), if appends { format!("{value}{path}") } else { value }));
    }
    out
}

/// Whether `rustc +esp --version` says it is the release's compiler.
pub fn version_fits(said: &str) -> bool {
    said.contains(&format!("({ESP_RUST_VERSION})"))
}

/// Whether the release's `core` for the Pro is installed in the toolchain
/// whose sysroot is `sysroot`.
pub fn libraries_in(sysroot: &Path) -> bool {
    let lib = sysroot.join("lib").join("rustlib").join(TARGET).join("lib");
    std::fs::read_dir(lib)
        .map(|entries| entries.flatten().any(|e| e.file_name().to_string_lossy().starts_with("libcore-")))
        .unwrap_or(false)
}

fn home() -> Option<PathBuf> {
    std::env::var_os(if cfg!(windows) { "USERPROFILE" } else { "HOME" }).map(PathBuf::from)
}

fn run(args: &[&str]) -> Option<String> {
    let mut command = Command::new(format!("rustc{}", std::env::consts::EXE_SUFFIX));
    command.args(args).env_remove("RUSTUP_HOME");
    crate::toolchain::quiet(&mut command);
    let out = command.output().ok().filter(|o| o.status.success())?;
    Some(String::from_utf8_lossy(&out.stdout).trim().to_string())
}

/// The `esp` toolchain of this computer, or what to do about it.
pub fn find() -> Result<Esp, String> {
    let said = run(&["+esp", "--version"]).ok_or_else(how_to_get_it)?;
    if !version_fits(&said) {
        return Err(format!(
            "The Xtensa tools here are \"{said}\", but this PaperPaw's readers run plugins built with {ESP_RUST_VERSION}. \
             Install that one: espup install --targets esp32s3 --toolchain-version {ESP_RUST_VERSION} --crosstool-toolchain-version {ESP_GCC_VERSION}."
        ));
    }
    let home = home().ok_or("There is no home folder to look for espup's export file in.")?;
    let file = ["export-esp.sh", "export-esp.ps1"].iter().map(|n| home.join(n)).find(|p| p.exists());
    let path = std::env::var("PATH").unwrap_or_default();
    let env = match file {
        Some(file) => parse_export(&std::fs::read_to_string(&file).map_err(|e| format!("{}: {e}", file.display()))?, &path),
        None => {
            return Err(format!(
                "espup's export file ({}) is missing: it names the Xtensa linker. Run espup install again with --export-file {}.",
                home.join(if cfg!(windows) { "export-esp.ps1" } else { "export-esp.sh" }).display(),
                home.join(if cfg!(windows) { "export-esp.ps1" } else { "export-esp.sh" }).display(),
            ))
        }
    };
    let libraries = run(&["+esp", "--print", "sysroot"]).is_some_and(|s| libraries_in(Path::new(&s)));
    Ok(Esp { env, libraries })
}

/// What `paperpaw-sign plugin` says is the file's chip (`chip: ESP32-S3 (9)`).
pub fn chip_in(said: &str) -> Option<u16> {
    let line = said.lines().find_map(|l| l.strip_prefix("chip:"))?;
    line.trim().rsplit_once('(')?.1.strip_suffix(')')?.trim().parse().ok()
}

/// Why a plugin file read by `paperpaw-sign plugin` is not for `reader`, if it is not.
pub fn not_for(reader: Reader, said: &str) -> Option<String> {
    match chip_in(said) {
        Some(chip) if chip == reader.chip() => None,
        Some(chip) => Some(format!("The file is for chip {chip}, not the {}'s chip {}.", reader.id(), reader.chip())),
        None => Some("paperpaw-sign names no chip for the file.".into()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_export_file_is_read_not_run() {
        let sh = "export LIBCLANG_PATH=\"/h/clang/lib\"\nexport PATH=\"/h/gcc/bin:$PATH\"\nrm -rf /\n# export X=1\n";
        assert_eq!(
            parse_export(sh, "/usr/bin"),
            [("LIBCLANG_PATH".to_string(), "/h/clang/lib".to_string()), ("PATH".to_string(), "/h/gcc/bin:/usr/bin".to_string())]
        );
        let ps = "$Env:LIBCLANG_PATH = \"C:\\h\\clang\\lib\"\n$Env:PATH = \"C:\\h\\gcc\\bin;\" + $Env:PATH\n";
        assert_eq!(
            parse_export(ps, "C:\\Windows"),
            [("LIBCLANG_PATH".to_string(), "C:\\h\\clang\\lib".to_string()), ("PATH".to_string(), "C:\\h\\gcc\\bin;C:\\Windows".to_string())]
        );
        assert!(parse_export("export BAD KEY=1\nexport =2\n", "").is_empty());
    }

    #[test]
    fn only_the_releases_compiler_fits() {
        assert!(version_fits("rustc 1.97.0-nightly (8ea53bcd7 2026-07-08) (1.97.0.0)"));
        assert!(!version_fits("rustc 1.96.0 (1.96.0.0)"));
    }

    #[test]
    fn the_core_libraries_are_there_when_a_libcore_is() {
        let sysroot = tempfile::tempdir().unwrap();
        assert!(!libraries_in(sysroot.path()));
        let lib = sysroot.path().join("lib/rustlib").join(TARGET).join("lib");
        std::fs::create_dir_all(&lib).unwrap();
        assert!(!libraries_in(sysroot.path()));
        std::fs::write(lib.join("libcore-1234.rlib"), b"").unwrap();
        assert!(libraries_in(sysroot.path()));
    }

    #[test]
    fn the_chip_is_read_from_what_paperpaw_sign_says_and_must_be_the_readers() {
        let c3 = "chip:        ESP32-C3 (5)\nfingerprint: 0005a9ec2b916220\n";
        let s3 = "chip:        ESP32-S3 (9)\nfingerprint: 0005a9ec2b916221\n";
        assert_eq!(chip_in(c3), Some(5));
        assert_eq!(chip_in(s3), Some(9));
        assert_eq!(not_for(Reader::X4Pro, s3), None);
        assert_eq!(not_for(Reader::X4, c3), None);
        assert!(not_for(Reader::X4Pro, c3).unwrap().contains("chip 5"));
        assert!(not_for(Reader::X4, "nothing").is_some());
    }

    #[test]
    fn readers_by_name_and_by_what_a_cable_finds() {
        assert_eq!(Reader::from_id("x4-pro"), Some(Reader::X4Pro));
        assert_eq!(Reader::from_id("x4-classic"), None);
        assert_eq!(Reader::of_device("xteink-x4-classic"), Some(Reader::X4Pro));
        assert_eq!(Reader::of_device("xteink-x3"), Some(Reader::X4));
        assert_eq!(Reader::of_device("boox"), None);
        assert!(how_to_get_it().contains("espup install"));
    }
}
