| Setting | Name | Values | Default | What it does |
|---|---|---|---|---|
| `[power] mode` | Power mode | `power.mode.auto`, `power.mode.normal`, `power.mode.saving`, `power.mode.offline` | `power.mode.auto` | Saving puts off what can wait; Offline keeps the radio off. |
| `[power] saving-below` | Saving below | 5 to 50 | `20` | Automatic switches to Saving when the battery falls below this. |
| `[power] offline-below` | Offline below | 0 to 30 | `10` | Below this, Automatic switches to Offline to save battery for reading. |
| `[power] normal-while-charging` | Normal while charging | `true`, `false` | `true` | While the device charges, Automatic chooses Normal: energy is not short then. |
