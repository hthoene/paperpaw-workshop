```rust
pub fn paperpaw_sdk::wifi::JoinFailure::from_param(&str) -> core::option::Option<Self>
pub fn paperpaw_sdk::wifi::JoinFailure::missing() -> core::option::Option<Self>
pub fn paperpaw_sdk::wifi::JoinFailure::to_param(&self) -> alloc::string::String
pub paperpaw_sdk::wifi::JoinFailure::NotFound
pub paperpaw_sdk::wifi::JoinFailure::Other
pub paperpaw_sdk::wifi::JoinFailure::Password
pub paperpaw_sdk::wifi::JoinFailure::Timeout
pub fn paperpaw_sdk::wifi::JoinFailure::as_str(self) -> &'static str
pub fn paperpaw_sdk::wifi::JoinFailure::parse(&str) -> Self
pub fn paperpaw_sdk::wifi::JoinFailure::from_param(&str) -> core::option::Option<Self>
pub fn paperpaw_sdk::wifi::JoinFailure::missing() -> core::option::Option<Self>
pub fn paperpaw_sdk::wifi::JoinFailure::to_param(&self) -> alloc::string::String
pub enum paperpaw_sdk::wifi::WifiCommand
pub paperpaw_sdk::wifi::WifiCommand::Join
pub paperpaw_sdk::wifi::WifiCommand::Join::password: alloc::string::String
pub paperpaw_sdk::wifi::WifiCommand::Join::ssid: alloc::string::String
pub paperpaw_sdk::wifi::WifiCommand::Leave
pub paperpaw_sdk::wifi::WifiCommand::Off
pub paperpaw_sdk::wifi::WifiCommand::On
pub paperpaw_sdk::wifi::WifiCommand::Scan
pub fn paperpaw_sdk::wifi::WifiCommand::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub paperpaw_sdk::wifi::WifiState::Joining
pub paperpaw_sdk::wifi::WifiState::Joining::ssid: alloc::string::String
pub paperpaw_sdk::wifi::WifiState::Off
pub paperpaw_sdk::wifi::WifiState::On
pub paperpaw_sdk::wifi::WifiState::Online
pub paperpaw_sdk::wifi::WifiState::Online::address: alloc::string::String
pub paperpaw_sdk::wifi::WifiState::Online::ssid: alloc::string::String
pub fn paperpaw_sdk::wifi::WifiState::is_on(&self) -> bool
pub fn paperpaw_sdk::wifi::WifiState::is_online(&self) -> bool
pub fn paperpaw_sdk::wifi::WifiState::ssid(&self) -> core::option::Option<&str>
pub struct paperpaw_sdk::wifi::Wifi
pub paperpaw_sdk::wifi::Wifi::busy: bool
pub paperpaw_sdk::wifi::Wifi::networks: alloc::vec::Vec<paperpaw_sdk::wifi::WifiNetwork>
pub paperpaw_sdk::wifi::Wifi::scanning: bool
pub paperpaw_sdk::wifi::Wifi::state: paperpaw_sdk::wifi::WifiState
pub paperpaw_sdk::wifi::Wifi::wanted: bool
pub struct paperpaw_sdk::wifi::WifiNetwork
pub paperpaw_sdk::wifi::WifiNetwork::secured: bool
pub paperpaw_sdk::wifi::WifiNetwork::signal: i8
pub paperpaw_sdk::wifi::WifiNetwork::ssid: alloc::string::String
pub fn paperpaw_sdk::wifi::WifiNetwork::bars(&self) -> u8
pub const paperpaw_sdk::wifi::NETWORK_WAIT_MS: u64
pub const paperpaw_sdk::wifi::SECRET_PREFIX: &str
pub fn paperpaw_sdk::wifi::forget(&str) -> paperpaw_sdk::secrets::SecretChange
pub fn paperpaw_sdk::wifi::keep(&str, &str) -> paperpaw_sdk::secrets::SecretChange
pub fn paperpaw_sdk::wifi::known<'a>(impl core::iter::traits::collect::IntoIterator<Item = &'a paperpaw_sdk::secrets::Secret>) -> alloc::vec::Vec<(alloc::string::String, alloc::string::String)>
pub fn paperpaw_sdk::wifi::secret_id(&str) -> alloc::string::String
```
