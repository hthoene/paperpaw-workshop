```rust
pub struct paperpaw_sdk::native::device::BluetoothInfo
pub const fn paperpaw_sdk::native::device::BluetoothInfo::max_links(self) -> u32
pub const fn paperpaw_sdk::native::device::BluetoothInfo::radio(self) -> u32
pub struct paperpaw_sdk::native::device::Device
pub fn paperpaw_sdk::native::device::Device::bluetooth(&self, &paperpaw_sdk::native::Host<'_>, &mut [u8], &mut [u8]) -> core::result::Result<paperpaw_sdk::native::device::BluetoothInfo, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::device::Device::bonded<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::device::DeviceCursor, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::device::DevicePage<'a, paperpaw_sdk::native::device::BondedDevice<'a>>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::device::Device::builtins<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::device::DeviceCursor, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::device::DevicePage<'a, paperpaw_sdk::native::device::BuiltinPlugin<'a>>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::device::Device::check<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::device::DeviceRequest, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::device::FileCheck<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::device::Device::device<'a>(&self, &paperpaw_sdk::native::Host<'_>, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::device::DeviceIdentity<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::device::Device::firmware<'a>(&self, &paperpaw_sdk::native::Host<'_>, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::device::FirmwareInfo<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::device::Device::install<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::device::DeviceRequest, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::device::InstallProgress<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::device::Device::keys<'a>(&self, &paperpaw_sdk::native::Host<'_>, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::device::DevicePage<'a, paperpaw_sdk::native::device::PhysicalKey<'a>>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::device::Device::leaves_out<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::device::DeviceCursor, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::device::DevicePage<'a, paperpaw_sdk::native::device::BuiltinPlugin<'a>>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::device::Device::memory(&self, &paperpaw_sdk::native::Host<'_>, &mut [u8], &mut [u8]) -> core::result::Result<paperpaw_sdk::native::device::MemoryInfo, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::device::Device::native<'a>(&self, &paperpaw_sdk::native::Host<'_>, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::device::NativeBuild<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::device::Device::networks<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::device::DeviceCursor, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::device::DevicePage<'a, paperpaw_sdk::native::device::WifiNetwork<'a>>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::device::Device::not_installed<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::device::DeviceCursor, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::device::DevicePage<'a, paperpaw_sdk::native::device::NotInstalledPlugin<'a>>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::device::Device::power<'a>(&self, &paperpaw_sdk::native::Host<'_>, u32, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::device::PowerInfo<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::device::Device::values<'a>(&self, &paperpaw_sdk::native::Host<'_>, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::device::DevicePage<'a, paperpaw_sdk::native::device::HardwareValue<'a>>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::device::Device::wifi<'a>(&self, &paperpaw_sdk::native::Host<'_>, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::device::WifiInfo<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::device::Device::open(&paperpaw_sdk::native::Host<'_>) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::device::Device::release(self, &paperpaw_sdk::native::Host<'_>) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub struct paperpaw_sdk::native::device::DeviceCursor
pub const fn paperpaw_sdk::native::device::DeviceCursor::start() -> Self
pub struct paperpaw_sdk::native::device::DevicePageEnd
pub const fn paperpaw_sdk::native::device::DevicePageEnd::next_cursor(self) -> core::option::Option<paperpaw_sdk::native::device::DeviceCursor>
pub const fn paperpaw_sdk::native::device::DevicePageEnd::total(self) -> u32
pub struct paperpaw_sdk::native::device::DeviceRequest(_)
pub const fn paperpaw_sdk::native::device::DeviceRequest::get(self) -> u32
pub const fn paperpaw_sdk::native::device::DeviceRequest::new(u32) -> core::option::Option<Self>
pub struct paperpaw_sdk::native::device::MemoryInfo
pub const fn paperpaw_sdk::native::device::MemoryInfo::cached(self) -> bool
pub const fn paperpaw_sdk::native::device::MemoryInfo::external_free(self) -> core::option::Option<u32>
pub const fn paperpaw_sdk::native::device::MemoryInfo::external_size(self) -> core::option::Option<u32>
pub const fn paperpaw_sdk::native::device::MemoryInfo::largest_block(self) -> core::option::Option<u32>
pub const fn paperpaw_sdk::native::device::MemoryInfo::stack_free(self) -> core::option::Option<u32>
pub const fn paperpaw_sdk::native::device::MemoryInfo::stack_size(self) -> core::option::Option<u32>
pub const fn paperpaw_sdk::native::device::MemoryInfo::heap_free(self) -> u32
pub const fn paperpaw_sdk::native::device::MemoryInfo::heap_size(self) -> u32
pub enum paperpaw_sdk::native::device::DeviceCapability
pub paperpaw_sdk::native::device::DeviceCapability::Bluetooth
pub paperpaw_sdk::native::device::DeviceCapability::ButtonRow
pub paperpaw_sdk::native::device::DeviceCapability::Clipboard
pub paperpaw_sdk::native::device::DeviceCapability::Colours
pub paperpaw_sdk::native::device::DeviceCapability::Firmware
pub paperpaw_sdk::native::device::DeviceCapability::Frontlight
pub paperpaw_sdk::native::device::DeviceCapability::Monochrome
pub paperpaw_sdk::native::device::DeviceCapability::Network
pub paperpaw_sdk::native::device::DeviceCapability::Pen
pub paperpaw_sdk::native::device::DeviceCapability::PowerOff
pub paperpaw_sdk::native::device::DeviceCapability::RefreshAsleep
pub paperpaw_sdk::native::device::DeviceCapability::Rotation
pub paperpaw_sdk::native::device::DeviceCapability::Sleep
pub paperpaw_sdk::native::device::DeviceCapability::Speech
pub paperpaw_sdk::native::device::DeviceCapability::Touch
pub paperpaw_sdk::native::device::DeviceCapability::Wifi
pub enum paperpaw_sdk::native::device::DeviceClass
pub paperpaw_sdk::native::device::DeviceClass::Large
pub paperpaw_sdk::native::device::DeviceClass::Medium
pub paperpaw_sdk::native::device::DeviceClass::Small
pub paperpaw_sdk::native::device::DeviceClass::Unknown(u32)
pub enum paperpaw_sdk::native::device::DeviceOutcome
pub paperpaw_sdk::native::device::DeviceOutcome::Cancelled
pub paperpaw_sdk::native::device::DeviceOutcome::CardError
pub paperpaw_sdk::native::device::DeviceOutcome::CardFull
pub paperpaw_sdk::native::device::DeviceOutcome::ContentChanged
pub paperpaw_sdk::native::device::DeviceOutcome::Damaged
pub paperpaw_sdk::native::device::DeviceOutcome::Declined
pub paperpaw_sdk::native::device::DeviceOutcome::Dismissed
pub paperpaw_sdk::native::device::DeviceOutcome::IdTaken
pub paperpaw_sdk::native::device::DeviceOutcome::KeyChanged
pub paperpaw_sdk::native::device::DeviceOutcome::NewerInterface
pub paperpaw_sdk::native::device::DeviceOutcome::NoRoom
pub paperpaw_sdk::native::device::DeviceOutcome::NotNewer
pub paperpaw_sdk::native::device::DeviceOutcome::Ok
pub paperpaw_sdk::native::device::DeviceOutcome::OlderInterface
pub paperpaw_sdk::native::device::DeviceOutcome::Other
pub paperpaw_sdk::native::device::DeviceOutcome::OtherAuthor
pub paperpaw_sdk::native::device::DeviceOutcome::OtherChip
pub paperpaw_sdk::native::device::DeviceOutcome::RestartPending
pub paperpaw_sdk::native::device::DeviceOutcome::Revoked
pub paperpaw_sdk::native::device::DeviceOutcome::UnknownKey
pub paperpaw_sdk::native::device::DeviceOutcome::Unsigned
pub paperpaw_sdk::native::device::DeviceOutcome::Unsupported
pub enum paperpaw_sdk::native::device::FirmwareState
pub paperpaw_sdk::native::device::FirmwareState::Failed
pub paperpaw_sdk::native::device::FirmwareState::Idle
pub paperpaw_sdk::native::device::FirmwareState::Installed
pub paperpaw_sdk::native::device::FirmwareState::Installing
pub paperpaw_sdk::native::device::FirmwareState::Unknown(u32)
pub paperpaw_sdk::native::device::FirmwareState::Waiting
pub enum paperpaw_sdk::native::device::InstallKind
pub paperpaw_sdk::native::device::InstallKind::Check
pub paperpaw_sdk::native::device::InstallKind::Firmware
pub paperpaw_sdk::native::device::InstallKind::Plugin
pub paperpaw_sdk::native::device::InstallKind::Removal
pub paperpaw_sdk::native::device::InstallKind::Unknown(u32)
pub enum paperpaw_sdk::native::device::NativeSafeMode
pub paperpaw_sdk::native::device::NativeSafeMode::None
pub paperpaw_sdk::native::device::NativeSafeMode::StartupFailures
pub paperpaw_sdk::native::device::NativeSafeMode::User
pub enum paperpaw_sdk::native::device::NotInstalledReason
pub paperpaw_sdk::native::device::NotInstalledReason::Damaged
pub paperpaw_sdk::native::device::NotInstalledReason::OtherAuthor
pub paperpaw_sdk::native::device::NotInstalledReason::Revoked
pub paperpaw_sdk::native::device::NotInstalledReason::Unknown(u32)
pub enum paperpaw_sdk::native::device::PowerControl
pub paperpaw_sdk::native::device::PowerControl::Buttons
pub paperpaw_sdk::native::device::PowerControl::CpuClock
pub paperpaw_sdk::native::device::PowerControl::Frontlight
pub paperpaw_sdk::native::device::PowerControl::Radio
pub paperpaw_sdk::native::device::PowerControl::SystemSaver
pub enum paperpaw_sdk::native::device::PowerLevel
pub paperpaw_sdk::native::device::PowerLevel::Normal
pub paperpaw_sdk::native::device::PowerLevel::Offline
pub paperpaw_sdk::native::device::PowerLevel::Saving
pub paperpaw_sdk::native::device::PowerLevel::Unknown(u32)
pub enum paperpaw_sdk::native::device::StartKind
pub paperpaw_sdk::native::device::StartKind::Fault
pub paperpaw_sdk::native::device::StartKind::PowerOn
pub paperpaw_sdk::native::device::StartKind::Restart
pub paperpaw_sdk::native::device::StartKind::Unknown(u32)
pub paperpaw_sdk::native::device::StartKind::UnknownStart
pub paperpaw_sdk::native::device::StartKind::Wake
pub enum paperpaw_sdk::native::device::WifiState
pub paperpaw_sdk::native::device::WifiState::Hosting
pub paperpaw_sdk::native::device::WifiState::Joining
pub paperpaw_sdk::native::device::WifiState::Off
pub paperpaw_sdk::native::device::WifiState::On
pub paperpaw_sdk::native::device::WifiState::Online
pub paperpaw_sdk::native::device::WifiState::Unknown(u32)
pub struct paperpaw_sdk::native::device::BondedDevice<'a>
pub const fn paperpaw_sdk::native::device::BondedDevice<'_>::connected(self) -> bool
pub const fn paperpaw_sdk::native::device::BondedDevice<'_>::remote_keys(self) -> bool
pub const fn paperpaw_sdk::native::device::BondedDevice<'a>::device(self) -> u32
pub const fn paperpaw_sdk::native::device::BondedDevice<'a>::given(self) -> &'a str
pub const fn paperpaw_sdk::native::device::BondedDevice<'a>::kind(self) -> u32
pub const fn paperpaw_sdk::native::device::BondedDevice<'a>::name(self) -> &'a str
pub struct paperpaw_sdk::native::device::BuiltinPlugin<'a>
pub const fn paperpaw_sdk::native::device::BuiltinPlugin<'a>::id(self) -> &'a str
pub const fn paperpaw_sdk::native::device::BuiltinPlugin<'a>::version(self) -> &'a str
pub struct paperpaw_sdk::native::device::DeviceIdentity<'a>
pub const fn paperpaw_sdk::native::device::DeviceIdentity<'_>::can_control(self, paperpaw_sdk::native::device::PowerControl) -> bool
pub const fn paperpaw_sdk::native::device::DeviceIdentity<'_>::class(self) -> paperpaw_sdk::native::device::DeviceClass
pub const fn paperpaw_sdk::native::device::DeviceIdentity<'_>::slept_ms(self) -> core::option::Option<u64>
pub const fn paperpaw_sdk::native::device::DeviceIdentity<'_>::start(self) -> paperpaw_sdk::native::device::StartKind
pub const fn paperpaw_sdk::native::device::DeviceIdentity<'_>::supports(self, paperpaw_sdk::native::device::DeviceCapability) -> bool
pub const fn paperpaw_sdk::native::device::DeviceIdentity<'a>::catalog(self) -> &'a str
pub const fn paperpaw_sdk::native::device::DeviceIdentity<'a>::id(self) -> &'a str
pub const fn paperpaw_sdk::native::device::DeviceIdentity<'a>::model(self) -> &'a str
pub const fn paperpaw_sdk::native::device::DeviceIdentity<'a>::tls_sessions(self) -> u32
pub struct paperpaw_sdk::native::device::DevicePage<'a, T>
pub const fn paperpaw_sdk::native::device::DevicePage<'a, T>::end(&self) -> paperpaw_sdk::native::device::DevicePageEnd
pub const fn paperpaw_sdk::native::device::DevicePage<'a, T>::is_empty(&self) -> bool
pub const fn paperpaw_sdk::native::device::DevicePage<'a, T>::len(&self) -> usize
pub fn paperpaw_sdk::native::device::DevicePage<'a, T>::rows(&self) -> paperpaw_sdk::native::device::DeviceRows<'a, T>
pub fn paperpaw_sdk::native::device::DevicePage<'_, T>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::native::device::DeviceRows<'a, T>
pub type paperpaw_sdk::native::device::DeviceRows<'a, T>::Item = T
pub fn paperpaw_sdk::native::device::DeviceRows<'a, T>::next(&mut self) -> core::option::Option<T>
pub fn paperpaw_sdk::native::device::DeviceRows<'a, T>::size_hint(&self) -> (usize, core::option::Option<usize>)
pub fn paperpaw_sdk::native::device::DeviceRows<'_, T>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::native::device::FileCheck<'a>
pub const fn paperpaw_sdk::native::device::FileCheck<'_>::author_pinned(self) -> bool
pub const fn paperpaw_sdk::native::device::FileCheck<'_>::data_plugin(self) -> bool
pub const fn paperpaw_sdk::native::device::FileCheck<'_>::foreign_firmware(self) -> bool
pub const fn paperpaw_sdk::native::device::FileCheck<'_>::leaves_out(self) -> bool
pub const fn paperpaw_sdk::native::device::FileCheck<'_>::other_author(self) -> bool
pub const fn paperpaw_sdk::native::device::FileCheck<'_>::paperpaw_signed(self) -> bool
pub const fn paperpaw_sdk::native::device::FileCheck<'_>::reason(self) -> paperpaw_sdk::native::device::DeviceOutcome
pub const fn paperpaw_sdk::native::device::FileCheck<'a>::bytes(self) -> u64
pub const fn paperpaw_sdk::native::device::FileCheck<'a>::id(self) -> &'a str
pub const fn paperpaw_sdk::native::device::FileCheck<'a>::needs_draft(self) -> u32
pub const fn paperpaw_sdk::native::device::FileCheck<'a>::signer(self) -> &'a str
pub const fn paperpaw_sdk::native::device::FileCheck<'a>::version(self) -> &'a str
pub const fn paperpaw_sdk::native::device::FileCheck<'a>::sha256(self) -> &'a [u8]
pub fn paperpaw_sdk::native::device::FileCheck<'a>::signing_key(self) -> core::option::Option<&'a [u8; 32]>
pub struct paperpaw_sdk::native::device::FirmwareInfo<'a>
pub const fn paperpaw_sdk::native::device::FirmwareInfo<'_>::reason(self) -> paperpaw_sdk::native::device::DeviceOutcome
pub const fn paperpaw_sdk::native::device::FirmwareInfo<'_>::request(self) -> core::option::Option<paperpaw_sdk::native::device::DeviceRequest>
pub const fn paperpaw_sdk::native::device::FirmwareInfo<'_>::state(self) -> paperpaw_sdk::native::device::FirmwareState
pub const fn paperpaw_sdk::native::device::FirmwareInfo<'_>::undone(self) -> bool
pub const fn paperpaw_sdk::native::device::FirmwareInfo<'a>::chip(self) -> u32
pub const fn paperpaw_sdk::native::device::FirmwareInfo<'a>::done(self) -> u64
pub const fn paperpaw_sdk::native::device::FirmwareInfo<'a>::project(self) -> &'a str
pub const fn paperpaw_sdk::native::device::FirmwareInfo<'a>::room(self) -> u64
pub const fn paperpaw_sdk::native::device::FirmwareInfo<'a>::total(self) -> u64
pub const fn paperpaw_sdk::native::device::FirmwareInfo<'a>::version(self) -> &'a str
pub struct paperpaw_sdk::native::device::HardwareValue<'a>
pub const fn paperpaw_sdk::native::device::HardwareValue<'a>::name(self) -> &'a str
pub const fn paperpaw_sdk::native::device::HardwareValue<'a>::value(self) -> i32
pub struct paperpaw_sdk::native::device::InstallProgress<'a>
pub const fn paperpaw_sdk::native::device::InstallProgress<'_>::data_kept(self) -> bool
pub const fn paperpaw_sdk::native::device::InstallProgress<'_>::restart_required(self) -> bool
pub const fn paperpaw_sdk::native::device::InstallProgress<'_>::kind(self) -> paperpaw_sdk::native::device::InstallKind
pub fn paperpaw_sdk::native::device::InstallProgress<'_>::request(self) -> core::option::Option<paperpaw_sdk::native::device::DeviceRequest>
pub const fn paperpaw_sdk::native::device::InstallProgress<'_>::state_code(self) -> u32
pub const fn paperpaw_sdk::native::device::InstallProgress<'_>::reason(self) -> paperpaw_sdk::native::device::DeviceOutcome
pub const fn paperpaw_sdk::native::device::InstallProgress<'a>::done(self) -> u64
pub const fn paperpaw_sdk::native::device::InstallProgress<'a>::id(self) -> &'a str
pub const fn paperpaw_sdk::native::device::InstallProgress<'a>::status(self) -> i32
pub const fn paperpaw_sdk::native::device::InstallProgress<'a>::total(self) -> u64
pub struct paperpaw_sdk::native::device::NativeBuild<'a>
pub const fn paperpaw_sdk::native::device::NativeBuild<'_>::safe_mode(self) -> paperpaw_sdk::native::device::NativeSafeMode
pub const fn paperpaw_sdk::native::device::NativeBuild<'a>::abi_draft(self) -> u32
pub const fn paperpaw_sdk::native::device::NativeBuild<'a>::abi_major(self) -> u32
pub const fn paperpaw_sdk::native::device::NativeBuild<'a>::code_file(self) -> &'a str
pub const fn paperpaw_sdk::native::device::NativeBuild<'a>::crashed(self) -> &'a str
pub const fn paperpaw_sdk::native::device::NativeBuild<'a>::last_loaded(self) -> &'a str
pub const fn paperpaw_sdk::native::device::NativeBuild<'a>::not_installed(self) -> u32
pub const fn paperpaw_sdk::native::device::NativeBuild<'a>::pending(self) -> u32
pub const fn paperpaw_sdk::native::device::NativeBuild<'a>::room_free(self) -> u64
pub const fn paperpaw_sdk::native::device::NativeBuild<'a>::room_largest(self) -> u64
pub const fn paperpaw_sdk::native::device::NativeBuild<'a>::target(self) -> u32
pub struct paperpaw_sdk::native::device::NotInstalledPlugin<'a>
pub const fn paperpaw_sdk::native::device::NotInstalledPlugin<'_>::reason(self) -> paperpaw_sdk::native::device::NotInstalledReason
pub const fn paperpaw_sdk::native::device::NotInstalledPlugin<'a>::plugin(self) -> &'a str
pub struct paperpaw_sdk::native::device::PhysicalKey<'a>
pub const fn paperpaw_sdk::native::device::PhysicalKey<'a>::name(self) -> &'a str
pub struct paperpaw_sdk::native::device::PowerInfo<'a>
pub const fn paperpaw_sdk::native::device::PowerInfo<'_>::automatic(self) -> bool
pub const fn paperpaw_sdk::native::device::PowerInfo<'_>::online(self) -> bool
pub const fn paperpaw_sdk::native::device::PowerInfo<'_>::level(self) -> paperpaw_sdk::native::device::PowerLevel
pub const fn paperpaw_sdk::native::device::PowerInfo<'a>::every_ms(self) -> u32
pub const fn paperpaw_sdk::native::device::PowerInfo<'a>::mode(self) -> &'a str
pub const fn paperpaw_sdk::native::device::PowerInfo<'a>::stretch(self) -> u32
pub struct paperpaw_sdk::native::device::WifiInfo<'a>
pub const fn paperpaw_sdk::native::device::WifiInfo<'_>::busy(self) -> bool
pub const fn paperpaw_sdk::native::device::WifiInfo<'_>::scanning(self) -> bool
pub const fn paperpaw_sdk::native::device::WifiInfo<'_>::wanted(self) -> bool
pub const fn paperpaw_sdk::native::device::WifiInfo<'_>::state(self) -> paperpaw_sdk::native::device::WifiState
pub const fn paperpaw_sdk::native::device::WifiInfo<'a>::address(self) -> &'a str
pub const fn paperpaw_sdk::native::device::WifiInfo<'a>::guests(self) -> u32
pub const fn paperpaw_sdk::native::device::WifiInfo<'a>::host_name(self) -> &'a str
pub const fn paperpaw_sdk::native::device::WifiInfo<'a>::ssid(self) -> &'a str
pub struct paperpaw_sdk::native::device::WifiNetwork<'a>
pub const fn paperpaw_sdk::native::device::WifiNetwork<'_>::known(self) -> bool
pub const fn paperpaw_sdk::native::device::WifiNetwork<'_>::secured(self) -> bool
pub const fn paperpaw_sdk::native::device::WifiNetwork<'a>::signal(self) -> i32
pub const fn paperpaw_sdk::native::device::WifiNetwork<'a>::ssid(self) -> &'a str
```
