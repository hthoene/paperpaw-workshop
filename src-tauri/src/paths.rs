//! Where the workshop keeps things on the computer: the projects where
//! people see them (Documents/PaperPaw Workshop/<plugin>/), and what is the
//! app's own (the emulated readers' folders, later the toolchains) in the
//! system's place for app data.

use std::path::PathBuf;

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
