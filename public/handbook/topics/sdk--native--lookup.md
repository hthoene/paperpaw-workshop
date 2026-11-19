```rust
pub struct paperpaw_sdk::native::lookup::Lookup
pub fn paperpaw_sdk::native::lookup::Lookup::ask<'a>(&self, &paperpaw_sdk::native::Host<'_>, &paperpaw_sdk::native::lookup::Question<'_>, &mut [u8], &'a mut [u8]) -> core::result::Result<core::option::Option<paperpaw_sdk::native::lookup::ProviderEntry<'a>>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::lookup::Lookup::open(&paperpaw_sdk::native::Host<'_>) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::lookup::Lookup::release(self, &paperpaw_sdk::native::Host<'_>) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub struct paperpaw_sdk::native::lookup::Ask<'a>(_)
pub const fn paperpaw_sdk::native::lookup::Ask<'a>::context(&self) -> &'a str
pub const fn paperpaw_sdk::native::lookup::Ask<'a>::cursor(&self) -> u32
pub fn paperpaw_sdk::native::lookup::Ask<'a>::decode(&'a [u8]) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::lookup::Ask<'a>::language(&self) -> core::option::Option<&'a str>
pub const fn paperpaw_sdk::native::lookup::Ask<'a>::text(&self) -> &'a str
pub struct paperpaw_sdk::native::lookup::Entry<'a>
pub const fn paperpaw_sdk::native::lookup::Entry<'a>::more(self) -> Self
pub fn paperpaw_sdk::native::lookup::Entry<'a>::new(&'a str, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::lookup::Entry<'a>::opens(self, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::lookup::Entry<'a>::pending(&'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub struct paperpaw_sdk::native::lookup::ProviderEntry<'a>(_)
pub const fn paperpaw_sdk::native::lookup::ProviderEntry<'a>::more(&self) -> bool
pub fn paperpaw_sdk::native::lookup::ProviderEntry<'a>::opens(&self) -> core::option::Option<&'a str>
pub const fn paperpaw_sdk::native::lookup::ProviderEntry<'a>::pending(&self) -> bool
pub const fn paperpaw_sdk::native::lookup::ProviderEntry<'a>::provider(&self) -> &'a str
pub const fn paperpaw_sdk::native::lookup::ProviderEntry<'a>::text(&self) -> &'a str
pub const fn paperpaw_sdk::native::lookup::ProviderEntry<'a>::title(&self) -> &'a str
pub struct paperpaw_sdk::native::lookup::Question<'a>
pub fn paperpaw_sdk::native::lookup::Question<'a>::context(self, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::lookup::Question<'a>::cursor(self, u32) -> Self
pub fn paperpaw_sdk::native::lookup::Question<'a>::language(self, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::lookup::Question<'a>::new(&'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub const paperpaw_sdk::native::lookup::BUFFER: usize
pub const paperpaw_sdk::native::lookup::MAX_CONTEXT: usize
pub const paperpaw_sdk::native::lookup::MAX_ENTRY: usize
pub const paperpaw_sdk::native::lookup::MAX_LANGUAGE: usize
pub const paperpaw_sdk::native::lookup::MAX_OPENS: usize
pub const paperpaw_sdk::native::lookup::MAX_TEXT: usize
pub const paperpaw_sdk::native::lookup::MAX_TITLE: usize
pub fn paperpaw_sdk::native::lookup::answer(&mut paperpaw_sdk::native::reply::Reply<'_>, &paperpaw_sdk::native::lookup::Entry<'_>) -> core::result::Result<(), paperpaw_sdk::native::Error>
```
