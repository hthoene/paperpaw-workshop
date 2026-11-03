```rust
pub struct paperpaw_sdk::render::HookStage(_)
pub const paperpaw_sdk::render::HookStage::AFTER_BAND: Self
pub const paperpaw_sdk::render::HookStage::AFTER_FRAME: Self
pub const paperpaw_sdk::render::HookStage::AFTER_SCREEN: Self
pub const paperpaw_sdk::render::HookStage::BEFORE_BAND: Self
pub const paperpaw_sdk::render::HookStage::BEFORE_CHROME: Self
pub const fn paperpaw_sdk::render::HookStage::from_value(u16) -> Self
pub const fn paperpaw_sdk::render::HookStage::value(self) -> u16
pub struct paperpaw_sdk::render::RenderHookSpec
pub paperpaw_sdk::render::RenderHookSpec::carry: u16
pub paperpaw_sdk::render::RenderHookSpec::flags: u32
pub paperpaw_sdk::render::RenderHookSpec::hook: paperpaw_sdk::render::RenderHookFn
pub paperpaw_sdk::render::RenderHookSpec::id: paperpaw_sdk::Id
pub paperpaw_sdk::render::RenderHookSpec::order: i16
pub paperpaw_sdk::render::RenderHookSpec::overlap: u8
pub paperpaw_sdk::render::RenderHookSpec::passes: paperpaw_graphics::band::FramePass
pub paperpaw_sdk::render::RenderHookSpec::stage: paperpaw_sdk::render::HookStage
pub paperpaw_sdk::render::RenderHookSpec::switch: paperpaw_sdk::Id
pub paperpaw_sdk::render::RenderHookSpec::title: alloc::borrow::Cow<'static, str>
pub fn paperpaw_sdk::render::RenderHookSpec::new(paperpaw_sdk::Id, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, paperpaw_sdk::render::HookStage, paperpaw_sdk::Id, paperpaw_sdk::render::RenderHookFn) -> Self
pub fn paperpaw_sdk::render::RenderHookSpec::with_carry(self, u16) -> Self
pub fn paperpaw_sdk::render::RenderHookSpec::with_order(self, i16) -> Self
pub fn paperpaw_sdk::render::RenderHookSpec::with_overlap(self, u8) -> Self
pub fn paperpaw_sdk::render::RenderHookSpec::with_passes(self, paperpaw_graphics::band::FramePass) -> Self
pub fn paperpaw_sdk::render::RenderHookSpec::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub use paperpaw_sdk::render::BandView
pub use paperpaw_sdk::render::FramePass
pub use paperpaw_sdk::render::Region
pub use paperpaw_sdk::render::RegionKind
pub type paperpaw_sdk::render::RenderHookFn = alloc::boxed::Box<dyn core::ops::function::Fn(&mut paperpaw_graphics::band::BandView<'_>, &paperpaw_sdk::render::HookCx<'_>)>
pub struct paperpaw_sdk::render::HookCx<'a>
pub fn paperpaw_sdk::render::HookCx<'a>::lang(&self) -> paperpaw_lang::Lang
pub fn paperpaw_sdk::render::HookCx<'a>::new(&'a paperpaw_sdk::Settings, paperpaw_lang::Lang, u16) -> Self
pub fn paperpaw_sdk::render::HookCx<'a>::revision(&self) -> u16
pub fn paperpaw_sdk::render::HookCx<'a>::script(&self) -> core::option::Option<&'static str>
pub fn paperpaw_sdk::render::HookCx<'a>::setting<T: paperpaw_sdk::setting::SettingType>(&self, &paperpaw_sdk::setting::Setting<T>) -> <T as paperpaw_sdk::setting::SettingType>::Value
pub fn paperpaw_sdk::render::HookCx<'_>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
```
