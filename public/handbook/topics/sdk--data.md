```rust
pub struct paperpaw_sdk::data::Format
pub paperpaw_sdk::data::Format::upgrades: &'static [paperpaw_sdk::data::Upgrade]
pub paperpaw_sdk::data::Format::version: u32
pub const paperpaw_sdk::data::Format::FIRST: paperpaw_sdk::data::Format
pub fn paperpaw_sdk::data::Format::load(&self, &dyn paperpaw_platform::storage::Storage, &str, usize) -> core::result::Result<core::option::Option<alloc::string::String>, paperpaw_sdk::data::Error>
pub const fn paperpaw_sdk::data::Format::new(u32, &'static [paperpaw_sdk::data::Upgrade]) -> Self
pub fn paperpaw_sdk::data::Format::read<'a>(&self, &'a str) -> core::result::Result<alloc::borrow::Cow<'a, str>, paperpaw_sdk::data::Error>
pub fn paperpaw_sdk::data::Format::save(&self, &dyn paperpaw_platform::storage::Storage, &str, &str) -> core::result::Result<(), paperpaw_sdk::data::Error>
pub fn paperpaw_sdk::data::Format::text(&self, &str) -> alloc::string::String
pub fn paperpaw_sdk::data::Format::version_of(&str) -> u32
pub enum paperpaw_sdk::data::Error
pub paperpaw_sdk::data::Error::Newer(u32)
pub paperpaw_sdk::data::Error::Storage(paperpaw_platform::storage::StorageError)
pub paperpaw_sdk::data::Error::Unreadable
pub type paperpaw_sdk::data::Upgrade = fn(&str) -> alloc::string::String
pub const paperpaw_sdk::data::DIR: &str
pub const paperpaw_sdk::data::MARK: &str
pub fn paperpaw_sdk::data::take_over_old_name(&dyn paperpaw_platform::storage::Storage)
```
