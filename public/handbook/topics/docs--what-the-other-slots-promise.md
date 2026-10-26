### What the other slots promise

A screen bound to one of these slots replaces the shipped one; it is
opened with what the table says and keeps its promises, so the plugins
around it go on working.

| Slot | Opened with | Promises |
|---|---|---|
| `slots::HOME` | nothing | The start screen; where it lists things to open, it lists `menus::APPS` and `menus::TOOLS` |
| `slots::MENU` | `params::MENU`, `params::HIDE` (entries left out this time) | The menu's entries as `Menus::shown_items` has them, with their state and the line under them; runs an action, changes a setting in place, opens a submenu |
| `slots::PANEL` | `params::MENU` | The same as controls for quick changes (sliders, switches) |
| `slots::SETTINGS` | `params::ID` (a group), or nothing for all | The settings by group and `menus::SETTINGS`; a choice with fewer than two values is not listed |
| `slots::KEYBOARD` | `params::TITLE`, `TEXT`, `MODE` (`text`, `number`, `password`), `REPLY` | Emits the event `reply` with every parameter it was opened with and `text` set to what was typed; nothing when cancelled |
| `slots::LOOKUP` | `params::WORD`, `LANGUAGE` | The entries of every lookup provider that knows the language (`lookup`), those that go online only when asked; an entry's `more` opened on request, by touch and with the buttons |

Points of the shipped plugins, for `Registrar::contribute`:

| Point | A line each | |
|---|---|---|
| `keyboard.layouts` | `id; code; letter rows; variants`, e.g. `dutch.layout; NL; qwertyuiop asdfghjkl zxcvbnm; e=éèë` | a layout to choose, named by the translation of its id |
| `about.lines` | a paragraph (Markdown) | shown on *About PaperPaw*, below the address |

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
`layout::wrap_lines_kerned` breaks lines of one's own as pages do, with
the pairs `Typesetter::kern` gives (`ReadingFaces` kerns as it draws;
`FontHandle::kern`, `unkerned` and `ligatures` for text of one's own).
For a custom balanced layout,
`paperpaw_text::wrap_lines_balanced_kerned_with_cost` takes an
additional cost callback `(unused_width, spaces) -> f32` for non-final
candidate lines. For example, `|free, spaces| free * free / (spaces.max(1)
as f32)` adds a penalty for concentrating spare width in few gaps. The
ordinary raggedness and hyphen costs still apply; the existing balanced
functions keep their behavior. Readers using `PageType` and
`layout_page` already get bounded justification and matching break
selection. Their page indexes must use the current layout key;
`layout::VERSION` is a cache revision, separate from the native plugin
interface.
`PageType::patterns` gives the patterns of the page's language with the
letters the reader keeps before and after a hyphen (`HYPHEN_MIN_LEFT`,
`HYPHEN_MIN_RIGHT`; 0: the table's own, see
`hyphen::Patterns::with_minimums`); a reader of one's own hyphenates
with them.

A text filter that needs to know where a block is, or leaves blocks out
(a web page's adverts, printed page numbers in a book), is a block
filter: `TextFilterSpec::block` gets a `FilterContext` (the book, its
language, the place) and answers `Verdict::Keep` or `Verdict::Drop`.
