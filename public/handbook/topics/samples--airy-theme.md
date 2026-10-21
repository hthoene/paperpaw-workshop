## Sample: airy-theme

`plugin.ini`:

```ini
# A theme is a data plugin: new defaults for the appearance settings
# (Settings > Customise > Appearance). Copy this folder into the
# `plugins` folder of your device and restart; switch it off in the
# plugin manager to go back. What you choose in the settings still wins.
[plugin]
id = airy-theme
name = Airy
description = The classic look, roomier: light headers with a line, wide margins, roomy rows and small corners.
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
airy-theme.plugin.name = Luftig
airy-theme.plugin.description = Der klassische Look, großzügiger: helle Kopfzeilen mit Linie, breite Ränder, großzügige Zeilen und kleine Ecken.
```

`settings.ini`:

```ini
[core]
ui-header = core.header.light
ui-margin = 6
ui-row = 220
ui-lines = 2
ui-corners = core.corners.small
ui-separators = core.separators.line
ui-title = 115
```
