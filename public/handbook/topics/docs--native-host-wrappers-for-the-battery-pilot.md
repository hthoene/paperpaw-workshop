### Native host wrappers for the Battery pilot

Menu declarations use `native::declare::{MenuEntryDecl, EntryPlacement, MenuSectionDecl}`.
Construct a `MenuEntryDecl::new("core.tools", "battery.open")`, set `order = 37`,
then add it through `Declarations::menu_entry` and assign the icon through
`icon("battery.open", "battery")`. Entry and section order are typed `i16` values.
`EntryPlacement` carries an anchor only for after, before and section placement.
Entry items, icon items and device-need items are full ids; foreign items are allowed.
`menu_need(item, MenuNeed)` uses the existing SDK need enum. `menu_section` takes
a `MenuSectionDecl`; `hide_menu_entry(menu, item)` uses full ids, while
`describe_item(item, key)` names an owned item relatively. The builder checks
syntax and generated field limits; the host resolves ids and checks duplicates.
Hosts without menu wiring return `Unsupported` rather than dropping declarations.
These methods also work in build scripts that emit static batches. Card catalogs
remain at `plugins/<id>/i18n/<language>.ini`, with language fallback ending in English.

`native::declare::Declarations::subscribe_event(EventKind::Started, token)`
registers a typed event subscription; `register_draw(token)` registers a draw
callback. `EventKind` lives in `native::declare` and covers tick, lifecycle,
battery, page, screen and action events. These methods use the same ordered,
bounded batches and failure latching as settings, screen and action declarations.
They also work in build scripts that emit static registration batches; a plugin
never needs to write callback record bytes or import private generated codecs.

`native::snapshot::capture_snapshot(host)` returns an owned snapshot with battery,
display and time getters. `native::settings::read_setting(host, key, scratch)`
returns a borrowed `SettingValue`; `Absent`, false, zero and empty text remain
distinct. Grant reads use only `settings::own_grant(host, GrantKind)` and the host
checks the caller. Generic grant reads and typed grant writes are refused.

`native::formatting::copy_message(host, key, out)` returns complete borrowed UTF-8
or `NoSpace`. `MAX_MESSAGE_BYTES` sizes one reusable output buffer. Number labels
can look up `core.decimal` (falling back to "." when missing), format fixed-point
ASCII text, then use the digit conversion slot.

A draw callback obtains its canvas with `frame.draw_canvas()`. A frame decoded outside
entry glue has no canvas access and returns `State`. The non-copyable frame is borrowed mutably for the canvas lifetime;
dropping the canvas allows another borrow. Canvas primitives preserve
the host's frame clipping and colour conversion. `Font::acquire_role` borrows the
callback host, `measure_text` returns advance, and `render_text` takes that canvas
and a `TextOrigin`. Consuming `release` and `Drop` each release a font once. A
font cannot be drawn through a different host binding.

REG declarations use `SetupStepDecl`, `SlotDecl`, `SlotOfferDecl`, `KeyBindingDecl`,
`PresetDecl` and `PresetValueDecl` through `native::declare::Declarations`.
`setting_default` and `setting_choice` extend another plugin's settings; the host
checks authority and resolves extensions in plugin load order. Setup conditions
are declared values and device requirements, with no callback during a query.

Registry commands preserve the difference between a default and an empty user
configuration: `set_menu(menu, None)` restores declared rows, while
`set_menu(menu, Some(&[]))` clears the custom menu. Menu and plugin request lists
are checked against the generated limits and never truncated. A preview set is
submitted as one batch with caller-owned value scratch; oversized previews fail
before submission. Use a preset preview for larger sets. The host checks preview
ownership and obtains any required user consent for mass resets.

`native::commands::CommandSender::new(host, scratch)` stages typed setting changes
with the generated encoder. Each accepted call is one atomic batch, applied by
the host after the callback. Dropping the sender submits nothing.

`Font::read_line_metrics` returns the SDK's `LineMetrics`; `Font::ink` returns
optional `InkBounds`, preserving empty text and whitespace as no ink.
`canvas.clip_region(rect)` returns a nested guard: its clip intersects the parent,
and dropping it restores the previous clip. Explicit `restore` can report a
host refusal. The draw-frame clip remains the outer bound.

`CommandSender` also opens screens, runs actions, queues a redraw with typed
`RedrawMode`, and closes the submitting plugin's top screen. Screen and action
ids are validated before encoding; each call stages one complete batch or none.
