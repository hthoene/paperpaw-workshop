### Provided metadata

`Library::provide(host, book, &Provided, input, out)` (needs `uses.library`) sets what another
source knows and the book's file does not name, as calibre does for a book it sent:
`Provided::new().title(..)?.author(..)?.series(..)?.number(..)?.tags("a\nb")?` (title and author
at most 512 bytes, series 256, number 32, up to 32 tags of 1 to 128 bytes one per line, 2,048 in
all). Only the fields set are provided, the rest are left alone: a value is never empty or blank
(only Unicode whitespace; nothing clears a field: leave it out) and has no control
character (`char::is_control`: C0, DEL and C1, so a tab or line break either, and U+2028 and U+2029; a tag list separates its tags by line breaks only), and tags replace the provider's whole tag list. Provided
values fill what the book's file does not name: where the file names a field, its own value wins
on (re)index. The last provider's values replace earlier ones, and there is one tag list per
book. They are kept with the book's data and follow it when the book moves. `input` is 4,096 bytes and `out` 64.
`Documents::format_for(host, root, path, sniff, input, out)` tells which format reads a file
(`Root::Data`, or `Root::Library` for the user's files, which needs `uses.storage`): by its extension,
and when none matches and `sniff` is set, by the file's first 512 bytes. The answer is a `Format`
(`id()`, `title()`, `extensions()`, `priority()`); `NotFound` means no format reads it, so a file
manager offers Open only where there is one, and `Documents::readers(host, format.id(), ..)` lists
the readers for Open with. `Documents::formats(host, cursor, input, out)` lists every format in
pages (`FormatPage`, `FormatCursor`). `input` is 1,024 bytes for `format_for` and 256 for
`formats`; `out` 4,096 for both.
