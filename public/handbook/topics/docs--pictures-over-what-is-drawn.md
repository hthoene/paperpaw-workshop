### Pictures over what is drawn

Any screen, widget, theme or overlay draws a picture over what is drawn
already: a PNG or GIF keeps its transparency (an alpha channel, a
palette's or a colour key) when decoded with
`image::picture_with_alpha` (others come out opaque; why not, where it
cannot be read), and `ui::draw_image_over` blends it in, its clear
parts showing what is below, its edges mixed with it, and all of it as
see-through as its `opacity` (0 to 255) says. The mix is dithered as
pictures are, so it keeps its lightness on panels of two or four grays;
rows are read and blended one at a time, so a picture takes no memory
of its size. Pictures made larger than they are decoded are
interpolated, not blocky.

```rust
match image::picture_with_alpha(env.storage, "plugins/owls/owl.png", &cache, Fit::side(200)) {
    Ok(image) => ui::draw_image_over(canvas, env.storage, &image, area, 192), // a quarter see-through
    Err(why) => { /* e.g. "unsupported image: interlaced PNG" */ }
}
```

An overlay that draws only part of its region, or blends over it, says
what shows through it (`Screen::shows_through`): every screen below it,
menus too (`ShowsThrough::All`), or the topmost full screen alone, a
menu left open over it not drawn (`ShowsThrough::FullScreen`); what
shows is drawn first under all of it. A screen guarding the device is
marked in `env.stack` (`StackEntry::guards`), so that nothing shows what
is below it. The sleep screen's *The page with a picture* shows the
full screen through: a picture or a widget over the page being read;
pictures for it are offered as presets (below).

A setting's choices are open to other plugins: `Registrar::add_choice`
offers a value of one's own among them (in one's namespace, the
translation key of its name), after the setting's own. The sleep screen
takes a screen of another plugin as a mode so:

```rust
r.add_screen(ScreenSpec::new(Id::new_static("aquarium.sleep"), "aquarium.sleep", factory))?;
r.add_choice(paperpaw_plugin_sleep::SHOW, "aquarium.sleep")?;
```
