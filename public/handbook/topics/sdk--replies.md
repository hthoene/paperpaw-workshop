```rust
pub struct paperpaw_sdk::replies::Confirmed
pub fn paperpaw_sdk::replies::Confirmed::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::Confirmed::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::Confirmed::to_params(&self) -> paperpaw_sdk::Params
pub paperpaw_sdk::replies::Confirmed::context: paperpaw_sdk::Params
pub paperpaw_sdk::replies::Confirmed::yes: bool
pub fn paperpaw_sdk::replies::Confirmed::new(bool, paperpaw_sdk::Params) -> Self
pub fn paperpaw_sdk::replies::Confirmed::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::Confirmed::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::Confirmed::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::Confirmed::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::Confirmed::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::Confirmed::to_params(&self) -> paperpaw_sdk::Params
pub struct paperpaw_sdk::replies::FolderChosen
pub fn paperpaw_sdk::replies::FolderChosen::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::FolderChosen::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::FolderChosen::to_params(&self) -> paperpaw_sdk::Params
pub paperpaw_sdk::replies::FolderChosen::context: paperpaw_sdk::Params
pub paperpaw_sdk::replies::FolderChosen::path: alloc::string::String
pub fn paperpaw_sdk::replies::FolderChosen::new(impl core::convert::Into<alloc::string::String>, paperpaw_sdk::Params) -> Self
pub fn paperpaw_sdk::replies::FolderChosen::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::FolderChosen::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::FolderChosen::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::FolderChosen::new(impl core::convert::Into<alloc::string::String>, paperpaw_sdk::Params) -> Self
pub fn paperpaw_sdk::replies::FolderChosen::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::FolderChosen::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::FolderChosen::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::FolderChosen::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::FolderChosen::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::FolderChosen::to_params(&self) -> paperpaw_sdk::Params
pub struct paperpaw_sdk::replies::HttpReply
pub fn paperpaw_sdk::replies::HttpReply::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::HttpReply::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::HttpReply::to_params(&self) -> paperpaw_sdk::Params
pub paperpaw_sdk::replies::HttpReply::body: alloc::vec::Vec<u8>
pub paperpaw_sdk::replies::HttpReply::content_type: core::option::Option<alloc::string::String>
pub paperpaw_sdk::replies::HttpReply::context: paperpaw_sdk::Params
pub paperpaw_sdk::replies::HttpReply::error: core::option::Option<paperpaw_sdk::replies::HttpError>
pub paperpaw_sdk::replies::HttpReply::etag: core::option::Option<alloc::string::String>
pub paperpaw_sdk::replies::HttpReply::final_url: core::option::Option<alloc::string::String>
pub paperpaw_sdk::replies::HttpReply::headers: alloc::vec::Vec<(alloc::string::String, alloc::string::String)>
pub paperpaw_sdk::replies::HttpReply::refused: core::option::Option<paperpaw_sdk::work::Refusal>
pub paperpaw_sdk::replies::HttpReply::status: u16
pub paperpaw_sdk::replies::HttpReply::truncated: bool
pub fn paperpaw_sdk::replies::HttpReply::failed(paperpaw_sdk::replies::HttpError, impl core::convert::Into<alloc::string::String>, paperpaw_sdk::Params) -> Self
pub fn paperpaw_sdk::replies::HttpReply::header(&self, &str) -> core::option::Option<&str>
pub fn paperpaw_sdk::replies::HttpReply::new(u16, impl core::convert::Into<alloc::vec::Vec<u8>>) -> Self
pub fn paperpaw_sdk::replies::HttpReply::ok(&self) -> bool
pub fn paperpaw_sdk::replies::HttpReply::refused(paperpaw_sdk::work::Refusal, paperpaw_sdk::Params) -> Self
pub fn paperpaw_sdk::replies::HttpReply::text(&self) -> alloc::borrow::Cow<'_, str>
pub fn paperpaw_sdk::replies::HttpReply::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::HttpReply::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::HttpReply::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::HttpReply::failed(paperpaw_sdk::replies::HttpError, impl core::convert::Into<alloc::string::String>, paperpaw_sdk::Params) -> Self
pub fn paperpaw_sdk::replies::HttpReply::header(&self, &str) -> core::option::Option<&str>
pub fn paperpaw_sdk::replies::HttpReply::new(u16, impl core::convert::Into<alloc::vec::Vec<u8>>) -> Self
pub fn paperpaw_sdk::replies::HttpReply::ok(&self) -> bool
pub fn paperpaw_sdk::replies::HttpReply::refused(paperpaw_sdk::work::Refusal, paperpaw_sdk::Params) -> Self
pub fn paperpaw_sdk::replies::HttpReply::text(&self) -> alloc::borrow::Cow<'_, str>
pub fn paperpaw_sdk::replies::HttpReply::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::HttpReply::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::HttpReply::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::HttpReply::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::HttpReply::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::HttpReply::to_params(&self) -> paperpaw_sdk::Params
pub struct paperpaw_sdk::replies::Spoken
pub fn paperpaw_sdk::replies::Spoken::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::Spoken::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::Spoken::to_params(&self) -> paperpaw_sdk::Params
pub paperpaw_sdk::replies::Spoken::context: paperpaw_sdk::Params
pub paperpaw_sdk::replies::Spoken::spoken: bool
pub fn paperpaw_sdk::replies::Spoken::new(bool, paperpaw_sdk::Params) -> Self
pub fn paperpaw_sdk::replies::Spoken::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::Spoken::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::Spoken::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::Spoken::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::Spoken::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::Spoken::to_params(&self) -> paperpaw_sdk::Params
pub struct paperpaw_sdk::replies::Typed
pub fn paperpaw_sdk::replies::Typed::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::Typed::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::Typed::to_params(&self) -> paperpaw_sdk::Params
pub paperpaw_sdk::replies::Typed::context: paperpaw_sdk::Params
pub paperpaw_sdk::replies::Typed::text: alloc::string::String
pub paperpaw_sdk::replies::Typed::typing: bool
pub fn paperpaw_sdk::replies::Typed::new(impl core::convert::Into<alloc::string::String>, paperpaw_sdk::Params) -> Self
pub fn paperpaw_sdk::replies::Typed::while_typing(self) -> Self
pub fn paperpaw_sdk::replies::Typed::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::Typed::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::Typed::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::Typed::new(impl core::convert::Into<alloc::string::String>, paperpaw_sdk::Params) -> Self
pub fn paperpaw_sdk::replies::Typed::while_typing(self) -> Self
pub fn paperpaw_sdk::replies::Typed::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::Typed::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::Typed::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::Typed::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::Typed::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::Typed::to_params(&self) -> paperpaw_sdk::Params
pub enum paperpaw_sdk::replies::HttpError
pub paperpaw_sdk::replies::HttpError::Cancelled
pub paperpaw_sdk::replies::HttpError::Dns
pub paperpaw_sdk::replies::HttpError::Io
pub paperpaw_sdk::replies::HttpError::NoNetwork
pub paperpaw_sdk::replies::HttpError::Refused
pub paperpaw_sdk::replies::HttpError::Replaced
pub paperpaw_sdk::replies::HttpError::Timeout
pub paperpaw_sdk::replies::HttpError::Tls
pub fn paperpaw_sdk::replies::HttpError::as_str(self) -> &'static str
pub fn paperpaw_sdk::replies::HttpError::parse(&str) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::HttpError::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub fn paperpaw_sdk::replies::HttpError::as_str(self) -> &'static str
pub fn paperpaw_sdk::replies::HttpError::parse(&str) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::HttpError::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub enum paperpaw_sdk::replies::ServerNotice
pub fn paperpaw_sdk::replies::ServerNotice::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::ServerNotice::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::ServerNotice::to_params(&self) -> paperpaw_sdk::Params
pub paperpaw_sdk::replies::ServerNotice::Failed
pub paperpaw_sdk::replies::ServerNotice::Failed::reason: alloc::string::String
pub paperpaw_sdk::replies::ServerNotice::Failed::server: paperpaw_sdk::Id
pub paperpaw_sdk::replies::ServerNotice::Request
pub paperpaw_sdk::replies::ServerNotice::Request::body_file: core::option::Option<alloc::string::String>
pub paperpaw_sdk::replies::ServerNotice::Request::method: alloc::string::String
pub paperpaw_sdk::replies::ServerNotice::Request::request: u32
pub paperpaw_sdk::replies::ServerNotice::Request::server: paperpaw_sdk::Id
pub paperpaw_sdk::replies::ServerNotice::Request::target: alloc::string::String
pub paperpaw_sdk::replies::ServerNotice::Started
pub paperpaw_sdk::replies::ServerNotice::Started::address: alloc::string::String
pub paperpaw_sdk::replies::ServerNotice::Started::server: paperpaw_sdk::Id
pub paperpaw_sdk::replies::ServerNotice::Stopped
pub paperpaw_sdk::replies::ServerNotice::Stopped::server: paperpaw_sdk::Id
pub fn paperpaw_sdk::replies::ServerNotice::server(&self) -> &paperpaw_sdk::Id
pub fn paperpaw_sdk::replies::ServerNotice::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::ServerNotice::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::ServerNotice::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::ServerNotice::server(&self) -> &paperpaw_sdk::Id
pub fn paperpaw_sdk::replies::ServerNotice::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::ServerNotice::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::ServerNotice::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::ServerNotice::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::ServerNotice::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::ServerNotice::to_params(&self) -> paperpaw_sdk::Params
pub enum paperpaw_sdk::replies::SocketNotice
pub fn paperpaw_sdk::replies::SocketNotice::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::SocketNotice::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::SocketNotice::to_params(&self) -> paperpaw_sdk::Params
pub paperpaw_sdk::replies::SocketNotice::Answer
pub paperpaw_sdk::replies::SocketNotice::Answer::from: alloc::string::String
pub paperpaw_sdk::replies::SocketNotice::Answer::socket: paperpaw_sdk::Id
pub paperpaw_sdk::replies::SocketNotice::Answer::text: alloc::string::String
pub paperpaw_sdk::replies::SocketNotice::Closed
pub paperpaw_sdk::replies::SocketNotice::Closed::reason: alloc::string::String
pub paperpaw_sdk::replies::SocketNotice::Closed::socket: paperpaw_sdk::Id
pub paperpaw_sdk::replies::SocketNotice::Connected
pub paperpaw_sdk::replies::SocketNotice::Connected::socket: paperpaw_sdk::Id
pub paperpaw_sdk::replies::SocketNotice::Done
pub paperpaw_sdk::replies::SocketNotice::Done::reason: alloc::string::String
pub paperpaw_sdk::replies::SocketNotice::Done::socket: paperpaw_sdk::Id
pub paperpaw_sdk::replies::SocketNotice::Failed
pub paperpaw_sdk::replies::SocketNotice::Failed::reason: alloc::string::String
pub paperpaw_sdk::replies::SocketNotice::Failed::socket: paperpaw_sdk::Id
pub paperpaw_sdk::replies::SocketNotice::Received
pub paperpaw_sdk::replies::SocketNotice::Received::socket: paperpaw_sdk::Id
pub paperpaw_sdk::replies::SocketNotice::Received::text: alloc::string::String
pub paperpaw_sdk::replies::SocketNotice::Saved
pub paperpaw_sdk::replies::SocketNotice::Saved::path: alloc::string::String
pub paperpaw_sdk::replies::SocketNotice::Saved::socket: paperpaw_sdk::Id
pub fn paperpaw_sdk::replies::SocketNotice::socket(&self) -> &paperpaw_sdk::Id
pub fn paperpaw_sdk::replies::SocketNotice::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::SocketNotice::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::SocketNotice::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::SocketNotice::socket(&self) -> &paperpaw_sdk::Id
pub fn paperpaw_sdk::replies::SocketNotice::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::SocketNotice::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::SocketNotice::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::SocketNotice::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::SocketNotice::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::SocketNotice::to_params(&self) -> paperpaw_sdk::Params
```
