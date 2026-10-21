## Sample: large-print

`plugin.ini`:

```ini
# A data plugin: no code, just files. Copy this folder into the `plugins`
# folder of your device (or of the emulator's library) and restart.
[plugin]
id = large-print
name = Large print
description = Bigger text in books and menus.
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
large-print.plugin.name = Großdruck
large-print.plugin.description = Größere Schrift in Büchern und Menüs.
```

`settings.ini`:

```ini
# New defaults for other plugins' settings, written as in paperpaw.ini.
# What you choose in the settings still wins.
[core]
ui-size = 14
font-size = 14
line-spacing = 145
```
