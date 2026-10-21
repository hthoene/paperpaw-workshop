```rust
pub fn paperpaw_sdk::ui::choice::Picked::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::ui::choice::Picked::to_params(&self) -> paperpaw_sdk::Params
pub mod paperpaw_sdk::ui::choice
pub struct paperpaw_sdk::ui::choice::Choice
pub fn paperpaw_sdk::ui::choice::Choice::new(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::Params) -> Self
pub fn paperpaw_sdk::ui::choice::Choice::dims_below(&self) -> bool
pub fn paperpaw_sdk::ui::choice::Choice::draw(&mut self, &mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>)
pub fn paperpaw_sdk::ui::choice::Choice::grays(&self) -> bool
pub fn paperpaw_sdk::ui::choice::Choice::guards(&self) -> bool
pub fn paperpaw_sdk::ui::choice::Choice::hint(&self, &paperpaw_sdk::Id, &paperpaw_sdk::Env<'_>) -> paperpaw_sdk::Hint
pub fn paperpaw_sdk::ui::choice::Choice::hints(&self) -> core::option::Option<paperpaw_sdk::Hints>
pub fn paperpaw_sdk::ui::choice::Choice::holds_edges(&self) -> bool
pub fn paperpaw_sdk::ui::choice::Choice::mirrored(&self) -> bool
pub fn paperpaw_sdk::ui::choice::Choice::on_action(&mut self, &paperpaw_sdk::Id, &mut paperpaw_sdk::Cx<'_, '_>) -> paperpaw_sdk::Handled
pub fn paperpaw_sdk::ui::choice::Choice::on_close(&mut self, &mut paperpaw_sdk::Cx<'_, '_>)
pub fn paperpaw_sdk::ui::choice::Choice::on_close_request(&mut self, paperpaw_sdk::CloseCause, &mut paperpaw_sdk::Cx<'_, '_>) -> paperpaw_sdk::Handled
pub fn paperpaw_sdk::ui::choice::Choice::on_event(&mut self, &paperpaw_sdk::Id, &paperpaw_sdk::Params, &mut paperpaw_sdk::Cx<'_, '_>)
pub fn paperpaw_sdk::ui::choice::Choice::on_gesture(&mut self, paperpaw_sdk::Gesture, &mut paperpaw_sdk::Cx<'_, '_>) -> paperpaw_sdk::Handled
pub fn paperpaw_sdk::ui::choice::Choice::on_hide(&mut self)
pub fn paperpaw_sdk::ui::choice::Choice::on_pointer(&mut self, &paperpaw_platform::input::PointerEvent, &mut paperpaw_sdk::Cx<'_, '_>) -> paperpaw_sdk::Handled
pub fn paperpaw_sdk::ui::choice::Choice::on_show(&mut self, &mut paperpaw_sdk::Cx<'_, '_>)
pub fn paperpaw_sdk::ui::choice::Choice::on_timer(&mut self, &mut paperpaw_sdk::Cx<'_, '_>)
pub fn paperpaw_sdk::ui::choice::Choice::outside(&self) -> paperpaw_sdk::Outside
pub fn paperpaw_sdk::ui::choice::Choice::passes_through(&self) -> bool
pub fn paperpaw_sdk::ui::choice::Choice::region(&self, &paperpaw_sdk::Env<'_>) -> core::option::Option<paperpaw_platform::geometry::Rect>
pub fn paperpaw_sdk::ui::choice::Choice::secret(&self) -> bool
pub fn paperpaw_sdk::ui::choice::Choice::takes_double_taps(&self) -> bool
pub paperpaw_sdk::ui::choice::Picked::option: alloc::string::String
pub paperpaw_sdk::ui::choice::Picked::path: alloc::string::String
pub fn paperpaw_sdk::ui::choice::Picked::new(alloc::string::String, alloc::string::String) -> Self
pub fn paperpaw_sdk::ui::choice::Picked::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::ui::choice::Picked::to_params(&self) -> paperpaw_sdk::Params
pub const paperpaw_sdk::ui::choice::OPTION: &str
pub fn paperpaw_sdk::ui::choice::open(paperpaw_sdk::Id, &paperpaw_sdk::event::Event<paperpaw_sdk::ui::choice::Picked>, &str, &str, &str, &[&str]) -> paperpaw_sdk::Command
pub mod paperpaw_sdk::ui::items
pub struct paperpaw_sdk::ui::items::ItemsScreen
pub fn paperpaw_sdk::ui::items::ItemsScreen::open(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::Params) -> Self
pub fn paperpaw_sdk::ui::items::ItemsScreen::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub fn paperpaw_sdk::ui::items::ItemsScreen::dims_below(&self) -> bool
pub fn paperpaw_sdk::ui::items::ItemsScreen::draw(&mut self, &mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>)
pub fn paperpaw_sdk::ui::items::ItemsScreen::grays(&self) -> bool
pub fn paperpaw_sdk::ui::items::ItemsScreen::guards(&self) -> bool
pub fn paperpaw_sdk::ui::items::ItemsScreen::hint(&self, &paperpaw_sdk::Id, &paperpaw_sdk::Env<'_>) -> paperpaw_sdk::Hint
pub fn paperpaw_sdk::ui::items::ItemsScreen::hints(&self) -> core::option::Option<paperpaw_sdk::Hints>
pub fn paperpaw_sdk::ui::items::ItemsScreen::holds_edges(&self) -> bool
pub fn paperpaw_sdk::ui::items::ItemsScreen::mirrored(&self) -> bool
pub fn paperpaw_sdk::ui::items::ItemsScreen::on_action(&mut self, &paperpaw_sdk::Id, &mut paperpaw_sdk::Cx<'_, '_>) -> paperpaw_sdk::Handled
pub fn paperpaw_sdk::ui::items::ItemsScreen::on_close(&mut self, &mut paperpaw_sdk::Cx<'_, '_>)
pub fn paperpaw_sdk::ui::items::ItemsScreen::on_close_request(&mut self, paperpaw_sdk::CloseCause, &mut paperpaw_sdk::Cx<'_, '_>) -> paperpaw_sdk::Handled
pub fn paperpaw_sdk::ui::items::ItemsScreen::on_event(&mut self, &paperpaw_sdk::Id, &paperpaw_sdk::Params, &mut paperpaw_sdk::Cx<'_, '_>)
pub fn paperpaw_sdk::ui::items::ItemsScreen::on_gesture(&mut self, paperpaw_sdk::Gesture, &mut paperpaw_sdk::Cx<'_, '_>) -> paperpaw_sdk::Handled
pub fn paperpaw_sdk::ui::items::ItemsScreen::on_hide(&mut self)
pub fn paperpaw_sdk::ui::items::ItemsScreen::on_pointer(&mut self, &paperpaw_platform::input::PointerEvent, &mut paperpaw_sdk::Cx<'_, '_>) -> paperpaw_sdk::Handled
pub fn paperpaw_sdk::ui::items::ItemsScreen::on_show(&mut self, &mut paperpaw_sdk::Cx<'_, '_>)
pub fn paperpaw_sdk::ui::items::ItemsScreen::on_timer(&mut self, &mut paperpaw_sdk::Cx<'_, '_>)
pub fn paperpaw_sdk::ui::items::ItemsScreen::outside(&self) -> paperpaw_sdk::Outside
pub fn paperpaw_sdk::ui::items::ItemsScreen::passes_through(&self) -> bool
pub fn paperpaw_sdk::ui::items::ItemsScreen::region(&self, &paperpaw_sdk::Env<'_>) -> core::option::Option<paperpaw_platform::geometry::Rect>
pub fn paperpaw_sdk::ui::items::ItemsScreen::secret(&self) -> bool
pub fn paperpaw_sdk::ui::items::ItemsScreen::takes_double_taps(&self) -> bool
pub const paperpaw_sdk::ui::items::LINES: &str
pub mod paperpaw_sdk::ui::look
pub paperpaw_sdk::ui::look::ButtonPart::focused: bool
pub paperpaw_sdk::ui::look::ButtonPart::on: bool
pub paperpaw_sdk::ui::look::ButtonPart::rect: paperpaw_platform::geometry::Rect
pub paperpaw_sdk::ui::look::FocusPart::rect: paperpaw_platform::geometry::Rect
pub paperpaw_sdk::ui::look::HeaderPart::area: paperpaw_platform::geometry::Rect
pub paperpaw_sdk::ui::look::HintsPart::area: paperpaw_platform::geometry::Rect
pub struct paperpaw_sdk::ui::look::Look(_)
pub const fn paperpaw_sdk::ui::look::Look::none() -> Self
pub const fn paperpaw_sdk::ui::look::Look::of(&'static paperpaw_sdk::ui::look::Painters) -> Self
pub fn paperpaw_sdk::ui::look::Look::painters(&self) -> core::option::Option<&'static paperpaw_sdk::ui::look::Painters>
pub fn paperpaw_sdk::ui::look::Look::eq(&self, &Self) -> bool
pub fn paperpaw_sdk::ui::look::Look::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::ui::look::Painters
pub const fn paperpaw_sdk::ui::look::Painters::button(self, paperpaw_sdk::ui::look::InkPainter<paperpaw_sdk::ui::look::ButtonPart>) -> Self
pub const fn paperpaw_sdk::ui::look::Painters::focus(self, paperpaw_sdk::ui::look::Painter<paperpaw_sdk::ui::look::FocusPart>) -> Self
pub const fn paperpaw_sdk::ui::look::Painters::header(self, paperpaw_sdk::ui::look::InkPainter<paperpaw_sdk::ui::look::HeaderPart>) -> Self
pub const fn paperpaw_sdk::ui::look::Painters::hints(self, paperpaw_sdk::ui::look::Painter<paperpaw_sdk::ui::look::HintsPart>) -> Self
pub const fn paperpaw_sdk::ui::look::Painters::new() -> Self
pub const fn paperpaw_sdk::ui::look::Painters::progress(self, paperpaw_sdk::ui::look::Painter<paperpaw_sdk::ui::look::ProgressPart>) -> Self
pub const fn paperpaw_sdk::ui::look::Painters::separator(self, paperpaw_sdk::ui::look::Painter<paperpaw_sdk::ui::look::SeparatorPart>) -> Self
pub const fn paperpaw_sdk::ui::look::Painters::slider(self, paperpaw_sdk::ui::look::Painter<paperpaw_sdk::ui::look::SliderPart>) -> Self
pub const fn paperpaw_sdk::ui::look::Painters::switch(self, paperpaw_sdk::ui::look::Painter<paperpaw_sdk::ui::look::SwitchPart>) -> Self
pub fn paperpaw_sdk::ui::look::Painters::default() -> Self
pub fn paperpaw_sdk::ui::look::Painters::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub paperpaw_sdk::ui::look::ProgressPart::area: paperpaw_platform::geometry::Rect
pub paperpaw_sdk::ui::look::ProgressPart::ink: paperpaw_platform::pixel::Color
pub paperpaw_sdk::ui::look::ProgressPart::permille: u16
pub paperpaw_sdk::ui::look::SeparatorPart::indent: u16
pub paperpaw_sdk::ui::look::SeparatorPart::row: paperpaw_platform::geometry::Rect
pub paperpaw_sdk::ui::look::SliderPart::ink: paperpaw_platform::pixel::Color
pub paperpaw_sdk::ui::look::SliderPart::knob_x: i32
pub paperpaw_sdk::ui::look::SliderPart::track: paperpaw_platform::geometry::Rect
pub paperpaw_sdk::ui::look::SwitchPart::inverted: bool
pub paperpaw_sdk::ui::look::SwitchPart::on: bool
pub paperpaw_sdk::ui::look::SwitchPart::rect: paperpaw_platform::geometry::Rect
pub type paperpaw_sdk::ui::look::InkPainter<P> = fn(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::ui::UiStyle, &P) -> core::option::Option<paperpaw_platform::pixel::Color>
pub type paperpaw_sdk::ui::look::Painter<P> = fn(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::ui::UiStyle, &P) -> bool
pub mod paperpaw_sdk::ui::reorder
pub paperpaw_sdk::ui::reorder::ReorderStep::Changed
pub paperpaw_sdk::ui::reorder::ReorderStep::Dropped
pub paperpaw_sdk::ui::reorder::ReorderStep::Dropped::from: usize
pub paperpaw_sdk::ui::reorder::ReorderStep::Dropped::to: usize
pub paperpaw_sdk::ui::reorder::ReorderStep::Same
pub struct paperpaw_sdk::ui::reorder::Reorder
pub fn paperpaw_sdk::ui::reorder::Reorder::content(paperpaw_platform::geometry::Rect) -> paperpaw_platform::geometry::Rect
pub fn paperpaw_sdk::ui::reorder::Reorder::dragging(&self) -> core::option::Option<(usize, usize)>
pub fn paperpaw_sdk::ui::reorder::Reorder::draw(&self, &mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::ui::UiStyle, &paperpaw_sdk::ui::ListView)
pub fn paperpaw_sdk::ui::reorder::Reorder::draw_grip(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Rect, bool)
pub fn paperpaw_sdk::ui::reorder::Reorder::grip(paperpaw_platform::geometry::Rect) -> paperpaw_platform::geometry::Rect
pub fn paperpaw_sdk::ui::reorder::Reorder::on_pointer(&mut self, &paperpaw_platform::input::PointerEvent, &paperpaw_sdk::ui::ListView, usize) -> core::option::Option<paperpaw_sdk::ui::reorder::ReorderStep>
pub fn paperpaw_sdk::ui::reorder::moved<T>(&mut alloc::vec::Vec<T>, usize, usize)
pub mod paperpaw_sdk::ui::sections
pub enum paperpaw_sdk::ui::sections::Item
pub paperpaw_sdk::ui::sections::Item::Entry(usize)
pub paperpaw_sdk::ui::sections::Item::Heading(usize)
pub struct paperpaw_sdk::ui::sections::Section
pub paperpaw_sdk::ui::sections::Section::count: usize
pub paperpaw_sdk::ui::sections::Section::heading: bool
pub struct paperpaw_sdk::ui::sections::Sections
pub fn paperpaw_sdk::ui::sections::Sections::area(&self) -> paperpaw_platform::geometry::Rect
pub fn paperpaw_sdk::ui::sections::Sections::draw(&self, &mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::ui::UiStyle, bool, impl core::ops::function::FnMut(&mut paperpaw_graphics::canvas::Canvas<'_>, paperpaw_sdk::ui::sections::Item, paperpaw_platform::geometry::Rect, bool))
pub fn paperpaw_sdk::ui::sections::Sections::focus(&self) -> usize
pub fn paperpaw_sdk::ui::sections::Sections::focus_on(&mut self, usize) -> paperpaw_sdk::ui::ListChange
pub fn paperpaw_sdk::ui::sections::Sections::hit(&self, paperpaw_platform::geometry::Point) -> core::option::Option<usize>
pub fn paperpaw_sdk::ui::sections::Sections::is_empty(&self) -> bool
pub fn paperpaw_sdk::ui::sections::Sections::len(&self) -> usize
pub fn paperpaw_sdk::ui::sections::Sections::new(paperpaw_platform::geometry::Rect, u16, u16, alloc::vec::Vec<paperpaw_sdk::ui::sections::Section>) -> Self
pub fn paperpaw_sdk::ui::sections::Sections::page_entries(&self) -> core::ops::range::Range<usize>
pub fn paperpaw_sdk::ui::sections::Sections::paging(&self) -> (usize, usize)
pub fn paperpaw_sdk::ui::sections::Sections::rect_of(&self, usize) -> core::option::Option<paperpaw_platform::geometry::Rect>
pub fn paperpaw_sdk::ui::sections::Sections::request(&self, paperpaw_sdk::ui::ListChange, &mut paperpaw_sdk::Cx<'_, '_>)
pub fn paperpaw_sdk::ui::sections::Sections::section_of(&self, usize) -> core::option::Option<(usize, usize)>
pub fn paperpaw_sdk::ui::sections::Sections::set_focus(&mut self, usize) -> paperpaw_sdk::ui::ListChange
pub fn paperpaw_sdk::ui::sections::Sections::step(&mut self, bool) -> paperpaw_sdk::ui::ListChange
pub fn paperpaw_sdk::ui::sections::Sections::turn(&mut self, bool) -> paperpaw_sdk::ui::ListChange
pub fn paperpaw_sdk::ui::sections::Sections::visible(&self) -> alloc::vec::Vec<(paperpaw_sdk::ui::sections::Item, paperpaw_platform::geometry::Rect)>
pub mod paperpaw_sdk::ui::slider
pub paperpaw_sdk::ui::slider::SliderFocus::Editing
pub paperpaw_sdk::ui::slider::SliderFocus::Focused
pub paperpaw_sdk::ui::slider::SliderFocus::None
pub paperpaw_sdk::ui::slider::SliderStep::Cancelled
pub paperpaw_sdk::ui::slider::SliderStep::Chosen(i64)
pub paperpaw_sdk::ui::slider::SliderStep::Moved(i64)
pub paperpaw_sdk::ui::slider::SliderStep::Same
pub struct paperpaw_sdk::ui::slider::Slider
pub fn paperpaw_sdk::ui::slider::Slider::clamp(&self, i64) -> i64
pub fn paperpaw_sdk::ui::slider::Slider::draw_band(&self, &mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::ui::UiStyle, &paperpaw_sdk::ui::slider::SliderView<'_>)
pub fn paperpaw_sdk::ui::slider::Slider::draw_row(&self, &mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::ui::UiStyle, &paperpaw_sdk::ui::slider::SliderView<'_>)
pub fn paperpaw_sdk::ui::slider::Slider::draw_track(&self, &mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Rect, i64, paperpaw_platform::pixel::Color)
pub fn paperpaw_sdk::ui::slider::Slider::knob_x(&self, paperpaw_platform::geometry::Rect, i64) -> i32
pub fn paperpaw_sdk::ui::slider::Slider::max(&self) -> i64
pub fn paperpaw_sdk::ui::slider::Slider::min(&self) -> i64
pub const fn paperpaw_sdk::ui::slider::Slider::new(i64, i64) -> Self
pub fn paperpaw_sdk::ui::slider::Slider::of(&paperpaw_sdk::SettingSpec) -> core::option::Option<Self>
pub fn paperpaw_sdk::ui::slider::Slider::share(&self, i64) -> f32
pub const fn paperpaw_sdk::ui::slider::Slider::step(self, i64) -> Self
pub fn paperpaw_sdk::ui::slider::Slider::step_size(&self) -> i64
pub fn paperpaw_sdk::ui::slider::Slider::stepped(&self, i64, i64) -> i64
pub fn paperpaw_sdk::ui::slider::Slider::value_at(&self, paperpaw_platform::geometry::Rect, i32) -> i64
pub struct paperpaw_sdk::ui::slider::SliderDrag
pub fn paperpaw_sdk::ui::slider::SliderDrag::dragging(&self) -> core::option::Option<i64>
pub fn paperpaw_sdk::ui::slider::SliderDrag::on_pointer(&mut self, &paperpaw_platform::input::PointerEvent, &paperpaw_sdk::ui::UiStyle, &paperpaw_sdk::ui::slider::Slider, paperpaw_platform::geometry::Rect, i64) -> core::option::Option<paperpaw_sdk::ui::slider::SliderStep>
pub struct paperpaw_sdk::ui::slider::SliderParts
pub paperpaw_sdk::ui::slider::SliderParts::minus: paperpaw_platform::geometry::Rect
pub paperpaw_sdk::ui::slider::SliderParts::plus: paperpaw_platform::geometry::Rect
pub paperpaw_sdk::ui::slider::SliderParts::track: paperpaw_platform::geometry::Rect
pub paperpaw_sdk::ui::slider::SliderView::area: paperpaw_platform::geometry::Rect
pub paperpaw_sdk::ui::slider::SliderView::focus: paperpaw_sdk::ui::slider::SliderFocus
pub paperpaw_sdk::ui::slider::SliderView::note: &'a str
pub paperpaw_sdk::ui::slider::SliderView::shown: &'a str
pub paperpaw_sdk::ui::slider::SliderView::title: &'a str
pub paperpaw_sdk::ui::slider::SliderView::value: i64
pub fn paperpaw_sdk::ui::slider::SliderView<'a>::focus(self, paperpaw_sdk::ui::slider::SliderFocus) -> Self
pub fn paperpaw_sdk::ui::slider::SliderView<'a>::new(paperpaw_platform::geometry::Rect, i64, &'a str) -> Self
pub fn paperpaw_sdk::ui::slider::SliderView<'a>::note(self, &'a str) -> Self
pub fn paperpaw_sdk::ui::slider::SliderView<'a>::title(self, &'a str) -> Self
pub fn paperpaw_sdk::ui::slider::band(&paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Rect) -> paperpaw_platform::geometry::Rect
pub fn paperpaw_sdk::ui::slider::band_height(&paperpaw_sdk::ui::UiStyle) -> u16
pub fn paperpaw_sdk::ui::slider::key_step(&paperpaw_sdk::Id) -> core::option::Option<i64>
pub fn paperpaw_sdk::ui::slider::marked(&paperpaw_sdk::SettingSpec) -> bool
pub fn paperpaw_sdk::ui::slider::parts(&paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Rect) -> paperpaw_sdk::ui::slider::SliderParts
pub fn paperpaw_sdk::ui::slider::row_height(&paperpaw_sdk::ui::UiStyle, bool) -> u16
pub fn paperpaw_sdk::ui::slider::shows(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::SettingSpec) -> bool
pub paperpaw_sdk::ui::Focus::Fill
pub paperpaw_sdk::ui::Focus::Ring
pub paperpaw_sdk::ui::Focus::Soft
pub paperpaw_sdk::ui::Ink::Card
pub paperpaw_sdk::ui::Ink::CardPattern
pub paperpaw_sdk::ui::Ink::Disabled
pub paperpaw_sdk::ui::Ink::Faint
pub paperpaw_sdk::ui::Ink::Line
pub paperpaw_sdk::ui::Ink::LineFaint
pub paperpaw_sdk::ui::Ink::Muted
pub paperpaw_sdk::ui::Ink::Note
pub paperpaw_sdk::ui::Ink::OnDarkMuted
pub paperpaw_sdk::ui::Ink::OnFocusMuted
pub paperpaw_sdk::ui::Ink::Paper
pub paperpaw_sdk::ui::Ink::Rule
pub paperpaw_sdk::ui::Ink::Section
pub paperpaw_sdk::ui::Ink::Text
pub const paperpaw_sdk::ui::Ink::ALL: [paperpaw_sdk::ui::Ink; 14]
pub const fn paperpaw_sdk::ui::Ink::name(self) -> &'static str
pub paperpaw_sdk::ui::ListChange::Focus
pub paperpaw_sdk::ui::ListChange::None
pub paperpaw_sdk::ui::ListChange::Page
pub fn paperpaw_sdk::ui::ListChange::request(self, &mut paperpaw_sdk::Cx<'_, '_>)
pub paperpaw_sdk::ui::ReorderStep::Changed
pub paperpaw_sdk::ui::ReorderStep::Dropped
pub paperpaw_sdk::ui::ReorderStep::Dropped::from: usize
pub paperpaw_sdk::ui::ReorderStep::Dropped::to: usize
pub paperpaw_sdk::ui::ReorderStep::Same
pub paperpaw_sdk::ui::Separators::Inset
pub paperpaw_sdk::ui::Separators::Line
pub paperpaw_sdk::ui::Separators::None
pub paperpaw_sdk::ui::SliderFocus::Editing
pub paperpaw_sdk::ui::SliderFocus::Focused
pub paperpaw_sdk::ui::SliderFocus::None
pub paperpaw_sdk::ui::SliderStep::Cancelled
pub paperpaw_sdk::ui::SliderStep::Chosen(i64)
pub paperpaw_sdk::ui::SliderStep::Moved(i64)
pub paperpaw_sdk::ui::SliderStep::Same
pub paperpaw_sdk::ui::TextRole::Body
pub paperpaw_sdk::ui::TextRole::Caption
pub paperpaw_sdk::ui::TextRole::Display
pub paperpaw_sdk::ui::TextRole::Head
pub paperpaw_sdk::ui::TextRole::Headline
pub paperpaw_sdk::ui::TextRole::Numeral
pub paperpaw_sdk::ui::TextRole::Small
pub paperpaw_sdk::ui::TextRole::Title
pub struct paperpaw_sdk::ui::Header
pub paperpaw_sdk::ui::Header::area: paperpaw_platform::geometry::Rect
pub paperpaw_sdk::ui::Header::note_focused: bool
pub fn paperpaw_sdk::ui::Header::draw(&self, &mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::ui::UiStyle, &str, core::option::Option<&str>, core::option::Option<(usize, usize)>)
pub fn paperpaw_sdk::ui::Header::new(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::ui::UiStyle, bool) -> Self
pub fn paperpaw_sdk::ui::Header::on_page_number(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Point, core::option::Option<(usize, usize)>) -> bool
pub fn paperpaw_sdk::ui::Header::on_title(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Point, core::option::Option<(usize, usize)>) -> bool
pub fn paperpaw_sdk::ui::Header::tap(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Point, core::option::Option<(usize, usize)>) -> core::option::Option<paperpaw_sdk::Id>
pub struct paperpaw_sdk::ui::ListView
pub fn paperpaw_sdk::ui::ListView::active(&self) -> bool
pub fn paperpaw_sdk::ui::ListView::area(&self) -> paperpaw_platform::geometry::Rect
pub fn paperpaw_sdk::ui::ListView::column_count(&self) -> usize
pub fn paperpaw_sdk::ui::ListView::columns(self, u32) -> Self
pub fn paperpaw_sdk::ui::ListView::confirm(&mut self) -> core::option::Option<usize>
pub fn paperpaw_sdk::ui::ListView::draw(&self, &mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::ui::UiStyle, usize, impl core::ops::function::FnMut(&mut paperpaw_graphics::canvas::Canvas<'_>, usize, paperpaw_platform::geometry::Rect, bool))
pub fn paperpaw_sdk::ui::ListView::focus(&self) -> usize
pub fn paperpaw_sdk::ui::ListView::focus_on_keys(self, &paperpaw_sdk::Env<'_>) -> Self
pub fn paperpaw_sdk::ui::ListView::hit(&self, paperpaw_platform::geometry::Point, usize) -> core::option::Option<usize>
pub fn paperpaw_sdk::ui::ListView::move_focus(&mut self, isize, usize) -> paperpaw_sdk::ui::ListChange
pub fn paperpaw_sdk::ui::ListView::navigate(&mut self, &paperpaw_sdk::Id, usize) -> core::option::Option<paperpaw_sdk::ui::ListChange>
pub fn paperpaw_sdk::ui::ListView::new(paperpaw_platform::geometry::Rect, u32) -> Self
pub fn paperpaw_sdk::ui::ListView::page(&self) -> usize
pub fn paperpaw_sdk::ui::ListView::pages(&self, usize) -> usize
pub fn paperpaw_sdk::ui::ListView::paging(&self, usize) -> core::option::Option<(usize, usize)>
pub fn paperpaw_sdk::ui::ListView::request(&self, paperpaw_sdk::ui::ListChange, &mut paperpaw_sdk::Cx<'_, '_>)
pub fn paperpaw_sdk::ui::ListView::row(&self) -> u32
pub fn paperpaw_sdk::ui::ListView::row_rect(&self, usize) -> paperpaw_platform::geometry::Rect
pub fn paperpaw_sdk::ui::ListView::rows(&self) -> usize
pub fn paperpaw_sdk::ui::ListView::set_active(&mut self, bool)
pub fn paperpaw_sdk::ui::ListView::set_area(&mut self, paperpaw_platform::geometry::Rect)
pub fn paperpaw_sdk::ui::ListView::set_focus(&mut self, usize) -> paperpaw_sdk::ui::ListChange
pub fn paperpaw_sdk::ui::ListView::set_len(&mut self, usize)
pub fn paperpaw_sdk::ui::ListView::set_shown(&mut self, bool)
pub fn paperpaw_sdk::ui::ListView::shown(&self) -> bool
pub struct paperpaw_sdk::ui::Pager
pub paperpaw_sdk::ui::Pager::area: paperpaw_platform::geometry::Rect
pub fn paperpaw_sdk::ui::Pager::draw(&self, &mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::ui::UiStyle, (usize, usize))
pub fn paperpaw_sdk::ui::Pager::height(&paperpaw_sdk::ui::UiStyle) -> u16
pub fn paperpaw_sdk::ui::Pager::new(&paperpaw_sdk::Env<'_>, paperpaw_platform::geometry::Rect) -> Self
pub fn paperpaw_sdk::ui::Pager::tap(&self, paperpaw_platform::geometry::Point) -> core::option::Option<paperpaw_sdk::Id>
pub struct paperpaw_sdk::ui::Palette(_)
pub const paperpaw_sdk::ui::Palette::DEFAULT: paperpaw_sdk::ui::Palette
pub fn paperpaw_sdk::ui::Palette::gray(&self, paperpaw_sdk::ui::Ink) -> u8
pub fn paperpaw_sdk::ui::Palette::parse(&str) -> paperpaw_sdk::ui::Palette
pub fn paperpaw_sdk::ui::Palette::default() -> Self
pub struct paperpaw_sdk::ui::Reorder
pub fn paperpaw_sdk::ui::reorder::Reorder::content(paperpaw_platform::geometry::Rect) -> paperpaw_platform::geometry::Rect
pub fn paperpaw_sdk::ui::reorder::Reorder::dragging(&self) -> core::option::Option<(usize, usize)>
pub fn paperpaw_sdk::ui::reorder::Reorder::draw(&self, &mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::ui::UiStyle, &paperpaw_sdk::ui::ListView)
pub fn paperpaw_sdk::ui::reorder::Reorder::draw_grip(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Rect, bool)
pub fn paperpaw_sdk::ui::reorder::Reorder::grip(paperpaw_platform::geometry::Rect) -> paperpaw_platform::geometry::Rect
pub fn paperpaw_sdk::ui::reorder::Reorder::on_pointer(&mut self, &paperpaw_platform::input::PointerEvent, &paperpaw_sdk::ui::ListView, usize) -> core::option::Option<paperpaw_sdk::ui::reorder::ReorderStep>
pub struct paperpaw_sdk::ui::Rows
pub fn paperpaw_sdk::ui::Rows::area(&self) -> paperpaw_platform::geometry::Rect
pub fn paperpaw_sdk::ui::Rows::draw(&self, &mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::ui::UiStyle, bool, impl core::ops::function::FnMut(&mut paperpaw_graphics::canvas::Canvas<'_>, usize, paperpaw_platform::geometry::Rect, bool))
pub fn paperpaw_sdk::ui::Rows::focus(&self) -> usize
pub fn paperpaw_sdk::ui::Rows::hit(&self, paperpaw_platform::geometry::Point) -> core::option::Option<usize>
pub fn paperpaw_sdk::ui::Rows::is_empty(&self) -> bool
pub fn paperpaw_sdk::ui::Rows::is_heading(&self, usize) -> bool
pub fn paperpaw_sdk::ui::Rows::len(&self) -> usize
pub fn paperpaw_sdk::ui::Rows::new(paperpaw_platform::geometry::Rect, alloc::vec::Vec<u16>, alloc::vec::Vec<bool>) -> Self
pub fn paperpaw_sdk::ui::Rows::paging(&self) -> (usize, usize)
pub fn paperpaw_sdk::ui::Rows::rect_of(&self, usize) -> core::option::Option<paperpaw_platform::geometry::Rect>
pub fn paperpaw_sdk::ui::Rows::request(&self, paperpaw_sdk::ui::ListChange, &mut paperpaw_sdk::Cx<'_, '_>)
pub fn paperpaw_sdk::ui::Rows::set_focus(&mut self, usize) -> paperpaw_sdk::ui::ListChange
pub fn paperpaw_sdk::ui::Rows::set_passed(&mut self, alloc::vec::Vec<bool>)
pub fn paperpaw_sdk::ui::Rows::step(&mut self, bool) -> paperpaw_sdk::ui::ListChange
pub fn paperpaw_sdk::ui::Rows::turn(&mut self, bool) -> paperpaw_sdk::ui::ListChange
pub fn paperpaw_sdk::ui::Rows::visible(&self) -> alloc::vec::Vec<(usize, paperpaw_platform::geometry::Rect)>
pub struct paperpaw_sdk::ui::Sections
pub fn paperpaw_sdk::ui::sections::Sections::area(&self) -> paperpaw_platform::geometry::Rect
pub fn paperpaw_sdk::ui::sections::Sections::draw(&self, &mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::ui::UiStyle, bool, impl core::ops::function::FnMut(&mut paperpaw_graphics::canvas::Canvas<'_>, paperpaw_sdk::ui::sections::Item, paperpaw_platform::geometry::Rect, bool))
pub fn paperpaw_sdk::ui::sections::Sections::focus(&self) -> usize
pub fn paperpaw_sdk::ui::sections::Sections::focus_on(&mut self, usize) -> paperpaw_sdk::ui::ListChange
pub fn paperpaw_sdk::ui::sections::Sections::hit(&self, paperpaw_platform::geometry::Point) -> core::option::Option<usize>
pub fn paperpaw_sdk::ui::sections::Sections::is_empty(&self) -> bool
pub fn paperpaw_sdk::ui::sections::Sections::len(&self) -> usize
pub fn paperpaw_sdk::ui::sections::Sections::new(paperpaw_platform::geometry::Rect, u16, u16, alloc::vec::Vec<paperpaw_sdk::ui::sections::Section>) -> Self
pub fn paperpaw_sdk::ui::sections::Sections::page_entries(&self) -> core::ops::range::Range<usize>
pub fn paperpaw_sdk::ui::sections::Sections::paging(&self) -> (usize, usize)
pub fn paperpaw_sdk::ui::sections::Sections::rect_of(&self, usize) -> core::option::Option<paperpaw_platform::geometry::Rect>
pub fn paperpaw_sdk::ui::sections::Sections::request(&self, paperpaw_sdk::ui::ListChange, &mut paperpaw_sdk::Cx<'_, '_>)
pub fn paperpaw_sdk::ui::sections::Sections::section_of(&self, usize) -> core::option::Option<(usize, usize)>
pub fn paperpaw_sdk::ui::sections::Sections::set_focus(&mut self, usize) -> paperpaw_sdk::ui::ListChange
pub fn paperpaw_sdk::ui::sections::Sections::step(&mut self, bool) -> paperpaw_sdk::ui::ListChange
pub fn paperpaw_sdk::ui::sections::Sections::turn(&mut self, bool) -> paperpaw_sdk::ui::ListChange
pub fn paperpaw_sdk::ui::sections::Sections::visible(&self) -> alloc::vec::Vec<(paperpaw_sdk::ui::sections::Item, paperpaw_platform::geometry::Rect)>
pub struct paperpaw_sdk::ui::Slider
pub fn paperpaw_sdk::ui::slider::Slider::clamp(&self, i64) -> i64
pub fn paperpaw_sdk::ui::slider::Slider::draw_band(&self, &mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::ui::UiStyle, &paperpaw_sdk::ui::slider::SliderView<'_>)
pub fn paperpaw_sdk::ui::slider::Slider::draw_row(&self, &mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::ui::UiStyle, &paperpaw_sdk::ui::slider::SliderView<'_>)
pub fn paperpaw_sdk::ui::slider::Slider::draw_track(&self, &mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Rect, i64, paperpaw_platform::pixel::Color)
pub fn paperpaw_sdk::ui::slider::Slider::knob_x(&self, paperpaw_platform::geometry::Rect, i64) -> i32
pub fn paperpaw_sdk::ui::slider::Slider::max(&self) -> i64
pub fn paperpaw_sdk::ui::slider::Slider::min(&self) -> i64
pub const fn paperpaw_sdk::ui::slider::Slider::new(i64, i64) -> Self
pub fn paperpaw_sdk::ui::slider::Slider::of(&paperpaw_sdk::SettingSpec) -> core::option::Option<Self>
pub fn paperpaw_sdk::ui::slider::Slider::share(&self, i64) -> f32
pub const fn paperpaw_sdk::ui::slider::Slider::step(self, i64) -> Self
pub fn paperpaw_sdk::ui::slider::Slider::step_size(&self) -> i64
pub fn paperpaw_sdk::ui::slider::Slider::stepped(&self, i64, i64) -> i64
pub fn paperpaw_sdk::ui::slider::Slider::value_at(&self, paperpaw_platform::geometry::Rect, i32) -> i64
pub struct paperpaw_sdk::ui::SliderDrag
pub fn paperpaw_sdk::ui::slider::SliderDrag::dragging(&self) -> core::option::Option<i64>
pub fn paperpaw_sdk::ui::slider::SliderDrag::on_pointer(&mut self, &paperpaw_platform::input::PointerEvent, &paperpaw_sdk::ui::UiStyle, &paperpaw_sdk::ui::slider::Slider, paperpaw_platform::geometry::Rect, i64) -> core::option::Option<paperpaw_sdk::ui::slider::SliderStep>
pub struct paperpaw_sdk::ui::SliderParts
pub paperpaw_sdk::ui::SliderParts::minus: paperpaw_platform::geometry::Rect
pub paperpaw_sdk::ui::SliderParts::plus: paperpaw_platform::geometry::Rect
pub paperpaw_sdk::ui::SliderParts::track: paperpaw_platform::geometry::Rect
pub paperpaw_sdk::ui::SliderView::area: paperpaw_platform::geometry::Rect
pub paperpaw_sdk::ui::SliderView::focus: paperpaw_sdk::ui::slider::SliderFocus
pub paperpaw_sdk::ui::SliderView::note: &'a str
pub paperpaw_sdk::ui::SliderView::shown: &'a str
pub paperpaw_sdk::ui::SliderView::title: &'a str
pub paperpaw_sdk::ui::SliderView::value: i64
pub fn paperpaw_sdk::ui::slider::SliderView<'a>::focus(self, paperpaw_sdk::ui::slider::SliderFocus) -> Self
pub fn paperpaw_sdk::ui::slider::SliderView<'a>::new(paperpaw_platform::geometry::Rect, i64, &'a str) -> Self
pub fn paperpaw_sdk::ui::slider::SliderView<'a>::note(self, &'a str) -> Self
pub fn paperpaw_sdk::ui::slider::SliderView<'a>::title(self, &'a str) -> Self
pub struct paperpaw_sdk::ui::Thumbnail
pub fn paperpaw_sdk::ui::Thumbnail::bytes(&self) -> usize
pub fn paperpaw_sdk::ui::Thumbnail::draw(&self, &mut paperpaw_graphics::canvas::Canvas<'_>, u16, u16)
pub fn paperpaw_sdk::ui::Thumbnail::draw_round(&self, &mut paperpaw_graphics::canvas::Canvas<'_>, u16, u16, u32)
pub fn paperpaw_sdk::ui::Thumbnail::height(&self) -> u16
pub fn paperpaw_sdk::ui::Thumbnail::keep(&self, &dyn paperpaw_platform::storage::Storage, &str, u64) -> bool
pub fn paperpaw_sdk::ui::Thumbnail::kept(&dyn paperpaw_platform::storage::Storage, &str, u64, (u16, u16)) -> core::option::Option<Self>
pub fn paperpaw_sdk::ui::Thumbnail::new(&dyn paperpaw_platform::storage::Storage, &paperpaw_document::ImageRef, u16, u16, paperpaw_platform::pixel::PixelFormat) -> core::option::Option<Self>
pub fn paperpaw_sdk::ui::Thumbnail::width(&self) -> u16
pub paperpaw_sdk::ui::UiStyle::cards: bool
pub paperpaw_sdk::ui::UiStyle::corner: u32
pub paperpaw_sdk::ui::UiStyle::dark_header: bool
pub paperpaw_sdk::ui::UiStyle::finger: u32
pub paperpaw_sdk::ui::UiStyle::focus: paperpaw_sdk::ui::Focus
pub paperpaw_sdk::ui::UiStyle::gap: u32
pub paperpaw_sdk::ui::UiStyle::grays: u16
pub paperpaw_sdk::ui::UiStyle::head: f32
pub paperpaw_sdk::ui::UiStyle::header: u32
pub paperpaw_sdk::ui::UiStyle::line: u32
pub paperpaw_sdk::ui::UiStyle::look: paperpaw_sdk::ui::look::Look
pub paperpaw_sdk::ui::UiStyle::margin: u32
pub paperpaw_sdk::ui::UiStyle::palette: paperpaw_sdk::ui::Palette
pub paperpaw_sdk::ui::UiStyle::pill: bool
pub paperpaw_sdk::ui::UiStyle::plain_header: bool
pub paperpaw_sdk::ui::UiStyle::row: u32
pub paperpaw_sdk::ui::UiStyle::separators: paperpaw_sdk::ui::Separators
pub paperpaw_sdk::ui::UiStyle::small: f32
pub paperpaw_sdk::ui::UiStyle::strong: bool
pub paperpaw_sdk::ui::UiStyle::text: f32
pub paperpaw_sdk::ui::UiStyle::title: f32
pub const paperpaw_sdk::ui::UiStyle::PLAIN: paperpaw_sdk::ui::UiStyle
pub fn paperpaw_sdk::ui::UiStyle::dark_focus(&self) -> bool
pub fn paperpaw_sdk::ui::UiStyle::faint(&self, u8) -> paperpaw_platform::pixel::Color
pub fn paperpaw_sdk::ui::UiStyle::focus_faint(&self, bool, u8) -> paperpaw_platform::pixel::Color
pub fn paperpaw_sdk::ui::UiStyle::focus_ink(&self, bool) -> paperpaw_platform::pixel::Color
pub fn paperpaw_sdk::ui::UiStyle::focus_paper(&self, bool) -> paperpaw_platform::pixel::Color
pub fn paperpaw_sdk::ui::UiStyle::font<'a>(&self, &paperpaw_sdk::Env<'a>) -> core::option::Option<paperpaw_sdk::FontHandle<'a>>
pub fn paperpaw_sdk::ui::UiStyle::header_colors(&self) -> (paperpaw_platform::pixel::Color, paperpaw_platform::pixel::Color)
pub fn paperpaw_sdk::ui::UiStyle::ink(&self, paperpaw_sdk::ui::Ink) -> paperpaw_platform::pixel::Color
pub fn paperpaw_sdk::ui::UiStyle::new(&paperpaw_sdk::Env<'_>) -> Self
pub fn paperpaw_sdk::ui::UiStyle::noted_row(&self) -> u32
pub fn paperpaw_sdk::ui::UiStyle::noted_row_of(&self, usize) -> u32
pub fn paperpaw_sdk::ui::UiStyle::radius(&self, u32) -> u32
pub fn paperpaw_sdk::ui::UiStyle::size(&self, paperpaw_sdk::ui::TextRole) -> f32
pub fn paperpaw_sdk::ui::UiStyle::touch_row(&self, u32) -> u32
pub const paperpaw_sdk::ui::HOLD_ICON: &str
pub const paperpaw_sdk::ui::ICON_SCALE: f32
pub const paperpaw_sdk::ui::NOTE_LINES: usize
pub const paperpaw_sdk::ui::PAW_ICON: &str
pub fn paperpaw_sdk::ui::button_border(&paperpaw_sdk::ui::UiStyle) -> u32
pub fn paperpaw_sdk::ui::button_height(&paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Rect) -> u16
pub fn paperpaw_sdk::ui::button_hints_height(&paperpaw_sdk::Env<'_>) -> u16
pub fn paperpaw_sdk::ui::button_width(&paperpaw_sdk::ui::UiStyle, f32) -> f32
pub fn paperpaw_sdk::ui::draw_arrow(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::ui::UiStyle, (i32, i32), &str, bool, paperpaw_platform::pixel::Color)
pub fn paperpaw_sdk::ui::draw_button(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Rect, &str, bool, bool)
pub fn paperpaw_sdk::ui::draw_button_hints(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, paperpaw_platform::geometry::Rect, &[paperpaw_sdk::Hint], &[bool], core::option::Option<usize>)
pub fn paperpaw_sdk::ui::draw_chevron(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::ui::UiStyle, i32, i32, bool, paperpaw_platform::pixel::Color)
pub fn paperpaw_sdk::ui::draw_empty(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Rect, &str, &str, &str)
pub fn paperpaw_sdk::ui::draw_faint_button(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Rect, &str, bool)
pub fn paperpaw_sdk::ui::draw_focus(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Rect)
pub fn paperpaw_sdk::ui::draw_header(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Rect, &str, core::option::Option<&str>)
pub fn paperpaw_sdk::ui::draw_heading(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Rect, &str)
pub fn paperpaw_sdk::ui::draw_icon(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &str, f32, f32, paperpaw_platform::geometry::Rect, paperpaw_platform::pixel::Color) -> f32
pub fn paperpaw_sdk::ui::draw_icon_at(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &str, f32, (i32, i32), paperpaw_platform::pixel::Color) -> bool
pub fn paperpaw_sdk::ui::draw_icon_button(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Rect, &str, bool, bool) -> paperpaw_platform::pixel::Color
pub fn paperpaw_sdk::ui::draw_image(&mut paperpaw_graphics::canvas::Canvas<'_>, &dyn paperpaw_platform::storage::Storage, &paperpaw_document::ImageRef, paperpaw_platform::geometry::Rect)
pub fn paperpaw_sdk::ui::draw_label(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::FontHandle<'_>, f32, f32, paperpaw_platform::geometry::Rect, &str, paperpaw_platform::pixel::Color) -> f32
pub fn paperpaw_sdk::ui::draw_message(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Rect, &str)
pub fn paperpaw_sdk::ui::draw_note(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Rect, bool, &str)
pub fn paperpaw_sdk::ui::draw_note_line(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Rect, &str)
pub fn paperpaw_sdk::ui::draw_noted_row(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Rect, bool, &str, &str, &str)
pub fn paperpaw_sdk::ui::draw_number(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Rect, &str, &str, &str, core::option::Option<bool>)
pub fn paperpaw_sdk::ui::draw_number_note(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Rect, bool, &str)
pub fn paperpaw_sdk::ui::draw_progress(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Rect, u16, paperpaw_platform::pixel::Color)
pub fn paperpaw_sdk::ui::draw_qr(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_qr::QrCode, paperpaw_platform::geometry::Rect) -> core::option::Option<paperpaw_platform::geometry::Rect>
pub fn paperpaw_sdk::ui::draw_row_icon(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Rect, u16, core::option::Option<&str>, paperpaw_platform::pixel::Color) -> paperpaw_platform::geometry::Rect
pub fn paperpaw_sdk::ui::draw_separator(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Rect, u16)
pub fn paperpaw_sdk::ui::draw_stepper(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Rect, &str, &str, &str, bool)
pub fn paperpaw_sdk::ui::draw_switch(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Rect, bool, bool)
pub fn paperpaw_sdk::ui::draw_switch_row(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Rect, bool, &str, &str, bool)
pub fn paperpaw_sdk::ui::draw_value_row(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Rect, bool, &str, &str)
pub fn paperpaw_sdk::ui::edge_bar_band(&paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Rect, bool) -> paperpaw_platform::geometry::Rect
pub fn paperpaw_sdk::ui::edge_bar_height(&paperpaw_sdk::ui::UiStyle) -> u16
pub fn paperpaw_sdk::ui::edge_room(&paperpaw_sdk::ui::UiStyle, u16) -> u16
pub fn paperpaw_sdk::ui::fill(&mut paperpaw_graphics::canvas::Canvas<'_>, paperpaw_platform::geometry::Rect, paperpaw_platform::pixel::Color)
pub fn paperpaw_sdk::ui::fill_round(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Rect, paperpaw_platform::pixel::Color)
pub fn paperpaw_sdk::ui::fit(&paperpaw_sdk::FontHandle<'_>, f32, &str, f32) -> alloc::string::String
pub fn paperpaw_sdk::ui::fit_image(&paperpaw_document::ImageRef, u16, u16) -> (u16, u16)
pub fn paperpaw_sdk::ui::fit_pair(&paperpaw_sdk::FontHandle<'_>, f32, &str, &str, f32, f32) -> (alloc::string::String, alloc::string::String, f32)
pub fn paperpaw_sdk::ui::focus_rect(&paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Rect) -> paperpaw_platform::geometry::Rect
pub fn paperpaw_sdk::ui::has_icon(&paperpaw_sdk::Env<'_>, &str) -> bool
pub fn paperpaw_sdk::ui::has_icons(&paperpaw_sdk::Env<'_>) -> bool
pub fn paperpaw_sdk::ui::heading_height(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::ui::UiStyle) -> u16
pub fn paperpaw_sdk::ui::icon_ink(&paperpaw_sdk::Env<'_>, &str, f32) -> core::option::Option<(i32, i32)>
pub fn paperpaw_sdk::ui::icon_room(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::ui::UiStyle, bool) -> u16
pub fn paperpaw_sdk::ui::icon_width(&paperpaw_sdk::Env<'_>, &str, f32) -> f32
pub fn paperpaw_sdk::ui::list_step(&paperpaw_sdk::Id, isize) -> core::option::Option<isize>
pub fn paperpaw_sdk::ui::next_value(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::SettingSpec, i64) -> core::option::Option<paperpaw_sdk::SettingValue>
pub fn paperpaw_sdk::ui::number_room<'a>(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::ui::UiStyle, impl core::iter::traits::collect::IntoIterator<Item = &'a paperpaw_sdk::SettingSpec>) -> alloc::string::String
pub fn paperpaw_sdk::ui::number_title_area(&paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Rect) -> paperpaw_platform::geometry::Rect
pub fn paperpaw_sdk::ui::opens_screen(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::SettingSpec) -> bool
pub fn paperpaw_sdk::ui::option_name(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::SettingSpec, &str) -> alloc::string::String
pub fn paperpaw_sdk::ui::setting_opens(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::SettingSpec) -> core::option::Option<paperpaw_sdk::Command>
pub fn paperpaw_sdk::ui::setting_row(&paperpaw_sdk::ui::UiStyle, &paperpaw_sdk::SettingSpec, u32, bool) -> u32
pub fn paperpaw_sdk::ui::setting_value(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::SettingSpec) -> alloc::string::String
pub fn paperpaw_sdk::ui::step_focus(usize, isize, usize) -> usize
pub fn paperpaw_sdk::ui::stepper(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Rect, &str) -> core::option::Option<(paperpaw_platform::geometry::Rect, paperpaw_platform::geometry::Rect)>
pub fn paperpaw_sdk::ui::stroke_round(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Rect, u32, paperpaw_platform::pixel::Color)
pub fn paperpaw_sdk::ui::switch_rect(&paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Rect) -> paperpaw_platform::geometry::Rect
pub fn paperpaw_sdk::ui::title_area(&paperpaw_sdk::ui::UiStyle, paperpaw_platform::geometry::Rect) -> paperpaw_platform::geometry::Rect
pub fn paperpaw_sdk::ui::tr_input<'a>(&paperpaw_sdk::Env<'a>, &'a str) -> &'a str
pub fn paperpaw_sdk::ui::two_options(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::SettingSpec) -> bool
pub fn paperpaw_sdk::ui::choice::Picked::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::ui::choice::Picked::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::ui::choice::Choice::dims_below(&self) -> bool
pub fn paperpaw_sdk::ui::choice::Choice::draw(&mut self, &mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>)
pub fn paperpaw_sdk::ui::choice::Choice::grays(&self) -> bool
pub fn paperpaw_sdk::ui::choice::Choice::guards(&self) -> bool
pub fn paperpaw_sdk::ui::choice::Choice::hint(&self, &paperpaw_sdk::Id, &paperpaw_sdk::Env<'_>) -> paperpaw_sdk::Hint
pub fn paperpaw_sdk::ui::choice::Choice::hints(&self) -> core::option::Option<paperpaw_sdk::Hints>
pub fn paperpaw_sdk::ui::choice::Choice::holds_edges(&self) -> bool
pub fn paperpaw_sdk::ui::choice::Choice::mirrored(&self) -> bool
pub fn paperpaw_sdk::ui::choice::Choice::on_action(&mut self, &paperpaw_sdk::Id, &mut paperpaw_sdk::Cx<'_, '_>) -> paperpaw_sdk::Handled
pub fn paperpaw_sdk::ui::choice::Choice::on_close(&mut self, &mut paperpaw_sdk::Cx<'_, '_>)
pub fn paperpaw_sdk::ui::choice::Choice::on_close_request(&mut self, paperpaw_sdk::CloseCause, &mut paperpaw_sdk::Cx<'_, '_>) -> paperpaw_sdk::Handled
pub fn paperpaw_sdk::ui::choice::Choice::on_event(&mut self, &paperpaw_sdk::Id, &paperpaw_sdk::Params, &mut paperpaw_sdk::Cx<'_, '_>)
pub fn paperpaw_sdk::ui::choice::Choice::on_gesture(&mut self, paperpaw_sdk::Gesture, &mut paperpaw_sdk::Cx<'_, '_>) -> paperpaw_sdk::Handled
pub fn paperpaw_sdk::ui::choice::Choice::on_hide(&mut self)
pub fn paperpaw_sdk::ui::choice::Choice::on_pointer(&mut self, &paperpaw_platform::input::PointerEvent, &mut paperpaw_sdk::Cx<'_, '_>) -> paperpaw_sdk::Handled
pub fn paperpaw_sdk::ui::choice::Choice::on_show(&mut self, &mut paperpaw_sdk::Cx<'_, '_>)
pub fn paperpaw_sdk::ui::choice::Choice::on_timer(&mut self, &mut paperpaw_sdk::Cx<'_, '_>)
pub fn paperpaw_sdk::ui::choice::Choice::outside(&self) -> paperpaw_sdk::Outside
pub fn paperpaw_sdk::ui::choice::Choice::passes_through(&self) -> bool
pub fn paperpaw_sdk::ui::choice::Choice::region(&self, &paperpaw_sdk::Env<'_>) -> core::option::Option<paperpaw_platform::geometry::Rect>
pub fn paperpaw_sdk::ui::choice::Choice::secret(&self) -> bool
pub fn paperpaw_sdk::ui::choice::Choice::takes_double_taps(&self) -> bool
pub fn paperpaw_sdk::ui::items::ItemsScreen::dims_below(&self) -> bool
pub fn paperpaw_sdk::ui::items::ItemsScreen::draw(&mut self, &mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>)
pub fn paperpaw_sdk::ui::items::ItemsScreen::grays(&self) -> bool
pub fn paperpaw_sdk::ui::items::ItemsScreen::guards(&self) -> bool
pub fn paperpaw_sdk::ui::items::ItemsScreen::hint(&self, &paperpaw_sdk::Id, &paperpaw_sdk::Env<'_>) -> paperpaw_sdk::Hint
pub fn paperpaw_sdk::ui::items::ItemsScreen::hints(&self) -> core::option::Option<paperpaw_sdk::Hints>
pub fn paperpaw_sdk::ui::items::ItemsScreen::holds_edges(&self) -> bool
pub fn paperpaw_sdk::ui::items::ItemsScreen::mirrored(&self) -> bool
pub fn paperpaw_sdk::ui::items::ItemsScreen::on_action(&mut self, &paperpaw_sdk::Id, &mut paperpaw_sdk::Cx<'_, '_>) -> paperpaw_sdk::Handled
pub fn paperpaw_sdk::ui::items::ItemsScreen::on_close(&mut self, &mut paperpaw_sdk::Cx<'_, '_>)
pub fn paperpaw_sdk::ui::items::ItemsScreen::on_close_request(&mut self, paperpaw_sdk::CloseCause, &mut paperpaw_sdk::Cx<'_, '_>) -> paperpaw_sdk::Handled
pub fn paperpaw_sdk::ui::items::ItemsScreen::on_event(&mut self, &paperpaw_sdk::Id, &paperpaw_sdk::Params, &mut paperpaw_sdk::Cx<'_, '_>)
pub fn paperpaw_sdk::ui::items::ItemsScreen::on_gesture(&mut self, paperpaw_sdk::Gesture, &mut paperpaw_sdk::Cx<'_, '_>) -> paperpaw_sdk::Handled
pub fn paperpaw_sdk::ui::items::ItemsScreen::on_hide(&mut self)
pub fn paperpaw_sdk::ui::items::ItemsScreen::on_pointer(&mut self, &paperpaw_platform::input::PointerEvent, &mut paperpaw_sdk::Cx<'_, '_>) -> paperpaw_sdk::Handled
pub fn paperpaw_sdk::ui::items::ItemsScreen::on_show(&mut self, &mut paperpaw_sdk::Cx<'_, '_>)
pub fn paperpaw_sdk::ui::items::ItemsScreen::on_timer(&mut self, &mut paperpaw_sdk::Cx<'_, '_>)
pub fn paperpaw_sdk::ui::items::ItemsScreen::outside(&self) -> paperpaw_sdk::Outside
pub fn paperpaw_sdk::ui::items::ItemsScreen::passes_through(&self) -> bool
pub fn paperpaw_sdk::ui::items::ItemsScreen::region(&self, &paperpaw_sdk::Env<'_>) -> core::option::Option<paperpaw_platform::geometry::Rect>
pub fn paperpaw_sdk::ui::items::ItemsScreen::secret(&self) -> bool
pub fn paperpaw_sdk::ui::items::ItemsScreen::takes_double_taps(&self) -> bool
```
