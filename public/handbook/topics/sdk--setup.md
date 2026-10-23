```rust
pub struct paperpaw_sdk::setup::SetupStepSpec
pub paperpaw_sdk::setup::SetupStepSpec::applies: core::option::Option<paperpaw_sdk::setup::AppliesFn>
pub paperpaw_sdk::setup::SetupStepSpec::help: alloc::borrow::Cow<'static, str>
pub paperpaw_sdk::setup::SetupStepSpec::id: paperpaw_sdk::Id
pub paperpaw_sdk::setup::SetupStepSpec::order: i32
pub paperpaw_sdk::setup::SetupStepSpec::page: paperpaw_sdk::setup::SetupPage
pub paperpaw_sdk::setup::SetupStepSpec::title: alloc::borrow::Cow<'static, str>
pub fn paperpaw_sdk::setup::SetupStepSpec::applies(self, paperpaw_sdk::setup::AppliesFn) -> Self
pub fn paperpaw_sdk::setup::SetupStepSpec::help(self, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> Self
pub fn paperpaw_sdk::setup::SetupStepSpec::new(paperpaw_sdk::Id, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, paperpaw_sdk::setup::SetupPage) -> Self
pub fn paperpaw_sdk::setup::SetupStepSpec::order(self, i32) -> Self
pub fn paperpaw_sdk::setup::SetupStepSpec::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::setup::SetupSteps
pub fn paperpaw_sdk::setup::SetupSteps::applying<'a>(&'a self, &paperpaw_sdk::Env<'_>) -> alloc::vec::Vec<&'a paperpaw_sdk::setup::SetupStepSpec>
pub fn paperpaw_sdk::setup::SetupSteps::new() -> Self
pub enum paperpaw_sdk::setup::SetupPage
pub paperpaw_sdk::setup::SetupPage::Screen(paperpaw_sdk::Id)
pub paperpaw_sdk::setup::SetupPage::Setting(paperpaw_sdk::Id)
pub type paperpaw_sdk::setup::AppliesFn = alloc::boxed::Box<dyn core::ops::function::Fn(&paperpaw_sdk::Env<'_>) -> bool>
```
