| Setting | Name | Values | Default | What it does |
|---|---|---|---|---|
| `[core] developer` | Developer options | `true`, `false` | `false` | Settings and numbers for developers: measuring what uses the battery, trying things out, finding faults. |
| `[core] language` | Language | language | `en` | Language of menus and messages. |
| `[core] speak-focus` | Say what is chosen | `true`, `false` | `false` | Says the row or button the buttons move to, for using PaperPaw without looking. |
| `[core] voice` | Voice | `core.voice.system` | `core.voice.system` | What reads aloud. Automatic: the system's voice, or where the device has none, a plugin's that speaks the language; or a plugin's for the languages it speaks. |
| `[core] device-name` | Device name | text | `PaperPaw X4` | What this reader is called where others see it: Calibre, the progress server, your router and a phone setting up Wi-Fi. Takes effect the next time it connects. |
| `[core] sleep-after` | Sleep after | 0 to 120 | `10` | Minutes without use after which the device goes to sleep by itself; 0: never. Not while reading aloud or downloading. |
| `[core] clock-format` | Clock | `core.clock.24h`, `core.clock.12h` | `core.clock.24h` | How the time shows: 14:30 or 2:30 PM. |
| `[core] week-start` | First day of the week | `core.week.auto`, `core.week.monday`, `core.week.sunday` | `core.week.auto` | Where weeks begin in calendars and the reading statistics. |
| `[core] time-zone` | Time zone | `core.tz.auto`, `core.tz.utc`, `core.tz.honolulu`, `core.tz.anchorage`, `core.tz.los-angeles`, `core.tz.phoenix`, `core.tz.denver`, `core.tz.chicago`, `core.tz.new-york`, `core.tz.sao-paulo`, `core.tz.london`, `core.tz.lisbon`, `core.tz.berlin`, `core.tz.helsinki`, `core.tz.istanbul`, `core.tz.moscow`, `core.tz.dubai`, `core.tz.india`, `core.tz.bangkok`, `core.tz.china`, `core.tz.tokyo`, `core.tz.sydney`, `core.tz.auckland` | `core.tz.auto` | Automatic uses the system's time zone, with summer time; devices without one need a zone here. |
| `[core] time-zone-rule` | Time zone rule | text | `` | For zones not in the list: a POSIX TZ rule, e.g. CET-1CEST,M3.5.0,M10.5.0/3. Overrides the time zone. |
| `[core] battery-low` | Battery low at | 5 to 50 | `20` | The charge at which "Battery when low" shows in a status line. |
| `[battery] enabled` | Record battery use | `true`, `false` | `true` | Notes the battery about once a minute while the device is awake, with what it did, to show how long it lasts. |
| `[file-manager] hidden` | Show hidden files | `true`, `false` | `false` | Files and folders starting with a dot, e.g. PaperPaw's own data. |
| `[lock] kind` | Screen lock | `lock.kind.off`, `lock.kind.pin`, `lock.kind.pattern`, `lock.kind.password` | `lock.kind.off` | Asks for a PIN, a pattern or a password when PaperPaw starts and when the device wakes up. It keeps others from casual use, not from someone who takes the files. |
| `[lock] on-wake` | Lock when waking up | `true`, `false` | `true` | Off: the lock is asked for only when PaperPaw starts and by “Lock now”. Where every wake is a start (the X4 on battery), it is asked for then too. |
| `[keyboard] layouts` | Keyboard layouts | list | `keyboard.layout.auto` | The layouts to type with; with several, a key switches between them. Hold a letter for accents. |
| `[keyboard] umlaut-keys` | Umlaut keys | `true`, `false` | `false` | Keys of their own for ä, ö, ü and ß in German, in rows of eleven keys. Off, they come from holding a, o, u and s. |
| `[settings] advanced` | Show advanced settings | `true`, `false` | `false` | Also show settings that are rarely needed. |
| `[diagnostics] pages` | Number of test pages | 1 to 10000 | `20` | Pages of the display test screen. |
| `[help] show` | Hints for new screens | `true`, `false` | `true` | The first time a screen opens, a short note says what its controls do. |
| `[help] again` | Show hints again | text | `` | Each screen's hints show once more, the next time it opens. |
