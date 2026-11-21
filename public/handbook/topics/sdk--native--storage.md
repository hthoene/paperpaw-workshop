```rust
pub enum paperpaw_sdk::native::storage::Root
pub paperpaw_sdk::native::storage::Root::Book
pub paperpaw_sdk::native::storage::Root::Data
pub paperpaw_sdk::native::storage::Root::DocumentCache
pub paperpaw_sdk::native::storage::Root::Files
pub paperpaw_sdk::native::storage::Root::Install
pub paperpaw_sdk::native::storage::Root::PluginCss
pub paperpaw_sdk::native::storage::Root::UserCss
pub struct paperpaw_sdk::native::storage::DataStorage<'h, 'cb>
pub const fn paperpaw_sdk::native::storage::DataStorage<'h, 'cb>::new(&'h paperpaw_sdk::native::Host<'cb>) -> Self
pub fn paperpaw_sdk::native::storage::DataStorage<'_, '_>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub fn paperpaw_sdk::native::storage::DataStorage<'_, '_>::append(&self, &str, &[u8]) -> core::result::Result<(), paperpaw_platform::storage::StorageError>
pub fn paperpaw_sdk::native::storage::DataStorage<'_, '_>::list(&self, &str, &mut dyn core::ops::function::FnMut(paperpaw_platform::storage::DirEntry<'_>)) -> core::result::Result<(), paperpaw_platform::storage::StorageError>
pub fn paperpaw_sdk::native::storage::DataStorage<'_, '_>::read_at(&self, &str, u64, &mut [u8]) -> core::result::Result<usize, paperpaw_platform::storage::StorageError>
pub fn paperpaw_sdk::native::storage::DataStorage<'_, '_>::remove(&self, &str) -> core::result::Result<(), paperpaw_platform::storage::StorageError>
pub fn paperpaw_sdk::native::storage::DataStorage<'_, '_>::rename(&self, &str, &str) -> core::result::Result<(), paperpaw_platform::storage::StorageError>
pub fn paperpaw_sdk::native::storage::DataStorage<'_, '_>::size(&self, &str) -> core::result::Result<u64, paperpaw_platform::storage::StorageError>
pub fn paperpaw_sdk::native::storage::DataStorage<'_, '_>::sync(&self) -> core::result::Result<(), paperpaw_platform::storage::StorageError>
pub fn paperpaw_sdk::native::storage::DataStorage<'_, '_>::write(&self, &str, &[u8]) -> core::result::Result<(), paperpaw_platform::storage::StorageError>
pub const paperpaw_sdk::native::storage::MAX_DATA: usize
pub const paperpaw_sdk::native::storage::MAX_PATH: usize
pub const paperpaw_sdk::native::storage::MAX_SEGMENT: usize
pub const paperpaw_sdk::native::storage::STAGED_SUFFIX: &str
pub fn paperpaw_sdk::native::storage::append(&paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::storage::Root, impl core::convert::AsRef<str>, &[u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::storage::read_at(&paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::storage::Root, impl core::convert::AsRef<str>, u64, &mut [u8]) -> core::result::Result<usize, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::storage::remove(&paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::storage::Root, impl core::convert::AsRef<str>) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::storage::rename(&paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::storage::Root, impl core::convert::AsRef<str>, impl core::convert::AsRef<str>) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::storage::size(&paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::storage::Root, impl core::convert::AsRef<str>) -> core::result::Result<u64, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::storage::sync(&paperpaw_sdk::native::Host<'_>) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::storage::write(&paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::storage::Root, impl core::convert::AsRef<str>, &[u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
```
