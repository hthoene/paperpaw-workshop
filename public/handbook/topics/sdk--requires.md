```rust
pub struct paperpaw_sdk::requires::Requirement
pub paperpaw_sdk::requires::Requirement::at_least: core::option::Option<paperpaw_sdk::Version>
pub paperpaw_sdk::requires::Requirement::id: paperpaw_sdk::Id
pub fn paperpaw_sdk::requires::Requirement::met_by(&self, paperpaw_sdk::Version) -> bool
pub fn paperpaw_sdk::requires::Requirement::new(paperpaw_sdk::Id, core::option::Option<paperpaw_sdk::Version>) -> Self
pub const paperpaw_sdk::requires::MAX_REQUIRED: usize
pub fn paperpaw_sdk::requires::missing<'a>(&'a [paperpaw_sdk::requires::Requirement], &[(&str, paperpaw_sdk::Version)]) -> impl core::iter::traits::iterator::Iterator<Item = &'a paperpaw_sdk::requires::Requirement> + 'a
pub fn paperpaw_sdk::requires::of(&dyn paperpaw_platform::storage::Storage, &str) -> alloc::vec::Vec<paperpaw_sdk::requires::Requirement>
pub fn paperpaw_sdk::requires::parse(&str, &str) -> core::result::Result<alloc::vec::Vec<paperpaw_sdk::requires::Requirement>, alloc::string::String>
```
