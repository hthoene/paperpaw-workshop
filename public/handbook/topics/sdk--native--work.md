```rust
pub struct paperpaw_sdk::native::work::Work
pub fn paperpaw_sdk::native::work::Work::cancel(&self, &paperpaw_sdk::native::Host<'_>, &str, &mut [u8], &mut [u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::work::Work::cancel_all(&self, &paperpaw_sdk::native::Host<'_>, &mut [u8], &mut [u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::work::Work::declare(&self, &paperpaw_sdk::native::Host<'_>, &paperpaw_sdk::native::work::WorkSpec<'_>, &mut [u8], &mut [u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::work::Work::open(&paperpaw_sdk::native::Host<'_>) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::work::Work::release(self, &paperpaw_sdk::native::Host<'_>) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::work::Work::state<'a>(&self, &paperpaw_sdk::native::Host<'_>, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::work::WorkList<'a>, paperpaw_sdk::native::Error>
pub enum paperpaw_sdk::native::work::Hold
pub paperpaw_sdk::native::work::Hold::Offline
pub paperpaw_sdk::native::work::Hold::Other(u32)
pub paperpaw_sdk::native::work::Hold::Saving
pub enum paperpaw_sdk::native::work::Moment
pub paperpaw_sdk::native::work::Moment::Charging
pub paperpaw_sdk::native::work::Moment::Online
pub paperpaw_sdk::native::work::Moment::Wake
pub enum paperpaw_sdk::native::work::Phase
pub paperpaw_sdk::native::work::Phase::Held
pub paperpaw_sdk::native::work::Phase::Running
pub paperpaw_sdk::native::work::Phase::Waiting
pub enum paperpaw_sdk::native::work::Refusal
pub paperpaw_sdk::native::work::Refusal::NetworkOff
pub paperpaw_sdk::native::work::Refusal::Other(u32)
pub enum paperpaw_sdk::native::work::Why
pub paperpaw_sdk::native::work::Why::Charging
pub paperpaw_sdk::native::work::Why::Deadline
pub paperpaw_sdk::native::work::Why::Online
pub paperpaw_sdk::native::work::Why::Other(u32)
pub paperpaw_sdk::native::work::Why::Time
pub paperpaw_sdk::native::work::Why::Wake
pub struct paperpaw_sdk::native::work::WorkDue<'a>
pub const fn paperpaw_sdk::native::work::WorkDue<'a>::key(&self) -> &'a str
pub const fn paperpaw_sdk::native::work::WorkDue<'a>::now_ms(&self) -> u64
pub const fn paperpaw_sdk::native::work::WorkDue<'a>::token(&self) -> u32
pub const fn paperpaw_sdk::native::work::WorkDue<'a>::why(&self) -> paperpaw_sdk::native::work::Why
pub struct paperpaw_sdk::native::work::WorkList<'a>
pub fn paperpaw_sdk::native::work::WorkList<'a>::get(&self, &str) -> core::option::Option<paperpaw_sdk::native::work::WorkRow<'a>>
pub const fn paperpaw_sdk::native::work::WorkList<'a>::is_empty(&self) -> bool
pub const fn paperpaw_sdk::native::work::WorkList<'a>::len(&self) -> usize
pub fn paperpaw_sdk::native::work::WorkList<'a>::rows(&self) -> paperpaw_sdk::native::work::WorkRows<'a>
pub fn paperpaw_sdk::native::work::WorkList<'_>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::native::work::WorkRefused<'a>
pub const fn paperpaw_sdk::native::work::WorkRefused<'a>::key(&self) -> &'a str
pub const fn paperpaw_sdk::native::work::WorkRefused<'a>::now_ms(&self) -> u64
pub const fn paperpaw_sdk::native::work::WorkRefused<'a>::reason(&self) -> paperpaw_sdk::native::work::Refusal
pub const fn paperpaw_sdk::native::work::WorkRefused<'a>::token(&self) -> u32
pub struct paperpaw_sdk::native::work::WorkRow<'a>
pub const fn paperpaw_sdk::native::work::WorkRow<'a>::due_ms(&self) -> core::option::Option<u64>
pub const fn paperpaw_sdk::native::work::WorkRow<'a>::hold(&self) -> core::option::Option<paperpaw_sdk::native::work::Hold>
pub const fn paperpaw_sdk::native::work::WorkRow<'a>::key(&self) -> &'a str
pub const fn paperpaw_sdk::native::work::WorkRow<'a>::phase(&self) -> paperpaw_sdk::native::work::Phase
pub const fn paperpaw_sdk::native::work::WorkRow<'a>::token(&self) -> u32
pub fn paperpaw_sdk::native::work::WorkRow<'_>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::native::work::WorkRows<'a>
pub fn paperpaw_sdk::native::work::WorkRows<'_>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub type paperpaw_sdk::native::work::WorkRows<'a>::Item = paperpaw_sdk::native::work::WorkRow<'a>
pub fn paperpaw_sdk::native::work::WorkRows<'a>::next(&mut self) -> core::option::Option<paperpaw_sdk::native::work::WorkRow<'a>>
pub fn paperpaw_sdk::native::work::WorkRows<'a>::size_hint(&self) -> (usize, core::option::Option<usize>)
pub struct paperpaw_sdk::native::work::WorkSpec<'a>
pub const fn paperpaw_sdk::native::work::WorkSpec<'a>::after_ms(self, u32) -> Self
pub fn paperpaw_sdk::native::work::WorkSpec<'a>::at(&'a str, u32, u64) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::work::WorkSpec<'a>::at_moment(self, paperpaw_sdk::native::work::Moment) -> Self
pub fn paperpaw_sdk::native::work::WorkSpec<'a>::check(&self) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::work::WorkSpec<'a>::every_ms(self, u32) -> Self
pub const fn paperpaw_sdk::native::work::WorkSpec<'a>::key(&self) -> &'a str
pub const fn paperpaw_sdk::native::work::WorkSpec<'a>::network(self) -> Self
pub fn paperpaw_sdk::native::work::WorkSpec<'a>::new(&'a str, u32) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::work::WorkSpec<'a>::optional(self) -> Self
pub const fn paperpaw_sdk::native::work::WorkSpec<'a>::retry(self, u32, u8) -> Self
pub const fn paperpaw_sdk::native::work::WorkSpec<'a>::token(&self) -> u32
pub fn paperpaw_sdk::native::work::WorkSpec<'a>::when_cheap(&'a str, u32) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::work::WorkSpec<'a>::within_ms(self, u32) -> Self
pub fn paperpaw_sdk::native::work::WorkSpec<'_>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub const paperpaw_sdk::native::work::EVERY_MIN_MS: u32
pub const paperpaw_sdk::native::work::KEY_MAX_BYTES: usize
pub const paperpaw_sdk::native::work::RETRY_FIRST_MS: u32
pub const paperpaw_sdk::native::work::RETRY_MOST_MS: u32
pub const paperpaw_sdk::native::work::SPAN_MAX_MS: u32
pub const paperpaw_sdk::native::work::STATE_MAX_ROWS: usize
pub const fn paperpaw_sdk::native::work::retry_delay_ms(u32, u8) -> u32
```
