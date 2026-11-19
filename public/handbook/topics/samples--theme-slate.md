## Sample: theme-slate

`plugin.ini`:

```ini
# A theme is a data plugin: new defaults for the appearance settings
# (Settings > Customise > Appearance, with advanced settings). Copy this
# folder into the `plugins` folder of your device and restart; switch it
# off in the plugin manager to go back. What you choose still wins.
# This one shows what a theme can set: corners, shadows, frames, spacing,
# the chosen row, buttons and the colours of the parts.
[plugin]
id = theme-slate
name = Slate
description = Cool grays on cards with hard shadows, roomy spacing, a light highlight and filled buttons.
version = 1.0.0
formats = 1
```

`i18n/de.ini`:

```ini
[meta]
language = de
name = Deutsch
plural = one-other

[messages]
theme-slate.plugin.name = Schiefer
theme-slate.plugin.description = Kühle Grautöne auf Karten mit harten Schatten, weite Abstände, eine helle Hervorhebung und gefüllte Knöpfe.
```

`settings.ini`:

```ini
[core]
ui-corners = core.corners.round
ui-shadow = core.shadow.hard
ui-frame = core.frame.card
ui-density = core.density.roomy
ui-focus = core.focus.soft
ui-button = core.button.filled
ui-separators = core.separators.none
ui-palette = paper=#f4f1ea text=#22303c card=#dfe5ea muted=#4a5a68 line=#b9c4cc panel=#ffffff focus=#8b99a4 control=#d2dae0 outline=#22303c chip=#22303c bar=#22303c
```
