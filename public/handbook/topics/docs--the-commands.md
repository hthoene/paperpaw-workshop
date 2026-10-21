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
