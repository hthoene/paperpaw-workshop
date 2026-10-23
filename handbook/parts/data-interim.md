# The data files

## What each wish becomes

| The person wants | The plugin holds |
|---|---|
| A different look (margins, rows, headers, corners, highlight, lines, lists on cards, title size) | `settings.ini`: new defaults for the appearance settings (`[core]` `ui-...`), see the look settings below |
| Bigger or smaller text, another font in books, spacing, margins of book pages | `settings.ini` with the reading settings (`[core]` `font-size`, `line-spacing`, `margin` ...); `fonts/` for a font family of its own; `styles.css` for book styles |
| A home screen of their own | `settings.ini`: the widgets of each page in order, `[home] page-1 = home.clock, home.continue` (pages 1 to 8), and the widgets' own settings (`settings/home`) |
| A theme to choose in Settings | `presets.ini`: presets of the kind `core.theme` (see Presets below) |
| Buttons, taps or swipes doing something else | `keymap.ini`: bindings in layers (`[keymap.global]`, `[keymap.core.reader]` ...) to action ids |
| One press doing several things (ten pages on, night mode and a bigger font) | `actions.ini` (formats 3): an action of up to 16 steps, bound in `keymap.ini` |
| Different menus, a menu of its own | `menus.ini` (formats 3): entries added, placed or taken out of any menu, menus of its own |
| Texts in another language, or other words | `i18n/<lang>.ini` |
| Its own logo | a `.png` and `[core] logo = plugins/<id>/logo.png` in `settings.ini` |
| A picture while the reader sleeps | pictures in a folder of the plugin (`sleep/1.png` ...) and in `settings.ini` `[sleep] show = sleep.show.picture`, `folder = plugins/<id>/sleep` |
| A picture on the home screen | the widget `widgets.picture` in the layout, its pictures in a folder of the plugin, `[widgets] picture.folder = plugins/<id>/pictures` |
| Other icons for actions and settings | `icons.ini` (formats 3): `item = icon-name`, from the icons PaperPaw has |
| A background behind screens | Not yet: PaperPaw has no background picture. Say so |

A plugin's `settings.ini` sets defaults: what the person chose in
Settings on the device still wins, and switching the plugin off in the
plugin manager brings PaperPaw's look back.

Every plugin starts with `plugin.ini`:

```ini
[plugin]
id = night-owl
name = Night owl
description = A calm dark look for reading at night.
version = 1.0.0
formats = 1
```

`formats` is the version of the data files' formats it is made for: 1,
2 with `marks.ini`, 3 with `menus.ini`, `actions.ini`, `icons.ini`,
`points/` or `setup.ini`.

Settings in `settings.ini` are written by their plugin as the section
and the rest of the id as the key: the setting `core.ui-row` is

```ini
[core]
ui-row = 180
```

A number must be within the setting's range; a choice must be one of its
values, written in full (`core.header.light`). Use `lookup_docs` with
`settings/<plugin>` (for example `settings/home`, `settings/reader`) to
see the settings of other plugins.

A home screen page lists its widgets in order, separated by commas,
one page per setting `home.page-1` to `home.page-8` (an empty page is
left out); `home.columns` sets how many sit side by side. Each widget
has settings of its own (`home.clock.size`, `home.date.align`); see
`settings/home`. The widgets are listed below.
