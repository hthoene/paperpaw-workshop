### Book key and reading position

`Library::book_key(host, book, input, out)` returns the book's key (the folder name for
the plugin's own per-book data, changed by a move) and its KOReader fingerprint and
size, which together identify the book on other devices. Keys come only from the host.
`Library::position` reads the stored position; `Library::set_position` writes a
`PositionWrite`. A local write always wins. A `.sync()` write wins only over an older
sync position; otherwise it answers `State` and stores nothing, so the plugin can ask
the user and write again with `.confirmed()`. `.confirmed()` without `.sync()` is
refused as `Invalid` and stores nothing. `out` of 4,096 bytes always suffices. The input
buffer is 1,024 bytes for `book_key` and `position` and 2,048 bytes for `set_position`.
