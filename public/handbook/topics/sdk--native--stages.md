```rust
pub struct paperpaw_sdk::native::stages::Stage<'cb>
pub fn paperpaw_sdk::native::stages::Stage<'cb>::new(&'cb paperpaw_sdk::native::Host<'cb>, &'cb str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::stages::Stage<'cb>::out_len(u32) -> usize
pub fn paperpaw_sdk::native::stages::Stage<'cb>::run<'r>(&'r self, &'r [u8], &'r mut [u8]) -> paperpaw_sdk::native::stages::StageRun<'r>
pub fn paperpaw_sdk::native::stages::Stage<'cb>::run_from<'r>(&'r self, u32, &'r [u8], &'r mut [u8]) -> paperpaw_sdk::native::stages::StageRun<'r>
pub struct paperpaw_sdk::native::stages::StageReply<'o>
pub fn paperpaw_sdk::native::stages::StageReply<'o>::index(&self) -> u32
pub fn paperpaw_sdk::native::stages::StageReply<'o>::payload(&self) -> &'o [u8]
pub fn paperpaw_sdk::native::stages::StageReply<'o>::signature(&self) -> u64
pub fn paperpaw_sdk::native::stages::StageReply<'o>::status(&self) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::stages::StageReply<'o>::style_granted(&self) -> bool
pub fn paperpaw_sdk::native::stages::StageReply<'o>::subscriber(&self) -> &'o str
pub struct paperpaw_sdk::native::stages::StageRun<'r>
pub fn paperpaw_sdk::native::stages::StageRun<'_>::next(&mut self) -> core::result::Result<core::option::Option<paperpaw_sdk::native::stages::StageReply<'_>>, paperpaw_sdk::native::Error>
```
