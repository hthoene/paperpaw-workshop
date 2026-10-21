## Sample: reading-nook

`plugin.ini`:

```ini
# A home screen layout is a data plugin too: a preset of the kind
# home.layout in presets.ini. Copy this folder into the `plugins` folder
# of your device and restart; the layout is offered with the others
# (Edit home screen in the menu, then Add, then Home screen layouts).
[plugin]
id = reading-nook
name = Reading nook
description = A home screen layout: the time in words, the book being read and the ones before it.
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
reading-nook.plugin.name = Leseecke
reading-nook.plugin.description = Ein Layout der Startseite: die Uhrzeit in Worten, das Buch, das man liest, und die davor.
reading-nook.nook = Leseecke
reading-nook.nook.help = Die Uhrzeit in Worten, das Buch, das du liest, und die davor.
```

`i18n/en.ini`:

```ini
[meta]
language = en
name = English
plural = one-other

[messages]
reading-nook.nook = Reading nook
reading-nook.nook.help = The time in words, the book you are reading and the ones before it.
```

`presets.ini`:

```ini
# Each section is a preset: its kind, its name and a sentence on it
# (translation keys, see i18n, or plain text), then the settings it sets,
# as in paperpaw.ini but with the whole id. What a layout leaves out of
# the home screen's look goes back to its default when it is used.
# Widgets placed as `id@1` have settings of their own in the layout.
[nook]
kind = home.layout
name = reading-nook.nook
description = reading-nook.nook.help
home.page-1 = widgets.word-clock@1 0/0 4x2, home.continue@1 0/2 4x2, home.recent@1 0/4 4x2
home.page-2 = home.tools
home.rows = 6
home.recent@1.heading = off
```
