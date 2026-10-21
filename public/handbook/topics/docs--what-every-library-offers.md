### What every library offers

A view of the library of one's own (bound to `core.library`) is as
fast as the shipped one, on the X4 too, as both ask the same service
and read the same catalog; plugins that add to the library add to
every view of it.

| What | Standard | |
|---|---|---|
| The library to ask | `library::service(env)` (`trait Library`; a library of one's own publishes one as `library::service::SERVICE`, giving at least `each`, `records` and `version`) | a book's details, the catalog's state, queries, the index of all books, finished and favourite; a plugin may publish its own as `library::service::SERVICE` |
| Every book, without reading each | `library::catalog` | one line a book: author, title, series, number, tags, how far read, favourite, opened, added, fields; read in pieces (`each`, `each_at`, `read_at`) |
| Books found, a page at a time | `catalog::Query`, `query`, `found` | by how far read, words, author, series, tag, folder, added since; sorted by title, author, series or added |
| All books to sort and filter in memory | `library::index::Index` | 24 bytes a book (2000 at most on the X4: 48 KB), kept in a file while a book is open (`save`, `load`), status changes taken with `refresh` |
| The catalog made anew | the kernel, as work in the background, never while a book is open | walked once a view asks after a start (`library::request_catalog`, `request_catalog_anew`), for a new library folder and after `LIBRARY_CHANGED`; caught up after `BOOK_ADDED`, `BOOK_MOVED` and changed fields; `BOOK_REMOVED` leaves a book out at once; then `events::CATALOG_CHANGED` |
| Something of one book changed | `events::BOOK_CHANGED` (`library::changed_book`, bits of `library::what`) | finished, a favourite, read further, details, cover, a field |
| A book came | `events::BOOK_ADDED` (`library::added(path, source)`) | transfers, syncs and downloads send it |
| What can be done with a book | `menus::BOOK`, `events::BOOK_CHOSEN` | add an action to the menu, hear which book it was chosen for |
| Another way to open a book | `menus::OPEN_WITH`, `events::BOOK_CHOSEN` | add an action to the list of *Open with …*, beside the reading apps; it hears the book as the book menu's actions do |
| A book's information | `slots::BOOK_INFO` | lists the fields of `add_book_field` |
| Where the books are | `settings::LIBRARY_FOLDER` (`library::folder(env)`) | the kernel's setting, chosen with `screens::FOLDER_EDITOR` (the folder chooser of `slots::CHOOSE_FOLDER`) |

How far a book is read and whether it is a favourite change while the
catalog stands: the kernel notes such changes beside it (when a book is
opened, closed or finished, and through the service's setters), so a
view knows them at once without a new catalog and without reading each
book. A view keeps nothing of the catalog but its index, of the
library's version (`Library::version`: keys hold only for it,
`Library::is_current`); a page's books are read by their keys in one go
(`Library::records`), their badges asked then
(`library::service::badges`), never while drawing.
