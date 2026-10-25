//! Asks PaperPaw's standard app what it offers data plugins: every
//! setting (its id, kind, range or choices, default and texts), every
//! widget a home screen layout can place, every action a key map can bind,
//! and the device profiles of the emulator. The handbook generator runs it
//! against a PaperPaw checkout at a tag or branch and writes the answer as
//! `registry.json`, so the AI and the workshop's checks name only what
//! that release has.
//!
//!   cargo run --release -- <registry.json>

use std::path::PathBuf;

use paperpaw_emulator::device::{library, Device};
use paperpaw_emulator::profiles::PROFILES;
use paperpaw_sdk::{SettingKind, SettingValue};
use serde_json::{json, Value};

fn main() {
    let out = std::env::args()
        .nth(1)
        .map(PathBuf::from)
        .expect("usage: registry <registry.json>");
    let dir = std::env::temp_dir().join(format!("paperpaw-registry-{}", std::process::id()));
    std::fs::create_dir_all(&dir).expect("a folder for the emulated card");
    let storage = library(&dir).expect("the emulated card");
    // The X4: what every device has. Profiles add defaults, not settings.
    let profile = &PROFILES[0];
    let device = Device::new(profile, None, storage, true).expect("PaperPaw's standard app");
    let kernel = &device.kernel;
    let tr = |key: &str| kernel.translator().tr(key).to_string();

    let settings: Vec<Value> = kernel
        .settings()
        .specs()
        .map(|spec| {
            let mut kind = match &spec.kind {
                SettingKind::Bool => json!({ "kind": "switch" }),
                SettingKind::Int { min, max } => json!({ "kind": "number", "min": min, "max": max }),
                SettingKind::Choice(choices) => json!({
                    "kind": "choice",
                    "choices": choices
                        .iter()
                        .map(|c| json!({ "value": c, "label": tr(c) }))
                        .collect::<Vec<_>>(),
                }),
                SettingKind::Text => json!({ "kind": "text" }),
                SettingKind::Language => json!({ "kind": "language" }),
                SettingKind::List => json!({ "kind": "list" }),
                _ => json!({ "kind": "other" }),
            };
            let default = match &spec.default {
                SettingValue::Bool(b) => json!(b),
                SettingValue::Int(n) => json!(n),
                SettingValue::Text(t) => json!(t),
                _ => Value::Null,
            };
            let object = kind.as_object_mut().expect("an object");
            object.insert("id".into(), json!(spec.id.as_str()));
            object.insert("title".into(), json!(tr(&spec.title)));
            if let Some(help) = &spec.description {
                object.insert("help".into(), json!(tr(help)));
            }
            object.insert("default".into(), default);
            object.insert("group".into(), json!(spec.group.as_str()));
            object.insert("advanced".into(), json!(format!("{:?}", spec.level) == "Advanced"));
            object.insert("scoped".into(), json!(spec.scoped));
            kind
        })
        .collect();

    let widgets: Vec<Value> = kernel
        .widgets()
        .iter()
        .map(|(id, title)| json!({ "id": id.as_str(), "title": tr(title) }))
        .collect();

    let actions: Vec<Value> = kernel
        .actions()
        .iter()
        .map(|a| json!({ "id": a.id().as_str(), "title": tr(a.title()) }))
        .collect();

    let profiles: Vec<Value> = PROFILES
        .iter()
        .map(|p| {
            let d = &p.device;
            json!({
                "id": d.id,
                "name": d.name,
                "width": d.display.width,
                "height": d.display.height,
                "dpi": d.display.dpi,
                "touch": d.input.touch,
                "buttons": p.buttons,
                "colors": p.colors,
                "store": p.catalog_device,
                "summary": p.summary,
            })
        })
        .collect();

    let registry = json!({
        "settings": settings,
        "widgets": widgets,
        "actions": actions,
        "profiles": profiles,
    });
    std::fs::write(&out, serde_json::to_string_pretty(&registry).expect("JSON"))
        .expect("registry.json written");
    let _ = std::fs::remove_dir_all(&dir);
    eprintln!(
        "registry: {} settings, {} widgets, {} actions, {} profiles",
        registry["settings"].as_array().map_or(0, Vec::len),
        registry["widgets"].as_array().map_or(0, Vec::len),
        registry["actions"].as_array().map_or(0, Vec::len),
        registry["profiles"].as_array().map_or(0, Vec::len),
    );
}
