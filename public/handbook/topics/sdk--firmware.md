```rust
pub struct paperpaw_sdk::firmware::Firmware
pub paperpaw_sdk::firmware::Firmware::chip: u16
pub paperpaw_sdk::firmware::Firmware::keys: alloc::vec::Vec<[u8; 32]>
pub paperpaw_sdk::firmware::Firmware::plugins: paperpaw_update::plugins::Plugins
pub paperpaw_sdk::firmware::Firmware::project: alloc::string::String
pub paperpaw_sdk::firmware::Firmware::room: u64
pub paperpaw_sdk::firmware::Firmware::state: paperpaw_sdk::firmware::FirmwareState
pub paperpaw_sdk::firmware::Firmware::undone: bool
pub paperpaw_sdk::firmware::Firmware::version: alloc::string::String
pub fn paperpaw_sdk::firmware::Firmware::keys(self, alloc::vec::Vec<[u8; 32]>) -> Self
pub fn paperpaw_sdk::firmware::Firmware::new(impl core::convert::Into<alloc::string::String>, impl core::convert::Into<alloc::string::String>, u16) -> Self
pub fn paperpaw_sdk::firmware::Firmware::plugins(self, paperpaw_update::plugins::Plugins) -> Self
pub fn paperpaw_sdk::firmware::Firmware::room(self, u64) -> Self
pub fn paperpaw_sdk::firmware::Firmware::state(self, paperpaw_sdk::firmware::FirmwareState) -> Self
pub fn paperpaw_sdk::firmware::Firmware::undone(self, bool) -> Self
pub enum paperpaw_sdk::firmware::FirmwareCommand
pub paperpaw_sdk::firmware::FirmwareCommand::Install
pub paperpaw_sdk::firmware::FirmwareCommand::Install::key: core::option::Option<[u8; 32]>
pub paperpaw_sdk::firmware::FirmwareCommand::Install::older: bool
pub paperpaw_sdk::firmware::FirmwareCommand::Install::path: alloc::string::String
pub paperpaw_sdk::firmware::FirmwareCommand::InstallForeign
pub paperpaw_sdk::firmware::FirmwareCommand::InstallForeign::path: alloc::string::String
pub paperpaw_sdk::firmware::FirmwareCommand::Restart
pub enum paperpaw_sdk::firmware::FirmwareState
pub paperpaw_sdk::firmware::FirmwareState::Failed(paperpaw_sdk::firmware::InstallFailure)
pub paperpaw_sdk::firmware::FirmwareState::Idle
pub paperpaw_sdk::firmware::FirmwareState::Installed
pub paperpaw_sdk::firmware::FirmwareState::Installing
pub paperpaw_sdk::firmware::FirmwareState::Installing::done: u64
pub paperpaw_sdk::firmware::FirmwareState::Installing::total: u64
pub enum paperpaw_sdk::firmware::InstallFailure
pub paperpaw_sdk::firmware::InstallFailure::Damaged
pub paperpaw_sdk::firmware::InstallFailure::LowBattery
pub paperpaw_sdk::firmware::InstallFailure::NewerFormat
pub paperpaw_sdk::firmware::InstallFailure::NotAnUpdate
pub paperpaw_sdk::firmware::InstallFailure::NotNewer
pub paperpaw_sdk::firmware::InstallFailure::OtherDevice
pub paperpaw_sdk::firmware::InstallFailure::TooLarge
pub paperpaw_sdk::firmware::InstallFailure::Unreadable
pub paperpaw_sdk::firmware::InstallFailure::Untrusted
pub paperpaw_sdk::firmware::InstallFailure::Write
pub fn paperpaw_sdk::firmware::InstallFailure::from(paperpaw_update::Problem) -> Self
pub enum paperpaw_sdk::firmware::Signer
pub paperpaw_sdk::firmware::Signer::PaperPaw
pub paperpaw_sdk::firmware::Signer::Unknown
pub use paperpaw_sdk::firmware::APP_HEAD_LEN
pub use paperpaw_sdk::firmware::AppInfo
pub use paperpaw_sdk::firmware::CHIP_ESP32_C3
pub use paperpaw_sdk::firmware::CHIP_ESP32_S3
pub use paperpaw_sdk::firmware::Check
pub use paperpaw_sdk::firmware::PLUGINS_AT
pub use paperpaw_sdk::firmware::PLUGINS_HEAD_LEN
pub use paperpaw_sdk::firmware::PluginCrate
pub use paperpaw_sdk::firmware::Plugins
pub use paperpaw_sdk::firmware::Problem
pub use paperpaw_sdk::firmware::TRAILER_LEN
pub use paperpaw_sdk::firmware::Trailer
pub const paperpaw_sdk::firmware::INSTALL_BATTERY: u8
pub const paperpaw_sdk::firmware::UPDATE_DIR: &str
pub fn paperpaw_sdk::firmware::battery_allows_install(&paperpaw_platform::status::SystemStatus) -> bool
pub fn paperpaw_sdk::firmware::beta(&str) -> core::option::Option<(&str, &str)>
pub fn paperpaw_sdk::firmware::compare_versions(&str, &str) -> core::cmp::Ordering
pub use paperpaw_sdk::firmware::fingerprint
pub use paperpaw_sdk::firmware::key_hex
pub use paperpaw_sdk::firmware::parse_key
```
