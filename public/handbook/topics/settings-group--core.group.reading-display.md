| Setting | Name | Values | Default | What it does |
|---|---|---|---|---|
| `[core] night-mode` | Night mode | `true`, `false` | `false` | White text on black. |
| `[core] night-pictures` | Invert pictures | `true`, `false` | `false` | Off: covers and photos as they are, not as negatives. |
| `[core] mono-text` | Text darkness | `core.mono-text.light`, `core.mono-text.normal`, `core.mono-text.full` | `core.mono-text.normal` | How bold letters are on black-and-white screens; full helps on pale screens. |
| `[core] full-refresh-interval` | Full refresh | 0 to 1000 | `6` | A flashing refresh after this many page turns removes ghosting; 0 never flashes. |
| `[core] pictures-in-grays` | Pictures in grays | `true`, `false` | `true` | Draws pictures such as covers in four grays: finer, but a little slower. |
| `[core] smooth-text` | Smooth text | `true`, `false` | `false` | Soft gray edges. On black-and-white screens each page flashes, slower. |
| `[core] text-contrast` | Text contrast | `core.text-contrast.lighter`, `core.text-contrast.normal`, `core.text-contrast.darker`, `core.text-contrast.darkest` | `core.text-contrast.normal` | How dark letters are drawn. A tone curve set by a theme takes its place. |
| `[core] text-sharpness` | Sharpness | `core.text-sharpness.soft`, `core.text-sharpness.normal`, `core.text-sharpness.sharp` | `core.text-sharpness.normal` | How crisp letters look. Sharp is sturdier and cleaner, soft is lighter. |
| `[core] text-curve` | Text tone curve | text | `` | Edge tone of book letters: smooth, sharp:128, or 16 numbers 0-255. |
