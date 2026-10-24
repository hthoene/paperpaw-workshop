```rust
pub trait paperpaw_sdk::event::EventData: core::clone::Clone + core::marker::Sized + 'static
pub trait paperpaw_sdk::event::ParamValue: core::marker::Sized
pub type paperpaw_sdk::event::EventHandler = alloc::boxed::Box<dyn core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::Params, &mut paperpaw_sdk::Commands)>
pub struct paperpaw_sdk::event::Event<P: paperpaw_sdk::event::EventData>
pub fn paperpaw_sdk::event::Event<P>::as_str(&self) -> &str
pub fn paperpaw_sdk::event::Event<P>::emit(&self, P) -> paperpaw_sdk::Command
pub const fn paperpaw_sdk::event::Event<P>::id(&self) -> &paperpaw_sdk::Id
pub const fn paperpaw_sdk::event::Event<P>::new(&'static str) -> Self
pub fn paperpaw_sdk::event::Event<P>::read(&self, &paperpaw_sdk::Id, &paperpaw_sdk::Params) -> core::option::Option<P>
pub fn paperpaw_sdk::event::Event<P>::schedule(&self, P, paperpaw_platform::input::Instant) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::event::Event<P>::clone(&self) -> Self
pub fn paperpaw_sdk::event::Event<P>::eq(&self, &Self) -> bool
pub fn paperpaw_sdk::event::Event<P>::eq(&self, &paperpaw_sdk::Id) -> bool
pub fn paperpaw_sdk::event::Event<P>::as_ref(&self) -> &str
pub fn paperpaw_sdk::event::Event<P>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub fn paperpaw_sdk::event::Event<P>::as_str(&self) -> &str
pub fn paperpaw_sdk::event::Event<P>::emit(&self, P) -> paperpaw_sdk::Command
pub const fn paperpaw_sdk::event::Event<P>::id(&self) -> &paperpaw_sdk::Id
pub const fn paperpaw_sdk::event::Event<P>::new(&'static str) -> Self
pub fn paperpaw_sdk::event::Event<P>::read(&self, &paperpaw_sdk::Id, &paperpaw_sdk::Params) -> core::option::Option<P>
pub fn paperpaw_sdk::event::Event<P>::schedule(&self, P, paperpaw_platform::input::Instant) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::event::Event<P>::clone(&self) -> Self
pub fn paperpaw_sdk::event::Event<P>::eq(&self, &Self) -> bool
pub fn paperpaw_sdk::event::Event<P>::eq(&self, &paperpaw_sdk::Id) -> bool
pub fn paperpaw_sdk::event::Event<P>::as_ref(&self) -> &str
pub fn paperpaw_sdk::event::Event<P>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub fn paperpaw_sdk::event::Event<P>::eq(&self, &paperpaw_sdk::Id) -> bool
pub fn paperpaw_sdk::event::EventData::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::event::EventData::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::event::EventData::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::event::ParamValue::from_param(&str) -> core::option::Option<Self>
pub fn paperpaw_sdk::event::ParamValue::missing() -> core::option::Option<Self>
pub fn paperpaw_sdk::event::ParamValue::to_param(&self) -> alloc::string::String
```
