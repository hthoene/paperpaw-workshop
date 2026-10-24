```rust
pub trait paperpaw_sdk::keys::GestureRecognizer
pub fn paperpaw_sdk::keys::GestureRecognizer::next_tick(&self) -> core::option::Option<paperpaw_platform::input::Instant>
pub fn paperpaw_sdk::keys::GestureRecognizer::pointer(&mut self, &paperpaw_platform::input::PointerEvent, paperpaw_platform::input::Instant) -> paperpaw_sdk::keys::PointerVerdict
pub fn paperpaw_sdk::keys::GestureRecognizer::tick(&mut self, paperpaw_platform::input::Instant) -> paperpaw_sdk::keys::Recognition
pub trait paperpaw_sdk::keys::KeyBindings
pub fn paperpaw_sdk::keys::KeyBindings::bindings(&self, &str) -> alloc::vec::Vec<(alloc::string::String, core::option::Option<paperpaw_sdk::Id>, paperpaw_sdk::keys::BindingOrigin)>
pub fn paperpaw_sdk::keys::KeyBindings::bound(&self, &[&str], &str) -> core::option::Option<paperpaw_sdk::Id>
pub struct paperpaw_sdk::keys::GestureSpec
pub paperpaw_sdk::keys::GestureSpec::factory: paperpaw_sdk::keys::RecognizerFactory
pub paperpaw_sdk::keys::GestureSpec::id: paperpaw_sdk::Id
pub paperpaw_sdk::keys::GestureSpec::title: alloc::borrow::Cow<'static, str>
pub fn paperpaw_sdk::keys::GestureSpec::new(paperpaw_sdk::Id, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, paperpaw_sdk::keys::RecognizerFactory) -> Self
pub fn paperpaw_sdk::keys::GestureSpec::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::keys::InputSpec
pub paperpaw_sdk::keys::InputSpec::id: paperpaw_sdk::Id
pub paperpaw_sdk::keys::InputSpec::kind: paperpaw_sdk::keys::InputKind
pub paperpaw_sdk::keys::InputSpec::need: core::option::Option<paperpaw_sdk::MenuNeed>
pub paperpaw_sdk::keys::InputSpec::title: alloc::borrow::Cow<'static, str>
pub fn paperpaw_sdk::keys::InputSpec::key(&self) -> alloc::string::String
pub fn paperpaw_sdk::keys::InputSpec::need(self, paperpaw_sdk::MenuNeed) -> Self
pub fn paperpaw_sdk::keys::InputSpec::new(paperpaw_sdk::Id, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> Self
pub enum paperpaw_sdk::keys::BindingOrigin
pub paperpaw_sdk::keys::BindingOrigin::Device
pub paperpaw_sdk::keys::BindingOrigin::Plugin
pub paperpaw_sdk::keys::BindingOrigin::Preset
pub paperpaw_sdk::keys::BindingOrigin::User
pub enum paperpaw_sdk::keys::InputKind
pub paperpaw_sdk::keys::InputKind::Gesture
pub paperpaw_sdk::keys::InputKind::Input
pub enum paperpaw_sdk::keys::InputMode
pub paperpaw_sdk::keys::InputMode::Buttons
pub paperpaw_sdk::keys::InputMode::Pen
pub paperpaw_sdk::keys::InputMode::Touch
pub fn paperpaw_sdk::keys::InputMode::at_start(&paperpaw_platform::input::InputCaps) -> Self
pub enum paperpaw_sdk::keys::PointerVerdict
pub paperpaw_sdk::keys::PointerVerdict::Capture
pub paperpaw_sdk::keys::PointerVerdict::Observe
pub paperpaw_sdk::keys::PointerVerdict::Pass
pub paperpaw_sdk::keys::PointerVerdict::Recognized
pub enum paperpaw_sdk::keys::Recognition
pub paperpaw_sdk::keys::Recognition::Nothing
pub paperpaw_sdk::keys::Recognition::Recognized
pub type paperpaw_sdk::keys::RecognizerFactory = alloc::boxed::Box<dyn core::ops::function::Fn() -> alloc::boxed::Box<dyn paperpaw_sdk::keys::GestureRecognizer>>
pub const paperpaw_sdk::keys::EDGES: [&str; 4]
pub const paperpaw_sdk::keys::PINCHES: [&str; 2]
pub const paperpaw_sdk::keys::POLICIES: [&str; 3]
pub const paperpaw_sdk::keys::SWIPES: [&str; 4]
pub const paperpaw_sdk::keys::ZONES: [&str; 9]
pub fn paperpaw_sdk::keys::inputs(&paperpaw_platform::input::InputCaps) -> alloc::vec::Vec<alloc::string::String>
```
