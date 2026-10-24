| Setting | Name | Values | Default | What it does |
|---|---|---|---|---|
| `[core] developer` | Developer options | `true`, `false` | `false` | For developers: measure battery use, try things out, find faults. |
| `[core] language` | Language | language | `en` | Language of menus and messages. |
| `[core] speak-focus` | Say what is chosen | `true`, `false` | `false` | Says the row or button the buttons move to. |
| `[core] voice` | Voice | `core.voice.system` | `core.voice.system` | Automatic uses the system's voice, else a plugin's for the language. |
| `[core] device-name` | Device name | text | `PaperPaw X4` | The name Calibre, your router and others see; used from the next connection. |
| `[core] sleep-after` | Sleep after | 0 to 120 | `10` | Minutes without use before the device sleeps; 0: never. |
| `[core] clock-format` | Clock | `core.clock.24h`, `core.clock.12h` | `core.clock.24h` | How the time shows: 14:30 or 2:30 PM. |
| `[core] week-start` | First day of the week | `core.week.auto`, `core.week.monday`, `core.week.sunday` | `core.week.auto` | Where weeks begin in calendars and the reading statistics. |
| `[core] time-zone` | Time zone | `core.tz.auto`, `core.tz.utc`, `core.tz.honolulu`, `core.tz.anchorage`, `core.tz.los-angeles`, `core.tz.phoenix`, `core.tz.denver`, `core.tz.chicago`, `core.tz.new-york`, `core.tz.sao-paulo`, `core.tz.london`, `core.tz.lisbon`, `core.tz.berlin`, `core.tz.helsinki`, `core.tz.istanbul`, `core.tz.moscow`, `core.tz.dubai`, `core.tz.india`, `core.tz.bangkok`, `core.tz.china`, `core.tz.tokyo`, `core.tz.sydney`, `core.tz.auckland` | `core.tz.auto` | Automatic: the system's zone, where there is one. |
| `[core] time-zone-rule` | Time zone rule | text | `` | A POSIX TZ rule for zones not in the list; overrides the time zone. |
| `[core] battery-low` | Battery low at | 5 to 50 | `20` | The charge at which "Battery when low" shows in a status line. |
| `[battery] enabled` | Record battery use | `true`, `false` | `true` | Notes the battery each minute, to show how long it lasts. |
| `[file-manager] hidden` | Show hidden files | `true`, `false` | `false` | Files and folders starting with a dot, e.g. PaperPaw's own data. |
| `[lock] kind` | Screen lock | `lock.kind.off`, `lock.kind.pin`, `lock.kind.pattern`, `lock.kind.password` | `lock.kind.off` | Asks for a PIN, a pattern or a password on start and on waking. |
| `[lock] on-wake` | Lock when waking up | `true`, `false` | `true` | Off: the lock comes only when PaperPaw starts and with “Lock now”. |
| `[keyboard] layouts` | Keyboard layouts | list | `keyboard.layout.auto` | The layouts to type with; a key switches between them. |
| `[keyboard] umlaut-keys` | Umlaut keys | `true`, `false` | `false` | Keys of their own for ä, ö, ü and ß. Off, hold a, o, u or s for them. |
| `[keyboard] key-shape` | Shape of keys | `keyboard.key-shape.round`, `keyboard.key-shape.tall`, `keyboard.key-shape.wide` | `keyboard.key-shape.round` | Taller keys make the keyboard higher, wider keys make it lower. |
| `[keyboard] size` | Keyboard size | `keyboard.size.small`, `keyboard.size.medium`, `keyboard.size.large` | `keyboard.size.medium` | Smaller leaves more of the screen in view; larger keys are easier to hit. |
| `[settings] advanced` | Show advanced settings | `true`, `false` | `false` | Also show settings that are rarely needed. |
| `[diagnostics] pages` | Number of test pages | 1 to 10000 | `20` | Pages of the display test screen. |
| `[update] betas` | Beta updates | `true`, `false` | `false` | Betas are for testing; they may have bugs. |
| `[help] show` | Hints for new screens | `true`, `false` | `true` | The first time a screen opens, a short note says what its controls do. |
| `[help] again` | Show hints again | text | `` | Each screen's hints show once more, the next time it opens. |
