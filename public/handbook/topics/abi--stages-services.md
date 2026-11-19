# Interface 7: stages (N4) and services (D4)

Status: contract of family 1a (#228). It replaces the stage and `service.call` parts of PR #231
(`stages-images-services.md`, never merged); images (N6) come with their own family. Everything
here is appended (records, `PpHost` slots 32-34, service schemas), so it changed interface 7: the
one-line `PpHost` shape and the SDK `Record` shape change. Items marked [D] are decided.

It builds on `screens-input.md`: reply buffers (section 6), lifetime and cancellation (section 7),
tag space (section 8), nesting (section 11), grants (section 12) and D1/D4 (section 13).

## 1. Stages (N4)

A stage is a named extension point owned by one plugin, for example the reader's `reader.insert`.
The host is the broker: it orders subscribers, admits them, bounds their replies and enforces
nesting. It never reads the payloads.

### 1.1 Records

| Tag | Record | Fields |
| --- | --- | --- |
| 19 | `stage.spec` (declaration) | `name: str 96`, `schema: u32`, `flags: u32`, `max_input: u32`, `max_reply: u32`, `max_records: u32` |
| 20 | `registration.stage` (declaration) | `stage: str 128` (full id), `token: u32`, `order: i32`, `signature: u64` |
| 512 | `stage.call` (input to a subscriber) | `stage: str 128`, `schema: u32`, `payload: bytes 3840` |
| 513 | `stage.reply` (output of `stage.run`) | `subscriber: str 64` (plugin id), `index: u32`, `status: i32`, `flags: u32`, `signature: u64`, `payload: bytes 3840` |

- [D] **`stage.spec`:**
  - `name` is relative and one segment: `[a-z0-9-]`, 1 to 64 bytes, no dot (the wire field holds
    96 bytes; a longer or dotted name is `ERR_INVALID`). The stage's full id is `<plugin>.<name>`,
    and a full id splits at its last dot into plugin and name. The name is unique among the
    plugin's stages (a second spec of the same name is `ERR_INVALID`). Specs count against the
    host's declaration-index budget (`ERR_NO_SPACE` past it).
  - `schema` is the stage's own payload schema version, set by its owner; subscribers see it in
    every `stage.call`.
  - `flags`: bit 0 `changes_layout`, bit 1 `draws`, bit 2 `takes_taps`. Other bits are
    `ERR_UNSUPPORTED` (a later host may know them).
  - `max_input` and `max_reply` are each in 1..=3840 (the generated
    `STAGE_CALL_PAYLOAD_MAX_BYTES` and `STAGE_REPLY_PAYLOAD_MAX_BYTES`: a whole `stage.call` or
    `stage.reply` then still fits one 4,096-byte batch), `max_records` in 1..=64. Outside them:
    `ERR_INVALID`.
- [D] **`registration.stage`** subscribes the plugin's `token` to a stage by full id, at `order`
  (an `i16`, as `menu.entry`).
  - A registration naming a stage that is not installed is kept and stays inert. Stages come and go
    with plugins, so this is never a load error.
  - At most 32 active subscribers per stage, counted host-wide. Over 32, only the extra
    registrations are refused, never the plugin's batch: the first 32 in stage order (section 1.2)
    are active, the rest stay inert with a log line naming the stage and the plugin. Load order
    never decides. The user can turn a subscriber off per stage (decision 131, #241): the host
    setting `core.stage.<stage id>.<plugin id>`, a Boolean, on by default and REG-visible; a
    subscriber turned off is inert and does not count, from the next outermost callback.
  - The same stage and token twice in a plugin's batch is `ERR_INVALID`.
  - At most 8 stage registrations per plugin; a 9th is refused with `ERR_FULL` for the whole batch
    (the plugin's own declarations, so the plugin can fix it).
  - A registration to the plugin's own stage is refused at commit (`ERR_INVALID`, the whole batch):
    the owner is inside its own callback whenever the stage runs, so it could only ever answer
    `ERR_BUSY`.
- [D] Tags 19 and 20 are in the declaration block; 512 and 513 open the `stage` block
  (`screens-input.md` section 8). Payload tags are local to the stage's schema (for the reader's
  stages, `paperpaw-reader-api`).

### 1.2 Running a stage (slot 32)

```
stage.run(ctx, stage: bytes, cursor: u32, input: bytes, out: buffer) -> count   // slot 32
```

- [D] **Only the stage's owner runs it.** Any other caller gets `ERR_DENIED`. A stage that is not
  declared is `ERR_NOT_FOUND`. Host-defined stages (`core.*`) are run by the host only.
- [D] **One subscriber per call, by cursor.**
  - `cursor` 0 is the first subscriber in stage order: `(order, plugin id, registration index)`,
    ascending, stable while no plugin is added or removed.
  - The call runs exactly the subscriber at `cursor` and writes one `stage.reply` record (a single
    framed record, as `record_encode_one`) into `out`, returning the bytes written.
  - A cursor past the last subscriber returns `ERR_NOT_FOUND` and writes nothing. The caller loops
    until it gets that, so the X4 needs exactly one reply buffer, never subscribers x `max_reply`.
  - `index` in the reply echoes `cursor`.
- [D] **Checks before any subscriber runs** (each refusal runs nothing and leaves `out`
  untouched): `ctx`, frame and owner (`ERR_INVALID`, `ERR_STATE`), the id (`ERR_INVALID`,
  `ERR_UTF8`), the stage exists (`ERR_NOT_FOUND`) and is the caller's (`ERR_DENIED`), `input` at
  most `max_input` (`ERR_NO_SPACE`), and `out` can hold the largest reply this stage can produce:
  `record_framed_len` of a `stage.reply` with a 64-byte subscriber id and `max_reply` payload
  bytes (`ERR_NO_SPACE`).
- [D] **Output publication.** The slot refuses overlapping `stage`, `input` and `out` ranges
  before creating slices. Empty ranges never overlap. The internal broker receives uninitialized
  output storage directly, without a second reply buffer: the subscriber writes its payload into
  `out` behind room for the longest header, and the host then writes the header and moves the
  payload to meet it (#835). An error before the subscriber runs leaves `out` untouched; on
  success the caller reads only the returned prefix (count at most `out` capacity), and the host
  zeroes what follows it up to the end of the lent part.
- [D] **Membership is frozen for the whole outermost callback** in which the owner runs the stage:
  the list is taken at its first `stage.run`, from the subscribers whose plugins have live
  declarations then (#828). Plugins started, stopped, installed or turned off during it change the
  subscriber list only after that callback returns, so a cursor loop sees one list. A plugin that
  was not running before the callback (stopped, or never started) is not in it.
- [D] **A member that stops during the callback** (stopping, trapped) is never skipped and never
  started again inside `stage.run`: its reply has status `ERR_CANCELLED` and an empty payload.
  Making plugins that were never started members (their declarations read before a first start)
  belongs to lazy start (`screens-input.md` section 7), not to this draft.
- [D] **What the subscriber gets.** It is called through `dispatch_event` with its token:
  - `input` is one `stage.call { stage, schema, payload = the caller's input }`;
  - the lent `out` has `cap = max_reply` (section 6 of `screens-input.md`);
  - its result is framed by the host into the `stage.reply` payload, which is empty for a negative
    status.
- [D] **What the host checks of the reply:** framing only: a record batch, count at most
  `max_records`, length at most `max_reply`. On a violation, that subscriber's reply has `status =
  ERR_INVALID` and an empty payload, a log line names the subscriber, and the stage goes on. The
  caller decodes payloads with the stage's own decoder.
- [D] **Status in `stage.reply`:**
  - 0 or more: OK, with `payload` holding the reply;
  - the subscriber's own negative status;
  - `ERR_CANCELLED`: the subscriber plugin is stopped, stopping or not started yet (lazy start, see
    above);
  - `ERR_BUSY`: the subscriber is already in a callback (re-entry is refused, as for every
    `dispatch_event`);
  - `ERR_INVALID`: framing violation.

  An unreachable subscriber is never skipped silently: the caller sees its reply with a status and
  moves on. `stage.run` itself returns OK (the byte count) whenever it wrote a reply.
- [D] **`flags` in `stage.reply` are host-stamped**, never from the subscriber. Bit 0 is
  `style_granted`: the user's `core.grant.style.<subscriber>` is yes (decision 131). This is the
  only way the stage owner learns a subscriber's grant, since grants are own-only
  (`screens-input.md` section 12); the reader applies a subscriber's override of a user-protected
  value only when it is set. Other bits are 0; consumers ignore bits they do not know.
- [D] **`signature`** echoes the subscriber's `registration.stage.signature`. For a
  `changes_layout` stage the owner folds every subscriber's signature into its layout key
  (`screens-input.md` section 9). A plugin changes its signature by declaring again, at its next
  start.
- [D] **Nesting (N8).** `stage.run` runs at depth 1 only; a subscriber (depth 2) that calls
  `stage.run` gets `ERR_STATE`. `service.call` is allowed at depth 2.
- [D] **Who calls, at any depth** (Senior on #833): every service and slot decides whose data,
  grant, root, secret or device list a call gets by the caller the host resolved (the slot's
  context, the service's caller), never by "the plugin that runs now". A nested call (a subscriber,
  a composed child) is still entered as its own plugin for the usage meter, so its time and
  storage count to it, not to the plugin that called it.
- [D] **Lifetime.** `stage.run` is synchronous; nothing about a call outlives it. A subscriber keeps
  no borrow of `stage.call` (section 7).
- [O] **Asynchronous replies** (lookup providers that fetch from the network) are a later additive
  step: a subscriber then answers with an operation handle (section 7) instead of a payload. Not
  needed for the first ports. Owner: Kernel, with the dictionary port.

### 1.3 Host-defined stages

- [D] `core.input-filter` and `core.widget` are `core.*` stages that come with their families (UIX,
  widgets), not with N4 itself. Their payload schemas are generated from stage-local records (section 2.4).
- [D] Escape chord: holding Power for 8 s is never filterable; the host checks it before any
  `core.input-filter` subscriber.

### 1.4 Memory (X4)

- Per subscriber: one declaration-index entry, about 16 bytes resident; per stage spec about 24.
- Per `stage.run`: the caller's `out` and one host-framed `stage.call` on the host scratch, both at
  most 4,096 bytes and released when the call returns. Nothing is retained between calls.
- Timing: a stage the reader runs on every page turn (for example `reader.insert`) costs one
  callback per subscriber; that time counts against the X4 page-turn budget and is part of the
  timing gate of the reader port.

## 2. Services (D4)

A service is a versioned call table the host offers, for example `core.device` or `core.registry`.
Slot 17 stays what it is (snapshot queries over blobs, `interface-7-usage-clock.md`); call services
have their own two slots.

### 2.1 Slots

```
service.open(ctx, key: bytes, major: u16, minor: u16, out: out_handle) -> status            // slot 33
service.call(ctx, service: handle, op: u32, input: bytes, out: buffer) -> count            // slot 34
```

- [D] **`service.open`** gives a handle of kind `Service` for one service key (at most 128 bytes,
  the D1 key grammar, no argument part). Checks, in order, each leaving `out` unchanged:

  | Check | Status |
  | --- | --- |
  | null `ctx`, bad key or `out` pointer, key over 128 bytes | `ERR_INVALID` |
  | no live frame for the caller | `ERR_STATE` |
  | key not UTF-8 / not in the grammar | `ERR_UTF8` / `ERR_INVALID` |
  | no such service on this host | `ERR_NOT_FOUND` |
  | key not declared in the plugin's metadata, other major, or `minor` above the declared revision or the host's | `ERR_UNSUPPORTED` |
  | the plugin already holds a handle for this key, or the registry is full | `ERR_FULL` |
  | allocation failed | `ERR_NO_MEMORY` |

  One handle per declared key, so at most `metadata.max_services` per plugin (`screens-input.md`
  section 7). The handle is released with `handle.release` (slot 8) and at teardown.
- [D] **`service.call`** runs operation `op` of the service behind the handle:

  | Check | Status |
  | --- | --- |
  | null `ctx`, bad pointers, `input` or `out` over 4,096 bytes, `input` and `out` sharing a byte | `ERR_INVALID` |
  | no live frame, or a stale, foreign or wrong-kind handle | `ERR_STATE` |
  | an op the schema does not define, or one newer than the revision the handle was opened with | `ERR_UNSUPPORTED` |
  | an op whose required feature the plugin did not declare (D1) or the user did not grant | `ERR_DENIED` |
  | `input` over the op's `max_input`, or `out` shorter than its `max_reply` | `ERR_NO_SPACE` |
  | `input` not one record batch of the op's input tags, exactly (generated decoder) | the decoder's status |
  | re-entry into the same service from its own callback | `ERR_BUSY` |
  | otherwise: the service runs and writes its reply records into `out`, framed as its schema's family document says | count, or the service's status |

  "Exactly" is about tags: every record's tag is one of the op's `input` tags, by exact tag. Order
  and multiplicity are the op's own rules (for example "one record"), checked by the service after
  the generic checks. The count is generic: at most the op's `input_rows` records
  (`ServiceOp::input_rows`, 1 unless the schema says more), else `ERR_NO_SPACE`; where it is above
  8, the host decodes with the generated `host_records_visit` (the whole batch is checked before the
  first visit, but a visitor's own error leaves the earlier visits done: a handler stages and
  publishes only after the walk returned `OK`) and the SDK encodes with
  `records_encode_counted`.

  Every check above runs before the service does anything, so a refused call has no effect and
  leaves `out` untouched. The service then builds its reply in `out` itself, in its first
  `max_reply` bytes (the host keeps no copy of a reply, #248). A service's own failure after that
  is its documented status, and **its reply room is cleared**: the first `max_reply` bytes of `out`
  are zero, so no part of a reply remains, and the caller reads nothing of `out`. On success the
  bytes past the count, up to `max_reply`, are zero too; bytes past `max_reply` are never touched.
- [D] **Synchronous and bounded.** A call never waits on the network or the card beyond its op's
  stated bound. Longer work returns an operation handle (section 7, D3) whose completion is
  `event.op_done`, read with a further op of the same service.
- [D] **Nesting:** allowed at depth 1 and 2.

### 2.2 Records

Service input and reply records are kernel records of the `service` family in the growth block
1024-1535 (`screens-input.md` section 8), declared in `abi/abi.def` like every record and part of
the generated records codec. A schema names them by tag; decoders classify by exact tag. The first
one exists for host tests only:

| Tag | Record | Fields |
| --- | --- | --- |
| 1024 | `service.echo` | `text: str 256` |

### 2.3 Schemas (`abi/services/<key>@<major>.def`)

Each major of a service has one schema file, `abi/services/<key>@<major>.def` (JSON):

```json
{
  "key": "core.test-echo", "major": 1, "revision": 0, "since": 1, "test_only": true,
  "ops": [
    {"id": 1, "name": "echo", "since": 0, "effect": "query", "feature": null,
     "input": ["service.echo"], "reply": ["service.echo"],
     "max_input": 512, "max_reply": 512, "bound": "none"}
  ]
}
```

- [D] `key`: the D1 service key grammar; the file name is `<key>@<major>`. `major` 1..=65535 and
  `revision` 0..=65535 are the D1 catalog's `major` and `semantic_revision`: every schema has a
  metadata catalog entry (`abi.def` `metadata.services`) with the same key, major and revision,
  which is what plugins declare. `since` is the interface minor that introduced it; a new schema
  takes a minor not yet released (as every record, setting and metadata addition). `test_only`
  marks a schema for host tests: the generated table carries it, and a device host never registers
  such a service.
- [D] Ops, in id order: `id` 1..=65535, unique, never renumbered; `name` unique
  (`[a-z][a-z0-9_]*`); `since` the service revision that introduced the op (at most `revision`); `effect` `query` or `mutate`;
  `feature` a D1 feature key that gates it, or null; `input` and `reply` lists of `service.*`
  record names (tags taken from `abi.def`), at most 16 each; `max_input` and `max_reply` in
  1..=4096; `bound` what the call may wait for: `none`, `card` (one bounded card access) or
  `radio` (never: that is an operation handle).
- [D] Row counts, each written only where it differs from its default (so other ops keep their
  exact form and lock): `input_rows` 2..=64, the most records one input batch holds (default 1);
  `paged: false` on a list op (its reply ends with `service.end`) that answers all its rows in one
  call, with `reply_rows` 1..=64 its most rows before `end`. Its `end` is the unpaged end:
  `total` the rows written, `flags`, `next` and `generation` 0 (no `last` bit: there is no other
  page), else the host and the SDK refuse the reply with `ERR_INVALID`. A paged list op (the
  default) holds the schema's `page_rows`. The generated `ServiceOp` carries all three
  (`input_rows`, `paged`, `reply_rows`, 0 for an op that is no list), so readers check from the
  table, never by op number.
- [D] `tools/abi-gen.py` validates every schema and writes one generated module, `services_wire`,
  to `abi/generated/`, `crates/paperpaw-core/src/abi7/` and `crates/paperpaw-sdk/src/native/wire/`:
  per service its key, version and op constants (module `<key>_v<major>`), and a static table the host dispatcher and the SDK
  wrappers share (`SERVICES`, `ServiceSchema`, `ServiceOp`, `service_op`).
- [D] The ABI lock pins every schema (lock section `services`), by key and major: a published
  schema only grows. Its ops, their ids, names, inputs, replies, bounds, features, `max_input` and
  `max_reply` never change (so a reply never grows past what a caller sized for); a new op takes a
  new id and the service's next revision; a breaking change is a new major, a new schema file next
  to the old one.
- [D] **First services**, each with its family's PR: `core.device` (DEV), `core.registry` (REG),
  `core.storage` metadata (FS), `core.library` (LIB), `core.secrets` (SEC), `core.net` (NET).
  `core.test-echo` exists for host tests and is never offered on a device.

### 2.4 Stage schemas (`abi/stages/<key>@<major>.def`)

Each major of a host-defined stage has one JSON schema, `abi/stages/<key>@<major>.def`:

```json
{
  "key": "core.status", "major": 1, "revision": 0, "since": 1, "test_only": false,
  "max_subscribers": 32, "max_input": 3840, "max_reply": 3840,
  "input": ["status.ask"], "reply": ["status.value"], "reply_rows": 8,
  "records": [
    {"id": 1, "name": "status.ask", "since": 0, "fields": [
      {"name": "items", "type": "str", "since": 0, "optional": false,
       "ordinal": null, "default": null, "max_bytes": 1032,
       "list": {"separator": "\n", "max_items": 8, "item_max_bytes": 128}},
      {"name": "context", "type": "bytes", "since": 0, "optional": false,
       "ordinal": null, "default": null, "max_bytes": 1024}
    ]},
    {"id": 2, "name": "status.value", "since": 0, "fields": [
      {"name": "item", "type": "str", "since": 0, "optional": false,
       "ordinal": null, "default": null, "max_bytes": 128},
      {"name": "flags", "type": "u32", "since": 0, "optional": false,
       "ordinal": null, "default": null, "max_bytes": 0},
      {"name": "text", "type": "str", "since": 0, "optional": false,
       "ordinal": null, "default": null, "max_bytes": 128}
    ]}
  ]
}
```

- [D] `key` follows the service key grammar, at most 128 bytes, and must start with `core.`.
  The file name names the same key and major. `major` is 1..=65535, `revision` is 0..=65535,
  and `since` names an interface minor in 1..=the current minor. A new schema takes an unreleased
  minor. `test_only` marks a schema that device hosts never run.
- [D] Record tags are local to this stage schema, in 1..=511, unique and ascending. Record names
  have the same grammar as `abi.def` record names and are unique within the schema. A record's
  `since` and each field's `since` name a schema revision, at most `revision`. Fields use the
  same types, bounds, optional bitmap and list rules as `abi.def` records. Stage tags do not
  reserve or reuse kernel record tags. Plugin-defined stages publish their own payload schemas;
  the host checks their framing only.
- [D] **A plugin's own schemas** (keys `<plugin>.<name>`, never `core.*`, no `mirrors`, `since`
  the schema's own version) use this format, one `<key>@<major>.def` per file in the owning
  crate; `tools/stage-codec.py <folder> <file.rs>` emits their codecs and `STAGES` table with
  the host stages' validators and emitters, and `--check` (in CI) refuses stale output. A
  plugin's stage may add `input_rows` (2..=64): its input batch is then 1..=`input_rows` records
  of its input tags (a head record and rows, in the order its owner documents), checked by its
  `input_decode`/`input_encode` with the same byte cap; the host checks its framing only. Without
  the key, the input is one record, as for every host stage.
- [D] **Payload schemas.** Records a plugin carries inside a host frame (a `draw.frame` or
  input payload: one record each time, one direction, no subscribers, no reply) use the same
  folder with keys `payload` (`<plugin>.<name>`), `major`, `revision`, `max_bytes` (1-3,840) and
  `records`. `stage-codec.py` emits the same codec module for them, the records as its
  one-record input side (`input_encode`, `input_decode`, each record's `encode`/`decode`), the
  reply side sealed (no tags, no rows, cap 0), and lists no payload in `STAGES`.
- [D] **Mirrors.** A record may name `"mirrors": "service.<name>"` instead of `fields`: it is
  the same record as that `abi.def` service row under its stage-local tag, and the generator
  copies the row's fields (at the record's `since`), so the two never drift apart. The module's
  `SERVICE_TAGS` lists `(local tag, service tag)` for each mirrored record: the host passes such
  a reply on as a service row by changing only its tag (DOC's `core.format` rows and block stream,
  `document.md` section 3).
- [D] **A mirror grows only with a revision.** A field appended to the service row in a later minor
  must be named in the mirror's `"field_since": {"<field>": <revision>}` with the stage revision
  that takes it (the generator refuses the schema otherwise), so its stamp never moves when the
  revision grows again; mirrored records then take the same compatibility check as every other
  stage record (fields only appended, optional, at a newer revision).
- [D] **Retagging grows a reply by at most one byte a row.** Local tags below 128 take one byte,
  service tags (1024-1535) two, and the frame's length and body stay. The generator checks that
  `max_reply` + `reply_rows` x that growth fits the service's 4,096-byte reply: `core.format` is
  3,840 + 64 = 3,904. The host still checks the retagged reply against the service op's
  `max_reply` and refuses an overrun as a malformed answer.
- [D] `input` names 1..=8 and `reply` 1..=32 distinct records from this schema; no record belongs
  to both. `max_subscribers` is 1..=32, `reply_rows` is 1..=64, and each of `max_input` and
  `max_reply` is 1..=3840 bytes. The generator refuses a schema if one framed input record at
  its field caps exceeds `max_input`, or one framed reply record exceeds `max_reply`.
  Row and byte caps bind independently; the host sizes reply room by `max_reply`.
- [D] `tools/abi-gen.py` emits `stages_wire.rs` to `abi/generated/`,
  `crates/paperpaw-core/src/abi7/` and `crates/paperpaw-sdk/src/native/wire/`. All copies are
  identical. Each `<key>_v<major>` module carries the key, version, bounds, input/reply tags and
  borrowed record codecs, exported to plugins as `native::stage_schemas`; `STAGES` lists the schemas for the host. `input_decode` checks
  exactly one input record and `max_input`; `reply_decode` checks reply tags, `reply_rows`
  and `max_reply`. Both validate the full batch before exposing a borrowed cursor. Unknown
  appended fields stay within the record length and are skipped; bytes after the batch
  are refused. The codecs share the kernel
  records emitter, framing and validation rules, without allocation.
- [D] The ABI lock pins the schema and generated codec. A published schema keeps every key,
  major, record and existing field. New records and appended fields take a newer schema
  revision; the bounds never shrink. A breaking change needs a new major alongside the old one.
- [D] Stages have no `metadata.services` catalog entry: plugins do not open them as services.
  Stage declarations select the stage by key and major. The initial schemas are
  `core.input-filter` (4 subscribers, one verdict), `core.widget` (32 subscribers, up to 32
  target rows) and `core.status` (32 subscribers, up to 8 value rows); DOC adds `core.picture`
  (2 subscribers, one tone row: `document.md` 5) and `core.format`
  (the format call, 22 reply kinds, up to 64 rows) and `core.lookup` (one entry per provider
  call), `document.md` sections 3 and 7; LIB adds `core.book-badge` (32 subscribers, 16 book keys
  in, up to 16 badge rows out), `library.md` section 1.

The stage codec is pinned as `emitted_stages`, the SHA-256 of the unformatted emitter
output, in ABI lock format 11. Formatting is checked separately, so a rustfmt update
does not change a frozen digest. Older lock
formats still validate their original emitted sections. This adds no wire draft.

## 3. Memory (X4)

- `service.open`: one `Service` handle (registry slot, about 40 bytes) per declared key in use.
- `service.call`: `input` and `out` are the caller's; the host decodes in place and allocates only
  what the op documents. The schema table is `static` (flash).

The inactive host-run broker bounds its own allocation payloads to 24 KiB:
selection and frozen subscriber lists, at most 32 copied plugin ids of 128 bytes,
the exactly sized encoded call (at most 4096 bytes), and the reply scratch (at most
3840 bytes). This excludes allocator overhead, retained instances and plugin work.
Before X4 activation, measure peak heap with the caller's staged target copy,
reader caches, plugin scratch and retained instances all live. The payload bound
is not a device heap or stack measurement.

## 4. Hand-offs

**Core** (host), in this order:
1. N4: `stage.spec` and `registration.stage` admission (the subscriber count host-wide); slot 32,
   ordering and cursor, `stage.call` framing on the host scratch, framing-only reply checks, the
   host-stamped `stage.reply`, the N8 refusal at depth 2; tests for every status above, a 33rd
   subscriber, a foreign caller (`ERR_DENIED`) and a style grant reaching the owner only as the flag.
2. D4: slots 33 and 34 over the generated `SERVICES` table, the `Service` handle kind, the
   `core.test-echo` service for tests (never registered on a device), tests for every row of both
   tables.

**Services** (SDK): a typed `Stage` caller (cursor loop, `StageReply` view with
`style_granted()`), a subscriber helper (decode `stage.call`, write the reply through `Reply`), and
`Service::open`/`call` with typed wrappers per schema, using the generated table.

**Kernel:** this contract, the records and slots in `abi.def`, the schema generator and its lock
section, and review of each family's schema.
