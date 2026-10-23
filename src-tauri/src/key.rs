//! The person's key, kept in the system's own keychain (Windows Credential
//! Manager, the macOS Keychain, the Secret Service on Linux), never in a
//! file of ours. One entry: a Claude key (`sk-ant-...`) or a PaperPaw key
//! for the free quota (`ppw-...`); what it is decides where requests go.

use keyring::Entry;

const SERVICE: &str = "org.paperpaw.workshop";
const ACCOUNT: &str = "key";

fn entry() -> Result<Entry, String> {
    Entry::new(SERVICE, ACCOUNT).map_err(|e| e.to_string())
}

/// The key kept, if any.
#[tauri::command]
pub fn key_get() -> Result<Option<String>, String> {
    match entry()?.get_password() {
        Ok(key) => Ok(Some(key)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

/// Keeps `key`, after the plainest check of its form (the app tries it
/// against the service before calling this).
#[tauri::command]
pub fn key_set(key: String) -> Result<(), String> {
    let key = key.trim();
    if key.is_empty() || key.len() > 512 || key.chars().any(char::is_whitespace) {
        return Err("not a key".into());
    }
    entry()?.set_password(key).map_err(|e| e.to_string())
}

/// Forgets the key (Settings, "Remove key").
#[tauri::command]
pub fn key_clear() -> Result<(), String> {
    match entry()?.delete_credential() {
        Ok(()) | Err(keyring::Error::NoEntry) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}
