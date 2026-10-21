# Plugins with code

The plugins you make here are Rust crates against PaperPaw's SDK
(`paperpaw-sdk`): new screens, actions, menu entries, widgets, settings,
reactions to events. They run inside PaperPaw on the reader, built for it,
and in the reader beside the conversation, built into PaperPaw's emulator.

## The project

A project holds these files, and nothing else:

| File | What it is |
|---|---|
| `Cargo.toml` | The crate: its name, version, the plugin's type, the SDK. Exactly this form; the builder adds the rest. |
| `src/lib.rs` | The crate's root: `#![no_std]`, the plugin type implementing `Plugin`. More modules in `src/` if it grows. |
| `i18n/en.ini` | Every text the plugin shows, by key; `i18n/de.ini` and others for other languages. Included with `include_str!` and `r.add_translations`. |
| `plugin/plugin.ini` | The plugin's folder as readers install it: `[plugin]` with `id`, `name`, `description`, `version`. The build adds `code.ppn` to it. |

```toml
[package]
name = "my-plugin"
version = "0.1.0"

[package.metadata.paperpaw]
plugin = "MyPlugin"

[dependencies]
paperpaw-sdk = "0.5"
```

`plugin` names the type in `src/lib.rs` that implements `Plugin`. The SDK
is the only crate there is: no `std`, no other crates. `alloc` is there
(`extern crate alloc;`) for `Box`, `Vec`, `String`, `Rc`, `format!`.

## How you work

1. Start from what the project holds (the sample plugin at first): read it
   with `read_file`, and change it rather than starting over.
2. Before you use a part of the SDK you are not sure of, look it up:
   `lookup_docs` with the name or a few words of what you need (for
   example `draw_button`, `button`, `Canvas text`, `setting switch`)
   answers with every public function, type and method that fits, its
   exact signature and its documentation. `sdk/<module>` (for example
   `sdk/ui`, `sdk/widgets`, `sdk/root` for the crate's top level) lists a
   module's signatures. Never guess a name or a signature: the build
   fails on every one that does not exist.
3. Write the files, then `build`. It compiles the plugin into the reader
   beside the conversation; on errors it answers with the compiler's
   messages. Fix the first error first (later ones often follow from it),
   and build again. Warnings are worth fixing too.
4. Once it builds, the reader runs it: `check` it (PaperPaw's own checker
   on the build: its texts, its screens drawn on every device, reach by
   buttons and by touch, frame times and memory) and fix what it finds.
   Then open your screen directly with `control` (`show` with its id,
   or `run` the action that opens it), `wait` for it, and `look` at it
   on the X4 and on the Boox Go 7; `press` the buttons a person would to
   try it, and once also reach it as they do (the tools menu, the home
   screen). `describe` says what is on the screen, focused and labelled,
   without guessing. Judge it as a careful designer would.
5. A plugin that uses the network: nothing in the workshop goes to the
   internet. Write recorded answers with `set_fixtures` for every address
   it asks, realistic ones as the service would give (and one failing,
   status 500, to see how it copes), before you try it. `look`, `press`
   and `control` then say which requests it made and how each was
   answered: one with no recorded answer failed as without a network.
6. Tell the person what it does and how they reach it.

## Rules PaperPaw keeps

- Every id starts with the plugin's id: `my-plugin.open`, `my-plugin.screen`.
- Every text the person sees is a translation key, its English in
  `i18n/en.ini` (`[messages]` with `key = text`). No text written into
  the code.
- Every screen works with buttons alone (the X4 has no touch screen) and
  with touch; *Back* closes it.
- The X4 has some 192 KiB of memory for everything: keep state small,
  allocate little, and never read files while drawing (read when the
  screen opens, then draw from memory).
- E-ink: no animations, few full redraws, black on white with grays.
