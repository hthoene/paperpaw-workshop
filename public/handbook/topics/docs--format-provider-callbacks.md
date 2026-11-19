### Format provider callbacks

A format's declared token receives `core.format` major 1 stage calls. Decode
its payload with `native::format::FormatCall::decode` and dispatch using
`FormatOp`. These provider operation ids differ from the document service's
ids. The call borrows its text and sniff bytes; `document()` and `conversion()`
identify the state the provider owns for this document. Close releases it.

Use `FormatState::preparing` to report incremental work and `ready` or `failed`
to finish preparation. `reply_state` keeps the call's document and conversion
identity. Scalar reply helpers validate the request operation before encoding
into caller-owned output. Pass the returned bytes through `native::reply::Reply`.

Blocks (op 8) are written with `FormatCall::reply_block(&BlockReply::new(&block)
.next(offset), out)`, adding `.image_index(n)` for a picture block and `.last_in_section()`
for the section's last block. The reply is one fragment of the block's record list,
from the record the call's `cursor` names; when the block does not fit, the fragment
ends with `more`, the next record index and the block's generation, and the host asks
again with them (a changed block is answered `State`). `out` of 3,840 bytes always
holds a fragment.

Lists (sections, table of contents, links, fonts) are written with
`FormatCall::rows(out)` and its typed row methods. A row that does not fit is
`NoSpace`: end the page with `PageEnd::more(total, next, generation)`; the host asks
again with `next` and that generation. The last page is `PageEnd::last(total, generation)`. `total` is the whole list's row
count and `generation` the format's own for this document, never 0, the same on every
page; a call with a stale generation is answered `State`.
Pages always keep room for their closing record. A link whose `href` is over 1,024
bytes is skipped (`Ok(false)`). `reply_image` answers cover and image requests with
the cache path, the picture's own index and size.

`reply_metadata` borrows the existing `document::Metadata`; title and series
previews advertise UTF-8 cuts with flags. `reply_metadata_text` returns the
requested value in UTF-8 parts, preserving its total byte length. It allocates
no strings and refuses offsets inside a character. `reply_position` preserves
the provider's source section and offset without reader insert ordinals.

During a permitted format callback, `native::storage::Root::DocumentCache`
selects root 6, `Book` root 3 and `UserCss` root 4 (root 2 is the plugin's install folder). An empty path names the book
file on root 3 or the CSS file on root 4. Folder and siblings formats read
relative paths within root 3; for siblings, the call's `text()` names the
opened file unless the operation uses text for an XPointer or href. Root 3 is
read only. Root 4 is read only and available during open/prepare only. The host
enforces the callback's scope, cache quota and reserved `.complete`/`.host/`
paths. Never retain a callback's `Host`; `.complete` belongs to the host.
