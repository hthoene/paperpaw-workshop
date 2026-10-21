| Setting | Name | Values | Default | What it does |
|---|---|---|---|---|
| `[lock] kind` | Screen lock | `lock.kind.off`, `lock.kind.pin`, `lock.kind.pattern`, `lock.kind.password` | `lock.kind.off` | Asks for a PIN, a pattern or a password when PaperPaw starts and when the device wakes up. It keeps others from casual use, not from someone who takes the files. |
| `[lock] on-wake` | Lock when waking up | `true`, `false` | `true` | Off: the lock is asked for only when PaperPaw starts and by “Lock now”. Where every wake is a start (the X4 on battery), it is asked for then too. |
