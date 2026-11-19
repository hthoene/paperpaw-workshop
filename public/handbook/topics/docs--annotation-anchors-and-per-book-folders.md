### Annotation anchors and per-book folders

`Library::anchors(host, book, cursor, input, out)` pages through the anchors of a book's
annotations: for each annotation that has them, `Anchor::id()` (the annotation's id),
`conversion()` (the conversion its offsets belong to, `Some(0)` differing from `None`) and
`xpointers()` (the start and end KOReader XPointers, at most 1,024 bytes each; one that is
longer reads as absent). The page's end carries the book's annotation generation like
`Library::annotations`; continue with its cursor and start again after `State`. A reader whose
conversion differs relocates an annotation through its XPointers (`Documents::xpointer` and
`locate`) and writes it back. `input` is 1,024 bytes and `out` 4,096.

`Declarations::book_data(name, BookDataKind::UserData | Cache)` declares a folder the plugin
keeps per book at `books/<name>/<book key>/` in its data (the key from `Library::book_key`): user
data moves and goes with the book, a cache is made again from the book and also goes when the
book is no longer found. The host moves and removes the folders; the plugin only writes inside
them. The name is one folder name (lowercase letters, digits and `-`, at most 96 bytes; no dot, no
separator), and the host allows at most 4 per plugin.
