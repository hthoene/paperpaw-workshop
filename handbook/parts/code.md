# Plugins with code

The plugins you make here are Rust programs against PaperPaw's SDK
(`paperpaw-sdk`), for **plugin interface 7**: new screens, actions, menu
entries, widgets, settings, reactions to events. A plugin is a small program
(`#![no_std]`, `#![no_main]`) that PaperPaw loads. It declares what it brings
when it starts, and PaperPaw calls it back: to handle an event, to draw, to
take a key or a touch. It runs inside PaperPaw on the reader, built for it,
and in PaperPaw's emulator beside the conversation, built for this computer.

## The project

A project holds these files, and nothing else:

| File | What it is |
|---|---|
| `Cargo.toml` | The crate: its name (which is the plugin's id) and version, and the SDK. Exactly this form; the workshop writes the rest (targets, profile, linking). |
| `src/main.rs` | The program: `#![no_std]`, `#![no_main]`, the plugin type implementing `Plugin`, and the line `paperpaw_sdk::native_plugin!(MyType, metadata = CALLS);`. More modules in `src/` if it grows (`mod name;`). There is no `src/lib.rs`. |
| `native/metadata.json` | What the code calls of the device (see below). Keep the recipe's file; add to it when the code uses more. |
| `plugin/plugin.ini` | The plugin's folder as readers install it: `[plugin]` with `id` (the crate's name), `name`, `description`, `version`. |
| `plugin/i18n/en.ini` | Every text the plugin shows, by key, under `[messages]`; `plugin/i18n/de.ini` and others for other languages. Declarations name their titles by these keys. |
| `plugin/how/en.txt` | Optional: how it works, in a few lines, by language (`plugin/how/de.txt` …), shown by the plugin manager. |

```toml
[package]
name = "my-plugin"
version = "0.1.0"

[dependencies]
paperpaw-sdk = "0.6"
```

The crate's name is the plugin's id: lower case letters, digits and hyphens,
beginning with a letter, and the same as `id` in `plugin/plugin.ini`. The SDK
is the only crate there is: no `std`, no other crates. `alloc` is there
(`extern crate alloc;`) for `Vec`, `String`, `Box`, `format!`.

## The shape of the program

The recipes below are complete and build without a warning; start from the one
closest to what the person wants, write its files whole, build, and then change
it step by step. The parts, as the recipe `hello` has them:

- **State**: the plugin's type, made by `Plugin::make`. What the plugin keeps
  between calls lives in its fields (never in a `static` that changes: PaperPaw
  refuses a plugin with writable data).
- **`make(host)`**: runs once when the plugin loads. It declares everything the
  plugin brings, with `Declarations::new(|batch| registrations::submit(host,
  batch).map_err(i32::from))`, each declaration added, then `.submit()`. A
  declaration the device refuses ends the load: `declare(host).map_err(DeclareError::to_error)?`.
- **`event(host, token, incoming, reply)`**: an event the plugin subscribed to
  (`subscribe_event`) or an action it declared (`ActionDecl`) was run. `token`
  is the number you gave when you declared it; read the event with
  `incoming.decode_as::<kinds::ActionRun>()?` (or `kinds::BookOpened`, …).
  Commands to the device (open a screen, go back, …) go through
  `CommandSender::new(host, &mut scratch).open_screen("id")`.
- **`draw(host, token, frame)`**: draw the screen or widget with that token.
  `let canvas = frame.draw_canvas()?;`, `canvas.frame_rect()` is the room
  (pixels; the screen's size differs by device: never assume 480x800),
  `canvas.fill_rectangle(area, Color::WHITE)?`, text with
  `Font::acquire_role(host, FontRole::Ui)?` and `font.render_text(&canvas, size,
  TextOrigin::new(x, y), Color::BLACK, text)?`, then `font.release()`.
  `font.measure_text(size, text)?` says how wide a text is. Draw only inside the
  room and never assume a place has any: where `draw_canvas()` fails (no room
  yet) there is nothing to draw, return `Ok(())`.
- **`input(host, token, input)`**: a key or touch for the screen; answer
  `Ok(Handled::Yes)` for what the screen takes, `Ok(Handled::No)` otherwise:
  the device's own keys (back, home) then keep working.
- **Settings**: `Declarations::spec(SpecDecl::new("name", Kind::Text("default"),
  group, "plugin.setting.name"))` (a switch, number or choice are other
  `Kind`s); the person changes it in the settings and PaperPaw saves it. Read it
  when you draw: `settings::read_setting(host, "plugin.name", &mut scratch)?`
  gives a `SettingValue`.
- **Names**: a name in a declaration is relative and gets the plugin's id in
  front: `ScreenDecl::new("screen", …)` in plugin `hello` is `hello.screen`; a
  setting `"name"` is `hello.name`; a widget `"note"` of plugin `motto` is
  `motto.note`. Titles are keys of `plugin/i18n/<lang>.ini` that start with the
  plugin's id, `hello.title = Hello`; every key a declaration names must be in
  `en.ini`, and `<id>.plugin.name` too.
- **Callback tokens** are numbers you choose, `const SCREEN: u32 = 1;`, handed
  back to `event`, `draw` and `input`. Return `Err(Error::Invalid)` for a token
  you do not know.

What can be declared (`lookup_docs` `native::declare::Declarations` and the
declaration structs for the exact signatures): `screen` (`ScreenDecl`), `action`
(`ActionDecl`), `menu_entry` (`MenuEntryDecl`, where an action shows: the tools
menu is `"core.tools"`), `spec` (a setting), `group` (a settings group, which a
widget needs for its settings), `widget` (`WidgetDecl`: a name, a title key, a
category such as `"core.widgets.words"`, a token, `.cells(columns, rows)`),
`subscribe_event` (events: `EventKind::BookOpened`, …), key bindings, presets,
fonts, hyphenation, services. Most of them are only more `Declarations` calls
in `make`.

## What the code may call: `native/metadata.json`

The program names in `native/metadata.json` what it calls of the device: the
`used` lines (`host` functions, `callback`s) say which functions of the
interface it needs, and `services` and `features` say what it asks to use
(the network, files, secrets, Bluetooth …; each is a consent the person gives).
A call that is not listed is refused. The workshop makes the records of it at
every build (`paperpaw-dev build` does) and says what is wrong in a sentence:
a name that is no function of the interface, a name listed twice, `floor`. The
recipes' lists fit what their code calls. When the code calls more (another
canvas call, a font function, reading the clock), add its line:
`{"kind": "host", "name": "canvas.draw_line"}`. The names that exist are in the
table `The device's functions a plugin may list` below; never invent one.

## Limits of the code

- No `std`, no panics for bad input (return an `Err` instead), nothing that
  needs an operating system. Arithmetic on sizes: use `saturating_*` or
  `checked_*`.
- No function may use 2,048 bytes of stack or more: a big array or buffer goes on
  the heap (`vec![0; n]`, `Box`). Keep a plugin small: no float parsing from text
  (`str::parse::<f32>()`), no `{:?}` of strings.
- The memory is small (about 256 KiB of heap for everything on the X4): draw what
  is on the screen, keep little, and do not build big `String`s.
- The workshop builds for the emulator (a library for the computer) and for the
  readers (the X4 and the X4 Pro): the same source, the same program.

## How you work

1. Start from the recipe closest to what the person wants (Recipes below; a
   greeting screen with an action in the tools menu, a setting and an event is
   `hello`, a home screen widget with a setting of its own is `motto`), or from
   what the project holds (the `hello` sample at first). Write the recipe's
   files whole, build, then change it step by step. Rename it first: the
   crate's name, `id` in `plugin/plugin.ini`, every key and id that starts with
   the old id.
2. Look up only what the recipe does not show, each thing once: what
   `lookup_docs` and `read_file` answered stays in the conversation, so read it
   there again rather than asking again. `lookup_docs` with a name (`Declarations`,
   `ScreenDecl`, `Font`, `Canvas`) or a few words (`canvas text`, `setting
   switch`) answers with the exact signatures and documentation; a trait whole,
   every method with whether it has a default, a struct with its fields and how
   it is made. `sdk/native/<module>` lists a module of the interface (`sdk/native/declare`,
   `sdk/native/canvas`, `sdk/native/fonts`, `sdk/native/settings` …), and the topics
   `abi/<area>` explain what the device does for each area (screens, canvas,
   settings, registry, files, network …). Never guess a name or a signature: the
   build fails on every one that does not exist, and its message says what does.
   A few lookups are enough to write a first version: write it, `build`, and
   let the compiler say what is still wrong.
3. Write the files, then `build`. It compiles the plugin and puts it into the
   reader beside the conversation; on errors it answers with the compiler's
   messages. Fix the first error first (later ones often follow from it), and
   build again. Warnings are worth fixing too. A message of the build that is not
   the compiler's (about `native/metadata.json`, the compiler's setup) says what
   to change in plain words.
4. Once it builds, the reader runs it: `check` it (PaperPaw's own checker on the
   plugin's folder: its texts, its screens drawn on every device, reach by
   buttons and by touch) and fix what it finds. Then open your screen directly
   with `control` (`show` with its id, or `run` the action that opens it),
   `wait` for it, and `look` at it on the X4 and on the Boox Go 7; a widget with
   `control` `widget` and its id, which puts it alone on the first page of the
   home screen. `press` the buttons a person would to try it, and once also
   reach it as they do (the tools menu, the home screen). `describe` says what
   is on the screen, focused and labelled, without guessing. Judge it as a
   careful designer would.
5. Settings of a widget belong to the widget: declare a group with the widget's
   name (`GroupDecl::new("note", "plugin.widget")`) and give each setting that
   group (`"plugin.note"`, the widget's id) and an id that starts with the
   widget's name (`"note.text"`), as the recipe `motto` does. The home screen's
   widget editor opens that group, and Settings does not list it; to see it,
   `control` `slot` `core.settings` with `params` `{id: <the widget's id>}`. A
   setting for the whole plugin goes in the group `groups::OTHER` (as `hello`).
6. Leave the reader showing it (a widget with `control` `widget`, a screen with
   `control` `show`), then tell the person what it does, what they see now and
   how they reach it on their reader.

## What this release does not cover yet

Plugins that use the network, files, secrets or Bluetooth need the matching
`services` and `features` in `native/metadata.json` and the device's calls for
them (the topics `abi/network`, `abi/files`, `abi/secrets` say how); there is
no recipe for them yet, so say so to the person when what they ask for needs
one of them and do not promise it. The emulator runs a plugin's code on Linux
(x86-64) only; where it does not, the build says so, and the plugin can still be
sent to a reader.
