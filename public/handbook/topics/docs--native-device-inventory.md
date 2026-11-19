### Native device inventory

Open `native::device::Device` from a callback after declaring `core.device` in
metadata. Its inventory reads include `device`, `firmware`, `native`, `memory`,
`values` and `builtins`; radio, power and request-status reads use the same handle.
Call `release(host)` explicitly when the handle is no longer needed.
Replies borrow the caller's output buffer, and the SDK allocates no reply storage.

Use `DeviceCursor::start()` for a paged list and continue only with
`page.end().next_cursor()`. A `State` error means restart from the first page.
Hardware values and physical keys are complete unpaged lists; their terminal
metadata is checked before rows are exposed. Optional memory readings return
`None` when the host did not measure them. `FileCheck` is host evidence, not a
local trust decision; installation still goes through the host confirmation flow.
