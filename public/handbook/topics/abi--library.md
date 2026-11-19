# Interface 7 family LIB: the library, reading state and book data

Contract for #228 (assignment #1025). Items marked [D] are proposed decisions, [Q] open
questions for Plugin and Senior. Inputs: the plugin needs inventory (#984,
`plugin-needs-reg-uix-dev-lib-doc-228.md`, LIB section and coverage ledger), the C-family proposals
(#890 2.7 LIB, Senior's N9: shared reading data as services, not files), the interface-6 library
(`paperpaw-sdk` `library`, `positions`, `annotations`), `document.md` (image ids, book key,
document cache), `ui.md` (host texts for long values), `core-events.md` (book events 65-69) and the
storage contract (D2, owner decisions 124 and 125).
Records: `abi/services/core.library@1.def` and `core.lookup@1.def`.

## 0. Scope and principles

- [D] **Shared reading state is the host's.** The catalog of books, their status (finished,
  favourite, opened), reading positions, annotations (bookmarks, highlights, notes), plugins' book
  fields and badges, and the data plugins keep per book live under `.paperpaw/`, which root 1 never
  shows (decision 125). Plugins reach them only through the service `core.library` (section 2),
  which keeps them consistent, atomic and announced. Interface 6's direct file access
  (`positions::save`, `annotations::save`, `catalog::note`) has no interface-7 copy.
- [D] **One library for 1.0.** The host's walk and catalog (the kernel library of interface 6) is
  the only catalog. A plugin that knows more about books (calibre's metadata) **provides** fields to
  it (section 5). Interface 6 could also **replace** the library with one of a plugin's own (its
  `Library` trait; `files/tests/library_service.rs` tests a remote library with books not on the
  card); no shipped plugin does. This draft does not carry replacement: a deliberate capability
  loss, not parity, **accepted by Manager for 1.0** (2026-11-07); a later additive
  `core.library-source` stage (a plugin lists books of its own, shown beside the card's under path
  scheme `<plugin>:`) can bring it back.
- [D] **Nothing is lost on a move, a rename or an export** (inventory rule 1): positions,
  annotations, fields and book data follow the book when the host moves it, and when the user moves
  it on a computer the host finds them again by the book's fingerprint (section 6).
- [D] **Every change is visible to all** (rule 2): each one raises `event.library_changed` (91) and,
  for a book's file, EVT's 68/69. Readers of a value never cache it across that event.
- [D] **Feature `uses.library`** (signed metadata, as `uses.storage`): every op below needs it
  (`ERR_UNSUPPORTED` without). The store page and the install confirmation say what it means in
  plain words: the plugin reads the whole library, every reading position and **every plugin's
  highlights and notes**, and may change them. Ops that remove or move the user's files (`delete`,
  `move`) also need `uses.storage` (decision 125). `import` does not: it only puts a file the plugin
  made into the library folder (section 2.3), so downloaders need no card-wide access.
- Out of LIB: opening and reading books (DOC), the catalog walk's internals (host), sync protocols
  (koreader, kosync: plugins over NET/SOCK).

## 1. Declarations

| Tag | Record | Fields |
| --- | --- | --- |
| 231 | `book_field.spec` | `name: str 96`, `title: str 96`, `flags: u32` |
| 232 | `book_badge.spec` | `name: str 96`, `token: u32`, `flags: u32` |
| 233 | `book_data.spec` | `name: str 96`, `kind: u32` |

- [D] `book_field.spec`: a field `<plugin>.<name>` the plugin keeps with
  books (a rating, "on loan"), `title` a catalog key; `flags` bit 0 `in_catalog` (a short value, at
  most 64 bytes, kept in the catalog so queries and rows show it), else at most 1,024 bytes kept per
  book. Other bits `ERR_INVALID`. At most 8 per plugin (a ninth is `ERR_INVALID` for the batch)
  and 64 device-wide (`ERR_FULL` for the batch that would pass it); the plugin does not load,
  `reg_plugin.problem` 16 (`registry.md`). A `name` twice in one plugin is `ERR_INVALID` for the
  batch; two plugins may use the same name (the field is `<plugin>.<name>`).
- [D] `book_badge.spec`: a badge on a book's row, answered by its owner
  through the host-defined stage `core.book-badge` (major 1, generated stage schema; input
  `badge.ask` with up to 16 book keys of a page, reply up to 16 `badge.value`: `key`, `text: str 16`
  a few letters, or `icon: str 64`); asked when a page of rows is read, never while drawing; views
  show two at most. `flags` reserved, 0. At most 4 per plugin (a fifth is `ERR_INVALID` for the
  batch) and 16 device-wide (`ERR_FULL` for the batch that would pass it); the plugin does not
  load, `reg_plugin.problem` 17 (`registry.md`). A `name` twice in one plugin is `ERR_INVALID` for
  the batch; two plugins may use the same name.
- [D] **Order of fields and badges** (stable across loads and updates): by owning plugin id, then
  by `name`, both in byte order; never by load order, so a plugin that reloads or updates keeps
  its place. Op 22 lists fields in this order. A row's `badges` (`lib_entry`, at most two) are the
  first two in this order whose owner answered a non-empty `text` or `icon` for that book.
- [D] `book_data.spec` (interface 6 `add_book_data`, `add_book_cache`): the plugin keeps a folder
  per book in its own Data (root 0) at `books/<name>/<book key>/` (the book key of section 6);
  `kind` 0 user data (moved with the book, removed with it), 1 cache (made again from the book: also
  removed when the book is no longer found, at the walk's clean-up). The host moves and removes
  these folders; the plugin only writes inside them. At most 4 per plugin. `name` is one folder
  name: 1-96 bytes of lowercase ASCII letters, digits and `-` (no `.`, no `/`), unique within the
  plugin, and not 16 hex digits, the form of a book key (`books/<key>/` holds a book's own
  settings, `registry.md` 4.1); anything else is refused at admission (`ERR_INVALID`, the
  declaration dropped).

## 2. The service `core.library` (major 1)

Bare reply streams and paging as `core.registry` (`registry.md` 2.1), `page_rows` 32 (whole rows
that fit 4,096 bytes). Three kinds of generation, never mixed up:

- the **catalog generation** (`lib_state.generation`, `lib_query.generation`): it changes on every
  change that can add or remove a book from a query's result or reorder it: a book added, removed or
  moved, a walk step that found books, a status change, an in-catalog field change, a book opened
  (the "recently opened" order), and progress crossing from never opened to opened or to finished.
  A plain progress change does not (no order or filter uses the percent). A paged call with a stale
  catalog generation is `ERR_STATE`: start again; no page skips or repeats a book.
- the **annotation generation** of one book (`lib_page.annotation_generation`,
  `lib_edit_head.annotation_generation`): it changes on every committed annotation change of that
  book only.
- the **field generation** of one book (`lib_field_page.generation`, the `service.end.generation`
  of op 22 `fields`): it changes when the content of the book's fields changes (a `set_field`
  that changes a value or removes a field, a move of its data that changes them; section 4). A later `fields` page asked with a stale field generation is `ERR_STATE`.

| Op | Name | Input | Reply | Effect |
| --- | --- | --- | --- | --- |
| 1 | `state` | (none) | `lib_state` | query |
| 2 | `query` | `lib_query` | `lib_entry`*, `end` | query, paged |
| 3 | `book` | `lib_ref` | `lib_book` | query |
| 4 | `text` | `lib_text_at` | `lib_text` | query: one long text or list item, from an offset |
| 5 | `facets` | `lib_query` (`facet`) | `lib_facet`*, `end` | query, paged: authors, series, tags, letters, folders |
| 6 | `next_in_series` | `lib_ref` | `lib_entry` | query, `ERR_NOT_FOUND` for none |
| 7 | `cover` | `lib_cover` | `doc_image` | query: an image id (`document.md` 5) |
| 8 | `set_status` | `lib_status` | (none) | mutate |
| 9 | `can_delete` | `lib_paths` | `lib_result`* (at most 7), `end` | query: the delete preflight |
| 10 | `delete` | `lib_paths` | `lib_result`* (at most 7), `end` | mutate, card; `uses.storage` |
| 11 | `move` | `lib_move` | `lib_result` | mutate, card; `uses.storage` |
| 12 | `import` | `lib_import` | `lib_result` | mutate, card |
| 13 | `position` | `lib_ref` | `lib_position` | query |
| 14 | `set_position` | `lib_position_set` | `lib_result` | mutate |
| 15 | `annotations` | `lib_page` | `lib_annotation`*, `end` | query, paged |
| 16 | `anchors` | `lib_page` | `lib_anchor`*, `end` | query, paged |
| 17 | `edit_begin` | `lib_edit_head` | `lib_transaction` | mutate: a staged transaction |
| 18 | `edit_add` | `lib_transaction_ref`, `lib_edit`* | (none) | mutate (staged) |
| 19 | `edit_text` | `lib_edit_text` | (none) | mutate (staged): a long text or note in parts |
| 20 | `edit_commit` | `lib_transaction_ref` | `lib_committed` | mutate, compare-and-swap |
| 21 | `edit_abort` | `lib_transaction_ref` | (none) | mutate |
| 22 | `fields` | `lib_ref`, `lib_field_page` | `lib_field`*, `end` | query, paged |
| 23 | `set_field` | `lib_field_set` | (none) | mutate, own fields only |
| 24 | `provide` | `lib_provided` | (none) | mutate (section 5) |
| 25 | `book_key` | `lib_ref` | `lib_key` | query (section 6) |
| 26 | `edit_receipt` | `lib_receipt_ask` | `lib_receipt`*, `end` | query: a committed transaction's ids, paged |

Records (the generated codec; tags 1094-1124 follow DOC's 1060-1093, and 1182):

| Tag | Record | Fields |
| --- | --- | --- |
| 1094 | `service.lib_state` | `state: u32`, `books: u32`, `generation: u32`, `walk_ppm: u32` |
| 1095 | `service.lib_query` | `show: u32`, `sort: u32`, `flags: u32`, `words: str 256`, `author: str 256`, `series: str 256`, `tag: str 128`, `folder: str 512`, `added_since: u32`, `cursor: u32`, `generation: u32`, `facet: u32` |
| 1096 | `service.lib_entry` | `key: u32`, `title: str 128`, `author: str 96`, `series: str 64`, `number: str 16`, `progress: u32`, `flags: u32`, `added: u32`, `badges: str 64 (list: `\n`, 2 × 64)` |
| 1097 | `service.lib_ref` | `path: str 512`, `generation: u32`, `key: u32 (optional)` |
| 1098 | `service.lib_book` | `key: u32`, `generation: u32`, `path: str 512`, `title: str 512`, `author: str 512`, `series: str 256`, `number: str 32`, `progress: u32`, `flags: u32`, `added: u32`, `size: u64`, `format: str 128`, `tags: u32`, `fields: u32`, `title_bytes: u32`, `author_bytes: u32`, `series_bytes: u32` |
| 1099 | `service.lib_text_at` | `kind: u32`, `index: u32`, `offset: u32` |
| 1100 | `service.lib_text` | `kind: u32`, `index: u32`, `total: u32`, `text: str 1024` |
| 1101 | `service.lib_facet` | `text: str 256`, `count: u32`, `first: u32` |
| 1102 | `service.lib_cover` | `side: u32` |
| 1103 | `service.lib_status` | `set: u32`, `clear: u32` |
| 1104 | `service.lib_paths` | `paths: str 3590 (list: `\n`, 7 × 512)`, `flags: u32` |
| 1105 | `service.lib_result` | `path: str 512`, `status: i32`, `flags: u32` |
| 1106 | `service.lib_move` | `from: str 512`, `to: str 512`, `flags: u32` |
| 1107 | `service.lib_import` | `from: str 512`, `folder: str 512`, `name: str 765`, `flags: u32` |
| 1108 | `service.lib_position` | `section: u32`, `offset: u32`, `insert: u32`, `progress_ppm: u32`, `conversion: u64`, `updated: u64`, `xpointer: str 1024`, `flags: u32` |
| 1109 | `service.lib_position_set` | `flags: u32` |
| 1110 | `service.lib_page` | `cursor: u32`, `annotation_generation: u32` |
| 1111 | `service.lib_annotation` | `id: u32`, `kind: u32`, `start_section: u32`, `start_offset: u32`, `end_section: u32`, `end_offset: u32`, `flags: u32`, `percent: u32`, `conversion: u64`, `created: u64`, `updated: u64`, `client_key: str 64`, `text: str 512`, `note: str 512` |
| 1112 | `service.lib_anchor` | `id: u32`, `flags: u32`, `conversion: u64`, `start: str 1024`, `end: str 1024` |
| 1113 | `service.lib_edit_head` | `annotation_generation: u32` |
| 1114 | `service.lib_transaction` | `transaction: u32` |
| 1115 | `service.lib_transaction_ref` | `transaction: u32` |
| 1116 | `service.lib_edit` | `action: u32`, `id: u32`, `kind: u32`, `start_section: u32`, `start_offset: u32`, `end_section: u32`, `end_offset: u32`, `flags: u32`, `percent: u32`, `conversion: u64`, `created: u64`, `updated: u64`, `client_key: str 64`, `text: str 512`, `note: str 512`, `text_bytes: u32`, `note_bytes: u32` |
| 1117 | `service.lib_edit_text` | `transaction: u32`, `edit: u32`, `field: u32`, `offset: u32`, `flags: u32`, `data: str 3072` |
| 1118 | `service.lib_committed` | `transaction: u32`, `annotation_generation: u32`, `edits: u32`, `added: u32` |
| 1119 | `service.lib_field` | `id: str 128`, `title: str 128`, `value: str 1024` |
| 1120 | `service.lib_field_set` | `field: str 96`, `value: str 1024` |
| 1121 | `service.lib_provided` | `title: str 512`, `author: str 512`, `series: str 256`, `number: str 32`, `tags: str 2048 (list: `\n`, 32 × 128)`, `flags: u32` |
| 1122 | `service.lib_key` | `key: str 16`, `fingerprint: str 32`, `size: u64` |
| 1123 | `service.lib_receipt_ask` | `transaction: u32`, `cursor: u32` |
| 1124 | `service.lib_receipt` | `edit: u32`, `id: u32`, `action: u32` |
| 1182 | `service.lib_field_page` | `cursor: u32`, `generation: u32` (draft 21; after SOCK's 1181) |

- [D] **Wire shapes** (records round): an op that names a book takes `lib_ref` as its **first
  record**, followed by the op's own record (ops 4, 7, 8, 14-17, 22-24; ops 3, 6, 13, 25 take
  `lib_ref` alone), so no record repeats the reference. The schema carries each op's record count
  (`input_rows`): 2 for the ops that take `lib_ref` and one record, 3 for `set_position`, 4 for
  `edit_add` (the transaction and at most 3 edits); more is `ERR_NO_SPACE` before the service runs.
  `input_rows` is only the maximum, not a required count: the service checks the order itself, and a
  missing, repeated or out-of-order record (no `lib_ref` first, a second `lib_ref`, the op's own
  record missing or twice, `set_position`'s records not in the order `lib_ref`, `lib_position`,
  `lib_position_set`) is `ERR_INVALID`. `lib_ref.key` is optional: present names the book by catalog
  handle (with `path` empty), absent by `path`; both or neither `ERR_INVALID`. `set_position` takes
  `lib_ref`, `lib_position` (the position, its own `flags`) and `lib_position_set` (`flags` bit 0
  `sync`, bit 1 `confirmed`). Times (`updated`, `created`) are `u64` seconds since 1970, 0 unknown
  (the wire has no `i64`; no stored time precedes 1970). `lib_edit.text_bytes` and `note_bytes` give
  the whole length of a text or note sent in `edit_text` parts (0 when inline), so a commit checks
  that every part arrived. `lib_paths.paths` holds the paths one per line (at most 7).
  `lib_import.name` is at most 765 bytes: 255 UTF-16 units, the FAT limit checked below, are at most
  765 UTF-8 bytes, so no name the card allows is refused by its size on the wire.
- [D] **Edit parts** (`edit_add`, `edit_text`): a `lib_edit` whose `text_bytes` (or `note_bytes`)
  is above 0 sends its `text` (or `note`) inline empty, else `ERR_INVALID`; its parts follow in
  `edit_text` with `offset` 0 first and each next `offset` the end of the one before (no gap, no
  overlap, else `ERR_INVALID` at that `edit_text`), and their lengths add up to `text_bytes` (else
  the commit is `ERR_INVALID`). A note over 3 KiB is refused at `edit_add` (`ERR_NO_SPACE`), not
  at commit, as is a `text_bytes` over the transaction's remaining cap.
- [D] **Paths with a newline.** The walk does not catalogue a file whose path holds a control
  character (a newline is possible on Android), as import refuses such names: no catalogued path
  can break a one-per-line list such as `lib_paths.paths`, and a list item holding one is
  `ERR_INVALID`.
- [D] `lib_ref` names a book by `path` (root 1, at most 512 bytes) or by `key`: exactly one of them,
  else `ERR_INVALID`; an unknown book `ERR_NOT_FOUND`. `key` here is the **catalog handle**
  (`lib_entry.key`, a `u32`, interface 6's catalog offset that "fits 32 bits") with the catalog
  generation it came from (stale: `ERR_STATE`). It is not the **book key** of section 6 (a 16-hex
  string of the path), which only names per-book folders.
- [D] **A book the catalog does not know yet** (a library's first session, before a view asked
  for the walk; a file copied on since the last one), named by `path`, is that book for the ops
  that keep the book's own data by its path: `position`, `set_position`, `annotations`,
  `anchors`, the edit transaction (ops 13-21) and `text` of an annotation's text or note (op 4,
  kinds 5 and 6), as Beta 3 kept marks and places by path, and for `book_key` (op 25), whose
  key, fingerprint and size need the file alone (Beta 3's kosync took them from the file). Op 25
  so gives a plugin with `uses.library` (without `uses.storage`) the size and the partial MD5 of
  any file of the card outside the protected names; that a file is there, `position` already told.
  The card must hold a file at `path`
  (any file, not only a book format, as in Beta 3; a folder is none), else `ERR_NOT_FOUND`; what the catalog answers (`details`, `status`, fields, queries) still
  needs it. The path rules hold as for any `path` (no control character, nothing below
  `plugins/` or `.paperpaw/`, `files.md` 1.1: `ERR_INVALID`). Once the walk catalogues the book,
  its position, annotations and anchors are the ones kept by that path: none new, none lost.
  The data is kept by the path as spelt: another spelling the card takes for the same file (case
  on FAT, an 8.3 alias) is another path with data of its own, so a plugin names a book as the
  catalog or the file listing spells it.
- [D] **No library path reaches `plugins/` or `.paperpaw/`.** Every path a LIB op takes or makes
  (`lib_ref.path`, each `lib_paths` item, `lib_move` `from` and `to`, an import's target and its
  folders) follows FS's root-1 rules (`files.md` 1.1): its first segment may not resolve to
  `plugins` or `.paperpaw`, compared by identity (case, 8.3 aliases), not by spelling; such a path
  is `ERR_INVALID` and nothing is touched. This holds also when the library folder is the card's
  root, so no LIB op can move, delete or import into the kernel's or the plugins' folders.

### 2.1 The catalog

- [D] `lib_state`: `state` (0 no books yet, 1 walking: the books are those found so far, interface 6
  `core.library-walking`; 2 ready; 3 failed, #369 N: the catalog is there but cannot be read, a
  damaged file or a failing card, `books` 0 until a walk makes it again; a walk under way is 1
  first), `books`, `generation`, `walk_ppm`. An SDK before state 3 reads `CatalogPhase::Unknown(3)`.
- [D] `query` (interface 6 `Query`, `Show`, `Sort`): `show` (0 all, 1 unread, 2 reading, 3 finished,
  4 favourites, 5 new: added in the last 30 days and not opened), `sort` (0 title, 1 author, 2
  series, 3 added, 4 recently opened), `flags` (bit 0 descending, bit 1 leave out the archive
  folder), `words` (any number of words, each found in the title, author, series, tags or file name,
  any case; at most 256 bytes in all, a longer search is `ERR_NO_SPACE`, never shortened), `author`,
  `series`, `tag`, `folder` (this folder and below), `added_since` (a day since 1970), `cursor`,
  `generation`. `end.total` is the number found. No result cap: the files
  shelf's 500 is its own.
- [D] `lib_entry` (one row, short enough that 10 fit a page): `key`, `title: str 128`, `author: str
  96`, `series: str 64`, `number: str 16`, `progress` (0-100, 255 never opened), `flags` (bit 0
  favourite, 1 opened, 2 finished, 3 new, 4 indexed, 5-7: title, author, series cut for the row),
  `added`, `badges: str 64` (the first two badges in section 1's order, `\n` between). A row's
  texts are cut only for the row; op 3 and op 4 have them whole.
- [D] `lib_book` (op 3): `key`, `generation`, `path: str 512`, `title: str 512`, `author: str 512`,
  `series: str 256`, `number: str 32`, `progress`, `flags` (as `lib_entry`, bits 5-7 the long form
  was cut too; bit 8 `missing`: the book's file is not on the card now, looked up by the host when
  it answers, so a plugin needs no `uses.storage` to tell a gone book, Port Reviewer on #350),
  `added`, `size: u64`, `format: str 128`, `tags` and `fields` (their counts, no cap),
  `title_bytes`, `author_bytes`, `series_bytes`. Op 4 (`lib_text_at`: `lib_ref`, `kind` 0 title, 1
  author, 2 series, 3 tag, 4 in-catalog field `id=value`, 5 annotation text, 6 annotation note;
  `index` for lists below the count, else `ERR_NOT_FOUND`; `offset`) answers one `lib_text` (`kind`,
  `index`, `total`, `text` at most 1,024 bytes from `offset`): every list item is reachable by its
  index and every text whole by offsets.
- [D] `facets` (`lib_query.facet`: 0 authors, 1 series, 2 tags, 3 first letters, 4 folders; the
  other query fields filter): rows `lib_facet` (`text: str 256`, `count`, `first`: the index of its
  first book in the same query sorted by that facet, for jumping). **Folders** (interface 6
  `shelves::folder_in`) are one level: each folder right inside the query's `folder` (the books'
  root when empty) that holds a matching book at any depth, `text` its whole path and `count` the
  books in it and below; a book right in the query's folder adds no row. Neither only leaf folders
  nor every ancestor. **Names and their order:** an author or a series is the catalog's text whole
  (a book without an author is under the empty name; one without a series is in no row), a tag is
  one of the book's tags, a letter is `A` to `Z` without accents or `#`; a name longer than 256
  bytes is cut at a character. The rows go by the name's lowercase cut at 96 bytes, then by the
  name as it is, and a descending query (flags bit 0) reverses them. `first` counts in the order
  of `query` by author, by series or by title: for a letter it is the place of its first book,
  for an author or a series the place where the books begin whose sort key is the name's (names
  that differ only in their case, or only beyond the cut of the sort key, begin together).
  `end.total` is the number of rows there are.
- [D] `next_in_series` (interface 6 `Index::next_in_series`, Port Reviewer on #696): the series'
  **lowest unread book**, not the book after the given one: of the books in the given book's series
  never opened (`progress` 255 and `lib_entry` flag `opened` clear), the one with the lowest series
  number, ties by catalog key; the given book itself when it is that one. `ERR_NOT_FOUND` when the
  book has no series or every book of it was opened. Interface 6 listed this for every series begun; a plugin that wants that list
  asks op 6 with a book of each series it shows.
- [D] **Paging of `query` and `facets`** (interface 6's keyset paging, `catalog::query_in`):
  `cursor` is the index in the result of the page's first row (0 for the first page). Under one
  catalog generation the result's order is fixed, so every page is reachable from the cursor alone:
  the host walks the catalog in the query's order and skips `cursor` matches. A cursor of an older
  catalog generation is `ERR_STATE`: ask again from 0. `end.total` counts every match, not only the
  pages read. Sort 4 (recently opened) orders by the opened rank first, then title, then path, so
  equal ranks keep one order. A sort key is the lowercase text of its order (title; author and title; series and number) **cut at 96 bytes**, and a tie, a cut included, goes by path, so the order stays fixed under one generation. Facets page the same way; for tags and folders `first` is
  `0xFFFF_FFFF` (no jump: a book can carry several). Where a device cap stops a walk early (a cap of
  the X4, never a memory shortage), `service.end.flags` bit 3 `partial` says the result is cut.
- [D] **Checkpoints are a cache, never needed.** To spare the skip, the host may keep checkpoints in
  **one fixed device-wide table: 16 entries on the X4, 64 elsewhere**, allocated once and fallibly
  at the first paged call (without it, every page walks from the start). An entry is 96 bytes (93
  used): the asking plugin (`u64` owner), a 64-bit FNV-1a hash of the query's fields but `cursor`
  and `generation` (each text field preceded by its length as `u16` little-endian), the catalog
  generation, the result index the entry resumes at, the walk position there and the last row's sort
  key cut to **at most 64 bytes** (a longer key makes no checkpoint: that page's successor walks
  from the start). A plugin holds at most 4 entries on the X4 (8 elsewhere). A new entry replaces,
  in order: one of an older generation, then the asker's own least recently used one when it is at
  its share, then the table's least recently used one. A cursor with no matching entry (evicted,
  hash differs, never made) is walked from the start: slower, the same rows, never an error. A
  stopped plugin's entries are cleared. **What this host keeps today:** no table yet. `query`
  walks to every cursor from the start. `facets` keeps one place, the last call's (the last name
  served and the number of names, at most 0.7 KiB, allocated fallibly): a page that goes on
  where the call before ended, for the same query under the same generation, starts there and
  needs no skip; any other cursor is walked from the start. The place is not used, and none is
  kept, while a pending delete hides a book. It is dropped when a plugin stops or is parked.
- [D] `cover` (`lib_cover`: `lib_ref`, `side` 0 for the list's size, else the longest side, at most
  the screen's long side, larger is `ERR_INVALID`, never clamped; the default is interface 6
  `cover_fit`, the larger of 300 and 3/8 of the screen's long side): the catalog's cover as an
  image id of the caller, made from the book's format
  (DOC op 15) on first use and kept in the host's cover cache; `ERR_NOT_FOUND` for a book without
  one; while it is being made `ERR_BUSY` and `event.library_changed` bit 6 when it is ready
  (interface 6 lazy covers).
  **Made covers inline, the rest in the background (#248).** A cover the host already made is
  answered inside the asking call, in the caller's frame: the host opens the book as the caller
  (root 1, no `uses.storage`), asks the format (DOC op 15), which reads it from its cache and
  decodes nothing, adopts the picture as the caller's own id (the same cover file has one id) and
  closes the document. Any other cover is `ERR_BUSY`: no picture is decoded in a list's frame. A
  book that is ready at its open stays open as the host's one **cover to make**, beside the cover
  job (a job held back for the list never keeps it waiting): the pump's next look asks the format
  for the cover (DOC op 17) outside every frame, closes the document and raises bit 6 (not while a
  book is open for reading: it then only ends, and the list asks again when shown). While one
  waits, other covers not made are `ERR_BUSY` without the book being opened. A preparing book
  goes to the cover job below, which does the same once it is ready. A book counts as made once
  its format answered (a picture, or none: `ERR_NOT_FOUND` inline from then on); one that cannot be made
  now (`ERR_BUSY`, no memory) is asked again after bit 6, counted towards the failed-jobs cap below
  but no book failed; one that failed otherwise counts the book as failed (below). The host remembers 32 made books in RAM (256 bytes),
  the least recently asked written over; a card change, move or delete only means an inline
  decode again, never a wrong picture. A cover made while more than 32 are on screen (asked since
  the last made) would write over one shown: it counts towards the failed-jobs cap below instead
  of resetting it, so the raises end. A format that is not running yet is `ERR_BUSY` with bit 6 raised, so the caller
  asks again (one counter for the whole library host, not per book: after 6 raises in a row it
  raises no more until a cover is made); a full document table is `ERR_BUSY` and **raises nothing**
  (it does not clear by itself: the caller closes a document).
  **Preparing books (DOCX, MOBI): the cover job.** A format whose first `open` is still *preparing*
  (a conversion not yet in the cache) is `ERR_BUSY`, and the first such `cover` keeps its document
  open as the one **cover job** of the device: a background document (any other open takes its place
  first, the reader on the X4's two places always wins; sleep, a pulled card and any open that is
  not this `cover` end it). The preparing loop (DOC section on preparing) converts it a step a pass
  between inputs, and when it is ready or failed the host ends it and raises bit 6 once. The next
  `cover` then makes the picture as above. A second book waits (`ERR_BUSY`, asked again after the
  bit). No job begins before the kernel's start has returned, nor while a book is open for reading
  (`ERR_BUSY`, nothing raised; bit 6 follows once jobs may begin). The job's document is the
  host's own (it takes no plugin's document cap, so the caller's ready covers are made beside it).
  A job that an open displaced (a book to show) is held back the same way, and for 2 s after the
  displacement; it then **starts again from the beginning**: a cache is whole or not used
  (`document.md` 2.1), nothing of a partial conversion is kept. A job displaced 3 times in a row
  for the same book is not started again for that book until the next start (no cover, as for a
  failed book). A job takes **no preparing step (no conversion) while the library's list screen (the
  files plugin's) is on the screen stack**, shown or covered, and for 2 s after it left it: a
  conversion's peak must not come beside the list's buffers. A book that is ready (its cover only
  to be made) is not held by the list. **Nothing is opened, made or converted within 1 s of the
  user's last input or of the start** (#248): a `cover` of a book not made yet then answers
  `ERR_BUSY` without opening the book, and bit 6 follows once it is quiet. The row stays open
  meanwhile; the time held is no awake time of the
  book. A job never holds the device awake
  and does not restart after a sleep until a new `cover` asks. Between two of its steps the pump waits 100 ms (1 s in the power modes Saving and Offline), a
  timed wake, so the job goes on on an idle device. A book's job may run 10 minutes in all per
  start of the device (displaced and begun again counts together); then the book counts as failed
  (as above). If a job's memory for the format's
  `close` cannot be had (4 KiB, once, when the job ends) the format is not told and keeps its state
  for that document until it stops. A book whose job failed (the
  format could not prepare it, 8 steps in a row that could not be made) is `ERR_NOT_FOUND`, never
  `ERR_BUSY` again, until the next start: the host remembers 8 such books in memory only, and after
  8 failed jobs in a row raises no more bits (a ready job or the next start resets the run). A card
  error is not the book's. **Crash guard:** when a job begins the host writes the book's key to
  `.paperpaw/cover-job.txt` (and syncs); it removes the file when the job ends however it ends; if it
  cannot write it the job does not begin and the book counts as failed (`ERR_NOT_FOUND`, as above).
  At the next start a file (exactly 16 hexadecimal digits; any other file names no book) still
  there means a reset happened in that job (or a plain power loss: then the book is counted failed
  for that run only), and its book is counted as failed. The format's first `open` of a book (the call
  that reports *preparing*) is not covered by the marker.
  **Native books' details: the details job (host behaviour, no ABI).** The walk cannot read a book of
  a native format plugin (its line names the file and has no size), so after a walk publishes (or
  `core.catalog-changed`) the host reads such books itself, one at a time: it opens the book as its
  own background document (root 1, the defaults of a plain open, `background`, and bit 3 `details`
  for a `prepared` format, `document.md` 2.1) in the **same one slot** as the cover
  job, with the same marker (written before the open), start gate (also the 2 s after a
  displacement), sleep end (not restarted after a wake until the next walk), "any other open takes
  its place" rule (3 displacements in a row for one book give it up, as a failed book), gap between
  steps, failures and awake-time cap (one book's time counts across both kinds, a give-way to a
  cover included). A `prepared` format's book (DOCX, MOBI) is **never converted** for it: the
  format answers ready from what it reads at open, or the book gets no details (an answer of
  preparing closes it at once, as a failed book). Once it is ready the host reads `meta` (op 5), the
  whole title and series by offsets where `meta` cut them, the first author and at most 16 subjects
  (op 6, each cut at the details' caps), keeps them as the book's details marked as read (never
  where nothing was read), and closes it. It begins only when no job of either kind runs and no book
  is open for reading or showing, not within 1 s of the start or of any input, only while home's or
  the library's screen is on top (opened for slot `core.home` or `core.library`, or offered for one;
  an overlay, a plugin's page or the store holds it, looked at again at the next input, also after a
  screen that closed on its own), and not while network work or a job of the install queue runs, nor
  while a first walk is under way (these three looked at again after 1 s, doubling up to 32 s):
  never at the start's peak, beside another screen's or job's, nor while the user is busy. A device
  in steady use (an input at least every second) or left on another screen reads no details until it
  is left alone on home or the library; a book the format failed (or whose job a reset ended) joins
  the cover job's failed books and is skipped until the next start. A `cover` never waits for the
  details job: a ready cover is made beside it, and one that needs the slot makes the details job
  give way (it ends, and its book is looked at again later, counted neither as failed nor as
  displaced). The catalog is wanted again (`core.catalog-wanted`, made anew) once when the job
  reaches the catalog's end and at most every two minutes while it runs, each only where a book was
  read since the last: never per book, and a walk after a pass that read nothing arms a pass that
  finds nothing. Nothing of it holds the device awake: the next book is looked for by a timed wake
  at the job's pace (or at the end of the 2 s); it holds one 4 KiB reply buffer and what it read of
  one book.

### 2.2 Status, positions, annotations

- [D] `set_status` (`lib_status`: `lib_ref`, `set`, `clear`: bit 0 finished, 1 favourite, 2 opened):
  both masks applied together, idempotent; `finished` set raises nothing more (EVT 67 is the
  reader's session event, not this). A favourites or opened list that cannot be read (not text, a
  card error) fails the call and is left as it is; the other changes of the same call may already
  be made, and applying the same masks again finishes it.
- [D] **Positions**: `lib_position` (`section`, `offset`, `insert`,
  `progress_ppm`, `conversion: u64` with `flags` bit 1 `has_conversion` (interface 6
  `Option<u64>`: absent and 0 differ), `updated: u64` seconds since 1970, 0 for an unknown clock,
  `xpointer: str 1024` with `flags` bit 0 `has_xpointer`, `flags` bit 2 `from_sync`).
  `set_position` (`lib_position_set`: `lib_ref`, the position, `flags` bit 0 `sync`, bit 1
  `confirmed`) writes atomically; a refusal is the call's status (2.3):
  - a **local** write (the reader, any write without `sync`) always wins: it is what the user did
    on this device, whatever the clock says (an X4 without a valid clock writes 0);
  - a **sync** write (kosync, koreader pulling another device's place) wins only over a stored
    position that is also from sync and older, or that has an unknown clock and is from sync; it
    never overwrites a local position silently: then it answers `ERR_STATE` (observable, the
    plugin may ask the user) and stores nothing; an equal `updated` keeps the stored one;
  - a sync write with `confirmed` (the user chose "go to the other device's place",
    `kosync/confirm.rs`) counts as local;
  - `confirmed` without `sync`, or any other `flags` bit, is `ERR_INVALID` and stores nothing (the
    SDK's `PositionWrite` cannot build it).
- [D] **Stored form of a position** (the book's `[position]` section, as interface 6): `insert =
  N` is kept only when N is not 0; `sync = 1` marks a position written with `sync` and without
  `confirmed`, and any other write removes it, so `from_sync` (bit 2) reads what the last write
  was. A stored XPointer over 1,024 bytes reads as absent (`has_xpointer` clear), never cut.
- [D] **Annotations** (interface 6 `Annotation`, `Mark`): `annotations` (`lib_page`: `lib_ref`,
  `cursor`, `annotation_generation`) rows `lib_annotation` (`id`, `kind` 0 bookmark, 1 highlight,
  2+n other(n), `start_section`, `start_offset`, `end_section`, `end_offset`, `flags` bit 0 noted, 1
  text cut, 2 note cut, 3 has a conversion, 4 has XPointers, `conversion: u64`, `percent`, `created:
  u64`, `updated: u64`, `client_key: str 64`, `text: str 512`, `note: str 512`), in reading order;
  `end.generation` is the book's annotation generation. A cut text or note is read whole with op 4
  (kinds 5, 6, `index` the id).
- [D] **Anchors** (interface 6 `annotations.rs:134` conversion and start/end XPointers, needed by
  `relocate`): op 16 rows `lib_anchor` (`id`, `flags` bit 0 has a conversion, bit 1 has XPointers,
  `conversion: u64`, `start: str 1024`, `end: str 1024`) for every annotation that has them. An
  annotation's offsets belong to its own conversion; the host never remaps them, and a reader whose
  conversion differs relocates them through the XPointers (DOC ops 10, 11) and writes them back.
  An XPointer longer than 1,024 bytes in a book's annotation file (interface 6 had no cap) is
  read as absent (`flags` bit 1 clear), never cut: a cut XPointer would point elsewhere.
- [D] **Ids** are stable for the book's life: a `u32` from the book's own counter, never reused,
  kept in the annotation file, unchanged by edits of other annotations and across generations.
  `client_key` (optional, at most 64 bytes, unique per book) is the caller's own identity for an
  annotation (a KOReader highlight's datetime and position), so a repeated import adds nothing
  twice.
- [D] **The annotation file, version 3** (written by the host; the SDK's version 2 is read):
  the first line is `# format 3`, then `# next-id N` (only grows) and `# generation G`; each line
  adds two columns after the end XPointer, `id` (a `u32`, at least 1) and `client_key` (escaped, at
  most 64 bytes). A version 2 file is read as it is and never written by a read: its ids are the
  1-based positions among the lines read as annotations (other kinds included), its generation 1,
  its client keys empty. The first write of a version 2 file rewrites it whole as version 3 in one
  atomic save (`next-id` = count + 1, generation 2) and then applies the change. A line that does
  not parse gets no id, is never listed by ops 15 and 16, and is kept byte for byte by every write.
- [D] **Annotation generation:** the file's own number. A missing or version 2 file reads as 1, a
  file the host creates starts at 2, and every committed change adds 1; past `u32::MAX` it goes to
  2, never 0 or 1, so a caller's 1 always means "before any write".
- [D] **Transactions** (koreader saves a whole merged set at once, `koreader/lib.rs:761`):
  `edit_begin` (`lib_edit_head`: `lib_ref`, `annotation_generation` the caller read) opens one
  staged transaction (`lib_transaction`: `transaction`, a `u32`) on the book; `edit_add` adds up to
  3 `lib_edit` per call (`action` 0 add, 1 replace, 2 remove, 3 upsert by `client_key`; `id` for 1
  and 2; the annotation's fields as above, texts and notes up to 512 bytes inline, longer ones and
  **every XPointer** in parts with `edit_text` (a `lib_edit` carries no XPointer inline: its `flags`
  bit 4 says the start and end XPointers follow, as `lib_annotation`): `transaction`, `edit` its
  index in the transaction, `field` 0 text, 1 note, 2 start XPointer, 3 end XPointer, `offset`,
  `data` at most 3,072 bytes, `flags` bit 0 last); `edit_commit` applies all edits or none: if the
  book's annotation generation moved since `edit_begin`, `ERR_STATE` and nothing changes (read
  again, merge, begin again); an unknown id `ERR_NOT_FOUND`, a range outside the sections, and an
  edit whose flagged XPointers or cut text and note did not arrive whole (parts not ending with
  `last`) `ERR_INVALID` also refuse the whole commit. It answers `lib_committed` (`transaction`,
  `annotation_generation`, `edits` the number applied, `added` the number of new annotations), one
  bounded record whatever the size of the transaction. The ids of the edits are read after it with
  op 26 `edit_receipt` (`lib_receipt_ask`: `transaction`, `cursor`), paged rows `lib_receipt`
  (`edit` the edit's index in the transaction, `id` the annotation's id, `action` what was done: 0
  added, 1 replaced, 2 removed, 3 updated by `client_key`) then `end`, 32 rows a page (the schema's
  `page_rows`; `end.generation` on every page is the book's `annotation_generation` that commit
  answered, never 0, so the pages of one receipt carry the same value); the receipt is kept on the
  card until the plugin's next `edit_begin`, 10 minutes, or
  the plugin stops (`ERR_NOT_FOUND` after). A plugin advances its own sync state only after a commit
  answered `OK`.
- [D] **What the host checks at the commit, beyond the above:** an `id` named by two edits of one
  transaction, a `client_key` named by two adds or upserts of it, and an `add` (action 0) whose
  `client_key` the book already has are `ERR_INVALID` (a repeated import uses upsert); an `upsert`
  whose key the book has replaces that annotation and keeps its id (receipt `action` 3). A row is
  one line of the file (`annotations.rs` reads lines of at most 8 KiB): an annotation whose text,
  note, key and XPointers make a longer line is `ERR_NO_SPACE`. The host checks nothing about a
  range in sections: it does not know the book's sections. A book the library's move job holds is
  `ERR_BUSY` at `edit_begin`. The new rows are written in reading order (by start, then end), the
  old rows keep the file's order. Receipts are not kept across a restart. The interface 6 path (the Beta 3 reader and widgets) keeps a
  row's id and `client_key` by its kind and place; of two rows at one place (imports by key) it may
  hand them to the other when it removes one.
- [D] **End of a transaction:** `edit_commit` on a live transaction of the caller ends it whatever
  it answers: `OK`, a refusal of the book (`ERR_STATE`, `ERR_NOT_FOUND`, `ERR_INVALID`), parts that
  did not arrive whole, or a reply too small for `lib_committed`. Nothing of a refused commit is
  applied, and a later `edit_add`, `edit_text`, `edit_commit` or `edit_abort` on that `transaction`
  answers `ERR_NOT_FOUND` (begin again; op 26 still reads a committed one's receipt). A highlight
  (`kind` 1) whose start (`start_section`, `start_offset`) comes after its end is refused by
  `edit_add` with `ERR_INVALID`.
- [D] **Sizes of one edit:** an XPointer at most 1,024 bytes (as `doc_xpointer`), a note at most
  3 KiB (interface 6), a highlighted text bounded only by the transaction's cap (interface 6 caps
  it by the annotation file alone); each part of `edit_text` at most 3,072
  bytes, joined in order. A transaction's staged bytes are capped as a whole (below), and its edits are
  too: 1,024, and 128 on the X4 (`ERR_NO_SPACE` at the `edit_add` that passes it), because a commit
  holds a 40-byte row per edit while it merges (40 KiB at 1,024, 5 KiB on the X4; besides a 5 KiB record buffer and the text of one row, at most a line of 8 KiB; unmeasured on the device, #250).
- [D] Transaction limits and lifetime: one open transaction per plugin and two device-wide
  (`ERR_FULL`); it lives across callbacks until commit, abort, 10 minutes without a call (then
  aborted, logged) or the plugin stops. A host with no clock at all counts 10 s for every call of
  the transaction ops by anyone, so 60 calls end an idle transaction: a fallback only (another
  plugin's calls can end a live transaction, which then answers `ERR_NOT_FOUND`: begin again);
  every shell with `core.work` has the clock. Staged edits are kept in a host temp file on the
  card, not in memory (at most the annotation file's 1 MiB cap, `annotations.rs:45`, `ERR_NO_SPACE`
  beyond). A power cut aborts every open transaction (the temp file is removed at start); the
  book's annotations stay as they were. Notes keep interface 6's 3 KiB cap per note.

### 2.3 Files: delete, move, import

- [D] **Reply of `can_delete` and `delete`:** one `lib_result` per input path, in the input's
  order, then exactly one `service.end` with `total` the number of rows and `flags`, `next` and
  `generation` 0 (the unpaged end, `stages-services.md`; anything else is `ERR_INVALID`);
  `reply_rows` 7, so the generic reply check accepts up to 7 rows.
- [D] **Single-result ops** (`move`, `import`, `set_position`): an error is the call's status and
  nothing is written; on success the reply is one `lib_result` with `status` `OK`. Per-path
  statuses inside `lib_result` belong to ops 9 and 10 only.
- [D] `can_delete` (`lib_paths`) answers per path `lib_result` (`path`, `status`, `flags`): `OK`
  deletable, `ERR_INVALID` not a book (unknown format by extension or sniffing, DOC op 20),
  `ERR_NOT_FOUND` gone already (a delete only forgets it), `ERR_IO` the card cannot, and `flags` bit
  0 has annotations, bit 1 has a position, bit 2 has plugins' book data: the view decides what to
  offer and what to say before it asks. Interface 6 `Library::can_delete`. It changes nothing.
- [D] `delete` (`lib_paths`: at most 7 paths, section 7.1, `flags` bit 0 `with_notes`): removes each
  book and everything kept for it (position, annotations, fields, every plugin's `book_data`
  folders, the document caches, the cover), interface 6 `Library::delete`. Only books are removed:
  anything else `lib_result.status` `ERR_INVALID`. A book with annotations is `ERR_STATE` unless
  `with_notes` (the view asked the user; read-later and wallabag pass it for their own downloads).
  One `lib_result` per path.
  **A status that is not `OK` means the book is not gone yet:** a card error that may pass
  (a fault, a full card, memory) is retried by the host's journalled job until it is done, so
  the book may still be listed meanwhile and its data is still there; a file the card refuses for
  good is left as it is and answers `ERR_IO`. `OK` means the file is gone (what is kept for it
  follows from the job).
- [D] `move` (`lib_move`: `from`, `to`, root 1 both, `flags` bit 0 replace an existing `to`): the
  file and everything kept for it follow (keys change, section 6), each through the card's
  journalled move (section 6); EVT 68 and `library_changed`.
- [D] `import` (`lib_import`: `from` a file in the caller's root 0, `folder` a folder below the
  library folder setting, empty for the library folder itself, `name` the file name, `flags` bit 0
  replace, bit 1 take a free name): puts the file into root 1 (section 6: a journalled move where
  root 0 and root 1 are on one card, as on the X4 and the desktop; else a copy to a host temp
  file, synced, then the move, then `from` removed), then catalogues it (indexed on the next walk
  step). It answers the book's root-1 path in `lib_result`. Downloaders (opds, news, wallabag,
  read-later, transfer) need no `uses.storage` for it.
- [D] **Import names come from outside** (a feed, a server) and are checked before anything is
  written, `ERR_INVALID` for: an empty `name` or `folder` segment; `/` or `\` in `name`; `.` or
  `..` segments; NUL, control characters or `"*:<>?|`; a trailing dot or space; a reserved
  device name (`CON`, `PRN`, `AUX`, `NUL`, `COM1`-`COM9`, `LPT1`-`LPT9`, any case, with or without
  an extension); a segment over 255 UTF-16 units; a `name` starting with `.` or `~` (hidden and
  host temp names). The joined path is resolved below the library folder and refused
  (`ERR_DENIED`) if it ends anywhere else, including `.paperpaw/`. Missing folders below the
  library folder are made.
- [D] **Import never overwrites the user's books.** An existing `name` without bit 0 or 1 is
  `ERR_STATE` (nothing changes); bit 1 makes the name free as `name (2).ext`, `(3)` and so on, and
  answers the path taken. Bit 0 `replace` is allowed only where the existing file is one **this
  plugin imported** and nobody moved since (the host keeps the importer's id with the book's data;
  a move by the user or another plugin clears it), and only while the file at that path is still
  the one the plugin imported (size and partial MD5 are kept with the importer's id); a file put
  there since is `ERR_DENIED`, and so is anything else. A replaced book
  keeps its key, positions and annotations (an updated feed issue), and its document caches are
  dropped.

## 3. Events

| Tag | Record | Fields |
| --- | --- | --- |
| 91 | `event.library_changed` | `now_ms: u64`, `what: u32`, `generation: u32`, `path: str 512` |

- [D] A hint (registrable, coalesced per plugin): `what` bit 0 books added, removed or moved (a new
  generation), 1 status, 2 positions, 3 annotations, 4 fields or badges, 5 the walk progressed or
  ended, 6 a cover is ready; `path` the one book it was about, empty for several (re-read what you
  show). The changer gets it too, so every view updates the same way. `generation` is the
  catalog's; `0` means the host could not tell it just now (re-read, as for an empty `path`).

## 4. Book data and badges

- [D] **Book data folders** (section 1) are in the owner's root 0, so the owner reads and writes
  them with the storage slots 20-26 as any Data file. Op 25 gives the book key; the folder path is
  `books/<name>/<key>/`. On a move the host renames them (journalled, section 6), on a delete or an
  uninstall it removes them (an uninstall asks first about the whole Data folder, decision 124).
- [D] **A book's own settings** (`command.set_scope`, `registry.md` 4.1): in the same steps the host
  moves `books/<key>/settings.ini` to the new key and removes it with the book, in the Data of
  every plugin that has one on the card (found there, so also after a restart; none is no error;
  one whose new name is taken stays). The folder `books/<key>/` goes when it is left empty.
  The first 64 plugin folders on the card are looked into (more than a device installs); a file
  in one past them, or one that stays, is left under the old key (orphaned, never read again).
- [D] **Fields** (`lib_field`: `id`, `title` translated, `value: str 1024`): op 22 lists a book's
  fields of every plugin, paged (a book holds up to 64 fields, and only about 3 rows at their caps
  fit a reply): input `lib_ref` and `lib_field_page` (`cursor` the index of the page's first row,
  0 to start, then `service.end.next`; `generation` 0 to start, then the `service.end.generation`
  of the first page). Rows are ordered by owning plugin id, then field name. `end.generation` is
  the book's field generation, which changes when the content of the book's fields changes; a
  later page asked with another generation answers `ERR_STATE` (start again at 0), as annotations
  do. A page holds as many whole rows as fit in 4,096 bytes; `flags` bit 0 `last` on
  the last page. `set_field` (`lib_field_set`: `lib_ref`, `field` one of the caller's own,
  `value`, empty removes) changes the caller's only (`ERR_DENIED` for another's). In-catalog fields
  over 64 bytes `ERR_NO_SPACE`.
- [D] **Fields live on the card.** Every field value, in-catalog ones too, is stored with the
  book's data on the card and read when asked; the in-memory catalog gains nothing per field or
  per book for them. In-catalog values are written into the walk's sorted index file
  (`sorted.idx`, #328), so queries, sorting and filters on them read the card step by step as for
  titles, never a table in RAM. An in-catalog field value reaches queries (filters, sorting)
  only at the next walk of that book, as in interface 6; a read of the book's own fields (op 22)
  sees it at once.

## 5. Provided metadata (calibre)

- [D] `provide` (`lib_provided`: `lib_ref`, `title`, `author`, `series`, `number`, `tags` one per
  line at most 32, `flags` bit n: field n is provided, the rest left alone) sets what another source
  knows and the file does not name (interface 6 `library::provide`, Beta 3's rule): on (re)index
  the file's own title, author, series, number and tags win where it names them, and provided
  values stay where it names nothing. Until the book is indexed again, views can show the
  provider's values, the title too. The last provider's values replace earlier ones; there is one
  tag list per book (tags replace it whole, at most 32, else `ERR_NO_SPACE`) and no provider id is
  kept. Kept per book with the book's data (it follows moves). A provided value is never empty or
  blank (only Unicode whitespace; nothing clears a field: leave it out) and holds no control
  character: none that `char::is_control` names (C0, DEL and C1, U+0080 to U+009F, so no tab or
  line break either; tags are separated by line breaks only) and neither U+2028 nor U+2029; each is
  `ERR_INVALID`, as are `flags` 0 (nothing provided) and `flags` bits above 4; a value or tag over
  its size (1121) is `ERR_NO_SPACE`. Making the provider's values
  win over the file's would be a new feature, not parity (post-1.0 at the earliest).

## 6. Keys, moves, power loss, card failure

- [D] **Book key:** `lib_key.key` is the 16 hex digits of FNV-1a 64 of the book's root-1 path
  (interface 6 `library::key`), what plugins name their per-book folders by. A move by the host
  changes it, and the host renames what it keeps under the old key.
- [D] **Keys are the host's, never computed by plugins.** FNV-1a is not collision-resistant, and a
  downloaded name can be made to hit another book's key. The host keeps the full root-1 path with
  each key it gives out (`.paperpaw/library/keys`, written atomically); a new book whose key is
  already held by another existing path gets the next free key of FNV-1a 64 over the path followed
  by `\n1`, `\n2` and so on, so no two books share a key or its data. Op 25 is the only source of
  a book's key; the SDK has no key function. Data found under a key whose stored path names another
  book is not handed over.
- [D] **Fingerprint:** `lib_key` carries interface 6's `Fingerprint` (`library/fingerprint.rs`)
  whole, in two fields: `fingerprint: str 32` the 32 hex digits of KOReader's partial MD5 (up to
  twelve 1 KiB reads) and `size: u64` the file's size in bytes; both together are the identity,
  so kosync and koreader keep matching other devices. It is kept with each book's data; a book moved
  outside the device is found again at the next walk by it: when a book's path is gone and exactly
  one new file has its fingerprint, the data follows that file. Two or more files with one
  fingerprint are copies, not a move: none of them inherits the data (logged), and a view may offer
  to attach it to one.
- [D] **Atomic writes.** Positions, annotation files, fields and status are each written as temp,
  sync, rename (D2.5); a power cut leaves the old state or the new one, never a mix.
- [D] **The card's move (one routine for LIB and DEV).** A move into another folder is not atomic
  on FAT: it writes a new directory entry and then removes the old one, and between the two both
  name one cluster chain, so freeing either later would free clusters the other still uses. Every
  move LIB and DEV make (a book, its kept data, an import, the rename into `.removing/`, DEV's
  plugin swap) goes through `paperpaw-fat`'s journalled move (`Storage::rename`, `move_entry`):
  1. the move is recorded in the root's hidden journal (`~PPMOVE.BIN`: from, to), synced;
  2. the new entry is added (patched rust-fatfs adds before it removes; a folder that cannot grow
     fails before anything changed), synced;
  3. the old entry is removed **without freeing its clusters** (`unlink`), synced;
  4. the record is cleared.

  At the next start, before anything else touches the card (`settle_moves`), an open record is
  settled: both entries present and holding the same clusters → the old entry is unlinked, never
  its chain freed; only the new one → the record is cleared; only the old one → the move did not
  happen and the record is cleared. A record that cannot be settled holds up its two paths until the
  next start (`held_up`); everything else goes on. A file removal removes the entry before it frees
  the clusters, so a cut leaves clusters taken by no file, never a file on free clusters. A moved
  folder's `..` entry must name its new parent once the move is settled (a test checks it; Kernel
  confirms rust-fatfs's order in `paperpaw-fat` with the tests).
- [D] **Fault injection at every card write.** The move, delete, import and swap tests run on
  `paperpaw-fat`'s block-cut disk (`src/tests.rs` `Cut`) and are replayed cut after **each block
  write** (directory entry, FAT copy, FSInfo), for files and folders, same and other folders,
  replace and no replace; after each cut and a fresh mount: every file reads whole as before or
  after, no two entries share a cluster once settled, and no cluster in use is free. An exFAT
  backend (#5, with its allocation bitmap and entry-set checksums) holds the library only after it
  passes the same suite with the bitmap as a cut point; until then it is a gate item, not a claim.
- [D] **Journalled library steps.** Every LIB op that changes files on the card (`move`, `delete`,
  `import`, and the per-book data they carry) writes a library journal entry (its kind, `from`,
  `to` or the removal, and the moved entry's identity, `Storage::entry_identity`: FAT's first
  cluster, a computer folder's file id; the keys are derived from the paths, not stored) into
  `.paperpaw/library/journal`, synced,
  **before any card change**; then the file, then the kept data (renamed into `.paperpaw/.removing/`
  for a delete, removed there), each a card move as above. At the next start, after
  `settle_moves`, the host finishes or rolls back every journalled step, deciding a cut move by
  where the entry with that identity is, never by names (a source with no identity refuses its
  move, `ERR_UNSUPPORTED`): a book at its new place
  gets its data moved there too, an import whose file arrived has `from` removed and is
  catalogued, an import whose file did not arrive has its host temp file removed (fault-injection
  tests after every write, as the uninstall data removal of decision 124). The catalog walk never
  runs while a journal entry is open. Single-file writes (`set_position`, fields, annotation
  commits) are atomic replaces and need no entry.
- [D] **Paths in use are busy.** A `move`, `delete` or `import` over a path the host uses (the
  book open in a reader, a download's target or `.pp-staged` file, a served request body, a staged
  install copy; FS's paths-in-use table, `files.md` section 3) answers `ERR_BUSY` (per path in
  `lib_result.status` for ops 9 and 10, the call's status for the others) and changes nothing.
- [D] **One move job at a time.** While a folder move's bounded job runs (`files.md` 2.6), every
  move and rename on the card answers `ERR_BUSY`: LIB `move` and `import`, `core.files` `move`
  and `storage.rename`, wherever they point. A delete or removal at or below the job's `from` or
  `to`, or of a folder holding either, is `ERR_BUSY` too, as are `make_dir` and file writes at or
  below the old name `from`. Ancestors are not busy otherwise, and reads and writes below `to` go
  on; books below `to` are answered through the pending entry. The busy state ends when the entry
  is cleared; a plugin retries later (the job's changes raise `event.library_changed`, rule 2).
- [D] **Card failure.** A missing or failing card is `ERR_IO` for every op that reads the card (no
  partial rows: a page is answered whole or not at all); a full card `ERR_NO_SPACE` for writes, the
  old state stays. A pulled card raises `library_changed` bit 0 when it is back (the walk checks
  it).

## 7. Sizes and memory

### 7.1 Every record fits its limit

| Record or reply | At its caps | Limit |
| --- | --- | --- |
| `lib_entry` page | row 1 + 4 + 130 + 98 + 66 + 18 + 4×3 + 66 + 5 = 400; 10 rows + `end` = 4,030 | 4,096 |
| `lib_book` | 1 + 4×2 + 514 × 3 + 258 + 34 + 4×3 + 8 + 130 + 4×5 + 5 = 2,018 | 4,096 |
| `lib_text` | 1 + 12 + 1,026 + 5 = 1,044 | 4,096 |
| `lib_query` | 1 + 4×5 + 258 × 3 + 130 + 514 + 4×2 + 5 = 1,452 | 4,096 |
| `lib_annotation` page | 1 + 4×8 + 8×3 + 66 + 514 + 514 + 5 = 1,156; 3 rows + `end` = 3,498 | 4,096 |
| `lib_anchor` page | 1 + 4×2 + 8 + 1,026 × 2 + 5 = 2,074 at the caps (one row); real XPointers are about 100 bytes, so a page holds the rows that fit | 4,096 |
| `edit_add` input | 1 + `lib_transaction_ref` 10 + 3 × `lib_edit` (1 + 4×11 + 8×3 + 66 + 514 + 514 + 5 = 1,168, no XPointer inline) = 3,515 | 4,096 |
| `edit_text` input | 1 + 1 + 4×5 + 3,074 + 5 = 3,101 | 4,096 |
| `lib_committed` | 1 + 4×4 + 5 = 22 | 4,096 |
| `lib_receipt` page | row 1 + 4×3 + 5 = 18; 64 rows + `end` = 1,182 | 4,096 |
| `lib_field` page | row 1,291 framed at its caps (test `abi7_lib_fields`); 3 rows + `end` = 3,892 | 4,096 |
| `lib_paths` (16 paths) | 16 × 514 = 8,224 | over: at most 7 paths (3,605) |
| `lib_position` | 1 + 4×4 + 8×2 + 1,026 + 4 + 5 = 1,068 | 4,096 |
| `badge.value` × 16 | 16 × (1 + 4 + 18 + 66 + 5) = 1,504 | 3,840 |

- [D] So `edit_add` takes at most **3** edits per call inside one staged transaction (any number of
  calls, one atomic commit), and `delete` and `can_delete` at most **7** paths per call.

### 7.2 Memory (X4)

- The catalog, the walk and its sorted index are the host's library of interface 6 (#280, #328,
  #98), measured there; LIB adds none of it.
- Calls: one reply on the host scratch, freed after the call.
- Paging checkpoints (section 2.1): one fixed table, 16 × 96 bytes = **1.5 KiB on the X4** (64 ×
  96 = 6 KiB elsewhere), allocated fallibly once; at most 4 entries per plugin on the X4. It is a
  cache: without it (allocation refused) paging still works, walking from the start.
- Transactions: staged edits go to a host temp file on the card (no heap beyond a 4 KiB buffer
  while a call writes them); at most 2 open device-wide.
- Edits: one transaction's annotation file is rewritten in a streaming copy (read old, write temp
  with the edits, sync, rename), at most one 4 KiB buffer.
- Covers: image ids as DOC (24 bytes each).
- Journal: one entry in memory while a move or delete runs (about 1.1 KiB for two paths).
- Keys: the key file is read through the 4 KiB buffer when a key is given out; nothing kept.
- **X4 worst case for LIB's host side: about 7.5 KiB beyond today's library** (edit buffer 4,
  checkpoints 1.5, journal 1.1, scratch shared; fields and keys on the card), all fallible; an
  activation-gate item measured with the files and reader ports.

## 8. Interface-6 calls and their interface-7 form

## 9. Hand-offs (after approval)

- **Kernel:** records, `core.library@1` schema, `core.book-badge@1` stage schema, the `uses.library`
  feature, this document final.
- **Kernel (`paperpaw-fat`):** the per-block cut replay for moves, deletes, imports and swaps,
  folder moves' `..` entry, the exFAT gate (#5).
- **Core:** the service over the host library, the journal with fault-injection tests, the
  annotation transaction (streamed rewrite, CAS), book data folder moves and removals, provided
  values, the event; the cover cache through DOC.
- **Services:** the SDK facade (a typed query builder, annotation transactions with retry,
  positions, fields, book data paths).
- **Plugin:** the ports: files, file-manager, reader, end-of-book, stats, notes-overview, koreader,
  kosync, setup, sleep, news, opds, transfer, wallabag, read-later-cloud, calibre.
