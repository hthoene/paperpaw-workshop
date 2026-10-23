```rust
pub struct paperpaw_sdk::help::Hint
pub paperpaw_sdk::help::Hint::input: paperpaw_sdk::help::Input
pub paperpaw_sdk::help::Hint::text: alloc::string::String
pub paperpaw_sdk::help::Hint::zone: core::option::Option<paperpaw_sdk::help::Zone>
pub fn paperpaw_sdk::help::Hint::any(&str) -> Self
pub fn paperpaw_sdk::help::Hint::buttons(&str) -> Self
pub fn paperpaw_sdk::help::Hint::line(&self, &str) -> alloc::string::String
pub fn paperpaw_sdk::help::Hint::parse(&str) -> core::option::Option<(&str, paperpaw_sdk::help::Hint)>
pub fn paperpaw_sdk::help::Hint::touch(&str) -> Self
pub fn paperpaw_sdk::help::Hint::zone(self, paperpaw_sdk::help::Zone) -> Self
pub struct paperpaw_sdk::help::Zone
pub paperpaw_sdk::help::Zone::h: u16
pub paperpaw_sdk::help::Zone::w: u16
pub paperpaw_sdk::help::Zone::x: u16
pub paperpaw_sdk::help::Zone::y: u16
pub const fn paperpaw_sdk::help::Zone::new(u16, u16, u16, u16) -> Self
pub fn paperpaw_sdk::help::Zone::on(self, paperpaw_platform::geometry::Rect) -> paperpaw_platform::geometry::Rect
pub enum paperpaw_sdk::help::Input
pub paperpaw_sdk::help::Input::Any
pub paperpaw_sdk::help::Input::Buttons
pub paperpaw_sdk::help::Input::Touch
pub fn paperpaw_sdk::help::Input::fits(self, &paperpaw_sdk::Env<'_>) -> bool
pub const paperpaw_sdk::help::POINT: &str
pub const paperpaw_sdk::help::READY: paperpaw_sdk::event::Event<paperpaw_sdk::builtin::events::ScreenShown>
pub fn paperpaw_sdk::help::add(&mut paperpaw_sdk::contribution::Registrar, &str, &[paperpaw_sdk::help::Hint]) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::help::hints(&paperpaw_sdk::Env<'_>, &str) -> alloc::vec::Vec<paperpaw_sdk::help::Hint>
pub fn paperpaw_sdk::help::ready(&paperpaw_sdk::Id) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::help::wait(&mut paperpaw_sdk::contribution::Registrar, &str) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::help::waits(&paperpaw_sdk::Env<'_>, &str) -> bool
```
