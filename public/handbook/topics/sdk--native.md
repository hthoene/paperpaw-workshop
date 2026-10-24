```rust
pub struct paperpaw_sdk::native::CodeRoom
pub paperpaw_sdk::native::CodeRoom::granule: u32
pub paperpaw_sdk::native::CodeRoom::max_plugins: core::option::Option<u32>
pub paperpaw_sdk::native::CodeRoom::placed: u32
pub paperpaw_sdk::native::CodeRoom::shared: bool
pub paperpaw_sdk::native::CodeRoom::total: u64
pub paperpaw_sdk::native::CodeRoom::used: u64
pub fn paperpaw_sdk::native::CodeRoom::fits(&self, u64, u32, u64) -> bool
pub fn paperpaw_sdk::native::CodeRoom::left(&self, u64) -> u64
pub fn paperpaw_sdk::native::CodeRoom::needs(&self, u64, u32) -> u64
pub struct paperpaw_sdk::native::Fingerprint(pub u64)
pub const fn paperpaw_sdk::native::Fingerprint::interface(self) -> u16
pub fn paperpaw_sdk::native::Fingerprint::misfit(self) -> core::option::Option<alloc::string::String>
pub const fn paperpaw_sdk::native::Fingerprint::of(u16, u64) -> paperpaw_sdk::native::Fingerprint
pub fn paperpaw_sdk::native::Fingerprint::parse(&str) -> core::option::Option<paperpaw_sdk::native::Fingerprint>
pub fn paperpaw_sdk::native::Fingerprint::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::native::Native
pub paperpaw_sdk::native::Native::compiler: u32
pub paperpaw_sdk::native::Native::file: alloc::borrow::Cow<'static, str>
pub paperpaw_sdk::native::Native::fingerprint: paperpaw_sdk::native::Fingerprint
pub paperpaw_sdk::native::Native::not_installed: alloc::vec::Vec<paperpaw_sdk::native::NotInstalled>
pub paperpaw_sdk::native::Native::safe_mode: core::option::Option<paperpaw_sdk::native::SafeMode>
pub paperpaw_sdk::native::Native::toolchain: alloc::borrow::Cow<'static, str>
pub fn paperpaw_sdk::native::Native::fits(&self, &paperpaw_native::header::Header) -> bool
pub fn paperpaw_sdk::native::Native::new(impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> Self
pub fn paperpaw_sdk::native::Native::path(&self, &str) -> alloc::string::String
pub struct paperpaw_sdk::native::NotInstalled
pub paperpaw_sdk::native::NotInstalled::plugin: paperpaw_sdk::Id
pub paperpaw_sdk::native::NotInstalled::reason: paperpaw_sdk::native::NotInstalledReason
pub fn paperpaw_sdk::native::NotInstalled::new(paperpaw_sdk::Id, paperpaw_sdk::native::NotInstalledReason) -> Self
pub struct paperpaw_sdk::native::SafeMode
pub paperpaw_sdk::native::SafeMode::crashed: core::option::Option<alloc::string::String>
pub paperpaw_sdk::native::SafeMode::last_loaded: core::option::Option<alloc::string::String>
pub paperpaw_sdk::native::SafeMode::reason: paperpaw_sdk::native::SafeModeReason
pub paperpaw_sdk::native::SafeMode::switched_off: alloc::vec::Vec<paperpaw_sdk::Id>
pub fn paperpaw_sdk::native::SafeMode::new(paperpaw_sdk::native::SafeModeReason) -> Self
pub enum paperpaw_sdk::native::Author
pub paperpaw_sdk::native::Author::Known
pub paperpaw_sdk::native::Author::New
pub paperpaw_sdk::native::Author::Other
pub enum paperpaw_sdk::native::NotInstalledReason
pub paperpaw_sdk::native::NotInstalledReason::Damaged
pub paperpaw_sdk::native::NotInstalledReason::OtherAuthor
pub enum paperpaw_sdk::native::SafeModeReason
pub paperpaw_sdk::native::SafeModeReason::FailedStarts
pub paperpaw_sdk::native::SafeModeReason::KeyHeld
pub use paperpaw_sdk::native::BadSignature
pub use paperpaw_sdk::native::Chip
pub use paperpaw_sdk::native::HEADER_LEN
pub use paperpaw_sdk::native::Header
pub use paperpaw_sdk::native::Problem
pub use paperpaw_sdk::native::Signature
pub const paperpaw_sdk::native::CODE_FILES: &[&str]
pub const paperpaw_sdk::native::FINGERPRINT: paperpaw_sdk::native::Fingerprint
pub const paperpaw_sdk::native::INTERFACE: u16
pub const paperpaw_sdk::native::TOOLCHAIN: &str
pub fn paperpaw_sdk::native::author(&dyn paperpaw_platform::storage::Storage, &str, &[u8; 32]) -> paperpaw_sdk::native::Author
pub fn paperpaw_sdk::native::code_room(&dyn paperpaw_platform::storage::Storage) -> core::option::Option<paperpaw_sdk::native::CodeRoom>
pub fn paperpaw_sdk::native::fetched_code(&dyn paperpaw_platform::storage::Storage, &str) -> core::option::Option<[u8; 32]>
pub fn paperpaw_sdk::native::fetched_folder(&str) -> alloc::string::String
pub fn paperpaw_sdk::native::fetched_plugin(&str) -> core::option::Option<&str>
pub fn paperpaw_sdk::native::installed_code(&dyn paperpaw_platform::storage::Storage, &str) -> core::option::Option<[u8; 32]>
pub fn paperpaw_sdk::native::known_author(&dyn paperpaw_platform::storage::Storage, &str) -> core::option::Option<[u8; 32]>
pub fn paperpaw_sdk::native::read_header(&dyn paperpaw_platform::storage::Storage, &str) -> core::option::Option<paperpaw_native::header::Header>
pub unsafe fn paperpaw_sdk::native::take(*mut core::ffi::c_void) -> core::option::Option<alloc::boxed::Box<dyn paperpaw_sdk::Plugin>>
pub use paperpaw_sdk::native::compiler
pub use paperpaw_sdk::native::signature
```
