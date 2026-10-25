### Screens that run in real time

Games, emulators and animations draw many frames a second and want
every button as it goes down. Such a screen says so in one place,
[`Screen::mode`], with a `realtime::ScreenMode`
([ADR 0030](adr/0030-real-time-screens.md)):

```rust
fn mode(&self) -> ScreenMode {
    ScreenMode::new()
        .full_screen()     // no row of hints, no bars
        .raw_keys()        // buttons pressed and released, in on_key
        .cleans_itself()   // no full refresh every few pages
        .fastest()         // the fastest refresh the panel has
        .grays(2)          // black and white is enough
        .frame_every(Duration::from_millis(100))
        .awake_for(Duration::from_secs(600))
}
```

Each option asks for an intent; every device meets it as well as it
can. With `raw_keys`, `on_key` gets each button pressed and let go,
with its time, and `env.keys_held()` says which are down. The power
button stays the device's, and holding *Back* for two seconds always
leaves the screen. With `frame_every`, the screen asks for its timer as
usual (`cx.wake_at`); the X4 then goes on while the panel refreshes, and
shows the next frame as soon as the panel is free.

The device says what it can do and what it did: `env.panel()` has the
fastest time of each refresh mode as measured, its grays, and the last
frame shown (`last_frame()`: when, how long it took, how many frames
were merged into it). Pace yourself by these numbers rather than by
your own: faster panels then make your plugin faster without a new
build.

Draw pictures that change every frame with `canvas.blit`: a packed
`Bitmap` of 1, 2, 4 or 8 bits a pixel with a palette of grays, at a
whole scale, dithered or not. A 160×144 picture at three times its size
costs a fraction of drawing it pixel by pixel.

Keep what a loop reads all the time in internal RAM and large data in
PSRAM (`memory::vec_in(Placement::FAST, n)` and `Placement::LARGE`);
devices with one kind of memory keep both alike. In a code plugin, mark
the few functions that run every frame with `paperpaw_sdk::hot! { … }`:
the X4 runs them from internal RAM instead of flash, a bounded part of
its heap; what does not fit runs from flash as before.

A screen that needs much memory says so (`.memory(bytes)`, and
`.needs_network()` or `.needs_bluetooth()` where it does): as it shows,
the kernel lets caches go, holds background work back, switches off
the radios it does not need, asks the screens below to let go of what
they can make again (`on_squeeze`; the reader lets its book go and
keeps its place) and closes them where that is not enough, until there
is enough, and gives everything back once it closes. Read what you got
with `env.room()` in `on_show`, and make the large buffer there. A
screen of yours that keeps much (pictures, a long list) lets it go in
`on_squeeze` and makes it again in `on_show`.

To keep the device from going to sleep by itself for a while (a clock,
a slideshow, a long download), hold it: `cx.keep_awake(WakeHold::new(id,
reason).lasting(...))` on a screen (it ends when the screen closes), or
`Command::KeepAwake` from work and services; renew it before it ends,
let go with `Command::LetSleep`. The reader can switch holds off.

`samples/frame-test` does all of this and shows what it measures (frames
a second, the work as hot and as ordinary code, the drawing, the heap):
`cargo run -p paperpaw-emulator --features frame-test`, then *Frame
test* in the tools.
