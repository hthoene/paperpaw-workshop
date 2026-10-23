```rust
pub mod paperpaw_sdk::status::context
pub const paperpaw_sdk::status::context::CHAPTER: &str
pub const paperpaw_sdk::status::context::CHAPTERS: &str
pub const paperpaw_sdk::status::context::PAGE: &str
pub paperpaw_sdk::status::StatusValue::Bar
pub paperpaw_sdk::status::StatusValue::Bar::permille: u16
pub paperpaw_sdk::status::StatusValue::Icon(alloc::borrow::Cow<'static, str>)
pub paperpaw_sdk::status::StatusValue::Labelled
pub paperpaw_sdk::status::StatusValue::Labelled::icon: alloc::borrow::Cow<'static, str>
pub paperpaw_sdk::status::StatusValue::Labelled::text: alloc::string::String
pub paperpaw_sdk::status::StatusValue::Level
pub paperpaw_sdk::status::StatusValue::Level::charging: bool
pub paperpaw_sdk::status::StatusValue::Level::percent: u8
pub paperpaw_sdk::status::StatusValue::Text(alloc::string::String)
pub paperpaw_sdk::status::Place::id: paperpaw_sdk::Id
pub paperpaw_sdk::status::Place::line: core::option::Option<paperpaw_sdk::Id>
pub paperpaw_sdk::status::Place::parts: [paperpaw_sdk::Id; 3]
pub paperpaw_sdk::status::Place::title: alloc::borrow::Cow<'static, str>
pub fn paperpaw_sdk::status::Place::current_line<'e>(&self, &paperpaw_sdk::Env<'e>) -> &'e str
pub fn paperpaw_sdk::status::Place::draw(&self, &mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::status::StatusFrame<'_>)
pub fn paperpaw_sdk::status::Place::line<'e>(&self, &paperpaw_sdk::Env<'e>, paperpaw_platform::geometry::Rect, f32, paperpaw_platform::pixel::Color) -> paperpaw_sdk::status::StatusLine<'e>
pub fn paperpaw_sdk::status::Place::lists<'e>(&self, &paperpaw_sdk::Env<'e>) -> [&'e str; 3]
pub const fn paperpaw_sdk::status::Place::new(paperpaw_sdk::Id, &'static str, [paperpaw_sdk::Id; 3]) -> Self
pub fn paperpaw_sdk::status::Place::signature(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::Params) -> alloc::string::String
pub fn paperpaw_sdk::status::Place::targets(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::status::StatusFrame<'_>) -> alloc::vec::Vec<paperpaw_sdk::status::StatusTarget>
pub const fn paperpaw_sdk::status::Place::with_line(self, paperpaw_sdk::Id) -> Self
pub paperpaw_sdk::status::StatusFrame::area: paperpaw_platform::geometry::Rect
pub paperpaw_sdk::status::StatusFrame::color: paperpaw_platform::pixel::Color
pub paperpaw_sdk::status::StatusFrame::context: &'a paperpaw_sdk::Params
pub paperpaw_sdk::status::StatusFrame::font: &'a str
pub paperpaw_sdk::status::StatusFrame::percent: bool
pub paperpaw_sdk::status::StatusFrame::place: core::option::Option<&'a str>
pub paperpaw_sdk::status::StatusFrame::size: f32
pub paperpaw_sdk::status::StatusFrame::top: bool
pub fn paperpaw_sdk::status::StatusFrame<'a>::font(self, &'a str) -> Self
pub fn paperpaw_sdk::status::StatusFrame<'a>::new(paperpaw_platform::geometry::Rect, bool, f32, paperpaw_platform::pixel::Color, &'a paperpaw_sdk::Params) -> Self
pub fn paperpaw_sdk::status::StatusFrame<'a>::percent(self, bool) -> Self
pub fn paperpaw_sdk::status::StatusFrame<'a>::place(self, &'a str) -> Self
pub paperpaw_sdk::status::StatusItemSpec::id: paperpaw_sdk::Id
pub paperpaw_sdk::status::StatusItemSpec::min_width: f32
pub paperpaw_sdk::status::StatusItemSpec::priority: u8
pub paperpaw_sdk::status::StatusItemSpec::tap: core::option::Option<paperpaw_sdk::Id>
pub paperpaw_sdk::status::StatusItemSpec::title: alloc::borrow::Cow<'static, str>
pub paperpaw_sdk::status::StatusItemSpec::value: paperpaw_sdk::status::StatusFn
pub fn paperpaw_sdk::status::StatusItemSpec::min_width(self, f32) -> Self
pub fn paperpaw_sdk::status::StatusItemSpec::new(paperpaw_sdk::Id, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, paperpaw_sdk::status::StatusFn) -> Self
pub fn paperpaw_sdk::status::StatusItemSpec::priority(self, u8) -> Self
pub fn paperpaw_sdk::status::StatusItemSpec::tap(self, paperpaw_sdk::Id) -> Self
pub fn paperpaw_sdk::status::StatusItemSpec::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::status::StatusItems
pub fn paperpaw_sdk::status::StatusItems::canonical<'a>(&'a self, &'a str) -> &'a str
pub fn paperpaw_sdk::status::StatusItems::draw_line(&self, &str, &mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::status::StatusFrame<'_>) -> bool
pub fn paperpaw_sdk::status::StatusItems::iter(&self) -> impl core::iter::traits::iterator::Iterator<Item = (&paperpaw_sdk::Id, &str)>
pub fn paperpaw_sdk::status::StatusItems::line_signature(&self, &str, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::Params) -> alloc::string::String
pub fn paperpaw_sdk::status::StatusItems::line_targets(&self, &str, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::status::StatusFrame<'_>) -> alloc::vec::Vec<paperpaw_sdk::status::StatusTarget>
pub fn paperpaw_sdk::status::StatusItems::lines(&self) -> impl core::iter::traits::iterator::Iterator<Item = (&paperpaw_sdk::Id, &str)>
pub fn paperpaw_sdk::status::StatusItems::new() -> Self
pub fn paperpaw_sdk::status::StatusItems::place(&self, &str) -> core::option::Option<&paperpaw_sdk::status::Place>
pub fn paperpaw_sdk::status::StatusItems::places(&self) -> impl core::iter::traits::iterator::Iterator<Item = &paperpaw_sdk::status::Place>
pub fn paperpaw_sdk::status::StatusItems::priority(&self, &str) -> u8
pub fn paperpaw_sdk::status::StatusItems::tap(&self, &str, &paperpaw_sdk::Params) -> core::option::Option<paperpaw_sdk::Command>
pub fn paperpaw_sdk::status::StatusItems::title(&self, &str) -> core::option::Option<&str>
pub fn paperpaw_sdk::status::StatusItems::value(&self, &str, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::Params) -> core::option::Option<paperpaw_sdk::status::StatusValue>
pub paperpaw_sdk::status::StatusLine::area: paperpaw_platform::geometry::Rect
pub paperpaw_sdk::status::StatusLine::color: paperpaw_platform::pixel::Color
pub paperpaw_sdk::status::StatusLine::lists: [&'a str; 3]
pub paperpaw_sdk::status::StatusLine::percent: bool
pub paperpaw_sdk::status::StatusLine::size: f32
pub fn paperpaw_sdk::status::StatusLine<'a>::draw(&self, &mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::FontHandle<'_>, &paperpaw_sdk::Params)
pub fn paperpaw_sdk::status::StatusLine<'a>::is_empty(&self) -> bool
pub fn paperpaw_sdk::status::StatusLine<'a>::new(paperpaw_platform::geometry::Rect, [&'a str; 3], f32, paperpaw_platform::pixel::Color) -> Self
pub fn paperpaw_sdk::status::StatusLine<'a>::percent(self, bool) -> Self
pub fn paperpaw_sdk::status::StatusLine<'a>::targets(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::FontHandle<'_>, &paperpaw_sdk::Params) -> alloc::vec::Vec<paperpaw_sdk::status::StatusTarget>
pub paperpaw_sdk::status::StatusLineSpec::also: core::option::Option<paperpaw_sdk::Id>
pub paperpaw_sdk::status::StatusLineSpec::draw: paperpaw_sdk::status::StatusLineFn
pub paperpaw_sdk::status::StatusLineSpec::id: paperpaw_sdk::Id
pub paperpaw_sdk::status::StatusLineSpec::signature: core::option::Option<paperpaw_sdk::status::StatusSignatureFn>
pub paperpaw_sdk::status::StatusLineSpec::targets: core::option::Option<paperpaw_sdk::status::StatusTargetsFn>
pub paperpaw_sdk::status::StatusLineSpec::title: alloc::borrow::Cow<'static, str>
pub fn paperpaw_sdk::status::StatusLineSpec::also(self, paperpaw_sdk::Id) -> Self
pub fn paperpaw_sdk::status::StatusLineSpec::new(paperpaw_sdk::Id, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, paperpaw_sdk::status::StatusLineFn) -> Self
pub fn paperpaw_sdk::status::StatusLineSpec::signature(self, paperpaw_sdk::status::StatusSignatureFn) -> Self
pub fn paperpaw_sdk::status::StatusLineSpec::targets(self, paperpaw_sdk::status::StatusTargetsFn) -> Self
pub fn paperpaw_sdk::status::StatusLineSpec::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub paperpaw_sdk::status::StatusTarget::area: paperpaw_platform::geometry::Rect
pub paperpaw_sdk::status::StatusTarget::command: paperpaw_sdk::Command
pub fn paperpaw_sdk::status::StatusTarget::new(paperpaw_platform::geometry::Rect, paperpaw_sdk::Command) -> Self
pub const paperpaw_sdk::status::PRIORITY: u8
pub fn paperpaw_sdk::status::item_ids(&str) -> impl core::iter::traits::iterator::Iterator<Item = &str>
pub fn paperpaw_sdk::status::signature(&paperpaw_sdk::Env<'_>, &[&str], &paperpaw_sdk::Params) -> alloc::string::String
pub type paperpaw_sdk::status::StatusFn = alloc::boxed::Box<dyn core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::Params) -> core::option::Option<paperpaw_sdk::status::StatusValue>>
pub type paperpaw_sdk::status::StatusLineFn = alloc::boxed::Box<dyn core::ops::function::Fn(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::status::StatusFrame<'_>)>
pub type paperpaw_sdk::status::StatusSignatureFn = alloc::boxed::Box<dyn core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::Params) -> alloc::string::String>
pub type paperpaw_sdk::status::StatusTargetsFn = alloc::boxed::Box<dyn core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::status::StatusFrame<'_>) -> alloc::vec::Vec<paperpaw_sdk::status::StatusTarget>>
pub fn paperpaw_sdk::status::StatusFrame<'a>::font(self, &'a str) -> Self
pub fn paperpaw_sdk::status::StatusFrame<'a>::new(paperpaw_platform::geometry::Rect, bool, f32, paperpaw_platform::pixel::Color, &'a paperpaw_sdk::Params) -> Self
pub fn paperpaw_sdk::status::StatusFrame<'a>::percent(self, bool) -> Self
pub fn paperpaw_sdk::status::StatusFrame<'a>::place(self, &'a str) -> Self
pub fn paperpaw_sdk::status::StatusItemSpec::min_width(self, f32) -> Self
pub fn paperpaw_sdk::status::StatusItemSpec::new(paperpaw_sdk::Id, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, paperpaw_sdk::status::StatusFn) -> Self
pub fn paperpaw_sdk::status::StatusItemSpec::priority(self, u8) -> Self
pub fn paperpaw_sdk::status::StatusItemSpec::tap(self, paperpaw_sdk::Id) -> Self
pub fn paperpaw_sdk::status::StatusItemSpec::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub fn paperpaw_sdk::status::StatusItems::canonical<'a>(&'a self, &'a str) -> &'a str
pub fn paperpaw_sdk::status::StatusItems::draw_line(&self, &str, &mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::status::StatusFrame<'_>) -> bool
pub fn paperpaw_sdk::status::StatusItems::iter(&self) -> impl core::iter::traits::iterator::Iterator<Item = (&paperpaw_sdk::Id, &str)>
pub fn paperpaw_sdk::status::StatusItems::line_signature(&self, &str, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::Params) -> alloc::string::String
pub fn paperpaw_sdk::status::StatusItems::line_targets(&self, &str, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::status::StatusFrame<'_>) -> alloc::vec::Vec<paperpaw_sdk::status::StatusTarget>
pub fn paperpaw_sdk::status::StatusItems::lines(&self) -> impl core::iter::traits::iterator::Iterator<Item = (&paperpaw_sdk::Id, &str)>
pub fn paperpaw_sdk::status::StatusItems::new() -> Self
pub fn paperpaw_sdk::status::StatusItems::place(&self, &str) -> core::option::Option<&paperpaw_sdk::status::Place>
pub fn paperpaw_sdk::status::StatusItems::places(&self) -> impl core::iter::traits::iterator::Iterator<Item = &paperpaw_sdk::status::Place>
pub fn paperpaw_sdk::status::StatusItems::priority(&self, &str) -> u8
pub fn paperpaw_sdk::status::StatusItems::tap(&self, &str, &paperpaw_sdk::Params) -> core::option::Option<paperpaw_sdk::Command>
pub fn paperpaw_sdk::status::StatusItems::title(&self, &str) -> core::option::Option<&str>
pub fn paperpaw_sdk::status::StatusItems::value(&self, &str, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::Params) -> core::option::Option<paperpaw_sdk::status::StatusValue>
pub fn paperpaw_sdk::status::StatusLineSpec::also(self, paperpaw_sdk::Id) -> Self
pub fn paperpaw_sdk::status::StatusLineSpec::new(paperpaw_sdk::Id, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, paperpaw_sdk::status::StatusLineFn) -> Self
pub fn paperpaw_sdk::status::StatusLineSpec::signature(self, paperpaw_sdk::status::StatusSignatureFn) -> Self
pub fn paperpaw_sdk::status::StatusLineSpec::targets(self, paperpaw_sdk::status::StatusTargetsFn) -> Self
pub fn paperpaw_sdk::status::StatusLineSpec::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
```
