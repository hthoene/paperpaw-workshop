| Setting | Name | Values | Default | What it does |
|---|---|---|---|---|
| `[core] night-mode` | Night mode | `true`, `false` | `false` | White text on black. |
| `[core] night-pictures` | Pictures in night mode inverted | `true`, `false` | `false` | Off: covers and photos as they are, not as negatives. |
| `[core] mono-text` | Text darkness | `core.mono-text.light`, `core.mono-text.normal`, `core.mono-text.full` | `core.mono-text.normal` | How full letters are drawn without grays; full helps on pale screens. |
| `[core] full-refresh-interval` | Full refresh | 0 to 1000 | `6` | A flashing refresh after this many page turns removes ghosting; 0 never flashes. |
| `[core] flash-screens` | Flash when screens change | `true`, `false` | `false` | A full refresh when another screen opens leaves no trace of the last one, but takes longer: three and a half seconds on the X4. |
| `[core] rotation` | Turn the screen | `core.rotation.upright`, `core.rotation.landscape`, `core.rotation.upside-down`, `core.rotation.landscape-flipped` | `core.rotation.upright` | Upright or on its side, e.g. for pictures and comics. Turned while reading with “Only this book” on, it is turned for that book alone. |
| `[core] notice-seconds` | Messages show for | 1 to 60 | `4` | How long short messages such as “Sync done” stay on the screen. |
| `[core] frontlight` | Front light | 0 to 100 | `0` | How bright the front light is; 0 switches it off. |
| `[core] frontlight-warmth` | Front light warmth | 0 to 100 | `50` | How warm the front light is: 0 cold, 100 warm. |
| `[sleep] show` | While asleep, show | `sleep.show.cover`, `sleep.show.picture`, `sleep.show.overlay`, `sleep.show.widgets`, `sleep.show.message`, `sleep.show.page` | `sleep.show.cover` | What the screen shows while the device sleeps; e-ink keeps it without power. |
| `[sleep] folder` | Pictures folder | text | `sleep` | For "My pictures": JPEG, PNG and GIF files, one after the other. |
| `[sleep] widgets` | Sleep screen widgets | list | `home.date, home.continue, stats.widget.today, home.recent` | For "Widgets": what the sleep screen shows, top to bottom, e.g. the book being read and today's reading. |
| `[sleep] overlay-picture` | Picture over the page | text | `` | For "The page with a picture": the pictures folder's, one after the other, or a picture a plugin offers. |
| `[sleep] overlay-widget` | Widget over the page | text | `` | For "The page with a picture": a widget on a panel of its own in place of a picture, such as the clock. |
| `[sleep] overlay-position` | Where the picture goes | `sleep.position.center`, `sleep.position.top`, `sleep.position.bottom`, `sleep.position.top-left`, `sleep.position.top-right`, `sleep.position.bottom-left`, `sleep.position.bottom-right` | `sleep.position.bottom-right` | Where the picture shows over the page. |
| `[sleep] overlay-size` | Size of the picture | 10 to 100 | `35` | How large the picture is, of the screen's shorter side. |
| `[sleep] overlay-see-through` | Page through the picture | 0 to 90 | `0` | How much of the page shows through the picture; its clear parts always show the page. |
| `[sleep] overlay-when` | When the picture shows | `sleep.when.always`, `sleep.when.reading`, `sleep.when.elsewhere` | `sleep.when.always` | When the picture goes over the page; otherwise the book's cover shows. |
