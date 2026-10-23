```rust
pub struct paperpaw_sdk::power::Power
pub paperpaw_sdk::power::Power::automatic: bool
pub paperpaw_sdk::power::Power::level: paperpaw_sdk::power::PowerLevel
pub paperpaw_sdk::power::Power::mode: paperpaw_sdk::Id
pub paperpaw_sdk::power::Power::stretch: u32
pub fn paperpaw_sdk::power::Power::every(&self, u64) -> core::option::Option<u64>
pub fn paperpaw_sdk::power::Power::new(paperpaw_sdk::power::PowerLevel, paperpaw_sdk::Id, bool, u32) -> Self
pub fn paperpaw_sdk::power::Power::normal() -> &'static paperpaw_sdk::power::Power
pub fn paperpaw_sdk::power::Power::online(&self) -> bool
pub fn paperpaw_sdk::power::Power::default() -> Self
pub struct paperpaw_sdk::power::Wear
pub paperpaw_sdk::power::Wear::automatic: bool
pub paperpaw_sdk::power::Wear::mode: paperpaw_sdk::Id
pub fn paperpaw_sdk::power::Wear::automatic(self) -> Self
pub fn paperpaw_sdk::power::Wear::new(paperpaw_sdk::Id) -> Self
pub enum paperpaw_sdk::power::PowerLevel
pub paperpaw_sdk::power::PowerLevel::Normal
pub paperpaw_sdk::power::PowerLevel::Offline
pub paperpaw_sdk::power::PowerLevel::Saving
pub const fn paperpaw_sdk::power::PowerLevel::as_str(self) -> &'static str
pub fn paperpaw_sdk::power::PowerLevel::parse(&str) -> core::option::Option<Self>
pub const paperpaw_sdk::power::AUTOMATIC: &str
pub const paperpaw_sdk::power::LEVEL: paperpaw_sdk::Id
pub const paperpaw_sdk::power::MODE_KIND: paperpaw_sdk::Id
pub const paperpaw_sdk::power::NORMAL: paperpaw_sdk::Id
pub const paperpaw_sdk::power::OFFLINE: paperpaw_sdk::Id
pub const paperpaw_sdk::power::SAVING: paperpaw_sdk::Id
pub const paperpaw_sdk::power::STRETCH: paperpaw_sdk::Id
```
