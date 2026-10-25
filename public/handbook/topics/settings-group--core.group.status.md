| Setting | Name | Values | Default | What it does |
|---|---|---|---|---|
| `[core] status-font` | Font | `core.status-font.ui`, `core.status-font.book`, `Literata`, `PaperPaw Sans` | `core.status-font.ui` | The font of the status lines while reading: as the menus', as the book's, or one of its own. |
| `[reader] status.size` | Text size | 5 to 16 | `6` | The size of the text in the status lines. |
| `[reader] status.edge` | Distance from the edge | 0 to 150 | `15` | How near the status lines sit to the edge. The text keeps its margins. |
| `[reader] status.top-lines` | Status lines | list | `` | The lines a tap on the status line switches between. None: no line here. |
| `[reader] status.bottom-lines` | Status lines | list | `core.status-line.items, reader.status-line.progress, reader.status-line.empty` | The lines a tap on the status line switches between. None: no line here. |
| `[reader] status.top-left` | Top left | list | `` | What this part of the line “Text and symbols” shows, in order. |
| `[reader] status.top-center` | Top centre | list | `` | What this part of the line “Text and symbols” shows, in order. |
| `[reader] status.top-right` | Top right | list | `` | What this part of the line “Text and symbols” shows, in order. |
| `[reader] status.bottom-left` | Bottom left | list | `core.status.clock, reader.status.aloud, lock.touch-status` | What this part of the line “Text and symbols” shows, in order. |
| `[reader] status.bottom-center` | Bottom centre | list | `` | What this part of the line “Text and symbols” shows, in order. |
| `[reader] status.bottom-right` | Bottom right | list | `reader.status.page` | What this part of the line “Text and symbols” shows, in order. |
| `[reader] status.battery-percent` | Battery in percent | `true`, `false` | `true` | The charge as a number beside the battery symbol. |
