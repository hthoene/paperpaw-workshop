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
