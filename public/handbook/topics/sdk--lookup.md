```rust
pub struct paperpaw_sdk::lookup::Asked
pub paperpaw_sdk::lookup::Asked::commands: alloc::vec::Vec<paperpaw_sdk::Command>
pub paperpaw_sdk::lookup::Asked::entries: alloc::vec::Vec<paperpaw_sdk::lookup::LookupEntry>
pub paperpaw_sdk::lookup::Asked::pending: alloc::vec::Vec<paperpaw_sdk::Id>
pub struct paperpaw_sdk::lookup::LookupEntry
pub paperpaw_sdk::lookup::LookupEntry::more: core::option::Option<paperpaw_sdk::Id>
pub paperpaw_sdk::lookup::LookupEntry::source: alloc::string::String
pub paperpaw_sdk::lookup::LookupEntry::text: alloc::string::String
pub fn paperpaw_sdk::lookup::LookupEntry::more(self, paperpaw_sdk::Id) -> Self
pub fn paperpaw_sdk::lookup::LookupEntry::new(impl core::convert::Into<alloc::string::String>, impl core::convert::Into<alloc::string::String>) -> Self
pub struct paperpaw_sdk::lookup::LookupProviderSpec
pub paperpaw_sdk::lookup::LookupProviderSpec::id: paperpaw_sdk::Id
pub paperpaw_sdk::lookup::LookupProviderSpec::languages: alloc::vec::Vec<alloc::borrow::Cow<'static, str>>
pub paperpaw_sdk::lookup::LookupProviderSpec::lookup: paperpaw_sdk::lookup::LookupFn
pub paperpaw_sdk::lookup::LookupProviderSpec::online: bool
pub paperpaw_sdk::lookup::LookupProviderSpec::title: alloc::borrow::Cow<'static, str>
pub fn paperpaw_sdk::lookup::LookupProviderSpec::languages(self, &[&'static str]) -> Self
pub fn paperpaw_sdk::lookup::LookupProviderSpec::new(paperpaw_sdk::Id, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, impl core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::lookup::LookupQuery) -> paperpaw_sdk::lookup::LookupAnswer + 'static) -> Self
pub fn paperpaw_sdk::lookup::LookupProviderSpec::online(self) -> Self
pub fn paperpaw_sdk::lookup::LookupProviderSpec::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::lookup::LookupProviders
pub fn paperpaw_sdk::lookup::LookupProviders::ask(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::lookup::LookupQuery, bool, &[paperpaw_sdk::Id]) -> paperpaw_sdk::lookup::Asked
pub fn paperpaw_sdk::lookup::LookupProviders::fitting<'s>(&'s self, &paperpaw_sdk::Env<'_>, &'s paperpaw_sdk::lookup::LookupQuery, bool) -> impl core::iter::traits::iterator::Iterator<Item = &'s paperpaw_sdk::lookup::LookupProviderSpec>
pub fn paperpaw_sdk::lookup::LookupProviders::get(&self, &paperpaw_sdk::Id) -> core::option::Option<&paperpaw_sdk::lookup::LookupProviderSpec>
pub fn paperpaw_sdk::lookup::LookupProviders::is_empty(&self) -> bool
pub fn paperpaw_sdk::lookup::LookupProviders::new() -> Self
pub struct paperpaw_sdk::lookup::LookupQuery
pub paperpaw_sdk::lookup::LookupQuery::language: core::option::Option<alloc::string::String>
pub paperpaw_sdk::lookup::LookupQuery::reply: paperpaw_sdk::Id
pub paperpaw_sdk::lookup::LookupQuery::word: alloc::string::String
pub fn paperpaw_sdk::lookup::LookupQuery::answer(&self, &paperpaw_sdk::Id, impl core::convert::Into<alloc::string::String>, impl core::convert::Into<alloc::string::String>) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::lookup::LookupQuery::answer_entry(&self, &paperpaw_sdk::Id, paperpaw_sdk::lookup::LookupEntry) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::lookup::LookupQuery::new(impl core::convert::Into<alloc::string::String>, core::option::Option<alloc::string::String>) -> Self
pub fn paperpaw_sdk::lookup::LookupQuery::reply(self, paperpaw_sdk::Id) -> Self
pub enum paperpaw_sdk::lookup::LookupAnswer
pub paperpaw_sdk::lookup::LookupAnswer::Pending(alloc::vec::Vec<paperpaw_sdk::Command>)
pub paperpaw_sdk::lookup::LookupAnswer::Ready(alloc::vec::Vec<paperpaw_sdk::lookup::LookupEntry>)
pub type paperpaw_sdk::lookup::LookupFn = alloc::boxed::Box<dyn core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::lookup::LookupQuery) -> paperpaw_sdk::lookup::LookupAnswer>
```
