```rust
pub struct paperpaw_sdk::served::Guard
pub fn paperpaw_sdk::served::Guard::check(&mut self, core::option::Option<&str>, paperpaw_platform::input::Instant) -> paperpaw_sdk::served::Access
pub fn paperpaw_sdk::served::Guard::check_target(&mut self, &str, paperpaw_platform::input::Instant) -> paperpaw_sdk::served::Access
pub fn paperpaw_sdk::served::Guard::new(alloc::string::String) -> Self
pub enum paperpaw_sdk::served::Access
pub paperpaw_sdk::served::Access::Denied
pub paperpaw_sdk::served::Access::Granted
pub paperpaw_sdk::served::Access::Locked
pub const paperpaw_sdk::served::KEY_LETTERS: usize
pub const paperpaw_sdk::served::LOCKED_FOR: u64
pub const paperpaw_sdk::served::WRONG_KEYS: u32
pub fn paperpaw_sdk::served::json_string(&str) -> alloc::string::String
pub fn paperpaw_sdk::served::key(&paperpaw_sdk::random::Random) -> core::option::Option<alloc::string::String>
pub fn paperpaw_sdk::served::param(&str, &str) -> core::option::Option<alloc::string::String>
```
