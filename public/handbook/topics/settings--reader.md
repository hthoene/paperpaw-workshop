| Setting | Name | Values | Default | What it does |
|---|---|---|---|---|
| `[reader] status.size` | Text size | 5 to 16 | `6` | The size of the text in the status lines. |
| `[reader] status.edge` | Distance from the edge | 0 to 150 | `15` | How near the status lines sit to the edge. The text keeps its margins. |
| `[reader] status.top-lines` | Lines at the top | list | `` | The lines a tap on the status line switches between. None: no line here. |
| `[reader] status.bottom-lines` | Lines at the bottom | list | `core.status-line.items, reader.status-line.progress, reader.status-line.empty` | The lines a tap on the status line switches between. None: no line here. |
| `[reader] status.top-left` | Top left | list | `` | What this part of the line shows, left to right. |
| `[reader] status.top-center` | Top centre | list | `` | What this part of the line shows, left to right. |
| `[reader] status.top-right` | Top right | list | `` | What this part of the line shows, left to right. |
| `[reader] status.bottom-left` | Bottom left | list | `core.status.clock, reader.status.aloud, lock.touch-status` | What this part of the line shows, left to right. |
| `[reader] status.bottom-center` | Bottom centre | list | `` | What this part of the line shows, left to right. |
| `[reader] status.bottom-right` | Bottom right | list | `reader.status.page` | What this part of the line shows, left to right. |
| `[reader] status.battery-percent` | Battery in percent | `true`, `false` | `true` | The charge as a number beside the battery symbol. |
| `[reader] open-last` | Open last book at start | `true`, `false` | `true` | Start with the last book instead of the home screen. |
| `[reader] corner-bookmark` | Bookmark corner | `true`, `false` | `true` | A tap on the top right corner of a page sets or removes its bookmark. |
| `[reader] hold-chapters` | Hold for next chapter | `true`, `false` | `true` | Off: a page turns as soon as its button goes down, not when let go. |
| `[reader] auto-turn-seconds` | Turn pages every | 5 to 600 | `30` | For “Turn pages automatically” in the reader’s menu. |
| `[reader] aloud-speed` | Speed | 50 to 300 | `100` | How fast books are read aloud. |
| `[reader] aloud-highlight` | Underline the sentence | `true`, `false` | `true` | Shows which sentence is being read. |
| `[reader] aloud-turn-pages` | Turn pages | `true`, `false` | `true` | Reads on over the pages; else it stops at the end of the page. |
| `[reader] aloud-timer` | Stop after | `reader.aloud-timer.off`, `reader.aloud-timer.15`, `reader.aloud-timer.30`, `reader.aloud-timer.60`, `reader.aloud-timer.90` | `reader.aloud-timer.off` | Reading aloud stops by itself after this long, e.g. at bedtime. |
