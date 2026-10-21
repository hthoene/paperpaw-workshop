# Plugins without code

The plugins you make here are folders of text files, "data plugins":
they change PaperPaw's look, its home screen, its buttons and menus,
its texts, its fonts and its book styles, on every device, without code.

What each wish becomes:

| The person wants | The plugin holds |
|---|---|
| A different look (margins, rows, headers, corners, highlight, lines, lists on cards, title size) | `settings.ini`: new defaults for the appearance settings (`[core]` `ui-...`), see the look settings below |
| Bigger or smaller text, another font in books, spacing, margins of book pages | `settings.ini` with the reading settings (`[core]` `font-size`, `line-spacing`, `margin` ...); `fonts/` for a font family of its own; `styles.css` for book styles |
| A home screen of their own | `presets.ini`: a preset of the kind `home.layout`, placing widgets on pages |
| Buttons, taps or swipes doing something else | `keymap.ini`: bindings in layers (`[keymap.global]`, `[keymap.core.reader]` ...) to action ids |
| Different menus | Nothing: menus are the person's own choice, made on the device with the menu editor (or `[menus]` in its `paperpaw.ini`); a data plugin does not set them. Say so, and offer key bindings instead |
| Texts in another language, or other words | `i18n/<lang>.ini` |
| Its own logo | a `.png` and `[core] logo = plugins/<id>/logo.png` in `settings.ini` |

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

`formats` is the version of the data files' formats it is made for (2
only when it has `marks.ini`).

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

A home screen layout places widgets on a grid of `home.columns` columns
and `home.rows` rows: `<widget-id>@<n> <column>/<row> <width>x<height>`,
separated by commas, one page per setting `home.page-1` to
`home.page-4`; `@<n>` numbers the placements so each may have settings
of its own (`home.recent@1.count = 8`). The widgets are listed below.
