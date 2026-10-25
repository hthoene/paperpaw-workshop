```rust
pub struct paperpaw_sdk::layers::LayerItem
pub paperpaw_sdk::layers::LayerItem::area: paperpaw_platform::geometry::Rect
pub paperpaw_sdk::layers::LayerItem::id: u32
pub paperpaw_sdk::layers::LayerItem::label: alloc::string::String
pub fn paperpaw_sdk::layers::LayerItem::label(self, impl core::convert::Into<alloc::string::String>) -> Self
pub fn paperpaw_sdk::layers::LayerItem::new(u32, paperpaw_platform::geometry::Rect) -> Self
pub struct paperpaw_sdk::layers::LineBox
pub paperpaw_sdk::layers::LineBox::area: paperpaw_platform::geometry::Rect
pub paperpaw_sdk::layers::LineBox::end: paperpaw_document::Locator
pub paperpaw_sdk::layers::LineBox::leading: u16
pub paperpaw_sdk::layers::LineBox::start: paperpaw_document::Locator
pub fn paperpaw_sdk::layers::LineBox::leading(self, u16) -> Self
pub fn paperpaw_sdk::layers::LineBox::new(paperpaw_platform::geometry::Rect, paperpaw_document::Locator, paperpaw_document::Locator) -> Self
pub struct paperpaw_sdk::layers::PageFrameSpec
pub paperpaw_sdk::layers::PageFrameSpec::columns: paperpaw_sdk::layers::ColumnsFn
pub paperpaw_sdk::layers::PageFrameSpec::id: paperpaw_sdk::Id
pub fn paperpaw_sdk::layers::PageFrameSpec::columns(paperpaw_sdk::Id, u16, u16) -> Self
pub fn paperpaw_sdk::layers::PageFrameSpec::new(paperpaw_sdk::Id, impl core::ops::function::Fn(&paperpaw_sdk::Env<'_>, paperpaw_platform::geometry::Rect) -> alloc::vec::Vec<paperpaw_platform::geometry::Rect> + 'static) -> Self
pub fn paperpaw_sdk::layers::PageFrameSpec::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::layers::PageLayerSpec
pub paperpaw_sdk::layers::PageLayerSpec::draw: paperpaw_sdk::layers::DrawLayerFn
pub paperpaw_sdk::layers::PageLayerSpec::id: paperpaw_sdk::Id
pub paperpaw_sdk::layers::PageLayerSpec::items: core::option::Option<paperpaw_sdk::layers::ItemsFn>
pub paperpaw_sdk::layers::PageLayerSpec::order: i16
pub paperpaw_sdk::layers::PageLayerSpec::reserve: core::option::Option<paperpaw_sdk::layers::ReserveFn>
pub paperpaw_sdk::layers::PageLayerSpec::switch: core::option::Option<paperpaw_sdk::Id>
pub paperpaw_sdk::layers::PageLayerSpec::taps: bool
pub paperpaw_sdk::layers::PageLayerSpec::title: alloc::borrow::Cow<'static, str>
pub paperpaw_sdk::layers::PageLayerSpec::words: bool
pub fn paperpaw_sdk::layers::PageLayerSpec::items(self, impl core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::layers::PageView<'_>) -> alloc::vec::Vec<paperpaw_sdk::layers::LayerItem> + 'static) -> Self
pub fn paperpaw_sdk::layers::PageLayerSpec::new(paperpaw_sdk::Id, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, impl core::ops::function::Fn(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::layers::PageView<'_>) + 'static) -> Self
pub fn paperpaw_sdk::layers::PageLayerSpec::order(self, i16) -> Self
pub fn paperpaw_sdk::layers::PageLayerSpec::reserve(self, impl core::ops::function::Fn(&paperpaw_sdk::Env<'_>) -> core::option::Option<(paperpaw_sdk::layers::Side, u16)> + 'static) -> Self
pub fn paperpaw_sdk::layers::PageLayerSpec::switch(self, &paperpaw_sdk::setting::Setting<bool>) -> Self
pub fn paperpaw_sdk::layers::PageLayerSpec::taps(self) -> Self
pub fn paperpaw_sdk::layers::PageLayerSpec::words(self) -> Self
pub fn paperpaw_sdk::layers::PageLayerSpec::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::layers::PageLayers
pub fn paperpaw_sdk::layers::PageLayers::columns(&self, &paperpaw_sdk::Env<'_>, paperpaw_platform::geometry::Rect) -> alloc::vec::Vec<paperpaw_platform::geometry::Rect>
pub fn paperpaw_sdk::layers::PageLayers::draw(&self, &mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::layers::PageView<'_>, &[(paperpaw_sdk::Id, paperpaw_platform::geometry::Rect)], bool)
pub fn paperpaw_sdk::layers::PageLayers::frames(&self) -> impl core::iter::traits::iterator::Iterator<Item = &paperpaw_sdk::Id>
pub fn paperpaw_sdk::layers::PageLayers::get(&self, &paperpaw_sdk::Id) -> core::option::Option<&paperpaw_sdk::layers::PageLayerSpec>
pub fn paperpaw_sdk::layers::PageLayers::get_by_switch(&self, &str) -> core::option::Option<&paperpaw_sdk::layers::PageLayerSpec>
pub fn paperpaw_sdk::layers::PageLayers::has_frames(&self) -> bool
pub fn paperpaw_sdk::layers::PageLayers::is_empty(&self) -> bool
pub fn paperpaw_sdk::layers::PageLayers::is_idle(&self) -> bool
pub fn paperpaw_sdk::layers::PageLayers::item_at(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::layers::PageView<'_>, paperpaw_platform::geometry::Point) -> core::option::Option<(paperpaw_sdk::Id, paperpaw_sdk::layers::LayerItem)>
pub fn paperpaw_sdk::layers::PageLayers::items(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::layers::PageView<'_>) -> alloc::vec::Vec<(paperpaw_sdk::Id, paperpaw_sdk::layers::LayerItem)>
pub fn paperpaw_sdk::layers::PageLayers::key(&self, &paperpaw_sdk::Env<'_>, paperpaw_platform::geometry::Rect) -> alloc::string::String
pub fn paperpaw_sdk::layers::PageLayers::on<'s>(&'s self, &'s paperpaw_sdk::Env<'_>) -> impl core::iter::traits::iterator::Iterator<Item = &'s paperpaw_sdk::layers::PageLayerSpec>
pub fn paperpaw_sdk::layers::PageLayers::rooms(&self, &paperpaw_sdk::Env<'_>, paperpaw_platform::geometry::Rect) -> (alloc::vec::Vec<(paperpaw_sdk::Id, paperpaw_platform::geometry::Rect)>, paperpaw_platform::geometry::Rect)
pub fn paperpaw_sdk::layers::PageLayers::tapped<'s>(&'s self, &paperpaw_sdk::Env<'_>, &[(paperpaw_sdk::Id, paperpaw_platform::geometry::Rect)], i32, i32) -> core::option::Option<&'s paperpaw_sdk::Id>
pub fn paperpaw_sdk::layers::PageLayers::want_words(&self, &paperpaw_sdk::Env<'_>) -> bool
pub enum paperpaw_sdk::layers::Side
pub paperpaw_sdk::layers::Side::Bottom
pub paperpaw_sdk::layers::Side::Left
pub paperpaw_sdk::layers::Side::Right
pub paperpaw_sdk::layers::Side::Top
pub type paperpaw_sdk::layers::ColumnsFn = alloc::boxed::Box<dyn core::ops::function::Fn(&paperpaw_sdk::Env<'_>, paperpaw_platform::geometry::Rect) -> alloc::vec::Vec<paperpaw_platform::geometry::Rect>>
pub type paperpaw_sdk::layers::DrawLayerFn = alloc::boxed::Box<dyn core::ops::function::Fn(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::layers::PageView<'_>)>
pub type paperpaw_sdk::layers::ItemsFn = alloc::boxed::Box<dyn core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::layers::PageView<'_>) -> alloc::vec::Vec<paperpaw_sdk::layers::LayerItem>>
pub type paperpaw_sdk::layers::ReserveFn = alloc::boxed::Box<dyn core::ops::function::Fn(&paperpaw_sdk::Env<'_>) -> core::option::Option<(paperpaw_sdk::layers::Side, u16)>>
pub struct paperpaw_sdk::layers::PageView<'a>
pub fn paperpaw_sdk::layers::PageView<'a>::columns(self, &'a [paperpaw_platform::geometry::Rect]) -> Self
pub fn paperpaw_sdk::layers::PageView<'a>::language(self, &'a str) -> Self
pub fn paperpaw_sdk::layers::PageView<'a>::line_at(&self, paperpaw_platform::geometry::Point) -> core::option::Option<&paperpaw_sdk::layers::LineBox>
pub fn paperpaw_sdk::layers::PageView<'a>::lines(self, &'a [paperpaw_sdk::layers::LineBox]) -> Self
pub fn paperpaw_sdk::layers::PageView<'a>::new(&'a str, paperpaw_document::Locator, paperpaw_document::Locator, paperpaw_platform::geometry::Rect) -> Self
pub fn paperpaw_sdk::layers::PageView<'a>::room(self, core::option::Option<paperpaw_platform::geometry::Rect>) -> Self
pub fn paperpaw_sdk::layers::PageView<'a>::status(self, core::option::Option<paperpaw_platform::geometry::Rect>, core::option::Option<paperpaw_platform::geometry::Rect>) -> Self
pub fn paperpaw_sdk::layers::PageView<'a>::words(self, &'a [paperpaw_sdk::reading::WordBox]) -> Self
pub paperpaw_sdk::layers::PageView::bottom_status: core::option::Option<paperpaw_platform::geometry::Rect>
pub paperpaw_sdk::layers::PageView::columns: &'a [paperpaw_platform::geometry::Rect]
pub paperpaw_sdk::layers::PageView::content: paperpaw_platform::geometry::Rect
pub paperpaw_sdk::layers::PageView::end: paperpaw_document::Locator
pub paperpaw_sdk::layers::PageView::language: &'a str
pub paperpaw_sdk::layers::PageView::lines: &'a [paperpaw_sdk::layers::LineBox]
pub paperpaw_sdk::layers::PageView::path: &'a str
pub paperpaw_sdk::layers::PageView::room: core::option::Option<paperpaw_platform::geometry::Rect>
pub paperpaw_sdk::layers::PageView::start: paperpaw_document::Locator
pub paperpaw_sdk::layers::PageView::top_status: core::option::Option<paperpaw_platform::geometry::Rect>
pub paperpaw_sdk::layers::PageView::words: &'a [paperpaw_sdk::reading::WordBox]
pub const paperpaw_sdk::layers::MAX_COLUMNS: usize
pub fn paperpaw_sdk::layers::split(paperpaw_platform::geometry::Rect, u16, u16) -> alloc::vec::Vec<paperpaw_platform::geometry::Rect>
```
