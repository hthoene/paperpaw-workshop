```rust
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
pub use paperpaw_sdk::firmware::fingerprint
pub use paperpaw_sdk::firmware::key_hex
pub use paperpaw_sdk::firmware::parse_key
pub enum paperpaw_sdk::firmware::FirmwareCommand
pub paperpaw_sdk::firmware::FirmwareCommand::Install
pub paperpaw_sdk::firmware::FirmwareCommand::Install::key: core::option::Option<[u8; 32]>
pub paperpaw_sdk::firmware::FirmwareCommand::Install::older: bool
pub paperpaw_sdk::firmware::FirmwareCommand::Install::path: alloc::string::String
pub paperpaw_sdk::firmware::FirmwareCommand::Restart
pub paperpaw_sdk::firmware::FirmwareState::Failed(paperpaw_sdk::firmware::InstallFailure)
pub paperpaw_sdk::firmware::FirmwareState::Idle
pub paperpaw_sdk::firmware::FirmwareState::Installed
pub paperpaw_sdk::firmware::FirmwareState::Installing
pub paperpaw_sdk::firmware::FirmwareState::Installing::done: u64
pub paperpaw_sdk::firmware::FirmwareState::Installing::total: u64
pub paperpaw_sdk::firmware::InstallFailure::Damaged
pub paperpaw_sdk::firmware::InstallFailure::NewerFormat
pub paperpaw_sdk::firmware::InstallFailure::NotAnUpdate
pub paperpaw_sdk::firmware::InstallFailure::NotNewer
pub paperpaw_sdk::firmware::InstallFailure::OtherDevice
pub paperpaw_sdk::firmware::InstallFailure::TooLarge
pub paperpaw_sdk::firmware::InstallFailure::Unreadable
pub paperpaw_sdk::firmware::InstallFailure::Untrusted
pub paperpaw_sdk::firmware::InstallFailure::Write
pub fn paperpaw_sdk::firmware::InstallFailure::from(paperpaw_update::Problem) -> Self
pub paperpaw_sdk::firmware::Signer::PaperPaw
pub paperpaw_sdk::firmware::Signer::Unknown
pub struct paperpaw_sdk::firmware::Firmware
pub paperpaw_sdk::firmware::Firmware::chip: u16
pub paperpaw_sdk::firmware::Firmware::keys: alloc::vec::Vec<[u8; 32]>
pub paperpaw_sdk::firmware::Firmware::plugins: paperpaw_update::plugins::Plugins
pub paperpaw_sdk::firmware::Firmware::project: alloc::string::String
pub paperpaw_sdk::firmware::Firmware::room: u64
pub paperpaw_sdk::firmware::Firmware::state: paperpaw_sdk::firmware::FirmwareState
pub paperpaw_sdk::firmware::Firmware::undone: bool
pub paperpaw_sdk::firmware::Firmware::version: alloc::string::String
pub struct paperpaw_sdk::firmware::Update
pub paperpaw_sdk::firmware::Update::info: paperpaw_update::AppInfo
pub paperpaw_sdk::firmware::Update::path: alloc::string::String
pub paperpaw_sdk::firmware::Update::plugins: core::option::Option<paperpaw_update::plugins::Plugins>
pub paperpaw_sdk::firmware::Update::trailer: paperpaw_update::Trailer
pub fn paperpaw_sdk::firmware::Update::fits(&self, &paperpaw_sdk::firmware::Firmware) -> core::result::Result<(), paperpaw_sdk::firmware::InstallFailure>
pub fn paperpaw_sdk::firmware::Update::is_newer(&self, &paperpaw_sdk::firmware::Firmware) -> bool
pub fn paperpaw_sdk::firmware::Update::leaves_out<'a>(&'a self, &'a paperpaw_sdk::firmware::Firmware) -> alloc::vec::Vec<&'a str>
pub fn paperpaw_sdk::firmware::Update::may_install(&self, &paperpaw_sdk::firmware::Firmware, core::option::Option<&[u8; 32]>, bool) -> core::result::Result<(), paperpaw_sdk::firmware::InstallFailure>
pub fn paperpaw_sdk::firmware::Update::read(&dyn paperpaw_platform::storage::Storage, &str) -> core::result::Result<Self, paperpaw_sdk::firmware::InstallFailure>
pub fn paperpaw_sdk::firmware::Update::signer(&self, &paperpaw_sdk::firmware::Firmware) -> paperpaw_sdk::firmware::Signer
pub const paperpaw_sdk::firmware::UPDATE_DIR: &str
pub fn paperpaw_sdk::firmware::compare_versions(&str, &str) -> core::cmp::Ordering
```
