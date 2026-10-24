//! "Publish…" on the computer's side: one file for the store's upload
//! form, `<id>-<version>-store.zip`, kept in the project's
//! `.workshop/publish/`; then the form opened in the person's browser and
//! the file shown in its folder, for the person to upload. Nothing is
//! uploaded from here.
//!
//! The store file holds every part the form needs, each as the store
//! takes it by hand, and `paperpaw-store.ini`, which names them:
//!
//! - the plugin's folder as a ZIP (`<id>-<version>-upload.zip`);
//! - a plugin with code: its build for each reader, signed with the
//!   author's key (`<id>-<version>-<device>.ppn`), and its source as a
//!   ZIP (`<id>-<version>-source.zip`).
//!
//! The parts are made in `.workshop/publish/parts/`, so that the folder
//! the person sees holds only the files to upload. They are stored in the
//! store file as they are (each is packed already), in name order with
//! fixed times, so the same parts make the same bytes.

use std::io::Write;
use std::path::{Path, PathBuf};

use base64::Engine;
use serde::Serialize;
use tauri_plugin_opener::OpenerExt;

use crate::{paths, projects};

/// The store's upload form.
pub const SUBMIT: &str = "https://paperpaw.org/submit";
/// The store file's list of its parts.
pub const MANIFEST: &str = "paperpaw-store.ini";
/// The format of that list the store reads.
pub const FORMAT: u32 = 1;
/// The readers a plugin with code may have a build for, as the store
/// names them.
pub const READERS: [&str; 2] = ["x4", "x4-pro"];

/// A name the workshop gives its files: lower-case letters, digits,
/// hyphens and dots, ending in `end`.
fn named(name: &str, end: &str) -> bool {
    name.ends_with(end)
        && name.len() <= 80
        && name.bytes().all(|b| b.is_ascii_lowercase() || b.is_ascii_digit() || b == b'-' || b == b'.')
        && !name.starts_with('.')
}

/// The project's `.workshop/publish/`, where the store files lie.
pub fn folder(root: &Path, project: &str) -> Result<PathBuf, String> {
    Ok(projects::folder(root, project)?.join(".workshop").join("publish"))
}

/// Where the parts of a store file are made.
pub fn parts(root: &Path, project: &str) -> Result<PathBuf, String> {
    Ok(folder(root, project)?.join("parts"))
}

/// What a store file holds, as the window says it.
#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
pub struct StoreFile {
    pub path: String,
    pub name: String,
    /// `package`, then each reader built for (`x4`), then `source`.
    pub parts: Vec<String>,
}

/// The store file of `id` at `version`: `package`, the `builds` by
/// reader and the `source`, with the list that names them.
pub fn store_zip(id: &str, version: &str, package: &[u8], builds: &[(&str, Vec<u8>)], source: Option<&[u8]>) -> Result<Vec<u8>, String> {
    let stem = format!("{id}-{version}");
    let mut manifest = format!(
        "# Made by the PaperPaw Workshop for the plugin store at paperpaw.org.\n\
         # Upload this ZIP as it is, in the form's first field: the store\n\
         # takes each part named here from it.\n\
         [store-file]\n\
         format = {FORMAT}\n\
         id = {id}\n\
         version = {version}\n\
         made-by = PaperPaw Workshop {}\n\
         package = {stem}-upload.zip\n",
        env!("CARGO_PKG_VERSION")
    );
    let mut files: Vec<(String, &[u8])> = vec![(format!("{stem}-upload.zip"), package)];
    if source.is_some() {
        manifest.push_str(&format!("source = {stem}-source.zip\n"));
    }
    if !builds.is_empty() {
        manifest.push_str("\n[builds]\n");
    }
    for (device, bytes) in builds {
        if !READERS.contains(device) {
            return Err(format!("{device}: no reader the store knows"));
        }
        manifest.push_str(&format!("{device} = {stem}-{device}.ppn\n"));
        files.push((format!("{stem}-{device}.ppn"), bytes));
    }
    if let Some(source) = source {
        files.push((format!("{stem}-source.zip"), source));
    }
    files.sort();
    let mut zip = zip::ZipWriter::new(std::io::Cursor::new(Vec::new()));
    let options = zip::write::SimpleFileOptions::default()
        .compression_method(zip::CompressionMethod::Stored)
        .last_modified_time(zip::DateTime::default())
        .unix_permissions(0o644);
    // The list first, so the store (and a person) finds it at once.
    zip.start_file(MANIFEST, options).map_err(|e| e.to_string())?;
    zip.write_all(manifest.as_bytes()).map_err(|e| e.to_string())?;
    for (name, bytes) in files {
        zip.start_file(name, options).map_err(|e| e.to_string())?;
        zip.write_all(bytes).map_err(|e| e.to_string())?;
    }
    Ok(zip.finish().map_err(|e| e.to_string())?.into_inner())
}

/// Makes the store file of `id` at `version` in `publish` from `package`
/// and, for a plugin with code, the builds and the source made in
/// `parts` (the package is kept there too).
pub fn pack(publish: &Path, parts: &Path, id: &str, version: &str, package: &[u8], code: bool) -> Result<StoreFile, String> {
    let stem = format!("{id}-{version}");
    if !named(&format!("{stem}-store.zip"), "-store.zip") {
        return Err(format!("{stem}: not a plugin's id and version"));
    }
    std::fs::create_dir_all(parts).map_err(|e| e.to_string())?;
    std::fs::write(parts.join(format!("{stem}-upload.zip")), package).map_err(|e| format!("{stem}-upload.zip: {e}"))?;
    let mut builds = Vec::new();
    let mut source = None;
    if code {
        for device in READERS {
            if let Ok(bytes) = std::fs::read(parts.join(format!("{stem}-{device}.ppn"))) {
                builds.push((device, bytes));
            }
        }
        if builds.is_empty() {
            return Err("There is no build for a reader yet.".into());
        }
        source = Some(std::fs::read(parts.join(format!("{stem}-source.zip"))).map_err(|_| "The source ZIP is missing.".to_string())?);
    }
    let zip = store_zip(id, version, package, &builds, source.as_deref())?;
    std::fs::create_dir_all(publish).map_err(|e| e.to_string())?;
    let name = format!("{stem}-store.zip");
    let path = publish.join(&name);
    std::fs::write(&path, zip).map_err(|e| format!("{name}: {e}"))?;
    let mut said = vec!["package".to_string()];
    said.extend(builds.iter().map(|(d, _)| d.to_string()));
    if source.is_some() {
        said.push("source".into());
    }
    Ok(StoreFile { path: path.display().to_string(), name, parts: said })
}

/// Packs the store file of the project's plugin: the package the window
/// made (in base64) and, for a plugin with code, what `device_build` made.
#[tauri::command]
pub async fn publish_pack(project: String, id: String, version: String, base64: String, code: bool) -> Result<StoreFile, String> {
    let package = base64::engine::general_purpose::STANDARD.decode(base64).map_err(|e| e.to_string())?;
    tauri::async_runtime::spawn_blocking(move || {
        let root = paths::projects()?;
        pack(&folder(&root, &project)?, &parts(&root, &project)?, &id, &version, &package, code)
    })
    .await
    .map_err(|e| e.to_string())?
}

/// Opens the upload form in the person's browser and shows the store
/// file in its folder. Only a store file the workshop made is shown.
#[tauri::command]
pub async fn publish_show(app: tauri::AppHandle, path: String) -> Result<(), String> {
    let file = PathBuf::from(&path);
    let kept = file.parent().is_some_and(|dir| dir.ends_with(Path::new(".workshop").join("publish")))
        && file.starts_with(paths::projects()?)
        && file.file_name().and_then(|n| n.to_str()).is_some_and(|n| named(n, "-store.zip"));
    if !kept {
        return Err(format!("{path}: not a file the workshop made for the store"));
    }
    app.opener().open_url(SUBMIT, None::<&str>).map_err(|e| e.to_string())?;
    app.opener().reveal_item_in_dir(&file).map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Read;

    fn entries(zip: &[u8]) -> Vec<(String, Vec<u8>, zip::CompressionMethod)> {
        let mut archive = zip::ZipArchive::new(std::io::Cursor::new(zip)).unwrap();
        (0..archive.len())
            .map(|i| {
                let mut file = archive.by_index(i).unwrap();
                let mut bytes = Vec::new();
                file.read_to_end(&mut bytes).unwrap();
                (file.name().to_string(), bytes, file.compression())
            })
            .collect()
    }

    #[test]
    fn pack_makes_one_store_file_with_every_part_and_its_list() {
        let root = tempfile::tempdir().unwrap();
        let (publish, parts) = (root.path().join("publish"), root.path().join("publish").join("parts"));
        std::fs::create_dir_all(&parts).unwrap();
        std::fs::write(parts.join("snake-0.1.0-x4.ppn"), b"PPNP x4").unwrap();
        std::fs::write(parts.join("snake-0.1.0-source.zip"), b"PK source").unwrap();
        let made = pack(&publish, &parts, "snake", "0.1.0", b"PK package", true).unwrap();
        assert_eq!(made.name, "snake-0.1.0-store.zip");
        assert_eq!(made.parts, ["package", "x4", "source"]);
        assert_eq!(PathBuf::from(&made.path), publish.join("snake-0.1.0-store.zip"));
        // The folder the person sees holds the store file and the parts' folder.
        let mut seen: Vec<String> = std::fs::read_dir(&publish).unwrap().map(|e| e.unwrap().file_name().into_string().unwrap()).collect();
        seen.sort();
        assert_eq!(seen, ["parts", "snake-0.1.0-store.zip"]);

        let found = entries(&std::fs::read(&made.path).unwrap());
        let names: Vec<&str> = found.iter().map(|(n, _, _)| n.as_str()).collect();
        assert_eq!(names, [MANIFEST, "snake-0.1.0-source.zip", "snake-0.1.0-upload.zip", "snake-0.1.0-x4.ppn"]);
        assert!(found.iter().all(|(_, _, m)| *m == zip::CompressionMethod::Stored), "stored as they are");
        assert_eq!(found[2].1, b"PK package");
        assert_eq!(found[3].1, b"PPNP x4", "the build as it was signed");
        let manifest = String::from_utf8(found[0].1.clone()).unwrap();
        for line in [
            "[store-file]",
            "format = 1",
            "id = snake",
            "version = 0.1.0",
            "package = snake-0.1.0-upload.zip",
            "source = snake-0.1.0-source.zip",
            "[builds]",
            "x4 = snake-0.1.0-x4.ppn",
        ] {
            assert!(manifest.lines().any(|l| l == line), "{line} in\n{manifest}");
        }
        // The same parts make the same bytes.
        let again = pack(&publish, &parts, "snake", "0.1.0", b"PK package", true).unwrap();
        assert_eq!(std::fs::read(&again.path).unwrap(), std::fs::read(&made.path).unwrap());
    }

    #[test]
    fn a_plugin_without_code_packs_its_package_alone() {
        let root = tempfile::tempdir().unwrap();
        let (publish, parts) = (root.path().join("publish"), root.path().join("parts"));
        // A build of another time is not taken into a plugin without code.
        std::fs::create_dir_all(&parts).unwrap();
        std::fs::write(parts.join("calm-1.0.0-x4.ppn"), b"PPNP old").unwrap();
        let made = pack(&publish, &parts, "calm", "1.0.0", b"PK calm", false).unwrap();
        assert_eq!(made.parts, ["package"]);
        let found = entries(&std::fs::read(&made.path).unwrap());
        let names: Vec<&str> = found.iter().map(|(n, _, _)| n.as_str()).collect();
        assert_eq!(names, [MANIFEST, "calm-1.0.0-upload.zip"]);
        let manifest = String::from_utf8(found[0].1.clone()).unwrap();
        assert!(!manifest.contains("[builds]") && !manifest.contains("source ="));
    }

    #[test]
    fn what_cannot_be_packed_is_said() {
        let root = tempfile::tempdir().unwrap();
        let (publish, parts) = (root.path().join("publish"), root.path().join("parts"));
        assert!(pack(&publish, &parts, "clock", "1.0.0", b"PK", true).unwrap_err().contains("no build"));
        std::fs::write(parts.join("clock-1.0.0-x4.ppn"), b"PPNP").unwrap();
        assert!(pack(&publish, &parts, "clock", "1.0.0", b"PK", true).unwrap_err().contains("source"));
        for (id, version) in [("../x", "1.0.0"), ("Clock", "1.0.0"), ("a/b", "1.0.0")] {
            assert!(pack(&publish, &parts, id, version, b"PK", false).is_err(), "{id}");
        }
        assert!(store_zip("clock", "1.0.0", b"PK", &[("kindle", b"x".to_vec())], None).is_err());
    }
}
