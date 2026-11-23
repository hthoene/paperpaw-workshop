# Interface 7 family ASY: deferred and background work

Contract for #228 (assignment #1088), reviewed with `sockets.md` (SOCK). Items marked [D] are
proposed decisions, [Q] open questions for Plugin, Firmware and Senior. Inputs: an audit of
interface 6's work queue (the SDK's `work.rs`, `builtin/events.rs`; the kernel's `work.rs`,
`work/runs.rs`, `network.rs`, `commands.rs`; the X4 shell's `firmware.rs`, `power.rs` and
`paperpaw-x4`'s `sleeping.rs`) and of the 12 first-party plugins that declare work (section 7), ADR
0025 (power saving), ADR 0030 (real-time screens), `device.md` (power levels, `dev_power`,
`go_online`, the network manager), `network.md` (the `later` flag, power ends), `core-events.md`
(the three work events named for ASY, the held-event store, lazy start), the usage-clock proposal
(the monotonic clock), and `stages-services.md` (D4).
Records: `abi/services/core.work@1.def`.

## 0. Scope and principles

- [D] **Work is a named wish to be called later.** A plugin declares work (`core.work` op 1): a
  key, a token, what it needs and when. When it is due, the host delivers `event.work_due` to the
  plugin (an ordinary event callback, as interface 6 emitted the work's event). There are no
  handles, no stored code, no host-side retry loop: what the plugin does in that callback is its
  own, and it declares again for a next time.
- [D] **Work runs only while the device is awake** (ADR 0025: "nothing runs while the device
  sleeps"). Nothing wakes the device from sleep or power-off for work; no first-party plugin
  needs that (section 7). Work that came due while the device slept runs at the first moment after
  the wake.
- [D] **The queue lives for one start.** It is held in host memory and lost at power-off, restart
  and a sleep that switches off; a plugin declares again at `event.started` (32) what it still has
  to do, as interface 6's plugins do. Plugins that must not forget (joplin's, readwise's waiting
  exports, update's last look) keep that in their own data folder, as today. Times are on the
  host's monotonic clock (`now_ms` of events), valid only within one start.
- [D] **The host decides when, within the plugin's bounds.** It joins work that needs the network
  into one connection, stretches deadlines in power saving, holds network work in the offline mode
  and runs optional work only when the radio is on anyway (ADR 0025). Background work never asks
  the user and never shows a toast: its notices become the plugin's note (`service.work_note`).
- [D] **Only what first-party plugins use.** Not offered: host-run jobs with progress (interface
  6's `WorkSpec`, used only by the kernel's own catalog and clean-up), the `bluetooth` and
  `charging` needs, the book and idle moments (kernel only), `WORK_CHANGED`, wall-clock alarms,
  waking from sleep, persistence across starts.
- Out of ASY: what the work does on the network (NET, SOCK), the power levels and Wi-Fi (DEV),
  the work note record (51, already in interface 7).

## 1. The service `core.work` (major 1)

No feature on the ops: declaring work is free; what it does needs its own features (a work with
the `network` need needs `uses.network`, 1.1). Bare replies (`registry.md` 2.1); input is one
record.

| Op | Name | Effect | Input | Reply | Notes |
| --- | --- | --- | --- | --- | --- |
| 1 | `declare` | mutate | `work_spec` | (none) | adds or replaces the plugin's work with this key |
| 2 | `cancel` | mutate | `work_key` | (none) | removes it (`""`: all the plugin's work) |
| 3 | `state` | query | (none) | `work_row`*, `end` | the plugin's own work, at most 32 rows, not paged |

`max_input` 256, `max_reply` 4,096 (`state`) or 64, `bound: none`.

### 1.1 `declare`

- [D] `work_spec`: `key` (1-64 bytes, the plugin's name for it; declaring a key again **replaces**
  it, its times counted from now), `token` (the plugin's number, given back in the event), `needs`
  (bit 0 `network`; others `ERR_UNSUPPORTED`), `flags` (bit 0 `optional`: only when cheap, 2.2),
  `after_ms` (not before; 0 for at once), `within_ms` (a deadline after `after_ms`; 0 for none),
  `every_ms` (repeat: after it runs, it is due again that long after; 0 for once), `at_ms` (an
  **exact time** on the host's monotonic clock; 0 for none), `moments` (2.1).
- [D] **Rules** (`ERR_INVALID` otherwise): `at_ms` excludes `after_ms`, `within_ms`, `moments`
  and `optional` (an exact timer is only a time); an `at_ms` in the past is due at once. A work
  with only `after_ms` (no deadline, no moments) is due when `after_ms` has passed, and one with
  nothing at all is due at once; both with `why` 0 `time`. `after_ms`,
  `within_ms` and `every_ms` are at most 7 days (604,800,000; update's weekly look); `every_ms` is
  at least 60,000 (rules' minute timers, wifi's idle check use `at_ms`). `key` is UTF-8 without
  control characters.
- [D] **`network` needs `uses.network`** (`ERR_DENIED`, as `network.md` section 1); a plugin whose
  network the user turned off gets `ERR_DENIED` too and `event.work_refused` later if the user turns
  it off while the work waits (3.2).
- [D] **Limits:** at most 8 works per plugin on devices of the small memory class (the X4), 32 on
  others, and at most 32 on the X4 device-wide (256 on others), so the table stays bounded however
  many plugins run (`ERR_FULL`; interface 6 refused with `TooOften`). Replacing a key never counts
  twice.
- [D] **Declared while work is delivered:** a work declared or replaced during a main-loop pass
  that delivers due work (in a `work_due` callback or any other callback of that pass) is due at
  the next pass at the earliest, never in the same one; any work declared from a run's callbacks
  (its own key or another) is due no sooner than 1 s after the declaration, whatever its times
  say. So a callback that
  declares with nothing set, or with an `at_ms` in the past, cannot loop inside one pass or keep
  the main loop from napping.

### 1.2 `cancel` and `state`

- [D] `cancel`: `work_key.key` removes that work; `""` removes all the plugin's work. A missing key
  is `OK`. A work whose `event.work_due` is already delivered is not called back.
- [D] `state`: one `work_row` per declared work, in declaration order, then one `service.end`
  (the unpaged end, `stages-services.md` 2.3: `total` the rows, `flags`, `next` and `generation`
  0): `key`, `token`, `state` (0 waiting, 1 held, 2 running: its due callback ran and its
  network requests or sockets are still open), `reason` (when held: the `event.http_done` reason
  numbers `network.md` 4.1 uses for power ends, 11 `offline`, 12 `saving`; else 0), `due_ms` (when
  it comes due by time, 0 when only a moment brings it). kosync checks it before declaring again
  (interface 6 `env.work().get`).

## 2. When work comes due

### 2.1 Moments and times

- [D] **Moments** (`moments` bits): bit 0 `wake` (the device woke, `event.resume`), bit 1 `online`
  (the network came up), bit 2 `charging` (charging began). Other bits `ERR_UNSUPPORTED`. A work
  with moments comes due at the first such moment after `after_ms`.
- [D] **A deadline** (`within_ms`) makes it due at `after_ms + within_ms` at the latest, even
  without a moment; in power saving the host stretches it by the level's factor
  (`event.power_changed` `stretch`, `dev_power`). A work without a deadline waits for its moment.
- [D] **An exact timer** (`at_ms`) is due at that time, whatever screen is open and whatever the
  power level (interface 6 `Work::at`). While awake the host wakes from its naps for it (to the
  millisecond on the X4); while asleep it waits for the wake. A network timer in the offline mode is
  held as any network work (2.2). `every_ms` on a timer makes the next one `every_ms` after this
  one ran.
- [D] **Joined:** all work that comes due in one main-loop pass is delivered in that pass, in due
  order; network work whose `after_ms` passed is delivered together with a network work whose
  deadline or moment came, so they share one connection. Work declared during the pass waits for
  the next one (1.1).

### 2.2 Power and the network

- [D] **Offline mode:** network work is held (`state` 1, `reason` 11) and comes due when the mode
  is left or the user goes online (`device.md` `go_online`), then `event.work_allowed`. Work
  without the `network` need is not held.
- [D] **Saving mode:** deadlines are stretched; **optional** work (`flags` bit 0) has no deadline
  and runs only at a moment while the radio is on anyway (`dev_power.flags` bit 1 `online`); a
  plugin's own saving setting held to manual holds its network work as offline does (`reason` 12).
- [D] **A deadline may wake the radio, rarely:** a non-optional network work whose deadline came
  while no network is up makes the host ask the network manager (`event.network_wanted`), **at most
  once per 15 minutes on the device**, whichever plugin's work asks (ADR 0025's
  `core.work.min-gap`, never implemented in interface 6); inside that gap it waits for the `online`
  moment, and every plugin's network work rides along when the network comes up. Optional work
  never asks.
- [D] **Held by a screen:** while a real-time screen holds the device (ADR 0030), no work comes
  due and nothing wakes for it; it runs once the hold ends.
- **Held by a press:** the same while a button or an unmoved finger is down and its click, tap or
  long press is not told yet (at most the long-press time), so that no work runs between a press
  and the action it makes (#515), and in the kernel call of a button or finger event itself: work
  due then runs in the pass right after it, once its frame is drawn (#518). Exact timers are not
  held, as under a real-time screen.

### 2.3 The run

- [D] `event.work_due` opens a **run**: requests (NET) and sockets (SOCK) the plugin starts in that
  callback belong to it, count as background (not the reader's: no `offline` exception for user
  input, `network.md` 3.2) and keep the radio on until they end. The run ends when its callback has
  returned and its last request and socket have ended; its sockets must have an idle time
  (`sockets.md` 2.1). A work with `every_ms` is due again only after its run ended.
- [D] **A resource counts until its end is told** (Senior, #681 R1). A request, socket or
  broadcast of a run stays counted until its last event (99; 106 `closed` or `failed`; 107 `done`
  or `failed`) has been delivered and that callback has returned, or was dropped because the
  plugin stopped. Every event of a run's resource is delivered inside the run, so what the plugin
  starts there (a retry from `http_done`) belongs to the same run: background, held by saving, and
  under the same `RUN_MAX_MS` counted from the first `work_due`, never restarted. Once the 10
  minutes have passed, the run's end events are still delivered inside it, and what the plugin
  starts in them ends at once with reason 14 (SOCK 27), so a run cannot outlive its limit. The
  host waits for those end events at most `RUN_END_GRACE_MS` (30,000) after the limit; then the
  run is over whatever it still counts (a plugin that never takes its events cannot hold the radio
  on). An end event delivered later is still marked with its ended run: what the plugin starts in
  it ends at once with reason 14 (SOCK 27), never as foreground use.
- [D] **At most 2 runs of one plugin at once on devices of the small memory class (the X4), 8 on
  others** (`RUNS_PER_PLUGIN`). A work of that plugin that comes due while it has that many runs
  open waits, due, in due order and is never dropped: its `work_due` comes when one of the
  plugin's runs ends (its `within_ms` deadline still counts). Other plugins' work is not held back.
- [D] **A run lasts at most 10 minutes** (`RUN_MAX_MS` 600,000, from its `work_due`): then the host
  ends what still belongs to it, its requests with reason 14 `work_ended` (`network.md` 4.1) and
  its sockets with reason 27 `work_ended` (`sockets.md` section 4), and the run is over; nothing
  keeps the radio on for a background run longer. In power saving the time is not stretched. A
  longer job splits itself across runs (a feed or an article per run, kept in its data folder).
- [D] **Background work is quiet:** in the callbacks that belong to a run (its `work_due` and the
  events of that run's requests and sockets), a plugin may submit only these commands: `redraw`,
  `set_setting`, `reset_setting`, `set_item_state`, `widget_changed`, `image_prepare`,
  `image_release` and the network ones (`wifi_on`, `wifi_off`, `wifi_scan`, `wifi_join`,
  `wifi_leave`, `wifi_host`, `network_none`, `go_online`) and `lookup_ready` (a lookup provider's
  fetch ends in its run, `document.md` 7). Every other command is `ERR_STATE` at
  submit, a notice, a dialog, `open` and every command added later alike (the host names a new
  one here before a run may send it), and so are UI calls that would ask the user. Service calls
  (data, network requests, sockets, work declarations) are no commands and stay allowed. The
  plugin's other callbacks (its screen's input, a user-started request) may show and ask as
  always, while the run goes on.
- [D] A plugin that stops loses its work (no events: it is not running); due work never starts a
  stopped plugin (`core-events.md` 3.3 lazy start: events do not start plugins).

## 3. Events

| Tag | Event | Fields |
| --- | --- | --- |
| 103 | `event.work_due` | `now_ms: u64`, `token: u32`, `why: u32`, `key: str 64` |
| 104 | `event.work_refused` | `now_ms: u64`, `token: u32`, `reason: u32`, `key: str 64` |
| 105 | `event.work_allowed` | `now_ms: u64` |

- [D] **Subscriptions**: the three go only to the plugin whose work it is, and only
  when it subscribed to them with `registration.event`, as every event (`network.md` 4 for 99).
  `declare` without a subscription to 103 is `ERR_STATE`: its work could never be told it is due.
  104 and 105 are the plugin's choice: one that did not subscribe to 104 finds a refused work gone
  from `state` (op 3), one without 105 tries again at its next work or event.

### 3.1 `event.work_due`

- `why`: 0 `time` (`at_ms`, or `after_ms` with neither moments nor a deadline), 1 `deadline`, 2
  `wake`, 3 `online`, 4 `charging`. A once-work is removed when delivered; a repeating one waits
  for its next time.
- [D] **Never dropped.** 103 and 104 come from the host's work table (at most 8 or 32 per plugin),
  not from the held-event store (`core-events.md` 3.3): a busy plugin gets them when it can, at
  most one pending per work. 105 is a hint, coalesced (one pending per plugin).

### 3.2 `event.work_refused` and `event.work_allowed`

- [D] `work_refused` takes a work out for good: `reason` 13 `network_off` (the user turned the
  plugin's network off while the work waited; `network.md` 4.1 numbers). It is the only refusal
  after `declare`: everything else is the call's status (1.1) or a hold (2.2).
- [D] `work_allowed`: what held work or requests back no longer does (the offline mode left, the
  user went online, the network came up after a `later`-flagged `net.http_done`). A plugin told
  `later` tries again then (kosync).

### 3.3 Records

| Tag | Record | Fields |
| --- | --- | --- |
| 1167 | `service.work_spec` | `token: u32`, `needs: u32`, `flags: u32`, `moments: u32`, `after_ms: u32`, `within_ms: u32`, `every_ms: u32`, `at_ms: u64`, `key: str 64` |
| 1168 | `service.work_key` | `key: str 64` |
| 1169 | `service.work_row` | `token: u32`, `state: u32`, `reason: u32`, `due_ms: u64`, `key: str 64` |

## 4. Statuses

| Condition | Status |
| --- | --- |
| Bad `key`, rules of 1.1 | `ERR_INVALID` |
| An unknown `needs` bit, `moments` bit or `flags` bit | `ERR_UNSUPPORTED` |
| `network` without `uses.network`, or the user turned the plugin's network off | `ERR_DENIED` |
| More than 8 (X4) or 32 works per plugin, or the device's 32 (X4) or 256 | `ERR_FULL` |
| Called outside a callback; a UI question in a run's callback; `declare` without a subscription to 103 | `ERR_STATE` |
| No memory for a new work entry (1.1, section 5) | `ERR_NO_MEMORY` |

## 5. Memory

- Host: one entry per work (key up to 64 bytes, times, token, bits: about 100 bytes), at most 8
  per plugin and 32 device-wide on the X4 (about 3.2 KiB), held in a fixed table or allocated
  fallibly at `declare` (`ERR_NO_MEMORY`); nothing per run beyond NET's and SOCK's own tables.
- Plugin: nothing; `state` is one 4 KiB reply.

## 6. Interface-6 calls and their interface-7 form

## 7. Who uses what (first-party, interface 6 audit)

| Plugin | Work | Needs network | Exactness |
| --- | --- | --- | --- |
| kosync | push the position: network, within 30 min, moment online; checks `state` first | yes | loose |
| joplin, readwise | send waiting notes: `when_cheap` 1 h; retry within 30 min at online | yes | loose |
| opds, news, wallabag, read-later-cloud | sync for a rule's background action: `when_cheap` 1 h | yes | loose |
| update | check: `when_cheap`, after 1 day within 2 days; weekly look: optional, after the rest of the week, every 7 days, moments online and charging; `cancel` when the setting goes off | yes | loose; times from its own `looked.txt` |
| weather | refresh: optional, after the next interval (`dev_power.every_ms`), moments wake and online | yes | loose |
| rules | time-of-day rules: `at_ms` on the minute (from wall time, set again at start, wake and clock or zone changes); repeat rules: `at_ms` every 60 s | by action | to the minute, awake only |
| wifi | switch the radio off when idle, retry a join: `at_ms` | no | seconds |

- No first-party plugin needs to wake a sleeping device, work that survives a restart in the host,
  the `bluetooth` or `charging` needs, or host-run jobs.
- [D] (Plugin, Q1 answered) **rules** keeps converting its local minute times to monotonic `at_ms`
  and sets them again at start, resume and clock or status changes (`rules/src/lib.rs`), as
  today: no wall-clock `at` in the host. The port keeps the time zone and daylight-saving handling
  and the unknown-clock case, and keeps the scheduled minute with the work's token.

## 8. Hand-offs (after approval)

- **Core:** the `core.work` host in `paperpaw-core` over interface 6's `work::Queue` (minus jobs):
  the table and limits, the rules of 1.1, moments from the host's own state (resume, network up,
  charging), deadlines and stretch, offline and saving holds, the device-wide 15-minute deadline
  gap, `network_wanted`, runs and their end, the 10-minute run limit ending the run's requests and
  sockets with `work_ended`, quiet scoped to the run's own callbacks, work declared during a pass
  due at the next one (1 s for any work declared from a run), the device-wide cap, events 103-105
  from the table, `state`; tests for each rule and status, one for a callback that declares itself
  again at once (no loop in one pass) and one for a dialog from the screen during a run. The
  kernel's own catalog and clean-up jobs stay host-internal.
- **Firmware:** the X4 main loop's naps already wake for the host's earliest time
  (`effects.wake_at`); nothing new while asleep.
- **Services:** `native::work` (a builder like interface 6's `Work`, `retry` backoff, `state`
  rows), with `when_cheap` and `at` as helpers.
- **Plugin:** ports declare again at `event.started`, keep per-work data by `key`, and replace
  `with(params)` by their own table.
