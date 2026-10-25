## The sample plugin

[`samples/hello-plugin`](../samples/hello-plugin/src/lib.rs) is a small
plugin to start from. It adds *Hello* to the tools menu, which opens a
screen greeting you by a name set in the settings, with the number of
books opened since the start. Try it in the emulator:

```sh
cargo run -p paperpaw-emulator --features hello -- --profile boox-go-7 --set hello.name=Ada
```

*Hello* is among the tools: open *Tools* in the main menu, then
*Hello*.

### The plugin

A plugin is a type implementing [`Plugin`]: a manifest and a `register`
function. `register` runs once at start-up and adds the plugin's
contributions through a [`Registrar`]:

```rust
pub const PLUGIN: Id = Id::new_static("hello");
pub const OPEN: Id = Id::new_static("hello.open");
pub const SCREEN: Id = Id::new_static("hello.screen");

pub struct Hello;

impl Plugin for Hello {
    fn manifest(&self) -> Manifest {
        Manifest::new(PLUGIN, "Hello", Version::new(0, 1, 0))
            .description("A sample plugin to start from.")
            .uses(paperpaw_sdk::Uses::NOTHING)
    }

    fn register(&self, r: &mut Registrar) -> Result<(), RegisterError> {
        r.add_action(ActionSpec::new(OPEN, "hello.title").handler(|_, _, out| {
            out.push(Command::OpenScreen(SCREEN, Params::new()));
        }))?;
        r.add_menu_entry(MenuEntry::new(menus::TOOLS, OPEN).order(90))?;
        r.add_icon(OPEN, Cow::Borrowed("star"))?;
        // … the screen, a setting, an event, translations
        Ok(())
    }
}
```

Every id starts with the plugin's id (`hello.open`); `core` is the
kernel's. Titles are translation keys, translated where they are shown.

Icons are named as in [Tabler Icons](https://tabler.io/icons), any of
them (`paperpaw_sdk::icons` knows every name). PaperPaw's icon font holds
the ones it uses itself; for another, bring its drawing as an icon pack
(see below), else none shows.

### Reading and changing: `Env` and commands

Plugins never change the kernel's state directly. They read it through
[`Env`]: the device, the settings, the translations, the fonts, the
storage, the time, the battery, the passwords and keys. They change it
with [`Command`]s: open a screen or slot, go back, change a setting,
emit an event, run an action, show a short message, make an HTTP
request, keep a password, and so on. The kernel runs the commands after
the plugin's code returns.

A handler queues its commands in the `Commands` it is handed (`out` in
the examples): `out.push(..)`, `out.extend(..)`, `out.emit(..)`. It
reads as the slice of what is queued so far. Its fields are private, so
that it can grow: what PaperPaw adds to it later reaches every handler
without a new signature.

This keeps plugins simple to test and the API message-based. It does
not confine them: a plugin runs as native code without a sandbox (see
[Plugins as files](#plugins-as-files)).

### Screens

A screen implements [`Screen`]. `draw` paints it; `on_action` reacts to
actions (from buttons, or gestures bound to them); `on_gesture` to taps,
long presses and swipes; `on_event` to events while it is open:

```rust
impl Screen for HelloScreen {
    fn draw(&mut self, canvas: &mut Canvas<'_>, env: &Env<'_>) {
        // What the screen draws with: canvas, environment and style.
        let mut ui = ui::Ui::new(canvas, env, &self.style);
        self.header.draw(&mut ui, env.i18n().tr("hello.title"), None, None);
        // … the greeting, centred below
    }

    fn on_action(&mut self, action: &Id, cx: &mut Cx<'_, '_>) -> Handled {
        if *action == actions::CONFIRM || *action == actions::BACK {
            cx.command(Command::Back);
            return Handled::Yes;
        }
        Handled::No
    }

    fn on_gesture(&mut self, gesture: Gesture, cx: &mut Cx<'_, '_>) -> Handled {
        // A tap on the header's back arrow, or anywhere else, closes it.
    }
}
```

Screens are made by a factory each time they open
(`r.add_screen(ScreenSpec::new(id, title, factory))`). Return
`Handled::No` for what a screen does not handle: the kernel then runs
the action's own handler (e.g. the menu button opens the menu).

A screen opened again while it is open is not made twice: the kernel
goes back to the open one, closing the screens above it, and gives it
the params in `on_reopen`, so *Back* leaves it in one press. By default
that is one for each set of params (the details of another book open
above those of the first); `.instances(Instances::SINGLE)` keeps one at
most whatever the params (a transfer screen, a page of settings
roots), and `Instances::MANY` opens each time.

An action can be run with params: `Command::RunAction(id, params)`, or
`Command::run(id)` without. Its handler gets them as its second argument
(`.handler(|env, params, out| ..)`), and a screen reads them with
`cx.params()` in `on_action`. From a button or a gesture there are none.

A screen that needs time to pass asks for it with `cx.wake_at(when)`,
and `on_timer` comes then. Long work goes in steps, each asking for the
next wake. `on_close_request` may keep a screen open, for example to
ask first. `on_pointer` takes a finger whole, for drawing or moving
rows.

Some rules every screen should follow:

- **Touch and buttons alike.** Some devices have only buttons (the
  Xteink X4), some mostly touch (the Boox). Everything must be easy with
  either: buttons move a focus and confirm, taps act at once. Show the
  focus only once buttons are used (`ui::focus_shown`,
  `ListView::focus_on_keys`). The building blocks that take the buttons'
  actions and gestures (`on_action`, `on_gesture`) answer with a
  `ui::Response`: not theirs (`Ignored`), taken (`Same`), changed and to
  be drawn again (`Changed`), or done with a result (`Done`).
- **`draw` only draws.** On small devices a frame is drawn in bands
  (the X4 draws five), so `draw` runs several times for one frame, and
  again for every frame after it: whatever it reads or works out, it
  does over and over. Load what a screen shows when it opens or when
  that changes (in its factory, `on_show`, `on_event`); parse it, sort
  it, wrap long texts and make pictures small (`ui::Thumbnail`) then,
  keep the result in the screen, and only draw it in `draw`, which must
  not change state. It can skip what lies outside `canvas.clip()`. The
  one thing read while drawing is a picture too large to keep, such as
  one filling the screen: `ui::draw_image` reads its rows band by band.
  The emulator's `--trace` shows what each band of a frame reads;
  `crates/paperpaw-app/tests/draw.rs` checks every screen of the
  standard app.
- **Ask for redraws.** After a change, `cx.request_redraw()` (or a part
  of the screen) and `cx.request_refresh(mode)`: `Fast` for a moving
  focus, `Partial` for new content, `Full` to clear ghosting. A focus
  that moves asks for the two items it left and came to, never the
  whole screen: on the X4 a step then takes a fraction of a frame. The
  lists do it themselves (`ListChange::request` after `ListView`,
  `Rows` or `Sections` moved it); a focus of a screen's own asks with
  `ListChange::focus(left, reached)` (for buttons with
  `ui::button_reach`, as a focus frame goes round them). Where the focus
  changes more, such as a line about the focused item, ask for that
  part too.
- **Overlays** are screens with a `region`. One that takes the reader's
  attention (a menu, a question) washes out what lies below it
  (`dims_below`); one looked through (a keyboard over the field it
  types into, a notice) does not. A screen whose content is best in
  grays (a picture) says so (`grays`): panels with few grays then show
  it in more, as slowly as a full refresh. A screen drawn whole with
  pictures on it (covers, `ui::draw_image`, `ui::Thumbnail`) is shown so
  anyway where *Pictures in grays* is on; one that decides itself, or
  whose pictures change often, says no (`pictures_in_grays`).
- **Use the SDK's UI parts** (`paperpaw_sdk::ui`): headers, rows, lists,
  switches, numbers with − and +, messages, icons. They follow the user's
  appearance settings and line up with the rest of PaperPaw. What a
  screen draws itself takes its look from `UiStyle`: the focus with
  `ui.focus(..)` (a `ui::Ui`), what is on a focused row in `style.focus_ink(focused)`
  (white on the dark bar, black on a frame or a light bar), small shapes
  with `style.radius(height)` (pills where corners are round), boxes and
  cards with `style.corner()`, lines between rows with `ui.separator(..)`.
  The style's sizes are read with its methods (`style.margin()`,
  `style.gap()`, `style.row()` in pixels, `style.text()` and
  `style.small()` for text).

Screens say what they show, for reading the interface aloud,
automation and tests: the `ui` helpers (list rows, buttons, switches,
headers, labels) tell what they draw by themselves. A screen that draws
in its own way tells it with `canvas.describe(role, text, area)`, with
the role of what it is (`Row`, `Button`, `Switch`, `Check`, `Radio`,
`Field`, `Image`, `Link`, `Dialog`, `Progress` …), and says more where
it is so: `.focused(true)`, `.on(Some(true))`, `.disabled(true)` for
what does nothing now. Nothing is kept where nobody asks. A
screen reader of one's own hears where the focus of the buttons goes
(`events::FOCUS_CHANGED`: its role, label and area).

### Which building block for what

A plugin's screens are drawn with the SDK's `ui` module, so they look
like PaperPaw's own, follow the reader's text size and the look chosen
(a theme paints switches, the focus, buttons, headers, frames and more),
and work by touch and with the buttons alone. Sizes come from
`UiStyle::new(env)`: `margin`, `gap`, `row`, `header`, the text sizes
(`style.size(TextRole::Body)` and the others). No block shortens a
title or a button's word: a title is measured first and keeps its whole
width, a box or control beside it takes what is left, and where that is
too little the row takes a second line (ask the block for its row's
height); only a value, the reader's own text in a field, may be
shortened. `paperpaw-dev ui-kit` draws every block below on every
device, in every look, light and dark, and checks that no label is
shortened.

| For | Use |
|---|---|
| The bar at the top, a title and a note (a page count) | `ui.header(..)`, `ui::Header` (with its arrows) |
| Parts one below the other, from the top and the bottom | `ui::Stack` (`take`, `take_bottom`, `rest`) |
| Equal columns side by side, e.g. two buttons | `ui::columns(area, count, gap)` |
| A list that pages and holds the focus | `ui::ListView`, `ui::list_step` |
| What a screen draws with | `ui::Ui` (`Ui::new(canvas, env, &style)`; the parts below are its methods: `ui.button(..)`, `ui.message(..)` …) |
| Text, on a line or wrapped | `ui::Label` (`Label::new(text).role(TextRole::Small).align(..).wrap()`) |
| Rows of a list | `ui::Row` (`Row::value`, `Row::switch`, `Row::number`, with `.note(..)`; `height`, `draw`, `hit`) |
| Rows of settings | `ui::draw_setting_row`, `ui::draw_stepper`, `ui::slider::Slider` |
| Sections with headings | `ui::sections::Sections`, `ui.heading(..)` |
| A grid of cells (covers, tiles) | `ui::CellGrid` (`cell`, `hit`, `step`) |
| A group on a card or in a frame | `ui.card(area, Frame::Card)` returns where its parts go |
| A button, on, focused, faint, with an icon | `ui.button(..)`, `ui.faint_button(..)`, `ui.icon_button(..)` |
| A few options to pick at a glance, or tabs | `ui::Segments` |
| Filters or tags in a row, each as wide as its word | `ui::Chips` (the height of their rows: `Chips::height_for`) |
| A one-line text in a row, typed on the keyboard | `ui.text_field(..)` (its row: `ui::text_field_height`), `ui::edit_text` |
| A list where several may be ticked | `ui::draw_check_row` (its row: `check_row_height`; the box alone: `ui::draw_check`) |
| Text longer than its room, scrolled by buttons and touch | `ui::TextView` |
| A date or a time | `ui::DatePicker`, `ui::TimePicker` |
| A box over the screen with a title, text and buttons | `ui::Dialog` |
| Asking for text, a folder, one of several options or yes or no | `ask::text`, `ask::folder`, `ask::choice`, `ask::confirm` (screens of their own) |
| A message where content would be, an empty list | `ui.message(..)`, `ui.empty(..)` (their heights: `ui::message_height`, `ui::empty_height`) |
| Progress | `ui.progress(..)` |
| An address to open on a phone, with its QR code | `ui::draw_address`, `ui::draw_qr` |
| Offering to go online where something needs the network | `ui::offline::OfflineOffer` |
| What the buttons do, at the bottom | the screen's `hint` (the kernel draws the row) |
| First-time hints over a screen | `help::add` (see [Hints for a screen](#hints-for-a-screen)) |
| A widget's frame | `widgets::draw_frame` |

Two buttons side by side, a margin from the screen's sides and bottom:

```rust
use paperpaw_sdk::ui::{self, Stack, UiStyle};

let style = UiStyle::new(env);
let margin = style.margin();
let screen = Rect::new(margin, 0, display.width - 2 * margin, display.height - margin);
let row = Stack::new(screen, margin).take_bottom(ui::Segments::height(&style));
let [ok, cancel] = ui::columns(row, 2, margin)[..] else { return };
let mut ui = ui::Ui::new(canvas, env, &style);
let shown = ui::focus_shown(env);
ui.button(ok, "OK", false, shown && focus == 0);
ui.button(cancel, "Cancel", false, shown && focus == 1);
```

Tabs over a page, the chosen one on, moved with left and right:

```rust
// Made with the layout; it keeps its words.
let area = Rect::new(margin, top, width, ui::Segments::height(&style));
let tabs = ui::Segments::new(&style, area, ["hello.books", "hello.shelves", "hello.notes"]);
tabs.draw(&mut ui, self.tab, self.focus_on_tabs.then_some(self.tab));
// on_action: if let Some(tab) = tabs.step(self.tab, action) { self.tab = tab; }
// on_gesture: if let Some(tab) = tabs.hit(gesture.start) { self.tab = tab; }
```

A dialog in the middle of the screen:

```rust
let mut dialog = ui::Dialog::new(env, &style, "Delete the book?", &["It goes for good."], &["Delete", "Keep"]);
dialog.place((display.height - dialog.height()) / 2);
dialog.draw(&mut ui, Some(self.focus));
```

### Settings

A setting is a constant with its id and the type of its value
(`Setting<bool>`, `Setting<i64>` or `Setting<Text>` for choices,
languages, lists and text). Its spec is declared in a `static` list,
which the plugin registers once. On the X4 the list stays in flash and
takes next to no memory:

```rust
pub const NAME: Setting<Text> = Setting::new("hello.name");
pub const DATE: Setting<bool> = Setting::new("hello.clock.date");
const GROUP: Id = Id::new_static("hello.clock");

static SETTINGS: [SettingSpec; 3] = [
    SettingSpec::text(NAME.static_str(), "hello.setting.name", "", GROUP)
        .description("hello.setting.name.help"),
    SettingSpec::switch(DATE.static_str(), "hello.setting.date", true, GROUP),
    SettingSpec::choice("hello.clock.face", "hello.setting.face",
        &["hello.face.plain", "hello.face.ticks"], "hello.face.ticks", GROUP)
        .description("hello.setting.face.help"),
];

r.add_settings(&SETTINGS)?;

let name: &str = env.settings().read(&NAME);
out.push(Command::set(&NAME, "Ada".into()));
```

`SettingSpec::switch`, `number`, `choice`, `language`, `list` and
`text` make them, each with its id, title, default and group;
`SettingSpec::new` takes any kind and an `Id`, for a spec whose id is
known only at run time (registered with `add_setting`). Every builder is
`const`. The settings screens list every setting by its group, with its
description below it; the kernel saves changes to `paperpaw.ini`.
`advanced()` hides rarely needed ones, and `scoped()` lets one be set per
book. Settings known only at run time (one per widget, say) are read by
their ids, `env.settings().text("…")` and so on. Passwords and keys do
not belong in settings: see [Passwords and keys](#passwords-and-keys).

What few settings need goes into a `static SettingExtra`, which a
setting takes with `with_extra(&EXTRA)`: a unit, a step, a section, a
slider, an editor screen of your own, or being a secret.

```rust
static WHILE_SYNCING: SettingExtra = SettingExtra::new().shown_if(Id::new_static("hello.sync"), "on");
static SERVER: [SettingSpec; 1] = [
    SettingSpec::text("hello.server", "hello.setting.server", "", GROUP).with_extra(&WHILE_SYNCING),
];
```

`shown_if` shows a setting only while another has a value. Here the
server's address shows while syncing is on. `check(fn)` checks a value
before it is set. A value it refuses is not set, and the reader sees
the translation of the key it returns. Screens of your
own that list settings open them as the settings pages do with
`ui::setting_opens` (its editor, the keyboard for text, the list of a
choice's values); text typed there comes back to the kernel as
`events::SETTING_TYPED`, which sets it. They lay their rows out as the
settings pages do, so that no title is cut for its control:
`ui::row_lines` tells once, when the list is made, whether a row's
control goes beside its title or below it and how high the row is
(`ui::setting_height` the height alone), and `ui::draw_number_lines`,
`ui::draw_stepper_lines`, `ui::draw_switch_lines` and
`ui::draw_setting_row` draw it there (`RowLines::at` moves it to the
row's place).

### Events

```rust
r.on(events::BOOK_OPENED, move |env, reading, out| {
    opened.set(opened.get() + 1);
    // reading.path, reading.title, reading.progress, reading.at() …
})?;
```

The kernel and plugins emit events; any plugin can listen. An `Event<P>`
names an event and what it carries, a struct made with `event_data!`,
so emitting (`EVENT.emit(data)`) and hearing (`r.on`) are checked as
the plugin is built; screens get every event too and read one with
`EVENT.read(event, params)` in `Screen::on_event`. Standard ones are in
`builtin::events`: started, a setting changed, a book opened, a page
turned, a book moved, books came into the library or left it, its
bookmarks or highlights changed, a word looked up, a place in the open
book to show, text chosen, notes exported, the device suspends or
resumes, PaperPaw stops (a restart: save as at suspending, but it is no
sleep). Plugins define their own the same way (in their namespace),
and `EVENT.schedule(data, at)` emits one at a time (work at a time,
below). Underneath, what events carry travels as named
strings (`Params`): events known only at run time are heard by id with
`r.subscribe`.

Answers come as events too, typed in `replies`: a plugin names the
event it wants, e.g. `const FETCHED: Event<HttpReply> =
Event::new("news.fetched")`, and passes it with the request.

To ask the reader, `ask::text("Server", &ENTERED).initial(url).command()`
opens the keyboard and brings back a `Typed`. `ask::folder` brings back
a `FolderChosen`, `ask::choice` a `Picked` and `ask::confirm` a `Confirmed`.
A value passed with `.with(key, value)` comes back in the answer's
`context`, so a plugin tells its questions apart. A `Picked` has no
`context`: on `ask::choice`, `.about(text)` comes back as its `path`.

What is known of books is a service, not a screen's: `library` has a
book's details (title, author, series, tags, cover, progress, and
fields plugins add with `library::set_field`), the books read last and
the favourites, so any plugin can show or use them. Views of many books
read the catalog rather than each book (below, "What every library
offers"), show covers made small and kept on the storage
(`library::cover_variant`, a few kilobytes each, not the picture, one
for each size a view shows) and take a book's details with the size a
listing told (`library::listing`, `library::book_sized`): on a card,
each file looked up again is a search through its folder.

The bookmarks and highlights of books are shared: `annotations` reads
and keeps them, and whoever changes them emits
`annotations::changed(book)`, so the reader shows them anew and syncs
pass them on (the `koreader` plugin, for example).

State a plugin keeps between events lives in an `Rc` it hands to its
handlers when it registers.

### Translations

```ini
[meta]
language = en
name = English
plural = one-other

[messages]
hello.title = Hello
# {name} is the name set, {count} the books opened since the start.
hello.greeting.one = Hello, {name}! You opened {count} book.
hello.greeting.other = Hello, {name}! You opened {count} books.
```

Every text a plugin shows comes from catalogs like this, added with
`r.add_translations(…)`; English first, then any other language. `tr`
translates, `format` fills `{placeholders}`, `plural` picks the form for
a number. A test that all languages have the same keys belongs in every
plugin (see the sample).

Two messages say what a plugin is in the lists: `<id>.plugin.name` and
`<id>.plugin.description` (a line). *How it works* says more: a few
sentences on what it does, where it is found and how it is used, plain
text with paragraphs apart by an empty line, one file per language
beside the catalogs (`how/en.txt`, `how/de.txt`). The manifest names
them; as a table in the program they take no memory until the plugin
manager shows one (a plugin held), paged like a book:

```rust
static HOW: [(&str, &str); 2] = [
    ("en", include_str!("../how/en.txt")),
    ("de", include_str!("../how/de.txt")),
];
// In `manifest`: Manifest::new(…).description(…).how(&HOW)
```

The store shows the same text on the plugin's page and in the readers'
store: put the files into the folder you upload as well (`how/en.txt`,
`how/de.txt`), as PaperPaw's own plugins in the store have them, or say
it in the entry's `description` (see [Publishing](#publishing)). A data plugin
gives it as `<id>.plugin.how` in its catalogs, quoted, paragraphs apart
by `\n\n`. `paperpaw-dev` warns where a plugin with code has none or a
short one.

### Testing

Plugins are tested with the real kernel and an in-memory storage, as the
sample's [test](../samples/hello-plugin/tests/hello.rs) does. The kernel
comes from the crate `paperpaw-core`, a dev-dependency. Build a kernel
with the plugin and send it input. Then look at the open screen, the
settings, the files and the HTTP requests it makes (`Kernel::take_io`).
Answer them with `Kernel::http_response`. The emulator then shows how it
looks and how much memory it needs on each device:

```sh
cargo run -p paperpaw-emulator --features hello -- --profile xteink-x4 --headless --script "run:hello.open" --screenshot out.png --heap-report
```

Before a plugin is published, `paperpaw-dev` checks all of it on every
device: see [Checking your plugin](#checking-your-plugin).
