### Looking different: tone, look, hooks

Three ways to change how things look, from the least to the most code. Each
changes how a thing *looks*, never where it goes or how wide it is.

- **Numbers (no code).** A theme or a reader sets `core.text-curve` (book
  text; in place of *Text contrast* when set) or `core.ui-text-curve` (the
  interface) to a list of `[script=]curve` entries separated by `;`, e.g.
  `smooth; arab=contrast:1`. A curve is `smooth`, `contrast:-1` to
  `contrast:2`, `sharp:128` or 16 numbers from 0 to 255 (the opacity of
  each of the 16 coverage levels of a letter's edge). On a black-and-white
  panel the curve decides which edge pixels turn black, so it is also the
  knob for thicker or thinner letters. In code: `ToneCurve::parse_for`,
  `FontHandle::inked(TextInk::new(curve))`.
- **A look.** `Painters::text` paints the text that `ui::Label` draws (a
  shadow, an outline): draw with `part.font.draw(..)` and return `true`; the
  width stays the stock one. `Painters::extras` takes a `static` list of
  `ExtraPaint`s for parts of kinds that come later (scrollbars, tabs): a
  look made now works when the SDK learns to ask
  (`Capability::LOOK_EXTRAS`). The SDK's own rows, headers,
  buttons, hints and widgets' captions pass it too, with their role
  (`TextRole::BUTTON`, `HINT`, …); text a plugin draws itself does so with
  `ui::draw_label_in(canvas, font, style, role, ..)`. `ui::draw_label` is the
  stock look.
- **A render hook.** `Registrar::add_render_hook` with a `RenderHookSpec`
  changes each finished band (night or sepia tint, grain, a better dither of
  the four-gray pass). **Check `Capability::RENDER_HOOK`:** without it the
  hook is accepted and never run (today's firmware). A hook sees pixels, not
  coverage, so it cannot make letter edges softer (use the tone curve for
  that); it must give the same rows for the same band and carry (no clock or
  random: `HookCx` has none); state across bands goes in `BandView::carry`,
  which the kernel zeroes at the start of each pass; a panic aborts the
  device.

**Colour roles.** `style.ink(Ink::MUTED)` gives the colour of a role of the
interface; a theme sets them in `core.ui-palette` (`muted=60 link=#2a6f97`,
a gray or `#rrggbb`; a gray panel uses the brightness). `Ink` is a number
with constants, so roles can be added: `ACCENT`, `ON_ACCENT`, `LINK`,
`SELECTION` and `WARNING` exist (14 to 18, 19 to 31 are free). A role a theme
does not set reads the colour of `Ink::fallback()` (`LINK` reads `TEXT`), so
draw with the role that says what a thing *is* and a theme made for fewer
roles still looks right; a role you do not know the name of also works.
Do not mix this up with `TextInk`: that is *how text is inked* (its tone), an
`Ink` is a colour role.

`Canvas::pixel` and `gray_at` read back what *this band* drew, to composite
pixels you drew, never to decide what to draw (a point in another band is
`None`, and decisions would show seams).
