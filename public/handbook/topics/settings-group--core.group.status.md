| Setting | Name | Values | Default | What it does |
|---|---|---|---|---|
| `[core] status-font` | Font | `core.status-font.ui`, `core.status-font.book`, `PaperPaw Sans` | `core.status-font.ui` | The font of the status lines while reading: as the menus', as the book's, or one of its own. |
| `[core] battery-low` | Battery low at | 5 to 50 | `20` | The charge at which "Battery when low" shows in a status line. |
| `[core] status-bar.all` | Status bar on all screens | `true`, `false` | `false` | Shows the time and the battery at the top of every screen that has no status line of its own. |
| `[core] status-bar.line` | Status bar line | text | `core.status-line.items` | The status line the status bar shows. Empty: no status bar. |
| `[core] status-bar.screens` | Status bar per screen | text | `` | One screen per line, as screen=shown or screen=hidden. Wins over what the screen says. |
| `[reader] status.size` | Text size | 5 to 16 | `6` | The size of the text in the status lines. |
| `[reader] status.edge` | Distance from the edge | 0 to 150 | `15` | How near the status lines sit to the edge. The text keeps its margins. |
| `[reader] status.top-lines` | Lines at the top | list | `` | The lines a tap on the status line switches between. None: no line here. |
| `[reader] status.bottom-lines` | Lines at the bottom | list | `core.status-line.items, reader.status-line.chapter, reader.status-line.progress, reader.status-line.empty` | The lines a tap on the status line switches between. None: no line here. |
| `[reader] status.top-left` | Top left | list | `` | What this part of the line shows, left to right. |
| `[reader] status.top-center` | Top centre | list | `` | What this part of the line shows, left to right. |
| `[reader] status.top-right` | Top right | list | `` | What this part of the line shows, left to right. |
| `[reader] status.bottom-left` | Bottom left | list | `core.status.clock, reader.status.aloud, lock.touch-status` | What this part of the line shows, left to right. |
| `[reader] status.bottom-center` | Bottom centre | list | `` | What this part of the line shows, left to right. |
| `[reader] status.bottom-right` | Bottom right | list | `reader.status.page` | What this part of the line shows, left to right. |
| `[reader] status.battery-percent` | Battery in percent | `true`, `false` | `true` | The charge as a number beside the battery symbol. |
