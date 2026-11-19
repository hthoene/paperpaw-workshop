# Interface 7 family SOCK: TCP and TLS sockets, UDP broadcast

Contract for #228 (assignment #1088), reviewed with `work.md` (ASY). Items marked [D] are
proposed decisions, [Q] open questions for Plugin, Firmware and Senior. Inputs: an audit of
interface 6's sockets (the SDK's `sockets.rs`, `command.rs`, `replies.rs`; the kernel's
`io/sockets.rs`, `network.rs`, `work.rs`; the X4 shell's `sockets.rs`, `tls_slots.rs`, `net.rs`,
`paperpaw-x4`'s `tls_trust.rs` and `tls_watch.rs`; `paperpaw-serve` for desktop and Android) and of
the two first-party plugins that use them, mail and calibre (section 7), ADR 0014 (sockets for
plugins), ADR 0017 (TLS on the X4), `network.md` (NET: `uses.network`, waiting for the network,
power ends, TLS, `MEMORY_BODIES`), `files.md` (roots, `.pp-staged` files) and `work.md` (runs).
Records: `abi/services/core.sockets@1.def` and `abi/abi.def`; interface 7 stays a draft
(`native::DRAFT`) until it is frozen.

## 0. Scope and principles

- [D] **One service, events for what happens.** `core.sockets` (major 1, section 2) connects, sends,
  asks for a read, switches to TLS, closes and broadcasts; what comes of it (connected, data, a
  saved file, closed, failed, a certificate) is an event (section 4). The plugin reads arrived data
  during that event's callback, as NET's answer (`network.md` 2.3).
- [D] **Nothing arrives unasked** (ADR 0014): one read at a time per socket, and the host keeps at
  most that read's bytes. A plugin that does not read holds the peer back by TCP, not the host's
  memory.
- [D] **The same gate and power rules as NET:** `uses.network` (one feature for the network,
  `network.md` section 1), waiting up to 30 s for the network, the `offline`, `saving` and
  `network_off` ends, no radio switched on by the host, TLS against the host's store.
- [D] **Only what mail and calibre use:** plain and TLS connects, STARTTLS, pinned certificates or
  keys, byte reads and reads to a file, a UDP broadcast with answers. Not offered: listening sockets
  (NET serves HTTP), unicast UDP, DNS lookups on their own, client certificates, socket options,
  text reads (the SDK decodes UTF-8 over byte reads).

## 1. Sockets and their owners

- [D] **Ids.** `connect` and `broadcast` take the plugin's `token` and answer the host's `socket` id
  (non-zero, unique while the device runs), as NET's requests. Every later call names the `socket`;
  another plugin's id is `ERR_NOT_FOUND`.
- [D] **Owner:** a socket opened in a callback of one of the plugin's screen instances ends when
  that instance closes (reason `screen_closed`, interface 6); one opened in a work run (`work.md`
  2.3) belongs to the run and ends with it (`work_ended`); one opened elsewhere ends when the plugin
  stops. A plugin that stops ends all of its sockets (no events: it is not running).
- [D] **Limits:** at most 2 open sockets per plugin and, on the X4, 2 per device (plain and TLS
  together; 8 on others); over either is `ERR_BUSY` at `connect`. TLS sockets also need one of the
  device's TLS sessions (1 on the X4, shared with NET's `https` requests), 2.1.
- [D] **Sleep:** going to sleep ends every socket (`no_network`: the radio goes off); sockets do not
  keep the device awake by themselves, a run's requests and sockets keep the radio on only while
  awake (`work.md` 2.3).

## 2. The service `core.sockets` (major 1)

Every op names `uses.network` (`ERR_DENIED` without it). Bare replies (`registry.md` 2.1); input is
one counted batch of at most `input_rows` records.

| Op | Name | Effect | Input | Reply | Notes |
| --- | --- | --- | --- | --- | --- |
| 1 | `connect` | mutate | `sock_connect`, `sock_pin`* | `sock_started` | plain or TLS, up to 4 pins; `input_rows` 5 |
| 2 | `send` | mutate | `sock_send` | (none) | queues bytes to send (2.2) |
| 3 | `read` | mutate | `sock_read` | (none) | asks for the next data (2.3) |
| 4 | `data` | query | `sock_at` | `sock_bytes` | arrived bytes, during their event (2.3) |
| 5 | `start_tls` | mutate | `sock_tls`, `sock_pin`* | (none) | switches an open plain socket to TLS (2.4) |
| 6 | `peer` | query | `sock_ref` | `sock_peer` | the TLS certificate and key of a `secured` or `untrusted` socket (2.4) |
| 7 | `close` | mutate | `sock_ref` | (none) | closes; a closed or unknown one is `OK` |
| 8 | `broadcast` | mutate | `sock_broadcast`, `sock_port`* | `sock_started` | a UDP broadcast and its answers (3); `input_rows` 9 |

`max_input` 4,096, `max_reply` 4,096 (`data`) or 256, `bound: none`.

### 2.1 `connect`

- [D] `sock_connect`: `token`, `host` (a name of letters, digits, `-`, `.`, 1-253 bytes, or an IPv4
  or bracketed IPv6 address), `port` 1-65535, `flags` (bit 0 `tls`: TLS from the start),
  `server_name` (for TLS: the name to check, `""` for `host`), `timeout_ms` (0 for 20,000; at most
  60,000: lookup, connect and handshake together; for TLS counted from when a TLS session is free),
  `idle_ms` (0 for 60,000: no byte either way that long ends the socket with `timeout`; at most
  1,800,000). Then at most 4 `sock_pin` (2.4); pins without `tls` are `ERR_INVALID`, and so is a
  non-empty `server_name` without `tls` (it could not mean anything).
- [D] **Idle applies to every socket** (interface 6 had it for TLS only; plain sockets waited for
  the TCP keep-alive's 45 s): no socket stays open forever unused. A work run's socket always has
  one.
- [D] **TLS sessions:** a TLS socket waits for a free session before it resolves anything; it then
  answers `busy` if none came within `timeout_ms`. A secure socket idle for 5 s while another
  request or socket waits for the session ends with reason `session_needed` (interface 6's "slot
  needed"), so one quiet mail connection cannot block every download.
- [D] **Memory is reserved at `connect`** (section 6): the socket's send queue and read part
  (8 KiB on the X4) come from the device's network pool; when it has not that room, `connect`
  answers `ERR_NO_MEMORY` and opens nothing. Later `send` and `read` calls never fail for memory.
- [D] Outcome: `event.socket` `connected` (plain) or `secured` (TLS, 2.4), or `failed` with a reason
  (section 4).

### 2.2 `send`

- [D] `sock_send`: `socket`, `data` (1-3,840 bytes). The bytes join the socket's send queue, at most
  `SOCK_QUEUE` per socket (4 KiB on devices of the small memory class, the X4; 16 KiB on others,
  section 6); a `send` that does not fit is `ERR_BUSY` and queues nothing, and the host sends
  `event.socket` `sent` once the queue has drained, so the plugin sends the rest then (interface 6
  sent each `SocketSend` whole without bound; mail's DATA is sent in pieces now). Not while the
  socket connects or switches to TLS (`ERR_STATE`).

### 2.3 `read` and `data`

- [D] `sock_read`: `socket`, `mode` 0 `bytes` or 1 `file`, then for `bytes`: `max` 1-16,384 and
  `flags` bit 0 `exact` (wait for exactly `max` bytes rather than what has come); for `file`: `len`
  (bytes, 1-2^40) and `root`, `path` (root 0, or root 1 with `uses.storage`, as `files.md`). A
  `max` above the device's `SOCK_READ` (4,096 on the X4, 16,384 on others, section 6) reads at
  most `SOCK_READ`; with `exact` it is `ERR_INVALID` (exactly that many could never be held). One
  read at a time per socket (`ERR_BUSY`); not while connecting or switching (`ERR_STATE`).
- [D] **Bytes:** when data came (at least 1 byte, or `max` with `exact`), the host sends
  `event.socket` `received` with `len`; during that callback `data` (`sock_at`: `socket`, `offset`)
  answers `sock_bytes` with up to 3,840 bytes from `offset`, zero at the end. The bytes are freed
  when the callback returns. `len` 0 means the peer closed its side (interface 6's empty read).
- [D] **An `exact` read is all or nothing:** a peer that closes before `max` bytes came ends the
  socket `failed` with reason `closed_early`; the bytes that did come are freed, never delivered
  as a short `received`. `received` with `len` 0 ends only a read without `exact`.
- [D] **File:** the host writes exactly `len` bytes to `<path>.pp-staged` and renames it over `path`
  when whole, as NET saves (`network.md` 3.3), then sends `saved`; a socket that closes before `len`
  bytes, a full card or a card error removes the `.pp-staged` file, leaves the old file as it was
  and ends the socket (`failed`, reason `closed_early`, `full` or `io`). The target and its
  `.pp-staged` file are paths in use (`files.md` section 3) while the read runs. calibre's books and
  mail's message bodies come this way, so no large body is held in memory.
- [D] **A file read follows the card rules of `files.md` for writes:** the root and path checks
  (root 1 never reaches `plugins/` or `.paperpaw/`, root 0's `.received/` is the host's:
  `ERR_DENIED`), `ERR_BUSY` at `read` for a target or `.pp-staged` file another writer uses, and the
  host's writes keep the storage's free-space reserve (the storage contract's D2.6): reaching it
  ends the socket `failed` `full` with the `.pp-staged` file removed, and a `len` above the known
  free space after the reserve is `ERR_FULL` at `read`. The write buffer is the socket's read part
  (no other memory).
- [D] A `bytes` read holds at most `SOCK_READ` per socket, inside the socket's reservation.

### 2.4 TLS: trust, pins, STARTTLS

- [D] **Trust:** without pins, the chain must lead to a root of the host's store and the name must
  match `server_name` (NET's rules, `network.md` 3.1). With pins (`sock_pin`: `kind` 0 the SHA-256
  of the leaf certificate's DER, 1 the SHA-256 of its SubjectPublicKeyInfo DER, `hash` 32 bytes; at
  most 4), only the leaf must match one pin; chain and name are not checked; dates are. Interface 6
  rules, unchanged.
- [D] **Dates:** checked against network time; until the time is known the host waits up to 5 s,
  then goes on without the date check and says so (`sock_peer.flags` bit 0 `time_checked` clear;
  mail refuses such a session).
- [D] **Outcome:** `secured` once the handshake passed; `untrusted` when only the trust failed
  (unknown issuer, or no pin matched: `reason` 0 `unknown_issuer`, 1 `not_pinned`), so the plugin
  can show the certificate's hashes and the user can pin the key (mail's flow); the socket is closed
  then. A name mismatch, an expired certificate and any other TLS failure are `failed` (`name`,
  `expired`, `tls`). `peer` (`sock_ref`) answers `sock_peer` (`flags`, `certificate` and `key`
  hashes, 32 bytes each) during the `secured` or `untrusted` callback.
- [D] **`start_tls`** (`sock_tls`: `socket`, `server_name`, `timeout_ms`, `idle_ms`, then pins) on
  an open plain socket with no read under way, no unread byte and an empty send queue; anything
  received from the peer and not yet read when the switch is asked (bytes sent before the switch, a
  STARTTLS injection) ends the socket with `failed` `tls` and nothing is ever handed over in clear
  after the call. Otherwise `ERR_STATE` and the socket stays as it was.
- [D] **Bytes the plugin already holds count too.** The SDK's reader keeps bytes a read brought
  beyond what the plugin asked for (mail reads 1,024 at a time); a plaintext reply injected
  together with the server's "ready" sits there. The SDK's `start_tls` therefore refuses with
  `ERR_STATE` while its own surplus is not empty, and the plugin closes the socket (mail treats it
  as a failed STARTTLS). Plugins that read without the SDK's reader check the same before the call:
  nothing read before the switch is ever taken as coming over TLS.

## 3. UDP broadcast

- [D] `broadcast`: `sock_broadcast` (`token`, `data` 1-512 bytes, `wait_ms` 100-10,000) and 1-8
  `sock_port` (`port` 1-65535); it reserves room for its 8 answers (8 KiB) from the network pool at
  the call (`ERR_NO_MEMORY` when short, section 6): the host sends `data` from a port of its own to
  the network's broadcast address on each port, then collects answers for `wait_ms`. Each answer is
  one `event.broadcast` `answer` (`from`: the sender's address and port, `len` at most 1,024 bytes,
  read with `data` on the broadcast's `socket` id during the callback); at most 8 answers per
  broadcast; then one `done`. A broadcast counts as one of the plugin's sockets while it runs.
  calibre finds its server this way.
- [D] Without a network the broadcast ends `done` with `reason` `no_network` (interface 6 answered
  `Done` too); refused by power or feature it is `failed` as a socket (section 4). A network that
  goes away while it runs (sleep, `network_lost`) ends it `done` `no_network` too; answers already
  sent stay delivered.
- [D] **How a broadcast ends** (always with exactly one `done` or `failed`): the 8th answer ends it
  at once with `done` reason 0 (no further answer could be delivered); otherwise `wait_ms` runs out
  (`done` 0). `close` on its id ends it `done` 0; the screen closing or the run ending ends it
  `done` with reason 26 `screen_closed` or 27 `work_ended`.
- [D] **Answers are checked, never cut:** an answer over 1,024 bytes, or whose `from` is over 64
  bytes or not UTF-8, is not delivered and does not count toward the 8; the host logs it. A cut
  answer would hand the plugin a malformed message.

## 4. Events

| Tag | Event | Fields |
| --- | --- | --- |
| 106 | `event.socket` | `now_ms: u64`, `socket: u32`, `token: u32`, `kind: u32`, `reason: u32`, `len: u32` |
| 107 | `event.broadcast` | `now_ms: u64`, `socket: u32`, `token: u32`, `kind: u32`, `reason: u32`, `len: u32`, `from: str 64` |

- `event.socket.kind`: 0 `connected`, 1 `secured`, 2 `untrusted`, 3 `received`, 4 `saved`, 5 `sent`,
  6 `closed` (by `close`, the screen, the run or the peer after `received` 0), 7 `failed`.
  `event.broadcast.kind`: 0 `answer`, 1 `done`, 2 `failed`.
- `reason` for `failed`, `closed` and `done` (`network.md` 4.1's numbers where they mean the same):
  1 `no_network`, 2 `dns`, 3 `tls`, 4 `timeout`, 5 `refused` (could not connect), 9 `io`, 10 `full`,
  11 `offline`, 12 `saving`, 13 `network_off`, then SOCK's own: 20 `busy` (no TLS session in time),
  21 `session_needed`, 22 `lost` (the connection or the network went away), 23 `name`, 24 `expired`,
  25 `closed_early`, 26 `screen_closed`, 27 `work_ended` (the run it belongs to reached its longest
  time, `work.md` 2.3), 28 `no_memory`. 0 for none.
- [D] **Never dropped:** 106 and 107 come from the host's socket table (2 per plugin, 8 answers per
  broadcast), not from the held-event store; `sent` is coalesced (one pending per socket). Every
  socket ends with exactly one `closed` or `failed`; every broadcast with one `done` or `failed`.

### 4.1 Records

| Tag | Record | Fields |
| --- | --- | --- |
| 1170 | `service.sock_connect` | `token: u32`, `port: u32`, `flags: u32`, `timeout_ms: u32`, `idle_ms: u32`, `host: str 253`, `server_name: str 253` |
| 1171 | `service.sock_pin` | `kind: u32`, `hash: bytes 32` |
| 1172 | `service.sock_started` | `socket: u32` |
| 1173 | `service.sock_send` | `socket: u32`, `data: bytes 3840` |
| 1174 | `service.sock_read` | `socket: u32`, `mode: u32`, `flags: u32`, `max: u32`, `len: u64`, `root: u32`, `path: str 512` |
| 1175 | `service.sock_at` | `socket: u32`, `offset: u32` |
| 1176 | `service.sock_bytes` | `data: bytes 3840` |
| 1177 | `service.sock_tls` | `socket: u32`, `timeout_ms: u32`, `idle_ms: u32`, `server_name: str 253` |
| 1178 | `service.sock_ref` | `socket: u32` |
| 1179 | `service.sock_peer` | `flags: u32`, `reason: u32`, `certificate: bytes 32`, `key: bytes 32` |
| 1180 | `service.sock_broadcast` | `token: u32`, `wait_ms: u32`, `data: bytes 512` |
| 1181 | `service.sock_port` | `port: u32` |

- `sock_read.len`, `root` and `path` are 0 and `""` for `bytes`; `max` and `flags` 0 for `file`.
  Pins and `sock_send.data` are not secret (hashes and protocol bytes; a password inside a protocol
  exchange is the plugin's to keep out of logs: the host never logs socket data).

## 5. Statuses

| Condition | Status |
| --- | --- |
| Without `uses.network`; root 1 without `uses.storage` | `ERR_DENIED` |
| A host without sockets or TLS (the web emulator: no TLS) | `ERR_UNSUPPORTED` |
| Bad host, port, pins, sizes, flags, roots or paths | `ERR_INVALID` |
| Too many sockets; a read under way; a send queue full; a file read's target in use | `ERR_BUSY` |
| The network pool has no room for a socket's or a broadcast's buffers (section 6) | `ERR_NO_MEMORY` |
| A file read's `len` above the known free space after the reserve | `ERR_FULL` |
| Connecting or switching; `start_tls` with unread bytes or a read under way | `ERR_STATE` |
| Another plugin's or an ended socket for `send`, `read`, `data`, `start_tls`, `peer` | `ERR_NOT_FOUND` |

## 6. Memory (X4)

- [D] **Caps per memory class**, read from the device profile as NET's `MEMORY_BODIES`: `SOCK_QUEUE`
  (the send queue) and `SOCK_READ` (the read part, also a file read's write buffer) are **4 KiB
  each on the X4** and 16 KiB on others. mail reads 1,024 bytes and sends in pieces on `sent`;
  calibre's large messages and books go through `file` reads.
- [D] **The X4's network pool** (`network.md` 3.4, `NET_POOL`, 48 KiB until measured) is shared with
  NET: a socket reserves `SOCK_QUEUE` + `SOCK_READ` (8 KiB) at `connect` and a broadcast 8 x 1 KiB
  for its answers at `broadcast`, both freed when they end; when the pool is short the call answers
  `ERR_NO_MEMORY` and nothing is held. A reservation never grows, so a socket never ends for memory
  once open (`no_memory` stays for the shell's own buffers, below).
- Per socket in the shell, outside the pool: 8 KiB TCP receive and 2 KiB send (X4 `MAX_SOCKETS`
  2), and the device's one TLS session (about 40 KiB, shared with NET). A shell that cannot get
  them ends the socket `failed` `no_memory`. The TLS session's memory is allocated once at start,
  before the heap fragments, and reused (`network.md` section 9). Worst case on the X4: the full
  pool (48 KiB), two sockets' shell buffers (20 KiB) and the TLS session, about 108 KiB; Firmware
  measures it with NET's and the profile sets `NET_POOL` from that.

## 7. Who uses what (first-party, interface 6 audit)

| Plugin | Protocol | TLS | Reads | Broadcast |
| --- | --- | --- | --- | --- |
| mail | IMAP (993, or 143 with STARTTLS) and SMTP (465, or 587 with STARTTLS), AUTH PLAIN | `connect` with `tls` or `start_tls`; pinned keys after an `untrusted` the user accepted; refuses `time_checked` clear | bytes of 1,024; message bodies (at most 256 KiB) to a root-0 file | no |
| calibre | calibre's wireless device protocol (`<len>[op, {json}]`, port 9090 or found) | none | bytes with `exact` for each message; books to the library folder (root 1) as a file | `hello` to 5 ports, 1,500 ms, up to 4 tries |

- No first-party plugin listens, uses unicast UDP, client certificates or text reads with a
  delimiter. calibre read the length digits one byte at a time in interface 6; with `exact` it may
  keep doing so, or read a few bytes and keep the rest in the SDK's reader.
- [D] (Plugin, Q1 answered) **mail** builds outgoing messages in memory (a 16 KiB body, no file
  attachments), so no send-from-file is needed. An encoded message can be larger than the queue:
  the SDK keeps the unsent bytes and sends the next piece only when `sent` says there is room.

## 8. Hand-offs (after approval)

- **Host Engineer (after NET's host):** the `core.sockets` host in `paperpaw-core` over interface
  6's `io/sockets.rs`: ids and owners (screen, run, plugin), the limits, idle for every socket, the
  TLS session queue and `session_needed`, send queues and `sent`, reads (bytes, `exact`, file with
  `.pp-staged`, paths in use, the card rules and the free-space reserve), `peer`, `start_tls`
  refusal of unread bytes, broadcasts, the per-class caps and the reservations from NET's pool
  (`ERR_NO_MEMORY`), `work_ended` at a run's longest time, events from the socket table, the NET
  gate and power ends; tests for each status and reason, and one for a pool full of NET bodies.
- **Firmware (with H10):** the shells' sockets as today (X4 `MAX_SOCKETS` 2, buffers, `tls_slots`,
  `tls_trust`), the idle time on plain sockets, `SOCK_QUEUE`, `SOCK_READ` and `NET_POOL` in the
  profiles (X4 pool 48 KiB until measured), the TLS session's memory allocated once at start, and
  the X4 worst-case measurement with NET's (section 6).
- **Services:** `native::sockets` (connect builder with pins, a reader that keeps surplus bytes and
  decodes UTF-8, file reads, send in pieces on `sent` keeping unsent bytes, broadcast); its
  `start_tls` refuses with `ERR_STATE` while the reader holds surplus bytes (2.4), with a test that
  a reply arriving together with "ready" is never read after the switch.
- **Plugin:** mail and calibre ports.
