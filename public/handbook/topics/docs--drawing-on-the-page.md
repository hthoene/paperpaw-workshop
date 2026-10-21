### Drawing on the page

A page layer (`layers::PageLayerSpec`) draws on every page a reader
shows: side notes, a reading ruler, change bars. It may reserve room at
a side of the text, which is then laid out without it, and it hears
taps on that room (`events::PAGE_LAYER_TAPPED`, also when the room is
chosen with the buttons, as links are):

```rust
use paperpaw_sdk::layers::{PageLayerSpec, Side};

r.add_page_layer(
    PageLayerSpec::new(Id::new_static("notes.margin"), "notes.margin", |canvas, env, page| {
        let Some(room) = page.room else { return };
        for line in page.lines.iter().filter(|l| has_note(env, page.path, l.start)) {
            canvas.fill_rect(room.x.into(), line.area.y.into(), 4, line.area.height.into(), Color::BLACK);
        }
    })
    .reserve(|env| Some((Side::Right, env.metrics.mm(8) as u16)))
    .taps(),
)?;
```

- `page` (`PageView`) has the book, the page's start and end, the
  text's box and columns, its lines (`LineBox`: where each is and what
  it holds), the status lines and the layer's room.
- Layers draw what they know from memory, on some devices once for every
  band of the page: they read nothing from storage there. Those of an
  order below 0 are drawn behind the text.
- A layer whose drawing changes while the page stays asks for the
  screen to be drawn again (`Command::Redraw`).

A frame (`layers::PageFrameSpec`) sets the text in columns: two
columns, two pages side by side. The setting `core.page-frame` (each
book may have its own) offers every frame by its id, named by the
translation of the id:

```rust
r.add_page_frame(PageFrameSpec::columns(Id::new_static("columns.two"), 2, 24))?;
```
