//! The plugin checked as PaperPaw checks plugins before they are
//! published: `paperpaw-emu --check`, which runs the release's
//! paperpaw-dev on the project's folder (its `.workshop/` is hidden, so
//! not looked at). Its files (package), its texts and settings (lint),
//! what it draws on every reader the workshop shows in each of its
//! languages (visual: text cut or overflowing, parts overlapping or
//! outside their cell, uneven margins, focus not shown, touch targets too
//! small, contrast), whether every screen is reached and left with buttons
//! alone (reach). What is to fix about the plugin goes to the model and
//! is counted in the window; measurements and the app's own findings not.

use std::path::Path;
use std::process::Command;

use serde::Serialize;
use serde_json::Value;

/// One thing to fix, said shortly: what the model reads and the window
/// counts. The same finding in several variants is one, with all of them.
#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct Found {
    /// `visual.text-cut`, `lint.missing-translation`, ...
    pub check: String,
    /// `error` or `warning`.
    pub level: String,
    /// A screen, a widget and its size, a file, a key.
    pub place: String,
    pub message: String,
    /// Where it was seen: `xteink-x4 de light default`, ...
    pub seen: Vec<String>,
}

/// The languages the plugin is checked in: English, and each it has a
/// catalog for (`i18n/<lang>.ini`).
pub fn languages(files: &[(String, Vec<u8>)]) -> Vec<String> {
    let mut found = vec!["en".to_string()];
    for (path, _) in files {
        let Some(lang) = path.strip_prefix("i18n/").and_then(|p| p.strip_suffix(".ini")) else { continue };
        let plain = !lang.is_empty() && lang.chars().all(|c| c.is_ascii_alphanumeric() || c == '-');
        if plain && !found.iter().any(|l| l == lang) {
            found.push(lang.to_string());
        }
    }
    found
}

/// The arguments of `paperpaw-emu --check` for `folder` on the readers
/// `on` in `languages`, light, the default look.
pub fn arguments(folder: &Path, on: &[&str], languages: &[String]) -> Vec<String> {
    let mut args = vec!["--check".to_string(), folder.to_string_lossy().into_owned()];
    for profile in on {
        args.extend(["--profile".to_string(), (*profile).to_string()]);
    }
    for language in languages {
        args.extend(["--language".to_string(), language.clone()]);
    }
    args.extend(["--light", "--theme", "default"].map(String::from));
    args
}

/// What is to fix in a `report.json`: errors and warnings about the plugin
/// `id` (or about no plugin in particular), the worst first as the report
/// has them.
pub fn findings(report: &str, id: Option<&str>) -> Result<Vec<Found>, String> {
    let report: Value = serde_json::from_str(report).map_err(|e| format!("the checks' report: {e}"))?;
    let text = |f: &Value, key: &str| f[key].as_str().unwrap_or_default().to_string();
    Ok(report["findings"]
        .as_array()
        .into_iter()
        .flatten()
        .filter(|f| matches!(f["level"].as_str(), Some("error" | "warning")))
        .filter(|f| match (f["plugin"].as_str(), id) {
            (None, _) | (_, None) => true,
            (Some(theirs), Some(id)) => theirs == id,
        })
        .map(|f| Found {
            check: text(f, "check"),
            level: text(f, "level"),
            place: text(f, "place"),
            message: text(f, "message"),
            seen: f["variants"]
                .as_array()
                .map(|v| v.iter().filter_map(|s| s.as_str().map(String::from)).collect())
                .unwrap_or_default(),
        })
        .collect())
}

/// Checks the plugin in `folder` with the emulator `program` on the
/// readers `on`: what is to fix.
pub fn check(program: &Path, folder: &Path, on: &[&str], files: &[(String, Vec<u8>)]) -> Result<Vec<Found>, String> {
    if !files.iter().any(|(path, _)| path == "plugin.ini") {
        return Err("the plugin has no plugin.ini yet".into());
    }
    let mut command = Command::new(program);
    command.args(arguments(folder, on, &languages(files)));
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        command.creation_flags(0x0800_0000);
    }
    let ran = command.output().map_err(|e| format!("{}: {e}", program.display()))?;
    // 0: passed, 1: findings, 2: it could not check.
    if ran.status.code() == Some(2) || ran.stdout.is_empty() {
        let said = String::from_utf8_lossy(&ran.stderr);
        let last = said.lines().rev().find(|l| !l.trim().is_empty()).unwrap_or("no report");
        return Err(format!("PaperPaw's checks could not run: {last}"));
    }
    findings(&String::from_utf8_lossy(&ran.stdout), crate::emulator::plugin_id(files).as_deref())
}

/// The project's plugin checked on the readers the workshop shows, in
/// its languages: what is to fix. Off the window's thread; a check takes
/// some seconds.
#[tauri::command]
pub async fn plugin_check(project: String) -> Result<Vec<Found>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let root = crate::paths::projects()?;
        let files = crate::projects::plugin_files(&root, &project)?;
        let folder = crate::projects::folder(&root, &project)?;
        check(&crate::paths::emulator_program()?, &folder, &crate::emulator::PROFILES, &files)
    })
    .await
    .map_err(|e| e.to_string())?
}

#[cfg(test)]
mod tests {
    use super::*;

    fn plugin() -> Vec<(String, Vec<u8>)> {
        vec![
            ("plugin.ini".into(), b"[plugin]\nid = my-look\nname = my-look.name\ndescription = my-look.description\nversion = 1.0.0\n".to_vec()),
            ("settings.ini".into(), b"[reading]\nmargin = 24\n".to_vec()),
            ("i18n/en.ini".into(), b"[meta]\nlanguage = en\nname = English\n\n[messages]\nmy-look.name = My look\nmy-look.description = A calm look.\n".to_vec()),
            ("i18n/de.ini".into(), b"[meta]\nlanguage = de\nname = Deutsch\n\n[messages]\nmy-look.name = Mein Aussehen\nmy-look.description = Ein ruhiges Aussehen.\n".to_vec()),
        ]
    }

    #[test]
    fn the_plugin_is_checked_in_its_languages_on_the_readers() {
        assert_eq!(languages(&plugin()), ["en", "de"]);
        let args = arguments(Path::new("p"), &["xteink-x4", "boox-go-7"], &languages(&plugin()));
        assert_eq!(
            args.join(" "),
            "--check p --profile xteink-x4 --profile boox-go-7 --language en --language de --light --theme default"
        );
    }

    #[test]
    fn only_what_is_to_fix_about_the_plugin_is_kept() {
        let report = r#"{"findings": [
            {"check": "package.settings", "level": "error", "plugin": "my-look", "place": "settings.ini:2", "message": "no setting", "variants": ["xteink-x4 en light default"]},
            {"check": "visual.text-cut", "level": "warning", "plugin": null, "place": "home", "message": "cut", "variants": []},
            {"check": "perf.top", "level": "info", "plugin": "files", "place": "files.browser", "message": "slow", "variants": []},
            {"check": "reach.touch-label", "level": "warning", "plugin": "files", "place": "files.browser", "message": "the app's", "variants": []}
        ], "pages": [], "errors": 1, "warnings": 2}"#;
        let found = findings(report, Some("my-look")).unwrap();
        assert_eq!(found.iter().map(|f| f.check.as_str()).collect::<Vec<_>>(), ["package.settings", "visual.text-cut"]);
        assert_eq!(found[0].seen, ["xteink-x4 en light default"]);
        assert!(findings("not json", None).is_err());
    }

    /// With PaperPaw's emulator (`PAPERPAW_EMU`, paperpaw-dev beside it).
    #[test]
    fn paperpaw_s_checks_find_a_setting_the_app_does_not_have() {
        let Some(program) = std::env::var_os("PAPERPAW_EMU").map(std::path::PathBuf::from).filter(|p| p.exists()) else {
            eprintln!("skipped: PAPERPAW_EMU names no paperpaw-emu");
            return;
        };
        let folder = tempfile::tempdir().unwrap();
        for (path, bytes) in plugin() {
            let file = folder.path().join(&path);
            std::fs::create_dir_all(file.parent().unwrap()).unwrap();
            std::fs::write(file, bytes).unwrap();
        }
        let found = check(&program, folder.path(), &["xteink-x4"], &plugin()).unwrap();
        assert!(found.iter().any(|f| f.check == "package.settings" && f.place == "settings.ini:2"), "{found:#?}");
        assert!(check(&program, folder.path(), &["xteink-x4"], &plugin()[1..]).is_err(), "no plugin.ini");
    }
}
