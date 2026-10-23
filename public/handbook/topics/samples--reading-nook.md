## Sample: reading-nook

`plugin.ini`:

```ini
# A home screen of its own is a data plugin too: new defaults for the
# home screen's settings in settings.ini. Copy this folder into the
# `plugins` folder of your device and restart; the home screen shows it
# until you arrange it yourself.
[plugin]
id = reading-nook
name = Reading nook
description = A home screen: the time in words, the book being read and the ones before it.
version = 1.1.0
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
reading-nook.plugin.description = Eine Startseite: die Uhrzeit in Worten, das Buch, das du liest, und die davor.
```

`i18n/en.ini`:

```ini
[meta]
language = en
name = English
plural = one-other

[messages]
reading-nook.plugin.name = Reading nook
reading-nook.plugin.description = A home screen: the time in words, the book being read and the ones before it.
```

`settings.ini`:

```ini
# New defaults for the home screen, written as in paperpaw.ini: the time
# in words, the book being read and the ones before it, the tools on the
# next page. What the reader arranges still wins.
[home]
page-1 = "widgets.word-clock 0/0 4x2, home.continue 0/2 4x2, home.recent 0/4 4x2"
page-2 = home.tools
rows = 6
```
