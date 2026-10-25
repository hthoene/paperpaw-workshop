| Setting | Name | Values | Default | What it does |
|---|---|---|---|---|
| `[core] logo` | Logo picture | text | `` | Path of a JPEG or PNG shown instead of PaperPaw's logo; empty: the usual one. |
| `[sleep] show` | Show | `sleep.show.cat`, `sleep.show.cover`, `sleep.show.picture`, `sleep.show.overlay`, `sleep.show.widgets`, `sleep.show.message`, `sleep.show.page`, `reading-goal.sleep`, `vocabulary.sleep-card` | `sleep.show.cat` | What the screen shows while the device sleeps; e-ink keeps it without power. |
| `[sleep] folder` | Pictures folder | text | `sleep` | For "My pictures": JPEG, PNG and GIF files, one after the other. |
| `[sleep] widgets` | Widgets | list | `home.date, home.continue, stats.widget.today, home.recent` | For "Widgets": what the sleep screen shows, top to bottom. |
| `[sleep] overlay-picture` | Picture over the page | text | `` | For "The page with a picture": the folder's pictures in turn, or a plugin's. |
| `[sleep] overlay-widget` | Widget over the page | text | `` | For "The page with a picture": a widget such as the clock instead. |
| `[sleep] overlay-position` | Picture position | `sleep.position.center`, `sleep.position.top`, `sleep.position.bottom`, `sleep.position.top-left`, `sleep.position.top-right`, `sleep.position.bottom-left`, `sleep.position.bottom-right` | `sleep.position.bottom-right` | Where the picture shows over the page. |
| `[sleep] overlay-size` | Picture size | 10 to 100 | `35` | How large the picture is, of the screen's shorter side. |
| `[sleep] overlay-see-through` | Page through the picture | 0 to 90 | `0` | How much of the page shows through the picture; its clear parts always show the page. |
| `[sleep] overlay-when` | When the picture shows | `sleep.when.always`, `sleep.when.reading`, `sleep.when.elsewhere` | `sleep.when.always` | When the picture goes over the page; otherwise the book's cover shows. |
