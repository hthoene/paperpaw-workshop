```rust
pub struct paperpaw_sdk::native::sockets::Pin
pub const fn paperpaw_sdk::native::sockets::Pin::certificate([u8; 32]) -> Self
pub const fn paperpaw_sdk::native::sockets::Pin::hash(&self) -> &[u8; 32]
pub const fn paperpaw_sdk::native::sockets::Pin::kind(&self) -> paperpaw_sdk::native::sockets::PinKind
pub const fn paperpaw_sdk::native::sockets::Pin::public_key([u8; 32]) -> Self
pub struct paperpaw_sdk::native::sockets::SocketEvent
pub const fn paperpaw_sdk::native::sockets::SocketEvent::id(&self) -> paperpaw_sdk::native::sockets::SocketId
pub const fn paperpaw_sdk::native::sockets::SocketEvent::is_empty(&self) -> bool
pub const fn paperpaw_sdk::native::sockets::SocketEvent::kind(&self) -> paperpaw_sdk::native::sockets::SocketKind
pub const fn paperpaw_sdk::native::sockets::SocketEvent::len(&self) -> u32
pub const fn paperpaw_sdk::native::sockets::SocketEvent::now_ms(&self) -> u64
pub const fn paperpaw_sdk::native::sockets::SocketEvent::reason(&self) -> paperpaw_sdk::native::sockets::Reason
pub const fn paperpaw_sdk::native::sockets::SocketEvent::token(&self) -> u32
pub struct paperpaw_sdk::native::sockets::SocketId(_)
pub const fn paperpaw_sdk::native::sockets::SocketId::get(self) -> u32
pub const fn paperpaw_sdk::native::sockets::SocketId::new(u32) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub struct paperpaw_sdk::native::sockets::Sockets
pub fn paperpaw_sdk::native::sockets::Sockets::broadcast(&self, &paperpaw_sdk::native::Host<'_>, &paperpaw_sdk::native::sockets::Broadcast<'_>, &mut [u8], &mut [u8]) -> core::result::Result<paperpaw_sdk::native::sockets::SocketId, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::sockets::Sockets::close(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::sockets::SocketId, &mut [u8], &mut [u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::sockets::Sockets::connect(&self, &paperpaw_sdk::native::Host<'_>, &paperpaw_sdk::native::sockets::Connect<'_>, &mut [u8], &mut [u8]) -> core::result::Result<paperpaw_sdk::native::sockets::SocketId, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::sockets::Sockets::data<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::sockets::SocketId, u32, &mut [u8], &'a mut [u8]) -> core::result::Result<&'a [u8], paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::sockets::Sockets::open(&paperpaw_sdk::native::Host<'_>) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::sockets::Sockets::peer<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::sockets::SocketId, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::sockets::Peer<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::sockets::Sockets::read_bytes(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::sockets::SocketId, u32, bool, &mut [u8], &mut [u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::sockets::Sockets::read_file(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::sockets::SocketId, &paperpaw_sdk::native::sockets::FileRead<'_>, &mut [u8], &mut [u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::sockets::Sockets::release(self, &paperpaw_sdk::native::Host<'_>) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::sockets::Sockets::send(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::sockets::SocketId, &[u8], &mut [u8], &mut [u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::sockets::Sockets::start_tls(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::sockets::SocketId, &paperpaw_sdk::native::sockets::Tls<'_>, &paperpaw_sdk::native::sockets::Reader<'_>, &mut [u8], &mut [u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub enum paperpaw_sdk::native::sockets::BroadcastKind
pub paperpaw_sdk::native::sockets::BroadcastKind::Answer
pub paperpaw_sdk::native::sockets::BroadcastKind::Done
pub paperpaw_sdk::native::sockets::BroadcastKind::Failed
pub paperpaw_sdk::native::sockets::BroadcastKind::Other(u32)
pub enum paperpaw_sdk::native::sockets::PinKind
pub paperpaw_sdk::native::sockets::PinKind::Certificate
pub paperpaw_sdk::native::sockets::PinKind::PublicKey
pub enum paperpaw_sdk::native::sockets::Progress
pub paperpaw_sdk::native::sockets::Progress::Queued
pub paperpaw_sdk::native::sockets::Progress::Waiting
pub enum paperpaw_sdk::native::sockets::Reason
pub paperpaw_sdk::native::sockets::Reason::Busy
pub paperpaw_sdk::native::sockets::Reason::ClosedEarly
pub paperpaw_sdk::native::sockets::Reason::Dns
pub paperpaw_sdk::native::sockets::Reason::Expired
pub paperpaw_sdk::native::sockets::Reason::Full
pub paperpaw_sdk::native::sockets::Reason::Io
pub paperpaw_sdk::native::sockets::Reason::Lost
pub paperpaw_sdk::native::sockets::Reason::Name
pub paperpaw_sdk::native::sockets::Reason::NetworkOff
pub paperpaw_sdk::native::sockets::Reason::NoMemory
pub paperpaw_sdk::native::sockets::Reason::NoNetwork
pub paperpaw_sdk::native::sockets::Reason::None
pub paperpaw_sdk::native::sockets::Reason::Offline
pub paperpaw_sdk::native::sockets::Reason::Other(u32)
pub paperpaw_sdk::native::sockets::Reason::Refused
pub paperpaw_sdk::native::sockets::Reason::Saving
pub paperpaw_sdk::native::sockets::Reason::ScreenClosed
pub paperpaw_sdk::native::sockets::Reason::SessionNeeded
pub paperpaw_sdk::native::sockets::Reason::Timeout
pub paperpaw_sdk::native::sockets::Reason::Tls
pub paperpaw_sdk::native::sockets::Reason::WorkEnded
pub enum paperpaw_sdk::native::sockets::Root
pub paperpaw_sdk::native::sockets::Root::Data
pub paperpaw_sdk::native::sockets::Root::Files
pub enum paperpaw_sdk::native::sockets::SocketKind
pub paperpaw_sdk::native::sockets::SocketKind::Closed
pub paperpaw_sdk::native::sockets::SocketKind::Connected
pub paperpaw_sdk::native::sockets::SocketKind::Failed
pub paperpaw_sdk::native::sockets::SocketKind::Other(u32)
pub paperpaw_sdk::native::sockets::SocketKind::Received
pub paperpaw_sdk::native::sockets::SocketKind::Saved
pub paperpaw_sdk::native::sockets::SocketKind::Secured
pub paperpaw_sdk::native::sockets::SocketKind::Sent
pub paperpaw_sdk::native::sockets::SocketKind::Untrusted
pub enum paperpaw_sdk::native::sockets::Untrusted
pub paperpaw_sdk::native::sockets::Untrusted::NotPinned
pub paperpaw_sdk::native::sockets::Untrusted::Other(u32)
pub paperpaw_sdk::native::sockets::Untrusted::UnknownIssuer
pub struct paperpaw_sdk::native::sockets::Broadcast<'a>
pub fn paperpaw_sdk::native::sockets::Broadcast<'a>::new(u32, &'a [u8], u32, &'a [u16]) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::sockets::Broadcast<'_>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::native::sockets::BroadcastEvent<'a>
pub const fn paperpaw_sdk::native::sockets::BroadcastEvent<'a>::from(&self) -> &'a str
pub const fn paperpaw_sdk::native::sockets::BroadcastEvent<'a>::id(&self) -> paperpaw_sdk::native::sockets::SocketId
pub const fn paperpaw_sdk::native::sockets::BroadcastEvent<'a>::is_empty(&self) -> bool
pub const fn paperpaw_sdk::native::sockets::BroadcastEvent<'a>::kind(&self) -> paperpaw_sdk::native::sockets::BroadcastKind
pub const fn paperpaw_sdk::native::sockets::BroadcastEvent<'a>::len(&self) -> u32
pub const fn paperpaw_sdk::native::sockets::BroadcastEvent<'a>::now_ms(&self) -> u64
pub const fn paperpaw_sdk::native::sockets::BroadcastEvent<'a>::reason(&self) -> paperpaw_sdk::native::sockets::Reason
pub const fn paperpaw_sdk::native::sockets::BroadcastEvent<'a>::token(&self) -> u32
pub struct paperpaw_sdk::native::sockets::Connect<'a>
pub fn paperpaw_sdk::native::sockets::Connect<'a>::check(&self) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::sockets::Connect<'a>::idle_ms(self, u32) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::sockets::Connect<'a>::new(u32, &'a str, u16) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::sockets::Connect<'a>::pins(self, &'a [paperpaw_sdk::native::sockets::Pin]) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::sockets::Connect<'a>::server_name(self, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::sockets::Connect<'a>::timeout_ms(self, u32) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::sockets::Connect<'a>::tls(self) -> Self
pub fn paperpaw_sdk::native::sockets::Connect<'_>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::native::sockets::FileRead<'a>
pub fn paperpaw_sdk::native::sockets::FileRead<'a>::new(paperpaw_sdk::native::sockets::Root, &'a str, u64) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub struct paperpaw_sdk::native::sockets::Outbox<'a>
pub const fn paperpaw_sdk::native::sockets::Outbox<'a>::is_queued(&self) -> bool
pub const fn paperpaw_sdk::native::sockets::Outbox<'a>::new(&'a [u8]) -> Self
pub fn paperpaw_sdk::native::sockets::Outbox<'a>::pump(&mut self, &paperpaw_sdk::native::sockets::Sockets, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::sockets::SocketId, &mut [u8], &mut [u8]) -> core::result::Result<paperpaw_sdk::native::sockets::Progress, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::sockets::Outbox<'a>::remaining(&self) -> usize
pub fn paperpaw_sdk::native::sockets::Outbox<'_>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::native::sockets::Peer<'a>(_)
pub fn paperpaw_sdk::native::sockets::Peer<'_>::certificate(&self) -> core::result::Result<[u8; 32], paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::sockets::Peer<'_>::key(&self) -> core::result::Result<[u8; 32], paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::sockets::Peer<'_>::pin_certificate(&self) -> core::result::Result<paperpaw_sdk::native::sockets::Pin, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::sockets::Peer<'_>::pin_key(&self) -> core::result::Result<paperpaw_sdk::native::sockets::Pin, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::sockets::Peer<'_>::time_checked(&self) -> bool
pub const fn paperpaw_sdk::native::sockets::Peer<'_>::untrusted(&self) -> paperpaw_sdk::native::sockets::Untrusted
pub fn paperpaw_sdk::native::sockets::Peer<'_>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::native::sockets::Reader<'b>
pub fn paperpaw_sdk::native::sockets::Reader<'b>::bytes(&self) -> &[u8]
pub fn paperpaw_sdk::native::sockets::Reader<'b>::clear(&mut self)
pub fn paperpaw_sdk::native::sockets::Reader<'b>::consume(&mut self, usize) -> usize
pub fn paperpaw_sdk::native::sockets::Reader<'b>::fill(&mut self, &paperpaw_sdk::native::sockets::Sockets, &paperpaw_sdk::native::Host<'_>, u32, &mut [u8], &mut [u8]) -> core::result::Result<usize, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::sockets::Reader<'b>::held(&self) -> usize
pub const fn paperpaw_sdk::native::sockets::Reader<'b>::id(&self) -> paperpaw_sdk::native::sockets::SocketId
pub const fn paperpaw_sdk::native::sockets::Reader<'b>::new(paperpaw_sdk::native::sockets::SocketId, &'b mut [u8]) -> Self
pub fn paperpaw_sdk::native::sockets::Reader<'b>::next_line(&mut self) -> core::result::Result<core::option::Option<&str>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::sockets::Reader<'b>::read_bytes(&mut self, &paperpaw_sdk::native::sockets::Sockets, &paperpaw_sdk::native::Host<'_>, u32, bool, &mut [u8], &mut [u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::sockets::Reader<'b>::room(&self) -> usize
pub fn paperpaw_sdk::native::sockets::Reader<'_>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub fn paperpaw_sdk::native::sockets::Reader<'_>::drop(&mut self)
pub struct paperpaw_sdk::native::sockets::Tls<'a>
pub fn paperpaw_sdk::native::sockets::Tls<'a>::idle_ms(self, u32) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::sockets::Tls<'a>::new() -> Self
pub fn paperpaw_sdk::native::sockets::Tls<'a>::pins(self, &'a [paperpaw_sdk::native::sockets::Pin]) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::sockets::Tls<'a>::server_name(self, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::sockets::Tls<'a>::timeout_ms(self, u32) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::sockets::Tls<'_>::default() -> Self
pub fn paperpaw_sdk::native::sockets::Tls<'_>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub const paperpaw_sdk::native::sockets::BROADCAST_MAX_BYTES: usize
pub const paperpaw_sdk::native::sockets::BROADCAST_MAX_PORTS: usize
pub const paperpaw_sdk::native::sockets::IDLE_MAX_MS: u32
pub const paperpaw_sdk::native::sockets::INPUT: usize
pub const paperpaw_sdk::native::sockets::MAX_FILE_LEN: u64
pub const paperpaw_sdk::native::sockets::MAX_PATH: usize
pub const paperpaw_sdk::native::sockets::MAX_PINS: usize
pub const paperpaw_sdk::native::sockets::MAX_READ: u32
pub const paperpaw_sdk::native::sockets::PIECE: usize
pub const paperpaw_sdk::native::sockets::REPLY: usize
pub const paperpaw_sdk::native::sockets::SMALL_REPLY: usize
pub const paperpaw_sdk::native::sockets::TIMEOUT_MAX_MS: u32
```
