# Scoped Canvas forwarding

`native_host::canvas::CanvasScope` is a host-only, pinned, single-threaded
scope for the existing `canvas.fill_rect` entry (slot 9). A stable owner context
contains the scope; the driver lends `&mut Canvas` only while invoking a leased
synchronous draw callback. This does not install a production dispatcher.

The driver calls `scope.scope(&mut canvas, || foreign_draw(...))` through a
pinned scope reference. The closure receives no Canvas reference. The scope
holds no RefCell guard across foreign execution. Each drawing operation briefly
acquires an exclusive guard, calls the approved graphics backend, and releases
the guard before returning. Nested scope installation and overlapping drawing
are refused. Return, callback error, and unwind all clear the pointer before the
original borrow ends. A later event may lend a different canvas.

`fill_rect_raw(x: i32, y: i32, width: u32, height: u32, color: u32)` matches the
slot's scalar arguments. Packed color uses the schema-owned generated color
codec described in [color.md](color.md); consumers must use its encoder rather
than infer bytes or alpha. Invalid color is rejected before drawing. Valid
calls outside a draw scope return `ERR_STATE`; overlapping operations return
`ERR_BUSY`. The typed `fill_rect` also rejects geometry outside the existing
signed 32-bit coordinates and unsigned 32-bit extents before effects.

Successful fills return `OK`. Existing clipping, signed origins, grayscale
luminance, zero extents and semantic sinks are preserved. A primitive fill adds
no invented semantic role. The wrapper allocates no storage and retains no
framebuffer pointer beyond scope exit. It does not provide text/font handles,
other drawing slots, or asynchronous drawing.

The loader must continue to enforce owner admission, callback leases and module
lifetime; this drawing scope does not replace those obligations. It must clear
the scope before releasing callback resources or starting owner teardown. No
borrowed Canvas or generated wire record may be stored in a queued callback.

## Remaining command gap

Slot 15 (`commands.submit`) still needs a chosen schema-owned command record,
complete bounded decoding, and a scoped command sink associated with the
admitted owner. A callback must not mutate a live kernel through an invented
context cast. The implementation must define batch refusal/partial-effect
semantics and ownership of any retained text before accepting submissions.
Existing SDK `Command::Notify` and `Command::SetSetting` are different operations;
neither has a flat wire record yet. Choosing one for the pilot, with tests of its
actual effect and refusal paths, is a separate increment. Canvas pixels alone
do not complete the setting → drawing → event → command proof or Battery port.
