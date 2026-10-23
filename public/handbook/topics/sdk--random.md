```rust
pub struct paperpaw_sdk::random::Random
pub const paperpaw_sdk::random::Random::NONE: Self
pub fn paperpaw_sdk::random::Random::available(&self) -> bool
pub fn paperpaw_sdk::random::Random::fill(&self, &mut [u8]) -> bool
pub const fn paperpaw_sdk::random::Random::new(fn(&mut [u8]) -> bool) -> Self
pub fn paperpaw_sdk::random::Random::readable(&self, usize) -> core::option::Option<alloc::string::String>
pub fn paperpaw_sdk::random::Random::token(&self, usize) -> core::option::Option<alloc::string::String>
pub fn paperpaw_sdk::random::Random::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub const paperpaw_sdk::random::READABLE: &str
pub fn paperpaw_sdk::random::grouped(&str) -> alloc::string::String
pub const fn paperpaw_sdk::random::readable_letters(u32) -> usize
```
