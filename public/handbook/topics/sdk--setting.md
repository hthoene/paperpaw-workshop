```rust
pub trait paperpaw_sdk::setting::SettingType: 'static
pub enum paperpaw_sdk::setting::Text
pub type paperpaw_sdk::setting::Text::Input = alloc::borrow::Cow<'static, str>
pub type paperpaw_sdk::setting::Text::Value<'a> = &'a str
pub fn paperpaw_sdk::setting::Text::read(core::option::Option<&paperpaw_sdk::SettingValue>) -> &str
pub fn paperpaw_sdk::setting::Text::write(alloc::borrow::Cow<'static, str>) -> paperpaw_sdk::SettingValue
pub type paperpaw_sdk::setting::Text::Input = alloc::borrow::Cow<'static, str>
pub type paperpaw_sdk::setting::Text::Value<'a> = &'a str
pub fn paperpaw_sdk::setting::Text::read(core::option::Option<&paperpaw_sdk::SettingValue>) -> &str
pub fn paperpaw_sdk::setting::Text::write(alloc::borrow::Cow<'static, str>) -> paperpaw_sdk::SettingValue
pub type paperpaw_sdk::setting::Text::Input = alloc::borrow::Cow<'static, str>
pub type paperpaw_sdk::setting::Text::Value<'a> = &'a str
pub fn paperpaw_sdk::setting::Text::read(core::option::Option<&paperpaw_sdk::SettingValue>) -> &str
pub fn paperpaw_sdk::setting::Text::write(alloc::borrow::Cow<'static, str>) -> paperpaw_sdk::SettingValue
pub struct paperpaw_sdk::setting::Setting<T: paperpaw_sdk::setting::SettingType>
pub fn paperpaw_sdk::setting::Setting<T>::as_str(&self) -> &str
pub const fn paperpaw_sdk::setting::Setting<T>::id(&self) -> &paperpaw_sdk::Id
pub const fn paperpaw_sdk::setting::Setting<T>::new(&'static str) -> Self
pub const fn paperpaw_sdk::setting::Setting<T>::static_str(self) -> &'static str
pub fn paperpaw_sdk::setting::Setting<T>::value(&self, <T as paperpaw_sdk::setting::SettingType>::Input) -> paperpaw_sdk::SettingValue
pub fn paperpaw_sdk::setting::Setting<T>::clone(&self) -> Self
pub fn paperpaw_sdk::setting::Setting<T>::eq(&self, &Self) -> bool
pub fn paperpaw_sdk::setting::Setting<T>::eq(&self, &paperpaw_sdk::Id) -> bool
pub fn paperpaw_sdk::setting::Setting<T>::as_ref(&self) -> &str
pub fn paperpaw_sdk::setting::Setting<T>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub fn paperpaw_sdk::setting::Setting<T>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub fn paperpaw_sdk::setting::Setting<T>::eq(&self, &paperpaw_sdk::Id) -> bool
pub fn paperpaw_sdk::setting::Setting<T>::as_str(&self) -> &str
pub const fn paperpaw_sdk::setting::Setting<T>::id(&self) -> &paperpaw_sdk::Id
pub const fn paperpaw_sdk::setting::Setting<T>::new(&'static str) -> Self
pub const fn paperpaw_sdk::setting::Setting<T>::static_str(self) -> &'static str
pub fn paperpaw_sdk::setting::Setting<T>::value(&self, <T as paperpaw_sdk::setting::SettingType>::Input) -> paperpaw_sdk::SettingValue
pub fn paperpaw_sdk::setting::Setting<T>::clone(&self) -> Self
pub fn paperpaw_sdk::setting::Setting<T>::eq(&self, &Self) -> bool
pub fn paperpaw_sdk::setting::Setting<T>::eq(&self, &paperpaw_sdk::Id) -> bool
pub fn paperpaw_sdk::setting::Setting<T>::as_ref(&self) -> &str
pub fn paperpaw_sdk::setting::Setting<T>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub fn paperpaw_sdk::setting::Setting<T>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub fn paperpaw_sdk::setting::SettingType::read(core::option::Option<&paperpaw_sdk::SettingValue>) -> Self::Value
pub fn paperpaw_sdk::setting::SettingType::write(Self::Input) -> paperpaw_sdk::SettingValue
pub type paperpaw_sdk::setting::SettingType::Input
pub type paperpaw_sdk::setting::SettingType::Value<'a>
```
