//! Projects to another computer: one file (a ZIP) with everything of a
//! project, or of all of them, the archive's too: the plugin's files, the
//! person's pictures and files, the history with its marked versions, the
//! conversation and the project's settings. Never the author key, which
//! has a backup of its own, nor builds and packages, which are made again.
//!
//! Imported, each project comes back beside the ones there, under a name
//! of its own if one is taken: an import never overwrites.

use std::io::{Read, Write};
use std::path::{Component, Path, PathBuf};

use serde::{Deserialize, Serialize};

use crate::projects::{folder, unique, ARCHIVE};

/// What says a ZIP is the workshop's: at its top, with what is in it.
const MANIFEST: &str = "paperpaw-workshop.json";
/// The format of the file, raised when it changes.
const FORMAT: u32 = 1;
/// The most an import unpacks, in bytes and in files.
const MAX_BYTES: u64 = 4 << 30;
const MAX_FILES: usize = 200_000;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
struct Manifest {
    format: u32,
    /// Seconds since 1970.
    exported: u64,
    projects: Vec<Entry>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
struct Entry {
    /// Its folder's name where it was.
    folder: String,
    /// Whether it was in the archive.
    archived: bool,
}

impl Entry {
    /// Where its files are in the ZIP.
    fn prefix(&self) -> String {
        format!(
            "{}/{}/",
            if self.archived { "archive" } else { "projects" },
            self.folder
        )
    }
}

/// Whether a path of a project goes into an export: not builds, not the
/// packages for the store, never a key file.
fn exported(path: &str) -> bool {
    let first = path.split('/').next().unwrap_or("");
    first != "target"
        && !path.starts_with(".workshop/publish/")
        && !path.ends_with(".key")
        && !path.ends_with(".partial")
}

fn files(base: &Path, dir: &Path, out: &mut Vec<(String, PathBuf)>) -> std::io::Result<()> {
    for entry in std::fs::read_dir(dir)? {
        let entry = entry?;
        let path = entry.path();
        let relative = path.strip_prefix(base).unwrap_or(&path);
        let name = relative
            .components()
            .map(|c| c.as_os_str().to_string_lossy().into_owned())
            .collect::<Vec<_>>()
            .join("/");
        let kind = entry.file_type()?;
        if kind.is_dir() {
            if exported(&format!("{name}/")) {
                files(base, &path, out)?;
            }
        } else if kind.is_file() && exported(&name) {
            out.push((name, path));
        }
    }
    Ok(())
}

/// Every project of `root`, the archive's too: (folder, archived).
pub fn every(root: &Path) -> Result<Vec<(String, bool)>, String> {
    let mut out: Vec<(String, bool)> = crate::projects::list(root)?
        .into_iter()
        .map(|s| (s.folder, false))
        .collect();
    out.extend(
        crate::projects::list(&root.join(ARCHIVE))?
            .into_iter()
            .map(|s| (s.folder, true)),
    );
    out.sort();
    Ok(out)
}

/// Writes `projects` of `root` into one file at `to`; how many projects.
pub fn export(root: &Path, projects: &[(String, bool)], to: &Path) -> Result<usize, String> {
    let manifest = Manifest {
        format: FORMAT,
        exported: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_secs())
            .unwrap_or(0),
        projects: projects
            .iter()
            .map(|(folder, archived)| Entry {
                folder: folder.clone(),
                archived: *archived,
            })
            .collect(),
    };
    let partial = to.with_extension("partial");
    let file = std::fs::File::create(&partial).map_err(|e| format!("{}: {e}", to.display()))?;
    let mut zip = zip::ZipWriter::new(std::io::BufWriter::new(file));
    let deflated = zip::write::SimpleFileOptions::default()
        .compression_method(zip::CompressionMethod::Deflated)
        .large_file(true);
    // The history's objects are compressed already.
    let stored = zip::write::SimpleFileOptions::default()
        .compression_method(zip::CompressionMethod::Stored)
        .large_file(true);
    let fail = |e: &dyn std::fmt::Display| format!("{}: {e}", to.display());
    zip.start_file(MANIFEST, deflated).map_err(|e| fail(&e))?;
    zip.write_all(
        serde_json::to_string_pretty(&manifest)
            .map_err(|e| fail(&e))?
            .as_bytes(),
    )
    .map_err(|e| fail(&e))?;
    for entry in &manifest.projects {
        let dir = folder(
            &if entry.archived {
                root.join(ARCHIVE)
            } else {
                root.to_path_buf()
            },
            &entry.folder,
        )?;
        let mut found = Vec::new();
        files(&dir, &dir, &mut found).map_err(|e| format!("{}: {e}", entry.folder))?;
        found.sort();
        for (name, path) in found {
            let options = if name.starts_with(".workshop/history/objects/") {
                stored
            } else {
                deflated
            };
            zip.start_file(format!("{}{name}", entry.prefix()), options)
                .map_err(|e| fail(&e))?;
            let mut source = std::fs::File::open(&path).map_err(|e| format!("{name}: {e}"))?;
            std::io::copy(&mut source, &mut zip).map_err(|e| format!("{name}: {e}"))?;
        }
    }
    zip.finish()
        .map_err(|e| fail(&e))?
        .flush()
        .map_err(|e| fail(&e))?;
    std::fs::rename(&partial, to).map_err(|e| fail(&e))?;
    Ok(manifest.projects.len())
}

/// A path in the ZIP as a path below `dir`, if it is a plain one.
fn below(dir: &Path, path: &str) -> Option<PathBuf> {
    let relative = Path::new(path);
    let plain = !path.is_empty()
        && !path.contains('\\')
        && relative
            .components()
            .all(|c| matches!(c, Component::Normal(_)));
    plain.then(|| dir.join(relative))
}

/// Brings the projects of the file at `from` into `root`, each beside
/// those there; their folders, (name, archived). `None` if the file is
/// not one the workshop exported (a plugin's ZIP, say).
pub fn import(root: &Path, from: &Path) -> Result<Option<Vec<(String, bool)>>, String> {
    let file = std::fs::File::open(from).map_err(|e| format!("{}: {e}", from.display()))?;
    let Ok(mut zip) = zip::ZipArchive::new(std::io::BufReader::new(file)) else {
        return Ok(None);
    };
    let manifest: Manifest = {
        let Ok(entry) = zip.by_name(MANIFEST) else {
            return Ok(None);
        };
        let mut text = String::new();
        entry
            .take(1 << 20)
            .read_to_string(&mut text)
            .map_err(|e| e.to_string())?;
        serde_json::from_str(&text)
            .map_err(|_| "This export of the workshop cannot be read.".to_string())?
    };
    if manifest.format > FORMAT {
        return Err(
            "This export is from a newer workshop. Update the workshop, then import it again."
                .into(),
        );
    }
    if zip.len() > MAX_FILES {
        return Err(format!("It holds more than {MAX_FILES} files."));
    }
    let mut total = 0u64;
    let mut made = Vec::new();
    for project in &manifest.projects {
        let shelf = if project.archived {
            root.join(ARCHIVE)
        } else {
            root.to_path_buf()
        };
        folder(&shelf, &project.folder)?;
        std::fs::create_dir_all(&shelf).map_err(|e| e.to_string())?;
        let name = unique(&shelf, &project.folder);
        let dir = shelf.join(&name);
        std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
        let prefix = project.prefix();
        for i in 0..zip.len() {
            let mut entry = zip.by_index(i).map_err(|e| e.to_string())?;
            let Some(path) = entry.name().strip_prefix(&prefix).map(str::to_string) else {
                continue;
            };
            if entry.is_dir() || !exported(&path) {
                continue;
            }
            let Some(file) = below(&dir, &path) else {
                continue;
            };
            total += entry.size();
            if total > MAX_BYTES {
                return Err(format!("It holds more than {} GB.", MAX_BYTES >> 30));
            }
            if let Some(parent) = file.parent() {
                std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
            }
            let mut out = std::fs::File::create(&file).map_err(|e| format!("{path}: {e}"))?;
            std::io::copy(&mut entry, &mut out).map_err(|e| format!("{path}: {e}"))?;
        }
        made.push((name, project.archived));
    }
    Ok(Some(made))
}

// ---- The commands, on Documents/PaperPaw Workshop -----------------------

/// Exports `projects` (none named: all of them, the archive's too) to
/// `path`; how many.
#[tauri::command]
pub async fn projects_export(projects: Vec<String>, path: String) -> Result<usize, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let root = crate::paths::projects()?;
        let chosen = if projects.is_empty() {
            every(&root)?
        } else {
            projects.into_iter().map(|p| (p, false)).collect()
        };
        export(&root, &chosen, Path::new(&path))
    })
    .await
    .map_err(|e| e.to_string())?
}

/// Imports the workshop's export at `path`: the folders made, the
/// archived ones apart; `None` if it is not one (then it may be a plugin).
#[tauri::command]
pub async fn projects_import(path: String) -> Result<Option<Vec<(String, bool)>>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        import(&crate::paths::projects()?, Path::new(&path))
    })
    .await
    .map_err(|e| e.to_string())?
}

/// A plugin's ZIP the person chose, in base64, for the window's import.
#[tauri::command]
pub fn import_read(path: String) -> Result<String, String> {
    use base64::Engine;
    let size = std::fs::metadata(&path)
        .map_err(|e| format!("{path}: {e}"))?
        .len();
    if size > 50 * 1024 * 1024 {
        return Err("The ZIP is larger than 50 MB.".into());
    }
    let bytes = std::fs::read(&path).map_err(|e| format!("{path}: {e}"))?;
    Ok(base64::engine::general_purpose::STANDARD.encode(bytes))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::history::{self, Note};

    fn put(dir: &Path, path: &str, bytes: &[u8]) {
        let file = dir.join(path);
        std::fs::create_dir_all(file.parent().unwrap()).unwrap();
        std::fs::write(file, bytes).unwrap();
    }

    fn all(dir: &Path) -> Vec<(String, Vec<u8>)> {
        let mut out = Vec::new();
        files(dir, dir, &mut out).unwrap();
        let mut read: Vec<(String, Vec<u8>)> = out
            .into_iter()
            .map(|(n, p)| (n, std::fs::read(p).unwrap()))
            .collect();
        read.sort();
        read
    }

    /// A project as the workshop keeps one, with a history of three states
    /// and a marked version.
    fn made(root: &Path, name: &str) -> PathBuf {
        let folder =
            crate::projects::create(root, name, r#"{"kind":"data","model":"haiku"}"#).unwrap();
        let dir = root.join(folder);
        put(
            &dir,
            ".workshop/conversation.json",
            br#"{"messages":[{"role":"user","content":"a clock"}]}"#,
        );
        put(&dir, ".workshop/uploads/cat.png", b"the person's picture");
        put(&dir, "plugin.ini", b"version = 1.0.0");
        history::begin(
            &dir,
            &Note {
                kind: "start".into(),
                at: Some(0),
                conversation: Some(0),
                from: None,
            },
        )
        .unwrap();
        put(&dir, "home.ini", b"[home]");
        history::snapshot(
            &dir,
            &Note {
                kind: "answer".into(),
                at: Some(2),
                conversation: Some(0),
                from: None,
            },
        )
        .unwrap();
        history::mark(&dir, "1.0.0", "2026-10-23").unwrap();
        put(&dir, "plugin.ini", b"version = 1.1.0");
        history::snapshot(
            &dir,
            &Note {
                kind: "answer".into(),
                at: Some(4),
                conversation: Some(0),
                from: None,
            },
        )
        .unwrap();
        put(&dir, ".workshop/publish/clock.zip", b"a package");
        put(&dir, "target/release/x", b"a build");
        put(&dir, "paperpaw-author.key", &[b'f'; 64]);
        dir
    }

    #[test]
    fn a_project_moves_to_a_clean_workspace_whole() {
        let here = tempfile::tempdir().unwrap();
        let there = tempfile::tempdir().unwrap();
        let dir = made(here.path(), "Clock");
        let file = here.path().join("Clock (PaperPaw Workshop).zip");
        assert_eq!(
            export(here.path(), &[("Clock".into(), false)], &file).unwrap(),
            1
        );
        let imported = import(there.path(), &file).unwrap().unwrap();
        assert_eq!(imported, [("Clock".to_string(), false)]);
        let moved = there.path().join("Clock");
        // The same history, the same marked versions, the same files.
        assert_eq!(history::list(&moved).unwrap(), history::list(&dir).unwrap());
        assert_eq!(
            history::list(&moved).unwrap().snapshots[1].versions[0].version,
            "1.0.0"
        );
        let names: Vec<String> = all(&moved)
            .into_iter()
            .map(|(n, _)| n)
            .filter(|n| !n.starts_with(".workshop/history/"))
            .collect();
        assert_eq!(
            names,
            [
                ".workshop/conversation.json",
                ".workshop/project.json",
                ".workshop/uploads/cat.png",
                "home.ini",
                "plugin.ini"
            ]
        );
        assert_eq!(
            std::fs::read(moved.join(".workshop/project.json")).unwrap(),
            std::fs::read(dir.join(".workshop/project.json")).unwrap()
        );
        // Never the key, nor builds or packages.
        assert!(!moved.join("paperpaw-author.key").exists());
        assert!(!moved.join("target").exists() && !moved.join(".workshop/publish").exists());
        // Its history works there: back to the marked version.
        let marked = history::list(&moved).unwrap().snapshots[1].id.clone();
        history::restore(&moved, &marked).unwrap();
        assert_eq!(
            std::fs::read(moved.join("plugin.ini")).unwrap(),
            b"version = 1.0.0"
        );
    }

    #[test]
    fn all_projects_move_the_archive_too_and_nothing_is_overwritten() {
        let here = tempfile::tempdir().unwrap();
        let root = here.path();
        made(root, "Clock");
        made(root, "Calm");
        crate::projects::archive(root, "Calm").unwrap();
        let file = root.join("all.zip");
        let everything = every(root).unwrap();
        assert_eq!(
            everything,
            [("Calm".to_string(), true), ("Clock".to_string(), false)]
        );
        assert_eq!(export(root, &everything, &file).unwrap(), 2);
        // Into the same workspace: beside the ones there, under new names.
        let back = import(root, &file).unwrap().unwrap();
        assert_eq!(
            back,
            [("Calm 2".to_string(), true), ("Clock 2".to_string(), false)]
        );
        assert_eq!(
            std::fs::read(root.join("Clock/plugin.ini")).unwrap(),
            b"version = 1.1.0"
        );
        assert_eq!(
            history::list(&root.join("Clock 2")).unwrap(),
            history::list(&root.join("Clock")).unwrap()
        );
        assert!(root
            .join(ARCHIVE)
            .join("Calm 2/.workshop/history/HEAD")
            .exists());
    }

    #[test]
    fn a_plugin_s_zip_is_not_an_export_and_paths_stay_inside() {
        let here = tempfile::tempdir().unwrap();
        let root = here.path();
        let plugin = root.join("plugin.zip");
        let mut zip = zip::ZipWriter::new(std::fs::File::create(&plugin).unwrap());
        zip.start_file("clock/plugin.ini", zip::write::SimpleFileOptions::default())
            .unwrap();
        zip.write_all(b"[plugin]").unwrap();
        zip.finish().unwrap();
        assert_eq!(import(root, &plugin).unwrap(), None);
        // An export with a path that would leave the project.
        let bad = root.join("bad.zip");
        let mut zip = zip::ZipWriter::new(std::fs::File::create(&bad).unwrap());
        let manifest = Manifest {
            format: 1,
            exported: 0,
            projects: vec![Entry {
                folder: "X".into(),
                archived: false,
            }],
        };
        zip.start_file(MANIFEST, zip::write::SimpleFileOptions::default())
            .unwrap();
        zip.write_all(serde_json::to_string(&manifest).unwrap().as_bytes())
            .unwrap();
        zip.start_file(
            "projects/X/../../escaped.txt",
            zip::write::SimpleFileOptions::default(),
        )
        .unwrap();
        zip.write_all(b"out").unwrap();
        zip.start_file(
            "projects/X/paperpaw-author.key",
            zip::write::SimpleFileOptions::default(),
        )
        .unwrap();
        zip.write_all(b"a key").unwrap();
        zip.finish().unwrap();
        let into = root.join("workspace");
        assert_eq!(
            import(&into, &bad).unwrap().unwrap(),
            [("X".to_string(), false)]
        );
        assert!(!root.join("escaped.txt").exists() && !into.join("escaped.txt").exists());
        assert!(!into.join("X/paperpaw-author.key").exists());
        // A newer format is said, not guessed.
        let newer = root.join("newer.zip");
        let mut zip = zip::ZipWriter::new(std::fs::File::create(&newer).unwrap());
        zip.start_file(MANIFEST, zip::write::SimpleFileOptions::default())
            .unwrap();
        zip.write_all(br#"{"format":9,"exported":0,"projects":[]}"#)
            .unwrap();
        zip.finish().unwrap();
        assert!(import(&into, &newer)
            .unwrap_err()
            .contains("newer workshop"));
    }
}
