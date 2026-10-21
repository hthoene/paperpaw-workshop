### Screens

A screen implements [`Screen`]. `draw` paints it; `on_action` reacts to
actions (from buttons, or gestures bound to them); `on_gesture` to taps,
long presses and swipes; `on_event` to events while it is open:

```rust
impl Screen for HelloScreen {
    fn draw(&mut self, canvas: &mut Canvas<'_>, env: &Env<'_>) {
        let title = env.i18n.tr("hello.title");
        self.header.draw(canvas, env, &self.style, title, None, None);
        // … the greeting, centred below
    }

    fn on_action(&mut self, action: &Id, cx: &mut Cx<'_, '_>) -> Handled {
        if *action == actions::CONFIRM || *action == actions::BACK {
            cx.command(Command::Back);
            return Handled::Yes;
        }
        Handled::No
    }

    fn on_gesture(&mut self, gesture: Gesture, cx: &mut Cx<'_, '_>) -> Handled {
        // A tap on the header's back arrow, or anywhere else, closes it.
    }
}
```

Screens are made by a factory each time they open
(`r.add_screen(ScreenSpec::new(id, title, factory))`). Return
`Handled::No` for what a screen does not handle: the kernel then runs
the action's own handler (e.g. the menu button opens the menu).

Some rules every screen should follow:

- **Touch and buttons alike.** Some devices have only buttons (the
  Xteink X4), some mostly touch (the Boox). Everything must be easy with
  either: buttons move a focus and confirm, taps act at once. Show the
  focus only once buttons are used (`ListView::focus_on_keys`).
- **`draw` only draws.** On small devices a frame is drawn in bands
  (the X4 draws five), so `draw` runs several times for one frame, and
  again for every frame after it: whatever it reads or works out, it
  does over and over. Load what a screen shows when it opens or when
  that changes (in its factory, `on_show`, `on_event`); parse it, sort
  it, wrap long texts and make pictures small (`ui::Thumbnail`) then,
  keep the result in the screen, and only draw it in `draw`, which must
  not change state. It can skip what lies outside `canvas.clip()`. The
  one thing read while drawing is a picture too large to keep, such as
  one filling the screen: `ui::draw_image` reads its rows band by band.
  The emulator's `--trace` shows what each band of a frame reads;
  `crates/paperpaw-app/tests/draw.rs` checks every screen of the
  standard app.
- **Ask for redraws.** After a change, `cx.request_redraw()` (or a part
  of the screen) and `cx.request_refresh(mode)`: `Fast` for a moving
  focus, `Partial` for new content, `Full` to clear ghosting.
- **Overlays** are screens with a `region`. One that takes the reader's
  attention (a menu, a question) washes out what lies below it
  (`dims_below`); one looked through (a keyboard over the field it
  types into, a notice) does not. A screen whose content is best in
  grays (a picture) says so (`grays`): panels with few grays then show
  it in more, as slowly as a full refresh.
- **Use the SDK's UI parts** (`paperpaw_sdk::ui`): headers, rows, lists,
  switches, numbers with − and +, messages, icons. They follow the user's
  appearance settings and line up with the rest of PaperPaw. What a
  screen draws itself takes its look from `UiStyle`: the focus with
  `ui::draw_focus`, what is on a focused row in `style.focus_ink(focused)`
  (white on the dark bar, black on a frame or a light bar), small shapes
  with `style.radius(height)` (pills where corners are round), boxes and
  cards with `style.corner`, lines between rows with `ui::draw_separator`.

Screens say what they show, for reading the interface aloud,
automation and tests: the `ui` helpers (list rows, buttons, switches,
headers, labels) tell what they draw by themselves. A screen that draws
in its own way tells it with `canvas.describe(role, text, area,
focused, on)`, with the role of what it is (`Row`, `Button`, `Switch`,
`Check`, `Radio`, `Field`, `Image`, `Link`, `Dialog`, `Progress` …). A
screen reader of one's own hears where the focus of the buttons goes
(`events::FOCUS_CHANGED`: its role, label and area).
