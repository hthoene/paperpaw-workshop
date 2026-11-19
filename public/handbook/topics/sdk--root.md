```rust
pub struct paperpaw_sdk::Version
pub paperpaw_sdk::Version::major: u16
pub paperpaw_sdk::Version::minor: u16
pub paperpaw_sdk::Version::patch: u16
pub const fn paperpaw_sdk::Version::is_pre_release(&self) -> bool
pub const fn paperpaw_sdk::Version::new(u16, u16, u16) -> Self
pub fn paperpaw_sdk::Version::parse(&str) -> core::option::Option<paperpaw_sdk::Version>
pub fn paperpaw_sdk::Version::pre_name(&self) -> core::option::Option<&'static str>
pub fn paperpaw_sdk::Version::pre_number(&self) -> core::option::Option<u16>
pub const fn paperpaw_sdk::Version::release(self) -> Self
pub fn paperpaw_sdk::Version::satisfies(&self, &paperpaw_sdk::Version) -> bool
pub fn paperpaw_sdk::Version::try_parse(&str) -> core::result::Result<paperpaw_sdk::Version, paperpaw_sdk::version::VersionError>
pub const fn paperpaw_sdk::Version::with_pre(self, &str) -> core::option::Option<Self>
pub fn paperpaw_sdk::Version::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub fn paperpaw_sdk::Version::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub enum paperpaw_sdk::Handled
pub paperpaw_sdk::Handled::No
pub paperpaw_sdk::Handled::Yes
pub use paperpaw_sdk::Color
pub use paperpaw_sdk::Point
pub use paperpaw_sdk::Rect
pub mod paperpaw_sdk::builtin
pub mod paperpaw_sdk::native
pub fn i32::from(paperpaw_sdk::native::Error) -> Self
```
