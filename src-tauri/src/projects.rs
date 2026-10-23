//! Projects as plain folders the person can see, back up and edit:
//! Documents/PaperPaw Workshop/<folder>/, the plugin's own files right in
//! it, and the workshop's in `.workshop/`: `project.json` (what kind, the
//! model, what it cost), `conversation.json` (the conversation, as the API
//! has it) and `uploads/` (the files dropped into the drawer). No database.
//!
//! Every path the window names is checked to stay inside its project:
//! relative, `/` between parts, no `..`, nothing into `.workshop/` through
//! the plugin's file calls.

use std::path::{Component, Path, PathBuf};

use base64::Engine;
use serde::Serialize;

/// The workshop's own folder in a project.
const WORKSHOP: &str = ".workshop";
const PROJECT_JSON: &str = "project.json";
const CONVERSATION_JSON: &str = "conversation.json";
const UPLOADS: &str = "uploads";

/// A project as the list shows it.
#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct Summary {
    pub folder: String,
    /// `project.json` as kept, for the window to read its name and kind.
    pub meta: String,
}

/// A file of a project: where, how big, and its bytes in base64 when asked.
#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct FileEntry {
    pub path: String,
    pub size: u64,
}

fn b64() -> base64::engine::GeneralPurpose {
    base64::engine::general_purpose::STANDARD
}

/// `name` as a folder name of the root: one part, nothing hidden.
fn folder(root: &Path, name: &str) -> Result<PathBuf, String> {
    if name.is_empty()
        || name.starts_with('.')
        || name.contains(['/', '\\', ':'])
        || name.len() > 80
    {
        return Err(format!("not a project: {name}"));
    }
    Ok(root.join(name))
}

/// `path` inside `project`, if it is a plain relative path; `workshop`
/// says whether `.workshop/` may be named (only by the workshop's own
/// calls).
fn inside(project: &Path, path: &str, workshop: bool) -> Result<PathBuf, String> {
    let relative = Path::new(path);
    let plain = !path.is_empty()
        && !path.contains('\\')
        && relative.components().all(|c| matches!(c, Component::Normal(_)));
    let hidden = relative
        .components()
        .next()
        .is_some_and(|c| c.as_os_str() == WORKSHOP);
    if !plain || (hidden && !workshop) {
        return Err(format!("not a path of the plugin: {path}"));
    }
    Ok(project.join(relative))
}

/// The projects in `root`, the last changed first.
pub fn list(root: &Path) -> Result<Vec<Summary>, String> {
    let Ok(entries) = std::fs::read_dir(root) else {
        return Ok(Vec::new());
    };
    let mut found: Vec<(std::time::SystemTime, Summary)> = Vec::new();
    for entry in entries.flatten() {
        let meta = entry.path().join(WORKSHOP).join(PROJECT_JSON);
        let Ok(text) = std::fs::read_to_string(&meta) else { continue };
        let changed = std::fs::metadata(&meta)
            .and_then(|m| m.modified())
            .unwrap_or(std::time::UNIX_EPOCH);
        found.push((changed, Summary { folder: entry.file_name().to_string_lossy().into_owned(), meta: text }));
    }
    found.sort_by(|a, b| b.0.cmp(&a.0));
    Ok(found.into_iter().map(|(_, s)| s).collect())
}

/// A new project's folder, named after `name` (made unique), with its
/// `project.json`; its folder name.
pub fn create(root: &Path, name: &str, meta: &str) -> Result<String, String> {
    let base: String = name
        .chars()
        .map(|c| if c.is_alphanumeric() || c == ' ' || c == '-' { c } else { '-' })
        .collect::<String>()
        .trim()
        .chars()
        .take(60)
        .collect();
    let base = if base.is_empty() { "New plugin".to_string() } else { base };
    std::fs::create_dir_all(root).map_err(|e| e.to_string())?;
    let mut name = base.clone();
    let mut n = 2;
    while root.join(&name).exists() {
        name = format!("{base} {n}");
        n += 1;
    }
    let dir = folder(root, &name)?;
    std::fs::create_dir_all(dir.join(WORKSHOP).join(UPLOADS)).map_err(|e| e.to_string())?;
    std::fs::write(dir.join(WORKSHOP).join(PROJECT_JSON), meta).map_err(|e| e.to_string())?;
    Ok(name)
}

/// The plugin's files of the project (not the workshop's own), sorted.
pub fn files(root: &Path, project: &str) -> Result<Vec<FileEntry>, String> {
    let dir = folder(root, project)?;
    let mut out = Vec::new();
    walk(&dir, &dir, &mut out).map_err(|e| e.to_string())?;
    out.sort_by(|a, b| a.path.cmp(&b.path));
    Ok(out)
}

fn walk(base: &Path, dir: &Path, out: &mut Vec<FileEntry>) -> std::io::Result<()> {
    for entry in std::fs::read_dir(dir)? {
        let entry = entry?;
        let path = entry.path();
        let name = entry.file_name();
        if dir == base && name == WORKSHOP {
            continue;
        }
        let kind = entry.file_type()?;
        if kind.is_dir() {
            walk(base, &path, out)?;
        } else if kind.is_file() {
            let relative = path.strip_prefix(base).unwrap_or(&path);
            let parts: Vec<String> = relative.components().map(|c| c.as_os_str().to_string_lossy().into_owned()).collect();
            out.push(FileEntry { path: parts.join("/"), size: entry.metadata()?.len() });
        }
    }
    Ok(())
}

/// A file of the project, in base64 (`workshop`: the workshop's own may be
/// read, e.g. `.workshop/uploads/<name>`).
pub fn read(root: &Path, project: &str, path: &str, workshop: bool) -> Result<String, String> {
    let file = inside(&folder(root, project)?, path, workshop)?;
    std::fs::read(&file).map(|bytes| b64().encode(bytes)).map_err(|e| format!("{path}: {e}"))
}

/// Writes a file of the project from base64, its folders made as needed.
pub fn write(root: &Path, project: &str, path: &str, base64: &str, workshop: bool) -> Result<(), String> {
    let file = inside(&folder(root, project)?, path, workshop)?;
    let bytes = b64().decode(base64).map_err(|e| e.to_string())?;
    if let Some(parent) = file.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    // Beside it first, then in its place: a cut never leaves half a file.
    let partial = file.with_extension("partial");
    std::fs::write(&partial, bytes).map_err(|e| format!("{path}: {e}"))?;
    std::fs::rename(&partial, &file).map_err(|e| format!("{path}: {e}"))
}

/// Removes a file of the project, and folders it leaves empty.
pub fn remove(root: &Path, project: &str, path: &str, workshop: bool) -> Result<(), String> {
    let dir = folder(root, project)?;
    let file = inside(&dir, path, workshop)?;
    match std::fs::remove_file(&file) {
        Ok(()) => {}
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(()),
        Err(e) => return Err(format!("{path}: {e}")),
    }
    let mut parent = file.parent();
    while let Some(p) = parent {
        if p == dir || std::fs::remove_dir(p).is_err() {
            break;
        }
        parent = p.parent();
    }
    Ok(())
}

/// The workshop's own record of the project: `project.json` and
/// `conversation.json` (missing: empty).
pub fn load_record(root: &Path, project: &str) -> Result<(String, String), String> {
    let dir = folder(root, project)?.join(WORKSHOP);
    let meta = std::fs::read_to_string(dir.join(PROJECT_JSON)).map_err(|e| format!("{project}: {e}"))?;
    let conversation = std::fs::read_to_string(dir.join(CONVERSATION_JSON)).unwrap_or_default();
    Ok((meta, conversation))
}

/// Keeps the record, each file whole or not at all.
pub fn save_record(root: &Path, project: &str, meta: &str, conversation: &str) -> Result<(), String> {
    let enc = |s: &str| b64().encode(s.as_bytes());
    write(root, project, &format!("{WORKSHOP}/{PROJECT_JSON}"), &enc(meta), true)?;
    write(root, project, &format!("{WORKSHOP}/{CONVERSATION_JSON}"), &enc(conversation), true)
}

// ---- The commands, on Documents/PaperPaw Workshop -----------------------

fn root() -> Result<PathBuf, String> {
    crate::paths::projects()
}

#[tauri::command]
pub fn projects_list() -> Result<Vec<Summary>, String> {
    list(&root()?)
}

#[tauri::command]
pub fn project_create(name: String, meta: String) -> Result<String, String> {
    create(&root()?, &name, &meta)
}

#[tauri::command]
pub fn project_files(project: String) -> Result<Vec<FileEntry>, String> {
    files(&root()?, &project)
}

#[tauri::command]
pub fn project_read(project: String, path: String) -> Result<String, String> {
    read(&root()?, &project, &path, false)
}

#[tauri::command]
pub fn project_write(project: String, path: String, base64: String) -> Result<(), String> {
    write(&root()?, &project, &path, &base64, false)
}

#[tauri::command]
pub fn project_remove(project: String, path: String) -> Result<(), String> {
    remove(&root()?, &project, &path, false)
}

#[tauri::command]
pub fn project_load(project: String) -> Result<(String, String), String> {
    load_record(&root()?, &project)
}

#[tauri::command]
pub fn project_save(project: String, meta: String, conversation: String) -> Result<(), String> {
    save_record(&root()?, &project, &meta, &conversation)
}

/// The files dropped into the drawer: names and sizes only.
#[tauri::command]
pub fn uploads_list(project: String) -> Result<Vec<FileEntry>, String> {
    let dir = folder(&root()?, &project)?.join(WORKSHOP).join(UPLOADS);
    let mut out = Vec::new();
    if dir.exists() {
        walk(&dir, &dir, &mut out).map_err(|e| e.to_string())?;
    }
    out.sort_by(|a, b| a.path.cmp(&b.path));
    Ok(out)
}

#[tauri::command]
pub fn upload_read(project: String, name: String) -> Result<String, String> {
    read(&root()?, &project, &upload_path(&name)?, true)
}

#[tauri::command]
pub fn upload_write(project: String, name: String, base64: String) -> Result<(), String> {
    write(&root()?, &project, &upload_path(&name)?, &base64, true)
}

#[tauri::command]
pub fn upload_remove(project: String, name: String) -> Result<(), String> {
    remove(&root()?, &project, &upload_path(&name)?, true)
}

/// An upload's path in the project: one name, no folders.
fn upload_path(name: &str) -> Result<String, String> {
    if name.is_empty() || name.contains(['/', '\\']) || name.starts_with('.') {
        return Err(format!("not a file name: {name}"));
    }
    Ok(format!("{WORKSHOP}/{UPLOADS}/{name}"))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn enc(s: &str) -> String {
        b64().encode(s)
    }

    #[test]
    fn a_project_is_a_folder_with_its_files_and_a_record() {
        let root = tempfile::tempdir().unwrap();
        let root = root.path();
        let name = create(root, "Night owl", r#"{"kind":"data"}"#).unwrap();
        assert_eq!(name, "Night owl");
        write(root, &name, "plugin.ini", &enc("[plugin]\nid = night-owl\n"), false).unwrap();
        write(root, &name, "i18n/en.ini", &enc("[meta]\n"), false).unwrap();
        let listed = files(root, &name).unwrap();
        assert_eq!(listed.iter().map(|f| f.path.as_str()).collect::<Vec<_>>(), ["i18n/en.ini", "plugin.ini"]);
        assert_eq!(read(root, &name, "plugin.ini", false).unwrap(), enc("[plugin]\nid = night-owl\n"));
        // The plugin's own files are plain files in the folder.
        assert!(root.join("Night owl/i18n/en.ini").is_file());
        save_record(root, &name, r#"{"kind":"data","usage":1}"#, "[]").unwrap();
        assert_eq!(load_record(root, &name).unwrap(), (r#"{"kind":"data","usage":1}"#.into(), "[]".into()));
        let projects = list(root).unwrap();
        assert_eq!(projects.len(), 1);
        assert_eq!(projects[0].folder, "Night owl");
    }

    #[test]
    fn names_are_made_unique_and_plain() {
        let root = tempfile::tempdir().unwrap();
        let root = root.path();
        assert_eq!(create(root, "Clock", "{}").unwrap(), "Clock");
        assert_eq!(create(root, "Clock", "{}").unwrap(), "Clock 2");
        assert_eq!(create(root, "a/b:c", "{}").unwrap(), "a-b-c");
        assert_eq!(create(root, "", "{}").unwrap(), "New plugin");
    }

    #[test]
    fn nothing_is_read_or_written_outside_the_project() {
        let root = tempfile::tempdir().unwrap();
        let root = root.path();
        let name = create(root, "P", "{}").unwrap();
        for bad in ["../x", "/etc/passwd", "C:/x", "a/../../x", "a\\b", "", ".workshop/project.json"] {
            assert!(write(root, &name, bad, &enc("x"), false).is_err(), "{bad}");
            assert!(read(root, &name, bad, false).is_err(), "{bad}");
        }
        assert!(files(root, "../P").is_err());
        assert!(upload_path("../x").is_err());
        assert!(upload_path("a/b.png").is_err());
        // The workshop's record is not one of the plugin's files.
        assert!(files(root, &name).unwrap().is_empty());
    }

    #[test]
    fn removing_a_file_takes_its_empty_folders_too() {
        let root = tempfile::tempdir().unwrap();
        let root = root.path();
        let name = create(root, "P", "{}").unwrap();
        write(root, &name, "fonts/a/b.ttf", &enc("x"), false).unwrap();
        remove(root, &name, "fonts/a/b.ttf", false).unwrap();
        assert!(!root.join("P/fonts").exists());
        assert!(remove(root, &name, "missing.ini", false).is_ok());
    }
}
