//! Where the workshop keeps things on the computer: the projects where
//! people see them (Documents/PaperPaw Workshop/<plugin>/), and what is the
//! app's own (the emulated readers' folders, later the toolchains) in the
//! system's place for app data.

use std::path::{Component, Path, PathBuf};

/// Whether `path` is a plain relative path: not empty, only names (no `..`,
/// no root), no `\`, and no `:`. A drive (`C:/x`) is a plain name on Linux
/// and macOS, but no file name on Windows, where the projects are opened too.
/// Every path the window, a snapshot or a ZIP names goes through this.
pub fn plain(path: &str) -> bool {
    !path.is_empty()
        && !path.contains(['\\', ':'])
        && Path::new(path)
            .components()
            .all(|c| matches!(c, Component::Normal(_)))
}

/// The folder of the projects, one folder each.
pub fn projects() -> Result<PathBuf, String> {
    let documents = dirs::document_dir().ok_or("no Documents folder")?;
    Ok(documents.join("PaperPaw Workshop"))
}

/// The app's own folder.
pub fn app_data() -> Result<PathBuf, String> {
    let data = dirs::data_local_dir().ok_or("no folder for app data")?;
    Ok(data.join("PaperPaw Workshop"))
}

/// The emulated reader `profile`'s files.
pub fn emulator_library(profile: &str) -> Result<PathBuf, String> {
    Ok(app_data()?.join("readers").join(profile))
}

/// PaperPaw's emulator, `paperpaw-emu` (paperpaw-dev beside it for the
/// checks): `PAPERPAW_EMU` while the workshop is worked on (a build of
/// PaperPaw's own), else the one of the PaperPaw release chosen, kept in
/// the app's folder (`emulators/<version>/`, see the version step), else
/// the one the installer brought (`emulator/` beside the app).
pub fn emulator_program() -> Result<PathBuf, String> {
    if let Some(program) = std::env::var_os("PAPERPAW_EMU") {
        return Ok(PathBuf::from(program));
    }
    let name = format!("paperpaw-emu{}", std::env::consts::EXE_SUFFIX);
    let chosen = app_data()?.join("emulators").join("current").join(&name);
    if chosen.exists() {
        return Ok(chosen);
    }
    let installed = std::env::current_exe()
        .ok()
        .and_then(|exe| Some(exe.parent()?.join("emulator").join(&name)));
    match installed {
        Some(program) if program.exists() => Ok(program),
        _ => Err(format!("PaperPaw's emulator is not here yet ({}).", chosen.display())),
    }
}

#[cfg(test)]
mod tests {
    use super::plain;

    #[test]
    fn only_plain_relative_paths_are_plain() {
        for ok in ["a", "src/lib.rs", "a b/c.txt", ".workshop/x"] {
            assert!(plain(ok), "{ok}");
        }
        for bad in ["", "/a", "../a", "a/../b", "a\\b", "C:/x", "C:x", "a:b", "a/b:c", "./"] {
            assert!(!plain(bad), "{bad}");
        }
    }
}
