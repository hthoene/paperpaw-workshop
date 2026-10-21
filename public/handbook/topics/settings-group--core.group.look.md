| Setting | Name | Values | Default | What it does |
|---|---|---|---|---|
| `[core] ui-size` | Menu text size | 7 to 24 | `9` | Size of menus, lists and the status line. |
| `[core] ui-contrast` | Contrast | `core.contrast.normal`, `core.contrast.strong` | `core.contrast.normal` | Strong draws gray hints and notes in black, easier to read on screens with few grays. |
| `[core] ui-header` | Headers | `core.header.plain`, `core.header.light`, `core.header.dark` | `core.header.plain` | The top of menus and lists: the title on the page, black on white with a line below, or white on black. |
| `[core] ui-corners` | Corners | `core.corners.square`, `core.corners.small`, `core.corners.round`, `core.corners.soft` | `core.corners.soft` | Of highlighted rows, buttons and boxes; round and soft ones make buttons and switches pills. |
| `[core] ui-focus` | Highlight | `core.focus.fill`, `core.focus.ring`, `core.focus.soft` | `core.focus.fill` | How the chosen row is shown: a dark bar, a frame, or a light bar (a frame on screens of black and white alone). |
| `[core] ui-separators` | Lines between rows | `core.separators.inset`, `core.separators.line`, `core.separators.none` | `core.separators.inset` | Light lines, fainter lines from where the text starts, or none. |
| `[core] ui-groups` | Groups | `core.groups.plain`, `core.groups.cards` | `core.groups.plain` | The sections of lists as they are or on rounded cards. |
| `[core] ui-title` | Title size | 100 to 200 | `130` | Size of the titles at the top of menus and lists, in percent of the text's. |
| `[core] ui-margin` | Margins of menus | 0 to 15 | `4` | Space at the left and right of menus and lists. |
| `[core] ui-row` | Row height | 120 to 300 | `160` | Height of the rows of menus and lists, relative to their text. |
| `[core] ui-lines` | Lines | 1 to 10 | `3` | How thick lines and frames are drawn. |
| `[core] logo` | Logo picture | text | `` | A picture (JPEG, PNG) shown in place of PaperPaw's logo, e.g. plugins/mine/logo.png. Empty for PaperPaw's own. |
| `[core] text-color` | Text colour | `core.color.black`, `core.color.dark-gray`, `core.color.gray`, `core.color.brown`, `core.color.dark-blue`, `core.color.dark-green`, `core.color.burgundy`, `core.color.violet`, `core.color.own` | `core.color.black` | Softer than black on white, easier on the eyes on bright screens. Pictures take the colours too; night mode swaps them. |
| `[core] text-color-own` | Own text colour | text | `#5b4636` | A colour code such as #5b4636 (red, green, blue), used when the colour above is "Own colour". |
| `[core] paper-color` | Paper colour | `core.paper.white`, `core.paper.cream`, `core.paper.sepia`, `core.paper.sand`, `core.paper.light-gray`, `core.paper.mint`, `core.paper.light-blue`, `core.paper.rose`, `core.paper.own` | `core.paper.white` | Softer than black on white, easier on the eyes on bright screens. Pictures take the colours too; night mode swaps them. |
| `[core] paper-color-own` | Own paper colour | text | `#f4ecd8` | A colour code such as #5b4636 (red, green, blue), used when the colour above is "Own colour". |
| `[home] gesture-tips` | Hint on the gestures | `true`, `false` | `true` | Shows once how the gestures go; switch it on to see it again. |
| `[home] page-1` | Home page 1 | text | `home.clock, home.continue, home.recent` | What the page shows, item by item with its place in the grid. Change it on the home screen: the pencil below the page or a long press on it. |
| `[home] page-2` | Home page 2 | text | `home.tools` | What the page shows, item by item with its place in the grid. Change it on the home screen: the pencil below the page or a long press on it. |
| `[home] page-3` | Home page 3 | text | `` | What the page shows, item by item with its place in the grid. Change it on the home screen: the pencil below the page or a long press on it. |
| `[home] page-4` | Home page 4 | text | `` | What the page shows, item by item with its place in the grid. Change it on the home screen: the pencil below the page or a long press on it. |
| `[home] columns` | Columns | 2 to 6 | `4` | How many cells the home screen has across. |
| `[home] rows` | Rows | 0 to 12 | `0` | How many cells it has down; 0: as many as make the cells about square. |
| `[home] tool-labels` | Names under the tools | `true`, `false` | `true` | The tools on the home screen with their names, or only their icons. |
| `[home] focus-at-once` | Show the focus at once | `true`, `false` | `false` | Whether the frame showing what the buttons choose is there as soon as the home screen shows, or only after the first press. |
| `[home] status-bar` | The status line at the top | `true`, `false` | `true` | The time, the battery and what else is chosen in the status line widget's settings, above the home screen. |
| `[home] footer.pencil` | Pencil below the page | `true`, `false` | `true` | Without it, a long press on the home screen or Edit home screen in the menu edits it. |
| `[home] footer.dots` | Dots for the pages | `true`, `false` | `true` | Where one is among the pages, below them. |
| `[home] footer.items` | More below the page | list | `` | Status items beside the dots, e.g. the battery. |
| `[menu] style` | Menus | `menu.style.list`, `menu.style.tiles` | `menu.style.list` | Menus as a list, or as tiles with their icons at the top of the screen. |
| `[menu] quick.left` | Top left | list | `core.status.clock, core.status.date-short` | What this part of the quick panel's top line shows: the time, the date, the battery or other status items. |
| `[menu] quick.center` | Top centre | list | `` | What this part of the quick panel's top line shows: the time, the date, the battery or other status items. |
| `[menu] quick.right` | Top right | list | `wifi.status, core.status.battery` | What this part of the quick panel's top line shows: the time, the date, the battery or other status items. |
| `[menu] quick.size` | Text size at the top | 6 to 24 | `11` | The size of the time, date and battery above the quick panel. What it holds below is changed under Customise menus. |
