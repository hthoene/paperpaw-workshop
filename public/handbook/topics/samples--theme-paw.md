## Sample: theme-paw

`plugin.ini`:

```ini
# A theme is a data plugin: new defaults for the appearance settings
# (Settings > Customise > Appearance, with advanced settings). Copy this
# folder into the `plugins` folder of your device and restart; switch it
# off in the plugin manager to go back. What you choose still wins.
[plugin]
id = theme-paw
name = Paw
description = Round and friendly: a frame for the highlight, no lines, taller rows.
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
theme-paw.plugin.name = Pfote
theme-paw.plugin.description = Rund und freundlich: ein Rahmen als Hervorhebung, keine Linien, höhere Zeilen.
```

`settings.ini`:

```ini
[core]
ui-corners = core.corners.soft
ui-focus = core.focus.ring
ui-header = core.header.plain
ui-separators = core.separators.none
ui-title = 140
ui-row = 180
ui-margin = 4
```
