//! Rust for plugins with code, set up by the workshop on the first one: in
//! the app's own folder (`rust/`, rustup's and cargo's homes there, the
//! person's own Rust untouched), the very compiler PaperPaw's emulator
//! names (`ready`'s `toolchain`): a plugin's code runs only when built by
//! the compiler, for the target, against the SDK of the PaperPaw that
//! loads it (its fingerprint). rustup comes from rust-lang.org, its
//! SHA-256 checked first. Data plugins need none of this.
//!
//! On Windows the compiler's target is `…-windows-msvc`, which links with
//! Microsoft's linker (Visual Studio's C++ build tools); without them the
//! workshop says so rather than failing in the build.

use std::path::{Path, PathBuf};
use std::process::Command;

use sha2::{Digest, Sha256};

/// The compiler a PaperPaw names: `rustc 1.99.0 (b940084d7 2026-09-28),
/// x86_64-pc-windows-msvc` as its version (`1.99.0`) and target.
pub fn wanted(toolchain: &str) -> Result<(String, String), String> {
    let (rustc, target) = toolchain.split_once(", ").ok_or_else(|| format!("no compiler in `{toolchain}`"))?;
    let version = rustc
        .strip_prefix("rustc ")
        .and_then(|r| r.split_whitespace().next())
        .filter(|v| v.split('.').count() == 3 && v.split('.').all(|n| n.parse::<u32>().is_ok()))
        .ok_or_else(|| format!("no compiler version in `{toolchain}`"))?;
    let target = target.trim();
    if target.is_empty() || !target.chars().all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_') {
        return Err(format!("no target in `{toolchain}`"));
    }
    Ok((version.to_string(), target.to_string()))
}

/// Rust as the workshop runs it: cargo of a toolchain, and the homes.
#[derive(Debug, Clone)]
pub struct Rust {
    /// `cargo` (rustup's proxy for it).
    pub cargo: PathBuf,
    /// The toolchain, as `+1.99.0` takes it.
    pub version: String,
    /// RUSTUP_HOME and CARGO_HOME, where the app keeps its own.
    pub homes: Option<(PathBuf, PathBuf)>,
}

impl Rust {
    /// `cargo +<version>` with the homes set.
    pub fn cargo(&self) -> Command {
        let mut command = Command::new(&self.cargo);
        command.arg(format!("+{}", self.version));
        if let Some((rustup, cargo)) = &self.homes {
            command.env("RUSTUP_HOME", rustup).env("CARGO_HOME", cargo);
        }
        quiet(&mut command);
        command
    }
}

/// No console window beside the workshop's.
pub fn quiet(command: &mut Command) {
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        command.creation_flags(0x0800_0000);
    }
    #[cfg(not(windows))]
    let _ = command;
}

fn exe(name: &str) -> String {
    format!("{name}{}", std::env::consts::EXE_SUFFIX)
}

/// The host's triple for rustup's download (`x86_64-pc-windows-msvc`).
fn host() -> Result<&'static str, String> {
    Ok(match (std::env::consts::OS, std::env::consts::ARCH) {
        ("windows", "x86_64") => "x86_64-pc-windows-msvc",
        ("windows", "aarch64") => "aarch64-pc-windows-msvc",
        ("macos", "x86_64") => "x86_64-apple-darwin",
        ("macos", "aarch64") => "aarch64-apple-darwin",
        ("linux", "x86_64") => "x86_64-unknown-linux-gnu",
        ("linux", "aarch64") => "aarch64-unknown-linux-gnu",
        (os, arch) => return Err(format!("no Rust for {os} on {arch}")),
    })
}

/// Rust with the toolchain `version`, set up if it is not yet; `told`
/// hears what is happening, in the person's words. `PAPERPAW_RUST=system`
/// (while the workshop is worked on) takes the computer's own rustup.
pub fn ready(home: &Path, version: &str, told: &dyn Fn(&str)) -> Result<Rust, String> {
    if std::env::var("PAPERPAW_RUST").as_deref() == Ok("system") {
        let rust = Rust { cargo: PathBuf::from(exe("cargo")), version: version.into(), homes: None };
        install_toolchain(&PathBuf::from(exe("rustup")), None, version, told)?;
        return Ok(rust);
    }
    let (rustup_home, cargo_home) = (home.join("rustup"), home.join("cargo"));
    let rustup = cargo_home.join("bin").join(exe("rustup"));
    if !rustup.exists() {
        told("Setting up Rust for plugins with code (once)…");
        install_rustup(home, &rustup_home, &cargo_home)?;
    }
    let homes = Some((rustup_home, cargo_home.clone()));
    install_toolchain(&rustup, homes.as_ref(), version, told)?;
    Ok(Rust { cargo: cargo_home.join("bin").join(exe("cargo")), version: version.into(), homes })
}

fn install_rustup(home: &Path, rustup_home: &Path, cargo_home: &Path) -> Result<(), String> {
    let host = host()?;
    let url = format!("https://static.rust-lang.org/rustup/dist/{host}/{}", exe("rustup-init"));
    let bytes = download(&url)?;
    let expected = String::from_utf8(download(&format!("{url}.sha256"))?).map_err(|e| e.to_string())?;
    let expected = expected.split_whitespace().next().unwrap_or_default().to_lowercase();
    let got = hex(&Sha256::digest(&bytes));
    if got != expected {
        return Err(format!("rustup's download did not match its checksum ({got}, not {expected}): nothing was run."));
    }
    std::fs::create_dir_all(home).map_err(|e| e.to_string())?;
    let init = home.join(exe("rustup-init"));
    std::fs::write(&init, &bytes).map_err(|e| e.to_string())?;
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        std::fs::set_permissions(&init, std::fs::Permissions::from_mode(0o755)).map_err(|e| e.to_string())?;
    }
    let mut command = Command::new(&init);
    command
        .args(["-y", "--no-modify-path", "--profile", "minimal", "--default-toolchain", "none"])
        .env("RUSTUP_HOME", rustup_home)
        .env("CARGO_HOME", cargo_home);
    quiet(&mut command);
    let ran = command.output().map_err(|e| format!("rustup-init: {e}"))?;
    let _ = std::fs::remove_file(&init);
    if !ran.status.success() {
        return Err(format!("Rust could not be set up: {}", last_line(&ran.stderr)));
    }
    Ok(())
}

fn install_toolchain(rustup: &Path, homes: Option<&(PathBuf, PathBuf)>, version: &str, told: &dyn Fn(&str)) -> Result<(), String> {
    let run = |args: &[&str]| {
        let mut command = Command::new(rustup);
        command.args(args);
        if let Some((rustup_home, cargo_home)) = homes {
            command.env("RUSTUP_HOME", rustup_home).env("CARGO_HOME", cargo_home);
        }
        quiet(&mut command);
        command.output().map_err(|e| format!("rustup: {e}"))
    };
    let installed = run(&["toolchain", "list"])?;
    if String::from_utf8_lossy(&installed.stdout).lines().any(|l| l.starts_with(&format!("{version}-"))) {
        return Ok(());
    }
    told(&format!("Getting the Rust compiler {version} (once, a few hundred MB)…"));
    let ran = run(&["toolchain", "install", version, "--profile", "minimal", "--no-self-update"])?;
    if !ran.status.success() {
        return Err(format!("Rust {version} could not be set up: {}", last_line(&ran.stderr)));
    }
    Ok(())
}

/// Whether this computer can link for `target`: on Windows' MSVC targets,
/// Visual Studio's C++ build tools must be there (found as Visual Studio
/// finds them, with vswhere). Why not, in the person's words.
pub fn can_link(target: &str) -> Result<(), String> {
    if !target.ends_with("-windows-msvc") {
        return Ok(());
    }
    let vswhere = Path::new(r"C:\Program Files (x86)\Microsoft Visual Studio\Installer\vswhere.exe");
    let found = vswhere.exists()
        && Command::new(vswhere)
            .args(["-latest", "-products", "*", "-requires", "Microsoft.VisualStudio.Component.VC.Tools.x86.x64", "-property", "installationPath"])
            .output()
            .is_ok_and(|o| o.status.success() && !String::from_utf8_lossy(&o.stdout).trim().is_empty());
    if found {
        Ok(())
    } else {
        Err(format!("{NO_BUILD_TOOLS} on Windows (Visual Studio Build Tools, the C++ workload). They are not on this computer yet."))
    }
}

/// What the person is told when the build tools are missing; the window
/// knows it by these words and offers to install them.
pub const NO_BUILD_TOOLS: &str = "Plugins with code need Microsoft's C++ build tools";

/// Microsoft's C++ build tools through Windows' own installer (winget),
/// the C++ workload only, after the person chose to in the window (which
/// says: about 3 GB, Windows asks for administrator rights, Microsoft's
/// licence applies). Visual Studio's installer shows its own progress.
#[tauri::command]
pub async fn build_tools_install() -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(|| {
        let ran = Command::new("winget")
            .args([
                "install",
                "--id",
                "Microsoft.VisualStudio.BuildTools",
                "--exact",
                "--source",
                "winget",
                "--accept-package-agreements",
                "--accept-source-agreements",
                "--override",
                "--passive --wait --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended",
            ])
            .status()
            .map_err(|e| format!("Windows' installer (winget) could not start: {e}"))?;
        can_link("x86_64-pc-windows-msvc").map_err(|_| {
            if ran.success() {
                "The build tools were installed, but are not found yet: start the workshop again.".to_string()
            } else {
                "The build tools were not installed.".to_string()
            }
        })
    })
    .await
    .map_err(|e| e.to_string())?
}

fn download(url: &str) -> Result<Vec<u8>, String> {
    let answer = ureq::get(url).call().map_err(|e| format!("{url}: {e}"))?;
    let mut bytes = Vec::new();
    std::io::Read::read_to_end(&mut answer.into_reader(), &mut bytes).map_err(|e| format!("{url}: {e}"))?;
    Ok(bytes)
}

fn hex(bytes: &[u8]) -> String {
    bytes.iter().map(|b| format!("{b:02x}")).collect()
}

pub fn last_line(output: &[u8]) -> String {
    let text = String::from_utf8_lossy(output);
    text.lines().rev().find(|l| !l.trim().is_empty()).unwrap_or("no message").trim().to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_compiler_is_read_as_paperpaw_names_it() {
        assert_eq!(
            wanted("rustc 1.99.0 (b940084d7 2026-09-28), x86_64-pc-windows-msvc").unwrap(),
            ("1.99.0".to_string(), "x86_64-pc-windows-msvc".to_string())
        );
        assert!(wanted("rustc nightly, x").is_err());
        assert!(wanted("rustc 1.99.0").is_err(), "no target");
    }

    #[test]
    fn other_targets_need_no_microsoft_linker() {
        assert!(can_link("x86_64-unknown-linux-gnu").is_ok());
        assert!(can_link("aarch64-apple-darwin").is_ok());
    }
}
