//! The plugin checked as PaperPaw checks plugins before they are
//! published: the release's paperpaw-dev (beside `paperpaw-emu`) on the
//! project's folder (its `.workshop/` is hidden, so not looked at). Its
//! files (package), its texts and settings (lint), what it draws on every
//! reader the workshop shows in each of its languages (visual: text cut or
//! overflowing, parts overlapping or outside their cell, uneven margins,
//! focus not shown, touch targets too small, contrast), whether every
//! screen is reached and left with buttons alone (reach). What is to fix
//! about the plugin goes to the model and to the person, with a small
//! picture of the spot where the check took one; measurements and the
//! app's own findings do not.

use std::io::Cursor;
use std::path::{Path, PathBuf};
use std::process::Command;

use base64::Engine;
use image::{GenericImageView, Rgba};
use serde::Serialize;
use serde_json::Value;

/// One thing to fix, said shortly: what the model reads and the window
/// shows. The same finding in several variants is one, with all of them.
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
    /// The spot, marked on the check's own picture: a PNG as a data URL,
    /// where the check took one.
    pub picture: Option<String>,
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

/// paperpaw-dev's arguments for `folder` on the readers `on` in
/// `languages`, light, the default look, its report and pictures in `out`.
pub fn arguments(folder: &Path, on: &[&str], languages: &[String], out: &Path) -> Vec<String> {
    let mut args = vec!["check".to_string(), folder.to_string_lossy().into_owned()];
    for profile in on {
        args.extend(["--profile".to_string(), (*profile).to_string()]);
    }
    for language in languages {
        args.extend(["--language".to_string(), language.clone()]);
    }
    args.extend(["--light", "--theme", "default", "--out"].map(String::from));
    args.push(out.to_string_lossy().into_owned());
    args
}

/// The most a finding's picture shows across, in pixels.
const THUMB: u32 = 280;
/// Room around the spot, in the picture's pixels.
const AROUND: u32 = 48;

/// The part of `picture` around `area` (x, y, width, height), the spot
/// framed, no wider than `THUMB`: a PNG as a data URL.
pub fn marked(picture: &Path, area: [u32; 4]) -> Option<String> {
    let image = image::open(picture).ok()?.to_rgba8();
    let (w, h) = image.dimensions();
    let [x, y, aw, ah] = area;
    if aw == 0 || ah == 0 || x >= w || y >= h {
        return None;
    }
    let (x0, y0) = (x.saturating_sub(AROUND), y.saturating_sub(AROUND));
    let (x1, y1) = ((x + aw + AROUND).min(w), (y + ah + AROUND).min(h));
    let mut part = image::imageops::crop_imm(&image, x0, y0, x1 - x0, y1 - y0).to_image();
    // The frame: dark, three pixels, with a light line inside it so that it
    // shows on dark screens too.
    let (fx0, fy0) = (x - x0, y - y0);
    let (fx1, fy1) = ((fx0 + aw).min(part.width()) - 1, (fy0 + ah).min(part.height()) - 1);
    for t in 0..4u32 {
        let colour = if t < 3 { Rgba([29, 27, 24, 255]) } else { Rgba([230, 224, 212, 255]) };
        let (ax, ay, bx, by) = (fx0.saturating_sub(3) + t, fy0.saturating_sub(3) + t, fx1 + 3 - t, fy1 + 3 - t);
        for px in ax..=bx.min(part.width() - 1) {
            for py in [ay, by] {
                if py < part.height() {
                    part.put_pixel(px, py, colour);
                }
            }
        }
        for py in ay..=by.min(part.height() - 1) {
            for px in [ax, bx] {
                if px < part.width() {
                    part.put_pixel(px, py, colour);
                }
            }
        }
    }
    let part = image::DynamicImage::ImageRgba8(part);
    let part = if part.width() > THUMB { part.resize(THUMB, u32::MAX, image::imageops::FilterType::Triangle) } else { part };
    let mut png = Vec::new();
    part.write_to(&mut Cursor::new(&mut png), image::ImageFormat::Png).ok()?;
    Some(format!("data:image/png;base64,{}", base64::engine::general_purpose::STANDARD.encode(png)))
}

/// What is to fix in a `report.json`: errors and warnings about the plugin
/// `id` (or about no plugin in particular), the worst first as the report
/// has them; pictures from `out`, where the report is.
pub fn findings(report: &str, id: Option<&str>, out: Option<&Path>) -> Result<Vec<Found>, String> {
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
        .map(|f| {
            let area: Option<[u32; 4]> = f["area"]
                .as_array()
                .filter(|a| a.len() == 4)
                .and_then(|a| Some([a[0].as_u64()? as u32, a[1].as_u64()? as u32, a[2].as_u64()? as u32, a[3].as_u64()? as u32]));
            let picture = match (out, f["picture"].as_str(), area) {
                (Some(out), Some(file), Some(area)) if !file.contains("..") => marked(&out.join(file), area),
                _ => None,
            };
            Found {
                check: text(f, "check"),
                level: text(f, "level"),
                place: text(f, "place"),
                message: text(f, "message"),
                seen: f["variants"]
                    .as_array()
                    .map(|v| v.iter().filter_map(|s| s.as_str().map(String::from)).collect())
                    .unwrap_or_default(),
                picture,
            }
        })
        .collect())
}

/// paperpaw-dev beside the emulator `program`, as the release puts it.
fn dev_beside(program: &Path) -> PathBuf {
    program.with_file_name(format!("paperpaw-dev{}", std::env::consts::EXE_SUFFIX))
}

/// Checks the plugin in `folder` with the paperpaw-dev beside the emulator
/// `program` on the readers `on`, its report and pictures in `out`: what
/// is to fix.
pub fn check(program: &Path, folder: &Path, on: &[&str], files: &[(String, Vec<u8>)], out: &Path) -> Result<Vec<Found>, String> {
    if !files.iter().any(|(path, _)| path == "plugin.ini") {
        return Err("the plugin has no plugin.ini yet".into());
    }
    let dev = dev_beside(program);
    let _ = std::fs::remove_dir_all(out);
    std::fs::create_dir_all(out).map_err(|e| format!("{}: {e}", out.display()))?;
    let mut command = Command::new(&dev);
    command.args(arguments(folder, on, &languages(files), out));
    crate::toolchain::quiet(&mut command);
    let ran = command.output().map_err(|e| format!("{}: {e}", dev.display()))?;
    let report = std::fs::read_to_string(out.join("report.json"));
    // 0: passed, 1: findings, 2: it could not check.
    let Ok(report) = report.ok().filter(|_| ran.status.code() != Some(2)).ok_or(()) else {
        return Err(format!("PaperPaw's checks could not run: {}", crate::toolchain::last_line(&ran.stderr)));
    };
    findings(&report, crate::emulator::plugin_id(files).as_deref(), Some(out))
}

/// The project's plugin checked on the readers the workshop shows, in
/// its languages: what is to fix. Off the window's thread; a check takes
/// some seconds. Its pictures are kept in the app's folder until the next.
#[tauri::command]
pub async fn plugin_check(project: String) -> Result<Vec<Found>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let root = crate::paths::projects()?;
        let files = crate::projects::plugin_files(&root, &project)?;
        let folder = crate::projects::folder(&root, &project)?;
        let out = crate::paths::app_data()?.join("checks").join(&project);
        check(&crate::paths::emulator_program()?, &folder, &crate::emulator::PROFILES, &files, &out)
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
        let args = arguments(Path::new("p"), &["xteink-x4", "boox-go-7"], &languages(&plugin()), Path::new("out"));
        assert_eq!(
            args.join(" "),
            "check p --profile xteink-x4 --profile boox-go-7 --language en --language de --light --theme default --out out"
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
        let found = findings(report, Some("my-look"), None).unwrap();
        assert_eq!(found.iter().map(|f| f.check.as_str()).collect::<Vec<_>>(), ["package.settings", "visual.text-cut"]);
        assert_eq!(found[0].seen, ["xteink-x4 en light default"]);
        assert!(findings("not json", None, None).is_err());
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
        let out = tempfile::tempdir().unwrap();
        let found = check(&program, folder.path(), &["xteink-x4"], &plugin(), out.path()).unwrap();
        assert!(found.iter().any(|f| f.check == "package.settings" && f.place == "settings.ini:2"), "{found:#?}");
        assert!(check(&program, folder.path(), &["xteink-x4"], &plugin()[1..], out.path()).is_err(), "no plugin.ini");
    }

    #[test]
    fn a_finding_s_picture_shows_its_spot_framed() {
        let dir = tempfile::tempdir().unwrap();
        let file = dir.path().join("shot.png");
        image::RgbaImage::from_pixel(480, 800, Rgba([255, 255, 255, 255])).save(&file).unwrap();
        let url = marked(&file, [100, 300, 200, 40]).unwrap();
        let png = base64::engine::general_purpose::STANDARD.decode(url.strip_prefix("data:image/png;base64,").unwrap()).unwrap();
        let shown = image::load_from_memory(&png).unwrap().to_rgba8();
        // The spot and 48 pixels around it, at most 280 across.
        assert_eq!(shown.dimensions(), (280, 136 * 280 / 296 + 1));
        // The frame is dark, the inside as it was.
        let dark = shown.pixels().filter(|p| p.0[0] < 60).count();
        assert!(dark > 300, "{dark}");
        assert_eq!(shown.get_pixel(140, 68).0, [255, 255, 255, 255]);
        assert!(marked(&file, [0, 0, 0, 0]).is_none());
        assert!(marked(&dir.path().join("none.png"), [1, 1, 1, 1]).is_none());
        let report = r#"{"findings": [{"check": "visual.text-cut", "level": "error", "plugin": null, "place": "home", "message": "cut", "variants": [], "picture": "shot.png", "area": [100, 300, 200, 40]}]}"#;
        assert!(findings(report, None, Some(dir.path())).unwrap()[0].picture.is_some());
    }
}
