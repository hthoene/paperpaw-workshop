### Looking different: tone, look, hooks

Three ways to change how things look, from the least to the most code. Each
changes how a thing *looks*, never where it goes or how wide it is.

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
