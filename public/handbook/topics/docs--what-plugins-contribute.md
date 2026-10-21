## What plugins contribute

| Contribution | Registrar | What it is |
|---|---|---|
| Actions | `add_action` | Something to do, bound to buttons and gestures, listed in menus |
| Screens | `add_screen` | Full screens and overlays (menus, dialogs, panels) |
| Slots | `add_slot`, `bind_slot` | Roles a screen fills: home, reader, library, menu, settings, keyboard, dictionary, … |
| Menu entries and sections | `add_menu_entry`, `add_menu_section`, `place_menu_entry`, `hide_menu_entry` | Actions, settings and submenus in any menu, by order or beside other entries (`MenuPlace`: after, before, in a section, first, last); another plugin's entry taken out. A menu the user redefined shows entries added later too |
| What entries show now | `set_item_state`, `describe_item` | A label, a switch, faint, hidden or a badge of the plugin's own entries as things are now (`ItemState`); a line under an entry |
| Icons | `add_icon` | The icon of an action, setting group or menu; of a semantic icon (`icons::BACK`, `NEXT`, `SHIFT`, …) for a theme; `U+F8000` names a code point of one's own |
| Settings and groups | `add_setting`, `add_setting_group` | Shown and saved by the kernel |
| Setting defaults | `set_setting_default` | New defaults for other plugins' settings (themes) |
| Event handlers | `subscribe` | React to events |
| Key maps | `add_keymap`, `add_keymap_preset`, `add_keymap_when` | What buttons, taps and swipes do; bindings that apply while a switch is on |
| Formats | `add_format` | Open a kind of file as a document to read; big pictures may be decoded when their page shows (`Document::prepare_image`); files without a known extension told by their first bytes (`FormatSpec::sniff`); the format's own settings in `OpenOptions::setting`; a document still coming says `DocumentError::NotReady`, then `events::DOCUMENT_READY` |
| Lookup providers | `add_lookup_provider` | Where words are looked up (a glossary, a translator, Wikipedia): the dictionary's panel lists every provider's entries, those that go online when asked; an entry may open a screen with more of it (`LookupEntry::more`) |
| Reading apps | `add_reader` | A screen of the plugin that reads books of some formats (a comics reader), offered where books open and chosen per format, folder or book |
| Voices | `add_voice` | Speak text aloud in place of the system's voice, for the languages it speaks, chosen with `settings::VOICE` |
| Fonts | `add_font`, `add_font_file`, `bind_font` | Fonts and the roles they fill |
| Hyphenation | `add_hyphenation` | Patterns for a language |
| Text filters | `add_text_filter` | Change a book's text before it is laid out |
| Decorators | `add_decorator` | Mark words on book pages (a background, a line, a frame), drawn the same by every reader |
| Page layers and frames | `add_page_layer`, `add_page_frame` | Draw on book pages beside the words, with room of one's own; set pages in columns |
| Input filters | `add_input_filter` | See every button and finger first: pass it, take it, or run an action instead |
| Refresh filters | `add_refresh_filter` | Change how the panel is refreshed, e.g. in full on a screen of your own |
| Status items, lines and places | `add_status_item`, `add_status_line`, `add_status_place` | What status lines show, what a tap on an item does, how much it matters where a line is full; places where items show (`status::Place`) |
| A look | `set_ui_look` | Another look for switches, the focus, separators, buttons, headers, button hints, progress bars and sliders on every screen (`ui::look`) |
| Widgets | `add_widget` | Blocks for the home screen and the sleep screen |
| Setup steps | `add_setup_step` | A page of the first-run setup: a setting to choose or a screen of the plugin's, where the device needs it |
| Services | `publish` | Anything one plugin offers others, found with `env.services.get` |
| Contributions | `contribute` | Additions to a point another plugin defined |
| Translations | `add_translations` | Catalogs for any language |
| Book data | `add_book_data` | Where the plugin keeps something for each book (named by `library::key`): moved and removed with the book, cleaned up when it is gone |
| Book fields | `add_book_field` | A value kept with books (`library::set_field`), shown on their information page and, where `in_catalog`, kept in the catalog to filter by |
| Book badges | `add_book_badge` | A few letters or an icon on books' rows in views of the library |

Slots are how a plugin replaces another: bind your screen to
`core.home` and it is the home screen; the user's
`[slots]` configuration has the final word. Built-in slots are in
`builtin::slots`, built-in menus in `builtin::menus`: the main menu
(`core.main`), its tools (`core.tools`) and the settings' pages
(`core.settings-pages`).

```rust
// A home screen of one's own: preferred over the shipped one.
r.add_screen(ScreenSpec::new(SHELF, "shelf.title", Box::new(|env, _| Box::new(Shelf::new(env)))))?;
r.bind_slot(slots::HOME, SHELF, Priority::PREFERRED)?;
```

### What a slot's screen does

A screen bound to a standard slot takes the parameters the others open
it with and answers as they expect, so that every plugin works with it:

| Slot | Opened with | The screen |
|---|---|---|
| `core.home` | nothing; at the start and by `actions::HOME` | is the bottom of the stack: opened again, the screens above it close. It leads to the menu and the library by touch and by buttons alone. |
| `core.library` | nothing; by `actions::LIBRARY` | opens a book with `readers::open` (the reading app chosen for it). For a book it offers the menu `menus::BOOK`, as `Menus::shown_items` has it: when an entry is chosen it emits `events::BOOK_CHOSEN` with the book, then runs the entry's action. |
| `core.settings` | nothing: the groups; `params::ID`: the settings of that group; `params::FOCUS`: the page of that setting, focused on it | changes settings with `Command::SetSetting`, and a setting with an editor (`SettingExtra::editor`, a screen or a slot) by opening that (`Editor::open`). |
| `core.menu` | `params::MENU`, the menu; `params::HIDE`, entries to leave out this time | shows `env.menus.items(menu)`; for an entry chosen it closes (`Command::Back`) and runs its action (`Command::RunAction`); a setting listed there it changes, or opens its editor. |
| `core.choose-folder`, `core.choose-value` | `params::ID`, the setting | writes the folder, or the value, chosen to the setting. Name the slot as the editor (`SettingExtra::editor_slot`) to have it edited there by whichever plugin fills it. |
| `core.choice` | `params::TITLE`, `PATH` (what it is about), the options, `REPLY`; asked with `ask::choice` | shows the options; for one chosen it closes and emits the reply as a `Picked` with the option and `path`; *Back* or a tap outside closes without one. |
| `core.keyboard` | `params::TITLE`, `TEXT` (to start from), `MODE` (`text`, `number`, `password`), `REPLY`, `LIVE` | on confirming, closes and emits the event named by `reply` as a `Typed` with all of its parameters; with `live`, on each change too, with `Typed::typing` set; *Back* closes without an answer. `ask::text` asks this way. |

The documentation of `builtin::slots` says the same for every slot.

### Which one wins

- **Slots.** The screen the user chose in `[slots]`; else the binding
  with the highest `Priority` (`FALLBACK`, `DEFAULT`, `PREFERRED`, or
  any number); between equal priorities, the one registered later,
  that is of the plugin loaded later.
- **Key bindings.** A later source overrides an earlier one for the
  same button or gesture: the plugins' `add_keymap`, in the order the
  plugins load; then their `add_keymap_when` while its switch is on, so
  these override the plugins' plain bindings; then the device's, the
  preset the user chose, and the user's own `[keymap.*]`. A plugin's
  binding never overrides the device's, the preset's or the user's.
- **Menus.** Entries in their `order`, equal orders in the order they
  were added; a menu the user redefined in their order, with entries
  contributed since after their neighbour.

### Examples

A format: files with these extensions open as a `Document`.

```rust
r.add_format(FormatSpec::new(
    Id::new_static("notes.format"),
    "notes.format",
    vec![Cow::Borrowed("note")],
    Box::new(|storage, path, _options| Notes::open(storage, path)),
))?;
```

A status item: what a status line shows, `None` to hide it; tapped, it
opens the notes. Where a line is full, items of a low priority give way
first.

```rust
r.add_status_item(
    StatusItemSpec::new(
        Id::new_static("notes.count"),
        "notes.count",
        Box::new(|env, _| Some(StatusValue::Text(count(env).to_string()))),
    )
    .tap(|_, _| Some(Command::OpenScreen(Id::new_static("notes.list"), Params::new())))
    .priority(96),
)?;
```

An input filter: it sees every button and finger first.

```rust
r.add_input_filter(InputFilterSpec::new(
    Id::new_static("lock.filter"),
    "lock.filter",
    Box::new(|env, _input| if locked(env) { InputVerdict::Take } else { InputVerdict::Pass }),
))?;
```

A request and its answer: the reply event brings the `HttpReply`.

```rust
const FETCHED: Event<HttpReply> = Event::new("news.fetched");
// In an action or a screen:
out.push(Command::Http(HttpRequest::get("https://example.org/feed", &FETCHED)));
// When registering:
r.on(FETCHED, |_env, reply, out| {
    if reply.status == 200 {
        out.push(Command::Notify(headline(&reply.body)));
    }
})?;
```

A timer: the work's event comes at that time, here each hour.

```rust
const TICK: Event<()> = Event::new("weather.tick");
out.push(Command::Work(
    Work::at(&TICK, env.now.add_millis(60 * 60 * 1000)).every(Duration::from_secs(3600)),
));
r.on(TICK, |_env, _, out| out.push(Command::Http(HttpRequest::get(FORECAST, &FETCHED))))?;
```

### What every reader offers

A plugin that works with books never names the reader plugin: it uses
what `builtin` defines for every reader, so a reader of one's own (bound
to `core.reader`) replaces the shipped one in full. A reader of some
formats only registers as a reading app instead (`readers::ReaderSpec`,
`Registrar::add_reader`): books open in the app chosen for them, and
whatever opens a book opens it with `readers::open(path)` (never by
opening `slots::READER` itself). The reader chooses with
`readers::ask_once` (*Open with …* in the book menu: this time, or kept
when asked; plugins add other ways to open a book to `menus::OPEN_WITH`),
`readers::ask` (a book's or a folder's reading app, kept) and in the reading
settings (`settings::READING_APP`, and one per format that more than one
app reads). A reading app's screen is its own; one that cannot open a
book after all answers `readers::cannot_open` instead of an error of
its own, and the next app in that order opens it. One reading app is
open at a time. What moves folders calls `readers::folder_moved`, so
that their choices go along; a shell opens a book with
`Kernel::open_book`.

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
| Pages that go right to left | `Metadata::direction` (`PageProgression`), `Screen::mirrored` | readers mirror taps and swipes (an EPUB's `page-progression-direction`) |
| Status lines' settings | `groups::STATUS_LINES` | the group readers put them in |
| Reading aloud's settings | `setting_sections::ALOUD` | the section readers and shells put them in |
| Key bindings while reading | the layer `[keymap.core.reader]` | the slot's layer, whichever screen fills it |

A reader in turn sends the reading events (`BOOK_OPENED`, `PAGE_TURNED`,
`BOOK_CLOSED`, `BOOK_FINISHED`), takes `GOTO`, and offers its actions
in these menus.

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
`layout::wrap_lines_hyphenated` breaks lines of one's own as pages do.

A text filter that needs to know where a block is, or leaves blocks out
(a web page's adverts, printed page numbers in a book), is a block
filter: `TextFilterSpec::block` gets a `FilterContext` (the book, its
language, the place) and answers `Verdict::Keep` or `Verdict::Drop`.

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


### Services and points of your own

A plugin can offer others more than the kernel knows of. A service is
any value published under an id in its namespace, usually a trait
object whose trait the plugin's crate exports; others use it when it is
there and do without it when not:

```rust
// The publishing plugin.
r.publish(WEATHER, Box::new(Forecast::new()) as Box<dyn Weather>)?;

// Any other plugin, wherever it has an `Env`.
if let Some(weather) = env.services.get::<Box<dyn Weather>>(WEATHER.as_str()) {
    let today = weather.today();
}
```

A service is found by its type's name too, so native code plugins built
apart from the firmware find it (see *Plugins as files* below). When
the type of a service changes, give it a new id (`weather.forecast-2`):
its name alone would not tell.

A point is an id a plugin names, with what a contribution there is in
its documentation (for example one line per entry); others add to it
with `r.contribute(point, text)`, and the plugin reads
`env.services.contributions(point)`, each with the plugin it came from.

### Marks in the text

A plugin marks words on book pages with a decorator (ADR 0021): it gets
the words of a page with their places in the book and gives back ranges,
each with a *role*. The reader draws them; the plugin knows neither the
reader nor the panel.

```rust
use paperpaw_sdk::decorations::{self, Decorated, Decoration, DecoratorSpec, LineKind};

const LEARNING: Id = Id::new_static("vocabulary.learning");

// The role: its look is settings (Settings, Marks in the text), the
// plugin gives the default; themes and users change it.
decorations::add_role(r, &LEARNING, "vocabulary.role.learning",
    Decoration::NONE.line(LineKind::Dotted))?;
r.add_decorator(
    DecoratorSpec::new(Id::new_static("vocabulary.words"), "vocabulary.decorator",
        |env, page| {
            page.words
                .iter()
                .filter(|w| is_learnt(env, w.text))
                .filter_map(|w| Decorated::words(core::slice::from_ref(w), &LEARNING))
                .collect()
        })
    .switch(&MARK)          // a bool setting turns it on and off
    .taps()                 // taps on its marks come back
    .signature(|env| words_changed(env)),
)?;
r.on(events::DECORATION_TAPPED, |env, tapped, out| { /* tapped.text */ })?;
```

- A `Decoration` is a background, the text's ink, a line under the text
  (solid, dotted, dashed, wavy, double) with its tone and thickness, a
  frame, struck through; tones are named, and each panel shows them as
  well as it can (colours, or their lightness, dithered where there are
  few grays).
- Each aspect of a role is a setting of its own (`<role>.background`,
  `.ink`, `.line`, `.line-tone`, `.thickness`, `.frame`, `.struck`), so
  profiles, rules and themes set them like any other.
- Decorators are asked once a page is laid out, and again when their
  signature changes (their data, their settings): keep it cheap, and
  never work on a whole book.
- Where marks meet on a word, the earlier decorator (by `order`) wins an
  aspect both set; the rest combine.
- The reader's own marks are roles too: `roles::HIGHLIGHT`, `LINK`,
  `SEARCH_HIT`, `ALOUD`. A reader of one's own draws all marks with
  `decorations::draw_behind` and `draw_over`.
- What changes widths (bold, a larger size) is a text filter instead: it
  lays the page out again.

Words found by patterns need no code of one's own:
`decorations::PatternDecorator` marks what its patterns
(`paperpaw_sdk::pattern`, a small part of regular expressions: classes,
`\b`, repeats, `|`, groups, `(?i)`, with bounded work) find on the page's
text, each in its role:

```rust
let names = PatternDecorator::new()
    .rule(Pattern::new(r"\b(?:Mr|Mrs|Miss)\. [A-Z]\w+").unwrap(), NAME)
    .into_spec(Id::new_static("tale.names"), "tale.names");
r.add_decorator(names)?;
```

A plugin without code does the same with a `marks.ini`, a section per
role (`<plugin>.<section>`), its patterns and its look:

```ini
[names]
title = Names
pattern = \b(?:Mr|Mrs|Miss)\. [A-Z]\w+
background = yellow
line = wavy
```

Any plugin can read the words of the page shown, not only decorators:
`reading::ask_page_words(&MY_WORDS)` asks the reader, which answers with
the event `MY_WORDS`, a `reading::PageWords` (the book, the page's start
and end, its words with their places).

### Drawing on the page

A page layer (`layers::PageLayerSpec`) draws on every page a reader
shows: side notes, a reading ruler, change bars. It may reserve room at
a side of the text, which is then laid out without it, and it hears
taps on that room (`events::PAGE_LAYER_TAPPED`, also when the room is
chosen with the buttons, as links are):

```rust
use paperpaw_sdk::layers::{PageLayerSpec, Side};

r.add_page_layer(
    PageLayerSpec::new(Id::new_static("notes.margin"), "notes.margin", |canvas, env, page| {
        let Some(room) = page.room else { return };
        for line in page.lines.iter().filter(|l| has_note(env, page.path, l.start)) {
            canvas.fill_rect(room.x.into(), line.area.y.into(), 4, line.area.height.into(), Color::BLACK);
        }
    })
    .reserve(|env| Some((Side::Right, env.metrics.mm(8) as u16)))
    .taps(),
)?;
```

- `page` (`PageView`) has the book, the page's start and end, the
  text's box and columns, its lines (`LineBox`: where each is and what
  it holds), the status lines and the layer's room.
- Layers draw what they know from memory, on some devices once for every
  band of the page: they read nothing from storage there. Those of an
  order below 0 are drawn behind the text.
- A layer whose drawing changes while the page stays asks for the
  screen to be drawn again (`Command::Redraw`).

A frame (`layers::PageFrameSpec`) sets the text in columns: two
columns, two pages side by side. The setting `core.page-frame` (each
book may have its own) offers every frame by its id, named by the
translation of the id:

```rust
r.add_page_frame(PageFrameSpec::columns(Id::new_static("columns.two"), 2, 24))?;
```

### Widgets

A widget is a [`Widget`] a screen makes and keeps
(`env.widgets.make`): it reads what it shows in `update`, which the
screen calls when it shows the widget, about each minute and after
events, and only draws in `draw` (which runs for every band of a
frame). The screen tells it where it goes (`place`) before drawing it
there: what is made for that size, such as a cover made small
(`ui::Thumbnail`), is made then, and again in `update` when what it
shows changed. Register it with `WidgetSpec::new(id, title, factory)`; a widget
with nothing to read, such as a clock, is a pair of functions
(`WidgetSpec::drawn` with `Drawn::new(height, draw)`, and `shows` to be
drawn again when what it shows changes). A widget whose content changes
only after events (books, settings) says so (`live` false) and is not
read again each minute; one that can be drawn smaller says how small
(`min_height`), so that a grid fits it where its full height has no
room. `widgets::grid` puts widgets
and tools in a grid as the home screen does, edited in place
(`GridView`). Say which kind a widget is
(`.category(widgets::categories::TIME)`, or `BOOKS`, `READING`, `WORDS`,
`PERSONAL`, `WORLD`, `DEVICE`): the home screen offers widgets by their
kind, each drawn as it would show.

### Widgets with settings

A widget may have settings of its own, such as where its text sits. Put
them in a settings group with the widget's id
(`widgets::settings_group`); the settings list leaves such groups out,
and the home screen's editor offers them as the widget's *Settings*. For
the alignment there is a ready setting: register
`widgets::align_setting(&id, Align::Left)` and place each text with
`widgets::align(env, id).x(area, width)`.

Widgets of all plugins share a look the reader shapes for each, so that
they sit well together on a page: give yours a frame and draw in it.

```rust
const ID: Id = Id::new_static("my.card");
static SETTINGS: [SettingSpec; 4] = [
    widgets::align_spec("my.card.align", ID, Align::Left),
    widgets::frame_spec("my.card.frame", ID, Frame::None), // none, line, light or dark card
    widgets::size_spec("my.card.size", ID, Size::Medium, true), // true: also "as large as it fits"
    widgets::part_spec("my.card.author", ID, "my.show-author", true),
];
r.add_setting_group(widgets::settings_group(&ID, "my.card"))?;
r.add_settings(&SETTINGS)?;

fn draw(&self, canvas: &mut Canvas<'_>, env: &Env<'_>, area: Rect) {
    let look = widgets::draw_frame(canvas, env, ID.as_str(), area);
    let rest = widgets::draw_caption(canvas, env, ID.as_str(), &look, "Today");
    let size = widgets::size(env, ID.as_str()).text(&UiStyle::new(env));
    // ... the content in `rest`, in `look.ink` (and `look.faint` for
    // what matters less), never in a fixed black: on a dark card it is
    // light.
}
```

A widget may be placed more than once, each placement with its own
values of the widget's settings: the home screen places a clock as
`widgets.clock@1` and `widgets.clock@2`, whose frames are the settings
`widgets.clock@1.frame` and `widgets.clock@2.frame` (saved like any
other, the widget's own `widgets.clock.frame` where one sets none).
`env.widgets.make` gives a placement's widget, which reads its settings
by their usual ids and gets that placement's values
(`Settings::with_placement`); a widget need do nothing for it. Screens
of their own that place widgets use `Id::placement` and forget a
placement's values when it goes (`Settings::placement_values`).

`widgets::shows(env, id, "author")` reads a part's switch,
`widgets::choice` makes other choices of the widget's own, and
`widgets::draw_message` says kindly what is not there yet. A widget's
`height` counts its frame (`widgets::look::look` gives the area inside
it without drawing). For round things there are `Canvas::fill_circle`,
`stroke_circle`, `fill_ring` (arcs, e.g. a progress ring) and
`draw_hand`, with angles as on a clock face (`paperpaw_sdk::round`);
light grays are drawn with `fill_shaded` or `fill_round_shaded`, which
dither them on black and white panels.

Screens that place widgets one below the other should know the kernel's
two widgets for room between them: `widgets::SPACE` is an ordinary
widget, a gap; `widgets::FILL` has no height of its own and takes its
share of the room the others leave (`widgets::fill_height`). Both may
be in a list more than once (`widgets::repeatable`).

### Presets and home screen layouts

A preset is a ready-made set of setting values chosen as a whole
(`paperpaw_sdk::presets`), such as a layout of the home screen. It has a
kind, named by the plugin that offers such presets: the home screen
offers those of `home.layout` in its chooser (in the first-run setup,
and under *Add* while editing it), shows each on itself before it is
kept, and applies the one chosen. Add presets kept in the program with
`Registrar::add_presets` (a `static` list of `Preset::fixed`), for your
own kind or another plugin's:

```rust
static LAYOUTS: [Preset; 1] = [Preset::fixed(
    "my.nook",
    "home.layout",
    "my.nook",      // translation keys of its name
    "my.nook.help", // and of a sentence on it
    "home.page-1 = widgets.word-clock@1 0/0 4x2, home.continue@1 0/2 4x2
home.rows = 6",
)];

r.add_presets(&LAYOUTS)?;
```

A layout sets the pages (`home.page-1` to `home.page-4`, as
`widgets::grid` writes them) and whatever of the home screen's look it
wants (`home.columns`, `home.rows`, `home.status-bar`,
`home.footer.dots` ...); what it leaves out goes back to its default.
Widgets placed as `id@1` have settings of their own in it
(`home.recent@1.count = 8`), so a layout gives them their looks without
touching the widget's other placements. To offer presets of a kind of
your own, list them (`env.settings.presets().of_kind(kind)`), work out
what one changes (`Preset::changes` with the settings it covers), show
it (`Command::PreviewSettings`: the values show on every screen without
being kept, until the screen that asked closes) and keep it
(`presets::commands`).

A theme is a preset of the kind `core.theme` (`presets::THEME`): values
for the appearance settings. Where any plugin brings one, the
appearance settings begin with *Theme*, which lists them; the one
chosen gives the appearance settings its values and those it leaves
out their defaults, so two themes installed never fight. A data plugin
brings themes in its `presets.ini`:

```ini
[paw]
kind = core.theme
name = Paw
description = Round and friendly: a frame for the focus, no lines.
core.ui-corners = core.corners.soft
core.ui-focus = core.focus.ring
core.ui-separators = core.separators.none
```

### Passwords and keys

Plugins keep passwords, API keys and tokens with
`Command::SetSecret(SecretChange::keep(id, label, value))` and read them
with `env.secrets.get(id)`. They are all listed in *Settings, Passwords
and keys*, where the user changes or removes them. Ask for one on the
keyboard in password mode (`params::MODE` `password`); the keyboard
offers to type it on a phone. They are kept apart from the settings and
not readable at a glance, but not encrypted: the devices have no safe
place for a key. A plugin sees its own alone: name them in its
namespace (`myplugin.token`); `env.secrets.get` gives another plugin's
none, and `env.secrets.listed()` names every secret without its value.
A setting marked `secret()` is kept the same way. Native code is not
sandboxed and could go past this; the SDK hands no plugin another's
secret.

### The network

`Command::Http(HttpRequest::get(url, &FETCHED))` makes a request where
the device has a network (`env.caps.network`); the answer comes as the
request's reply event, an `HttpReply` with the status and the body, or
saved to a file (`.save_to(path)`) for large ones. A request may set a
`timeout`, the answer's headers it wants back (`want_headers`) and the
longest body kept in memory (`max_body`, by default 64 KiB on small
devices). Every request is answered once, also when it is refused
(`HttpReply::refused` says why and when to try again). The manifest says
that the plugin uses the network (`uses: Uses::NETWORK`); without it,
requests are refused. In Offline (`env.power`), only what the reader went
online for goes out: a screen that needs the network says so on itself
and offers *Go online*, which sends `Command::GoOnline` (the network for
that screen until it closes); anything else is refused with
`Reason::Offline` and may try again on `events::WORK_ALLOWED`.
`Command::CancelHttp` takes requests back.

### Work in the background

What a plugin does on its own, not because the reader just asked for
it, it declares as work (`paperpaw_sdk::work`, ADR 0025), and the
kernel runs it at the moment that costs least: waking, a book opened or
closed, going to sleep, the radio on anyway, charging, idle.
`Command::Work(Work::network(PUSH).within(Duration::from_secs(1800))
.at_moments(Moments::BOOK_CLOSED | Moments::SLEEP))` sends the reading
position when the book is closed or the device sleeps, at the latest
after half an hour; the kernel then emits the work's event and the
plugin makes its request. `optional()` work (weather, headlines) runs
only while that is cheap, and never brings the radio on by itself.
`Work::at(event, time)` is a timer, `every` repeats, `key` tells
several works of one event apart, `Command::CancelWork` takes one back.
`env.reader` says whether what is handled is the reader's own doing: an
action the reader ran acts at once, the same action run by a rule
declares `Work::when_cheap(id, within)` instead and waits for a good
moment.
Long work in steps (an install, a catalog walked) registers its step
function (`r.add_work(WorkSpec::new(id, title, step))`) and is stepped
between frames. `env.work` says where a work stands, for the plugin's
own page; background work never shows a notice over reading. The power
mode (`env.power`) makes deadlines longer or holds network work back;
most plugins need not read it.
Read large JSON answers as they stream with `paperpaw_json::stream`
(the crate `paperpaw-json`), so they
need little memory. `Command::Serve` serves HTTP to the local network,
e.g. for transfers from a computer or typing on a phone; what happens
to it comes as `ServerNotice`s, and to sockets (`Command::Connect`,
`Command::Broadcast`) as `SocketNotice`s.

### Firmware updates

Where PaperPaw is the device's firmware (the X4), `env.firmware` says
which version runs and how an install goes; elsewhere it is `None`.
`Command::Firmware(FirmwareCommand::Install { path, key, older })`
installs a signed update file: `key` is the key of one not signed by
PaperPaw that the reader accepted, shown its fingerprint, `older` that
they chose one not newer than the running firmware
(`firmware::Update::may_install` is the shell's check).
`FirmwareCommand::Restart` restarts into it once
`FirmwareState::Installed`; `events::FIRMWARE_CHANGED` comes on the
way. `firmware::Update::read` tells what a file holds before. The
`update` plugin does all this for update files on the card; a plugin
that fetches updates from somewhere else only needs to put the file
there.
