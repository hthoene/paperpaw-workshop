```rust
pub use paperpaw_sdk::native::BadSignature
pub use paperpaw_sdk::native::Chip
pub use paperpaw_sdk::native::HEADER_LEN
pub use paperpaw_sdk::native::Header
pub use paperpaw_sdk::native::Problem
pub use paperpaw_sdk::native::Signature
pub use paperpaw_sdk::native::signature
pub paperpaw_sdk::native::Author::Known
pub paperpaw_sdk::native::Author::New
pub paperpaw_sdk::native::Author::Other
pub paperpaw_sdk::native::NotInstalledReason::Damaged
pub paperpaw_sdk::native::NotInstalledReason::OtherAuthor
pub paperpaw_sdk::native::SafeModeReason::FailedStarts
pub paperpaw_sdk::native::SafeModeReason::KeyHeld
pub paperpaw_sdk::native::CodeRoom::granule: u32
pub paperpaw_sdk::native::CodeRoom::max_plugins: core::option::Option<u32>
pub paperpaw_sdk::native::CodeRoom::placed: u32
pub paperpaw_sdk::native::CodeRoom::shared: bool
pub paperpaw_sdk::native::CodeRoom::total: u64
pub paperpaw_sdk::native::CodeRoom::used: u64
pub fn paperpaw_sdk::native::CodeRoom::fits(&self, u64, u32, u64) -> bool
pub fn paperpaw_sdk::native::CodeRoom::in_flash(u32, u32, u32, u32) -> Self
pub fn paperpaw_sdk::native::CodeRoom::in_psram(u64, u64, u32) -> Self
pub fn paperpaw_sdk::native::CodeRoom::left(&self, u64) -> u64
pub fn paperpaw_sdk::native::CodeRoom::needs(&self, u64, u32) -> u64
pub fn paperpaw_sdk::native::CodeRoom::new(u64, u64, u32) -> Self
pub fn paperpaw_sdk::native::CodeRoom::shared(self) -> Self
pub fn paperpaw_sdk::native::CodeRoom::with_plugins(self, u32, core::option::Option<u32>) -> Self
pub struct paperpaw_sdk::native::Fingerprint(pub u64)
pub fn paperpaw_sdk::native::Fingerprint::parse(&str) -> core::option::Option<paperpaw_sdk::native::Fingerprint>
pub fn paperpaw_sdk::native::Fingerprint::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub paperpaw_sdk::native::Native::file: alloc::borrow::Cow<'static, str>
pub paperpaw_sdk::native::Native::fingerprint: paperpaw_sdk::native::Fingerprint
pub paperpaw_sdk::native::Native::not_installed: alloc::vec::Vec<paperpaw_sdk::native::NotInstalled>
pub paperpaw_sdk::native::Native::safe_mode: core::option::Option<paperpaw_sdk::native::SafeMode>
pub paperpaw_sdk::native::Native::toolchain: alloc::borrow::Cow<'static, str>
pub fn paperpaw_sdk::native::Native::new(impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> Self
pub fn paperpaw_sdk::native::Native::path(&self, &str) -> alloc::string::String
pub paperpaw_sdk::native::NotInstalled::plugin: paperpaw_sdk::Id
pub paperpaw_sdk::native::NotInstalled::reason: paperpaw_sdk::native::NotInstalledReason
pub fn paperpaw_sdk::native::NotInstalled::new(paperpaw_sdk::Id, paperpaw_sdk::native::NotInstalledReason) -> Self
pub paperpaw_sdk::native::SafeMode::crashed: core::option::Option<alloc::string::String>
pub paperpaw_sdk::native::SafeMode::last_loaded: core::option::Option<alloc::string::String>
pub paperpaw_sdk::native::SafeMode::reason: paperpaw_sdk::native::SafeModeReason
pub paperpaw_sdk::native::SafeMode::switched_off: alloc::vec::Vec<paperpaw_sdk::Id>
pub fn paperpaw_sdk::native::SafeMode::new(paperpaw_sdk::native::SafeModeReason) -> Self
pub const paperpaw_sdk::native::CODE_FILES: &[&str]
pub const paperpaw_sdk::native::FINGERPRINT: paperpaw_sdk::native::Fingerprint
pub const paperpaw_sdk::native::TOOLCHAIN: &str
pub fn paperpaw_sdk::native::author(&dyn paperpaw_platform::storage::Storage, &str, &[u8; 32]) -> paperpaw_sdk::native::Author
pub fn paperpaw_sdk::native::check_file(&dyn paperpaw_platform::storage::Storage, &str) -> core::result::Result<(paperpaw_native::header::Header, core::option::Option<paperpaw_native::signature::Signature>), paperpaw_native::header::Problem>
pub fn paperpaw_sdk::native::code_room(&dyn paperpaw_platform::storage::Storage) -> core::option::Option<paperpaw_sdk::native::CodeRoom>
pub fn paperpaw_sdk::native::fetched_code(&dyn paperpaw_platform::storage::Storage, &str) -> core::option::Option<[u8; 32]>
pub fn paperpaw_sdk::native::fetched_folder(&str) -> alloc::string::String
pub fn paperpaw_sdk::native::fetched_for(&dyn paperpaw_platform::storage::Storage, &paperpaw_sdk::native::Native) -> alloc::vec::Vec<(alloc::string::String, [u8; 32])>
pub fn paperpaw_sdk::native::fetched_plugin(&str) -> core::option::Option<&str>
pub fn paperpaw_sdk::native::installed_code(&dyn paperpaw_platform::storage::Storage, &str) -> core::option::Option<[u8; 32]>
pub fn paperpaw_sdk::native::installed_code_need(&dyn paperpaw_platform::storage::Storage, &paperpaw_sdk::native::CodeRoom, &str) -> (u64, u32)
pub fn paperpaw_sdk::native::keep_code_room(&dyn paperpaw_platform::storage::Storage, core::option::Option<&paperpaw_sdk::native::CodeRoom>) -> bool
pub fn paperpaw_sdk::native::known_author(&dyn paperpaw_platform::storage::Storage, &str) -> core::option::Option<[u8; 32]>
pub fn paperpaw_sdk::native::read_header(&dyn paperpaw_platform::storage::Storage, &str) -> core::option::Option<paperpaw_native::header::Header>
pub fn paperpaw_sdk::native::remember_author(&dyn paperpaw_platform::storage::Storage, &str, &[u8; 32]) -> bool
pub fn paperpaw_sdk::native::remember_code(&dyn paperpaw_platform::storage::Storage, &str, &[u8; 32]) -> bool
pub fn paperpaw_sdk::native::remember_fetched(&dyn paperpaw_platform::storage::Storage, &str, &[u8; 32]) -> bool
pub unsafe fn paperpaw_sdk::native::take(*mut core::ffi::c_void) -> core::option::Option<alloc::boxed::Box<dyn paperpaw_sdk::Plugin>>
```
