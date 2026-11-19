### Reading annotations through interface 7

Use `native::library::Library::annotations` with a `BookRef` and
`AnnotationCursor::start()`. `page.end().total()` counts all annotations for
that book, including bookmarks and highlights without notes. This count is
available from the first page; a whole-library overview reads a first page for
each catalog book. There is no count-only call or catalog has-notes filter.

Annotation rows borrow the caller's reply buffer and include stable per-book
ids, kind, source offsets, progress, timestamps and text/note previews. Each
preview is at most 512 UTF-8 bytes. Continue with `page.end().next()` while
keeping the same book reference. The cursor carries the book's annotation
generation; a catalog reference carries a separate catalog generation. On
`Error::State`, restart that book's annotation enumeration.

For lossless exports, read cut previews with `Library::annotation_text` and
`AnnotationTextQuery::new(id, AnnotationTextKind::Text)` or `Note`. The id is
the annotation id, not the row index. Each part borrows at most 1,024 UTF-8 bytes;
continue with `query.from(part.next_offset().unwrap())` only when the offset is
present. Consume each borrowed part before reusing the output buffer. Text calls
have no annotation-generation input, so a multi-call export must handle concurrent
edits; it does not acquire a snapshot. A caller can recheck annotation generation
and restart if it changed.
