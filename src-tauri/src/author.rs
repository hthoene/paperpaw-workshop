//! The person's author key: the one Ed25519 key that signs every plugin
//! with code they publish (ADR 0024). The store takes an update only when
//! it is signed by the same key as the versions before, and a reader warns
//! of one signed by another. Made by the workshop the first time it is
//! needed, kept in the system's keychain (never in a project, never sent
//! anywhere), and saved by the person as a backup file before anything is
//! signed with it.
//!
//! The backup is the same kind of file as `paperpaw-sign key` and the
//! store's signing page make (one line of 64 hexadecimal digits, the
//! secret), so it works with PaperPaw's own tools too. It is not encrypted:
//! whoever has it can sign in the person's name, so it is kept private.
//!
//! A plugin file is signed as `paperpaw-native`'s `signature` does: a
//! trailer of 112 bytes (`PPNS`, format 1, the length signed, the public
//! key, the signature over the domain, the file and the trailer's start).

use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use ed25519_compact::{KeyPair, Seed};
use keyring::Entry;
use serde::{Deserialize, Serialize};

use crate::paths;

const SERVICE: &str = "org.paperpaw.workshop";
const ACCOUNT: &str = "author-key";

/// What the signature covers before the file.
const DOMAIN: &[u8] = b"PaperPaw plugin file\0";
/// The trailer's first bytes, and its format.
const MAGIC: [u8; 4] = *b"PPNS";
const FORMAT: u16 = 1;
/// The trailer's length.
#[allow(dead_code)]
pub const TRAILER_LEN: usize = 112;

/// Where the secret is kept: the keychain, or memory in tests.
pub trait Secrets {
    fn get(&self) -> Result<Option<String>, String>;
    fn set(&self, secret: &str) -> Result<(), String>;
}

/// The system's keychain, its entry for the author key (another in tests).
pub struct Keychain {
    account: &'static str,
}

impl Keychain {
    pub const AUTHOR: Keychain = Keychain { account: ACCOUNT };

    fn entry(&self) -> Result<Entry, String> {
        Entry::new(SERVICE, self.account).map_err(|e| e.to_string())
    }
}

impl Secrets for Keychain {
    fn get(&self) -> Result<Option<String>, String> {
        match self.entry()?.get_password() {
            Ok(secret) => Ok(Some(secret)),
            Err(keyring::Error::NoEntry) => Ok(None),
            Err(e) => Err(e.to_string()),
        }
    }

    fn set(&self, secret: &str) -> Result<(), String> {
        self.entry()?.set_password(secret).map_err(|e| e.to_string())
    }
}

/// What the window shows of the key: never the secret.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct Status {
    /// The public key, 64 hexadecimal digits; none when there is no key.
    pub public: Option<String>,
    /// As the store and readers show it: `EA4A 6C63 E29C 520A`.
    pub fingerprint: Option<String>,
    /// When a backup was last saved (or the key came from one), in
    /// seconds since 1970.
    pub backed_up: Option<u64>,
}

/// What is kept beside the keychain: when the key was backed up.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
struct Record {
    public: String,
    backed_up: Option<u64>,
}

fn now() -> u64 {
    SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_secs()).unwrap_or(0)
}

fn hex(bytes: &[u8]) -> String {
    bytes.iter().map(|b| format!("{b:02x}")).collect()
}

/// A secret from its 64 hexadecimal digits (a backup file's line).
pub fn parse(text: &str) -> Option<[u8; 32]> {
    let text = text.trim().as_bytes();
    if text.len() != 64 {
        return None;
    }
    let mut seed = [0; 32];
    for (i, pair) in text.chunks(2).enumerate() {
        let digit = |c: u8| (c as char).to_digit(16);
        seed[i] = (digit(pair[0])? * 16 + digit(pair[1])?) as u8;
    }
    Some(seed)
}

pub fn public_key(seed: &[u8; 32]) -> [u8; 32] {
    *KeyPair::from_seed(Seed::new(*seed)).pk
}

/// The fingerprint as PaperPaw writes it: the public key's first 8 bytes,
/// in groups of two.
pub fn fingerprint(key: &[u8; 32]) -> String {
    key[..8].chunks(2).map(|c| hex(c).to_uppercase()).collect::<Vec<_>>().join(" ")
}

/// The trailer that signs `file` (a plugin file without one) with `seed`.
// For plugins with code, once the workshop packs them for the store.
#[allow(dead_code)]
pub fn sign(file: &[u8], seed: &[u8; 32]) -> [u8; TRAILER_LEN] {
    let pair = KeyPair::from_seed(Seed::new(*seed));
    let signed_len = u32::try_from(file.len()).unwrap_or(u32::MAX);
    let mut trailer = [0u8; TRAILER_LEN];
    trailer[..4].copy_from_slice(&MAGIC);
    trailer[4..6].copy_from_slice(&FORMAT.to_le_bytes());
    trailer[8..12].copy_from_slice(&signed_len.to_le_bytes());
    trailer[12..44].copy_from_slice(&*pair.pk);
    let mut message = Vec::with_capacity(DOMAIN.len() + file.len() + 44);
    message.extend_from_slice(DOMAIN);
    message.extend_from_slice(file);
    message.extend_from_slice(&trailer[..44]);
    trailer[44..108].copy_from_slice(&*pair.sk.sign(&message, None));
    trailer
}

/// The author's keys and their record, in `dir` (the app's folder).
pub struct Author<'a> {
    pub secrets: &'a dyn Secrets,
    pub dir: PathBuf,
}

impl Author<'_> {
    fn record_file(&self) -> PathBuf {
        self.dir.join("author.json")
    }

    fn record(&self) -> Record {
        std::fs::read_to_string(self.record_file())
            .ok()
            .and_then(|text| serde_json::from_str(&text).ok())
            .unwrap_or_default()
    }

    fn keep_record(&self, record: &Record) -> Result<(), String> {
        std::fs::create_dir_all(&self.dir).map_err(|e| e.to_string())?;
        let text = serde_json::to_string_pretty(record).map_err(|e| e.to_string())?;
        std::fs::write(self.record_file(), text).map_err(|e| e.to_string())
    }

    /// The secret, if there is a key.
    pub fn seed(&self) -> Result<Option<[u8; 32]>, String> {
        match self.secrets.get()? {
            None => Ok(None),
            Some(text) => parse(&text).map(Some).ok_or_else(|| "the author key in the keychain is damaged".to_string()),
        }
    }

    pub fn status(&self) -> Result<Status, String> {
        let Some(seed) = self.seed()? else { return Ok(Status::default()) };
        let key = public_key(&seed);
        let record = self.record();
        let backed_up = if record.public == hex(&key) { record.backed_up } else { None };
        Ok(Status { public: Some(hex(&key)), fingerprint: Some(fingerprint(&key)), backed_up })
    }

    /// Makes the key, if there is none yet (one key for every plugin).
    pub fn create(&self) -> Result<Status, String> {
        if self.seed()?.is_none() {
            let seed = Seed::generate();
            self.secrets.set(&hex(&*seed))?;
            self.keep_record(&Record { public: hex(&public_key(&seed)), backed_up: None })?;
        }
        self.status()
    }

    /// Saves the backup file at `path`, and remembers when.
    pub fn back_up(&self, path: &Path) -> Result<Status, String> {
        let seed = self.seed()?.ok_or("there is no author key yet")?;
        std::fs::write(path, format!("{}\n", hex(&seed))).map_err(|e| format!("{}: {e}", path.display()))?;
        // Read back: a backup that cannot be read is no backup.
        let back = std::fs::read_to_string(path).map_err(|e| format!("{}: {e}", path.display()))?;
        if parse(&back) != Some(seed) {
            return Err(format!("{}: the backup could not be read back", path.display()));
        }
        self.keep_record(&Record { public: hex(&public_key(&seed)), backed_up: Some(now()) })?;
        self.status()
    }

    /// Takes the key from a backup file (another computer's). A different
    /// key already here is never replaced.
    pub fn import(&self, path: &Path) -> Result<Status, String> {
        let text = std::fs::read_to_string(path).map_err(|e| format!("{}: {e}", path.display()))?;
        let seed = parse(&text).ok_or("this file is not an author key (64 hexadecimal digits)")?;
        match self.seed()? {
            Some(here) if here == seed => {}
            Some(_) => return Err("this computer has a different author key already: it is not replaced".into()),
            None => self.secrets.set(&hex(&seed))?,
        }
        self.keep_record(&Record { public: hex(&public_key(&seed)), backed_up: Some(now()) })?;
        self.status()
    }
}

fn author() -> Result<Author<'static>, String> {
    Ok(Author { secrets: &Keychain::AUTHOR, dir: paths::app_data()? })
}

#[tauri::command]
pub fn author_status() -> Result<Status, String> {
    author()?.status()
}

#[tauri::command]
pub fn author_create() -> Result<Status, String> {
    author()?.create()
}

#[tauri::command]
pub fn author_backup(path: String) -> Result<Status, String> {
    author()?.back_up(Path::new(&path))
}

#[tauri::command]
pub fn author_import(path: String) -> Result<Status, String> {
    author()?.import(Path::new(&path))
}

#[cfg(test)]
mod tests {
    use std::cell::RefCell;

    use super::*;

    #[derive(Default)]
    struct Memory(RefCell<Option<String>>);

    impl Secrets for Memory {
        fn get(&self) -> Result<Option<String>, String> {
            Ok(self.0.borrow().clone())
        }
        fn set(&self, secret: &str) -> Result<(), String> {
            *self.0.borrow_mut() = Some(secret.to_string());
            Ok(())
        }
    }

    #[test]
    fn signs_as_paperpaw_native_does() {
        // paperpaw-native's signature::sign of this file with this seed
        // (paperpaw 929612bf), byte for byte.
        let trailer = sign(b"PaperPaw workshop signing test file", &[7; 32]);
        assert_eq!(
            hex(&trailer),
            "50504e530100000023000000ea4a6c63e29c520abef5507b132ec5f9954776aebebe7b92421eea691446d22c\
             a20446e926b7e9ed4c3d91d77ec2b4eb2440843599ef2cdb59962af1376c1b0a7488a48b68dc366d62a98bc7a1268e80cd77618e591bf09940f2cfaaff23760f00000000"
        );
        assert_eq!(fingerprint(&public_key(&[7; 32])), "EA4A 6C63 E29C 520A");
    }

    /// The system's own keychain, under entries of the test's own (the
    /// person's author key is never touched): made, read back, backed up,
    /// carried to a second entry, then removed.
    #[test]
    #[ignore = "uses the system's keychain: cargo test -- --ignored"]
    fn the_keychain_keeps_the_key() {
        let dir = tempfile::tempdir().unwrap();
        let first = Keychain { account: "author-key-test-1" };
        let second = Keychain { account: "author-key-test-2" };
        let clear = |k: &Keychain| match k.entry().unwrap().delete_credential() {
            Ok(()) | Err(keyring::Error::NoEntry) => {}
            Err(e) => panic!("{e}"),
        };
        clear(&first);
        clear(&second);
        let here = Author { secrets: &first, dir: dir.path().join("one") };
        let made = here.create().unwrap();
        // Read back from the keychain, not from memory.
        let again = Author { secrets: &Keychain { account: "author-key-test-1" }, dir: dir.path().join("one") };
        assert_eq!(again.status().unwrap().public, made.public);
        let file = dir.path().join("backup.key");
        here.back_up(&file).unwrap();
        let there = Author { secrets: &second, dir: dir.path().join("two") };
        assert_eq!(there.import(&file).unwrap().public, made.public);
        assert_eq!(second.get().unwrap(), first.get().unwrap());
        clear(&first);
        clear(&second);
        assert_eq!(first.get().unwrap(), None);
    }

    #[test]
    fn a_key_is_made_once_backed_up_and_carried_to_another_computer() {
        let dir = tempfile::tempdir().unwrap();
        let here = Memory::default();
        let author = Author { secrets: &here, dir: dir.path().join("app") };
        assert_eq!(author.status().unwrap(), Status::default());

        let made = author.create().unwrap();
        assert!(made.public.is_some() && made.backed_up.is_none());
        assert_eq!(author.create().unwrap().public, made.public, "never a second key");

        let file = dir.path().join("paperpaw-author.key");
        let backed = author.back_up(&file).unwrap();
        assert!(backed.backed_up.is_some());
        let text = std::fs::read_to_string(&file).unwrap();
        assert_eq!(text.trim().len(), 64, "the same kind of file as paperpaw-sign's");

        // Another computer: the key from the backup, the same public key.
        let there = Memory::default();
        let other = Author { secrets: &there, dir: dir.path().join("other") };
        let carried = other.import(&file).unwrap();
        assert_eq!(carried.public, made.public);
        assert!(carried.backed_up.is_some());

        // A different key is never replaced; a file that is no key is said.
        let third = Memory::default();
        let author3 = Author { secrets: &third, dir: dir.path().join("third") };
        author3.create().unwrap();
        assert!(author3.import(&file).unwrap_err().contains("different author key"));
        std::fs::write(dir.path().join("x.key"), "hello").unwrap();
        assert!(other.import(&dir.path().join("x.key")).is_err());
    }
}
