### Which building block for what

A plugin's screens are drawn with the SDK's `ui` module, so they look
like PaperPaw's own, follow the reader's text size and the look chosen
(a theme paints switches, the focus, buttons, headers, frames and more),
and work by touch and with the buttons alone. Sizes come from
`UiStyle::new(env)`: `margin`, `gap`, `row`, `header`, the text sizes
(`style.size(TextRole::Body)` and the others). No block shortens a
title or a button's word: a title is measured first and keeps its whole
width, a box or control beside it takes what is left, and where that is
too little the row takes a second line (ask the block for its row's
height); only a value, the reader's own text in a field, may be
shortened. `paperpaw-dev ui-kit` draws every block below on every
device, in every look, light and dark, and checks that no label is
shortened.

| For | Use |
|---|---|
| The bar at the top, a title and a note (a page count) | `ui::draw_header`, `ui::Header` (with its arrows) |
| Parts one below the other, from the top and the bottom | `ui::Stack` (`take`, `take_bottom`, `rest`) |
| Equal columns side by side, e.g. two buttons | `ui::columns(area, count, gap)` |
| A list that pages and holds the focus | `ui::ListView`, `ui::list_step` |
| Rows of a list or of settings | `ui::draw_value_row`, `ui::draw_noted_row`, `ui::draw_switch_row`, `ui::draw_setting_row`, `ui::draw_stepper`, `ui::Slider` |
| Sections with headings | `ui::Sections`, `ui::draw_heading` |
| A grid of cells (covers, tiles) | `ui::Grid` (`cell`, `hit`, `step`) |
| A group on a card or in a frame | `ui::draw_card(canvas, &style, area, Frame::Card)` returns where its parts go |
| A button, on, focused, faint, with an icon | `ui::draw_button`, `ui::draw_faint_button`, `ui::draw_icon_button` |
| A few options to pick at a glance, or tabs | `ui::Segments` |
| Filters or tags in a row, each as wide as its word | `ui::Chips` (the height of their rows: `Chips::height_for`) |
| A one-line text in a row, typed on the keyboard | `ui::draw_text_field` (its row: `text_field_height`), `ui::edit_text` |
| A list where several may be ticked | `ui::draw_check_row` (its row: `check_row_height`; the box alone: `ui::draw_check`) |
| Text longer than its room, scrolled by buttons and touch | `ui::TextView` |
| A date or a time | `ui::DatePicker`, `ui::TimePicker` |
| A box over the screen with a title, text and buttons | `ui::Dialog` |
| Asking for text, a folder, one of several options or yes or no | `ask::text`, `ask::folder`, `ask::choice`, `ask::confirm` (screens of their own) |
| A message where content would be, an empty list | `ui::draw_message`, `ui::draw_empty` |
| Progress | `ui::draw_progress` |
| An address to open on a phone, with its QR code | `ui::draw_address`, `ui::draw_qr` |
| Offering to go online where something needs the network | `ui::OfflineOffer` |
| What the buttons do, at the bottom | the screen's `hint` (the kernel draws the row) |
| First-time hints over a screen | `help::add` (see [Hints for a screen](#hints-for-a-screen)) |
| A widget's frame | `widgets::draw_frame` |

Two buttons side by side, a margin from the screen's sides and bottom:

```rust
use paperpaw_sdk::ui::{self, Stack, UiStyle};

let style = UiStyle::new(env);
let margin = style.margin as u16;
let screen = Rect::new(margin, 0, display.width - 2 * margin, display.height - margin);
let row = Stack::new(screen, margin).take_bottom(ui::Segments::height(&style));
let [ok, cancel] = ui::columns(row, 2, margin)[..] else { return };
ui::draw_button(canvas, env, &style, ok, "OK", false, focus == 0);
ui::draw_button(canvas, env, &style, cancel, "Cancel", false, focus == 1);
```

Tabs over a page, the chosen one on, moved with left and right:

```rust
let tabs = ui::Segments::new(&style, Rect::new(margin, top, width, ui::Segments::height(&style)), 3);
tabs.draw(canvas, env, &style, &["Books", "Shelves", "Notes"], self.tab, self.focus_on_tabs.then_some(self.tab));
// on_action: if let Some(tab) = tabs.step(self.tab, action) { self.tab = tab; }
// on_gesture: if let Some(tab) = tabs.hit(gesture.start) { self.tab = tab; }
```

A dialog in the middle of the screen:

```rust
let mut dialog = ui::Dialog::new(env, &style, "Delete the book?", &["It goes for good."], &["Delete", "Keep"]);
dialog.place((display.height - dialog.height()) / 2);
dialog.draw(canvas, env, &style, Some(self.focus));
```
