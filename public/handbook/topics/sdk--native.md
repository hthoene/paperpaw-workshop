```rust
pub trait paperpaw_sdk::native::Plugin: core::marker::Sized + 'static
pub struct paperpaw_sdk::native::CodeRoom
pub paperpaw_sdk::native::CodeRoom::granule: u32
pub paperpaw_sdk::native::CodeRoom::larger: core::option::Option<u64>
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
pub struct paperpaw_sdk::native::Linked(_)
pub fn paperpaw_sdk::native::Linked::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::native::Native
pub paperpaw_sdk::native::Native::api_size: u32
pub paperpaw_sdk::native::Native::compiler: u32
pub paperpaw_sdk::native::Native::family_min: [u16; 8]
pub paperpaw_sdk::native::Native::family_revs: [u16; 8]
pub paperpaw_sdk::native::Native::file: alloc::borrow::Cow<'static, str>
pub paperpaw_sdk::native::Native::fingerprint: paperpaw_sdk::native::Fingerprint
pub paperpaw_sdk::native::Native::minor: u16
pub paperpaw_sdk::native::Native::not_installed: alloc::vec::Vec<paperpaw_sdk::native::NotInstalled>
pub paperpaw_sdk::native::Native::safe_mode: core::option::Option<paperpaw_sdk::native::SafeMode>
pub paperpaw_sdk::native::Native::toolchain: alloc::borrow::Cow<'static, str>
pub fn paperpaw_sdk::native::Native::new(impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> Self
pub fn paperpaw_sdk::native::Native::path(&self, &str) -> alloc::string::String
pub fn paperpaw_sdk::native::Native::problem_of_file(&[u8], paperpaw_native::header::Problem) -> paperpaw_sdk::plugins::PluginProblem
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
pub struct paperpaw_sdk::native::__heap::Message
pub fn paperpaw_sdk::native::__heap::Message::as_str(&self) -> &str
pub fn paperpaw_sdk::native::__heap::Message::code(&self) -> i32
pub const fn paperpaw_sdk::native::__heap::Message::new() -> Self
pub fn paperpaw_sdk::native::__heap::Message::default() -> Self
pub fn paperpaw_sdk::native::__heap::Message::write_str(&mut self, &str) -> core::fmt::Result
pub enum paperpaw_sdk::native::Author
pub paperpaw_sdk::native::Author::Known
pub paperpaw_sdk::native::Author::New
pub paperpaw_sdk::native::Author::Other
pub enum paperpaw_sdk::native::Error
pub paperpaw_sdk::native::Error::Busy
pub paperpaw_sdk::native::Error::Cancelled
pub paperpaw_sdk::native::Error::Denied
pub paperpaw_sdk::native::Error::Full
pub paperpaw_sdk::native::Error::Invalid
pub paperpaw_sdk::native::Error::Io
pub paperpaw_sdk::native::Error::NoMemory
pub paperpaw_sdk::native::Error::NoSpace
pub paperpaw_sdk::native::Error::NotFound
pub paperpaw_sdk::native::Error::Other(i32)
pub paperpaw_sdk::native::Error::State
pub paperpaw_sdk::native::Error::Timeout
pub paperpaw_sdk::native::Error::Unsupported
pub paperpaw_sdk::native::Error::Utf8
pub fn paperpaw_sdk::native::Error::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub enum paperpaw_sdk::native::NotInstalledReason
pub paperpaw_sdk::native::NotInstalledReason::Damaged
pub paperpaw_sdk::native::NotInstalledReason::OtherAuthor
pub enum paperpaw_sdk::native::SafeModeReason
pub paperpaw_sdk::native::SafeModeReason::FailedStarts
pub paperpaw_sdk::native::SafeModeReason::KeyHeld
pub paperpaw_sdk::native::SafeModeReason::PowerEscape
pub use paperpaw_sdk::native::BadSignature
pub use paperpaw_sdk::native::Chip
pub use paperpaw_sdk::native::HEADER_LEN
pub use paperpaw_sdk::native::Header
pub use paperpaw_sdk::native::Problem
pub use paperpaw_sdk::native::Signature
pub use paperpaw_sdk::native::__heap::PpHeap
pub struct paperpaw_sdk::native::Host<'cb>
pub fn paperpaw_sdk::native::Host<'_>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub const paperpaw_sdk::native::CODE_FILES: &[&str]
pub const paperpaw_sdk::native::DRAFT: u16
pub const paperpaw_sdk::native::FINGERPRINT: paperpaw_sdk::native::Fingerprint
pub const paperpaw_sdk::native::INTERFACE: u16
pub const paperpaw_sdk::native::LAYOUT: u64
pub const paperpaw_sdk::native::TOOLCHAIN: &str
pub const paperpaw_sdk::native::__heap::ABORT_ALLOCATION: i32
pub const paperpaw_sdk::native::__heap::ABORT_MESSAGE_BYTES: usize
pub const paperpaw_sdk::native::__heap::ABORT_PANIC: i32
pub const paperpaw_sdk::native::__heap::NAMES: (&str, &str, &str)
pub unsafe fn paperpaw_sdk::native::__heap::alloc(*const paperpaw_native::host_glue::generated::PpHeap, core::alloc::layout::Layout) -> *mut u8
pub unsafe fn paperpaw_sdk::native::__heap::dealloc(*const paperpaw_native::host_glue::generated::PpHeap, *mut u8, core::alloc::layout::Layout)
pub unsafe fn paperpaw_sdk::native::__heap::panic(*const paperpaw_native::host_glue::generated::PpHeap, &core::panic::panic_info::PanicInfo<'_>) -> never
pub unsafe fn paperpaw_sdk::native::__heap::realloc(*const paperpaw_native::host_glue::generated::PpHeap, *mut u8, core::alloc::layout::Layout, usize) -> *mut u8
pub fn paperpaw_sdk::native::__heap::trap() -> never
pub fn paperpaw_sdk::native::Plugin::draw(&mut self, &paperpaw_sdk::native::Host<'_>, u32, paperpaw_sdk::native::callbacks::DrawFrame<'_>) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::Plugin::event(&mut self, &paperpaw_sdk::native::Host<'_>, u32, paperpaw_sdk::native::events::Incoming<'_>, &mut paperpaw_sdk::native::reply::Reply<'_>) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::Plugin::input(&mut self, &paperpaw_sdk::native::Host<'_>, u32, paperpaw_sdk::native::callbacks::Input<'_>) -> core::result::Result<paperpaw_sdk::Handled, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::Plugin::make(&paperpaw_sdk::native::Host<'_>) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::author(&dyn paperpaw_platform::storage::Storage, &str, &[u8; 32]) -> paperpaw_sdk::native::Author
pub fn paperpaw_sdk::native::code_room(&dyn paperpaw_platform::storage::Storage) -> core::option::Option<paperpaw_sdk::native::CodeRoom>
pub fn paperpaw_sdk::native::fetched_code(&dyn paperpaw_platform::storage::Storage, &str) -> core::option::Option<[u8; 32]>
pub fn paperpaw_sdk::native::fetched_folder(&str) -> alloc::string::String
pub fn paperpaw_sdk::native::fetched_plugin(&str) -> core::option::Option<&str>
pub fn paperpaw_sdk::native::installed_code(&dyn paperpaw_platform::storage::Storage, &str) -> core::option::Option<[u8; 32]>
pub fn paperpaw_sdk::native::known_author(&dyn paperpaw_platform::storage::Storage, &str) -> core::option::Option<[u8; 32]>
pub fn paperpaw_sdk::native::read_header(&dyn paperpaw_platform::storage::Storage, &str) -> core::option::Option<paperpaw_native::header::Header>
pub use paperpaw_sdk::native::compiler
pub use paperpaw_sdk::native::signature
pub mod paperpaw_sdk::native::__heap
pub mod paperpaw_sdk::native::callbacks
pub mod paperpaw_sdk::native::canvas
pub mod paperpaw_sdk::native::clock
pub mod paperpaw_sdk::native::commands
pub mod paperpaw_sdk::native::convert
pub mod paperpaw_sdk::native::declare
pub mod paperpaw_sdk::native::device
pub mod paperpaw_sdk::native::document
pub mod paperpaw_sdk::native::events
pub mod paperpaw_sdk::native::files
pub mod paperpaw_sdk::native::fonts
pub mod paperpaw_sdk::native::format
pub mod paperpaw_sdk::native::formatting
pub mod paperpaw_sdk::native::i18n
pub mod paperpaw_sdk::native::image
pub mod paperpaw_sdk::native::keys
pub mod paperpaw_sdk::native::library
pub mod paperpaw_sdk::native::lookup
pub mod paperpaw_sdk::native::net
pub mod paperpaw_sdk::native::page_layers
pub mod paperpaw_sdk::native::registrations
pub mod paperpaw_sdk::native::registry
pub mod paperpaw_sdk::native::reply
pub mod paperpaw_sdk::native::secrets
pub mod paperpaw_sdk::native::services
pub mod paperpaw_sdk::native::settings
pub mod paperpaw_sdk::native::snapshot
pub mod paperpaw_sdk::native::sockets
pub mod paperpaw_sdk::native::stage_schemas
pub mod paperpaw_sdk::native::stages
pub mod paperpaw_sdk::native::storage
pub mod paperpaw_sdk::native::text
pub mod paperpaw_sdk::native::ui
pub mod paperpaw_sdk::native::work
```
