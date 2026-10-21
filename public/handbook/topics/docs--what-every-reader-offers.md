### What every reader offers

A plugin that works with books never names the reader plugin: it uses
what `builtin` defines for every reader, so a reader of one's own (bound
to `core.reader`) replaces the shipped one in full.

| What | Standard | |
|---|---|---|
| Show a place in the open book, a part marked | `events::GOTO` (`Goto`) | readers take it; tables of contents, bookmarks, search and syncs send it |
| Text chosen, and the action chosen for it | `menus::SELECTION`, `events::TEXT_CHOSEN` | add an action to the menu, hear the event |
| Notes exported as Markdown | `events::NOTES_EXPORTED` | for notes apps and syncs |
| The reader's menus | `menus::READER`, `READER_MORE`, `READER_PANEL` | add entries there |
| The type of pages | `settings::FONT_SIZE`, `FONT_WEIGHT`, `WORD_SPACING`, `LINE_SPACING`, `MARGIN`, `MARGIN_ENDS`, `JUSTIFY`, `HYPHENATE`, `INDENT`, `PARAGRAPH_SPACING`, `WIDOWS`, `ORPHANS`, `PUBLISHER_STYLES`, `FOOTNOTES` | the kernel's settings (each book may have its own), which readers read |
| The page's words | `events::PAGE_WORDS_WANTED`, `reading::PageWords` | readers answer `reading::ask_page_words` |
| Where a book was left | `positions::{load, save}`, `Reading::xpointer` with `BOOK_CLOSED` | readers keep it; syncs and lists read it without opening the book |
| The contents, search, the marks, a footnote, skimming | `slots::TOC`, `SEARCH`, `ANNOTATIONS`, `FOOTNOTE`, `SKIM`, `events::FOLLOW_LINK`, `SKIM`, `SKIMMED` | bind a screen of one's own; readers open the slots, follow the links and go where skimming asks |
| A book opened as the reader opens it | `reading::open_options`, `reading::conversion` | its places fit the reader's (a search, contents, an XPointer) |
| Status lines' settings | `groups::STATUS_LINES` | the group readers put them in |
| Reading aloud's settings | `setting_sections::ALOUD` | the section readers and shells put them in |
| Key bindings while reading | the layer `[keymap.core.reader]` | the slot's layer, whichever screen fills it |

A reader in turn sends the reading events (`BOOK_OPENED`, `PAGE_TURNED`,
`BOOK_CLOSED`, `BOOK_FINISHED`), takes `GOTO`, and offers its actions
in these menus.

A reader of one's own builds on the shipped one's parts in
`paperpaw_sdk::reading` rather than copying them: `FilteredDocument` (a
book through the plugins' text filters; kept `DroppedRuns` read the
blocks they leave out once), `PageIndex` (the starts of its
pages, kept on the device), and with the feature `unstable` (as the
layout, until 1.0) `PageType` (the page's box and type from the standard
settings, its layout key), `ReadingFaces` (the faces with the book's own
fonts and small capitals), `word_boxes`, `draw_lines` and `draw_image`;
`reading::note_text` is the text a footnote shows. The layout keeps at
least `Style::widows` lines of a paragraph at the top of a page and
`orphans` at the bottom (`Style::lines_kept`, from the settings
`WIDOWS` and `ORPHANS`; a paragraph that goes on whole takes its
heading along), and
`layout::wrap_lines_hyphenated` breaks lines of one's own as pages do.

A text filter that needs to know where a block is, or leaves blocks out
(a web page's adverts, printed page numbers in a book), is a block
filter: `TextFilterSpec::block` gets a `FilterContext` (the book, its
language, the place) and answers `Verdict::Keep` or `Verdict::Drop`.
