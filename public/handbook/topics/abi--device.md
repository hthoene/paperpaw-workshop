# Interface 7 family DEV: device, power, radios, installing, firmware

Contract for #228 (assignment #1025). Items marked [D] are proposed decisions, [Q] open
questions for Plugin, Firmware and Senior. Inputs: Firmware's DEV inventory and draft (#931,
`/home/agent/shared/dev-family-228.md`, whose sections 1, 2 and 8 are taken as the inventory and
whose open questions section 9 settles), the plugin needs inventory (#984, DEV section), the
C-family proposals (#890 2.12), `registry.md` (plugin rows, `set_plugin_enabled`, presets,
`request_plugins` / `answer_plugin`), `core-events.md` (events 70-72), `ui.md` (host-drawn
confirmations, the guard) and owner decisions 124, 132 and 134. Round 2 folds in Firmware's check
of the OTA path (`crates/paperpaw-x4/src/updates.rs`, `ota.rs`, `shells/xteink/src/`) and Plugin's
gap review (`/home/agent/shared/plugin-dev-gaps-1025.md`); round 3 Senior's review (#1030: must-fix
1-3, should-fix 4-9).
Records: `abi/services/core.device@1.def`.

## 0. Scope and principles

## 1. Features

| Key | Allows | Plugins (first-party) |
| --- | --- | --- |
| `uses.wifi` | commands 1564-1571 | wifi, transfer, diagnostics, fonts-browser (*Go online* for a download or the list in Offline mode) |
| `uses.power` | commands 1572-1575 | power, diagnostics, settings, plugin-manager, reading-goal, store, update |
| `uses.install` | commands 1576, 1577, 1580-1582, 1592 (kind 0); REG `answer_plugin` | store, fonts-browser, plugin-manager, update |
| `uses.firmware` | commands 1578, 1579, 1592 (kind 1) | update |
| `uses.bluetooth` | commands 1583-1591 | bluetooth |

- [D] With `uses.install` defined, REG's `answer_plugin` refusal (`registry.md` 4.2: `ERR_DENIED`
  for every plugin until DEV defines it) becomes: allowed for a plugin that declares `uses.install`,
  `ERR_DENIED` for others; the test that fails once `uses.install` exists is replaced by tests of
  both.

## 2. The service `core.device` (major 1)

No feature. Bare replies and paging as `core.registry` (`page_rows` 32). A part the device has
nothing for answers `ERR_NOT_FOUND` (Bluetooth on the X4, Wi-Fi on Android, firmware on the desktop
and Android), never a record of zeros, so "not here" differs from "off"; `caps` and these answers
agree (a host test).

| Op | Name | Input | Reply | Notes |
| --- | --- | --- | --- | --- |
| 1 | `device` | (none) | `dev_device` | identity, class, capabilities, start kind |
| 2 | `values` | (none) | `dev_value`*, `end` | named hardware values, at most 8 |
| 3 | `firmware` | (none) | `dev_firmware` | version, install state and progress |
| 4 | `builtin` | `reg_query` | `dev_builtin`*, `end` | plugins built into the image, paged |
| 5 | `native` | (none) | `dev_native` | what a code plugin must be built for, safe mode, code room |
| 6 | `check` | `dev_request` | `dev_check` | the result of a finished file check (section 5.1) |
| 7 | `memory` | (none) | `dev_memory` | heap and stack, at most one real probe per 250 ms |
| 8 | `wifi` | (none) | `dev_wifi` | radio state |
| 9 | `networks` | `reg_query` | `dev_network`*, `end` | found networks, strongest first, at most 32 |
| 10 | `bluetooth` | (none) | `dev_bluetooth` | radio state |
| 11 | `bonded` | `reg_query` | `dev_bonded`*, `end` | bonded devices (the caller's), at most 16 |
| 12 | `power` | `dev_interval` | `dev_power` | power level and mode; `every(base)` |
| 13 | `install` | `dev_request` | `dev_install` | state of an install, removal, firmware or check request |
| 14 | `not_installed` | `reg_query` | `dev_not_installed`*, `end` | plugins this start could not install, at most 32 |
| 15 | `keys` | (none) | `dev_key`*, `end` | the device's physical keys, at most 32 |
| 16 | `leaves_out` | `reg_query` | `dev_builtin`*, `end` | built-ins the last firmware check's image lacks (5.1), paged |

| Tag | Record | Fields |
| --- | --- | --- |
| 1125 | `service.dev_device` | `id: str 64`, `model: str 64`, `catalog: str 32`, `class: u32`, `caps: u64`, `controls: u32`, `tls_sessions: u32`, `start: u32`, `slept_ms: u64`, `flags: u32` |
| 1126 | `service.dev_value` | `name: str 32`, `value: i32` |
| 1127 | `service.dev_firmware` | `version: str 64`, `project: str 32`, `chip: u32`, `room: u64`, `undone: u32`, `state: u32`, `done: u64`, `total: u64`, `reason: u32`, `request: u32`, `flags: u32` |
| 1128 | `service.dev_builtin` | `id: str 64`, `version: str 32` |
| 1129 | `service.dev_native` | `abi_major: u32`, `abi_draft: u32`, `target: u32`, `code_file: str 32`, `safe_mode: u32`, `crashed: str 64`, `last_loaded: str 64`, `pending: u32`, `not_installed: u32`, `room_free: u64`, `room_largest: u64` |
| 1130 | `service.dev_check` | `reason: u32`, `needs_draft: u32`, `bytes: u64`, `signer: str 64`, `key: bytes 32`, `id: str 64`, `version: str 64`, `flags: u32`, `sha256: bytes 32` (optional, ordinal 0; draft 20) |
| 1131 | `service.dev_memory` | `heap_free: u32`, `heap_size: u32`, `largest: u32`, `stack_free: u32`, `stack_size: u32`, `external_free: u32`, `external_size: u32`, `flags: u32` |
| 1132 | `service.dev_wifi` | `state: u32`, `ssid: str 32`, `address: str 45`, `host_name: str 63`, `guests: u32`, `flags: u32` |
| 1133 | `service.dev_network` | `ssid: str 32`, `signal: i32`, `flags: u32` |
| 1134 | `service.dev_bluetooth` | `radio: u32`, `max_links: u32`, `flags: u32` |
| 1135 | `service.dev_bonded` | `device: u32`, `name: str 64`, `kind: u32`, `flags: u32`, `given: str 64` |
| 1136 | `service.dev_interval` | `base_ms: u32` |
| 1137 | `service.dev_power` | `level: u32`, `mode: str 128`, `flags: u32`, `stretch: u32`, `every_ms: u32` |
| 1138 | `service.dev_request` | `request: u32` |
| 1139 | `service.dev_install` | `request: u32`, `kind: u32`, `state: u32`, `status: i32`, `reason: u32`, `flags: u32`, `done: u64`, `total: u64`, `id: str 64` |
| 1140 | `service.dev_not_installed` | `plugin: str 64`, `reason: u32` |
| 1141 | `service.dev_key` | `name: str 32` |

- [D] `dev_device` (interface 6 `env.device()`, `caps()`, `catalog_device()`): `id` the stable
  device id (`xteink-x4`), `model` its name, `catalog` the store's device name (`x4`, empty for
  none), `class` the memory class (0 small, 1 medium, 2 large), `caps` bit 0 touch, 1 network, 2
  Wi-Fi managed by PaperPaw, 3 Bluetooth, 4 firmware updates, 5 speech, 6 sleep, 7 rotation, 8
  colours, 9 button row, 10 system clipboard, 11 frontlight, 12 black and white, 13 power off, 14
  pen, 15 the sleep screen can be shown again while asleep (`command.show_again`, `ui.md` 1.4; the X4
  and X3) (unknown bits ignored, new ones appended); `controls` the power controls (bit 0 radio, 1 CPU
  clock, 2 buttons, 3 frontlight, 4 system saver); `start` 0 unknown, 1 power on, 2 woke, 3 restart,
  4 after a fault; `flags` bit 0 `slept_ms` known. The user's device name is the setting
  `core.device-name` (slot 5).
- [D] `dev_value` (interface 6 `env.status().value(name)`, diagnostics only; Firmware's Q3): named
  values (`usb-pin-high`, `usb-frames`, `frontlight-percent`, `temperature-c`), at most 8, names
  `[a-z0-9-]{1,32}`; a build may add names without a new interface. A value the device cannot read
  now is left out, never sent as 0. `value` is an `i32` (the wire has no `i64`); a reading outside
  its range is left out too, never clamped.
- [D] `dev_firmware` (interface 6 `env.firmware()`): `state` 0 idle, 1 waiting for the user, 2
  installing, 3 installed (restart to use), 4 failed; `reason` the outcome reason (5.5) of the last
  request, 0 while none ended; `request` the request it belongs to; `undone` 1 when the last start
  undid a new image (5.4); `flags` (draft 35; optional, ordinal 0, default 0) the dual-boot facts
  of `docs/dual-boot.md` (interface 6's `.paperpaw/boot.txt` note and `paperpaw.ini` read): bit 0
  `shared`, the setup is declared dual-boot (by the marker or by `paperpaw.ini`), so no firmware
  is installed here (`install_firmware` ends with reason 19); bit 1 `ini_off`, `paperpaw.ini`
  says `dual-boot = off`. A device that has no second app partition to share says 0. Other bits
  are reserved (0), and a reader ignores bits it does not know. No public keys are listed:
  verifying is the host's.
- [D] `dev_native` (interface 6 `env.native()`): `abi_major` 7, `abi_draft` the interface draft,
  `target` the chip id (5 ESP32-C3), `code_file` (`code.ppn`), `safe_mode` 0 none, 1 the last starts
  with code plugins failed, 2 the user held the key at power-on (unknown values as 1);
  `crashed` the plugin that was running when a start failed and `last_loaded` the plugin loaded last
  (each empty when not known, interface 6 `SafeMode`); `pending` how many installed or removed code
  plugins take effect at the next start; `not_installed` how many rows op 14 has;
  `room_free`/`room_largest` the code flash. Interface 6's `fingerprint` and `toolchain` go (the C
  boundary does not depend on the compiler); see section 7 for their replacements in about and the
  store.
- [D] Op 14 `dev_not_installed`: the plugins the start had to install
  (written by the web flasher behind the firmware) and did not, with `reason` 1 other author (code
  signed by another key than the one pinned), 2 damaged or not a plugin file this firmware reads, 3
  revoked (unknown values as 2). Plugin manager names each with its reason, as today. Plugins
  switched off by safe mode stay REG rows (`reg_plugin.state` 4, `problem`).
- [D] `dev_memory` (interface 6 `env.memory()`): a probe walks the stack on the X4, so the host does
  one real probe per 250 ms and answers the cached one inside that window. `flags` bit 0 cached, bit
  1 `largest` known, bit 2 the stack values known, bit 3 external memory present (its values known);
  a field whose bit is clear is 0 and means "not known", never "none free", as diagnostics'
  `memory_lines` shows today.
- [D] Op 15 `dev_key` (interface 6 `InputCaps.keys`, `Buttons::new`): the names of the physical keys
  (`back`, `confirm`, `left`, `right`, `up`, `down`, `power`, the interface 6 `buttons` names), in
  the device's order; an empty list when not known. `caps` bit 9 says only whether a button row
  exists.
- [D] `dev_wifi` (`state` 0 off, 1 on, 2 joining, 3 online, 4 hosting; `flags` bit 0 scanning, 1
  wanted, 2 busy), `dev_network` (`flags` bit 0 secured, 1 known: a password is stored, SEC),
  `dev_bluetooth`, `dev_bonded` (`flags` bit 0 connected, 1 remote keys on; `given` the plugin a
  sensor is handed to, shown only to the plugin bound to the host slot `core.bluetooth`, else
  empty). Op 11 lists to each plugin only the devices given to it, and all of them to the plugin
  bound to `core.bluetooth`, as interface 6's Bluetooth view did (#833); the caller is the one the
  host resolved, at any depth. Wi-Fi, Bluetooth, bonded devices and the power mode (ops 8, 10, 11,
  12) are read from the kernel's own state at each call, for every shell; the shell's host answers
  the rest (the scan list, the power level, readings).
- [D] `dev_power` (interface 6 `env.power()`): `level` 0 normal, 1 saving, 2 offline; `mode` the
  worn power mode (a REG preset id of kind `core.power-mode`, `registry.md` op 16); `flags` bit 0
  automatic, bit 1 online: plugins may use the network for their own work now (interface 6
  `online()`); `every_ms` the interval for `dev_interval.base_ms` stretched by the level (interface
  6 `every(base)`; 0 for no base).

## 3. Commands (slot 15, growth block)

Tags 1564-1592 and 1595 follow UIX's approved commands (1547-1558, 1561-1563) and DOC's (1559,
1560).

| Tag | Record | Fields | Feature |
| --- | --- | --- | --- |
| 1564 | `command.wifi_on` | (none) | `uses.wifi` |
| 1565 | `command.wifi_off` | (none) | `uses.wifi` |
| 1566 | `command.wifi_scan` | (none) | `uses.wifi` |
| 1567 | `command.wifi_join` | `request: u32`, `ssid: str 32`, `password: str 63`, `flags: u32` | `uses.wifi` |
| 1568 | `command.wifi_leave` | (none) | `uses.wifi` |
| 1569 | `command.wifi_host` | `request: u32`, `ssid: str 32`, `password: str 63` | `uses.wifi` |
| 1570 | `command.network_none` | (none) | `uses.wifi` |
| 1571 | `command.go_online` | `for_ms: u32` | `uses.wifi` |
| 1572 | `command.sleep` | (none) | `uses.power` |
| 1573 | `command.power_off` | (none) | `uses.power` |
| 1574 | `command.restart` | (none) | `uses.power` |
| 1575 | `command.wear` | `mode: str 128`, `flags: u32` | `uses.power` |
| 1576 | `command.install_plugin` | `request: u32`, `root: u32`, `path: str 512`, `flags: u32` | `uses.install` |
| 1577 | `command.remove_plugin` | `request: u32`, `plugin: str 64`, `flags: u32` | `uses.install` |
| 1578 | `command.install_firmware` | `request: u32`, `root: u32`, `path: str 512`, `key: bytes 32`, `flags: u32` | `uses.firmware` |
| 1579 | `command.firmware_restart` | (none) | `uses.firmware` |
| 1580 | `command.install_author` | `request: u32`, `author: bytes 32`, `recovery: bytes 32`, `sha256: bytes 32` | `uses.install` |
| 1581 | `command.install_rotation` | `request: u32`, `to: bytes 32`, `signature: bytes 64` | `uses.install` |
| 1582 | `command.trust_revoked` | `plugin: str 64`, `key: bytes 32`, `signature: bytes 64` | `uses.install` |
| 1592 | `command.check_file` | `request: u32`, `root: u32`, `path: str 512`, `kind: u32` | `uses.install` (kind 0), `uses.firmware` (kind 1) |
| 1595 | `command.firmware_dual_boot` | `request: u32`, `mode: u32` | `uses.firmware` |
| 1583 | `command.bt_scan` | `lasting_ms: u32` | `uses.bluetooth` |
| 1584 | `command.bt_stop_scan` | (none) | `uses.bluetooth` |
| 1585 | `command.bt_pair` | `device: u32` | `uses.bluetooth` |
| 1586 | `command.bt_connect` | `device: u32` | `uses.bluetooth` |
| 1587 | `command.bt_disconnect` | `device: u32` | `uses.bluetooth` |
| 1588 | `command.bt_forget` | `device: u32` | `uses.bluetooth` |
| 1589 | `command.bt_give` | `device: u32`, `plugin: str 64` | `uses.bluetooth` |
| 1590 | `command.bt_take_back` | `device: u32` | `uses.bluetooth` |
| 1591 | `command.bt_keys` | `device: u32`, `on: u32` | `uses.bluetooth` |

- [D] One record per action (Firmware's Q2): tags are plentiful in the growth block, each record is
  checked by the generated codec without a per-action table, and a later action is a new record.
- [D] **Requests:** `request` is the sender's own non-zero number; a request number the plugin
  already has waiting is `ERR_INVALID` at submit. The host reserves the request's table entry and
  its kept outcome **at submit** (fallibly; device-wide at most 4 install, removal, firmware or
  check requests and 4 radio requests waiting, and at most 2 open install, removal, firmware or
  check requests per plugin, waiting or not yet told, a restart included, so one plugin never
  takes every place; else `ERR_FULL` for the batch), so an accepted
  request always has room for its outcome and is never dropped later. Outcomes are kept until
  delivered; an install, removal, firmware or check outcome is then readable with op 13 until the
  plugin's next request of the same kind or its stop. A radio outcome (`wifi_done`, 93) is not kept
  after delivery: the callback is called **at most once** per request, and the entry is released
  after it was called, whatever it answered (only `ERR_BUSY` is retried; a failing callback does not
  get the event again). A sender that stopped or did not subscribe is not called and its entry is
  released. A sender that is not started is asked to start for its event at most three times,
  one second apart; then its entry is released and the event is lost, so a plugin that never
  starts does not hold one of the four entries. The current radio state is op 8.
- [D] **Wi-Fi** (interface 6 `WifiCommand`, `NoNetwork`): `join` and `host` need a non-empty `ssid`;
  `host`'s password is 8-63 bytes, `join`'s 0-63; `join.flags` bit 0 remember the password (SEC's
  store, owned by the Wi-Fi plugin). A password is never logged nor shown in a record any other
  plugin reads: both `password` fields are `secret` in `abi.def`, so the generated codec holds them
  as `SecretText`, whose `Debug` shows nothing of them. A newer `join` or `host` from any plugin supersedes a waiting one, whose outcome is
  `wifi_done` reason 4. **No silent network change:** a `join` of a network without a stored
  password, and every `host`, are honoured only within 2,000 ms after a user input or from the
  network manager (`core.network-manager`); else they end at once with `wifi_done` reason 6
  (needs the user). A `join` of a network with a stored password, `wifi_on`, `scan`, `leave` and
  `off` need no input. `go_online` (`for_ms` 1-600,000) is honoured only within 2,000 ms after a
  user input (else `OK` and ignored, logged): no plugin turns the radio on in the background by it.
- [D] **The 2,000 ms input window is the submitting plugin's own.** It counts only a user input
  that went to that plugin: an input record (key, pointer, gesture, widget) delivered to one of its
  callbacks, or the user running one of its actions (a menu entry, a key binding, a slot), and it
  runs from the moment that input was delivered. Input that went to another plugin, to the host or
  to a screen of the host does not open it; neither do events, works, timers or `run_action`
  chains (`screens-input.md` 3) that started without the user. Every 2,000 ms rule of DEV and
  NET (`network.md` 3.2, the offline exception) uses this one window.
- [D] **Power** (`Sleep`, `PowerOff`, `Restart`, `Wear`): commands of a batch apply in order. A
  power command waits until every screen command before it in the same batch (`command.open`,
  `ui.md`, e.g. the sleep slot with `off=1`, as power does today) has drawn its first frame and that
  frame's refresh has ended (the panel idle), then acts; so the e-ink keeps the screen that shows
  the device's real state. If that screen fails to open, the power command still acts, on the frame
  shown. `restart` saves what plugins keep first; `power_off` and `sleep` deliver `suspend` first
  (after the frame). `wear.mode` is a REG preset id of kind `core.power-mode` (`registry.md` ops
  16-18; an unknown id is `ERR_NOT_FOUND` at submit), `flags` bit 0 automatic. While an instance
  guards (`ui.md` 4.3) only the guard's plugin and the host may restart or switch off
  (`ERR_DENIED`); sleep stays open to all.
- [D] **Loop guard.** A plugin cannot keep the device from being used by restarting, sleeping or
  switching off right after every start or wake. A `restart`, `sleep` or `power_off` counts as
  *early* when it is submitted within 30 s after a start or wake and outside the plugin's input
  window (above). The host keeps, per plugin, the number of starts and wakes in a row that ended in
  an early command of that plugin, in a small host file (`.paperpaw/power-guard`, written
  atomically and only when a count changes, so the count survives the restart it guards against
  and a quiet start writes nothing). The guard never fails open: a missing file is all counts 0,
  but a file that cannot be read or a count that cannot be written (card error) refuses that
  plugin's early power commands as from the third, until the count is stored. From the third in
  a row on,
  that plugin's early power commands are refused at submit with `ERR_DENIED` and logged, and the
  plugin is named in the diagnostics (`dev_native.crashed` stays for crashes; the log names it).
  The count goes back to 0 at a start or wake that ends its 30 s without an early command of the
  plugin, and at any user input to that plugin. The user's own power actions (the Power key, the
  host's menus) never count and are never refused, and the 8 s Power escape stays as it is.
- [D] **The Power-key escape (G12) can never be blocked.** No power mode, `controls` bit (buttons,
  CPU clock), guard, filter, key map, confirmation or plugin stops the Power key or its 8 s hold.
  The hold is timed by a timer or the key's interrupt, not polled from the main loop, so a 64 KiB
  flash erase step or a long callback cannot stretch or hide it. An escape during a firmware write
  leaves the old slot starting (no switch, the new slot's first word missing); during a plugin swap
  or a card move the journals finish or roll back at the next start (5.4). [Q] Firmware: confirm the
  X4's hold timer is not main-loop polled today, else this is a Firmware fix with DEV.
- [D] Batch limits: at most one power command (1572-1575) and one firmware command per batch, at
  most two Wi-Fi commands, at most one `install_author` and 6 `install_rotation` per request (so
  `install_plugin`, its author and its rotations fill one 8-record batch; Beta 3's store
  `MAX_STEPS` was 8, and a longer chain ends with reason 6), both after their `install_plugin` in
  the same batch, at most 8 `trust_revoked` per batch (the batch cap; more go in later batches)
  (`ERR_INVALID` beyond or out of place).
- [D] **Network manager** (Firmware's Q7): `event.network_wanted`/`idle` go only to the plugin the
  user chose as network manager, the host setting `core.network-manager` (a plugin id; the Wi-Fi
  plugin by default; REG-visible and resettable). Without one they go nowhere and network work waits
  for the user.

## 4. Events

| Tag | Record | Fields |
| --- | --- | --- |
| 71 | `event.wifi_changed` (EVT) | as in `core-events.md` |
| 72 | `event.power_changed` (EVT) | as in `core-events.md` |
| 70 | `event.plugins_changed` (EVT) | as in `core-events.md` |
| 92 | `event.wifi_scanned` | `now_ms: u64`, `networks: u32` |
| 93 | `event.wifi_done` | `now_ms: u64`, `request: u32`, `ssid: str 32`, `status: i32`, `reason: u32`, `state: u32` |
| 94 | `event.network_wanted` | `now_ms: u64` |
| 95 | `event.network_idle` | `now_ms: u64` |
| 96 | `event.firmware_changed` | `now_ms: u64`, `request: u32`, `state: u32` |
| 97 | `event.install_done` | `now_ms: u64`, `request: u32`, `kind: u32`, `status: i32`, `reason: u32`, `flags: u32`, `id: str 64` |
| 98 | `event.bluetooth` | `now_ms: u64`, `kind: u32`, `device: u32`, `name: str 64`, `device_kind: u32`, `signal: i32`, `reason: u32` |

- [D] 92, 94-96 are hints (coalesced per kind; read again with section 2). 93 and 97 are **edges
  kept like answers** (`ui.md` 3.2) in the room reserved at submit (section 3).
- [D] 96 goes only to the plugin whose request it is, at most once every 250 ms while the image is
  written and at each change of its state; any other plugin reads the state with op 3. 97 is never
  dropped: it waits in the reserved room until its plugin can be called (not inside one of its
  batches, not while it is busy), and counts as delivered once that callback was called, whatever
  it answered, or at once for a plugin that stopped or did not subscribe; op 13 then reads it.
- [D] 93 ends every `join` and `host` exactly once, success or failure, and goes to the plugin whose
  request it answers (`request`), like 97 for installs. `status` `OK` with `reason` 0 and `state`
  the `dev_wifi` state reached (3 online, 4 hosting) when the network is up; else the error with
  `reason` (1 not found `ERR_NOT_FOUND`, 2 password `ERR_DENIED`, 3 timeout `ERR_TIMEOUT`, 4
  superseded `ERR_CANCELLED`, 5 unsupported here `ERR_UNSUPPORTED`, 6 needs the user `ERR_DENIED`,
  0 other `ERR_IO`; unknown reasons as 0) and `state` 0. The edge says what happened to *this*
  request at the moment it ended, so it stays true when a later `join`, `leave` or a dropped
  network has changed the radio before the sender handles it; 71 (to all, coalesced) and op 8 say
  what holds now. A join the host started itself (a remembered network at wake) has `request` 0:
  its failure goes to the network manager, its success only raises 71.
- [D] 97 ends every install, removal and firmware request exactly once and goes to its sender only:
  `kind` 0 plugin install, 1 firmware, 2 removal, 3 file check; `status` OK or the error of 5.5 with
  its `reason`; `flags` bit 0 the plugin's data was kept (removal), bit 1 takes effect at the next
  start; `id` the plugin. `kind` 3 ends a `check_file` (5.1). A removal or install is reported
  **only once done** (5.2), never when queued. 98 goes to the plugin bound to `core.bluetooth`.
- [D] **98's values.** `kind`: 1 `changed` (radio state or bonded list: read again; no other field),
  2 `found` (a scan result: `device`, `name`, `device_kind`, `signal`), 3 `scan_ended`, 4
  `connected` (`device`), 5 `disconnected` (`device`, `reason`; 0 when the plugin asked for it), 6
  `paired` (bonded and given to the plugin that asked: `device`, `name`, `device_kind`), 7 `done` (a
  command without a result of its own: `device`), 8 `failed` (`device`, 0 for none, and `reason`).
  `device_kind`: 0 other, 1 keyboard, 2 remote, 3 sensor, 4 phone. `reason`: 0 other or none, 1
  radio off, 2 not allowed, 3 not found, 4 busy, 5 timeout, 6 declined (pairing confirmation), 7
  link lost, 8 attribute error (not used in 1.0), 9 held by another plugin, 10 unsupported here.
  A plugin treats a value it does not know as 0, never as an error.
  `firmware_changed` comes at most every 250 ms while installing (at most once per written block,
  5.3).

## 5. Installing plugins and firmware

### 5.0 The host confirmation

- [D] **Only the user answers it** (decisions 132, 134, 124). While a host confirmation shows,
  input goes from the device straight to it: no UIX input filter sees it, no raised or replaced
  input (`raise_input`, filter `take`/`replace`) reaches it, no key map or action runs, and no
  overlay, notification or plugin screen is drawn over it. Focus starts on **No** (Cancel); input
  that arrives within 500 ms after it is shown, and presses queued before it, are dropped, so no
  earlier press answers it. Touch counts only inside its own buttons.
- [D] **Ending:** yes, no (reason 2, `ERR_DENIED`), dismissed by Back or Power short press
  (reason 3, `ERR_CANCELLED`), or **10 minutes without an answer** (reason 3, decision 132's
  timeout); each discards the stage and changes nothing. Sleep while it shows dismisses it. One
  confirmation shows at a time; others wait in the job queue. While a guard is up (`ui.md` 4.3: the
  lock) a confirmation waits until the guard ends; it is never drawn over the lock.
- [D] **Its words are the host's** (with Plugin, en/de): the asking plugin's name; what is installed
  or removed (id, name, version, signer or key fingerprint, `uses.*` as on the store page); for an
  update "older" or "the same version" when it is not newer (`flags` bit 1 of `install_plugin`,
  bit 0 of `install_firmware`); for a foreign firmware the four points of 5.3.

### 5.1 Checking before asking

- [D] `check_file` (`root` 0 the caller's Data or 1 with `uses.storage`, `path` a `.ppn` file, a
  plugin folder or a firmware image, `kind` 0 plugin with `uses.install`, 1 firmware with
  `uses.firmware`, else `ERR_DENIED` at submit; Firmware's Q4) starts a check: a job of the queue
  (5.2), so one at a time device-wide, run from the main loop in bounded steps (a 2-3 MB firmware
  image takes seconds on the X4, never inside one callback); signature verification (Ed25519,
  SHA-256) runs in host frames inside the #254 frame budget. It ends with `install_done` kind 3
  (`status` OK once the check ran, `reason` its verdict), and op 6 reads the result by `request`
  (`ERR_NOT_FOUND` for an unknown one, `ERR_BUSY` while it runs) until the plugin's next check. It
  runs the loader's own checks without changing anything: `reason` 0 fits, else the reason of 5.5
  that an install would end with; `needs_draft` for reason 10 is the interface revision the file
  needs (its header's `needs_minor`) when the refusal is a newer revision than the host's, and 0
  when it is a newer format or interface major (the file names no number of this interface; the
  name `needs_draft` is interface 6's), 0 for every other reason; `bytes`; `signer` the key's name
  (empty for a key the device does not know); `key` the signing key and `sha256` the code's (plugin)
  or the image's (firmware) digest, both empty when unsigned (`sha256` then absent); `id`,
  `version`; `flags` bit 0 data plugin (no code), bit 1 this id's author key is pinned here and is
  `key`, bit 2 this id is pinned to another key (an install needs a rotation, 5.2), bit 3 the image
  is signed by PaperPaw, bit 4 a foreign image (another firmware than PaperPaw), bit 5 the image
  leaves out plugins built in now (op 16 lists them). The store and update show it before they ask;
  they never parse `.ppn` headers or update trailers themselves. A check is advice for the view: an
  install checks the staged copy again (5.2), whatever a check said.
- [D] **What an update leaves out** (interface 6 `Update::leaves_out`, update's "update without
  them" choice): op 16 `leaves_out` lists, for the caller's last finished firmware check (`kind` 1),
  the plugins built into the running image (op 4's rows: `id` and the running `version`, in op 4's
  order) that the checked image does not have built in, 32 rows a page, then `end`. Its input is a
  `reg_query` as REG's lists take it (`scope` empty, else `ERR_INVALID`; `cursor`; `generation` 0 on
  the first page, then the `end`'s, which is the check's `request`: a cursor from an earlier check
  is `ERR_STATE`). No finished firmware check of the caller: `ERR_NOT_FOUND`; one running:
  `ERR_BUSY`; a foreign image (`flags` bit 4), whose built-ins PaperPaw cannot read:
  `ERR_UNSUPPORTED`; none left out: no rows (and `flags` bit 5 clear). The host keeps one bit per
  running built-in, set during the check's bounded steps as it reads the image's list (at most 12
  bytes for 96 built-ins, no list of names), until the caller's next check. Which of them come back
  as files (fetched builds) and why the server says one is missing stay the plugin's: the host knows
  only the two images.

### 5.2 Plugins

- [D] `install_plugin` (interface 6 `InstallPlugin`, `LoadPlugin`, `install::adopt`): the plugin
  downloaded a plugin folder into `path` (its root 0, or root 1 with `uses.storage`), as
  interface 6 installs it: the id is the `plugin.ini` id, else the folder's name (`core` is
  refused), name and version come from `plugin.ini`, the code is the folder's `code.ppn`, and the
  `uses.*` shown come from that code's native metadata. A bare `.ppn` path is reason 4
  (`ERR_INVALID`). `flags` bit 0 replace an installed plugin of the same id (an update), bit 1
  allow an older version, bit 2 from a catalog: a store's install, of a code or a data plugin.
  Bit 2 only marks the version for the store's update offers (`registry.md`, `reg_plugin.flags`
  bit 5); it grants no trust and changes no check (a code plugin's trust is its evidence, below).
- [D] **Trust evidence** (store `trust.rs` `Named`, `expected`, `follow`, `revoked.rs`): the
  catalog's word for a code plugin travels in the same batch as `install_author` (the author key the
  catalog names, the recovery key it names for a first install, empty for none, and the code's
  expected `sha256`, empty for none) and up to 6 `install_rotation` (the catalog's rotation
  statements, in the author's order). `author` is exactly 32 bytes; `recovery` and `sha256` are 0 or
  exactly 32 (the decoder takes 0-32, so the host refuses 1-31 bytes with `ERR_INVALID`). The host
  applies the store's rules itself: an id pinned to the signing key installs; an id pinned to
  another key installs only if the rotations lead from the pinned key to the signing key, each
  checked against the pinned recovery key (steps before the pinned key are skipped, as `follow`),
  else reason 6 key changed; a new id installs only if `install_author.author` is the signing key
  (reason 5 not the author), pinning it and `recovery`; a signing key revoked for that id never
  installs (reason 7). A code digest other than `sha256` is reason 18. Without evidence (a plugin
  the user sideloads through plugin manager) a new id is pinned to its signing key once the user
  confirms the key's fingerprint, shown by the host as "not from a catalog"; a pinned id still needs
  its rotations. Pins and rotations change **only when the install commits** (the journal of 5.4),
  never at a check, a declined prompt or a failure, so a declined update leaves the installed plugin
  loading as before.
- [D] `trust_revoked` (store `revoked.rs`, `keys::keep_revoked`): a revocation the store's library
  lists, checked by the host against the revoked key itself or the plugin's pinned recovery key, and
  kept only if it holds (never taken off); one that does not hold is dropped with a log line, the
  batch's others stay. It answers nothing: a plugin whose key it revokes shows REG `problem`
  revoked.
- [D] **What the user sees is what installs.** The host copies the source into its own stage
  `plugins/.<id>.part` (outside every root a plugin reaches) while hashing it, runs all checks of
  5.1 and the trust rules on the stage, and only then **asks the user** (decision 132) in a
  host-drawn confirmation naming the asking plugin, the plugin's id, name, version, signer (or the
  key's fingerprint) and what it declares (`uses.*`, as the store page). On yes it swaps the stage
  it checked (journal, 5.4); a change to the source after the copy has no effect. Declined is reason
  2 (`ERR_DENIED`), dismissed reason 3 (`ERR_CANCELLED`); the stage is removed. Code plugins load at
  the next start (`install_done.flags` bit 1, `dev_native.pending`). While a guard is up the
  confirmation waits (`ui.md` 4.3).
- [D] **Trusted-installer grant** (decision 132 as decided, unchanged from interface 6; Senior's
  should-fix 7, settled by Manager on 2026-11-07): the user may allow one plugin to install and
  update plugins, fonts and data plugins without asking each time, the host grant
  `core.grant.install.<asking plugin>` (a host setting, off by default, granted only in a host
  confirmation of its own, REG-visible and revocable). The grant skips the prompt only; every check
  and trust rule of this section still applies, and it never covers firmware (decision 134),
  removals (decision 124), a sideload without catalog evidence (the key fingerprint must be
  confirmed) or a plugin that would declare a `uses.*` feature the installed version did not (the
  user sees the new features).
- [D] `remove_plugin` (`RemovePlugin`): removes an installed plugin (not one built into the image:
  reason 15) after **one host confirmation** (5.0) with three answers: remove and keep its data (the
  focus after No), remove with its data, cancel (decision 124, its safety rules: removal only of
  `.paperpaw/plugins/<id>/` resolved from a validated id, by a journalled card move into
  `.removing`, `library.md` 6). It waits while a guard is up, so no plugin removes the lock under
  it. The plugin's instances are closed first; a loaded code plugin's flash room returns at the next
  start (`flags` bit 1). Its `install_done` (kind 2) comes only once the folder is renamed away and
  the plugin is gone from REG op 6 (event 70 raised), with `flags` bit 0 when the data was kept;
  declined or dismissed as for installs, and nothing is removed. `flags` reserved.
- [D] **Secrets a removal left** (decision of 2026-11-16, #290): where a removal with its data
  could not erase the plugin's secrets (its id kept in `plugins/.unforgotten`), an install of the same id is
  always asked about (the trusted-installer grant never skips it), and the confirmation says the
  old data is erased first. On yes the host erases them before anything is swapped in; a host that
  cannot is reason 16 and nothing installs. Declined (2) or dismissed (3), nothing installs either,
  so no plugin of the id ever starts with the old secrets.
- [D] **One job at a time:** the host runs install, removal and firmware jobs one after another in
  submit order (one I/O buffer, 6.2). Firmware installs and code-plugin installs both write the code
  flash, so neither starts while the other runs; a request waits its turn (`dev_install.state` 0
  waiting), it is not refused. `dev_install.state` (op 13): 0 waiting in the queue, 1 running
  (checking, asking, writing or reading back), 2 ended, with `status` and `reason` the outcome.
  Only firmware jobs report progress (`dev_install.done` and `total`, `firmware_changed`);
  install, removal and check jobs have no progress marks: their `done` and `total` stay 0 until
  they end.

### 5.3 Firmware

- [D] `install_firmware` (`FirmwareCommand::Install`, `InstallForeign`): an image on the card
  (`root` 0 or 1 with `uses.storage`); `flags` bit 0 allow an older or the same version, bit 1
  foreign (another firmware than PaperPaw, unsigned, checked as the boot loader would start it).
  The confirmation for a foreign image says, in the host's words (Firmware's four points): it is
  another firmware, not PaperPaw, and PaperPaw does not start again by itself; PaperPaw does not
  undo it, and getting back is up to the other firmware or a flash tool (the web flasher works);
  PaperPaw stays in flash and its files on the card are not touched; it is not signed, only
  checked as the boot loader would start it (segments, checksum, hash, chip, board tag). It shows
  the image's own project name and version as read from the image. It always asks, whatever
  grant (decision 134).
- [D] **Keys** (update `page.rs` `Signer::Unknown`, `firmware.rs`): an image signed by a PaperPaw
  key installs with the normal confirmation. An image signed by another key (e.g. the user's own
  builds) installs only when `key` names exactly that key **and** the user accepts it in the host's
  confirmation, which shows the key's fingerprint and says it is not PaperPaw's; acceptance holds
  for this install only, as in interface 6; else reason 9 unknown key. Unsigned PaperPaw images are
  reason 8. A revoked key (reason 7) is a separate case: it never installs, acceptance or not;
  firmware has no revocation list today, so this reason is reserved for one.
- [D] **Bound to what the user saw:** the host checks the image (chip, size, version, signer) and
  hashes it, then **always asks the user** (decision 134, whatever grant there is). On yes it writes
  the other slot from its main loop in bounded steps of one 64 KiB erase block each (erase, then
  write; the card layer feeds the watchdog on each block it reads), hashing and checking the
  signature over the bytes as they are written, and reads the slot back once (below). An image whose
  digest differs from the one asked about ends with reason 18 and the slot stays unbootable. The
  image's first word is written last, after the check passed, so a half-written slot never looks
  bootable; then the slot to start is chosen in one entry. `firmware_changed` reports progress,
  `install_done` the end.
- [D] **Restarting is a firmware change too** (decision 134; Senior R2 on #733):
  `firmware_restart` is taken only from the plugin whose install waits for its restart
  (`dev_firmware.state` 3); from any other plugin it is `ERR_DENIED` at submit, and with no image
  waiting `ERR_STATE`. The host then **always asks** again, whatever grant: its confirmation (5.0)
  names the image as the install's did (project name and version, PaperPaw or foreign; for a
  foreign image the first two of the four points again). Yes restarts into it. No, dismissed or
  10 minutes end the request with `install_done` kind 1, reason 2 or 3, and change nothing: the
  image stays installed and waiting, and the device starts it at its next start as chosen.
- [D] **Flags:** `install_firmware.flags` bits other than 0 and 1 are `ERR_INVALID` at submit and
  nothing is queued (Senior R1). No flag skips or shortens a confirmation: every grant still asks.
- [D] **Foreign or PaperPaw, from the image.** The check finds out for itself whether an image is
  another firmware's (`dev_check.flags` bit 4). Where that differs from `install_firmware.flags`
  bit 1 the install ends with reason 4 before any confirmation: the write takes the checked
  answer, never the flag alone.
- [D] **Who holds what.** The core (`firmware_install`) holds all the state, in RAM and fallibly:
  the job, one check result per plugin (its facts and one bit per built-in plugin the image
  carries; at most 4 plugins, kept until the plugin's next check or its stop), the waiting image of
  state 3 and the gates of this section. The shell gives one platform trait,
  `paperpaw_platform::FirmwareHost`, which the core drives in bounded steps from its main loop,
  never inside a callback: the running image's facts, a check, a write bound to the digest and the
  key the user accepted, the read-back, the commit and the restart. There is no staged copy: the
  image stays at the plugin's path. The trial and the good start (5.4) are the shell's alone.
- [D] **Busy and pending:** a second firmware request while one runs waits its turn (5.2); one sent
  while an installed image, PaperPaw's or foreign, waits for its restart (`dev_firmware.state` 3)
  ends with reason 21 restart pending (`ERR_STATE`), a status of its own and not `ERR_BUSY`. The
  waiting image is kept with the plugin and request that installed it, so only that plugin may ask
  for the restart; a check may still run while it waits.
- [D] **Dual boot** (draft 35; interface 6 update's *This is not a dual-boot setup* and *Detect
  dual boot again*, `docs/dual-boot.md`): `firmware_dual_boot` with `mode` 1 `off` or 0 `auto`
  (others `ERR_INVALID` at submit, nothing queued) is a firmware request: it waits in 5.2's queue,
  behind a running install too, one at a time. Where nothing would change (mode 1 and
  `paperpaw.ini` says `off` already; mode 0 and it does not say `off`) it ends at once with
  reason 0, asking and writing nothing.
  - **Mode 1 always asks** (5.0, whatever grant; focus on **No**; the asking plugin's name as 5.0
    shows it, its display text cleaned). In the host's words: PaperPaw then treats this device as
    its own, so its next update **erases the other firmware**, which the reader cannot bring back
    (only the tool that set the two up can). Yes writes `dual-boot = off` and restarts, so the
    start no longer reads the setup as declared; no, dismissed or 10 minutes end it with
    `install_done` kind 1, reason 2 or 3, changing nothing.
  - **Mode 0 does not ask and does not restart** (it is the safe direction, and a plugin must not
    restart the device by it): it writes `dual-boot = auto` and ends with reason 0. It protects at
    once (Senior R4): from the write on, the host treats the setup as declared until the next
    start (`dev_firmware.flags` bit 0 set, `install_firmware` reason 19), and that start detects
    again.
  - **Order and failure:** the host reads `paperpaw.ini` whole, at most 16 KiB (16,384 bytes) of
    UTF-8 (a file it cannot read whole, a longer one or one that is not UTF-8 ends with reason 16
    and nothing is written), sets `dual-boot` in the last
    `[firmware]` section (adding the section if there is none, the rest of the file as it was),
    writes it whole and atomically as settings saves are, and only then removes
    `.paperpaw/boot.txt` (mode 1): a power cut at any point leaves the setup declared, the safe
    side. A failed write ends with reason 16 and no restart.
  - While an installed image waits for its restart (`dev_firmware.state` 3) it ends with reason
    21; a device without dual-boot handling (no second app partition to share) with reason 19.
    Once an install found the setup declared, it stays declared until the next start whatever the
    file says (`docs/dual-boot.md`).
  - **Closed to plugins:** `paperpaw.ini` and `.paperpaw/` are not reachable through root 1
    (`files.md` 1.1), so this command is the only way a plugin changes the `[firmware]` section.
- [Q] (Firmware, owner device) the real time of one 64 KiB step and the card's read speed decide
  whether a progress redraw every 5 % stays smooth; a device-checklist item.

### 5.4 Power loss and card failure

- [D] **Plugins:** the swap writes a journal entry (`plugins/.journal`: the id, the stage path, the
  old folder's new name, the pins and rotations to take), synced, then moves old → `.old-<id>`,
  stage → `<id>`, takes the pins, removes `.old`; at start, after the card's own move records are
  settled, the host finishes or rolls back each journalled step, so the plugin is the old one or
  the new one with its matching pins, never a mix. Every one of these renames, and the removal's
  move into `.removing`, is the card's journalled move shared with LIB (`library.md` 6:
  `paperpaw-fat` `move_entry`, the old entry unlinked without freeing its clusters, so a cut never
  leaves two entries freeing one chain), and the tests replay a cut after each block write.
- [D] **Firmware:** the running slot is never written; a cut while writing leaves the old slot
  starting, since the new slot's first word is still missing. The new image runs as a trial,
  the firmware's own (`crates/paperpaw-x4/src/updates.rs`); the espflash boot loader does not roll
  back, and the doc does not rely on it:
  - the new image marks itself on trial (OTA data `PendingVerify`, in flash, so it survives a power
    cut) as early as the shell can, **before the kernel, the display and the card** (Senior's #1033
    remark: the trial check comes first at boot);
  - it becomes valid after 30 s of run time summed across starts (`TRIAL_MS`); a clean sleep or
    restart pauses and resumes the count and keeps the trial;
  - a start that finds the trial still open (the last run ended uncleanly: a panic, a watchdog or
    brown-out reset, the 8 s Power escape) marks the image bad and restarts into the previous slot,
    which reports `dev_firmware.undone`; so the first unclean end during the trial rolls back;
  - [D] **a good start**: the 30 s count begins only once the home screen's first frame is shown,
    so an image that never gets there cannot become valid (today the count runs from the shell's
    start: a Firmware change with DEV). A failing code plugin cannot fail the trial: safe mode (op
    5) handles it.
- [D] **What the trial cannot catch:** an image that dies before its trial mark is set (in the boot
  loader's hand-off or its first instructions) cannot undo itself and starts again and again until
  the web flasher restores PaperPaw; the confirmation for a new firmware says, in plain words, that
  the web flasher is the way back if the device stops starting.
- [D] **Downgrades:** an older image that predates the trial (any image from before interface 7)
  has no rollback once it runs; the confirmation for an older version says so in addition to
  "older", and that the web flasher is the way back.
- [D] **Read-back:** before the first word is written, the host reads the written slot back and
  hashes it against the confirmed digest (one pass over the flash in the same bounded steps,
  cheap next to writing), so a flash write fault is reason 18 and the slot stays unbootable,
  instead of being left for the trial to catch.
- [D] **Foreign images** never run PaperPaw's trial, so they are final at the switch: the slot is
  chosen as valid, no rollback follows, and PaperPaw's slot stays untouched in flash (Firmware,
  from the code). An older signed PaperPaw image (`flags` bit 0) runs the trial as any other and is
  named "older" in the confirmation.
- [D] **Card:** a missing or failing card during a check or a copy ends with reason 16
  (`ERR_IO`) and nothing changes; a full card reason 17 (`ERR_NO_SPACE`).

### 5.5 Outcome reasons

One list for `dev_check.reason`, `dev_install.reason`, `dev_firmware.reason` and
`install_done.reason` (store `Refusal` and interface 6 `InstallFailure` map onto it one to one);
unknown values read as 1.

| Reason | Meaning | Status |
| --- | --- | --- |
| 0 | none (fits, or done) | `OK` |
| 1 | other | `ERR_IO` |
| 2, 3 | declined, dismissed | `ERR_DENIED`, `ERR_CANCELLED` |
| 4 | damaged, or not a file this firmware reads | `ERR_INVALID` |
| 5, 6, 7, 8, 9 | not the author, key changed, revoked, unsigned, unknown key not accepted | `ERR_DENIED` |
| 10, 11, 12 | needs a newer interface (`needs_draft`), built for an older one, another chip | `ERR_UNSUPPORTED` |
| 13 | no room in the code flash or the slot | `ERR_NO_SPACE` |
| 14 | older or the same version, not allowed | `ERR_UNSUPPORTED` |
| 15 | id taken (built in, or another source's) | `ERR_DENIED` |
| 16, 17 | card error, card full | `ERR_IO`, `ERR_NO_SPACE` |
| 18 | content changed since checked or asked | `ERR_STATE` |
| 19 | not on this device | `ERR_UNSUPPORTED` |
| 20 | the host stopped it (shutdown, card swap) | `ERR_CANCELLED` |
| 21 | an installed firmware waits for its restart | `ERR_STATE` |

## 6. Sizes and memory

### 6.1 Every record fits its limit

| Record or reply | At its caps | Limit |
| --- | --- | --- |
| `dev_device` | 1 + 66 + 66 + 34 + 4 + 8 + 4×4 + 8 + 4 + 4 = 211 | 4,096 |
| `dev_value` × 8 + `end` | 8 × (1 + 34 + 4 + 5) + 30 = 382 | 4,096 |
| `dev_firmware` | 1 + 66 + 34 + 4×4 + 8×3 + 4×2 + 4 = 153 | 4,096 |
| `dev_builtin` page (ops 4, 16) | 1 + 66 + 34 + 5 = 106; 32 rows + `end` = 3,422 (96 built-ins: 3 pages) | 4,096 |
| `dev_native` | 1 + 4×3 + 34 + 4 + 66×2 + 4×2 + 8×2 = 207 | 4,096 |
| `dev_check` | 1 + 4 + 4 + 8 + 66 + 34 + 66 + 66 + 4 + 34 (`sha256`, absent when unsigned) = 287 | 4,096 |
| `dev_install` | 1 + 4×6 + 8×2 + 66 = 107 | 4,096 |
| `dev_not_installed` × 32 + `end` | 32 × (1 + 66 + 4 + 5) + 30 = 2,462 | 4,096 |
| `dev_key` × 32 + `end` | 32 × (1 + 34 + 5) + 30 = 1,310 | 4,096 |
| `dev_network` × 32 + `end` | 32 × (1 + 34 + 8 + 5) + 30 = 1,566 | 4,096 |
| `dev_bonded` × 16 + `end` | 16 × (1 + 4 + 66 + 8 + 66 + 5) + 30 = 2,430 | 4,096 |
| `command.install_plugin` | 1 + 4 + 4 + 514 + 4 + 5 = 532 | 4,096 |
| install with full evidence | 532 + `install_author` (1 + 4 + 34×3 + 5 = 112) + 6 × `install_rotation` (1 + 4 + 34 + 66 + 5 = 110) = 1,304 | the 4,096-byte batch |
| `command.install_firmware` | 1 + 4 + 4 + 514 + 34 + 4 + 5 = 566 | 4,096 |
| `command.check_file` | 1 + 4 + 4 + 514 + 4 + 5 = 532 | 4,096 |
| `trust_revoked` × 8 | 8 × (1 + 66 + 34 + 66 + 5) = 1,376 | the 4,096-byte batch |
| `event.install_done` | 1 + 8 + 4×5 + 66 + 5 = 100 | the 1.1 KB event buffer |
| `event.bluetooth` | 1 + 8 + 4×2 + 66 + 4×3 + 4 = 99 | the 1.1 KB event buffer |

### 6.2 Memory (X4)

- Replies: on the host scratch, freed after the call; nothing kept per plugin.
- The memory probe's cached answer: 32 bytes.
- Requests: at most 4 install, removal, firmware or check requests (about 48 bytes each plus the
  kept `install_done`, 104 bytes) and 4 radio requests (about 72 bytes with the kept `wifi_done`)
  device-wide, reserved at submit: about 0.9 KiB at most.
- Trust evidence of waiting requests: one fixed pool of 2 KiB device-wide (a full chain is 1,000
  bytes), taken at submit (`ERR_FULL` beyond); usually 0 or 100 bytes.
- One 4 KiB I/O buffer, shared by the copy, the hashing and signature check, and the firmware
  writer (today's OTA path uses one buffer for its verify and page work), allocated only while a
  job runs; jobs run one at a time (5.2).
- The confirmation: host-drawn over the screen with the host's own text, about 1 KiB while shown.
- **X4 worst case for DEV's host side: about 8 KiB** (I/O 4 + evidence pool 2 + confirmation 1 +
  requests 0.9) while an install runs with full evidence waiting; about 5 KiB for a firmware
  install; nothing when idle. All fallible: today's OTA buffer is an infallible `Box::new`
  (`updates.rs:532`), which Firmware makes fallible with DEV (section 9). An activation-gate item
  beside UIX, DOC and LIB.

## 7. Interface-6 calls and their interface-7 form

| Interface 6 | Interface 7 |
| --- | --- |
| `env.device()` (id, name, memory class), `env.caps()`, `env.catalog_device()`, `env.started()` | op 1 |
| `env.device().input` (`InputCaps.keys`, `Buttons::new`) | op 15; op 1 `caps` bits 0, 9, 14 |
| `env.status().value(name)` | op 2 |
| `env.firmware()` (`version`, `project`, `chip`, `room`, `undone`, `state`, `plugins`) | ops 3, 4; event 96 |
| `firmware::Update::leaves_out` (update's "update without them") | command 1592 (kind 1), op 16; `dev_check.flags` bit 5 |
| `env.native()` (`safe_mode`, `not_installed`, code room, `file`), `fingerprint`, `toolchain` | ops 5, 14 (fingerprint and toolchain go, see below) |
| `store/trust.rs` `check_file`, `native::read_header`, `room.rs`, `verdict` | command 1592, op 6; commands 1580-1581 |
| `keys::accept_rotation`, `keys::keep_revoked`, `revoked.rs` | commands 1581, 1582 (host-checked, taken at commit) |
| `env.memory().read()` | op 7 |
| `env.wifi()`, `Command::Wifi(..)`, `NoNetwork`, `WIFI_*`, `NETWORK_WANTED`/`IDLE` | ops 8, 9; commands 1564-1570; events 71, 92-95 |
| `Command::GoOnlineFor` | command 1571 (`GoOnline` not carried) |
| `env.power()` (`level`, `mode`, `automatic`, `stretch`, `online`, `every`), `Command::Wear`, `POWER_CHANGED` | op 12; command 1575; event 72 |
| `Command::Sleep`, `PowerOff`, `Restart` | commands 1572-1574 |
| `Command::InstallPlugin`, `LoadPlugin`, `install::adopt`, `Installer` | command 1576, event 97 |
| `Command::RemovePlugin` | command 1577, event 97 |
| `Command::SetPluginEnabled`, `env.plugins()`, `PLUGINS_CHANGED` / `REQUESTED` / `ANSWERED` | REG (commands 1543-1545, op 6, events 70, 77, 78) |
| `Command::Firmware(Install, InstallForeign, Restart)`, `FIRMWARE_CHANGED` | commands 1578, 1579; events 96, 97 |
| `env.bluetooth()`, `Command::Bluetooth(..)`, `BtEvent`, `BLUETOOTH_CHANGED` | ops 10, 11; commands 1583-1591; event 98 |
| `env.random()`, `env.secrets()`, `env.work()` | SEC, ASY |

- [D] **Fingerprint and toolchain are a deliberate change, not parity** (about `lib.rs:222-229`, the
  store's catalog and queue): about shows "plugin interface 7, draft N, <target>" from op 5 in their
  place, and the store selects catalog entries by `abi_major`, `abi_draft`, `target` and
  `code_file`. The store site's interface-7 catalog ships with the interface-7 firmware (a release
  gate with Web, in the release notes), so no device sees a catalog it cannot filter; Plugin changes
  the about labels and their en/de texts in the port.

## 8. What each device delivers

Firmware's table (`dev-family-228.md` section 8) holds; in short: the X4 has Wi-Fi (station and
access point, one TLS session), sleep, power off, firmware updates (two slots), the memory probe and
no Bluetooth (`ERR_NOT_FOUND` / ignored); the X4 Pro adds Bluetooth and touch but runs no native
plugins today; the desktop emulates; Android has no Wi-Fi, Bluetooth or firmware of PaperPaw's own
and restarts only. Plugins read `caps` and degrade, as in interface 6; requests end with reason 19
where a capability is missing.

## 9. Hand-offs (after approval)

- **Kernel:** records, `core.device@1` schema, the five features, REG's `answer_plugin` change, this
  document final.
- **Core:** the service over the kernel's device state, the command arms and feature checks, the
  request table with reservations and kept edges, the job queue, the stage-then-ask install with
  the trust rules moved from the store (pins, rotations, revocations taken at commit), the plugin
  install journal with fault-injection tests (with the uninstall data removal of decision 124), the
  host confirmation with its input isolation, 500 ms guard and 10-minute timeout (with Plugin for
  the words), the grant setting, the power ordering after screen commands, the Wi-Fi user-input
  rule, `check_file` as a queued job.
- **Firmware:** the X4 adapters (Wi-Fi, power, memory probe, values, keys), the firmware writer in
  64 KiB steps with digest binding and its trial, the fallible OTA buffer (`updates.rs:532`, offered
  by Firmware), the good-start point of the trial (count from the home screen's first frame), the
  read-back hash pass, foreign images final at the switch, the Power hold timer off the
  main loop (G12), the device checks with the owner (install confirmation, Wi-Fi join/host, sleep,
  power off, restart, step time and card read speed).
- **Services:** the SDK facade (typed reads, command builders, install request helpers with
  evidence).
- **Web:** the store catalog keyed by `abi_major`, `abi_draft`, `target`, shipped with the firmware
  (section 7).
- **Plugin:** the ports: power, wifi, bluetooth, diagnostics, plugin-manager, store, update,
  transfer, fonts-browser, setup, about, kosync, weather, settings, reading-goal. The store keeps
  fetching, its size bounds (catalog, pages, screenshots) and its queue; it hands evidence and
  revocations to the host instead of deciding.
