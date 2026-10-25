| Setting | Name | Values | Default | What it does |
|---|---|---|---|---|
| `[stats] goal` | Daily goal | `stats.goal.off`, `stats.goal.10`, `stats.goal.15`, `stats.goal.20`, `stats.goal.30`, `stats.goal.45`, `stats.goal.60`, `stats.goal.90`, `stats.goal.120`, `stats.goal.180`, `stats.goal.240`, `stats.goal.300` | `stats.goal.20` | The “Read today” widget shows how far you are and your streak. |
| `[stats] enabled` | Record reading | `true`, `false` | `true` | How long you read each page, as KOReader records it. |
| `[stats] min-seconds` | Shortest page | 1 to 60 | `5` | Pages turned faster are not counted (e.g. when leafing through). |
| `[stats] max-seconds` | Longest page | 30 to 600 | `120` | A page counts at most this long, so a book left open does not count as read. |
| `[stats] webdav-url` | Sync with KOReader | text | `` | The WebDAV folder KOReader syncs its statistics to. |
| `[stats] webdav-user` | User name | text | `` | The user name of the cloud folder, set with it on the sync page. |
| `[reading-goal] content` | Content from | 5 to 95 | `50` | From which share of the goal the cat is content rather than meh. |
| `[reading-goal] happy` | Happy from | 50 to 200 | `100` | From which share of the goal the cat is happy. 100 % is the goal itself. |
| `[reading-goal] pictures` | Own pictures | text | `` | Pictures named sad, meh, content and happy, in place of the cats. |
