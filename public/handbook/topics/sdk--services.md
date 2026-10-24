```rust
pub unsafe trait paperpaw_sdk::services::ServiceType: core::any::Any
pub struct paperpaw_sdk::services::EventSpec
pub paperpaw_sdk::services::EventSpec::id: paperpaw_sdk::Id
pub paperpaw_sdk::services::EventSpec::params: &'static [&'static str]
pub paperpaw_sdk::services::EventSpec::title: alloc::borrow::Cow<'static, str>
pub fn paperpaw_sdk::services::EventSpec::new(paperpaw_sdk::Id, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> Self
pub fn paperpaw_sdk::services::EventSpec::params(self, &'static [&'static str]) -> Self
pub struct paperpaw_sdk::services::PointSpec
pub paperpaw_sdk::services::PointSpec::doc: alloc::borrow::Cow<'static, str>
pub paperpaw_sdk::services::PointSpec::id: paperpaw_sdk::Id
pub paperpaw_sdk::services::PointSpec::title: alloc::borrow::Cow<'static, str>
pub fn paperpaw_sdk::services::PointSpec::doc(self, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> Self
pub fn paperpaw_sdk::services::PointSpec::new(paperpaw_sdk::Id, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> Self
pub struct paperpaw_sdk::services::Service
pub fn paperpaw_sdk::services::Service::new<T: paperpaw_sdk::services::ServiceType>(T, paperpaw_sdk::Version) -> Self
pub fn paperpaw_sdk::services::Service::version(&self) -> paperpaw_sdk::Version
pub fn paperpaw_sdk::services::Service::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::services::Services
pub fn paperpaw_sdk::services::Services::contributed_points(&self) -> impl core::iter::traits::iterator::Iterator<Item = &paperpaw_sdk::Id>
pub fn paperpaw_sdk::services::Services::contributions<'a>(&'a self, &'a str) -> impl core::iter::traits::iterator::Iterator<Item = (&'a paperpaw_sdk::Id, &'a str)>
pub fn paperpaw_sdk::services::Services::events(&self) -> &[paperpaw_sdk::services::EventSpec]
pub fn paperpaw_sdk::services::Services::get<T: paperpaw_sdk::services::ServiceType>(&self, &str, paperpaw_sdk::Version) -> core::option::Option<&T>
pub fn paperpaw_sdk::services::Services::has(&self, &str) -> bool
pub fn paperpaw_sdk::services::Services::ids(&self) -> impl core::iter::traits::iterator::Iterator<Item = &paperpaw_sdk::Id>
pub fn paperpaw_sdk::services::Services::new() -> Self
pub fn paperpaw_sdk::services::Services::points(&self) -> &[paperpaw_sdk::services::PointSpec]
pub fn paperpaw_sdk::services::Services::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub const paperpaw_sdk::services::REPLACEABLE: &[&str]
pub const paperpaw_sdk::services::ServiceType::KEY: &'static str
```
