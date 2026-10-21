| Setting | Name | Values | Default | What it does |
|---|---|---|---|---|
| `[power] mode` | Power mode | `power.mode.auto`, `power.mode.normal`, `power.mode.saving`, `power.mode.offline` | `power.mode.auto` | PaperPaw saves energy in every mode. Saving does what can wait at better moments; Offline keeps the radio off. Automatic chooses by the battery. |
| `[power] saving-below` | Saving below (%) | 5 to 50 | `20` | Automatic switches to Saving when the battery falls below this. |
| `[power] offline-below` | Offline below (%) | 0 to 30 | `10` | Automatic switches to Offline when the battery falls below this, so the book can be finished. |
| `[power] normal-while-charging` | Normal while charging | `true`, `false` | `true` | While the device charges, Automatic chooses Normal: energy is not short then. |
