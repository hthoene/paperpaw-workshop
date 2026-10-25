```rust
pub struct paperpaw_sdk::developer::DevRequest
pub enum paperpaw_sdk::developer::DevClose
pub paperpaw_sdk::developer::DevClose::Asked
pub paperpaw_sdk::developer::DevClose::SwitchedOff
pub paperpaw_sdk::developer::DevClose::Unplugged
pub enum paperpaw_sdk::developer::DevCommand
pub paperpaw_sdk::developer::DevCommand::Close
pub paperpaw_sdk::developer::DevCommand::Close::link: paperpaw_sdk::Id
pub paperpaw_sdk::developer::DevCommand::Open
pub paperpaw_sdk::developer::DevCommand::Open::events: paperpaw_sdk::Id
pub paperpaw_sdk::developer::DevCommand::Open::link: paperpaw_sdk::Id
pub paperpaw_sdk::developer::DevCommand::Screen
pub paperpaw_sdk::developer::DevCommand::Screen::link: paperpaw_sdk::Id
pub paperpaw_sdk::developer::DevCommand::Write
pub paperpaw_sdk::developer::DevCommand::Write::data: alloc::vec::Vec<u8>
pub paperpaw_sdk::developer::DevCommand::Write::link: paperpaw_sdk::Id
pub enum paperpaw_sdk::developer::DevError
pub paperpaw_sdk::developer::DevError::Busy
pub paperpaw_sdk::developer::DevError::NotAllowed
pub paperpaw_sdk::developer::DevError::NotAvailable
pub paperpaw_sdk::developer::DevError::NotDeclared
pub paperpaw_sdk::developer::DevError::NotOpen
pub enum paperpaw_sdk::developer::DevEvent
pub paperpaw_sdk::developer::DevEvent::Closed
pub paperpaw_sdk::developer::DevEvent::Closed::link: paperpaw_sdk::Id
pub paperpaw_sdk::developer::DevEvent::Closed::why: paperpaw_sdk::developer::DevClose
pub paperpaw_sdk::developer::DevEvent::Failed
pub paperpaw_sdk::developer::DevEvent::Failed::error: paperpaw_sdk::developer::DevError
pub paperpaw_sdk::developer::DevEvent::Failed::link: paperpaw_sdk::Id
pub paperpaw_sdk::developer::DevEvent::Opened
pub paperpaw_sdk::developer::DevEvent::Opened::link: paperpaw_sdk::Id
pub paperpaw_sdk::developer::DevEvent::Received
pub paperpaw_sdk::developer::DevEvent::Received::data: alloc::vec::Vec<u8>
pub paperpaw_sdk::developer::DevEvent::Received::link: paperpaw_sdk::Id
pub paperpaw_sdk::developer::DevEvent::Screen
pub paperpaw_sdk::developer::DevEvent::Screen::data: alloc::vec::Vec<u8>
pub paperpaw_sdk::developer::DevEvent::Screen::height: u16
pub paperpaw_sdk::developer::DevEvent::Screen::link: paperpaw_sdk::Id
pub paperpaw_sdk::developer::DevEvent::Screen::width: u16
pub fn paperpaw_sdk::developer::DevEvent::link(&self) -> &paperpaw_sdk::Id
pub fn paperpaw_sdk::developer::DevEvent::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::developer::DevEvent::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::developer::DevEvent::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::developer::DevEvent::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::developer::DevEvent::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::developer::DevEvent::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::developer::DevEvent::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::developer::DevEvent::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::developer::DevEvent::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::developer::close(paperpaw_sdk::Id) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::developer::open(paperpaw_sdk::Id, paperpaw_sdk::Id) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::developer::screen(paperpaw_sdk::Id) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::developer::write(paperpaw_sdk::Id, alloc::vec::Vec<u8>) -> paperpaw_sdk::Command
```
