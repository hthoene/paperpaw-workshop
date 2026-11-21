# Interface 7 family UIX: screens, dialogs, input, composition

Contract for #228 (assignment #1002). Items marked [D] are proposed decisions, [Q] open
questions for Plugin and Senior. Inputs: the plugin needs inventory (#984,
`plugin-needs-reg-uix-dev-lib-doc-228.md`, UIX section), Plugin's per-plugin call sites (#1003,
`plugin-uix-calls-1003.md`), `screens-input.md` (screens, actions, input, draw, commands 56-60),
`stages-services.md` (stages, services), `registry.md` (REG; plugin inputs listed by op 14, the
hold-Power escape) and `core-events.md`.
Records: `abi/services/core.ui@1.def` and `abi/abi.def` (commands 1553-1555, 1559 and 1560 and
events 83, 88 and 90 are free).

## 0. Scope and principles

- [D] **Plugin-side drawing stays (Q19).** Dialogs, the keyboard, lists, progress bars and
  widgets are plugin screens drawn by plugins. The host owns only what must be shared or trusted:
  the screen stack and its instances, routing of questions and answers, input filters and guards,
  composition of one plugin's drawing inside another's, and the few outputs a plugin cannot make
  itself (a message shown over any screen, the clipboard, speech).
- [D] **Answers go to the asker only.** A question gets a host request id that the asker learns
  at once (section 3); a speech request carries the asker's own `cookie` (a
  `u32`, like a declaration `token`). The host records who asked and delivers the answer to that
  plugin alone. No plugin can read or consume another
  plugin's answer; an answer is never dropped for lack of room (section 3.2) and never arrives
  after the asker stopped.
- [D] **Guards win.** A screen that guards the device (the lock) owns the input path and the
  stack above it, and hides everything below it from every other plugin (section 4.3).
- [D] **The hold-Power escape is untouched.** The host times the Power key on the raw device
  input, whatever any filter, guard, screen or dialog answers: Power key records never reach a
  filter (they go past the filter chain to the host's own handling), a filter's `replace` or
  `raise` can never produce a Power key record (such a verdict counts as pass, logged), and
  `raise_input` cannot name it (`ERR_DENIED`). An escape while a plugin callback hangs stays the
  REG device check (`registry.md` section 4.2).
- [D] **No interface-6 shapes.** `Params`, `ScreenKey`, `Emit`-based replies and `Env::stack` have
  no interface-7 copies; what they carried is in the records below.
- Out of 1.0 (no first-party plugin uses them; additive later): chrome bars (`ChromeSpec`),
  refresh filters (`RefreshFilterSpec`), sound playback, task switching (`SwitchTask`). Plugin
  confirmed none is needed by a port (todo 262; vocabulary only strips Anki `[sound:…]` text).

## 1. Screen instances and parameters

### 1.1 Instances

- [D] Each opening of a screen is an **instance**: a host-assigned `u32` from a checked counter,
  never 0 and never reused while the host runs (on the X4 until restart; at `u32::MAX` opens are
  `ERR_FULL` until restart). Request and hand-over ids (sections 3 and below) follow the same rule,
  from one counter, so a host text id (op 9, 10) names one request or one hand-over. The same screen
  may be open more than once, as its `instances` policy allows (section 1.2). An instance is what
  interface 6 called `ScreenKey`.
- [D] The `draw` and `input` callbacks keep their signatures. The host calls them only for the
  instance on top (and for composed instances, section 5), and it announces which instance is on
  top before the first `draw`: `event.screen_shown` (38) has the field `instance` (38 is not
  frozen, so it is a plain field of its interface-7 form). A plugin keeps per-instance state keyed
  by it.

| Tag | Record | Fields | To |
| --- | --- | --- | --- |
| 38 | `event.screen_shown` | its fields, among them `instance: u32` | the screen's token |
| 79 | `event.screen_opened` | `now_ms: u64`, `screen: str 128`, `instance: u32`, `slot: str 128`, `flags: u32`, `handover: u32`, `params: u32`, `text_bytes: u32` | the screen's token |
| 80 | `event.screen_closed` | `now_ms: u64`, `screen: str 128`, `instance: u32` | the screen's token |
| 111 | `event.screen_hidden` | `now_ms: u64`, `screen: str 128`, `instance: u32` | the screen's token |
| 112 | `event.display_changed` | `now_ms: u64`, `width: u32`, `height: u32`, `ppi: u32`, `flags: u32` | subscribers |
| 81 | `event.stack_changed` | `now_ms: u64` | subscribers (hint) |

- [D] `screen_opened` comes once per instance, before its first `screen_shown`, and **again**
  whenever an open instance gets a new hand-over (`open` mode 1 or 3 shows it again; `flags` bit 0
  `again`), so a screen never misses a parameter update. `flags` bit 1 `restored`: reopened after
  a restart (#275), params kept, no text. `handover` names the instance's hand-over (0 none),
  `params` its param count and `text_bytes` its text's length. `screen_closed` comes once, after its
  last `draw`; a plugin frees the instance's state there. Like 38 and 39, 79 and 80 are not
  registrable (`ERR_UNSUPPORTED` in `registration.event`): they go to the token of the screen
  they name.
- [D] **`screen_hidden`** (111, #248; interface 6 `Screen::on_hide`): a full screen opened above
  the instance, so that it is covered until that one closes. The instance may let go of what it
  keeps only to draw itself (rows, text windows, pictures) and builds it again from what it keeps
  (position, selection, open edit transactions, its pending requests and image ids) when its next
  `screen_shown` comes: **that is the only signal to build again**, and a reply that arrived while
  hidden is kept or asked again, never drawn from freed state. It is sent only for a full screen
  above (never for an overlay, which draws the page below), only after `screen_opened` of the
  instance and never after its `screen_closed`; it may come before its first `screen_shown` (a
  screen opened below a guard waits hidden). It comes **once per cover**: a second full screen
  opened above the first sends nothing to the instance below it, and a cover opened after the
  instance's next `screen_shown` sends it again. A task switch closes the instance
  (`screen_closed`) and opens it anew, so it sends none.
- [D] **`display_changed`** (112, #369 K; #88): the display has another size (turned, a desktop
  window resized, Android), after the open screens were made anew for it; `flags` none yet. A
  plugin subscribes (`registration.event`); the snapshot gives the same size and ppi from then on,
  and a screen class is the SDK's helper over them. An edge: each change is told.
- [D] **Delivery of `screen_hidden`.** The host calls the instance's token synchronously while it
  applies the open of the covering screen, at depth 0 (never inside the opener's callback), before
  the cover's own `screen_opened` and first `draw`, so that what it frees is free before the cover
  builds. The callback gets **no command stage**, as `draw` gets none: a command submitted in it
  is `ERR_STATE`. The host sends it in a frame of 80's size, allocating nothing. It is not
  registrable (as 79 and 80), a plugin that does not read it loses nothing, and **dropping it is
  harmless** (the host may drop it when memory is short, or when the callback is refused); a
  plugin that frees on it must keep the screen drawable by `screen_shown` alone.
- [D] **Params are lossless** (interface 6 `Params`, Senior's answer to [Q] 3): an opener makes a
  **hand-over** with `core.ui` op 16 `handover` (input: `ui_param` records, reply `ui_handle`) and
  names it in `command.open.handover`. A `ui_param` (`key: str 32`, `value: str 1024`) is one
  `key=value` pair, a service row of the UIX block used only in `core.ui` inputs and replies (op 16
  in, op 17 out, `ui_status_ask.context`), never a declaration. At most 32 params per hand-over and
  at most 1,024 bytes of keys and values in all (the content bytes; encoded with fields and frames
  at most 1,313, section 8.1; tests at 1,024 `OK` and 1,025 `ERR_NO_SPACE`); keys
  `[a-z0-9_.-]{1,32}`, unique; a value is any UTF-8, newlines included. The host checks the form at
  op 16 (`ERR_INVALID`, over the cap `ERR_NO_SPACE`) and keeps them unchanged; their meaning belongs
  to the screen that reads them. Keys starting with `core.` are the host's (section 3:
  `core.request`, `core.kind`): op 16 naming one is `ERR_INVALID`. **One exception to "unchanged":**
  an instance that holds a handed file (`document.md` 1, root 5) hands it on to its own screens
  (a reader's table of contents, search) with `root` `5` and the same `path`; in an event's callback
  (the answer to a question its screen asked) no instance runs, and the file is the one of the
  plugin's topmost screen that holds a file of that path (when two screens hold the same path, the
  topmost wins, so its maker is the file's maker); the host puts the file's own
  root (`0` or `2`) in the params and the new instance's root 5 names the same file of the same
  maker. The `open` that names it may open any screen, the reader's own or another plugin's: the
  file stays the maker's, read only, and the document ends with the maker, whoever reads it. Another path, an instance that holds none, or no path is `ERR_DENIED` at op 16.
- [D] **Long values** (the reader's selected text, interface 6 `params::TEXT`): a hand-over also has
  one host text (section 3.1 rules: at most 24,576 bytes, written in 3 KiB parts with op 9
  `text_write` on the hand-over id by its maker in the callback that made it, never cut; a begun but
  uncommitted text makes the `open` naming it `ERR_STATE`). The opened screen reads its params with
  op 17 `params` (`ui_handle` → `ui_param`*, `end`) and its text with op 10, at any time while it is
  open. So any text another plugin selected reaches the screen whole, without either plugin's Data.
  A hand-over the caller did not name in an applied `open` is freed when its callback returns; a
  refused batch frees it too.
- [D] **The host keeps each instance's hand-over** (fallibly, `ERR_NO_MEMORY` at op 16) for as
  long as the instance is open, or until a reopen gives it a new one: `open` modes 1 and 3
  compare the params, and reopening screens after a restart (#275) opens them with the same params
  (not the text). On the X4 the params of all instances share 1,536 bytes (section 8.1, op 16
  `ERR_FULL` beyond) and texts are in the host text pool (section 8.2).
- [D] **Ownership, settled (Manager, 2026-11-07):** Input (H2) owns the hand-over store; Core (H1)
  only uses it.
- [D] **The host's hand-over seam** (for the host implementers; no plugin sees it). One store,
  `UiStore` in `crates/paperpaw-core/src/native_host/ui_store.rs`, owned by Input (H2), held once
  in the native host state: the one checked id allocator (nonzero, never reused) for requests,
  hand-overs and host texts, the hand-overs, the requests and the texts. Input writes ops 2, 4,
  8-11 and 14-17 against it; the screen stack and command staging (Core, H1) only call it. Every
  call takes the host-stamped `Stamp { owner, epoch }`: `owner` the plugin's logical key in
  `NativeInstances` (never a slot index; never reused), `epoch` the running callback's
  `CallbackEpoch`; a call with no callback running is `ERR_STATE`, never epoch 0. No borrow of
  the store spans plugin code; a claim is a move-only token (`Claims`, no `Clone`), not a reference.
  One owner id per plugin load: the `NativeInstances` key is the plugin's `OwnerResources` owner
  (`HostResources::try_owner`), so `Frame::caller`, this store, `HostServices::owner_retired` and
  the handle table name the same owner; no second counter, no mapping. Unloading retires it in
  one place (`Kernel::unload_plugin`), in this order: no new callbacks, `owner_stopped` (7), the
  plugin's instances closed (`instance_closed` each), its screen factories removed, then
  `OwnerResources::release_all` (handles, then `owner_retired`), last the registry row.
  1. `handover_make(stamp, staged params) -> Result<u32, i32>` at op 16: published only after the
     batch walk returned `OK` (section 6), allocated fallibly (`ERR_NO_MEMORY`, X4 cap
     `ERR_FULL`); state **made**. Its text follows with op 9 on the same id.
  2. `handover_check(stamp, id) -> Result<(), i32>` while `command.open` is checked: the id
     exists, is **made** by this owner in this epoch, is unclaimed and its text is committed. It
     changes nothing.
  3. `claim(stamp, ids) -> Result<Claims, i32>`, all or none, once the whole submit batch has
     been checked and every fallible copy and reservation of the stage is done: **made** →
     **claimed**, allocation-free; an id claimed twice, in the batch or by an earlier accepted
     submit, is `ERR_STATE` and claims nothing. The `Claims` go into the command stage.
  4. `rollback(claims)`: frees exactly the claims it is given, never others. A refused submit
     rolls back its own `Claims`, not those of earlier accepted submits; a callback whose result
     drops its staged commands (screens-input section 2.1) rolls back the claims of that
     callback's submits, never those of an earlier callback still waiting to drain.
     `release(id)` frees one claim whose `open`
     applies as a no-op (a guard refused, section 1.3), names a stale target or fails: the old
     instance keeps its hand-over.
  5. `attach(Option<id>, instance)` when the `open` applies: **claimed** → **owned** by the new
     or reused instance, allocation-free; the instance's previous hand-over is freed only after
     that, so a failure before it leaves the old params and text in place. `None` (an `open` with
     hand-over 0 that reuses an instance) clears its params and text at that same point only.
  6. `end_callback(stamp)` when the callback returns: every hand-over still **made** in that epoch
     is freed. Claimed ones stay alive in the stage until its deferred `open` drains (5 or 4).
  7. `instance_closed(instance)` frees the instance's **owned** hand-over.
     `owner_stopped(owner)` frees the stopped plugin's requests, texts and the hand-overs it made
     that are still **made** or **claimed**; an **owned** hand-over belongs to its instance, not
     its maker, and stays until that instance closes or is reopened. Neither calls any plugin.
  8. Op 17 and the text (op 10) answer only the owning instance; a restart reopen (#275) makes a
     new **owned** entry from the kept params, without the text.

  Every call either completes or leaves the store unchanged, so the stack never holds a hand-over
  the store does not and none outlives its owner. Secret texts are never in `Debug` or logs.
- [D] `stack_changed` is a hint: a screen opened, closed or came to the top. It carries nothing;
  the stack is read with `core.ui` op 1 (section 6).

### 1.2 Declaration flags

- [D] `screen.spec.flags` (11) gains, beside bit 0 `full_refresh_on_open`:
  - bit 1 `guards`: the screen guards the device (section 4.3) from its opening on;
  - bit 2 `overlay`: shown over the screen below (a menu, a dialog, the sleep screen over the
    page). For each frame the host first draws the topmost non-overlay instance below it and any
    overlays between, each as if on top (depth 1, with its widgets and status values, nothing
    lost), then the overlay over that. No nesting, so no extra stack. Under another plugin's
    overlay, an instance that is secret or at or below a guard is not drawn (the area stays
    blank): the sleep screen over a locked device never shows the page or the PIN screen;
  - bit 3 `waits_ready`: help for this screen waits until the screen says it is ready
    (`command.screen_ready`, section 7);
  - bit 4 `secret`: what the screen shows is secret from its opening on (a PIN, a password);
  - bit 5 `holds_edges`: edge swipes wait while the screen holds them;
  - bits 6-7 `instances`, for `open` mode 0 (section 1.3; modes 1 and 3
    keep their slot rule, mode 2 always replaces): 0 **one per params** (the default): an open of
    the screen while an instance of it with equal params is open goes back to that instance
    instead of opening another; 1 **single**: the same for any open instance of the screen,
    whatever its params; 2 **many**: every open opens a new instance; 3 `ERR_UNSUPPORTED`. Params
    compare as in section 1.1 (keys and values, not the text). Going back closes the screens above
    the instance as `back_to` does, including its guard rule: where that is refused the open is
    `OK` with no effect (logged) and its hand-over is released, as interface 6. The instance then
    gets the open's hand-over (none: its params become empty) and `event.screen_opened` again
    (`flags` bit 0 `again`) before it is shown, so a single screen shows the new params as if
    opened with them; *back* then leaves it in one press.
    `screen_policy` cannot change these bits;
  - bit 8 `hints_hidden`: the screen shows no row of button hints (interface 6
    `HintVisibility::Hidden`: the sleep screen). Declared only; `screen_policy` cannot change it;
  - bit 9 `grays`: what the screen shows is best in grays (interface 6 `Screen::grays`: a page
    with a picture, text smoothed in grays). Where the panel has few grays but shows more with a
    refresh of its own (the X4: four grays, as slow as a full refresh), the whole screen is shown
    so while this screen is on top and nothing lies over it (the same rule as the picture
    pass, `settings.pictures_in_grays`); under an overlay, or where the screen is not the whole
    display, it has no effect. `screen_policy` may change it at run time (below), page by page.
  - bit 10 `dims_below`: an overlay (bit 2) washes out what lies below it while it shows, so that
    it stands out and what it cuts through is not read as its own (interface 6
    `Screen::dims_below`: a menu, a panel; not a keyboard over its field). No effect on a screen
    that is no overlay. Declared only; `screen_policy` cannot change it;
  - bits 11-12 `status_bar` (#123): 0 the device default, 1 shown, 2 hidden, 3
    `ERR_UNSUPPORTED`. Where it is resolved "shown", the host draws its status bar in a band
    at the top of the display and the screen gets the rest: its `draw.frame` area and
    `event.screen_shown.height` are below the band. Resolved in this order: the screen's line
    in the kernel setting `core.status-bar.screens` (text, `<screen id>=shown|hidden` one per
    line, only its first 512 bytes read; another value is no line), then these bits (or the
    run-time policy), then the device default, the kernel setting `core.status-bar.all`
    (*Status bar on all screens*, off). Old plugins (bits 0) see no change while the user leaves
    it off. Overlays and screens with all of the panel their own never get the band. Other
    plugins and the user override a screen through these settings like any setting (no new
    record). `core.status-bar.line` names the status line the band shows (default the kernel's
    line of items, `core.status-line.items`: the time and the battery, the values op 14 gives
    for `core.status.clock` and `.battery`); empty is no band anywhere. A line the host does
    not draw itself (another plugin's `status.line`) shows the kernel's line of items for now.
    The band is the kernel line's height, 1.8 times the status text size, with a rule below.
    `event.status_changed` and a new minute redraw only the band (a partial refresh of that
    strip; the screen is not drawn). Home and the reader's page declare 2: they have status
    lines of their own. `screen_policy` may change these bits at run time (below); there 0
    keeps what the screen declared, so a policy sent for another bit leaves the bar as it was.
  - bits 13-14 `hints` (draft 38, #448), when the row of button hints shows (interface 6
    `HintVisibility`): 0 as bit 8 says (always, or never), 1 always, below the screen; 2 only
    for a few seconds after one of its buttons was pressed (or `command.show_hints`), over the
    screen's bottom edge, the screen having the whole display (`OnPress`: the reader's page, as
    in Beta 3); 3 never. 1 or 2 beside bit 8 is `ERR_INVALID`. `screen_policy` may change them
    at run time (below), there 0 keeps what the screen declared (Picture home's *Buttons row*).
  Other bits stay `ERR_UNSUPPORTED`.
- [D] **Policies change at run time** (the lock guards only while locked): `command.screen_policy`
  (`instance: u32`, 0 for the own top one; `flags: u32` with bits 1, 4, 5, 9, 11-12 and 13-14
  above; 11-12 set to 3 is `ERR_INVALID`) sets them for
  one of the submitter's own instances (the policy is the whole set the screen ends with: one that
  declared `grays` and sets a policy without bit 9 turns it off); other bits `ERR_INVALID`, another plugin's instance
  `ERR_DENIED`. **Turning `guards` on** is allowed only for the submitter's own top instance (the
  top of the whole stack, so no other plugin's screen is above it; the host's own `core.sleep`
  instance does not count, so a lock that locks while the sleep screen shows guards at once), and
  only while no other plugin's instance guards (Senior on #829: a keyboard above a lock may not take
  the guard over and close the lock): anywhere else `ERR_STATE`, and the whole batch is refused.
  Turning it off, and bits 4 and 5 either way, work on any own instance. The declared flags are the
  state at opening; a screen declared `guards` that opens below a guard waits there (section 4.3)
  and never has screens of others above it. A change takes effect when the batch is applied, before
  the next input is routed. Core's tests cover both cases (own top: guards at once; not top:
  `ERR_STATE`, nothing changed).
- [D] **Secret** (interface 6 `Screen::secret`): an instance is secret when it says so, when it
  guards, and when it lies above a guarding instance. While the top instance is secret, input
  goes to the input filters of its own plugin and of the topmost guarding plugin only (others are
  skipped as if they passed), and no event tells where its focus is.

### 1.3 Navigation commands

Command records in the growth block (slot 15; `commands.md` rules: whole batch checked, applied
after the callback, chains bounded at 8 hops, `screens-input.md` section 3).

| Tag | Record | Fields |
| --- | --- | --- |
| 1547 | `command.open` | `target: str 128`, `mode: u32`, `slot: str 128`, `handover: u32` |
| 1548 | `command.close` | `instance: u32` |
| 1549 | `command.back_to` | `target: str 128` |
| 1550 | `command.set_key_layer` | `layer: str 128` |
| 1551 | `command.show_hints` | (none) |
| 1552 | `command.raise_input` | `input: str 64` |
| 1563 | `command.screen_policy` | `instance: u32`, `flags: u32` |
| 1594 | `command.set_hint` | `action: str 128`, `kind: u32`, `label: str 64` |
| 1598 | `command.show_again` | `instance: u32`, `after_ms: u32`, `every_ms: u32`, `flags: u32` |

- [D] `open.mode`: 0 `screen` (open screen `target` on top), 1 `slot` (show the screen bound to slot
  `target`; if that slot is open already, close the screens above it and pass it the new hand-over),
  2 `replace` (open `target` in place of the submitter's own top instance, without showing the one
  below in between: the next step of a guide), 3 `in_slot` (open screen `target` for slot `slot`:
  shown again where that slot shows it with these params, else in place of what the slot shows).
  `slot` is empty except for mode 3 (`ERR_INVALID`). Other modes `ERR_INVALID`. `target` must be
  declared (`ERR_NOT_FOUND`), any plugin's (plugin freedom, as command 56). `handover` 0 is none;
  else one the submitter made in this callback and not yet named (`ERR_INVALID`). Command 56 stays:
  it is `open` mode 0 without a hand-over.
- [D] `close.instance`: 0 closes the submitter's own top instance (interface 6 `Back`; outside its
  own top screen `ERR_STATE`, as command 59). A non-zero instance closes that instance wherever it
  is in the stack, leaving the screens above it (interface 6 `Close(key)`): allowed for the
  submitter's own instances, and for another plugin's instance that is an `overlay` (help closes
  the overlay it covers). A guarding instance, and any instance above the topmost guarding one,
  only the guard's own plugin closes (`ERR_DENIED`, section 4.3). An instance that is no longer
  open is `ERR_NOT_FOUND`; the root screen is never closed (no effect, `OK`).
- [D] `back_to`: closes the screens above the topmost open instance of screen `target`, or of the
  screen of slot `target`; nothing where none is open (`OK`). Not across a guarding instance
  (`ERR_DENIED`).
- [D] `set_key_layer`: puts key-map layer `layer` in front of the slot's and the global layer for
  the submitter's own top instance (a book's own bindings); empty removes it. It goes with the
  instance. Outside its own top screen `ERR_STATE`.
- [D] `show_hints`: shows the row of button hints for a few seconds on a device with a hint row
  (`menu.need` 5); elsewhere `OK` and nothing.
- [D] `set_hint` (draft 29, interface 6 `Screen::hint`): how the row of button hints labels the
  button bound to `action` (a full action id, as key maps name it: `core.back`, the plugin's own)
  while the submitter's own top instance shows. `kind` 0 the action's usual name (removes an
  earlier `set_hint` for it), 1 the words in `label` (the plugin's own text, already translated;
  empty `ERR_INVALID`), 2 the icon named by `label` (an `icon.spec` name or a host icon; unknown
  `ERR_NOT_FOUND`), 3 hidden (the button does nothing here); other kinds `ERR_INVALID`, and
  `label` is empty for kinds 0 and 3. Kind 3 is `ERR_DENIED` for the actions that are the user's
  way out: `core.back`, the pinned actions (the main menu's opener, the settings editor's entry,
  sleep, power off, restart; `registry.md` section 4.2) and the Power key's escape; their hint is
  never hidden by a plugin. The labels go with the instance and end when it closes; a second
  `set_hint` for one action replaces the first; at most 8 actions per instance (a ninth
  `ERR_NO_SPACE`). Outside its own top screen `ERR_STATE`. On a device without a hint row `OK` and
  nothing, as `show_hints`. The host draws the words with its own rules (smaller, two lines, then
  shortened); a label never moves or adds a button. **Memory:** the host keeps each label as
  given, at most 8 × (128 + 64 + 4) = 1,568 bytes per instance on the X4, charged to the
  submitter's heap budget (`abi/heap-word.md` section 4; `ERR_NO_MEMORY` when it is spent, the
  earlier labels kept), and frees them when the instance closes.
- [D] `raise_input`: raises an input as written in key maps (`button.menu`, `double-tap.center`,
  or the submitter's own `input.<plugin>.<name>` / `gesture.<plugin>.<name>`): it runs what the
  layers shown bind it to, as if it came from the device. Another plugin's input or gesture, the
  Power key and the escape chord are `ERR_DENIED`; while an instance guards, only the guard's
  plugin may raise (`ERR_DENIED`, section 4.3). Raised inputs are a chain step (hop + 1) and pass
  no input filter.
- [D] **Core slots** (draft 25; interface 6 `builtin::slots`). A plugin offers a screen for one
  with the record `slot.offer` (`registry.md` section 6, SDK `SlotOfferDecl`); the user's binding
  picks among the offers.
  Anyone opens a slot with `open` mode 1 and a hand-over whose `ui_param` keys are below (all
  optional unless named; the host passes params through and does not check them, so a screen
  ignores keys it does not know). The dialog slots are asked, not opened (section 3.1).

  | Slot | Shows | Hand-over params |
  | --- | --- | --- |
  | `core.home` | the start screen | none |
  | `core.reader` | a book | `path` (required), `root`, `page`, `section`, `offset`, `conversion` (`document.md` 1) |
  | `core.library` | the library | none |
  | `core.menu` | a menu, an overlay | `menu` (required: the menu id, rows by `core.registry` op 12), `depth`, `mode` (the menu screen's own) |
  | `core.panel` | a menu as a panel of controls, an overlay | `menu` (required), as `core.menu` |
  | `core.settings` | settings | `id` (a group), `focus` (a setting) |
  | `core.setup` | the first-run setup | none |
  | `core.lookup`, `core.lookup-online` | a word looked up, an overlay | `word` (required), `language`, `anchor` (`x,y,width,height`: the words' box on the screen, `page-layers.md` 3.1) |
  | `core.browser` | a web page | `url` (required), `id` |
  | `core.bluetooth` | the Bluetooth page | none |
  | `core.cable` | the cable (USB) transfer | none (opened by the host) |
  | `core.edit-widgets` | a widget stack's editor | `id` (required: the stack's setting) |
  | `core.book-info`, `core.toc`, `core.search`, `core.annotations` | about the open book | `path` |
  | `core.keyboard`, `core.remote-keyboard`, `core.choice`, `core.confirm`, `core.choose-folder`, `core.choose-value` | dialogs | asked (section 3.1), not opened |

  A slot nobody offers a screen for opens nothing (`ERR_NOT_FOUND`), so a plugin may test for it
  first (`core.registry` op 9 `slots`, op 10 `slot_offers`).

### 1.4 The sleep screen shown again while asleep (`command.show_again`)

- [D] `command.show_again` (#152, #319): the plugin's screen asks to be shown again while the
  device sleeps, at `after_ms` from now (at least 60,000) and then every `every_ms` (0: once, else
  at least 60,000); `after_ms` 0 cancels (`every_ms` must then be 0). `instance` 0 is the submitter's
  own top instance, or that instance by its number, else `ERR_STATE`; `flags` has no bits yet
  (`ERR_INVALID`). One request is kept for the device, and a new one replaces it. A request
  is `ERR_UNSUPPORTED` where `dev_device.caps` bit 15 `refresh_asleep` is 0, and `ERR_STATE`
  while the device is awake: the sleep screen asks from its `event.suspend` (the host has set the
  device asleep before it sends it). A cancel is accepted whenever the plugin has a screen. The
  request ends when the device wakes, or when the screen is no longer on top.
- [D] The shell that can wake the device for a moment (`caps` bit 15: the X4 and X3 wake from
  their light sleep every 10 minutes anyway, `crates/paperpaw-x4/src/sleeping.rs`) asks the
  kernel when (`Kernel::show_again_at`) and at that time (`Kernel::show_again_now`) the kernel
  draws the whole screen again, as `command.redraw` with mode 2 (a partial refresh), and the
  panel refreshes what changed. The plugin's `draw` is called as ever (`frame.purpose`
  unchanged) and sends nothing; the next time comes from `every_ms`, counted from the time asked
  for, never from when the wake came, so the cadence does not drift. A wake is never earlier than
  5 minutes after the last show, never on a battery at or below 10 % or one that cannot be read
  (on USB it is not asked), and never turns a radio on: what the screen shows is what plugins
  already hold. A press of the power button wakes the device as before. A device that does not
  have bit 15 (the X4 Pro and Classic: their sleep would need a full start for every refresh)
  keeps the screen as it was. Cost per wake on the X4: about 0.03 mAh (an estimate from
  the panel's refresh and about 2 s of the processor awake; not yet measured).

## 2. Plugin inputs and gestures (declarations)

| Tag | Record | Fields |
| --- | --- | --- |
| 29 | `input.spec` | `name: str 64`, `title: str 96`, `kind: u32`, `need: u32`, `capability: u64`, `flags: u32` |

- [D] An input of the plugin's own, `input.<plugin>.<name>` in key maps (`kind` 0), or a gesture
  its recognizer makes, `gesture.<plugin>.<name>` (`kind` 1). `title` is a catalog key for
  binding lists. `flags` bit 0 `has_need`: `need`/`capability` as `setup.step` (`registry.md`
  section 6); without it both are 0 (`ERR_INVALID`). Other bits `ERR_INVALID`. The host stamps
  the owner; names are unique among the plugin's inputs (`ERR_INVALID`).
- [D] REG op 14 lists them with `reg_item.flags` bit 4 and `plugin` (`registry.md` section 10).
- [D] A plugin input is raised by its owner: by `command.raise_input` (its switch access, its
  chord) or by its recognizer's verdict (section 4.1). A gesture name never shadows a device
  gesture; the escape chord is never an input any plugin declares.

## 3. Questions and answers (dialogs)

Interface 6 `ask::text`, `ask::choice`, `ask::confirm`, `ask::folder` and their reply events.
The dialogs are plugin screens on the slots `core.keyboard`, `core.remote-keyboard`,
`core.choice`, `core.confirm` and `core.choose-folder` (the keyboard plugin and the ones that
replace it), as in interface 6. Questions and answers go through `core.ui` ops (section 6), so the
asker learns its request id at once and long texts move in pages, never cut.

### 3.1 Asking

- [D] Op 8 `ask` (input `ui_ask`: `kind`, `flags`, `slot`, `title`, `text`, `choices`; reply
  `ui_request`: `request`) records a question for the caller and returns its **request** id
  (`u32`, never 0). The dialog opens after the caller's callback returns (as a queued `open`, with
  the params `core.request` and `core.kind`), so the caller can still write the initial text.
  Both values are ASCII decimal without sign and without a leading zero (a lone `0` is the number
  0): `core.request` the request id (1..=4,294,967,295), `core.kind` the `kind` below (0..=3, so
  `0` is text). A reader refuses any other form of either value (`Error::Invalid`); it does not
  guess.
- [D] `kind`: 0 text, 1 choice, 2 confirm (yes or no), 3 folder; others `ERR_INVALID`. `slot`:
  empty for the kind's slot; for kind 0 also `core.remote-keyboard` (the keyboard's "type on the
  phone" asks it this way, with its own text as the initial text); any other `ERR_INVALID`.
  `title` and `text` (the question) are display text the caller formatted itself (slot 27);
  `choices` (kind 1) at most 32 lines of at most 128 bytes and 2,048 bytes in all,
  non-empty, no trailing `\n` (`ERR_INVALID`, over the cap `ERR_NO_SPACE`). For kind 2
  `choices` holds the button words (interface 6 `ConfirmQuestion::yes`/`no`, display text the
  caller formatted): empty for the dialog's own *Yes* and *No*, else exactly two lines `yes\nno`
  of at most 128 bytes each, where an empty line keeps the dialog's word for that button (a single
  line or more than two `ERR_INVALID`, a line over 128 bytes `ERR_NO_SPACE`); kinds 0 and 3 take
  no `choices` (`ERR_INVALID`).
- [D] `flags` (other bits `ERR_INVALID`; bits 0-7 for kind 0 only, bits 8-9 for kind 2 only): bit 8
  `only_yes` (one button, by default *OK*: a text to be read whole; its `no` line must be empty,
  else `ERR_INVALID`), bit 9 `focus_yes` (the focus starts on yes); the dialog plugin reads them
  in `ui_question` and must honour them. Bit 0 `live` (the asker hears
  the text while it is typed), bit 1 `multiline`, bit 2 `secret` (shown masked; the dialog instance
  is `secret`, section 1.2; never putting it on the clipboard is the dialog plugin's duty, the host
  cannot tell its text from other text, decision 44), bits 4-7 the text mode (0 plain, 1 number, 2
  e-mail, 3 URL, 4 file name).
- [D] **Request text.** Each request has one host text (its id is the request id), empty at
  first: for kind 0 the text to start from and then the answer, for kind 3 the folder to start in
  and then the chosen path. Op 9 `text_write` (`text` id, `offset`, `data` at most 3,072 bytes,
  `flags` bit 0 `last`: the text ends after this part) writes it in parts, append-only (`offset`
  the bytes written so far, else `ERR_INVALID`). **Replacing:** a write at `offset` 0 always starts
  the text over, also after `last`: the old text is gone, the new one is uncommitted until a part
  with `last` (an empty text is one write of no bytes with `last`). A failed part (`ERR_IO`,
  `ERR_NO_SPACE`, `ERR_NO_MEMORY`) leaves the text uncommitted at the parts before it; the writer
  goes on from there or starts over at 0; op 10 `text_read` (`text` id, `offset`) reads it in
  parts (`ui_text`: `total`, `offset`, `data`, cut only at UTF-8 boundaries). A host text is
  **committed** by the write with `last`; only a committed text is read or answered. Its cap
  (`ui_question.max_bytes`) is 24,576 bytes on every device: the 6,000 characters of interface 6
  in any script (at most 4 bytes each). Over it `ERR_NO_SPACE`; the text is never cut. On the X4
  the host keeps the first 512 bytes of a text in memory and the rest in a host file on the card
  (deleted when the text ends and at start). **Card failures** (Senior G): a full card is
  `ERR_NO_SPACE` for the part; with no card the request's question and the X4 host texts live in
  memory only, capped at what fits there: at most 2 KiB together (the secret text below aside),
  `ERR_IO` beyond; a missing or failing card is `ERR_IO`. A card pulled while a text has a card
  part makes every later read of that text `ERR_IO`, never a short text; a write at 0 starts it
  over. An answer committed before the card went is still delivered (outcome, choice and
  `length`), only its op 10 read fails (section 3.2).
  **Secret texts never touch the card**: a `secret` question's text stays in memory, at most
  8,192 bytes on every device, the 2,000 characters a password field takes in interface 6 in any
  script (`keyboard/src/lib.rs:116`; the lock hashes the whole code, so nothing is ever cut),
  allocated part by part as written, each part its own block, never one buffer grown by
  realloc (no doubled peak, no 8 KiB block on a fragmented heap), and zeroed before it is freed
  (`ERR_NO_MEMORY` if the heap cannot, `ERR_NO_SPACE` beyond
  the cap); a real password costs its own length. **Live typing on the X4**: a `typing` answer
  (outcome 2) is accepted only while the text is in memory (at most 512 bytes, a secret text up
  to its cap), so typing never rewrites the card per key. A longer one is `ERR_NO_SPACE` to the
  dialog, and the asker gets one `typing` event with `flags` bit 2 `typing_stopped` (the live
  text stopped there, it is not complete); the final answer is always whole and may use the card
  once.
- [D] Who may write: the asker inside the callback that asked (the initial text), then only the
  dialog instance the host opened for the request, until its final answer. Who may read: that
  dialog while it is open, and the asker in the callback that delivers its answer. Anyone else
  `ERR_STATE`.
- [D] **A failed start cancels.** If the asking callback returns with an initial text begun but
  not committed (no `last`), or returns a failure status, the request is cancelled before any
  dialog opens: no partial text ever reaches a dialog, and the asker gets `event.answered`
  outcome 1 with `flags` bit 1 `not_started`. The same holds when the dialog's `open` cannot be
  applied (the stack is full).
- [D] Limits: at most 4 open requests device-wide, 1 on the X4 (Senior's answer to [Q] 4), and 1 per
  asker (asking again cancels the open one: outcome 1); over that `ERR_FULL`. The request and the
  first part of its text are allocated fallibly at `ask` (`ERR_NO_MEMORY`). **One nested question:**
  the dialog instance of an open request may ask one more, of kind 0 on slot `core.remote-keyboard`
  only (the keyboard's "type on the phone", `keyboard/src/lib.rs:644`), also on the X4; the nested
  one is cancelled when its parent request ends, and it cannot nest again (`ERR_FULL`). It inherits
  the parent's `secret` flag (its dialog instance is secret too). **While any instance guards** a
  nested question is `ERR_DENIED`: the phone keyboard would carry the PIN over the network. Refused
  for 1.0 (Manager's decision); allowing it later is an additive change. A request ends when
  answered (not `typing`), when its dialog closes without an answer (cancelled), or when the asker
  stops (no event). Asking from a screen ties the request to that instance: when it closes, the
  request is cancelled and its dialog closed. Asking from an action or an event is allowed.

### 3.2 Answering

| Tag | Record | Fields |
| --- | --- | --- |
| 82 | `event.answered` | `now_ms: u64`, `request: u32`, `kind: u32`, `outcome: u32`, `choice: u32`, `length: u32`, `flags: u32` |

- [D] The dialog reads the question with op 2 (`question`) and the text with op 10, writes its
  answer text with op 9 and commits with op 11 `answer` (`request`, `outcome`, `choice`). Only the
  instance the host opened for the request may answer (`ERR_STATE`); the first final answer wins.
  For kinds 0 and 3, an answer with outcome 0 or 2 needs a committed text (the last op 9 had
  `last`, else `ERR_STATE`).
- [D] `outcome`: 0 answered, 1 cancelled (no edit applies), 2 typing (a `live` text question: the
  text so far; the request stays open). Others `ERR_INVALID`. A consumer treats an outcome it does
  not know as cancelled.
- [D] What each kind answers: text, the request text (`length` its bytes); choice, `choice` (the
  line's index, `ERR_INVALID` past the list); confirm, `choice` 1 yes or 0 no; folder, the request
  text, a path on root 1 of at most 512 bytes (`ERR_INVALID` longer). Unused fields are 0.
- [D] **No subscription**: `event.answered` goes to the asking plugin by its request,
  through `dispatch_event`, without a `registration.event`; like 79 and 80 it is not registrable
  (`ERR_UNSUPPORTED` in `registration.event`; the SDK has no `EventKind` for it). The SDK hands
  addressed events (38, 39, 79, 80, 82, 109, 111) to the plugin whatever kinds it subscribed to.
  `dispatch_event` passes `token` 0 for 82 (the ask names no token); the plugin routes it by its
  tag and `request`, never by the token, which may equal one of its own.
- [D] **An answer is never lost.** `event.answered` is not a held-store edge: the answer stays in
  the request (its outcome, choice and text) and the request has its own pending mark, as a hint
  has (`core-events.md` 3.3), so the held-event store being full never drops it. The one
  exception is the X4 card: if it is pulled after the answer is committed, the event still comes
  with its outcome, choice and `length`, but the asker's op 10 read of a text with a card part is
  `ERR_IO` (section 3.1). The host encodes
  the event from the request when it delivers it to the asker (only the asker), in order with the
  asker's other events (the answer's place is when the dialog committed it). The asker reads the
  text with op 10 inside that callback. Memory is the request's own (section 8), bounded by the
  request limits.
- [D] **What the asker reads is what was answered.** Callbacks never overlap, so the text cannot
  change inside the delivering callback. Between an answer and its delivery, a `typing` update is
  withdrawn by the dialog's next op 9 (its pending mark is cleared; the next op 11 makes a new
  one), so a pending update always matches the committed text and its `length`. Typing updates
  replace each other, and a final answer replaces a pending typing update. After a final answer
  the dialog can no longer write (`ERR_STATE`), so the final text is fixed.
- [D] **Cleanup.** After the callback that delivered a final answer returns, the host frees the
  request and its text, whatever the callback's status (a failure is logged; the asker had the
  text in that callback). If the asker stops before delivery, the request is freed at its stop.
  A dialog still open after a final answer keeps no access to it (`ERR_STATE`); its own copy of
  the text is the dialog plugin's (it may keep a draft). `flags` bit 0: the dialog closed itself
  after this answer; bit 1 `not_started` (section 3.1); bit 2 `typing_stopped` (section 3.1).

## 4. Input filters and guards

### 4.1 The `core.input-filter` stage

- [D] A host-defined stage (`stages-services.md` section 1.3). A plugin subscribes with
  `registration.stage` naming `core.input-filter`; at most 4 subscribers device-wide, in the order
  plugins registered (interface 6 order). Each input (`input.key`, `input.pointer`,
  `input.gesture`) goes to the filters first, as the stage call's single input record, before
  screens, gestures and key maps. The hold-Power escape is checked before any filter and never
  reaches one.
- [D] Each subscriber replies with one `ui.verdict` record (stage-local tag 1):
  `kind: u32` 0 pass, 1 take, 2 run (`action: str 128`), 3 cancel, 4 replace (`input: bytes 128`,
  one input record), 5 raise (`input: str 64`, one of the subscriber's own declared inputs or
  gestures), 6 preview (`key: str 128`, `value: bytes 64`, appended optional fields of stage
  revision 1: see "Preview" below). Anything else, an empty reply or a failed callback is pass
  (logged). 1-6 end the filter chain; replace passes the new input on to the filters after it and
  everything else.
- [D] **Preview** (verdict 6, #104, stage `core.input-filter@1` revision 1; stepless edge-swipe
  light). A take that also shows `value` (a settings value, the codec of `settings.read`) for
  `key` in place of the one kept, as `command.preview_setting` would, and without a card write.
  The row is checked as a `preview_setting` row is (`registry.md` 4.4): registered, not secret,
  not a `core.grant.*` key, this plugin's to set, a value the setting takes; one that is not is
  taken all the same and shows nothing (logged). It is allowed at a key press, at a pointer down
  and at a pointer **move that begins the capture** (a finger recognized as a swipe only after it
  moved: the host cancels what the screens got of that finger first, as for verdict 3); anywhere
  else (a key repeat or release, an up, a gesture, a move of a finger already captured by another
  subscription) it counts as pass. The preview belongs to that capture (plugin, token and
  physical input): the capturer answers 6 again to a move of it and its value replaces the last;
  any other answer to a move keeps what shows. It ends at the capture's pointer up, cancel or key
  release, when the capture is released or the input path reset, and with any other preview set
  (a `preview_setting` command, another capture's verdict 6), so there is one at a time and it
  never outlives a finger. To keep the value the filter answers the up with 2 run: the host ends
  the preview first, then runs the action, which does the one `set_setting`, so a whole swipe is
  one write. A cancel keeps nothing. A device that follows the value (the X4 Pro's front light
  does, at once, from the effective setting) needs nothing else. Plugins that use it declare the
  revision (the generator derives `needs_minor`); a host without it counts the unknown kind as
  pass.
- [D] A filter that takes or cancels a pointer down takes it whole, to its up; one that takes a
  key press, its release too (interface 6 rule). If the capturing plugin stops, or its filter
  callback fails while it holds a capture, the host releases the capture: the rest of that
  pointer or key goes nowhere (the up or release is swallowed), and the next input starts fresh
  with all filters.
- [D] **The rest of a captured input** (Input and Code Reviewer on #353). A capture belongs to one
  subscription (owner and token: a plugin may subscribe with several tokens) and is keyed by the
  **physical** input (the key as the device gave it, or the pointer contact), not by what a
  replace turned it into. Its rest (the moves and up of a pointer, the repeats and release of a
  key) goes through the filters before the capturer as usual, so one that replaced the start can
  replace the rest the same way (their verdicts other than pass and replace are ignored for it),
  then to the capturer, with `filter.input.flags` bit 0 `captured`; nothing after it (no later
  filter, screen, gesture or key map) sees it. The capturer's verdict on the rest: 2 run and 5
  raise act (a recognizer raises its gesture at the up), 4 replace is ignored, the others just end
  it. `filter.input.flags` bit 1 `secret`: the instance on top is secret (section 1.2), so the
  filter keeps and logs nothing of it. Bits 2-31 are reserved: the host sends 0, a filter ignores
  them.
- [D] **Raise once per press** (Senior R1 on #870): verdicts 2 run and 5 raise act on every input
  they answer, the rest of a captured one included, so a filter that answers run or raise again
  on the key's repeat or release, or on the pointer's moves and up, runs its action again. A filter
  answers run or raise once per press (at the press, or at the up for a recognizer) and pass or
  take for the rest of it; the host does not deduplicate.
- [D] **Only the start is taken** (Senior #1225): a filter takes or cancels a pointer at its
  down and a key at its press. For a pointer up or move, or a key release or repeat, whose start
  it did not capture, take (1) and cancel (3) count as pass: the input goes on, so a screen that
  got the down always gets its up and never stays pressed.
- [D] **A replaced input** (verdict 4) is checked as plugin input: one `input.key`,
  `input.pointer` or `input.gesture` record, whole, else the verdict counts as pass (logged). Key
  names are not checked against a table (`screens-input.md` 2.2: unknown names pass through):
  `key` is 1 to 32 bytes of UTF-8 without control characters. Until the key path takes names it
  does not know (post-1.0), a replaced key whose name is not one of the device's keys
  (`core.device` op 15, the platform's button names) counts as pass (logged), as interface 6
  filters could only make those. A replace may not make `power`
  (it counts as pass): the Power key's escape and power actions come from the physical button
  only. The router clamps a replaced pointer's `x` and `y` to the screen's pane.
- [D] Cost: one callback per filter per input; on the X4 key presses only (no touch). Counts
  against the input-latency timing gate of the lock port.

### 4.2 Gesture recognizers

- [D] A gesture recognizer is a filter that answers 5 `raise` with its `gesture.<…>` input once it
  recognizes one; the key maps bind that name like any input. There is no separate recognizer
  callback.

### 4.3 Guards

- [D] An instance guards while its declared or current policy says so (section 1.2). While any
  instance guards, the **guard's plugin owns the input path and the stack above the topmost
  guarding instance**; everything else waits or is hidden. "The guard's plugin" below is the
  owner of the topmost guarding instance.
  - **Opens wait below.** An `open` (any mode), a dialog of another plugin's question, or a
    command 56 by any other plugin places the new instance directly below the topmost guarding
    instance: it gets no `draw` and no `input` until the guard ends (interface 6 rule). Only the
    guard's plugin opens above it (its own screens), and the dialogs of questions the guard's
    plugin asks open above it too, with their one nested question (section 3.1). The one other
    exception is the screen the host itself shows for a device state, the sleep screen of slot
    `core.sleep`: it shows above the guard, gets no input while the guard is up, and draws over a
    blank area (bit 2 `overlay`, section 1.2).
  - **Host confirmations.** A screen of the host's own that guards (the confirmation of
    `device.md` 5.0, e.g. for a firmware install) is the guard itself: it gets the keys and
    pointers, no plugin's input filter runs for it, no binding to a plugin's action or input
    applies, and `raise_input` is `ERR_DENIED` for every plugin. The host opens it only while no
    plugin's instance guards.
  - **Guard dialogs.** Such a dialog belongs to its plugin (the keyboard) but is authorized by
    the host for the guard's question: it is the top instance, so it gets keys and pointers, and
    its own plugin's filters run beside the guard's (section 1.2); it reads and writes its
    request's text and answers with ops 2, 9-11, and it closes itself (`close` 0) or is closed by
    the host when its request ends. It may close only its own instances above the guard and opens
    nothing else but its one nested question (`ERR_DENIED`); it is secret while it is above the
    guard. Its key layer applies as the guard's does (key maps below).
  - **Input.** Only the guard's plugin's input filters are called (the others are skipped, not
    called and ignored); keys and pointers then go to the top instance, which is the guard's
    plugin's. `raise_input` from any other plugin is `ERR_DENIED`.
  - **Key maps.** While the guard is up, a key runs only host actions and the guard's plugin's
    own actions, checked when the key is dispatched. What decides is the action's owner, never the
    layer (#843): a binding in any layer, the guard's own key layer (`set_key_layer`) included,
    that names another plugin's action or input does nothing while the guard is up (logged),
    whoever put it there (a declared `key.bind`, the user, a preset), so a key map can never run
    another plugin's code past the lock. Plugin ids `core` and `core.*` are reserved, so no
    plugin's action passes for a host one.
  - **Closing.** Only the guard's plugin closes the guarding instance or any instance above it
    (`close`, `back_to`: `ERR_DENIED` for others), except a guard dialog closing itself, so no
    other plugin closes the lock's keyboard.
  - **Stack.** For every other plugin, `core.ui` op 1 lists only the topmost guarding instance
    (`screen`, `owner`, flag guards) and nothing above or below it; `service.end.flags` bit 2
    says rows were left out. The guard's plugin sees the instances from the guard up.
  - **Drawing below.** Under another plugin's overlay nothing at or below the guard is drawn
    (section 1.2): the sleep screen never shows the page while the device is locked. A screen
    below the guard is not the top instance, so it makes no widget (op 4 `ERR_STATE`, checked
    before any guard rule). The widget instances it made before are `ERR_DENIED` for ops 6, 7,
    12 and 13 while the guard is up, and so are ops 14 and 15 for it; it may still drop them
    (op 5: dropping frees memory and shows nothing).
  - **Output.** No `notify` is drawn over it (it waits, section 7); help shows nothing for any
    screen while the guard is up except the guard's plugin's own.
  - Core's tests cover each of these (hand-off, section 10).
- [D] **Private widgets and status** (Plugin: book titles, covers and highlights,
  `widgets/src/books.rs`). Widgets and status values stay usable under a guard (a clock on the
  sleep screen of a locked device), except those declared `private`: `widget.spec.flags` bit 1,
  `status.item.flags` bit 1, `status.line.flags` bit 1. While any instance guards, for every
  plugin but the guard's: a private widget is not made, measured, placed, targeted, sent input or
  composed (ops 4, 6, 7, 12, 13 and slot 35 `ERR_DENIED`; instances made before keep their handle
  but draw nothing); a private status item comes back from op 14 with `flags` bit 1 `hidden`, no
  text and no handle; a private status line is `ERR_DENIED` at op 15. The host drops cached
  private values when a guard starts. Undeclared means not private; the guard's plugin decides
  what its own screens show.
- [D] **Sealed actions** keep `reg_item.flags` bit 1 (`registry.md`): no other plugin's handler
  overrides the action (the lock's unlock).

## 5. Composition: one plugin's drawing inside another's

The home screen shows widgets and status lines, the sleep screen shows the screen below and
widgets, settings pages show previews: one plugin draws a rectangle that another plugin fills. The
showing plugin never runs another plugin's code itself: it asks the host (`core.ui` ops, slot 35),
and the host runs the owner's callbacks and the host-defined stages (`stages-services.md` 1.3:
`core.*` stages are run by the host only).

### 5.1 The compose slot

```
ui.compose(ctx, kind: u32, handle: u32, x: i32, y: i32, width: u32, height: u32) -> i32
```

- [D] New host slot 35, appended to `PpHost`. Only inside the caller's own `draw` callback
  (else `ERR_STATE`). `kind`: 0 a widget instance (purpose 4), 1 a drawn status item (purpose 3),
  2 a status line (purpose 5, new); others `ERR_INVALID`. A screen is never composed into another:
  the screen below an overlay is drawn by the host as itself (section 1.2). `handle` the
  instance or the handle op 14 gave. The host calls the owner's `draw` with that purpose, `id` the
  handle, the rectangle given and the caller's clip intersected with it (empty: no call, `OK`).
  Drawing outside is clipped by the canvas slots.
- [D] Refusals: an unknown or closed handle `ERR_NOT_FOUND`; a widget made by a screen below the
  guard or a private one (section 4.3) `ERR_DENIED`; **a target owned by the
  caller's own plugin `ERR_BUSY`** (the host's per-plugin re-entry guard: a plugin is never
  re-entered while its `draw` runs; it draws its own widgets itself); a call from depth 2
  `ERR_BUSY`.
- [D] **Status items and lines are never hidden by compose.** The guard and private rules above
  apply to widget instances only. The privacy of a status item or line under a guard rests on
  the filter applied when its handle is granted (ops 14 and 15, section 4.3); the handle lasts
  only for the callback that asked, so compose has nothing more to judge.
- [D] **Depth.** The caller's `draw` runs at depth 1, the child's at depth 2. A child cannot
  compose (`ERR_BUSY`) or run a stage (`stage.run` is depth 1 only), and ops 4, 7 and 12-15
  are depth 1 only. Only widgets and status values are children, and they hold no widgets
  themselves (op 4 `ERR_BUSY` at depth 2), so nothing visible is lost; screens under an overlay
  are drawn at depth 1 with everything (section 1.2).
- [D] **State.** The host saves the caller's clip and canvas state before the child and restores
  them after it, also when the child fails or faults. The child's failure is its status, logged;
  the caller's frame stays.
- [D] **Isolation.** The child gets no handle to the caller's state and the caller none to the
  child's; they share the canvas inside the clip rectangle. Whatever a plugin may read back from
  the framebuffer (the #251 probe, host-only today) it may read of a composed child too. Screens
  are never composed, and a secret instance is not drawn under another plugin's overlay, judged
  at each frame by section 1.2 (declared, set at run time, guarding, or above a guarding
  instance), so a password keyboard is never drawn inside or under another plugin's screen.
- [D] **X4 stack.** Two plugin frames and the host frame between them share the main stack, for slot
  35 and for ops 7 and 12-15 alike (each runs another plugin's callback inside the caller's): they
  join the frame budget of #254 (limit 2,048 bytes per frame), with a device high-water case (home
  with widgets under the sleep screen's widgets) before activation; the stack gate passed on the
  X4 (#250) and is open by default; the core feature `x4-gate-closed` closes it again (the X3's
  firmware builds with it until an X3 has measured the gate; the X4 then
  answers slot 35 and those ops with `ERR_UNSUPPORTED`). The kernel's own status
  items run no plugin and are answered there (op 14, slot 35 kind 1; section 5.3).

### 5.2 Widgets

| Tag | Record | Fields |
| --- | --- | --- |
| 224 | `widget.spec` | `name: str 96`, `title: str 96`, `category: str 96`, `previews: str 128`, `cells: u32`, `token: u32`, `flags: u32` |
| 225 | `widget.place` | `name: str 96`, `title: str 96`, `list_keys: str 1032`, `layout: u32`, `shown_if_key: str 128`, `shown_if_value: str 128` |
| 84 | `event.widget_made` | `now_ms: u64`, `widget: str 128`, `instance: u32`, `place: str 128` |
| 85 | `event.widget_dropped` | `now_ms: u64`, `instance: u32` |
| 86 | `event.widget_changed` | `now_ms: u64`, `instance: u32` |
| 1556 | `command.widget_changed` | `instance: u32` |
| 193 | `input.widget` | `now_ms: u64`, `instance: u32`, `target: u32`, `x: i32`, `y: i32`, `kind: u32` |

- [D] `widget.spec` declares a widget: `category` one of the host's
  widget kinds or a catalog key of the plugin's own, `previews` the settings group it previews
  (empty for none), `cells` columns in bits 0-7 and rows in bits 8-15 (0: the grid's width and the
  rows it needs), `token` its callback state; `flags` bit 0 `live` (read each minute; without it
  only after events), bit 2 `square` (as wide as high; interface 6 `SizeHint::square`). **Size
  hint (draft 29, interface 6 `SizeHint`):** `cells` bits 16-23 the least columns and bits 24-31
  the least rows (0: one); a declared column or row count under its least, a square widget that
  declares two different sides, or a square widget's declared side under either least, is
  `ERR_INVALID` at admission (a square widget's side is at least the larger least). The host and
  a home screen never lay a widget out below its least, and keep a square one square. REG op 19 lists them,
  with `cells` and `square` (`reg_widget`).
- [D] `widget.place` declares where widgets show: `list_keys` the
  settings that list them (full ids, one per line, at most 8: a grid's pages each one), `layout`
  0 grid, 1 stack; `shown_if_key` and `shown_if_value`: the place shows only while that setting
  has that value (interface 6 `shown_if`; both empty: always, one empty `ERR_INVALID`).
- [D] **Lifetime.** A screen that shows a widget makes an instance with op 4 and drops it with
  op 5; the host drops a screen instance's widgets when it closes. The owner gets `widget_made` /
  `widget_dropped` at its token and keeps the instance's data.
- [D] **Shown** (interface 6 `Widgets::shown`, used to fetch only then: weather) is not "has
  instances": a widget is shown when a place whose `shown_if` holds lists it (its base id, also a
  placement `x@2`) in one of its `list_keys`. The host works it out from the settings at the
  time of the query: REG op 19 `reg_widget.flags` bit 0 `shown` (`registry.md` section 3).
- [D] **Layout** (interface 6 `height`, `min_height`, `place`, `targets`): the showing screen asks
  through op 12 `widget_measure` (`instance`, `width` → `height`, `min_height`; 0 height: nothing to
  show), tells the place with op 13 `widget_place` (the rectangle, before the first draw there and
  when it changes), and reads targets with op 7 (`instance`, the rectangle → `ui_target` rows,
  reading order; Senior's answer to [Q] 1: targets follow live content, so the owner answers each
  time). The owner returns at most 32 targets per call (more `ERR_NO_SPACE` for the owner's reply,
  logged, no targets); op 7 is not paged: one call answers all of them, at most 32 `ui_target` rows
  and its `end` (about 1 KiB), so the host keeps nothing between calls and a `widget_changed` only
  means the next call answers anew. The host answers each by one call of the `core.widget` stage to
  the owner only (stage-local records `widget.measure`, `widget.place`, `widget.targets` and their
  replies; the owner is subscribed by its `widget.spec`, no `registration.stage`).
- [D] **Updates.** The owner says its widget shows something new with `command.widget_changed`
  (own instances); the host sends `event.widget_changed` (a hint, coalesced per instance) to the
  plugin whose screen made it, which measures and draws again. The minute tick stays `event.tick`.
  86 is registrable: the maker subscribes with `registration.event` and gets it at that token
  (a maker that did not subscribe is not told). The host delivers it between callbacks, never
  inside one, once per instance however often the owner said `command.widget_changed`, and only
  while the instance lives. A guard does not hold it (a hint); what the maker then does to its
  screen follows the stack's rules (`redraw` of a screen with a non-overlay or a guard above it
  is `ERR_STATE`).
  `command.widget_changed` names only the submitter's own instances: an unknown or dropped one is
  `ERR_NOT_FOUND`, another plugin's `ERR_DENIED`, and a shell without a widget table answers
  `ERR_UNSUPPORTED` (todo 361, #845).
- [D] **Input.** The showing screen forwards a tap or long press with op 6 (`widget_input`); the
  owner gets `input.widget` through `input` (`kind` 0 tap, 1 long press; `target` from op 7, 0 for
  none). Moving between targets with buttons stays the showing screen's.

### 5.3 Status items, lines and places

| Tag | Record | Fields |
| --- | --- | --- |
| 226 | `status.item` | `name: str 96`, `title: str 96`, `tap: str 96`, `priority: u32`, `min_width: u32`, `token: u32`, `flags: u32` |
| 227 | `status.line` | `name: str 96`, `title: str 96`, `height: u32`, `token: u32`, `flags: u32` |
| 228 | `status.place` | `name: str 96`, `title: str 96`, `left: str 128`, `center: str 128`, `right: str 128` |

- [D] A screen that shows a status line asks for its items' values with op 14 `status_values`
  (`items`: full ids, one per line, at most 8, a longer line asks twice; `context`: a `ui_param`
  stream, the reader's
  `title`, `chapter`, `page`, `progress`) and gets one `ui_status_value` row per item (`item`,
  `flags`, `text`, `handle`), then `end`. The host runs the **host-defined stage `core.status`**
  once per owning plugin and `status.item.token` for its items (stage-local `status.ask` /
  `status.value`) and caches the values per (item, context) until event 73 (`status_changed`) or
  the minute tick.
- [D] **Status calls (Core's question, todo 76).** Own items, hidden private ones and cached values
  need no call. The rest are grouped by (owner, token), groups in the order of their first item
  in op 14's `items`; each group is one call through `dispatch_stage` with that token,
  `status.ask.items` only the group's ids in op 14's order and `context` op 14's, byte for byte.
  At most 8 items, so at most 8 calls. This is not `stage.run`: one target, membership from the
  registered `status.item` rows (no `registration.stage`, no `order`, no frozen membership), the
  stage's codec and caps (1 input record, at most 8 reply rows, 3,840 bytes). The caller is at
  depth 1, the owner runs at depth 2 under the re-entry guard and N8; the host holds no store
  borrow across the owner's code. Reply rows whose `item` is not in the group are ignored, the
  first row of an item wins. An item without a row, or whose owner call fails (`ERR_BUSY`, an
  error, a crash, over budget), comes back with `flags` 0, `handle` 0 and no text, not cached; op
  14 still answers `OK`, and other groups are unaffected. A value is text
  (at most 128 bytes) or, with `flags` bit 0, drawn: the showing screen composes it with
  `ui.compose` kind 1 and the row's `handle`. A handle is valid only inside the callback that got
  it, so a drawn item is asked for with op 14 inside `draw`, then composed in the same `draw`.
- [D] **An empty value hides the item** (Port Reviewer, #343): a row with no text and `flags` bit
  0 clear (an owner answering empty text, or no value at all as above) is not shown; the line
  gives its room to the other items, as interface 6 did for an item without a value. A provider
  that wants a blank place answers a space.
- [D] **Own items are not called back.** The host never re-enters the caller (section 5.1): an
  item of the caller's own plugin (the reader showing its own page number) comes back from op 14
  with `flags` bit 2 `own`, no text and no handle, without a `core.status` call; the caller fills
  it itself. Op 15 for an own line returns `ui_instance` with `flags` bit 0 `own` and instance 0.
  Likewise op 4 for an own widget returns `flags` bit 0 `own`; for such an instance ops 6, 7, 12
  and 13 and slot 35 are `ERR_BUSY` without a call, and the plugin measures, places and draws its
  own widget itself.
- [D] **The kernel's own items** (`core.status.clock`, `.date`, `.date-short`, `.battery`,
  `.battery-low`; #257) have no plugin owner: op 14 answers them without a `core.status` call. The
  clock and the dates are text (cached as above; the minute tick renews them). The battery items
  come back drawn (`flags` bit 0) with a handle whose owner is the host (owner 0, never a plugin's)
  and whose token is the kernel item's index, valid in this callback only as any handle; slot 35
  kind 1 draws it as Beta 3 did (the symbol and the percentage, UI font, size from the rect's
  height), calling no plugin. Neither needs a nested call, so the X4 answers them while its stack
  gate is closed (section 5.1); there a plugin's item comes back with no value (`flags` 0, no
  text, no handle: hidden, as below), not a refusal of the whole op.
- [D] A status line (whole line drawn by its owner) gets its handle from op 15 `status_line`
  (`line`, `context` → `handle`) and is composed with kind 2.
- [D] `status.item.tap` is one of the owner's actions, run as the owner with the line's context;
  `priority` 0-255 (higher stays longer); `min_width` in thousandths of the text size (0: its own
  width). `status.line.height` in thousandths of the text size. `status.place` names the three
  settings that list a line's items. `status.item.flags` and
  `status.line.flags` bit 1 `private` (section 4.3); other bits `ERR_INVALID`. REG op 21 (new,
  Senior's answer to [Q] 2) lists items and lines, one row type per op; op 19 stays widgets only.
  It lists the kernel's own items too, after the declared items and before the lines.
- [D] `draw.frame.purpose` gains 5 `status line`.

## 6. The service `core.ui` (major 1)

Bare reply streams and paging as `core.registry` (`registry.md` section 2.1) with `page_rows` 8
(a `ui_screen` row is 339 bytes: 8 rows and `end` fit 4,096, 12 would not). Paged ops: 1 and 3.
Ops 7, 14 and 17 are lists that are not paged: one call writes all rows, at most 32, 8 and 32,
then one `end` with `total` the rows written and `next`, `generation` and `flags` 0 (anything
else is `ERR_INVALID`). The schema says this per op (`paged: false`, `reply_rows`), and op 16's
input holds up to 32 `ui_param` records (`input_rows: 32`): one counted batch, encoded with the
generated `records_encode_counted` and decoded by the host with `host_records_visit`, never cut.
For the host implementer: `host_records_visit` checks the whole batch before its first visit,
but an error the visitor itself returns stops the walk with the earlier visits done. So the op 16
handler stages the params in its own scratch and publishes the hand-over only after the walk
returned `OK`; a refusal leaves no hand-over and no partial params.
Ops that run another plugin's callback (7, 12-15) are allowed at depth 1 only (`ERR_BUSY` deeper),
and so is op 4 (a child holds no widgets, section 5.1). Op 6 runs nothing inside the caller: the
host queues `input.widget` for the owner's `input` callback, as other input. Op 5 has no depth
or guard rule: only the maker drops its instances.

| Op | Name | Input | Reply | Who |
| --- | --- | --- | --- | --- |
| 1 | `stack` | `reg_query` | `ui_screen`*, `end` | anyone; top first, guarded rows left out |
| 2 | `question` | `ui_request` | `ui_question` | the request's dialog instance |
| 3 | `hints` | `reg_query` (`scope`: screen id) | `ui_hint`*, `end` | anyone (the help plugin) |
| 4 | `widget_make` | `ui_widget_ref` | `ui_instance` | for the caller's top instance (else `ERR_STATE`) |
| 5 | `widget_drop` | `ui_instance` | (none) | the instance's maker |
| 6 | `widget_input` | `ui_widget_input` | (none) | the instance's maker |
| 7 | `widget_targets` | `ui_widget_area` | `ui_target`*, `end` | the instance's maker |
| 8 | `ask` | `ui_ask` | `ui_request` | anyone (section 3.1) |
| 9 | `text_write` | `ui_text` | (none) | sections 1.1, 3.1 |
| 10 | `text_read` | `ui_text_at` | `ui_text` | sections 1.1, 3.1 |
| 11 | `answer` | `ui_answer` | (none) | the request's dialog instance |
| 12 | `widget_measure` | `ui_widget_area` | `ui_size` | the instance's maker |
| 13 | `widget_place` | `ui_widget_area` | (none) | the instance's maker |
| 14 | `status_values` | `ui_status_ask` | `ui_status_value`*, `end` | anyone, inside its draw or event callback |
| 15 | `status_line` | `ui_status_ask` | `ui_instance` | anyone, inside its draw callback |
| 18 | `clipboard_write` | `ui_text` | (none) | anyone (section 7) |
| 19 | `clipboard_read` | `ui_text_at` | `ui_text` | anyone (section 7) |
| 16 | `handover` | `ui_param`* | `ui_handle` | anyone, for its own `open` (section 1.1) |
| 17 | `params` | `ui_handle` | `ui_param`*, `end` | the instance the hand-over was given to |

| Tag | Record | Fields |
| --- | --- | --- |
| 1041 | `service.ui_screen` | `screen: str 128`, `instance: u32`, `slot: str 128`, `owner: str 64`, `flags: u32` |
| 1042 | `service.ui_request` | `request: u32` |
| 1043 | `service.ui_question` | `kind: u32`, `flags: u32`, `max_bytes: u32`, `title: str 256`, `text: str 1024`, `choices: str 2048` |
| 1044 | `service.ui_hint` | `input: u32`, `x: u32`, `y: u32`, `width: u32`, `height: u32`, `text: str 128`, `owner: str 64` |
| 1045 | `service.ui_widget_ref` | `widget: str 128`, `place: str 128` |
| 1046 | `service.ui_instance` | `instance: u32`, `flags: u32` |
| 1047 | `service.ui_widget_input` | `instance: u32`, `target: u32`, `x: i32`, `y: i32`, `kind: u32` |
| 1048 | `service.ui_target` | `target: u32`, `x: i32`, `y: i32`, `width: u32`, `height: u32` |
| 1049 | `service.ui_ask` | `kind: u32`, `flags: u32`, `slot: str 128`, `title: str 256`, `text: str 1024`, `choices: str 2048` |
| 1050 | `service.ui_text` | `text: u32`, `offset: u32`, `total: u32`, `flags: u32`, `data: str 3072` |
| 1051 | `service.ui_text_at` | `text: u32`, `offset: u32` |
| 1052 | `service.ui_answer` | `request: u32`, `outcome: u32`, `choice: u32` |
| 1053 | `service.ui_widget_area` | `instance: u32`, `x: i32`, `y: i32`, `width: u32`, `height: u32` |
| 1054 | `service.ui_size` | `height: u32`, `min_height: u32` |
| 1055 | `service.ui_status_ask` | `items: str 1032`, `context: bytes 1024` |
| 1056 | `service.ui_status_value` | `item: str 128`, `flags: u32`, `handle: u32`, `text: str 128` |
| 1057 | `service.ui_param` | `key: str 32`, `value: str 1024` |
| 1058 | `service.ui_handle` | `handle: u32` |

- [D] `ui_screen.flags`: bit 0 overlay, 1 guards, 2 covered (another instance listed to the caller
  is above it: under a guard another plugin sees the guard row without it, and only
  `service.end.flags` bit 2 says rows were left out; the guard's plugin sees it for the instances
  above its guard), 3
  waits ready and not yet ready, 4 secret. `owner` is host-stamped.
- [D] No feature is needed: what is on screen is not private (guarded parts are left out), and
  every op that touches a request, an instance or a handle checks that it is the caller's.
- [D] `ui_param` (Senior's answer to [Q] 3) is a service row of this block, a neutral tag outside
  the event block: in op 16's input, op 17's reply and nested in `ui_status_ask.context`, nowhere
  else. **Two-way records** (sent by plugins and by the host, so never in the host-sent-only list of
  #270, `abi7_host_decode.rs` `HOST_ONLY`): `ui_param`, `ui_handle` (op 16 out, op 17 in), `ui_text`
  (ops 9 and 18 in, ops 10 and 19 out), `ui_instance` (ops 4 and 15 out, op 5 in) and `ui_request`
  (op 8 out, op 2 in). Host-sent only: `ui_screen`, `ui_question`, `ui_hint`, `ui_target`,
  `ui_size`, `ui_status_value`; the rest are plugin-sent. `ui_text.data` is cut only at UTF-8
  boundaries; `items` at most 8 lines of at most 128 bytes.

## 7. Messages, help, clipboard, speech

| Tag | Record | Fields |
| --- | --- | --- |
| 30 | `help.hint` | `screen: str 128`, `input: u32`, `x: u32`, `y: u32`, `width: u32`, `height: u32`, `text: str 128` |
| 1557 | `command.screen_ready` | (none) |
| 87 | `event.screen_ready` | `now_ms: u64`, `screen: str 128`, `instance: u32` |
| 1558 | `command.notify` | `text: str 256`, `flags: u32` |
| 1561 | `command.speak` | `cookie: u32`, `text: str 2048`, `language: str 35`, `rate: u32`, `flags: u32` |
| 1562 | `command.stop_speaking` | (none) |
| 89 | `event.spoken` | `now_ms: u64`, `cookie: u32`, `status: u32` |

- [D] **Help.** `help.hint` declares a hint for any screen (own or another's, full id): `input` 0
  any, 1 touch, 2 buttons; the zone in thousandths of the screen (all 0: no zone, listed in the box;
  `x + width` and `y + height` at most 1,000, added with overflow checks (a sum that overflows is
  over 1,000), else `ERR_INVALID` at admission; the same hint (`screen`, `input`, `text`) twice in a
  plugin's declarations is `ERR_INVALID` for the batch (#818), and a reader treats a `ui_hint` row
  that breaks it as malformed, never clamped); `text` a catalog key of the declaring plugin (`owner`
  in op 3 says whose catalog). Op 3's rows come in plugin slot order (admission order), then each
  plugin's declaration order (batch, then record); a slot freed by a removal and reused by a later
  plugin can move that plugin earlier. The help plugin reads them with op 3, subscribes to
  `event.screen_ready` (an edge, registrable) and to 81. A screen declared `waits_ready` sends
  `command.screen_ready` once its first page is drawn (own top instance, else `ERR_STATE`); for
  other screens the host raises 87 itself after the first `draw` of each instance. The help plugin
  closes its own overlay by instance (section 1.3) and resets "seen" in its own data.
- [D] **Messages.** `notify` shows `text` (display text the plugin formatted, at most 256 bytes)
  over any screen for a few seconds, host-drawn, never over a guarding instance (it waits until the
  guard closes, one after the other in the order they came, at most 4 waiting, 2 on the X4, older ones dropped; without a guard a new message replaces the one on screen and shows its full time). `flags` bit 0 `announce`: also
  from background work and when no screen of the plugin shows (interface 6 `Announce`: device
  messages and rules the user set up; never sync results or offers). Without bit 0 a message from a
  plugin with no instance on the stack is dropped (`OK`, logged). Other bits `ERR_INVALID`.
- [D] **Clipboard.** Text only, at most 4,096 bytes, not across
  restarts; every device has one (Senior's answer). It is a host text with the fixed id 0 (section
  3.1 rules: append-only parts, start over at 0, committed by `last`): op 18 `clipboard_write`
  (`ui_text`, `text` 0) writes it in parts, a write at 0 replaces the old clipboard only when its
  new text is committed (until then reads see the old one; an uncommitted new text is dropped when
  the writer's callback returns); op 19 `clipboard_read` (`ui_text_at`, `text` 0) reads it in parts
  (`total` 0: empty), any plugin, at once. Keeping a `secret` answer (section 3.1) off it is the
  dialog plugin's duty; the host cannot enforce it (decision 44). It is the kernel's one clipboard
  on every device, in host memory as in interface 6 (the X4 included; no card file, so no
  `ERR_IO`): interface-6 and native plugins see the same text. A new text past 4,096 bytes is
  `ERR_NO_SPACE` (never cut); one that cannot be kept is `ERR_NO_MEMORY`, the old text stays. A
  commit is copied out to the system clipboard where the shell has one (Android); reading the
  system clipboard into op 19 is a shell follow-up (Firmware todo 392).
- [D] **Speech.** `speak` queues `text` (display text, at most 2,048 bytes) in `language` (a BCP
  47 tag, empty for the system's) at `rate` percent (50-300, else `ERR_INVALID`); `flags` bit 0
  `queue` (after what is being spoken, else replacing it); at most 4 texts per plugin, the one
  being spoken included: a queued `speak` beyond is `ERR_FULL` (nothing queued, no `spoken`), one
  without `queue` replaces and never meets the cap. `spoken` comes when it was spoken or
  could not be (`status` 0 spoken, 1 replaced or stopped, 2 no voice for the language, 3 no speech
  on this device). Only `menu.need` 0 (`speech`) devices speak; elsewhere `spoken` status 3 at
  once. `stop_speaking` stops the submitter's own speech only: where its text is the one being
  spoken the host's one voice stops, and what waited behind it (another plugin's too) ends with
  `spoken` status 1; where its text only waits behind another's, it is dropped from the line
  (status 1) and the voice goes on. `spoken` goes to plugins that subscribed to it (event 89),
  the submitter alone.

## 8. Sizes and memory

### 8.1 Every record fits its limit

Encoded sizes at the caps (bitmap 1 byte; a `str N`/`bytes N` field takes a 2-byte length and N
bytes; scalars 4 or 8; a record frame adds its tag and a 2-byte length; a batch its count byte).
Limits: a command batch and a service input 4,096 bytes (`commands.md`, `stages-services.md`),
a service reply `max_reply` 4,096, a stage payload 3,840. Each case gets a test that encodes it at
its caps (hand-off).

| Record | At its caps | Limit |
| --- | --- | --- |
| `ui_ask` (op 8 input, batch) | 1 + 4 + 4 + 130 + 258 + 1,026 + 2,050 = 3,473, framed 3,478 | 4,096 |
| `ui_question` (op 2 reply) | 1 + 12 + 258 + 1,026 + 2,050 = 3,347, framed 3,351 | 4,096 |
| `ui_text` (ops 9, 10, 18, 19) | 1 + 16 + 3,074 = 3,091, framed 3,096 | 4,096 |
| `ui_status_ask` (ops 14, 15) | 1 + 1,034 + 1,026 = 2,061, framed 2,066 | 4,096 |
| `ui_status_value` × 8 + `end` (op 14) | 8 × 273 + about 30 = 2,214 | 4,096 |
| `ui_screen` page (op 1) | row 1 + 130 + 4 + 130 + 66 + 4 = 335, framed 339; 8 rows + `end` = 2,742 | 4,096 |
| `ui_target` (op 7; `core.widget` reply) | row 21, framed 25; a page 8 × 25 + `end` = 230; the owner's 32 = 800 | 4,096; 3,840 |
| `ui_param` × 32 (op 16 input, op 17 reply) | key and value bytes at most 1,024 in all, plus 32 × 9 of fields and frames, + 1 = 1,313 (+ `end` on op 17) | 4,096 |
| `command.open` | 1 + 130 + 4 + 130 + 4 = 269, framed 274 | 4,096 and the stage budget |
| `event.screen_opened` | 1 + 8 + 130 + 4 + 130 + 4 × 4 = 289, framed 293 | the 1.1 KB stack buffer of `core-events.md` 3.3 |
| `event.screen_hidden` | 1 + 8 + 130 + 4 = 143, framed 147 | the 1.1 KB stack buffer of `core-events.md` 3.3 |
| `ui.verdict` (filter reply) | under 200 | 3,840 |

### 8.2 Memory (X4)

"The X4" in the limits of this section and of `core.ui` means the 256 KiB heap profile: the X4
and every device of that profile (the X3 too), not the model.

- Instances: one entry per open instance (about 16 bytes; the stack is at most 16 deep, deeper opens
  are `ERR_FULL`) plus its hand-over's params, kept while it is open, stored encoded (at most 1,313
  bytes each). On the X4 the params of all instances share 1,536 bytes (op 16 `ERR_FULL` beyond):
  the largest real hand-over is one long selected text, which goes in the hand-over's text, and real
  params are a few dozen bytes (Plugin's inventory #984). Allocated fallibly at op 16
  (`ERR_NO_MEMORY`). At most 12 hand-overs exist at once on the X4 (64 elsewhere; an empty one
  counts, `ERR_FULL` beyond).
- Host texts (request texts and hand-over texts, sections 1.1 and 3.1): up to 24,576 bytes each.
  On the X4 at most 4 at once (the question, its nested question, two hand-overs; `ERR_FULL`
  beyond), each with at most 512 bytes in memory and the rest in a host file on the card (a
  secret text up to 8,192 bytes, in memory only, as long as typed, in its own pool of 8,960 bytes: 32
  chunks and their descriptors), so texts cost at most 9.5 KiB of heap, and 11 KiB with no card
  (2 KiB pool + the secret pool); elsewhere at most 16, in
  memory. A text is held in chunks of 256 bytes filled in place, and the pool is charged each
  chunk's capacity and descriptor (24 bytes), not only the bytes written, so a text written a
  byte at a time stays inside the pool; a secret text has its own pool (8,960 bytes on the X4) and
  never uses the ordinary one.
- Questions: at most 4 open requests device-wide (on the X4 one and its nested one), about 24
  bytes each plus the question (title, text, choices: at most 3.3 KiB), allocated fallibly at
  `ask` (`ERR_NO_MEMORY`). On the X4 the question goes to the request's card file with its text
  and op 2 reads it from there, so questions cost about 50 bytes of heap, nothing when none is
  open. Without a card, and until the card file is wired, every kept question (title, text and
  choices, up to 3.3 KiB) is charged to a question pool of 4 KiB on the X4 (64 KiB elsewhere):
  `ERR_FULL` at `ask` beyond, nothing changed. The question and secret pools are limits, not reservations: each question, text chunk and secret
  chunk is allocated fallibly when the request or the secret text starts and freed when it ends,
  so nothing is held at rest. At most 3 request rows are kept at once on the X4 (16 elsewhere), a cancelled or answered
  one until its event is delivered (`ERR_FULL` at `ask` beyond).
- **X4 worst case: activation-gate item.** Until the card file is wired the code has no card
  path, so the line is the one without a card: instances 0.25 + params 1.5 + texts 11 (2 KiB
  ordinary pool + 8,960-byte secret pool, 8.75 of it only while an 8 KiB password is typed) +
  questions 4 (pool) + widgets 0.5 + status handles 0.3 + status cache 1 + clipboard 4 +
  messages 0.5 = **about 23 KiB**. The clipboard's 4 KiB are resident while it holds text; for
  moments it takes more, all fallibly: up to 8 KiB while a replacement is written (old and new
  text), up to 4 KiB more for the copy out at a commit until the shell takes it, and a read part
  of up to 3 KiB during op 19. A restarted text (offset 0) never adds a peak above its
  pool: when old and new chunk do not both fit the pool, the old text is freed (wiped) first,
  so the peak is the larger of the two and inside the pool (after that, a refused allocation
  leaves the text started over and empty). With a card, the questions and texts move to the
  card file and the line falls to about 17.6 KiB (not before that path exists). Op 7 keeps no
  target cache: it is not paged, section 5.2. Every part is allocated fallibly (a refusal is
  `ERR_NO_MEMORY` or `ERR_FULL`, never a panic); typical use (a few instances with small params, one short question, a status line)
  about 2.4 KiB, under the 4 KiB heap gate. Gate before the UIX host is active on the X4: the worst
  case is a line of the X4 heap budget and the typical case is measured on the device under 4 KiB
  (hand-off: Firmware, R3 heap measurement).
- Answers are not held-store edges: each request carries its answer and a pending mark (section
  3.2), so they cost nothing beyond the request.
- Filters: at most 4 subscribers; one stage call per input on the host scratch.
- Composition: no host memory; nesting as `stages-services.md` (depth 2). Ops 7 and 12-15 run one
  stage call each on the host scratch and nest another plugin's callback inside the caller's just
  as slot 35 does: they share slot 35's frame-budget entry and X4 stack gate (section 5.1), and
  answer `ERR_UNSUPPORTED` on the X4 until it passes, but for the kernel's own status items (op 14
  and slot 35 kind 1, no plugin called; section 5.3).
- Widgets: 32 bytes per made instance (the owner's full-width id; 512 bytes at the 16 of the X4),
  at most 32 device-wide (16 on the X4); status handles 40 bytes each, at most 16 (8 on the X4, 320
  bytes); each table is one allocation of its cap, made at its first use. A dropped instance stays
  listed for its owner until `event.widget_dropped` (85) is delivered at the widget's token, so
  live instances and drops not yet delivered share the cap: op 4 answers `ERR_FULL` while the
  waiting drops fill it (#599), and makes again once they are delivered. The entry ends at the
  first delivery attempt, whatever its outcome (the callback returned, failed or trapped), and at
  once when delivery cannot happen: the owner stopped (`owner_stopped`), unloaded or switched off,
  or the start went without code plugins (safe mode). A dead owner never pins the cap.
- Status values: a cache of at most 2 KiB (1 KiB on the X4; when full, values are asked again),
  dropped on event 73.
- Clipboard: at most 4 KiB, host heap on every device (the X4 included), fallible; X4
  activation-gate item with the worst case above. Messages: at most 4
  waiting, 1 KiB (2 waiting, 512 bytes on the X4).
- New slot 35 and the stage/command arms are flash cost on the X4 ppn5 delta; measured with the
  records.

## 9. Interface-6 calls and their interface-7 form

## 10. Hand-offs (after approval)

- **Kernel:** records, `core.ui@1` schema, the three stage schemas (`core.input-filter`,
  `core.status`, `core.widget` targets), slot 35 in `abi.def`; generator and lock; REG op 21
  (status items and lines) and the op 19 `shown` flag in `registry.md`; this document final.
- **Core:** the stack with instances, hand-overs and policies, commands 1547-1563, the request
  table with nested questions, the host text pool (X4 card part, secret texts in memory only),
  overlay drawing of the screen below, the clipboard text, filter capture release, filter
  dispatch and guards, `ui.compose`, widget instances, status cache, clipboard and speech arms
  (speech through the shell), `core.ui` ops.
- **Firmware/shells:** speech and clipboard backends (Android), notify drawing, the X4
  measurements: the nested-callback stack gate (slot 35, ops 7 and 12-15) and the UIX line of the
  heap budget with the typical-case device measure (section 8.2).
- **Services:** SDK facade (navigation builders, `ask` helpers with typed answers, filter and
  status stage helpers, widget make/compose, help builders).
- **Plugin:** the ports, starting with keyboard, help, lock, sleep, home.
