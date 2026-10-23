//! A plugin installed on a reader in one step, through PaperPaw's
//! install requests (PaperPaw's docs/usb-transfer.md): over Wi-Fi through
//! the reader's transfer page, over the USB cable with the same requests
//! as lines (usb.rs). The reader keeps the plugin there before until the
//! new one is whole, and writes nothing it did not agree to.
//!
//! - Wi-Fi: each file (`PUT /api/plugin/<id>/<path>?sha256=…`), then the
//!   install (`POST /api/plugin/<id>`). A plugin with code is asked about
//!   on the reader first: `202 asking`, then `GET /api/plugin/<id>` until
//!   it is `installed` or `refused`.
//! - USB: first what is to come (`POST /api/offer`, each file with its
//!   size and SHA-256), which the reader allows on its screen (`GET
//!   /api/offer` until `allowed` or `refused`); then the files and the
//!   install as over Wi-Fi.
//!
//! What goes to the reader: a plugin without code as its files are; a
//! plugin with code as its folder (`plugin/`) with its build for the
//! reader (`code.ppn`), made by Publish… into `.workshop/publish/`.

use std::path::Path;
use std::time::{Duration, Instant};

use serde::Serialize;
use sha2::{Digest, Sha256};

/// How long the reader has for its answer on its screen.
pub const ASK: Duration = Duration::from_secs(120);
/// How often it is asked meanwhile.
const POLL: Duration = Duration::from_secs(1);
/// The reader's limit on what one offer names.
const MAX_FILES: usize = 64;

/// What a reader is asked: `target` is the path with its query; the
/// answer's status and text.
pub trait Api {
    fn call(&mut self, method: &str, target: &str, body: Option<&[u8]>) -> Result<(u16, String), String>;
}

/// The plugin as a reader installs it.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ReaderPlugin {
    pub id: String,
    /// Its files, `plugin.ini` among them, `code.ppn` for one with code.
    pub files: Vec<(String, Vec<u8>)>,
    pub code: bool,
}

/// What came of it, for the window.
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct Installed {
    pub id: String,
    /// Its code runs after the reader starts again.
    pub restart: bool,
}

/// What the window is told while it goes on.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Step {
    /// The reader asks on its screen: the person is to allow it there.
    Asking,
    /// The files go over, one of so many.
    Sending(usize, usize),
    /// The reader installs it.
    Installing,
}

/// The plugin of a project's `files` as a reader installs it; for one
/// with code, `builds` is the project's `.workshop/publish/` where its
/// build for the X4 lies.
pub fn reader_plugin(files: Vec<(String, Vec<u8>)>, builds: &Path) -> Result<ReaderPlugin, String> {
    let code = files.iter().any(|(p, _)| p == "Cargo.toml") && files.iter().any(|(p, _)| p == "plugin/plugin.ini");
    let files: Vec<(String, Vec<u8>)> = if code {
        files
            .into_iter()
            .filter_map(|(p, b)| p.strip_prefix("plugin/").map(|p| (p.to_string(), b)))
            .filter(|(p, _)| p != "code.ppn")
            .collect()
    } else {
        files
    };
    let mut files = crate::send::for_reader(files);
    let id = crate::emulator::plugin_id(&files).ok_or("The plugin has no plugin.ini with an id yet.")?;
    if code {
        let version = ini_value(&files, "version").ok_or("plugin.ini names no version.")?;
        let build = builds.join(format!("{id}-{version}-x4.ppn"));
        let bytes = std::fs::read(&build).map_err(|_| {
            format!("There is no build of version {version} for the reader yet: Publish… makes it.")
        })?;
        files.push(("code.ppn".into(), bytes));
    }
    for (path, _) in &files {
        if path.contains(' ') {
            return Err(format!("{path}: a reader takes no spaces in a plugin's file names."));
        }
    }
    if files.len() > MAX_FILES {
        return Err(format!("A reader takes at most {MAX_FILES} files of a plugin; this one has {}.", files.len()));
    }
    files.sort();
    Ok(ReaderPlugin { id, files, code })
}

/// `key`'s value in plugin.ini's `[plugin]`.
fn ini_value(files: &[(String, Vec<u8>)], key: &str) -> Option<String> {
    let (_, ini) = files.iter().find(|(p, _)| p == "plugin.ini")?;
    String::from_utf8_lossy(ini).lines().find_map(|line| {
        let (k, v) = line.split_once('=')?;
        (k.trim() == key).then(|| v.trim().to_string()).filter(|v| !v.is_empty())
    })
}

fn sha256(bytes: &[u8]) -> String {
    Sha256::digest(bytes).iter().map(|b| format!("{b:02x}")).collect()
}

/// `text` as a part of a URL's path.
fn encoded(text: &str) -> String {
    text.bytes()
        .map(|b| match b {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'.' | b'_' | b'~' | b'/' => (b as char).to_string(),
            _ => format!("%{b:02X}"),
        })
        .collect()
}

/// The `state` (and `why`, `restart`) of a JSON answer.
fn state(text: &str) -> (String, Option<String>, bool) {
    let json: serde_json::Value = serde_json::from_str(text).unwrap_or_default();
    let state = json.get("state").and_then(|s| s.as_str()).unwrap_or_default().to_string();
    let why = json.get("why").and_then(|w| w.as_str()).map(str::to_string);
    let restart = json.get("restart").and_then(|r| r.as_bool()).unwrap_or(false);
    (state, why, restart)
}

/// What a status says to the person, where it is no success.
fn refusal(what: &str, status: u16, text: &str) -> String {
    match status {
        403 => "The reader said no: on Wi-Fi, type the address as it shows it now; on the cable, open the transfer again on the reader.".into(),
        404 => "The reader's PaperPaw is too old to install plugins from here: update it first.".into(),
        409 => "The reader asks about something else just now: answer it there first.".into(),
        429 => "The reader waits a little after wrong keys: try again in a minute.".into(),
        507 => "There is not room on the reader's card for the plugin.".into(),
        422 | 400 => match state(text).1 {
            Some(why) => format!("The reader did not install it: {why}"),
            None => format!("The reader did not take {what}: {}", text.trim()),
        },
        _ => format!("The reader said no to {what}: {status} {}", text.trim()),
    }
}

/// Waits for the reader's answer on its screen: asks `target` every
/// second until its state is one of `done`, for at most [`ASK`].
fn wait(api: &mut dyn Api, target: &str, done: &[&str], sleep: &dyn Fn(Duration)) -> Result<(String, Option<String>, bool), String> {
    let started = Instant::now();
    loop {
        sleep(POLL);
        let (status, text) = api.call("GET", target, None)?;
        if status != 200 {
            return Err(refusal("the question", status, &text));
        }
        let answer = state(&text);
        if done.contains(&answer.0.as_str()) {
            return Ok(answer);
        }
        if started.elapsed() >= ASK {
            return Err("No answer on the reader: send it again when you are by it.".into());
        }
    }
}

/// Sends the files of `plugin`, each checked by its SHA-256.
fn send_files(api: &mut dyn Api, plugin: &ReaderPlugin, told: &dyn Fn(Step)) -> Result<(), String> {
    for (n, (path, bytes)) in plugin.files.iter().enumerate() {
        told(Step::Sending(n + 1, plugin.files.len()));
        let target = format!("/api/plugin/{}/{}?sha256={}", plugin.id, encoded(path), sha256(bytes));
        let (status, text) = api.call("PUT", &target, Some(bytes))?;
        if status != 200 {
            return Err(refusal(path, status, &text));
        }
    }
    Ok(())
}

/// Installs what was sent; over Wi-Fi, a plugin with code is asked about
/// on the reader first.
fn commit(api: &mut dyn Api, plugin: &ReaderPlugin, told: &dyn Fn(Step), sleep: &dyn Fn(Duration)) -> Result<Installed, String> {
    told(Step::Installing);
    let target = format!("/api/plugin/{}", plugin.id);
    let (status, text) = api.call("POST", &target, None)?;
    let (state, why, restart) = match status {
        200 => self::state(&text),
        202 => {
            told(Step::Asking);
            wait(api, &target, &["installed", "refused", "none"], sleep)?
        }
        _ => return Err(refusal("the plugin", status, &text)),
    };
    match state.as_str() {
        "installed" => Ok(Installed { id: plugin.id.clone(), restart }),
        "refused" => Err(match why {
            Some(why) => format!("The reader did not install it: {why}"),
            None => "Not allowed on the reader.".into(),
        }),
        _ => Err("The reader let the plugin go: send it again.".into()),
    }
}

/// Installs `plugin` over Wi-Fi.
pub fn over_wifi(api: &mut dyn Api, plugin: &ReaderPlugin, told: &dyn Fn(Step), sleep: &dyn Fn(Duration)) -> Result<Installed, String> {
    send_files(api, plugin, told)?;
    commit(api, plugin, told, sleep)
}

/// Installs `plugin` over the cable: offered, allowed on the reader, sent,
/// installed.
pub fn over_usb(api: &mut dyn Api, plugin: &ReaderPlugin, told: &dyn Fn(Step), sleep: &dyn Fn(Duration)) -> Result<Installed, String> {
    let mut offer = format!("plugin {}\n", plugin.id);
    for (path, bytes) in &plugin.files {
        offer.push_str(&format!("{path} {} {}\n", bytes.len(), sha256(bytes)));
    }
    let (status, text) = api.call("POST", "/api/offer", Some(offer.as_bytes()))?;
    if status != 202 {
        return Err(refusal("the offer", status, &text));
    }
    told(Step::Asking);
    let (state, _, _) = wait(api, "/api/offer", &["allowed", "refused"], sleep)?;
    if state != "allowed" {
        return Err("Not allowed on the reader.".into());
    }
    send_files(api, plugin, told)?;
    commit(api, plugin, told, sleep)
}

#[cfg(test)]
mod tests {
    use std::cell::RefCell;

    use super::*;

    /// A reader as the tests want it: its answers by request, every
    /// request in order.
    struct Fake {
        answers: Vec<(&'static str, Vec<(u16, &'static str)>)>,
        asked: Vec<String>,
    }

    impl Fake {
        fn new(answers: Vec<(&'static str, Vec<(u16, &'static str)>)>) -> Self {
            Fake { answers, asked: Vec::new() }
        }
    }

    impl Api for Fake {
        fn call(&mut self, method: &str, target: &str, body: Option<&[u8]>) -> Result<(u16, String), String> {
            let path = target.split('?').next().unwrap_or_default();
            self.asked.push(format!("{method} {path}{}", body.map(|b| format!(" ({} bytes)", b.len())).unwrap_or_default()));
            let key = format!("{method} {path}");
            for (k, answers) in &mut self.answers {
                if *k == key {
                    let answer = if answers.len() > 1 { answers.remove(0) } else { answers[0] };
                    return Ok((answer.0, answer.1.to_string()));
                }
            }
            Ok((200, "{}".into()))
        }
    }

    fn data() -> ReaderPlugin {
        reader_plugin(
            vec![
                ("plugin.ini".into(), b"[plugin]\nid = calm\nversion = 1.0.0\n".to_vec()),
                ("i18n/de.ini".into(), b"x".to_vec()),
                ("store/entry.toml".into(), b"store only".to_vec()),
            ],
            Path::new("nowhere"),
        )
        .unwrap()
    }

    fn no_wait(_: Duration) {}

    #[test]
    fn a_plugin_without_code_is_its_files_but_the_store_s() {
        let plugin = data();
        assert_eq!(plugin.id, "calm");
        assert!(!plugin.code);
        let paths: Vec<&str> = plugin.files.iter().map(|(p, _)| p.as_str()).collect();
        assert_eq!(paths, ["i18n/de.ini", "plugin.ini"]);
    }

    #[test]
    fn a_plugin_with_code_is_its_folder_and_its_build() {
        let builds = tempfile::tempdir().unwrap();
        let files = vec![
            ("Cargo.toml".into(), b"[package]".to_vec()),
            ("src/lib.rs".into(), b"code".to_vec()),
            ("plugin/plugin.ini".into(), b"[plugin]\nid = clock\nversion = 1.2.0\n".to_vec()),
            ("plugin/code.ppn".into(), b"old".to_vec()),
        ];
        let err = reader_plugin(files.clone(), builds.path()).unwrap_err();
        assert!(err.contains("Publish"), "{err}");
        std::fs::write(builds.path().join("clock-1.2.0-x4.ppn"), b"built").unwrap();
        let plugin = reader_plugin(files, builds.path()).unwrap();
        assert!(plugin.code);
        assert_eq!(
            plugin.files,
            [("code.ppn".to_string(), b"built".to_vec()), ("plugin.ini".to_string(), b"[plugin]\nid = clock\nversion = 1.2.0\n".to_vec())]
        );
    }

    #[test]
    fn names_with_spaces_are_not_sent() {
        let files = vec![("plugin.ini".into(), b"[plugin]\nid = a\n".to_vec()), ("a b.ini".into(), Vec::new())];
        assert!(reader_plugin(files, Path::new("x")).unwrap_err().contains("spaces"));
    }

    #[test]
    fn over_wifi_the_files_go_then_the_install_in_one_step() {
        let mut reader = Fake::new(vec![("POST /api/plugin/calm", vec![(200, r#"{"state":"installed","restart":false}"#)])]);
        let done = over_wifi(&mut reader, &data(), &|_| {}, &no_wait).unwrap();
        assert_eq!(done, Installed { id: "calm".into(), restart: false });
        assert_eq!(
            reader.asked,
            ["PUT /api/plugin/calm/i18n/de.ini (1 bytes)", "PUT /api/plugin/calm/plugin.ini (35 bytes)", "POST /api/plugin/calm"]
        );
    }

    #[test]
    fn code_over_wifi_waits_for_the_reader_s_answer() {
        let mut reader = Fake::new(vec![
            ("POST /api/plugin/calm", vec![(202, r#"{"state":"asking"}"#)]),
            ("GET /api/plugin/calm", vec![(200, r#"{"state":"asking"}"#), (200, r#"{"state":"installed","restart":true}"#)]),
        ]);
        let steps = RefCell::new(Vec::new());
        let done = over_wifi(&mut reader, &data(), &|s| steps.borrow_mut().push(s), &no_wait).unwrap();
        assert!(done.restart);
        assert!(steps.borrow().contains(&Step::Asking));
        assert_eq!(reader.asked.iter().filter(|a| a.starts_with("GET")).count(), 2);
    }

    #[test]
    fn a_refusal_says_why() {
        let mut reader = Fake::new(vec![("POST /api/plugin/calm", vec![(422, r#"{"state":"refused","why":"another fingerprint"}"#)])]);
        let err = over_wifi(&mut reader, &data(), &|_| {}, &no_wait).unwrap_err();
        assert!(err.contains("another fingerprint"), "{err}");
        let mut old = Fake::new(vec![("PUT /api/plugin/calm/i18n/de.ini", vec![(404, "not found")])]);
        assert!(over_wifi(&mut old, &data(), &|_| {}, &no_wait).unwrap_err().contains("too old"));
    }

    #[test]
    fn over_usb_it_is_offered_and_allowed_first() {
        let mut reader = Fake::new(vec![
            ("POST /api/offer", vec![(202, r#"{"state":"asking"}"#)]),
            ("GET /api/offer", vec![(200, r#"{"state":"asking"}"#), (200, r#"{"state":"allowed"}"#)]),
            ("POST /api/plugin/calm", vec![(200, r#"{"state":"installed"}"#)]),
        ]);
        over_usb(&mut reader, &data(), &|_| {}, &no_wait).unwrap();
        assert_eq!(reader.asked[0], "POST /api/offer (170 bytes)");
        assert_eq!(&reader.asked[3..], ["PUT /api/plugin/calm/i18n/de.ini (1 bytes)", "PUT /api/plugin/calm/plugin.ini (35 bytes)", "POST /api/plugin/calm"]);
        let mut refused = Fake::new(vec![
            ("POST /api/offer", vec![(202, r#"{"state":"asking"}"#)]),
            ("GET /api/offer", vec![(200, r#"{"state":"refused"}"#)]),
        ]);
        assert!(over_usb(&mut refused, &data(), &|_| {}, &no_wait).is_err());
        assert!(!refused.asked.iter().any(|a| a.starts_with("PUT")), "nothing sent when refused");
    }
}
