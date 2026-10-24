```rust
pub struct paperpaw_sdk::install::Installer
pub fn paperpaw_sdk::install::Installer::cancel(&self, &dyn paperpaw_platform::storage::Storage)
pub fn paperpaw_sdk::install::Installer::folder(&self, &dyn paperpaw_platform::storage::Storage) -> core::option::Option<alloc::string::String>
pub fn paperpaw_sdk::install::Installer::install(&self, &paperpaw_sdk::Env<'_>, &mut paperpaw_sdk::Commands) -> core::option::Option<paperpaw_sdk::install::Progress>
pub const fn paperpaw_sdk::install::Installer::new(paperpaw_sdk::Id, paperpaw_sdk::event::Event<paperpaw_sdk::replies::HttpReply>) -> Self
pub fn paperpaw_sdk::install::Installer::progress(&self, &dyn paperpaw_platform::storage::Storage) -> core::option::Option<paperpaw_sdk::install::Progress>
pub fn paperpaw_sdk::install::Installer::received(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::replies::HttpReply, &mut paperpaw_sdk::Commands) -> paperpaw_sdk::install::Received
pub fn paperpaw_sdk::install::Installer::remove(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::Id, &mut paperpaw_sdk::Commands)
pub fn paperpaw_sdk::install::Installer::reply(&self) -> paperpaw_sdk::event::Event<paperpaw_sdk::replies::HttpReply>
pub fn paperpaw_sdk::install::Installer::start(&self, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::install::Package, &mut paperpaw_sdk::Commands) -> bool
pub struct paperpaw_sdk::install::Origins
pub fn paperpaw_sdk::install::Origins::of(&self, &str, paperpaw_sdk::Version) -> paperpaw_sdk::install::Origin
pub fn paperpaw_sdk::install::Origins::read(&dyn paperpaw_platform::storage::Storage) -> Self
pub fn paperpaw_sdk::install::Origins::release(&self, &str, paperpaw_sdk::Version) -> core::option::Option<&str>
pub struct paperpaw_sdk::install::Package
pub paperpaw_sdk::install::Package::files: alloc::vec::Vec<paperpaw_sdk::install::PackageFile>
pub paperpaw_sdk::install::Package::name: alloc::string::String
pub paperpaw_sdk::install::Package::plugin: alloc::string::String
pub fn paperpaw_sdk::install::Package::files(self, alloc::vec::Vec<paperpaw_sdk::install::PackageFile>) -> Self
pub fn paperpaw_sdk::install::Package::new(alloc::string::String, alloc::string::String) -> Self
pub fn paperpaw_sdk::install::Package::is_valid(&self) -> bool
pub fn paperpaw_sdk::install::Package::size(&self) -> u64
pub struct paperpaw_sdk::install::PackageFile
pub paperpaw_sdk::install::PackageFile::digest: paperpaw_sdk::install::Digest
pub paperpaw_sdk::install::PackageFile::path: alloc::string::String
pub paperpaw_sdk::install::PackageFile::size: u64
pub paperpaw_sdk::install::PackageFile::url: alloc::string::String
pub fn paperpaw_sdk::install::PackageFile::is_valid(&self) -> bool
pub fn paperpaw_sdk::install::PackageFile::new(alloc::string::String, alloc::string::String, u64, paperpaw_sdk::install::Digest) -> Self
pub struct paperpaw_sdk::install::Progress
pub paperpaw_sdk::install::Progress::done: usize
pub paperpaw_sdk::install::Progress::name: alloc::string::String
pub paperpaw_sdk::install::Progress::plugin: alloc::string::String
pub paperpaw_sdk::install::Progress::total: usize
pub enum paperpaw_sdk::install::Digest
pub paperpaw_sdk::install::Digest::Sha1(alloc::string::String)
pub paperpaw_sdk::install::Digest::Sha256(alloc::string::String)
pub fn paperpaw_sdk::install::Digest::is_valid(&self) -> bool
pub fn paperpaw_sdk::install::Digest::take(&mut self, &str, &str) -> bool
pub fn paperpaw_sdk::install::Digest::text(&self) -> alloc::string::String
pub fn paperpaw_sdk::install::Digest::default() -> Self
pub enum paperpaw_sdk::install::Origin
pub paperpaw_sdk::install::Origin::Local
pub paperpaw_sdk::install::Origin::Store
pub enum paperpaw_sdk::install::Received
pub paperpaw_sdk::install::Received::Complete(paperpaw_sdk::install::Progress)
pub paperpaw_sdk::install::Received::Failed(paperpaw_sdk::install::Progress)
pub paperpaw_sdk::install::Received::Next(paperpaw_sdk::install::Progress)
pub paperpaw_sdk::install::Received::Other
pub const paperpaw_sdk::install::MAX_FILES: usize
pub fn paperpaw_sdk::install::fits(&str, u32) -> bool
pub fn paperpaw_sdk::install::fits_in(&paperpaw_sdk::Env<'_>, &str, u32) -> bool
pub fn paperpaw_sdk::install::fits_sdk(paperpaw_sdk::Version, &str, u32) -> bool
pub fn paperpaw_sdk::install::folder_release(&dyn paperpaw_platform::storage::Storage, &str) -> core::option::Option<alloc::string::String>
pub fn paperpaw_sdk::install::folder_version(&dyn paperpaw_platform::storage::Storage, &str) -> core::option::Option<paperpaw_sdk::Version>
pub fn paperpaw_sdk::install::is_plugin_name(&str) -> bool
pub fn paperpaw_sdk::install::is_safe_path(&str) -> bool
pub fn paperpaw_sdk::install::origin(&dyn paperpaw_platform::storage::Storage, &str, paperpaw_sdk::Version) -> paperpaw_sdk::install::Origin
```
