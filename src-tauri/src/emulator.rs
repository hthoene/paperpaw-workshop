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

/// The protocol of `paperpaw-emu --stdio` the workshop speaks.
pub const PROTOCOL: u64 = 1;

/// The readers the window offers, by the profiles' ids.
pub const PROFILES: [&str; 3] = ["xteink-x4", "xteink-x4-pro", "boox-go-7"];

/// The readers' settings in the workshop: no "How it works here" hints
/// over the screens a plugin is tried on.
const SETTINGS: &str = "[help]\nshow = false\n";

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
        command.arg("--stdio").stdin(Stdio::piped()).stdout(Stdio::piped()).stderr(Stdio::null());
        #[cfg(windows)]
        {
            use std::os::windows::process::CommandExt;
            // No console window beside the workshop's.
            command.creation_flags(0x0800_0000);
        }
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
            "settings": SETTINGS,
            // Plugins with code built here run: the reader's folder is the
            // workshop's own, nothing else puts code into it.
            "trust_code": true,
        });
        *self.last_start.lock().map_err(|e| e.to_string())? = Some(request.clone());
        self.ask(request, "started", "start").map(|_| ())
    }

    /// The reader started again on its folder: plugins changed there are
    /// read anew.
    pub fn reload(&self) -> Result<(), String> {
        self.ask(json!({"op": "reload"}), "started", "reload").map(|_| ())
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
                if ready.protocol != PROTOCOL {
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
    if folder.exists() {
        std::fs::remove_dir_all(&folder).map_err(|e| format!("{}: {e}", folder.display()))?;
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
    let Some(id) = plugin_id(&files) else { return Ok(()) };
    let Some(profile) = shown.0.lock().map_err(|e| e.to_string())?.clone() else { return Ok(()) };
    place_plugin(&crate::paths::emulator_library(&profile)?, &id, &files)?;
    emulator.reload()
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
        assert_eq!(emulator.ready().unwrap().protocol, PROTOCOL);
        let parts = emulator.describe().unwrap();
        assert!(parts["parts"].as_array().is_some_and(|p| !p.is_empty()));
        assert!(emulator.shot().unwrap().starts_with("iVBOR"), "a PNG");
        assert!(emulator.button("no-such-button", true).is_ok(), "said as an event");
        emulator.quit();
    }
}
