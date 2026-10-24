### Screens

A screen implements [`Screen`]. `draw` paints it; `on_action` reacts to
actions (from buttons, or gestures bound to them); `on_gesture` to taps,
long presses and swipes; `on_event` to events while it is open:

```rust
impl Screen for HelloScreen {
    fn draw(&mut self, canvas: &mut Canvas<'_>, env: &Env<'_>) {
        // What the screen draws with: canvas, environment and style.
        let mut ui = ui::Ui::new(canvas, env, &self.style);
        self.header.draw(&mut ui, env.i18n().tr("hello.title"), None, None);
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

An action can be run with params: `Command::RunAction(id, params)`, or
`Command::run(id)` without. Its handler gets them as its second argument
(`.handler(|env, params, out| ..)`), and a screen reads them with
`cx.params()` in `on_action`. From a button or a gesture there are none.

A screen that needs time to pass asks for it with `cx.wake_at(when)`,
and `on_timer` comes then. Long work goes in steps, each asking for the
next wake. `on_close_request` may keep a screen open, for example to
ask first. `on_pointer` takes a finger whole, for drawing or moving
rows.

Some rules every screen should follow:

- **Touch and buttons alike.** Some devices have only buttons (the
  Xteink X4), some mostly touch (the Boox). Everything must be easy with
  either: buttons move a focus and confirm, taps act at once. Show the
  focus only once buttons are used (`ui::focus_shown`,
  `ListView::focus_on_keys`). The building blocks that take the buttons'
  actions and gestures (`on_action`, `on_gesture`) answer with a
  `ui::Response`: not theirs (`Ignored`), taken (`Same`), changed and to
  be drawn again (`Changed`), or done with a result (`Done`).
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
  it in more, as slowly as a full refresh. A screen drawn whole with
  pictures on it (covers, `ui::draw_image`, `ui::Thumbnail`) is shown so
  anyway where *Pictures in grays* is on; one that decides itself, or
  whose pictures change often, says no (`pictures_in_grays`).
- **Use the SDK's UI parts** (`paperpaw_sdk::ui`): headers, rows, lists,
  switches, numbers with − and +, messages, icons. They follow the user's
  appearance settings and line up with the rest of PaperPaw. What a
  screen draws itself takes its look from `UiStyle`: the focus with
  `ui.focus(..)` (a `ui::Ui`), what is on a focused row in `style.focus_ink(focused)`
  (white on the dark bar, black on a frame or a light bar), small shapes
  with `style.radius(height)` (pills where corners are round), boxes and
  cards with `style.corner()`, lines between rows with `ui.separator(..)`.
  The style's sizes are read with its methods (`style.margin()`,
  `style.gap()`, `style.row()` in pixels, `style.text()` and
  `style.small()` for text).

Screens say what they show, for reading the interface aloud,
automation and tests: the `ui` helpers (list rows, buttons, switches,
headers, labels) tell what they draw by themselves. A screen that draws
in its own way tells it with `canvas.describe(role, text, area)`, with
the role of what it is (`Row`, `Button`, `Switch`, `Check`, `Radio`,
`Field`, `Image`, `Link`, `Dialog`, `Progress` …), and says more where
it is so: `.focused(true)`, `.on(Some(true))`, `.disabled(true)` for
what does nothing now. Nothing is kept where nobody asks. A
screen reader of one's own hears where the focus of the buttons goes
(`events::FOCUS_CHANGED`: its role, label and area).
