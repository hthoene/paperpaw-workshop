| Setting | Name | Values | Default | What it does |
|---|---|---|---|---|
| `[sleep] show` | Show | `sleep.show.cat`, `sleep.show.cover`, `sleep.show.picture`, `sleep.show.overlay`, `sleep.show.widgets`, `sleep.show.message`, `sleep.show.page`, `news.sleep`, `vocabulary.sleep-card` | `sleep.show.cat` | What the screen shows while the device sleeps; e-ink keeps it without power. |
| `[sleep] look` | Sleep screen is | `sleep.look.device`, `sleep.look.light`, `sleep.look.dark` | `sleep.look.device` | Light or dark, whatever night mode says. |
| `[sleep] off-show` | Show when switched off | `sleep.off-show.same`, `sleep.off-show.message`, `sleep.show.cat`, `sleep.show.cover`, `sleep.show.picture` | `sleep.off-show.same` | What the screen shows once the device is switched off; e-ink keeps it without power. |
| `[sleep] off-look` | Off screen is | `sleep.look.device`, `sleep.look.light`, `sleep.look.dark` | `sleep.look.device` | Light or dark, whatever night mode says. |
| `[sleep] start-show` | Show when starting | `sleep.start-show.built-in` | `sleep.start-show.built-in` | What the screen shows while the device starts, before plugins run. |
| `[sleep] start-look` | Start screen is | `sleep.look.device`, `sleep.look.light`, `sleep.look.dark` | `sleep.look.device` | Light or dark, whatever night mode says. |
| `[sleep] restart-show` | Show when restarting | `sleep.restart-show.built-in` | `sleep.restart-show.built-in` | What the screen shows while PaperPaw restarts. |
| `[sleep] restart-look` | Restart screen is | `sleep.look.device`, `sleep.look.light`, `sleep.look.dark` | `sleep.look.device` | Light or dark, whatever night mode says. |
| `[sleep] folder` | Pictures folder | text | `sleep` | For "My pictures": JPEG, PNG and GIF files, one after the other. |
| `[sleep] widgets` | Widgets | list | `home.date, home.continue, stats.widget.today, home.recent` | For "Widgets": what the sleep screen shows, top to bottom. |
| `[sleep] overlay-picture` | Picture over the page | text | `` | For "The page with a picture": the folder's pictures in turn, or a plugin's. |
| `[sleep] overlay-widget` | Widget over the page | text | `` | For "The page with a picture": a widget such as the clock instead. |
| `[sleep] overlay-position` | Picture position | `sleep.position.center`, `sleep.position.top`, `sleep.position.bottom`, `sleep.position.top-left`, `sleep.position.top-right`, `sleep.position.bottom-left`, `sleep.position.bottom-right` | `sleep.position.bottom-right` | Where the picture shows over the page. |
| `[sleep] overlay-size` | Picture size | 10 to 100 | `35` | How large the picture is, of the screen. 100 % fills the whole screen. |
| `[sleep] overlay-see-through` | Page through the picture | 0 to 90 | `0` | How much of the page shows through the picture; its clear parts always show the page. |
| `[sleep] overlay-when` | When the picture shows | `sleep.when.always`, `sleep.when.reading`, `sleep.when.elsewhere` | `sleep.when.always` | When the picture goes over the page; otherwise the book's cover shows. |
| `[sleep] refresh-every` | Redraw while asleep | `sleep.refresh.off`, `sleep.refresh.15`, `sleep.refresh.30`, `sleep.refresh.60` | `sleep.refresh.off` | Redraws the clock and widgets now and then while asleep. Costs battery; see How it works. |
