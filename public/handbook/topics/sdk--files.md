```rust
pub struct paperpaw_sdk::files::Entry
pub paperpaw_sdk::files::Entry::is_dir: bool
pub paperpaw_sdk::files::Entry::name: alloc::string::String
pub paperpaw_sdk::files::Entry::size: u64
pub fn paperpaw_sdk::files::Entry::new(impl core::convert::Into<alloc::string::String>, bool, u64) -> Self
pub const paperpaw_sdk::files::MAX_LINE: usize
pub fn paperpaw_sdk::files::copy(&dyn paperpaw_platform::storage::Storage, &str, &str) -> core::result::Result<(), paperpaw_platform::storage::StorageError>
pub fn paperpaw_sdk::files::delete(&dyn paperpaw_platform::storage::Storage, &str) -> core::result::Result<(), paperpaw_platform::storage::StorageError>
pub fn paperpaw_sdk::files::for_each_line(&dyn paperpaw_platform::storage::Storage, &str, &mut dyn core::ops::function::FnMut(&str) -> core::ops::control_flow::ControlFlow<()>) -> core::result::Result<(), paperpaw_platform::storage::StorageError>
pub fn paperpaw_sdk::files::free_path(&dyn paperpaw_platform::storage::Storage, &str, &str) -> alloc::string::String
pub fn paperpaw_sdk::files::has_extension(&str, &str) -> bool
pub fn paperpaw_sdk::files::is_dir(&dyn paperpaw_platform::storage::Storage, &str) -> bool
pub fn paperpaw_sdk::files::is_hidden(&str) -> bool
pub fn paperpaw_sdk::files::is_plain_name(&str) -> bool
pub fn paperpaw_sdk::files::is_within(&dyn paperpaw_platform::storage::Storage, &str, &str) -> bool
pub fn paperpaw_sdk::files::join(&str, &str) -> alloc::string::String
pub fn paperpaw_sdk::files::list(&dyn paperpaw_platform::storage::Storage, &str, bool) -> core::result::Result<alloc::vec::Vec<paperpaw_sdk::files::Entry>, paperpaw_platform::storage::StorageError>
pub fn paperpaw_sdk::files::load_for_update(&dyn paperpaw_platform::storage::Storage, &str, usize) -> core::result::Result<core::option::Option<alloc::vec::Vec<u8>>, paperpaw_platform::storage::StorageError>
pub fn paperpaw_sdk::files::load_text_for_update(&dyn paperpaw_platform::storage::Storage, &str, usize) -> core::result::Result<core::option::Option<alloc::string::String>, paperpaw_platform::storage::StorageError>
pub fn paperpaw_sdk::files::move_to(&dyn paperpaw_platform::storage::Storage, &str, &str) -> core::result::Result<(), paperpaw_platform::storage::StorageError>
pub fn paperpaw_sdk::files::name(&str) -> &str
pub fn paperpaw_sdk::files::parent(&str) -> &str
pub fn paperpaw_sdk::files::part_path(&str) -> alloc::string::String
pub fn paperpaw_sdk::files::plain_path(&str) -> core::option::Option<alloc::string::String>
pub fn paperpaw_sdk::files::put_in_free_place(&dyn paperpaw_platform::storage::Storage, &str, &str, &str) -> core::result::Result<alloc::string::String, paperpaw_platform::storage::StorageError>
pub fn paperpaw_sdk::files::put_in_place(&dyn paperpaw_platform::storage::Storage, &str, &str) -> core::result::Result<(), paperpaw_platform::storage::StorageError>
pub fn paperpaw_sdk::files::read_text(&dyn paperpaw_platform::storage::Storage, &str, usize) -> core::result::Result<alloc::string::String, paperpaw_platform::storage::StorageError>
pub fn paperpaw_sdk::files::same_path(&dyn paperpaw_platform::storage::Storage, &str, &str) -> bool
pub fn paperpaw_sdk::files::size(u64, &str) -> alloc::string::String
pub fn paperpaw_sdk::files::without_bom(&[u8]) -> &[u8]
```
