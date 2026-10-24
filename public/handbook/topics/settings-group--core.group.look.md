| Setting | Name | Values | Default | What it does |
|---|---|---|---|---|
| `[core] ui-size` | Menu text size | 7 to 24 | `9` | Size of menus, lists and the status line. |
| `[core] ui-contrast` | Contrast | `core.contrast.normal`, `core.contrast.strong` | `core.contrast.normal` | Strong draws gray hints and notes in black. |
| `[core] ui-header` | Headers | `core.header.plain`, `core.header.light`, `core.header.dark` | `core.header.plain` | How the title at the top of menus and lists looks. |
| `[core] widgets.frame` | Frames of widgets | `core.frame.own`, `core.frame.none`, `core.frame.line`, `core.frame.card`, `core.frame.dark` | `core.frame.own` | A frame for every widget that has none chosen in its own settings. |
| `[core] ui-corners` | Corners | `core.corners.square`, `core.corners.small`, `core.corners.round`, `core.corners.soft` | `core.corners.soft` | Of highlighted rows, buttons and boxes. |
| `[core] ui-focus` | Highlight | `core.focus.fill`, `core.focus.ring`, `core.focus.soft` | `core.focus.fill` | How the chosen row is shown. |
| `[core] ui-separators` | Lines between rows | `core.separators.inset`, `core.separators.line`, `core.separators.none` | `core.separators.inset` | Light lines, fainter lines from where the text starts, or none. |
| `[core] ui-groups` | Groups | `core.groups.plain`, `core.groups.cards` | `core.groups.plain` | The sections of lists as they are or on rounded cards. |
| `[core] ui-title` | Title size | 100 to 200 | `115` | Size of the titles at the top of menus and lists, in percent of the text's. |
| `[core] ui-margin` | Margins of menus | 0 to 15 | `4` | Space at the left and right of menus and lists. |
| `[core] ui-row` | Row height | 120 to 300 | `160` | Height of the rows of menus and lists, relative to their text. |
| `[core] ui-lines` | Lines | 1 to 10 | `3` | How thick lines and frames are drawn. |
| `[core] logo` | Logo picture | text | `` | Path of a JPEG or PNG shown instead of PaperPaw's logo; empty: the usual one. |
| `[core] ui-palette` | Grays | text | `` | Grays by purpose, e.g. muted=60 line=170 (0 black, 255 white). |
| `[core] text-color` | Text colour | `core.color.black`, `core.color.dark-gray`, `core.color.gray`, `core.color.brown`, `core.color.dark-blue`, `core.color.dark-green`, `core.color.burgundy`, `core.color.violet`, `core.color.own` | `core.color.black` | Softer than black on white, easier on the eyes; night mode swaps them. |
| `[core] text-color-own` | Own text colour | text | `#5b4636` | A colour code such as #5b4636 (red, green, blue), used when the colour above is "Own colour". |
| `[core] paper-color` | Paper colour | `core.paper.white`, `core.paper.cream`, `core.paper.sepia`, `core.paper.sand`, `core.paper.light-gray`, `core.paper.mint`, `core.paper.light-blue`, `core.paper.rose`, `core.paper.own` | `core.paper.white` | Softer than black on white, easier on the eyes; night mode swaps them. |
| `[core] paper-color-own` | Own paper colour | text | `#f4ecd8` | A colour code such as #5b4636 (red, green, blue), used when the colour above is "Own colour". |
| `[home] page-1` | Home page 1 | text | `home.clock, home.continue, home.recent` | The items on this page and their places. Change them on the home screen. |
| `[home] page-2` | Home page 2 | text | `home.tools` | The items on this page and their places. Change them on the home screen. |
| `[home] page-3` | Home page 3 | text | `` | The items on this page and their places. Change them on the home screen. |
| `[home] page-4` | Home page 4 | text | `` | The items on this page and their places. Change them on the home screen. |
| `[home] page-5` | Home page 5 | text | `` | The items on this page and their places. Change them on the home screen. |
| `[home] page-6` | Home page 6 | text | `` | The items on this page and their places. Change them on the home screen. |
| `[home] page-7` | Home page 7 | text | `` | The items on this page and their places. Change them on the home screen. |
| `[home] page-8` | Home page 8 | text | `` | The items on this page and their places. Change them on the home screen. |
| `[home] columns` | Columns | 2 to 6 | `3` | How many cells the home screen has across. |
| `[home] rows` | Rows | 0 to 12 | `0` | How many cells it has down; 0: as many as make the cells about square. |
| `[home] tool-labels` | Names under the tools | `true`, `false` | `true` | The tools on the home screen with their names, or only their icons. |
| `[home] focus-at-once` | Show the focus at once | `true`, `false` | `false` | The selection frame shows at once, not only after the first button press. |
| `[home] status-bar` | The status line at the top | `true`, `false` | `true` | The time, the battery and more, above the home screen. |
| `[home] footer.pencil` | Pencil below the page | `true`, `false` | `true` | Without it, edit the home screen by a long press or from the menu. |
| `[home] footer.dots` | Dots for the pages | `true`, `false` | `true` | Where one is among the pages, below them. |
| `[home] footer.items` | More below the page | list | `` | Status items beside the dots, e.g. the battery. |
| `[menu] style` | Menus | `menu.style.list`, `menu.style.tiles` | `menu.style.list` | Menus as a list, or as tiles with their icons at the top of the screen. |
