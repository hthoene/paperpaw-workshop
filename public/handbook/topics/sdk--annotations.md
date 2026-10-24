```rust
pub struct paperpaw_sdk::annotations::Annotation
pub paperpaw_sdk::annotations::Annotation::created: i64
pub paperpaw_sdk::annotations::Annotation::mark: paperpaw_sdk::annotations::Mark
pub paperpaw_sdk::annotations::Annotation::note: alloc::string::String
pub paperpaw_sdk::annotations::Annotation::percent: u8
pub paperpaw_sdk::annotations::Annotation::text: alloc::string::String
pub paperpaw_sdk::annotations::Annotation::updated: i64
pub struct paperpaw_sdk::annotations::Mark
pub paperpaw_sdk::annotations::Mark::end: paperpaw_document::Locator
pub paperpaw_sdk::annotations::Mark::kind: paperpaw_sdk::annotations::Kind
pub paperpaw_sdk::annotations::Mark::noted: bool
pub paperpaw_sdk::annotations::Mark::start: paperpaw_document::Locator
pub fn paperpaw_sdk::annotations::Mark::overlaps(&self, paperpaw_document::Locator, paperpaw_document::Locator) -> bool
pub enum paperpaw_sdk::annotations::Kind
pub paperpaw_sdk::annotations::Kind::Bookmark
pub paperpaw_sdk::annotations::Kind::Highlight
pub fn paperpaw_sdk::annotations::add(&dyn paperpaw_platform::storage::Storage, &str, paperpaw_sdk::annotations::Annotation) -> core::result::Result<(), paperpaw_sdk::data::Error>
pub fn paperpaw_sdk::annotations::book(&dyn paperpaw_platform::storage::Storage, &str) -> core::option::Option<paperpaw_sdk::library::Fingerprint>
pub fn paperpaw_sdk::annotations::changed(&str) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::annotations::file(&str) -> alloc::string::String
pub fn paperpaw_sdk::annotations::load(&dyn paperpaw_platform::storage::Storage, &str) -> alloc::vec::Vec<paperpaw_sdk::annotations::Annotation>
pub fn paperpaw_sdk::annotations::load_for_update(&dyn paperpaw_platform::storage::Storage, &str) -> core::result::Result<alloc::vec::Vec<paperpaw_sdk::annotations::Annotation>, paperpaw_platform::storage::StorageError>
pub fn paperpaw_sdk::annotations::marks(&dyn paperpaw_platform::storage::Storage, &str) -> alloc::vec::Vec<paperpaw_sdk::annotations::Mark>
pub fn paperpaw_sdk::annotations::note_of(&dyn paperpaw_platform::storage::Storage, &str, paperpaw_document::Locator) -> alloc::string::String
pub fn paperpaw_sdk::annotations::one_line(&str) -> alloc::string::String
pub fn paperpaw_sdk::annotations::relocate(&dyn paperpaw_platform::storage::Storage, &str, u64, &dyn paperpaw_document::Document) -> core::result::Result<bool, paperpaw_platform::storage::StorageError>
pub fn paperpaw_sdk::annotations::remove(&dyn paperpaw_platform::storage::Storage, &str, impl core::ops::function::Fn(&paperpaw_sdk::annotations::Mark) -> bool) -> core::result::Result<bool, paperpaw_sdk::data::Error>
pub fn paperpaw_sdk::annotations::save(&dyn paperpaw_platform::storage::Storage, &str, &[paperpaw_sdk::annotations::Annotation]) -> core::result::Result<(), paperpaw_sdk::data::Error>
pub fn paperpaw_sdk::annotations::set_note(&dyn paperpaw_platform::storage::Storage, &str, paperpaw_document::Locator, &str, i64) -> core::result::Result<bool, paperpaw_sdk::data::Error>
pub fn paperpaw_sdk::annotations::snippet(&str) -> alloc::string::String
pub fn paperpaw_sdk::annotations::stamp(&dyn paperpaw_platform::storage::Storage, &str, &paperpaw_sdk::library::Fingerprint) -> core::result::Result<bool, paperpaw_platform::storage::StorageError>
pub fn paperpaw_sdk::annotations::stored_note(&str) -> alloc::string::String
```
