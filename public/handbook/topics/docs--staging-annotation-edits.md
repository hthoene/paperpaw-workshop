### Staging annotation edits

A plugin that saves a whole merged set of annotations (KOReader) stages them in a transaction:
read the book's annotations and keep the annotation generation of the last page, then
`Library::edit_begin(host, book, generation, input, out)` gives a `Transaction`. Stage edits with
`edit_add(host, &mut tx, &[AnnotationEdit], input 4,096, out)`, at most 3 per call (more is
`NoSpace`): `AnnotationEdit::add`, `upsert` (by `client_key`, so a repeated import adds nothing
twice), `replace(id, ..)` and `remove(id)`, with `.percent()`, `.conversion()`, `.times()`,
`.client_key()`, `.text()`, `.note()` (at most 3 KiB) and `.xpointers(start, end)` (1 to 1,024
bytes each). The SDK sends a text or note over 512 bytes and every XPointer in parts, cut on
character boundaries; limits are checked before anything is sent. `edit_commit` applies all edits
or none: `State` means the book's annotations changed since `edit_begin` (read again, merge, begin
again). A plugin advances its own sync state only after a commit answered `Ok`. After an error from
the host while staging, call `edit_abort`: the transaction refuses further staging and commit
(`State`). One transaction is open per plugin and two on the device (`Full`); it ends on commit,
abort, ten idle minutes or when the plugin stops. `edit_receipt(host, &committed, cursor, input,
out)` then pages the annotation ids the edits made, `Receipt::{edit, id, action}`, until the
plugin's next `edit_begin`. Every receipt page carries the annotation generation the commit
answered; a page of another generation is `Invalid`.
