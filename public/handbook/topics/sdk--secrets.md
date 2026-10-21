```rust
pub struct paperpaw_sdk::secrets::Anyone
pub fn paperpaw_sdk::secrets::Anyone::runs(&self, &str) -> bool
pub struct paperpaw_sdk::secrets::Listed<'a>
pub paperpaw_sdk::secrets::Listed::changeable: bool
pub paperpaw_sdk::secrets::Listed::id: &'a str
pub paperpaw_sdk::secrets::Listed::label: &'a str
pub struct paperpaw_sdk::secrets::Secret
pub paperpaw_sdk::secrets::Secret::changeable: bool
pub paperpaw_sdk::secrets::Secret::id: alloc::string::String
pub paperpaw_sdk::secrets::Secret::label: alloc::string::String
pub paperpaw_sdk::secrets::Secret::value: alloc::string::String
pub fn paperpaw_sdk::secrets::Secret::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::secrets::SecretChange
pub paperpaw_sdk::secrets::SecretChange::changeable: bool
pub paperpaw_sdk::secrets::SecretChange::id: alloc::string::String
pub paperpaw_sdk::secrets::SecretChange::label: alloc::string::String
pub paperpaw_sdk::secrets::SecretChange::value: core::option::Option<alloc::string::String>
pub fn paperpaw_sdk::secrets::SecretChange::keep(&str, &str, &str) -> Self
pub fn paperpaw_sdk::secrets::SecretChange::remove(&str) -> Self
pub fn paperpaw_sdk::secrets::SecretChange::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::secrets::Secrets
pub fn paperpaw_sdk::secrets::Secrets::decode(&str) -> Self
pub fn paperpaw_sdk::secrets::Secrets::encode(&self) -> alloc::string::String
pub fn paperpaw_sdk::secrets::Secrets::get(&self, &str) -> core::option::Option<&str>
pub fn paperpaw_sdk::secrets::Secrets::is_empty(&self) -> bool
pub fn paperpaw_sdk::secrets::Secrets::iter(&self) -> impl core::iter::traits::iterator::Iterator<Item = &paperpaw_sdk::secrets::Secret>
pub struct paperpaw_sdk::secrets::Visible<'a>
pub fn paperpaw_sdk::secrets::Visible<'a>::get(&self, &str) -> core::option::Option<&'a str>
pub fn paperpaw_sdk::secrets::Visible<'a>::has(&self, &str) -> bool
pub fn paperpaw_sdk::secrets::Visible<'a>::is_empty(&self) -> bool
pub fn paperpaw_sdk::secrets::Visible<'a>::iter(&self) -> impl core::iter::traits::iterator::Iterator<Item = &'a paperpaw_sdk::secrets::Secret> + '_
pub fn paperpaw_sdk::secrets::Visible<'a>::listed(&self) -> impl core::iter::traits::iterator::Iterator<Item = paperpaw_sdk::secrets::Listed<'a>> + 'a
pub fn paperpaw_sdk::secrets::Visible<'a>::new(&'a paperpaw_sdk::secrets::Secrets, &'a dyn paperpaw_sdk::secrets::Running) -> Self
pub fn paperpaw_sdk::secrets::Visible<'_>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub const paperpaw_sdk::secrets::FILE: &str
pub trait paperpaw_sdk::secrets::Running
pub fn paperpaw_sdk::secrets::Running::runs(&self, &str) -> bool
pub fn paperpaw_sdk::secrets::Anyone::runs(&self, &str) -> bool
```
