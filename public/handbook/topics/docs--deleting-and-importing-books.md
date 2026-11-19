### Deleting and importing books

`Library::can_delete(host, paths, input, out)` asks, for 1 to 7 card paths, which books
can go and what would go with them: each `DeleteRow` has `status()` (`Ok`, `Invalid` for
not a book, `NotFound` for gone already, `Io`) and `has_annotations()`,
`has_position()` and `has_book_data()`, so a view can ask the user first.
`Library::delete(host, paths, with_notes, input, out)` removes the books and everything
kept for them; a book with annotations answers `State` in its row unless `with_notes`,
which a plugin passes only for books it downloaded itself or after asking. All three need `uses.library`; `delete`
also needs `uses.storage`, `import` does not. The host refuses
paths whose first segment is `plugins` or `.paperpaw`. Both answer one row per path, with
that path, in the order asked; a reply that does not is `Invalid`. `input` is
4,096 bytes; `out` is 4,096 bytes and also holds the joined paths until the call.

`Library::import(host, &Import, input, out)` puts a downloaded file from the plugin's
root 0 into the library and returns the book's library path, borrowed from `out`.
`Import::new(from, name)` names the source and the file name; `.folder("a/b")` puts it
below the library folder; `.existing(Existing::Replace)` replaces a book this plugin
imported earlier (it keeps its position and annotations), `Existing::FreeName` takes
`name (2).ext`, and the default `Refuse` answers `State`. Names are checked before the
host is called: no empty, `.` or `..` segment, no path separator in the name, no control
character or any of `"*:<>?|`, no trailing dot or space, no reserved device name
(`CON`, `NUL`, `COM1`…), at most 255 UTF-16 units per segment, no name starting with `.`
or `~`; all are `Invalid`. `input` is 2,048 bytes and `out` 4,096. Downloaders need no
storage permission for it.
