```rust
pub struct paperpaw_sdk::presets::Preset
pub paperpaw_sdk::presets::Preset::description: alloc::borrow::Cow<'static, str>
pub paperpaw_sdk::presets::Preset::id: paperpaw_sdk::Id
pub paperpaw_sdk::presets::Preset::kind: paperpaw_sdk::Id
pub paperpaw_sdk::presets::Preset::title: alloc::borrow::Cow<'static, str>
pub paperpaw_sdk::presets::Preset::values: alloc::borrow::Cow<'static, str>
pub fn paperpaw_sdk::presets::Preset::changes(&self, &paperpaw_sdk::Settings, &[paperpaw_sdk::Id]) -> alloc::vec::Vec<(paperpaw_sdk::Id, core::option::Option<paperpaw_sdk::SettingValue>)>
pub const fn paperpaw_sdk::presets::Preset::fixed(&'static str, &'static str, &'static str, &'static str, &'static str) -> Self
pub fn paperpaw_sdk::presets::Preset::new(paperpaw_sdk::Id, paperpaw_sdk::Id, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> Self
pub fn paperpaw_sdk::presets::Preset::value(&self, &str) -> core::option::Option<&str>
pub fn paperpaw_sdk::presets::Preset::values(&self) -> impl core::iter::traits::iterator::Iterator<Item = (&str, &str)>
pub struct paperpaw_sdk::presets::Presets
pub fn paperpaw_sdk::presets::Presets::add(&mut self, paperpaw_sdk::presets::Preset)
pub fn paperpaw_sdk::presets::Presets::add_fixed(&mut self, &'static [paperpaw_sdk::presets::Preset])
pub fn paperpaw_sdk::presets::Presets::get(&self, &str) -> core::option::Option<&paperpaw_sdk::presets::Preset>
pub fn paperpaw_sdk::presets::Presets::iter(&self) -> impl core::iter::traits::iterator::Iterator<Item = &paperpaw_sdk::presets::Preset>
pub fn paperpaw_sdk::presets::Presets::new() -> Self
pub fn paperpaw_sdk::presets::Presets::of_kind<'a>(&'a self, &'a str) -> impl core::iter::traits::iterator::Iterator<Item = &'a paperpaw_sdk::presets::Preset> + 'a
pub fn paperpaw_sdk::presets::Presets::remove_plugin(&mut self, &str)
pub fn paperpaw_sdk::presets::Presets::shrink_to_fit(&mut self)
pub const paperpaw_sdk::presets::THEME: &str
pub const paperpaw_sdk::presets::WIDGET_LOOK: &str
pub fn paperpaw_sdk::presets::applied(&paperpaw_sdk::Settings, &[(paperpaw_sdk::Id, core::option::Option<paperpaw_sdk::SettingValue>)]) -> bool
pub fn paperpaw_sdk::presets::commands(&paperpaw_sdk::Settings, &[(paperpaw_sdk::Id, core::option::Option<paperpaw_sdk::SettingValue>)]) -> alloc::vec::Vec<paperpaw_sdk::Command>
pub fn paperpaw_sdk::presets::theme_changes(&paperpaw_sdk::Settings, &paperpaw_sdk::presets::Preset) -> alloc::vec::Vec<(paperpaw_sdk::Id, core::option::Option<paperpaw_sdk::SettingValue>)>
pub fn paperpaw_sdk::presets::theme_settings(&paperpaw_sdk::Settings) -> alloc::vec::Vec<paperpaw_sdk::Id>
pub fn paperpaw_sdk::presets::widget_look_changes(&paperpaw_sdk::Settings, &paperpaw_sdk::widgets::Widgets, &paperpaw_sdk::presets::Preset) -> alloc::vec::Vec<(paperpaw_sdk::Id, core::option::Option<paperpaw_sdk::SettingValue>)>
pub fn paperpaw_sdk::presets::widget_look_settings(&paperpaw_sdk::Settings, &paperpaw_sdk::widgets::Widgets) -> alloc::vec::Vec<paperpaw_sdk::Id>
```
