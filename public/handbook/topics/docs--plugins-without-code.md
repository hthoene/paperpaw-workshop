## Plugins without code

A data plugin is a folder:

```text
plugins/large-print/
  plugin.ini     [plugin] id, name, description, version, formats
  i18n/*.ini     translation catalogs (also whole new languages)
  keymap.ini     key bindings
  settings.ini   new defaults for any plugin's settings ([core] font-size = 14)
  fonts/*.ttf    fonts to read with (also .otf, .ttc), by family
  fonts/*.ppfp   packs with letters other fonts lack, named in plugin.ini:
                 [extends] cyrillic.ppfp = fonts-default.literata
  fonts/…        a family's faces, named in plugin.ini: [family] name,
                 regular, bold, italic, bold-italic (packs, or .ttf/.otf
                 where scalable fonts are drawn)
  styles.css     a stylesheet for books, after a book's own (EPUB)
  presets.ini    ready-made sets of settings, e.g. themes
  marks.ini      words marked on book pages by patterns (formats 2)
  menus.ini      entries of menus, a menu of one's own (formats 3)
  actions.ini    actions made of steps (formats 3)
  icons.ini      icons of actions and settings: item = icon-name (formats 3)
  points/*.txt   lines for a point, one a line, e.g. about.lines.txt (formats 3)
  setup.ini      steps of the first-run setup (formats 3)
```

[Files on the card](data-files.md#a-data-plugins-files) lists each of them
with its format, what reads it and an example, and how a `settings.ini`
brings a home screen of its own.

`plugin.ini` may also bind fonts to roles (formats 3):

```ini
[fonts]
core.font-ui-strong = my.semibold
```

An action of `actions.ini` runs its steps in order, a step a `run`
line (commas and all), at most 16:
`<setting>=<value>` sets a setting (a value not of its kind is passed
over, and a setting that keeps the device safe, such as the lock's, is
never set), `open:<slot>` opens a slot, `notify:<key>` says the text of
a key of the plugin's translations in the reader's language,
`emit:<event>` emits an event of the plugin's own (`<plugin>.<name>`),
and an action's id runs that action (not one of the same file). A
section names the action. Without the plugin's id in front, it gets
it: `[night]` in the plugin `my` is `my.night`.

`menus.ini` adds to another plugin's menu, a section `[menu <id>]`,
places an entry after another and takes entries out; any other
section is a menu of one's own, with `title` and `entries`, which
other menus list by its id. A list is a key a line
([data-files.md](data-files.md#lists)):

```ini
# actions.ini
[night]
title = Night reading
icon = moon
run = core.night-mode=on
run = core.font-size=14
run = notify:my.good-night

# i18n/en.ini, [messages]
my.good-night = Good night, sleep well

# menus.ini
[menu core.reader-menu]
add = my.night after core.toc

[menu core.reader-more]
hide = stats.open

[tools]
title = My tools
entries = my.night
entries = core.library

# setup.ini
[size]
setting = core.font-size
order = 35
```

`formats` says which version of these files' formats the plugin is made
for (3 now: menus, actions, icons, points, setup steps and font roles
came with it, `marks.ini` with 2; 1 if it is left out); a PaperPaw
that reads an older one leaves the plugin out and says why, rather than
reading it wrongly. The files of formats 3 are read only for a plugin
that says `formats = 3`; for one made for an earlier version they are
left out, and PaperPaw says so.

A plugin's files take at most 96 KiB together besides its translations
(512 KiB of their own), those of formats 3 at
most 24 KiB of it, and its points at most 64 lines; what goes past is
left out and told. Each file takes at most 64 KiB, and `plugin.ini` at
most 4 KiB. `points/` holds at most 16 files. A default (`settings.ini`) or a preset does not
change a setting that keeps the device safe, such as the lock's.

Packs for other scripts are read a glyph at a time, so devices with
little memory can use them ([ADR 0018](adr/0018-font-packs-for-other-scripts.md)).
`tools/script-pack.py` builds Cyrillic and Greek for Literata.
A pack that extends a face with sizes larger than its own draws text
asked that large, and the font size goes as far: the X4's firmware has
Literata up to 32 px, and `tools/literata-packs.py` builds its larger
sizes (and its bold italic face) as plugins for the font library.
Icon packs are such packs for the icon font: `tools/icons/pack.py` builds
one with the Tabler icons named
(`[extends] icons.ppfp = fonts-default.icons`).

A family needs a name and a face, a family of its own a regular face;
its faces are packs, drawn on every device and read a glyph at a time,
or font files, drawn where scalable fonts are, a variable font at its
style's weight:

```ini
[family]
name = Fredoka
regular = regular.ppfp
bold = bold.ppfp
```

A plugin may also bring a face of a family that is there without it,
bound to its role: the X4's firmware has no Literata Bold Italic, which
such a plugin brings back:

```ini
[family]
name = Literata
bold-italic = literata-bold-italic.ppfp

[fonts]
core.font-reading-bold-italic = literata-bold-italic.bold-italic
```

A logo of its own takes the place of PaperPaw's (on the sleep screen,
the About page and the logo widget): a picture in the folder, named in
`settings.ini`:

```ini
[core]
logo = plugins/my-brand/logo.png
```

A theme can also be a `settings.ini` with new defaults. It is then not
chosen under *Theme*; it is on while the plugin is on. Its defaults are
for the appearance settings (*Settings > Customise > Appearance*, most of them with
advanced settings): the header (`core.header.plain`, `.light`, `.dark`),
the corners (`core.corners.square`, `.small`, `.round`, `.soft`; round
and soft ones make buttons and switches pills), the highlight
(`core.focus.fill`, `.ring`, `.soft`), the lines between rows
(`core.separators.inset`, `.line`, `.none`), lists on cards
(`core.groups.cards`), the size of headers' titles, the margins, rows
and lines:

```ini
[core]
ui-focus = core.focus.ring
ui-separators = core.separators.none
ui-title = 140
ui-row = 180
```

Pebble, a theme with lists on cards for touch screens, comes with
PaperPaw, switched off in the plugin manager.

The fonts browser (`plugins/fonts-browser`) downloads fonts as such
plugins from paperpaw.org: font files for devices with scalable fonts
and the memory for them, packs for the others. The store
(`plugins/store`, *More plugins*) lists the other plugins of the plugin
library made for the device, data plugins and, where PaperPaw loads
them and a build fits, plugins with code, and installs, updates and
removes them ([ADR 0023](adr/0023-plugin-store.md)). Both build on the
SDK's `install` module: an `Installer` downloads a `Package`'s files one
after another into `plugins/.<id>.part`, checks each by its size and
digest (SHA-1 or SHA-256), then has the kernel install it
(`Command::InstallPlugin`) in place of
every version of it before, what was chosen from it still chosen; the
job is kept on the storage, so it goes on with no screen open. Where a
plugin came from is kept once it is in place (`install::origin`): the
store updates only those it installed, and one put in place otherwise
(the Wi-Fi transfer, the USB cable, a card) is local, which the plugin
manager says. `install::local::Staging` installs a plugin sent file by
file, with the same checks.

Copy it into the `plugins` folder of a device (or of the emulator's
library) and restart, or have a plugin load it at once
(`Command::LoadPlugin` with its folder; `Command::RemovePlugin` removes
one, its fonts and presets at once, the rest after the next start). A plugin's `styles.css` comes after a book's own
stylesheets and before one's own (`styles.css` beside the books, then
the one named like a book), so the more particular wins; plugins with
code add theirs with `Registrar::add_stylesheet`.

A `presets.ini` holds presets (see above), a section each: its `kind`,
its `name` and `description` (translation keys from its `i18n`, or the
text itself), then the settings it sets by their whole id. Themes are
such presets (`kind = core.theme`, above). Pictures over the page for
the sleep screen are presets of `sleep.overlay`: the picture (or a
widget, `sleep.overlay-widget`), and where it goes and how large it is
if the preset likes (what it leaves out stays as the reader set it).

```ini
[owl]
kind = sleep.overlay
name = Owl
sleep.overlay-picture = plugins/owls/owl.png
sleep.overlay-position = sleep.position.bottom-right
sleep.overlay-size = 40
```

The picture's clear parts show the page, so a PNG with transparency
looks best. [`samples/plugins`](../samples/plugins) has large print,
three themes (airy, paw, calm ink) and a home screen (reading nook).
