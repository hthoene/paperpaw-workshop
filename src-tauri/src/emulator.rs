//! The reader beside the conversation: PaperPaw's own emulator as a
//! program of its own, `paperpaw-emu --stdio` from PaperPaw's release
//! (one per release, so a new PaperPaw needs no new workshop), driven over
//! its standard input and output, one JSON object a line each way
//! (PaperPaw's `shells/desktop/src/stdio.rs`, protocol 1). The window gets
//! the panel as PNG frames, only when they change, and sends buttons and
//! touches back; the AI asks what the screen shows and for screenshots.
//!
//! The plugin being made is copied into the reader's own folder
//! (`plugins/<id>/`, as on a reader's card) and the reader started again
//! on it. If the program stops, the next request starts it again.

use std::collections::VecDeque;
use std::io::{BufRead, BufReader, Write};
use std::path::{Path, PathBuf};
use std::process::{Child, ChildStdin, Command, Stdio};
use std::sync::mpsc::{Sender, channel};
use std::sync::{Arc, Mutex};
use std::time::Duration;

use serde::Serialize;
use serde_json::{Value, json};
use tauri::{AppHandle, Emitter, State};

/// The protocol of `paperpaw-emu --stdio` the workshop speaks at least.
/// A newer one only adds requests and fields (PaperPaw's stdio docs), so
/// an emulator of a newer one is taken too.
pub const PROTOCOL: u64 = 1;
/// The protocol that has `slot` (and `set`, `setting`, `wait`, …).
pub const SLOTS: u64 = 2;

/// The readers the window offers, by the profiles' ids.
pub const PROFILES: [&str; 3] = ["xteink-x4", "xteink-x4-pro", "boox-go-7"];

/// The readers' settings in the workshop: no "How it works here" hints
/// over the screens a plugin is tried on.
const SETTINGS: &str = "[help]\nshow = false\n";

/// The readers' settings: the workshop's own, `widget` alone on the
/// first page of the home screen where one is shown, and the plugins
/// `off` switched off.
fn settings(widget: Option<&str>, off: &[String]) -> String {
    let mut text = SETTINGS.to_string();
    if let Some(widget) = widget {
        text += &format!("[home]\npage-1 = {widget}\n");
    }
    if !off.is_empty() {
        text += "[plugins]\n";
        for id in off {
            text += &format!("{id} = off\n");
        }
    }
    text
}

/// The plugins in the reader's folder `library` other than `plugin`:
/// those of projects open before, which the reader beside this one does
/// not run. Switched off rather than removed, as Windows keeps a code
/// plugin's library while the reader has it loaded.
pub fn others(library: &Path, plugin: Option<&str>) -> Vec<String> {
    let mut ids: Vec<String> = std::fs::read_dir(library.join("plugins"))
        .into_iter()
        .flatten()
        .flatten()
        .filter(|e| e.path().is_dir())
        .filter_map(|e| e.file_name().into_string().ok())
        .filter(|id| Some(id.as_str()) != plugin)
        .collect();
    ids.sort();
    ids
}

/// How long an answer (`described`, `shot`, `started`) may take.
const ANSWER: Duration = Duration::from_secs(60);

/// A frame for the window: the panel as a PNG, and what the device has.
#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct Frame {
    pub profile: String,
    pub width: u64,
    pub height: u64,
    /// The panel, a PNG in base64.
    pub png: String,
    /// Its buttons, by PaperPaw's names (`page-forward`, `confirm`, ...).
    pub buttons: Vec<String>,
    pub touch: bool,
}

/// What the program tells, for the window.
#[derive(Debug, Clone, PartialEq)]
pub enum Event {
    Frame(Frame),
    Error(String),
}

/// Who answers: the `ready` event.
#[derive(Debug, Clone, Default, Serialize, PartialEq)]
pub struct Ready {
    pub protocol: u64,
    pub paperpaw: String,
    pub profiles: Vec<String>,
    /// What code plugins must be built for (later: the toolchain step).
    pub fingerprint: String,
    pub toolchain: String,
}

/// The device started last: its profile, buttons and touch.
#[derive(Debug, Clone, Default)]
struct Started {
    profile: String,
    buttons: Vec<String>,
    touch: bool,
}

/// An answer waited for: the event's name, and where it goes.
struct Waiter {
    event: &'static str,
    op: &'static str,
    reply: Sender<Result<Value, String>>,
}

/// What the program's events are kept in, shared with the thread that
/// reads them.
#[derive(Default)]
struct Shared {
    ready: Option<Ready>,
    started: Started,
    waiting: VecDeque<Waiter>,
    /// The plugins' warnings and requests since the AI last asked.
    warnings: Vec<String>,
    requests: Vec<String>,
}

struct Running {
    child: Child,
    stdin: ChildStdin,
}

/// The emulator: the program while it runs, and what it said.
pub struct Emulator {
    program: Box<dyn Fn() -> Result<PathBuf, String> + Send + Sync>,
    tell: Arc<dyn Fn(Event) + Send + Sync>,
    running: Mutex<Option<Running>>,
    shared: Arc<Mutex<Shared>>,
    /// The last `start`, sent again when the program had to start again.
    last_start: Mutex<Option<Value>>,
    /// The widget shown alone on the first page of the home screen, if
    /// one is (`show_widget`).
    home: Mutex<Option<String>>,
    /// The open project's plugin, the one the reader runs of those in its
    /// folder (`show_plugin`).
    plugin: Mutex<Option<String>>,
    /// The open project, by its folder: another one starts with the home
    /// screen as the reader has it, no widget shown alone (`show_project`).
    project: Mutex<Option<String>>,
    /// The devices' bodies as the program said them, with the program
    /// they are of (`bodies`).
    bodies: Mutex<Option<(PathBuf, Value)>>,
    /// Whether the program takes `--wifi`, with the program it is of
    /// (`spawn`).
    wifi: Mutex<Option<(PathBuf, bool)>>,
}

impl Emulator {
    /// An emulator run from the program `program` finds; what it tells
    /// goes to `tell`.
    pub fn new(
        program: impl Fn() -> Result<PathBuf, String> + Send + Sync + 'static,
        tell: impl Fn(Event) + Send + Sync + 'static,
    ) -> Self {
        Emulator {
            program: Box::new(program),
            tell: Arc::new(tell),
            running: Mutex::new(None),
            shared: Arc::new(Mutex::new(Shared::default())),
            last_start: Mutex::new(None),
            home: Mutex::new(None),
            plugin: Mutex::new(None),
            project: Mutex::new(None),
            bodies: Mutex::new(None),
            wifi: Mutex::new(None),
        }
    }

    /// Sends `request`, the program started first if it is not running.
    fn send(&self, request: &Value) -> Result<(), String> {
        let mut running = self.running.lock().map_err(|_| "the emulator stopped".to_string())?;
        let alive = running.as_mut().is_some_and(|r| matches!(r.child.try_wait(), Ok(None)));
        if !alive {
            *running = Some(self.spawn()?);
            // A program started again picks up where the last one was.
            let again = self.last_start.lock().ok().and_then(|s| s.clone());
            if let Some(start) = again.filter(|_| request["op"] != "start") {
                write_line(&mut running.as_mut().unwrap().stdin, &start)?;
            }
        }
        let stdin = &mut running.as_mut().unwrap().stdin;
        write_line(stdin, request)
    }

    fn spawn(&self) -> Result<Running, String> {
        let program = (self.program)()?;
        let mut command = Command::new(&program);
        // Online from the start, as a reader on its Wi-Fi: a plugin that
        // fetches shows what it fetched. Before `--stdio`, which runs at
        // once; only where the program takes it (PaperPaw 0.5.0-beta.7 on).
        if self.takes_wifi(&program) {
            command.args(["--wifi", "online"]);
        }
        command.arg("--stdio").stdin(Stdio::piped()).stdout(Stdio::piped()).stderr(Stdio::null());
        hidden(&mut command);
        let mut child = command.spawn().map_err(|e| format!("{}: {e}", program.display()))?;
        let stdin = child.stdin.take().ok_or("the emulator has no input")?;
        let stdout = child.stdout.take().ok_or("the emulator has no output")?;
        let (shared, tell) = (self.shared.clone(), self.tell.clone());
        std::thread::Builder::new()
            .name("emulator-events".into())
            .spawn(move || read_events(BufReader::new(stdout), &shared, &*tell))
            .map_err(|e| e.to_string())?;
        Ok(Running { child, stdin })
    }

    /// Whether `program` takes `--wifi`, as its `--help` says; asked once
    /// of each program.
    fn takes_wifi(&self, program: &Path) -> bool {
        let Ok(mut kept) = self.wifi.lock() else { return false };
        if let Some((_, takes)) = kept.as_ref().filter(|(of, _)| of == program) {
            return *takes;
        }
        let mut command = Command::new(program);
        command.arg("--help").stdin(Stdio::null()).stderr(Stdio::null());
        hidden(&mut command);
        let takes = command.output().is_ok_and(|out| usage_takes_wifi(&String::from_utf8_lossy(&out.stdout)));
        *kept = Some((program.to_path_buf(), takes));
        takes
    }

    /// Sends `request` and waits for the event `event` that answers it.
    fn ask(&self, request: Value, event: &'static str, op: &'static str) -> Result<Value, String> {
        let (reply, answer) = channel();
        self.shared.lock().map_err(|e| e.to_string())?.waiting.push_back(Waiter { event, op, reply });
        self.send(&request)?;
        answer.recv_timeout(ANSWER).map_err(|_| format!("the emulator did not answer `{op}`"))?
    }

    /// Starts (or switches to) a reader of `profile` on its folder.
    pub fn start(&self, profile: &str, library: &Path) -> Result<(), String> {
        let request = json!({
            "op": "start",
            "profile": profile,
            "library": library.to_string_lossy(),
            "settings": self.settings_for(library)?,
            // Plugins with code built here run: the reader's folder is the
            // workshop's own, nothing else puts code into it.
            "trust_code": true,
        });
        *self.last_start.lock().map_err(|e| e.to_string())? = Some(request.clone());
        self.ask(request, "started", "start").map(|_| ())
    }

    /// Shows `widget` alone on the first page of the home screen, as a
    /// person who placed it there would see it: the reader starts again
    /// so, on every device shown from now on.
    pub fn show_widget(&self, widget: &str) -> Result<(), String> {
        *self.home.lock().map_err(|e| e.to_string())? = Some(widget.to_string());
        self.reload()
    }

    /// The reader runs `plugin` (the open project's, none where it has
    /// none yet) of the plugins in its folder, from its next start on;
    /// whether that is another than before.
    pub fn show_plugin(&self, plugin: Option<&str>) -> Result<bool, String> {
        let mut shown = self.plugin.lock().map_err(|e| e.to_string())?;
        let other = shown.as_deref() != plugin;
        *shown = plugin.map(String::from);
        Ok(other)
    }

    /// The reader shows project `project`: another than before, its home
    /// screen is the reader's own again (a widget an earlier project's
    /// conversation showed alone is not this one's); whether it is another.
    pub fn show_project(&self, project: &str) -> Result<bool, String> {
        let mut shown = self.project.lock().map_err(|e| e.to_string())?;
        let other = shown.as_deref() != Some(project);
        if other {
            *shown = Some(project.to_string());
            *self.home.lock().map_err(|e| e.to_string())? = None;
        }
        Ok(other)
    }

    /// The settings a reader on `library` starts with now.
    fn settings_for(&self, library: &Path) -> Result<String, String> {
        let home = self.home.lock().map_err(|e| e.to_string())?.clone();
        let plugin = self.plugin.lock().map_err(|e| e.to_string())?.clone();
        Ok(settings(home.as_deref(), &others(library, plugin.as_deref())))
    }

    /// The reader started again on its folder: plugins changed there are
    /// read anew, with the settings as they are now.
    pub fn reload(&self) -> Result<(), String> {
        let mut request = self
            .last_start
            .lock()
            .map_err(|e| e.to_string())?
            .clone()
            .ok_or("the reader has not started yet")?;
        let library = PathBuf::from(request["library"].as_str().unwrap_or_default());
        request["settings"] = json!(self.settings_for(&library)?);
        *self.last_start.lock().map_err(|e| e.to_string())? = Some(request.clone());
        self.ask(request, "started", "start").map(|_| ())
    }

    pub fn button(&self, name: &str, pressed: bool) -> Result<(), String> {
        self.send(&json!({"op": "button", "name": name, "pressed": pressed}))
    }

    pub fn pointer(&self, phase: &str, x: i32, y: i32) -> Result<(), String> {
        self.send(&json!({"op": "pointer", "phase": phase, "x": x, "y": y}))
    }

    /// What the screen shows, part by part (`parts`).
    pub fn describe(&self) -> Result<Value, String> {
        self.ask(json!({"op": "describe"}), "described", "describe")
    }

    /// The panel as a PNG in base64.
    pub fn shot(&self) -> Result<String, String> {
        let shot = self.ask(json!({"op": "shot"}), "shot", "shot")?;
        shot["png"].as_str().map(String::from).ok_or_else(|| "the emulator sent no picture".into())
    }

    pub fn run(&self, action: &str) -> Result<(), String> {
        self.send(&json!({"op": "run", "action": action}))
    }

    pub fn open(&self, screen: &str, params: &Value) -> Result<(), String> {
        self.send(&json!({"op": "open", "screen": screen, "params": params}))
    }

    /// Opens the screen bound to `slot` (`core.settings`), as a plugin
    /// would; false where the emulator's protocol has no `slot` yet.
    pub fn slot(&self, slot: &str, params: &Value) -> Result<bool, String> {
        let speaks = self.ready().is_some_and(|r| r.protocol >= SLOTS);
        if speaks {
            self.send(&json!({"op": "slot", "slot": slot, "params": params}))?;
        }
        Ok(speaks)
    }

    /// Each device's body around its screen and its keys where they sit
    /// (PaperPaw's docs/web-emulator.md, "The body and its keys"), by
    /// profile id, as `paperpaw-emu --registry` says them; asked once of
    /// each program. None for a device whose emulator says no body (one
    /// from before bodies).
    pub fn bodies(&self) -> Result<Value, String> {
        let program = (self.program)()?;
        let mut kept = self.bodies.lock().map_err(|e| e.to_string())?;
        if let Some((_, bodies)) = kept.as_ref().filter(|(of, _)| *of == program) {
            return Ok(bodies.clone());
        }
        let folder = std::env::temp_dir().join(format!("paperpaw-workshop-registry-{}", std::process::id()));
        std::fs::create_dir_all(&folder).map_err(|e| e.to_string())?;
        let file = folder.join("registry.json");
        let mut command = Command::new(&program);
        command.arg("--registry").arg(&file).stdin(Stdio::null()).stdout(Stdio::null()).stderr(Stdio::null());
        hidden(&mut command);
        let status = command.status().map_err(|e| format!("{}: {e}", program.display()))?;
        let text = std::fs::read_to_string(&file);
        let _ = std::fs::remove_dir_all(&folder);
        let registry: Value = match (status.success(), text) {
            (true, Ok(text)) => serde_json::from_str(&text).map_err(|e| e.to_string())?,
            _ => return Err(format!("{} --registry did not answer", program.display())),
        };
        let bodies = bodies_of(&registry);
        *kept = Some((program, bodies.clone()));
        Ok(bodies)
    }

    /// Who answers, once the program said it.
    pub fn ready(&self) -> Option<Ready> {
        self.shared.lock().ok().and_then(|s| s.ready.clone())
    }

    /// The warnings and requests of the plugins since asked last.
    pub fn take_told(&self) -> (Vec<String>, Vec<String>) {
        let Ok(mut shared) = self.shared.lock() else { return Default::default() };
        (std::mem::take(&mut shared.warnings), std::mem::take(&mut shared.requests))
    }

    /// Ends the program.
    pub fn quit(&self) {
        if let Ok(mut running) = self.running.lock() {
            if let Some(mut r) = running.take() {
                let _ = write_line(&mut r.stdin, &json!({"op": "quit"}));
                let _ = r.child.wait();
            }
        }
    }
}

impl Drop for Emulator {
    fn drop(&mut self) {
        self.quit();
    }
}

fn write_line(stdin: &mut ChildStdin, request: &Value) -> Result<(), String> {
    let mut line = request.to_string();
    line.push('\n');
    stdin.write_all(line.as_bytes()).and_then(|()| stdin.flush()).map_err(|e| format!("the emulator stopped: {e}"))
}

/// Reads the program's events until it ends: frames to the window,
/// answers to who waits for them.
fn read_events(out: impl BufRead, shared: &Mutex<Shared>, tell: &(dyn Fn(Event) + Send + Sync)) {
    for line in out.lines() {
        let Ok(line) = line else { break };
        let Ok(event) = serde_json::from_str::<Value>(&line) else { continue };
        let Ok(mut s) = shared.lock() else { break };
        let text = |key: &str| event[key].as_str().unwrap_or_default().to_string();
        match event["event"].as_str().unwrap_or_default() {
            "ready" => {
                let ready = Ready {
                    protocol: event["protocol"].as_u64().unwrap_or(0),
                    paperpaw: text("paperpaw"),
                    profiles: strings(&event["profiles"]),
                    fingerprint: text("fingerprint"),
                    toolchain: text("toolchain"),
                };
                if ready.protocol < PROTOCOL {
                    tell(Event::Error(format!(
                        "This PaperPaw emulator speaks protocol {}, the workshop {PROTOCOL}: choose another PaperPaw version.",
                        ready.protocol
                    )));
                }
                s.ready = Some(ready);
            }
            "started" => {
                s.started = Started { profile: text("profile"), buttons: strings(&event["buttons"]), touch: event["touch"].as_bool() == Some(true) };
                answer(&mut s, "started", None, Ok(event));
            }
            "frame" => {
                let started = s.started.clone();
                drop(s);
                tell(Event::Frame(Frame {
                    profile: started.profile,
                    width: event["width"].as_u64().unwrap_or(0),
                    height: event["height"].as_u64().unwrap_or(0),
                    png: text("png"),
                    buttons: started.buttons,
                    touch: started.touch,
                }));
            }
            "described" | "shot" => {
                let name = if event["event"] == "shot" { "shot" } else { "described" };
                answer(&mut s, name, None, Ok(event));
            }
            "warning" => s.warnings.push(text("message")),
            "request" => {
                let request = format!("{} {}", text("method"), text("url"));
                s.requests.push(request);
            }
            "error" => {
                let message = text("message");
                let op = event["op"].as_str().map(String::from);
                if !answer(&mut s, "", op.as_deref(), Err(message.clone())) {
                    drop(s);
                    tell(Event::Error(message));
                }
            }
            _ => {}
        }
    }
    // The program ended: whoever waits hears it.
    if let Ok(mut s) = shared.lock() {
        for waiter in s.waiting.drain(..) {
            let _ = waiter.reply.send(Err("the emulator stopped".into()));
        }
    }
    tell(Event::Error("The reader stopped. It starts again with the next button.".into()));
}

/// Gives the first waiter for `event` (or, for an error, for the request
/// `op`) its answer; whether there was one.
fn answer(shared: &mut Shared, event: &str, op: Option<&str>, result: Result<Value, String>) -> bool {
    let at = shared.waiting.iter().position(|w| match op {
        Some(op) => w.op == op,
        None => w.event == event,
    });
    match at.and_then(|i| shared.waiting.remove(i)) {
        Some(waiter) => {
            let _ = waiter.reply.send(result);
            true
        }
        None => false,
    }
}

fn strings(value: &Value) -> Vec<String> {
    value.as_array().map(|a| a.iter().filter_map(|v| v.as_str().map(String::from)).collect()).unwrap_or_default()
}

/// Puts the plugin of `files` into the reader's folder `library` as a
/// reader's card has it (`plugins/<id>/`), the one there before replaced.
pub fn place_plugin(library: &Path, id: &str, files: &[(String, Vec<u8>)]) -> Result<(), String> {
    if id.is_empty() || !id.chars().all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '-' || c == '.') {
        return Err(format!("`{id}` is no plugin id"));
    }
    let folder = library.join("plugins").join(id);
    // The reader may still hold the folder (Windows refuses to remove what
    // is open): then it is brought up to date file by file instead, what is
    // gone from the plugin removed, the rest written over.
    if folder.exists() && std::fs::remove_dir_all(&folder).is_err() {
        let keep: Vec<PathBuf> = files.iter().map(|(p, _)| folder.join(p)).collect();
        let mut stale = Vec::new();
        collect_files(&folder, &mut stale);
        for file in stale.into_iter().filter(|f| !keep.contains(f)) {
            std::fs::remove_file(&file).map_err(|e| format!("{}: {e}", file.display()))?;
        }
    }
    for (path, bytes) in files {
        let file = folder.join(path);
        if let Some(parent) = file.parent() {
            std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
        std::fs::write(&file, bytes).map_err(|e| format!("{path}: {e}"))?;
    }
    Ok(())
}

/// Every file under `dir`, into `out`.
pub(crate) fn collect_files(dir: &Path, out: &mut Vec<PathBuf>) {
    for entry in std::fs::read_dir(dir).into_iter().flatten().flatten() {
        let path = entry.path();
        if path.is_dir() {
            collect_files(&path, out);
        } else {
            out.push(path);
        }
    }
}

/// The plugin's id, from its `plugin.ini` (`[plugin]`, `id = ...`).
pub fn plugin_id(files: &[(String, Vec<u8>)]) -> Option<String> {
    let ini = files.iter().find(|(p, _)| p == "plugin.ini")?;
    let text = String::from_utf8_lossy(&ini.1);
    let mut section = String::new();
    for line in text.lines().map(str::trim) {
        if let Some(name) = line.strip_prefix('[').and_then(|l| l.strip_suffix(']')) {
            section = name.trim().to_string();
        } else if let Some((key, value)) = line.split_once('=') {
            if section == "plugin" && key.trim() == "id" {
                return Some(value.trim().to_string());
            }
        }
    }
    None
}

// ---- The commands ---------------------------------------------------------

/// The emulator of the app, its events going to the window.
pub fn for_app(app: AppHandle) -> Emulator {
    Emulator::new(crate::paths::emulator_program, move |event| {
        let _ = match event {
            Event::Frame(frame) => app.emit("emulator-frame", frame),
            Event::Error(message) => app.emit("emulator-error", message),
        };
    })
}

/// The reader shown in the window, kept to put the plugin on it.
pub struct Shown(pub Mutex<Option<String>>);

/// Starts (or switches to) the reader `profile`, its files in the app's
/// own folder for that reader. Waits off the window's thread.
#[tauri::command]
pub async fn emulator_start(emulator: State<'_, Emulator>, shown: State<'_, Shown>, profile: String) -> Result<(), String> {
    if !PROFILES.contains(&profile.as_str()) {
        return Err(format!("no reader `{profile}`"));
    }
    let library = crate::paths::emulator_library(&profile)?;
    std::fs::create_dir_all(&library).map_err(|e| e.to_string())?;
    *shown.0.lock().map_err(|e| e.to_string())? = Some(profile.clone());
    emulator.start(&profile, &library)
}

/// A button of the reader pressed or let go (`page-forward`, `confirm`, ...).
#[tauri::command]
pub fn emulator_button(emulator: State<'_, Emulator>, name: String, pressed: bool) -> Result<(), String> {
    emulator.button(&name, pressed)
}

/// A finger on a touch screen, at the panel's own pixels.
#[tauri::command]
pub fn emulator_pointer(emulator: State<'_, Emulator>, phase: String, x: i32, y: i32) -> Result<(), String> {
    emulator.pointer(&phase, x, y)
}

/// The project's plugin put on the reader shown, which starts again on it.
#[tauri::command]
pub async fn emulator_sync(emulator: State<'_, Emulator>, shown: State<'_, Shown>, project: String) -> Result<(), String> {
    let root = crate::paths::projects()?;
    // A plugin with code: its folder and its last build.
    let files = crate::code::for_emulator(&crate::projects::folder(&root, &project)?, crate::projects::plugin_files(&root, &project)?);
    let id = plugin_id(&files);
    // Only this project's plugin runs: those of projects open before are
    // switched off.
    let other = emulator.show_project(&project)? | emulator.show_plugin(id.as_deref())?;
    let Some(profile) = shown.0.lock().map_err(|e| e.to_string())?.clone() else { return Ok(()) };
    let library = crate::paths::emulator_library(&profile)?;
    let Some(id) = id else { return if other { emulator.reload() } else { Ok(()) } };
    // Unchanged, the reader stays where it is (a screen opened, asleep).
    if !other && same_plugin(&library.join("plugins").join(&id), &files) {
        return Ok(());
    }
    place_plugin(&library, &id, &files)?;
    emulator.reload()
}

/// Whether `folder` holds exactly `files`, byte for byte.
pub fn same_plugin(folder: &Path, files: &[(String, Vec<u8>)]) -> bool {
    let mut there = Vec::new();
    collect_files(folder, &mut there);
    there.len() == files.len() && files.iter().all(|(path, bytes)| std::fs::read(folder.join(path)).is_ok_and(|b| &b == bytes))
}

/// Of a registry (`paperpaw-emu --registry`), each profile's body, by
/// its id: those that have one.
/// No console window beside the workshop's.
fn hidden(command: &mut Command) {
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        command.creation_flags(0x0800_0000);
    }
    #[cfg(not(windows))]
    let _ = command;
}

/// Whether the usage `paperpaw-emu --help` prints names `--wifi`.
fn usage_takes_wifi(usage: &str) -> bool {
    usage.lines().any(|line| line.trim_start().starts_with("--wifi"))
}

pub fn bodies_of(registry: &Value) -> Value {
    let bodies = registry["profiles"]
        .as_array()
        .into_iter()
        .flatten()
        .filter_map(|p| Some((p["id"].as_str()?.to_string(), p.get("body").filter(|b| b.is_object())?.clone())))
        .collect::<serde_json::Map<_, _>>();
    Value::Object(bodies)
}

/// The devices' bodies with their keys, by profile id.
#[tauri::command]
pub async fn emulator_bodies(emulator: State<'_, Emulator>) -> Result<Value, String> {
    emulator.bodies()
}

/// Shows widget `widget` (`<plugin>.<name>`) alone on the first page of
/// the home screen of the reader beside the conversation.
#[tauri::command]
pub async fn emulator_widget(emulator: State<'_, Emulator>, widget: String) -> Result<(), String> {
    let plain = !widget.is_empty() && widget.len() <= 120 && widget.chars().all(|c| c.is_ascii_alphanumeric() || "._@-".contains(c));
    if !plain {
        return Err(format!("not a widget's id: {widget}"));
    }
    emulator.show_widget(&widget)
}

/// What the screen shows, part by part, for the AI.
#[tauri::command]
pub async fn emulator_describe(emulator: State<'_, Emulator>) -> Result<Value, String> {
    emulator.describe()
}

/// The panel as a PNG in base64, for the AI when it must see it.
#[tauri::command]
pub async fn emulator_shot(emulator: State<'_, Emulator>) -> Result<String, String> {
    emulator.shot()
}

/// Runs an action or opens a screen, as the AI asks to look at one.
#[tauri::command]
pub async fn emulator_open(emulator: State<'_, Emulator>, screen: String, params: Option<Value>) -> Result<(), String> {
    emulator.open(&screen, &params.unwrap_or_else(|| json!({})))
}

/// Opens a slot's screen; false where the emulator cannot (an older one).
#[tauri::command]
pub async fn emulator_slot(emulator: State<'_, Emulator>, slot: String, params: Option<Value>) -> Result<bool, String> {
    emulator.slot(&slot, &params.unwrap_or_else(|| json!({})))
}

#[tauri::command]
pub async fn emulator_run(emulator: State<'_, Emulator>, action: String) -> Result<(), String> {
    emulator.run(&action)
}

/// The plugins' warnings and requests since asked last.
#[tauri::command]
pub fn emulator_told(emulator: State<'_, Emulator>) -> (Vec<String>, Vec<String>) {
    emulator.take_told()
}

/// Which PaperPaw answers (its version, and what code plugins are built for).
#[tauri::command]
pub fn emulator_ready(emulator: State<'_, Emulator>) -> Option<Ready> {
    emulator.ready()
}

#[cfg(test)]
mod tests {
    use super::*;

    /// PaperPaw's emulator for the tests: `PAPERPAW_EMU`, else the tests
    /// that need it are skipped (they say so).
    fn program() -> Option<PathBuf> {
        std::env::var_os("PAPERPAW_EMU").map(PathBuf::from).filter(|p| p.exists())
    }

    #[test]
    fn wifi_is_asked_for_only_of_an_emulator_that_takes_it() {
        let newer = "OPTIONS:
    --profile <id>        Device
    --wifi <state>        online, offline or none
";
        let older = "OPTIONS:
    --profile <id>        Device
    --network <how>       real or fixtures (Wi-Fi)
";
        assert!(usage_takes_wifi(newer));
        assert!(!usage_takes_wifi(older));
    }

    #[test]
    fn events_go_to_the_window_and_answers_to_who_waits() {
        let shared = Mutex::new(Shared::default());
        let (reply, answered) = channel();
        shared.lock().unwrap().waiting.push_back(Waiter { event: "described", op: "describe", reply });
        let lines = [
            r#"{"event": "ready", "protocol": 1, "paperpaw": "0.4.0", "profiles": ["xteink-x4"], "fingerprint": "ab", "toolchain": "1.90"}"#,
            r#"{"event": "started", "profile": "xteink-x4", "width": 480, "height": 800, "buttons": ["confirm"], "touch": false}"#,
            r#"{"event": "frame", "width": 480, "height": 800, "png": "iVBO"}"#,
            r#"{"event": "described", "parts": []}"#,
            r#"{"event": "warning", "message": "a plugin warned"}"#,
            r#"{"event": "error", "op": "button", "message": "no button"}"#,
        ];
        let told = Mutex::new(Vec::new());
        read_events(lines.join("\n").as_bytes(), &shared, &|e| told.lock().unwrap().push(e));
        let told = told.into_inner().unwrap();
        let Event::Frame(frame) = &told[0] else { panic!("{told:?}") };
        assert_eq!((frame.profile.as_str(), frame.width, frame.buttons.clone()), ("xteink-x4", 480, vec!["confirm".to_string()]));
        assert_eq!(told[1], Event::Error("no button".into()), "no one waited for it");
        assert!(matches!(&told[2], Event::Error(m) if m.contains("stopped")), "the end");
        assert_eq!(answered.recv().unwrap().unwrap()["parts"], json!([]));
        let s = shared.lock().unwrap();
        assert_eq!(s.ready.as_ref().unwrap().paperpaw, "0.4.0");
        assert_eq!(s.warnings, ["a plugin warned"]);
    }

    #[test]
    fn a_registry_s_bodies_by_profile() {
        let registry = json!({"profiles": [
            {"id": "xteink-x4", "body": {"bezel": [7, 7, 30, 7], "keys": [{"button": "back", "place": "below", "at": 19, "length": 17, "keys": ["Escape"]}]}},
            {"id": "old-one"},
        ]});
        let bodies = bodies_of(&registry);
        assert_eq!(bodies["xteink-x4"]["keys"][0]["button"], "back");
        assert!(bodies.get("old-one").is_none());
        assert_eq!(bodies_of(&json!({})), json!({}));
    }

    #[test]
    fn the_emulator_says_its_devices_bodies() {
        let Some(program) = program() else {
            eprintln!("skipped: PAPERPAW_EMU names no emulator");
            return;
        };
        let emulator = Emulator::new(move || Ok(program.clone()), |_| {});
        let bodies = emulator.bodies().unwrap();
        // An emulator from before bodies says none: nothing to check then.
        if let Some(x4) = bodies.get("xteink-x4") {
            assert!(x4["keys"].as_array().is_some_and(|k| !k.is_empty()));
        }
        assert_eq!(emulator.bodies().unwrap(), bodies, "asked once, kept");
    }

    #[test]
    fn only_the_open_project_s_plugin_runs() {
        let folder = tempfile::tempdir().unwrap();
        for id in ["minimal", "duck", "newyear"] {
            std::fs::create_dir_all(folder.path().join("plugins").join(id)).unwrap();
        }
        let off = others(folder.path(), Some("duck"));
        assert_eq!(off, ["minimal", "newyear"]);
        assert_eq!(
            settings(Some("duck.fact"), &off),
            format!("{SETTINGS}[home]\npage-1 = duck.fact\n[plugins]\nminimal = off\nnewyear = off\n")
        );
        assert_eq!(others(folder.path(), None).len(), 3);
        assert_eq!(settings(None, &[]), SETTINGS);
        let emulator = Emulator::new(|| Err("none".into()), |_| {});
        assert!(emulator.show_plugin(Some("duck")).unwrap());
        assert!(!emulator.show_plugin(Some("duck")).unwrap());
        assert!(emulator.show_plugin(None).unwrap());
    }

    #[test]
    fn another_project_shows_the_reader_s_own_home_screen() {
        let emulator = Emulator::new(|| Err("none".into()), |_| {});
        assert!(emulator.show_project("Duck facts").unwrap());
        *emulator.home.lock().unwrap() = Some("duck.fact".into());
        assert!(!emulator.show_project("Duck facts").unwrap(), "the same one keeps it");
        assert_eq!(emulator.home.lock().unwrap().as_deref(), Some("duck.fact"));
        assert!(emulator.show_project("Night owl").unwrap());
        assert_eq!(*emulator.home.lock().unwrap(), None);
    }

    #[test]
    fn a_plugin_goes_where_a_card_has_it() {
        let folder = tempfile::tempdir().unwrap();
        let files = vec![
            ("plugin.ini".to_string(), b"[plugin]\nid = my-look\nversion = 1.0.0\n".to_vec()),
            ("i18n/en.ini".to_string(), b"x = y\n".to_vec()),
        ];
        assert_eq!(plugin_id(&files).as_deref(), Some("my-look"));
        std::fs::create_dir_all(folder.path().join("plugins/my-look/old")).unwrap();
        place_plugin(folder.path(), "my-look", &files).unwrap();
        assert!(folder.path().join("plugins/my-look/i18n/en.ini").exists());
        assert!(!folder.path().join("plugins/my-look/old").exists(), "the one before replaced");
        assert!(place_plugin(folder.path(), "../x", &files).is_err());
        let placed = folder.path().join("plugins/my-look");
        assert!(same_plugin(&placed, &files), "unchanged: the reader is not started again");
        assert!(!same_plugin(&placed, &files[..1]), "a file gone");
        let mut changed = files.clone();
        changed[1].1 = b"x = z
".to_vec();
        assert!(!same_plugin(&placed, &changed));
    }

    #[test]
    fn a_reader_starts_in_paperpaw_s_emulator_and_shows_its_home_screen() {
        let Some(program) = program() else {
            eprintln!("skipped: PAPERPAW_EMU names no paperpaw-emu");
            return;
        };
        let folder = tempfile::tempdir().unwrap();
        let (frames, seen) = channel();
        let emulator = Emulator::new(move || Ok(program.clone()), move |e| {
            let _ = frames.send(e);
        });
        emulator.start("xteink-x4", folder.path()).unwrap();
        let frame = loop {
            match seen.recv_timeout(ANSWER).unwrap() {
                Event::Frame(frame) => break frame,
                Event::Error(message) => panic!("{message}"),
            }
        };
        assert_eq!((frame.width, frame.height), (480, 800));
        assert!(frame.buttons.iter().any(|b| b == "page-forward"));
        assert!(emulator.ready().unwrap().protocol >= PROTOCOL);
        let parts = emulator.describe().unwrap();
        assert!(parts["parts"].as_array().is_some_and(|p| !p.is_empty()));
        assert!(emulator.shot().unwrap().starts_with("iVBOR"), "a PNG");
        assert!(emulator.button("no-such-button", true).is_ok(), "said as an event");
        emulator.quit();
    }
}
