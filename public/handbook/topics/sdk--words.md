```rust
pub struct paperpaw_sdk::words::WordSet
pub fn paperpaw_sdk::words::WordSet::contains(&self, &str) -> bool
pub fn paperpaw_sdk::words::WordSet::decorate(&self, &[paperpaw_sdk::decorations::PageWord<'_>], &paperpaw_sdk::Id) -> alloc::vec::Vec<paperpaw_sdk::decorations::Decorated>
pub fn paperpaw_sdk::words::WordSet::find(&self, &[paperpaw_sdk::decorations::PageWord<'_>]) -> alloc::vec::Vec<core::ops::range::Range<usize>>
pub fn paperpaw_sdk::words::WordSet::is_empty(&self) -> bool
pub fn paperpaw_sdk::words::WordSet::iter(&self) -> impl core::iter::traits::iterator::Iterator<Item = &str> + '_
pub fn paperpaw_sdk::words::WordSet::len(&self) -> usize
pub fn paperpaw_sdk::words::WordSet::new<S: core::convert::AsRef<str>>(impl core::iter::traits::collect::IntoIterator<Item = S>) -> Self
pub fn paperpaw_sdk::words::WordSet::from_iter<I: core::iter::traits::collect::IntoIterator<Item = S>>(I) -> Self
pub fn paperpaw_sdk::words::fold(&str) -> alloc::string::String
```
