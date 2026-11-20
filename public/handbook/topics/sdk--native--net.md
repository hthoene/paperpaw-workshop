```rust
pub struct paperpaw_sdk::native::net::HttpDone
pub const fn paperpaw_sdk::native::net::HttpDone::answered(&self) -> bool
pub const fn paperpaw_sdk::native::net::HttpDone::body_len(&self) -> u32
pub const fn paperpaw_sdk::native::net::HttpDone::id(&self) -> paperpaw_sdk::native::net::RequestId
pub const fn paperpaw_sdk::native::net::HttpDone::later(&self) -> bool
pub const fn paperpaw_sdk::native::net::HttpDone::now_ms(&self) -> u64
pub const fn paperpaw_sdk::native::net::HttpDone::reason(&self) -> paperpaw_sdk::native::net::Reason
pub const fn paperpaw_sdk::native::net::HttpDone::saved(&self) -> bool
pub const fn paperpaw_sdk::native::net::HttpDone::status(&self) -> u32
pub const fn paperpaw_sdk::native::net::HttpDone::succeeded(&self) -> bool
pub const fn paperpaw_sdk::native::net::HttpDone::token(&self) -> u32
pub const fn paperpaw_sdk::native::net::HttpDone::truncated(&self) -> bool
pub struct paperpaw_sdk::native::net::HttpProgress
pub const fn paperpaw_sdk::native::net::HttpProgress::id(&self) -> paperpaw_sdk::native::net::RequestId
pub const fn paperpaw_sdk::native::net::HttpProgress::now_ms(&self) -> u64
pub const fn paperpaw_sdk::native::net::HttpProgress::received(&self) -> u64
pub const fn paperpaw_sdk::native::net::HttpProgress::token(&self) -> u32
pub const fn paperpaw_sdk::native::net::HttpProgress::total(&self) -> core::option::Option<u64>
pub struct paperpaw_sdk::native::net::Net
pub fn paperpaw_sdk::native::net::Net::answer<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::net::RequestId, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::net::Answer<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::net::Net::body<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::net::RequestId, u32, &mut [u8], &'a mut [u8]) -> core::result::Result<&'a [u8], paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::net::Net::cancel(&self, &paperpaw_sdk::native::Host<'_>, u32, &mut [u8], &mut [u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::net::Net::open(&paperpaw_sdk::native::Host<'_>) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::net::Net::release(self, &paperpaw_sdk::native::Host<'_>) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::net::Net::request(&self, &paperpaw_sdk::native::Host<'_>, &paperpaw_sdk::native::net::Request<'_>, &mut [u8], &mut [u8]) -> core::result::Result<paperpaw_sdk::native::net::RequestId, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::net::Net::respond(&self, &paperpaw_sdk::native::Host<'_>, &paperpaw_sdk::native::net::Response<'_>, &mut [u8], &mut [u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::net::Net::serve(&self, &paperpaw_sdk::native::Host<'_>, &paperpaw_sdk::native::net::Server, &mut [u8], &mut [u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::net::Net::stop_serving(&self, &paperpaw_sdk::native::Host<'_>, u32, &mut [u8], &mut [u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub struct paperpaw_sdk::native::net::RequestId(_)
pub const fn paperpaw_sdk::native::net::RequestId::get(self) -> u32
pub const fn paperpaw_sdk::native::net::RequestId::new(u32) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub struct paperpaw_sdk::native::net::Server
pub const fn paperpaw_sdk::native::net::Server::cable(u32) -> Self
pub const fn paperpaw_sdk::native::net::Server::max_body(self, u64) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::net::Server::new(u32, u16) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::net::Server::token(&self) -> u32
pub enum paperpaw_sdk::native::net::FileRoot
pub paperpaw_sdk::native::net::FileRoot::Data
pub paperpaw_sdk::native::net::FileRoot::Files
pub paperpaw_sdk::native::net::FileRoot::Install
pub enum paperpaw_sdk::native::net::Priority
pub paperpaw_sdk::native::net::Priority::Boost
pub paperpaw_sdk::native::net::Priority::Lean
pub paperpaw_sdk::native::net::Priority::Normal
pub enum paperpaw_sdk::native::net::Reason
pub paperpaw_sdk::native::net::Reason::Cancelled
pub paperpaw_sdk::native::net::Reason::Dns
pub paperpaw_sdk::native::net::Reason::Full
pub paperpaw_sdk::native::net::Reason::Io
pub paperpaw_sdk::native::net::Reason::NetworkOff
pub paperpaw_sdk::native::net::Reason::NoNetwork
pub paperpaw_sdk::native::net::Reason::Offline
pub paperpaw_sdk::native::net::Reason::Ok
pub paperpaw_sdk::native::net::Reason::Other(u32)
pub paperpaw_sdk::native::net::Reason::Refused
pub paperpaw_sdk::native::net::Reason::Replaced
pub paperpaw_sdk::native::net::Reason::Saving
pub paperpaw_sdk::native::net::Reason::Timeout
pub paperpaw_sdk::native::net::Reason::Tls
pub paperpaw_sdk::native::net::Reason::TooLarge
pub paperpaw_sdk::native::net::Reason::WorkEnded
pub enum paperpaw_sdk::native::net::ServerState<'a>
pub paperpaw_sdk::native::net::ServerState::Failed
pub paperpaw_sdk::native::net::ServerState::Failed::reason: paperpaw_sdk::native::net::Reason
pub paperpaw_sdk::native::net::ServerState::Other(u32)
pub paperpaw_sdk::native::net::ServerState::Started
pub paperpaw_sdk::native::net::ServerState::Started::address: &'a str
pub paperpaw_sdk::native::net::ServerState::Stopped
pub paperpaw_sdk::native::net::ServerState::Stopped::reason: paperpaw_sdk::native::net::Reason
pub struct paperpaw_sdk::native::net::Answer<'a>(_)
pub const fn paperpaw_sdk::native::net::Answer<'a>::body_len(&self) -> u32
pub const fn paperpaw_sdk::native::net::Answer<'a>::content_type(&self) -> &'a str
pub const fn paperpaw_sdk::native::net::Answer<'a>::etag(&self) -> &'a str
pub const fn paperpaw_sdk::native::net::Answer<'a>::final_url(&self) -> &'a str
pub const fn paperpaw_sdk::native::net::Answer<'a>::saved(&self) -> bool
pub const fn paperpaw_sdk::native::net::Answer<'a>::status(&self) -> u32
pub const fn paperpaw_sdk::native::net::Answer<'a>::truncated(&self) -> bool
pub struct paperpaw_sdk::native::net::Header<'a>
pub fn paperpaw_sdk::native::net::Header<'a>::new(&'a str, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::net::Header<'_>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::native::net::Request<'a>
pub fn paperpaw_sdk::native::net::Request<'a>::body(self, &'a [u8]) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::net::Request<'a>::foreground(self) -> Self
pub fn paperpaw_sdk::native::net::Request<'a>::get(u32, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::net::Request<'a>::headers(self, &'a [paperpaw_sdk::native::net::Header<'a>]) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::net::Request<'a>::max_body(self, u32) -> Self
pub const fn paperpaw_sdk::native::net::Request<'a>::max_file(self, u64) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::net::Request<'a>::new(u32, &'a str, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::net::Request<'a>::priority(self, paperpaw_sdk::native::net::Priority) -> Self
pub const fn paperpaw_sdk::native::net::Request<'a>::progress(self) -> Self
pub fn paperpaw_sdk::native::net::Request<'a>::save_to(self, paperpaw_sdk::native::net::FileRoot, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::net::Request<'a>::send_file(self, paperpaw_sdk::native::net::FileRoot, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::net::Request<'a>::timeout_ms(self, u32) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::net::Request<'_>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::native::net::Response<'a>
pub fn paperpaw_sdk::native::net::Response<'a>::body(self, &'a [u8]) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::net::Response<'a>::content_type(self, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::net::Response<'a>::headers(self, &'a [paperpaw_sdk::native::net::Header<'a>]) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::net::Response<'a>::new(u32, u16) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::net::Response<'a>::send_file(self, paperpaw_sdk::native::net::FileRoot, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::net::Response<'_>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::native::net::ServedRequest<'a>
pub const fn paperpaw_sdk::native::net::ServedRequest<'a>::body_len(&self) -> core::option::Option<u64>
pub const fn paperpaw_sdk::native::net::ServedRequest<'a>::method(&self) -> &'a str
pub const fn paperpaw_sdk::native::net::ServedRequest<'a>::now_ms(&self) -> u64
pub const fn paperpaw_sdk::native::net::ServedRequest<'a>::request(&self) -> u32
pub const fn paperpaw_sdk::native::net::ServedRequest<'a>::server(&self) -> u32
pub const fn paperpaw_sdk::native::net::ServedRequest<'a>::target(&self) -> &'a str
pub fn paperpaw_sdk::native::net::ServedRequest<'_>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::native::net::ServerEvent<'a>
pub const fn paperpaw_sdk::native::net::ServerEvent<'a>::now_ms(&self) -> u64
pub const fn paperpaw_sdk::native::net::ServerEvent<'a>::server(&self) -> u32
pub const fn paperpaw_sdk::native::net::ServerEvent<'a>::state(&self) -> paperpaw_sdk::native::net::ServerState<'a>
pub const paperpaw_sdk::native::net::BODY_PART: usize
pub const paperpaw_sdk::native::net::MAX_HEADERS: usize
pub const paperpaw_sdk::native::net::MAX_INLINE_BODY: usize
pub const paperpaw_sdk::native::net::MAX_RESPONSE_BODY: usize
pub const paperpaw_sdk::native::net::MAX_RESPONSE_HEADERS: usize
pub const paperpaw_sdk::native::net::MAX_SERVED_BODY: u64
pub const paperpaw_sdk::native::net::MAX_URL: usize
pub const paperpaw_sdk::native::net::REPLY: usize
pub const paperpaw_sdk::native::net::REQUEST_INPUT: usize
```
