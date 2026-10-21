| Setting | Name | Values | Default | What it does |
|---|---|---|---|---|
| `[wifi] on-demand` | Connect when needed | `true`, `false` | `true` | Switches Wi-Fi on by itself when something needs the network, e.g. a catalog or a sync, and joins a saved network. |
| `[wifi] idle-off` | Switch off after | `wifi.idle-off.30s`, `wifi.idle-off.1m`, `wifi.idle-off.2m`, `wifi.idle-off.5m`, `wifi.idle-off.10m` | `wifi.idle-off.1m` | How long after the last use Wi-Fi switches off again: it costs battery. Switched on here, it stays on. |
| `[wifi] while-charging` | Stay on while charging | `true`, `false` | `true` | Keeps Wi-Fi on in a saved network while the device is charging. |
