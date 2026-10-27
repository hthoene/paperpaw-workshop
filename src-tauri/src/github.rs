//! Publishing a plugin through GitHub, for people who never used it: the
//! workshop signs in (GitHub's device flow, or the GitHub CLI where it is
//! signed in already), makes the plugin's own public repository as
//! PaperPaw's `paperpaw-dev new --github` lays one out, checks it as the
//! store will (`paperpaw-dev check-publish`), gives it the topic
//! `paperpaw-plugin`, keeps the author key as its secret (a plugin with
//! code is built and signed there), and tags the version. The
//! repository's workflow then makes the release, and paperpaw.org takes it
//! as a community plugin. The window follows both (`github_run`,
//! `github_site`) and, where one refuses, lets the AI fix it.
//!
//! The token is kept in the system's keychain, never in a file. The
//! workshop's OAuth app gives tokens that expire (after some 8 hours) and
//! has no secret to renew them with: a token refused means signing in
//! again, which the window offers as "Confirm with GitHub again". Everything
//! goes to GitHub's API (no Git is needed): the files as one commit, made
//! of blobs and a tree, so the repository holds exactly the plugin.

use std::io::Read;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::time::Duration;

use base64::Engine as _;
use base64::engine::general_purpose::STANDARD;
use keyring::Entry;
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};

/// The workshop's OAuth app at GitHub ("PaperPaw Workshop", device flow
/// enabled, no secret): public, as every device flow's.
pub const CLIENT_ID: &str = "Ov23liQsDhFATPhrrrYF";
/// What GitHub refusing the token is said as (the window looks for it).
pub const EXPIRED: &str = "Confirm with GitHub again: the sign-in has expired.";
/// What the token may do at first: the person's public repositories and
/// their workflows, nothing of their private ones.
const SCOPES: &str = "public_repo workflow";
/// What it may do once GitHub asks for more: `repo` is the only scope that
/// lets a token keep a secret, and a plugin with code is signed in its
/// workflow with the author's key as the repository's secret. Asked only
/// then (`MORE_ACCESS`), and the workshop still touches the plugin's own
/// public repository alone.
const SCOPES_MORE: &str = "repo workflow";
/// What publishing says where GitHub does not let the token keep the
/// secret (the window looks for it and offers signing in with `SCOPES_MORE`).
pub const MORE_ACCESS: &str = "More access needed: GitHub lets only a sign-in with full repository access keep your author key as a secret. Allow it once, then publish again.";
const API: &str = "https://api.github.com";
const LOGIN: &str = "https://github.com/login";
/// The store, which takes the release.
const SITE: &str = "https://paperpaw.org";
/// What lists a repository in the store.
pub const TOPIC: &str = "paperpaw-plugin";
/// The secret a plugin with code is signed with in its workflow.
pub const SECRET: &str = "PAPERPAW_PLUGIN_KEY";
/// The workflow `paperpaw-dev new --github` writes.
pub const WORKFLOW: &str = ".github/workflows/paperpaw-release.yml";

const SERVICE: &str = "org.paperpaw.workshop";
const ACCOUNT: &str = "github-token";
const TIMEOUT: Duration = Duration::from_secs(60);

/// Requests to GitHub and the store: a method, a whole URL, a JSON body;
/// the status and the answer as JSON (`null` where it is none).
pub trait Http {
    fn call(&mut self, method: &str, url: &str, body: Option<&Value>) -> Result<(u16, Value), String>;
}

/// Over the internet, with the person's token for GitHub's API.
pub struct Web {
    agent: ureq::Agent,
    token: Option<String>,
}

impl Web {
    pub fn new(token: Option<String>) -> Self {
        // Redirects are followed by hand: the token goes to GitHub's API alone.
        let agent = ureq::AgentBuilder::new().timeout(TIMEOUT).redirects(0).build();
        Web { agent, token }
    }

    /// The text at `url`, where a redirect from the API leads (a log).
    fn text(&self, url: &str) -> Result<String, String> {
        let answer = ureq::AgentBuilder::new().timeout(TIMEOUT).build().get(url).call().map_err(|e| e.to_string())?;
        let mut text = String::new();
        answer.into_reader().take(4 << 20).read_to_string(&mut text).map_err(|e| e.to_string())?;
        Ok(text)
    }
}

impl Http for Web {
    fn call(&mut self, method: &str, url: &str, body: Option<&Value>) -> Result<(u16, Value), String> {
        let mut request = self
            .agent
            .request(method, url)
            .set("Accept", if url.starts_with(LOGIN) { "application/json" } else { "application/vnd.github+json" })
            .set("User-Agent", "PaperPaw-Workshop")
            .set("X-GitHub-Api-Version", "2022-11-28");
        if let (Some(token), true) = (&self.token, url.starts_with(API)) {
            request = request.set("Authorization", &format!("Bearer {token}"));
        }
        let answer = match body {
            Some(body) => request.set("Content-Type", "application/json").send_string(&body.to_string()),
            None => request.call(),
        };
        let response = match answer {
            Ok(r) | Err(ureq::Error::Status(_, r)) => r,
            Err(e) => return Err(format!("{}: {e}", host(url))),
        };
        let status = response.status();
        if (300..400).contains(&status) {
            let to = response.header("Location").unwrap_or_default().to_string();
            return Ok((status, json!({ "location": to })));
        }
        let text = response.into_string().unwrap_or_default();
        Ok((status, serde_json::from_str(&text).unwrap_or(Value::Null)))
    }
}

fn host(url: &str) -> &str {
    url.split("://").nth(1).and_then(|r| r.split('/').next()).unwrap_or(url)
}

/// What GitHub said, where it said something else than was hoped.
fn said(status: u16, answer: &Value) -> String {
    if status == 401 {
        return EXPIRED.into();
    }
    let message = answer["message"].as_str().unwrap_or("");
    let errors: Vec<String> = answer["errors"]
        .as_array()
        .into_iter()
        .flatten()
        .filter_map(|e| e["message"].as_str().or(e["code"].as_str()).map(String::from))
        .collect();
    match (message, errors.is_empty()) {
        ("", true) => format!("GitHub answered {status}"),
        (m, true) => format!("GitHub answered {status}: {m}"),
        (m, false) => format!("GitHub answered {status}: {m} ({})", errors.join(", ")),
    }
}

/// The JSON of `url`, where GitHub answered with one of `ok`.
fn ask(http: &mut dyn Http, method: &str, url: &str, body: Option<&Value>, ok: &[u16]) -> Result<Value, String> {
    let (status, answer) = http.call(method, url, body)?;
    if ok.contains(&status) {
        Ok(answer)
    } else {
        Err(said(status, &answer))
    }
}

// ---- Signing in -----------------------------------------------------------

fn entry() -> Result<Entry, String> {
    Entry::new(SERVICE, ACCOUNT).map_err(|e| e.to_string())
}

/// The token kept, if there is one.
pub fn token() -> Option<String> {
    entry().ok()?.get_password().ok().filter(|t| !t.trim().is_empty())
}

fn keep_token(token: &str) -> Result<(), String> {
    entry()?.set_password(token).map_err(|e| e.to_string())
}

/// The GitHub CLI's token, where it is installed and signed in.
pub fn gh_token() -> Option<String> {
    let mut command = Command::new("gh");
    command.args(["auth", "token"]);
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        command.creation_flags(0x0800_0000);
    }
    let out = command.output().ok()?;
    let token = String::from_utf8_lossy(&out.stdout).trim().to_string();
    (out.status.success() && !token.is_empty()).then_some(token)
}

/// GitHub's device flow, begun: the code the person types at the address.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct DeviceCode {
    pub device_code: String,
    pub user_code: String,
    pub verification_uri: String,
    pub interval: u64,
    pub expires_in: u64,
}

pub fn device_start(http: &mut dyn Http, client: &str, more: bool) -> Result<DeviceCode, String> {
    if client.is_empty() {
        return Err("Signing in through the browser is not ready yet: sign in with the GitHub CLI (gh auth login), then try again.".into());
    }
    let answer = ask(http, "POST", &format!("{LOGIN}/device/code"), Some(&json!({ "client_id": client, "scope": if more { SCOPES_MORE } else { SCOPES } })), &[200])?;
    serde_json::from_value(answer).map_err(|e| format!("GitHub's answer: {e}"))
}

/// Where the device flow is, asked again.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Polled {
    Token(String),
    Pending,
    /// Asked too often: wait longer.
    SlowDown,
}

pub fn device_poll(http: &mut dyn Http, client: &str, device_code: &str) -> Result<Polled, String> {
    let body = json!({
        "client_id": client,
        "device_code": device_code,
        "grant_type": "urn:ietf:params:oauth:grant-type:device_code",
    });
    let answer = ask(http, "POST", &format!("{LOGIN}/oauth/access_token"), Some(&body), &[200])?;
    if let Some(token) = answer["access_token"].as_str() {
        return Ok(Polled::Token(token.to_string()));
    }
    match answer["error"].as_str() {
        Some("authorization_pending") => Ok(Polled::Pending),
        Some("slow_down") => Ok(Polled::SlowDown),
        Some("expired_token") => Err("The code expired: begin again.".into()),
        Some("access_denied") => Err("GitHub was not allowed: begin again to sign in.".into()),
        Some(other) => Err(format!("GitHub said {other}.")),
        None => Err("GitHub gave no token.".into()),
    }
}

/// Who the token is of.
pub fn login(http: &mut dyn Http) -> Result<String, String> {
    let me = ask(http, "GET", &format!("{API}/user"), None, &[200])?;
    me["login"].as_str().map(String::from).ok_or_else(|| "GitHub named no account".into())
}

// ---- The repository's files ----------------------------------------------

/// Files of a repository: each path with its bytes.
pub type RepoFiles = Vec<(String, Vec<u8>)>;

/// A plugin without code: its files in the repository's `plugin/`.
pub fn data_files(plugin: &[(String, Vec<u8>)]) -> Vec<(String, Vec<u8>)> {
    plugin.iter().map(|(path, bytes)| (format!("plugin/{path}"), bytes.clone())).collect()
}

/// A plugin with code: the crate the workshop built for the readers, from
/// its source ZIP (the very source the store rebuilds), its top folder
/// left out; and how it works in `plugin/how/` too, where the store reads
/// it. With the crate's name, the binary the workflow packs.
pub fn code_files(source_zip: &[u8]) -> Result<(RepoFiles, String), String> {
    let mut zip = zip::ZipArchive::new(std::io::Cursor::new(source_zip)).map_err(|e| e.to_string())?;
    let mut files = Vec::new();
    for i in 0..zip.len() {
        let mut file = zip.by_index(i).map_err(|e| e.to_string())?;
        if file.is_dir() {
            continue;
        }
        let name = file.name().to_string();
        let Some((_, path)) = name.split_once('/') else { continue };
        let mut bytes = Vec::new();
        file.read_to_end(&mut bytes).map_err(|e| e.to_string())?;
        files.push((path.to_string(), bytes));
    }
    let manifest = files.iter().find(|(p, _)| p == "Cargo.toml").map(|(_, b)| String::from_utf8_lossy(b).into_owned()).ok_or("the source has no Cargo.toml")?;
    let name = manifest
        .lines()
        .find_map(|l| l.trim().strip_prefix("name = \"").and_then(|r| r.strip_suffix('"')).map(String::from))
        .ok_or("the source's Cargo.toml names no package")?;
    let how: Vec<(String, Vec<u8>)> = files
        .iter()
        .filter(|(p, _)| p.starts_with("how/"))
        .filter(|(p, _)| !files.iter().any(|(q, _)| *q == format!("plugin/{p}")))
        .map(|(p, b)| (format!("plugin/{p}"), b.clone()))
        .collect();
    files.extend(how);
    files.sort_by(|a, b| a.0.cmp(&b.0));
    Ok((files, name))
}

/// `files` with what `paperpaw-dev new --github` adds to a plugin's
/// repository (its `scaffold`): the release workflow, set for this
/// plugin's binary (`bin`, a plugin with code), the README, `.gitignore`;
/// the plugin's own files win.
pub fn with_scaffold(mut files: Vec<(String, Vec<u8>)>, scaffold: &[(String, Vec<u8>)], bin: Option<&str>) -> Vec<(String, Vec<u8>)> {
    for (path, bytes) in scaffold {
        if ![WORKFLOW, "README.md", ".gitignore"].contains(&path.as_str()) || files.iter().any(|(p, _)| p == path) {
            continue;
        }
        let mut bytes = bytes.clone();
        if let (WORKFLOW, Some(bin)) = (path.as_str(), bin) {
            let text = String::from_utf8_lossy(&bytes)
                .lines()
                .map(|l| if l.trim_start().starts_with("BIN:") { format!("  BIN: {bin}") } else { l.to_string() })
                .collect::<Vec<_>>()
                .join("\n");
            bytes = format!("{text}\n").into_bytes();
        }
        files.push((path.clone(), bytes));
    }
    files.sort_by(|a, b| a.0.cmp(&b.0));
    files
}

/// Where a plugin with code keeps its store entry in the repository.
const STORE_INI: &str = "plugin/store/store.ini";

/// `ini` (a store.ini, perhaps empty) with `[source]` naming the
/// repository on GitHub and the tag it is released at: the store fetches
/// the source it rebuilds the plugin from there. `repository` and
/// `revision` are the workshop's to write, from where it makes the
/// repository, never a person's or the AI's; `path`, `bin` and the other
/// keys stay.
pub fn with_source(ini: &str, repo: &str, tag: &str) -> String {
    let mut out: Vec<String> = Vec::new();
    let mut in_source = false;
    let mut written = false;
    for line in ini.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with('[') && trimmed.ends_with(']') {
            in_source = trimmed[1..trimmed.len() - 1].trim().eq_ignore_ascii_case("source");
            out.push(line.to_string());
            if in_source && !written {
                out.push(format!("repository = https://github.com/{repo}"));
                out.push(format!("revision = {tag}"));
                written = true;
            }
            continue;
        }
        let key = line.split_once('=').map(|(k, _)| k.trim());
        if in_source && matches!(key, Some("repository" | "revision")) {
            continue;
        }
        out.push(line.to_string());
    }
    if !written {
        if out.last().is_some_and(|l| !l.trim().is_empty()) {
            out.push(String::new());
        }
        out.extend(["[source]".to_string(), format!("repository = https://github.com/{repo}"), format!("revision = {tag}")]);
    }
    out.join("\n") + "\n"
}

/// `files` of a plugin with code with its store entry naming `repo` and
/// `tag` as the source (see `with_source`).
pub fn pin_source(mut files: Vec<(String, Vec<u8>)>, repo: &str, tag: &str) -> Vec<(String, Vec<u8>)> {
    let old = files.iter().find(|(p, _)| p == STORE_INI).map(|(_, b)| String::from_utf8_lossy(b).into_owned()).unwrap_or_default();
    let new = with_source(&old, repo, tag).into_bytes();
    match files.iter_mut().find(|(p, _)| p == STORE_INI) {
        Some(entry) => entry.1 = new,
        None => {
            files.push((STORE_INI.to_string(), new));
            files.sort_by(|a, b| a.0.cmp(&b.0));
        }
    }
    files
}

/// `paperpaw-dev`, beside the emulator.
pub fn dev_program(emulator: &Path) -> PathBuf {
    emulator.with_file_name(format!("paperpaw-dev{}", std::env::consts::EXE_SUFFIX))
}

fn quiet(command: &mut Command) {
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        command.creation_flags(0x0800_0000);
    }
    #[cfg(not(windows))]
    let _ = command;
}

/// The files `paperpaw-dev new --github` makes for plugin `id`.
pub fn scaffold(dev: &Path, id: &str, code: bool, work: &Path) -> Result<Vec<(String, Vec<u8>)>, String> {
    let dir = work.join("new");
    let _ = std::fs::remove_dir_all(&dir);
    let mut command = Command::new(dev);
    command.args(["new", "--github", id, "--dir"]).arg(&dir);
    if code {
        command.arg("--code");
    }
    quiet(&mut command);
    let ran = command.output().map_err(|e| format!("{}: {e}", dev.display()))?;
    if !ran.status.success() {
        let why = String::from_utf8_lossy(&ran.stderr).trim().to_string();
        return Err(if why.contains("unknown") || why.is_empty() {
            "This PaperPaw's paperpaw-dev cannot lay out a repository yet: publishing through GitHub needs PaperPaw 0.5.0-beta.7 or newer.".into()
        } else {
            format!("paperpaw-dev new: {why}")
        });
    }
    let mut files = Vec::new();
    for path in [WORKFLOW, "README.md", ".gitignore"] {
        if let Ok(bytes) = std::fs::read(dir.join(path)) {
            files.push((path.to_string(), bytes));
        }
    }
    let _ = std::fs::remove_dir_all(&dir);
    Ok(files)
}

/// Writes `files` into `dir`, emptied first.
pub fn write_tree(dir: &Path, files: &[(String, Vec<u8>)]) -> Result<(), String> {
    let _ = std::fs::remove_dir_all(dir);
    for (path, bytes) in files {
        let to = dir.join(path);
        if let Some(parent) = to.parent() {
            std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
        std::fs::write(&to, bytes).map_err(|e| format!("{path}: {e}"))?;
    }
    Ok(())
}

/// `paperpaw-dev check-publish` of the repository in `dir`, by the store's
/// rules (`rules`, the site's, where they could be fetched): whether the
/// store takes it, and what it says, errors first.
pub fn check_publish(dev: &Path, dir: &Path, rules: Option<&Path>) -> Result<(bool, Vec<String>), String> {
    let mut command = Command::new(dev);
    command.arg("check-publish").arg(dir);
    if let Some(rules) = rules {
        command.arg("--rules").arg(rules);
    }
    quiet(&mut command);
    let ran = command.output().map_err(|e| format!("{}: {e}", dev.display()))?;
    Ok((ran.status.success(), problems_of(&String::from_utf8_lossy(&ran.stdout))))
}

/// The lines of check-publish that say what to change, errors first.
pub fn problems_of(output: &str) -> Vec<String> {
    let mut lines: Vec<String> = output
        .lines()
        .map(str::trim)
        .filter(|l| l.starts_with("error [") || l.starts_with("warning ["))
        .map(String::from)
        .collect();
    lines.sort_by_key(|l| !l.starts_with("error"));
    lines
}

/// The store's rules as the site serves them, kept in `work`; none where
/// the site does not answer (check-publish then takes its own).
pub fn site_rules(work: &Path) -> Option<PathBuf> {
    let text = ureq::AgentBuilder::new()
        .timeout(Duration::from_secs(20))
        .build()
        .get(&format!("{SITE}/api/v1/store-rules.json"))
        .call()
        .ok()?
        .into_string()
        .ok()?;
    serde_json::from_str::<Value>(&text).ok()?;
    let path = work.join("store-rules.json");
    std::fs::write(&path, text).ok()?;
    Some(path)
}

// ---- The repository on GitHub ---------------------------------------------

/// Where a plugin goes: the repository and what is there of it already.
#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
pub struct Place {
    /// `owner/name`.
    pub repo: String,
    pub exists: bool,
    /// Whether the version's tag has a release already: a new version is needed.
    pub released: bool,
}

/// The id a repository's `plugin/plugin.ini` names, if it has one.
fn plugin_of(http: &mut dyn Http, repo: &str) -> Result<Option<String>, String> {
    let (status, answer) = http.call("GET", &format!("{API}/repos/{repo}/contents/plugin/plugin.ini"), None)?;
    if status != 200 {
        return Ok(None);
    }
    let text = STANDARD.decode(answer["content"].as_str().unwrap_or("").replace('\n', "")).unwrap_or_default();
    Ok(String::from_utf8_lossy(&text)
        .lines()
        .find_map(|l| l.split_once('=').filter(|(k, _)| k.trim() == "id").map(|(_, v)| v.trim().to_string())))
}

/// Why `name` cannot be a repository's name on GitHub, if it cannot.
pub fn name_problem(name: &str) -> Option<String> {
    let bad = |c: char| !(c.is_ascii_alphanumeric() || c == '-' || c == '_' || c == '.');
    if name.is_empty() || name.chars().count() > 100 {
        Some("A repository's name has 1 to 100 characters.".into())
    } else if let Some(c) = name.chars().find(|c| bad(*c)) {
        Some(format!("A repository's name may hold letters, digits, - _ and . only, not {c:?}."))
    } else if name == "." || name == ".." || name.to_ascii_lowercase().ends_with(".git") {
        Some(format!("{name:?} cannot be a repository's name on GitHub."))
    } else {
        None
    }
}

/// Where plugin `id` of `login` goes: `known` (the project's repository
/// before), else the repository the person named (`wanted`), else
/// `<login>/<id>`, else `<login>/paperpaw-<id>` where the first is
/// another's; with whether `tag` is released there. A name the person
/// chose is theirs alone: where it is taken, they choose another.
pub fn place(http: &mut dyn Http, login: &str, id: &str, known: Option<&str>, wanted: Option<&str>, tag: &str) -> Result<Place, String> {
    let mut candidates: Vec<String> = known.map(String::from).into_iter().collect();
    match wanted {
        Some(name) => {
            if let Some(why) = name_problem(name) {
                return Err(why);
            }
            candidates.push(format!("{login}/{name}"));
        }
        None => {
            candidates.push(format!("{login}/{id}"));
            candidates.push(format!("{login}/paperpaw-{id}"));
        }
    }
    for repo in candidates {
        let (status, answer) = http.call("GET", &format!("{API}/repos/{repo}"), None)?;
        if status == 404 {
            return Ok(Place { repo, exists: false, released: false });
        }
        if status != 200 {
            return Err(said(status, &answer));
        }
        let mine = answer["permissions"]["admin"].as_bool().unwrap_or(false);
        let empty = answer["size"].as_u64() == Some(0);
        if mine && (empty || plugin_of(http, &repo)?.as_deref() == Some(id)) {
            let (status, _) = http.call("GET", &format!("{API}/repos/{repo}/releases/tags/{tag}"), None)?;
            return Ok(Place { repo, exists: true, released: status == 200 });
        }
    }
    Err(match wanted {
        Some(name) => format!("{login}/{name} holds something else: choose another name for the repository."),
        None => format!("{login}/{id} and {login}/paperpaw-{id} hold something else: choose a name for the repository."),
    })
}

/// What publishing made: the repository, the tag and its commit.
#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
pub struct Published {
    pub repo: String,
    pub tag: String,
    pub sha: String,
    pub url: String,
}

/// Makes `place`'s repository if it is not there, puts `files` into it as
/// one commit (exactly them), gives it the topic, keeps `key` (the author
/// key's file, a plugin with code) as its secret, and tags the commit
/// `tag`, which starts its release workflow. `told` hears each step.
pub fn publish(
    http: &mut dyn Http,
    place: &Place,
    files: &[(String, Vec<u8>)],
    description: &str,
    tag: &str,
    key: Option<&str>,
    told: &dyn Fn(&str),
) -> Result<Published, String> {
    let repo = &place.repo;
    let name = repo.split('/').nth(1).unwrap_or(repo);
    if place.released {
        return Err(format!("{tag} is released on GitHub already: raise the version first."));
    }
    if !place.exists {
        told("Making the repository…");
        // With a first commit: GitHub makes commits by its API only in a
        // repository that has one.
        ask(
            http,
            "POST",
            &format!("{API}/user/repos"),
            Some(&json!({
                "name": name,
                "description": description,
                "homepage": "https://paperpaw.org",
                "private": false,
                "auto_init": true,
                "has_wiki": false,
            })),
            &[201],
        )?;
    }
    let about = ask(http, "GET", &format!("{API}/repos/{repo}"), None, &[200])?;
    let branch = about["default_branch"].as_str().unwrap_or("main").to_string();
    let (status, mut head) = http.call("GET", &format!("{API}/repos/{repo}/git/ref/heads/{branch}"), None)?;
    if status == 404 || status == 409 {
        // A repository without a commit (made empty on GitHub): one first.
        let readme = json!({ "message": "A plugin for PaperPaw", "content": STANDARD.encode(format!("# {name}
")) });
        ask(http, "PUT", &format!("{API}/repos/{repo}/contents/README.md"), Some(&readme), &[201])?;
        head = ask(http, "GET", &format!("{API}/repos/{repo}/git/ref/heads/{branch}"), None, &[200])?;
    } else if status != 200 {
        return Err(said(status, &head));
    }
    let parent = head["object"]["sha"].as_str().ok_or("the repository has no commit")?.to_string();

    told("Uploading the plugin's files…");
    let mut tree = Vec::new();
    for (path, bytes) in files {
        let blob = ask(
            http,
            "POST",
            &format!("{API}/repos/{repo}/git/blobs"),
            Some(&json!({ "content": STANDARD.encode(bytes), "encoding": "base64" })),
            &[201],
        )?;
        let sha = blob["sha"].as_str().ok_or("GitHub kept no file")?;
        tree.push(json!({ "path": path, "mode": "100644", "type": "blob", "sha": sha }));
    }
    let tree = ask(http, "POST", &format!("{API}/repos/{repo}/git/trees"), Some(&json!({ "tree": tree })), &[201])?;
    let commit = ask(
        http,
        "POST",
        &format!("{API}/repos/{repo}/git/commits"),
        Some(&json!({
            "message": format!("{tag}, from the PaperPaw Workshop"),
            "tree": tree["sha"],
            "parents": [parent],
        })),
        &[201],
    )?;
    let sha = commit["sha"].as_str().ok_or("GitHub made no commit")?.to_string();
    ask(http, "PATCH", &format!("{API}/repos/{repo}/git/refs/heads/{branch}"), Some(&json!({ "sha": sha, "force": true })), &[200])?;

    told("Listing it for the store…");
    let topics = ask(http, "GET", &format!("{API}/repos/{repo}/topics"), None, &[200])?;
    let mut names: Vec<String> = topics["names"].as_array().into_iter().flatten().filter_map(|t| t.as_str().map(String::from)).collect();
    if !names.iter().any(|t| t == TOPIC) {
        names.push(TOPIC.to_string());
        ask(http, "PUT", &format!("{API}/repos/{repo}/topics"), Some(&json!({ "names": names })), &[200])?;
    }

    if let Some(key) = key {
        told("Keeping your author key as the repository's secret…");
        let (status, public) = http.call("GET", &format!("{API}/repos/{repo}/actions/secrets/public-key"), None)?;
        if status == 403 || status == 404 {
            return Err(MORE_ACCESS.into());
        } else if status != 200 {
            return Err(said(status, &public));
        }
        let sealed = seal(public["key"].as_str().unwrap_or(""), key.as_bytes())?;
        let (status, answer) = http.call(
            "PUT",
            &format!("{API}/repos/{repo}/actions/secrets/{SECRET}"),
            Some(&json!({ "encrypted_value": sealed, "key_id": public["key_id"] })),
        )?;
        match status {
            201 | 204 => {}
            403 | 404 => return Err(MORE_ACCESS.into()),
            _ => return Err(said(status, &answer)),
        }
    }

    told("Tagging the version, which starts the release…");
    // A tag left by a release that failed before it was made goes: the
    // version is made again from this commit.
    let (status, _) = http.call("GET", &format!("{API}/repos/{repo}/git/ref/tags/{tag}"), None)?;
    if status == 200 {
        ask(http, "DELETE", &format!("{API}/repos/{repo}/git/refs/tags/{tag}"), None, &[204])?;
    }
    ask(
        http,
        "POST",
        &format!("{API}/repos/{repo}/git/refs"),
        Some(&json!({ "ref": format!("refs/tags/{tag}"), "sha": sha })),
        &[201],
    )?;
    Ok(Published { repo: repo.clone(), tag: tag.to_string(), url: format!("https://github.com/{repo}"), sha })
}

/// `secret` sealed for GitHub's Actions with the repository's public key
/// (base64), as GitHub takes a secret: libsodium's sealed box, in base64.
pub fn seal(public_key: &str, secret: &[u8]) -> Result<String, String> {
    let bytes: [u8; 32] = STANDARD
        .decode(public_key)
        .ok()
        .and_then(|b| b.try_into().ok())
        .ok_or("GitHub gave no key for secrets")?;
    let key = crypto_box::PublicKey::from(bytes);
    let sealed = key.seal(&mut crypto_box::aead::OsRng, secret).map_err(|_| "the secret could not be sealed".to_string())?;
    Ok(STANDARD.encode(sealed))
}

// ---- The release workflow --------------------------------------------------

/// The release workflow's run for a commit, as far as it is.
#[derive(Debug, Clone, Serialize, Default, PartialEq, Eq)]
pub struct Run {
    /// `waiting` (none yet), `queued`, `in_progress`, `success`, `failure`
    /// or another of GitHub's conclusions.
    pub state: String,
    pub url: String,
    /// Where it failed, and the end of that step's log.
    pub failed_step: Option<String>,
    pub log: Option<String>,
}

pub fn run_of(http: &mut dyn Http, repo: &str, sha: &str) -> Result<(Run, Option<u64>), String> {
    let runs = ask(http, "GET", &format!("{API}/repos/{repo}/actions/runs?head_sha={sha}&per_page=5"), None, &[200])?;
    let Some(run) = runs["workflow_runs"].as_array().and_then(|r| r.first()).cloned() else {
        return Ok((Run { state: "waiting".into(), ..Run::default() }, None));
    };
    let state = match run["status"].as_str() {
        Some("completed") => run["conclusion"].as_str().unwrap_or("failure").to_string(),
        Some(other) => other.to_string(),
        None => "waiting".into(),
    };
    let url = run["html_url"].as_str().unwrap_or("").to_string();
    Ok((Run { state, url, failed_step: None, log: None }, run["id"].as_u64()))
}

/// The step that failed in `run_id`, with the job's id to read its log.
pub fn failed_step(http: &mut dyn Http, repo: &str, run_id: u64) -> Result<Option<(String, u64)>, String> {
    let jobs = ask(http, "GET", &format!("{API}/repos/{repo}/actions/runs/{run_id}/jobs"), None, &[200])?;
    for job in jobs["jobs"].as_array().into_iter().flatten() {
        let step = job["steps"].as_array().into_iter().flatten().find(|s| s["conclusion"] == "failure");
        if let (Some(step), Some(id)) = (step, job["id"].as_u64()) {
            return Ok(Some((step["name"].as_str().unwrap_or("a step").to_string(), id)));
        }
    }
    Ok(None)
}

/// What a failed job's log says that matters: its errors and the lines
/// before the first, at most `most` lines.
pub fn log_tail(log: &str, most: usize) -> String {
    let lines: Vec<&str> = log
        .lines()
        // Each line starts with its time: `2026-10-25T10:00:00.0000000Z text`.
        .map(|l| l.split_once(' ').filter(|(t, _)| t.ends_with('Z') && t.contains('T')).map_or(l, |(_, r)| r))
        .collect();
    let first = lines.iter().position(|l| l.contains("##[error]") || l.starts_with("error [") || l.starts_with("error:"));
    let end = lines.iter().rposition(|l| l.contains("##[error]")).map_or(lines.len(), |i| i + 1);
    let start = first.map_or(end.saturating_sub(most), |f| f.saturating_sub(most / 2)).max(end.saturating_sub(most));
    lines[start..end].iter().map(|l| l.replace("##[error]", "")).collect::<Vec<_>>().join("\n")
}

// ---- The store -------------------------------------------------------------

/// What paperpaw.org says of the repository's newest release (its
/// `/api/v1/community/<owner>/<name>`); `check` asks it to look now.
pub fn site(http: &mut dyn Http, repo: &str, check: bool) -> Result<Value, String> {
    let url = format!("{SITE}/api/v1/community/{repo}");
    if check {
        let (status, answer) = http.call("POST", &format!("{url}/check"), None)?;
        match status {
            200 => return Ok(answer),
            // Asked a moment ago: what it knows.
            429 => {}
            _ => return Err(answer["error"].as_str().map_or_else(|| format!("paperpaw.org answered {status}"), String::from)),
        }
    }
    ask(http, "GET", &url, None, &[200])
}

// ---- The window's commands ------------------------------------------------------

fn web() -> Web {
    Web::new(token())
}

/// Who is signed in, and whether the GitHub CLI could sign in instead.
#[derive(Debug, Clone, Serialize, Default)]
pub struct Account {
    pub login: Option<String>,
    /// A token is kept, but GitHub refuses it (it expired).
    pub expired: bool,
    pub gh: bool,
    /// Whether signing in through the browser is ready (the OAuth app).
    pub browser: bool,
}

#[tauri::command]
pub async fn github_account() -> Result<Account, String> {
    tauri::async_runtime::spawn_blocking(|| {
        let (login, expired) = match token() {
            None => (None, false),
            Some(_) => match login(&mut web()) {
                Ok(who) => (Some(who), false),
                Err(e) => (None, e == EXPIRED),
            },
        };
        Ok(Account { login, expired, gh: gh_token().is_some(), browser: !CLIENT_ID.is_empty() })
    })
    .await
    .map_err(|e| e.to_string())?
}

/// Signs in with the GitHub CLI's token.
#[tauri::command]
pub async fn github_use_gh() -> Result<Account, String> {
    tauri::async_runtime::spawn_blocking(|| {
        let token = gh_token().ok_or("The GitHub CLI is not signed in: gh auth login")?;
        let who = login(&mut Web::new(Some(token.clone())))?;
        keep_token(&token)?;
        Ok(Account { login: Some(who), expired: false, gh: true, browser: !CLIENT_ID.is_empty() })
    })
    .await
    .map_err(|e| e.to_string())?
}

/// Begins signing in through the browser: the code to type, the page
/// opened for it. `more`: with the access to keep a secret (`MORE_ACCESS`).
#[tauri::command]
pub async fn github_device_start(app: tauri::AppHandle, more: bool) -> Result<DeviceCode, String> {
    use tauri_plugin_opener::OpenerExt;
    let code = tauri::async_runtime::spawn_blocking(move || device_start(&mut Web::new(None), CLIENT_ID, more)).await.map_err(|e| e.to_string())??;
    let _ = app.opener().open_url(&code.verification_uri, None::<&str>);
    Ok(code)
}

/// Asks whether the person typed the code: `pending`, `slow_down` or
/// `done` (the token kept).
#[tauri::command]
pub async fn github_device_poll(device_code: String) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || match device_poll(&mut Web::new(None), CLIENT_ID, &device_code)? {
        Polled::Token(token) => keep_token(&token).map(|_| "done".to_string()),
        Polled::Pending => Ok("pending".into()),
        Polled::SlowDown => Ok("slow_down".into()),
    })
    .await
    .map_err(|e| e.to_string())?
}

/// Opens a page of GitHub's (a repository, a workflow's run) in the browser.
#[tauri::command]
pub fn github_open(app: tauri::AppHandle, url: String) -> Result<(), String> {
    use tauri_plugin_opener::OpenerExt;
    if !url.starts_with("https://github.com/") {
        return Err("only GitHub's pages are opened".into());
    }
    app.opener().open_url(&url, None::<&str>).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn github_sign_out() -> Result<(), String> {
    match entry()?.delete_credential() {
        Ok(()) | Err(keyring::Error::NoEntry) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

/// The repository as it will be, checked as the store will check it.
#[derive(Debug, Clone, Serialize)]
pub struct Prepared {
    pub place: Place,
    pub passes: bool,
    pub problems: Vec<String>,
    pub files: usize,
}

/// The repository's files for `project` (`source`: the source ZIP of a
/// plugin with code, as its build made it).
/// At `place`'s repository, released as `tag`: a plugin with code names
/// them as its source in its store entry.
fn repository(project: &str, id: &str, source: Option<&str>, work: &Path, place: &Place, tag: &str) -> Result<Vec<(String, Vec<u8>)>, String> {
    let dev = dev_program(&crate::paths::emulator_program()?);
    let (files, bin) = match source {
        Some(zip) => {
            let (files, bin) = code_files(&std::fs::read(zip).map_err(|e| format!("{zip}: {e}"))?)?;
            (pin_source(files, &place.repo, tag), Some(bin))
        }
        None => (data_files(&crate::projects::plugin_files(&crate::paths::projects()?, project)?), None),
    };
    let scaffold = scaffold(&dev, id, source.is_some(), work)?;
    Ok(with_scaffold(files, &scaffold, bin.as_deref()))
}

fn work_dir(project: &str) -> Result<PathBuf, String> {
    let dir = crate::paths::app_data()?.join("github").join(project);
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir)
}

#[tauri::command]
pub async fn github_prepare(
    project: String,
    id: String,
    version: String,
    known: Option<String>,
    source: Option<String>,
    name: Option<String>,
) -> Result<Prepared, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let work = work_dir(&project)?;
        // Where it goes first: the plugin's source is that repository's.
        let mut http = web();
        let who = login(&mut http)?;
        let tag = format!("v{version}");
        let place = place(&mut http, &who, &id, known.as_deref(), name.as_deref(), &tag)?;
        let files = repository(&project, &id, source.as_deref(), &work, &place, &tag)?;
        let tree = work.join("repository");
        write_tree(&tree, &files)?;
        let rules = site_rules(&work);
        let dev = dev_program(&crate::paths::emulator_program()?);
        let (passes, problems) = check_publish(&dev, &tree, rules.as_deref())?;
        Ok(Prepared { place, passes, problems, files: files.len() })
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
#[allow(clippy::too_many_arguments)]
pub async fn github_publish(
    app: tauri::AppHandle,
    project: String,
    id: String,
    version: String,
    description: String,
    known: Option<String>,
    source: Option<String>,
    name: Option<String>,
) -> Result<Published, String> {
    use tauri::Emitter;
    tauri::async_runtime::spawn_blocking(move || {
        let told = |text: &str| {
            let _ = app.emit("github-progress", text.to_string());
        };
        let work = work_dir(&project)?;
        let mut http = web();
        let who = login(&mut http)?;
        let tag = format!("v{version}");
        let place = place(&mut http, &who, &id, known.as_deref(), name.as_deref(), &tag)?;
        let files = repository(&project, &id, source.as_deref(), &work, &place, &tag)?;
        // A plugin with code is signed in its workflow with the author's key.
        let key = match source {
            Some(_) => {
                let author = crate::author::Author { secrets: &crate::author::Keychain::AUTHOR, dir: crate::paths::app_data()? };
                let seed = author.seed()?.ok_or("There is no author key yet.")?;
                Some(seed.iter().map(|b| format!("{b:02x}")).collect::<String>())
            }
            None => None,
        };
        publish(&mut http, &place, &files, &description, &tag, key.as_deref(), &told)
    })
    .await
    .map_err(|e| e.to_string())?
}

/// The release workflow's run of `sha`, with where it failed.
#[tauri::command]
pub async fn github_run(repo: String, sha: String) -> Result<Run, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let mut http = web();
        let (mut run, id) = run_of(&mut http, &repo, &sha)?;
        if let (Some(id), true) = (id, run.state == "failure") {
            if let Some((step, job)) = failed_step(&mut http, &repo, id)? {
                run.failed_step = Some(step);
                let (status, answer) = http.call("GET", &format!("{API}/repos/{repo}/actions/jobs/{job}/logs"), None)?;
                if (300..400).contains(&status) {
                    if let Some(to) = answer["location"].as_str() {
                        run.log = http.text(to).ok().map(|log| log_tail(&log, 40));
                    }
                }
            }
        }
        Ok(run)
    })
    .await
    .map_err(|e| e.to_string())?
}

/// What paperpaw.org says of the release; `check`: asked to look now.
#[tauri::command]
pub async fn github_site(repo: String, check: bool) -> Result<Value, String> {
    tauri::async_runtime::spawn_blocking(move || site(&mut Web::new(None), &repo, check)).await.map_err(|e| e.to_string())?
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::cell::RefCell;
    use std::collections::BTreeMap;

    /// GitHub as far as publishing asks it, in memory.
    #[derive(Default)]
    struct Fake {
        /// Repositories by `owner/name`: (admin, plugin id in plugin.ini).
        repos: BTreeMap<String, (bool, Option<String>)>,
        released: Vec<String>,
        tags: Vec<String>,
        topics: Vec<String>,
        secrets: Vec<String>,
        /// A token without the access to keep secrets.
        narrow: bool,
        blobs: usize,
        tree: Vec<String>,
        asked: RefCell<Vec<String>>,
    }

    impl Http for Fake {
        fn call(&mut self, method: &str, url: &str, body: Option<&Value>) -> Result<(u16, Value), String> {
            self.asked.borrow_mut().push(format!("{method} {url}"));
            let path = url.strip_prefix(API).unwrap_or(url);
            let ok = |v: Value| Ok((200, v));
            let repo_of = |p: &str| p.strip_prefix("/repos/").map(|r| r.splitn(3, '/').take(2).collect::<Vec<_>>().join("/"));
            match (method, path) {
                ("GET", "/user") => ok(json!({ "login": "ann" })),
                ("POST", "/user/repos") => {
                    let name = body.unwrap()["name"].as_str().unwrap();
                    self.repos.insert(format!("ann/{name}"), (true, None));
                    Ok((201, json!({})))
                }
                ("GET", p) if p.ends_with("/contents/plugin/plugin.ini") => match self.repos.get(&repo_of(p).unwrap()) {
                    Some((_, Some(id))) => ok(json!({ "content": STANDARD.encode(format!("[plugin]\nid = {id}\n")) })),
                    _ => Ok((404, json!({}))),
                },
                ("GET", p) if p.contains("/releases/tags/") => {
                    Ok((if self.released.iter().any(|t| p.ends_with(t)) { 200 } else { 404 }, json!({})))
                }
                ("GET", p) if p.contains("/git/ref/heads/") => ok(json!({ "object": { "sha": "parent" } })),
                ("GET", p) if p.contains("/git/ref/tags/") => {
                    Ok((if self.tags.iter().any(|t| p.ends_with(t)) { 200 } else { 404 }, json!({})))
                }
                ("DELETE", p) if p.contains("/git/refs/tags/") => {
                    self.tags.retain(|t| !p.ends_with(t.as_str()));
                    Ok((204, Value::Null))
                }
                ("POST", p) if p.ends_with("/git/blobs") => {
                    self.blobs += 1;
                    Ok((201, json!({ "sha": format!("blob{}", self.blobs) })))
                }
                ("POST", p) if p.ends_with("/git/trees") => {
                    self.tree = body.unwrap()["tree"].as_array().unwrap().iter().map(|e| e["path"].as_str().unwrap().to_string()).collect();
                    Ok((201, json!({ "sha": "tree" })))
                }
                ("POST", p) if p.ends_with("/git/commits") => Ok((201, json!({ "sha": "commit" }))),
                ("PATCH", p) if p.contains("/git/refs/heads/") => ok(json!({})),
                ("GET", p) if p.ends_with("/topics") => ok(json!({ "names": self.topics })),
                ("PUT", p) if p.ends_with("/topics") => {
                    self.topics = body.unwrap()["names"].as_array().unwrap().iter().map(|t| t.as_str().unwrap().to_string()).collect();
                    ok(json!({}))
                }
                ("GET", p) if p.ends_with("/actions/secrets/public-key") && self.narrow => Ok((404, json!({ "message": "Not Found" }))),
                ("GET", p) if p.ends_with("/actions/secrets/public-key") => {
                    ok(json!({ "key_id": "k1", "key": STANDARD.encode(crypto_box::SecretKey::from([7u8; 32]).public_key().as_bytes()) }))
                }
                ("PUT", p) if p.contains("/actions/secrets/") => {
                    self.secrets.push(body.unwrap()["encrypted_value"].as_str().unwrap().to_string());
                    Ok((201, Value::Null))
                }
                ("POST", p) if p.ends_with("/git/refs") => {
                    self.tags.push(body.unwrap()["ref"].as_str().unwrap().trim_start_matches("refs/tags/").to_string());
                    Ok((201, json!({})))
                }
                ("GET", p) => match self.repos.get(&repo_of(p).unwrap_or_default()) {
                    Some((admin, id)) => ok(json!({ "permissions": { "admin": admin }, "size": if id.is_some() { 10 } else { 0 }, "default_branch": "main" })),
                    None => Ok((404, json!({ "message": "Not Found" }))),
                },
                _ => Err(format!("unexpected {method} {url}")),
            }
        }
    }

    fn files() -> Vec<(String, Vec<u8>)> {
        vec![("plugin/plugin.ini".into(), b"[plugin]\nid = night-owl\n".to_vec()), (WORKFLOW.into(), b"on: push".to_vec())]
    }

    #[test]
    fn a_new_plugin_gets_a_repository_with_exactly_its_files_its_topic_and_its_tag() {
        let mut github = Fake::default();
        let place = place(&mut github, "ann", "night-owl", None, None, "v1.0.0").unwrap();
        assert_eq!(place, Place { repo: "ann/night-owl".into(), exists: false, released: false });
        let done = publish(&mut github, &place, &files(), "Night owl", "v1.0.0", None, &|_| {}).unwrap();
        assert_eq!(done.repo, "ann/night-owl");
        assert_eq!(done.sha, "commit");
        assert_eq!(github.tree, ["plugin/plugin.ini", WORKFLOW]);
        assert_eq!(github.topics, [TOPIC]);
        assert_eq!(github.tags, ["v1.0.0"]);
        assert!(github.secrets.is_empty(), "a plugin without code has no secret");
    }

    #[test]
    fn a_plugin_with_code_keeps_the_author_key_sealed_as_the_secret() {
        let mut github = Fake::default();
        let place = place(&mut github, "ann", "night-owl", None, None, "v1.0.0").unwrap();
        publish(&mut github, &place, &files(), "", "v1.0.0", Some("ab".repeat(32).as_str()), &|_| {}).unwrap();
        let sealed = STANDARD.decode(&github.secrets[0]).unwrap();
        let opened = crypto_box::SecretKey::from([7u8; 32]).unseal(&sealed).unwrap();
        assert_eq!(opened, "ab".repeat(32).as_bytes());
    }

    #[test]
    fn a_token_that_cannot_keep_secrets_is_asked_to_sign_in_with_more_access() {
        let mut github = Fake { narrow: true, ..Fake::default() };
        let place = place(&mut github, "ann", "night-owl", None, None, "v1.0.0").unwrap();
        let key = "ab".repeat(32);
        let err = publish(&mut github, &place, &files(), "", "v1.0.0", Some(key.as_str()), &|_| {}).unwrap_err();
        assert_eq!(err, MORE_ACCESS);
        assert!(github.tags.is_empty(), "nothing is tagged, so no release starts without its key");
        assert!(github.secrets.is_empty());
        // A plugin without code needs no secret, and so no more access.
        publish(&mut github, &place, &files(), "", "v1.0.0", None, &|_| {}).unwrap();
        assert_eq!(github.tags, ["v1.0.0"]);
    }

    #[test]
    fn its_own_repository_is_used_again_another_s_name_is_left_alone() {
        let mut github = Fake::default();
        github.repos.insert("ann/night-owl".into(), (true, Some("night-owl".into())));
        github.repos.insert("ann/clock".into(), (true, Some("something-else".into())));
        github.repos.insert("ann/paperpaw-clock".into(), (false, None));
        assert!(place(&mut github, "ann", "night-owl", None, None, "v1.0.0").unwrap().exists);
        assert!(place(&mut github, "ann", "clock", None, None, "v1.0.0").is_err(), "neither name is the plugin's");
        github.repos.remove("ann/paperpaw-clock");
        assert_eq!(place(&mut github, "ann", "clock", None, None, "v1.0.0").unwrap().repo, "ann/paperpaw-clock");
    }

    #[test]
    fn a_name_the_person_chose_is_the_repository_s_and_a_taken_one_is_not_swapped_for_another() {
        let mut github = Fake::default();
        let chosen = place(&mut github, "ann", "night-owl", None, Some("my-owl"), "v1.0.0").unwrap();
        assert_eq!(chosen, Place { repo: "ann/my-owl".into(), exists: false, released: false });
        publish(&mut github, &chosen, &files(), "", "v1.0.0", None, &|_| {}).unwrap();
        assert!(github.repos.contains_key("ann/my-owl"));
        // Another's repository by that name: the person chooses again.
        github.repos.insert("ann/clock".into(), (true, Some("something-else".into())));
        let taken = place(&mut github, "ann", "night-owl", None, Some("clock"), "v1.0.0").unwrap_err();
        assert!(taken.contains("ann/clock") && taken.contains("choose another name"), "{taken}");
        // The repository a project has published in stays, whatever the field says now.
        github.repos.insert("ann/night-owl".into(), (true, Some("night-owl".into())));
        assert_eq!(place(&mut github, "ann", "night-owl", Some("ann/night-owl"), Some("my-owl"), "v1.0.0").unwrap().repo, "ann/night-owl");
        // A name GitHub would not take is said before anything is asked of it.
        for bad in ["", "my owl", "a/b", "..", "x.git", &"a".repeat(101)] {
            assert!(name_problem(bad).is_some(), "{bad:?}");
            assert!(place(&mut github, "ann", "night-owl", None, Some(bad), "v1.0.0").is_err(), "{bad:?}");
        }
        for good in ["night-owl", "Night_Owl.2", "paperpaw-plugin", "a"] {
            assert_eq!(name_problem(good), None, "{good:?}");
        }
    }

    #[test]
    fn a_released_version_needs_a_new_one_a_failed_tag_is_made_again() {
        let mut github = Fake::default();
        github.repos.insert("ann/night-owl".into(), (true, Some("night-owl".into())));
        github.released.push("v1.0.0".into());
        let released = place(&mut github, "ann", "night-owl", None, None, "v1.0.0").unwrap();
        assert!(released.released);
        assert!(publish(&mut github, &released, &files(), "", "v1.0.0", None, &|_| {}).unwrap_err().contains("raise the version"));
        github.tags.push("v1.0.1".into());
        let again = place(&mut github, "ann", "night-owl", None, None, "v1.0.1").unwrap();
        publish(&mut github, &again, &files(), "", "v1.0.1", None, &|_| {}).unwrap();
        assert!(github.asked.borrow().iter().any(|a| a.starts_with("DELETE") && a.ends_with("/git/refs/tags/v1.0.1")));
        assert_eq!(github.tags, ["v1.0.1"]);
    }

    #[test]
    fn a_crate_s_source_becomes_the_repository_with_its_workflow_set_for_its_binary() {
        let mut zip = zip::ZipWriter::new(std::io::Cursor::new(Vec::new()));
        let options = zip::write::SimpleFileOptions::default();
        for (path, text) in [
            ("my-clock/Cargo.toml", "[package]\nname = \"my-clock\"\n"),
            ("my-clock/src/lib.rs", "//! the clock"),
            ("my-clock/how/en.txt", "How it works."),
            ("my-clock/plugin/plugin.ini", "[plugin]\nid = clock\n"),
        ] {
            use std::io::Write as _;
            zip.start_file(path, options).unwrap();
            zip.write_all(text.as_bytes()).unwrap();
        }
        let (files, bin) = code_files(&zip.finish().unwrap().into_inner()).unwrap();
        assert_eq!(bin, "my-clock");
        let scaffold = vec![
            (WORKFLOW.to_string(), b"env:\n  CODE: \"true\"\n  BIN: clock\n".to_vec()),
            ("README.md".to_string(), b"# Clock".to_vec()),
            ("plugin/plugin.ini".to_string(), b"not this one".to_vec()),
        ];
        let files = with_scaffold(files, &scaffold, Some(&bin));
        let paths: Vec<&str> = files.iter().map(|(p, _)| p.as_str()).collect();
        assert_eq!(paths, [WORKFLOW, "Cargo.toml", "README.md", "how/en.txt", "plugin/how/en.txt", "plugin/plugin.ini", "src/lib.rs"]);
        let workflow = String::from_utf8_lossy(&files[0].1).into_owned();
        assert!(workflow.contains("  BIN: my-clock\n"), "{workflow}");
        assert_eq!(files.iter().find(|(p, _)| p == "plugin/plugin.ini").unwrap().1, b"[plugin]\nid = clock\n");
    }

    #[test]
    fn a_plugin_with_code_names_its_own_repository_and_tag_as_its_source() {
        // The store's entry as the AI left it: a made-up address, an old tag.
        let guessed = "[store]\nsummary = A timer.\ngroup = tools\n\n[source]\nrepository = https://github.com/paperpaw-plugins/pomodoro\nrevision = v0.1.0\nbin = pomodoro\n\n[screenshots]\nhome.png = The timer.\n";
        let pinned = with_source(guessed, "ann/pomodoro", "v0.1.3");
        assert_eq!(
            pinned,
            "[store]\nsummary = A timer.\ngroup = tools\n\n[source]\nrepository = https://github.com/ann/pomodoro\nrevision = v0.1.3\nbin = pomodoro\n\n[screenshots]\nhome.png = The timer.\n"
        );
        // Again: the same.
        assert_eq!(with_source(&pinned, "ann/pomodoro", "v0.1.3"), pinned);
        // None named: a section is added after the rest.
        assert_eq!(
            with_source("[store]\nsummary = A timer.\n", "ann/pomodoro", "v1.0.0"),
            "[store]\nsummary = A timer.\n\n[source]\nrepository = https://github.com/ann/pomodoro\nrevision = v1.0.0\n"
        );
        assert_eq!(with_source("", "ann/x", "v1.0.0"), "[source]\nrepository = https://github.com/ann/x\nrevision = v1.0.0\n");
        // In the repository's files: the entry is changed, or made where there is none.
        let files = pin_source(vec![("Cargo.toml".into(), b"".to_vec()), (STORE_INI.into(), guessed.as_bytes().to_vec())], "ann/pomodoro", "v0.1.3");
        assert_eq!(files[1].1, pinned.as_bytes());
        let made = pin_source(vec![("Cargo.toml".into(), b"".to_vec()), ("src/lib.rs".into(), b"".to_vec())], "ann/pomodoro", "v0.1.3");
        let paths: Vec<&str> = made.iter().map(|(p, _)| p.as_str()).collect();
        assert_eq!(paths, ["Cargo.toml", STORE_INI, "src/lib.rs"]);
    }

    #[test]
    fn check_publish_says_errors_first_and_a_log_its_errors() {
        let out = "warning [screenshot] store/: no screenshot\nerror [id] plugin.ini: taken\ncheck-publish: the plugin store would refuse it\n";
        assert_eq!(problems_of(out), ["error [id] plugin.ini: taken", "warning [screenshot] store/: no screenshot"]);
        let log = "2026-10-25T10:00:00.1Z Run cargo x4\n2026-10-25T10:00:01.1Z    Compiling clock\n2026-10-25T10:00:02.1Z ##[error]error[E0425]: cannot find value `x`\n2026-10-25T10:00:03.1Z cleanup\n";
        let tail = log_tail(log, 40);
        assert!(tail.contains("Compiling clock"), "{tail}");
        assert!(tail.ends_with("error[E0425]: cannot find value `x`"), "{tail}");
    }

    #[test]
    fn the_device_flow_hands_over_a_token_once_the_code_is_typed() {
        struct Login(Vec<Value>);
        impl Http for Login {
            fn call(&mut self, _: &str, _: &str, _: Option<&Value>) -> Result<(u16, Value), String> {
                Ok((200, self.0.remove(0)))
            }
        }
        assert!(device_start(&mut Login(vec![]), "", false).unwrap_err().contains("GitHub CLI"));
        let mut github = Login(vec![
            json!({ "device_code": "d", "user_code": "ABCD-1234", "verification_uri": "https://github.com/login/device", "interval": 5, "expires_in": 900 }),
            json!({ "error": "authorization_pending" }),
            json!({ "access_token": "gho_x" }),
        ]);
        assert_eq!(device_start(&mut github, "client", false).unwrap().user_code, "ABCD-1234");
        assert_eq!(device_poll(&mut github, "client", "d").unwrap(), Polled::Pending);
        assert_eq!(device_poll(&mut github, "client", "d").unwrap(), Polled::Token("gho_x".into()));
    }
}
