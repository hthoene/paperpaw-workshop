//! "Publish…" on the computer's side: the package the window made for the
//! store's upload form kept in the project's `.workshop/publish/`, then the
//! form opened in the person's browser and the package shown in its
//! folder, for the person to upload. Nothing is uploaded from here.

use std::path::{Path, PathBuf};

use base64::Engine;
use tauri_plugin_opener::OpenerExt;

use crate::{paths, projects};

/// The store's upload form.
pub const SUBMIT: &str = "https://paperpaw.org/submit";

/// A package's name as the window gives it: `<id>-<version>-upload.zip`.
fn valid_name(name: &str) -> bool {
    name.ends_with("-upload.zip")
        && name.len() <= 80
        && name.bytes().all(|b| b.is_ascii_lowercase() || b.is_ascii_digit() || b == b'-' || b == b'.')
        && !name.starts_with('.')
}

/// Keeps `bytes` as `name` in the project's `.workshop/publish/`; its path.
pub fn keep(root: &Path, project: &str, name: &str, bytes: &[u8]) -> Result<PathBuf, String> {
    if !valid_name(name) {
        return Err(format!("{name}: not a package's name"));
    }
    let dir = projects::folder(root, project)?.join(".workshop").join("publish");
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let file = dir.join(name);
    std::fs::write(&file, bytes).map_err(|e| format!("{name}: {e}"))?;
    Ok(file)
}

#[tauri::command]
pub async fn publish_save(project: String, name: String, base64: String) -> Result<String, String> {
    let bytes = base64::engine::general_purpose::STANDARD.decode(base64).map_err(|e| e.to_string())?;
    tauri::async_runtime::spawn_blocking(move || {
        let file = keep(&paths::projects()?, &project, &name, &bytes)?;
        Ok(file.display().to_string())
    })
    .await
    .map_err(|e| e.to_string())?
}

/// Opens the upload form in the person's browser and shows the package in
/// its folder. Only a package the workshop kept is shown.
#[tauri::command]
pub async fn publish_show(app: tauri::AppHandle, path: String) -> Result<(), String> {
    let file = PathBuf::from(&path);
    let kept = file.parent().is_some_and(|dir| dir.ends_with(Path::new(".workshop").join("publish")))
        && file.starts_with(paths::projects()?)
        && file.file_name().and_then(|n| n.to_str()).is_some_and(valid_name);
    if !kept {
        return Err(format!("{path}: not a package of the workshop's"));
    }
    app.opener().open_url(SUBMIT, None::<&str>).map_err(|e| e.to_string())?;
    app.opener().reveal_item_in_dir(&file).map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn a_package_is_kept_in_the_project_s_publish_folder_and_nothing_else_is() {
        let root = std::env::temp_dir().join(format!("pp-publish-{}", std::process::id()));
        std::fs::create_dir_all(root.join("Night owl")).unwrap();
        let file = keep(&root, "Night owl", "night-owl-1.0.0-upload.zip", b"PK").unwrap();
        assert_eq!(file, root.join("Night owl").join(".workshop").join("publish").join("night-owl-1.0.0-upload.zip"));
        assert_eq!(std::fs::read(&file).unwrap(), b"PK");
        for bad in ["../x-upload.zip", "night-owl.zip", "Night-upload.zip", "a/b-upload.zip"] {
            assert!(keep(&root, "Night owl", bad, b"PK").is_err(), "{bad}");
        }
        std::fs::remove_dir_all(&root).unwrap();
    }
}
