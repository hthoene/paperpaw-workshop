| Setting | Name | Values | Default | What it does |
|---|---|---|---|---|
| `[stats] goal` | Daily reading goal | `stats.goal.off`, `stats.goal.10`, `stats.goal.15`, `stats.goal.20`, `stats.goal.30`, `stats.goal.45`, `stats.goal.60`, `stats.goal.90`, `stats.goal.120`, `stats.goal.180`, `stats.goal.240`, `stats.goal.300` | `stats.goal.off` | The “Read today” widget on the home screen shows how far you are and for how many days in a row you reached it. |
| `[stats] widget.today.frame` | Frame | `core.frame.none`, `core.frame.line`, `core.frame.card`, `core.frame.dark` | `core.frame.none` | What the widget is drawn in: nothing, a line round it, a light card or a dark card with light text. |
| `[stats] widget.today.padding` | Spacing | `core.padding.auto`, `core.padding.none`, `core.padding.small`, `core.padding.normal`, `core.padding.large` | `core.padding.auto` | How far what the widget shows keeps from its edges, or from its frame. Automatic suits most widgets. |
| `[stats] widget.today.size` | Size | `core.size.small`, `core.size.medium`, `core.size.large`, `core.size.fit` | `core.size.medium` | How large the widget's text is. Where it does not fit, it is made smaller. |
| `[stats] widget.today.align` | Alignment | `core.align.left`, `core.align.center`, `core.align.right` | `core.align.left` | Where the widget's text sits in its place: at the left, in the middle or at the right. |
| `[stats] widget.today.caption` | Caption | `true`, `false` | `true` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[stats] widget.today.pages` | Pages read | `true`, `false` | `true` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[stats] widget.today.bar` | Bar towards the daily goal | `true`, `false` | `true` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[stats] widget.today.note` | Note below | `true`, `false` | `true` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[stats] widget.week.frame` | Frame | `core.frame.none`, `core.frame.line`, `core.frame.card`, `core.frame.dark` | `core.frame.none` | What the widget is drawn in: nothing, a line round it, a light card or a dark card with light text. |
| `[stats] widget.week.padding` | Spacing | `core.padding.auto`, `core.padding.none`, `core.padding.small`, `core.padding.normal`, `core.padding.large` | `core.padding.auto` | How far what the widget shows keeps from its edges, or from its frame. Automatic suits most widgets. |
| `[stats] widget.week.align` | Alignment | `core.align.left`, `core.align.center`, `core.align.right` | `core.align.left` | Where the widget's text sits in its place: at the left, in the middle or at the right. |
| `[stats] widget.week.period` | Days | `stats.period.7`, `stats.period.week`, `stats.period.14`, `stats.period.28` | `stats.period.7` | The days shown as bars: the last 7, 14 or 28, or this week from its first day. |
| `[stats] widget.week.shape` | Bars | `stats.shape.round`, `stats.shape.square` | `stats.shape.round` | Whether the bars have rounded or square corners. |
| `[stats] widget.week.caption` | Caption | `true`, `false` | `true` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[stats] widget.week.labels` | Weekdays | `true`, `false` | `true` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[stats] widget.week.goal` | Daily goal as a line | `true`, `false` | `true` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[stats] widget.week.today` | Today marked | `true`, `false` | `true` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[stats] widget.goal.frame` | Frame | `core.frame.none`, `core.frame.line`, `core.frame.card`, `core.frame.dark` | `core.frame.none` | What the widget is drawn in: nothing, a line round it, a light card or a dark card with light text. |
| `[stats] widget.goal.padding` | Spacing | `core.padding.auto`, `core.padding.none`, `core.padding.small`, `core.padding.normal`, `core.padding.large` | `core.padding.auto` | How far what the widget shows keeps from its edges, or from its frame. Automatic suits most widgets. |
| `[stats] widget.goal.size` | Size | `core.size.small`, `core.size.medium`, `core.size.large`, `core.size.fit` | `core.size.fit` | How large the widget's text is. Where it does not fit, it is made smaller. |
| `[stats] widget.goal.align` | Alignment | `core.align.left`, `core.align.center`, `core.align.right` | `core.align.center` | Where the widget's text sits in its place: at the left, in the middle or at the right. |
| `[stats] widget.goal.style` | Shape | `stats.ring.full`, `stats.ring.gauge` | `stats.ring.full` | A closed ring, or a gauge open at the bottom. |
| `[stats] widget.goal.line` | Line | `stats.line.thin`, `stats.line.medium`, `stats.line.thick` | `stats.line.medium` | How thick the ring is drawn. |
| `[stats] widget.goal.caption` | Caption | `true`, `false` | `true` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[stats] widget.goal.unit` | Unit below the minutes | `true`, `false` | `true` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[stats] widget.goal.note` | Streak or time left | `true`, `false` | `true` | Below the ring: the days in a row you reached the goal, or the time still to read today. |
| `[stats] widget.calendar.frame` | Frame | `core.frame.none`, `core.frame.line`, `core.frame.card`, `core.frame.dark` | `core.frame.none` | What the widget is drawn in: nothing, a line round it, a light card or a dark card with light text. |
| `[stats] widget.calendar.padding` | Spacing | `core.padding.auto`, `core.padding.none`, `core.padding.small`, `core.padding.normal`, `core.padding.large` | `core.padding.auto` | How far what the widget shows keeps from its edges, or from its frame. Automatic suits most widgets. |
| `[stats] widget.calendar.align` | Alignment | `core.align.left`, `core.align.center`, `core.align.right` | `core.align.center` | Where the widget's text sits in its place: at the left, in the middle or at the right. |
| `[stats] widget.calendar.style` | Shows | `stats.calendar.month`, `stats.calendar.weeks` | `stats.calendar.month` | This month as a calendar, or the last weeks as a heat map: each day shaded by how long you read. |
| `[stats] widget.calendar.weeks` | Weeks in the heat map | `stats.weeks.8`, `stats.weeks.12`, `stats.weeks.16`, `stats.weeks.26` | `stats.weeks.12` | How many weeks the heat map goes back. |
| `[stats] widget.calendar.cells` | Days | `stats.cells.square`, `stats.cells.round` | `stats.cells.square` | Whether the days are drawn as squares or as circles. |
| `[stats] widget.calendar.caption` | Caption | `true`, `false` | `true` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[stats] widget.calendar.weekdays` | Weekdays | `true`, `false` | `true` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[stats] widget.calendar.numbers` | Day numbers | `true`, `false` | `true` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[stats] widget.calendar.streak` | Streak | `true`, `false` | `true` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[stats] widget.calendar.total` | Time read | `true`, `false` | `true` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[stats] widget.year.frame` | Frame | `core.frame.none`, `core.frame.line`, `core.frame.card`, `core.frame.dark` | `core.frame.none` | What the widget is drawn in: nothing, a line round it, a light card or a dark card with light text. |
| `[stats] widget.year.padding` | Spacing | `core.padding.auto`, `core.padding.none`, `core.padding.small`, `core.padding.normal`, `core.padding.large` | `core.padding.auto` | How far what the widget shows keeps from its edges, or from its frame. Automatic suits most widgets. |
| `[stats] widget.year.size` | Size | `core.size.small`, `core.size.medium`, `core.size.large`, `core.size.fit` | `core.size.medium` | How large the widget's text is. Where it does not fit, it is made smaller. |
| `[stats] widget.year.align` | Alignment | `core.align.left`, `core.align.center`, `core.align.right` | `core.align.left` | Where the widget's text sits in its place: at the left, in the middle or at the right. |
| `[stats] widget.year.goal` | Books a year | `stats.books.goal.off`, `stats.books.goal.6`, `stats.books.goal.12`, `stats.books.goal.24`, `stats.books.goal.36`, `stats.books.goal.52` | `stats.books.goal.12` | How many books you want to finish this year; the widget shows how far you are. |
| `[stats] widget.year.style` | Shows the goal as | `stats.year.bar`, `stats.year.ring`, `stats.year.dots` | `stats.year.bar` | How the books finished this year are shown against the goal. |
| `[stats] widget.year.caption` | Caption | `true`, `false` | `true` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[stats] widget.year.plan` | Ahead or behind plan | `true`, `false` | `true` | Whether you are ahead of the yearly goal or behind it, by the time of year. |
| `[stats] widget.year.last` | Book finished last | `true`, `false` | `true` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[stats] widget.streak.frame` | Frame | `core.frame.none`, `core.frame.line`, `core.frame.card`, `core.frame.dark` | `core.frame.none` | What the widget is drawn in: nothing, a line round it, a light card or a dark card with light text. |
| `[stats] widget.streak.padding` | Spacing | `core.padding.auto`, `core.padding.none`, `core.padding.small`, `core.padding.normal`, `core.padding.large` | `core.padding.auto` | How far what the widget shows keeps from its edges, or from its frame. Automatic suits most widgets. |
| `[stats] widget.streak.size` | Size | `core.size.small`, `core.size.medium`, `core.size.large`, `core.size.fit` | `core.size.medium` | How large the widget's text is. Where it does not fit, it is made smaller. |
| `[stats] widget.streak.align` | Alignment | `core.align.left`, `core.align.center`, `core.align.right` | `core.align.center` | Where the widget's text sits in its place: at the left, in the middle or at the right. |
| `[stats] widget.streak.counts` | A day counts with | `stats.streak.any`, `stats.streak.goal` | `stats.streak.any` | Which days count towards the streak: every day you read, or only the days you reached the daily goal. |
| `[stats] widget.streak.style` | Marks | `stats.marks.dots`, `stats.marks.checks` | `stats.marks.checks` | How the days that count are marked: with a dot, or with a check in it as well. |
| `[stats] widget.streak.days` | Days shown | `stats.marks.7`, `stats.marks.14` | `stats.marks.7` | How many of the last days are marked. |
| `[stats] widget.streak.caption` | Caption | `true`, `false` | `true` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[stats] widget.streak.longest` | Longest streak | `true`, `false` | `true` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[stats] widget.streak.marks` | The last days | `true`, `false` | `true` | A mark for each of the last days, filled where the day counts towards the streak. |
| `[stats] widget.streak.weekdays` | Weekdays | `true`, `false` | `true` | Whether the widget shows this. Where there is too little room, it may be left out anyway. |
| `[stats] enabled` | Record reading | `true`, `false` | `true` | How long you read each page, as KOReader records it, so the two can share their statistics. |
| `[stats] min-seconds` | Shortest page | 1 to 60 | `5` | Pages turned faster are not counted (e.g. when leafing through). |
| `[stats] max-seconds` | Longest page | 30 to 600 | `120` | A page counts at most this long, so a book left open does not count as read. |
| `[stats] webdav-url` | Sync with KOReader | text | `` | The cloud folder (WebDAV) KOReader syncs its statistics to; also takes over KOReader's statistics on this device. |
| `[stats] webdav-user` | User name | text | `` | The user name of the cloud folder, set with it on the sync page. |
