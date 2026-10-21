### Widgets with settings

A widget may have settings of its own, such as where its text sits. Put
them in a settings group with the widget's id
(`widgets::settings_group`); the settings list leaves such groups out,
and the home screen's editor offers them as the widget's *Settings*. For
the alignment there is a ready setting: register
`widgets::align_setting(&id, Align::Left)` and place each text with
`widgets::align(env, id).x(area, width)`.

Widgets of all plugins share a look the reader shapes for each, so that
they sit well together on a page: give yours a frame and draw in it.

```rust
const ID: Id = Id::new_static("my.card");
static SETTINGS: [SettingSpec; 4] = [
    widgets::align_spec("my.card.align", ID, Align::Left),
    widgets::frame_spec("my.card.frame", ID, Frame::None), // none, line, light or dark card
    widgets::size_spec("my.card.size", ID, Size::Medium, true), // true: also "as large as it fits"
    widgets::part_spec("my.card.author", ID, "my.show-author", true),
];
r.add_setting_group(widgets::settings_group(&ID, "my.card"))?;
r.add_settings(&SETTINGS)?;

fn draw(&self, canvas: &mut Canvas<'_>, env: &Env<'_>, area: Rect) {
    let look = widgets::draw_frame(canvas, env, ID.as_str(), area);
    let rest = widgets::draw_caption(canvas, env, ID.as_str(), &look, "Today");
    let size = widgets::size(env, ID.as_str()).text(&UiStyle::new(env));
    // ... the content in `rest`, in `look.ink` (and `look.faint` for
    // what matters less), never in a fixed black: on a dark card it is
    // light.
}
```

A widget may be placed more than once, each placement with its own
values of the widget's settings: the home screen places a clock as
`widgets.clock@1` and `widgets.clock@2`, whose frames are the settings
`widgets.clock@1.frame` and `widgets.clock@2.frame` (saved like any
other, the widget's own `widgets.clock.frame` where one sets none).
`env.widgets.make` gives a placement's widget, which reads its settings
by their usual ids and gets that placement's values
(`Settings::with_placement`); a widget need do nothing for it. Screens
of their own that place widgets use `Id::placement` and forget a
placement's values when it goes (`Settings::placement_values`).

`widgets::shows(env, id, "author")` reads a part's switch,
`widgets::choice` makes other choices of the widget's own, and
`widgets::draw_message` says kindly what is not there yet. A widget's
`height` counts its frame (`widgets::look::look` gives the area inside
it without drawing). For round things there are `Canvas::fill_circle`,
`stroke_circle`, `fill_ring` (arcs, e.g. a progress ring) and
`draw_hand`, with angles as on a clock face (`paperpaw_sdk::round`);
light grays are drawn with `fill_shaded` or `fill_round_shaded`, which
dither them on black and white panels.

Screens that place widgets one below the other should know the kernel's
two widgets for room between them: `widgets::SPACE` is an ordinary
widget, a gap; `widgets::FILL` has no height of its own and takes its
share of the room the others leave (`widgets::fill_height`). Both may
be in a list more than once (`widgets::repeatable`).
