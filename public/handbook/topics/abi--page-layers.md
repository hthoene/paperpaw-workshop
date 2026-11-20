# Interface 7: page layers (`reader.text@1`, `reader.layer@1`)

What a plugin adds to the reader's pages (#284, #261, ADR 0032): room above and below the lines,
words replaced, glosses, ruby and phonetics over or under words, small blocks inserted after a
paragraph, and drawing over a laid-out page. Interface 6 had these as `add_text_filter` and
`add_page_layer`; interface 7 has them as two stages the reader owns (`stages-services.md` 1),
so nothing of the plugin interface changed: no record, slot or shape of `abi.def`, and the
fingerprint is the one before. The schemas are `plugins/reader/stages/reader.text@1.def` and
`reader.layer@1.def`; the SDK has them typed as `paperpaw_sdk::native::page_layers` (its copy of
the schemas is `crates/paperpaw-sdk/stages/reader/`, kept equal by the quick check). The sample
`samples/interlinear` uses the text stage.

## 1. Principles

- **Default off.** Without a subscriber, or where no subscriber says it adds to the book, nothing
  changes: no block is asked, nothing is kept, the layout is the one before.
- **One plugin per stage and book.** The reader asks the book of each stage once when the book
  opens and when a setting of another plugin changes; the first subscriber in stage order that
  answers `uses` with a signature other than 0 is the one the stage is used with for that book.
  The reader then calls only it (`stage.run` from its cursor, SDK `Stage::run_from`) and checks
  that the reply comes from it; where another plugin is at its place, the stage is not used until
  the book is asked again.
- **Asked once, kept.** A block is asked once while the book is open, a page once after its
  layout. Page turns ask nothing they asked before (the snappy rule): the reader asks the blocks
  of a page ahead of its layout, applies the kept answers as the layout reads the blocks, and
  draws a page's kept layer with it.
- **Bounded.** Answers are at most 3,840 bytes and 64 records each. The reader keeps at most
  12 KiB of block answers (64 blocks, the oldest go first) and the layer answers of two pages
  (the one on show and the one before), and none of it where no plugin is used.
- **Signatures.** The text stage's signature (the plugin's `uses` folded with its registration's)
  is part of the layout's key and of the page index's file name: a plugin answers another one when
  what it adds changes (its settings), and the pages are laid out anew. The layer's signature
  only decides whether the kept pages are drawn again.

## 2. The text stage `reader.text@1`

Input, one record:

| Tag | Record | Fields |
| --- | --- | --- |
| 1 | `text.book` | `path: str 512` (the book's library path), `language: str 16` |
| 2 | `text.block` | `section: u32`, `offset: u32` (the block's start in the section's source), `kind: u32` (0 paragraph, 1 heading, 2 other), `text: str 3200` (the text as the layout sets it, cut at a character) |

Reply, at most 64 records:

| Tag | Record | Fields | What the reader does |
| --- | --- | --- | --- |
| 3 | `text.uses` | `signature: u64` | to `text.book`: the plugin adds to the book (0: it does not) |
| 4 | `text.room` | `above: u32`, `below: u32` | room above and below each of the block's lines, in hundredths of an em of its text, at most 400 each (`Block::leading_above`; below: an annotation without text, which the layout keeps as room alone) |
| 5 | `text.replace` | `from: u32`, `to: u32`, `with: str 256` | the byte range of the asked text shown as `with`; the block's places stay. Ranges off the text, off its characters or overlapping one before are left out |
| 6 | `text.gloss` | `from: u32`, `to: u32`, `kind: u32` (0 ruby, 1 phonetic, 2 gloss), `size: u32` (percent of the text, 20 to 100, 0 for 50), `text: str 1024` | an annotation of the range (`Block::annotations`); ranges refer to the text as asked, moved with the replacements before them; one on a replaced part is left out |
| 7 | `text.insert` | `text: str 1024`, `size: u32` (percent, 0 for the text's), `italic: u32` | a block inserted after this one (`Block::insert_after`: at most four, 4 KiB in all; no place of its own) |

Nothing of what crosses changed for this: `Block`, `Annotation` and `PageLine` have the fields
they had (their sizes are part of the fingerprint). The layout (`paperpaw-layout`, ADR 0032) sets
a block's annotations by its lines: ruby and
phonetics in the room above a line, upright, glosses in the room below, in italics; every line of
the block gets the room its annotations take, so its lines keep one distance. Each annotation
starts where its range starts; one that would run into the one before it on its side moves on
behind it, and what does not fit the line goes on at the start of the block's next line, at whole
words (a sentence's translation runs under the sentence); on the block's last line it is cut. A
translation that goes on over a page break is cut there. Lines that run right to left, go down a
column or put their runs in order get no annotations yet. The reader draws them with the reading
fonts, as measured.

## 3. The layer stage `reader.layer@1`

Input: one `layer.book` (tag 1, as `text.book`); or a tap or a key: one `layer.page` (no lines,
`first` = `lines`) and one `layer.tap` or `layer.key`; or a page: one `layer.page`, for a plugin that
follows reading aloud one `layer.aloud` while the book is read aloud, and up to 62 `layer.line`
records (a page of more lines, or of lines that do not fit 3,840 bytes, is asked in more than one
call, each from line `first` on).

| Tag | Record | Fields |
| --- | --- | --- |
| 2 | `layer.page` | `width: u32`, `height: u32` (the text area), `lines: u32` (in all), `first: u32` |
| 8 | `layer.aloud` | `line: u32`, `word: u32`, `end_line: u32`, `end_word: u32`: the words being read aloud, from word `word` of line `line` (lines counted on the page as `first` counts them, words as `words` counts them) to word `end_word` of line `end_line`, not included |
| 11 | `layer.tap` | `x: i32`, `y: i32` (from the text area's top left), `book: u32` (1: on the book's region), `section: u32`, `offset: u32` (where the page on show starts) |
| 12 | `layer.key` | `action: str 64` (`core.next`, `core.confirm`, …), `section: u32`, `offset: u32` |
| 3 | `layer.line` | `x: i32`, `baseline: i32`, `width: u32`, `size: u32` (its words' boxes' height), `leading: u32` (the room above, pixels), `top: i32` (its words' boxes' top; the room below a line reaches to the next line's `top - leading`), `section: u32`, `offset: u32` (its first word's place), `inserted: u32`, `text: str 512`, `words: bytes 510` (per word 6 bytes: `x`, `width`, `at` (its byte in `text`), u16 little-endian; a word whose box is not known is 0 wide at 0 and keeps its number) |

Positions are pixels from the text area's top left (the whole of it where a region is used).
Reply, at most 64 records:

| Tag | Record | Fields |
| --- | --- | --- |
| 4 | `layer.uses` | `signature: u64`, `aloud: u32` (1: the plugin follows reading aloud), to `layer.book` |
| 9 | `layer.region` | `x, y, width, height: u32`, to `layer.book` after `layer.uses`: the part of the text area the reader sets the book's text in, in thousandths of it (each side at least 100, inside the area; else not used) |
| 10 | `layer.input` | `taps: u32` (0 none, 1 those off the book's region, 2 all in the text area), `keys: u32` (1: every key action while the book is on show), to `layer.book` after `layer.uses` (before or after `layer.region`) |
| 13 | `layer.taken` | `redraw: u32`, to `layer.tap` / `layer.key`: the plugin takes it; with `redraw` 1 the drawing of this answer stands for the page's layer and the page is drawn again (partial refresh); without the record the reader acts on it as it would |
| 5 | `layer.box` | `x, y: i32`, `width, height: u32`, `fill, ink: u32` (gray 0 black to 255 white; 256 or more none), `thickness: u32` (frame, at most 64) |
| 6 | `layer.segment` | `x1, y1, x2, y2: i32`, `ink: u32`, `thickness: u32` (1 to 64) |
| 7 | `layer.text` | `x, y: i32` (pen and baseline), `size: u32` (pixels, 4 to 200), `ink: u32`, `italic: u32`, `text: str 256` |

The reader draws a page's layer over its text, under the reader's own highlights, in the order of
the records; boxes and lines larger than 4,096 pixels are cut. The first page of a book is asked in
the background step after it is shown (as the decorations), and drawn again with its layer.

- **Following reading aloud** (read-along, #377). A plugin that answers `aloud` 1 is asked the page
  on show again for each sentence read aloud, with its words in `layer.aloud`, and once more when
  reading aloud ends (without it); the page is drawn with the newest answer. The reader underlines
  the sentence only where its own setting says so: a plugin marks it as it likes (a frame or
  a line over the words: a layer is drawn over the text, so a filled box would hide them;
  `samples/read-along`). Speech is spoken by the sentence (`ui.md` 7, `event.spoken` at its end),
  so the words are a sentence's; a word-by-word mark needs the host to say where in a sentence
  the voice is, which interface 7 has not (section 5).
- **A region** (#284, a split page). With `layer.region` the reader lays the book out in that
  part of its text area only (the layout's key holds it: the pages are laid out anew when it
  changes); the status lines and the ribbon stay where they were. The layer draws on the whole
  area: in the rest of it, a second text (a translation set by the plugin, its lines broken with
  the host's fonts, `native::fonts::Font::measure_text`), notes, a picture. The lines of each page
  say where in the book they are (`section`, `offset`), and the text stage's blocks say the same
  for each paragraph, so a plugin follows the book with its own text: a page turn asks the layer
  of the new page, and the reader draws text and layer in one refresh. A second document: the
  plugin opens it as any opener does (`core.document`, `document.md`), lays it out with the SDK's
  layout (`paperpaw_sdk::layout`) and draws its lines as `layer.text`, finding the place that goes
  with the page from `section` / `offset` (its own map, e.g. by paragraph).
- **Taps and keys** (#284). With `layer.input` the plugin is shown taps in the text area (those off
  the book's region, or all) and key actions before the reader acts on them, while nothing is
  chosen (a selection, zoom and the status lines keep theirs). It answers `layer.taken` for what it
  takes, else the reader goes on as without it: a plugin that does not take `core.next` leaves
  page turns to the reader, and follows them with the next page's ask. Its own focus between
  regions, a button drawn in its part, a second text it scrolls: the plugin keeps that state and
  draws it anew with `redraw`, only the page being drawn again. Keys cost one call per key press;
  ask for them only where needed.

## 3.1 Anchored windows (#378)

The reader opens the lookup slots (`core.lookup`, `core.lookup-online`, `ui.md` slot table) with
the hand-over param `anchor`: `x,y,width,height` in the screen's pixels, the box of the looked-up
words in the first line they are in. An overlay that fills the slot places its window next to
that box (below it where there is room, else above) instead of at the bottom; one that does not
know the key ignores it. A plugin's own overlay opened from its layer takes the places it was
shown (`layer.line`, `words`) the same way, in its own params: no interface change is needed for
windows at a word.

## 4. Memory and time (X4)

- Without a plugin: nothing (`Layers` holds no heap), one `stage.run` per stage at a book's open.
- With a text plugin: the kept answers (at most 12 KiB), and while a page is laid out the reply
  buffer (3.9 KB) and one block's ask; each block costs one callback once per open book. A page
  whose blocks were all asked costs no callback.
- With a layer plugin: the answers of two pages (at most 3,840 bytes each), one callback per new
  page (more for a page of many lines), none for a page drawn again; for a plugin that follows
  reading aloud one more per sentence read (the page is drawn again for it anyway where the
  sentence is underlined); for one that asked for taps or keys one per tap or key press it is
  shown (the answer it draws anew replaces the page's kept one).

## 5. Not yet

- A word-by-word reading-aloud position (the host's speech says only when a sentence ends).
- A second document laid out and drawn by the reader in a region (the plugin sets its text there
  itself), and ui-kit widgets inside a region (a layer draws boxes, lines and text; a window of
  its own opens as an overlay, 3.1).

- Annotations on right-to-left and vertical lines; a gloss over a page break.
- More than one plugin per stage and book.
