# Interface 7 family DOC: formats, documents, images, lookup

Contract for #228 (assignment #1025). Items marked [D] are proposed decisions, [Q] open
questions for Plugin and Senior. Inputs: the plugin needs inventory (#984,
`plugin-needs-reg-uix-dev-lib-doc-228.md`, DOC section and coverage ledger), the C-family proposals
(#890, `c-families-228.md` 2.6 DOC and the IMG wave), the reader extensibility notes (#241, N2,
N4-N7),
`stages-services.md` (stages, services, depth), `ui.md` (host texts, depth and stack rules, the X4
nested-callback gate), `screens-input.md` (N5 pages and progress, tag blocks), `core-events.md`
(book events 65-69) and the storage contract (`proposals/interface-7-events-storage-services.md` D2,
owner decision 125). Records: `abi/services/core.document@1.def`.

## 0. Scope and principles

- [D] **Two sides, one broker.** A **format plugin** (format-epub, -txt, -docx, -mobi, -images,
  -xtc, notes-vault's markdown) knows how to read a kind of file; an **opener** (the reader,
  browser, files, koreader, kosync, dictionary, notes-vault, sleep for covers) wants a document.
  They never call each other. The opener calls the host service `core.document` (section 2); the
  host calls the format plugin through the host-defined stage `core.format` (section 3), which the
  host alone runs (`stages-services.md` 1.3). Interface 6's `Box<dyn Document>` handed across
  plugins has no interface-7 copy.
- [D] **Documents are host-held.** `open` returns a **document id** (a `u32` from the host's checked
  counter, as UIX instances: never 0, never reused while the host runs). The opener owns it (a
  lease); the format plugin keeps its parse state keyed by it. Every call names it; the host checks
  that the caller is its opener.
- [D] **Least privilege for formats.** A format plugin reads the book through a host root that is
  only that book (root 3) and writes its cache in a host root that is only that book's cache for
  that format (root 6), both only inside its `core.format` callback for that document. It needs no
  `uses.storage` (decision 125) and never sees the opener's data or the user's other files.
- [D] **Layout stays with the reader.** Blocks (section 4) are the interface-6 `Block` model on the
  wire; the reader lays them out with its linked layout crates. Text filters, decorators, page
  layers, page frames and voices are reader-defined stages (`reader.def`, #964, Plugin-owned), not
  kernel records (section 9).
- [D] **The user's reading settings win** (decision 131): publisher styles, user CSS, colour and
  image sizes are the opener's options, from the user's settings; a format plugin never overrides
  them.
- [D] **No interface-6 shapes:** `Document`, `FormatSpec::open`/`sniff` closures, `Formats`,
  `Readers`, `Document::extended` (new questions are new ops of a new revision) and `DocumentError`
  have no interface-7 copies.
- Out of DOC: book data, caches' lifecycle on move or remove, positions and annotations (LIB);
  network fetches by lookup providers (NET/ASY); the reader's own stage schemas (Plugin, #964).

## 1. Declarations

| Tag | Record | Fields |
| --- | --- | --- |
| 31 | `format.spec` | `name: str 96`, `title: str 96`, `extensions: str 512`, `flags: u32`, `priority: i32`, `token: u32` |
| 229 | `reader.spec` | `name: str 96`, `screen: str 128`, `formats: str 1032`, `flags: u32` |

## 2. The service `core.document` (major 1)

Bare reply streams and paging as `core.registry` (`registry.md` 2.1), `page_rows` 64 (rows fit by
bytes too: a page holds the whole rows that fit 4,096). Feature: none to list formats and readers;
`open` needs read access to the book's root (root 1 needs `uses.storage`, decision 125; root 0 the
caller's own Data). Every op on a document is the opener's only (`ERR_DENIED` for others).

| Op | Name | Input | Reply | Notes |
| --- | --- | --- | --- | --- |
| 1 | `open` | `doc_open`, `doc_option`* | `doc_state` | section 2.1 |
| 2 | `state` | `doc_ref` | `doc_state` | preparing progress, failure |
| 3 | `meta` | `doc_ref` | `doc_meta` | section 2.2 |
| 4 | `meta_text` | `doc_text_at` | `doc_text` | one author, subject or text, from an offset |
| 5 | `sections` | `doc_page` | `doc_section`*, `end` | paged |
| 6 | `block` | `doc_at` | the block stream (section 4) | the block at or after a position |
| 7 | `toc` | `doc_page` | `doc_toc`*, `end` | paged, in reading order |
| 8 | `toc_target` | `doc_index` | `doc_at` | exact position of an entry |
| 9 | `page_label` | `doc_at` | `doc_label` | printed page name, `ERR_NOT_FOUND` for none |
| 10 | `xpointer` | `doc_at` | `doc_xpointer` | `ERR_NOT_FOUND` where the format has none |
| 11 | `locate` | `doc_xpointer` | `doc_at` | the position of an XPointer |
| 12 | `links` | `doc_span` | `doc_link`*, `end` | links of a section overlapping a range, paged |
| 13 | `link_target` | `doc_href` | `doc_at` | `ERR_NOT_FOUND` for external or dangling |
| 14 | `fonts` | `doc_page` | `doc_font`*, `end` | embedded font faces, paged |
| 15 | `cover` | `doc_ref` | `doc_image` | `ERR_NOT_FOUND` for none |
| 16 | `image` | `doc_image_ask` | `doc_image` | prepare a block's image, or larger (section 5) |
| 17 | `progress` | `doc_at` | `doc_progress` | where the format knows better than section lengths |
| 18 | `close` | `doc_ref` | (none) | |
| 19 | `formats` | `doc_page` | `doc_format`*, `end` | every format, paged |
| 20 | `format_for` | `doc_path` | `doc_format` | which format reads a file; `ERR_NOT_FOUND` |
| 21 | `readers` | `doc_page` (`scope`: a format id or empty) | `doc_reader`*, `end` | reading apps |
| 22 | `report` | `doc_report` | (none) | where the reader is; section 2.4 |

| Tag | Record | Fields |
| --- | --- | --- |
| 1060 | `service.doc_open` | `root: u32`, `path: str 512`, `format: str 128`, `flags: u32`, `image_side: u32`, `cover_side: u32`, `css_root: u32`, `css_path: str 512` |
| 1061 | `service.doc_option` | `key: str 64`, `value: str 128` |
| 1062 | `service.doc_state` | `document: u32`, `state: u32`, `progress_ppm: u32`, `status: i32`, `flags: u32`, `conversion: u64`, `format: str 128` |
| 1063 | `service.doc_ref` | `document: u32` |
| 1064 | `service.doc_meta` | `title: str 512`, `language: str 35`, `series: str 512`, `series_index: str 32`, `direction: u32`, `writing_mode: u32`, `sections: u32`, `authors: u32`, `subjects: u32`, `description_bytes: u32`, `flags: u32` |
| 1065 | `service.doc_text` | `kind: u32`, `index: u32`, `total: u32`, `text: str 1024` |
| 1066 | `service.doc_text_at` | `document: u32`, `kind: u32`, `index: u32`, `offset: u32` |
| 1067 | `service.doc_page` | `document: u32`, `scope: str 128`, `cursor: u32`, `generation: u32` |
| 1068 | `service.doc_section` | `index: u32`, `length: u32`, `flags: u32` |
| 1069 | `service.doc_at` | `document: u32`, `section: u32`, `offset: u32`, `insert: u32`, `cursor: u32`, `generation: u32` |
| 1070 | `service.doc_toc` | `index: u32`, `level: u32`, `section: u32`, `offset: u32`, `flags: u32`, `title: str 512` |
| 1071 | `service.doc_index` | `document: u32`, `index: u32` |
| 1072 | `service.doc_label` | `text: str 32` |
| 1073 | `service.doc_xpointer` | `document: u32`, `text: str 1024` |
| 1074 | `service.doc_span` | `document: u32`, `section: u32`, `from: u32`, `to: u32`, `cursor: u32`, `generation: u32` |
| 1075 | `service.doc_link` | `start: u32`, `end: u32`, `kind: u32`, `href: str 1024` |
| 1076 | `service.doc_href` | `document: u32`, `href: str 1024` |
| 1077 | `service.doc_font` | `index: u32`, `family: u32`, `flags: u32`, `bytes: u32` |
| 1078 | `service.doc_format` | `id: str 128`, `title: str 128`, `extensions: str 512`, `flags: u32`, `priority: i32` |
| 1079 | `service.doc_path` | `root: u32`, `path: str 512`, `flags: u32` |
| 1080 | `service.doc_reader` | `id: str 128`, `screen: str 128`, `formats: str 1032`, `title: str 128` |
| 1081 | `service.doc_progress` | `progress_ppm: u32` |
| 1183 | `service.doc_report` | `document: u32`, `section: u32`, `offset: u32`, `insert: u32`, `progress_ppm: u32`, `flags: u32`, `title: str 256`, `chapter: str 256`; optional (no default, `Option<u32>`): `page: u32`, `pages: u32`, `chapter_left: u32` |

- [D] `doc_page.scope` is op 21's format filter, else empty. Ops 19 and 21 name no document: their
  `doc_page.document` is 0 and ignored (the host accepts any value there). `doc_path.flags` bit 0:
  sniff when no extension matches (op 20 reads the first 512 bytes; root 1 needs `uses.storage`).
  `doc_format.title` and `doc_reader.title` are translated by the host as REG rows are. Two-way
  records (plugin and host send them; never `HOST_ONLY`): `doc_state` and the block, meta, toc,
  link, font and image rows, because a format plugin answers them in its `core.format` reply and the
  host passes them on.

### 2.1 Opening, preparing, closing

- [D] `open` (`doc_open`: `root` 0, 1 or 5, `path` at most 512 bytes, `format` empty for section 1's
  choice, `flags`, `image_side`, `cover_side`, `css_root`, `css_path`; then at most 12 `doc_option`
  rows `key`/`value`, so `input_rows` 13 in the schema, a maximum only; no `doc_open` first, a
  second `doc_open` or one after an option is `ERR_INVALID`; interface 6 `OpenOptions::settings`):
  `flags` bit 0 publisher styles, bit 1 colour, bit 2 background (an index build, not for showing,
  section 8; also the library's cover open, `core.library` op 7: a format may leave
  `doc_state.flags` bit 1 (has a table of contents), bit 2 (has XPointers) and bit 4 (has page
  labels), which only a shown book needs, unset in its answer to such an open, and a later open
  without `background` finds them out), bit 3 `details` (the host's own, below); `image_side` the
  longest side of a page's picture (0: the screen's long side, as large as a page shows a picture
  whichever way the screen is turned, at most 1,600; a side named is at most 1,600, the most a
  picture is ever decoded to, larger is `ERR_INVALID`),
  `cover_side` of the cover (0: interface 6 `cover_fit`, the larger of 300 and 3/8 of the screen's
  long side; at most the screen's long side); `css_path` a file of user CSS (at most 65,536 bytes,
  empty for none) on `css_root` (0 or 1 under the same rule as `path`). Other flag bits
  `ERR_INVALID`. On root 1, a `path` or `css_path` whose first segment is `plugins`, `.paperpaw` or
  `paperpaw.ini` (in any case) is `ERR_INVALID`, as on `core.files` (`files.md` 1.1), and so is
  such a `doc_path.path` of op 20 `format_for` (with or without its sniff). This check comes
  before the `uses.storage` check of root 1, so a plugin without the feature gets `ERR_INVALID`
  for such a path too, not `ERR_DENIED`. The host checks the roots, finds the format, gives a new
  document id and calls the format's op 2 `open`; its answer becomes `doc_state`.
- [D] **Root 5, the handed file.** A reader whose instance was made from a hand-over
  (`ui.md` section 1, op 16) whose params carry `root` (`0` or `2`) and `path` may open that one
  file of the plugin that made the hand-over: `doc_open.root` 5 with the same `path`, read only,
  resolved in that plugin's data folder (`0`) or install folder (`2`) under the storage path
  rules. Another path, a hand-over without these params, an instance not made from a hand-over,
  and `css_root` 5 are `ERR_DENIED`; a maker no longer installed, or no such file, is
  `ERR_NOT_FOUND`. The format reads it as root 3, as any book; it is not a library book (no
  catalog row, position or "recently opened"; its root-6 cache is keyed by the maker's id, root
  and path and goes when the maker is uninstalled). A handed document ends when its maker stops,
  for any reason (stopped, turned off, uninstalled, failed): the opener gets
  `event.document_closed` with `reason` 3 and later calls on the id are `ERR_CANCELLED`, as for
  a book that was removed. A reader instance that holds a handed file may hand it on to its own
  screens (the table of contents): `core.ui` op 16 with `root` `5` and the same `path` (`ui.md` 1);
  the new instance's root 5 is the same file of the same maker, whichever plugin's screen it is. Root 5 exists only in `doc_open`
  (slots 20-26, `core.files` and format calls answer it `ERR_UNSUPPORTED`). A host answers
  `ERR_UNSUPPORTED` until it is wired.
- [D] **Options reach their format whole.** An option's `key` is a full setting id
  (`<plugin>.<name>`) with the book's own value (interface 6 gathers them for every format owner,
  `reading/mod.rs:275`); the host forwards to the chosen format exactly the options of its plugin,
  each as one `fmt.option` record beside `fmt.call` (section 3), none cut and none dropped; options
  of other plugins are not for this format and go nowhere. More than 12 options of one format, or an
  option over its caps, is `ERR_NO_SPACE` for the open (never a silent drop).
- [D] `doc_state`: `document`, `state` (0 ready, 1 preparing, 2 failed), `progress_ppm` while
  preparing, `status` (an `ERR_*` when failed), `format` (the format id), `flags` (bit 0 whole
  pages, bit 1 has a table of contents, bit 2 has XPointers, bit 3 has embedded fonts, bit 4 has
  page labels, bit 5 right-to-left pages, bit 6 the cache was made now, bit 7 some sections are
  whole-page pictures and others are not, #242: each `doc_section` says which; bit 0 stays "every
  section"). A failed open still has an
  id until closed, so the opener can read `status` (and the reader can say "this book is damaged").
- [D] **Preparing**: while `state` is 1, the host calls the format's op 3
  `prepare` again and again from its main loop, between inputs, each call for at most 50 ms of work
  by the format's own clock (the format stops at a safe point and answers its progress), until it
  answers done or fails. The opener gets `event.document_changed` (88: `document`, `state` and
  `progress_ppm`, 0 to 1,000,000, as `doc_state` has them at delivery; one per document, coalesced,
  the latest wins) when the state or the progress moves; other ops on a preparing document are
  `ERR_BUSY`. The X4 runs at most one preparation at a time, queued in open order.
- [D] **A details open may skip preparing** (#245). `doc_open.flags` bit 3 `details` is the host's
  own: the host's background job (covers, book details) may set it, a plugin's `open` with it is
  `ERR_INVALID` (bit 2 `background` says nothing about it: an index build needs blocks). The format
  gets it in `fmt.call.flags` of op 2 and may honour it: it answers `ready` (state 0, no show-only
  `doc_state.flags`) without converting, from what it reads at open (a DOCX's `docProps/core.xml`,
  a MOBI's EXTH header and cover record). Such a document serves op 4 `close`, 5 `meta`, 6
  `meta_text` and 17 `cover` (section 3) and answers every other op `ERR_STATE`; the host never
  calls op 3 `prepare` on it (a format that gets op 3 there answers `ERR_STATE`). It writes no
  converted document to root 6, only the cover picture file op 17 names. A format may also ignore
  the bit and open as usual; an answer of preparing to a `details` open is never prepared: the
  host closes the document (op 4) and keeps no details. A `details` open neither makes the
  `.complete` stamp nor removes an unstamped root 6, whatever the format answered (a cache
  finished before keeps its stamp): it reads what is there, so the cover picture it made survives
  the next `details` open. In an unstamped root 6 the format reads only that cover picture file
  (which may be from a half-made conversion: the host checks it as any cached picture, section 5)
  and nothing else. Only an open without `details` removes an unstamped root 6 (the cover goes
  with it) and prepares. A `details` open is `ERR_BUSY` while any other document of the same book
  and format plugin is preparing, whatever its conversion (a `details` open's key rarely matches a
  reader's: sides, CSS and options differ). A `details` open never removes another conversion of
  the book (it makes no room); an open without `details` that needs room removes the book's
  unstamped folders (a `details` open's cover file, a half-made conversion) before its finished
  ones, oldest first. Bits 2 and 3 of a `details` open are not part of its conversion key. A
  `details` document is the host job's alone: any other open closes it first and is
  a new open, prepared as usual. Bit 3 may come with bit 2 `background`. The host sets the bit on
  its own opens of a book for details and covers (the book-details job, the library's cover job
  and the library list's inline cover open, `library.md` op 7 `cover`), and only for a format whose
  `format.spec` has bit 0 `prepared`; it opens other formats as before (bit 2 at most), and their
  caches are stamped as usual. Where root 6 holds a stamped cache, a `details` open is still a
  `details` document (ops 4, 5, 6 and 17 only); the format may read that cache for them.
- [D] **A preparation that does not move fails.** After 32 answers in a row of state 1 whose
  `progress_ppm` is not higher than the highest one this preparation gave (equal or lower counts),
  the host fails the document with `ERR_TIMEOUT`, exactly as if the format had answered failed:
  the partial cache goes, `doc_state` is state 2 with that status and the opener gets event 88.
  The count starts at 0 with each preparation and goes back to 0 at every answer that moves the
  progress. Since the progress only rises and stops at 1,000,000, a format cannot keep the main
  loop busy for ever (at most 32 calls of 50 ms without movement). Idle sleep is no bound: a
  device on USB power never sleeps.
- [D] **The cache is whole or not used.** A cache is made for one **conversion**: the book's
  identity (LIB's fingerprint), the format plugin's id and version, and the conversion key, a hash
  of everything that changes the output (publisher styles, colour, `image_side`, `cover_side`, the
  CSS file's content hash, the forwarded options), interface 6 `prepared_keeping` and `PreparedCss`.
  Root 6 is `.paperpaw/cache/<book key>/<format plugin>/<conversion key>/`; the host keeps at most
  two conversions per book (the older goes, but never one an open document uses: a conversion is
  **pinned** while any document of it is open, on any plugin; a third conversion needed while two
  are pinned waits, the open answers `ERR_BUSY`, and nothing an open document reads is removed
  under it), and `doc_state.conversion` (a `u64`) names it, which
  LIB stores with positions and annotations (`library.md` 2.2). The host writes `.complete` (the
  stamp of those inputs) after the format answers done and the card is synced; a cache without a
  current stamp (power cut, card pulled, a new format version, other options) is removed and made
  again, so the format never sees a half-made or stale cache as finished.
- [D] `close` frees the id; the format gets op 4 `close` (its state for it goes) and every image id
  of the document (section 5) ends. The host closes the opener's documents when the opener stops,
  and closes a format's documents when the format plugin stops or is uninstalled: the opener gets
  `event.document_closed` (108: `document`, `reason` 1 the format stopped, 2 the card went, 3 the
  book was moved or removed (for root 5: its maker stopped), 4 `needed`: the place went to a book to
  show, below; others treated as 1) and every later call on the id is `ERR_CANCELLED` until it
  closes it. A reply the format produces after that is never delivered (it is not called again).
- [D] Limits: at most 2 open documents per opener and 2 on the X4 device-wide (the shown book and a
  background index), 8 elsewhere; over that `ERR_FULL`. On the X4 the cap is in effect 1 per
  opener, so no one plugin can take both places.
- [D] **A book to show always gets a place.** An `open` without `flags` bit 2 `background` from
  the plugin whose screen is showing, when the device-wide places are full, takes the place of
  another opener's document: first one opened with `background`, else one whose opener shows no
  screen, the oldest first. That document is closed as by `close` (the format gets op 4, its
  image ids end) and its opener gets `event.document_closed` with `reason` 4 `needed`; later calls
  on its id are `ERR_CANCELLED`. The shown book itself is never taken. Only when no document can
  be taken (the opener's own cap) is the `open` `ERR_FULL`. An index build that lost its place
  starts again later (the library's walk tries it again). The host's own background job (covers,
  book details) is no opener: it takes one device-wide place but no opener's cap, is the first
  document a book to show takes, gets no `document_closed`, and starts again later.

### 2.2 Metadata

- [D] `doc_meta`: `title: str 512`, `language: str 35`, `series: str 512`,
  `series_index: str 32`, `direction` (0 left to right, 1 right to left), `writing_mode` (0
  horizontal, 1 vertical right to left, 2 vertical left to right, 3 and 4 sideways, section 4),
  `sections`, `authors`, `subjects` (their counts, no cap), `description_bytes`, `flags` (bit 0 the
  title was cut, bit 1 the series). Op 3 answers `doc_meta` alone. Op 4 (`doc_text_at`: `document`,
  `kind` 0 title, 1 author, 2 subject, 3 description, 4 series; `index` below the count, else
  `ERR_NOT_FOUND`; `offset`) answers one `doc_text` (`kind`, `index`, `total` its whole length,
  `text` at most 1,024 bytes from `offset`, cut at a UTF-8 boundary): an opener lists every author
  and subject by index and reads any text whole by offsets. Nothing is cut for good and nothing is
  left out.

### 2.3 Navigation and links

- [D] Positions are `doc_at` (`document`, `section`, `offset`, `insert`; `insert` always 0 here, the
  N5 locator's ordinal belongs to the reader's inserted content). `section` past the end
  `ERR_NOT_FOUND`; an offset past a section's end is the end.
- [D] `sections` rows `doc_section` (`index`, `length` in source units for progress, `flags` bit 0 a
  whole-page picture: a reader shows that section as a page picture, the others reflowed, where
  `doc_state` bit 7 says the sections differ, #242). Op 17 `progress` answers `progress_ppm` (0-1,000,000) where the format
  computes it itself (interface 6 `Document::progress`, EPUB and TXT); elsewhere `ERR_UNSUPPORTED`
  and the reader computes it from the section lengths (N5 rule 1).
- [D] `toc` rows `doc_toc` (`index`, `level` 0-15, `section`, `offset`, `flags` bit 0 approximate:
  `toc_target` finds the exact place, `title: str 512`, cut at a UTF-8 boundary with bit 1). Up to
  10,000 entries (FB2) in pages; the reader shows the first 500.
- [D] `links` (`doc_span`: `document`, `section`, `from`, `to`, `cursor`, `generation`) rows
  `doc_link` (`start`, `end`, `kind` 0 internal, 1 external, 2 footnote, 3 file, `href: str 1024`).
  Kind 3 (#369 M) is another file on the card (a note of the same vault): `href` is its path, from
  the card's top where it starts with `/`, else from the book's folder (no `..`); the reader opens
  it with `command.open` (a `path` hand-over to `core.reader`). An SDK before it reads
  `LinkKind::Other(3)`. A format lists `file:<path>` links as kind 3 only where it says so
  (`FormatProvider::with_file_links`, the notes vault); a book's own are external. An
  `href` over 1,024 bytes is not listed (logged); `link_target` resolves one inside the book.
- [D] `page_label` (`doc_label: str 32`), `xpointer` and `locate` (`doc_xpointer`: `document`,
  `text: str 1024`) as interface 6 (KOReader XPointers for EPUB, for koreader and kosync).

### 2.4 The reader report (op 22, draft 37)

The reader tells the host where the user is reading; the host turns it into the book events
(`core-events.md` 3.1: 37 and 65-67), so no plugin raises them itself.

- [D] **The report.** Op 22 `report` (`doc_report`): `document` (an id the caller opened),
  `section`, `offset`, `insert` (the page's start, the N5 locator of `screens-input.md` 9),
  `progress_ppm` (0 to 1,000,000, N5 rule 1), `flags` (bit 0 `finished`: the user reached the end,
  interface 6 `BOOK_FINISHED`; other bits `ERR_INVALID`), `title` (the book's display title, cut
  by the reader at a UTF-8 boundary), `chapter` (the title of the table-of-contents entry the page
  is in; empty where the book has none or the page comes before its first entry), and optionally
  `page` and `pages` (counted from 1, both or neither) and `chapter_left` (the pages after this one
  in that chapter, 0 on its last page; only with `page` and `pages`, and with a `chapter` the
  reader knows the end of). The reply is empty; the status is the call's.
- [D] **Checks** (`ERR_INVALID`, nothing raised, the session as it was): `progress_ppm` above
  1,000,000; `page` without `pages` or the reverse, a `page` of 0 or past `pages`; `chapter_left`
  without `page` and `pages`, with an empty `chapter` (no chapter to count down), or above
  `pages - page`; `section` not below the document's section
  count; an unknown `flags` bit. Another plugin's document is `ERR_DENIED`, a closed one
  `ERR_CANCELLED` (section 2.1). Text that is not UTF-8 is `ERR_UTF8`.
- [D] **Which documents.** Only a book of the library raises book events: a document opened on
  root 1 without `flags` bit 2 `background`. A report on any other document (root 0 or 5, an index
  build) is accepted (`OK`) and raises nothing, so a reader reports every document the same way.
- [D] **Only the reader on screen.** A report drives the session only when the caller declared a
  `reader.spec` and owns the topmost screen of the stack that is not an overlay, and the document
  is one it opened as a library book. Any other report, from a
  plugin that opened a book from the card to index or read it in the background, or from a reader
  that is not on top, passes the checks above and is `OK` with nothing raised: it never starts,
  replaces, advances or ends the live session, so it cannot close the user's book or raise
  `book_finished` (Senior's S1). The host tests that another plugin's report leaves the live
  session as it was.
- [D] **The session.** The host keeps one reading session device-wide: the reported document, its
  `doc_open.path`, the last raised report and whether `finished` was raised. The first accepted
  report of a document starts a session and raises `book_opened` (65) with its fields; a session
  of another document ends first with `book_closed` (66, `reason` 0), so the old book's close
  comes before the new book's open (`core-events.md` 3.3). A later report raises `page_turned`
  (37) when any of `section`, `offset`, `insert`, `progress_ppm`, `chapter`, `page`, `pages` or
  `chapter_left` differs from the last raised one; an identical report raises nothing, so a
  repeat is free. `finished` raises `book_finished` (67) once per session, after the report's 37
  where there is one; later `finished` reports raise nothing more.
- [D] **Ending.** The session ends with `book_closed` (66, `reason` 0, the last raised fields)
  when its document is closed (op 18, the opener stopping, or the host closing it with
  `event.document_closed`). Sleep and power-off end it with `reason` 1 before `event.suspend` or
  `event.stopping`, as `core-events.md` 3.3 orders them. After a wake within the same run, the
  first report of the same book (same `doc_open.path`) starts a session with `book_opened`
  `reason` 1; after a restart the host keeps no session, so it starts with `reason` 0.
- [D] **The host stamps** `now_ms` (its monotonic clock), `path` (the session's `doc_open.path`,
  at most 512 bytes as root-1 paths are, so never cut) and `reason`; it never takes them from the
  plugin.
- [D] **When the reader reports:** when a book's first page is shown, at every page turn and
  jump, when it has counted the pages (the counters appear), and when the user reaches the end
  (`finished`). Not on every redraw.
- [D] **Memory and cost:** the session is one host record of the last raised fields (the path
  and the two texts at most 1,024 bytes together, about 1.1 KiB on the X4 while a book is open),
  allocated fallibly once at its full size when the session starts, so a later chapter or title
  change never grows it (`ERR_NO_MEMORY`: nothing raised for the new book, the next report tries
  again; when the report was another book's, the old session has still been ended with its
  `book_closed` first) and freed when it ends. One call per page turn, at most 1,024 bytes of
  input; the events go through the event queue as before (`core-events.md` 3.2). While the event
  pump is behind, up to 8 book events wait in the queue (`core-events.md` 3.2), about 1.1 KiB
  each: about 9 KiB at most on the X4, freed as they are delivered.
- [D] Until the native reader reports, 37 keeps its interface-6 producer (`core-events.md` 3.1).
  A host answers `ERR_UNSUPPORTED` until it is wired.

## 3. The stage `core.format` (major 1)

A host-defined stage (generated stage schema, `abi/stages/core.format@1.def`, stage-local tags;
spec `/home/agent/shared/stage-schemas-spec-228.md`). The host calls the one format plugin that
serves the document, with the `token` of its `format.spec`; nobody else subscribes. Each call's
input is one `fmt.call` record (`op`, `document`, `section`, `offset`, `index`, `cursor`,
`generation`, `flags`, `image_side`, `cover_side`, `conversion: u64`, `text: str 1024`, `arg: bytes
512`) followed, for op 2 only, by the forwarded `fmt.option` records (at most 12: key 64, value 128
bytes); the reply is the op's records (local tags), the same records as the service's rows, so the
host passes them on after checking them.

| Op | Name and input | Rows of the reply | Roots |
| --- | --- | --- | --- |
| 1 | `sniff` (`arg`: the file's first at most 512 bytes; with `flags` bit 0 `claimed`, section 1's handing on: `arg` empty, `document` set) | `fmt.yes` (or none: not mine) | none (`claimed`: 3) |
| 2 | `open` (`flags`, sides, `conversion`; `fmt.option`*) | `doc_state` | 2, 3, 4 |
| 3 | `prepare` | `doc_state` (`progress_ppm`; `state` 0 done, 1 more, 2 failed) | 2, 3, 4 |
| 4 | `close` | none | none |
| 5 | `meta` | `doc_meta` | 2, 3 |
| 6 | `meta_text` (`index`, `flags` the kind, `offset`) | `doc_text` | 2, 3 |
| 7 | `sections` (`cursor`) | `doc_section`*, `end` | 2, 3 |
| 8 | `block` (`section`, `offset`, `cursor`, `generation`) | the block stream (section 4) | 2, 3 |
| 9 | `toc` (`cursor`) | `doc_toc`*, `end` | 2, 3 |
| 10 | `toc_target` (`index`) | `doc_at` | 2, 3 |
| 11 | `page_label` (`section`, `offset`) | `doc_label` | 2, 3 |
| 12 | `xpointer` (`section`, `offset`) | `doc_xpointer` | 2, 3 |
| 13 | `locate` (`text`: the XPointer) | `doc_at` | 2, 3 |
| 14 | `links` (`section`, `offset` from, `index` to, `cursor`) | `doc_link`*, `end` | 2, 3 |
| 15 | `link_target` (`text`: the href) | `doc_at` | 2, 3 |
| 16 | `fonts` (`cursor`) | `doc_font`*, `end` | 2, 3 |
| 17 | `cover` (`cover_side`) | `fmt.image` | 2, 3 |
| 18 | `image` (`index` the image, `image_side`) | `fmt.image` | 2, 3 |
| 19 | `progress` (`section`, `offset`) | `doc_progress` | 2, 3 |

- [D] **Picture sides are the host's.** A format never asks for the screen and never sees a side
  of 0: in `open` the host turns a `cover_side` of 0 into its default (the larger of 300 and 3/8
  of the screen's long side, at most that side) and an `image_side` of 0 into the screen's long
  side, at most 1,600, **before** the conversion key is made, so an open with 0 and one with the
  same sides spelled out share one cache; ops 2, 17 and 18 always carry both sides, set by the
  host.
- [D] **Paged replies** (ops 7, 9, 14, 16): whole rows, then exactly one `fmt.end` (the
  `service.end` row), the paging of `registry.md` 2.1: `flags` bit 0 the last page, `next` the
  `cursor` of the next call, `total` the rows of the whole list, `generation` the format's own for
  this document (never 0; a call whose `generation` is not it is `ERR_STATE`, start again at 0).
  The host forwards `cursor` and `generation` as the caller gave them. Op 8's blocks end as
  section 4 says (bit 1 `more`).
- [D] Service ops map one to one: 3 → 5, 4 → 6, 5 → 7, 6 → 8, 7 → 9, 8 → 10, 9 → 11, 10 → 12, 11 →
  13, 12 → 14, 13 → 15, 14 → 16, 15 → 17, 16 → 18, 17 → 19; ops 1, 2, 18-21 of the service are the
  host's own (open, state, close, formats, readers). Sizes: `fmt.call` 1 + 10×4 + 8 + 1,026 + 514 +
  3 = 1,592 framed (`abi/stages/core.format@1.def`), with 12 options 4,016: over the 3,840 payload,
  so op 2 carries `arg` empty and `text` empty except for a `siblings` format, where it names the
  opened file within the book's folder (at most 255 bytes, a FAT name: 1,592 − 512 − 1,024 + 257 +
  2,424 = 2,737, within 3,840). Every later call of that document carries the same name in `text`
  where the op uses no other `text` (ops 13 and 15 name their XPointer or href instead; the host
  keeps the name with the document).

- [D] **Roots** (the reserved roots of D2.2, valid only inside a call for that document): root 6 the
  document's cache for its conversion (section 2.1; read and write; the book key is LIB's, so the
  cache follows the book on a move and goes with it, LIB), root 3 the book (read only: `path` "" is
  the file; for a `folder` format the folder and below; for a `siblings` format the book's folder
  and below, the call's `text` naming the opened file within it), root 4 the user CSS file (read
  only, `path` "", during op 2 and 3 only). These three outside such a call are `ERR_UNSUPPORTED`;
  roots 0-2 keep their meaning in every callback (`files.md`). The format writes its cache
  atomically per file (D2.5); it may not write root 3.
- [D] **Root 3 through the slots and through `core.files`** (Files on #499): for a single-file
  format, root 3 is read with the storage slots (`storage_size`, `storage_read_at`; `path` "" is
  the file), and `core.files` `list`/`stat` on it are `ERR_UNSUPPORTED`. For a `folder` or
  `siblings` format, `core.files` `list` and `stat` work on root 3 inside its `core.format` call.
  The scope is checked first: root 3 outside such a call is `ERR_UNSUPPORTED` for every op;
  inside it, every op that changes something is `ERR_DENIED`.
- [D] **Root numbers mean one thing everywhere** (Code Reviewer on #346): root 2 is the plugin's
  own install folder (`files.md` section 1.1) in every callback, a format's too; the document's
  cache is root 6, not 2.
- [D] **Paths in roots 3, 4 and 6** follow the storage slots' rules: relative only; no `..`, `\`,
  NUL, empty segments or a leading `/` (`ERR_INVALID`); resolved strictly below the root, a link or
  a name that resolves outside it `ERR_DENIED`. In root 6 the name `.complete` (the host's stamp)
  and everything under `.host/` are host-reserved: a format's write, rename or delete of them is
  `ERR_DENIED`, a read of them `ERR_NOT_FOUND`. Root 3 refuses every write and delete
  (`ERR_DENIED`).
- [D] **Cache quota.** A document's cache is counted to the format plugin (S7) and capped at 64 MiB
  per book on the X4 (an EPUB with large images; `ERR_NO_SPACE` beyond and on a full card, the
  preparation fails with that status and the host removes the partial cache).
- [D] **Depth and stack.** The opener's call is depth 1 and the format's callback depth 2: the
  format cannot call `stage.run` or `core.document` (`ERR_BUSY`). On the X4 the format callback
  joins the nested-callback frame budget and stack gate of slot 35 (`ui.md` 5.1) with its own
  high-water case (EPUB `block` at a long chapter). Senior's answer: the X4 has no fallback mode
  (answering depth-2 ops from the cache would need a host-known cache format, which does not
  exist); **the stack gate (G7/G8 measurement) must pass before the reader port starts on the X4**,
  and it is a prerequisite item on the device checklist.
- [D] **Failures.** A format callback that fails, answers malformed rows or rows of another op is a
  failed call: the service op answers `ERR_IO` for a card error, `ERR_INVALID` for a malformed
  answer, else the format's status (logged with the format's id). Three malformed answers in a row
  close the document (reason 1). The format never panics the host; a fault is the plugin's fault
  (STG rules).
- [D] **Time.** `block` runs on every page laid out: its time counts against the reader's X4
  page-turn budget (timing gate of the reader port). A format answers op 6 from its cache, not by
  parsing the book again.

## 4. Blocks on the wire

The interface-6 `Block` (`paperpaw-document`), whole: every field has a record, and nothing a format
says is dropped. A block is a **record list** (header, text parts, runs, maps, columns, cells,
rubies, languages, image) that the format's SDK writer makes from the block deterministically. It
travels in **fragments** of at most 3,840 bytes (the stage payload), cut only between records, never
inside one: the logical block, its paragraph and its table row are never split or changed because a
reply filled up (no flattening, no `continues` invented by the transport). The first call answers
fragment 0; `service.end.flags` bit 1 `more` says the block goes on, with `next` the record index to
ask from and `generation` the block's identity (a hash of section, start and the conversion); the
opener asks op 6 again with `doc_at.cursor` = `next` and that generation (the format makes the same
list again from its cache and answers from that record on). A changed generation is `ERR_STATE`.
The reader joins the fragments into one block. `continues`/`continued` keep only their interface-6
meaning (the format's own split of a very long paragraph).

| Tag | Record | Fields |
| --- | --- | --- |
| 1082 | `service.doc_block` | `kind: u32`, `level: u32`, `flags: u32`, `start: u32`, `end: u32`, `align: u32`, `indent: i32`, `space: u32`, `size: u32`, `margin_start: u32`, `margin_end: u32`, `line_height: u32`, `dir: u32`, `writing_mode: u32`, `lang: str 35`, `drop_cap: u32`, `text_bytes: u32` |
| 1090 | `service.doc_text_part` | `text: str 3072` |
| 1091 | `service.doc_columns` | `weights: bytes 32` |
| 1083 | `service.doc_run` | `start: u32`, `end: u32`, `style: u32` |
| 1084 | `service.doc_map` | `text: u32`, `source: u32` |
| 1085 | `service.doc_cell` | `end: u32`, `span: u32`, `rows: u32`, `align: u32`, `vertical: u32`, `width: u32` |
| 1086 | `service.doc_ruby` | `start: u32`, `end: u32`, `kind: u32`, `size: u32`, `text: str 1024` |
| 1087 | `service.doc_inline_lang` | `lang: str 35` |

- [D] Order of the list: one `doc_block` (`text_bytes` the text's whole length), the text in
  `doc_text_part`s (each at most 3,072 bytes, cut at UTF-8 boundaries, joined in order to
  `text_bytes`), its `doc_run`s (sorted, not overlapping), `doc_map`s (the `OffsetMap` checkpoints),
  for an image block at most one `doc_image` (section 5: a picture that fails the image check is
  left out and the block keeps its alt text, never `ERR_INVALID`), for a table row one
  `doc_columns` (interface 6 `TableRow.columns`: up to 16 `u16` weights shared by the table's
  rows, little-endian) and its `doc_cell`s (at most 16, `MAX_COLUMNS`; `flags` bits 8-10 header,
  first, last row), its `doc_ruby`s and up to 15 `doc_inline_lang`s (`MAX_INLINE_LANGS`); the last
  fragment ends with `service.end` (`flags` bit 0: the last block of the section; `next` the offset
  of the next block).
  Runs, maps and rubies have no count cap (interface 6 has none); every record fits a fragment.
  Another order, an unknown record or a text whose parts do not add up is `ERR_INVALID` (the host
  checks the format's answer).
- [D] `kind`: 0 paragraph, 1 heading (`level` 1-6), 2 preformatted, 3 image, 4 table row, 5+n
  `Extended(n)`; `flags` bit 0 continues, bit 1 continued; `indent`, `space`, `size`, `line_height`:
  `i32::MIN` / `u32::MAX` for "the reader's"; `style` the interface-6
  `TextStyle` bits unchanged (they are already a stable `u32`); `lang` a BCP 47 tag, empty for
  unknown.
- [D] **Direction, writing mode, language** (interface 6 `Block.dir`, `writing_mode`, `lang`,
  `inline_langs`; the SDK's `lang::Direction`, `lang::WritingMode`, `Lang`): `dir` 0 auto (the first
  strong letter, UAX #9 P2/P3), 1 left to right, 2 right to left; `writing_mode` 0 horizontal top to
  bottom, 1 vertical right to left, 2 vertical left to right, 3 sideways right to left, 4 sideways
  left to right (`doc_meta.writing_mode` uses the same numbers). A later value the reader does not
  know reads as 0 (auto, horizontal), never an error, so a newer format still opens in an older
  reader; the reader lays out horizontal lines only, as interface 6. `lang` is interface 6's
  `Block.lang` as a BCP 47 tag (language, script, region; `Lang`'s text form): the element's own
  (`lang`, `xml:lang`, inherited), else the book's (`doc_meta.language`), as the format resolves it;
  empty only when neither is known (`Lang::NONE`). The `doc_inline_lang`s are `inline_langs` in
  order: a run's `TextStyle::lang_index` n names the n-th (from 1), 0 the block's `lang`; an index
  past the list reads as the block's `lang`.
- [D] **Annotations** (`doc_ruby`, interface 6 `Annotation`, now re-exported as
  `paperpaw_sdk::document::{Annotation, AnnotationKind}`): `kind` 0 ruby, 1 phonetic, 2 gloss, 3+n
  `Other(n)` (n at most 65,535); a value the reader does not know reads as a gloss, as
  `AnnotationKind::Other` says. `size` is the percent of the text below, 0 for the reader's. A
  footnote or note text is **not** an annotation: it stays a link to its target (`doc_link`, section
  2.3) as in interface 6; a format sends a gloss only for a text meant to stand above the words.
- [D] Inserted blocks and `leading_above` are the reader's (its text filters, #964); formats answer
  none, as in interface 6.

### 4.1 Foreign elements and the conversion hook (`core.convert`, draft 37, #429)

A format that does not convert an element itself hands it on, so that another plugin can (MathML in an
EPUB: `format-epub` writes the `<math>` and `format-epub-plus` converts it). Nothing is added to the
record list: a **foreign element** is a `doc_ruby` of `kind` `3 + 0xFFF0` (65,523; the SDK's
`Annotation::foreign`, `Annotation::FOREIGN`) over `start..end`, the range of the block's text the
format wrote for the element **without help** (the formula's `alttext`, else the text of its leaves), and
`text` the element's markup (at most 1,000 bytes: its start tag with the attributes that matter and no
namespaces, its content, its end tag; text escaped; an element that would be longer is not handed on). The
block is complete in one fragment (a format that cannot keep it so leaves the element to its text).

At the call level of the format's own (no deeper: the format has answered), the host replaces every
foreign element of a block that goes no further, in order, at most eight a block: it asks the plugins
that subscribe to the host-defined stage `core.convert@1` (`registration.stage`, at most 4 on a device,
in stage order) with one `conv.ask` (`element` the markup's element name, `flags` 0, `markup`), and the
first `conv.text` with a non-empty `text` (at most 2,048 bytes; `\n` breaks a line) is put where the
format's text was: the block's `text_bytes`, text parts, runs, maps, cells and annotations after it move
with it, a place inside the replaced range goes to its start (the end of a range to the end of the new
text). The foreign records are **never** passed on to the opener. Where there is no subscriber, it fails
or is not made yet (it is asked to start; the block is passed on with the format's text, the next
layout has the hook), says nothing, or the block would not fit a fragment (3,840 bytes) after it, the
format's text stays: a book reads without the hook plugin, with the plain text of the element. A
foreign element in a fragment of a block that goes on, or whose range does not fit its text, is left
out the same way. A subscriber never sees the book, the card or the document: only the markup.

SDK: `native::convert` (`Asked::decode`, `Converted::text`/`pass`/`encode`). The stage's key, bounds
and records: `abi/stages/core.convert@1.def`. A plugin of draft 36 runs unchanged; so does a format that
writes no foreign element.

## 5. Images (IMG, N6)

Pictures of books (covers, illustrations, comic pages) and the pictures plugins show (picture-home,
sleep): the host keeps decoded images on the card in the `paperpaw-image` gray (or colour) format
and draws them in bands, so no plugin holds a picture in memory.

```
image.info(ctx, image: u32, out: buffer) -> i32                                   // slot 36
canvas.draw_image(ctx, image: u32, x: i32, y: i32, width: u32, height: u32, flags: u32) -> i32
                                                                                   // slot 37
canvas.draw_image_part(ctx, image: u32, source: bytes, x: i32, y: i32, width: u32, height: u32,
                       flags: u32) -> i32                                          // slot 44
```

Slots 36 and 37 come with draft 25; a host answers `ERR_UNSUPPORTED` until it draws images. Slot 44
comes with the interface round of Beta 4 (#369): a host table that ends before it has no part draw,
and the SDK answers `Unsupported` there.

| Tag | Record | Fields |
| --- | --- | --- |
| 31 | `format.spec` | `name: str 96`, `title: str 96`, `extensions: str 512`, `flags: u32`, `priority: i32`, `token: u32` |
| 229 | `reader.spec` | `name: str 96`, `screen: str 128`, `formats: str 1032`, `flags: u32` |

## 2. The service `core.document` (major 1)

Bare reply streams and paging as `core.registry` (`registry.md` 2.1), `page_rows` 64 (rows fit by
bytes too: a page holds the whole rows that fit 4,096). Feature: none to list formats and readers;
`open` needs read access to the book's root (root 1 needs `uses.storage`, decision 125; root 0 the
caller's own Data). Every op on a document is the opener's only (`ERR_DENIED` for others).

| Op | Name | Input | Reply | Notes |
| --- | --- | --- | --- | --- |
| 1 | `open` | `doc_open`, `doc_option`* | `doc_state` | section 2.1 |
| 2 | `state` | `doc_ref` | `doc_state` | preparing progress, failure |
| 3 | `meta` | `doc_ref` | `doc_meta` | section 2.2 |
| 4 | `meta_text` | `doc_text_at` | `doc_text` | one author, subject or text, from an offset |
| 5 | `sections` | `doc_page` | `doc_section`*, `end` | paged |
| 6 | `block` | `doc_at` | the block stream (section 4) | the block at or after a position |
| 7 | `toc` | `doc_page` | `doc_toc`*, `end` | paged, in reading order |
| 8 | `toc_target` | `doc_index` | `doc_at` | exact position of an entry |
| 9 | `page_label` | `doc_at` | `doc_label` | printed page name, `ERR_NOT_FOUND` for none |
| 10 | `xpointer` | `doc_at` | `doc_xpointer` | `ERR_NOT_FOUND` where the format has none |
| 11 | `locate` | `doc_xpointer` | `doc_at` | the position of an XPointer |
| 12 | `links` | `doc_span` | `doc_link`*, `end` | links of a section overlapping a range, paged |
| 13 | `link_target` | `doc_href` | `doc_at` | `ERR_NOT_FOUND` for external or dangling |
| 14 | `fonts` | `doc_page` | `doc_font`*, `end` | embedded font faces, paged |
| 15 | `cover` | `doc_ref` | `doc_image` | `ERR_NOT_FOUND` for none |
| 16 | `image` | `doc_image_ask` | `doc_image` | prepare a block's image, or larger (section 5) |
| 17 | `progress` | `doc_at` | `doc_progress` | where the format knows better than section lengths |
| 18 | `close` | `doc_ref` | (none) | |
| 19 | `formats` | `doc_page` | `doc_format`*, `end` | every format, paged |
| 20 | `format_for` | `doc_path` | `doc_format` | which format reads a file; `ERR_NOT_FOUND` |
| 21 | `readers` | `doc_page` (`scope`: a format id or empty) | `doc_reader`*, `end` | reading apps |
| 22 | `report` | `doc_report` | (none) | where the reader is; section 2.4 |

| Tag | Record | Fields |
| --- | --- | --- |
| 1060 | `service.doc_open` | `root: u32`, `path: str 512`, `format: str 128`, `flags: u32`, `image_side: u32`, `cover_side: u32`, `css_root: u32`, `css_path: str 512` |
| 1061 | `service.doc_option` | `key: str 64`, `value: str 128` |
| 1062 | `service.doc_state` | `document: u32`, `state: u32`, `progress_ppm: u32`, `status: i32`, `flags: u32`, `conversion: u64`, `format: str 128` |
| 1063 | `service.doc_ref` | `document: u32` |
| 1064 | `service.doc_meta` | `title: str 512`, `language: str 35`, `series: str 512`, `series_index: str 32`, `direction: u32`, `writing_mode: u32`, `sections: u32`, `authors: u32`, `subjects: u32`, `description_bytes: u32`, `flags: u32` |
| 1065 | `service.doc_text` | `kind: u32`, `index: u32`, `total: u32`, `text: str 1024` |
| 1066 | `service.doc_text_at` | `document: u32`, `kind: u32`, `index: u32`, `offset: u32` |
| 1067 | `service.doc_page` | `document: u32`, `scope: str 128`, `cursor: u32`, `generation: u32` |
| 1068 | `service.doc_section` | `index: u32`, `length: u32`, `flags: u32` |
| 1069 | `service.doc_at` | `document: u32`, `section: u32`, `offset: u32`, `insert: u32`, `cursor: u32`, `generation: u32` |
| 1070 | `service.doc_toc` | `index: u32`, `level: u32`, `section: u32`, `offset: u32`, `flags: u32`, `title: str 512` |
| 1071 | `service.doc_index` | `document: u32`, `index: u32` |
| 1072 | `service.doc_label` | `text: str 32` |
| 1073 | `service.doc_xpointer` | `document: u32`, `text: str 1024` |
| 1074 | `service.doc_span` | `document: u32`, `section: u32`, `from: u32`, `to: u32`, `cursor: u32`, `generation: u32` |
| 1075 | `service.doc_link` | `start: u32`, `end: u32`, `kind: u32`, `href: str 1024` |
| 1076 | `service.doc_href` | `document: u32`, `href: str 1024` |
| 1077 | `service.doc_font` | `index: u32`, `family: u32`, `flags: u32`, `bytes: u32` |
| 1078 | `service.doc_format` | `id: str 128`, `title: str 128`, `extensions: str 512`, `flags: u32`, `priority: i32` |
| 1079 | `service.doc_path` | `root: u32`, `path: str 512`, `flags: u32` |
| 1080 | `service.doc_reader` | `id: str 128`, `screen: str 128`, `formats: str 1032`, `title: str 128` |
| 1081 | `service.doc_progress` | `progress_ppm: u32` |
| 1183 | `service.doc_report` | `document: u32`, `section: u32`, `offset: u32`, `insert: u32`, `progress_ppm: u32`, `flags: u32`, `title: str 256`, `chapter: str 256`; optional (no default, `Option<u32>`): `page: u32`, `pages: u32`, `chapter_left: u32` |

- [D] `doc_page.scope` is op 21's format filter, else empty. Ops 19 and 21 name no document: their
  `doc_page.document` is 0 and ignored (the host accepts any value there). `doc_path.flags` bit 0:
  sniff when no extension matches (op 20 reads the first 512 bytes; root 1 needs `uses.storage`).
  `doc_format.title` and `doc_reader.title` are translated by the host as REG rows are. Two-way
  records (plugin and host send them; never `HOST_ONLY`): `doc_state` and the block, meta, toc,
  link, font and image rows, because a format plugin answers them in its `core.format` reply and the
  host passes them on.

### 2.1 Opening, preparing, closing

- [D] `open` (`doc_open`: `root` 0, 1 or 5, `path` at most 512 bytes, `format` empty for section 1's
  choice, `flags`, `image_side`, `cover_side`, `css_root`, `css_path`; then at most 12 `doc_option`
  rows `key`/`value`, so `input_rows` 13 in the schema, a maximum only; no `doc_open` first, a
  second `doc_open` or one after an option is `ERR_INVALID`; interface 6 `OpenOptions::settings`):
  `flags` bit 0 publisher styles, bit 1 colour, bit 2 background (an index build, not for showing,
  section 8; also the library's cover open, `core.library` op 7: a format may leave
  `doc_state.flags` bit 1 (has a table of contents), bit 2 (has XPointers) and bit 4 (has page
  labels), which only a shown book needs, unset in its answer to such an open, and a later open
  without `background` finds them out), bit 3 `details` (the host's own, below); `image_side` the
  longest side of a page's picture (0: the screen's long side, as large as a page shows a picture
  whichever way the screen is turned, at most 1,600; a side named is at most 1,600, the most a
  picture is ever decoded to, larger is `ERR_INVALID`),
  `cover_side` of the cover (0: interface 6 `cover_fit`, the larger of 300 and 3/8 of the screen's
  long side; at most the screen's long side); `css_path` a file of user CSS (at most 65,536 bytes,
  empty for none) on `css_root` (0 or 1 under the same rule as `path`). Other flag bits
  `ERR_INVALID`. On root 1, a `path` or `css_path` whose first segment is `plugins`, `.paperpaw` or
  `paperpaw.ini` (in any case) is `ERR_INVALID`, as on `core.files` (`files.md` 1.1), and so is
  such a `doc_path.path` of op 20 `format_for` (with or without its sniff). This check comes
  before the `uses.storage` check of root 1, so a plugin without the feature gets `ERR_INVALID`
  for such a path too, not `ERR_DENIED`. The host checks the roots, finds the format, gives a new
  document id and calls the format's op 2 `open`; its answer becomes `doc_state`.
- [D] **Root 5, the handed file.** A reader whose instance was made from a hand-over
  (`ui.md` section 1, op 16) whose params carry `root` (`0` or `2`) and `path` may open that one
  file of the plugin that made the hand-over: `doc_open.root` 5 with the same `path`, read only,
  resolved in that plugin's data folder (`0`) or install folder (`2`) under the storage path
  rules. Another path, a hand-over without these params, an instance not made from a hand-over,
  and `css_root` 5 are `ERR_DENIED`; a maker no longer installed, or no such file, is
  `ERR_NOT_FOUND`. The format reads it as root 3, as any book; it is not a library book (no
  catalog row, position or "recently opened"; its root-6 cache is keyed by the maker's id, root
  and path and goes when the maker is uninstalled). A handed document ends when its maker stops,
  for any reason (stopped, turned off, uninstalled, failed): the opener gets
  `event.document_closed` with `reason` 3 and later calls on the id are `ERR_CANCELLED`, as for
  a book that was removed. A reader instance that holds a handed file may hand it on to its own
  screens (the table of contents): `core.ui` op 16 with `root` `5` and the same `path` (`ui.md` 1);
  the new instance's root 5 is the same file of the same maker, whichever plugin's screen it is. Root 5 exists only in `doc_open`
  (slots 20-26, `core.files` and format calls answer it `ERR_UNSUPPORTED`). A host answers
  `ERR_UNSUPPORTED` until it is wired.
- [D] **Options reach their format whole.** An option's `key` is a full setting id
  (`<plugin>.<name>`) with the book's own value (interface 6 gathers them for every format owner,
  `reading/mod.rs:275`); the host forwards to the chosen format exactly the options of its plugin,
  each as one `fmt.option` record beside `fmt.call` (section 3), none cut and none dropped; options
  of other plugins are not for this format and go nowhere. More than 12 options of one format, or an
  option over its caps, is `ERR_NO_SPACE` for the open (never a silent drop).
- [D] `doc_state`: `document`, `state` (0 ready, 1 preparing, 2 failed), `progress_ppm` while
  preparing, `status` (an `ERR_*` when failed), `format` (the format id), `flags` (bit 0 whole
  pages, bit 1 has a table of contents, bit 2 has XPointers, bit 3 has embedded fonts, bit 4 has
  page labels, bit 5 right-to-left pages, bit 6 the cache was made now, bit 7 some sections are
  whole-page pictures and others are not, #242: each `doc_section` says which; bit 0 stays "every
  section"). A failed open still has an
  id until closed, so the opener can read `status` (and the reader can say "this book is damaged").
- [D] **Preparing**: while `state` is 1, the host calls the format's op 3
  `prepare` again and again from its main loop, between inputs, each call for at most 50 ms of work
  by the format's own clock (the format stops at a safe point and answers its progress), until it
  answers done or fails. The opener gets `event.document_changed` (88: `document`, `state` and
  `progress_ppm`, 0 to 1,000,000, as `doc_state` has them at delivery; one per document, coalesced,
  the latest wins) when the state or the progress moves; other ops on a preparing document are
  `ERR_BUSY`. The X4 runs at most one preparation at a time, queued in open order.
- [D] **A details open may skip preparing** (#245). `doc_open.flags` bit 3 `details` is the host's
  own: the host's background job (covers, book details) may set it, a plugin's `open` with it is
  `ERR_INVALID` (bit 2 `background` says nothing about it: an index build needs blocks). The format
  gets it in `fmt.call.flags` of op 2 and may honour it: it answers `ready` (state 0, no show-only
  `doc_state.flags`) without converting, from what it reads at open (a DOCX's `docProps/core.xml`,
  a MOBI's EXTH header and cover record). Such a document serves op 4 `close`, 5 `meta`, 6
  `meta_text` and 17 `cover` (section 3) and answers every other op `ERR_STATE`; the host never
  calls op 3 `prepare` on it (a format that gets op 3 there answers `ERR_STATE`). It writes no
  converted document to root 6, only the cover picture file op 17 names. A format may also ignore
  the bit and open as usual; an answer of preparing to a `details` open is never prepared: the
  host closes the document (op 4) and keeps no details. A `details` open neither makes the
  `.complete` stamp nor removes an unstamped root 6, whatever the format answered (a cache
  finished before keeps its stamp): it reads what is there, so the cover picture it made survives
  the next `details` open. In an unstamped root 6 the format reads only that cover picture file
  (which may be from a half-made conversion: the host checks it as any cached picture, section 5)
  and nothing else. Only an open without `details` removes an unstamped root 6 (the cover goes
  with it) and prepares. A `details` open is `ERR_BUSY` while any other document of the same book
  and format plugin is preparing, whatever its conversion (a `details` open's key rarely matches a
  reader's: sides, CSS and options differ). A `details` open never removes another conversion of
  the book (it makes no room); an open without `details` that needs room removes the book's
  unstamped folders (a `details` open's cover file, a half-made conversion) before its finished
  ones, oldest first. Bits 2 and 3 of a `details` open are not part of its conversion key. A
  `details` document is the host job's alone: any other open closes it first and is
  a new open, prepared as usual. Bit 3 may come with bit 2 `background`. The host sets the bit on
  its own opens of a book for details and covers (the book-details job, the library's cover job
  and the library list's inline cover open, `library.md` op 7 `cover`), and only for a format whose
  `format.spec` has bit 0 `prepared`; it opens other formats as before (bit 2 at most), and their
  caches are stamped as usual. Where root 6 holds a stamped cache, a `details` open is still a
  `details` document (ops 4, 5, 6 and 17 only); the format may read that cache for them.
- [D] **A preparation that does not move fails.** After 32 answers in a row of state 1 whose
  `progress_ppm` is not higher than the highest one this preparation gave (equal or lower counts),
  the host fails the document with `ERR_TIMEOUT`, exactly as if the format had answered failed:
  the partial cache goes, `doc_state` is state 2 with that status and the opener gets event 88.
  The count starts at 0 with each preparation and goes back to 0 at every answer that moves the
  progress. Since the progress only rises and stops at 1,000,000, a format cannot keep the main
  loop busy for ever (at most 32 calls of 50 ms without movement). Idle sleep is no bound: a
  device on USB power never sleeps.
- [D] **The cache is whole or not used.** A cache is made for one **conversion**: the book's
  identity (LIB's fingerprint), the format plugin's id and version, and the conversion key, a hash
  of everything that changes the output (publisher styles, colour, `image_side`, `cover_side`, the
  CSS file's content hash, the forwarded options), interface 6 `prepared_keeping` and `PreparedCss`.
  Root 6 is `.paperpaw/cache/<book key>/<format plugin>/<conversion key>/`; the host keeps at most
  two conversions per book (the older goes, but never one an open document uses: a conversion is
  **pinned** while any document of it is open, on any plugin; a third conversion needed while two
  are pinned waits, the open answers `ERR_BUSY`, and nothing an open document reads is removed
  under it), and `doc_state.conversion` (a `u64`) names it, which
  LIB stores with positions and annotations (`library.md` 2.2). The host writes `.complete` (the
  stamp of those inputs) after the format answers done and the card is synced; a cache without a
  current stamp (power cut, card pulled, a new format version, other options) is removed and made
  again, so the format never sees a half-made or stale cache as finished.
- [D] `close` frees the id; the format gets op 4 `close` (its state for it goes) and every image id
  of the document (section 5) ends. The host closes the opener's documents when the opener stops,
  and closes a format's documents when the format plugin stops or is uninstalled: the opener gets
  `event.document_closed` (108: `document`, `reason` 1 the format stopped, 2 the card went, 3 the
  book was moved or removed (for root 5: its maker stopped), 4 `needed`: the place went to a book to
  show, below; others treated as 1) and every later call on the id is `ERR_CANCELLED` until it
  closes it. A reply the format produces after that is never delivered (it is not called again).
- [D] Limits: at most 2 open documents per opener and 2 on the X4 device-wide (the shown book and a
  background index), 8 elsewhere; over that `ERR_FULL`. On the X4 the cap is in effect 1 per
  opener, so no one plugin can take both places.
- [D] **A book to show always gets a place.** An `open` without `flags` bit 2 `background` from
  the plugin whose screen is showing, when the device-wide places are full, takes the place of
  another opener's document: first one opened with `background`, else one whose opener shows no
  screen, the oldest first. That document is closed as by `close` (the format gets op 4, its
  image ids end) and its opener gets `event.document_closed` with `reason` 4 `needed`; later calls
  on its id are `ERR_CANCELLED`. The shown book itself is never taken. Only when no document can
  be taken (the opener's own cap) is the `open` `ERR_FULL`. An index build that lost its place
  starts again later (the library's walk tries it again). The host's own background job (covers,
  book details) is no opener: it takes one device-wide place but no opener's cap, is the first
  document a book to show takes, gets no `document_closed`, and starts again later.

### 2.2 Metadata

- [D] `doc_meta`: `title: str 512`, `language: str 35`, `series: str 512`,
  `series_index: str 32`, `direction` (0 left to right, 1 right to left), `writing_mode` (0
  horizontal, 1 vertical right to left, 2 vertical left to right, 3 and 4 sideways, section 4),
  `sections`, `authors`, `subjects` (their counts, no cap), `description_bytes`, `flags` (bit 0 the
  title was cut, bit 1 the series). Op 3 answers `doc_meta` alone. Op 4 (`doc_text_at`: `document`,
  `kind` 0 title, 1 author, 2 subject, 3 description, 4 series; `index` below the count, else
  `ERR_NOT_FOUND`; `offset`) answers one `doc_text` (`kind`, `index`, `total` its whole length,
  `text` at most 1,024 bytes from `offset`, cut at a UTF-8 boundary): an opener lists every author
  and subject by index and reads any text whole by offsets. Nothing is cut for good and nothing is
  left out.

### 2.3 Navigation and links

- [D] Positions are `doc_at` (`document`, `section`, `offset`, `insert`; `insert` always 0 here, the
  N5 locator's ordinal belongs to the reader's inserted content). `section` past the end
  `ERR_NOT_FOUND`; an offset past a section's end is the end.
- [D] `sections` rows `doc_section` (`index`, `length` in source units for progress, `flags` bit 0 a
  whole-page picture: a reader shows that section as a page picture, the others reflowed, where
  `doc_state` bit 7 says the sections differ, #242). Op 17 `progress` answers `progress_ppm` (0-1,000,000) where the format
  computes it itself (interface 6 `Document::progress`, EPUB and TXT); elsewhere `ERR_UNSUPPORTED`
  and the reader computes it from the section lengths (N5 rule 1).
- [D] `toc` rows `doc_toc` (`index`, `level` 0-15, `section`, `offset`, `flags` bit 0 approximate:
  `toc_target` finds the exact place, `title: str 512`, cut at a UTF-8 boundary with bit 1). Up to
  10,000 entries (FB2) in pages; the reader shows the first 500.
- [D] `links` (`doc_span`: `document`, `section`, `from`, `to`, `cursor`, `generation`) rows
  `doc_link` (`start`, `end`, `kind` 0 internal, 1 external, 2 footnote, `href: str 1024`). An
  `href` over 1,024 bytes is not listed (logged); `link_target` resolves one inside the book.
- [D] `page_label` (`doc_label: str 32`), `xpointer` and `locate` (`doc_xpointer`: `document`,
  `text: str 1024`) as interface 6 (KOReader XPointers for EPUB, for koreader and kosync).

### 2.4 The reader report (op 22, draft 37)

The reader tells the host where the user is reading; the host turns it into the book events
(`core-events.md` 3.1: 37 and 65-67), so no plugin raises them itself.

- [D] **The report.** Op 22 `report` (`doc_report`): `document` (an id the caller opened),
  `section`, `offset`, `insert` (the page's start, the N5 locator of `screens-input.md` 9),
  `progress_ppm` (0 to 1,000,000, N5 rule 1), `flags` (bit 0 `finished`: the user reached the end,
  interface 6 `BOOK_FINISHED`; other bits `ERR_INVALID`), `title` (the book's display title, cut
  by the reader at a UTF-8 boundary), `chapter` (the title of the table-of-contents entry the page
  is in; empty where the book has none or the page comes before its first entry), and optionally
  `page` and `pages` (counted from 1, both or neither) and `chapter_left` (the pages after this one
  in that chapter, 0 on its last page; only with `page` and `pages`, and with a `chapter` the
  reader knows the end of). The reply is empty; the status is the call's.
- [D] **Checks** (`ERR_INVALID`, nothing raised, the session as it was): `progress_ppm` above
  1,000,000; `page` without `pages` or the reverse, a `page` of 0 or past `pages`; `chapter_left`
  without `page` and `pages`, with an empty `chapter` (no chapter to count down), or above
  `pages - page`; `section` not below the document's section
  count; an unknown `flags` bit. Another plugin's document is `ERR_DENIED`, a closed one
  `ERR_CANCELLED` (section 2.1). Text that is not UTF-8 is `ERR_UTF8`.
- [D] **Which documents.** Only a book of the library raises book events: a document opened on
  root 1 without `flags` bit 2 `background`. A report on any other document (root 0 or 5, an index
  build) is accepted (`OK`) and raises nothing, so a reader reports every document the same way.
- [D] **Only the reader on screen.** A report drives the session only when the caller declared a
  `reader.spec` and owns the topmost screen of the stack that is not an overlay, and the document
  is one it opened as a library book. Any other report, from a
  plugin that opened a book from the card to index or read it in the background, or from a reader
  that is not on top, passes the checks above and is `OK` with nothing raised: it never starts,
  replaces, advances or ends the live session, so it cannot close the user's book or raise
  `book_finished` (Senior's S1). The host tests that another plugin's report leaves the live
  session as it was.
- [D] **The session.** The host keeps one reading session device-wide: the reported document, its
  `doc_open.path`, the last raised report and whether `finished` was raised. The first accepted
  report of a document starts a session and raises `book_opened` (65) with its fields; a session
  of another document ends first with `book_closed` (66, `reason` 0), so the old book's close
  comes before the new book's open (`core-events.md` 3.3). A later report raises `page_turned`
  (37) when any of `section`, `offset`, `insert`, `progress_ppm`, `chapter`, `page`, `pages` or
  `chapter_left` differs from the last raised one; an identical report raises nothing, so a
  repeat is free. `finished` raises `book_finished` (67) once per session, after the report's 37
  where there is one; later `finished` reports raise nothing more.
- [D] **Ending.** The session ends with `book_closed` (66, `reason` 0, the last raised fields)
  when its document is closed (op 18, the opener stopping, or the host closing it with
  `event.document_closed`). Sleep and power-off end it with `reason` 1 before `event.suspend` or
  `event.stopping`, as `core-events.md` 3.3 orders them. After a wake within the same run, the
  first report of the same book (same `doc_open.path`) starts a session with `book_opened`
  `reason` 1; after a restart the host keeps no session, so it starts with `reason` 0.
- [D] **The host stamps** `now_ms` (its monotonic clock), `path` (the session's `doc_open.path`,
  at most 512 bytes as root-1 paths are, so never cut) and `reason`; it never takes them from the
  plugin.
- [D] **When the reader reports:** when a book's first page is shown, at every page turn and
  jump, when it has counted the pages (the counters appear), and when the user reaches the end
  (`finished`). Not on every redraw.
- [D] **Memory and cost:** the session is one host record of the last raised fields (the path
  and the two texts at most 1,024 bytes together, about 1.1 KiB on the X4 while a book is open),
  allocated fallibly once at its full size when the session starts, so a later chapter or title
  change never grows it (`ERR_NO_MEMORY`: nothing raised for the new book, the next report tries
  again; when the report was another book's, the old session has still been ended with its
  `book_closed` first) and freed when it ends. One call per page turn, at most 1,024 bytes of
  input; the events go through the event queue as before (`core-events.md` 3.2). While the event
  pump is behind, up to 8 book events wait in the queue (`core-events.md` 3.2), about 1.1 KiB
  each: about 9 KiB at most on the X4, freed as they are delivered.
- [D] Until the native reader reports, 37 keeps its interface-6 producer (`core-events.md` 3.1).
  A host answers `ERR_UNSUPPORTED` until it is wired.

## 3. The stage `core.format` (major 1)

A host-defined stage (generated stage schema, `abi/stages/core.format@1.def`, stage-local tags;
spec `/home/agent/shared/stage-schemas-spec-228.md`). The host calls the one format plugin that
serves the document, with the `token` of its `format.spec`; nobody else subscribes. Each call's
input is one `fmt.call` record (`op`, `document`, `section`, `offset`, `index`, `cursor`,
`generation`, `flags`, `image_side`, `cover_side`, `conversion: u64`, `text: str 1024`, `arg: bytes
512`) followed, for op 2 only, by the forwarded `fmt.option` records (at most 12: key 64, value 128
bytes); the reply is the op's records (local tags), the same records as the service's rows, so the
host passes them on after checking them.

| Op | Name and input | Rows of the reply | Roots |
| --- | --- | --- | --- |
| 1 | `sniff` (`arg`: the file's first at most 512 bytes; with `flags` bit 0 `claimed`, section 1's handing on: `arg` empty, `document` set) | `fmt.yes` (or none: not mine) | none (`claimed`: 3) |
| 2 | `open` (`flags`, sides, `conversion`; `fmt.option`*) | `doc_state` | 2, 3, 4 |
| 3 | `prepare` | `doc_state` (`progress_ppm`; `state` 0 done, 1 more, 2 failed) | 2, 3, 4 |
| 4 | `close` | none | none |
| 5 | `meta` | `doc_meta` | 2, 3 |
| 6 | `meta_text` (`index`, `flags` the kind, `offset`) | `doc_text` | 2, 3 |
| 7 | `sections` (`cursor`) | `doc_section`*, `end` | 2, 3 |
| 8 | `block` (`section`, `offset`, `cursor`, `generation`) | the block stream (section 4) | 2, 3 |
| 9 | `toc` (`cursor`) | `doc_toc`*, `end` | 2, 3 |
| 10 | `toc_target` (`index`) | `doc_at` | 2, 3 |
| 11 | `page_label` (`section`, `offset`) | `doc_label` | 2, 3 |
| 12 | `xpointer` (`section`, `offset`) | `doc_xpointer` | 2, 3 |
| 13 | `locate` (`text`: the XPointer) | `doc_at` | 2, 3 |
| 14 | `links` (`section`, `offset` from, `index` to, `cursor`) | `doc_link`*, `end` | 2, 3 |
| 15 | `link_target` (`text`: the href) | `doc_at` | 2, 3 |
| 16 | `fonts` (`cursor`) | `doc_font`*, `end` | 2, 3 |
| 17 | `cover` (`cover_side`) | `fmt.image` | 2, 3 |
| 18 | `image` (`index` the image, `image_side`) | `fmt.image` | 2, 3 |
| 19 | `progress` (`section`, `offset`) | `doc_progress` | 2, 3 |

- [D] **Picture sides are the host's.** A format never asks for the screen and never sees a side
  of 0: in `open` the host turns a `cover_side` of 0 into its default (the larger of 300 and 3/8
  of the screen's long side, at most that side) and an `image_side` of 0 into the screen's long
  side, at most 1,600, **before** the conversion key is made, so an open with 0 and one with the
  same sides spelled out share one cache; ops 2, 17 and 18 always carry both sides, set by the
  host.
- [D] **Paged replies** (ops 7, 9, 14, 16): whole rows, then exactly one `fmt.end` (the
  `service.end` row), the paging of `registry.md` 2.1: `flags` bit 0 the last page, `next` the
  `cursor` of the next call, `total` the rows of the whole list, `generation` the format's own for
  this document (never 0; a call whose `generation` is not it is `ERR_STATE`, start again at 0).
  The host forwards `cursor` and `generation` as the caller gave them. Op 8's blocks end as
  section 4 says (bit 1 `more`).
- [D] Service ops map one to one: 3 → 5, 4 → 6, 5 → 7, 6 → 8, 7 → 9, 8 → 10, 9 → 11, 10 → 12, 11 →
  13, 12 → 14, 13 → 15, 14 → 16, 15 → 17, 16 → 18, 17 → 19; ops 1, 2, 18-21 of the service are the
  host's own (open, state, close, formats, readers). Sizes: `fmt.call` 1 + 10×4 + 8 + 1,026 + 514 +
  3 = 1,592 framed (`abi/stages/core.format@1.def`), with 12 options 4,016: over the 3,840 payload,
  so op 2 carries `arg` empty and `text` empty except for a `siblings` format, where it names the
  opened file within the book's folder (at most 255 bytes, a FAT name: 1,592 − 512 − 1,024 + 257 +
  2,424 = 2,737, within 3,840). Every later call of that document carries the same name in `text`
  where the op uses no other `text` (ops 13 and 15 name their XPointer or href instead; the host
  keeps the name with the document).

- [D] **Roots** (the reserved roots of D2.2, valid only inside a call for that document): root 6 the
  document's cache for its conversion (section 2.1; read and write; the book key is LIB's, so the
  cache follows the book on a move and goes with it, LIB), root 3 the book (read only: `path` "" is
  the file; for a `folder` format the folder and below; for a `siblings` format the book's folder
  and below, the call's `text` naming the opened file within it), root 4 the user CSS file (read
  only, `path` "", during op 2 and 3 only). These three outside such a call are `ERR_UNSUPPORTED`;
  roots 0-2 keep their meaning in every callback (`files.md`). The format writes its cache
  atomically per file (D2.5); it may not write root 3.
- [D] **Root 3 through the slots and through `core.files`** (Files on #499): for a single-file
  format, root 3 is read with the storage slots (`storage_size`, `storage_read_at`; `path` "" is
  the file), and `core.files` `list`/`stat` on it are `ERR_UNSUPPORTED`. For a `folder` or
  `siblings` format, `core.files` `list` and `stat` work on root 3 inside its `core.format` call.
  The scope is checked first: root 3 outside such a call is `ERR_UNSUPPORTED` for every op;
  inside it, every op that changes something is `ERR_DENIED`.
- [D] **Root numbers mean one thing everywhere** (Code Reviewer on #346): root 2 is the plugin's
  own install folder (`files.md` section 1.1) in every callback, a format's too; the document's
  cache is root 6, not 2.
- [D] **Paths in roots 3, 4 and 6** follow the storage slots' rules: relative only; no `..`, `\`,
  NUL, empty segments or a leading `/` (`ERR_INVALID`); resolved strictly below the root, a link or
  a name that resolves outside it `ERR_DENIED`. In root 6 the name `.complete` (the host's stamp)
  and everything under `.host/` are host-reserved: a format's write, rename or delete of them is
  `ERR_DENIED`, a read of them `ERR_NOT_FOUND`. Root 3 refuses every write and delete
  (`ERR_DENIED`).
- [D] **Cache quota.** A document's cache is counted to the format plugin (S7) and capped at 64 MiB
  per book on the X4 (an EPUB with large images; `ERR_NO_SPACE` beyond and on a full card, the
  preparation fails with that status and the host removes the partial cache).
- [D] **Depth and stack.** The opener's call is depth 1 and the format's callback depth 2: the
  format cannot call `stage.run` or `core.document` (`ERR_BUSY`). On the X4 the format callback
  joins the nested-callback frame budget and stack gate of slot 35 (`ui.md` 5.1) with its own
  high-water case (EPUB `block` at a long chapter). Senior's answer: the X4 has no fallback mode
  (answering depth-2 ops from the cache would need a host-known cache format, which does not
  exist); **the stack gate (G7/G8 measurement) must pass before the reader port starts on the X4**,
  and it is a prerequisite item on the device checklist.
- [D] **Failures.** A format callback that fails, answers malformed rows or rows of another op is a
  failed call: the service op answers `ERR_IO` for a card error, `ERR_INVALID` for a malformed
  answer, else the format's status (logged with the format's id). Three malformed answers in a row
  close the document (reason 1). The format never panics the host; a fault is the plugin's fault
  (STG rules).
- [D] **Time.** `block` runs on every page laid out: its time counts against the reader's X4
  page-turn budget (timing gate of the reader port). A format answers op 6 from its cache, not by
  parsing the book again.

## 4. Blocks on the wire

The interface-6 `Block` (`paperpaw-document`), whole: every field has a record, and nothing a format
says is dropped. A block is a **record list** (header, text parts, runs, maps, columns, cells,
rubies, languages, image) that the format's SDK writer makes from the block deterministically. It
travels in **fragments** of at most 3,840 bytes (the stage payload), cut only between records, never
inside one: the logical block, its paragraph and its table row are never split or changed because a
reply filled up (no flattening, no `continues` invented by the transport). The first call answers
fragment 0; `service.end.flags` bit 1 `more` says the block goes on, with `next` the record index to
ask from and `generation` the block's identity (a hash of section, start and the conversion); the
opener asks op 6 again with `doc_at.cursor` = `next` and that generation (the format makes the same
list again from its cache and answers from that record on). A changed generation is `ERR_STATE`.
The reader joins the fragments into one block. `continues`/`continued` keep only their interface-6
meaning (the format's own split of a very long paragraph).

| Tag | Record | Fields |
| --- | --- | --- |
| 1082 | `service.doc_block` | `kind: u32`, `level: u32`, `flags: u32`, `start: u32`, `end: u32`, `align: u32`, `indent: i32`, `space: u32`, `size: u32`, `margin_start: u32`, `margin_end: u32`, `line_height: u32`, `dir: u32`, `writing_mode: u32`, `lang: str 35`, `drop_cap: u32`, `text_bytes: u32` |
| 1090 | `service.doc_text_part` | `text: str 3072` |
| 1091 | `service.doc_columns` | `weights: bytes 32` |
| 1083 | `service.doc_run` | `start: u32`, `end: u32`, `style: u32` |
| 1084 | `service.doc_map` | `text: u32`, `source: u32` |
| 1085 | `service.doc_cell` | `end: u32`, `span: u32`, `rows: u32`, `align: u32`, `vertical: u32`, `width: u32` |
| 1086 | `service.doc_ruby` | `start: u32`, `end: u32`, `kind: u32`, `size: u32`, `text: str 1024` |
| 1087 | `service.doc_inline_lang` | `lang: str 35` |

- [D] Order of the list: one `doc_block` (`text_bytes` the text's whole length), the text in
  `doc_text_part`s (each at most 3,072 bytes, cut at UTF-8 boundaries, joined in order to
  `text_bytes`), its `doc_run`s (sorted, not overlapping), `doc_map`s (the `OffsetMap` checkpoints),
  for an image block at most one `doc_image` (section 5: a picture that fails the image check is
  left out and the block keeps its alt text, never `ERR_INVALID`), for a table row one
  `doc_columns` (interface 6 `TableRow.columns`: up to 16 `u16` weights shared by the table's
  rows, little-endian) and its `doc_cell`s (at most 16, `MAX_COLUMNS`; `flags` bits 8-10 header,
  first, last row), its `doc_ruby`s and up to 15 `doc_inline_lang`s (`MAX_INLINE_LANGS`); the last
  fragment ends with `service.end` (`flags` bit 0: the last block of the section; `next` the offset
  of the next block).
  Runs, maps and rubies have no count cap (interface 6 has none); every record fits a fragment.
  Another order, an unknown record or a text whose parts do not add up is `ERR_INVALID` (the host
  checks the format's answer).
- [D] `kind`: 0 paragraph, 1 heading (`level` 1-6), 2 preformatted, 3 image, 4 table row, 5+n
  `Extended(n)`; `flags` bit 0 continues, bit 1 continued; `indent`, `space`, `size`, `line_height`:
  `i32::MIN` / `u32::MAX` for "the reader's"; `style` the interface-6
  `TextStyle` bits unchanged (they are already a stable `u32`); `lang` a BCP 47 tag, empty for
  unknown.
- [D] **Direction, writing mode, language** (interface 6 `Block.dir`, `writing_mode`, `lang`,
  `inline_langs`; the SDK's `lang::Direction`, `lang::WritingMode`, `Lang`): `dir` 0 auto (the first
  strong letter, UAX #9 P2/P3), 1 left to right, 2 right to left; `writing_mode` 0 horizontal top to
  bottom, 1 vertical right to left, 2 vertical left to right, 3 sideways right to left, 4 sideways
  left to right (`doc_meta.writing_mode` uses the same numbers). A later value the reader does not
  know reads as 0 (auto, horizontal), never an error, so a newer format still opens in an older
  reader; the reader lays out horizontal lines only, as interface 6. `lang` is interface 6's
  `Block.lang` as a BCP 47 tag (language, script, region; `Lang`'s text form): the element's own
  (`lang`, `xml:lang`, inherited), else the book's (`doc_meta.language`), as the format resolves it;
  empty only when neither is known (`Lang::NONE`). The `doc_inline_lang`s are `inline_langs` in
  order: a run's `TextStyle::lang_index` n names the n-th (from 1), 0 the block's `lang`; an index
  past the list reads as the block's `lang`.
- [D] **Annotations** (`doc_ruby`, interface 6 `Annotation`, now re-exported as
  `paperpaw_sdk::document::{Annotation, AnnotationKind}`): `kind` 0 ruby, 1 phonetic, 2 gloss, 3+n
  `Other(n)` (n at most 65,535); a value the reader does not know reads as a gloss, as
  `AnnotationKind::Other` says. `size` is the percent of the text below, 0 for the reader's. A
  footnote or note text is **not** an annotation: it stays a link to its target (`doc_link`, section
  2.3) as in interface 6; a format sends a gloss only for a text meant to stand above the words.
- [D] Inserted blocks and `leading_above` are the reader's (its text filters, #964); formats answer
  none, as in interface 6.

### 4.1 Foreign elements and the conversion hook (`core.convert`, draft 37, #429)

A format that does not convert an element itself hands it on, so that another plugin can (MathML in an
EPUB: `format-epub` writes the `<math>` and `format-epub-plus` converts it). Nothing is added to the
record list: a **foreign element** is a `doc_ruby` of `kind` `3 + 0xFFF0` (65,523; the SDK's
`Annotation::foreign`, `Annotation::FOREIGN`) over `start..end`, the range of the block's text the
format wrote for the element **without help** (the formula's `alttext`, else the text of its leaves), and
`text` the element's markup (at most 1,000 bytes: its start tag with the attributes that matter and no
namespaces, its content, its end tag; text escaped; an element that would be longer is not handed on). The
block is complete in one fragment (a format that cannot keep it so leaves the element to its text).

At the call level of the format's own (no deeper: the format has answered), the host replaces every
foreign element of a block that goes no further, in order, at most eight a block: it asks the plugins
that subscribe to the host-defined stage `core.convert@1` (`registration.stage`, at most 4 on a device,
in stage order) with one `conv.ask` (`element` the markup's element name, `flags` 0, `markup`), and the
first `conv.text` with a non-empty `text` (at most 2,048 bytes; `\n` breaks a line) is put where the
format's text was: the block's `text_bytes`, text parts, runs, maps, cells and annotations after it move
with it, a place inside the replaced range goes to its start (the end of a range to the end of the new
text). The foreign records are **never** passed on to the opener. Where there is no subscriber, it fails
or is not made yet (it is asked to start; the block is passed on with the format's text, the next
layout has the hook), says nothing, or the block would not fit a fragment (3,840 bytes) after it, the
format's text stays: a book reads without the hook plugin, with the plain text of the element. A
foreign element in a fragment of a block that goes on, or whose range does not fit its text, is left
out the same way. A subscriber never sees the book, the card or the document: only the markup.

SDK: `native::convert` (`Asked::decode`, `Converted::text`/`pass`/`encode`). The stage's key, bounds
and records: `abi/stages/core.convert@1.def`. A plugin of draft 36 runs unchanged; so does a format that
writes no foreign element.

## 5. Images (IMG, N6)

Pictures of books (covers, illustrations, comic pages) and the pictures plugins show (picture-home,
sleep): the host keeps decoded images on the card in the `paperpaw-image` gray (or colour) format
and draws them in bands, so no plugin holds a picture in memory.

```
image.info(ctx, image: u32, out: buffer) -> i32                                   // slot 36
canvas.draw_image(ctx, image: u32, x: i32, y: i32, width: u32, height: u32, flags: u32) -> i32
                                                                                   // slot 37
```

canvas.draw_image_part(ctx, image: u32, source: bytes, x: i32, y: i32, width: u32, height: u32,
                       flags: u32) -> i32                                          // slot 44
```

Slots 36 and 37 come with draft 25; a host answers `ERR_UNSUPPORTED` until it draws images. Slot 44
comes with the interface round of Beta 4 (#369): a host table that ends before it has no part draw,
and the SDK answers `Unsupported` there.

```

| Tag | Record | Fields |
| --- | --- | --- |
| 1088 | `service.doc_image` | `image: u32`, `index: u32`, `width: u32`, `height: u32`, `flags: u32` |
| 1089 | `service.doc_image_ask` | `document: u32`, `index: u32`, `side: u32`; optional `flags: u32` (ordinal 0, default 0) |
| 1559 | `command.image_prepare` | `root: u32`, `path: str 512`, `side: u32`, `cookie: u32`, `flags: u32`, `tone: bytes 256` |
| 1560 | `command.image_release` | `image: u32` |
| 90 | `event.image_ready` | `now_ms: u64`, `cookie: u32`, `status: u32`, `image: u32`, `width: u32`, `height: u32`; optional `luma: bytes 64` (ordinal 0) |
| 108 | `event.document_closed` | `now_ms: u64`, `document: u32`, `reason: u32` |
| 88 | `event.document_changed` | `now_ms: u64`, `document: u32`, `state: u32`, `progress_ppm: u32` |

- [D] `event.document_closed` was named 89 in earlier drafts, which is `event.spoken` (`ui.md`); it
  is 108 and comes with the draft-20 records. It comes from the host's document table (2 or 8 per
  device), never from the held-event store, so it is never dropped. The table keeps room for 2
  undelivered document events per place: one 108 and one 88 (coalesced, so at most one per
  document; its producer takes it from this room when it lands); while those of earlier
  documents still fill it (their openers have not taken them yet), `open` answers `ERR_BUSY` and
  opens nothing: the caller tries again at a later pass (Senior R1 on #919).

- [D] An **image id** (`u32`, checked counter, never 0) names a decoded picture the host may draw. A
  document's images come from `doc_image` rows (a block's picture, the cover, op 16's larger one)
  and end with the document; a plugin's own come from `image_prepare` and end with `image_release`
  or when the plugin stops. Image ids are per plugin: another plugin's id is `ERR_NOT_FOUND`.
- [D] A format answers a picture as its cache path (stage-local `fmt.image`: `path: str 256` in root
  6, `index: u32`, `width`, `height`, `flags` bit 0 not decoded yet, bit 1 a whole page: the
  picture of a whole-page section of a book whose sections differ, which the picture stage is
  asked about as a comic's page, place 1, #242); the host turns it into an
  image id for the opener. **Two names:** the image id is only a drawing handle and may end; `index`
  is the format's own number of the picture in the document (op 18's `index`; `u32::MAX` the cover),
  stable for the document's life, and `doc_image` carries it on, so the reader can always ask again.
  **Translation:** in a block stream (op 8) and in ops 17 and 18 the host replaces each `fmt.image`
  by a `doc_image` for the opener: it checks the path (root 6 rules, the cache file's header against
  `width`/`height`, section 5's hostile-input rule), gives the picture an image id of the opener (or
  the id it already has for that path in this document), and passes `width` and `height` on;
  `doc_image.flags` (the same bits as `image.info`'s) is bit 0 colour, set when the cache file's
  header says the picture is in colour (the header is read for the check anyway; never on a screen
  without colour), and bit 1 not decoded yet, `fmt.image`'s bit 0. Other `fmt.image` bits are
  dropped, not refused: it is a format's reply row, so a bit a newer format sets must not cost an
  older host the picture (requests to the host keep refusing unknown bits). A `fmt.image` that
  fails the check becomes no `doc_image` (the block keeps its alt text, counted as a failed read)
  and never fails the whole stream. A picture **not decoded yet** (`fmt.image` bit 0) has no cache
  file to check: where its file is not there or not vouched for, the host checks only its path and
  its size (`width` and `height` 1 to 1,600, the size it will decode to) and passes it on with
  `image` 0 (no id) and bit 1, so the reader keeps a box of that size and asks op 16 by `index`
  (the decoded answer is checked as above).
  Over the 8 image ids per plugin, the host ends the opener's least recently drawn document image
  first, so a long chapter of pictures
  never runs out (`ERR_NOT_FOUND` at a draw of an ended id: the reader asks again with op 16 by the
  picture's `index`; the host keeps nothing for an ended id). An id handed out is never ended before
  it has been drawn once, and that protection ends at the opener's next drawn frame that does not
  use it (an abandoned page or a prefetch never pins ids) or at `image_release`, which a reader may
  also send for a document image it no longer wants: with all 8 handed out and none drawn yet, a
  ninth is `ERR_BUSY` for that picture (in a block stream its `doc_image` comes with `image` 0, no
  id yet, and its `index`; the reader asks with op 16 after drawing), so a page with more than 8
  pictures is drawn picture by picture (ask, draw, next) and never loops. Op 16 (`doc_image_ask`:
  `index`, `side` 0 for the page's size, else the longest side for a zoom, at most 1,600) has the
  format decode that picture now (op 18 with `index`, or op 17 for the cover; interface 6
  `prepare_image`, `prepare_image_larger`): a new image id, or the live one where nothing was to do.
- [D] `image_prepare` decodes a JPEG (baseline and progressive), PNG (not interlaced) or GIF
  (first frame) of the caller's root 0, root 1 (`uses.storage`) or root 2 (its own install folder,
  read-only, no feature; a built-in plugin's is empty, so `status` 6) into the host's image cache at
  most `side` pixels on the longest side (0: the screen's), in the background: **one request per
  main-loop turn**, decoded to completion in that turn (the `paperpaw-image` decoders cannot pause;
  interface 6 prepared pictures the same way), never inside a plugin callback, so a waiting input
  is handled before the next request starts. A request is bounded by the caps below (8 Mpx source,
  `side` at most 1,600); its time on the X4 is a measured gate (a 1,600-pixel PNG), and a
  resumable decoder replaces this rule if it fails. A `side` above 1,600 is clamped to 1,600, not
  refused (`image_prepare` and op 16 alike); `event.image_ready` reports the width and height
  actually made. `event.image_ready` (to the
  caller only) tells `status` 0 ready, 1 unsupported (also BMP, which no first-party plugin
  prepares, interlaced PNG and WebP: the image crate has no decoder for them; WebP joins the list
  once one exists, with its own fuzz target), 2 damaged, 3 too large (over 8 Mpx source, `XTC` and
  decoder caps; `paperpaw_image::ImageError::TooLarge`), 4 card failure (`ERR_IO`, no card or
  full), 5 not enough memory now (`ERR_NO_MEMORY`, try again later), 6 not found (no such file on
  that root, every root alike; an older SDK reads it as 2). Unknown values read as 2. There is no
  prepare from bytes: a plugin writes them to a file in root 0 first. At
  most 4 waiting per plugin (`ERR_FULL`), 8 prepared images per plugin. `flags` bit 0 colour
  (where the screen has it), bit 1 `turn`, bit 2 `see-through` (PNG/GIF keep their transparency:
  gray plus opacity, colour ignored; a JPEG stays opaque), bit 3 `turned` (#369, below); other
  bits are `ERR_UNSUPPORTED`.
- [D] **The picture recipe** (picture-home): `image_prepare` carries what a plugin needs to make
  its picture the way it shows it, so it never reads one into memory.
  - **`turn`** (`flags` bit 1): the host applies a JPEG's EXIF orientation (tag 0x0112, 2 to 8, read
    from the first APP1 block; no block, a bad one or 1 leave the picture as it is) while it makes
    the picture: the decoder writes the cache file, then the host writes it again turned (a mirror
    or half turn row by row, a quarter turn in tiles of whole columns, at most **32 KiB** of tile on
    the X4 and 1 MiB elsewhere, after the decoder has freed its state), and removes the first file;
    a file left by a power cut is not named like a prepared image and the boot sweep removes it. A
    quarter turn reads the source `height × ceil(width / columns)` times in short pieces and runs in
    one main-loop turn, so on the X4 one that needs more than **16,384** reads (a 4:3 picture of about
    1,000 pixels the long side; the screen's 800 pixels need about 9,000) is status 3 (too large)
    and nothing is turned; ask for the screen's side (`side` 0) with `turn` on the X4. Its time
    below the budget is a measured gate (#250). `event.image_ready` reports the size **after** the turn, `side`
    limits the longest side before and after alike. PNG and GIF are never turned.
  - **`see-through`** (`flags` bit 2): a PNG's or GIF's transparency is kept: the picture is made
    in gray with how opaque each pixel is (two bytes a pixel on the card, never colour: bit 0 is
    then ignored), and `canvas.draw_image` blends it over what is below (a sleep picture over the
    page). A JPEG has none and is made as without the bit; `tone` maps the gray, not the opacity,
    and `luma` is the gray's, the opacity not counted. The decode's peak is unchanged.
  - **`tone: bytes 256`**, empty for none, else exactly 256 bytes (`ERR_INVALID` otherwise): a luma
    table the host applies while it decodes: every gray value `v` becomes `tone[v]`, and for
    a colour picture every channel. The host defines no brightness or contrast: the plugin's table
    is the whole curve. A waiting request keeps its table (256 bytes, up to 4 a plugin).
  - **`luma`** of `event.image_ready` (optional, 64 bytes, only with `status` 0): the mean
    brightness, 0 to 255, of an 8 by 8 grid over the prepared picture, row by row (cells of equal
    size, a picture under 8 pixels a side takes the pixel at each cell; colour as luma), after the
    tone and the turn. The host reads the file once more, a row at a time, so the plugin finds the
    brightness behind any rectangle without reading the picture. It is made for every picture that
    is made, asked for or not: a second read of the file (one row at a time) a little over the
    decode's own write, in the same main-loop turn.
- [D] **`turned`: a picture kept turned a quarter clockwise** (#92, #369), for a wide picture on
  a tall screen. Turning at a draw would read a column of a row-major file for every screen row
  (thousands of short card reads a draw), so the turn is made **once, when the picture is made**,
  and every draw of it is the ordinary row-by-row draw.
  - `image_prepare.flags` bit 3 `turned`: any format; after `turn` (a JPEG's EXIF orientation and
    the quarter are one pass over the file, the same pass, tiles and limits as `turn`: on the X4
    at most 16,384 short reads, else status 3). `event.image_ready` reports the turned size. A
    host older than the bit answers `ERR_UNSUPPORTED`, as for any bit it does not know.
  - `doc_image_ask.flags` (op 16; appended, optional, default 0) bit 0 `turned`: after the format
    decoded the picture at `side`, the host turns its cache file into a file of the host's own
    image cache and answers that picture: `doc_image` with a new image id, the **turned** width
    and height, the picture's `index`, and `flags` bit 2 `turned` (bit 0 colour as ever). The bit
    is only ever set in the answer to an ask that set bit 0, so a reader built before it never
    sees it. **The turned picture is a prepared image of the caller**: it counts among its 8
    (`ERR_FULL` with 8 out, or with requests waiting), does not end with the document, and is
    given back with `image_release` (its file goes as a prepared image's does, also after a power
    cut: the boot sweep). The picture decoded for it keeps its own document image id, which ends
    as any unused one. An answer whose picture came without an id (`image` 0: none was free) is
    passed on as it is, without bit 2: the reader draws and asks again. A picture too large to
    turn on this device (the X4's 16,384 reads: over about 1,000 pixels the long side) or with no
    room for the tile is `ERR_NO_MEMORY`; a part of a file (`fmt.image.part`) is
    `ERR_UNSUPPORTED`; other bits of `flags` are `ERR_UNSUPPORTED` before the format is asked.
- [D] **`canvas.draw_image_part`** (slot 44, #312, #369) draws the rectangle `source` of an image
  scaled into the rectangle, with every rule of `canvas.draw_image` (flags, clipping, bands,
  errors, draw memory), the part in the picture's place: fit, `fill` and `stretch` place the
  **part**, and the 65,535-pixel limit is the scaled part's, so a pan at a high zoom needs no
  huge rectangle. `source` is exactly 16 bytes, `x, y, width, height` as `u32` little-endian, in
  the image's own pixels (the size `image.info` says); another length, a width or height of 0
  or a part not inside the image is `ERR_INVALID`, nothing drawn. The host reads the part's rows
  only, from the part's first column to its last (one card read for as many rows as its 8 KiB row
  chunk holds of them); the drawer's memory is that of a picture of the part's width. A dithered
  part is dithered from the part's own first row and column.
- [D] **A part of a cache file as a picture: `fmt.image.part`** (stage `core.format` revision 1,
  #312, #369). A format may answer a picture as a rectangle of a cache file: `part: bytes 16`
  (appended, optional; empty for the whole file), `x, y, width, height` as `u32` little-endian
  inside the file, whose own size `width`/`height` of the record still say (the header check is
  unchanged). The host gives the part an image id of its own (the same part of the same file in
  the same document keeps its id); the opener's `doc_image` and `image.info` say the **part's**
  width and height, and `canvas.draw_image` of that id draws the part, so a reader built before
  parts shows it right without knowing. `canvas.draw_image_part` on such an id counts its source
  from the part's corner. A `part` of another length, empty, or not inside the file makes the
  record no picture (left out, as any `fmt.image` that fails its check). format-cbz shows the
  panels of a comic page this way: a panel is a part of the page's one decoded picture, and no
  enlarged copy of it is written to the card (about 384 KB a panel on the X4 before).
- [D] **The picture stage `core.picture`** (major 1, #82, #369): plugins have a say in how a
  picture looks before it is dithered, without seeing a pixel (a page picture is up to 384 KB on
  the X4, far over any stage bound). Host-defined, at most **2 subscribers** on a device
  (`registration.stage`, in stage order); input at most 640 bytes, reply 320, one reply row.
  - Input `picture.ask` (stage-local tag 1): `place: u32` (0 reader page, 1 comic page, 2 cover,
    3 thumbnail, 4 sleep screen, 5 a picture a plugin prepared for its own screen or widget;
    a value a subscriber does not know is "somewhere else"; how the host tells them is below),
    `width: u32`, `height: u32` (the
    picture as the host keeps it), `flags: u32` (bit 0 kept in colour, bit 1 has transparency),
    `histogram: bytes 16` (16 gray bins from black to white, colour as luma, each 0 to 255 of the
    fullest bin, counted over up to 16 rows spread over the picture: one row in memory at a
    time), `path: str 512` (the book or file on root 1, empty for none).
  - Reply `picture.tone` (tag 2): `tone: bytes 256` (empty, or the whole curve: every gray `v`
    of the picture is drawn as `tone[v]`, before the user's picture settings and the dither;
    a see-through draw is not toned), `flags: u32` (bit 0 `dots`, bit 1 `grays`: what the
    picture is drawn with where a draw's own bits 3 and 4 name neither). An empty `tone` with
    `flags` 0 says nothing: the next subscriber is asked, and the first reply that says
    something wins. A `tone` of another length, both bits, or an unknown bit is no answer.
  - **Once for a picture, never at a draw.** The host asks when a picture is made, before the
    plugin that asked for it hears of it (`event.image_ready` comes after), and keeps the answer
    with the image id: 256 bytes while the image lives, only where a subscriber answered a
    curve. A draw, a page turn and a band cost nothing more. A subscriber that fails or answers
    badly changes nothing; without a subscriber nothing is read and nothing is called.
  - **Every picture with an image id is asked for**, a plugin's own (`image_prepare`) and a
    document's (a `fmt.image` of a block stream, op 16, a cover of op 15 or of the library's
    `cover`). The place is the first that fits: **0 reader page** and **1 comic page**, a picture
    of an open document that is not its cover (1 where the document's format declares
    `whole_pages`: a comic, a folder of pictures, pages made beforehand), with `path` the book
    where it is on root 1; **4 sleep screen**, any other picture of the plugin whose screen is
    the sleep screen and on top when the host asks; **3 thumbnail**, a cover or a plugin's own
    picture whose longer side is at most a quarter of the screen's; **2 cover**, another cover;
    **5**, another picture of a plugin's own. `path` is empty for the places 2 to 5 on this host
    (a cover's document is closed when the stage is asked).
  - **When a document's picture is asked for.** The stage is called between callbacks only, so
    the id of a document's picture is in its plugin's hands before the answer: the host asks in
    its next pass, before the next frame. A plugin that draws the picture in a later frame than
    the call that made the id (as the reader does: its pictures come in the frame after the
    page's text) draws it with the answer. One that made the id inside its `draw` and drew it at
    once has drawn it as it is; where the answer then says something, the host draws the screen
    once more. The same image id is asked for once: a picture handed out again under its id
    costs nothing, a picture whose id ended (a ninth document image, a closed document) is asked
    for again when it gets a new one. A part of a cache file (`fmt.image.part`, a comic's panel)
    takes the answer another picture of that file already has: the panels of a page look alike,
    and a step to the next panel reads and asks nothing. A curve that changes no gray is kept
    as none.
- [D] `image.info` writes one `doc_image` record (`width`, `height`, `flags` bit 0 colour, bit 1
  not decoded yet) into
  `out`. `canvas.draw_image` draws the image scaled into the rectangle (keeping its shape,
  centred), clipped by the canvas, only inside a `draw` callback (`ERR_STATE`). `flags`: bit 0
  `fill` (fill the rectangle and crop), bit 1 `small` (a small picture: it does not count towards
  the e-paper ghosting full refresh, interface 6 `small_pictures`), bits 8-15 transparency (255
  minus the opacity: 0 opaque, the default; 255 draws nothing), blended over what is below, bit 2
  `stretch` (scale to the rectangle and drop the picture's shape; with `fill` `ERR_INVALID`), bit
  3 `dots` (black and white dots by force, also on a panel with grays) and bit 4 `grays` (the
  panel's own grays; neither bit is the panel's rule, both `ERR_INVALID`; `dots` and `grays` have
  no effect on a see-through draw). Other bits are `ERR_UNSUPPORTED` (nothing drawn); a scaled picture over 65,535 pixels on a side is
  `ERR_INVALID`, the only size refusal (a large rectangle is clipped, not refused). An unknown or
  ended id is `ERR_NOT_FOUND`; a card read failure or a cache file shorter than its header says is
  `ERR_IO`, a header that does not match the file `ERR_INVALID` (hostile-input rule below), with
  nothing drawn when found before the first band, else the bands drawn so far kept and the error
  returned (never a silent partial draw). The host reads the file in bands of at most 2 KiB (the
  X4 frame band; a stack band, not a read size). **Draw memory:** besides that band the drawer
  takes one bounded, transient heap block per call (its source row chunk of 8 KiB, filled by
  `read_at` requests of up to that size, plus a few bytes per source row and per drawn column:
  about 25-30 KiB for a 1,600-pixel picture), allocated fallibly before the first band and freed
  before the call returns. A see-through picture (`image_prepare` bit 2: gray plus opacity, two
  bytes a pixel on the card) is read through the same row chunk, so its rows take twice a gray
  picture's room in it and no other block. It is at most 32 KiB on the X4 and at most 1 MiB on Android, the
  desktop and the emulator (the shell's `scratch_max`); a draw that needs more, or whose block is
  refused, is `ERR_NO_MEMORY` with nothing drawn. The
  one thing a host **may** keep between calls is a **dithering carry**: the error rows of the
  pictures whose bands this frame draws (4 bytes a dithered column: 1,920 bytes for a picture as
  wide as the X4's screen), at most 4 KiB for all pictures of the frame together, so a band goes
  on where the band above ended and reads only its own rows; freed when the frame ends. A host
  that keeps none, or cannot have it (refused, the 4 KiB taken, a band drawn again, a part drawn
  alone), dithers the picture from its first row again and draws only the rows of the call: the
  same pixels, more rows read, never an error. A dithered picture whose rectangle is up to 1,600 px wide is dithered over all its
  columns, so a part redrawn alone matches the whole; for a wider rectangle, or where the device's
  draw scratch does not hold the full width, only the visible columns are dithered and a redrawn
  part may differ slightly (never an error). These limits are slot 37's; a plugin that draws a picture itself with the SDK's drawer
  spends its own heap under its own budget.
  Dithering and night-mode inversion are the host's own, by the screen and the user's settings,
  not flags.
- [D] **Cache sweeps** (prepared images and document caches left by a stopped plugin or a cut
  power, at start or when idle) are stepwise: at most 64 entries read per main-loop turn through
  the storage's resumable listing, in turns with no input waiting; never a whole-folder scan in
  one turn, so a large cache cannot lengthen the start.
- [D] **Hostile input.** Every picture is downloaded input. The band drawer checks a cache image a
  format wrote (`fmt.image`) before using it: header against its file size and the stated
  `width`/`height`, a short read `ERR_IO`, a mismatch `ERR_INVALID`; nothing panics and nothing
  reads past the file. Each decoder (JPEG baseline, progressive JPEG, PNG, GIF) and the
  cache-image reader keep a fuzz target (`fuzz/fuzz_targets`, today one `image.rs` for all), a gate
  for this family.

## 6. Fonts of a book and hyphenation

- [D] `doc_font` rows, one per **face** (`index` from 0, at most 124: 31 families × regular, bold,
  italic, bold italic; `family` 1-31 as the runs' `TextStyle` family, `flags` bit 0 bold, bit 1
  italic, `bytes` the file's size), paged. The format writes each embedded font (at most 16 MiB,
  interface 6's EPUB cap) whole into its cache when it prepares the document; the reader gets a font
  handle with `font.acquire` (slot 7) and the key `document.<document>.<index>` (only the document's
  opener: for any other plugin `ERR_NOT_FOUND`), which the host resolves to that cache file and
  renders from the card like a card font. Face `index` i is the root-6 file `fonts/<i>` (decimal, no
  extension), the format's to write; the host opens nothing else, and a file whose size is not the
  row's `bytes` is `ERR_INVALID` at `font.acquire`. A damaged font is `ERR_INVALID` at
  `font.acquire` (the reader falls back to the user's font and counts it, interface 6
  `failed_reads`). Handles of a closed document's fonts draw nothing (`ERR_NOT_FOUND` at the next
  text call) and are released as usual.
- [D] Embedded fonts are hostile input to the host's font engine: its parser has a fuzz target (a
  gate), `font.acquire` checks the tables it needs, and a glyph that fails to parse later draws
  nothing (counted as a failed read), never a panic.

### 6.1 Hyphenation (slot 38)

- [D] **The host hyphenates; the reader holds no table.** Layout stays with the reader (section 0),
  so it asks where a word may break with host slot 38 `text.hyphenate(ctx, language: bytes, word:
  bytes, left: u32, right: u32, out: buffer)`, `query`, any callback, no `uses.*` feature. It
  replaces interface 6's `env.hyphenation()`, `Hyphenator`, `CardTable` and `with_minimums`
  (section 9). Tables are data plugins' `[hyphenation]` files on the card (`resource.hyphenation`,
  `docs/abi/proposals/declarative-registration.md`); no `.ppn` carries one.
- [D] **Which table.** `language` is a tag, `[A-Za-z0-9-]`, 1 to 35 bytes (as
  `resource.hyphenation.language`), matched without regard to case. The host tries the tag, then
  drops its last `-` part until one is left (`de-ch-1996`, `de-ch`, `de`); where several plugins
  name the same tag, the greatest plugin id wins (D4). No table for any of them is `ERR_NOT_FOUND`.
- [D] **The answer.** `word` is UTF-8 (`ERR_UTF8`), at most 192 bytes (`ERR_INVALID`), letters
  only by the caller's choice (it strips punctuation and soft hyphens), matched without regard to
  case. `out` gets one byte per place the word may break: the byte offset into `word` before which
  a hyphen goes, ascending, each at a character boundary, at most 47 bytes (a word of at most 48
  characters), and the call answers `OK` with that many bytes written; an `out` too small for all
  of them is `ERR_NO_SPACE` with nothing written. `left` and `right` are the fewest characters
  before and after a break, 1 to 16, or 0 for the table's own (above 16 `ERR_INVALID`): the
  reader's `core.hyphen-min-left`/`-right` settings. `OK` with no bytes: the word may not break
  (an empty word, shorter than `left` + `right`, longer than 48 characters, no pattern allows it),
  or the table cannot be read at this moment (below); the reader leaves the word whole. An empty
  `word` is how a reader asks whether a language has a table at all (`OK` or `ERR_NOT_FOUND`).
- [D] **Reading the table** (as interface 6's card tables, now host-side): opened at the first word
  of its language with `paperpaw-hyphen`'s card-backed reader, which keeps the index and
  exceptions and reads pattern blocks as words need them (about 26 reads a word for `de`; opening
  reads the file once, 708 reads). A table is untrusted input for as long as it is read: the reader
  checks it as it opens and bounds every read; nothing panics. A read that fails closes it and the
  next word opens it again; after a second failure, or a table that is not sound, the language
  answers `ERR_NOT_FOUND` until the card changes. At most 2 tables are open (a book's language
  and the UI's), together at most 48 KiB, checked before anything is taken; to make room only a
  table idle for 256 words is closed, else the newer language's words are left whole (`OK`, no
  bytes; Senior #816). The host closes them all when a book is closed, before the device sleeps,
  before network, store and firmware work, when the card is mounted anew, and a plugin's tables
  when it removes or updates that plugin.
- [D] **Memory per call (X4): no heap.** A call takes the host's stack only (the word as at most
  48 characters, their offsets and values: under 1 KiB, a gate item measured with the host port)
  and writes at most 47 bytes into the caller's `out`. What stays is the open tables above: about
  20 KB for `de`, the largest shipped, at most about 42 KiB for one table the shared check lets
  through, at most 48 KiB for both (section 8.2). Time: one host call per word the layout wants to
  break, about one a line.

## 7. Lookup (dictionary, wikipedia, translate)

- [D] A host-defined stage `core.lookup` (major 1, generated schema): providers declare
  `lookup.spec` (230: `name: str 96`, `title: str 96`, `languages: str 512` one BCP 47 tag per line,
  at most 32 tags of at most 35 bytes, or empty for any, `flags` bit 0 network (shown only when a
  network is up), `token: u32`) and are called in the order the plugins registered them (interface 6
  `LookupProviders`; a user order is not part of 1.0). The asker (the dictionary screen, the
  reader's selection menu) calls the service `core.lookup` (major 1) op 1 `lookup` (1092
  `lookup_ask`: `text: str 1024`, `language: str 35`, `context: str 1024`, `cursor: u32`) and gets
  the providers' rows 1093 `lookup_entry` (`provider: str 64`, `title: str 256`, `text: str 2048`,
  `flags` bit 0 more pages, bit 1 pending: the provider answers later, `opens: str 128`) in pages,
  one provider per page. The provider's stage reply `lookup.entry` carries the same `title`,
  `text`, `flags` and `opens`.
- [D] **An entry that opens more** (interface 6 `LookupEntry::more`; Beta 3's *Open Wikipedia ›*
  in the dictionary panel): `opens` names a screen that shows more of the entry (a whole
  article), empty for none. The host passes it on as the provider wrote it; the asker shows a line
  for it in its own words and opens it with `command.open` mode 0 (a screen, `ui.md` 1; not mode
  1, which opens a slot), whose check decides, with a hand-over of the params `word` (the ask's
  `text`) and `language` and the entry's text as the hand-over's text. A pending entry may name it
  too.
- [D] **Provider names:** the registry refuses a `lookup.spec` whose `name` is empty or longer than
  64 bytes with `ERR_INVALID` (`lookup_entry.provider` holds 64), so every entry names its provider.
- [D] **Caps and names:** at most 8 `lookup.spec` per plugin (a ninth is `ERR_INVALID` for the
  batch) and 32 device-wide (`ERR_FULL` for the batch that would pass it), as for formats and
  readers; the plugin does not load, `reg_plugin.problem` 18 (`registry.md`). A `name` twice in
  one plugin is `ERR_INVALID` for the batch; two plugins may use the same name (a `lookup_ready`
  matched to the wrong one of them costs one more ask, nothing worse).
- [D] **Network providers** (`flags` bit 0) are called only while the host's network is connected
  at the ask (as `event.wifi_changed` reports it; the cable serves a computer, not the internet,
  and does not count); else they are skipped without a page. A lookup never starts a join.
- [D] **Languages** (interface 6 `LookupQuery::fits`): an empty ask `language` or an empty spec
  `languages` takes any; else a spec tag fits when it equals the ask's tag or the ask's primary
  subtag (the part before the first `-` or `_`), ASCII case ignored: spec `de` takes `de-AT` and
  `DE`; spec `de-AT` does not take `de`.
- [D] **Empty answers:** a provider's own `ERR_NOT_FOUND` is not passed on: the host answers that
  provider's page with one `lookup_entry` carrying the provider's name and an empty `title` and
  `text`. Only running out of providers (a `cursor` past the last) is `ERR_NOT_FOUND` to the asker.
- [D] **`flags` bit 0 (more) is the host's:** the host sets it on every entry that later providers
  follow and clears whatever the provider set; the provider's own paging stays inside its page.
- [D] **A provider that must fetch** (wikipedia, translate) never blocks the asker: its stage call
  answers at once with its `lookup_entry` flagged bit 1 `pending` (empty `text`), starts its own
  request (`core.net`, as itself) and keeps the result in its own data. If the asker subscribes
  to `event.lookup_ready` (110), the host records one **pending ask**; for an asker that does not,
  it records nothing (the asker sees `pending` and may ask again itself).
- [D] **The pending table** is fixed and allocates nothing: **16 entries on the X4, 32
  elsewhere**, 32 bytes each (the asker and the provider as `u64` owners, the ask's hash, the
  deadline as `u64` ms, 60 s after the ask): 512 bytes on the X4. The hash is 64-bit FNV-1a over
  the length of `language` as one byte, the `language` bytes and the `text` bytes, so the pair
  (`language`, `text`) maps to one input without ambiguity. One entry per (asker, provider, hash):
  asking again refreshes its deadline. At most 4 entries per asker and **at most 8 per provider
  on the X4** (16 elsewhere), so one provider cannot fill the table for the others. With no room
  (table, asker's or provider's share full), the provider's page is answered as an empty entry
  (the empty-answer rule above) and the host logs it, so a full table never blocks or fails the
  lookup. Two asks whose hashes collide are matched together: the extra asker gets an event,
  asks again and sees `pending` or the answer; nothing worse.
- [D] When its result is kept, the provider stages `command.lookup_ready` (1593: `text: str 1024`,
  `language: str 35`, the ask it answered). The host matches it against the pending asks naming
  that provider, removes them and sends each asker `event.lookup_ready` (110: `now_ms`, `provider:
  str 64`; the asker subscribes to it like any event). The asker calls `lookup` again with the same
  `text` and `language` (from 0 or at that provider's cursor) and the provider answers from what it
  kept, now without `pending`. A `lookup_ready` that matches no pending ask does nothing but
  count: the host adds 1 to a counter of unmatched ready commands and logs at most one line a
  minute about them; the command is accepted (never an error to the provider).
- [D] **The ready command at the host:** checked at submit (an empty `text` or a `language` the
  ask would refuse is `ERR_INVALID` for the batch), kept as the ask's hash only and applied after
  the callback with the other commands; a work run's callback may submit it (`work.md` 2: a
  provider's fetch ends in its run). The event names the provider's first `lookup.spec` (a plugin
  with several is told by its first name; the asker asks again from 0 or that cursor either way).
  Events wait in a list of at most one per pending ask (88 bytes each, 1,408 bytes at most on the
  X4, nothing while none waits) until the event pump hands them to their askers; one without
  room is dropped and logged (the asker asks again), and an asker that stops loses its own.
- [D] A pending ask ends without an event when its deadline passes, the asker stops or the
  provider stops; an asker that wants the answer later asks again. The host never starts a
  stopped plugin for a lookup and never holds a provider's answer itself. No provider sees
  another's answer; the asker sees all.

## 8. Sizes and memory

### 8.1 Every record fits its limit

Encoded sizes at the caps (as `ui.md` 8.1: bitmap 1 byte; `str N` 2 + N; scalars 4 or 8; a record
frame adds 2 or 3 bytes of tag and 2 of length; a batch its count byte). Limits: service input and
reply 4,096 bytes, stage payload 3,840.

| Record or reply | At its caps | Limit |
| --- | --- | --- |
| `doc_open` + `doc_option`s (key 64, value 128) | `doc_open` 1 + 5×4 + 514 + 130 + 514 + 5 = 1,184; each option 1 + 66 + 130 + 5 = 202: 16 would be 4,417, so at most 12: 1,184 + 2,424 + 1 = 3,609 | 4,096 |
| `block` fragment | `doc_block` 1 + 15×4 + 4 + 37 + 4 + 5 = 111; a `doc_text_part` at most 1 + 3,074 + 5 = 3,080; a `doc_ruby` 1 + 16 + 1,026 + 5 = 1,048; every record fits, fragments are cut between records | 3,840 |
| 64 `doc_run` alone | 64 × (1 + 12 + 5) = 1,152 | in the 3,840 piece |
| `doc_meta`; `doc_text` | 1 + 514 + 37 + 514 + 34 + 4×7 + 5 = 1,133; 1 + 12 + 1,026 + 5 = 1,044 | 4,096 |
| `doc_toc` page | row 1 + 5×4 + 514 + 5 = 540; 7 rows + `end` = 3,810 | 4,096 |
| `doc_link` page | row 1 + 3×4 + 1,026 + 5 = 1,044; 3 rows + `end` | 4,096 |
| `doc_section` page | row 1 + 12 + 5 = 18; 64 rows + `end` = 1,182 | 4,096 |
| `fmt.call` (+ 12 `fmt.option` for op 2) | 1,592 (section 3); op 2: 1,592 − 1,536 + 12 × 202 = 2,480 | 3,840 |
| `fmt.call` for ops 13, 15 | the XPointer or href in `text` (1,024 bytes, as `doc_xpointer`, `doc_href`), `arg` empty: 1,592 − 514 = 1,078 | 3,840 |
| `lookup_entry` page | 1 + 4 + 66 + 258 + 2,050 + 130 + 5 = 2,514, one per page | 4,096 |
| `command.image_prepare` | 1 + 4 + 514 + 12 + 258 + 5 = 794 | 4,096 |

- [D] Senior's must-fix 1 (round 1: `arg` 1,024 carried the options and the XPointer) is settled
  by the round-2 layout: options travel as their own `fmt.option` records, XPointers and hrefs in
  `text` (1,024 bytes), and `arg` holds only the sniff bytes (512).
- [D] So `doc_open` takes at most **12** `doc_option` rows (key 64, value 128 bytes) per format;
  no first-party format reads options today (Plugin's audit), and more is `ERR_NO_SPACE`, never a
  silent drop. Values are the book's own (section 2.1), so a later global settings read is not a
  replacement.
- Host note: the details job sizes its reply rooms to these caps (`OPEN_REPLY` in
  doc_service/details.rs, `READ_REPLY` in doc_details_job.rs); a minor that grows `doc_meta`,
  `doc_text` or `fmt.state` grows them too.
- Host note: the host's own calls lend a format small reply rooms too: 256 bytes for op 3
  `prepare` and op 4 `close` (`OPEN_REPLY`), 384 bytes for op 17 `cover` (`COVER_REPLY` in
  doc_service/cover.rs, one `fmt.image` at its caps). A format answer longer than that is refused,
  never cut; a minor that grows `fmt.state` or `fmt.image` grows them too (#248).

### 8.2 Memory (X4)

- Documents: about 64 bytes of host state each, at most 2: 128 bytes. The format plugin's parse
  state is its own heap, per document; the format ports measure it (EPUB at a long book) and it
  counts to the plugin, not here.
- Calls: the opener's `out` and one stage call on the host scratch, both at most 4,096 bytes, freed
  when the call returns; nothing retained.
- Preparing: one at a time; the host keeps only the queue (8 bytes per waiting document).
- Images: about 24 bytes per image id, at most 8 per plugin and 64 device-wide (1.5 KiB); decoding
  for `image_prepare` uses one band buffer of at most 4 KiB plus the decoder's transient state, one
  decode at a time, fallible (`status` 5 when the heap cannot). The state differs per format: PNG
  the 32 KiB inflate window plus two source rows; **on the X4 a PNG's source row is capped at 8
  KiB** (2,048 pixels of 8-bit RGBA, 1,024 at 16 bits; wider is `status` 3 too large), so the
  window and the rows are at most 32 + 2 × 8 = 48 KiB (Senior's remark: without the cap an 8 Mpx
  source could reach about 160 KiB; other devices keep the 8 Mpx limit only). **Measured, the
  whole prepare** (inflate state, rows, downscaler, the 8 KiB append chunk, the grid's row) of a
  full-screen 480 × 800 PNG at the X4's limits **peaks at about 63 KiB** (63,123 bytes), about 66
  KiB (66,003) see-through (`prepare_tests.rs`,
  `a_full_screen_see_through_picture_on_the_x4_stays_within_the_opaque_bounds`);
  progressive JPEG a coefficient store the decoder sizes from the free heap (it keeps only the
  frequencies the output size needs); interlaced GIF the rows of the part on the screen; baseline
  JPEG and BMP a few rows. **This transient peak (PNG the largest) is an X4 gate item**, measured
  with the reader port at a 1,600-pixel PNG.
- The picture recipe (`image_prepare` `tone`, `turn`, `luma`): the tone table is held from the
  request's queueing to the end of its decode, 256 bytes a waiting request (at most 4 a plugin), and
  a colour row mapped through it needs one scratch row of at most 3 × 1,600 = 4,800 bytes, taken
  once. A mirror or a half turn holds two rows (at most 4,800 bytes each) and the 8 KiB append
  chunk. A **quarter turn never holds the whole picture**: it writes the cache transposed in tiles
  of whole source columns (a tile is at most **32 KiB** on the X4, the draw's own ceiling, and at
  least one column of `height × channels` bytes, at most 4,800), after the decoder has freed its
  state, so the peak is the tile + one output row (at most 4,800) + the append chunk (8 KiB): **at
  most about 45 KiB** at 1,600 pixels, below the PNG prepare's measured peak, and never at the same
  time as a decode or a draw. The brightness grid is 8 sums of 8 bytes and the grid's 64 bytes on
  the stack (about 130 bytes) and one source row (at most 4,800 bytes) on the heap. **See-through**
  (bit 2) adds no block a colour picture lacks: the cache writer's append chunk stays 8 KiB, and
  the tone scratch and the grid's source row are two bytes a pixel (at most 3,200 bytes at 1,600
  pixels), inside the bounds above; the decode's peak is the PNG's or GIF's own. The turn's
  time is an X4 gate item: it reads `height × ceil(width / columns)` short pieces (a 1,600 × 1,200
  picture in 27-column tiles: about 72,000, over the X4's budget of 16,384 reads, so refused with
  status 3; the screen's 800 × 600: about 9,000), to be measured on the device (#250).
- Drawing a picture (slot 37): at most 32 KiB transient per call on the X4 (section 5),
  fallible, freed before the call returns; never at the same time as a decode (both run on the
  main loop).
- Fonts: card fonts, no heap beyond the font engine's per-handle state.
- Hyphenation (section 6.1): no heap per call; open tables at most 48 KiB together (2 tables;
  about 20 KB for `de`), opened at a book's first hyphenated word and closed with the book, as
  interface 6's card tables, which the reader held; the same bytes, now counted to the host.
- Lookup: one stage call on the scratch; the pending table (section 7) of 16 × 32 bytes = **512
  bytes on the X4** (1 KiB elsewhere), fixed, no allocation; no answer text kept. Registered
  `lookup.spec` rows are not copied: the host reads them from the plugin's declarations where they
  are, as it reads formats, readers and book fields (the declaration store keeps about 8 bytes per
  record, so 256 bytes at the device cap of 32); a host that copied the rows would hold up to about
  23 KiB at that cap, more than DOC's whole budget at rest, and must not.
- **X4 worst case for DOC's host side: about 6.5 KiB at rest** (documents 0.13, images 1.5, band 4,
  pending lookups 0.5, queue), **plus the decoder's transient peak while an image decodes (PNG at
  most 48 KiB on the X4)**, **and the open hyphenation tables while a book is open (at most 48 KiB,
  `de` about 20 KB; interface 6's reader held the same)**, all fallible; an activation-gate item
  beside UIX's, measured with the reader port. The format plugins' own heaps are gated by their
  ports.

## 9. Interface-6 calls and their interface-7 form

## 10. Hand-offs (after approval)

- **Kernel:** records, `core.document@1` and `core.lookup@1` schemas, `core.format@1` and
  `core.lookup@1` stage schemas (Core's stage-schema generator first), slots 36-38 in `abi.def`,
  roots 3, 4 and 6 in the storage contract, this document final.
- **Core:** the document table and leases, the format broker and its checks, preparing in the main
  loop with the `.complete` stamp, roots 3, 4 and 6, image ids and the band drawer, `image_prepare`
  decoding, document fonts in `font.acquire`, the lookup broker; tests for every refusal above,
  power-cut tests of the cache stamp; the path checks of roots 3, 4 and 6; fuzz targets per decoder,
  for the cache-image reader and the font parser.
- **Host Engineer:** slot 38 `text.hyphenate` (section 6.1): the tag fallback and D4 choice over the
  registry's `resource.hyphenation` rows, interface 6's card-table rules (`OPEN`, `BUDGET`, `HOT`,
  give-up, closing) moved into the host; tests for every status of section 6.1.
- **Services:** the SDK side: a `Document` facade for openers over op 1-21, the block writer (piece
  splitting by size), a `Format` trait for format plugins over `core.format`, image and font
  helpers; a safe `hyphenate` wrapper over slot 38 for the reader's layout and the SDK grid.
- **Firmware:** the X4 nested-callback stack case for `block`, the image band drawer's speed, the
  DOC line of the heap budget, slot 38's host stack.
- **Plugin:** the ports: the six format plugins, notes-vault, the reader, files, file-manager,
  browser, koreader, kosync, sleep, dictionary, wikipedia, translate.
