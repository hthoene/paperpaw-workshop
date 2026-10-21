| Setting | Name | Values | Default | What it does |
|---|---|---|---|---|
| `[stats] goal` | Daily reading goal | `stats.goal.off`, `stats.goal.10`, `stats.goal.15`, `stats.goal.20`, `stats.goal.30`, `stats.goal.45`, `stats.goal.60`, `stats.goal.90`, `stats.goal.120`, `stats.goal.180`, `stats.goal.240`, `stats.goal.300` | `stats.goal.off` | The “Read today” widget on the home screen shows how far you are and for how many days in a row you reached it. |
| `[stats] enabled` | Record reading | `true`, `false` | `true` | How long you read each page, as KOReader records it, so the two can share their statistics. |
| `[stats] min-seconds` | Shortest page | 1 to 60 | `5` | Pages turned faster are not counted (e.g. when leafing through). |
| `[stats] max-seconds` | Longest page | 30 to 600 | `120` | A page counts at most this long, so a book left open does not count as read. |
| `[stats] webdav-url` | Sync with KOReader | text | `` | The cloud folder (WebDAV) KOReader syncs its statistics to; also takes over KOReader's statistics on this device. |
| `[stats] webdav-user` | User name | text | `` | The user name of the cloud folder, set with it on the sync page. |
