```rust
pub struct paperpaw_sdk::readers::ReaderSpec
pub paperpaw_sdk::readers::ReaderSpec::formats: alloc::vec::Vec<paperpaw_sdk::Id>
pub paperpaw_sdk::readers::ReaderSpec::id: paperpaw_sdk::Id
pub paperpaw_sdk::readers::ReaderSpec::screen: paperpaw_sdk::Id
pub fn paperpaw_sdk::readers::ReaderSpec::formats(self, &[paperpaw_sdk::Id]) -> Self
pub fn paperpaw_sdk::readers::ReaderSpec::new(paperpaw_sdk::Id, paperpaw_sdk::Id) -> Self
pub fn paperpaw_sdk::readers::ReaderSpec::reads(&self, core::option::Option<&paperpaw_sdk::Id>) -> bool
pub struct paperpaw_sdk::readers::Readers
pub fn paperpaw_sdk::readers::Readers::for_book<'s>(&'s self, &'s paperpaw_sdk::Env<'_>, &str) -> alloc::vec::Vec<&'s paperpaw_sdk::readers::ReaderSpec>
pub fn paperpaw_sdk::readers::Readers::get(&self, &str) -> core::option::Option<&paperpaw_sdk::readers::ReaderSpec>
pub fn paperpaw_sdk::readers::Readers::is_empty(&self) -> bool
pub fn paperpaw_sdk::readers::Readers::iter(&self) -> impl core::iter::traits::iterator::Iterator<Item = &paperpaw_sdk::readers::ReaderSpec>
pub fn paperpaw_sdk::readers::Readers::len(&self) -> usize
pub fn paperpaw_sdk::readers::Readers::new() -> Self
pub fn paperpaw_sdk::readers::Readers::reading<'s>(&'s self, core::option::Option<&'s paperpaw_sdk::Id>) -> impl core::iter::traits::iterator::Iterator<Item = &'s paperpaw_sdk::readers::ReaderSpec>
pub enum paperpaw_sdk::readers::Choice<'a>
pub paperpaw_sdk::readers::Choice::Book(&'a str)
pub paperpaw_sdk::readers::Choice::Folder(&'a str)
pub const paperpaw_sdk::readers::DEFAULT: &str
pub const paperpaw_sdk::readers::DIR: &str
pub const paperpaw_sdk::readers::FOLDERS: &str
pub const paperpaw_sdk::readers::PAGE: &str
pub fn paperpaw_sdk::readers::ask(paperpaw_sdk::readers::Choice<'_>) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::readers::ask_once(&str) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::readers::cannot_open(&paperpaw_sdk::Params, &paperpaw_sdk::Id) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::readers::chosen<'e>(&'e paperpaw_sdk::Env<'_>, &str) -> core::option::Option<&'e paperpaw_sdk::readers::ReaderSpec>
pub fn paperpaw_sdk::readers::folder_moved(&dyn paperpaw_platform::storage::Storage, &str, &str) -> core::result::Result<(), paperpaw_platform::storage::StorageError>
pub fn paperpaw_sdk::readers::format_setting(&paperpaw_sdk::Id) -> alloc::string::String
pub fn paperpaw_sdk::readers::name<'e>(&'e paperpaw_sdk::Env<'_>, &'e paperpaw_sdk::readers::ReaderSpec) -> alloc::borrow::Cow<'e, str>
pub fn paperpaw_sdk::readers::open(impl core::convert::Into<alloc::string::String>) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::readers::open_page(impl core::convert::Into<alloc::string::String>) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::readers::open_with(&str, &paperpaw_sdk::readers::ReaderSpec) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::readers::past(&paperpaw_sdk::Params) -> impl core::iter::traits::iterator::Iterator<Item = &str>
pub fn paperpaw_sdk::readers::remember(&dyn paperpaw_platform::storage::Storage, paperpaw_sdk::readers::Choice<'_>, core::option::Option<&paperpaw_sdk::Id>) -> core::result::Result<(), paperpaw_platform::storage::StorageError>
pub fn paperpaw_sdk::readers::remembered(&dyn paperpaw_platform::storage::Storage, paperpaw_sdk::readers::Choice<'_>) -> core::option::Option<alloc::string::String>
pub fn paperpaw_sdk::readers::resolve(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::Params) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::readers::show_text(&dyn paperpaw_platform::storage::Storage, &str, &str) -> core::result::Result<paperpaw_sdk::Command, paperpaw_platform::storage::StorageError>
```
