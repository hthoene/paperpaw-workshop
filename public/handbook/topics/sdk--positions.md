```rust
pub struct paperpaw_sdk::positions::Position
pub paperpaw_sdk::positions::Position::at: paperpaw_document::Locator
pub paperpaw_sdk::positions::Position::conversion: core::option::Option<u64>
pub paperpaw_sdk::positions::Position::percent: f32
pub paperpaw_sdk::positions::Position::updated: i64
pub paperpaw_sdk::positions::Position::xpointer: core::option::Option<alloc::string::String>
pub fn paperpaw_sdk::positions::Position::conversion(self, u64) -> Self
pub fn paperpaw_sdk::positions::Position::new(paperpaw_document::Locator, f32) -> Self
pub fn paperpaw_sdk::positions::Position::parse(&str) -> core::option::Option<paperpaw_sdk::positions::Position>
pub fn paperpaw_sdk::positions::Position::text(&self) -> alloc::string::String
pub fn paperpaw_sdk::positions::Position::updated(self, i64) -> Self
pub fn paperpaw_sdk::positions::Position::xpointer(self, impl core::convert::Into<core::option::Option<alloc::string::String>>) -> Self
pub const paperpaw_sdk::positions::DIR: &str
pub fn paperpaw_sdk::positions::file(&str) -> alloc::string::String
pub fn paperpaw_sdk::positions::load(&dyn paperpaw_platform::storage::Storage, &str) -> core::option::Option<paperpaw_sdk::positions::Position>
pub fn paperpaw_sdk::positions::save(&dyn paperpaw_platform::storage::Storage, &str, &paperpaw_sdk::positions::Position) -> core::result::Result<(), paperpaw_platform::storage::StorageError>
```
