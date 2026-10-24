## Checking your plugin

`paperpaw-dev` ([`tools/dev`](../tools/dev/src/lib.rs)) looks at a
plugin the way its users will meet it, before it is published. It runs
PaperPaw's standard app with the plugin added on emulated devices (by default
the X4, X4 Pro and Boox profiles), draws everything the plugin adds and
checks it. It finds what
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
| `visual` | What is drawn, checked: text cut at its box or the screen (`visual.text-cut`), shortened (`visual.ellipsis`), an explanation of several lines cut short (`visual.explanation-cut`, an error) or broken where it should not be (`visual.wrap`); ink outside a widget's cell (`visual.outside-cell`) or the screen (`visual.off-screen`); parts over each other (`visual.overlap`); margins off the interface's (`visual.margin`) and rows out of line (`visual.align`); labels and icons off centre by their ink (`visual.ink-centre`); touch targets under 7 mm (`visual.touch-target`); buttons without the room around them (`visual.button-room`); a focus that does not show with buttons (`visual.focus`); text that dithers away on black and white or is too light on grays (`visual.contrast`). |
| `lint` | Texts and ids: translations missing or left over, placeholders and plural forms; keys shown as they are because English has no text for them (`lint.missing-key`); settings without help (`lint.setting-help`), and descriptions longer than the two lines of their row on the X4 (`lint.help-cut`); setting groups without an order or an icon (`settings.group-order`, `settings.group-icon`), and a widget's settings in a group of the main page rather than the widget's own (`settings.widget-group`); plugins with code that say nothing or little of how they work (`lint.how-it-works`); ids outside the plugin's namespace; dashes (`lint.dash`); and in the pseudo-language, text that fits in English but not once it is longer (`lint.pseudo-overflow`) and text drawn without going through the catalogs (`lint.hardcoded`). |
| `reach` | With buttons alone: every screen the plugin adds can be reached from the home screen (`reach.unreachable`) and closed with *Back* (`reach.no-close`), the focus visits every row and button (`reach.focus-skips`) and does not get stuck (`reach.focus-trap`); a screen whose focus moves but which tells nothing of its rows (`reach.undescribed`). |
| `explore` | A cheap baseline beside the flows: every target of every screen the plugin adds (at most 20 a screen, 200 a device) used once, each from a fresh start, by touch or with the buttons; then the home screen must be reached again. A panic, an allocation the device would refuse or no way back home is an error (`explore.failed`). |
| `perf` | Budgets on the X4: storage read while drawing (`perf.draw-io`, the rule of `crates/paperpaw-app/tests/draw.rs`), the heap a screen takes against what the X4 has free (`perf.heap`), heap kept after it closes (`perf.leak`), frames estimated slow on an X4 (`perf.frame-time`), many reads before the first frame (`perf.open-io`); the top costs in `perf/index.html`. |
| `flows` | Scripted flows with assertions (`--flow a.flow`): each step's heap and frame time against the X4's budgets, and each flow played again at the edges; see below. |
| `package` | A data plugin as the device's installer and the plugin library take it (id, paths, file count and sizes, file kinds, `formats`, settings and presets that exist), installed on each device as the store does; a `.ppn` file checked as the device checks it (header, digest, the author's signature), with its fingerprint and sizes; flows and test pictures left in a data plugin's folder, which would ship with it (`package.tests`). `--release <version>` (for a `.ppn`, the release's fingerprint) tells whether that release takes it. |
| `snapshots` | Screens and widgets compared with reference pictures (`--snapshots <dir>`, `tests/snapshots` by default); `--bless` writes them anew. |
| `ui-kit` | Every building block of the SDK's `ui` module (see [Which building block for what](#which-building-block-for-what)), drawn as the gallery draws screens: on every device, in every look, light and dark, with and without the focus. Not part of `check`. |

The pseudo-language makes every English text about a third longer and
accents its letters (`[Šéţţîñĝš ~~]`); with `--language pseudo` the
gallery and the visual checks show where a translation will not fit.

### Flows

A flow is a text file of steps and of what should be true after them, run
on every device it fits:

```text
# Night mode from the menu, with buttons alone.
profiles: xteink-x4, xteink-x4-pro

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

Steps are those of the emulator's scripts: a button's name, `long:`,
`tap:x:y`, `tap-on:<text>`, `long-tap:x:y`, `swipe:`, `down:`, `move:`,
`up:`, `wait:<ms>`, `run:<action>`, `open:<screen>`, `type:<text>`
into the keyboard shown, `type-enter:` to confirm it, `redraw` and
`shot:<file>`. Lines before the first step may say `profiles: a, b`
and `set: <id> = <value>`, a setting before the app starts. Assertions
are `expect screen`, `stack`, `text`, `no text`, `focus`, `on`, `off`,
`setting`, `no warnings` and `picture <name>`, which compares the
screen with a snapshot. `paperpaw-emu --record
my.flow` writes what one does in the emulator's window as a flow, to be
replayed with `paperpaw-dev flows --flow my.flow`; the `expect` lines are
added after.

Write a flow for every action of a plugin: each thing a user does with it
(a setting switched, an entry made, a sync started, a book opened from its
screen), from where they start to what should be true after, by touch and
with the buttons alone. Flows are the main test of what a plugin does;
`explore` only finds what breaks when each thing is touched once.

On the profiles with the X4's budgets every step is measured: the most
the heap held during it and its slowest frame, estimated on an X4. The
costliest step is named: `flows.heap` is an error where the X4 would run
out and a warning above an eighth of its heap, `flows.frame-time` a
warning above half a second.

Unless `--quick`, each flow is then played again in variations that find
what happens at the edges: every step done ten times; *Back*, *Home* or
sleep and waking at a few places in the middle; network answers that
fail, come late, are empty or far too large; the pseudo-language; a book
with a very long name; a storage that is almost full. Assertions are left
out there. Each variation must not panic, must stay within the heap and
must find its way back to the home screen (`flows.varied`).

Keep flows and their snapshots beside the plugin rather than in its
folder (in a plugin's own repository, `tests/flows` and
`tests/snapshots`): `package` warns of those that would ship in a
package. None of this is part of a device's build; `paperpaw-dev` runs on
the computer only.

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

The CI job (`.github/workflows/paperpaw-dev.yml`) runs the tests,
`check --plugin my-plugin --quick` and the flows of `tests/flows`
(`flows --flow tests/flows`, varied at the edges), and keeps the report
as the run's artifact, also when a check failed.
