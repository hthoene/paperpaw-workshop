| Setting | Name | Values | Default | What it does |
|---|---|---|---|---|
| `[core] status-font` | Font | `core.status-font.ui`, `core.status-font.book`, `Literata`, `Source Sans 3` | `core.status-font.ui` | The font of the status lines while reading: as the menus', as the book's, or one of its own. |
| `[reader] status.size` | Text size | 5 to 16 | `6` | The size of the text in the status lines. |
| `[reader] status.edge` | Distance from the edge | 0 to 150 | `15` | How close the status lines sit to the edge of the screen. The text keeps its margins and has the room left. |
| `[reader] status.top-lines` | Status lines | list | `` | The lines a tap on the status line switches between. None: no line here. |
| `[reader] status.bottom-lines` | Status lines | list | `reader.status-line.items, reader.status-line.progress, reader.status-line.empty` | The lines a tap on the status line switches between. None: no line here. |
| `[reader] status.top-left` | Top left | list | `` | What this part of the line “Text and symbols” shows: status items such as the time, the chapter or the page, in the order chosen. |
| `[reader] status.top-center` | Top centre | list | `` | What this part of the line “Text and symbols” shows: status items such as the time, the chapter or the page, in the order chosen. |
| `[reader] status.top-right` | Top right | list | `` | What this part of the line “Text and symbols” shows: status items such as the time, the chapter or the page, in the order chosen. |
| `[reader] status.bottom-left` | Bottom left | list | `reader.status.aloud, reader.status.chapter` | What this part of the line “Text and symbols” shows: status items such as the time, the chapter or the page, in the order chosen. |
| `[reader] status.bottom-center` | Bottom centre | list | `core.status.clock` | What this part of the line “Text and symbols” shows: status items such as the time, the chapter or the page, in the order chosen. |
| `[reader] status.bottom-right` | Bottom right | list | `wifi.status, power.status, core.status.battery, reader.status.page` | What this part of the line “Text and symbols” shows: status items such as the time, the chapter or the page, in the order chosen. |
| `[reader] status.battery-percent` | Battery in percent | `true`, `false` | `true` | The charge as a number beside the battery symbol. |
