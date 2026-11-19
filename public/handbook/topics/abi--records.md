# Draft M1 registration and tick records

`abi/abi.def` owns the record tags, field order and field types. The closed `record_codec` descriptor owns the
registration count cap and its introduction minor. The generator
validates the supported initial shapes and writes identical standalone modules
to `abi/generated/records_wire.rs` and
`crates/paperpaw-core/src/abi7/records_wire.rs`. The existing raw ABI module is
unchanged. Lock format 4 separately covers the complete emitted codec body.

A batch starts with an unsigned canonical u32 LEB128 record count. Each record
is a canonical u32 LEB128 tag, a canonical u32 LEB128 body byte length, then that
many body bytes. The body starts with a canonical u32 LEB128 bitmap byte length,
then that many presence bitmap bytes, then positional scalar fields. Scalars
are fixed-width little-endian integers. Encoders write a zero-length bitmap.
Overlong, overflowing or truncated varints are malformed.

| Tag | Record | Required fields, in order |
| --- | --- | --- |
| 1 | `registration.event` | `event_tag: u32`, `token: u32` |
| 2 | `registration.draw` | `token: u32` |
| 3 | `event.tick` | `now_ms: u64` |
| 5 | `setting.group` | `name: str 96`, `title: str 96`, `order: i32`, `page: str 96`, `parent: str 128` |
| 6 | `setting.spec` | `name: str 96`, `kind: u32`, `flags: u32`, `group: str 128`, `title: str 96`, `help: str 96`, `default: bytes 512`, `min: i32`, `max: i32`, `choices: str 1024` |
| 7 | `setting.extra` | `name: str 96`, `unit: str 96`, `section: str 96`, `follows: str 128`, `shown_id: str 128`, `shown_value: str 128`, `editor_kind: u32`, `editor: str 96`, `step: i32`, `flags: u32`, `check: u32` |
| 8 | `resource.hyphenation` | `language: str 35`, `path: str 100` |
| 9 | `resource.font_face` | `name: str 96`, `path: str 100`, `family: str 64`, `style: u32`, `weight: u32`, `role: str 96`, `priority: i32` |
| 10 | `resource.font_extension` | `name: str 96`, `path: str 100`, `extends: str 128` |
| 13 | `menu.entry` | `menu: str 128`, `item: str 128`, `order: i32`, `place: u32`, `anchor: str 128` |
| 14 | `icon.spec` | `item: str 128`, `icon: str 64` |
| 15 | `menu.need` | `item: str 128`, `need: u32`, `capability: u64` |
| 16 | `menu.section` | `name: str 96`, `title: str 128`, `menu: str 128`, `order: i32` |
| 17 | `menu.hide` | `menu: str 128`, `item: str 128` |
| 18 | `menu.describe` | `item: str 96`, `key: str 128` |
| 19 | `stage.spec` | `name: str 96`, `schema: u32`, `flags: u32`, `max_input: u32`, `max_reply: u32`, `max_records: u32` |
| 20 | `registration.stage` | `stage: str 128`, `token: u32`, `order: i32`, `signature: u64` |
| 32 | `event.started` | `now_ms: u64` |
| 33 | `event.resume` | `now_ms: u64` |
| 34 | `event.suspend` | `now_ms: u64` |
| 35 | `event.stopping` | `now_ms: u64` |
| 36 | `event.battery_measured` | `now_ms: u64` |
| 37 | `event.page_turned` | `now_ms: u64`, `section: u32`, `offset: u32`, `progress_ppm: u32`, `path: str 512`, `title: str 256`, `chapter: str 256`; optional (appended, bits 0 and 1, no default: `Option<u32>`): `page: u32`, `pages: u32` (absent until the reader counted the pages; pages count from 1, so a present 0, or a page past the count, is refused); optional `insert: u32` (bit 2) and `chapter_left: u32` (bit 3, draft 37: the pages after this one in the chapter, 0 on its last page; only with `page` and `pages`, at most `pages - page`) |
| 64 | `event.setting_changed` | `now_ms: u64`, `key: str 128`, `old: bytes 512` (empty: no previous value) |
| 65 | `event.book_opened` | `now_ms: u64`, `section: u32`, `offset: u32`, `progress_ppm: u32`, `path: str 512`, `title: str 256`, `chapter: str 256`, `reason: u32`; optional `page: u32`, `pages: u32`, `insert: u32`, `chapter_left: u32` (the rules of tag 37) |
| 66 | `event.book_closed` | as 65 |
| 67 | `event.book_finished` | as 65 |
| 68 | `event.book_moved` | `now_ms: u64`, `from: str 512`, `path: str 512` |
| 69 | `event.book_removed` | `now_ms: u64`, `path: str 512` |
| 70 | `event.plugins_changed` | `now_ms: u64` |
| 71 | `event.wifi_changed` | `now_ms: u64`, `state: u32` |
| 72 | `event.power_changed` | `now_ms: u64`, `level: u32`, `flags: u32`, `stretch: u32`, `mode: str 128` |
| 73 | `event.status_changed` | `now_ms: u64` |
| 74 | `event.charge_changed` | `now_ms: u64`, `flags: u32` |

Tags 64-74 (`event.setting_changed`, `event.book_opened`, `event.book_closed`,
`event.book_finished`, `event.book_moved`, `event.book_removed`, `event.plugins_changed`,
`event.wifi_changed`, `event.power_changed`, `event.status_changed`, `event.charge_changed`) are
the core events of `docs/abi/core-events.md`, with the same delivery as 32-37; only the host raises
them, and a host admits each once its producer
is wired.

Tags 32-37 are events the host sends with `dispatch_event`, as a batch of exactly one
record; they are named in `registration.event` like tick, and a registration or
declaration batch never carries one (`ERR_INVALID`). Host encoders are in
`native_host::events`; strings over their cap are cut at a UTF-8 boundary there.

Tag 4 is the slot-15 command (`docs/abi/commands.md`). Tags 5-10 are the
declaration records of `docs/abi/proposals/declarative-registration.md`. A
`str` is a canonical u32 LEB128 length and that many UTF-8 bytes; `bytes` is the
same framing without the UTF-8 rule. Tag 8 deliberately differs from the
proposal's body table: it has no `name` (a language is its own identity), only
`language` and `path`.

## Generated records

Every record in `abi/abi.def` except tags 1-4 is generated from its declared
fields, with no per-record generator code: the struct and a table of its fields,
which one decoder, one sizer and one writer walk (`tools/abi_tables.py`; no code
is generated per record). Fields use the closed wire types `u32 u64 i32 str bytes`. A `str`
or `bytes` field has a `max_bytes` cap of 1 to 4096; a scalar has 0. Required
fields come first, in order. Optional fields are appended after them, with
ordinals 0, 1, ... in field order (at most 8), and a `default`: an integer for a
scalar, empty for `str` and `bytes`. The encoder writes the one-byte presence
bitmap only when a field differs from its default, then the present optional
fields in ordinal order; a decoder gives an absent field its default. A scalar
whose every value means something (no value may stand for "absent", §1.3 of the
events proposal) declares `"default": null` instead: it is `Option<T>`, present
exactly when `Some` (its bit set and the field written), `None` when the bit is
clear. A record
with no optional field keeps the empty bitmap. Field names are lowercase Rust
identifiers, record names are dotted lowercase, and two records may not map to
the same generated name.

Tag allocation, checked by the generator (a tag outside its family's range, an
unknown family or a tag declared twice is refused; tags are never reused):

| Tags | Family |
| --- | --- |
| 1-3 | `registration.event`, `registration.draw`, `event.tick` |
| 4 | `command.set_setting` |
| 5-31 | declarative registration: `setting.*`, `resource.*`, `action.*`, `menu.*`, `screen.*`, `icon.*`, `stage.spec`, `registration.stage` |
| 32-43 | `event.*` |
| 44-47 | `i18n.*` |
| 48-55 | `service.*` |
| 56-62 | `command.*` |
| 63 | reserved |
| 64-191 | `event.*` growth block: 64-74 core events (`docs/abi/core-events.md`) |
| 512-1023 | `stage.*`: 512 `stage.call`, 513 `stage.reply` (`docs/abi/stages-services.md`) |
| 1024-1535 | `service.*` growth block: 1024 `service.echo` (host tests only) |

Tags 48-52 are the service records of `docs/abi/proposals/interface-7-usage-clock.md`. The host writes
them into service blobs, framed **bare**: tag, body length and body, with no count
(`record_framed_len`, `record_encode_one`; a reader decodes one with `record_decode_one`, which refuses
any byte after it). These three functions are emitted only for a schema with service records. A batch a
plugin submits never carries an event or service record (`ERR_INVALID`).

All declarations and fields start at minor 1. Tags 1-10 have no optional fields.
Unknown bitmap bits, extra bitmap bytes and trailing fields inside a known
record are accepted for forward compatibility. Known required fields must still
be present after the bitmap. Bytes outside the declared batch are malformed.
Unknown registration tags return `ERR_UNSUPPORTED`; tick decoding requires
exactly one record with the tick tag. It accepts the same bounded extensions.

`Registration` is a copyable, non-exhaustive enum with `Event { event_tag,
token }` and `Draw { token }`. `registrations_decode(&[u8])` returns a completely
validated `RegistrationBatch` backed by eight optional records. Its `iter()`
yields registrations by value, and it exposes `len()` and `is_empty()`.
`registrations_encode(&[Registration], &mut [u8])` returns bytes written.
`tick_encode(u64, &mut [u8])` returns bytes written, and
`tick_decode(&[u8])` returns milliseconds as `u64`. All results use `i32` errors.
`records_decode(&[u8])` accepts the mixed set of tags 1, 2 and 5-10 and returns
a borrowed `RecordBatch` that keeps the input and decodes each record again
while iterating (no record array, no allocation); `records_encode(&[Record],
&mut [u8])` checks every field cap and the output size before writing. The
count and byte limits are the same as above. `registrations_decode` still
admits callback registrations only.

`EVENT_TICK_TAG` is emitted from the schema for host event dispatch.

- [D] **Tick delivery (todo 255).** The host sends `event.tick` to every plugin that registered
  it, whether or not one of its widgets or screens is live: plugins use the minute for more than
  widgets (time read, goals, timers), and a filter would make them miss minutes silently. It sends
  at most one a minute, only while the device is awake, at the wake the shell already makes for
  the clock and battery (`Kernel::set_status`, about once a minute); it never schedules a wake of
  its own for a tick. Asleep or suspended there is none and none is caught up afterwards; `now_ms`
  tells the elapsed time. Registrations are fixed for the run: interface 7 has no unsubscribe,
  and adding one is a contract change after 1.0. A plugin therefore keeps a tick with nothing to
  show cheap: no storage write, no `command.widget_changed` unless a shown value changed.

The byte limit is `REGISTRATION_MAX_BYTES = 4096`; registrations also have
`REGISTRATION_MAX_RECORDS = 8`. Exceeding either limit returns `ERR_NO_SPACE`.
Malformed input returns `ERR_INVALID`. An insufficient output buffer returns
`ERR_NO_SPACE` before any byte is written. Both encoders check all bounds before
writing and leave unused output bytes unchanged. The codecs allocate nothing
and retain no borrowed input. Callback-token ownership and supported event-tag
admission are host responsibilities, separate from structural decoding.

Golden vectors, malformed framing, byte/count boundaries, atomic output errors,
and forward extensions are checked with:

```sh
python3 -m unittest discover -s tools/tests -p test_abi_records.py -v
```

The test compiles the generated module as a standalone `no_std` library and
runs its Rust tests. This codec does not qualify the aggregate M1 memory budget.

## Statuses of declaration batches

| Status | Meaning |
| --- | --- |
| `ERR_UTF8` | a `str` field is not UTF-8 |
| `ERR_NO_SPACE` | more than 8 records, more than 4096 bytes, or a field over its cap (encoder: output too small) |
| `ERR_UNSUPPORTED` | unknown tag (also the tick tag in a mixed batch); `setting.spec.kind` above 5; unknown flag bits; `setting.extra.editor_kind` above 2 or `check` not 0; font `style` bits above 1 |
| `ERR_INVALID` | malformed framing or truncated data; every other violated rule below |

An empty batch (zero bytes) is malformed (`ERR_INVALID`) and poisons the
construction. SDKs use it to abort a construction they cannot complete: the
declaration builder sends it once after any refused addition, so `make` fails
even when the plugin ignores the builder's errors. Cross-record references
(an extra's spec, a group's parent, `follows`) are checked at commit against the
whole construction, independent of record order.

A plugin whose construction declares or registers anything is admitted: one
that only registers (events, stages, services, a tick) loads, as in interface 6.
A construction with neither a declaration nor a registration is an invalid
plugin (`ERR_INVALID`; the desktop lists it as damaged), never "needs a newer
PaperPaw" (H1b ruling on #228).

`native_host::declarations` checks each record without a registry and without
allocating; `registrations::validate_records` decodes a whole batch, validates
every record, and on any refusal poisons the construction like `submit` does.
It stages nothing; the loader stages the returned records. Rules:

- Names are dot-separated segments of `[a-z0-9-]`, none empty. The plugin id,
  a dot and the name must fit 128 bytes. Full ids (`parent`, `group`,
  `follows`, `shown_id`, `role`, `extends`) follow the same syntax.
- `setting.group`: `title` not empty; `page` empty or a relative name;
  `parent` empty or a full id.
- `setting.spec`: kinds 0 bool, 1 int, 2 choice, 3 text, 4 language, 5 list.
  Flags: bit0 scoped, bit1 guarded, bit2 kept_on_reset, bit3 secret, bit4
  advanced; secret with scoped is refused. `group` and `title` are not empty
  (no derived titles); empty `help` means none. `default` is exactly one
  settings value (`abi/settings.md`), never absent: bool for kind 0, int for 1,
  text for 2 to 5. An int default lies within `min..=max` and `min <= max`;
  `min` and `max` are 0 for other kinds. `choices` is used only by kind 2, with
  1 to 64 distinct values of 1 to 96 bytes joined by `\n`, at most 1,024 bytes
  in all (refused as soon as a 65th starts; 64 since draft 29, for translate's
  33 languages), and `default` is one
  of them; it is empty for other kinds. A language default is `[A-Za-z0-9-]`,
  at most 35 bytes (empty allowed).
- `setting.extra`: `check` is 0. Flags: bit0 slider, bit1 section_of_plugin,
  bit2 keeps_unknown. `step` is 0 or positive. `editor` is empty exactly when
  `editor_kind` is 0; for 1 (a screen) it is a name relative to the plugin, for
  2 (a slot) a full id. `shown_value` is empty exactly when
  `shown_id` is empty.
- Paths are relative, `[A-Za-z0-9._-]` and `/`, at most 3 segments and 100
  bytes, with no empty, `.`, `..` or dot-leading segment.
- `resource.hyphenation`: `language` is `[A-Za-z0-9-]`, 1 to 35 bytes.
- `resource.font_face`: `path` ends in `.ppfp`, `.ttf`, `.otf` or `.ttc`
  (compared without case), which selects the reader; an empty `family` puts the
  face outside any family (bound by `role`, never offered for text), not the
  file's family; `style` uses bits 0 (bold)
  and 1 (italic); `weight` is 0 or 1 to 1000 and must be 0 for a `.ppfp` path;
  `role` is empty or a full id; `priority` is -100 to 100, and 0 when `role` is
  empty.
- `resource.font_extension`: `path` ends in `.ppfp` (compared without case),
  since only a PaperPaw pack can add glyphs to a face; `extends` is a full id.

Cross-record rules (uniqueness, references that must resolve, per-plugin
limits) belong to the commit and are not checked here.
Goldens and rule vectors: `crates/paperpaw-core/tests/abi7_declarations.rs` and
`tools/tests/test_abi_declarations.py`.
