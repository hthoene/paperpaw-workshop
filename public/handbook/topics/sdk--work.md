```rust
pub struct paperpaw_sdk::work::Moments(_)
pub const paperpaw_sdk::work::Moments::ALL: paperpaw_sdk::work::Moments
pub const paperpaw_sdk::work::Moments::BLUETOOTH_ON: paperpaw_sdk::work::Moments
pub const paperpaw_sdk::work::Moments::BOOK_CLOSED: paperpaw_sdk::work::Moments
pub const paperpaw_sdk::work::Moments::BOOK_OPENED: paperpaw_sdk::work::Moments
pub const paperpaw_sdk::work::Moments::CHARGING: paperpaw_sdk::work::Moments
pub const paperpaw_sdk::work::Moments::IDLE: paperpaw_sdk::work::Moments
pub const paperpaw_sdk::work::Moments::NONE: paperpaw_sdk::work::Moments
pub const paperpaw_sdk::work::Moments::ONLINE: paperpaw_sdk::work::Moments
pub const paperpaw_sdk::work::Moments::SLEEP: paperpaw_sdk::work::Moments
pub const paperpaw_sdk::work::Moments::WAKE: paperpaw_sdk::work::Moments
pub const fn paperpaw_sdk::work::Moments::bits(self) -> u32
pub const fn paperpaw_sdk::work::Moments::contains(self, paperpaw_sdk::work::Moments) -> bool
pub const fn paperpaw_sdk::work::Moments::from_bits(u32) -> paperpaw_sdk::work::Moments
pub const fn paperpaw_sdk::work::Moments::intersects(self, paperpaw_sdk::work::Moments) -> bool
pub const fn paperpaw_sdk::work::Moments::is_empty(self) -> bool
pub fn paperpaw_sdk::work::Moments::names(self) -> alloc::string::String
pub fn paperpaw_sdk::work::Moments::parse(&str) -> paperpaw_sdk::work::Moments
pub type paperpaw_sdk::work::Moments::Output = paperpaw_sdk::work::Moments
pub fn paperpaw_sdk::work::Moments::bitor(self, paperpaw_sdk::work::Moments) -> paperpaw_sdk::work::Moments
pub struct paperpaw_sdk::work::Needs(_)
pub const paperpaw_sdk::work::Needs::BLUETOOTH: paperpaw_sdk::work::Needs
pub const paperpaw_sdk::work::Needs::CHARGING: paperpaw_sdk::work::Needs
pub const paperpaw_sdk::work::Needs::NETWORK: paperpaw_sdk::work::Needs
pub const paperpaw_sdk::work::Needs::NOTHING: paperpaw_sdk::work::Needs
pub const fn paperpaw_sdk::work::Needs::bits(self) -> u8
pub const fn paperpaw_sdk::work::Needs::contains(self, paperpaw_sdk::work::Needs) -> bool
pub type paperpaw_sdk::work::Needs::Output = paperpaw_sdk::work::Needs
pub fn paperpaw_sdk::work::Needs::bitor(self, paperpaw_sdk::work::Needs) -> paperpaw_sdk::work::Needs
pub struct paperpaw_sdk::work::Note
pub paperpaw_sdk::work::Note::at: paperpaw_platform::input::Instant
pub paperpaw_sdk::work::Note::text: alloc::string::String
pub fn paperpaw_sdk::work::Note::new(paperpaw_platform::input::Instant, impl core::convert::Into<alloc::string::String>) -> Self
pub struct paperpaw_sdk::work::Progress
pub paperpaw_sdk::work::Progress::done: u32
pub paperpaw_sdk::work::Progress::of: u32
pub fn paperpaw_sdk::work::Progress::percent(self) -> u8
pub struct paperpaw_sdk::work::Refusal
pub paperpaw_sdk::work::Refusal::reason: paperpaw_sdk::work::Reason
pub paperpaw_sdk::work::Refusal::retry: paperpaw_sdk::work::Retry
pub const fn paperpaw_sdk::work::Refusal::new(paperpaw_sdk::work::Reason, paperpaw_sdk::work::Retry) -> Self
pub fn paperpaw_sdk::work::Refusal::read(&paperpaw_sdk::Params) -> core::option::Option<paperpaw_sdk::work::Refusal>
pub fn paperpaw_sdk::work::Refusal::write(&self, &mut paperpaw_sdk::Params)
pub struct paperpaw_sdk::work::Work
pub paperpaw_sdk::work::Work::after: core::option::Option<core::time::Duration>
pub paperpaw_sdk::work::Work::at: core::option::Option<paperpaw_platform::input::Instant>
pub paperpaw_sdk::work::Work::every: core::option::Option<core::time::Duration>
pub paperpaw_sdk::work::Work::id: paperpaw_sdk::Id
pub paperpaw_sdk::work::Work::importance: paperpaw_sdk::work::Importance
pub paperpaw_sdk::work::Work::key: alloc::string::String
pub paperpaw_sdk::work::Work::moments: paperpaw_sdk::work::Moments
pub paperpaw_sdk::work::Work::needs: paperpaw_sdk::work::Needs
pub paperpaw_sdk::work::Work::params: paperpaw_sdk::Params
pub paperpaw_sdk::work::Work::within: core::option::Option<core::time::Duration>
pub fn paperpaw_sdk::work::Work::after(self, core::time::Duration) -> Self
pub fn paperpaw_sdk::work::Work::at(impl core::convert::Into<paperpaw_sdk::Id>, paperpaw_platform::input::Instant) -> Self
pub fn paperpaw_sdk::work::Work::at_moments(self, paperpaw_sdk::work::Moments) -> Self
pub fn paperpaw_sdk::work::Work::bluetooth(impl core::convert::Into<paperpaw_sdk::Id>) -> Self
pub fn paperpaw_sdk::work::Work::charging(self) -> Self
pub fn paperpaw_sdk::work::Work::every(self, core::time::Duration) -> Self
pub fn paperpaw_sdk::work::Work::expected(self) -> Self
pub fn paperpaw_sdk::work::Work::key(self, impl core::convert::Into<alloc::string::String>) -> Self
pub fn paperpaw_sdk::work::Work::network(impl core::convert::Into<paperpaw_sdk::Id>) -> Self
pub fn paperpaw_sdk::work::Work::new(impl core::convert::Into<paperpaw_sdk::Id>) -> Self
pub fn paperpaw_sdk::work::Work::optional(self) -> Self
pub fn paperpaw_sdk::work::Work::retry(self, u32, u8) -> Self
pub fn paperpaw_sdk::work::Work::when_cheap(impl core::convert::Into<paperpaw_sdk::Id>, core::time::Duration) -> Self
pub fn paperpaw_sdk::work::Work::with(self, paperpaw_sdk::Params) -> Self
pub fn paperpaw_sdk::work::Work::within(self, core::time::Duration) -> Self
pub struct paperpaw_sdk::work::WorkRefused
pub fn paperpaw_sdk::work::WorkRefused::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::work::WorkRefused::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::work::WorkRefused::to_params(&self) -> paperpaw_sdk::Params
pub paperpaw_sdk::work::WorkRefused::refusal: paperpaw_sdk::work::Refusal
pub paperpaw_sdk::work::WorkRefused::work: paperpaw_sdk::Id
pub fn paperpaw_sdk::work::WorkRefused::new(paperpaw_sdk::Id, paperpaw_sdk::work::Refusal) -> Self
pub fn paperpaw_sdk::work::WorkRefused::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::work::WorkRefused::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::work::WorkRefused::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::work::WorkRefused::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::work::WorkRefused::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::work::WorkRefused::to_params(&self) -> paperpaw_sdk::Params
pub struct paperpaw_sdk::work::WorkSpec
pub paperpaw_sdk::work::WorkSpec::id: paperpaw_sdk::Id
pub paperpaw_sdk::work::WorkSpec::step: paperpaw_sdk::work::StepFn
pub paperpaw_sdk::work::WorkSpec::title: alloc::borrow::Cow<'static, str>
pub fn paperpaw_sdk::work::WorkSpec::new(impl core::convert::Into<paperpaw_sdk::Id>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, impl core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::Params, &mut paperpaw_sdk::Commands) -> paperpaw_sdk::work::Step + 'static) -> Self
pub fn paperpaw_sdk::work::WorkSpec::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::work::WorkStates
pub fn paperpaw_sdk::work::WorkStates::get(&self, &paperpaw_sdk::Id) -> core::option::Option<&paperpaw_sdk::work::WorkState>
pub fn paperpaw_sdk::work::WorkStates::iter(&self) -> impl core::iter::traits::iterator::Iterator<Item = (&paperpaw_sdk::Id, &str, &paperpaw_sdk::work::WorkState)>
pub fn paperpaw_sdk::work::WorkStates::keyed(&self, &paperpaw_sdk::Id, &str) -> core::option::Option<&paperpaw_sdk::work::WorkState>
pub fn paperpaw_sdk::work::WorkStates::none() -> &'static paperpaw_sdk::work::WorkStates
pub fn paperpaw_sdk::work::WorkStates::note(&self, &paperpaw_sdk::Id) -> core::option::Option<&paperpaw_sdk::work::Note>
pub enum paperpaw_sdk::work::Importance
pub paperpaw_sdk::work::Importance::Expected
pub paperpaw_sdk::work::Importance::Optional
pub enum paperpaw_sdk::work::Reason
pub paperpaw_sdk::work::Reason::BluetoothOff
pub paperpaw_sdk::work::Reason::Cancelled
pub paperpaw_sdk::work::Reason::NetworkOff
pub paperpaw_sdk::work::Reason::NoNetwork
pub paperpaw_sdk::work::Reason::NotDeclared
pub paperpaw_sdk::work::Reason::Offline
pub paperpaw_sdk::work::Reason::Saving
pub paperpaw_sdk::work::Reason::Sleeping
pub paperpaw_sdk::work::Reason::TooOften
pub fn paperpaw_sdk::work::Reason::as_str(self) -> &'static str
pub fn paperpaw_sdk::work::Reason::parse(&str) -> core::option::Option<paperpaw_sdk::work::Reason>
pub enum paperpaw_sdk::work::Retry
pub paperpaw_sdk::work::Retry::After(paperpaw_platform::input::Instant)
pub paperpaw_sdk::work::Retry::At(paperpaw_sdk::work::Moments)
pub paperpaw_sdk::work::Retry::Never
pub paperpaw_sdk::work::Retry::WhenAllowed
pub enum paperpaw_sdk::work::Step
pub paperpaw_sdk::work::Step::Continue
pub paperpaw_sdk::work::Step::Done
pub paperpaw_sdk::work::Step::Failed(alloc::string::String)
pub paperpaw_sdk::work::Step::Progress(paperpaw_sdk::work::Progress)
pub paperpaw_sdk::work::Step::Wait(paperpaw_platform::input::Instant)
pub paperpaw_sdk::work::Step::WaitFor(paperpaw_sdk::Id)
pub enum paperpaw_sdk::work::Why
pub paperpaw_sdk::work::Why::Deadline
pub paperpaw_sdk::work::Why::Moment(paperpaw_sdk::work::Moments)
pub paperpaw_sdk::work::Why::Time
pub fn paperpaw_sdk::work::Why::read(&paperpaw_sdk::Params) -> core::option::Option<paperpaw_sdk::work::Why>
pub fn paperpaw_sdk::work::Why::write(self, &mut paperpaw_sdk::Params)
pub enum paperpaw_sdk::work::WorkState
pub paperpaw_sdk::work::WorkState::Held(paperpaw_sdk::work::Refusal)
pub paperpaw_sdk::work::WorkState::Running
pub paperpaw_sdk::work::WorkState::Running::progress: core::option::Option<paperpaw_sdk::work::Progress>
pub paperpaw_sdk::work::WorkState::Waiting
pub paperpaw_sdk::work::WorkState::Waiting::due: core::option::Option<paperpaw_platform::input::Instant>
pub type paperpaw_sdk::work::StepFn = alloc::boxed::Box<dyn core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::Params, &mut paperpaw_sdk::Commands) -> paperpaw_sdk::work::Step>
pub const paperpaw_sdk::work::RETRY_FIRST: core::time::Duration
pub const paperpaw_sdk::work::RETRY_MOST: core::time::Duration
pub const paperpaw_sdk::work::params::REFUSED: &str
pub const paperpaw_sdk::work::params::RETRY: &str
pub const paperpaw_sdk::work::params::WHY: &str
pub const paperpaw_sdk::work::params::WORK: &str
pub fn paperpaw_sdk::work::backoff(u32, u8) -> core::time::Duration
pub mod paperpaw_sdk::work::params
```
