# Interface 7 family NET: HTTP requests and serving HTTP

Contract for #228 (assignment #1088). Items marked [D] are proposed decisions, [Q] open
questions for Plugin, Firmware and Senior. Inputs: an audit of interface 6's HTTP client and
server (`crates/paperpaw-core/src/io/http.rs`, `io/servers.rs`, `network.rs`, `work.rs`, the X4
shell's `http.rs`, `serve.rs`, `tls.rs`, `crates/paperpaw-http`, `crates/paperpaw-serve`, the SDK's
`command.rs`, `replies.rs`, `served.rs`, `web.rs`) and of the 21 first-party plugins that use them
(section 8), ADRs 0016 (network and Wi-Fi), 0017 (TLS on the X4) and 0025 (power saving),
`device.md` (Wi-Fi, network demand, `uses.wifi`), `files.md` (roots, `uses.storage`),
`stages-services.md` (service schemas, D4), `registry.md` 2.1 (bare replies) and
`core-events.md` 3.3 (event admission and the held-event store). Its companion `secrets.md`
(SEC) is reviewed with it.
Records: `abi/services/core.net@1.def`.

## 0. Scope and principles

- [D] **One service, events for outcomes.** `core.net` (major 1, section 2) starts and cancels
  requests, reads a finished request's answer, starts and stops servers and answers their
  requests. A request or a server that ends, and a request a server receives, are events
  (section 4). Starting is a service call, not a slot-15 command, so a malformed request is refused
  at once with a status and the plugin learns the request's id in the same call.
- [D] **Every request ends exactly once**, as in interface 6: answered, failed, cancelled,
  replaced or refused, each is one `net.http_done` event (4.1). No path ends a request silently.
- [D] **The host owns the network.** It parses URLs, follows redirects, checks certificates and
  limits sizes; a plugin gives what it wants and reads what came. No TLS knobs, no raw head, no
  local addresses of the device beyond the started server's address.
- [D] **Only what first-party plugins use** (section 8). Not offered: request headers on served
  requests, response headers beyond ETag and Content-Type (`want_headers` has no user), a
  streamed memory body, chunked uploads, compression, cookies, HTTP/2, listening sockets for other
  protocols (SOCK), proxy settings.
- Out of NET: the Wi-Fi radio and network policy (DEV, `uses.wifi`, events 94-95), TCP and TLS
  sockets and UDP broadcast (SOCK), retries and scheduled work (ASY), stored secrets and
  randomness (SEC, `secrets.md`), the server's access key (the SDK's `served::key` over SEC's
  random, section 6).

## 1. Feature

| Key | Allows | Plugins (first-party) |
| --- | --- | --- |
| `uses.network` | every `core.net` op; SOCK's ops | browser, calibre, fonts-browser, joplin, kosync, mail, news, opds, read-later-cloud, readwise, stats, store, transfer, translate, update, vocabulary, wallabag, weather, wifi, wikipedia |

- [D] `uses.network` is a signed metadata feature (revision 1), as the DEV features; it replaces
  interface 6's `Uses::NETWORK`. Each `core.net` op names it (`feature` in the schema), so a
  plugin without it gets `ERR_DENIED` and the host runs nothing; a host with no network at all
  (no Wi-Fi, no cable serving) does not offer it and answers `ERR_UNSUPPORTED`.
- [D] It does not include the radio: turning Wi-Fi on, joining and hosting stay `uses.wifi` (DEV).
  A request without a network waits for one (3.2); the network manager brings it up.

## 2. The service `core.net` (major 1)

Bare replies as `core.registry` (`registry.md` 2.1): ops write exactly their records, no `end`.
Input is one counted batch of at most `input_rows` records (`stages-services.md`).

| Op | Name | Effect | Input | Reply | Notes |
| --- | --- | --- | --- | --- | --- |
| 1 | `request` | mutate | `net_request`, `net_header`*, `net_file`*, `net_body`? | `net_started` | starts one HTTP request (2.1); `input_rows` 20 |
| 2 | `cancel` | mutate | `net_token` | (none) | ends every request of the plugin with this token (2.2) |
| 3 | `answer` | query | `net_id` | `net_answer` | the finished request's status and head (2.3) |
| 4 | `body` | query | `net_read` | `net_bytes` | a piece of its memory body (2.3) |
| 5 | `serve` | mutate | `net_serve` | (none) | starts a server (5.1) |
| 6 | `stop_serving` | mutate | `net_token` | (none) | stops the plugin's server with this token (5.1) |
| 7 | `respond` | mutate | `net_response`, `net_header`*, `net_file`?, `net_body`? | (none) | answers a served request (5.3); `input_rows` 11 |

All ops: `max_input` 4,096, `max_reply` 4,096 (`body`) or 1,536 (the others), `bound: none`
(nothing waits on the network inside a call; `respond` and `request` with a file only check the
file's size, 2.1).

### 2.1 `request`

- [D] `net_request` comes first, once, then at most 16 `net_header`, at most one `net_file` per
  role and at most one `net_body`; another order, a repeated role or a second request is
  `ERR_INVALID` for the whole call.
- [D] **`token`** is the plugin's own number for the request, echoed in its events; several
  requests may share one (opds cancels all downloads at once). **`id`** in `net_started` is the
  host's: non-zero, unique while the device runs, never reused for another request of the run.
- [D] **`method`** is an HTTP token of 1-16 bytes (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`,
  `PROPFIND`, ...), sent as given; anything that is not a token is `ERR_INVALID`.
- [D] **`url`** is at most 1,024 bytes, `http://` or `https://` (any case), an IPv4, a
  bracketed IPv6 (the RFC 4291 text form, as `core::net::Ipv6Addr` parses it, no zone; checked at
  submit, not left to the transport) or a name of letters, digits, `-`, `.`, `_` and `~`, a port
  1-65535, no control bytes; `user:password@` and `#fragment` are dropped (credentials go in a
  header). Bytes the path may not carry are percent-encoded by the host. Anything else is
  `ERR_INVALID`.
- [D] **Headers:** `name` an HTTP token of 1-64 bytes, `value` at most 1,024 bytes, no control
  bytes (`ERR_INVALID`). The host always sends `Host`, `Connection: close` and `Content-Length`
  (with a body) itself and refuses a plugin's own of those (`ERR_INVALID`); it adds
  `User-Agent: PaperPaw` when the plugin sends none. `value` is marked secret in the schema: it
  carries tokens and passwords, so it is never logged and the generated `Debug` hides it.
- [D] **Nothing a request carries is logged.** The host and the shells never log a URL (its query
  often holds an API key or a token: translate, wallabag, kosync), a header value or a body, of a
  request or of a served request's `target`; a log line names the plugin, the request id, the
  method, the host name alone and the outcome (`reason`, HTTP status, sizes).
- [D] **Body:** at most one of `net_body` (inline bytes, at most 2,048) and a `net_file` with role
  0 `send` (a file sent as the body, root 0, 1 or 2). A file to send must exist (`ERR_NOT_FOUND`)
  and is sent whole with its size as `Content-Length`; its size is taken when the request
  connects. Bodies over 2 KiB (a form of long text, a database) are written to root 0 first.
- [D] **Saving the answer:** a `net_file` with role 1 `save` (root 0, or root 1 with
  `uses.storage`; root 2 is `ERR_DENIED`) writes a 2xx answer's body to that file, without
  limit of memory (3.3). Without it, the body comes back in memory, cut at `max_body`.
- [D] **`flags`**: bit 0 `progress` (send `net.http_progress`, 4.2); bit 1 `foreground` (#369 H:
  the user waits for this download, a store install or a pack: the shell gives it its larger
  receive window and write chunks where the heap allows, whatever `max_file` says, and the radio
  stays out of power saving while data moves). It is honoured only when the request is made from
  a callback of a screen of the plugin that shows, outside a work run; otherwise it is ignored
  without an error (no background radio hold). Others `ERR_UNSUPPORTED`.
- [D] **`timeout_ms`**: 0 for the default; else 1,000-600,000. The default is 30,000 for a request
  in memory, the whole request, connection and TLS counted, and for a request with a file
  60,000 **without a byte moving** (a long download never ends while it moves).
- [D] **`max_body`**: 0 for the host's default, which is also the most: on devices of the small
  memory class (the X4) `NET_POOL` less 4,096 (the largest held input, below), so one memory
  request always fits the pool together with its input: **45,056 on the X4** (48 KiB pool, 3.4);
  1,048,576 on others. A larger `max_body` is `ERR_NO_SPACE`. Ignored when saving. **`max_file`**: 0
  for 64 MiB, the most; else at most 64 MiB (`ERR_NO_SPACE` above it). A longer saved answer
  fails with reason `too_large` (4.1) and the file is left as it was.
- [D] Root checks as `files.md` section 3 (root 1 without `uses.storage` is `ERR_DENIED`, the
  root-1 exclusions, the path rules).
- [D] **Limits:** at most 4 requests per plugin not yet ended and 16 per device (`ERR_BUSY`, the
  plugin waits for a `net.http_done`). Interface 6 queued without limit.
- [D] **A request's input is held in the pool.** The host keeps what it still has to send (method,
  URL, headers, body: the request's input batch, at most 4,096 bytes) from the call until the
  request has sent it or ended. On devices with a `NET_POOL` (3.4) that copy is reserved from the
  pool at the call, at its exact size, never 4 KiB by default; with no room the call answers
  `ERR_NO_MEMORY` and nothing is queued (the plugin retries after a `net.http_done`). So queued
  requests never hold memory outside the pool: 16 waiting requests of 4 KiB each, 64 KiB, cannot
  build up next to it on the X4. Other devices hold it from the heap, within the limits above.
- [D] **Same save file:** a request that saves to a file (same root, path compared by identity, as
  root-1 exclusions) another of the plugin's unfinished requests saves to ends that older one at
  once with reason `replaced`; the new one goes on (interface 6). If **another plugin's** unfinished
  request saves to it (only possible on root 1), the new request is `ERR_BUSY`: a plugin never ends
  another's download. While a request saves, its target and its `.pp-staged` file are in the host's
  paths-in-use table (`files.md` section 3): a `core.files` `move` or `remove_tree` and the file
  slots' `write`, `append`, `rename`, `remove` over them are `ERR_BUSY`.

### 2.2 `cancel`

- [D] Ends every not yet ended request of the calling plugin whose `token` matches, each with one
  `net.http_done` of reason `cancelled`. None is `OK` (nothing to do). A transfer already under
  way is dropped; its file is left as it was (3.3); an answer that comes later is ignored.

### 2.3 Reading the answer: `answer` and `body`

- [D] A finished request's answer is readable **only during the `net.http_done` callback for
  it**; then the host frees it. Elsewhere, and for another plugin's id, `answer` and `body` are
  `ERR_NOT_FOUND`. A plugin that needs the body later copies it (or saves to a file).
- [D] `answer` replies `net_answer`: `status` (the HTTP status, 0 when none came), `flags` (as the
  event's, 4.1: bit 1 `truncated`, the memory body was cut at `max_body`; bit 2 `saved`),
  `etag`, `content_type` and `final_url` (after redirects), each `""` when the answer had none, and
  `body_len`, the memory body's length.
- [D] `body` replies one `net_bytes` with the bytes from `offset`, at most 3,840 per call; at or
  past the end it replies zero bytes (`data` empty). A 64 KiB body is read in 18 calls.
- [D] **Error bodies are at most 4,096 bytes.** A non-2xx answer (`reason` 0, its status for the
  plugin to judge) and a failure with a status keep only the first `min(4,096, max_body)` bytes
  of their body in memory when the request answers in memory, and the first 4,096 when it saves;
  the rest is read and dropped (`flags` bit 1 `truncated`), and an error body is never written to
  the file. A request never holds more than it reserved: a memory request its `max_body` (a
  `max_body` of 16 keeps 16 bytes of an error page; admission reserves `max_body`, never more), a
  saving request its 4 KiB buffer. So a large error page never takes a memory body of its own on
  the X4. A failure without a status has `body_len` 0.

## 3. Behaviour

### 3.1 HTTP and TLS

- [D] HTTP/1.1, one request per connection (`Connection: close`). `Content-Length`, chunked and
  read-until-close answers are read; an answer head over 16 KiB fails with reason `refused`.
- [D] **No compression:** the host sends no `Accept-Encoding` and decodes none; a plugin that asks
  for gzip gets the raw bytes.
- [D] **Redirects:** at most 10 are followed (more: reason `refused`). Never from `https` to `http`;
  303, and 301 or 302 after a `POST`, go on as `GET` without a body; a body is never sent to
  another origin. To another origin only the 12 harmless headers go on (`Accept`,
  `Accept-Charset`, `Accept-Language`, `Cache-Control`, `Content-Type`, `Depth`, `If-Match`,
  `If-Modified-Since`, `If-None-Match`, `If-Unmodified-Since`, `Range`, `User-Agent`), so
  `Authorization`, cookies and key headers never leave the origin the plugin named. `final_url` is
  where the answer came from.
- [D] **A redirect from `http` to `https`** is followed like any other: the request closes its
  plain connection first, then waits for the TLS session (3.4) as if it were an `https` request,
  in its original start order and with its `timeout_ms` still counting from its start. It never
  holds a connection while it waits (no deadlock with SOCK); while the session stays taken (a SOCK
  TLS socket) it ends with reason `timeout`, never `refused` (interface 6 followed such redirects).
- [D] **TLS:** 1.2 and 1.3; the chain must lead to a root of the host's store (on the X4, Mozilla's
  roots, ADR 0017) and the name must match; dates are checked against network time once it is
  known (ADR 0017). No pinning, no trust override and no client certificate over HTTP (mail pins
  keys on SOCK sockets, not here). A failed check ends with reason `tls`.

### 3.2 Waiting for the network and power

- [D] A request made while no network is up waits for one: the host tells the network manager
  (`event.network_wanted`, `device.md`) and ends the request with reason `no_network` if none came
  within 30,000 ms. When the last request, server and socket ends, the manager gets
  `event.network_idle`. The host never turns the radio on by itself. NET and `core.sockets`
  share one demand in the host: `network_wanted` and `network_idle` follow the combined state, so
  one service going idle never cancels the other's wait, and each change sends exactly one event.
- [D] **Power saving** (ADR 0025) ends a request at once, before any byte goes out, with:
  `offline` when the device is in the offline power mode (except a request started within 2,000 ms
  of the user's input, as DEV's window); `saving` when the user put this plugin's network use on
  hold; `network_off` when the user turned this plugin's network off. `offline` and `saving` set
  `flags` bit 0 `later` in the event (try again once `dev_power.flags` bit 1 `online` is set, ASY
  schedules that); `network_off` does not. `saving` holds only a plugin's background use (no
  user-input window open for it, interface 6's "not the reader"). These are admission checks: a
  request, server or socket already running is ended by `network_off` alone (at the next host pass,
  `network_off` with no `later`); the offline mode and a hold let it finish, and a radio the mode
  turns off ends it as any lost network does (`no_network`, SOCK `lost`). Off is checked first,
  then offline, then saving; a plugin the host can't place, or a policy it can't build for want of
  memory, counts as off.
- [D] While a request or a server runs, the device does not go to sleep on its own (interface 6).

### 3.3 Files, power cuts and the card

- [D] A saved answer is written to `<path>.pp-staged` beside the target in 4 KiB appends and renamed
  over the target only when it is whole (2xx, not over `max_file`); on any failure, a cancel or a
  `replaced`, the `.pp-staged` file is removed and **the old file stays as it was**. A power cut
  leaves at most a stray `.pp-staged` file, which the next request to that path replaces. The
  plugin's own file is never half written. `net_file` paths may not end in `.pp-staged` in any case
  (`ERR_INVALID`); `.part` is an ordinary name, so a user's own `x.part` is never overwritten.
- [D] A card that goes away ends the request with reason `io`; a full card with reason `full`.

### 3.4 Concurrency and memory

- [D] The device runs as many at once as it can (the X4: two connections, one TLS session shared
  with SOCK) and queues the rest in the order they were started, up to the limits of 2.1.
- [D] A memory body is held by the host in one fallible allocation of at most `max_body`; a failed
  allocation ends the request with reason `too_large` ("too large for the memory of this
  device"). It is freed when its `net.http_done` callback returns (or when its plugin stops).
- [D] **Memory bodies are counted device-wide.** A profile sets `MEMORY_BODIES`, the most memory
  bodies that exist at once, counting those still arriving **and** those finished but not yet
  delivered (their plugin busy or its callback not yet run): **2 on the X4** (8 on others). A
  request that answers in memory starts its transfer only while fewer exist; otherwise it waits in
  the queue in start order (its `timeout_ms` counts from its start, so a long wait ends it with
  `timeout`, never holds more). Requests that save to a file need no memory body (a 4 KiB write
  buffer while they run) and are not counted against `MEMORY_BODIES`.
- [D] **One network pool on the X4.** Devices of the small memory class have one device-wide pool,
  `NET_POOL` in the profile (**48 KiB on the X4 until Firmware has measured**, so a memory body
  there is at most 44 KiB, `max_body`'s X4 default and most 45,056, leaving 4 KiB for the request's
  held input; 80 KiB would hold one 64 KiB body and two sockets), for every network buffer the host
  holds for plugins: requests' held input (2.1), memory bodies, held `respond` bodies, the 4 KiB
  write buffer of a saving request and of each `serve` upload being received (5.2: a request whose
  buffer does not fit is answered 503 by the host), and SOCK's send queues, reads and broadcast
  answers (`sockets.md` section 6). Each is reserved from the pool before it is used, never grown
  later: a request reserves its `max_body` (a memory body) or its 4 KiB buffer (saving) before its
  transfer starts and waits in the queue while the pool has not that room (its `timeout_ms`
  counting, as for `MEMORY_BODIES`). The queue is strictly first in, first out: no request overtakes
  one that waits for room, so a large body is never starved by smaller ones, and a request that
  waits holds back those after it until it starts or its `timeout_ms` ends it; everything else (a
  held `respond` body, SOCK's buffers) that does not fit answers `ERR_NO_MEMORY` at its call and
  holds nothing. `max_body` is at most the pool less 4,096. So the X4 holds at most `NET_POOL` of
  plugin network memory, plus the shell's receive and send buffers and one TLS session (about 40
  KiB); Firmware measures that worst case on the X4 heap (section 9) and the profile lowers
  `NET_POOL` (and with it the default `max_body`) if it does not fit. Other devices have no pool:
  the caps per item and `MEMORY_BODIES` bound them.
- [D] A plugin that stops has its requests cancelled (no events: it is not running) and its
  servers stopped; held bodies are freed.

## 4. Events

| Tag | Event | Fields |
| --- | --- | --- |
| 99 | `event.http_done` | `now_ms: u64`, `id: u32`, `token: u32`, `status: u32`, `reason: u32`, `flags: u32`, `body_len: u32` |
| 100 | `event.http_progress` | `now_ms: u64`, `id: u32`, `token: u32`, `received: u64`, `total: u64`, `flags: u32` |
| 101 | `event.server` | `now_ms: u64`, `server: u32`, `state: u32`, `reason: u32`, `address: str 64` |
| 102 | `event.served_request` | `now_ms: u64`, `server: u32`, `request: u32`, `method: str 16`, `target: str 1024`, `flags: u32`, `body_len: u64` |

- [D] Events go only to the plugin that made the request or server, never to subscribers of other
  plugins; a plugin subscribes with `registration.event` as for every event, and a request made
  without a subscription to 99 is `ERR_STATE` (its end could not be told).
- [D] **Never dropped.** 99, 101 (`state` stopped or failed) and 102 come from the host's request
  and server tables, not from the held-event store (`core-events.md` 3.3), so a busy plugin gets
  them later and none takes the `event_dropped` path. Progress (100) and `server` started may be
  coalesced: one pending per request or server, the newest replaces it.

### 4.1 `event.http_done`

- `status` as in `net_answer`; `flags` bit 0 `later` (3.2), bit 1 `truncated`, bit 2 `saved`;
  `body_len` the memory body's length (2.3).
- `reason`:

| Value | Name | When |
| --- | --- | --- |
| 0 | `ok` | an answer came (any status; a 2xx saved one is in the file) |
| 1 | `no_network` | no network came within 30 s, or it went away during the request |
| 2 | `dns` | the name was not found |
| 3 | `tls` | the certificate or the TLS handshake failed (3.1) |
| 4 | `timeout` | `timeout_ms` passed (3.1, 2.1) |
| 5 | `refused` | could not connect, too many redirects, a refused redirect, a head over 16 KiB |
| 6 | `too_large` | over `max_file`, or no memory for the body (3.4) |
| 7 | `replaced` | a newer request saves to the same file (2.1) |
| 8 | `cancelled` | `cancel` (2.2) |
| 9 | `io` | the card went away, or the file to send could not be read |
| 10 | `full` | the card was full |
| 11 | `offline` | the offline power mode (3.2) |
| 12 | `saving` | the plugin's network use is on hold (3.2) |
| 13 | `network_off` | the user turned this plugin's network off (3.2) |
| 14 | `work_ended` | the work run it belongs to reached its longest time (`work.md` 2.3) |

- [D] A 2xx answer that saved has `reason` 0 and `saved`; a non-2xx answer has `reason` 0, its
  status and its error body in memory: HTTP statuses are the plugin's to judge (interface 6).
- [D] Values never change meaning; new ones are added at the end. A plugin treats an unknown value
  as a failure.

### 4.2 `event.http_progress`

- [D] Only for a request with `flags` bit 0. Sent first when the answer's body starts, then when
  another 5 % came or 2,000 ms passed with more bytes; never after `net.http_done`. `received`
  is bytes of the body so far, `total` the `Content-Length` when known (`flags` bit 0 `total_known`,
  else `total` 0). Sent only for 2xx answers.

## 5. Serving HTTP

### 5.1 `serve` and `stop_serving`

- [D] `net_serve`: `token` (the plugin's server number), `port` 1-65535, or 0 for the **cable**
  (served over USB to a computer, without a network, `CABLE_PORT` of interface 6; the X4 only),
  `max_body` the largest request body the server takes (0 for 4 MiB, vocabulary's import cap; at
  most 64 MiB, `ERR_NO_SPACE` above; transfer passes its largest upload), `flags` none
  (`ERR_UNSUPPORTED`). A plugin has at most 2 servers, and the device at most the profile's
  `SERVERS` of all plugins together (**1 on the X4**, 2 on the X4 Pro and Classic, 8 on others: a
  server's sockets and buffers cost up to about 48 KiB): past either, `ERR_BUSY` at once and
  nothing opens. A server counts from `serve` until it is stopped, has failed or has ended.
  Serving again with a token in use stops the old server first (interface 6).
- [D] **The cable's server** (port 0, ruling of todo 384 on #228) is the kernel's, not the
  shell's: the shell passes the cable's lines to `Kernel::cable_line` (`docs/usb-transfer.md`) and
  the host serves them to the one plugin that serves port 0, under the rules of this section
  (`max_body`, `.received/`, 507, the answer time). It uses no socket and no pool buffer, so it
  does not count against `SERVERS` (only against the plugin's 2). `started` comes at the host's
  next pass, address `""`. A request while no cable server has started opens `core.cable`; one
  without a body waits up to 5 s for the server's `started` (else 503), one with a body is
  answered 503 at once (its data lines are not kept). After the plugin stopped the server, a
  request before the protocol's 10 s pause is answered 403. A `respond` with a file is refused on
  the cable (`ERR_UNSUPPORTED`, the computer gets 500), as in interface 6. The cable has one
  server: the first plugin that serves port 0 from its showing screen holds it until it stops
  (normally the screen that fills `core.cable`); another's `serve` port 0 ends `failed`,
  `refused`. The computer is an outside party: the rest of a refused body is passed over without
  an answer per line, and at most 8 answers (16 KiB of bodies; one alone at any size) wait to be
  sent. While they leave no room, a plugin's `respond` is `ERR_BUSY` and its request stays open
  (answer again later; the 120 s answer time still runs); a host refusal that does not fit is
  not sent. A request number the computer uses again while its earlier request is open ends
  that request (its plugin's later `respond` is `ERR_NOT_FOUND`; no answer of its own, since an
  answer by that number is the new request's).
- [D] `stop_serving` with a token the plugin has no server under (never served, already stopped,
  or stopped by the network) answers `OK` and does nothing, with no `event.server`: stopping is
  idempotent, so a plugin may stop on every close without tracking whether the server still runs.
- [D] The outcome is `event.server`: `state` 0 `started` with `address` (`192.168.1.20:8080`, or
  `""` for the cable), 1 `failed` with `reason` (as 4.1: `no_network`, `offline`, `saving`,
  `network_off`, `refused` for a port that could not be had), 2 `stopped` (by `stop_serving`, by a
  newer `serve`, or because the network went away, `reason` then `no_network`). When the port is
  taken, the host tries the next 20 ports (the address says which it got). `started` comes only
  once the listener is really open; one that cannot open (no socket, no memory) ends with `failed`,
  `refused`, and its server slot is free again, so a plugin never waits for requests that cannot
  come.
- [D] **A server lives on a screen** (interface 6 tied servers to the screen that started them):
  `serve` is only allowed while one of the plugin's own screen instances is showing, not covered,
  from any of the plugin's callbacks but a work run's (`work.md` section 2): a screen's own, or a
  plugin event such as `event.wifi_changed` once its own network is up (`ERR_STATE` elsewhere: no
  background server the user cannot see, and none that keeps the device awake unseen). The server
  is tied to that instance (from a screen's callback, that screen; else the plugin's topmost
  showing one) and stops (`stopped`) when it closes. transfer, vocabulary and wifi all serve while
  the screen that shows the address is up.
- [D] Anyone on the network can reach a server: guarding it is the plugin's work. The SDK's
  `served::key` and `Guard` (section 6) give the shown address a key; the host does not check it.

### 5.2 Served requests

- [D] Each request a server gets is one `event.served_request`: `request` the host's number for
  it (unique while the device runs), `method`, `target` (path and query, at most 1,024 bytes;
  longer is answered 414 by the host and not told), `flags` bit 0 `body`, `body_len`. Request
  headers are not given (no first-party plugin reads them).
- [D] **The request head** is at most 8 KiB (431 above) and must arrive within 30 s of the
  connection (408 and closed otherwise); the host never holds more of a head than that.
- [D] **A request body** is written by the host as it comes to the plugin's data folder (root 0) at
  `.received/<server>/<request>` (each server its own folder, by its token), before the event;
  `body` is set once it is whole. The plugin reads it, moves it (`core.files` `move`, an upload to
  the card), removes it or leaves it; the host removes what is left when the request is answered
  or ends. `.received` is the host's in root 0: a
  plugin's own `make_dir`, writes and moves into it are `ERR_DENIED` (`files.md` 1.1). Chunked
  request bodies are answered 411 by the host.
- [D] **Bodies are bounded.** A `Content-Length` over the server's `max_body` is answered 413 before
  a byte is written; a body is also stopped at `max_body` while it streams (413, the part removed).
  The host's writes into `.received/` keep the storage's free-space reserve (the storage contract's
  D2.6): reaching it answers 507 and removes the part, so a client on the network can never fill
  the card past the room the kernel keeps for its own saves. A body that stalls for 30 s is
  dropped (408).
- [D] **Nothing stays behind.** The host empties a plugin's whole `.received/` when the plugin
  starts, and a server's own folder at its `serve`. A `serve` never touches the folder of another
  of the plugin's servers, so bodies that server is still receiving stay whole (a `serve` with a
  token in use stops that server and ends its requests first). A body a power cut left is so
  removed then; no body outlives its server.
- [D] At most 2 requests per server are open at once (the X4; more wait in the connection queue);
  one the plugin does not answer within 120 s is answered 503 by the host and ends (a later
  `respond` is `ERR_NOT_FOUND`).

### 5.3 `respond`

- [D] `net_response` first: `request`, `status` 100-599, `content_type` at most 128 bytes (an
  invalid one is sent as `application/octet-stream`); then at most 8 `net_header` (as 2.1, and the
  host refuses `Content-Length`, `Connection`, `Content-Type`), then at most one of `net_body`
  (inline, 2,048 bytes) and a `net_file` with role 0 `send` (root 0, 1 or 2: vocabulary serves its
  shipped page from root 2). A missing file is answered 404 by the host and the call is `OK`.
- [D] The host always sends `Content-Type`, `Content-Length`, `Connection: close` and
  `Cache-Control: no-store`. A request answered or ended is `ERR_NOT_FOUND`; another plugin's is
  `ERR_NOT_FOUND` too (never `ERR_DENIED`: request numbers say nothing about other plugins).

## 6. What stays in the SDK

- `web.rs` (URL joining, percent coding, `basic_auth`, `base64`, the user agent), `served::key` and
  `Guard` (a 16-letter key from SEC's `random`, five wrong keys lock for a minute, constant-time
  compare), and an SDK facade `native::net` that builds `request` from a builder like interface
  6's `HttpRequest`, keeps a small table from `token` to the plugin's own state where interface 6
  carried `params`, and reads the body in `body` pieces into the plugin's buffer.

## 7. Records

| Tag | Record | Fields |
| --- | --- | --- |
| 1148 | `service.net_request` | `token: u32`, `method: str 16`, `url: str 1024`, `flags: u32`, `timeout_ms: u32`, `max_body: u32`, `max_file: u64` |
| 1149 | `service.net_header` | `name: str 64`, `value: str 1024` (secret) |
| 1150 | `service.net_file` | `role: u32`, `root: u32`, `path: str 512` |
| 1151 | `service.net_body` | `data: bytes 2048` |
| 1152 | `service.net_started` | `id: u32` |
| 1153 | `service.net_token` | `token: u32` |
| 1154 | `service.net_id` | `id: u32` |
| 1155 | `service.net_answer` | `status: u32`, `flags: u32`, `body_len: u32`, `etag: str 256`, `content_type: str 128`, `final_url: str 1024` |
| 1156 | `service.net_read` | `id: u32`, `offset: u32` |
| 1157 | `service.net_bytes` | `data: bytes 3840` |
| 1158 | `service.net_serve` | `token: u32`, `port: u32`, `flags: u32`, `max_body: u64` |
| 1159 | `service.net_response` | `request: u32`, `status: u32`, `content_type: str 128` |

- [D] `net_header.value` carries `"secret": true`; the generator gains the attribute for service
  records (today it has it for growth commands' `str` fields, `SecretText`), so neither side's
  `Debug` shows it.
- [D] Each record alone fits its op's `max_input` / `max_reply`; a whole `request` or `respond`
  batch is checked against `max_input` (4,096): many long headers and a 2 KiB body together are
  `ERR_NO_SPACE`. Real requests carry 1-4 short headers and a URL of a few hundred bytes.

## 8. Who uses what (first-party, interface 6 audit)

| Plugin | Uses | Methods | Options |
| --- | --- | --- | --- |
| browser | request | GET | save to file, `max_file` 0 (64 MiB) for pages and downloads |
| fonts-browser | request | GET | save, `max_file` 4 MiB / 8 MiB |
| joplin | request | GET, POST, PUT, PROPFIND | save, send a file, `Authorization` |
| kosync | request | GET, PUT, POST | `x-auth-user` / `x-auth-key` headers |
| news | request | GET | save, `max_file` 4 MiB |
| opds | request, cancel | GET, PROPFIND | save, progress, cancel by token |
| read-later-cloud | request | GET, PATCH | save, `max_file` 512 KiB / 4 MiB, `Authorization` |
| readwise | request | POST | send a file and save the answer |
| stats | request | GET, PUT (WebDAV) | save, send a file |
| store | request | GET | save, `max_file` 4 MiB / 512 KiB / 2 MiB |
| translate | request | POST | form body, `Authorization` |
| update | request | GET, POST | save, `max_file` from the offer |
| wallabag | request | GET, POST, PATCH | save |
| weather | request | GET | `User-Agent` |
| wikipedia | request | GET | `max_body` 16 KiB, `timeout_ms` 15,000 |
| transfer | serve, respond | GET, POST, PUT, DELETE served | port 8080 and the cable, uploads to the card |
| vocabulary | serve, respond | GET, POST served | port 8080, its page from root 2, imports up to 4 MiB |
| wifi | serve, respond | GET, POST served | port 80 on its own access point |
| calibre, mail | (SOCK) | | `uses.network` for sockets |

- No first-party plugin reads response headers other than ETag and Content-Type, reads request
  headers on a server, or streams a memory body; none is offered (section 0).
- Settled with Plugin: **translate** sends up to 3,000 characters, percent-encoded up to about
  36,000 bytes, so a long request goes through a root-0 file (`net_file` send); a larger inline
  cap would not help. No plugin needs more in memory than the 44 KiB (X4) and 1 MiB (others)
  defaults; only wikipedia lowers `max_body` (16 KiB), larger answers are saved to files.
- [Q2] (Plugin) Until Firmware has measured, the X4's pool is 48 KiB and so its default and
  largest `max_body` 45,056 (44 KiB). Does any port read an answer of 44-64 KiB in memory on the
  X4 (it would save to a file instead)?

## 9. Hand-offs (after approval)

- **Host Engineer (after the H9 wiring):** the `core.net` host in `paperpaw-core` over the
  platform's HTTP client: admission (2.1 checks, limits, `uses.network`), the request table (ids,
  tokens, same-file replace within a plugin, `ERR_BUSY` across plugins, save paths in the
  paths-in-use table), cancel, ends-exactly-once, routing of 99-102 from the tables, the answer
  hold, `MEMORY_BODIES` counting arriving and undelivered bodies, the X4's `NET_POOL` with
  reservations before use (shared with SOCK), `body` pieces, power-saving
  ends, the server table (serve only from a showing screen, screen ties, `max_body` and 413,
  the free-space reserve and 507 for `.received/`, emptying `.received/` at plugin start and
  `serve`, 120 s answer time), and tests for each status and reason. Interface 6's `io/http.rs`
  and `io/servers.rs` logic moves over; the shells' `HttpCall` / `ServerCall` stay.
- **Firmware (with H10):** the shell transport. The X4 shell keeps its HTTP client and server
  (`.pp-staged` renames, the 20-port probe, the cable server), the emulator and Android shells keep
  theirs, and the shells advertise `uses.network`. The servers keep the 8 KiB head cap, the 30 s
  head and stall times and stop a body at `max_body`. Firmware measures the X4 worst case
  (a full `NET_POOL`, the receive and send buffers of NET's and SOCK's connections, one TLS
  session, two server connections) on the X4 heap; the X4 profile's `NET_POOL` follows that
  measurement (48 KiB until then). The X4 shell allocates the one TLS session's memory once at
  start, before the heap fragments, and reuses it for every TLS connection of NET and SOCK.
- **Services:** `native::net` (builder, token table, body reader), `served` and `web` kept.
- **Plugin:** ports declare `uses.network` (and `uses.storage` where they save to the card).
