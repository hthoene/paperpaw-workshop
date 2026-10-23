//! A project's history: how its plugin was after every answer of the AI
//! that changed it, and before the first, so the person can go back to
//! any of them ("Back to this state"). Going back is itself kept, so
//! nothing is lost and going forward again is the same step. Each
//! version packed for the store is marked with its number and date.
//!
//! It is a Git repository of the project's own, in `.workshop/history/`
//! (bare: the plugin's files stay where they are), through libgit2 built
//! into the app, so no Git is needed and the person never sees it as one.
//! Files with the same bytes are kept once, however often they recur.
//!
//! Kept: the plugin's files. Not kept: the workshop's own folder
//! (`.workshop/`: the conversation, the uploads, the packages), builds
//! (`target/`), another Git repository, and key files (`*.key`): the
//! author key never goes into a project's history.

use std::collections::BTreeMap;
use std::path::{Component, Path, PathBuf};

use git2::{ObjectType, Oid, Repository, Signature, TreeWalkMode, TreeWalkResult};
use serde::Serialize;

/// Where the history is kept in a project.
const HISTORY: &str = ".workshop/history";
/// The line of snapshots.
const LINE: &str = "refs/heads/history";

/// One state of the project as the window shows it.
#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct Snapshot {
    pub id: String,
    /// Seconds since 1970.
    pub time: i64,
    /// `start` (before the first change), `answer` (after an answer of
    /// the AI), `restore` (back to an earlier one), `import`, `publish`.
    pub kind: String,
    /// For an answer: how many messages the conversation had after it.
    pub at: Option<usize>,
    /// Which conversation, by how many came before it.
    pub conversation: Option<usize>,
    /// For a restore: the state it went back to.
    pub from: Option<String>,
    /// The versions packed for the store at this state.
    pub versions: Vec<Published>,
}

/// A version packed for the store, as marked.
#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct Published {
    pub version: String,
    /// As the window gave it (`2026-10-23`).
    pub date: String,
}

/// The project's history: the newest first, and which is the state now.
#[derive(Debug, Clone, Serialize, PartialEq, Default)]
pub struct History {
    pub current: Option<String>,
    pub snapshots: Vec<Snapshot>,
}

/// What a new snapshot records besides the files.
#[derive(Debug, Clone, Default)]
pub struct Note {
    pub kind: String,
    pub at: Option<usize>,
    pub conversation: Option<usize>,
    pub from: Option<String>,
}

fn err(e: impl std::fmt::Display) -> String {
    format!("the project's history: {e}")
}

/// Whether a path of the project is kept in its history.
pub fn kept(path: &str) -> bool {
    let first = path.split('/').next().unwrap_or("");
    !matches!(first, ".workshop" | "target" | ".git")
        && !path.ends_with(".key")
        && !path.ends_with(".partial")
}

/// The project's files the history keeps, by their paths, sorted.
pub fn files_of(dir: &Path) -> Result<Vec<(String, Vec<u8>)>, String> {
    let mut out = Vec::new();
    walk(dir, dir, &mut out).map_err(err)?;
    out.sort_by(|a, b| a.0.cmp(&b.0));
    Ok(out)
}

fn walk(base: &Path, dir: &Path, out: &mut Vec<(String, Vec<u8>)>) -> std::io::Result<()> {
    for entry in std::fs::read_dir(dir)? {
        let entry = entry?;
        let path = entry.path();
        let relative = path.strip_prefix(base).unwrap_or(&path);
        let parts: Vec<String> = relative
            .components()
            .map(|c| c.as_os_str().to_string_lossy().into_owned())
            .collect();
        let name = parts.join("/");
        if !kept(&name) {
            continue;
        }
        let kind = entry.file_type()?;
        if kind.is_dir() {
            walk(base, &path, out)?;
        } else if kind.is_file() {
            out.push((name, std::fs::read(&path)?));
        }
    }
    Ok(())
}

/// The history's repository, made the first time.
fn repository(dir: &Path) -> Result<Repository, String> {
    let at = dir.join(HISTORY);
    if at.join("HEAD").exists() {
        return Repository::open_bare(&at).map_err(err);
    }
    let repo = Repository::init_bare(&at).map_err(err)?;
    repo.set_head(LINE).map_err(err)?;
    Ok(repo)
}

fn signature() -> Result<Signature<'static>, String> {
    Signature::now("PaperPaw Workshop", "workshop@invalid").map_err(err)
}

/// The newest snapshot, if there is one.
fn head(repo: &Repository) -> Option<Oid> {
    repo.find_reference(LINE).ok().and_then(|r| r.target())
}

/// A tree of `files`, folders made as their paths say.
fn tree_of(repo: &Repository, files: &[(String, Vec<u8>)]) -> Result<Oid, String> {
    enum Node {
        File(Oid),
        Folder(BTreeMap<String, Node>),
    }
    fn write(repo: &Repository, folder: &BTreeMap<String, Node>) -> Result<Oid, git2::Error> {
        let mut builder = repo.treebuilder(None)?;
        for (name, node) in folder {
            match node {
                Node::File(id) => builder.insert(name, *id, 0o100644)?,
                Node::Folder(inner) => builder.insert(name, write(repo, inner)?, 0o040000)?,
            };
        }
        builder.write()
    }
    let mut top: BTreeMap<String, Node> = BTreeMap::new();
    for (path, bytes) in files {
        let id = repo.blob(bytes).map_err(err)?;
        let mut parts: Vec<&str> = path.split('/').collect();
        let file = parts.pop().unwrap_or_default().to_string();
        let mut folder = &mut top;
        for part in parts {
            let next = folder
                .entry(part.to_string())
                .or_insert_with(|| Node::Folder(BTreeMap::new()));
            folder = match next {
                Node::Folder(inner) => inner,
                Node::File(_) => {
                    return Err(err(format!("{path}: a file and a folder of one name")))
                }
            };
        }
        folder.insert(file, Node::File(id));
    }
    write(repo, &top).map_err(err)
}

fn message(note: &Note) -> String {
    let title = match note.kind.as_str() {
        "start" => "Before the first change",
        "answer" => "After an answer of the AI",
        "restore" => "Back to an earlier state",
        "import" => "Imported",
        "publish" => "Packed for the store",
        _ => "A state of the plugin",
    };
    let mut text = format!("{title}\n\nWorkshop-Kind: {}\n", note.kind);
    if let Some(at) = note.at {
        text.push_str(&format!("Workshop-At: {at}\n"));
    }
    if let Some(conversation) = note.conversation {
        text.push_str(&format!("Workshop-Conversation: {conversation}\n"));
    }
    if let Some(from) = &note.from {
        text.push_str(&format!("Workshop-From: {from}\n"));
    }
    text
}

fn note_of(message: &str) -> Note {
    let mut note = Note::default();
    for line in message.lines() {
        let Some((key, value)) = line.split_once(": ") else {
            continue;
        };
        match key {
            "Workshop-Kind" => note.kind = value.to_string(),
            "Workshop-At" => note.at = value.parse().ok(),
            "Workshop-Conversation" => note.conversation = value.parse().ok(),
            "Workshop-From" => note.from = Some(value.to_string()),
            _ => {}
        }
    }
    note
}

/// Keeps the project as it is now, if it differs from the newest
/// snapshot (or there is none); the history after.
pub fn snapshot(dir: &Path, note: &Note) -> Result<History, String> {
    let repo = repository(dir)?;
    let tree = tree_of(&repo, &files_of(dir)?)?;
    let parent = head(&repo).and_then(|id| repo.find_commit(id).ok());
    if parent.as_ref().is_none_or(|p| p.tree_id() != tree) {
        let tree = repo.find_tree(tree).map_err(err)?;
        let sig = signature()?;
        let parents: Vec<&git2::Commit> = parent.iter().collect();
        repo.commit(Some(LINE), &sig, &sig, &message(note), &tree, &parents)
            .map_err(err)?;
    }
    list(dir)
}

/// The first snapshot, before anything changes, if there is none yet.
pub fn begin(dir: &Path, note: &Note) -> Result<History, String> {
    let repo = repository(dir)?;
    if head(&repo).is_some() {
        return list(dir);
    }
    snapshot(dir, note)
}

/// The versions packed for the store, by the snapshot they mark.
fn versions(repo: &Repository) -> BTreeMap<Oid, Vec<Published>> {
    let mut out: BTreeMap<Oid, Vec<Published>> = BTreeMap::new();
    let Ok(names) = repo.tag_names(None) else {
        return out;
    };
    for name in names.iter().flatten() {
        let Ok(object) = repo.revparse_single(&format!("refs/tags/{name}")) else {
            continue;
        };
        let Ok(commit) = object.peel_to_commit() else {
            continue;
        };
        let date = object
            .as_tag()
            .and_then(|t| t.message())
            .and_then(|m| {
                m.split_once("published ")
                    .map(|(_, d)| d.trim().to_string())
            })
            .unwrap_or_default();
        out.entry(commit.id()).or_default().push(Published {
            version: name.to_string(),
            date,
        });
    }
    out
}

/// The history, the newest first.
pub fn list(dir: &Path) -> Result<History, String> {
    if !dir.join(HISTORY).join("HEAD").exists() {
        return Ok(History::default());
    }
    let repo = repository(dir)?;
    let mut tags = versions(&repo);
    let current = head(&repo);
    let mut snapshots = Vec::new();
    let mut next = current.and_then(|id| repo.find_commit(id).ok());
    while let Some(commit) = next {
        let note = note_of(commit.message().unwrap_or(""));
        snapshots.push(Snapshot {
            id: commit.id().to_string(),
            time: commit.time().seconds(),
            kind: note.kind,
            at: note.at,
            conversation: note.conversation,
            from: note.from,
            versions: tags.remove(&commit.id()).unwrap_or_default(),
        });
        next = commit.parent(0).ok();
    }
    Ok(History {
        current: current.map(|c| c.to_string()),
        snapshots,
    })
}

/// The files of snapshot `id`.
pub fn files_at(dir: &Path, id: &str) -> Result<Vec<(String, Vec<u8>)>, String> {
    let repo = repository(dir)?;
    let commit = repo
        .find_commit(Oid::from_str(id).map_err(err)?)
        .map_err(|_| err(format!("no state {id}")))?;
    let tree = commit.tree().map_err(err)?;
    let mut found: Vec<(String, Oid)> = Vec::new();
    tree.walk(TreeWalkMode::PreOrder, |folder, entry| {
        if entry.kind() == Some(ObjectType::Blob) {
            found.push((
                format!("{folder}{}", entry.name().unwrap_or("")),
                entry.id(),
            ));
        }
        TreeWalkResult::Ok
    })
    .map_err(err)?;
    found
        .into_iter()
        .map(|(path, id)| Ok((path, repo.find_blob(id).map_err(err)?.content().to_vec())))
        .collect()
}

/// A path of a snapshot as a path in the project, if it is a plain one.
fn inside(dir: &Path, path: &str) -> Option<PathBuf> {
    let relative = Path::new(path);
    let plain = !path.contains('\\')
        && relative
            .components()
            .all(|c| matches!(c, Component::Normal(_)));
    (plain && kept(path)).then(|| dir.join(relative))
}

/// Puts the project's files back as snapshot `id` has them (the files
/// it does not have taken away), and keeps that as a new snapshot.
pub fn restore(dir: &Path, id: &str) -> Result<History, String> {
    let wanted = files_at(dir, id)?;
    let keep: std::collections::BTreeSet<&str> = wanted.iter().map(|(p, _)| p.as_str()).collect();
    for (path, _) in files_of(dir)? {
        if keep.contains(path.as_str()) {
            continue;
        }
        let Some(file) = inside(dir, &path) else {
            continue;
        };
        std::fs::remove_file(&file).map_err(|e| err(format!("{path}: {e}")))?;
        let mut parent = file.parent();
        while let Some(p) = parent {
            if p == dir || std::fs::remove_dir(p).is_err() {
                break;
            }
            parent = p.parent();
        }
    }
    for (path, bytes) in &wanted {
        let Some(file) = inside(dir, path) else {
            continue;
        };
        if std::fs::read(&file).is_ok_and(|now| &now == bytes) {
            continue;
        }
        if let Some(parent) = file.parent() {
            std::fs::create_dir_all(parent).map_err(err)?;
        }
        let partial = file.with_extension("partial");
        std::fs::write(&partial, bytes).map_err(|e| err(format!("{path}: {e}")))?;
        std::fs::rename(&partial, &file).map_err(|e| err(format!("{path}: {e}")))?;
    }
    snapshot(
        dir,
        &Note {
            kind: "restore".into(),
            from: Some(id.to_string()),
            ..Note::default()
        },
    )
}

/// Marks the project as it is now as `version`, packed for the store on
/// `date`.
pub fn mark(dir: &Path, version: &str, date: &str) -> Result<History, String> {
    snapshot(
        dir,
        &Note {
            kind: "publish".into(),
            ..Note::default()
        },
    )?;
    let repo = repository(dir)?;
    let id = head(&repo).ok_or_else(|| err("nothing to mark"))?;
    let object = repo
        .find_object(id, Some(ObjectType::Commit))
        .map_err(err)?;
    repo.tag(
        version,
        &object,
        &signature()?,
        &format!("{version}, published {date}"),
        true,
    )
    .map_err(err)?;
    list(dir)
}

// ---- The commands, on a project of Documents/PaperPaw Workshop ----------

fn project_dir(project: &str) -> Result<PathBuf, String> {
    crate::projects::folder(&crate::paths::projects()?, project)
}

#[tauri::command]
pub async fn history_begin(
    project: String,
    at: usize,
    conversation: usize,
) -> Result<History, String> {
    let dir = project_dir(&project)?;
    tauri::async_runtime::spawn_blocking(move || {
        begin(
            &dir,
            &Note {
                kind: "start".into(),
                at: Some(at),
                conversation: Some(conversation),
                from: None,
            },
        )
    })
    .await
    .map_err(err)?
}

#[tauri::command]
pub async fn history_snapshot(
    project: String,
    kind: String,
    at: Option<usize>,
    conversation: Option<usize>,
) -> Result<History, String> {
    let dir = project_dir(&project)?;
    tauri::async_runtime::spawn_blocking(move || {
        snapshot(
            &dir,
            &Note {
                kind,
                at,
                conversation,
                from: None,
            },
        )
    })
    .await
    .map_err(err)?
}

#[tauri::command]
pub async fn history_list(project: String) -> Result<History, String> {
    let dir = project_dir(&project)?;
    tauri::async_runtime::spawn_blocking(move || list(&dir))
        .await
        .map_err(err)?
}

#[tauri::command]
pub async fn history_restore(project: String, id: String) -> Result<History, String> {
    let dir = project_dir(&project)?;
    tauri::async_runtime::spawn_blocking(move || restore(&dir, &id))
        .await
        .map_err(err)?
}

#[tauri::command]
pub async fn history_mark(
    project: String,
    version: String,
    date: String,
) -> Result<History, String> {
    let dir = project_dir(&project)?;
    tauri::async_runtime::spawn_blocking(move || mark(&dir, &version, &date))
        .await
        .map_err(err)?
}

/// Shows snapshot `id` on the reader beside the conversation, the
/// project left as it is; a plugin with code is built as it was first.
/// `emulator_sync` shows the project again.
#[tauri::command]
pub async fn history_preview(
    app: tauri::AppHandle,
    emulator: tauri::State<'_, crate::emulator::Emulator>,
    shown: tauri::State<'_, crate::emulator::Shown>,
    project: String,
    id: String,
) -> Result<(), String> {
    use tauri::Emitter;
    let dir = project_dir(&project)?;
    let ready = emulator.ready();
    let files =
        tauri::async_runtime::spawn_blocking(move || -> Result<Vec<(String, Vec<u8>)>, String> {
            let files = files_at(&dir, &id)?;
            let code = files.iter().any(|(p, _)| p == "Cargo.toml")
                && files.iter().any(|(p, _)| p == "plugin/plugin.ini");
            if !code {
                return Ok(files);
            }
            let ready = ready.ok_or("PaperPaw's emulator has not started yet.")?;
            let (version, target) = crate::toolchain::wanted(&ready.toolchain)?;
            crate::toolchain::can_link(&target)?;
            let told = |text: &str| {
                let _ = app.emit("build-progress", text.to_string());
            };
            let rust =
                crate::toolchain::ready(&crate::paths::app_data()?.join("rust"), &version, &told)?;
            told("Building the earlier state…");
            // Its own folder of builds, so the project's stays its own.
            let name = dir
                .file_name()
                .map(|n| n.to_string_lossy().into_owned())
                .unwrap_or_default();
            let builds = crate::paths::app_data()?
                .join("builds")
                .join(format!("{name}.earlier"));
            std::fs::create_dir_all(&builds).map_err(err)?;
            let (built, library) = crate::code::build(&builds, &files, &rust, &ready.paperpaw);
            let library = library.ok_or_else(|| {
                let why = built
                    .problems
                    .first()
                    .cloned()
                    .unwrap_or_else(|| "it did not build".into());
                format!("The earlier state could not be built for the reader: {why}")
            })?;
            let mut out: Vec<(String, Vec<u8>)> = files
                .into_iter()
                .filter_map(|(p, b)| p.strip_prefix("plugin/").map(|p| (p.to_string(), b)))
                .collect();
            out.push((
                crate::code::host_file(),
                std::fs::read(&library).map_err(err)?,
            ));
            Ok(out)
        })
        .await
        .map_err(err)??;
    let Some(plugin) = crate::emulator::plugin_id(&files) else {
        return Ok(());
    };
    let Some(profile) = shown.0.lock().map_err(|e| e.to_string())?.clone() else {
        return Ok(());
    };
    let library = crate::paths::emulator_library(&profile)?;
    crate::emulator::place_plugin(&library, &plugin, &files)?;
    emulator.reload()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn put(dir: &Path, path: &str, bytes: &[u8]) {
        let file = dir.join(path);
        std::fs::create_dir_all(file.parent().unwrap()).unwrap();
        std::fs::write(file, bytes).unwrap();
    }

    fn answer(at: usize) -> Note {
        Note {
            kind: "answer".into(),
            at: Some(at),
            conversation: Some(0),
            from: None,
        }
    }

    fn paths(dir: &Path) -> Vec<String> {
        files_of(dir).unwrap().into_iter().map(|(p, _)| p).collect()
    }

    /// The size of a folder's files, in bytes.
    fn size(dir: &Path) -> u64 {
        let mut total = 0;
        for entry in std::fs::read_dir(dir).unwrap().flatten() {
            let kind = entry.file_type().unwrap();
            total += if kind.is_dir() {
                size(&entry.path())
            } else {
                entry.metadata().unwrap().len()
            };
        }
        total
    }

    #[test]
    fn a_snapshot_keeps_the_plugin_and_leaves_the_rest() {
        let dir = tempfile::tempdir().unwrap();
        let dir = dir.path();
        put(dir, "plugin.ini", b"[plugin]\nid = clock\n");
        put(dir, "i18n/en.ini", b"[messages]\n");
        put(dir, ".workshop/conversation.json", b"[]");
        put(dir, ".workshop/uploads/cat.png", b"a picture");
        put(dir, ".workshop/publish/clock.zip", b"a package");
        put(dir, "target/debug/x", b"a build");
        put(dir, "paperpaw-author.key", &[b'a'; 64]);
        let history = begin(
            dir,
            &Note {
                kind: "start".into(),
                at: Some(0),
                conversation: Some(0),
                from: None,
            },
        )
        .unwrap();
        assert_eq!(history.snapshots.len(), 1);
        assert_eq!(history.snapshots[0].kind, "start");
        let id = history.current.clone().unwrap();
        let kept: Vec<String> = files_at(dir, &id)
            .unwrap()
            .into_iter()
            .map(|(p, _)| p)
            .collect();
        assert_eq!(kept, ["i18n/en.ini", "plugin.ini"]);
        // Begun once: a second begin keeps what is there.
        put(
            dir,
            "plugin.ini",
            b"[plugin]\nid = clock\nversion = 1.0.0\n",
        );
        assert_eq!(
            begin(
                dir,
                &Note {
                    kind: "start".into(),
                    ..Note::default()
                }
            )
            .unwrap()
            .snapshots
            .len(),
            1
        );
        // Unchanged, no new snapshot; changed, one.
        let after = snapshot(dir, &answer(4)).unwrap();
        assert_eq!(after.snapshots.len(), 2);
        assert_eq!(after.snapshots[0].kind, "answer");
        assert_eq!(after.snapshots[0].at, Some(4));
        assert_eq!(snapshot(dir, &answer(6)).unwrap().snapshots.len(), 2);
    }

    #[test]
    fn back_to_a_state_and_forward_again() {
        let dir = tempfile::tempdir().unwrap();
        let dir = dir.path();
        put(dir, "plugin.ini", b"one");
        let first = snapshot(dir, &answer(2)).unwrap().current.unwrap();
        put(dir, "plugin.ini", b"two");
        put(dir, "fonts/big.ttf", b"a font");
        put(dir, ".workshop/uploads/cat.png", b"a picture");
        let second = snapshot(dir, &answer(4)).unwrap().current.unwrap();
        // Back: the file as it was, the one added since gone, its empty
        // folder too; the uploads stay.
        let back = restore(dir, &first).unwrap();
        assert_eq!(std::fs::read(dir.join("plugin.ini")).unwrap(), b"one");
        assert_eq!(paths(dir), ["plugin.ini"]);
        assert!(!dir.join("fonts").exists());
        assert!(dir.join(".workshop/uploads/cat.png").exists());
        assert_eq!(back.snapshots.len(), 3, "going back is kept too");
        assert_eq!(back.snapshots[0].kind, "restore");
        assert_eq!(back.snapshots[0].from.as_deref(), Some(first.as_str()));
        // Forward again: the restore of a restore.
        let forward = restore(dir, &second).unwrap();
        assert_eq!(std::fs::read(dir.join("plugin.ini")).unwrap(), b"two");
        assert_eq!(paths(dir), ["fonts/big.ttf", "plugin.ini"]);
        assert_eq!(forward.snapshots.len(), 4);
        // And back to the restore itself, as any state.
        let restored = forward.snapshots[1].id.clone();
        restore(dir, &restored).unwrap();
        assert_eq!(paths(dir), ["plugin.ini"]);
        assert!(restore(dir, "0123").is_err());
    }

    #[test]
    fn versions_packed_for_the_store_are_marked() {
        let dir = tempfile::tempdir().unwrap();
        let dir = dir.path();
        put(dir, "plugin.ini", b"version = 1.0.0");
        snapshot(dir, &answer(2)).unwrap();
        let marked = mark(dir, "1.0.0", "2026-10-23").unwrap();
        assert_eq!(
            marked.snapshots.len(),
            1,
            "unchanged since the answer: that state is marked"
        );
        assert_eq!(
            marked.snapshots[0].versions,
            [Published {
                version: "1.0.0".into(),
                date: "2026-10-23".into()
            }]
        );
        put(dir, "plugin.ini", b"version = 1.1.0");
        let marked = mark(dir, "1.1.0", "2026-11-02").unwrap();
        assert_eq!(marked.snapshots.len(), 2);
        assert_eq!(marked.snapshots[0].kind, "publish");
        assert_eq!(marked.snapshots[0].versions[0].version, "1.1.0");
        assert_eq!(marked.snapshots[1].versions[0].version, "1.0.0");
        // A marked state can be gone back to like any.
        restore(dir, &marked.snapshots[1].id).unwrap();
        assert_eq!(
            std::fs::read(dir.join("plugin.ini")).unwrap(),
            b"version = 1.0.0"
        );
    }

    #[test]
    fn pictures_are_kept_once_however_often_the_plugin_changes() {
        let dir = tempfile::tempdir().unwrap();
        let dir = dir.path();
        // A picture that does not compress: what a PNG is.
        let mut noise = Vec::with_capacity(1 << 20);
        let mut x: u32 = 2463534242;
        for _ in 0..(1 << 20) {
            x ^= x << 13;
            x ^= x >> 17;
            x ^= x << 5;
            noise.push(x as u8);
        }
        put(dir, "pictures/sleep.png", &noise);
        put(dir, ".workshop/uploads/sleep-original.png", &noise);
        for turn in 0..20 {
            put(dir, "plugin.ini", format!("turn = {turn}").as_bytes());
            snapshot(dir, &answer(turn * 2)).unwrap();
        }
        assert_eq!(list(dir).unwrap().snapshots.len(), 20);
        let kept = size(&dir.join(HISTORY));
        assert!(
            kept < (1 << 20) + 300 * 1024,
            "the history holds the picture once: {kept} bytes"
        );
    }

    #[test]
    fn history_is_empty_until_begun() {
        let dir = tempfile::tempdir().unwrap();
        assert_eq!(list(dir.path()).unwrap(), History::default());
        assert!(!dir.path().join(HISTORY).exists());
    }
}
