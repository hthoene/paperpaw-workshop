```rust
pub struct paperpaw_sdk::decorations::Decorated
pub paperpaw_sdk::decorations::Decorated::end: paperpaw_document::Locator
pub paperpaw_sdk::decorations::Decorated::role: paperpaw_sdk::Id
pub paperpaw_sdk::decorations::Decorated::start: paperpaw_document::Locator
pub fn paperpaw_sdk::decorations::Decorated::new(paperpaw_document::Locator, paperpaw_document::Locator, paperpaw_sdk::Id) -> Self
pub fn paperpaw_sdk::decorations::Decorated::words(&[paperpaw_sdk::decorations::PageWord<'_>], &paperpaw_sdk::Id) -> core::option::Option<paperpaw_sdk::decorations::Decorated>
pub struct paperpaw_sdk::decorations::Decoration
pub paperpaw_sdk::decorations::Decoration::background: core::option::Option<paperpaw_sdk::decorations::Tone>
pub paperpaw_sdk::decorations::Decoration::frame: bool
pub paperpaw_sdk::decorations::Decoration::ink: core::option::Option<paperpaw_sdk::decorations::Tone>
pub paperpaw_sdk::decorations::Decoration::line: core::option::Option<paperpaw_sdk::decorations::LineKind>
pub paperpaw_sdk::decorations::Decoration::line_tone: core::option::Option<paperpaw_sdk::decorations::Tone>
pub paperpaw_sdk::decorations::Decoration::struck: bool
pub paperpaw_sdk::decorations::Decoration::thickness: u8
pub const paperpaw_sdk::decorations::Decoration::NONE: paperpaw_sdk::decorations::Decoration
pub const fn paperpaw_sdk::decorations::Decoration::background(self, paperpaw_sdk::decorations::Tone) -> Self
pub fn paperpaw_sdk::decorations::Decoration::combined(self, paperpaw_sdk::decorations::Decoration) -> paperpaw_sdk::decorations::Decoration
pub const fn paperpaw_sdk::decorations::Decoration::frame(self) -> Self
pub const fn paperpaw_sdk::decorations::Decoration::ink(self, paperpaw_sdk::decorations::Tone) -> Self
pub fn paperpaw_sdk::decorations::Decoration::ink_color(&self) -> core::option::Option<paperpaw_platform::pixel::Color>
pub fn paperpaw_sdk::decorations::Decoration::is_none(&self) -> bool
pub const fn paperpaw_sdk::decorations::Decoration::line(self, paperpaw_sdk::decorations::LineKind) -> Self
pub const fn paperpaw_sdk::decorations::Decoration::line_tone(self, paperpaw_sdk::decorations::Tone) -> Self
pub fn paperpaw_sdk::decorations::Decoration::of_role(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::Id) -> paperpaw_sdk::decorations::Decoration
pub const fn paperpaw_sdk::decorations::Decoration::struck(self) -> Self
pub const fn paperpaw_sdk::decorations::Decoration::thickness(self, u8) -> Self
pub struct paperpaw_sdk::decorations::DecoratorSpec
pub paperpaw_sdk::decorations::DecoratorSpec::decorate: paperpaw_sdk::decorations::DecorateFn
pub paperpaw_sdk::decorations::DecoratorSpec::id: paperpaw_sdk::Id
pub paperpaw_sdk::decorations::DecoratorSpec::order: i16
pub paperpaw_sdk::decorations::DecoratorSpec::signature: paperpaw_sdk::decorations::DecoratorSignatureFn
pub paperpaw_sdk::decorations::DecoratorSpec::switch: core::option::Option<paperpaw_sdk::Id>
pub paperpaw_sdk::decorations::DecoratorSpec::taps: bool
pub paperpaw_sdk::decorations::DecoratorSpec::title: alloc::borrow::Cow<'static, str>
pub fn paperpaw_sdk::decorations::DecoratorSpec::new(paperpaw_sdk::Id, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, impl core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::decorations::PageText<'_>) -> alloc::vec::Vec<paperpaw_sdk::decorations::Decorated> + 'static) -> Self
pub fn paperpaw_sdk::decorations::DecoratorSpec::order(self, i16) -> Self
pub fn paperpaw_sdk::decorations::DecoratorSpec::signature(self, impl core::ops::function::Fn(&paperpaw_sdk::Env<'_>) -> u64 + 'static) -> Self
pub fn paperpaw_sdk::decorations::DecoratorSpec::switch(self, &paperpaw_sdk::setting::Setting<bool>) -> Self
pub fn paperpaw_sdk::decorations::DecoratorSpec::taps(self) -> Self
pub fn paperpaw_sdk::decorations::DecoratorSpec::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::decorations::Decorators
pub fn paperpaw_sdk::decorations::Decorators::decorate(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::decorations::PageText<'_>) -> alloc::vec::Vec<paperpaw_sdk::decorations::Mark>
pub fn paperpaw_sdk::decorations::Decorators::get(&self, &paperpaw_sdk::Id) -> core::option::Option<&paperpaw_sdk::decorations::DecoratorSpec>
pub fn paperpaw_sdk::decorations::Decorators::is_empty(&self) -> bool
pub fn paperpaw_sdk::decorations::Decorators::signature(&self, &paperpaw_sdk::Env<'_>) -> u64
pub struct paperpaw_sdk::decorations::Mark
pub paperpaw_sdk::decorations::Mark::decorator: paperpaw_sdk::Id
pub paperpaw_sdk::decorations::Mark::end: paperpaw_document::Locator
pub paperpaw_sdk::decorations::Mark::role: paperpaw_sdk::Id
pub paperpaw_sdk::decorations::Mark::start: paperpaw_document::Locator
pub paperpaw_sdk::decorations::Mark::taps: bool
pub fn paperpaw_sdk::decorations::Mark::overlaps(&self, paperpaw_document::Locator, paperpaw_document::Locator) -> bool
pub struct paperpaw_sdk::decorations::MarkRules
pub paperpaw_sdk::decorations::MarkRules::decorator: paperpaw_sdk::decorations::PatternDecorator
pub paperpaw_sdk::decorations::MarkRules::roles: alloc::vec::Vec<(paperpaw_sdk::Id, alloc::string::String, paperpaw_sdk::decorations::Decoration)>
pub fn paperpaw_sdk::decorations::MarkRules::parse(&paperpaw_sdk::Id, &str) -> core::result::Result<paperpaw_sdk::decorations::MarkRules, paperpaw_sdk::RegisterError>
pub struct paperpaw_sdk::decorations::PatternDecorator
pub fn paperpaw_sdk::decorations::PatternDecorator::decorate(&self, &paperpaw_sdk::decorations::PageText<'_>) -> alloc::vec::Vec<paperpaw_sdk::decorations::Decorated>
pub fn paperpaw_sdk::decorations::PatternDecorator::into_spec(self, paperpaw_sdk::Id, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> paperpaw_sdk::decorations::DecoratorSpec
pub fn paperpaw_sdk::decorations::PatternDecorator::is_empty(&self) -> bool
pub fn paperpaw_sdk::decorations::PatternDecorator::new() -> Self
pub fn paperpaw_sdk::decorations::PatternDecorator::rule(self, paperpaw_sdk::pattern::Pattern, paperpaw_sdk::Id) -> Self
pub enum paperpaw_sdk::decorations::LineKind
pub paperpaw_sdk::decorations::LineKind::Dashed
pub paperpaw_sdk::decorations::LineKind::Dotted
pub paperpaw_sdk::decorations::LineKind::Double
pub paperpaw_sdk::decorations::LineKind::Solid
pub paperpaw_sdk::decorations::LineKind::Wavy
pub const paperpaw_sdk::decorations::LineKind::ALL: &[paperpaw_sdk::decorations::LineKind]
pub fn paperpaw_sdk::decorations::LineKind::from_id(&str) -> core::option::Option<paperpaw_sdk::decorations::LineKind>
pub const fn paperpaw_sdk::decorations::LineKind::id(self) -> &'static str
pub enum paperpaw_sdk::decorations::Tone
pub paperpaw_sdk::decorations::Tone::Black
pub paperpaw_sdk::decorations::Tone::Blue
pub paperpaw_sdk::decorations::Tone::DarkGray
pub paperpaw_sdk::decorations::Tone::Gray
pub paperpaw_sdk::decorations::Tone::Green
pub paperpaw_sdk::decorations::Tone::LightGray
pub paperpaw_sdk::decorations::Tone::Orange
pub paperpaw_sdk::decorations::Tone::Pink
pub paperpaw_sdk::decorations::Tone::Red
pub paperpaw_sdk::decorations::Tone::White
pub paperpaw_sdk::decorations::Tone::Yellow
pub const paperpaw_sdk::decorations::Tone::ALL: &[paperpaw_sdk::decorations::Tone]
pub fn paperpaw_sdk::decorations::Tone::color(self) -> paperpaw_platform::pixel::Color
pub fn paperpaw_sdk::decorations::Tone::from_id(&str) -> core::option::Option<paperpaw_sdk::decorations::Tone>
pub const fn paperpaw_sdk::decorations::Tone::id(self) -> &'static str
pub type paperpaw_sdk::decorations::DecorateFn = alloc::boxed::Box<dyn core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::decorations::PageText<'_>) -> alloc::vec::Vec<paperpaw_sdk::decorations::Decorated>>
pub type paperpaw_sdk::decorations::DecoratorSignatureFn = alloc::boxed::Box<dyn core::ops::function::Fn(&paperpaw_sdk::Env<'_>) -> u64>
pub struct paperpaw_sdk::decorations::PageText<'a>
pub const fn paperpaw_sdk::decorations::PageText<'a>::new(&'a str, &'a str, &'a [paperpaw_sdk::decorations::PageWord<'a>]) -> Self
pub paperpaw_sdk::decorations::PageText::language: &'a str
pub paperpaw_sdk::decorations::PageText::path: &'a str
pub paperpaw_sdk::decorations::PageText::words: &'a [paperpaw_sdk::decorations::PageWord<'a>]
pub struct paperpaw_sdk::decorations::PageWord<'a>
pub const fn paperpaw_sdk::decorations::PageWord<'a>::new(&'a str, paperpaw_document::Locator, paperpaw_document::Locator) -> Self
pub paperpaw_sdk::decorations::PageWord::end: paperpaw_document::Locator
pub paperpaw_sdk::decorations::PageWord::start: paperpaw_document::Locator
pub paperpaw_sdk::decorations::PageWord::text: &'a str
pub const paperpaw_sdk::decorations::AS_IS: &str
pub const paperpaw_sdk::decorations::NONE: &str
pub const paperpaw_sdk::decorations::THICKNESS: u8
pub fn paperpaw_sdk::decorations::add_role(&mut paperpaw_sdk::contribution::Registrar, &paperpaw_sdk::Id, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, paperpaw_sdk::decorations::Decoration) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::decorations::combine(impl core::iter::traits::collect::IntoIterator<Item = paperpaw_sdk::decorations::Decoration>) -> paperpaw_sdk::decorations::Decoration
pub fn paperpaw_sdk::decorations::draw_behind(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &[paperpaw_platform::geometry::Rect], &paperpaw_sdk::decorations::Decoration)
pub fn paperpaw_sdk::decorations::draw_over(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &[paperpaw_platform::geometry::Rect], &paperpaw_sdk::decorations::Decoration)
pub fn paperpaw_sdk::decorations::join_boxes(impl core::iter::traits::collect::IntoIterator<Item = (usize, paperpaw_platform::geometry::Rect)>) -> alloc::vec::Vec<paperpaw_platform::geometry::Rect>
```
