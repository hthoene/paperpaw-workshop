```rust
pub mod paperpaw_sdk::widgets::categories
pub const paperpaw_sdk::widgets::categories::ALL: &[&str]
pub const paperpaw_sdk::widgets::categories::BOOKS: &str
pub const paperpaw_sdk::widgets::categories::DEVICE: &str
pub const paperpaw_sdk::widgets::categories::LAYOUT: &str
pub const paperpaw_sdk::widgets::categories::OTHER: &str
pub const paperpaw_sdk::widgets::categories::PERSONAL: &str
pub const paperpaw_sdk::widgets::categories::READING: &str
pub const paperpaw_sdk::widgets::categories::TIME: &str
pub const paperpaw_sdk::widgets::categories::WORDS: &str
pub const paperpaw_sdk::widgets::categories::WORLD: &str
pub mod paperpaw_sdk::widgets::grid
pub paperpaw_sdk::widgets::grid::GridResponse::Button(u16)
pub paperpaw_sdk::widgets::grid::GridResponse::Changed(alloc::vec::Vec<paperpaw_sdk::widgets::grid::Item>)
pub paperpaw_sdk::widgets::grid::GridResponse::Editing(bool)
pub paperpaw_sdk::widgets::grid::GridResponse::Handled
pub paperpaw_sdk::widgets::grid::GridResponse::Ignored
pub fn paperpaw_sdk::widgets::grid::GridResponse::handled(&self) -> paperpaw_sdk::Handled
pub paperpaw_sdk::widgets::grid::What::Tool(paperpaw_sdk::Id)
pub paperpaw_sdk::widgets::grid::What::Widget(alloc::string::String)
pub fn paperpaw_sdk::widgets::grid::What::title(&self, &paperpaw_sdk::Env<'_>) -> alloc::string::String
pub paperpaw_sdk::widgets::grid::Cells::col: u8
pub paperpaw_sdk::widgets::grid::Cells::h: u8
pub paperpaw_sdk::widgets::grid::Cells::row: u8
pub paperpaw_sdk::widgets::grid::Cells::w: u8
pub fn paperpaw_sdk::widgets::grid::Cells::fits(&self, u8, u8) -> bool
pub const fn paperpaw_sdk::widgets::grid::Cells::new(u8, u8, u8, u8) -> Self
pub fn paperpaw_sdk::widgets::grid::Cells::overlaps(&self, &paperpaw_sdk::widgets::grid::Cells) -> bool
pub paperpaw_sdk::widgets::grid::Geometry::area: paperpaw_platform::geometry::Rect
pub paperpaw_sdk::widgets::grid::Geometry::cell_h: u16
pub paperpaw_sdk::widgets::grid::Geometry::cell_w: u16
pub paperpaw_sdk::widgets::grid::Geometry::columns: u8
pub paperpaw_sdk::widgets::grid::Geometry::gap: u16
pub paperpaw_sdk::widgets::grid::Geometry::rows: u8
pub fn paperpaw_sdk::widgets::grid::Geometry::cell_at(&self, i32, i32) -> core::option::Option<(u8, u8)>
pub fn paperpaw_sdk::widgets::grid::Geometry::new(&paperpaw_sdk::Env<'_>, paperpaw_platform::geometry::Rect, u8, u8) -> Self
pub fn paperpaw_sdk::widgets::grid::Geometry::of(paperpaw_platform::geometry::Rect, u8, u8, u16) -> Self
pub fn paperpaw_sdk::widgets::grid::Geometry::rect(&self, paperpaw_sdk::widgets::grid::Cells) -> paperpaw_platform::geometry::Rect
pub fn paperpaw_sdk::widgets::grid::Geometry::size_of(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::widgets::grid::What) -> (u8, u8)
pub fn paperpaw_sdk::widgets::grid::Geometry::default() -> Self
pub struct paperpaw_sdk::widgets::grid::GridView
pub fn paperpaw_sdk::widgets::grid::GridView::asking(&paperpaw_sdk::Env<'_>, paperpaw_sdk::event::Event<paperpaw_sdk::ui::choice::Picked>) -> Self
pub fn paperpaw_sdk::widgets::grid::GridView::draw(&self, &mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>)
pub fn paperpaw_sdk::widgets::grid::GridView::editing(&self) -> bool
pub fn paperpaw_sdk::widgets::grid::GridView::geometry(&self) -> &paperpaw_sdk::widgets::grid::Geometry
pub fn paperpaw_sdk::widgets::grid::GridView::hint(&self, &paperpaw_sdk::Id, &paperpaw_sdk::Env<'_>) -> paperpaw_sdk::Hint
pub fn paperpaw_sdk::widgets::grid::GridView::holds_edges(&self) -> bool
pub fn paperpaw_sdk::widgets::grid::GridView::items(&self) -> alloc::vec::Vec<paperpaw_sdk::widgets::grid::Item>
pub fn paperpaw_sdk::widgets::grid::GridView::layout(&mut self, &paperpaw_sdk::Env<'_>, paperpaw_sdk::widgets::grid::Geometry, &[paperpaw_sdk::widgets::grid::Item], &[(paperpaw_platform::geometry::Rect, u16)])
pub fn paperpaw_sdk::widgets::grid::GridView::new(&paperpaw_sdk::Env<'_>, paperpaw_sdk::Id, paperpaw_sdk::event::Event<paperpaw_sdk::ui::choice::Picked>) -> Self
pub fn paperpaw_sdk::widgets::grid::GridView::on_action(&mut self, &paperpaw_sdk::Id, &mut paperpaw_sdk::Cx<'_, '_>) -> paperpaw_sdk::widgets::grid::GridResponse
pub fn paperpaw_sdk::widgets::grid::GridView::on_event(&mut self, &paperpaw_sdk::Id, &paperpaw_sdk::Params, &mut paperpaw_sdk::Cx<'_, '_>) -> paperpaw_sdk::widgets::grid::GridResponse
pub fn paperpaw_sdk::widgets::grid::GridView::on_gesture(&mut self, paperpaw_sdk::Gesture, &mut paperpaw_sdk::Cx<'_, '_>) -> paperpaw_sdk::widgets::grid::GridResponse
pub fn paperpaw_sdk::widgets::grid::GridView::on_pointer(&mut self, &paperpaw_platform::input::PointerEvent, &mut paperpaw_sdk::Cx<'_, '_>) -> paperpaw_sdk::widgets::grid::GridResponse
pub fn paperpaw_sdk::widgets::grid::GridView::release(&mut self)
pub fn paperpaw_sdk::widgets::grid::GridView::reset_focus(&mut self)
pub fn paperpaw_sdk::widgets::grid::GridView::set_editing(&mut self, bool)
pub fn paperpaw_sdk::widgets::grid::GridView::set_focus_shown(&mut self, bool)
pub fn paperpaw_sdk::widgets::grid::GridView::set_tool_labels(&mut self, bool)
pub fn paperpaw_sdk::widgets::grid::GridView::update_live(&mut self, &paperpaw_sdk::Env<'_>, &mut paperpaw_sdk::Cx<'_, '_>) -> bool
pub fn paperpaw_sdk::widgets::grid::GridView::update_widget(&mut self, &str, &paperpaw_sdk::Env<'_>, &mut paperpaw_sdk::Cx<'_, '_>) -> bool
pub fn paperpaw_sdk::widgets::grid::GridView::update_widgets(&mut self, &paperpaw_sdk::Env<'_>, &mut paperpaw_sdk::Cx<'_, '_>) -> bool
pub paperpaw_sdk::widgets::grid::Item::at: core::option::Option<paperpaw_sdk::widgets::grid::Cells>
pub paperpaw_sdk::widgets::grid::Item::what: paperpaw_sdk::widgets::grid::What
pub fn paperpaw_sdk::widgets::grid::Item::new(paperpaw_sdk::widgets::grid::What) -> Self
pub fn paperpaw_sdk::widgets::grid::Item::placed(paperpaw_sdk::widgets::grid::What, paperpaw_sdk::widgets::grid::Cells) -> Self
pub const paperpaw_sdk::widgets::grid::MAX_COLUMNS: u8
pub const paperpaw_sdk::widgets::grid::MAX_ROWS: u8
pub fn paperpaw_sdk::widgets::grid::add(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::widgets::grid::Geometry, &[paperpaw_sdk::widgets::grid::Item], paperpaw_sdk::widgets::grid::What) -> core::option::Option<alloc::vec::Vec<paperpaw_sdk::widgets::grid::Item>>
pub fn paperpaw_sdk::widgets::grid::dragged(&paperpaw_sdk::widgets::grid::Geometry, paperpaw_sdk::widgets::grid::Cells, paperpaw_platform::geometry::Point, paperpaw_platform::geometry::Point, bool) -> core::option::Option<paperpaw_sdk::widgets::grid::Cells>
pub fn paperpaw_sdk::widgets::grid::draw_tool(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, paperpaw_platform::geometry::Rect, &paperpaw_sdk::Id, bool)
pub fn paperpaw_sdk::widgets::grid::free_place(&paperpaw_sdk::widgets::grid::Geometry, &[paperpaw_sdk::widgets::grid::Cells], u8, u8) -> core::option::Option<paperpaw_sdk::widgets::grid::Cells>
pub fn paperpaw_sdk::widgets::grid::parse(&str) -> alloc::vec::Vec<paperpaw_sdk::widgets::grid::Item>
pub fn paperpaw_sdk::widgets::grid::place(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::widgets::grid::Geometry, &[paperpaw_sdk::widgets::grid::Item]) -> alloc::vec::Vec<(paperpaw_sdk::widgets::grid::Item, paperpaw_sdk::widgets::grid::Cells)>
pub fn paperpaw_sdk::widgets::grid::write(&[paperpaw_sdk::widgets::grid::Item]) -> alloc::string::String
pub mod paperpaw_sdk::widgets::look
pub paperpaw_sdk::widgets::look::Frame::Card
pub paperpaw_sdk::widgets::look::Frame::Dark
pub paperpaw_sdk::widgets::look::Frame::Line
pub paperpaw_sdk::widgets::look::Frame::None
pub fn paperpaw_sdk::widgets::look::Frame::of(&str) -> Self
pub const fn paperpaw_sdk::widgets::look::Frame::value(self) -> &'static str
pub enum paperpaw_sdk::widgets::look::Padding
pub paperpaw_sdk::widgets::look::Padding::Auto
pub paperpaw_sdk::widgets::look::Padding::Large
pub paperpaw_sdk::widgets::look::Padding::None
pub paperpaw_sdk::widgets::look::Padding::Normal
pub paperpaw_sdk::widgets::look::Padding::Small
pub fn paperpaw_sdk::widgets::look::Padding::of(&str) -> Self
pub fn paperpaw_sdk::widgets::look::Padding::pixels(self, &paperpaw_sdk::ui::UiStyle, paperpaw_sdk::widgets::look::Frame) -> u16
pub const fn paperpaw_sdk::widgets::look::Padding::value(self) -> &'static str
pub paperpaw_sdk::widgets::look::Size::Fit
pub paperpaw_sdk::widgets::look::Size::Large
pub paperpaw_sdk::widgets::look::Size::Medium
pub paperpaw_sdk::widgets::look::Size::Small
pub fn paperpaw_sdk::widgets::look::Size::of(&str) -> Self
pub fn paperpaw_sdk::widgets::look::Size::text(self, &paperpaw_sdk::ui::UiStyle) -> f32
pub const fn paperpaw_sdk::widgets::look::Size::value(self) -> &'static str
pub paperpaw_sdk::widgets::look::Look::area: paperpaw_platform::geometry::Rect
pub paperpaw_sdk::widgets::look::Look::faint: paperpaw_platform::pixel::Color
pub paperpaw_sdk::widgets::look::Look::frame: paperpaw_sdk::widgets::look::Frame
pub paperpaw_sdk::widgets::look::Look::ink: paperpaw_platform::pixel::Color
pub paperpaw_sdk::widgets::look::Look::paper: paperpaw_platform::pixel::Color
pub fn paperpaw_sdk::widgets::look::Look::new(paperpaw_platform::geometry::Rect, paperpaw_platform::pixel::Color, paperpaw_platform::pixel::Color, paperpaw_platform::pixel::Color, paperpaw_sdk::widgets::look::Frame) -> Self
pub fn paperpaw_sdk::widgets::look::Look::within(self, paperpaw_platform::geometry::Rect) -> Self
pub struct paperpaw_sdk::widgets::look::Wrapped
pub fn paperpaw_sdk::widgets::look::Wrapped::draw(&self, &mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, paperpaw_platform::geometry::Rect, paperpaw_sdk::widgets::Align, paperpaw_platform::pixel::Color) -> u16
pub fn paperpaw_sdk::widgets::look::Wrapped::fitting(&paperpaw_sdk::Env<'_>, &str, f32, f32, u16, u16) -> Self
pub fn paperpaw_sdk::widgets::look::Wrapped::height(&self, &paperpaw_sdk::Env<'_>) -> u16
pub fn paperpaw_sdk::widgets::look::Wrapped::lines(&self) -> &[alloc::string::String]
pub fn paperpaw_sdk::widgets::look::Wrapped::new(&paperpaw_sdk::Env<'_>, &str, f32, u16, u16) -> Self
pub fn paperpaw_sdk::widgets::look::Wrapped::size(&self) -> f32
pub fn paperpaw_sdk::widgets::look::Wrapped::whole(&self) -> bool
pub const paperpaw_sdk::widgets::look::FRAMES: &[&str]
pub const paperpaw_sdk::widgets::look::PADDINGS: &[&str]
pub const paperpaw_sdk::widgets::look::SIZES: &[&str]
pub fn paperpaw_sdk::widgets::look::caption_height(&paperpaw_sdk::Env<'_>) -> u16
pub fn paperpaw_sdk::widgets::look::choice(&paperpaw_sdk::Id, &str, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, &'static [&'static str], &'static str) -> paperpaw_sdk::SettingSpec
pub fn paperpaw_sdk::widgets::look::draw_caption(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &str, &paperpaw_sdk::widgets::look::Look, &str) -> paperpaw_platform::geometry::Rect
pub fn paperpaw_sdk::widgets::look::draw_frame(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &str, paperpaw_platform::geometry::Rect) -> paperpaw_sdk::widgets::look::Look
pub fn paperpaw_sdk::widgets::look::draw_line(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, paperpaw_platform::geometry::Rect, paperpaw_sdk::widgets::Align, f32, f32, &str, paperpaw_platform::pixel::Color) -> f32
pub fn paperpaw_sdk::widgets::look::draw_message(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::widgets::look::Look, &str)
pub fn paperpaw_sdk::widgets::look::draw_wrapped(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, paperpaw_platform::geometry::Rect, paperpaw_sdk::widgets::Align, f32, &str, paperpaw_platform::pixel::Color) -> u16
pub fn paperpaw_sdk::widgets::look::fit_line(&paperpaw_sdk::FontHandle<'_>, f32, f32, &str, f32) -> (f32, alloc::string::String)
pub fn paperpaw_sdk::widgets::look::frame(&paperpaw_sdk::Env<'_>, &str) -> paperpaw_sdk::widgets::look::Frame
pub fn paperpaw_sdk::widgets::look::frame_setting(&paperpaw_sdk::Id, paperpaw_sdk::widgets::look::Frame) -> paperpaw_sdk::SettingSpec
pub const fn paperpaw_sdk::widgets::look::frame_spec(&'static str, paperpaw_sdk::Id, paperpaw_sdk::widgets::look::Frame) -> paperpaw_sdk::SettingSpec
pub fn paperpaw_sdk::widgets::look::ink_baseline(&paperpaw_sdk::FontHandle<'_>, f32, &str, paperpaw_platform::geometry::Rect) -> i32
pub fn paperpaw_sdk::widgets::look::largest_size(f32, f32, impl core::ops::function::FnMut(f32) -> bool) -> core::option::Option<f32>
pub fn paperpaw_sdk::widgets::look::line_height(&paperpaw_sdk::Env<'_>, f32) -> u16
pub fn paperpaw_sdk::widgets::look::look(&paperpaw_sdk::Env<'_>, &str, paperpaw_platform::geometry::Rect) -> paperpaw_sdk::widgets::look::Look
pub fn paperpaw_sdk::widgets::look::padding(&paperpaw_sdk::Env<'_>, &str) -> paperpaw_sdk::widgets::look::Padding
pub fn paperpaw_sdk::widgets::look::padding_setting(&paperpaw_sdk::Id, paperpaw_sdk::widgets::look::Padding) -> paperpaw_sdk::SettingSpec
pub const fn paperpaw_sdk::widgets::look::padding_spec(&'static str, paperpaw_sdk::Id, paperpaw_sdk::widgets::look::Padding) -> paperpaw_sdk::SettingSpec
pub fn paperpaw_sdk::widgets::look::part_setting(&paperpaw_sdk::Id, &str, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, bool) -> paperpaw_sdk::SettingSpec
pub const fn paperpaw_sdk::widgets::look::part_spec(&'static str, paperpaw_sdk::Id, &'static str, bool) -> paperpaw_sdk::SettingSpec
pub fn paperpaw_sdk::widgets::look::setting_id(&paperpaw_sdk::Id, &str) -> paperpaw_sdk::Id
pub fn paperpaw_sdk::widgets::look::shows(&paperpaw_sdk::Env<'_>, &str, &str) -> bool
pub fn paperpaw_sdk::widgets::look::size(&paperpaw_sdk::Env<'_>, &str) -> paperpaw_sdk::widgets::look::Size
pub fn paperpaw_sdk::widgets::look::size_setting(&paperpaw_sdk::Id, paperpaw_sdk::widgets::look::Size, bool) -> paperpaw_sdk::SettingSpec
pub const fn paperpaw_sdk::widgets::look::size_spec(&'static str, paperpaw_sdk::Id, paperpaw_sdk::widgets::look::Size, bool) -> paperpaw_sdk::SettingSpec
pub paperpaw_sdk::widgets::Align::Center
pub paperpaw_sdk::widgets::Align::Left
pub paperpaw_sdk::widgets::Align::Right
pub fn paperpaw_sdk::widgets::Align::of(&str) -> Self
pub const fn paperpaw_sdk::widgets::Align::value(self) -> &'static str
pub fn paperpaw_sdk::widgets::Align::x(self, paperpaw_platform::geometry::Rect, f32) -> f32
pub paperpaw_sdk::widgets::Frame::Card
pub paperpaw_sdk::widgets::Frame::Dark
pub paperpaw_sdk::widgets::Frame::Line
pub paperpaw_sdk::widgets::Frame::None
pub fn paperpaw_sdk::widgets::look::Frame::of(&str) -> Self
pub const fn paperpaw_sdk::widgets::look::Frame::value(self) -> &'static str
pub enum paperpaw_sdk::widgets::Padding
pub paperpaw_sdk::widgets::Padding::Auto
pub paperpaw_sdk::widgets::Padding::Large
pub paperpaw_sdk::widgets::Padding::None
pub paperpaw_sdk::widgets::Padding::Normal
pub paperpaw_sdk::widgets::Padding::Small
pub fn paperpaw_sdk::widgets::look::Padding::of(&str) -> Self
pub fn paperpaw_sdk::widgets::look::Padding::pixels(self, &paperpaw_sdk::ui::UiStyle, paperpaw_sdk::widgets::look::Frame) -> u16
pub const fn paperpaw_sdk::widgets::look::Padding::value(self) -> &'static str
pub paperpaw_sdk::widgets::Size::Fit
pub paperpaw_sdk::widgets::Size::Large
pub paperpaw_sdk::widgets::Size::Medium
pub paperpaw_sdk::widgets::Size::Small
pub fn paperpaw_sdk::widgets::look::Size::of(&str) -> Self
pub fn paperpaw_sdk::widgets::look::Size::text(self, &paperpaw_sdk::ui::UiStyle) -> f32
pub const fn paperpaw_sdk::widgets::look::Size::value(self) -> &'static str
pub paperpaw_sdk::widgets::Drawn::draw: fn(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, paperpaw_platform::geometry::Rect)
pub paperpaw_sdk::widgets::Drawn::height: fn(&paperpaw_sdk::Env<'_>, u16) -> u16
pub paperpaw_sdk::widgets::Drawn::shows: core::option::Option<fn(&paperpaw_sdk::Env<'_>) -> alloc::string::String>
pub paperpaw_sdk::widgets::Drawn::targets: core::option::Option<fn(&paperpaw_sdk::Env<'_>, paperpaw_platform::geometry::Rect) -> alloc::vec::Vec<paperpaw_sdk::widgets::WidgetTarget>>
pub fn paperpaw_sdk::widgets::Drawn::new(fn(&paperpaw_sdk::Env<'_>, u16) -> u16, fn(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, paperpaw_platform::geometry::Rect)) -> Self
pub fn paperpaw_sdk::widgets::Drawn::shows(self, fn(&paperpaw_sdk::Env<'_>) -> alloc::string::String) -> Self
pub fn paperpaw_sdk::widgets::Drawn::targets(self, fn(&paperpaw_sdk::Env<'_>, paperpaw_platform::geometry::Rect) -> alloc::vec::Vec<paperpaw_sdk::widgets::WidgetTarget>) -> Self
pub fn paperpaw_sdk::widgets::Drawn::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub paperpaw_sdk::widgets::Look::area: paperpaw_platform::geometry::Rect
pub paperpaw_sdk::widgets::Look::faint: paperpaw_platform::pixel::Color
pub paperpaw_sdk::widgets::Look::frame: paperpaw_sdk::widgets::look::Frame
pub paperpaw_sdk::widgets::Look::ink: paperpaw_platform::pixel::Color
pub paperpaw_sdk::widgets::Look::paper: paperpaw_platform::pixel::Color
pub fn paperpaw_sdk::widgets::look::Look::new(paperpaw_platform::geometry::Rect, paperpaw_platform::pixel::Color, paperpaw_platform::pixel::Color, paperpaw_platform::pixel::Color, paperpaw_sdk::widgets::look::Frame) -> Self
pub fn paperpaw_sdk::widgets::look::Look::within(self, paperpaw_platform::geometry::Rect) -> Self
pub paperpaw_sdk::widgets::WidgetSpec::category: alloc::borrow::Cow<'static, str>
pub paperpaw_sdk::widgets::WidgetSpec::factory: paperpaw_sdk::widgets::WidgetFactory
pub paperpaw_sdk::widgets::WidgetSpec::id: paperpaw_sdk::Id
pub paperpaw_sdk::widgets::WidgetSpec::previews: core::option::Option<paperpaw_sdk::Id>
pub paperpaw_sdk::widgets::WidgetSpec::title: alloc::borrow::Cow<'static, str>
pub fn paperpaw_sdk::widgets::WidgetSpec::category(self, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> Self
pub fn paperpaw_sdk::widgets::WidgetSpec::drawn(paperpaw_sdk::Id, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, paperpaw_sdk::widgets::Drawn) -> Self
pub fn paperpaw_sdk::widgets::WidgetSpec::new(paperpaw_sdk::Id, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, impl core::ops::function::Fn(&paperpaw_sdk::Env<'_>) -> alloc::boxed::Box<dyn paperpaw_sdk::widgets::Widget> + 'static) -> Self
pub fn paperpaw_sdk::widgets::WidgetSpec::previews(self, paperpaw_sdk::Id) -> Self
pub fn paperpaw_sdk::widgets::WidgetSpec::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub paperpaw_sdk::widgets::WidgetTarget::area: paperpaw_platform::geometry::Rect
pub paperpaw_sdk::widgets::WidgetTarget::command: paperpaw_sdk::Command
pub paperpaw_sdk::widgets::WidgetTarget::touch: bool
pub fn paperpaw_sdk::widgets::WidgetTarget::new(paperpaw_platform::geometry::Rect, paperpaw_sdk::Command) -> Self
pub fn paperpaw_sdk::widgets::WidgetTarget::touch(paperpaw_platform::geometry::Rect, paperpaw_sdk::Command) -> Self
pub struct paperpaw_sdk::widgets::Widgets
pub fn paperpaw_sdk::widgets::Widgets::category(&self, &str) -> core::option::Option<&str>
pub fn paperpaw_sdk::widgets::Widgets::has(&self, &str) -> bool
pub fn paperpaw_sdk::widgets::Widgets::iter(&self) -> impl core::iter::traits::iterator::Iterator<Item = (&paperpaw_sdk::Id, &str)>
pub fn paperpaw_sdk::widgets::Widgets::make(&self, &str, &paperpaw_sdk::Env<'_>) -> core::option::Option<alloc::boxed::Box<dyn paperpaw_sdk::widgets::Widget>>
pub fn paperpaw_sdk::widgets::Widgets::new() -> Self
pub fn paperpaw_sdk::widgets::Widgets::preview(&self, &str) -> core::option::Option<&paperpaw_sdk::Id>
pub fn paperpaw_sdk::widgets::Widgets::title(&self, &str) -> core::option::Option<&str>
pub struct paperpaw_sdk::widgets::Wrapped
pub fn paperpaw_sdk::widgets::look::Wrapped::draw(&self, &mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, paperpaw_platform::geometry::Rect, paperpaw_sdk::widgets::Align, paperpaw_platform::pixel::Color) -> u16
pub fn paperpaw_sdk::widgets::look::Wrapped::fitting(&paperpaw_sdk::Env<'_>, &str, f32, f32, u16, u16) -> Self
pub fn paperpaw_sdk::widgets::look::Wrapped::height(&self, &paperpaw_sdk::Env<'_>) -> u16
pub fn paperpaw_sdk::widgets::look::Wrapped::lines(&self) -> &[alloc::string::String]
pub fn paperpaw_sdk::widgets::look::Wrapped::new(&paperpaw_sdk::Env<'_>, &str, f32, u16, u16) -> Self
pub fn paperpaw_sdk::widgets::look::Wrapped::size(&self) -> f32
pub fn paperpaw_sdk::widgets::look::Wrapped::whole(&self) -> bool
pub const paperpaw_sdk::widgets::ALIGNMENTS: &[&str]
pub const paperpaw_sdk::widgets::FILL: &str
pub const paperpaw_sdk::widgets::SPACE: &str
pub const paperpaw_sdk::widgets::SPACE_SIZE: paperpaw_sdk::setting::Setting<paperpaw_sdk::setting::Text>
pub const paperpaw_sdk::widgets::SPACE_SIZES: &[&str]
pub trait paperpaw_sdk::widgets::Widget
pub fn paperpaw_sdk::widgets::Widget::draw(&self, &mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, paperpaw_platform::geometry::Rect)
pub fn paperpaw_sdk::widgets::Widget::height(&self, &paperpaw_sdk::Env<'_>, u16) -> u16
pub fn paperpaw_sdk::widgets::Widget::live(&self) -> bool
pub fn paperpaw_sdk::widgets::Widget::min_height(&self, &paperpaw_sdk::Env<'_>, u16) -> u16
pub fn paperpaw_sdk::widgets::Widget::place(&mut self, &paperpaw_sdk::Env<'_>, paperpaw_platform::geometry::Rect)
pub fn paperpaw_sdk::widgets::Widget::targets(&self, &paperpaw_sdk::Env<'_>, paperpaw_platform::geometry::Rect) -> alloc::vec::Vec<paperpaw_sdk::widgets::WidgetTarget>
pub fn paperpaw_sdk::widgets::Widget::update(&mut self, &paperpaw_sdk::Env<'_>) -> bool
pub fn paperpaw_sdk::widgets::align(&paperpaw_sdk::Env<'_>, &str) -> paperpaw_sdk::widgets::Align
pub fn paperpaw_sdk::widgets::align_setting(&paperpaw_sdk::Id, paperpaw_sdk::widgets::Align) -> paperpaw_sdk::SettingSpec
pub const fn paperpaw_sdk::widgets::align_spec(&'static str, paperpaw_sdk::Id, paperpaw_sdk::widgets::Align) -> paperpaw_sdk::SettingSpec
pub fn paperpaw_sdk::widgets::base(&str) -> &str
pub fn paperpaw_sdk::widgets::caption_height(&paperpaw_sdk::Env<'_>) -> u16
pub fn paperpaw_sdk::widgets::changed(&paperpaw_sdk::Id) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::widgets::choice(&paperpaw_sdk::Id, &str, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, &'static [&'static str], &'static str) -> paperpaw_sdk::SettingSpec
pub fn paperpaw_sdk::widgets::draw_caption(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &str, &paperpaw_sdk::widgets::look::Look, &str) -> paperpaw_platform::geometry::Rect
pub fn paperpaw_sdk::widgets::draw_frame(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &str, paperpaw_platform::geometry::Rect) -> paperpaw_sdk::widgets::look::Look
pub fn paperpaw_sdk::widgets::draw_line(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, paperpaw_platform::geometry::Rect, paperpaw_sdk::widgets::Align, f32, f32, &str, paperpaw_platform::pixel::Color) -> f32
pub fn paperpaw_sdk::widgets::draw_message(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::widgets::look::Look, &str)
pub fn paperpaw_sdk::widgets::draw_wrapped(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, paperpaw_platform::geometry::Rect, paperpaw_sdk::widgets::Align, f32, &str, paperpaw_platform::pixel::Color) -> u16
pub fn paperpaw_sdk::widgets::fill_height(u32, u32, usize) -> u16
pub fn paperpaw_sdk::widgets::fit_line(&paperpaw_sdk::FontHandle<'_>, f32, f32, &str, f32) -> (f32, alloc::string::String)
pub fn paperpaw_sdk::widgets::frame(&paperpaw_sdk::Env<'_>, &str) -> paperpaw_sdk::widgets::look::Frame
pub fn paperpaw_sdk::widgets::frame_setting(&paperpaw_sdk::Id, paperpaw_sdk::widgets::look::Frame) -> paperpaw_sdk::SettingSpec
pub const fn paperpaw_sdk::widgets::frame_spec(&'static str, paperpaw_sdk::Id, paperpaw_sdk::widgets::look::Frame) -> paperpaw_sdk::SettingSpec
pub fn paperpaw_sdk::widgets::has_settings(&paperpaw_sdk::Env<'_>, &str) -> bool
pub fn paperpaw_sdk::widgets::ink_baseline(&paperpaw_sdk::FontHandle<'_>, f32, &str, paperpaw_platform::geometry::Rect) -> i32
pub fn paperpaw_sdk::widgets::largest_size(f32, f32, impl core::ops::function::FnMut(f32) -> bool) -> core::option::Option<f32>
pub fn paperpaw_sdk::widgets::line_height(&paperpaw_sdk::Env<'_>, f32) -> u16
pub fn paperpaw_sdk::widgets::padding(&paperpaw_sdk::Env<'_>, &str) -> paperpaw_sdk::widgets::look::Padding
pub fn paperpaw_sdk::widgets::padding_setting(&paperpaw_sdk::Id, paperpaw_sdk::widgets::look::Padding) -> paperpaw_sdk::SettingSpec
pub const fn paperpaw_sdk::widgets::padding_spec(&'static str, paperpaw_sdk::Id, paperpaw_sdk::widgets::look::Padding) -> paperpaw_sdk::SettingSpec
pub fn paperpaw_sdk::widgets::part_setting(&paperpaw_sdk::Id, &str, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, bool) -> paperpaw_sdk::SettingSpec
pub const fn paperpaw_sdk::widgets::part_spec(&'static str, paperpaw_sdk::Id, &'static str, bool) -> paperpaw_sdk::SettingSpec
pub fn paperpaw_sdk::widgets::repeatable(&str) -> bool
pub fn paperpaw_sdk::widgets::setting_id(&paperpaw_sdk::Id, &str) -> paperpaw_sdk::Id
pub fn paperpaw_sdk::widgets::settings_group(&paperpaw_sdk::Id, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> paperpaw_sdk::SettingGroupSpec
pub fn paperpaw_sdk::widgets::shows(&paperpaw_sdk::Env<'_>, &str, &str) -> bool
pub fn paperpaw_sdk::widgets::size(&paperpaw_sdk::Env<'_>, &str) -> paperpaw_sdk::widgets::look::Size
pub fn paperpaw_sdk::widgets::size_setting(&paperpaw_sdk::Id, paperpaw_sdk::widgets::look::Size, bool) -> paperpaw_sdk::SettingSpec
pub const fn paperpaw_sdk::widgets::size_spec(&'static str, paperpaw_sdk::Id, paperpaw_sdk::widgets::look::Size, bool) -> paperpaw_sdk::SettingSpec
pub type paperpaw_sdk::widgets::WidgetFactory = alloc::boxed::Box<dyn core::ops::function::Fn(&paperpaw_sdk::Env<'_>) -> alloc::boxed::Box<dyn paperpaw_sdk::widgets::Widget>>
```
