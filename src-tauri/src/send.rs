//! The plugin onto a real reader: over Wi-Fi through the reader's own
//! transfer page (its address with its key, as the reader shows it), or
//! into the `plugins` folder of its card in this computer, or as a zip
//! to keep or share. A reader has a data plugin as a folder,
//! `plugins/<id>/`; the store's own files (`store/`) stay home.
//!
//! The transfer page never overwrites: a file or folder sent where one is
//! gets a free name of its own ("plugin (2).ini"). So the plugin's folder
//! there is removed first and `plugins` made only where it is missing.

use std::path::{Path, PathBuf};
use std::time::Duration;

use base64::Engine;

/// How long one request to a reader may take: its Wi-Fi is slow.
const TIMEOUT: Duration = Duration::from_secs(30);

/// The plugin's files for a reader: everything but the store's.
pub fn for_reader(files: Vec<(String, Vec<u8>)>) -> Vec<(String, Vec<u8>)> {
    files.into_iter().filter(|(path, _)| !path.starts_with("store/")).collect()
}

/// The plugin's id, or why it cannot go to a reader yet.
fn id_of(files: &[(String, Vec<u8>)]) -> Result<String, String> {
    crate::emulator::plugin_id(files).ok_or_else(|| "The plugin has no plugin.ini with an id yet.".to_string())
}

/// The folders `files` need, each after the one it is in.
fn folders(files: &[(String, Vec<u8>)]) -> Vec<String> {
    let mut out: Vec<String> = Vec::new();
    for (path, _) in files {
        let parts: Vec<&str> = path.split('/').collect();
        for n in 1..parts.len() {
            let folder = parts[..n].join("/");
            if !out.contains(&folder) {
                out.push(folder);
            }
        }
    }
    out
}

/// A reader's transfer address as it shows it, `http://<address>/?k=<key>`:
/// where it is, and its key.
pub fn address(text: &str) -> Result<(String, String), String> {
    let text = text.trim();
    let rest = text.strip_prefix("http://").unwrap_or(text);
    let (host, query) = rest.split_once('?').ok_or("The address has no key (…/?k=…): type it as the reader shows it.")?;
    let host = host.trim_end_matches('/');
    let key = query.split('&').find_map(|p| p.strip_prefix("k=")).filter(|k| !k.is_empty());
    let plain = !host.is_empty() && host.chars().all(|c| c.is_ascii_alphanumeric() || ".-:[]".contains(c));
    match key {
        Some(key) if plain && key.chars().all(|c| c.is_ascii_alphanumeric()) => Ok((host.to_string(), key.to_string())),
        _ => Err("That is not a reader's transfer address: type it as the reader shows it.".into()),
    }
}

/// `text` for a URL's query.
fn encoded(text: &str) -> String {
    text.bytes()
        .map(|b| match b {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'.' | b'_' | b'~' | b'/' => (b as char).to_string(),
            _ => format!("%{b:02X}"),
        })
        .collect()
}

/// What a reader's transfer page is asked; its answer's status and text.
pub trait Transfer {
    fn ask(&self, method: &str, path: &str, query: &str, body: Option<&[u8]>) -> Result<(u16, String), String>;
}

/// The transfer page of the reader at `host`, with its `key`.
pub struct Reader {
    host: String,
    key: String,
    agent: ureq::Agent,
}

impl Reader {
    pub fn new(host: String, key: String) -> Self {
        let agent = ureq::AgentBuilder::new().timeout(TIMEOUT).build();
        Reader { host, key, agent }
    }
}

impl Transfer for Reader {
    fn ask(&self, method: &str, path: &str, query: &str, body: Option<&[u8]>) -> Result<(u16, String), String> {
        let url = format!("http://{}{path}?k={}{query}", self.host, self.key);
        let request = self.agent.request(method, &url);
        let answer = match body {
            Some(bytes) => request.send_bytes(bytes),
            None => request.call(),
        };
        match answer {
            Ok(r) => Ok((r.status(), r.into_string().unwrap_or_default())),
            Err(ureq::Error::Status(code, r)) => Ok((code, r.into_string().unwrap_or_default())),
            // The address is the person's; how the connection failed says
            // nothing more to them.
            Err(_) => Err(format!("The reader at {} did not answer. Is its transfer page open, and this computer in the same Wi-Fi?", self.host)),
        }
    }
}

/// Sends the plugin of `files` through `reader`'s transfer page into
/// `plugins/<id>/`, the one there before replaced.
pub fn over_wifi(reader: &dyn Transfer, files: &[(String, Vec<u8>)]) -> Result<String, String> {
    let id = id_of(files)?;
    let said = |what: &str, (status, text): (u16, String)| -> Result<(), String> {
        match status {
            200..=299 => Ok(()),
            403 => Err("The reader did not take the key: type the address as it shows it now.".into()),
            429 => Err("The reader waits a little after wrong keys: try again in a minute.".into()),
            _ => Err(format!("The reader said no to {what}: {status} {}", text.trim())),
        }
    };
    // Asked one by one (a listing comes in pages): `plugins`, and the
    // plugin's own folder in it.
    let there = |path: &str, what: &str| -> Result<bool, String> {
        match reader.ask("GET", "/api/list", &format!("&path={}", encoded(path)), None)? {
            (404, _) => Ok(false),
            answer => said(what, answer).map(|()| true),
        }
    };
    let folder = format!("plugins/{id}");
    if !there("plugins", "listing its plugins")? {
        said("making the plugins folder", reader.ask("POST", "/api/mkdir", "&path=plugins", None)?)?;
    } else if there(&folder, "looking for the plugin")? {
        said("removing the plugin before", reader.ask("POST", "/api/delete", &format!("&path={}", encoded(&folder)), None)?)?;
    }
    said("making the plugin's folder", reader.ask("POST", "/api/mkdir", &format!("&path={}", encoded(&folder)), None)?)?;
    for folder in folders(files) {
        let path = format!("plugins/{id}/{folder}");
        said(&path, reader.ask("POST", "/api/mkdir", &format!("&path={}", encoded(&path)), None)?)?;
    }
    for (path, bytes) in files {
        let path = format!("plugins/{id}/{path}");
        said(&path, reader.ask("PUT", "/api/file", &format!("&path={}", encoded(&path)), Some(bytes))?)?;
    }
    Ok(id)
}

/// Puts the plugin of `files` into the card at `card` (its top folder),
/// as `plugins/<id>/`, the one there before replaced.
pub fn onto_card(card: &Path, files: &[(String, Vec<u8>)]) -> Result<PathBuf, String> {
    let id = id_of(files)?;
    if !card.is_dir() {
        return Err(format!("{} is not a folder.", card.display()));
    }
    crate::emulator::place_plugin(card, &id, files)?;
    Ok(card.join("plugins").join(id))
}

fn plugin(project: &str) -> Result<Vec<(String, Vec<u8>)>, String> {
    Ok(for_reader(crate::projects::plugin_files(&crate::paths::projects()?, project)?))
}

/// The project's plugin to the reader whose transfer address is `address`;
/// the plugin's id.
#[tauri::command]
pub async fn send_wifi(project: String, address: String) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let (host, key) = self::address(&address)?;
        over_wifi(&Reader::new(host, key), &plugin(&project)?)
    })
    .await
    .map_err(|e| e.to_string())?
}

/// The project's plugin onto the card at `card`; where it went.
#[tauri::command]
pub async fn send_card(project: String, card: String) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || onto_card(Path::new(&card), &plugin(&project)?).map(|p| p.display().to_string()))
        .await
        .map_err(|e| e.to_string())?
}

/// Writes a file the person chose to save (a plugin's zip), from base64.
#[tauri::command]
pub async fn save_file(path: String, base64: String) -> Result<(), String> {
    let bytes = base64::engine::general_purpose::STANDARD.decode(base64).map_err(|e| e.to_string())?;
    tauri::async_runtime::spawn_blocking(move || std::fs::write(&path, bytes).map_err(|e| format!("{path}: {e}")))
        .await
        .map_err(|e| e.to_string())?
}

#[cfg(test)]
mod tests {
    use std::cell::RefCell;

    use super::*;

    /// A reader's transfer page as the tests want it: what is on its card,
    /// and every request in order.
    struct Fake {
        plugins: Option<Vec<String>>,
        asked: RefCell<Vec<String>>,
    }

    impl Transfer for Fake {
        fn ask(&self, method: &str, path: &str, query: &str, body: Option<&[u8]>) -> Result<(u16, String), String> {
            self.asked.borrow_mut().push(format!("{method} {path}{query}{}", body.map(|b| format!(" ({} bytes)", b.len())).unwrap_or_default()));
            if path == "/api/list" {
                let asked = query.strip_prefix("&path=").unwrap_or_default();
                let found = match (&self.plugins, asked.strip_prefix("plugins/")) {
                    (None, _) => false,
                    (Some(_), None) => true,
                    (Some(ids), Some(id)) => ids.iter().any(|i| i == id),
                };
                return Ok(if found { (200, "{\"entries\":[]}".into()) } else { (404, "not found".into()) });
            }
            Ok((200, "ok".into()))
        }
    }

    fn plugin() -> Vec<(String, Vec<u8>)> {
        vec![
            ("plugin.ini".into(), b"[plugin]\nid = calm\n".to_vec()),
            ("i18n/de.ini".into(), b"x".to_vec()),
            ("store/entry.toml".into(), b"store only".to_vec()),
        ]
    }

    #[test]
    fn the_address_is_read_as_the_reader_shows_it() {
        assert_eq!(address(" http://192.168.4.1/?k=ab12 ").unwrap(), ("192.168.4.1".into(), "ab12".into()));
        assert!(address("http://192.168.4.1/").is_err(), "no key");
        assert!(address("http://evil.example/x?y#?k=1").is_err());
    }

    #[test]
    fn a_plugin_replaces_the_one_before_and_leaves_the_store_s_files_home() {
        let reader = Fake { plugins: Some(vec!["calm".into(), "other".into()]), asked: RefCell::default() };
        assert_eq!(over_wifi(&reader, &for_reader(plugin())).unwrap(), "calm");
        assert_eq!(
            reader.asked.into_inner(),
            [
                "GET /api/list&path=plugins",
                "GET /api/list&path=plugins/calm",
                "POST /api/delete&path=plugins/calm",
                "POST /api/mkdir&path=plugins/calm",
                "POST /api/mkdir&path=plugins/calm/i18n",
                "PUT /api/file&path=plugins/calm/plugin.ini (19 bytes)",
                "PUT /api/file&path=plugins/calm/i18n/de.ini (1 bytes)",
            ]
        );
    }

    #[test]
    fn the_plugins_folder_is_made_where_it_is_missing() {
        let reader = Fake { plugins: None, asked: RefCell::default() };
        over_wifi(&reader, &for_reader(plugin())).unwrap();
        let asked = reader.asked.into_inner();
        assert_eq!(asked[1], "POST /api/mkdir&path=plugins");
        assert!(!asked.iter().any(|a| a.contains("delete")));
    }

    #[test]
    fn a_card_gets_the_plugin_s_folder() {
        let card = tempfile::tempdir().unwrap();
        let at = onto_card(card.path(), &for_reader(plugin())).unwrap();
        assert!(at.join("i18n/de.ini").exists());
        assert!(!at.join("store").exists());
        assert!(onto_card(&card.path().join("none"), &plugin()).is_err());
    }
}
