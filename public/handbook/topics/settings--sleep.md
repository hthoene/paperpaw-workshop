| Setting | Name | Values | Default | What it does |
|---|---|---|---|---|
| `[sleep] show` | While asleep, show | `sleep.show.cover`, `sleep.show.picture`, `sleep.show.overlay`, `sleep.show.widgets`, `sleep.show.message`, `sleep.show.page` | `sleep.show.cover` | What the screen shows while the device sleeps; e-ink keeps it without power. |
| `[sleep] folder` | Pictures folder | text | `sleep` | For "My pictures": JPEG, PNG and GIF files, one after the other. |
| `[sleep] widgets` | Sleep screen widgets | list | `home.date, home.continue, stats.widget.today, home.recent` | For "Widgets": what the sleep screen shows, top to bottom, e.g. the book being read and today's reading. |
| `[sleep] overlay-picture` | Picture over the page | text | `` | For "The page with a picture": the pictures folder's, one after the other, or a picture a plugin offers. |
| `[sleep] overlay-widget` | Widget over the page | text | `` | For "The page with a picture": a widget on a panel of its own in place of a picture, such as the clock. |
| `[sleep] overlay-position` | Where the picture goes | `sleep.position.center`, `sleep.position.top`, `sleep.position.bottom`, `sleep.position.top-left`, `sleep.position.top-right`, `sleep.position.bottom-left`, `sleep.position.bottom-right` | `sleep.position.bottom-right` | Where the picture shows over the page. |
| `[sleep] overlay-size` | Size of the picture | 10 to 100 | `35` | How large the picture is, of the screen's shorter side. |
| `[sleep] overlay-see-through` | Page through the picture | 0 to 90 | `0` | How much of the page shows through the picture; its clear parts always show the page. |
| `[sleep] overlay-when` | When the picture shows | `sleep.when.always`, `sleep.when.reading`, `sleep.when.elsewhere` | `sleep.when.always` | When the picture goes over the page; otherwise the book's cover shows. |
