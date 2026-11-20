//! Which PaperPaw the workshop makes plugins for, chosen by the person and
//! read at run time, so that a new PaperPaw release needs no new workshop.
//!
//! PaperPaw's plugin interface 7 only grows: a plugin built against minor N
//! of it runs on every firmware whose minor is N or more (ADR 0034). Each
//! release says its minor in `paperpaw-<device>-<version>-abi.txt` (two
//! lines, `interface: 7` and `minor: N`) and brings, signed by the release
//! key, the emulator with `paperpaw-dev` and `paperpaw-sign` for each
//! computer (`paperpaw-emu-<version>-<target>.zip`) and the handbook
//! (`paperpaw-handbook-<version>.zip`: the SDK's api and source of that
//! release). From those:
//!
//! - the list of releases comes from GitHub's releases of PaperPaw, kept
//!   in the app's folder (`versions/releases.json`; asked again after six
//!   hours, and kept when offline);
//! - the person chooses the newest (the default) or one release; plugins
//!   are then built with that release's `paperpaw-dev` and so against the
//!   SDK of that version, and tried in that release's emulator, fetched
//!   once into `emulators/<version>/` (SHA-256 and the release key's
//!   signature checked first, as scripts/paperpaw-release.mjs does); a
//!   release without an emulator for this computer is tried in the newest
//!   one of the same interface that is not older (its minor is the same
//!   or more);
//! - the handbook's SDK items of the chosen release are read from its
//!   handbook zip (`versions_handbook`), so the AI is told only of what
//!   that SDK has.
//!
//! Nothing here sends anything but the request for a public file.

use std::cmp::Ordering;
use std::collections::BTreeMap;
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use std::time::Duration;

use serde::{Deserialize, Serialize};
use serde_json::Value;

/// PaperPaw's repository.
pub const REPO: &str = "hthoene/paperpaw";
/// The plugin interface the workshop makes plugins for.
pub const INTERFACE: u16 = 7;
/// PaperPaw's release key (fingerprint 55A9 F626 DB17 EB90), as
/// scripts/paperpaw-release.mjs pins it: not taken from a release.
const RELEASE_KEYS: [&str; 1] = ["55a9f626db17eb9058707323d29f52470bfcd09638898e17bd01784ef9df0c51"];
/// What the list is kept for before it is asked again.
const FRESH: u64 = 6 * 3600;
const TIMEOUT: Duration = Duration::from_secs(60);

// ---- versions ----

/// A PaperPaw version, `0.6.0` or `0.6.0-beta.2`, in SemVer's order: a
/// pre-release before its release, `alpha` before `beta` before `dev`
/// before `pre` before `rc`, a number after the name below those without.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Version {
    numbers: [u32; 3],
    pre: Option<(usize, Option<u32>)>,
}

const PRE_NAMES: [&str; 5] = ["alpha", "beta", "dev", "pre", "rc"];

impl Version {
    pub fn parse(text: &str) -> Option<Version> {
        let text = text.trim().trim_start_matches('v');
        let (core, pre) = match text.split_once('-') {
            Some((core, pre)) => (core, Some(pre)),
            None => (text, None),
        };
        let mut numbers = [0u32; 3];
        let mut parts = core.split('.');
        for slot in numbers.iter_mut() {
            *slot = parts.next()?.parse().ok()?;
        }
        if parts.next().is_some() {
            return None;
        }
        let pre = match pre {
            None => None,
            Some(pre) => {
                let (name, number) = match pre.split_once('.') {
                    Some((name, number)) => (name, Some(number.parse().ok()?)),
                    None => (pre, None),
                };
                Some((PRE_NAMES.iter().position(|n| *n == name)?, number))
            }
        };
        Some(Version { numbers, pre })
    }
}

impl Ord for Version {
    fn cmp(&self, other: &Self) -> Ordering {
        self.numbers.cmp(&other.numbers).then_with(|| match (&self.pre, &other.pre) {
            (None, None) => Ordering::Equal,
            (None, Some(_)) => Ordering::Greater,
            (Some(_), None) => Ordering::Less,
            (Some(a), Some(b)) => a.cmp(b),
        })
    }
}

impl PartialOrd for Version {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

/// A version's text as a folder's name: only what a version is made of.
pub fn plain_version(text: &str) -> bool {
    Version::parse(text).is_some() && text.chars().all(|c| c.is_ascii_alphanumeric() || c == '.' || c == '-')
}

// ---- releases ----

/// A PaperPaw release the workshop can make plugins for.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Release {
    /// `0.6.0-beta.2`
    pub version: String,
    pub prerelease: bool,
    /// The plugin interface (0 where the release names none: not offered).
    pub interface: u16,
    /// The newest minor of it the release's firmware has.
    pub minor: u16,
    /// Whether the release has the signed emulator for this computer.
    pub emulator: bool,
    /// Whether the release has the signed handbook.
    pub handbook: bool,
}

impl Release {
    fn version(&self) -> Option<Version> {
        Version::parse(&self.version)
    }

    /// Whether plugins can be made for it.
    pub fn offered(&self) -> bool {
        self.interface == INTERFACE
    }
}

/// The interface and minor a release's `-abi.txt` names: exactly the two
/// lines `interface: N` and `minor: N`.
pub fn abi(text: &str) -> Option<(u16, u16)> {
    let lines: Vec<&str> = text.lines().map(str::trim).filter(|l| !l.is_empty()).collect();
    let [interface, minor] = lines.as_slice() else { return None };
    Some((interface.strip_prefix("interface:")?.trim().parse().ok()?, minor.strip_prefix("minor:")?.trim().parse().ok()?))
}

/// Whether a plugin that needs `needs_minor` of the interface runs on the
/// firmware of `release`: the same interface, and a minor that is not
/// newer than the firmware's (a minor only appends).
pub fn runs_on(interface: u16, needs_minor: u16, release: &Release) -> bool {
    release.interface == interface && needs_minor <= release.minor
}

/// How a release is chosen.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "mode", content = "version", rename_all = "lowercase")]
pub enum Pick {
    /// The newest release that is offered, betas included while the
    /// releases are betas (a release is chosen over its own betas).
    Latest,
    /// This one.
    Pinned(String),
    /// The oldest release whose minor has what the plugin uses.
    Oldest(u16),
}

/// The release `pick` names among `releases`, those that are offered only.
pub fn choose<'a>(releases: &'a [Release], pick: &Pick) -> Option<&'a Release> {
    let mut offered: Vec<(Version, &Release)> = releases.iter().filter(|r| r.offered()).filter_map(|r| Some((r.version()?, r))).collect();
    offered.sort_by(|a, b| a.0.cmp(&b.0));
    match pick {
        Pick::Latest => offered.last().map(|(_, r)| *r),
        Pick::Pinned(version) => offered.iter().find(|(_, r)| &r.version == version).map(|(_, r)| *r),
        Pick::Oldest(needs) => offered.iter().find(|(_, r)| runs_on(INTERFACE, *needs, r)).map(|(_, r)| *r),
    }
}

/// The release whose emulator tries plugins made for `target`: its own,
/// else the newest of the same interface that is not older (its minor is
/// the target's or more) and has one.
pub fn emulator_for<'a>(releases: &'a [Release], target: &'a Release) -> Option<&'a Release> {
    if target.emulator {
        return Some(target);
    }
    let mut able: Vec<(Version, &Release)> = releases
        .iter()
        .filter(|r| r.emulator && r.interface == target.interface && r.minor >= target.minor)
        .filter_map(|r| Some((r.version()?, r)))
        .collect();
    able.sort_by(|a, b| a.0.cmp(&b.0));
    able.last().map(|(_, r)| *r)
}

// ---- GitHub ----

/// What the list of releases keeps.
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct Cache {
    /// Seconds since 1970 when it was asked.
    pub fetched: u64,
    pub releases: Vec<Release>,
}

/// The name of the computer's emulator zip's target.
pub fn computer() -> &'static str {
    if cfg!(target_os = "windows") {
        "windows-x64"
    } else if cfg!(target_os = "macos") {
        if cfg!(target_arch = "aarch64") { "macos-arm64" } else { "macos-x64" }
    } else {
        "linux-x64"
    }
}

fn emulator_zip(version: &str, computer: &str) -> String {
    format!("paperpaw-emu-{version}-{computer}.zip")
}

fn handbook_zip(version: &str) -> String {
    format!("paperpaw-handbook-{version}.zip")
}

fn download(version: &str, name: &str) -> String {
    format!("https://github.com/{REPO}/releases/download/v{version}/{name}")
}

/// Where files are fetched from: tests hand in their own.
pub trait Fetch {
    fn get(&self, url: &str, max: usize) -> Result<Vec<u8>, String>;
}

/// The network, for public files only: no account, no key.
pub struct Network;

impl Fetch for Network {
    fn get(&self, url: &str, max: usize) -> Result<Vec<u8>, String> {
        let answer = ureq::AgentBuilder::new()
            .timeout(TIMEOUT)
            .user_agent("paperpaw-workshop")
            .build()
            .get(url)
            .set("accept", "application/vnd.github+json")
            .call()
            .map_err(|e| format!("{url}: {e}"))?;
        let mut bytes = Vec::new();
        answer.into_reader().take(max as u64 + 1).read_to_end(&mut bytes).map_err(|e| format!("{url}: {e}"))?;
        if bytes.len() > max {
            return Err(format!("{url}: larger than {} MB", max >> 20));
        }
        Ok(bytes)
    }
}

/// What a release's `assets` say of its files, for `computer`.
fn has(assets: &[String], name: &str) -> bool {
    [name.to_string(), format!("{name}.sha256"), format!("{name}.sig")].iter().all(|n| assets.contains(n))
}

/// The releases of GitHub's answer `list` (`GET /repos/<repo>/releases`),
/// each with the name of its `-abi.txt` asset, if it has one. Drafts are
/// not in it. A release whose version is none is left out.
fn listed(list: &Value, computer: &str) -> Vec<(Release, Option<String>)> {
    let mut out = Vec::new();
    for item in list.as_array().into_iter().flatten() {
        if item["draft"].as_bool().unwrap_or(false) {
            continue;
        }
        let Some(tag) = item["tag_name"].as_str() else { continue };
        let version = tag.trim_start_matches('v').to_string();
        if Version::parse(&version).is_none() || !plain_version(&version) {
            continue;
        }
        let assets: Vec<String> = item["assets"].as_array().into_iter().flatten().filter_map(|a| a["name"].as_str().map(str::to_string)).collect();
        // Any device's: a release gives every device the same interface and minor.
        let abi_name = assets.iter().filter(|n| n.starts_with("paperpaw-") && n.ends_with(&format!("-{version}-abi.txt"))).min().cloned();
        out.push((
            Release {
                prerelease: item["prerelease"].as_bool().unwrap_or(false) || version.contains('-'),
                emulator: has(&assets, &emulator_zip(&version, computer)),
                handbook: has(&assets, &handbook_zip(&version)),
                interface: 0,
                minor: 0,
                version,
            },
            abi_name,
        ));
    }
    out
}

/// The cache brought up to date: GitHub's list asked, the `-abi.txt` of a
/// release fetched once (what a release says of its minor does not
/// change); one that cannot be fetched now is asked again next time.
pub fn refresh(fetch: &dyn Fetch, old: &Cache, now: u64, computer: &str) -> Result<Cache, String> {
    let body = fetch.get(&format!("https://api.github.com/repos/{REPO}/releases?per_page=100"), 8 << 20)?;
    let list: Value = serde_json::from_slice(&body).map_err(|e| format!("GitHub's list of releases: {e}"))?;
    let mut releases = Vec::new();
    for (mut release, abi_name) in listed(&list, computer) {
        if let Some(known) = old.releases.iter().find(|r| r.version == release.version) {
            release.interface = known.interface;
            release.minor = known.minor;
            releases.push(release);
            continue;
        }
        let Some(name) = abi_name else { continue };
        let Ok(text) = fetch.get(&download(&release.version, &name), 4096) else { continue };
        // A release before the plugin interface names a fingerprint only.
        let (interface, minor) = abi(&String::from_utf8_lossy(&text)).unwrap_or((0, 0));
        release.interface = interface;
        release.minor = minor;
        releases.push(release);
    }
    Ok(Cache { fetched: now, releases })
}

// ---- signed files ----

fn hex(bytes: &[u8]) -> String {
    bytes.iter().map(|b| format!("{b:02x}")).collect()
}

/// Whether `signature` (the trailer alone, 128 bytes) is a release key's
/// signature of the asset `data`; why not, where it is not. As
/// paperpaw-update's `check_apart` and scripts/paperpaw-release.mjs.
pub fn check_asset(data: &[u8], signature: &[u8], keys: &[&str]) -> Result<(), String> {
    const DOMAIN: &[u8] = b"paperpaw-asset-v1\n";
    if signature.len() != 128 || &signature[..8] != b"PaperPaw" {
        return Err("not an asset's signature".into());
    }
    let word = |at: usize| u32::from_le_bytes([signature[at], signature[at + 1], signature[at + 2], signature[at + 3]]);
    if word(8) != 1 {
        return Err("a signature of a newer format".into());
    }
    let mut signed = DOMAIN.to_vec();
    signed.extend_from_slice(data);
    if word(12) as usize != signed.len() {
        return Err("signed for another length".into());
    }
    let key = &signature[16..48];
    if !keys.contains(&hex(key).as_str()) {
        return Err(format!("signed by another key ({})", hex(key)));
    }
    signed.extend_from_slice(&signature[..48]);
    let public = ed25519_compact::PublicKey::from_slice(key).map_err(|e| e.to_string())?;
    let signature = ed25519_compact::Signature::from_slice(&signature[48..112]).map_err(|e| e.to_string())?;
    public.verify(&signed, &signature).map_err(|_| "the signature does not hold".to_string())
}

/// The SHA-256 a `.sha256` file names (`<hex>  <name>`).
fn checksum(text: &str) -> Option<String> {
    let word = text.split_whitespace().next()?.to_lowercase();
    (word.len() == 64 && word.bytes().all(|b| b.is_ascii_hexdigit())).then_some(word)
}

/// A release asset, its checksum and its signature fetched and checked
/// against `keys`: its bytes only if both hold.
fn signed(fetch: &dyn Fetch, version: &str, name: &str, max: usize, keys: &[&str]) -> Result<Vec<u8>, String> {
    use sha2::{Digest, Sha256};
    let url = download(version, name);
    let data = fetch.get(&url, max)?;
    let sum = fetch.get(&format!("{url}.sha256"), 4096)?;
    let sig = fetch.get(&format!("{url}.sig"), 4096)?;
    let got = hex(&Sha256::digest(&data));
    if checksum(&String::from_utf8_lossy(&sum)).as_deref() != Some(got.as_str()) {
        return Err(format!("{name}: its SHA-256 is {got}, its .sha256 says otherwise"));
    }
    check_asset(&data, &sig, keys).map_err(|why| format!("{name}: {why}"))?;
    Ok(data)
}

// ---- on the computer ----

/// Where the versions' files are.
pub struct Folders {
    pub emulators: PathBuf,
    pub handbooks: PathBuf,
    pub state: PathBuf,
}

impl Folders {
    pub fn app() -> Result<Folders, String> {
        let data = crate::paths::app_data()?;
        Ok(Folders { emulators: data.join("emulators"), handbooks: data.join("handbooks"), state: data.join("versions") })
    }

    fn program(&self, version: &str) -> PathBuf {
        self.emulators.join(version).join(format!("paperpaw-emu{}", std::env::consts::EXE_SUFFIX))
    }
}

/// What the person chose, kept in `versions/choice.json`; the newest while
/// nothing was chosen.
pub fn load_choice(folders: &Folders) -> Pick {
    std::fs::read(folders.state.join("choice.json")).ok().and_then(|b| serde_json::from_slice(&b).ok()).unwrap_or(Pick::Latest)
}

pub fn save_choice(folders: &Folders, pick: &Pick) -> Result<(), String> {
    write_file(&folders.state.join("choice.json"), &serde_json::to_vec_pretty(pick).map_err(|e| e.to_string())?)
}

fn load_cache(folders: &Folders) -> Cache {
    std::fs::read(folders.state.join("releases.json")).ok().and_then(|b| serde_json::from_slice(&b).ok()).unwrap_or_default()
}

fn write_file(path: &Path, bytes: &[u8]) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| format!("{}: {e}", parent.display()))?;
    }
    let part = path.with_extension("part");
    std::fs::File::create(&part).and_then(|mut f| f.write_all(bytes)).map_err(|e| format!("{}: {e}", part.display()))?;
    std::fs::rename(&part, path).map_err(|e| format!("{}: {e}", path.display()))
}

/// The version of the emulator in use: the one `emulators/current.txt`
/// names, if it is there (see `paths::emulator_program`).
pub fn current(folders: &Folders) -> Option<String> {
    let version = std::fs::read_to_string(folders.emulators.join("current.txt")).ok()?.trim().to_string();
    (plain_version(&version) && folders.program(&version).exists()).then_some(version)
}

/// The emulator zip's files that are kept, by name.
const KEPT: [&str; 5] = ["paperpaw-emu", "paperpaw-dev", "paperpaw-sign", "LICENSE", "NOTICE"];

/// Takes `name` out of the zip `data` into `folder`: the program files
/// and the licences only, each as a plain name.
fn unpack(data: &[u8], folder: &Path) -> Result<(), String> {
    let mut zip = zip::ZipArchive::new(std::io::Cursor::new(data)).map_err(|e| e.to_string())?;
    std::fs::create_dir_all(folder).map_err(|e| e.to_string())?;
    let exe = std::env::consts::EXE_SUFFIX;
    for i in 0..zip.len() {
        let mut file = zip.by_index(i).map_err(|e| e.to_string())?;
        let name = file.name().rsplit('/').next().unwrap_or_default().to_string();
        let stem = name.strip_suffix(exe).unwrap_or(&name);
        if file.is_dir() || file.name().contains("..") || !KEPT.contains(&stem) {
            continue;
        }
        let mut bytes = Vec::new();
        file.by_ref().take(512 << 20).read_to_end(&mut bytes).map_err(|e| e.to_string())?;
        let path = folder.join(&name);
        std::fs::write(&path, &bytes).map_err(|e| format!("{}: {e}", path.display()))?;
        #[cfg(unix)]
        if !name.contains('.') && stem.starts_with("paperpaw-") {
            use std::os::unix::fs::PermissionsExt;
            let _ = std::fs::set_permissions(&path, std::fs::Permissions::from_mode(0o755));
        }
    }
    Ok(())
}

/// PaperPaw `release`'s emulator, with its tools, in `emulators/<version>/`
/// (fetched and checked once), and made the one in use.
pub fn install(fetch: &dyn Fetch, folders: &Folders, release: &Release, computer: &str, keys: &[&str]) -> Result<(), String> {
    if !plain_version(&release.version) {
        return Err(format!("{}: not a version", release.version));
    }
    if !folders.program(&release.version).exists() {
        let data = signed(fetch, &release.version, &emulator_zip(&release.version, computer), 300 << 20, keys)?;
        let part = folders.emulators.join(format!("{}.part", release.version));
        let _ = std::fs::remove_dir_all(&part);
        unpack(&data, &part)?;
        let target = folders.emulators.join(&release.version);
        let _ = std::fs::remove_dir_all(&target);
        std::fs::rename(&part, &target).map_err(|e| format!("{}: {e}", target.display()))?;
        if !folders.program(&release.version).exists() {
            return Err(format!("{}: no paperpaw-emu in it", emulator_zip(&release.version, computer)));
        }
    }
    write_file(&folders.emulators.join("current.txt"), release.version.as_bytes())
}

/// The release's handbook zip, fetched and checked once, kept in
/// `handbooks/<version>.zip`.
fn handbook_file(fetch: &dyn Fetch, folders: &Folders, version: &str, keys: &[&str]) -> Result<PathBuf, String> {
    if !plain_version(version) {
        return Err(format!("{version}: not a version"));
    }
    let path = folders.handbooks.join(format!("{version}.zip"));
    if !path.exists() {
        write_file(&path, &signed(fetch, version, &handbook_zip(version), 100 << 20, keys)?)?;
    }
    Ok(path)
}

/// The files of a handbook zip the SDK's items are made from, as the
/// handbook generator reads a PaperPaw tree: `crates/<crate>/api.txt` and
/// `crates/<crate>/src/**/*.rs` (`api/<crate>.txt`, `src/<crate>/…` in the
/// zip).
pub fn sdk_tree(zip_bytes: &[u8]) -> Result<BTreeMap<String, String>, String> {
    let mut zip = zip::ZipArchive::new(std::io::Cursor::new(zip_bytes)).map_err(|e| e.to_string())?;
    let mut out = BTreeMap::new();
    for i in 0..zip.len() {
        let mut file = zip.by_index(i).map_err(|e| e.to_string())?;
        let name = file.name().to_string();
        let Some((_, inside)) = name.split_once('/') else { continue };
        let mapped = if let Some(krate) = inside.strip_prefix("api/").and_then(|r| r.strip_suffix(".txt")) {
            (!krate.contains('/')).then(|| format!("crates/{krate}/api.txt"))
        } else if let Some(rest) = inside.strip_prefix("src/") {
            rest.split_once('/').filter(|(_, file)| file.ends_with(".rs")).map(|(krate, file)| format!("crates/{krate}/src/{file}"))
        } else {
            None
        };
        let Some(mapped) = mapped.filter(|m| !m.contains("..")) else { continue };
        let mut text = String::new();
        file.by_ref().take(8 << 20).read_to_string(&mut text).map_err(|e| format!("{name}: {e}"))?;
        out.insert(mapped, text);
    }
    Ok(out)
}

// ---- what the window sees ----

/// The state of the choice, as Settings shows it.
#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct State {
    /// The releases that are offered, newest first.
    pub releases: Vec<Release>,
    pub pick: Pick,
    /// The release plugins are made for.
    pub target: Option<Release>,
    /// The release whose emulator and `paperpaw-dev` are in use: the
    /// target's, or where it has none for this computer the newest that
    /// is not older.
    pub emulator: Option<String>,
    /// The version of the emulator in use now.
    pub using: Option<String>,
    /// When the list was asked last (seconds since 1970), if ever.
    pub checked: Option<u64>,
    /// Why the list or the emulator could not be brought up to date.
    pub problem: Option<String>,
}

fn now() -> u64 {
    std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).map(|d| d.as_secs()).unwrap_or(0)
}

/// The state, the list asked again when `refresh` or when it is older
/// than six hours, and the emulator of the target made the one in use if
/// `apply` (what the person's choice asks for). Offline, what was kept
/// stands.
pub fn state(fetch: &dyn Fetch, folders: &Folders, refresh_list: bool, apply: bool, computer: &str, keys: &[&str]) -> State {
    let mut cache = load_cache(folders);
    let mut problem = None;
    if refresh_list || now().saturating_sub(cache.fetched) > FRESH {
        match refresh(fetch, &cache, now(), computer) {
            Ok(fresh) => {
                let _ = write_file(&folders.state.join("releases.json"), &serde_json::to_vec_pretty(&fresh).unwrap_or_default());
                cache = fresh;
            }
            Err(e) => problem = Some(e),
        }
    }
    let pick = load_choice(folders);
    let target = choose(&cache.releases, &pick).cloned();
    let emulator = target.as_ref().and_then(|t| emulator_for(&cache.releases, t)).cloned();
    if apply {
        if let Some(release) = &emulator {
            if current(folders).as_deref() != Some(&release.version) {
                if let Err(e) = install(fetch, folders, release, computer, keys) {
                    problem = Some(e);
                }
            }
        }
    }
    if let (Some(target), None, None) = (&target, &emulator, &problem) {
        problem = Some(format!("PaperPaw {} has no emulator for this computer yet, and no newer release that could run its plugins has one.", target.version));
    }
    let mut releases: Vec<Release> = cache.releases.iter().filter(|r| r.offered()).cloned().collect();
    releases.sort_by(|a, b| b.version().cmp(&a.version()));
    State { releases, pick, target, emulator: emulator.map(|r| r.version), using: current(folders), checked: (cache.fetched > 0).then_some(cache.fetched), problem }
}

#[tauri::command]
pub async fn versions_state(refresh: bool, apply: bool) -> Result<State, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let folders = Folders::app()?;
        Ok(state(&Network, &folders, refresh, apply, computer(), &RELEASE_KEYS))
    })
    .await
    .map_err(|e| e.to_string())?
}

/// Chooses the release: its emulator is fetched and put in use at once
/// (the reader beside the conversation starts again with the next request).
#[tauri::command]
pub async fn versions_choose(emulator: tauri::State<'_, crate::emulator::Emulator>, pick: Pick) -> Result<State, String> {
    let before = current(&Folders::app()?);
    let state = tauri::async_runtime::spawn_blocking(move || {
        let folders = Folders::app()?;
        save_choice(&folders, &pick)?;
        Ok::<_, String>(state(&Network, &folders, false, true, computer(), &RELEASE_KEYS))
    })
    .await
    .map_err(|e| e.to_string())??;
    if state.using != before {
        emulator.quit();
    }
    Ok(state)
}

/// The SDK's files of release `version` (api lists and source), as
/// `sdk_tree` names them, for the window to make the AI's items of.
#[tauri::command]
pub async fn versions_handbook(version: String) -> Result<BTreeMap<String, String>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let folders = Folders::app()?;
        let path = handbook_file(&Network, &folders, &version, &RELEASE_KEYS)?;
        sdk_tree(&std::fs::read(&path).map_err(|e| format!("{}: {e}", path.display()))?)
    })
    .await
    .map_err(|e| e.to_string())?
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::cell::RefCell;
    use std::collections::HashMap;

    fn release(version: &str, minor: u16, emulator: bool) -> Release {
        Release { version: version.into(), prerelease: version.contains('-'), interface: 7, minor, emulator, handbook: true }
    }

    #[test]
    fn versions_are_in_semvers_order() {
        let order = ["0.5.0", "0.6.0-alpha", "0.6.0-beta", "0.6.0-beta.2", "0.6.0-beta.10", "0.6.0-rc.1", "0.6.0", "0.6.1", "0.10.0", "1.0.0"];
        let parsed: Vec<Version> = order.iter().map(|v| Version::parse(v).unwrap()).collect();
        assert!(parsed.windows(2).all(|w| w[0] < w[1]), "{order:?}");
        for bad in ["", "0.6", "0.6.0.1", "0.6.0-gamma", "a.b.c", "0.6.0-beta.x"] {
            assert!(Version::parse(bad).is_none(), "{bad}");
        }
        assert!(plain_version("0.6.0-beta.2") && !plain_version("../0.6.0") && !plain_version("0.6.0/x"));
    }

    #[test]
    fn an_abi_file_is_two_lines() {
        assert_eq!(abi("interface: 7\nminor: 3\n"), Some((7, 3)));
        assert_eq!(abi("interface: 7\nminor: x\n"), None);
        assert_eq!(abi("interface: 7\n"), None);
        assert_eq!(abi("0005a9ec2b916220\n"), None);
        assert_eq!(abi("interface: 7\nminor: 1\nextra: 1\n"), None);
    }

    #[test]
    fn a_plugin_runs_on_the_same_interface_and_a_minor_that_is_not_older() {
        let firmware = release("0.6.0", 3, true);
        assert!(runs_on(7, 0, &firmware) && runs_on(7, 3, &firmware));
        assert!(!runs_on(7, 4, &firmware), "needs a newer PaperPaw");
        assert!(!runs_on(6, 0, &firmware), "another interface");
    }

    #[test]
    fn the_newest_oldest_or_pinned_release_is_chosen() {
        let list = vec![
            release("0.6.0-beta.2", 1, true),
            release("0.6.0", 2, true),
            Release { interface: 0, ..release("0.5.0", 0, true) },
            release("0.7.0-beta.1", 3, true),
        ];
        assert_eq!(choose(&list, &Pick::Latest).unwrap().version, "0.7.0-beta.1");
        assert_eq!(choose(&list, &Pick::Pinned("0.6.0".into())).unwrap().version, "0.6.0");
        assert!(choose(&list, &Pick::Pinned("0.5.0".into())).is_none(), "no interface 7");
        assert!(choose(&list, &Pick::Pinned("9.9.9".into())).is_none());
        assert_eq!(choose(&list, &Pick::Oldest(0)).unwrap().version, "0.6.0-beta.2");
        assert_eq!(choose(&list, &Pick::Oldest(2)).unwrap().version, "0.6.0");
        assert_eq!(choose(&list, &Pick::Oldest(3)).unwrap().version, "0.7.0-beta.1");
        assert!(choose(&list, &Pick::Oldest(4)).is_none());
        assert!(choose(&[], &Pick::Latest).is_none());
    }

    #[test]
    fn a_release_without_an_emulator_is_tried_in_the_newest_that_is_not_older() {
        let list = vec![release("0.6.0", 1, true), release("0.6.1", 2, true), release("0.7.0", 3, false), release("0.7.1", 1, true)];
        assert!(emulator_for(&list, &list[2]).is_none(), "minor 3 is more than any emulator's");
        let two = release("0.7.0-beta.1", 2, false);
        assert_eq!(emulator_for(&list, &two).unwrap().version, "0.6.1", "the newest with minor 2 or more");
        let own = &list[0];
        assert_eq!(emulator_for(&list, own).unwrap().version, "0.6.0", "its own first");
        let older = release("0.6.5", 1, false);
        assert_eq!(emulator_for(&list, &older).unwrap().version, "0.7.1", "the newest with minor 1 or more");
        assert!(emulator_for(&[release("0.7.0", 3, false)], &release("0.7.0", 3, false)).is_none());
    }

    struct Fake {
        files: HashMap<String, Vec<u8>>,
        asked: RefCell<Vec<String>>,
    }

    impl Fetch for Fake {
        fn get(&self, url: &str, _max: usize) -> Result<Vec<u8>, String> {
            self.asked.borrow_mut().push(url.to_string());
            self.files.get(url).cloned().ok_or_else(|| format!("{url}: 404"))
        }
    }

    fn github() -> Fake {
        let list = serde_json::json!([
            {"tag_name": "v0.7.0-beta.1", "prerelease": true, "draft": false, "assets": [
                {"name": "paperpaw-x4-0.7.0-beta.1-abi.txt"},
                {"name": "paperpaw-emu-0.7.0-beta.1-linux-x64.zip"}, {"name": "paperpaw-emu-0.7.0-beta.1-linux-x64.zip.sha256"}]},
            {"tag_name": "v0.6.0", "prerelease": false, "draft": false, "assets": [
                {"name": "paperpaw-x4-0.6.0-abi.txt"}, {"name": "paperpaw-x4-pro-0.6.0-abi.txt"},
                {"name": "paperpaw-emu-0.6.0-linux-x64.zip"}, {"name": "paperpaw-emu-0.6.0-linux-x64.zip.sha256"}, {"name": "paperpaw-emu-0.6.0-linux-x64.zip.sig"},
                {"name": "paperpaw-handbook-0.6.0.zip"}, {"name": "paperpaw-handbook-0.6.0.zip.sha256"}, {"name": "paperpaw-handbook-0.6.0.zip.sig"}]},
            {"tag_name": "v0.5.0", "prerelease": false, "draft": false, "assets": [{"name": "paperpaw-x4-0.5.0-abi.txt"}]},
            {"tag_name": "v0.8.0", "prerelease": false, "draft": true, "assets": []},
            {"tag_name": "workshop-1", "prerelease": false, "draft": false, "assets": []},
            {"tag_name": "v0.4.0", "prerelease": false, "draft": false, "assets": []}
        ]);
        let mut files = HashMap::new();
        files.insert("https://api.github.com/repos/hthoene/paperpaw/releases?per_page=100".to_string(), list.to_string().into_bytes());
        for (v, text) in [("0.7.0-beta.1", "interface: 7\nminor: 2\n"), ("0.6.0", "interface: 7\nminor: 1\n"), ("0.5.0", "0005a9ec2b916220\n")] {
            let device = if v == "0.7.0-beta.1" || v == "0.5.0" { "x4" } else { "x4" };
            files.insert(download(v, &format!("paperpaw-{device}-{v}-abi.txt")), text.as_bytes().to_vec());
        }
        Fake { files, asked: RefCell::new(Vec::new()) }
    }

    #[test]
    fn the_list_is_read_from_github_and_what_is_known_is_not_asked_again() {
        let fake = github();
        let cache = refresh(&fake, &Cache::default(), 100, "linux-x64").unwrap();
        let by = |v: &str| cache.releases.iter().find(|r| r.version == v).cloned();
        assert_eq!(cache.fetched, 100);
        assert_eq!(by("0.7.0-beta.1"), Some(Release { version: "0.7.0-beta.1".into(), prerelease: true, interface: 7, minor: 2, emulator: false, handbook: false }));
        assert_eq!(by("0.6.0"), Some(release("0.6.0", 1, true)));
        assert_eq!(by("0.5.0").map(|r| (r.interface, r.offered())), Some((0, false)));
        assert!(by("0.4.0").is_none(), "no -abi.txt: not yet complete, asked again");
        assert!(by("0.8.0").is_none() && by("workshop-1").is_none());
        assert!(!by("0.7.0-beta.1").unwrap().emulator, "a checksum without a signature is no emulator");
        // Again: only the list is asked.
        fake.asked.borrow_mut().clear();
        let again = refresh(&fake, &cache, 200, "linux-x64").unwrap();
        assert_eq!(fake.asked.borrow().len(), 1);
        assert_eq!(again.releases, cache.releases);
        // And an emulator that is not for this computer.
        assert!(!refresh(&fake, &Cache::default(), 1, "windows-x64").unwrap().releases.iter().any(|r| r.emulator));
    }

    #[test]
    fn offline_the_kept_list_stands() {
        let dir = tempfile::tempdir().unwrap();
        let folders = Folders { emulators: dir.path().join("e"), handbooks: dir.path().join("h"), state: dir.path().join("v") };
        let fake = github();
        let first = state(&fake, &folders, true, false, "linux-x64", &[]);
        assert_eq!(first.target.as_ref().unwrap().version, "0.7.0-beta.1");
        assert_eq!(first.emulator, None, "the beta has no emulator, and 0.6.0's minor 1 is older than its 2");
        assert!(first.problem.as_deref().is_some_and(|p| p.contains("0.7.0-beta.1")), "{:?}", first.problem);
    }

    #[test]
    fn a_state_that_cannot_ask_keeps_the_list_and_says_why() {
        let dir = tempfile::tempdir().unwrap();
        let folders = Folders { emulators: dir.path().join("e"), handbooks: dir.path().join("h"), state: dir.path().join("v") };
        state(&github(), &folders, true, false, "linux-x64", &[]);
        let offline = Fake { files: HashMap::new(), asked: RefCell::new(Vec::new()) };
        let again = state(&offline, &folders, true, false, "linux-x64", &[]);
        assert_eq!(again.releases.len(), 2);
        assert!(again.problem.is_some());
        save_choice(&folders, &Pick::Pinned("0.6.0".into())).unwrap();
        assert_eq!(state(&offline, &folders, false, false, "linux-x64", &[]).target.unwrap().version, "0.6.0");
        assert_eq!(load_choice(&folders), Pick::Pinned("0.6.0".into()));
    }

    fn trailer(data: &[u8], seed: u8) -> (Vec<u8>, String) {
        let pair = ed25519_compact::KeyPair::from_seed(ed25519_compact::Seed::new([seed; 32]));
        let mut signed = b"paperpaw-asset-v1\n".to_vec();
        signed.extend_from_slice(data);
        let mut head = Vec::new();
        head.extend_from_slice(b"PaperPaw");
        head.extend_from_slice(&1u32.to_le_bytes());
        head.extend_from_slice(&(signed.len() as u32).to_le_bytes());
        head.extend_from_slice(pair.pk.as_ref());
        signed.extend_from_slice(&head);
        let mut out = head;
        out.extend_from_slice(pair.sk.sign(&signed, None).as_ref());
        out.resize(128, 0);
        (out, hex(pair.pk.as_ref()))
    }

    #[test]
    fn an_asset_is_taken_only_when_the_release_key_signed_it() {
        let data = b"an emulator, zipped";
        let (sig, key) = trailer(data, 1);
        assert_eq!(check_asset(data, &sig, &[&key]), Ok(()));
        assert_eq!(check_asset(b"another", &sig, &[&key]), Err("signed for another length".into()));
        let mut changed = data.to_vec();
        changed[0] ^= 1;
        assert_eq!(check_asset(&changed, &sig, &[&key]), Err("the signature does not hold".into()));
        assert!(check_asset(data, &sig, &[]).unwrap_err().starts_with("signed by another key"));
        assert_eq!(check_asset(data, &sig[..100], &[&key]), Err("not an asset's signature".into()));
        // The pinned key is a real one.
        assert!(ed25519_compact::PublicKey::from_slice(&(0..32).map(|i| u8::from_str_radix(&RELEASE_KEYS[0][2 * i..2 * i + 2], 16).unwrap()).collect::<Vec<_>>()).is_ok());
    }

    fn zip_of(files: &[(&str, &str)]) -> Vec<u8> {
        use zip::write::SimpleFileOptions;
        let mut out = std::io::Cursor::new(Vec::new());
        let mut zip = zip::ZipWriter::new(&mut out);
        for (name, text) in files {
            zip.start_file(*name, SimpleFileOptions::default()).unwrap();
            zip.write_all(text.as_bytes()).unwrap();
        }
        zip.finish().unwrap();
        out.into_inner()
    }

    #[test]
    fn an_emulator_is_fetched_checked_unpacked_and_put_in_use_once() {
        let exe = std::env::consts::EXE_SUFFIX;
        let zip = zip_of(&[(&format!("paperpaw-emu{exe}"), "emu"), (&format!("paperpaw-dev{exe}"), "dev"), ("LICENSE", "l"), ("evil.sh", "x"), ("../escape", "x")]);
        let (sig, key) = trailer(&zip, 2);
        let url = download("0.6.0", "paperpaw-emu-0.6.0-linux-x64.zip");
        let sum = {
            use sha2::{Digest, Sha256};
            format!("{}  paperpaw-emu-0.6.0-linux-x64.zip\n", hex(&Sha256::digest(&zip)))
        };
        let mut fake = Fake { files: HashMap::new(), asked: RefCell::new(Vec::new()) };
        fake.files.insert(url.clone(), zip);
        fake.files.insert(format!("{url}.sha256"), sum.into_bytes());
        fake.files.insert(format!("{url}.sig"), sig);
        let dir = tempfile::tempdir().unwrap();
        let folders = Folders { emulators: dir.path().join("e"), handbooks: dir.path().join("h"), state: dir.path().join("v") };
        let release = release("0.6.0", 1, true);
        install(&fake, &folders, &release, "linux-x64", &[&key]).unwrap();
        assert_eq!(current(&folders).as_deref(), Some("0.6.0"));
        let inside = folders.emulators.join("0.6.0");
        assert!(inside.join(format!("paperpaw-dev{exe}")).exists() && inside.join("LICENSE").exists());
        assert!(!inside.join("evil.sh").exists() && !dir.path().join("e/escape").exists());
        // Again: nothing is fetched.
        let asked = fake.asked.borrow().len();
        install(&fake, &folders, &release, "linux-x64", &[&key]).unwrap();
        assert_eq!(fake.asked.borrow().len(), asked);
        // Another key's signature is refused, and nothing is put in use.
        let other = Folders { emulators: dir.path().join("e2"), ..folders };
        assert!(install(&fake, &other, &release, "linux-x64", &["00".repeat(32).as_str()]).unwrap_err().contains("signed by another key"));
        assert_eq!(current(&other), None);
    }

    #[test]
    fn the_sdk_s_files_come_out_of_the_handbook_as_a_paperpaw_tree() {
        let zip = zip_of(&[
            ("paperpaw-handbook-0.6.0/README.md", "r"),
            ("paperpaw-handbook-0.6.0/api/paperpaw-sdk.txt", "pub mod paperpaw_sdk"),
            ("paperpaw-handbook-0.6.0/src/paperpaw-sdk/ui/button.rs", "fn x() {}"),
            ("paperpaw-handbook-0.6.0/src/paperpaw-sdk/Cargo.toml", "no"),
            ("paperpaw-handbook-0.6.0/plugins/clock/src/lib.rs", "no"),
            ("paperpaw-handbook-0.6.0/src/paperpaw-sdk/../x.rs", "no"),
        ]);
        let tree = sdk_tree(&zip).unwrap();
        assert_eq!(tree.keys().map(String::as_str).collect::<Vec<_>>(), ["crates/paperpaw-sdk/api.txt", "crates/paperpaw-sdk/src/ui/button.rs"]);
    }
}
