//! A reader on the USB cable: PaperPaw's cable transfer (its
//! docs/usb-transfer.md, `tools/usb-transfer.py`), which every firmware
//! of the X4 and the X4 Pro speaks. Requests and answers are lines of
//! text over the chip's own USB serial link, among the lines of its log:
//!
//! ```text
//! PPT/1 <n> <METHOD> <target> <body bytes>      the request
//! PPT/1 <n> data <hex>                           its body, 512 bytes a line
//! PPT/1 <n> <status> <content type>              the answer
//! PPT/1 <n> data <hex>
//! PPT/1 <n> end
//! ```
//!
//! Only Espressif's USB serial units are looked at (an X4's or X4 Pro's
//! chip), never another device's port, and each answer is waited for a
//! bounded time. The port is opened with DTR and RTS low, which leaves the
//! chip running, and closed after each use: the reader closes its transfer
//! screen by itself after five minutes without requests.

use std::io::{Read, Write};
use std::time::{Duration, Instant};

use serde::Serialize;

/// Espressif's USB serial and JTAG unit, built into the X4's ESP32-C3 and
/// the X4 Pro's ESP32-S3.
pub const USB_ID: (u16, u16) = (0x303A, 0x1001);
const PREFIX: &str = "PPT/1 ";
/// Bytes of a body in one line.
const DATA: usize = 512;
const BAUD: u32 = 115_200;
/// How long one read of the port waits.
const READ: Duration = Duration::from_millis(200);
/// How long an answer may take (writing a file to the card is slow).
const ANSWER: Duration = Duration::from_secs(30);
/// How long a reader has to say what it is when looked for.
const HELLO: Duration = Duration::from_secs(3);

/// A reader found on the cable, as it says what it is.
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize)]
pub struct Found {
    pub port: String,
    /// PaperPaw's id of the device, e.g. `xteink-x4-pro`.
    pub device: Option<String>,
    pub name: Option<String>,
    pub version: Option<String>,
    /// The build plugins with code must have; none where it runs none.
    pub fingerprint: Option<String>,
    /// Why it did not answer, where it did not.
    pub problem: Option<String>,
}

/// The cable transfer over `link`: one request at a time.
pub struct Cable<L: Read + Write> {
    link: L,
    buffer: Vec<u8>,
    next: u32,
    wait: Duration,
}

impl<L: Read + Write> Cable<L> {
    /// Requests over `link`, each answer waited for `wait` at most.
    pub fn new(link: L, wait: Duration) -> Self {
        Cable { link, buffer: Vec::new(), next: 1, wait }
    }

    fn write_line(&mut self, line: &str) -> Result<(), String> {
        let mut bytes = line.as_bytes().to_vec();
        bytes.push(b'\n');
        self.link.write_all(&bytes).map_err(|e| format!("The cable: {e}"))
    }

    /// The next line, or `None` at the deadline.
    fn line(&mut self, deadline: Instant) -> Result<Option<String>, String> {
        loop {
            if let Some(at) = self.buffer.iter().position(|b| *b == b'\n') {
                let line: Vec<u8> = self.buffer.drain(..=at).collect();
                return Ok(Some(String::from_utf8_lossy(&line).trim().to_string()));
            }
            if Instant::now() >= deadline {
                return Ok(None);
            }
            let mut chunk = [0u8; 4096];
            match self.link.read(&mut chunk) {
                Ok(n) => self.buffer.extend_from_slice(&chunk[..n]),
                Err(e) if e.kind() == std::io::ErrorKind::TimedOut || e.kind() == std::io::ErrorKind::WouldBlock => {}
                Err(e) => return Err(format!("The cable: {e}")),
            }
        }
    }
}

impl<L: Read + Write> crate::install::Api for Cable<L> {
    fn call(&mut self, method: &str, target: &str, body: Option<&[u8]>) -> Result<(u16, String), String> {
        let n = self.next;
        self.next += 1;
        let body = body.unwrap_or_default();
        self.write_line(&format!("{PREFIX}{n} {method} {target} {}", body.len()))?;
        for part in body.chunks(DATA) {
            self.write_line(&format!("{PREFIX}{n} data {}", hex(part)))?;
        }
        let deadline = Instant::now() + self.wait;
        let mine = format!("{PREFIX}{n} ");
        let (mut status, mut data) = (None, Vec::new());
        loop {
            let Some(line) = self.line(deadline)? else {
                return Err("The reader did not answer on the cable: is PaperPaw running on it?".into());
            };
            // The reader's log and answers to others go by.
            let Some(rest) = line.strip_prefix(&mine) else { continue };
            let (word, value) = rest.split_once(' ').unwrap_or((rest, ""));
            match word {
                "data" => data.extend(unhex(value).ok_or("The reader's answer came damaged over the cable.")?),
                "end" => {
                    let status = status.ok_or("The reader's answer had no status.")?;
                    return Ok((status, String::from_utf8_lossy(&data).into_owned()));
                }
                code => status = code.parse().ok(),
            }
        }
    }
}

fn hex(bytes: &[u8]) -> String {
    bytes.iter().map(|b| format!("{b:02x}")).collect()
}

fn unhex(text: &str) -> Option<Vec<u8>> {
    if !text.len().is_multiple_of(2) {
        return None;
    }
    (0..text.len()).step_by(2).map(|i| u8::from_str_radix(text.get(i..i + 2)?, 16).ok()).collect()
}

/// The ports with a reader's chip on them; no other port is looked at.
pub fn ports() -> Vec<String> {
    let mut ports: Vec<String> = serialport::available_ports()
        .unwrap_or_default()
        .into_iter()
        .filter(|p| matches!(&p.port_type, serialport::SerialPortType::UsbPort(u) if (u.vid, u.pid) == USB_ID))
        .map(|p| p.port_name)
        .collect();
    ports.sort();
    ports
}

/// The reader's port, opened without resetting its chip.
fn open(port: &str) -> Result<Box<dyn serialport::SerialPort>, String> {
    if !ports().iter().any(|p| p == port) {
        return Err(format!("There is no reader on {port} any more: plug it in again."));
    }
    let mut link = serialport::new(port, BAUD)
        .timeout(READ)
        .dtr_on_open(false)
        .open()
        .map_err(|e| format!("{port} could not be opened ({e}): is another program using it?"))?;
    // Low, as the chip expects to stay running.
    let _ = link.write_request_to_send(false);
    Ok(link)
}

/// What the reader on `port` says it is; `problem` where it does not.
pub fn hello(port: &str) -> Found {
    let mut found = Found { port: port.to_string(), ..Found::default() };
    let answer = open(port).and_then(|link| {
        let mut cable = Cable::new(link, HELLO);
        crate::install::Api::call(&mut cable, "GET", "/api/hello", None)
    });
    match answer {
        Ok((200, text)) => {
            let json: serde_json::Value = serde_json::from_str(&text).unwrap_or_default();
            let field = |key: &str| json.get(key).and_then(|v| v.as_str()).map(str::to_string);
            found.device = field("device");
            found.name = field("name");
            found.version = field("version");
            found.fingerprint = field("fingerprint");
        }
        Ok((status, _)) => found.problem = Some(format!("It answered {status}: is its PaperPaw new enough?")),
        Err(e) => found.problem = Some(e),
    }
    found
}

/// Installs `plugin` on the reader on `port`.
pub fn send(port: &str, plugin: &crate::install::ReaderPlugin, told: &dyn Fn(crate::install::Step)) -> Result<crate::install::Installed, String> {
    let reader = hello(port);
    if let Some(problem) = reader.problem {
        return Err(problem);
    }
    // The workshop builds plugins with code for the X4 alone for now.
    if plugin.code && reader.device.as_deref() != Some("xteink-x4") {
        return Err("Plugins with code go to the X4 for now; the X4 Pro's builds come with a later PaperPaw.".into());
    }
    let mut cable = Cable::new(open(port)?, ANSWER);
    crate::install::over_usb(&mut cable, plugin, told, &std::thread::sleep)
}

/// The readers on the cable, each with what it says it is.
#[tauri::command]
pub async fn usb_readers() -> Result<Vec<Found>, String> {
    tauri::async_runtime::spawn_blocking(|| ports().iter().map(|p| hello(p)).collect())
        .await
        .map_err(|e| e.to_string())
}

/// The project's plugin installed on the reader on `port`.
#[tauri::command]
pub async fn send_usb(app: tauri::AppHandle, project: String, port: String) -> Result<crate::install::Installed, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let plugin = crate::send::reader_plugin(&project)?;
        send(&port, &plugin, &crate::send::progress(&app))
    })
    .await
    .map_err(|e| e.to_string())?
}

#[cfg(test)]
mod tests {
    use std::collections::VecDeque;

    use super::*;
    use crate::install::Api;

    /// A reader on the other end: answers each whole request as `answer`
    /// says, its log in between.
    struct Device {
        heard: Vec<u8>,
        said: VecDeque<u8>,
        requests: Vec<(String, Vec<u8>)>,
        answer: fn(&str) -> (u16, &'static str),
    }

    impl Device {
        fn new(answer: fn(&str) -> (u16, &'static str)) -> Self {
            Device { heard: Vec::new(), said: VecDeque::new(), requests: Vec::new(), answer }
        }

        fn say(&mut self, line: &str) {
            self.said.extend(line.bytes());
            self.said.push_back(b'\n');
        }

        /// Answers a request once its body is whole.
        fn hear(&mut self) {
            let text = String::from_utf8_lossy(&self.heard).into_owned();
            let lines: Vec<&str> = text.lines().collect();
            let Some(head) = lines.first() else { return };
            let parts: Vec<&str> = head.splitn(5, ' ').collect();
            let (n, request, size) = (parts[1], format!("{} {}", parts[2], parts[3]), parts[4].parse::<usize>().unwrap());
            let body: Vec<u8> = lines[1..].iter().flat_map(|l| unhex(l.rsplit(' ').next().unwrap()).unwrap()).collect();
            if body.len() < size || !text.ends_with('\n') {
                return;
            }
            self.heard.clear();
            let (status, answer) = (self.answer)(&request);
            self.requests.push((request, body));
            self.say("I (1234) paperpaw: a line of the log");
            self.say(&format!("PPT/1 {n} {status} application/json"));
            self.say(&format!("PPT/1 {n} data {}", hex(answer.as_bytes())));
            self.say(&format!("PPT/1 {n} end"));
        }
    }

    impl Write for Device {
        fn write(&mut self, bytes: &[u8]) -> std::io::Result<usize> {
            self.heard.extend_from_slice(bytes);
            self.hear();
            Ok(bytes.len())
        }

        fn flush(&mut self) -> std::io::Result<()> {
            Ok(())
        }
    }

    impl Read for Device {
        fn read(&mut self, buf: &mut [u8]) -> std::io::Result<usize> {
            if self.said.is_empty() {
                return Err(std::io::ErrorKind::TimedOut.into());
            }
            let n = buf.len().min(self.said.len()).min(7);
            for b in buf.iter_mut().take(n) {
                *b = self.said.pop_front().unwrap();
            }
            Ok(n)
        }
    }

    #[test]
    fn a_request_and_its_body_go_as_lines_and_the_log_goes_by() {
        let device = Device::new(|_| (200, r#"{"device":"xteink-x4-pro"}"#));
        let mut cable = Cable::new(device, Duration::from_secs(1));
        let body = vec![7u8; 1300];
        let (status, text) = cable.call("PUT", "/api/plugin/a/plugin.ini?sha256=00", Some(&body)).unwrap();
        assert_eq!((status, text.as_str()), (200, r#"{"device":"xteink-x4-pro"}"#));
        assert_eq!(cable.link.requests, [("PUT /api/plugin/a/plugin.ini?sha256=00".to_string(), body)]);
        // The next request has the next number.
        assert_eq!(cable.call("GET", "/api/hello", None).unwrap().0, 200);
        assert_eq!(cable.next, 3);
    }

    #[test]
    fn a_reader_that_does_not_answer_is_waited_for_a_bounded_time() {
        struct Mute;
        impl Write for Mute {
            fn write(&mut self, b: &[u8]) -> std::io::Result<usize> {
                Ok(b.len())
            }
            fn flush(&mut self) -> std::io::Result<()> {
                Ok(())
            }
        }
        impl Read for Mute {
            fn read(&mut self, _: &mut [u8]) -> std::io::Result<usize> {
                Err(std::io::ErrorKind::TimedOut.into())
            }
        }
        let started = Instant::now();
        let err = Cable::new(Mute, Duration::from_millis(300)).call("GET", "/api/hello", None).unwrap_err();
        assert!(err.contains("did not answer"), "{err}");
        assert!(started.elapsed() < Duration::from_secs(2));
    }

    #[test]
    fn a_plugin_goes_over_the_cable_once_allowed() {
        let device = Device::new(|request| match request {
            "POST /api/offer" => (202, r#"{"state":"asking"}"#),
            "GET /api/offer" => (200, r#"{"state":"allowed"}"#),
            "POST /api/plugin/calm" => (200, r#"{"state":"installed","restart":false}"#),
            _ => (200, "{}"),
        });
        let mut cable = Cable::new(device, Duration::from_secs(1));
        let plugin = crate::install::ReaderPlugin {
            id: "calm".into(),
            files: vec![("plugin.ini".into(), b"[plugin]\nid = calm\n".to_vec())],
            code: false,
        };
        let done = crate::install::over_usb(&mut cable, &plugin, &|_| {}, &|_| {}).unwrap();
        assert_eq!(done.id, "calm");
        let asked: Vec<&str> = cable.link.requests.iter().map(|(r, _)| r.split('?').next().unwrap()).collect();
        assert_eq!(asked, ["POST /api/offer", "GET /api/offer", "PUT /api/plugin/calm/plugin.ini", "POST /api/plugin/calm"]);
    }

    /// PaperPaw's emulator, which speaks the cable transfer on its standard
    /// input and output as a reader does on its cable.
    struct Emulator {
        child: std::process::Child,
    }

    impl Write for Emulator {
        fn write(&mut self, bytes: &[u8]) -> std::io::Result<usize> {
            self.child.stdin.as_mut().unwrap().write(bytes)
        }
        fn flush(&mut self) -> std::io::Result<()> {
            self.child.stdin.as_mut().unwrap().flush()
        }
    }

    impl Read for Emulator {
        fn read(&mut self, buf: &mut [u8]) -> std::io::Result<usize> {
            self.child.stdout.as_mut().unwrap().read(buf)
        }
    }

    impl Drop for Emulator {
        fn drop(&mut self) {
            let _ = self.child.kill();
        }
    }

    /// Against a PaperPaw with the cable transfer: `PAPERPAW_EMU` names its
    /// `paperpaw-emu` (headless, it answers what needs no permission).
    #[test]
    #[ignore = "needs PAPERPAW_EMU, a PaperPaw with the cable transfer"]
    fn a_paperpaw_answers_over_its_cable_transfer() {
        let program = std::env::var("PAPERPAW_EMU").expect("PAPERPAW_EMU");
        let child = std::process::Command::new(program)
            .args(["--stdio", "--headless"])
            .stdin(std::process::Stdio::piped())
            .stdout(std::process::Stdio::piped())
            .spawn()
            .unwrap();
        let mut cable = Cable::new(Emulator { child }, Duration::from_secs(30));
        let (status, text) = cable.call("GET", "/api/hello", None).unwrap();
        assert_eq!(status, 200, "{text}");
        let hello: serde_json::Value = serde_json::from_str(&text).unwrap();
        assert_eq!(hello["protocol"], 1, "{text}");
        assert!(hello["device"].is_string(), "{text}");
        let (status, text) = cable.call("GET", "/api/plugins", None).unwrap();
        assert_eq!(status, 200, "{text}");
        assert!(text.contains("\"plugins\""), "{text}");
    }

    #[test]
    fn hex_goes_both_ways() {
        assert_eq!(hex(&[0, 255, 16]), "00ff10");
        assert_eq!(unhex("00ff10"), Some(vec![0, 255, 16]));
        assert_eq!(unhex("0"), None);
        assert_eq!(unhex("zz"), None);
    }
}
