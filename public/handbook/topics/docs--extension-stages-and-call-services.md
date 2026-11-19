### Extension stages and call services

Declare an extension point with `native::declare::StageDecl` and subscribe with
`SubscribeDecl`, passing it to `Declarations::stage` or `subscribe`. Grammar and payload ranges are
checked locally. Stage ownership, self-subscription, duplicate stage/token pairs
and the eight-per-plugin subscription limit are checked by the host at commit.
A subscription's `order` controls its position and its `signature` contributes to
layout invalidation when the stage changes layout.

A subscriber receives `native::events::Event::StageCall { stage, schema, payload, .. }`
at its declared token. Check the stage and schema, decode `payload` with the
stage owner's schema crate, and write the encoded reply using the existing
`native::reply::Reply`. Return `Error::Unsupported` for a schema the subscriber
does not understand. Plugin-defined stage payloads remain opaque.

For `core.widget` major 1, use `native::ui::stages::WidgetCall::decode(payload)`
to read measure, place and target requests. Reply with `reply_size`,
`reply_place` or `reply_targets` into caller-owned scratch, then pass the encoded
bytes to `Reply`. Targets stay in reading order; more than 32 returns
`Error::NoSpace`. For `core.status` major 1, `StatusCall::decode(payload)` exposes
borrowed requested item ids and context params. Build `StatusAnswer::text` or
`StatusAnswer::drawn` values and encode with `StatusCall::reply`. Replies accept
at most eight requested items and refuse duplicates. These adapters use the
generated directional codecs and allocate no heap storage.

`native::stages::Stage::new(host, "reader.insert")` binds a full stage id.
The host refuses another plugin running it with `Error::Denied`.
`native::stages::StageRun::next` lends one `StageReply` at a time from the owner's
reply buffer. Inspect `status()` before using `payload()`; cancellation, busy and
invalid subscriber replies still advance the cursor. Only `style_granted()`
permits an override of a user-protected style value. Size the buffer with
`Stage::out_len(max_reply)`. End-of-stage and host refusals finish the cursor.

`native::services::Service::open(host, key, major, minor)` opens a generated call
service schema. Keep the handle across callbacks and pass each callback's current
host to `call`. Use `max_reply(op)` to size the output buffer. The SDK checks the
operation version and buffer limits before calling the host. Explicitly consume
the handle with `release(host)` when done; teardown also releases it. There is
no automatic Drop release because the handle retains no callback host. Per-family
typed wrappers define the input and output records.
