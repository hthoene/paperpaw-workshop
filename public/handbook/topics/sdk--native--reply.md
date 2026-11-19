```rust
pub struct paperpaw_sdk::native::reply::Reply<'cb>
pub fn paperpaw_sdk::native::reply::Reply<'cb>::is_empty(&self) -> bool
pub fn paperpaw_sdk::native::reply::Reply<'cb>::len(&self) -> usize
pub fn paperpaw_sdk::native::reply::Reply<'cb>::remaining(&self) -> usize
pub fn paperpaw_sdk::native::reply::Reply<'cb>::write(&mut self, &[u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::reply::Reply<'cb>::write_with(&mut self, impl core::ops::function::FnOnce(&mut [u8]) -> core::result::Result<usize, paperpaw_sdk::native::Error>) -> core::result::Result<(), paperpaw_sdk::native::Error>
```
