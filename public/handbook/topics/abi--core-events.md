# Interface 7: core events (EVT)

Status: contract of family 1b (#228). Everything here is appended: event records 64-74 in the
`event` growth block (`screens-input.md` section 8). The records change the SDK `Record` shape, so
this changed interface 7. Items marked [D] are decided.

It builds on the event rules already in place: registration with `registration.event`, one record
per `dispatch_event`, borrowed input valid for the call only, held back during a callback, and the
failure rules of `proposals/interface-7-events-storage-services.md` section 1.5.

## 1. Scope

Family 1b carries the host-produced broadcasts that ported plugins subscribe to most and that no
later family owns. Section 5 places every interface-6 event.

- [D] **Already in interface 7:** started, resume, suspend, stopping, battery measured, page turned
  (32-37), screen shown and action run (38, 39, delivered to their declaration's token).
- [D] **Plugin-to-plugin events** are stages (`stages-services.md`, N4); request and answer pairs
  are services. Other families add their own events in this block when they land.

## 2. Records

All fields are required unless marked optional; `now_ms` is first, as in every event.

| Tag | Record | Fields |
| --- | --- | --- |
| 64 | `event.setting_changed` | `now_ms: u64`, `key: str 128`, `old: bytes 512` |
| 65 | `event.book_opened` | `now_ms`, `section`, `offset`, `progress_ppm`, `path: str 512`, `title: str 256`, `chapter: str 256`, `reason: u32`; optional `page`, `pages`, `insert`, `chapter_left` |
| 66 | `event.book_closed` | the same fields |
| 67 | `event.book_finished` | the same fields |
| 68 | `event.book_moved` | `now_ms: u64`, `from: str 512`, `path: str 512` |
| 69 | `event.book_removed` | `now_ms: u64`, `path: str 512` |
| 70 | `event.plugins_changed` | `now_ms: u64` |
| 71 | `event.wifi_changed` | `now_ms: u64`, `state: u32` |
| 72 | `event.power_changed` | `now_ms: u64`, `level: u32`, `flags: u32`, `stretch: u32`, `mode: str 128` |
| 73 | `event.status_changed` | `now_ms: u64` |
| 74 | `event.charge_changed` | `now_ms: u64`, `flags: u32` |

- [D] **`event.setting_changed`:**
  - `key` is the setting's full id (`<plugin>.<name>`, or `core.*`). `old` is the previous value in
    the settings value encoding (`settings_value`), empty when there was none. A setting value is
    never empty, so empty means "no previous value". The new value is read with slot 5 (`settings.read`).
  - 64 reports changes of **kept** values only: a set, a reset, a preset applied (one event per
    key) and a write into a book's scope. `old` is the value kept before, in the store the write
    goes to (the scope's, else the global one), empty when none was set; never a previewed value,
    a power mode's or a default. A preview (REG event 76) and a power mode wearing values (event
    72) change no kept value and raise no 64: they are hints, the consumer reads again.
  - A **scope switch** (a book's scope on, off or another book's) changes which kept values apply,
    not the values: the host raises one empty-key event (below) when the old or the new scope
    holds a value, instead of one event per key.
  - An `old` over its 512-byte cap is never cut and never sent empty (empty means "none"): that
    edge is dropped as an overflow and replaced by the empty-key event below.
  - `old` is given only to a subscriber that could read the key with slot 5; any other subscriber
    gets the event with `old` empty. A secret-scoped setting (SEC family) is never announced to
    another plugin.
  - A change the plugin made itself through slot 15 is announced to it too, after its callback
    returns (no re-entry).
  - **Overflow** (section 3.3): the edges dropped for a plugin are replaced by one
    `event.setting_changed` with an **empty `key`**: "several settings changed, read again what
    you keep". A real key is never empty.
- [D] **Book events 65-67** carry the reading position at that moment, with the field rules of
  `event.page_turned` (`screens-input.md` section 9, `records.md`): `progress_ppm` at most
  1,000,000, page counters absent until counted, never a present 0 or a page past `pages`. The SDK
  decodes all four into one `Reading` view.
- [D] **`reason`** in 65-67:
  - for `book_opened`: 0 opened by the user or a plugin, 1 opened again after the device woke or
    restarted (the same book that was open before);
  - for `book_closed`: 0 closed or replaced by another book, 1 closed because the device sleeps or
    powers off;
  - for `book_finished`: 0.

  Other values are reserved; a consumer treats them as 0. Statistics count only `reason` 0.
- [D] **Paths are never cut.** Paths in 65-69 are paths on storage root 1 (`/`-separated, as
  `event.page_turned`). The cap is 512 bytes, the longest path the host's storage slots accept
  (`native_host::storage::MAX_PATH`). A book whose path is longer gets no book event; the host
  reports `event_dropped` with the producer reason instead of cutting it, because a cut path can
  name another book. Such a book never gets book events; besides the drop report, the reader may tell
  the user once that the path is too long. `title` and `chapter` are display text and are cut at a
  UTF-8 boundary.
  `book_moved` names the old and the new path; a book moved out of root 1 is `book_removed`.
  A `book_moved` record is up to about 1 KiB (two paths of 512 bytes), so only three or four moves
  can wait for one plugin (its queue holds 4,096 bytes): a folder move of many books can overflow it,
  and the moves that do not fit are dropped, logged once for the plugin until its queue is empty
  again, and not retried. A move with a path over 512 bytes is dropped whole, never cut.
- [D] **`event.wifi_changed.state`:** 0 off, 1 on and not connected, 2 connecting, 3 connected, 4
  access point (the device's own network, for transfer). Other values are reserved: a consumer
  treats them as "not connected".
- [D] **`event.power_changed`** keeps interface 6's meaning: the power mode or level changed
  (`Kernel::wear_mode`, `work.rs`). `level` 0 normal, 1 saving, 2 offline; `flags` bit 0: chosen
  automatically (by the battery, not the user); `stretch` how many times longer declared work may
  wait; `mode` the mode's id (a built-in one or a preset's). Other levels are reserved (treated as
  normal), other flag bits 0.
- [D] **`event.charge_changed.flags`:** bit 0 charging, bit 1 external power present, bit 2 battery
  low (the host's threshold). Other bits are 0; consumers ignore bits they do not know. Bit 1 is set
  only where it is known: the shell reports external power, or the battery is charging (which
  needs it). A device that cannot detect external power may show bit 1 clear on a cable with a
  full battery; the host never guesses it.
- [D] **Edges and hints.** 64-69 are edges: each one happened. 70-74 are hints: "this state changed,
  read it again". They carry the new state where it is small (71, 72, 74); everything else is read
  through the owning service (plugin inventory: REG; status items: the reader's status stage).

## 3. Producers and delivery

### 3.1 Who raises what

- [D] **Only the host raises these events.** There is no slot through which a plugin emits a core
  event, so no plugin can make the host or other plugins act on a book that did not move, close or
  disappear.
- [D] **68 and 69** are raised by the host's own move and delete operations on root-1 books, once the
  operation has succeeded on the card: the host moves or removes the book's own data
  (`.paperpaw` book folder, catalogue entry, positions) **as part of that operation**, then raises
  the event. Interface 6 did this in the kernel's handlers of the plugin-raised events
  (`core_plugin.rs`, `register_library`: `library::move_data`, `remove_data`, catalogue forget);
  in interface 7 that code runs inside the operation instead. The operations are the file
  operations of the FS family and the library operations of LIB; a plugin that moves a book
  through them gets the event like everyone else.
- [D] **37 and 65-67** are raised by the host's reading session. A book is opened through the host
  (the LIB/DOC open path); the host knows which book is open and stamps `now_ms`, `path` and
  `reason` itself. The plugin that holds the reader role for that book reports position, title,
  chapter, counters and "finished" through the reader report of the DOC family, `core.document` op
  22 `report` (`document.md` 2.4, draft 37). The host checks the report against the open session
  (the reader's own book only, the field rules above) and raises the event. Until the reader is
  ported, 37 keeps today's producer (the kernel raises it from the interface-6 reader's page turns,
  and Battery already subscribes to it); 65-67 are not produced before then. When the reader port
  moves to the DOC report, 37 and 65-67 switch to it together.
- [D] **64, 70-74** come from the host's own state: settings stores, plugin lifecycle, Wi-Fi, power
  wear (`work.rs`) and the battery status.

### 3.2 Order

- [D] Events reach a plugin in the order the host produced them, one `dispatch_event` each. Events
  raised during a plugin's callback are delivered after it returns.
- [D] **Delivery is a pump** (H1b ruling on #228): raising `core.tick` (3) or 32-37 only queues
  them for each running subscriber (edges in the held-event store, 3 and 33 as coalesced pending
  bits); a pump between callbacks delivers them, and does nothing while any native callback is on
  the stack, nested ones included. The one synchronous step is a drain: right after raising
  `suspend` or `stopping` the host drains the pump from its top level before it sleeps or tears
  down, so earlier edges (`book_closed` reason 1) come first; a refused edge is logged, not retried.
  Tick and resume keep one coalesced pending bit each; suspend and stopping keep a bit too, so a
  full store never loses them; every bit and held edge shares one order per plugin, so nothing
  overtakes what was queued before it (#849). The reading session raises 65-67 through the same
  queue (the kernel's `emit_to`), with `reason` from the event's `reason` parameter (0 if absent).
- [D] Per reading session:
  - `book_opened` comes before the session's first `page_turned`;
  - `book_finished` comes at most once per open, after the last page turn and before `book_closed`;
  - `book_closed` comes after the session's last `page_turned`;
  - when another book opens, the old book's `book_closed` (reason 0) comes before the new book's
    `book_opened`.
- [D] **Sleep.** Edges raised before sleep are delivered before `event.suspend`. When the device
  sleeps or powers off with a book open, the host raises `book_closed` with reason 1 before
  `suspend`/`stopping`. After waking (on the X4 a restart), the order is `started`, `resume`, then
  `book_opened` with reason 1 for the same book. If power was lost without `book_closed` (a crash or
  an empty battery), the next start still sends `book_opened` reason 1; a consumer that still
  considers a book open treats it as closed at that point.

### 3.3 Admission, coalescing and memory

- [D] A plugin subscribes with `registration.event { event_tag, token }`, as for 32-37.
- [D] **Admission.** A host admits a tag in this family once it has the producer. Until then a
  registration naming it is `ERR_UNSUPPORTED` for the batch, as for any tag without an encoder. A
  host that produces a tag admits it on every device, even where it never fires (Wi-Fi on a device
  without Wi-Fi): a plugin's registrations never depend on the device.
- [D] **Hints (70-74, 76 `preview_changed` and the radio hints `wifi_scanned`,
  `network_wanted`, `network_idle`) may be coalesced:** at most one of each is pending per plugin;
  a newer one replaces it, and it is encoded from the current state at delivery. Each hint has its
  own bit in the host's per-plugin entry (two hints never share one), no allocation. A coalesced
  hint is not reported.
- [D] **Edges (64-69) are never coalesced.** Edges waiting for a busy plugin are kept encoded in the
  host's held-event store: at most 16 edges and 4 KiB per plugin, and at most 8 KiB device-wide on
  the X4. An edge that does not fit, or cannot be delivered (the plugin is stopping or its callback
  fails), takes the `event_dropped` path (section 1.5 of the events proposal) and is logged, never
  retried; for 64 the drop is replaced by the empty-key event above. That event has its own
  pending bit per plugin (beside the hint bits), not a slot in the store, so it can
  be raised when the store is full. The store is allocated fallibly; a failed allocation takes the
  same `event_dropped` path. A profile that applies 200
  settings therefore costs each subscriber at most 16 held edges plus one empty-key event.
- [D] **Lazy start.** A plugin that is not running gets no events; registering for one does not
  start it. A plugin that must follow the library while stopped reads the state at its next start.
- [D] **Cost on the X4.** The host encodes into a stack buffer (the largest record, 65-67, is under
  1.1 KB, as `event.page_turned`); one registration entry per plugin and tag, 15 pending bits per
  plugin (the nine hints, the empty-key setting event, `registry_changed`, and tick, resume,
  suspend and stopping) and the held-event store above.
- [D] **Declared uses.** The store lists a plugin's registrations for 37 and 65-69 as "reads your
  reading activity" among its declared uses, taken from the declaration index; no new
  metadata field.

## 4. Hand-offs

**Core:**
- producers for 64 and 70-74 from the existing kernel sites (`SETTING_CHANGED` and `POWER_CHANGED`
  in `work.rs`, `PLUGINS_CHANGED`, `WIFI_CHANGED`, `STATUS_CHANGED`; charge from the battery status
  in `Kernel::set_status`);
- new emit sites for 68/69 inside the host's move and delete operations, which take over the book
  data handling of `core_plugin.rs` `register_library`, together with the FS/LIB operations;
- the reading session for 37 and 65-67 with the DOC reader report;
- admission of each tag in `native_host::events::is_event_tag` once its producer is wired, encoders
  with the field rules above, the held-event store and hint bits with their limits, and tests per
  tag (admission, order, the sleep sequence, coalescing, a dropped edge reported, the empty-key
  overflow, a path over 512 B dropped and never cut).

**Services:** typed SDK decoding: `Event::SettingChanged { key, old }` (with `key` empty meaning
"reread"), `Event::Book { kind, reason, reading }`, `Event::BookMoved`, `Event::BookRemoved`,
`Event::PluginsChanged`, `Event::WifiChanged(WifiState)`, `Event::PowerChanged(Power)`,
`Event::StatusChanged`, `Event::ChargeChanged(ChargeFlags)`.

**Kernel:** this contract and the records; the DOC reader report and the FS/LIB operations in their
families.

## 5. Every interface-6 event and its interface-7 home

| Interface 6 (`core.*`) | Interface 7 |
| --- | --- |
| `started`, `resume`, `suspend`, `stopping` | events 32-35 |
| `battery-measured` | event 36 |
| `page-turned` | event 37 (host-raised, section 3.1) |
| `screen-shown` | event 38 |
| `setting-changed` | event 64 |
| `book-opened`, `book-closed`, `book-finished` | events 65-67 |
| `book-moved`, `book-removed` | events 68, 69 |
| `plugins-changed` | event 70 |
| `wifi-changed` | event 71 |
| `power-changed` | event 72 |
| `status-changed` | event 73 |
| (charging, external power, battery low) | event 74 (new) |
| `book-added`, `book-changed`, `annotations-changed`, `library-changed`, `catalog-changed`, `catalog-failed` | LIB events |
| `catalog-wanted`, `sorted-wanted` | LIB service ops |
| `document-ready`, `reading-app-wanted` | DOC (document handles, format routing) |
| `follow-link`, `goto`, `skim`, `skimmed`, `page-words-wanted`, `text-chosen`, `decoration-tapped`, `page-layer-tapped` | reader stages (`paperpaw-reader-api`) |
| `lookup-answered`, `word-looked-up`, `notes-exported`, `read-today`, `widget-changed` | stages of their defining plugins |
| `plugins-requested`, `plugins-answered`, `preview-changed` | REG (inventory service, preview transaction) |
| `type-text`, `setting-typed`, `book-chosen`, `focus-changed`, `display-changed`, `menu-changed`, `menu-page`, `help.ready` | UIX (text and picker dialogs with reply events, focus, display class, menus, help) |
| `wifi-scanned`, `wifi-failed`, `bluetooth-changed`, `firmware-changed`, `usb-drive-ended` | DEV events |
| `network-wanted`, `network-idle` | NET |
| `work-allowed`, `work-changed`, `work-refused` | ASY |

Nothing is left without a home; a family that lands takes its rows from here.
