//! An example of what an address the person named answers, for the AI to
//! see the form of its data ("Fetch a sample", src/tools/sample.ts, which
//! says which addresses and asks the person). Narrow on purpose:
//!
//! - http and https only, no name and password in the address;
//! - only public addresses: the name is resolved here and every address
//!   it has must be public, and the request goes to those very addresses
//!   (a name cannot point into the person's own network, also not when
//!   asked a second time);
//! - GET only, no cookies, no credentials, no headers of the AI's;
//!   ten seconds at most;
//! - redirects only on the same origin, at most three;
//! - web pages (HTML) refused: not a data API; other kinds but text,
//!   JSON and XML refused too;
//! - at most 4 KB of text back, JSON pretty-printed first (its keys in
//!   the order of their names).

use std::io::Read;
use std::net::{IpAddr, SocketAddr, ToSocketAddrs};
use std::time::Duration;

use serde::Serialize;

/// The most text the AI gets, in bytes.
pub const MAX_SHOWN: usize = 4096;
/// The most read of an answer, in bytes.
const MAX_READ: u64 = 256 * 1024;
const TIMEOUT: Duration = Duration::from_secs(10);
const MAX_REDIRECTS: usize = 3;

/// An answer as the window gets it.
#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct Sample {
    pub url: String,
    pub status: u16,
    pub content_type: String,
    pub body: String,
    /// Whether `body` was cut at [`MAX_SHOWN`].
    pub cut: bool,
}

/// Whether `ip` is an address of the internet, not of a network of one's
/// own (private, loopback, link-local, shared, documentation, multicast,
/// reserved).
pub fn public(ip: IpAddr) -> bool {
    match ip {
        IpAddr::V4(v4) => {
            let [a, b, ..] = v4.octets();
            !(v4.is_private()
                || v4.is_loopback()
                || v4.is_link_local()
                || v4.is_unspecified()
                || v4.is_broadcast()
                || v4.is_multicast()
                || v4.is_documentation()
                || a == 0
                || (a == 100 && (b & 0xc0) == 64)
                || (a == 198 && (b & 0xfe) == 18)
                || a >= 240)
        }
        IpAddr::V6(v6) => {
            if let Some(v4) = v6.to_ipv4_mapped() {
                return public(IpAddr::V4(v4));
            }
            let first = v6.segments()[0];
            !(v6.is_loopback() || v6.is_unspecified() || v6.is_multicast() || (first & 0xfe00) == 0xfc00 || (first & 0xffc0) == 0xfe80)
        }
    }
}

/// The addresses of `host:port`, if every one is public.
pub fn resolve_public(addr: &str) -> std::io::Result<Vec<SocketAddr>> {
    let all: Vec<SocketAddr> = addr.to_socket_addrs()?.collect();
    if all.is_empty() || all.iter().any(|a| !public(a.ip())) {
        return Err(std::io::Error::new(std::io::ErrorKind::PermissionDenied, "not a public address of the internet"));
    }
    Ok(all)
}

/// `url` if it is one to fetch: http or https, a host, no credentials.
fn checked(url: &str) -> Result<url::Url, String> {
    let parsed = url::Url::parse(url).map_err(|_| format!("not an address: {url}"))?;
    if !matches!(parsed.scheme(), "http" | "https") {
        return Err("only http and https addresses".into());
    }
    if !parsed.username().is_empty() || parsed.password().is_some() {
        return Err("no names or passwords in the address".into());
    }
    if parsed.host_str().is_none_or(str::is_empty) {
        return Err("no host in the address".into());
    }
    Ok(parsed)
}

fn origin(url: &url::Url) -> String {
    url.origin().ascii_serialization()
}

/// The text the AI gets of an answer of `content_type`: an error for a web
/// page or what is not text; JSON pretty-printed; cut at [`MAX_SHOWN`] on
/// a character's edge, and whether it was.
pub fn shown(content_type: &str, bytes: &[u8]) -> Result<(String, bool), String> {
    let kind = content_type.to_ascii_lowercase();
    let text = String::from_utf8_lossy(bytes);
    let start: String = text.trim_start().chars().take(64).collect::<String>().to_ascii_lowercase();
    if kind.contains("html") || start.starts_with("<!doctype html") || start.starts_with("<html") {
        return Err("not a data API: it answers with a web page (HTML)".into());
    }
    let textual = kind.is_empty() || kind.starts_with("text/") || kind.contains("json") || kind.contains("xml") || kind.contains("javascript");
    if !textual {
        return Err(format!("not text: it answers with {content_type}"));
    }
    let pretty = serde_json::from_str::<serde_json::Value>(&text)
        .ok()
        .and_then(|value| serde_json::to_string_pretty(&value).ok())
        .unwrap_or_else(|| text.into_owned());
    if pretty.len() <= MAX_SHOWN {
        return Ok((pretty, false));
    }
    let mut end = MAX_SHOWN;
    while !pretty.is_char_boundary(end) {
        end -= 1;
    }
    Ok((pretty[..end].to_string(), true))
}

/// Fetches `url` as above, its names resolved with `resolve` (public
/// addresses only, but in tests).
pub fn fetch_with(url: &str, resolve: impl Fn(&str) -> std::io::Result<Vec<SocketAddr>> + Send + Sync + 'static) -> Result<Sample, String> {
    let agent = ureq::AgentBuilder::new()
        .timeout(TIMEOUT)
        .redirects(0)
        .resolver(resolve)
        .user_agent("PaperPaw Workshop (an example for a plugin)")
        .build();
    let mut at = checked(url)?;
    let from = origin(&at);
    for _ in 0..=MAX_REDIRECTS {
        let answer = match agent.get(at.as_str()).set("Accept", "application/json, text/plain;q=0.9, */*;q=0.1").call() {
            Ok(answer) | Err(ureq::Error::Status(_, answer)) => answer,
            Err(e) => return Err(e.to_string()),
        };
        let status = answer.status();
        if (300..400).contains(&status) {
            let next = answer.header("location").ok_or("a redirect without an address")?;
            let next = at.join(next).map_err(|_| "a redirect to no address".to_string())?;
            if origin(&next) != from {
                return Err(format!("it redirects to another site ({}): not followed", origin(&next)));
            }
            at = checked(next.as_str())?;
            continue;
        }
        let content_type = answer.header("content-type").unwrap_or("").to_string();
        let mut bytes = Vec::new();
        answer.into_reader().take(MAX_READ).read_to_end(&mut bytes).map_err(|e| e.to_string())?;
        let (body, cut) = shown(&content_type, &bytes)?;
        return Ok(Sample { url: at.to_string(), status, content_type, body, cut });
    }
    Err("too many redirects".into())
}

/// An example of what `url` answers (see the module's documentation).
#[tauri::command]
pub async fn sample_fetch(url: String) -> Result<Sample, String> {
    tauri::async_runtime::spawn_blocking(move || fetch_with(&url, resolve_public))
        .await
        .map_err(|e| e.to_string())?
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;
    use std::net::TcpListener;

    /// A server on this computer answering each request with `answers`,
    /// one after the other; its address.
    fn serve(answers: Vec<String>) -> String {
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let port = listener.local_addr().unwrap().port();
        std::thread::spawn(move || {
            for answer in answers {
                let Ok((mut stream, _)) = listener.accept() else { return };
                let mut buffer = [0u8; 4096];
                let _ = stream.read(&mut buffer);
                let _ = stream.write_all(answer.as_bytes());
            }
        });
        format!("http://127.0.0.1:{port}")
    }

    fn answer(status: &str, headers: &str, body: &str) -> String {
        format!("HTTP/1.1 {status}\r\n{headers}Content-Length: {}\r\nConnection: close\r\n\r\n{body}", body.len())
    }

    /// Any address, for a test server on this computer.
    fn anywhere(addr: &str) -> std::io::Result<Vec<SocketAddr>> {
        Ok(addr.to_socket_addrs()?.collect())
    }

    #[test]
    fn addresses_of_one_s_own_network_are_refused() {
        for ip in ["127.0.0.1", "10.0.0.8", "172.16.3.4", "192.168.1.1", "169.254.169.254", "100.64.0.1", "0.0.0.0", "::1", "fd00::1", "fe80::1", "::ffff:192.168.1.1"] {
            assert!(!public(ip.parse().unwrap()), "{ip}");
        }
        for ip in ["93.184.216.34", "1.1.1.1", "2606:4700:4700::1111"] {
            assert!(public(ip.parse().unwrap()), "{ip}");
        }
        assert!(resolve_public("localhost:80").is_err());
        assert!(resolve_public("127.0.0.1:80").is_err());
        // The real fetch resolves so too: a server on this computer is not reached.
        let here = serve(vec![answer("200 OK", "Content-Type: application/json\r\n", "{}")]);
        assert!(fetch_with(&here, resolve_public).unwrap_err().contains("not a public address"));
    }

    #[test]
    fn only_http_without_credentials() {
        assert!(checked("file:///etc/passwd").is_err());
        assert!(checked("ftp://example.org/x").is_err());
        assert!(checked("https://user:pw@example.org/x").is_err());
        assert!(checked("https://example.org/x").is_ok());
    }

    #[test]
    fn json_is_shown_pretty_and_cut_at_4_kb() {
        let url = serve(vec![answer("200 OK", "Content-Type: application/json\r\n", r#"{"id":361,"fact":"Ducks swim.","lang":"en"}"#)]);
        let sample = fetch_with(&format!("{url}/api/facts/random?lang=en"), anywhere).unwrap();
        assert_eq!(sample.status, 200);
        assert_eq!(sample.content_type, "application/json");
        // Pretty, its keys in the order of their names.
        assert_eq!(sample.body, "{\n  \"fact\": \"Ducks swim.\",\n  \"id\": 361,\n  \"lang\": \"en\"\n}");
        assert!(!sample.cut);
        let long = format!("[{}]", vec!["\"ä duck\""; 2000].join(","));
        let (body, cut) = shown("application/json", long.as_bytes()).unwrap();
        assert!(cut);
        assert!(body.len() <= MAX_SHOWN && body.len() > MAX_SHOWN - 4);
    }

    #[test]
    fn web_pages_and_what_is_not_text_are_refused() {
        assert!(shown("text/html; charset=utf-8", b"<html></html>").unwrap_err().contains("not a data API"));
        assert!(shown("text/plain", b"  <!DOCTYPE html><html>").unwrap_err().contains("not a data API"));
        assert!(shown("image/png", &[0x89, b'P', b'N', b'G']).unwrap_err().contains("not text"));
        assert_eq!(shown("text/plain", b"one fact").unwrap(), ("one fact".into(), false));
    }

    #[test]
    fn redirects_are_followed_on_the_same_site_only() {
        let same = serve(vec![
            answer("302 Found", "Location: /api/v2\r\n", ""),
            answer("200 OK", "Content-Type: text/plain\r\n", "moved here"),
        ]);
        let sample = fetch_with(&format!("{same}/api/v1"), anywhere).unwrap();
        assert_eq!(sample.body, "moved here");
        assert!(sample.url.ends_with("/api/v2"));
        let away = serve(vec![answer("301 Moved Permanently", "Location: http://169.254.169.254/latest/meta-data\r\n", "")]);
        assert!(fetch_with(&format!("{away}/api"), anywhere).unwrap_err().contains("redirects to another site"));
    }
}
