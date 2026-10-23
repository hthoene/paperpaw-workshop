//! The reader beside the conversation: PaperPaw's own emulator, the device
//! model of `paperpaw-emulator` without its window, run on a thread of its
//! own (a device is not shared between threads). The window gets its panel
//! as PNG frames, only when they change, and sends buttons and touches
//! back. No wasm: the same code as the desktop emulator, natively.

use std::path::{Path, PathBuf};
use std::sync::Mutex;
use std::sync::mpsc::{Receiver, RecvTimeoutError, Sender, channel};
use std::time::Duration;

use base64::Engine;
use paperpaw_emulator::device::{self, Device};
use paperpaw_emulator::profiles;
use paperpaw_platform::{ButtonState, InputEvent, Point, PointerEvent, PointerPhase, PointerTool};
use serde::Serialize;
use tauri::{AppHandle, Emitter, State};

/// The readers the window offers, by the profiles' ids.
pub const PROFILES: [&str; 3] = ["xteink-x4", "xteink-x4-pro", "boox-go-7"];

/// How long the thread waits at most between looks, when the device asks
/// for nothing sooner (a clock, an animation).
const IDLE_MS: u64 = 50;

enum Command {
    Start { profile: String, library: PathBuf },
    Button { name: String, pressed: bool },
    Pointer { phase: PointerPhase, point: Point },
}

/// The handle the commands use: sends to the device's thread.
pub struct Emulator(Mutex<Sender<Command>>);

/// A frame for the window: the panel as a PNG, and what the device has.
#[derive(Debug, Clone, Serialize)]
pub struct Frame {
    pub profile: String,
    pub width: u16,
    pub height: u16,
    /// The panel, a PNG in base64.
    pub png: String,
    /// Its buttons, by PaperPaw's names (`page-forward`, `confirm`, ...).
    pub buttons: Vec<String>,
    pub touch: bool,
}

/// Starts the device's thread; frames go to the window as `emulator-frame`,
/// failures as `emulator-error`.
pub fn spawn(app: AppHandle) -> Emulator {
    let (sender, receiver) = channel();
    std::thread::Builder::new()
        .name("emulator".into())
        .spawn(move || run(&receiver, &mut |event| send(&app, event)))
        .expect("the emulator's thread could not start");
    Emulator(Mutex::new(sender))
}

/// What the thread tells the window.
#[derive(Debug)]
pub enum Event {
    Frame(Frame),
    Error(String),
}

fn send(app: &AppHandle, event: Event) {
    let _ = match event {
        Event::Frame(frame) => app.emit("emulator-frame", frame),
        Event::Error(message) => app.emit("emulator-error", message),
    };
}

/// The device's loop: commands as they come, the kernel's ticks when due,
/// answers from the network and plugins' servers, a frame when the panel
/// changed.
fn run(receiver: &Receiver<Command>, tell: &mut dyn FnMut(Event)) {
    let mut device: Option<Device> = None;
    let mut shown: Vec<u8> = Vec::new();
    loop {
        let wait = device
            .as_ref()
            .and_then(|d| d.next_wake().map(|at| at.since(d.now())))
            .map_or(IDLE_MS, |ms| ms.clamp(1, IDLE_MS));
        match receiver.recv_timeout(Duration::from_millis(wait)) {
            Ok(command) => {
                if let Err(message) = handle(&mut device, command) {
                    tell(Event::Error(message));
                }
            }
            Err(RecvTimeoutError::Timeout) => {}
            Err(RecvTimeoutError::Disconnected) => break,
        }
        if let Some(device) = device.as_mut() {
            device.tick_if_due();
            device.poll_http(None);
            device.poll_servers();
            let rgb = device.panel.rgb_bytes();
            if rgb != shown {
                match frame(device, &rgb) {
                    Ok(frame) => tell(Event::Frame(frame)),
                    Err(message) => tell(Event::Error(message)),
                }
                shown = rgb;
            }
        }
    }
    if let Some(mut device) = device {
        device.shut_down();
    }
}

fn handle(device: &mut Option<Device>, command: Command) -> Result<(), String> {
    match command {
        Command::Start { profile, library } => {
            if let Some(mut old) = device.take() {
                old.shut_down();
            }
            *device = Some(start(&profile, &library)?);
        }
        Command::Button { name, pressed } => {
            let Some(device) = device.as_mut() else { return Ok(()) };
            // The device's own name for it: the kernel takes `&'static str`.
            let Some(&name) = device.profile.buttons.iter().find(|b| **b == name) else {
                return Ok(());
            };
            let state = if pressed { ButtonState::Pressed } else { ButtonState::Released };
            device.input(InputEvent::Button { name, state });
        }
        Command::Pointer { phase, point } => {
            let Some(device) = device.as_mut() else { return Ok(()) };
            if device.profile.device.input.touch {
                device.input(InputEvent::Pointer(PointerEvent {
                    id: 0,
                    phase,
                    point,
                    tool: PointerTool::Finger,
                    pressure: 1000,
                }));
            }
        }
    }
    Ok(())
}

/// A device of `profile` on the library folder `library`, started.
fn start(profile: &str, library: &Path) -> Result<Device, String> {
    let profile = profiles::find(profile).ok_or_else(|| format!("no reader `{profile}`"))?;
    prepare_library(library).map_err(|e| format!("{}: {e}", library.display()))?;
    let storage = device::library(library).map_err(|e| format!("{}: {e}", library.display()))?;
    let mut device =
        Device::new(profile, None, storage, false).map_err(|e| format!("{}: {e}", profile.device.id))?;
    // Frames as they end up, not the panel's flashing on the way.
    device.panel.animate = false;
    device.start();
    device.tick_if_due();
    Ok(device)
}

/// The emulated reader's folder, ready to start: its setup is done, so it
/// opens on the home screen rather than the first-start questions.
pub fn prepare_library(library: &Path) -> std::io::Result<()> {
    let setup = library.join(".paperpaw/plugins/setup");
    std::fs::create_dir_all(&setup)?;
    let done = setup.join("done");
    if !done.exists() {
        std::fs::write(done, b"")?;
    }
    std::fs::create_dir_all(library.join("books"))
}

fn frame(device: &Device, rgb: &[u8]) -> Result<Frame, String> {
    let (width, height) = (device.panel.width(), device.panel.height());
    Ok(Frame {
        profile: device.profile.device.id.to_string(),
        width,
        height,
        png: base64::engine::general_purpose::STANDARD.encode(png(width, height, rgb)?),
        buttons: device.profile.buttons.iter().map(ToString::to_string).collect(),
        touch: device.profile.device.input.touch,
    })
}

/// `rgb` (8 bits a channel) as a PNG.
pub fn png(width: u16, height: u16, rgb: &[u8]) -> Result<Vec<u8>, String> {
    let mut bytes = Vec::new();
    let mut encoder = png::Encoder::new(&mut bytes, u32::from(width), u32::from(height));
    encoder.set_color(png::ColorType::Rgb);
    encoder.set_depth(png::BitDepth::Eight);
    let mut writer = encoder.write_header().map_err(|e| e.to_string())?;
    writer.write_image_data(rgb).map_err(|e| e.to_string())?;
    writer.finish().map_err(|e| e.to_string())?;
    Ok(bytes)
}

fn command(emulator: &State<'_, Emulator>, command: Command) -> Result<(), String> {
    emulator
        .0
        .lock()
        .map_err(|_| "the emulator stopped".to_string())?
        .send(command)
        .map_err(|_| "the emulator stopped".to_string())
}

/// Starts (or switches to) the reader `profile`, its files in the app's
/// own folder for that reader.
#[tauri::command]
pub fn emulator_start(emulator: State<'_, Emulator>, profile: String) -> Result<(), String> {
    if !PROFILES.contains(&profile.as_str()) {
        return Err(format!("no reader `{profile}`"));
    }
    let library = crate::paths::emulator_library(&profile)?;
    command(&emulator, Command::Start { profile, library })
}

/// A button of the reader pressed or let go (`page-forward`, `confirm`, ...).
#[tauri::command]
pub fn emulator_button(emulator: State<'_, Emulator>, name: String, pressed: bool) -> Result<(), String> {
    command(&emulator, Command::Button { name, pressed })
}

/// A finger on a touch screen, at the panel's own pixels.
#[tauri::command]
pub fn emulator_pointer(emulator: State<'_, Emulator>, phase: String, x: i32, y: i32) -> Result<(), String> {
    let phase = match phase.as_str() {
        "down" => PointerPhase::Down,
        "move" => PointerPhase::Move,
        "up" => PointerPhase::Up,
        _ => PointerPhase::Cancel,
    };
    command(&emulator, Command::Pointer { phase, point: Point::new(x, y) })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn a_reader_starts_and_shows_its_home_screen() {
        let folder = tempfile::tempdir().unwrap();
        let (sender, receiver) = channel();
        sender
            .send(Command::Start { profile: "xteink-x4".into(), library: folder.path().to_path_buf() })
            .unwrap();
        drop(sender);
        let mut frames = Vec::new();
        run(&receiver, &mut |event| match event {
            Event::Frame(frame) => frames.push(frame),
            Event::Error(message) => panic!("{message}"),
        });
        let frame = frames.last().expect("a frame");
        assert_eq!((frame.width, frame.height), (480, 800));
        assert!(frame.buttons.iter().any(|b| b == "page-forward"));
        assert!(!frame.touch);
        let png = base64::engine::general_purpose::STANDARD.decode(&frame.png).unwrap();
        assert_eq!(&png[1..4], b"PNG");
        assert!(folder.path().join(".paperpaw/plugins/setup/done").exists());
    }

    #[test]
    fn an_unknown_reader_is_said() {
        let folder = tempfile::tempdir().unwrap();
        assert!(start("kindle", folder.path()).is_err());
    }
}
