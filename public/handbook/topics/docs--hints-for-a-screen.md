### Hints for a screen

The first time a screen opens, a short note over it says what its
controls do: the hints its plugin gives with `help::add`, each a text
and, where it is about a part of the screen, that part (in thousandths
of the screen's width and height), framed. A hint is for touch, for
buttons or for both; a device shows those that fit its input. A tap or
any button closes the note, and it does not come again for that screen;
*No more hints* and the settings switch them all off.

```rust
use paperpaw_sdk::help::{self, Hint, Zone};

help::add(r, SCREEN.as_str(), &[
    Hint::touch("hello.help.tap").zone(Zone::new(0, 0, 1000, 120)),
    Hint::buttons("hello.help.confirm"),
    Hint::any("hello.help.back"),
])?;
```

The texts are keys of the plugin's translations; the screen is any
screen's id, so a plugin can add hints to another's. A screen that first
prepares what it shows (the reader, opening a book) has its hints wait
with `help::wait(r, SCREEN.as_str())` and says when it is ready,
`cx.command(help::ready(&SCREEN))`: screens below another get no timers,
so it would not get ready under them. The note is the
`help` plugin's; another plugin can show them its own way, from
`help::hints(env, screen)` when `events::SCREEN_SHOWN` comes.
