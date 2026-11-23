# Interface 7: registry (REG)

Status: **draft** of family 2 (#228), revised after Senior's review (#986). The records are in
`abi/abi.def` and the service schema in `abi/services/core.registry@1.def` (generated); the host
side is Core's hand-off (section 9). Input: Plugin's needs inventory (#984,
`plugin-needs-reg-uix-dev-lib-doc-228.md`, REG section). Items marked [D] are decisions, [Q] open
questions.

REG lets plugins see and change what the host has registered: settings and their groups, plugins,
actions, screens, slots, menus, key bindings and setup steps. The settings editor, menu editor,
keys, profiles, setup, plugin manager, store, about, home and help are plugins in interface 7; this
family is what they need from the host, and nothing more.

It builds on: the service rules (`stages-services.md` section 2, D4), the command rules
(`commands.md`, slot 15), the event rules (`core-events.md`), the D1 features
(`screens-input.md` section 7) and the declaration records already in place (`setting.*`,
`screen.spec`, `action.spec`, `menu.*`, `stage.spec`).

## 1. Shape

- [D] **Reads are one call service, `core.registry` major 1** (slots 33 and 34): synchronous,
  bounded, paged. No new host slot.
- [D] **Writes are commands** (slot 15), staged in the callback and applied after it, in batch
  order, as `command.set_setting` already is. One rule for every write: whole-batch validation
  before anything is staged, the host-known submitter, authority checked at submit and again when
  applied. No REG write is a service op, so a write never runs inside another plugin's callback
  and never has to undo half a change.
- [D] **Changes are announced as events**: `event.setting_changed` (64) and
  `event.plugins_changed` (70) exist; REG adds the menu, binding and preview hints and the plugin
  request pair (section 5).
- [D] **No callbacks into plugins while answering.** Everything a reply holds is host state:
  declarations, stored values, item state pushed with `command.set_item_state` (60). An interface-6
  `ItemStateFn` or `AppliesFn` callback has no interface-7 form; section 6 replaces the one
  that is still needed.

## 2. The service `core.registry` (major 1)

### 2.1 Paging

- [D] Every list op takes one `service.reg_query` record (`scope`, `cursor`, `generation`,
  `flags`) and answers with up to 32 rows followed by exactly one `service.end` (52:
  `flags`, `total`, `generation`, `next`), the paging record of `core.usage`.
- [D] A page holds as many **whole** rows as fit in the op's `max_reply` (4,096 bytes), at most 32
  (`page_rows` of the schema, generated as `core_registry_v1::PAGE_MAX_ROWS`).
- [D] **Framing.** Input is one counted record batch (the generated `records_decode`); REG ops take
  one record (`input_rows` 1). A reply is a **bare record stream**, no count, as `core.usage`'s
  pages: a list op writes its rows, then exactly one `service.end`, last; a detail op (2, 6, 17)
  writes exactly the records of its row in section 2.2, in that order, and no `end`. Readers decode
  it with the generated `record_decode_prefix` or `RecordStream` (then `finish`); a missing or
  repeated record, a record out of order or of another op, anything after `end` and trailing bytes
  are `ERR_INVALID`. A row is never cut; text fields inside a row are cut at a UTF-8 boundary where
  section 3 says so.
- [D] `generation` is the host's **registry generation**: it changes when the set or order of a
  list changes (a plugin loaded, stopped, enabled, removed; a declaration admitted; a menu, binding
  or slot changed). It is never 0: the host skips 0 when it wraps. The first call passes `cursor`
  0 and `generation` 0; later calls pass `next` and the `generation` of the last `service.end`. A
  call whose non-zero generation is not the current one, or with `generation` 0 and a non-zero
  `cursor`, returns `ERR_STATE` with `out` untouched: start again at 0. `service.end.flags` bit 0
  means "last page". A page is lossless: whole rows only, and the largest row (under 1.2 KiB)
  always fits the 4,096 bytes.
- [D] **Values and item state are read live**, not under the generation: a setting value or an
  item's pushed state (`command.set_item_state`, 60) may change between two pages without a new
  generation. `event.setting_changed` (64) announces values, `event.registry_changed` (75) bit 0
  item state (coalesced).
- [D] **Reads see the state before the caller's own commands.** Commands apply after the callback
  returns (section 4), so a read in the same callback answers the old state; read again after
  event 64 or 75.

### 2.2 Operations

All query ops: `effect` `query`, `feature` null, `bound` `none`, `max_input` 256, `max_reply`
4,096 unless stated. Op ids are fixed once published.

| Id | Op | Input | Reply | Notes |
| --- | --- | --- | --- | --- |
| 1 | `settings` | `reg_query` (`scope`: group id, plugin id or empty for all) | `reg_setting`*, `end` | registry order |
| 2 | `setting` | `reg_key` | `reg_setting`, `reg_setting_extra`, `reg_text`? | one setting in full (help text) |
| 3 | `choices` | `reg_query` (`scope`: setting id) | `reg_choice`*, `end` | own and foreign choices, in order |
| 4 | `groups` | `reg_query` (`scope`: parent group or empty) | `reg_group`*, `end` | a group's children; empty: every group, each row with its `parent`; `icon` names the group's icon (an `icon.spec` or a code plugin's for the group's id), `puzzle` where none is declared |
| 5 | `plugins` | `reg_query` (`scope` empty) | `reg_plugin`*, `end` | every plugin the host knows, loaded or not |
| 6 | `plugin` | `reg_key` | `reg_plugin`, `reg_text`? | description; requirements are op 20 |
| 7 | `actions` | `reg_query` (`scope`: plugin id or empty) | `reg_item`*, `end` | |
| 8 | `screens` | `reg_query` (`scope`: plugin id or empty) | `reg_item`*, `end` | |
| 9 | `slots` | `reg_query` (`scope` empty) | `reg_slot`*, `end` | with the bound and the default screen |
| 10 | `slot_offers` | `reg_query` (`scope`: slot id) | `reg_item`*, `end` | screens offered for the slot, highest priority first |
| 11 | `menus` | `reg_query` (`scope` empty) | `reg_item`*, `end` | every menu id; `flags` bit 5 user-defined |
| 12 | `menu` | `reg_query` (`scope`: menu id) | `reg_menu_row`*, `end` | evaluated rows, section 2.4 |
| 13 | `bindings` | `reg_query` (`scope`: layer id, `global` or empty for all layers) | `reg_binding`*, `end` | |
| 14 | `inputs` | `reg_query` (`scope` empty) | `reg_item`*, `end` | the inputs this device has (`button.menu`, `tap.center`, ...) |
| 15 | `setup` | `reg_query` (`scope` empty) | `reg_setup_step`*, `end` | evaluated applicability, section 6 |
| 16 | `presets` | `reg_query` (`scope`: preset kind, e.g. `core.power-mode`, or empty) | `reg_item`*, `end` | |
| 17 | `preset` | `reg_key` | `reg_item`, `reg_text`? | name and description |
| 18 | `values` | `reg_query` (`scope`: a preset id, or with `flags` bit 0 a placement, `widgets.clock@2`) | `reg_value`*, `end` | the values a preset or a placement sets, whole |
| 19 | `widgets` | `reg_query` (`scope`: widget kind or empty; with `flags` bit 0 a settings group: the widgets that preview it; a page shows the last) | `reg_widget`*, `end` | widget discovery, section 6 |
| 20 | `needs` | `reg_query` (`scope`: plugin id) | `reg_need`*, `end` | features, services and required plugins, paged (up to 32 + 32 + more do not fit one reply) |
| 21 | `status` | `reg_query` (`scope`: empty, or `item` / `line` for one kind) | `reg_status`*, `end` | status items and lines (`ui.md` section 5.3); one row type per op, op 19 stays widgets only |
| 22 | `setup_step` | `reg_key` | `reg_setup_step`, `reg_text`? | one step in full: its help text (Port A on #354) |

- [D] `scope` that names nothing known gives an empty page (`total` 0), not an error: a plugin may
  ask for a group or menu of a plugin that is not installed.
- [D] `setting`, `plugin`, `preset` and `setup_step` with an unknown key: `ERR_NOT_FOUND`.
- [D] `settings`, `setting` and `choices` read a card plugin's settings from the plugin as they
  are asked for: without room for one, the answer is `ERR_NO_MEMORY`, never a shorter list or
  `ERR_NOT_FOUND`.
- [D] `stack` (screen ids on the stack, owner, guarded) belongs to UIX, not here.
- [D] `bindings` with an empty `scope` walks every layer in the byte order of the layer id, and
  the inputs of one layer in the order of their names, so a cursor and a re-read under one
  generation agree. A layer or input name over a row's cap is left out of the walk.

### 2.3 Authority (what a reply shows)

- [D] **Values:** `reg_setting.value` carries the value exactly when slot 5 would give it to the
  caller. Otherwise it is empty and flag `hidden` is set. A **secret** setting is never shown,
  only whether it has a value (`has_value`). This is the rule of `event.setting_changed.old`.
- [D] The same rule applies to every row that carries a value: `reg_value` in op 18 (presets and
  placements) is empty with flag `hidden` where slot 5 would not give that value.
- [D] **Grants** (`core.grant.*`, decisions 126 and 131) are never shown to other plugins: their
  values are hidden in ops 1, 2 and 18 for everyone except the system settings screen; a plugin
  reads its own grant only by the identity route of `screens-input.md` section 7.
- [D] **Guarded** settings are listed with flag `guarded`; writing them follows `commands.md`
  (own plugin, the host-resolved settings editor and `core` only).
- [D] **Everything else is public**: titles, groups, plugins, actions, screens, slots, menus and
  bindings are what the user sees on the device anyway. Plugin freedom (decision 44): no feature
  gates a read. A plugin declares `core.registry` in its metadata (D1 service catalog) and that
  declaration is what the store shows.

### 2.4 Menus

- [D] `menu` answers the rows the host would show for that menu now: the user's own definition
  (`command.set_menu`) if there is one, otherwise the declared `menu.entry`/`menu.section` rows in
  order, without `menu.hide` rows and rows whose `menu.need` the device does not meet. Each row
  carries the item's last pushed state (`command.set_item_state`: checked, enabled, shown, label,
  badge), resolved to text in the user's language.
- [D] The editor's "all entries" view is `menu` with `flags` bit 0 (`all`): every row that could be
  in the menu, hidden ones flagged `hidden`, and rows the user removed flagged `removed`. `flags`
  bit 1 (`declared`) answers the declared rows in declared order, ignoring the user's definition:
  the default order the editor resets to. User order and reset stay distinct.

## 3. Records (service block, 1025-1040)

All are `service.*` records in the growth block 1024-1535 (`stages-services.md` section 2.2).
Text the user reads (`title`, `help`, `label`, `badge`, choice titles) is **translated by the host**
in the user's language, from the owning plugin's catalog, and cut at a UTF-8 boundary to the cap.
Ids (`key`, `plugin`, `item`, ...) are never cut: a declaration that admitted them fits the caps.

| Tag | Record | Fields |
| --- | --- | --- |
| 1025 | `service.reg_query` | `scope: str 128`, `cursor: u32`, `generation: u32`, `flags: u32` |
| 1026 | `service.reg_key` | `key: str 128` |
| 1027 | `service.reg_setting` | `key: str 128`, `group: str 128`, `kind: u32`, `flags: u32`, `source: u32`, `title: str 128`, `value: bytes 64` |
| 1028 | `service.reg_setting_extra` | `min: i32`, `max: i32`, `step: i32`, `unit: str 96`, `section: str 128`, `follows: str 128`, `shown_id: str 128`, `shown_value: str 128`, `editor_kind: u32`, `editor: str 128`, `choices: u32` |
| 1029 | `service.reg_choice` | `value: str 64`, `title: str 128` |
| 1030 | `service.reg_text` | `text: str 1024` |
| 1031 | `service.reg_group` | `id: str 128`, `parent: str 128`, `page: str 128`, `order: i32`, `title: str 128`, `icon: str 64` (optional, ordinal 0, empty default) |
| 1032 | `service.reg_plugin` | `id: str 64`, `name: str 128`, `version: str 32`, `kind: u32`, `state: u32`, `flags: u32`, `problem: u32`, `problem_arg: u32`, `update: str 32` |
| 1033 | `service.reg_need` | `kind: u32`, `key: str 128`, `version: str 32`, `flags: u32` |
| 1034 | `service.reg_item` | `id: str 128`, `plugin: str 64`, `flags: u32`, `title: str 128` |
| 1035 | `service.reg_slot` | `id: str 128`, `screen: str 128`, `default: str 128`, `flags: u32`, `title: str 128` |
| 1036 | `service.reg_menu_row` | `item: str 128`, `kind: u32`, `flags: u32`, `order: i32`, `by: str 64`, `title: str 128`, `icon: str 64`, `badge: str 64`, `describe: str 128` |
| 1037 | `service.reg_binding` | `layer: str 128`, `input: str 64`, `action: str 128`, `origin: u32` |
| 1038 | `service.reg_setup_step` | `id: str 128`, `page_kind: u32`, `page: str 128`, `order: i32`, `flags: u32`, `title: str 128`, `badge: str 64` (optional, ordinal 0, empty default; draft 40) |
| 1039 | `service.reg_value` | `key: str 128`, `value: bytes 512`, `flags: u32` |
| 1040 | `service.reg_widget` | `id: str 128`, `plugin: str 64`, `kind: str 128`, `icon: str 64`, `flags: u32`, `title: str 128`, `cells: u32` (optional, ordinal 0, default 0; draft 29), `previews: str 128` (optional, ordinal 1, empty default; draft 32) |
| 1059 | `service.reg_status` | `id: str 128`, `plugin: str 64`, `kind: u32`, `flags: u32`, `priority: u32`, `size: u32`, `tap: str 128`, `title: str 128` |

Field meanings:

- `reg_setting.kind`: the `setting.spec` kind numbers. `flags`: bit 0 guarded, 1 secret, 2 scoped, 3
  kept on reset, 4 advanced, 5 hidden (value withheld), 6 has value, 7 long (value over 64 bytes:
  read it with slot 5), 8 preview (the value shown is a preview, section 4.4), 9 shown (its
  `shown_if` holds now), 10 governs (another setting's `shown_if` names it: re-read the list when it
  changes), 11 slider (an int setting whose `setting.extra` flag bit 0 asks for a slider, interface
  6 `SettingExtra::slider`; its range and step are `reg_setting_extra`'s `min`/`max`/`step`; never
  set for other kinds). `source`: 0 default, 1 preset, 2 profile, 3 user, 4 book scope.
- [D] **How a row shows** (Beta 3 parity, #257): a Boolean setting (kind 0) shows as an on/off
  switch wherever it is listed, its state in `reg_setting.value`; in a menu its `reg_menu_row` has
  flag 6 `switch` with bit 0 whether it is on (section 3). An int setting with flag 11 shows as a
  slider over `min..=max` in steps of `step` (1 where 0); one without it as a number to step.
  Flag 11 asks for a slider; the shell decides how it shows: without a touch screen it is −/+
  steps, as in interface 6. Op 1 carries no range, so a list reads op 2 for each slider row.
- `reg_setting.value` is the `settings_value` encoding, empty when hidden or long.
- `reg_setting_extra` repeats `setting.spec`/`setting.extra` fields the editor needs, with their
  types (`min`/`max`/`step` are `i32` there; `shown_id`/`shown_value` are `setting.extra`'s);
  `choices` is the number of choices, read with op 3 (paged: foreign `setting.choice` extensions
  make the count open; the longest fixed list today is 33).
- `reg_text` in `setting` and `setup_step` is the help text (the declaration's `help`,
  translated; none where it is empty); in `plugin` the description.
- `reg_plugin.kind`: 0 built in, 1 data, 2 code; `state`: 0 running, 1 off, 2 failed; `flags`:
  bit 0 enabled, 1 restart needed, 2 required by another enabled plugin, 3 linked into the
  firmware, 4 safe mode, 5 installed by a store (below), 6 not signed (its code was copied to the
  card, never installed, and runs without a question, Decision 205); `problem`: interface-6 `PluginProblem`
  order (0 none, 1-12, 13 `Other`
  with its code in `problem_arg`), `problem_arg` its number (`built_for`); then the declaration caps
  of interface 7, where a whole declaration batch was refused at one of them and the plugin did
  not load (`state` 2 failed): 14 too many formats, 15 too many readers, `problem_arg` the cap it
  ran into, only ever 8 or 32 with 14 (formats per plugin, `ERR_FULL`, or device-wide, `ERR_FULL`;
  `document.md` 1) and 4 or 16 with 15 (readers per plugin, `ERR_INVALID`, or device-wide,
  `ERR_FULL`; `document.md` 1); 16 too many book fields (`problem_arg` 8 per plugin or 64
  device-wide), 17 too many book badges (4 per plugin or 16 device-wide; both `library.md` 1), 18
  too many lookup providers (8 per plugin or 32 device-wide; `document.md` 7); 0 where the host
  cannot say which. The cap decides the value, not the status. A duplicate name in one batch has no
  problem number of its own. A plugin showing these rows treats a value it does not know as "could
  not be loaded"; `update`: the version waiting, empty if none. The first row of op 5 is always the
  host itself: `id` `core`, its version (interface 6 `env.plugins().kernel()`).
- [D] `reg_plugin.flags` bit 5 (installed by a store): the version installed, or the one waiting
  as `update`, was put in place by an `install_plugin` with `flags` bit 2 (from a catalog,
  `device.md` 5.2), for a code or a data plugin alike (fonts, dictionaries, hyphenation). The host
  keeps these versions in its own record, out of reach of plugins and of the card transfers:
  interface 6's `plugin-origin.txt` (`paperpaw_sdk::install::Origin`), kept as it is, including
  the one-time adoption (`install::adopt`) of the plugins already installed on a device that has
  no record yet, so store installs from before keep their updates. A plugin put in place any other
  way, or replaced since by another version, has the bit clear even where the id is the same. With
  the bit set, `version` (and `update`) is written as the store named it, pre-release included
  (`1.2.0-beta.1`; interface 6 `Installed::release`); the numbers are the plugin's own. A store
  offers updates only for plugins with the bit set, as interface 6 did. Built-in and linked plugins
  (bit 3) never have it.
- `reg_need.kind`: 0 feature (`key` = `uses.*`, `flags` bit 0 required), 1 service (`key`,
  `version` = major.revision), 2 required plugin (`key` = id, `version` = at least).
- [D] **Where op 20's rows come from**: kinds 0 and 1 from the native metadata the host
  admitted this run, which it keeps with the plugin's registry row: the validated view where its
  bytes stay for the run (a linked plugin's are static), else one fallible copy of at most 2,048
  bytes (`metadata::MAX_BYTES`) made at admission; features from
  `metadata::Checked::requested_features` (unavailable optional ones too), services from `services`.
  Kind 2 from the plugin's `requires` (`plugin.ini`), which the host keeps for every plugin it
  lists. A plugin whose metadata was not admitted this run (off, refused, a data plugin) has kind 2
  rows only; why it did not load is `reg_plugin.problem`.
- `reg_item.flags` (actions, screens, inputs, menus): bit 0 hidden from lists, 1 sealed (interface 6
  `sealed`: no other plugin's handler overrides the action; the lock uses it), 2 gesture (inputs),
  3 pinned (section 4.2), 4 declared by a plugin (inputs and gestures of UIX; `plugin` names it),
  5 user-defined (menus, op 11: the user has a `command.set_menu` definition for this menu, even
  an empty one or one equal to the declared rows; interface 6 `is_customized`; cleared by
  `set_menu` `reset`). It is the menu-level form of `reg_menu_row.flags` bit 4, which only rows
  carry, so an empty user-defined menu shows only here.
- `reg_menu_row.kind`: 0 action, 1 setting, 2 submenu, 3 section; `flags`: bit 0 checked, 1
  enabled, 2 hidden, 3 removed, 4 user-defined menu (per row; the menu-level flag is op 11's
  `reg_item.flags` bit 5), 5 in the declared rows (the editor's
  "default" set), 6 `switch` (the row shows a switch: an action whose last
  `command.set_item_state` set `switch`, or a Boolean setting; bit 0 is then whether it is on, so
  an off switch differs from a plain action). `by` is the plugin that declared the row, or for a
  hidden row the plugin whose `menu.hide` hides it. `describe` is the `menu.describe` text,
  translated.
- `reg_value`: a setting id (with the placement for a placement) and its value, `settings_value`
  encoding, never cut; `flags` bit 0 "as if not set" (a preset that resets it), bit 1 hidden
  (section 2.3; `value` empty).
- `reg_slot.flags`: bit 0 the user bound it (`command.bind_slot`); otherwise `screen` is the
  default, the highest offer.
- `reg_widget`: a widget the `core.widget` stage can make; `kind` its kind (category), `icon` the
  kind's icon, `flags` bit 0 shown somewhere now: a `widget.place` whose `shown_if` holds lists it
  (its base id, also a placement) in one of its `list_keys` (interface 6 `Widgets::shown`, not
  "has instances"; `ui.md` section 5.2), bit 1 private, bit 2 square; `cells` the widget's
  `widget.spec.cells` as declared (size and least size, draft 29); `previews` its
  `widget.spec.previews` (the settings group it previews, `ui.md` section 5.2), empty for none:
  a settings page lists the widgets whose `previews` is its group. With
  `reg_query.flags` bit 0 op 19 lists those that preview `scope` in its order (the host's own,
  then declarations by plugin slot, a plugin's own by name), and a page shows the last. Interface
  6 took the last added; where two plugins preview one group the shown one may differ (accepted
  for 1.0: no first-party group has two). Without bit 0, op 19 leaves out every widget whose
  `previews` is set (a widget picker never offers one); bit 0 with an empty `scope` is
  `ERR_INVALID`.
- `reg_status` (1059, after the UIX rows 1041-1058): `kind` 0 item, 1 line; `flags` bit 0 drawn
  by its owner (always 1 for a line, 0 for an item: a reader tests one bit instead of `kind`),
  bit 1 private; `priority` 0-255 (items; 0 for lines); `size` an item's
  `min_width` or a line's `height`, in thousandths of the text size; `tap` an item's action (empty
  for lines and items without one); `title` translated as above. A row is at most 477 bytes framed,
  so a page fits 4,096 bytes with 8 rows. The status items and lines themselves are declared
  through UIX (`ui.md` section 5.3); until those declarations are admitted op 21 answers an empty
  page. The kernel's own items (`core.status.*`, `ui.md` section 5.3) are listed between the
  declared items and the lines; the kernel's own lines (`core.status-line.items`, one text line
  high: `size` 1000) after the declared lines.
- `reg_item` for presets: `id` the preset, `plugin` who added it, `title` its name.
- `reg_binding.origin`: interface-6 `BindingOrigin` (0 plugin, 1 device, 2 preset, 3 user); an
  empty `action` is "bound to nothing".
- `reg_setup_step.page_kind`: 0 setting, 1 screen; `flags` bit 0 applies now. Whether a step is
  done is the setup plugin's own state (its Data file), not the host's. `badge` (draft 40) is what
  the step's plugin says of it now ("Connected", "2 being added"): the `badge` of its last
  `command.set_item_state` (60) for the step, resolved in the reader's language as for a menu row;
  empty before a push, for a push without one, where the key no longer resolves and for the host's
  own steps. The setup shows it on a screen step's card in place of *Open* (Beta 3 parity, #496). A
  plugin built for an earlier draft never reads it; a host before draft 40 never writes it.

## 4. Commands (slot 15)

Command records in the growth block 1536-2047 (`screens-input.md` section 8). The submit rules of
`commands.md` apply to each: whole batch validated before staging, nothing staged on any failure,
key and text bytes within the stage budget.

- [D] **List fields** (`set_menu.items`, `request_plugins.plugins`) are checked by the generated
  codec on both sides, so the SDK refuses before submit what the host would refuse: empty text is
  no items; otherwise every item between two `\n` is non-empty and within its cap (128 and 64
  bytes), and there are at most 64 and 16 items. A violation, including a trailing `\n`, is
  `ERR_INVALID`; the total over the field cap stays `ERR_NO_SPACE`.

- [D] **Grants are out of reach.** No REG write touches a `core.grant.*` setting: `reset_setting`
  (every flag), `apply_preset` and `preview_setting` skip them in group, plugin and all resets and
  refuse a single grant key with `ERR_DENIED`; declarations 25 and 28 naming one are dropped at
  admission. Grants change only through the host's own settings screen (decisions 126, 131).
- [D] **Checked again when applied.** Between submit and apply, an item, screen, slot or setting a
  staged REG command names can go (a plugin stopped). The host checks every REG command of a batch
  again before applying any of them; if one no longer holds, the whole batch is dropped, never
  half-applied, logged, and reported to the submitter with event 75 bit 31 (`dropped`).

| Tag | Record | Fields |
| --- | --- | --- |
| 1536 | `command.reset_setting` | `key: str 128`, `flags: u32` |
| 1537 | `command.preview_setting` | `key: str 128`, `value: bytes 512`, `flags: u32` |
| 1538 | `command.preview_end` | `flags: u32` (0; other values `ERR_INVALID`) |
| 1539 | `command.set_scope` | `path: str 512` |
| 1540 | `command.set_menu` | `menu: str 128`, `items: str 2048`, `flags: u32` |
| 1541 | `command.bind_key` | `layer: str 128`, `input: str 64`, `action: str 128`, `flags: u32` |
| 1542 | `command.bind_slot` | `slot: str 128`, `screen: str 128` |
| 1543 | `command.set_plugin_enabled` | `plugin: str 64`, `enabled: u32` |
| 1544 | `command.request_plugins` | `plugins: str 1024` |
| 1545 | `command.answer_plugin` | `request: u32`, `plugin: str 64`, `outcome: u32` |
| 1546 | `command.apply_preset` | `preset: str 128`, `flags: u32` |

### 4.1 Settings

- [D] `reset_setting`: `flags` 0 resets `key`; bit 0 resets the group `key`; bit 1 every setting of
  plugin `key`; bit 2 every setting (`key` empty); bit 3 every value placement `key` sets (a widget
  place that goes, interface 6 `placement_values`). Settings kept on reset and secrets are left as
  they are, as in interface 6. Authority per setting as `command.set_setting`: a group or plugin
  reset skips guarded settings the submitter may not write, and says so in the log; a single guarded
  key it may not write is `ERR_INVALID`. In a book scope it forgets the scope's value.
- [D] **Mass resets need consent.** Bit 1 for another plugin's settings and bit 2 (every setting)
  need the feature `uses.registry` (else `ERR_DENIED`), and the host asks the user before it applies
  them (as decision 132): the command is accepted, and only an explicit yes applies it. Refused,
  dismissed, or no answer within 10 minutes all change nothing; if the plugin that asked stops
  first, the pending request is discarded. The submitter learns the outcome from event 64 (an
  empty key: read again) or its absence.
- [D] **Until the host has that question** both mass resets are refused: bit 1 naming another
  plugin and bit 2 are `ERR_UNSUPPORTED`, with the feature or without. A plugin that resets many
  after its own question (the Settings screen's "Reset all") sends one reset per setting. Flags
  that name no one kind (two of bits 0 to 3, an unknown bit, bit 2 with a key) are `ERR_INVALID`.
  The settings a group or plugin reset skips are not logged yet.
- [D] **Bit 3 by prefix.** `key` is a placement (`home.clock@2`) or a widget placed by its own id
  (`home.clock`): every value whose id starts with `key.` goes, kept on reset or not, as interface
  6 `placement_values` listed them. A key of one segment (a whole plugin) is `ERR_INVALID`.
- [D] `set_scope`: the book scope for scoped settings, by a path on root 1, while the submitting
  screen stays open; empty ends it. The screen identity is stamped at submit (as `command.redraw`):
  not the submitter's own top screen gives `ERR_STATE` (so does a work run; outside a screen's
  callback `ERR_UNSUPPORTED`, as every UI command), a path that names no book (root 1's grammar,
  not below `.paperpaw`, `plugins` or `paperpaw.ini`) `ERR_INVALID`. The host picks the
  file, never the plugin: `books/<book key>/settings.ini` in the submitter's Data (root 0), the book
  key of `library.md` section 6, which is where Beta 3's reader kept a book's own settings (#257);
  it follows the book (`library.md` 4). The scope also ends when the plugin stops or is parked.

### 4.2 Menus, bindings, slots, plugins

These change the user's configuration of the whole device, so they need the D1 feature
**`uses.registry`** (the store shows it); without it, `ERR_DENIED` for the batch. Not so
`set_menu` and `bind_key` (owner decision 291, Nov 21): any plugin, also a plugin file on the card,
changes menus and key bindings (the menu editor and the keys plugin are such files on the X4s), and
what protects the user is the host's own: no submenu cycle, and the global layer keeps an input to
the main menu (below), beside the host-fixed escape.

- [D] **Pinned items** are a host-only set: the action that opens the main menu, the settings
  editor's entry and the power actions (sleep, power off, restart). No plugin declares or clears
  `pinned`. A pinned item can't be removed from the host menu that carries it or left without an
  input. `sealed` keeps its interface-6 meaning (no override) and protects nothing else: user
  control (#241) covers every plugin item.
- [D] `set_menu`: `items` is the menu's new rows as item ids, one per line (`\n`), at most 64;
  `flags` bit 0 (`reset`, `items` empty) returns to the declared rows. The host refuses the batch
  with `ERR_INVALID` for an unknown id, a submenu cycle, or a menu that would lose a **pinned**
  item. Saved in `[menus]` of `paperpaw.ini`, as in interface 6.
- [D] `bind_key`: binds `input` in `layer` (a screen or slot id, or `global`) to `action`; empty
  `action` binds nothing; `flags` bit 0 (`reset`) returns the input to the
  declared and preset bindings. Saved in the user's `paperpaw.ini`, in effect after the callback.
- [D] **The escape is a host-fixed chord, not a table check.** Holding Power (8 s, the chord no
  input filter sees, `stages-services.md` section 1.3) always opens the main menu with "reset keys"
  on top, on every device (Android: the system back long-press or its equivalent). No binding,
  layer, condition, declaration or filter can take it: it has no input name, and the host checks the
  hold before the key map and every filter (`long.power` is the ordinary long press and stays
  bindable, as do chords with Power). As a second line, the host refuses (`ERR_DENIED`) a `bind_key`
  batch that would leave the **global** layer without an input to the main menu, and drops from the
  key map, as it builds it, a global `key.bind` row that would replace or unbind the last such input
  (the row stays its plugin's; nothing is refused, #815). Screen layers, conditions and declarations
  can still shadow it; the chord is the guarantee. **Device gate (owner):** on the X4 and X4 Pro,
  holding Power for 8 s must not end in a hardware power-off or reset before the host sees it; if it
  does, the escape takes another chord before the freeze.
- [D] `bind_slot`: binds `slot` to `screen`; empty `screen` returns to the default. The screen must
  be declared and offered for that slot, else `ERR_INVALID`.
- [D] `set_plugin_enabled`: switches a plugin on or off; it takes effect at the next start
  (`reg_plugin` flag `restart needed`). Switching off a plugin another enabled plugin requires,
  or the submitter itself, is `ERR_DENIED`. A built-in the host needs (the settings editor while
  it is the only one) is `ERR_DENIED`. A plugin the device does not list is `ERR_NOT_FOUND`. The
  host checks the feature first (#279): a plugin file on the card is never given `uses.registry`,
  so it switches no plugin.
- [D] **The id `core` is the host's own** (reserved: no card, bundle, linked or native plugin may
  take it, #857). `set_plugin_enabled`, `request_plugins` and `answer_plugin` naming it are
  `ERR_DENIED` for the whole batch.

### 4.3 Presets

- [D] `apply_preset` applies preset `preset` on the host: its values are set, and every setting of
  its kind it leaves out returns to its default (interface 6 `Preset::changes`), as one change.
  `flags` bit 0 previews it instead (section 4.4 rules, replacing any preview). Authority per
  setting as `command.set_setting`; a preset may not change guarded settings unless the submitter
  may (the batch is refused with `ERR_INVALID`). No feature: it changes settings, as slot 15 does.
- [D] **What a preset of each kind covers** (the settings "of its kind" above; interface 6
  `presets.rs`): `core.theme` covers the settings of the appearance group (`core.group.look`)
  except `core.ui-size`, `core.ui-contrast`, `core.logo` and `core.widgets.frame`
  (`theme_settings`), and values it names outside them are dropped; `core.widget-look` covers
  `core.widgets.frame`, `.paper`, `.ink`, `.corners`, `.frame-line`, `.shadow`, `.padding` and
  `.gap`, and each registered widget's `<widget>.frame`, `.padding`, `.size`, `.align`, `.paper`,
  `.ink`, `.corners`, `.frame-line` and `.drop-shadow` (`widget_look_settings`; the settings
  plugin's check of what a look covers must name the same list), and values it names outside them
  are dropped; any other kind covers only the settings it names, so nothing else returns to its
  default. Settings this device lacks and values that do not fit their setting are skipped, so the
  rest still applies.

### 4.4 Preview

- [D] `preview_setting` rows of one batch are **one preview set**: it replaces the previous set
  wholly, and shows after the batch's other commands. `flags` bit 0 previews "as if not set"
  (`value` empty; a value with it, another bit, or a value that does not decode is
  `ERR_INVALID`). Authority is that of `command.set_setting` (guarded, own plugin), and values
  are checked as it checks them; a secret setting can't be previewed (`ERR_UNSUPPORTED`, as slot
  15), nor a grant (`ERR_DENIED`, section 4.3). A work run previews nothing (`ERR_STATE`).
- [D] **Owner.** A preview belongs to (plugin, screen) that submitted it; that screen must be the
  submitter's own top screen (else `ERR_STATE`, as `set_scope`). `preview_end` ends only the
  submitter's own preview (another plugin's: `ERR_STATE`; with none it is `OK` and ends
  nothing); a batch with both rows and an end is `ERR_INVALID`. A new set from another plugin
  replaces it, and event 76 tells both. A preview ends when its screen closes, its plugin stops
  or crashes, and when the device sleeps; it is never saved.
- [D] While a preview is active, slot 5 and `reg_setting` give the previewed value (flag
  `preview`). Only one preview exists device-wide. Kernel side effects of a setting (language,
  rotation) wait for the kept value, as in interface 6.
- [D] **Cap:** a set is one batch, so at most 8 rows (`COMMAND_MAX_RECORDS`), and at most 2,048
  bytes of keys and encoded values; more is `ERR_NO_SPACE`. A set is never split across batches
  (a second batch replaces the first). A larger preview, such as a profile's, is `apply_preset`
  with `flags` bit 0. An empty set is not a command: `preview_end` ends a preview.

## 5. Events

| Tag | Record | Fields | To |
| --- | --- | --- | --- |
| 75 | `event.registry_changed` | `now_ms: u64`, `what: u32` | subscribers (hint) |
| 76 | `event.preview_changed` | `now_ms: u64` | subscribers (hint) |
| 77 | `event.plugins_requested` | `now_ms: u64`, `request: u32`, `by: str 64`, `plugins: str 1024` | subscribers |
| 78 | `event.plugin_answered` | `now_ms: u64`, `request: u32`, `plugin: str 64`, `outcome: u32` | the requesting plugin only |

- [D] `registry_changed.what` bits: 0 menus, 1 bindings, 2 slots, 3 actions/screens, 4 setup, 5
  groups, 6 presets, 7 widgets. A hint (`core-events.md` section 2): re-read what you show. The
  registry generation (section 2.1) changed with it. Plugin set changes stay `event.plugins_changed`
  (70); setting values stay `event.setting_changed` (64). Bit 0 also covers item state pushed with
  command 60 (live, no generation change, coalesced). Bit 31 (`dropped`) goes to one plugin only: a
  staged REG batch of its own was dropped when applied (section 4). Coalescing never loses a bit:
  pending `what` bits are OR-ed together until the event is delivered. A parked plugin (installed,
  not made yet, #248) is not told: it shows nothing, and it reads the registry when it is made (#496).
- [D] **Plugin requests.** A request never installs anything by itself: an install stays the DEV
  family's `core.install` with the host's confirmation (decision 132; firmware always confirmed,
  decision 134). `command.request_plugins` (ids, one per line, at most 16, the interface-6
  `MAX_REQUESTED_PLUGINS`) is refused with `ERR_INVALID` for a bad id, and with `ERR_FULL` while 4
  requests are open device-wide or 2 of the submitter's own are (so one plugin cannot take every
  place). The host drops ids already on the device (any version, on or off); if none is left,
  nothing is sent. Otherwise it numbers the request and raises `plugins_requested`, with the
  host-known submitter as `by`, to the plugins that subscribed to it and declare the install feature
  (`uses.install`, below: the plugins that may answer, the store among them); a plugin that
  subscribed without it does not hear it. With no such subscriber, every id is answered `failed` at
  once, under a real (nonzero) request number that the host keeps nowhere. Request number 0 marks
  only the `failed` answers to a request the host could not take in, its table being full or busy. A
  subscriber asks the user and answers each id with `command.answer_plugin` (`outcome` 0 installed,
  1 declined, 2 failed, 3 not found; the host refuses other values with `ERR_INVALID`, and a
  consumer of event 78 treats an outcome it does not know as `failed`, never as installed). Only a
  plugin that declares the install feature (`uses.install`, DEV) may answer; any other gets
  `ERR_DENIED`, so a plugin that merely subscribes can neither fake an install nor block the store.
  The refusal is for the whole batch, wherever the command sits in it, and the host never falls back
  to "any subscriber" (DEV defines `uses.install`, `device.md` 1). With no subscriber that declares
  it, every request is answered `failed` at once (the no-subscriber rule above). The host checks
  that the request and the id are open (else `ERR_STATE`; the first answer for an id wins), against
  the ids open when the callback began; with more than 16 ids open device-wide that check may pass
  an answer for an id that is no longer open, and the host then drops it when it applies the batch,
  without a status. It checks `installed` itself: the id must be on the device now, else the answer
  is stored as `failed`. It raises `plugin_answered` to the requester only. A request stays open
  until every id is answered, no subscriber that may answer is left, or the device restarts; then
  the open ids are answered `failed` by the host. A request whose requester stopped is dropped
  (nobody is left to hear its answers).
- [D] All four follow the EVT pending limits and drop rules (`core-events.md` section 3.3).
  `plugins_requested` and `plugin_answered` are edges and never coalesced; the two hints are.

## 6. Declarations REG adds

## 7. Memory (X4)

- Replies are written into the caller's buffer (at most 4,096 bytes); the host keeps no per-call
  state between pages. A cursor is an index into the host's own ordered tables.
- Translation for a reply resolves one message at a time into the reply buffer. Op 12 translates and
  formats up to 32 rows a page, so the host caches resolved row text per (language, catalog),
  bounded and fallibly allocated (a failed cache allocation answers uncached), as #255 remark 7.
  Its pages count against the X4 timing gate.
- Commands keep `commands.md`'s stage byte budget. `set_menu` (2 KiB) and `request_plugins`
  (1 KiB) are the largest; a profile may set a lower budget, which then refuses them with
  `ERR_NO_SPACE`.
- The preview set is host heap: at most 8 rows and 2 KiB, allocated fallibly (`ERR_NO_MEMORY` at
  submit, nothing staged).
- Open plugin requests: at most 4 device-wide, each at most 16 ids.

## 8. Interface-6 calls and their interface-7 form

## 9. Hand-offs

- **Kernel:** records and schema in `abi.def` and `abi/services/core.registry@1.def`, generator,
  lock, tests of the pinned lists; this document final.
- **Core:** the `core.registry` service over the host tables (paging, generation, translation,
  authority), the command arms, the four events, `setup.step` and the other declarations' admission.
  `answer_plugin`: only declarers of `uses.install` pass, every other plugin gets `ERR_DENIED`
  (`native_host::commands_answers`).
- **Services:** the SDK facade (typed rows, paging iterator, command builders).
- **Plugin:** the ports.
- **UIX:** the declaration of plugin inputs and gestures (section 10).

## 10. Settled questions

1. [D] **Placements:** slot 5 resolves a placement id (`widgets.clock@2.face`) on the host, falling
   back to the setting itself (`widgets.clock.face`) as interface 6 `with_placement` did: one
   place for precedence and authority, one call. The SDK never asks twice.
2. [D] **Plugin inputs and gestures** (`InputSpec`, `GestureSpec`) are needed in 1.0 (keys and lock
   declare them): UIX carries their declaration records, with ownership stamped by the host, and
   op 14 lists them with flag 4 and `plugin`. No plugin input or gesture can take the hold-Power
   escape (section 4.2).
3. [D] Op 18 for a placement lists only the values that placement sets itself, not the fallbacks.
