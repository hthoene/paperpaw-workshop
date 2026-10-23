```rust
pub struct paperpaw_sdk::filters::InputFilterSpec
pub paperpaw_sdk::filters::InputFilterSpec::filter: paperpaw_sdk::filters::InputFilterFn
pub paperpaw_sdk::filters::InputFilterSpec::id: paperpaw_sdk::Id
pub paperpaw_sdk::filters::InputFilterSpec::title: alloc::borrow::Cow<'static, str>
pub fn paperpaw_sdk::filters::InputFilterSpec::new(paperpaw_sdk::Id, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, paperpaw_sdk::filters::InputFilterFn) -> Self
pub fn paperpaw_sdk::filters::InputFilterSpec::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::filters::InputFilters
pub fn paperpaw_sdk::filters::InputFilters::apply(&self, &paperpaw_sdk::Env<'_>, &paperpaw_platform::input::InputEvent) -> paperpaw_sdk::filters::InputVerdict
pub fn paperpaw_sdk::filters::InputFilters::filter(&self, &paperpaw_sdk::Env<'_>, &paperpaw_platform::input::InputEvent) -> (paperpaw_sdk::filters::InputVerdict, paperpaw_platform::input::InputEvent)
pub fn paperpaw_sdk::filters::InputFilters::new() -> Self
pub struct paperpaw_sdk::filters::Refresh
pub paperpaw_sdk::filters::Refresh::cause: paperpaw_sdk::filters::RefreshCause
pub paperpaw_sdk::filters::Refresh::grays: bool
pub paperpaw_sdk::filters::Refresh::mode: paperpaw_platform::display::RefreshMode
pub paperpaw_sdk::filters::Refresh::periodic: bool
pub paperpaw_sdk::filters::Refresh::pictures: bool
pub paperpaw_sdk::filters::Refresh::region: paperpaw_platform::geometry::Rect
pub paperpaw_sdk::filters::Refresh::screen: core::option::Option<paperpaw_sdk::Id>
pub paperpaw_sdk::filters::Refresh::since_full: u32
pub paperpaw_sdk::filters::Refresh::slot: core::option::Option<paperpaw_sdk::Id>
pub fn paperpaw_sdk::filters::Refresh::new(paperpaw_platform::display::RefreshMode, paperpaw_platform::geometry::Rect, core::option::Option<paperpaw_sdk::Id>) -> Self
pub struct paperpaw_sdk::filters::RefreshFilterSpec
pub paperpaw_sdk::filters::RefreshFilterSpec::filter: paperpaw_sdk::filters::RefreshFilterFn
pub paperpaw_sdk::filters::RefreshFilterSpec::id: paperpaw_sdk::Id
pub paperpaw_sdk::filters::RefreshFilterSpec::title: alloc::borrow::Cow<'static, str>
pub fn paperpaw_sdk::filters::RefreshFilterSpec::new(paperpaw_sdk::Id, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, paperpaw_sdk::filters::RefreshFilterFn) -> Self
pub fn paperpaw_sdk::filters::RefreshFilterSpec::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::filters::RefreshFilters
pub fn paperpaw_sdk::filters::RefreshFilters::apply(&self, &paperpaw_sdk::Env<'_>, paperpaw_sdk::filters::Refresh, paperpaw_platform::geometry::Rect) -> core::option::Option<paperpaw_sdk::filters::Refresh>
pub fn paperpaw_sdk::filters::RefreshFilters::new() -> Self
pub struct paperpaw_sdk::filters::TextFilterSpec
pub paperpaw_sdk::filters::TextFilterSpec::block: core::option::Option<paperpaw_sdk::filters::BlockFilterFn>
pub paperpaw_sdk::filters::TextFilterSpec::filter: paperpaw_sdk::filters::TextFilterFn
pub paperpaw_sdk::filters::TextFilterSpec::id: paperpaw_sdk::Id
pub paperpaw_sdk::filters::TextFilterSpec::signature: paperpaw_sdk::filters::TextFilterSignatureFn
pub paperpaw_sdk::filters::TextFilterSpec::title: alloc::borrow::Cow<'static, str>
pub fn paperpaw_sdk::filters::TextFilterSpec::block(paperpaw_sdk::Id, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, paperpaw_sdk::filters::BlockFilterFn, paperpaw_sdk::filters::TextFilterSignatureFn) -> Self
pub fn paperpaw_sdk::filters::TextFilterSpec::new(paperpaw_sdk::Id, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, paperpaw_sdk::filters::TextFilterFn, paperpaw_sdk::filters::TextFilterSignatureFn) -> Self
pub fn paperpaw_sdk::filters::TextFilterSpec::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::filters::TextFilters
pub fn paperpaw_sdk::filters::TextFilters::apply(&self, &paperpaw_sdk::Env<'_>, &mut paperpaw_document::Block)
pub fn paperpaw_sdk::filters::TextFilters::apply_in(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::filters::FilterContext<'_>, &mut paperpaw_document::Block) -> paperpaw_sdk::filters::Verdict
pub fn paperpaw_sdk::filters::TextFilters::new() -> Self
pub fn paperpaw_sdk::filters::TextFilters::signature(&self, &paperpaw_sdk::Env<'_>) -> alloc::string::String
pub enum paperpaw_sdk::filters::InputVerdict
pub paperpaw_sdk::filters::InputVerdict::Cancel
pub paperpaw_sdk::filters::InputVerdict::Pass
pub paperpaw_sdk::filters::InputVerdict::Replace(paperpaw_platform::input::InputEvent)
pub paperpaw_sdk::filters::InputVerdict::Run(paperpaw_sdk::Id)
pub paperpaw_sdk::filters::InputVerdict::Take
pub enum paperpaw_sdk::filters::RefreshCause
pub paperpaw_sdk::filters::RefreshCause::Notice
pub paperpaw_sdk::filters::RefreshCause::Other
pub paperpaw_sdk::filters::RefreshCause::PageTurn
pub paperpaw_sdk::filters::RefreshCause::Screens
pub paperpaw_sdk::filters::RefreshCause::Status
pub enum paperpaw_sdk::filters::RefreshVerdict
pub paperpaw_sdk::filters::RefreshVerdict::Defer
pub paperpaw_sdk::filters::RefreshVerdict::Grays(bool)
pub paperpaw_sdk::filters::RefreshVerdict::Keep
pub paperpaw_sdk::filters::RefreshVerdict::Mode(paperpaw_platform::display::RefreshMode)
pub enum paperpaw_sdk::filters::Verdict
pub paperpaw_sdk::filters::Verdict::Drop
pub paperpaw_sdk::filters::Verdict::Keep
pub type paperpaw_sdk::filters::BlockFilterFn = alloc::boxed::Box<dyn core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::filters::FilterContext<'_>, &mut paperpaw_document::Block) -> paperpaw_sdk::filters::Verdict>
pub type paperpaw_sdk::filters::InputFilterFn = alloc::boxed::Box<dyn core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &paperpaw_platform::input::InputEvent) -> paperpaw_sdk::filters::InputVerdict>
pub type paperpaw_sdk::filters::RefreshFilterFn = alloc::boxed::Box<dyn core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::filters::Refresh) -> paperpaw_sdk::filters::RefreshVerdict>
pub type paperpaw_sdk::filters::TextFilterFn = alloc::boxed::Box<dyn core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &mut paperpaw_document::Block)>
pub type paperpaw_sdk::filters::TextFilterSignatureFn = alloc::boxed::Box<dyn core::ops::function::Fn(&paperpaw_sdk::Env<'_>) -> alloc::string::String>
pub struct paperpaw_sdk::filters::FilterContext<'a>
pub fn paperpaw_sdk::filters::FilterContext<'a>::new(&'a str, &'a str, paperpaw_document::Locator) -> Self
pub paperpaw_sdk::filters::FilterContext::at: paperpaw_document::Locator
pub paperpaw_sdk::filters::FilterContext::language: &'a str
pub paperpaw_sdk::filters::FilterContext::path: &'a str
```
