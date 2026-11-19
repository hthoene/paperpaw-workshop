```rust
pub struct paperpaw_sdk::native::files::Files
pub fn paperpaw_sdk::native::files::Files::list<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::storage::Root, &str, u64, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::files::Listing<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::files::Files::make_dir(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::storage::Root, &str, &mut [u8], &mut [u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::files::Files::move_entry(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::storage::Root, &str, paperpaw_sdk::native::storage::Root, &str, bool, &mut [u8], &mut [u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::files::Files::open(&paperpaw_sdk::native::Host<'_>) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::files::Files::release(self, &paperpaw_sdk::native::Host<'_>) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::files::Files::remove_step(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::storage::Root, &str, u64, &mut [u8], &mut [u8]) -> core::result::Result<paperpaw_sdk::native::files::Progress, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::files::Files::remove_tree(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::storage::Root, &str, &mut [u8], &mut [u8]) -> core::result::Result<u64, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::files::Files::space(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::storage::Root, &mut [u8], &mut [u8]) -> core::result::Result<paperpaw_sdk::native::files::Space, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::files::Files::stat<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::storage::Root, &str, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::files::Entry<'a>, paperpaw_sdk::native::Error>
pub struct paperpaw_sdk::native::files::Progress
pub const fn paperpaw_sdk::native::files::Progress::done(&self) -> bool
pub const fn paperpaw_sdk::native::files::Progress::next(&self) -> u64
pub const fn paperpaw_sdk::native::files::Progress::removed(&self) -> u32
pub struct paperpaw_sdk::native::files::Space
pub const fn paperpaw_sdk::native::files::Space::free(&self) -> core::option::Option<u64>
pub const fn paperpaw_sdk::native::files::Space::ignores_case(&self) -> bool
pub const fn paperpaw_sdk::native::files::Space::total(&self) -> core::option::Option<u64>
pub struct paperpaw_sdk::native::files::Entry<'a>
pub const fn paperpaw_sdk::native::files::Entry<'a>::is_folder(&self) -> bool
pub const fn paperpaw_sdk::native::files::Entry<'a>::modified(&self) -> core::option::Option<u64>
pub const fn paperpaw_sdk::native::files::Entry<'a>::name(&self) -> &'a str
pub const fn paperpaw_sdk::native::files::Entry<'a>::size(&self) -> u64
pub const fn paperpaw_sdk::native::files::Entry<'a>::unaddressable(&self) -> bool
pub struct paperpaw_sdk::native::files::Listing<'a>
pub fn paperpaw_sdk::native::files::Listing<'a>::entries(&self) -> impl core::iter::traits::iterator::Iterator<Item = paperpaw_sdk::native::files::Entry<'a>> + use<'a>
pub const fn paperpaw_sdk::native::files::Listing<'a>::is_empty(&self) -> bool
pub const fn paperpaw_sdk::native::files::Listing<'a>::len(&self) -> usize
pub const fn paperpaw_sdk::native::files::Listing<'a>::next(&self) -> core::option::Option<u64>
pub const paperpaw_sdk::native::files::INPUT_BYTES: usize
pub const paperpaw_sdk::native::files::MAX_NAME: usize
pub const paperpaw_sdk::native::files::MAX_PATH: usize
pub const paperpaw_sdk::native::files::OUTPUT_BYTES: usize
pub const paperpaw_sdk::native::files::PAGE_MAX_ROWS: usize
```
