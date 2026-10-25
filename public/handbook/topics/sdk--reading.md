```rust
pub struct paperpaw_sdk::reading::DroppedRuns
pub fn paperpaw_sdk::reading::DroppedRuns::clear(&self)
pub fn paperpaw_sdk::reading::DroppedRuns::new() -> Self
pub struct paperpaw_sdk::reading::PageIndex
pub fn paperpaw_sdk::reading::PageIndex::append(&mut self, &dyn paperpaw_platform::storage::Storage, &[paperpaw_document::Locator]) -> bool
pub fn paperpaw_sdk::reading::PageIndex::entry(&self, &dyn paperpaw_platform::storage::Storage, u32) -> core::option::Option<paperpaw_document::Locator>
pub fn paperpaw_sdk::reading::PageIndex::finish(&mut self, &dyn paperpaw_platform::storage::Storage)
pub fn paperpaw_sdk::reading::PageIndex::is_complete(&self) -> bool
pub fn paperpaw_sdk::reading::PageIndex::last(&self, &dyn paperpaw_platform::storage::Storage) -> core::option::Option<paperpaw_document::Locator>
pub fn paperpaw_sdk::reading::PageIndex::locate(&self, &dyn paperpaw_platform::storage::Storage, paperpaw_document::Locator) -> core::option::Option<(u32, bool)>
pub fn paperpaw_sdk::reading::PageIndex::open(&dyn paperpaw_platform::storage::Storage, alloc::string::String) -> Self
pub fn paperpaw_sdk::reading::PageIndex::pages(&self) -> u32
pub struct paperpaw_sdk::reading::PageWords
pub fn paperpaw_sdk::reading::PageWords::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::reading::PageWords::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::reading::PageWords::to_params(&self) -> paperpaw_sdk::Params
pub paperpaw_sdk::reading::PageWords::end: paperpaw_document::Locator
pub paperpaw_sdk::reading::PageWords::language: alloc::string::String
pub paperpaw_sdk::reading::PageWords::path: alloc::string::String
pub paperpaw_sdk::reading::PageWords::start: paperpaw_document::Locator
pub paperpaw_sdk::reading::PageWords::words: alloc::vec::Vec<paperpaw_sdk::reading::Word>
pub fn paperpaw_sdk::reading::PageWords::new(impl core::convert::Into<alloc::string::String>, impl core::convert::Into<alloc::string::String>, paperpaw_document::Locator, paperpaw_document::Locator) -> Self
pub fn paperpaw_sdk::reading::PageWords::text(&self) -> alloc::string::String
pub fn paperpaw_sdk::reading::PageWords::words(self, alloc::vec::Vec<paperpaw_sdk::reading::Word>) -> Self
pub fn paperpaw_sdk::reading::PageWords::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::reading::PageWords::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::reading::PageWords::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::reading::PageWords::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::reading::PageWords::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::reading::PageWords::to_params(&self) -> paperpaw_sdk::Params
pub struct paperpaw_sdk::reading::Word
pub paperpaw_sdk::reading::Word::end: paperpaw_document::Locator
pub paperpaw_sdk::reading::Word::start: paperpaw_document::Locator
pub paperpaw_sdk::reading::Word::text: alloc::string::String
pub fn paperpaw_sdk::reading::Word::new(impl core::convert::Into<alloc::string::String>, paperpaw_document::Locator, paperpaw_document::Locator) -> Self
pub struct paperpaw_sdk::reading::WordBox
pub paperpaw_sdk::reading::WordBox::area: paperpaw_platform::geometry::Rect
pub paperpaw_sdk::reading::WordBox::end: paperpaw_document::Locator
pub paperpaw_sdk::reading::WordBox::start: paperpaw_document::Locator
pub paperpaw_sdk::reading::WordBox::text: alloc::string::String
pub fn paperpaw_sdk::reading::WordBox::lookup_text(&self) -> &str
pub fn paperpaw_sdk::reading::WordBox::new(paperpaw_platform::geometry::Rect, impl core::convert::Into<alloc::string::String>, paperpaw_document::Locator, paperpaw_document::Locator) -> Self
pub struct paperpaw_sdk::reading::FilteredDocument<'d, 'e>
pub fn paperpaw_sdk::reading::FilteredDocument<'d, 'e>::in_book(self, &'d str, &'d str) -> Self
pub fn paperpaw_sdk::reading::FilteredDocument<'d, 'e>::kept_block_at(&self, &dyn paperpaw_platform::storage::Storage, paperpaw_document::Locator) -> core::result::Result<core::option::Option<paperpaw_document::Block>, paperpaw_document::DocumentError>
pub fn paperpaw_sdk::reading::FilteredDocument<'d, 'e>::new(&'d dyn paperpaw_document::Document, &'d paperpaw_sdk::Env<'e>) -> Self
pub fn paperpaw_sdk::reading::FilteredDocument<'d, 'e>::remembering(self, &'d paperpaw_sdk::reading::DroppedRuns) -> Self
pub fn paperpaw_sdk::reading::FilteredDocument<'_, '_>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub fn paperpaw_sdk::reading::FilteredDocument<'_, '_>::block_at(&self, &dyn paperpaw_platform::storage::Storage, paperpaw_document::Locator) -> core::result::Result<core::option::Option<paperpaw_document::Block>, paperpaw_document::DocumentError>
pub fn paperpaw_sdk::reading::FilteredDocument<'_, '_>::cover(&self, &dyn paperpaw_platform::storage::Storage) -> core::result::Result<core::option::Option<paperpaw_document::ImageRef>, paperpaw_document::DocumentError>
pub fn paperpaw_sdk::reading::FilteredDocument<'_, '_>::font_data(&self, &dyn paperpaw_platform::storage::Storage, usize) -> core::result::Result<alloc::vec::Vec<u8>, paperpaw_document::DocumentError>
pub fn paperpaw_sdk::reading::FilteredDocument<'_, '_>::fonts(&self, &dyn paperpaw_platform::storage::Storage) -> alloc::vec::Vec<paperpaw_document::EmbeddedFont>
pub fn paperpaw_sdk::reading::FilteredDocument<'_, '_>::link_target(&self, &dyn paperpaw_platform::storage::Storage, &str) -> core::option::Option<paperpaw_document::Locator>
pub fn paperpaw_sdk::reading::FilteredDocument<'_, '_>::links(&self, &dyn paperpaw_platform::storage::Storage, u32, u32, u32) -> alloc::vec::Vec<paperpaw_document::Link>
pub fn paperpaw_sdk::reading::FilteredDocument<'_, '_>::locate_xpointer(&self, &dyn paperpaw_platform::storage::Storage, &str) -> core::option::Option<paperpaw_document::Locator>
pub fn paperpaw_sdk::reading::FilteredDocument<'_, '_>::metadata(&self) -> &paperpaw_document::Metadata
pub fn paperpaw_sdk::reading::FilteredDocument<'_, '_>::page_label(&self, &dyn paperpaw_platform::storage::Storage, paperpaw_document::Locator) -> core::option::Option<alloc::string::String>
pub fn paperpaw_sdk::reading::FilteredDocument<'_, '_>::prepare_image(&self, &dyn paperpaw_platform::storage::Storage, &paperpaw_document::ImageRef) -> core::option::Option<paperpaw_document::ImageRef>
pub fn paperpaw_sdk::reading::FilteredDocument<'_, '_>::progress(&self, paperpaw_document::Locator) -> f32
pub fn paperpaw_sdk::reading::FilteredDocument<'_, '_>::section_len(&self, u32) -> u32
pub fn paperpaw_sdk::reading::FilteredDocument<'_, '_>::sections(&self) -> u32
pub fn paperpaw_sdk::reading::FilteredDocument<'_, '_>::toc_entry(&self, &dyn paperpaw_platform::storage::Storage, u32) -> core::option::Option<paperpaw_document::TocEntry>
pub fn paperpaw_sdk::reading::FilteredDocument<'_, '_>::toc_len(&self, &dyn paperpaw_platform::storage::Storage) -> u32
pub fn paperpaw_sdk::reading::FilteredDocument<'_, '_>::toc_target(&self, &dyn paperpaw_platform::storage::Storage, u32) -> core::option::Option<paperpaw_document::Locator>
pub fn paperpaw_sdk::reading::FilteredDocument<'_, '_>::whole_pages(&self) -> bool
pub fn paperpaw_sdk::reading::FilteredDocument<'_, '_>::xpointer(&self, &dyn paperpaw_platform::storage::Storage, paperpaw_document::Locator) -> core::option::Option<alloc::string::String>
pub paperpaw_sdk::reading::FilteredDocument::document: &'d dyn paperpaw_document::Document
pub paperpaw_sdk::reading::FilteredDocument::dropped: core::option::Option<&'d paperpaw_sdk::reading::DroppedRuns>
pub paperpaw_sdk::reading::FilteredDocument::env: &'d paperpaw_sdk::Env<'e>
pub paperpaw_sdk::reading::FilteredDocument::language: &'d str
pub paperpaw_sdk::reading::FilteredDocument::path: &'d str
pub fn paperpaw_sdk::reading::ask_page_words(&paperpaw_sdk::event::Event<paperpaw_sdk::reading::PageWords>) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::reading::conversion(&paperpaw_sdk::Env<'_>) -> u64
pub fn paperpaw_sdk::reading::note_text(&paperpaw_sdk::reading::FilteredDocument<'_, '_>, &dyn paperpaw_platform::storage::Storage, &str) -> core::option::Option<alloc::string::String>
pub fn paperpaw_sdk::reading::open_options(&paperpaw_sdk::Env<'_>) -> paperpaw_sdk::OpenOptions
```
