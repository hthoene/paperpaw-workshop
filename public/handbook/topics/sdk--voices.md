```rust
pub paperpaw_sdk::voices::VoiceSpec::id: paperpaw_sdk::Id
pub paperpaw_sdk::voices::VoiceSpec::languages: alloc::vec::Vec<alloc::borrow::Cow<'static, str>>
pub paperpaw_sdk::voices::VoiceSpec::speak: paperpaw_sdk::voices::SpeakFn
pub paperpaw_sdk::voices::VoiceSpec::stop: paperpaw_sdk::voices::StopFn
pub fn paperpaw_sdk::voices::VoiceSpec::languages(self, &[&'static str]) -> Self
pub fn paperpaw_sdk::voices::VoiceSpec::new(paperpaw_sdk::Id, impl core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::Speech, &mut alloc::vec::Vec<paperpaw_sdk::Command>) + 'static, impl core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &mut alloc::vec::Vec<paperpaw_sdk::Command>) + 'static) -> Self
pub fn paperpaw_sdk::voices::VoiceSpec::speaks(&self, &str) -> bool
pub fn paperpaw_sdk::voices::VoiceSpec::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::voices::Voices
pub fn paperpaw_sdk::voices::Voices::chosen(&self, &paperpaw_sdk::Env<'_>, &str, bool) -> core::option::Option<&paperpaw_sdk::voices::VoiceSpec>
pub fn paperpaw_sdk::voices::Voices::get(&self, &str) -> core::option::Option<&paperpaw_sdk::voices::VoiceSpec>
pub fn paperpaw_sdk::voices::Voices::ids(&self) -> impl core::iter::traits::iterator::Iterator<Item = &paperpaw_sdk::Id>
pub fn paperpaw_sdk::voices::Voices::is_empty(&self) -> bool
pub fn paperpaw_sdk::voices::Voices::new() -> Self
pub type paperpaw_sdk::voices::SpeakFn = alloc::boxed::Box<dyn core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::Speech, &mut alloc::vec::Vec<paperpaw_sdk::Command>)>
pub type paperpaw_sdk::voices::StopFn = alloc::boxed::Box<dyn core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &mut alloc::vec::Vec<paperpaw_sdk::Command>)>
```
