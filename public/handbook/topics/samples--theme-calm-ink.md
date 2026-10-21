## Sample: theme-calm-ink

`plugin.ini`:

```ini
# A theme is a data plugin: new defaults for the appearance settings
# (Settings > Customise > Appearance, with advanced settings). Copy this
# folder into the `plugins` folder of your device and restart; switch it
# off in the plugin manager to go back. What you choose still wins.
[plugin]
id = theme-calm-ink
name = Calm ink
description = Quiet and roomy: large titles, wide margins, no lines, a light highlight.
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
theme-calm-ink.plugin.name = Ruhige Tinte
theme-calm-ink.plugin.description = Ruhig und luftig: große Titel, breite Ränder, keine Linien, eine helle Hervorhebung.
```

`settings.ini`:

```ini
[core]
ui-corners = core.corners.round
ui-focus = core.focus.soft
ui-header = core.header.plain
ui-separators = core.separators.none
ui-title = 150
ui-row = 180
ui-margin = 5
ui-lines = 2
```
