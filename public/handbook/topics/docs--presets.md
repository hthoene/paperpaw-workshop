### Presets

A preset is a ready-made set of setting values chosen as a whole
(`paperpaw_sdk::presets`). It has a kind, named by the plugin that
offers such presets: that plugin lists those of its kind
(`env.settings.presets().of_kind(kind)`), works out what one changes
(`Preset::changes` with the settings it covers), shows it
(`Command::PreviewSettings`: the values show on every screen without
being kept, until the screen that asked closes) and keeps it
(`presets::commands`); the settings of its kind that a preset leaves
out go back to their defaults. The kinds PaperPaw's own plugins offer
are themes (`core.theme`, below), pictures over the page for the sleep
screen (`sleep.overlay`, see [Plugins without code](#plugins-without-code))
and the power modes (`core.power-mode`, which the kernel wears). Add
presets kept in the program with `Registrar::add_presets` (a `static`
list of `Preset::fixed`), for your own kind or another plugin's:

```rust
static THEMES: [Preset; 1] = [Preset::fixed(
    "my.dusk",
    presets::THEME,
    "my.dusk",      // translation keys of its name
    "my.dusk.help", // and of a sentence on it
    "core.ui-focus = core.focus.ring
core.ui-separators = core.separators.none",
)];

r.add_presets(&THEMES)?;
```

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
