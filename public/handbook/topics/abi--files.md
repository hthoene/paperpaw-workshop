# Interface 7 family FS: folders, file information, moves and free space

Contract for #228 (assignment #1088). Items marked [D] are proposed decisions, [Q] open
questions for Plugin, Core and Senior. Inputs: the storage slots 20-26 and their rules
(`proposals/interface-7-events-storage-services.md` section 2, "the storage contract" below), owner
decisions 124 and 125, `stages-services.md` (service schemas, D4), `registry.md` 2.1 (bare replies
and paging), `screens-input.md` section 13 (features and statuses), the platform `Storage` trait
(`crates/paperpaw-platform/src/storage.rs`) and an audit of the interface-6 storage calls of the
17 first-party plugins that use files beyond their own data folder (section 6).
Records: `abi/services/core.files@1.def`.

## 0. Scope and principles

- [D] **Slots 20-26 stay the file calls.** `storage.size`, `read_at`, `write`, `append`,
  `rename`, `remove` and `sync` keep their contract: path based, no handles, a root argument,
  synchronous, 4 KiB per call. FS adds what plugins do with **folders** and **file information**,
  as one versioned service, `core.files` (D4: no new one-off slots). On an error of `read_at`,
  `out`'s contents are unspecified; only the status counts. After a successful read the
  bytes past `count` are zeros. An `out` that overlaps the path is `ERR_INVALID`.
- [D] **Only what first-party plugins use.** Every op below is used by at least two plugins today
  (section 6 lists who). Not offered: copying (plugins copy with `read_at` and `append`, as
  interface 6's `files::copy` does; the SDK keeps that helper), `write_at`, `truncate`, local paths,
  watching a folder, file handles.
- [D] **Bounded calls.** Every op does one bounded piece of card work (`bound: card`). Listing is
  paged, and deleting a folder tree is done a piece per call until the reply says it is done; no
  call walks an unbounded tree.
- [D] **The same roots, paths and statuses as slots 20-26**, plus root 2 (D1.3). Root 1 needs the
  signed feature `uses.storage` (decision 125); everything else needs no feature.
- Out of FS: downloads to a file (NET), the library's catalog, books, annotations and their moves
  and deletes (LIB, `library.md`), installing plugins and firmware (DEV), plugin settings (REG and
  slot 15, decision 126).

## 1. Roots and features

### 1.1 Roots

| Root | Name | What it is | Access |
| --- | --- | --- | --- |
| 0 | data | the plugin's data folder `.paperpaw/plugins/<id>/`, `<id>` stamped from the owner | read and write |
| 1 | card | the user's files from the card's root, without `plugins/` (a running data plugin's folder excepted, below), `.paperpaw/` and `paperpaw.ini` | read and write, with `uses.storage` |
| 2 | bundle | the plugin's own install folder `plugins/<id>/` (files it ships, such as `data/`) | read only |
| 3 | book | inside a `core.format` call of a `folder` or `siblings` document: its folder (`document.md` section 3) | `list` and `stat` only |
| 4 and above | reserved (4, 6 and 7 are `core.format`'s, through the storage slots) | | `ERR_UNSUPPORTED` |

### 1.2 Features

| Key | Allows | Plugins (first-party) |
| --- | --- | --- |
| `uses.storage` | root 1 on slots 20-26 and on `core.files` | dictionary, file-manager, files, format-txt, format-xtc, koreader, news, notes-vault, picture-home, read-later-cloud, sleep, transfer, vocabulary, wallabag |

- [D] `uses.storage` is a signed metadata feature (revision 1), as the DEV features. Root 0 and
  root 2 need nothing. Hosts read it into the per-instance feature bits (#285); the check is the
  shared `feature()` helper.

## 2. The service `core.files` (major 1)

No feature on the ops (root 1 is checked per call, 1.1). Bare replies and paging as
`core.registry` (`registry.md` 2.1): a list writes its rows, then exactly one `service.end`, last;
other ops write exactly their records, no `end`. Input is one record (`input_rows` 1).

| Op | Name | Effect | Input | Reply | Notes |
| --- | --- | --- | --- | --- | --- |
| 1 | `list` | query | `fs_list` | `fs_entry`*, `end` | one folder, paged, `page_rows` 32 |
| 2 | `stat` | query | `fs_path` | `fs_entry` | one file or folder |
| 3 | `space` | query | `fs_path` | `fs_space` | free and total bytes of the root's medium |
| 4 | `make_dir` | mutate | `fs_path` | (none) | creates the folder and missing parents |
| 5 | `remove_tree` | mutate | `fs_list` | `fs_progress` | removes a folder and all in it, a piece per call, with a resume place |
| 6 | `move` | mutate | `fs_move` | (none) | moves or renames a file or folder, also between roots 0 and 1 |

### 2.1 `list`

- [D] `fs_list.path` names a folder (`""` is the root). Rows are the folder's entries in the
  storage's order (no sorting: a plugin sorts what it shows), `.` and `..` never, hidden names
  (`.x`) included (plugins filter them). Each row is an `fs_entry` (2.6).
- [D] **Paging.** `cursor` 0 starts. The page's `service.end` carries the next place in its
  optional `cursor: u64` (ordinal 0, added to record 52 for 64-bit places; `next` is 0), and
  `flags` bit 0 `last` when the folder is done, the same meaning as in `core.registry`
  (`registry.md` 2.1). The place is the storage's (`Storage::list_from`; on FAT a 64-bit position
  in the folder), opaque to the plugin and valid only for the same folder. **Every page that is
  not the last carries `cursor`**; a page without `last` and without `cursor` is `ERR_INVALID` for
  the reader (a registry-style pager would start over forever). An entry added
  or removed between pages may be listed twice or not at all; a place that no longer holds starts
  over at a place the host can find, never fails and never shows an entry that is not there
  (the trait's promise). `service.end.total` is 0 (unknown) and `generation` 0: folders have no
  generation.
- [D] A page holds as many whole rows as fit in the op's `max_reply` (4,096 bytes), at most 32 (a
  row is at most 793 bytes framed, so at least 5 fit). A
  folder of thousands of entries is so read once in all, not once per page (notes-vault indexes up
  to 50,000 notes this way).
- [D] `flags`: none yet; other bits `ERR_UNSUPPORTED`.
- [D] **No entry is skipped.** An entry whose name cannot be used in a path (over 255 bytes in
  UTF-8, or a character the path rules refuse) is listed with `fs_entry.flags` bit 1
  `unaddressable` and its full name (up to 765 bytes, the FAT long-name limit in UTF-8); other ops
  cannot reach it, and the plugin shows it without offering to open, move or remove it.
- `ERR_NOT_FOUND`: the folder is missing; `ERR_INVALID`: the path names a file.

### 2.2 `stat`

- [D] Answers one `fs_entry` for a file or folder: `name` is the last path segment (`""` for the
  root), `size` the file's bytes (0 for a folder), `modified` where the storage keeps it.
  `ERR_NOT_FOUND` when there is none. It replaces interface 6's `exists`, `size` on folders and
  `modified`.

### 2.3 `space`

- [D] Answers `fs_space` for the medium the root lives on (`path` must be `""`, else
  `ERR_INVALID`). `free` is bytes free for new files **after the host's reserve** (the storage
  contract's D2.6, so a plugin never plans to use the room the kernel keeps for its own saves);
  `total` the medium's size. `flags` bit 0 `free_known`, bit 1 `total_known`: on the X4, free space
  is unknown until the FAT has been counted (G-free-1), and then `free` is 0 with bit 0 clear, never
  a guess. Bit 2 `ignores_case`: names that differ only in case name one entry (FAT), so a
  case-only rename needs care (file-manager).
- Store and transfer check room before an install or an upload with it; a write can still fail
  with `ERR_FULL` (the reserve and other writers apply at the time of writing).

### 2.4 `make_dir`

- [D] Creates the folder and every missing parent; an existing folder is `OK`; an existing file
  at the path or a parent is `ERR_INVALID`. Not on root 2 (`ERR_DENIED`). The root itself (`""`)
  always exists (`OK`). Power cut: some parents may exist, never a half-made folder entry (FAT
  creates each folder whole before linking it, as the platform's `create_dir`).

### 2.5 `remove_tree`

- [D] Input is an `fs_list` (`root`, `path`, `cursor`, `flags` 0). Removes the folder at `path`
  and everything in it, deepest first, **at most 64 removals and 256 folder entries read per
  call**, and replies `fs_progress`: `removed` this call, `flags` bit 0 `done`, and `next`, the
  place to go on from. The plugin calls again with the same path and `cursor = next` until
  `done`; `cursor` 0 starts.
- [D] **The place stays inside `path`.** `next` holds the depth below `path` and the slot in the
  folder at that depth. Each call finds that folder again by going down from `path`, always into
  the first subfolder, never up by a folder's `..` entry (after a cut during a folder move, `..`
  may still name the old parent, section 2.6), so no place can point outside `path` and none is
  ever stale. A folder is entered and an entry removed **by its position** in its folder, never by
  name: names no path can hold (reserved, a trailing dot, over 255 bytes; section 2.1
  `unaddressable`) are removed like any other, and a non-empty folder with such a name is entered
  and emptied. When the folder being emptied is empty, it is removed from its parent and the call
  goes on from `path` again. Files met on the way down are removed as they are read, so a level is
  passed again with at most 3 entry reads (its `.`, `..` and the subfolder's entry). **Bounds per
  call:** at most 256 folder entries read and 64 removals, plus at most 3 entry reads per level
  going down (at most 768, not counted in the 256, so every call advances); a call that reached
  the read cap before removing anything still answers, with `removed` 0 and a new
  `next`, so no call reads the whole of a big folder. **Depth:** at most 256 levels below `path`
  (the deepest a plugin can make: a path is at most 512 bytes); a folder nested deeper (only a
  computer makes one) ends the call with `ERR_STATE`, what was removed stays removed, the rest of
  the tree stays whole and reachable. A missing folder is `done` at once with `removed` 0; a file
  at the path is removed as a one-entry tree. Interface 6's `remove_dir_all` becomes a loop in the
  SDK helper.
- [D] **No card space is lost.** Every entry is removed with the storage's own remove, which frees
  its clusters (power-safe order: the entry first, then its clusters). The one exception is a
  folder the storage finds **damaged** (its cluster holds another file's data or garbage,
  `paperpaw-fat` `damaged.rs`): it is cut off where its parent names it and nothing in it is
  followed or freed, since its clusters may be another file's; they stay taken until the card is
  checked on a computer, as for every damaged folder.
- [D] Root 0 `""` empties the whole data folder (the folder itself stays). Root 1 `""` is
  `ERR_INVALID` (never the whole card); root 2 is `ERR_DENIED`.
- [D] Power cut or a call that fails part of the way: what was removed is gone, the rest is whole
  (each entry is removed by the storage's own `remove`); calling again, from `next` or from 0,
  goes on. The host keeps no state between calls: `next` is all it needs, and it never collects a
  folder's names on the heap (handoff, section 7). Nothing outside
  `path` is touched. The host never follows a link out of the folder (FAT has none; hosts with
  links remove the link, not its target).

### 2.6 `move`

- [D] `from` and `to` must not be `""` (`ERR_INVALID`): a root is never moved, so a plugin cannot
  move its whole data folder onto the card.
- [D] Moves or renames the file or folder `from` to `to`, also into another folder, and between
  roots 0 and 1 (both on the device's one storage: a news article written in the data folder moves
  into the user's books; an upload moves from the data folder to the card). Root 1 on either side
  needs `uses.storage`; root 2 is `ERR_DENIED`.
- [D] `flags` bit 0 `replace`: an existing **file** at `to` is replaced by a **file**. Without it,
  an existing `to` is `ERR_STATE`; an existing **folder** at `to` is always `ERR_STATE` (never
  merged), and so is a folder moved onto an existing file, with or without `replace` (a file is
  replaced only by a file). Other bits `ERR_UNSUPPORTED`. A folder moved into itself or below
  itself is `ERR_INVALID`. The parent folder of `to` must exist (`ERR_NOT_FOUND`; plugins call
  `make_dir` first). A case-only rename (`Book.epub` → `book.epub`) is a rename, not a replace,
  where the storage ignores case.
- [D] **Power cut:** as `storage.rename`: the new entry is added before the old one is removed, so
  the file or folder is found at both places or at one of them, never at neither. For a folder, the
  host also points its `..` entry at the new parent; a cut between leaves a folder that is whole and
  readable at the new place (the `..` entry of FAT is not used to find files). Core's cut test
  covers a folder move (handoff, section 7).
- [D] A move between two different storages (a host with the data folder on internal memory and
  the user's files on a card) is `ERR_UNSUPPORTED`; the plugin then copies with `read_at` and
  `append`. No first-party host has one today.
- [D] **The library follows every move on root 1** (Plugin's condition; interface 6's
  `tell_moved`, which file-manager and the SDK sent for every recognised file below a moved path,
  goes away). For a root-1 `move` or `storage.rename`, the host:
  1. writes a **library journal entry** (`from`, `to`, the moved paths' book keys and the folder
     settings and reader assignments that name them), synced, before the rename, as LIB's `move`
     does (`library.md` section 6), so the old-to-new mapping never has to be guessed from a scan;
  2. renames and answers the call (a call that answers `OK` moved the entry whole; a power cut
     during the rename may leave both names, 2.6);
  3. then, as a **bounded host job from the main loop** (a step at a time, the catalog walk paused
     meanwhile), carries every book below `from` (catalogued or not yet, by format, a renamed
     `.epub.bak` too) to its new key with its position, annotations and plugins' book data, moves
     folder reader assignments, updates folder-valued settings that name `from` or a folder below
     it, sends the library's book-moved events, and clears the entry.
  The call so stays bounded however many books the folder holds. Every step of the job is
  idempotent, so it can be replayed from the entry.
  - **Rule: one file that is no book moves without the library.** For a root-1 `move` or
    `storage.rename` of a single file that is no book, the host renames it exactly as
    `storage.rename` does on root 0 and does nothing else:
    - no journal entry and no job, so the moves after it are not `ERR_BUSY` because of it (a
      plugin's save of two renames in one callback: the copy kept, then the new file);
    - **no event**: neither `event.book_moved` (68) nor `event.library_changed` (91) is sent;
    - **nothing kept by the file's path is carried** (details, cover, position, annotations,
      plugins' book data): a plugin that keeps data by the path of such a file moves it itself.

    A file **is a book**, and its move is followed as above, when any of these holds: a format
    reads it under its old or its new name, going by the name alone (its extension, also the one
    before a `.bak` at its end; a name without an extension counts where a format tells files by
    their first bytes); or the library keeps details for its old name (it read the book or the
    book was opened: such a file is followed even while its format plugin is off or not loaded).
    A folder is always followed. The power-cut rule of the plain rename is `storage.rename`'s
    (above); the statuses are the same as for a followed move, and while a job runs it waits
    like every move. A host that cannot tell (no formats in the callback's frame) follows every
    move.
  - **At start**, after the FAT repair (`settle_moves`), the host looks at the open entry: only `to`
    exists, it finishes the job; only `from` exists, it drops the entry (nothing moved); **both
    exist** (a cut between FAT's two directory writes), the repair settles them first and the host
    then decides as above, never dropping the entry blind; **neither exists** (the folder was
    removed on a computer while the card was a USB drive), it drops the entry and the next walk
    forgets the books below both names, as for any deleted file.
  - **While the job runs** (until the entry is cleared), `ERR_BUSY` answers:
    - **every** `move` and `storage.rename`, and LIB's `move` and `import`, wherever they point:
      one move job at a time, device-wide, so a second move never needs a second open entry;
    - a `remove_tree`, `storage.remove` or LIB `delete` at or below `from` or `to`, or of a folder
      holding either;
    - a `make_dir`, a file write or a create at or below `from` (the old name stays absent, so
      the start rule's "only `to` exists" still holds after a cut).

    Ancestors of `from` and `to` are not busy otherwise: listing them, reading, writing and
    making other entries in them go on. Reads and writes below `to` go on too. The library
    answers for books below `to` through the pending entry (or carries that book first), so a
    reader that opens a moved book during the job finds its position and annotations, never a
    fresh position the carry would then overwrite. Plugins that move books as books may still
    use LIB's `move` (`library.md`, one job at a time as above); both end in the same state.

### 2.7 Records

| Tag | Record | Fields |
| --- | --- | --- |
| 1142 | `service.fs_path` | `root: u32`, `path: str 512` |
| 1143 | `service.fs_list` | `root: u32`, `path: str 512`, `cursor: u64`, `flags: u32` |
| 1144 | `service.fs_move` | `from_root: u32`, `from: str 512`, `to_root: u32`, `to: str 512`, `flags: u32` |
| 1145 | `service.fs_entry` | `name: str 765`, `flags: u32`, `size: u64`; optional `modified: u64` (ordinal 0) |
| 1146 | `service.fs_space` | `flags: u32`, `free: u64`, `total: u64` |
| 1147 | `service.fs_progress` | `removed: u32`, `flags: u32`, `next: u64` |
| 52 | `service.end` (existing) | gains optional `cursor: u64` (ordinal 0): the next place where a service's place is 64-bit (FS); absent elsewhere |

- `fs_entry.flags`: bit 0 folder, bit 1 `unaddressable` (2.1); others 0. `size` is 0 for a
  folder. `modified` is seconds since 1970-01-01 as the storage keeps it (FAT: the device's local
  time read as UTC, the platform's `DirEntry::modified`); absent where the storage keeps none. A
  FAT time is never before 1980, so no time is negative and `u64` holds every one.
- `name` is one segment of at most 765 bytes (255 UTF-16 units of a FAT long name in UTF-8), never
  containing `/`; one over 255 bytes is `unaddressable` (paths keep the 255-byte segment rule).
- Paths follow the storage contract (D2.3): relative, UTF-8, at most 512 bytes and 255 per
  segment, no `.`, `..`, `\`, `:`, control characters, empty segments, trailing dots or spaces.

## 3. Statuses

Every op checks, in this order, before it touches anything: the record framing (generic,
`stages-services.md`), the root (`ERR_UNSUPPORTED` for 3 and above, `ERR_DENIED` for root 1
without `uses.storage` and for a change on root 2), the path rules (`ERR_INVALID`, `ERR_UTF8`,
`ERR_NO_SPACE` over a cap), the root-1 exclusions (`ERR_INVALID`), then the op's own rules
above. A refused call changes nothing.

| Condition | Status |
| --- | --- |
| Missing file or folder where one is needed | `ERR_NOT_FOUND` |
| The target exists (`move` without `replace`, a folder at `to`) | `ERR_STATE` |
| The host uses the path or something in it (an open book, an install or update copy, a download's file, a served request body): `move`, `remove_tree`, `make_dir` over it | `ERR_BUSY` |
| Card full or the reserve reached (`make_dir`, `move` that needs a new folder entry) | `ERR_FULL` |
| Card removed, unreadable, or lent to a computer as a USB drive | `ERR_IO` |
| Called outside a callback | `ERR_STATE` (slot rules) |
| Re-entry into `core.files` from its own call | `ERR_BUSY` |

- [D] **Paths in use.** The host keeps a small table of paths it holds open or writes (the reader's
  book: every book a plugin holds open through `core.document` op 1 `open`, from the `open` until
  that document ends, counted per path; an `open` whose hold cannot be taken is `ERR_FULL`; DEV's
  staged copies, NET's save files and `.pp-staged` files, NET's request bodies while
  they arrive). A change to such a path, to a folder holding one, or a move onto one answers
  `ERR_BUSY` and changes nothing; the plugin tries again later. This holds for the `core.files` ops
  and for the file slots alike: `storage.write`, `append`, `rename` and `remove` (slots 22-25) on a
  path in use are `ERR_BUSY`, so no plugin frees clusters the host still reads or writes. Reading
  (`size`, `read_at`, `list`, `stat`) is never busy.

- [D] **No card.** Every root-0, root-1 and root-2 call answers `ERR_IO` while the card is away
  (both live on it on the X4). A plugin that shows the card's state asks `stat` of root 1 `""` (the
  `files` plugin's probe): `OK` is present, `ERR_IO` gone. Interface 6's `StorageError::CARD_GONE`
  maps here.

## 4. Uninstall and the data folder (decision 124)

- [D] Removing a plugin asks the user whether to delete its data folder (root 0); the default is
  to keep it. Kept, it is found again when the plugin is installed again.
- [D] The host deletes only `.paperpaw/plugins/<id>/` resolved from the validated id (non-empty,
  not `.` or `..`), never a path a plugin gave, compared exactly (removing `battery` leaves
  `battery-plus/`); an empty or unresolvable id is a refusal, never the data root. It first renames
  the folder into a kernel-owned `.removing` folder and removes it there, finishing at the next
  start after a cut, so a cut never leaves other plugins' folders touched (Senior reviews the kernel
  PR; Core's handoff, section 7).
- Root 2 (the install folder) goes with the plugin, always.

## 5. Memory

- Host: no heap per call. A path is checked and joined in a stack buffer of at most 640 bytes, as
  slots 20-26. `list` writes rows into `out` as the storage visits entries, at most 4,096 bytes; a
  row that does not fit ends the page there (its place is `next`), so no row is cut and nothing is
  held between calls. `remove_tree` keeps no state between calls beyond the `next` it hands back,
  and reads at most 256 folder entries and removes at most 64 per call, plus at most 3 entry reads
  per level going down (at most 256 levels, 768 reads). On FAT the walk keeps only the folder
  being emptied and its entry in the parent, never a stack of folders.
- Plugin: a page is at most 4 KiB; the SDK decodes it with the generated stream decoder.

## 6. Who uses what (first-party, interface 6 audit)

| Op | Plugins |
| --- | --- |
| `list` | dictionary, file-manager, koreader, notes-vault (with the cursor), picture-home, sleep, store, transfer, update, vocabulary |
| `stat` | most (`exists`, `size`, `modified`): file-manager, files, koreader, notes-vault, picture-home, sleep, vocabulary, wallabag |
| `space` | store, transfer (room checks), file-manager (`ignores_case`) |
| `make_dir` | file-manager, files, koreader, news, notes-overview, notes-vault, read-later-cloud, store, transfer, update, vocabulary, wallabag |
| `remove_tree` | dictionary and format-xtc (caches), file-manager, transfer (user folders), picture-home, update |
| `move` | koreader (`.sdr` folders), update (a fetched folder), file-manager (folders and files), news, read-later-cloud, wallabag, transfer (data folder to card), files, store |
| root 2 | vocabulary (`data/phone.txt`), reading-goal (`pictures/`), widgets (`data/quotes.*.txt`) |

Uses the audit found that are **not FS**, and where they go:

| Interface 6 use | Plugins | Interface 7 |
| --- | --- | --- |
| The kernel's annotation store (`.paperpaw/…/annotations`) | notes-overview, wallabag | LIB annotations (`library.md`) |
| The library's index, `books_in`, `tell_moved`, `changed` | file-manager, files | LIB catalog and `move`/`delete` |
| `.paperpaw/boot.txt` | update | DEV `firmware` (op 3) |
| `.paperpaw/tmp/` | transfer | root 0 |
| `plugins/` (staging, `.next` folders) | update, store, transfer | DEV install commands (the host stages) |
| Downloads written to a file | store, update, wallabag, news | NET (download to a root-0 file) |
| Copying a file | koreader, vocabulary, file-manager | the SDK's `files::copy` over `read_at`/`append` |

- Settled with Plugin: **about** embeds its licence texts in its own code; reading
  `plugins/fonts-default/` happens only at build and in tests, so root 2 needs no reach into
  another plugin's folder. **file-manager** moves books the library knows through LIB's `move`
  (journalled, keeps positions) and other files through root 1 `move`. Plugin's condition: the
  host's LIB move also covers folders mixing books and other files, books not yet catalogued,
  folder settings and reader assignments, and says what a move that stopped part of the way
  left; that is a LIB follow-up (`library.md`, section 7).

## 7. Handoffs (host side, after approval)

- **Core:** `core.files` backend over the platform `Storage` (ops 1-6), root 2 resolution (stamped
  install folder, read only), `ERR_DENIED` for root 1 without `uses.storage` on slots 20-26 too,
  the root-1 identity exclusions in `list` and every op, the folder-move `..` update and a cut test
  for it, the paths-in-use table and `ERR_BUSY` (section 3); the uninstall data removal of section 4
  (its own PR, Senior reviews).
- **Core or Kernel, FAT (`crates/paperpaw-fat`):** a bounded tree removal. Today's code collects all
  names of a folder on the heap before removing them, which is unbounded on the X4. It becomes a
  walk from a 64-bit place that reads at most 256 entries and removes at most 64 per step, with no
  heap per entry, and hands back the place (`remove_tree`'s `next`). The uninstall removal
  (section 4) uses the same walk, so removing a plugin with a 50,000-file data folder never needs
  the names in memory. The walk only goes down from `path`, never up by `..`, and checks a place
  is below `path` before using it. Tests: a folder over the read cap is removed in several calls, a
  stale place starts over, a place naming a folder outside `path` removes nothing outside it, a
  folder whose `..` still names its old parent (a cut during a move) is removed without touching
  that parent, and a cut after every removal leaves a whole rest.
- **Core:** `ERR_BUSY` from the paths-in-use table on slots 22-25 as on `core.files` (section 3).
- **Host Engineer (LIB host):** the library following root-1 moves (section 2.6): books below the
  moved path, catalogued or not, keep their data under the new key; folder reader assignments and
  folder-valued settings follow; the book-moved events; the journal entry before the rename and
  the bounded main-loop job after it, finished at start, `ERR_BUSY` and lookups through the entry
  while it runs. Tests: a cut right after the rename, a cut that leaves both names (repair first,
  the entry kept), a book opened during the job keeps its position, a 1,000-book folder move that
  answers within one bounded call, replaying a half-done job, and file-manager's cases
  (`plugins/file-manager/src/lib.rs:873`, `crates/paperpaw-sdk/src/library/mod.rs:1221`).
- **Kernel (records step):** the optional `cursor: u64` on `service.end` (52), `fs_entry.name` 765,
  the u64 cursors.
- **Services:** SDK facade `native::files` (typed `list` pages with the cursor, `stat`, `space`,
  `make_dir`, `remove_tree` looped to done, `move`), the root enum, and `files::copy` over
  `read_at`/`append`.
- **Plugin:** ports use root 2 for shipped data and declare `uses.storage` where they use root 1.
