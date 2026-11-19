# Interface 7 family SEC: stored secrets and randomness

Contract for #228 (assignment #1088), reviewed with `network.md` (NET). Items marked [D] are
proposed decisions, [Q] open questions for Plugin and Senior. Inputs: an audit of interface 6's
secrets and randomness (the SDK's `secrets.rs`, `random.rs`, `wifi.rs`, `served.rs`; the kernel's
`lib.rs` `set_secret`, `builder.rs`, `commands.rs` `vet_reserved`, `config.rs` secret settings;
the X4, desktop and Android shells' random sources and the Android private folder), the 15
first-party plugins that use them (section 6), ADR 0016 (`wifi.<name>` secrets), `device.md`
(Wi-Fi passwords, `dev_network.flags` bit 1), `commands.md` (slot 15 refuses secret settings),
`registry.md` (the secret flag of `reg_setting`), `files.md` section 4 (decision 124) and
`stages-services.md` (D4: `core.secrets` is SEC's service).
Records: `abi/services/core.secrets@1.def`.

## 0. Scope and principles

- [D] **One service, `core.secrets` (major 1).** Reading, listing, keeping and removing secrets
  and drawing random bytes are calls with a status (section 2). Interface 6's `Env::secrets()`
  and `Env::random()` and `Command::SetSecret` have no other copies.
- [D] **A plugin's secrets are its own, by name.** A plugin names a secret within its own space
  (`password`, `token`); the host stamps the owner from the calling plugin, as root 0. No prefix
  to spoof: interface 6's "first segment must be the running plugin" check becomes the stamp.
- [D] **Values never go to another plugin.** Only the owner reads a value. The settings editor
  (the plugin with `uses.secrets`, 1.1) may list every plugin's secrets (names and labels, never
  values) and change or remove them for the user; it cannot read them, as in interface 6.
- [D] **Encrypted on every device (owner decisions 138, 2026-11-07, and 140, 2026-11-08).** Secrets
  are kept apart from settings and logs. Their values are **encrypted at rest** with a key of the
  device, never on the card (section 3.1): the card alone, also read by a computer in USB drive
  mode, shows no secret. They do not move with the card: on another device, or after the device's
  key was lost, they read as absent and the user enters them again. No device veils new values any
  more (interface 6's veiling is only read, to migrate it). This is a host rule: ops, records and
  statuses are the same on every device.
- Out of SEC: TLS trust and pinning (NET, SOCK), the server key guard (the SDK's `served`, over
  `random`), Wi-Fi joining (DEV: `join` with `remember` keeps the password as the Wi-Fi plugin's
  secret, 4), hashing (plugin code, e.g. lock's salted hash).

## 1. Features and ownership

### 1.1 Feature

| Key | Allows | Plugins (first-party) |
| --- | --- | --- |
| `uses.secrets` | `list` of every plugin's secrets; `keep` and `remove` of another plugin's | settings |

- [D] A signed metadata feature (revision 1). It replaces interface 6's editor exemption
  (`vet_reserved`'s `guarded_exempt`): a feature is visible on the store page and does not depend
  on which plugin is bound as the editor. Reading and keeping one's own secrets and `random` need
  no feature.
- [Q1] (Senior) Interface 6 let every plugin list all secrets' ids and labels (`listed()`); only
  the settings plugin used it. This draft narrows listing others to `uses.secrets`. Agreed?

### 1.2 Names, labels, values

- [D] **`plugin`** names the owner in a call: `""` is the caller itself; another plugin's id needs
  `uses.secrets` (`ERR_DENIED`) and is only allowed for `list`, `keep` and `remove`.
- [D] **`name`**: 1-64 bytes of UTF-8, compared exactly. Tab, newline (LF) and carriage return
  (CR) are allowed, since an SSID may hold them, and the host escapes them and the backslash in its
  file as interface 6 does (`\t`, `\n`, `\r`, `\\`), so a name round-trips byte for byte; every
  other control character (U+0000-U+001F but those three, U+007F, U+0080-U+009F) is
  `ERR_INVALID`. The Wi-Fi plugin names a network's password by its SSID. `label` follows the same
  rule.
- [D] **`label`**: at most 64 bytes, what the settings editor shows (a translation key of the
  owner's catalog, or plain text when there is none, as interface 6). `""` when keeping an
  existing secret keeps its label.
- [D] **`value`**: at most 1,024 bytes of UTF-8 (passwords, API keys, OAuth tokens). It is marked
  secret in the schema, so neither side's generated `Debug` shows it and no host log prints it.
- [D] **Limits:** at most 32 secrets per plugin (`ERR_FULL`), and the host's file at most 64 KiB
  (`ERR_FULL`).
- [D] **`changeable`** (flags bit 0): the user may change the value in the settings editor.
  Secrets a plugin made itself (kosync's key, lock's code hash, read-later-cloud's account) are
  kept with it clear: the editor can only remove them.

## 2. The service `core.secrets` (major 1)

Bare replies and paging as `core.registry` (`registry.md` 2.1). Input is one record.

| Op | Name | Effect | Input | Reply | Notes |
| --- | --- | --- | --- | --- | --- |
| 1 | `get` | query | `sec_name` | `sec_value` | one of the caller's own secrets |
| 2 | `list` | query | `sec_list` | `sec_entry`*, `end` | names and labels, paged, `page_rows` 32 |
| 3 | `keep` | mutate | `sec_keep` | (none) | adds or replaces a secret, saved before the reply |
| 4 | `remove` | mutate | `sec_name` | (none) | removes a secret, saved before the reply |
| 5 | `random` | query | `sec_random` | `sec_bytes` | random bytes from the device's source |

`max_input` 1,280 (`keep`) or 256, `max_reply` 4,096 (`list`) or 1,280; `bound: card` for `get`,
`list`, `keep` and `remove` (each reads or writes the card file), `none` for `random`.

### 2.1 `get`

- [D] `sec_name.plugin` must be `""`: any other id, the caller's own spelled out included, is
  `ERR_DENIED`, also with `uses.secrets` (one form, so a caller never reads another's by a typo).
  Replies `sec_value`: `value`, `label`, `flags` (bit 0 `changeable`). `ERR_NOT_FOUND` when there
  is none.

### 2.2 `list`

- [D] `sec_list.flags` bit 0 `all`: every plugin's secrets (needs `uses.secrets`); without it, the
  caller's own. Unknown flag bits of `sec_list` and `sec_keep` are `ERR_UNSUPPORTED` (`records.md`,
  unknown flag bits: a bit of a later host, not a malformed call). Rows are `sec_entry`: `plugin`
  (the owner's id), `name`, `label`, `flags` (bit 0 `changeable`). Never a value. A page holds as
  many whole rows as fit in 4,096 bytes, at most 32. Order: the order of the lines in the host file,
  so the host streams a page without sorting or holding the file: a file from interface 6 keeps its
  order, a new secret is appended, a changed one keeps its line. The cursor is a row number into the
  rows the caller may see (`service.end.next`; `flags` bit 0 `last` on the last page, as
  `core.registry`); a secret kept or removed between pages may be listed twice or not at all. A view
  that wants another order sorts the rows itself.

### 2.3 `keep`

- [D] `sec_keep`: `plugin`, `name`, `label`, `value`, `flags` (bit 0 `changeable`). Adds the secret
  or replaces its value (and its label unless `""`). The owner keeps any of its own; the editor
  (`uses.secrets`) only replaces an **existing changeable** secret of another plugin
  (`ERR_NOT_FOUND`, `ERR_DENIED` when not changeable) and cannot change `changeable`; the one
  exception is the value of a secret setting the other plugin declares (section 4), which the
  editor may keep before there is one (kept changeable). An empty `value` is a value (an open
  Wi-Fi network's).
- [D] `OK` means saved on the card. Otherwise nothing changed and the call answers `ERR_IO` (card
  away or unwritable) or `ERR_FULL` (1.2); the old value stays.

### 2.4 `remove`

- [D] Removes the secret; one that does not exist is `OK` (nothing to do). Another plugin's needs
  `uses.secrets` (any, changeable or not: the user may always remove a secret). `OK` means saved;
  `ERR_IO` as 2.3.

### 2.5 `random`

- [D] `sec_random.len` 1-256 bytes (`ERR_INVALID`); replies `sec_bytes`: `data` of exactly `len`
  bytes and `flags` bit 0 `strong`. A host without a source answers `ERR_UNSUPPORTED` and never
  a weaker stand-in (interface 6). Not cached, not shared between callers.
- [D] **`strong`** is set when the source is fully random at that moment. On the X4 the chip's
  generator is fully random while the radio is on and pseudo-random before (interface 6's
  wording), so `strong` follows the radio, until Firmware has checked whether the chip's ADC
  entropy source can keep the generator fully random with the radio off (then the X4 is always
  `strong`, section 7). Plugins that make a long-lived key (the served key,
  a Wi-Fi access-point password, lock's salt) draw it when `strong` is set, as interface 6
  advised; desktop and Android are always `strong`.
- Settled with Plugin: **lock** keeps setting its code offline. It takes the salt from `random`
  whether `strong` is set or not (interface 6 fell back to the device id and the time), and claims
  no cryptographic strength for it: the salt only stops a precomputed table.

## 3. Saving and the card

- [D] Secrets live in one host file, `.paperpaw/secrets.txt` (interface 6's format: one line per
  secret, owner and name, label, flags, value: sealed on every device, section 3.1). **The host
  never holds the file whole** (interface 6 loaded it and doubled it while writing, up to 2 x 64 KiB
  on the X4): `get` and `list` read it line by line through one read buffer (one line and a little
  room, about 2.6 KiB); `keep` and `remove` stream the old lines through to a new file with the one
  change and then **replace the old file by rename**, so a power cut leaves the old file or the new
  one, never half of either. Memory per call: the read buffer, and for `keep` and `remove` one line
  besides (at most about 2.5 KiB: the names, the label and a 1,024-byte value sealed, hex with its
  nonce, tag and marker, section 3.1; an interface-6 veiled value being read is shorter), no
  allocation per secret.
- [D] **An unreadable file is never overwritten.** If the file could not be read at start (a card
  error; lines the host does not understand are kept as they are and do not count), `keep` and
  `remove` answer `ERR_IO` and the host shows its notice once, as interface 6's
  `core.secrets-unreadable`; reads answer from what was read. Interface 6 applied such changes in
  memory only; this draft refuses them so `OK` always means saved.
- [D] Android keeps the file in the app's private folder; the X4 and desktop on the card.

### 3.1 Encryption at rest (decisions 138 and 140)

- [D] **The device key:** 32 bytes drawn from the device's generator while it is fully random
  (`strong`, 2.5), made once on the first start that needs it, never on the card and never given to
  a plugin. On the X4 and X3 (ESP32-C3) and the X4 Pro and X4 Classic (ESP32-S3) it is kept in the
  chip's internal flash, outside every partition that a firmware update or a reset of the settings
  rewrites, so both keep it; a full erase of the flash (the web flasher's erase option) loses it,
  and with it every secret on the card, which then reads as absent. The flasher's erase option and
  the help on secrets say so. Android keeps it in the app's private storage, the desktop emulator in
  its own data folder, never in the folder it uses as the card; uninstalling the app or deleting
  that folder loses it the same way.
- [D] **Each value** is sealed with AES-256-GCM under the device key, a fresh 12-byte nonce from the
  generator per write, and as associated data exactly the line's owner id (UTF-8 bytes), one zero
  byte, then the secret's name (UTF-8 bytes, to the end). A plugin id never holds a zero byte
  (`[a-z0-9-]`), so the first zero byte ends the owner and no other (owner, name) pair gives the
  same bytes. A sealed value moved to another line (another name of the same plugin, or another
  plugin's line) fails to open there and counts as absent (below); the host's tests must pin both
  cases. The line keeps interface 6's layout; the value field is the marker `s1:` and then the
  nonce, the sealed value and the tag in hex. The marker holds characters that are not hex, so
  interface 6's reader (`decode_line`) fails on the field and keeps the line unread and written back
  unchanged: after a downgrade to beta 3 a sealed value is absent there, never taken for a veiled
  one and saved back as garbage. Owner, name, label and flags stay readable, as the settings editor
  lists them anyway; only values are secret.
- [D] **Which devices seal: every device** (decision 140: the X4, X3, X4 Pro and X4 Classic, Android
  and the desktop emulator), with its own key, the same algorithm, line form and associated data.
  There is no veiling fallback: a device that cannot seal a value now (no strong randomness, no key
  and none can be made) refuses the `keep` (`ERR_STATE`, section 2.5) and writes nothing; it never
  writes a veiled or plain value. A sealed line from another device's card is absent there and
  written back unchanged.
- [D] **A value that does not open** (another device's card, a lost key, a damaged line) counts as
  **absent**: `get` answers `ERR_NOT_FOUND`, `list` leaves it out, never a crash or a log of the
  bytes. Its line is written back unchanged by every `keep` and `remove` (never dropped), so the
  card works again in its own device; a `keep` of the same owner and name replaces it, which is how
  the user enters it again.
- [D] **From interface 6 (beta 3):** veiled values are only read, never written again. A veiled
  value found on any device is opened as interface 6 did and rewritten sealed at the next save (the
  first start after the update saves at once); the veiled form is then gone. If that save cannot
  seal (as above), the veiled line stays unchanged and readable until a later save can; it is never
  rewritten veiled.

## 4. Settings, Wi-Fi, uninstall

- [D] **Secret settings.** A setting declared secret (`reg_setting` flag, `registry.md`) is the
  owner's secret named by the setting's key (mail's `password`): a text with an empty default
  (`ERR_INVALID` otherwise), never read with slot 5 (absent there, also for its owner). The
  plugin reads it with `get`;
  the settings editor changes it with `keep` (slot 15 keeps refusing it, `commands.md`); resetting
  the setting removes the secret. A value found in `paperpaw.ini` for such a setting moves into
  secrets at load (interface 6), or, on a device that cannot seal then (the X4 without a radio
  on, 3.1), as soon as Wi-Fi is on; it stays in the file until it is saved sealed. Secret settings are never announced to other plugins
  (`core-events.md`).
- [D] **Wi-Fi.** Known networks are the Wi-Fi plugin's secrets, named by SSID. DEV's `join` with
  `remember` keeps the password there for the plugin; `dev_network.flags` bit 1 `known` is set for
  a network that has one. Only the Wi-Fi plugin reads them; the host joins with them itself.
- [D] **Uninstall (decision 124).** A plugin's secrets go with its data folder: removed when the
  user chooses to delete the data, kept otherwise (found again on reinstall). The host removes
  them by the validated plugin id, never by a name a plugin gave.
- Bluetooth bonds stay the host's own (not reachable through `core.secrets`).

## 5. Records

| Tag | Record | Fields |
| --- | --- | --- |
| 1160 | `service.sec_name` | `plugin: str 64`, `name: str 64` |
| 1161 | `service.sec_value` | `flags: u32`, `label: str 64`, `value: str 1024` (secret) |
| 1162 | `service.sec_list` | `flags: u32`, `cursor: u32` |
| 1163 | `service.sec_entry` | `flags: u32`, `plugin: str 64`, `name: str 64`, `label: str 64` |
| 1164 | `service.sec_keep` | `plugin: str 64`, `name: str 64`, `label: str 64`, `flags: u32`, `value: str 1024` (secret) |
| 1165 | `service.sec_random` | `len: u32` |
| 1166 | `service.sec_bytes` | `flags: u32`, `data: bytes 256` |

- [D] `value` carries `"secret": true` (as `net_header.value`, `network.md` section 7). The
  host's reply buffer that held a value is cleared after the call.

## 6. Who uses what (first-party, interface 6 audit)

| Plugin | Secrets (own names) | Random |
| --- | --- | --- |
| calibre | `password` | |
| joplin | `password` | |
| kosync | `key` (not changeable) | |
| lock | `code` (salted hash, not changeable) | salt (token) |
| mail | `password` (secret setting) | 8 bytes per Message-ID |
| opds | one per catalog (`<hash of the URL>`), removed with the catalog | |
| read-later-cloud | `token`, `account` (not changeable) | |
| readwise | `token` | |
| settings | every plugin's: list, change, remove (`uses.secrets`) | |
| stats | `webdav` | |
| translate | `deepl-key` | |
| wallabag | `password`, `client-secret` | |
| wifi | one per network (SSID) | form token, access-point password |
| transfer, vocabulary | | the served key (`served::key`) |

## 7. Hand-offs (after approval)

- **Host Engineer (after the H9 wiring):** the `core.secrets` host in `paperpaw-core` over
  interface 6's `Secrets` file format: owner stamping, `uses.secrets` checks, the limits, streamed
  reading and saving by replace (never the whole file in memory), the unreadable-file refusal,
  secret settings (key = name, reset removes), uninstall removal with decision 124's data choice,
  `random` over the device source with `strong`; tests for each status. Generator: `secret` on
  service record fields (Kernel, at the records step).
- **Firmware (with H10):** the device-side secret store (the card file on the X4 and the emulator,
  the private folder on Android), **decisions 138 and 140 on every device:** making the device key
  (32 strong random bytes, once) and keeping it in internal flash across firmware updates, sealing
  and opening values with AES-256-GCM (mbedTLS, already in the firmware) as section 3.1 says,
  treating a value that does not open as absent and writing its line back unchanged, rewriting
  interface 6's veiled values sealed at the first start, the key outside every partition an update
  or a settings reset rewrites, the flasher's and help's note that a full erase loses the secrets,
  and tests for a card from another device, a lost key, a damaged line (absent, never a panic) and
  interface 6's `decode_line` on a sealed line (not read, kept unchanged); the random sources with
  the X4's `strong` signal (radio on), a check whether the ESP32-C3's SAR ADC entropy source makes
  draws fully random with the radio off, and the shells advertising `uses.secrets` where the
  settings editor runs.
- **Services:** `native::secrets` (typed get/list/keep/remove) and `native::random` with
  interface 6's `token`, `readable` and `grouped` helpers over it; `served::key` on top.
- **Plugin:** settings declares `uses.secrets`; ports use their own names without the prefix.
