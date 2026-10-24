### What every library offers

A view of the library of one's own (bound to `core.library`) is as
fast as the shipped one, on the X4 too, as both ask the same service
and read the same catalog; plugins that add to the library add to
every view of it.

| What | Standard | |
|---|---|---|
| The library to ask | `library::service(env)`, a `trait Library` | A book's details, the catalog's state, queries, the index of all books, finished and favourite. Deleting books: `delete`, `can_delete`. A library of one's own provides a `LibraryService` as `library::service::SERVICE` in `library::service::VERSION`, with at least `each`, `records` and `version`. |
| Every book, without reading each | `library::catalog` | One line a book: author, title, series, number, tags, how far read, favourite, opened, added, fields. Read in pieces with `each`, `each_at` and `read_at`. |
| Books found, a page at a time | `catalog::Query`, `query`, `found` | by how far read, words, author, series, tag, folder, added since; sorted by title, author, series or added |
| All books to sort and filter in memory | `library::index::Index` | 24 bytes a book, at most 2000 on the X4 (48 KB). Kept in a file while a book is open with `save` and `load`. Status changes are taken with `refresh`. |
| The catalog made anew | the kernel, as work in the background, never while a book is open | Walked once a view asks after a start (`library::request_catalog`, `request_catalog_anew`). Also for a new library folder and after `LIBRARY_CHANGED`. Caught up after `BOOK_ADDED`, `BOOK_MOVED` and changed fields. `BOOK_REMOVED` leaves a book out at once. Then `events::CATALOG_CHANGED` comes. |
| Something of one book changed | `events::BOOK_CHANGED` (`library::changed_book`, bits of `library::what`) | finished, a favourite, read further, details, cover, a field |
| A book came | `events::BOOK_ADDED` (`library::added(path, source)`) | transfers, syncs and downloads send it |
| A book deleted | `Library::delete`, which answers `library::Deleted` | Only books are deleted: a format known by its extension or first bytes, outside PaperPaw's own folder (`library::is_book_path`). Others are refused, and what fails says why. Asking first is the view's job, as the book's sheet does. The kernel's library removes the files and sends `events::BOOK_REMOVED` for each. The kernel then forgets the book and removes what is kept for it in the folders of `Registrar::add_book_data`. Views leave it out at once. |
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
