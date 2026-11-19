```rust
pub enum paperpaw_sdk::native::settings::GrantKind
pub paperpaw_sdk::native::settings::GrantKind::Install
pub paperpaw_sdk::native::settings::GrantKind::Style
pub enum paperpaw_sdk::native::settings::SettingValue<'a>
pub paperpaw_sdk::native::settings::SettingValue::Absent
pub paperpaw_sdk::native::settings::SettingValue::Bool(bool)
pub paperpaw_sdk::native::settings::SettingValue::Int(i64)
pub paperpaw_sdk::native::settings::SettingValue::Text(&'a str)
pub fn paperpaw_sdk::native::settings::encode_value<'o>(paperpaw_sdk::native::settings::SettingValue<'_>, &'o mut [u8]) -> core::result::Result<&'o [u8], paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::settings::own_grant(&paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::settings::GrantKind) -> core::result::Result<bool, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::settings::read_setting<'a>(&paperpaw_sdk::native::Host<'_>, impl core::convert::AsRef<str>, &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::settings::SettingValue<'a>, paperpaw_sdk::native::Error>
```
