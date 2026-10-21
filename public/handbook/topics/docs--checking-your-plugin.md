## Checking your plugin

`paperpaw-dev` ([`tools/dev`](../tools/dev/src/lib.rs)) looks at a
plugin the way its users will meet it, before it is published. It runs
PaperPaw's standard app with the plugin added on emulated devices (the
emulator's profiles: the X4, X4 Pro, X4 Classic and the Boox by
default), draws everything the plugin adds and checks it. It finds what
is easy to miss on one's own device: a label that fits in English but not
in German, a widget that spills out of its cell at 1x1, a screen that
cannot be left with the X4's buttons, a frame that reads the card in
every band.

What it is given:

- **A plugin with code**, in its own repository: a few lines add it to
  the app (see [below](#in-a-plugins-own-repository)), then
  `cargo run --example paperpaw-dev -- check --plugin my-plugin`.
- **A data plugin**: its folder, `paperpaw-dev check path/to/my-theme`.
- **A code plugin built for a device**: `paperpaw-dev package hello.ppn`.
- **PaperPaw's own plugins**, which the app has already:
  `cargo run -p paperpaw-dev -- check --plugin widgets`.

`check` runs every command below and writes one report into
`target/paperpaw-dev` (`--out` for another folder): `report.html` with
every finding, its picture and the place marked, `report.json` for tools,
and the pages the commands made. Errors make the run fail, for CI;
warnings too with `--strict`.

```sh
cargo run -p paperpaw-dev -- check --plugin widgets --quick
cargo run -p paperpaw-dev -- visual --plugin stats --profile boox-go-7 --language de
cargo run -p paperpaw-dev -- gallery samples/plugins/airy-theme
cargo run -p paperpaw-dev -- --help
```

### Variants

A plugin is looked at in every combination of device profile
(`--profile <id>|all`; `paperpaw-dev --list` lists them), language
(`--language <code>`, by default every language the app has; `pseudo`
for the pseudo-language), light and dark (`--light`, `--dark`) and look
(`--theme <name>|all`: the default, square corners, round corners with
strong contrast). `--quick` takes one variant a device: English, light,
the default look. `--set <id>=<value>` sets a setting for every run.

### The commands

| Command | What it does |
|---|---|
| `gallery` | Contact sheets: every screen the plugin adds and every widget in every size it can take, in every variant, as HTML pages (`gallery/index.html`) and one PNG sheet a plugin and device. |
| `visual` | What is drawn, checked: text cut at its box or the screen (`visual.text-cut`), shortened (`visual.ellipsis`) or broken where it should not be (`visual.wrap`); ink outside a widget's cell (`visual.outside-cell`) or the screen (`visual.off-screen`); parts over each other (`visual.overlap`); margins off the interface's (`visual.margin`) and rows out of line (`visual.align`); labels and icons off centre by their ink (`visual.ink-centre`); touch targets under 7 mm (`visual.touch-target`); a focus that does not show with buttons (`visual.focus`); text that dithers away on black and white or is too light on grays (`visual.contrast`). |
| `lint` | Texts and ids: translations missing or left over, placeholders and plural forms; keys shown as they are because English has no text for them (`lint.missing-key`); settings without help (`lint.setting-help`); ids outside the plugin's namespace; dashes (`lint.dash`); and in the pseudo-language, text that fits in English but not once it is longer (`lint.pseudo-overflow`) and text drawn without going through the catalogs (`lint.hardcoded`). |
| `reach` | With buttons alone: every screen the plugin adds can be reached from the home screen (`reach.unreachable`) and closed with *Back* (`reach.no-close`), the focus visits every row and button (`reach.focus-skips`) and does not get stuck (`reach.focus-trap`); a screen whose focus moves but which tells nothing of its rows (`reach.undescribed`). |
| `perf` | Budgets on the X4: storage read while drawing (`perf.draw-io`, the rule of `crates/paperpaw-app/tests/draw.rs`), the heap a screen takes against what the X4 has free (`perf.heap`), heap kept after it closes (`perf.leak`), frames estimated slow on an X4 (`perf.frame-time`), many reads before the first frame (`perf.open-io`); the top costs in `perf/index.html`. |
| `flows` | Scripted flows with assertions (`--flow a.flow`), see below. |
| `package` | A data plugin as the device's installer and the plugin library take it (id, paths, file count and sizes, file kinds, `formats`, settings and presets that exist), installed on each device as the store does; a `.ppn` file checked as the device checks it (header, digest, the author's signature), with its fingerprint and sizes. `--release <version>` (for a `.ppn`, the release's fingerprint) tells whether that release takes it. |
| `snapshots` | Screens and widgets compared with reference pictures (`--snapshots <dir>`, `tests/snapshots` by default); `--bless` writes them anew. |

The pseudo-language makes every English text about a third longer and
accents its letters (`[Šéţţîñĝš ~~]`); with `--language pseudo` the
gallery and the visual checks show where a translation will not fit.

### Flows

A flow is a text file of steps and of what should be true after them, run
on every device it fits:

```text
# Night mode from the menu, with buttons alone.
profiles: xteink-x4, xteink-x4-classic

long:confirm
expect screen menu.list
expect focus "Home"
right
right
right
right
expect off "Night mode"
confirm
expect setting core.night-mode = on
back
expect stack 1
expect no warnings
```

Steps are those of the emulator's scripts (a button's name, `long:`,
`tap:x:y`, `tap-on:<text>`, `swipe:`, `wait:<ms>`, `run:<action>`,
`open:<screen>`); assertions are `expect screen`, `stack`, `text`,
`no text`, `focus`, `on`, `off`, `setting`, `no warnings` and
`picture <name>` (compared with a snapshot). `paperpaw-emu --record
my.flow` writes what one does in the emulator's window as a flow, to be
replayed with `paperpaw-dev flows --flow my.flow`; the `expect` lines are
added after.

### In a plugin's own repository

[`tools/dev/templates`](../tools/dev/templates/README.md) has what a
plugin's repository needs: the harness, the snapshot test and a CI job.
`paperpaw-dev` is a dev-dependency by git, with the tag of the release the
plugin is made for, and the SDK is patched to the same tag, so that the
plugin and the app share one:

```toml
[dev-dependencies]
paperpaw-dev = { git = "https://github.com/hthoene/paperpaw", tag = "v0.4.0" }

[patch.crates-io]
paperpaw-sdk = { git = "https://github.com/hthoene/paperpaw", tag = "v0.4.0" }
```

`examples/paperpaw-dev.rs` adds the plugin to the app:

```rust
fn main() -> std::process::ExitCode {
    paperpaw_dev::main(|app| app.plugin(my_plugin::MyPlugin))
}
```

`tests/snapshots.rs` compares the cases of `tests/snapshots/cases.ini`
with the pictures beside it; `PAPERPAW_BLESS=1 cargo test --test
snapshots` writes them anew (look at each before committing it):

```ini
[x4-screen]
screen = my-plugin.screen
profile = xteink-x4

[boox-widget-wide]
widget = my-plugin.widget 4x2
profile = boox-go-7
core.night-mode = true
```

The CI job (`.github/workflows/paperpaw-dev.yml`) runs the tests and
`check --plugin my-plugin --quick`, and keeps the report as the run's
artifact, also when a check failed.
