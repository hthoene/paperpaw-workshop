```rust
pub trait paperpaw_sdk::library::Library
pub fn paperpaw_sdk::library::Library::book(&self, &paperpaw_sdk::Env<'_>, &str) -> core::option::Option<paperpaw_sdk::library::Book>
pub fn paperpaw_sdk::library::Library::can_delete(&self, &paperpaw_sdk::Env<'_>, &str) -> bool
pub fn paperpaw_sdk::library::Library::catalog_state(&self, &paperpaw_sdk::Env<'_>) -> paperpaw_sdk::library::catalog::State
pub fn paperpaw_sdk::library::Library::delete(&self, &paperpaw_sdk::Env<'_>, &[&str]) -> paperpaw_sdk::library::service::Deleted
pub fn paperpaw_sdk::library::Library::each(&self, &paperpaw_sdk::Env<'_>, &mut dyn core::ops::function::FnMut(u64, paperpaw_sdk::library::catalog::Record))
pub fn paperpaw_sdk::library::Library::found(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::library::catalog::Query) -> usize
pub fn paperpaw_sdk::library::Library::index(&self, &paperpaw_sdk::Env<'_>, usize, &str) -> paperpaw_sdk::library::index::Index
pub fn paperpaw_sdk::library::Library::is_current(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::library::index::Index) -> bool
pub fn paperpaw_sdk::library::Library::keep_index(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::library::index::Index, &str, &str) -> bool
pub fn paperpaw_sdk::library::Library::kept_index(&self, &paperpaw_sdk::Env<'_>, &str, &str) -> core::option::Option<paperpaw_sdk::library::index::Index>
pub fn paperpaw_sdk::library::Library::query(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::library::catalog::Query, core::option::Option<&paperpaw_sdk::library::catalog::Record>, usize) -> alloc::vec::Vec<paperpaw_sdk::library::catalog::Record>
pub fn paperpaw_sdk::library::Library::record(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::library::index::Index, usize) -> core::option::Option<paperpaw_sdk::library::catalog::Record>
pub fn paperpaw_sdk::library::Library::records(&self, &paperpaw_sdk::Env<'_>, &[u64]) -> alloc::vec::Vec<core::option::Option<paperpaw_sdk::library::catalog::Record>>
pub fn paperpaw_sdk::library::Library::refresh(&self, &paperpaw_sdk::Env<'_>, &mut paperpaw_sdk::library::index::Index)
pub fn paperpaw_sdk::library::Library::set_favourite(&self, &paperpaw_sdk::Env<'_>, &str, bool) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::library::Library::set_finished(&self, &paperpaw_sdk::Env<'_>, &str, bool) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::library::Library::version(&self, &paperpaw_sdk::Env<'_>) -> core::option::Option<u64>
pub trait paperpaw_sdk::library::service::Library
pub fn paperpaw_sdk::library::service::Library::book(&self, &paperpaw_sdk::Env<'_>, &str) -> core::option::Option<paperpaw_sdk::library::Book>
pub fn paperpaw_sdk::library::service::Library::can_delete(&self, &paperpaw_sdk::Env<'_>, &str) -> bool
pub fn paperpaw_sdk::library::service::Library::catalog_state(&self, &paperpaw_sdk::Env<'_>) -> paperpaw_sdk::library::catalog::State
pub fn paperpaw_sdk::library::service::Library::delete(&self, &paperpaw_sdk::Env<'_>, &[&str]) -> paperpaw_sdk::library::service::Deleted
pub fn paperpaw_sdk::library::service::Library::each(&self, &paperpaw_sdk::Env<'_>, &mut dyn core::ops::function::FnMut(u64, paperpaw_sdk::library::catalog::Record))
pub fn paperpaw_sdk::library::service::Library::found(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::library::catalog::Query) -> usize
pub fn paperpaw_sdk::library::service::Library::index(&self, &paperpaw_sdk::Env<'_>, usize, &str) -> paperpaw_sdk::library::index::Index
pub fn paperpaw_sdk::library::service::Library::is_current(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::library::index::Index) -> bool
pub fn paperpaw_sdk::library::service::Library::keep_index(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::library::index::Index, &str, &str) -> bool
pub fn paperpaw_sdk::library::service::Library::kept_index(&self, &paperpaw_sdk::Env<'_>, &str, &str) -> core::option::Option<paperpaw_sdk::library::index::Index>
pub fn paperpaw_sdk::library::service::Library::query(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::library::catalog::Query, core::option::Option<&paperpaw_sdk::library::catalog::Record>, usize) -> alloc::vec::Vec<paperpaw_sdk::library::catalog::Record>
pub fn paperpaw_sdk::library::service::Library::record(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::library::index::Index, usize) -> core::option::Option<paperpaw_sdk::library::catalog::Record>
pub fn paperpaw_sdk::library::service::Library::records(&self, &paperpaw_sdk::Env<'_>, &[u64]) -> alloc::vec::Vec<core::option::Option<paperpaw_sdk::library::catalog::Record>>
pub fn paperpaw_sdk::library::service::Library::refresh(&self, &paperpaw_sdk::Env<'_>, &mut paperpaw_sdk::library::index::Index)
pub fn paperpaw_sdk::library::service::Library::set_favourite(&self, &paperpaw_sdk::Env<'_>, &str, bool) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::library::service::Library::set_finished(&self, &paperpaw_sdk::Env<'_>, &str, bool) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::library::service::Library::version(&self, &paperpaw_sdk::Env<'_>) -> core::option::Option<u64>
pub struct paperpaw_sdk::library::Book
pub paperpaw_sdk::library::Book::added: core::option::Option<u32>
pub paperpaw_sdk::library::Book::author: core::option::Option<alloc::string::String>
pub paperpaw_sdk::library::Book::cover: core::option::Option<paperpaw_document::ImageRef>
pub paperpaw_sdk::library::Book::fields: alloc::vec::Vec<(alloc::string::String, alloc::string::String)>
pub paperpaw_sdk::library::Book::indexed: bool
pub paperpaw_sdk::library::Book::progress: core::option::Option<u8>
pub paperpaw_sdk::library::Book::series: core::option::Option<alloc::string::String>
pub paperpaw_sdk::library::Book::series_index: core::option::Option<alloc::string::String>
pub paperpaw_sdk::library::Book::size: u64
pub paperpaw_sdk::library::Book::tags: alloc::vec::Vec<alloc::string::String>
pub paperpaw_sdk::library::Book::title: core::option::Option<alloc::string::String>
pub fn paperpaw_sdk::library::Book::added(self, impl core::convert::Into<core::option::Option<u32>>) -> Self
pub fn paperpaw_sdk::library::Book::author(self, impl core::convert::Into<core::option::Option<alloc::string::String>>) -> Self
pub fn paperpaw_sdk::library::Book::cover(self, impl core::convert::Into<core::option::Option<paperpaw_document::ImageRef>>) -> Self
pub fn paperpaw_sdk::library::Book::fields(self, alloc::vec::Vec<(alloc::string::String, alloc::string::String)>) -> Self
pub fn paperpaw_sdk::library::Book::indexed(self, bool) -> Self
pub fn paperpaw_sdk::library::Book::progress(self, impl core::convert::Into<core::option::Option<u8>>) -> Self
pub fn paperpaw_sdk::library::Book::series(self, impl core::convert::Into<core::option::Option<alloc::string::String>>) -> Self
pub fn paperpaw_sdk::library::Book::series_index(self, impl core::convert::Into<core::option::Option<alloc::string::String>>) -> Self
pub fn paperpaw_sdk::library::Book::size(self, u64) -> Self
pub fn paperpaw_sdk::library::Book::tags(self, alloc::vec::Vec<alloc::string::String>) -> Self
pub fn paperpaw_sdk::library::Book::title(self, impl core::convert::Into<core::option::Option<alloc::string::String>>) -> Self
pub fn paperpaw_sdk::library::Book::field(&self, &str) -> core::option::Option<&str>
pub fn paperpaw_sdk::library::Book::shown_title<'a>(&'a self, &'a str) -> alloc::borrow::Cow<'a, str>
pub fn paperpaw_sdk::library::Book::title_or<'a>(&'a self, &'a str) -> &'a str
pub struct paperpaw_sdk::library::BookBadge
pub paperpaw_sdk::library::BookBadge::badge: paperpaw_sdk::library::service::BadgeFn
pub paperpaw_sdk::library::BookBadge::id: paperpaw_sdk::Id
pub paperpaw_sdk::library::BookBadge::title: alloc::borrow::Cow<'static, str>
pub struct paperpaw_sdk::library::BookData
pub paperpaw_sdk::library::BookData::folder: alloc::borrow::Cow<'static, str>
pub paperpaw_sdk::library::BookData::kind: paperpaw_sdk::library::BookDataKind
pub paperpaw_sdk::library::BookData::prefix: alloc::borrow::Cow<'static, str>
pub fn paperpaw_sdk::library::BookData::key_of<'n>(&self, &'n str) -> core::option::Option<(&'n str, &'n str)>
pub fn paperpaw_sdk::library::BookData::new(impl core::convert::Into<alloc::borrow::Cow<'static, str>>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, paperpaw_sdk::library::BookDataKind) -> Self
pub struct paperpaw_sdk::library::BookField
pub paperpaw_sdk::library::BookField::id: paperpaw_sdk::Id
pub paperpaw_sdk::library::BookField::in_catalog: bool
pub paperpaw_sdk::library::BookField::title: alloc::borrow::Cow<'static, str>
pub struct paperpaw_sdk::library::Deleted
pub paperpaw_sdk::library::Deleted::commands: alloc::vec::Vec<paperpaw_sdk::Command>
pub paperpaw_sdk::library::Deleted::failed: alloc::vec::Vec<(alloc::string::String, paperpaw_platform::storage::StorageError)>
pub paperpaw_sdk::library::Deleted::refused: alloc::vec::Vec<alloc::string::String>
pub struct paperpaw_sdk::library::Fingerprint
pub paperpaw_sdk::library::Fingerprint::md5: alloc::string::String
pub paperpaw_sdk::library::Fingerprint::size: u64
pub fn paperpaw_sdk::library::Fingerprint::of(&dyn paperpaw_platform::storage::Storage, &str) -> core::option::Option<paperpaw_sdk::library::Fingerprint>
pub fn paperpaw_sdk::library::Fingerprint::parse(&str) -> core::option::Option<paperpaw_sdk::library::Fingerprint>
pub fn paperpaw_sdk::library::Fingerprint::text(&self) -> alloc::string::String
pub struct paperpaw_sdk::library::Provided
pub paperpaw_sdk::library::Provided::author: core::option::Option<alloc::string::String>
pub paperpaw_sdk::library::Provided::series: core::option::Option<alloc::string::String>
pub paperpaw_sdk::library::Provided::series_index: core::option::Option<alloc::string::String>
pub paperpaw_sdk::library::Provided::tags: alloc::vec::Vec<alloc::string::String>
pub paperpaw_sdk::library::Provided::title: core::option::Option<alloc::string::String>
pub fn paperpaw_sdk::library::Provided::author(self, impl core::convert::Into<core::option::Option<alloc::string::String>>) -> Self
pub fn paperpaw_sdk::library::Provided::series(self, impl core::convert::Into<core::option::Option<alloc::string::String>>) -> Self
pub fn paperpaw_sdk::library::Provided::series_index(self, impl core::convert::Into<core::option::Option<alloc::string::String>>) -> Self
pub fn paperpaw_sdk::library::Provided::tags(self, alloc::vec::Vec<alloc::string::String>) -> Self
pub fn paperpaw_sdk::library::Provided::title(self, impl core::convert::Into<core::option::Option<alloc::string::String>>) -> Self
pub struct paperpaw_sdk::library::catalog::Changes
pub fn paperpaw_sdk::library::catalog::Changes::apply(&self, paperpaw_sdk::library::catalog::Record) -> core::option::Option<paperpaw_sdk::library::catalog::Record>
pub fn paperpaw_sdk::library::catalog::Changes::is_empty(&self) -> bool
pub fn paperpaw_sdk::library::catalog::Changes::removed(&self, u64) -> bool
pub fn paperpaw_sdk::library::catalog::Changes::status(&self, u64) -> core::option::Option<paperpaw_sdk::library::catalog::Status>
pub struct paperpaw_sdk::library::catalog::Query
pub paperpaw_sdk::library::catalog::Query::added_since: core::option::Option<u32>
pub paperpaw_sdk::library::catalog::Query::author: core::option::Option<alloc::string::String>
pub paperpaw_sdk::library::catalog::Query::folder: core::option::Option<alloc::string::String>
pub paperpaw_sdk::library::catalog::Query::series: core::option::Option<alloc::string::String>
pub paperpaw_sdk::library::catalog::Query::show: paperpaw_sdk::library::catalog::Show
pub paperpaw_sdk::library::catalog::Query::sort: paperpaw_sdk::library::catalog::Sort
pub paperpaw_sdk::library::catalog::Query::tag: core::option::Option<alloc::string::String>
pub paperpaw_sdk::library::catalog::Query::words: alloc::vec::Vec<alloc::string::String>
pub fn paperpaw_sdk::library::catalog::Query::added_since(self, u32) -> Self
pub fn paperpaw_sdk::library::catalog::Query::author(self, impl core::convert::Into<alloc::string::String>) -> Self
pub fn paperpaw_sdk::library::catalog::Query::finds(&self, &paperpaw_sdk::library::catalog::Record) -> bool
pub fn paperpaw_sdk::library::catalog::Query::folder(self, impl core::convert::Into<alloc::string::String>) -> Self
pub fn paperpaw_sdk::library::catalog::Query::new() -> Self
pub fn paperpaw_sdk::library::catalog::Query::series(self, impl core::convert::Into<alloc::string::String>) -> Self
pub fn paperpaw_sdk::library::catalog::Query::show(self, paperpaw_sdk::library::catalog::Show) -> Self
pub fn paperpaw_sdk::library::catalog::Query::sort(self, paperpaw_sdk::library::catalog::Sort) -> Self
pub fn paperpaw_sdk::library::catalog::Query::tag(self, impl core::convert::Into<alloc::string::String>) -> Self
pub fn paperpaw_sdk::library::catalog::Query::words(self, &str) -> Self
pub struct paperpaw_sdk::library::catalog::Record
pub paperpaw_sdk::library::catalog::Record::added: core::option::Option<u32>
pub paperpaw_sdk::library::catalog::Record::author: alloc::string::String
pub paperpaw_sdk::library::catalog::Record::number: alloc::string::String
pub paperpaw_sdk::library::catalog::Record::path: alloc::string::String
pub paperpaw_sdk::library::catalog::Record::series: alloc::string::String
pub paperpaw_sdk::library::catalog::Record::size: core::option::Option<u64>
pub paperpaw_sdk::library::catalog::Record::status: paperpaw_sdk::library::catalog::Status
pub paperpaw_sdk::library::catalog::Record::title: alloc::string::String
pub fn paperpaw_sdk::library::catalog::Record::field(&self, &str) -> core::option::Option<&str>
pub fn paperpaw_sdk::library::catalog::Record::matches(&self, &[alloc::string::String]) -> bool
pub fn paperpaw_sdk::library::catalog::Record::of(&str, &paperpaw_sdk::library::Book) -> paperpaw_sdk::library::catalog::Record
pub fn paperpaw_sdk::library::catalog::Record::reading(&self) -> paperpaw_sdk::library::catalog::Reading
pub fn paperpaw_sdk::library::catalog::Record::tags(&self) -> impl core::iter::traits::iterator::Iterator<Item = &str>
pub fn paperpaw_sdk::library::catalog::Record::with_fields(self, &paperpaw_sdk::library::Book, &[&str]) -> Self
pub fn paperpaw_sdk::library::catalog::Record::with_status(self, paperpaw_sdk::library::catalog::Status) -> Self
pub struct paperpaw_sdk::library::catalog::Status
pub paperpaw_sdk::library::catalog::Status::favourite: bool
pub paperpaw_sdk::library::catalog::Status::opened: bool
pub paperpaw_sdk::library::catalog::Status::progress: core::option::Option<u8>
pub fn paperpaw_sdk::library::catalog::Status::new(core::option::Option<u8>, bool, bool) -> Self
pub struct paperpaw_sdk::library::index::Index
pub paperpaw_sdk::library::index::Index::archived: usize
pub paperpaw_sdk::library::index::Index::dirty: bool
pub paperpaw_sdk::library::index::Index::items: alloc::vec::Vec<paperpaw_sdk::library::index::Item>
pub paperpaw_sdk::library::index::Index::series: alloc::vec::Vec<alloc::string::String>
pub paperpaw_sdk::library::index::Index::total: usize
pub paperpaw_sdk::library::index::Index::version: core::option::Option<u64>
pub fn paperpaw_sdk::library::index::Index::build(&dyn paperpaw_platform::storage::Storage, usize, &str) -> paperpaw_sdk::library::index::Index
pub fn paperpaw_sdk::library::index::Index::collect(usize, &str, &[u32], core::option::Option<u64>, paperpaw_sdk::library::catalog::Books<'_>) -> paperpaw_sdk::library::index::Index
pub fn paperpaw_sdk::library::index::Index::has_books(&self) -> bool
pub fn paperpaw_sdk::library::index::Index::load(&dyn paperpaw_platform::storage::Storage, &str, &str, u64) -> core::option::Option<paperpaw_sdk::library::index::Index>
pub fn paperpaw_sdk::library::index::Index::next_in_series(&self, bool) -> alloc::vec::Vec<u16>
pub fn paperpaw_sdk::library::index::Index::order(&self, paperpaw_sdk::library::catalog::Show, bool) -> alloc::vec::Vec<u16>
pub fn paperpaw_sdk::library::index::Index::record(&self, &dyn paperpaw_platform::storage::Storage, usize) -> core::option::Option<paperpaw_sdk::library::catalog::Record>
pub fn paperpaw_sdk::library::index::Index::refresh(&mut self, &dyn paperpaw_platform::storage::Storage)
pub fn paperpaw_sdk::library::index::Index::set_progress(&mut self, u32, core::option::Option<u8>)
pub fn paperpaw_sdk::library::index::Index::stacked(&self, &[u16]) -> (alloc::vec::Vec<u16>, alloc::vec::Vec<u16>)
pub struct paperpaw_sdk::library::index::Item
pub paperpaw_sdk::library::index::Item::flags: u8
pub paperpaw_sdk::library::index::Item::hash: u32
pub paperpaw_sdk::library::index::Item::key: [u8; 8]
pub paperpaw_sdk::library::index::Item::number: u16
pub paperpaw_sdk::library::index::Item::offset: u32
pub paperpaw_sdk::library::index::Item::progress: u8
pub paperpaw_sdk::library::index::Item::recent: u8
pub paperpaw_sdk::library::index::Item::series: u16
pub fn paperpaw_sdk::library::index::Item::new(u32, &paperpaw_sdk::library::catalog::Record, u16, u8) -> paperpaw_sdk::library::index::Item
pub fn paperpaw_sdk::library::index::Item::shown(&self, paperpaw_sdk::library::catalog::Show) -> bool
pub struct paperpaw_sdk::library::listing::Entry
pub paperpaw_sdk::library::listing::Entry::is_dir: bool
pub paperpaw_sdk::library::listing::Entry::name: alloc::string::String
pub paperpaw_sdk::library::listing::Entry::rank: u32
pub paperpaw_sdk::library::listing::Entry::size: u64
pub fn paperpaw_sdk::library::listing::Entry::folder(&str) -> Self
pub struct paperpaw_sdk::library::service::BookBadge
pub paperpaw_sdk::library::service::BookBadge::badge: paperpaw_sdk::library::service::BadgeFn
pub paperpaw_sdk::library::service::BookBadge::id: paperpaw_sdk::Id
pub paperpaw_sdk::library::service::BookBadge::title: alloc::borrow::Cow<'static, str>
pub fn paperpaw_sdk::library::service::BookBadge::new(impl core::convert::Into<paperpaw_sdk::Id>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, impl core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::library::catalog::Record) -> core::option::Option<paperpaw_sdk::library::service::Badge> + 'static) -> Self
pub fn paperpaw_sdk::library::service::BookBadge::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub fn paperpaw_sdk::library::service::BookBadge::new(impl core::convert::Into<paperpaw_sdk::Id>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, impl core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::library::catalog::Record) -> core::option::Option<paperpaw_sdk::library::service::Badge> + 'static) -> Self
pub fn paperpaw_sdk::library::service::BookBadge::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::library::service::BookField
pub paperpaw_sdk::library::service::BookField::id: paperpaw_sdk::Id
pub paperpaw_sdk::library::service::BookField::in_catalog: bool
pub paperpaw_sdk::library::service::BookField::title: alloc::borrow::Cow<'static, str>
pub fn paperpaw_sdk::library::service::BookField::in_catalog(self) -> Self
pub fn paperpaw_sdk::library::service::BookField::new(impl core::convert::Into<paperpaw_sdk::Id>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> Self
pub fn paperpaw_sdk::library::service::BookField::in_catalog(self) -> Self
pub fn paperpaw_sdk::library::service::BookField::new(impl core::convert::Into<paperpaw_sdk::Id>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> Self
pub struct paperpaw_sdk::library::service::Deleted
pub paperpaw_sdk::library::service::Deleted::commands: alloc::vec::Vec<paperpaw_sdk::Command>
pub paperpaw_sdk::library::service::Deleted::failed: alloc::vec::Vec<(alloc::string::String, paperpaw_platform::storage::StorageError)>
pub paperpaw_sdk::library::service::Deleted::refused: alloc::vec::Vec<alloc::string::String>
pub struct paperpaw_sdk::library::service::Kept
pub fn paperpaw_sdk::library::service::Kept::book(&self, &paperpaw_sdk::Env<'_>, &str) -> core::option::Option<paperpaw_sdk::library::Book>
pub fn paperpaw_sdk::library::service::Kept::can_delete(&self, &paperpaw_sdk::Env<'_>, &str) -> bool
pub fn paperpaw_sdk::library::service::Kept::catalog_state(&self, &paperpaw_sdk::Env<'_>) -> paperpaw_sdk::library::catalog::State
pub fn paperpaw_sdk::library::service::Kept::delete(&self, &paperpaw_sdk::Env<'_>, &[&str]) -> paperpaw_sdk::library::service::Deleted
pub fn paperpaw_sdk::library::service::Kept::each(&self, &paperpaw_sdk::Env<'_>, &mut dyn core::ops::function::FnMut(u64, paperpaw_sdk::library::catalog::Record))
pub fn paperpaw_sdk::library::service::Kept::found(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::library::catalog::Query) -> usize
pub fn paperpaw_sdk::library::service::Kept::index(&self, &paperpaw_sdk::Env<'_>, usize, &str) -> paperpaw_sdk::library::index::Index
pub fn paperpaw_sdk::library::service::Kept::is_current(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::library::index::Index) -> bool
pub fn paperpaw_sdk::library::service::Kept::keep_index(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::library::index::Index, &str, &str) -> bool
pub fn paperpaw_sdk::library::service::Kept::kept_index(&self, &paperpaw_sdk::Env<'_>, &str, &str) -> core::option::Option<paperpaw_sdk::library::index::Index>
pub fn paperpaw_sdk::library::service::Kept::query(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::library::catalog::Query, core::option::Option<&paperpaw_sdk::library::catalog::Record>, usize) -> alloc::vec::Vec<paperpaw_sdk::library::catalog::Record>
pub fn paperpaw_sdk::library::service::Kept::record(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::library::index::Index, usize) -> core::option::Option<paperpaw_sdk::library::catalog::Record>
pub fn paperpaw_sdk::library::service::Kept::records(&self, &paperpaw_sdk::Env<'_>, &[u64]) -> alloc::vec::Vec<core::option::Option<paperpaw_sdk::library::catalog::Record>>
pub fn paperpaw_sdk::library::service::Kept::refresh(&self, &paperpaw_sdk::Env<'_>, &mut paperpaw_sdk::library::index::Index)
pub fn paperpaw_sdk::library::service::Kept::set_favourite(&self, &paperpaw_sdk::Env<'_>, &str, bool) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::library::service::Kept::set_finished(&self, &paperpaw_sdk::Env<'_>, &str, bool) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::library::service::Kept::version(&self, &paperpaw_sdk::Env<'_>) -> core::option::Option<u64>
pub fn paperpaw_sdk::library::service::Kept::book(&self, &paperpaw_sdk::Env<'_>, &str) -> core::option::Option<paperpaw_sdk::library::Book>
pub fn paperpaw_sdk::library::service::Kept::can_delete(&self, &paperpaw_sdk::Env<'_>, &str) -> bool
pub fn paperpaw_sdk::library::service::Kept::catalog_state(&self, &paperpaw_sdk::Env<'_>) -> paperpaw_sdk::library::catalog::State
pub fn paperpaw_sdk::library::service::Kept::delete(&self, &paperpaw_sdk::Env<'_>, &[&str]) -> paperpaw_sdk::library::service::Deleted
pub fn paperpaw_sdk::library::service::Kept::each(&self, &paperpaw_sdk::Env<'_>, &mut dyn core::ops::function::FnMut(u64, paperpaw_sdk::library::catalog::Record))
pub fn paperpaw_sdk::library::service::Kept::found(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::library::catalog::Query) -> usize
pub fn paperpaw_sdk::library::service::Kept::index(&self, &paperpaw_sdk::Env<'_>, usize, &str) -> paperpaw_sdk::library::index::Index
pub fn paperpaw_sdk::library::service::Kept::is_current(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::library::index::Index) -> bool
pub fn paperpaw_sdk::library::service::Kept::keep_index(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::library::index::Index, &str, &str) -> bool
pub fn paperpaw_sdk::library::service::Kept::kept_index(&self, &paperpaw_sdk::Env<'_>, &str, &str) -> core::option::Option<paperpaw_sdk::library::index::Index>
pub fn paperpaw_sdk::library::service::Kept::query(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::library::catalog::Query, core::option::Option<&paperpaw_sdk::library::catalog::Record>, usize) -> alloc::vec::Vec<paperpaw_sdk::library::catalog::Record>
pub fn paperpaw_sdk::library::service::Kept::record(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::library::index::Index, usize) -> core::option::Option<paperpaw_sdk::library::catalog::Record>
pub fn paperpaw_sdk::library::service::Kept::records(&self, &paperpaw_sdk::Env<'_>, &[u64]) -> alloc::vec::Vec<core::option::Option<paperpaw_sdk::library::catalog::Record>>
pub fn paperpaw_sdk::library::service::Kept::refresh(&self, &paperpaw_sdk::Env<'_>, &mut paperpaw_sdk::library::index::Index)
pub fn paperpaw_sdk::library::service::Kept::set_favourite(&self, &paperpaw_sdk::Env<'_>, &str, bool) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::library::service::Kept::set_finished(&self, &paperpaw_sdk::Env<'_>, &str, bool) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::library::service::Kept::version(&self, &paperpaw_sdk::Env<'_>) -> core::option::Option<u64>
pub fn paperpaw_sdk::library::service::Kept::book(&self, &paperpaw_sdk::Env<'_>, &str) -> core::option::Option<paperpaw_sdk::library::Book>
pub fn paperpaw_sdk::library::service::Kept::can_delete(&self, &paperpaw_sdk::Env<'_>, &str) -> bool
pub fn paperpaw_sdk::library::service::Kept::catalog_state(&self, &paperpaw_sdk::Env<'_>) -> paperpaw_sdk::library::catalog::State
pub fn paperpaw_sdk::library::service::Kept::delete(&self, &paperpaw_sdk::Env<'_>, &[&str]) -> paperpaw_sdk::library::service::Deleted
pub fn paperpaw_sdk::library::service::Kept::each(&self, &paperpaw_sdk::Env<'_>, &mut dyn core::ops::function::FnMut(u64, paperpaw_sdk::library::catalog::Record))
pub fn paperpaw_sdk::library::service::Kept::found(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::library::catalog::Query) -> usize
pub fn paperpaw_sdk::library::service::Kept::index(&self, &paperpaw_sdk::Env<'_>, usize, &str) -> paperpaw_sdk::library::index::Index
pub fn paperpaw_sdk::library::service::Kept::is_current(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::library::index::Index) -> bool
pub fn paperpaw_sdk::library::service::Kept::keep_index(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::library::index::Index, &str, &str) -> bool
pub fn paperpaw_sdk::library::service::Kept::kept_index(&self, &paperpaw_sdk::Env<'_>, &str, &str) -> core::option::Option<paperpaw_sdk::library::index::Index>
pub fn paperpaw_sdk::library::service::Kept::query(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::library::catalog::Query, core::option::Option<&paperpaw_sdk::library::catalog::Record>, usize) -> alloc::vec::Vec<paperpaw_sdk::library::catalog::Record>
pub fn paperpaw_sdk::library::service::Kept::record(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::library::index::Index, usize) -> core::option::Option<paperpaw_sdk::library::catalog::Record>
pub fn paperpaw_sdk::library::service::Kept::records(&self, &paperpaw_sdk::Env<'_>, &[u64]) -> alloc::vec::Vec<core::option::Option<paperpaw_sdk::library::catalog::Record>>
pub fn paperpaw_sdk::library::service::Kept::refresh(&self, &paperpaw_sdk::Env<'_>, &mut paperpaw_sdk::library::index::Index)
pub fn paperpaw_sdk::library::service::Kept::set_favourite(&self, &paperpaw_sdk::Env<'_>, &str, bool) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::library::service::Kept::set_finished(&self, &paperpaw_sdk::Env<'_>, &str, bool) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::library::service::Kept::version(&self, &paperpaw_sdk::Env<'_>) -> core::option::Option<u64>
pub struct paperpaw_sdk::library::service::LibraryService(pub alloc::boxed::Box<dyn paperpaw_sdk::library::service::Library>)
pub fn paperpaw_sdk::library::service::LibraryService::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub const paperpaw_sdk::library::service::LibraryService::KEY: &'static str
pub const paperpaw_sdk::library::service::LibraryService::KEY: &'static str
pub enum paperpaw_sdk::library::Badge
pub paperpaw_sdk::library::Badge::Icon(&'static str)
pub paperpaw_sdk::library::Badge::Text(alloc::string::String)
pub enum paperpaw_sdk::library::BookDataKind
pub paperpaw_sdk::library::BookDataKind::Cache
pub paperpaw_sdk::library::BookDataKind::UserData
pub enum paperpaw_sdk::library::catalog::Reading
pub paperpaw_sdk::library::catalog::Reading::Begun
pub paperpaw_sdk::library::catalog::Reading::Finished
pub paperpaw_sdk::library::catalog::Reading::Unread
pub enum paperpaw_sdk::library::catalog::Show
pub paperpaw_sdk::library::catalog::Show::All
pub paperpaw_sdk::library::catalog::Show::Favourites
pub paperpaw_sdk::library::catalog::Show::Finished
pub paperpaw_sdk::library::catalog::Show::Reading
pub paperpaw_sdk::library::catalog::Show::Unread
pub enum paperpaw_sdk::library::catalog::Sort
pub paperpaw_sdk::library::catalog::Sort::Added
pub paperpaw_sdk::library::catalog::Sort::Author
pub paperpaw_sdk::library::catalog::Sort::Series
pub paperpaw_sdk::library::catalog::Sort::Title
pub enum paperpaw_sdk::library::catalog::State
pub paperpaw_sdk::library::catalog::State::Building
pub paperpaw_sdk::library::catalog::State::Missing
pub paperpaw_sdk::library::catalog::State::Ready
pub paperpaw_sdk::library::catalog::State::Ready::stamp: u64
pub enum paperpaw_sdk::library::service::Badge
pub paperpaw_sdk::library::service::Badge::Icon(&'static str)
pub paperpaw_sdk::library::service::Badge::Text(alloc::string::String)
pub type paperpaw_sdk::library::catalog::Books<'a> = &'a mut dyn core::ops::function::FnMut(&mut dyn core::ops::function::FnMut(u64, paperpaw_sdk::library::catalog::Record))
pub type paperpaw_sdk::library::service::BadgeFn = alloc::boxed::Box<dyn core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::library::catalog::Record) -> core::option::Option<paperpaw_sdk::library::service::Badge>>
pub struct paperpaw_sdk::library::listing::Listing<'a>
pub fn paperpaw_sdk::library::listing::Listing<'_>::after(&self, core::option::Option<&paperpaw_sdk::library::listing::Entry>, usize) -> alloc::vec::Vec<paperpaw_sdk::library::listing::Entry>
pub fn paperpaw_sdk::library::listing::Listing<'_>::before(&self, core::option::Option<&paperpaw_sdk::library::listing::Entry>, usize) -> alloc::vec::Vec<paperpaw_sdk::library::listing::Entry>
pub fn paperpaw_sdk::library::listing::Listing<'_>::count(&self) -> usize
pub fn paperpaw_sdk::library::listing::Listing<'_>::page(&self, usize, usize, usize) -> alloc::vec::Vec<paperpaw_sdk::library::listing::Entry>
pub fn paperpaw_sdk::library::listing::Listing<'_>::page_of(&self, &paperpaw_sdk::library::listing::Entry, usize) -> (usize, alloc::vec::Vec<paperpaw_sdk::library::listing::Entry>)
pub fn paperpaw_sdk::library::listing::Listing<'_>::range(&self, usize, usize) -> alloc::vec::Vec<paperpaw_sdk::library::listing::Entry>
pub fn paperpaw_sdk::library::listing::Listing<'_>::rank(&self, &paperpaw_sdk::library::listing::Entry) -> usize
pub fn paperpaw_sdk::library::listing::Listing<'_>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub paperpaw_sdk::library::listing::Listing::dir: &'a str
pub paperpaw_sdk::library::listing::Listing::folders_only: bool
pub paperpaw_sdk::library::listing::Listing::formats: &'a paperpaw_sdk::Formats
pub paperpaw_sdk::library::listing::Listing::rank: core::option::Option<&'a dyn core::ops::function::Fn(&str) -> u32>
pub paperpaw_sdk::library::listing::Listing::storage: &'a dyn paperpaw_platform::storage::Storage
pub const paperpaw_sdk::library::DIR: &str
pub const paperpaw_sdk::library::FOLDER: paperpaw_sdk::setting::Setting<paperpaw_sdk::setting::Text>
pub const paperpaw_sdk::library::NEW_DAYS: u32
pub const paperpaw_sdk::library::catalog::MAX_FOUND: usize
pub const paperpaw_sdk::library::catalog::MAX_LOG: usize
pub const paperpaw_sdk::library::index::FAVOURITE: u8
pub const paperpaw_sdk::library::index::KEY: usize
pub const paperpaw_sdk::library::index::NEVER: u8
pub const paperpaw_sdk::library::index::NONE: u8
pub const paperpaw_sdk::library::index::NO_SERIES: u16
pub const paperpaw_sdk::library::index::OPENED: u8
pub const paperpaw_sdk::library::index::REMOVED: u8
pub const paperpaw_sdk::library::listing::UNRANKED: u32
pub const paperpaw_sdk::library::service::SERVICE: &str
pub const paperpaw_sdk::library::service::VERSION: paperpaw_sdk::Version
pub const paperpaw_sdk::library::what::COVER: u32
pub const paperpaw_sdk::library::what::DETAILS: u32
pub const paperpaw_sdk::library::what::FAVOURITE: u32
pub const paperpaw_sdk::library::what::FIELDS: u32
pub const paperpaw_sdk::library::what::PROGRESS: u32
pub const paperpaw_sdk::library::what::STATUS: u32
pub fn paperpaw_sdk::library::catalog::changes(&dyn paperpaw_platform::storage::Storage) -> paperpaw_sdk::library::catalog::Changes
pub fn paperpaw_sdk::library::catalog::count(&dyn paperpaw_platform::storage::Storage, &dyn core::ops::function::Fn(&paperpaw_sdk::library::catalog::Record) -> bool) -> usize
pub fn paperpaw_sdk::library::catalog::each(&dyn paperpaw_platform::storage::Storage, &mut dyn core::ops::function::FnMut(paperpaw_sdk::library::catalog::Record))
pub fn paperpaw_sdk::library::catalog::each_at(&dyn paperpaw_platform::storage::Storage, &mut dyn core::ops::function::FnMut(u64, paperpaw_sdk::library::catalog::Record))
pub fn paperpaw_sdk::library::catalog::found(&dyn paperpaw_platform::storage::Storage, &paperpaw_sdk::library::catalog::Query) -> usize
pub fn paperpaw_sdk::library::catalog::found_in(paperpaw_sdk::library::catalog::Books<'_>, &paperpaw_sdk::library::catalog::Query) -> usize
pub fn paperpaw_sdk::library::catalog::generation(&dyn paperpaw_platform::storage::Storage) -> core::option::Option<u64>
pub fn paperpaw_sdk::library::catalog::page(&dyn paperpaw_platform::storage::Storage, &dyn core::ops::function::Fn(&paperpaw_sdk::library::catalog::Record) -> bool, core::option::Option<&paperpaw_sdk::library::catalog::Record>, usize) -> alloc::vec::Vec<paperpaw_sdk::library::catalog::Record>
pub fn paperpaw_sdk::library::catalog::query(&dyn paperpaw_platform::storage::Storage, &paperpaw_sdk::library::catalog::Query, core::option::Option<&paperpaw_sdk::library::catalog::Record>, usize) -> alloc::vec::Vec<paperpaw_sdk::library::catalog::Record>
pub fn paperpaw_sdk::library::catalog::query_in(paperpaw_sdk::library::catalog::Books<'_>, &paperpaw_sdk::library::catalog::Query, core::option::Option<&paperpaw_sdk::library::catalog::Record>, usize) -> alloc::vec::Vec<paperpaw_sdk::library::catalog::Record>
pub fn paperpaw_sdk::library::catalog::query_words(&str) -> alloc::vec::Vec<alloc::string::String>
pub fn paperpaw_sdk::library::catalog::read_at(&dyn paperpaw_platform::storage::Storage, u64) -> core::option::Option<paperpaw_sdk::library::catalog::Record>
pub fn paperpaw_sdk::library::catalog::read_page(&dyn paperpaw_platform::storage::Storage, &[u64]) -> alloc::vec::Vec<core::option::Option<paperpaw_sdk::library::catalog::Record>>
pub fn paperpaw_sdk::library::catalog::search(&dyn paperpaw_platform::storage::Storage, &str) -> alloc::vec::Vec<paperpaw_sdk::library::catalog::Record>
pub fn paperpaw_sdk::library::catalog::search_after(&dyn paperpaw_platform::storage::Storage, &str, core::option::Option<&paperpaw_sdk::library::catalog::Record>, usize) -> alloc::vec::Vec<paperpaw_sdk::library::catalog::Record>
pub fn paperpaw_sdk::library::catalog::series_order(&str) -> u32
pub fn paperpaw_sdk::library::catalog::state(&dyn paperpaw_platform::storage::Storage) -> paperpaw_sdk::library::catalog::State
pub fn paperpaw_sdk::library::index::cap(paperpaw_platform::MemoryClass) -> usize
pub fn paperpaw_sdk::library::index::catalog_version(&dyn paperpaw_platform::storage::Storage) -> core::option::Option<u64>
pub fn paperpaw_sdk::library::index::hash(&str) -> u32
pub fn paperpaw_sdk::library::index::letter(&str) -> u8
pub fn paperpaw_sdk::library::index::number(&str) -> u16
pub fn paperpaw_sdk::library::index::opened(&dyn paperpaw_platform::storage::Storage) -> alloc::vec::Vec<u32>
pub fn paperpaw_sdk::library::index::sort_key(&str) -> [u8; 8]
pub fn paperpaw_sdk::library::index::surname(&str) -> &str
pub fn paperpaw_sdk::library::index::without_article(&str) -> &str
pub fn paperpaw_sdk::library::service::badges(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::library::catalog::Record, usize) -> alloc::vec::Vec<paperpaw_sdk::library::service::Badge>
pub fn paperpaw_sdk::library::service::is_book_path(&paperpaw_sdk::Env<'_>, &str) -> bool
pub fn paperpaw_sdk::library::service::service<'e>(&paperpaw_sdk::Env<'e>) -> &'e dyn paperpaw_sdk::library::service::Library
pub fn paperpaw_sdk::library::added(&str, &str) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::library::book(&dyn paperpaw_platform::storage::Storage, &str) -> core::option::Option<paperpaw_sdk::library::Book>
pub fn paperpaw_sdk::library::book_keys(&dyn paperpaw_platform::storage::Storage, &paperpaw_sdk::Formats) -> alloc::vec::Vec<u64>
pub fn paperpaw_sdk::library::book_sized(&dyn paperpaw_platform::storage::Storage, &str, u64) -> core::option::Option<paperpaw_sdk::library::Book>
pub fn paperpaw_sdk::library::books_in(&dyn paperpaw_platform::storage::Storage, &paperpaw_sdk::Formats, &str, &mut dyn core::ops::function::FnMut(&str))
pub fn paperpaw_sdk::library::changed() -> paperpaw_sdk::Command
pub fn paperpaw_sdk::library::changed_book(&str, u32) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::library::clean_up(&dyn paperpaw_platform::storage::Storage, &[paperpaw_sdk::library::BookData], &dyn core::ops::function::Fn(&str) -> bool) -> u32
pub fn paperpaw_sdk::library::clean_up_unused(&dyn paperpaw_platform::storage::Storage, &[paperpaw_sdk::library::BookData], &str, paperpaw_sdk::library::BookDataKind) -> core::result::Result<u32, paperpaw_platform::storage::StorageError>
pub fn paperpaw_sdk::library::cover(&dyn paperpaw_platform::storage::Storage, &str, &paperpaw_sdk::library::Book, u16, u16, paperpaw_platform::pixel::PixelFormat) -> core::option::Option<paperpaw_sdk::ui::Thumbnail>
pub fn paperpaw_sdk::library::cover_variant(&dyn paperpaw_platform::storage::Storage, &str, &paperpaw_sdk::library::Book, u16, u16, paperpaw_platform::pixel::PixelFormat, &str) -> core::option::Option<paperpaw_sdk::ui::Thumbnail>
pub fn paperpaw_sdk::library::favourites(&dyn paperpaw_platform::storage::Storage) -> alloc::vec::Vec<alloc::string::String>
pub fn paperpaw_sdk::library::folder<'e>(&paperpaw_sdk::Env<'e>) -> &'e str
pub fn paperpaw_sdk::library::index(&paperpaw_sdk::Env<'_>, &str) -> paperpaw_sdk::library::Book
pub fn paperpaw_sdk::library::indexed(&paperpaw_sdk::Env<'_>, &str) -> paperpaw_sdk::library::Book
pub fn paperpaw_sdk::library::is_book_path(&paperpaw_sdk::Env<'_>, &str) -> bool
pub fn paperpaw_sdk::library::is_new(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::library::Book, bool) -> bool
pub fn paperpaw_sdk::library::is_new_on(&paperpaw_sdk::library::Book, bool, core::option::Option<u32>) -> bool
pub fn paperpaw_sdk::library::key(&str) -> alloc::string::String
pub fn paperpaw_sdk::library::move_data(&dyn paperpaw_platform::storage::Storage, &[paperpaw_sdk::library::BookData], &str, &str)
pub fn paperpaw_sdk::library::moved(&dyn paperpaw_platform::storage::Storage, &str, &str)
pub fn paperpaw_sdk::library::moved_folder(&dyn paperpaw_platform::storage::Storage, &str, &str, &str) -> core::option::Option<alloc::string::String>
pub fn paperpaw_sdk::library::opened_books(&dyn paperpaw_platform::storage::Storage) -> alloc::vec::Vec<alloc::string::String>
pub fn paperpaw_sdk::library::provide(&dyn paperpaw_platform::storage::Storage, &str, paperpaw_sdk::library::Provided)
pub fn paperpaw_sdk::library::readable_name(&str) -> alloc::borrow::Cow<'_, str>
pub fn paperpaw_sdk::library::record(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::builtin::events::Reading, bool)
pub fn paperpaw_sdk::library::remove_data(&dyn paperpaw_platform::storage::Storage, &[paperpaw_sdk::library::BookData], &str)
pub fn paperpaw_sdk::library::removed(&dyn paperpaw_platform::storage::Storage, &str)
pub fn paperpaw_sdk::library::request_catalog() -> paperpaw_sdk::Command
pub fn paperpaw_sdk::library::request_catalog_anew() -> paperpaw_sdk::Command
pub fn paperpaw_sdk::library::service<'e>(&paperpaw_sdk::Env<'e>) -> &'e dyn paperpaw_sdk::library::service::Library
pub fn paperpaw_sdk::library::set_favourite(&dyn paperpaw_platform::storage::Storage, &str, bool)
pub fn paperpaw_sdk::library::set_field(&dyn paperpaw_platform::storage::Storage, &str, &str, &str)
pub fn paperpaw_sdk::library::set_finished(&dyn paperpaw_platform::storage::Storage, &str, bool)
pub fn paperpaw_sdk::library::take_over_old(&dyn paperpaw_platform::storage::Storage)
pub fn paperpaw_sdk::library::tell_moved(&paperpaw_sdk::Env<'_>, &str, &str, usize, &mut dyn core::ops::function::FnMut(paperpaw_sdk::Command)) -> bool
pub fn paperpaw_sdk::library::today(&paperpaw_sdk::Env<'_>) -> core::option::Option<u32>
pub fn paperpaw_sdk::library::unused_books(&dyn paperpaw_platform::storage::Storage, &[paperpaw_sdk::library::BookData], &str, paperpaw_sdk::library::BookDataKind) -> core::result::Result<u32, paperpaw_platform::storage::StorageError>
pub mod paperpaw_sdk::library::catalog
pub mod paperpaw_sdk::library::index
pub mod paperpaw_sdk::library::listing
pub mod paperpaw_sdk::library::service
pub mod paperpaw_sdk::library::what
```
