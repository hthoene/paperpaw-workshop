## What plugins contribute

Slots are how a plugin replaces another: bind your screen to
`core.home` and it is the home screen; the user's
`[slots]` configuration has the final word. Where several plugins offer
a screen for a slot, *Settings, Plugins, Screens* lets the reader choose
one (or *Automatic*, the plugins' order), and a plugin newly installed
that offers one asks once whether to use it now. `Env::slot_choice`,
`slot_title` and `screen_title` tell a screen of one's own the same.
Built-in slots are in
`builtin::slots`, built-in menus in `builtin::menus`: the main menu
(`core.main`), its tools (`core.tools`) and the settings' pages
(`core.settings-pages`).

### What a slot's screen does

A screen bound to a standard slot takes the parameters the others open
it with and answers as they expect, so that every plugin works with it:

The documentation of `builtin::slots` says the same for every slot.

### Which one wins

- **Slots.** The screen the user chose in `[slots]` (*Screens*,
  above); else the binding
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

### Pressing twice

A button, or a tap zone, can do one thing when pressed once and another
when pressed twice: bind the second as `double.<button>` (or
`double-tap.<zone>`) in a key map, in `paperpaw.ini` or on the device
(*Buttons and gestures*, "Buttons pressed twice"):

```ini
[keymap.global]
double.confirm = core.home
```

How quickly the second press must follow the first is the setting
*Double tap* (`core.double-tap-ms`, 300 ms; advanced). A button waits for
a second press only if something is bound to its double press, so the
buttons that have none respond at once. Where one is bound, the single
press is answered after that time instead of at once, as the second press
might still come. Chords (two buttons at once) are not built.

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

A status item: what a status line shows, `None` to hide it. A tap on
it runs an action of its own plugin, here one that opens the notes.
Where a line is full, items of a low priority give way first.

```rust
r.add_status_item(
    StatusItemSpec::new(
        Id::new_static("notes.count"),
        "notes.count",
        Box::new(|env, _| Some(StatusValue::Text(count(env).to_string()))),
    )
    .tap(Id::new_static("notes.open"))
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
out.push(Command::http(HttpRequest::get("https://example.org/feed", &FETCHED)));
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
out.push(Command::work(
    Work::at(&TICK, env.now().add_millis(60 * 60 * 1000)).every(Duration::from_secs(3600)),
));
r.on(TICK, |_env, _, out| out.push(Command::http(HttpRequest::get(FORECAST, &FETCHED))))?;
```

### What every reader offers

A reader in turn sends the reading events (`BOOK_OPENED`, `PAGE_TURNED`,
`BOOK_CLOSED`, `BOOK_FINISHED`), takes `GOTO`, and offers its actions
in these menus.

### What the other slots promise

A screen bound to one of these slots replaces the shipped one; it is
opened with what the table says and keeps its promises, so the plugins
around it go on working.

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

### What every library offers

A view of the library of one's own (bound to `core.library`) is as
fast as the shipped one, on the X4 too, as both ask the same service
and read the same catalog; plugins that add to the library add to
every view of it.

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
a value provided under an id in its namespace, in a version, usually a
struct holding a trait object whose trait the plugin's crate exports.
Its type names its contract in a key, such as `"weather.forecast/1"`,
written with `service_type!`; the key changes (`/2`) when the type's
fields do. Others use the service when it is there and do without it
when not:

A service is found by its key, so native code plugins built apart from
the firmware find it too (see *Plugins as files* below); its size and
alignment are checked.

A point is an id a plugin names, with what a contribution there is in
its documentation (for example one line per entry); others add to it
with `r.contribute(point, text)`, and the plugin reads
`env.services().contributions(point)`, each with the plugin it came from.

### Marks (decorations)

A plugin marks words on book pages with a decorator (ADR 0021): it gets
the words of a page with their places in the book and gives back ranges,
each with a *role*. The reader draws them; the plugin knows neither the
reader nor the panel.

```rust
use paperpaw_sdk::decorations::{self, Decorated, Decoration, DecoratorSpec, LineKind};

const LEARNING: Id = Id::new_static("vocabulary.learning");

// The role: its look is settings (Settings, Marks), the
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

On plugin interface 7, text filters that change a paragraph (room between
the lines, words replaced, glosses and ruby, blocks inserted) and page
layers are the reader's stages `reader.text@1` and `reader.layer@1`: the
SDK has them as `native::page_layers` (`TextAsk`, `TextAnswer`, `LayerAsk`,
`LayerAnswer`), `docs/abi/page-layers.md` is their contract and
`samples/interlinear` a plugin that shows a translation under each sentence and
`samples/read-along` one that marks the sentence read aloud.
What follows is interface 6's form.

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
    .reserve(|env| Some((Side::Right, env.metrics().mm(8) as u16)))
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
  screen to be drawn again (`Command::Redraw(RefreshMode::Fast)`).

A layer that writes between the lines, an interlinear reading with a
small translation above each line, takes two parts: a text filter asks
for room above every line (`Block::leading_above`, in hundredths of an
em), which the layout adds to each line's height, so pages break with
it and words are hit where they are drawn; and a layer that asks for the
page's words (`.words()`) finds them in `page.words` (`WordBox`: each
word's box, text and place), measured once a page and only where a
layer asks:

```rust
const ON: Setting<bool> = Setting::new("interlinear.on");

r.add_text_filter(TextFilterSpec::new(
    Id::new_static("interlinear.room"),
    "interlinear.room",
    // Seven tenths of an em above every line, while switched on.
    Box::new(|env, block| {
        if env.settings().read(&ON) {
            block.leading_above = Some(70);
        }
    }),
    // Changes with the setting: pages are laid out anew.
    Box::new(|env| u64::from(env.settings().read(&ON))),
))?;
r.add_page_layer(
    PageLayerSpec::new(Id::new_static("interlinear.words"), "interlinear.words", |canvas, env, page| {
        for word in page.words {
            // The room above the word's line: line.leading pixels high.
            let Some(line) = page.lines.iter().find(|l| l.start <= word.start && word.start < l.end) else { continue };
            let gloss = translation(env, page.language, word.lookup_text());
            draw_small(canvas, env, word.area.x, line.area.y - line.leading, gloss);
        }
    })
    .switch(&ON)
    .words(),
)?;
```

A filter may also insert blocks after the one it gets: a translation
after each paragraph (a parallel text), a gloss, a note. They show after
the block and never apart from its last line, and take no place in the
book: positions, progress, bookmarks, highlights and search stay the
book's. At most four, 4 KiB of text, and best shorter than a page (they
cannot go on over a page break):

```rust
let translation = translate(&block.text);
let len = translation.len() as u32;
block.insert_after(Block::new(BlockKind::Paragraph, 0, len, translation));
```

A layer takes taps on what it draws by saying where its items are; a tap
on one, or Select on one chosen with the buttons as links are, comes to
its plugin as `events::PAGE_LAYER_TAPPED` with the item's id
(`tapped.item`), and every other tap and button stays the reader's:

```rust
PageLayerSpec::new(id, "interlinear.words", draw)
    .items(|_, page| {
        page.lines.iter().enumerate()
            .filter(|(_, l)| l.leading > 0)
            .map(|(i, l)| LayerItem::new(i as u32, Rect::new(l.area.x, l.area.y - l.leading, l.area.width, l.leading)).label("Translation"))
            .collect()
    })
```

A frame (`layers::PageFrameSpec`) sets the text in columns: two
columns, two pages side by side. The setting `core.page-frame` (each
book may have its own) offers every frame by its id, named by the
translation of the id:

```rust
r.add_page_frame(PageFrameSpec::columns(Id::new_static("columns.two"), 2, 24))?;
```

### Pictures over what is drawn

Any screen, widget, theme or overlay draws a picture over what is drawn
already: a PNG or GIF keeps its transparency (an alpha channel, a
palette's or a colour key) when decoded with
`image::picture_with_alpha` (others come out opaque; why not, where it
cannot be read), and `ui::draw_image_over` blends it in, its clear
parts showing what is below, its edges mixed with it, and all of it as
see-through as its `opacity` (0 to 255) says. The mix is dithered as
pictures are, so it keeps its lightness on panels of two or four grays;
rows are read and blended one at a time, so a picture takes no memory
of its size. Pictures made larger than they are decoded are
interpolated, not blocky.

```rust
match image::picture_with_alpha(env.storage(), "plugins/owls/owl.png", &cache, Fit::side(200)) {
    Ok(image) => ui::draw_image_over(canvas, env.storage(), &image, area, 192), // a quarter see-through
    Err(why) => { /* e.g. "unsupported image: interlaced PNG" */ }
}
```

An overlay that draws only part of its region, or blends over it, says
what shows through it (`Screen::shows_through`): every screen below it,
menus too (`ShowsThrough::All`), or the topmost full screen alone, a
menu left open over it not drawn (`ShowsThrough::FullScreen`); what
shows is drawn first under all of it. A screen guarding the device is
marked in `env.stack()` (`StackEntry::guards`), so that nothing shows what
is below it. The sleep screen's *The page with a picture* shows the
full screen through: a picture or a widget over the page being read;
pictures for it are offered as presets (below).

### Widgets

A widget may also react. `targets` names the places in it that do
something. `on_input` gets taps, swipes and the buttons there, and
`context` tells it its placement and the screen it is on. `draw_focus`
draws the focus its own way.

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

A widget may be placed more than once, each placement with its own
values of the widget's settings: the home screen places a clock as
`widgets.clock@1` and `widgets.clock@2`, whose frames are the settings
`widgets.clock@1.frame` and `widgets.clock@2.frame` (saved like any
other, the widget's own `widgets.clock.frame` where one sets none).
`env.widgets().make` gives a placement's widget, which reads its settings
by their usual ids and gets that placement's values
(`Settings::with_placement`); a widget need do nothing for it. Screens
of their own that place widgets use `Id::placement` and forget a
placement's values when it goes (`Settings::placement_values`).

`widgets::shows(env, id, "author")` reads a part's switch,
`widgets::choice_setting` makes other choices of the widget's own, and
`widgets::draw_message` says kindly what is not there yet. A widget's
`height` counts its frame (`widgets::widget_look` gives the area inside
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

### Presets

A preset is a ready-made set of setting values chosen as a whole
(`paperpaw_sdk::presets`). It has a kind, named by the plugin that
offers such presets. That plugin lists those of its kind with
`env.settings().presets().of_kind(kind)`. It works out what one changes
with `Preset::changes` and the settings it covers. It shows it with
`Command::PreviewSettings`: the values show on every screen without
being kept, until the screen that asked closes. It keeps it with
`presets::commands`. The settings of its kind that a preset leaves out
go back to their defaults.

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

### Hints for a screen

The first time a screen opens, a short note over it says what its
controls do: the hints its plugin gives with `help::add`, each a text
and, where it is about a part of the screen, that part (in thousandths
of the screen's width and height), framed. A hint is for touch, for
buttons or for both; a device shows those that fit its input. A tap or
any button closes the note, and it does not come again for that screen;
*No more hints* and the settings switch them all off.

```rust
use paperpaw_sdk::help::{self, HelpHint, Zone};

help::add(r, SCREEN.as_str(), &[
    HelpHint::touch("hello.help.tap").zone(Zone::new(0, 0, 1000, 120)),
    HelpHint::buttons("hello.help.confirm"),
    HelpHint::any("hello.help.back"),
])?;
```

The texts are keys of the plugin's translations; the screen is any
screen's id, so a plugin can add hints to another's. A screen that first
prepares what it shows (the reader, opening a book) has its hints wait
with `help::wait(r, SCREEN.as_str())` and says when it is ready,
`cx.command(help::ready(&SCREEN))`: screens below another get no timers,
so it would not get ready under them. The note is the
`help` plugin's; another plugin can show them its own way, from
`help::hints(env, screen)` when `events::SCREEN_SHOWN` comes.

### Passwords and keys

Plugins keep passwords, API keys and tokens with
`Command::set_secret(SecretChange::keep(id, label, value))` and read them
with `env.secrets().get(id)`. They are all listed in *Settings, Passwords
and keys*, where the user changes or removes them. Ask for one on the
keyboard in password mode (`ask::text(…).password()`); the keyboard
offers to type it on a phone. Ask for a message or a note of several
lines with `.multiline()`: the keyboard gets a key for the line break, shows
the text on as many wrapped lines as fit above the keys, and the answer
has `\n` between its lines. Ask for web and e-mail addresses with
`.url()` and `.email()`: the keyboard types them as they are, without
capitals of its own. They are kept apart from the settings and
not readable at a glance, but not encrypted: the devices have no safe
place for a key. A plugin sees its own alone: name them in its
namespace (`myplugin.token`); `env.secrets().get` gives another plugin's
none, and `env.secrets().listed()` names every secret without its value.
A setting whose extra is `SettingExtra::secret()` is kept the same way. Native code is not
sandboxed and could go past this; the SDK hands no plugin another's
secret.

### The network

`Command::http(HttpRequest::get(url, &FETCHED))` makes a request where
the device has a network (`env.caps().network`); the answer comes as the
request's reply event, an `HttpReply` with the status and the body, or
saved to a file (`.save_to(path)`) for large ones. A request may set a
`timeout`, the answer's headers it wants back (`want_headers`) and the
longest body kept in memory (`max_body`, by default 64 KiB on small
devices). Every request is answered once, also when it is refused
(its `refused` says why and when to try again). The manifest says
that the plugin uses the network (`.uses(Uses::NETWORK)` in its manifest); without it,
requests are refused. In Offline (`env.power()`), only what the reader went
online for goes out: a screen that needs the network says so on itself
and offers *Go online*, which sends `Command::GoOnline` (the network for
that screen until it closes); anything else is refused with
`Reason::Offline` and may try again on `events::WORK_ALLOWED`.
`Command::CancelHttp` takes requests back. A download that may take a
while says how far it came with `.progress(&PROGRESS)`, an
`Event<HttpProgress>`: the bytes received, the size where the server
said (`permille()` for a bar), and the request's parameters, at most
every 5 % or every 2 seconds and never after the reply, so a screen
redraws its bar no more often (only the bar's area, with a partial
refresh). Downloaded into a file of the plugin's own and moved into the
library once whole, a download taken back leaves nothing there (as the
OPDS plugin does). Where a server or a computer
is told which device this is (a sync service, Calibre), the name is
`env.device_name()`: the one the reader set under *Device name*, else
the model's; a plugin never makes one of its own.

### Bluetooth

Where the device has a Bluetooth Low Energy radio the kernel uses
(`env.caps().bluetooth`; `env.bluetooth()` shows the radio's state and
the bonded devices given to the plugin), a plugin that says so in its
manifest (`.uses(Uses::BLUETOOTH)`) sends commands written with
`paperpaw_sdk::bluetooth` and hears everything about them as its own
events, each a `BtEvent` (ADR 0027). Every command is answered: by its
result, or by a `BtEvent::Failed(BtFailure)` that says which command
(`BtOp`) failed for which device and why (`BtError`: `Off`,
`NotAllowed`, `NotFound`, `Busy`, `Timeout`, `Declined`, `Lost`,
`Att(code)`, `Held(refusal)`, `Unsupported`).

Bluetooth costs battery, so everything is cheap unless asked otherwise.
The kernel switches the radio on for the first request and off a little
after the last; scans and advertising always end after a while; links
run at long intervals; and scans, links and advertising end with the
screen that asked for them (or with declared work, `Work::bluetooth`),
and all of them before the device sleeps. Where plugins ask for
different powers, the radio runs at the cheapest one that serves them
all, and the time it was on is counted (`Usage::bluetooth_ms`).

Events written out for others (observers, rules) carry no payloads:
neither readings nor keys nor what a phone sent. A heart-rate reader:

The emulator pretends to have Bluetooth for the X4 Pro's profile, with
made-up devices in reach: `PaperPaw Remote`, a page-turner whose keys a
script presses with `ble-key:right` (or `left`, `page-down`,
`volume-up` …) once they go to the key maps, and `Pulse HR`, a
heart-rate belt that answers the example above, notifying a rate each
second.

### Looking different: tone, look, hooks

Three ways to change how things look, from the least to the most code. Each
changes how a thing *looks*, never where it goes or how wide it is.

**Colour roles.** `style.ink(Ink::MUTED)` gives the colour of a role of the
interface; a theme sets them in `core.ui-palette` (`muted=60 link=#2a6f97`,
a gray or `#rrggbb`; a gray panel uses the brightness). `Ink` is a number
with constants, so roles can be added: `ACCENT`, `ON_ACCENT`, `LINK`,
`SELECTION` and `WARNING` exist (14 to 18, 19 to 31 are free). A role a theme
does not set reads the colour of `Ink::fallback()` (`LINK` reads `TEXT`), so
draw with the role that says what a thing *is* and a theme made for fewer
roles still looks right; a role you do not know the name of also works.
Do not mix this up with `TextInk`: that is *how text is inked* (its tone), an
`Ink` is a colour role.

`Canvas::pixel` and `gray_at` read back what *this band* drew, to composite
pixels you drew, never to decide what to draw (a point in another band is
`None`, and decisions would show seams).

### Screens that run in real time

Games, emulators and animations draw many frames a second and want
every button as it goes down. Such a screen says so in one place,
[`Screen::mode`], with a `realtime::ScreenMode`
([ADR 0030](adr/0030-real-time-screens.md)):

```rust
fn mode(&self) -> ScreenMode {
    ScreenMode::new()
        .full_screen()     // no row of hints, no bars
        .raw_keys()        // buttons pressed and released, in on_key
        .cleans_itself()   // no full refresh every few pages
        .fastest()         // the fastest refresh the panel has
        .grays(2)          // black and white is enough
        .frame_every(Duration::from_millis(100))
        .awake_for(Duration::from_secs(600))
}
```

Each option asks for an intent; every device meets it as well as it
can. With `raw_keys`, `on_key` gets each button pressed and let go,
with its time, and `env.keys_held()` says which are down. The power
button stays the device's, and holding *Back* for two seconds always
leaves the screen. With `frame_every`, the screen asks for its timer as
usual (`cx.wake_at`); the X4 then goes on while the panel refreshes, and
shows the next frame as soon as the panel is free.

The device says what it can do and what it did: `env.panel()` has the
fastest time of each refresh mode as measured, its grays, and the last
frame shown (`last_frame()`: when, how long it took, how many frames
were merged into it). Pace yourself by these numbers rather than by
your own: faster panels then make your plugin faster without a new
build.

Draw pictures that change every frame with `canvas.blit`: a packed
`Bitmap` of 1, 2, 4 or 8 bits a pixel with a palette of grays, at a
whole scale, dithered or not. A 160×144 picture at three times its size
costs a fraction of drawing it pixel by pixel.

Keep what a loop reads all the time in internal RAM and large data in
PSRAM (`memory::vec_in(Placement::FAST, n)` and `Placement::LARGE`);
devices with one kind of memory keep both alike. In a code plugin, mark
the few functions that run every frame with `paperpaw_sdk::hot! { … }`:
the X4 runs them from internal RAM instead of flash, a bounded part of
its heap; what does not fit runs from flash as before.

A screen that needs much memory says so (`.memory(bytes)`, and
`.needs_network()` or `.needs_bluetooth()` where it does): as it shows,
the kernel lets caches go, holds background work back, switches off
the radios it does not need, asks the screens below to let go of what
they can make again (`on_squeeze`; the reader lets its book go and
keeps its place) and closes them where that is not enough, until there
is enough, and gives everything back once it closes. Read what you got
with `env.room()` in `on_show`, and make the large buffer there. A
screen of yours that keeps much (pictures, a long list) lets it go in
`on_squeeze` and makes it again in `on_show`.

To keep the device from going to sleep by itself for a while (a clock,
a slideshow, a long download), hold it: `cx.keep_awake(WakeHold::new(id,
reason).lasting(...))` on a screen (it ends when the screen closes), or
`Command::KeepAwake` from work and services; renew it before it ends,
let go with `Command::LetSleep`. The reader can switch holds off.

### Work in the background

What a plugin does on its own, not because the reader just asked for
it, it declares as work (`paperpaw_sdk::work`, ADR 0025), and the
kernel runs it at the moment that costs least: waking, a book opened or
closed, going to sleep, the radio on anyway, charging, idle.
`Command::work(Work::network(PUSH).within(Duration::from_secs(1800))
.at_moments(Moments::BOOK_CLOSED | Moments::SLEEP))` sends the reading
position when the book is closed or the device sleeps, at the latest
after half an hour; the kernel then emits the work's event and the
plugin makes its request. `optional()` work (weather, headlines) runs
only while that is cheap, and never brings the radio on by itself.
`Work::at(event, time)` is a timer, `every` repeats, `key` tells
several works of one event apart, `Command::CancelWork` takes one back.
`env.reader()` says whether what is handled is the reader's own doing: an
action the reader ran acts at once, the same action run by a rule
declares `Work::when_cheap(id, within)` instead and waits for a good
moment.
Long work in steps (an install, a catalog walked) registers its step
function (`r.add_work(WorkSpec::new(id, title, step))`) and is stepped
between frames. `env.work()` says where a work stands, for the plugin's
own page; background work never shows a notice over reading. The power
mode (`env.power()`) makes deadlines longer or holds network work back;
most plugins need not read it.
Read large JSON answers as they stream with
`paperpaw_sdk::json::stream`, so they need little memory.
`Command::Serve` serves HTTP to the local network, e.g. for transfers
from a computer or typing on a phone; what happens to it comes as
`ServerNotice`s. A plugin answers each request with `Command::Respond`.
A server stops when the screen that started it closes. Serve only while the screen showing the
address is open, and guard it as `paperpaw_sdk::served` does: a key
drawn anew each time in the address (`served::key`), checked by a
`served::Guard`, which turns requests away for a while after a few
wrong keys. Where PaperPaw runs Wi-Fi itself (the X4s),
`paperpaw_sdk::wifi` says the radio's state, and
`WifiCommand::Host` opens a network of the device's own for a phone to
join, as the Wi-Fi transfer does without a router. In the emulator
the X4s start with the radio off, as a device does; with `--wifi
online` (over `--stdio`, `start` with `"wifi": "online"`) they start on
USB, in a network `Workshop Wi-Fi` joined before, and a plugin's
requests go out at once.

Other protocols go over sockets ([ADR 0014](adr/0014-sockets-for-plugins.md)):
`Command::Connect` opens a TCP connection, `Command::SocketSend` sends,
and `Command::SocketRead` asks for what comes next, as text
(`SocketRead::Text`) or as a file of a known length written to storage as
it comes (`SocketRead::File`), so files of any size never need to fit in
memory. `Command::Broadcast` finds services in the local network by a
UDP datagram and their answers. Everything comes back as events
(`SocketNotice`s); a socket closes when the screen
that was open as it opened closes. One that background work opens (its
event's handlers, a job's step) is the run's instead: it closes when the
run ends (the job done or failed, the work run again, taken back or
refused, or its plugin gone), whatever screens open and close meanwhile.
One connected from a socket's event is the screens': several connections
in the background are a job's steps. A secure one of background work
ends when idle: `idle_ms(0)` is refused for it (`SocketError::Options`),
at most 30 minutes (`MAX_TLS_IDLE_MS`, as long as IMAP IDLE waits).

A socket may be secure (TLS): `Command::connect_tls(socket, host, 993,
events, Tls::new())` connects and says `SocketNotice::Secured` once the
handshake is done (no `Connected` before). Send and read nothing before:
until `Secured` that fails the socket (`SocketError::NotReady`) and
closes it. For STARTTLS, connect plainly, send the server's command, read
its go-ahead, then `Command::start_tls(socket, Tls::new())`: with a read
under way or bytes come unread it fails and closes, as they would pass as
secure. `Tls::new()` trusts the authorities PaperPaw ships; a server of
one's own with a certificate no authority signed is trusted by
`Tls::pinned_keys(vec![key])` (its key, which a renewed certificate
usually keeps) or `Tls::pinned(vec![hash])` (that certificate alone).
The first connection to it says `SocketNotice::Untrusted` with the
certificate's `CertificateHash` and `KeyHash`: show one to the reader to
compare, and keep it in the plugin's settings once they agree.
`Secured`'s `time_checked` is false where the device did not know the
time yet (an X4 just after a cold start): the certificate's dates were
not checked, so a plugin that must be sure closes and tries again later.
`SocketRead::Bytes` reads what came as bytes (`SocketNotice::Bytes`), for
lines that are no UTF-8. `Capabilities::tls_sessions` says how many TLS connections fit
at once (one on the X4, HTTPS counted): a socket waits for one up to its
`Tls::timeout_ms`, then fails `SocketError::Busy`. A TLS connection holds
about 40 KiB on the X4 and keeps the radio awake, so connect, fetch and
close; `Tls::idle_ms` (60 s) closes a forgotten one.

### Firmware updates

Where PaperPaw is the device's firmware (the X4s), `env.firmware()` says
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

`FirmwareCommand::InstallForeign { path }` installs another firmware's
app image instead (the way back to CrossPoint): not signed, so send it
only for a file the reader chose as such, told that it is not PaperPaw.
`firmware::ForeignImage::read` and `fits` tell what the file is before;
the shell checks the whole image as it writes it (`ForeignCheck`: its
chip, segments, checksum and hash, and CrossPoint's board tag).
