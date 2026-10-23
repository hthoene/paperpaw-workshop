```rust
pub struct paperpaw_sdk::ask::ChoiceQuestion
pub fn paperpaw_sdk::ask::ChoiceQuestion::about(self, impl core::convert::Into<alloc::string::String>) -> Self
pub fn paperpaw_sdk::ask::ChoiceQuestion::command(self) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::ask::ChoiceQuestion::options(self, &str, &[&str]) -> Self
pub struct paperpaw_sdk::ask::ConfirmQuestion
pub fn paperpaw_sdk::ask::ConfirmQuestion::command(self) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::ask::ConfirmQuestion::context(self, &paperpaw_sdk::Params) -> Self
pub fn paperpaw_sdk::ask::ConfirmQuestion::focus_yes(self) -> Self
pub fn paperpaw_sdk::ask::ConfirmQuestion::no(self, impl core::convert::Into<alloc::string::String>) -> Self
pub fn paperpaw_sdk::ask::ConfirmQuestion::text(self, impl core::convert::Into<alloc::string::String>) -> Self
pub fn paperpaw_sdk::ask::ConfirmQuestion::with(self, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, impl core::convert::Into<alloc::string::String>) -> Self
pub fn paperpaw_sdk::ask::ConfirmQuestion::yes(self, impl core::convert::Into<alloc::string::String>) -> Self
pub struct paperpaw_sdk::ask::FolderQuestion
pub fn paperpaw_sdk::ask::FolderQuestion::command(self) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::ask::FolderQuestion::start(self, impl core::convert::Into<alloc::string::String>) -> Self
pub fn paperpaw_sdk::ask::FolderQuestion::with(self, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, impl core::convert::Into<alloc::string::String>) -> Self
pub struct paperpaw_sdk::ask::TextQuestion
pub fn paperpaw_sdk::ask::TextQuestion::command(self) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::ask::TextQuestion::context(self, &paperpaw_sdk::Params) -> Self
pub fn paperpaw_sdk::ask::TextQuestion::initial(self, impl core::convert::Into<alloc::string::String>) -> Self
pub fn paperpaw_sdk::ask::TextQuestion::live(self) -> Self
pub fn paperpaw_sdk::ask::TextQuestion::number(self) -> Self
pub fn paperpaw_sdk::ask::TextQuestion::password(self) -> Self
pub fn paperpaw_sdk::ask::TextQuestion::remote_command(self) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::ask::TextQuestion::with(self, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, impl core::convert::Into<alloc::string::String>) -> Self
pub fn paperpaw_sdk::ask::choice(impl core::convert::Into<alloc::string::String>, &paperpaw_sdk::event::Event<paperpaw_sdk::ui::choice::Picked>) -> paperpaw_sdk::ask::ChoiceQuestion
pub fn paperpaw_sdk::ask::confirm(impl core::convert::Into<alloc::string::String>, &paperpaw_sdk::event::Event<paperpaw_sdk::replies::Confirmed>) -> paperpaw_sdk::ask::ConfirmQuestion
pub fn paperpaw_sdk::ask::folder(&paperpaw_sdk::event::Event<paperpaw_sdk::replies::Chosen>) -> paperpaw_sdk::ask::FolderQuestion
pub fn paperpaw_sdk::ask::text(impl core::convert::Into<alloc::string::String>, &paperpaw_sdk::event::Event<paperpaw_sdk::replies::Typed>) -> paperpaw_sdk::ask::TextQuestion
```
