### Native library access

Open `native::library::Library` during a callback and release the service handle
explicitly when finished. Declare `core.library` and request `uses.library` in
metadata. Build borrowed filters with `Query::new().show(Show::Unread)` and
`.words(search)?`. `Library::query` returns a page borrowing the output buffer;
read `page.end().next()` to continue the same query with `.cursor(next)`.
A stale generation returns `State`; start the query again instead of skipping rows.
`Entry::badges()` exposes the host's badge texts without a second lookup.

Identify a book with `BookRef::path(path)?` or a catalog key and its page generation.
`set_finished(host, book, true, input, out)` changes only the finished status and
`set_favourite(host, book, true, input, out)` only the favourite status; both are idempotent.
`Library::book_text(host, book, BookTextQuery::title(), input, out)` reads a whole title,
`author()`, `series()`, the tag at `tag(index)` or the plugin field at `field(index)` (as
`id=value`), the lists' lengths being `Book::tags()` and `Book::fields()`, in parts of at most
1,024 bytes: continue with `BookTextPart::next_offset()` (`.from(offset)`) until it is `None`
(`input` of 1,024 and `out` of 4,096 bytes suffice; an index past the count is `NotFound`).
The catalog rows and `Library::book` cut long values; this does not.
`set_field` takes the full `plugin.name` field id owned by the caller; an empty
value removes it.
The SDK leaves field enumeration out until the host contract supports lossless
paging for all fields. Reply and input buffers belong to the caller; queries
allocate no SDK heap storage.
