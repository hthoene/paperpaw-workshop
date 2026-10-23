//! The plugin onto a real reader: over Wi-Fi through the reader's own
//! transfer page (its address with its key, as the reader shows it), over
//! the USB cable (usb.rs), or into the `plugins` folder of its card in
//! this computer, or as a zip to keep or share. A reader has a plugin as
//! a folder, `plugins/<id>/`; the store's own files (`store/`) stay home.
//!
//! Over Wi-Fi and the cable the reader installs the plugin in one step
//! (install.rs): the one there before stays until the new one is whole.

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

/// The transfer page of the reader at `host`, with its `key`, which goes
/// with every request.
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

impl crate::install::Api for Reader {
    fn call(&mut self, method: &str, target: &str, body: Option<&[u8]>) -> Result<(u16, String), String> {
        let joint = if target.contains('?') { '&' } else { '?' };
        let url = format!("http://{}{target}{joint}k={}", self.host, self.key);
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

/// The project's plugin as a reader installs it (install.rs).
pub fn reader_plugin(project: &str) -> Result<crate::install::ReaderPlugin, String> {
    let root = crate::paths::projects()?;
    let files = crate::projects::plugin_files(&root, project)?;
    let builds = crate::projects::folder(&root, project)?.join(".workshop").join("publish");
    crate::install::reader_plugin(files, &builds)
}

/// Tells the window how sending goes (`send-progress`): `asking` while
/// the reader asks on its screen, `sending n/m`, `installing`.
pub fn progress(app: &tauri::AppHandle) -> impl Fn(crate::install::Step) + '_ {
    use tauri::Emitter;
    move |step| {
        let said = match step {
            crate::install::Step::Asking => "asking".to_string(),
            crate::install::Step::Sending(n, of) => format!("sending {n}/{of}"),
            crate::install::Step::Installing => "installing".to_string(),
        };
        let _ = app.emit("send-progress", said);
    }
}

/// The project's plugin installed on the reader whose transfer address is
/// `address`.
#[tauri::command]
pub async fn send_wifi(app: tauri::AppHandle, project: String, address: String) -> Result<crate::install::Installed, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let (host, key) = self::address(&address)?;
        let plugin = reader_plugin(&project)?;
        crate::install::over_wifi(&mut Reader::new(host, key), &plugin, &progress(&app), &std::thread::sleep)
    })
    .await
    .map_err(|e| e.to_string())?
}

/// The project's plugin onto the card at `card`; where it went.
#[tauri::command]
pub async fn send_card(project: String, card: String) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || {
        // As over Wi-Fi: for a plugin with code, its folder and its build.
        let plugin = reader_plugin(&project)?;
        onto_card(Path::new(&card), &plugin.files).map(|p| p.display().to_string())
    })
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
    use super::*;

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
    fn a_card_gets_the_plugin_s_folder() {
        let card = tempfile::tempdir().unwrap();
        let at = onto_card(card.path(), &for_reader(plugin())).unwrap();
        assert!(at.join("i18n/de.ini").exists());
        assert!(!at.join("store").exists());
        assert!(onto_card(&card.path().join("none"), &plugin()).is_err());
    }
}
