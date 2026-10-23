```rust
pub fn paperpaw_sdk::replies::Chosen::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::Chosen::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::Confirmed::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::Confirmed::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::HttpReply::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::HttpReply::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::ServerNotice::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::ServerNotice::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::SocketNotice::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::SocketNotice::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::Typed::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::Typed::to_params(&self) -> paperpaw_sdk::Params
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
pub fn paperpaw_sdk::replies::ServerNotice::to_params(&self) -> paperpaw_sdk::Params
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
pub fn paperpaw_sdk::replies::SocketNotice::to_params(&self) -> paperpaw_sdk::Params
pub struct paperpaw_sdk::replies::Chosen
pub paperpaw_sdk::replies::Chosen::context: paperpaw_sdk::Params
pub paperpaw_sdk::replies::Chosen::path: alloc::string::String
pub fn paperpaw_sdk::replies::Chosen::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::Chosen::to_params(&self) -> paperpaw_sdk::Params
pub paperpaw_sdk::replies::Confirmed::context: paperpaw_sdk::Params
pub paperpaw_sdk::replies::Confirmed::yes: bool
pub fn paperpaw_sdk::replies::Confirmed::new(bool, paperpaw_sdk::Params) -> Self
pub fn paperpaw_sdk::replies::Confirmed::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::Confirmed::to_params(&self) -> paperpaw_sdk::Params
pub struct paperpaw_sdk::replies::HttpReply
pub paperpaw_sdk::replies::HttpReply::body: alloc::string::String
pub paperpaw_sdk::replies::HttpReply::content_type: core::option::Option<alloc::string::String>
pub paperpaw_sdk::replies::HttpReply::context: paperpaw_sdk::Params
pub paperpaw_sdk::replies::HttpReply::etag: core::option::Option<alloc::string::String>
pub paperpaw_sdk::replies::HttpReply::final_url: core::option::Option<alloc::string::String>
pub paperpaw_sdk::replies::HttpReply::headers: alloc::vec::Vec<(alloc::string::String, alloc::string::String)>
pub paperpaw_sdk::replies::HttpReply::refused: core::option::Option<paperpaw_sdk::work::Refusal>
pub paperpaw_sdk::replies::HttpReply::status: u16
pub fn paperpaw_sdk::replies::HttpReply::failed(impl core::convert::Into<alloc::string::String>, paperpaw_sdk::Params) -> Self
pub fn paperpaw_sdk::replies::HttpReply::header(&self, &str) -> core::option::Option<&str>
pub fn paperpaw_sdk::replies::HttpReply::ok(&self) -> bool
pub fn paperpaw_sdk::replies::HttpReply::refused(paperpaw_sdk::work::Refusal, paperpaw_sdk::Params) -> Self
pub fn paperpaw_sdk::replies::HttpReply::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::HttpReply::to_params(&self) -> paperpaw_sdk::Params
pub paperpaw_sdk::replies::Typed::context: paperpaw_sdk::Params
pub paperpaw_sdk::replies::Typed::text: alloc::string::String
pub paperpaw_sdk::replies::Typed::typing: bool
pub fn paperpaw_sdk::replies::Typed::new(impl core::convert::Into<alloc::string::String>, paperpaw_sdk::Params) -> Self
pub fn paperpaw_sdk::replies::Typed::while_typing(self) -> Self
pub fn paperpaw_sdk::replies::Typed::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::Typed::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::ServerNotice::server(&self) -> &paperpaw_sdk::Id
pub fn paperpaw_sdk::replies::ServerNotice::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::ServerNotice::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::SocketNotice::socket(&self) -> &paperpaw_sdk::Id
pub fn paperpaw_sdk::replies::SocketNotice::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::SocketNotice::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::Chosen::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::Chosen::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::HttpReply::failed(impl core::convert::Into<alloc::string::String>, paperpaw_sdk::Params) -> Self
pub fn paperpaw_sdk::replies::HttpReply::header(&self, &str) -> core::option::Option<&str>
pub fn paperpaw_sdk::replies::HttpReply::ok(&self) -> bool
pub fn paperpaw_sdk::replies::HttpReply::refused(paperpaw_sdk::work::Refusal, paperpaw_sdk::Params) -> Self
pub fn paperpaw_sdk::replies::HttpReply::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::HttpReply::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::Typed::new(impl core::convert::Into<alloc::string::String>, paperpaw_sdk::Params) -> Self
pub fn paperpaw_sdk::replies::Typed::while_typing(self) -> Self
pub fn paperpaw_sdk::replies::Typed::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::Typed::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::Chosen::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::Chosen::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::Confirmed::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::Confirmed::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::HttpReply::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::HttpReply::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::ServerNotice::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::ServerNotice::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::SocketNotice::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::SocketNotice::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::replies::Typed::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::replies::Typed::to_params(&self) -> paperpaw_sdk::Params
```
