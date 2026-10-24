| Setting | Name | Values | Default | What it does |
|---|---|---|---|---|
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
| `[reader] smooth-text` | Smooth text | `true`, `false` | `false` | Letters with soft gray edges; pages turn slower and use more battery. |
| `[reader] open-last` | Reopen the last book at start | `true`, `false` | `true` | Start with the last book instead of the home screen. |
| `[reader] corner-bookmark` | Bookmark by tapping the corner | `true`, `false` | `true` | A tap on the top right corner of a page sets or removes its bookmark. |
| `[reader] hold-chapters` | Hold a page button for the next chapter | `true`, `false` | `true` | Off: a page turns as soon as its button goes down, not when let go. |
| `[reader] auto-turn-seconds` | Turn pages automatically every | 5 to 600 | `30` | For “Turn pages automatically” in the reader’s menu. |
| `[reader] aloud-speed` | Speed | 50 to 300 | `100` | How fast books are read aloud. |
| `[reader] aloud-highlight` | Underline the sentence | `true`, `false` | `true` | Shows which sentence is being read. |
| `[reader] aloud-turn-pages` | Turn pages | `true`, `false` | `true` | Reads on over the pages; else it stops at the end of the page. |
| `[reader] aloud-timer` | Stop after | `reader.aloud-timer.off`, `reader.aloud-timer.15`, `reader.aloud-timer.30`, `reader.aloud-timer.60`, `reader.aloud-timer.90` | `reader.aloud-timer.off` | Reading aloud stops by itself after this long, e.g. at bedtime. |
