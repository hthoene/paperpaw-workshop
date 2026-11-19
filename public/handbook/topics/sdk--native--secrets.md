```rust
pub struct paperpaw_sdk::native::secrets::SecretList
pub const fn paperpaw_sdk::native::secrets::SecretList::all() -> Self
pub const fn paperpaw_sdk::native::secrets::SecretList::cursor(self) -> u32
pub const fn paperpaw_sdk::native::secrets::SecretList::from(self, u32) -> Self
pub const fn paperpaw_sdk::native::secrets::SecretList::includes_all(self) -> bool
pub const fn paperpaw_sdk::native::secrets::SecretList::own() -> Self
pub struct paperpaw_sdk::native::secrets::SecretPageEnd
pub const fn paperpaw_sdk::native::secrets::SecretPageEnd::next(self) -> core::option::Option<u32>
pub const fn paperpaw_sdk::native::secrets::SecretPageEnd::total(self) -> u32
pub struct paperpaw_sdk::native::secrets::Secrets
pub fn paperpaw_sdk::native::secrets::Secrets::get<'a>(&self, &paperpaw_sdk::native::Host<'_>, &str, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::secrets::SecretValue<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::secrets::Secrets::keep(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::secrets::SecretWrite<'_>, &mut [u8], &mut [u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::secrets::Secrets::list<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::secrets::SecretList, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::secrets::SecretPage<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::secrets::Secrets::random<'a>(&self, &paperpaw_sdk::native::Host<'_>, usize, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::secrets::RandomBytes<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::secrets::Secrets::remove(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::secrets::SecretName<'_>, &mut [u8], &mut [u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::secrets::Secrets::open(&paperpaw_sdk::native::Host<'_>) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::secrets::Secrets::release(self, &paperpaw_sdk::native::Host<'_>) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub struct paperpaw_sdk::native::secrets::RandomBytes<'a>(_)
pub const fn paperpaw_sdk::native::secrets::RandomBytes<'a>::bytes(self) -> &'a [u8]
pub const fn paperpaw_sdk::native::secrets::RandomBytes<'a>::strong(self) -> bool
pub fn paperpaw_sdk::native::secrets::RandomBytes<'_>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::native::secrets::SecretEntry<'a>(_)
pub const fn paperpaw_sdk::native::secrets::SecretEntry<'a>::changeable(self) -> bool
pub const fn paperpaw_sdk::native::secrets::SecretEntry<'a>::label(self) -> &'a str
pub const fn paperpaw_sdk::native::secrets::SecretEntry<'a>::name(self) -> &'a str
pub const fn paperpaw_sdk::native::secrets::SecretEntry<'a>::plugin(self) -> &'a str
pub fn paperpaw_sdk::native::secrets::SecretEntry<'a>::replacement(self, &'a str) -> core::result::Result<paperpaw_sdk::native::secrets::SecretWrite<'a>, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::secrets::SecretEntry<'a>::target(self) -> paperpaw_sdk::native::secrets::SecretName<'a>
pub struct paperpaw_sdk::native::secrets::SecretName<'a>
pub const fn paperpaw_sdk::native::secrets::SecretName<'a>::name(self) -> &'a str
pub fn paperpaw_sdk::native::secrets::SecretName<'a>::new(&'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::secrets::SecretName<'a>::owner(self, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::secrets::SecretName<'a>::plugin(self) -> &'a str
pub struct paperpaw_sdk::native::secrets::SecretPage<'a>
pub const fn paperpaw_sdk::native::secrets::SecretPage<'a>::end(&self) -> paperpaw_sdk::native::secrets::SecretPageEnd
pub type paperpaw_sdk::native::secrets::SecretPage<'a>::Item = core::result::Result<paperpaw_sdk::native::secrets::SecretEntry<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::secrets::SecretPage<'a>::next(&mut self) -> core::option::Option<Self::Item>
pub struct paperpaw_sdk::native::secrets::SecretValue<'a>(_)
pub const fn paperpaw_sdk::native::secrets::SecretValue<'a>::changeable(self) -> bool
pub const fn paperpaw_sdk::native::secrets::SecretValue<'a>::label(self) -> &'a str
pub const fn paperpaw_sdk::native::secrets::SecretValue<'a>::value(self) -> &'a str
pub struct paperpaw_sdk::native::secrets::SecretWrite<'a>
pub const fn paperpaw_sdk::native::secrets::SecretWrite<'a>::changeable(self) -> Self
pub const fn paperpaw_sdk::native::secrets::SecretWrite<'a>::display_label(self) -> &'a str
pub const fn paperpaw_sdk::native::secrets::SecretWrite<'a>::is_changeable(self) -> bool
pub fn paperpaw_sdk::native::secrets::SecretWrite<'a>::label(self, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::secrets::SecretWrite<'a>::new(paperpaw_sdk::native::secrets::SecretName<'a>, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::secrets::SecretWrite<'a>::target(self) -> paperpaw_sdk::native::secrets::SecretName<'a>
pub const fn paperpaw_sdk::native::secrets::SecretWrite<'a>::value(self) -> &'a str
pub fn paperpaw_sdk::native::secrets::SecretWrite<'_>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub fn paperpaw_sdk::native::secrets::wipe(&mut [u8])
```
