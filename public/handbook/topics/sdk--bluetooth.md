```rust
pub struct paperpaw_sdk::bluetooth::Advertising
pub paperpaw_sdk::bluetooth::Advertising::appearance: core::option::Option<u16>
pub paperpaw_sdk::bluetooth::Advertising::connectable: bool
pub paperpaw_sdk::bluetooth::Advertising::events: paperpaw_sdk::Id
pub paperpaw_sdk::bluetooth::Advertising::lasting: core::time::Duration
pub paperpaw_sdk::bluetooth::Advertising::manufacturer_data: alloc::vec::Vec<paperpaw_sdk::bluetooth::ManufacturerData>
pub paperpaw_sdk::bluetooth::Advertising::name: core::option::Option<alloc::borrow::Cow<'static, str>>
pub paperpaw_sdk::bluetooth::Advertising::power: paperpaw_sdk::bluetooth::AdvertisePower
pub paperpaw_sdk::bluetooth::Advertising::service_data: alloc::vec::Vec<paperpaw_sdk::bluetooth::ServiceData>
pub paperpaw_sdk::bluetooth::Advertising::services: alloc::vec::Vec<paperpaw_sdk::bluetooth::Uuid>
pub fn paperpaw_sdk::bluetooth::Advertising::appearance(self, u16) -> Self
pub fn paperpaw_sdk::bluetooth::Advertising::command(self) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::bluetooth::Advertising::connectable(self) -> Self
pub fn paperpaw_sdk::bluetooth::Advertising::lasting(self, core::time::Duration) -> Self
pub fn paperpaw_sdk::bluetooth::Advertising::manufacturer_data(self, paperpaw_sdk::bluetooth::ManufacturerData) -> Self
pub fn paperpaw_sdk::bluetooth::Advertising::name(self, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> Self
pub fn paperpaw_sdk::bluetooth::Advertising::power(self, paperpaw_sdk::bluetooth::AdvertisePower) -> Self
pub fn paperpaw_sdk::bluetooth::Advertising::service(self, paperpaw_sdk::bluetooth::Uuid) -> Self
pub fn paperpaw_sdk::bluetooth::Advertising::service_data(self, paperpaw_sdk::bluetooth::ServiceData) -> Self
pub struct paperpaw_sdk::bluetooth::AttError(_)
pub const paperpaw_sdk::bluetooth::AttError::INSUFFICIENT_AUTHENTICATION: paperpaw_sdk::bluetooth::AttError
pub const paperpaw_sdk::bluetooth::AttError::INSUFFICIENT_ENCRYPTION: paperpaw_sdk::bluetooth::AttError
pub const paperpaw_sdk::bluetooth::AttError::INVALID_HANDLE: paperpaw_sdk::bluetooth::AttError
pub const paperpaw_sdk::bluetooth::AttError::INVALID_LENGTH: paperpaw_sdk::bluetooth::AttError
pub const paperpaw_sdk::bluetooth::AttError::INVALID_OFFSET: paperpaw_sdk::bluetooth::AttError
pub const paperpaw_sdk::bluetooth::AttError::READ_NOT_PERMITTED: paperpaw_sdk::bluetooth::AttError
pub const paperpaw_sdk::bluetooth::AttError::REQUEST_NOT_SUPPORTED: paperpaw_sdk::bluetooth::AttError
pub const paperpaw_sdk::bluetooth::AttError::UNLIKELY: paperpaw_sdk::bluetooth::AttError
pub const paperpaw_sdk::bluetooth::AttError::VALUE_NOT_ALLOWED: paperpaw_sdk::bluetooth::AttError
pub const paperpaw_sdk::bluetooth::AttError::WRITE_NOT_PERMITTED: paperpaw_sdk::bluetooth::AttError
pub const fn paperpaw_sdk::bluetooth::AttError::code(self) -> u8
pub const fn paperpaw_sdk::bluetooth::AttError::new(u8) -> paperpaw_sdk::bluetooth::AttError
pub struct paperpaw_sdk::bluetooth::Bluetooth
pub paperpaw_sdk::bluetooth::Bluetooth::busy: bool
pub paperpaw_sdk::bluetooth::Bluetooth::max_links: u8
pub paperpaw_sdk::bluetooth::Bluetooth::state: paperpaw_sdk::bluetooth::RadioState
pub struct paperpaw_sdk::bluetooth::Bonded
pub paperpaw_sdk::bluetooth::Bonded::connected: bool
pub paperpaw_sdk::bluetooth::Bonded::id: paperpaw_sdk::bluetooth::DeviceId
pub paperpaw_sdk::bluetooth::Bonded::keys: bool
pub paperpaw_sdk::bluetooth::Bonded::kind: paperpaw_sdk::bluetooth::DeviceKind
pub paperpaw_sdk::bluetooth::Bonded::name: alloc::string::String
pub struct paperpaw_sdk::bluetooth::BtFailure
pub paperpaw_sdk::bluetooth::BtFailure::device: core::option::Option<paperpaw_sdk::bluetooth::DeviceId>
pub paperpaw_sdk::bluetooth::BtFailure::error: paperpaw_sdk::bluetooth::BtError
pub paperpaw_sdk::bluetooth::BtFailure::handle: core::option::Option<paperpaw_sdk::bluetooth::Handle>
pub paperpaw_sdk::bluetooth::BtFailure::op: paperpaw_sdk::bluetooth::BtOp
pub const fn paperpaw_sdk::bluetooth::BtFailure::device(self, paperpaw_sdk::bluetooth::DeviceId) -> Self
pub const fn paperpaw_sdk::bluetooth::BtFailure::handle(self, paperpaw_sdk::bluetooth::Handle) -> Self
pub const fn paperpaw_sdk::bluetooth::BtFailure::new(paperpaw_sdk::bluetooth::BtOp, paperpaw_sdk::bluetooth::BtError) -> Self
pub struct paperpaw_sdk::bluetooth::BtRequest
pub struct paperpaw_sdk::bluetooth::CharacteristicSpec
pub paperpaw_sdk::bluetooth::CharacteristicSpec::access: paperpaw_sdk::bluetooth::Access
pub paperpaw_sdk::bluetooth::CharacteristicSpec::max_len: u16
pub paperpaw_sdk::bluetooth::CharacteristicSpec::properties: paperpaw_sdk::bluetooth::Properties
pub paperpaw_sdk::bluetooth::CharacteristicSpec::uuid: paperpaw_sdk::bluetooth::Uuid
pub const fn paperpaw_sdk::bluetooth::CharacteristicSpec::access(self, paperpaw_sdk::bluetooth::Access) -> Self
pub const fn paperpaw_sdk::bluetooth::CharacteristicSpec::indicate(self) -> Self
pub const fn paperpaw_sdk::bluetooth::CharacteristicSpec::max_len(self, u16) -> Self
pub const fn paperpaw_sdk::bluetooth::CharacteristicSpec::new(paperpaw_sdk::bluetooth::Uuid) -> Self
pub const fn paperpaw_sdk::bluetooth::CharacteristicSpec::notify(self) -> Self
pub const fn paperpaw_sdk::bluetooth::CharacteristicSpec::read(self) -> Self
pub const fn paperpaw_sdk::bluetooth::CharacteristicSpec::write(self) -> Self
pub const fn paperpaw_sdk::bluetooth::CharacteristicSpec::write_without_response(self) -> Self
pub struct paperpaw_sdk::bluetooth::Connect
pub paperpaw_sdk::bluetooth::Connect::device: paperpaw_sdk::bluetooth::DeviceId
pub paperpaw_sdk::bluetooth::Connect::events: paperpaw_sdk::Id
pub paperpaw_sdk::bluetooth::Connect::idle: core::option::Option<core::time::Duration>
pub paperpaw_sdk::bluetooth::Connect::power: paperpaw_sdk::bluetooth::LinkPower
pub fn paperpaw_sdk::bluetooth::Connect::command(self) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::bluetooth::Connect::idle(self, core::time::Duration) -> Self
pub fn paperpaw_sdk::bluetooth::Connect::power(self, paperpaw_sdk::bluetooth::LinkPower) -> Self
pub struct paperpaw_sdk::bluetooth::Device
pub paperpaw_sdk::bluetooth::Device::appearance: core::option::Option<u16>
pub paperpaw_sdk::bluetooth::Device::bonded: bool
pub paperpaw_sdk::bluetooth::Device::id: paperpaw_sdk::bluetooth::DeviceId
pub paperpaw_sdk::bluetooth::Device::kind: paperpaw_sdk::bluetooth::DeviceKind
pub paperpaw_sdk::bluetooth::Device::manufacturer_data: alloc::vec::Vec<paperpaw_sdk::bluetooth::ManufacturerData>
pub paperpaw_sdk::bluetooth::Device::name: core::option::Option<alloc::string::String>
pub paperpaw_sdk::bluetooth::Device::service_data: alloc::vec::Vec<paperpaw_sdk::bluetooth::ServiceData>
pub paperpaw_sdk::bluetooth::Device::services: alloc::vec::Vec<paperpaw_sdk::bluetooth::Uuid>
pub paperpaw_sdk::bluetooth::Device::signal: core::option::Option<i8>
pub paperpaw_sdk::bluetooth::Device::tx_power: core::option::Option<i8>
pub fn paperpaw_sdk::bluetooth::Device::bars(&self) -> u8
pub struct paperpaw_sdk::bluetooth::DeviceId(_)
pub const fn paperpaw_sdk::bluetooth::DeviceId::number(self) -> u32
pub fn paperpaw_sdk::bluetooth::DeviceId::from_param(&str) -> core::option::Option<Self>
pub fn paperpaw_sdk::bluetooth::DeviceId::missing() -> core::option::Option<Self>
pub fn paperpaw_sdk::bluetooth::DeviceId::to_param(&self) -> alloc::string::String
pub fn paperpaw_sdk::bluetooth::DeviceId::from_param(&str) -> core::option::Option<Self>
pub fn paperpaw_sdk::bluetooth::DeviceId::missing() -> core::option::Option<Self>
pub fn paperpaw_sdk::bluetooth::DeviceId::to_param(&self) -> alloc::string::String
pub struct paperpaw_sdk::bluetooth::Discover
pub paperpaw_sdk::bluetooth::Discover::device: paperpaw_sdk::bluetooth::DeviceId
pub paperpaw_sdk::bluetooth::Discover::services: alloc::vec::Vec<paperpaw_sdk::bluetooth::Uuid>
pub fn paperpaw_sdk::bluetooth::Discover::command(self) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::bluetooth::Discover::service(self, paperpaw_sdk::bluetooth::Uuid) -> Self
pub struct paperpaw_sdk::bluetooth::GattCharacteristic
pub paperpaw_sdk::bluetooth::GattCharacteristic::descriptors: alloc::vec::Vec<paperpaw_sdk::bluetooth::GattDescriptor>
pub paperpaw_sdk::bluetooth::GattCharacteristic::handle: paperpaw_sdk::bluetooth::Handle
pub paperpaw_sdk::bluetooth::GattCharacteristic::properties: paperpaw_sdk::bluetooth::Properties
pub paperpaw_sdk::bluetooth::GattCharacteristic::uuid: paperpaw_sdk::bluetooth::Uuid
pub struct paperpaw_sdk::bluetooth::GattDescriptor
pub paperpaw_sdk::bluetooth::GattDescriptor::handle: paperpaw_sdk::bluetooth::Handle
pub paperpaw_sdk::bluetooth::GattDescriptor::uuid: paperpaw_sdk::bluetooth::Uuid
pub struct paperpaw_sdk::bluetooth::GattRequest(_)
pub const fn paperpaw_sdk::bluetooth::GattRequest::number(self) -> u32
pub struct paperpaw_sdk::bluetooth::GattService
pub paperpaw_sdk::bluetooth::GattService::characteristics: alloc::vec::Vec<paperpaw_sdk::bluetooth::GattCharacteristic>
pub paperpaw_sdk::bluetooth::GattService::uuid: paperpaw_sdk::bluetooth::Uuid
pub struct paperpaw_sdk::bluetooth::Handle(_)
pub const fn paperpaw_sdk::bluetooth::Handle::get(self) -> u16
pub struct paperpaw_sdk::bluetooth::ManufacturerData
pub paperpaw_sdk::bluetooth::ManufacturerData::bytes: alloc::vec::Vec<u8>
pub paperpaw_sdk::bluetooth::ManufacturerData::company: u16
pub fn paperpaw_sdk::bluetooth::ManufacturerData::new(u16, impl core::convert::Into<alloc::vec::Vec<u8>>) -> Self
pub struct paperpaw_sdk::bluetooth::Properties(_)
pub const paperpaw_sdk::bluetooth::Properties::BROADCAST: paperpaw_sdk::bluetooth::Properties
pub const paperpaw_sdk::bluetooth::Properties::INDICATE: paperpaw_sdk::bluetooth::Properties
pub const paperpaw_sdk::bluetooth::Properties::NONE: paperpaw_sdk::bluetooth::Properties
pub const paperpaw_sdk::bluetooth::Properties::NOTIFY: paperpaw_sdk::bluetooth::Properties
pub const paperpaw_sdk::bluetooth::Properties::READ: paperpaw_sdk::bluetooth::Properties
pub const paperpaw_sdk::bluetooth::Properties::WRITE: paperpaw_sdk::bluetooth::Properties
pub const paperpaw_sdk::bluetooth::Properties::WRITE_WITHOUT_RESPONSE: paperpaw_sdk::bluetooth::Properties
pub const fn paperpaw_sdk::bluetooth::Properties::bits(self) -> u8
pub const fn paperpaw_sdk::bluetooth::Properties::contains(self, paperpaw_sdk::bluetooth::Properties) -> bool
pub const fn paperpaw_sdk::bluetooth::Properties::from_bits(u8) -> paperpaw_sdk::bluetooth::Properties
pub type paperpaw_sdk::bluetooth::Properties::Output = paperpaw_sdk::bluetooth::Properties
pub fn paperpaw_sdk::bluetooth::Properties::bitor(self, paperpaw_sdk::bluetooth::Properties) -> paperpaw_sdk::bluetooth::Properties
pub struct paperpaw_sdk::bluetooth::Scan
pub paperpaw_sdk::bluetooth::Scan::active: bool
pub paperpaw_sdk::bluetooth::Scan::events: paperpaw_sdk::Id
pub paperpaw_sdk::bluetooth::Scan::first: bool
pub paperpaw_sdk::bluetooth::Scan::lasting: core::time::Duration
pub paperpaw_sdk::bluetooth::Scan::manufacturer: core::option::Option<u16>
pub paperpaw_sdk::bluetooth::Scan::name_prefix: core::option::Option<alloc::string::String>
pub paperpaw_sdk::bluetooth::Scan::power: paperpaw_sdk::bluetooth::ScanPower
pub paperpaw_sdk::bluetooth::Scan::services: alloc::vec::Vec<paperpaw_sdk::bluetooth::Uuid>
pub paperpaw_sdk::bluetooth::Scan::updates: bool
pub fn paperpaw_sdk::bluetooth::Scan::active(self) -> Self
pub fn paperpaw_sdk::bluetooth::Scan::command(self) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::bluetooth::Scan::first(self) -> Self
pub fn paperpaw_sdk::bluetooth::Scan::lasting(self, core::time::Duration) -> Self
pub fn paperpaw_sdk::bluetooth::Scan::manufacturer(self, u16) -> Self
pub fn paperpaw_sdk::bluetooth::Scan::name_prefix(self, impl core::convert::Into<alloc::string::String>) -> Self
pub fn paperpaw_sdk::bluetooth::Scan::passes(&self, &paperpaw_sdk::bluetooth::Device) -> bool
pub fn paperpaw_sdk::bluetooth::Scan::power(self, paperpaw_sdk::bluetooth::ScanPower) -> Self
pub fn paperpaw_sdk::bluetooth::Scan::service(self, paperpaw_sdk::bluetooth::Uuid) -> Self
pub fn paperpaw_sdk::bluetooth::Scan::updates(self) -> Self
pub struct paperpaw_sdk::bluetooth::ServiceData
pub paperpaw_sdk::bluetooth::ServiceData::bytes: alloc::vec::Vec<u8>
pub paperpaw_sdk::bluetooth::ServiceData::service: paperpaw_sdk::bluetooth::Uuid
pub fn paperpaw_sdk::bluetooth::ServiceData::new(paperpaw_sdk::bluetooth::Uuid, impl core::convert::Into<alloc::vec::Vec<u8>>) -> Self
pub struct paperpaw_sdk::bluetooth::ServiceSpec
pub paperpaw_sdk::bluetooth::ServiceSpec::characteristics: alloc::vec::Vec<paperpaw_sdk::bluetooth::CharacteristicSpec>
pub paperpaw_sdk::bluetooth::ServiceSpec::events: paperpaw_sdk::Id
pub paperpaw_sdk::bluetooth::ServiceSpec::uuid: paperpaw_sdk::bluetooth::Uuid
pub fn paperpaw_sdk::bluetooth::ServiceSpec::characteristic(self, paperpaw_sdk::bluetooth::CharacteristicSpec) -> Self
pub fn paperpaw_sdk::bluetooth::ServiceSpec::new(paperpaw_sdk::bluetooth::Uuid, &paperpaw_sdk::event::Event<paperpaw_sdk::bluetooth::BtEvent>) -> Self
pub struct paperpaw_sdk::bluetooth::Uuid(_)
pub const fn paperpaw_sdk::bluetooth::Uuid::as_u128(self) -> u128
pub const fn paperpaw_sdk::bluetooth::Uuid::from_u128(u128) -> paperpaw_sdk::bluetooth::Uuid
pub fn paperpaw_sdk::bluetooth::Uuid::parse(&str) -> core::option::Option<paperpaw_sdk::bluetooth::Uuid>
pub const fn paperpaw_sdk::bluetooth::Uuid::short(self) -> core::option::Option<u16>
pub const fn paperpaw_sdk::bluetooth::Uuid::sig(u16) -> paperpaw_sdk::bluetooth::Uuid
pub fn paperpaw_sdk::bluetooth::Uuid::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::bluetooth::Write
pub fn paperpaw_sdk::bluetooth::Write::command(self) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::bluetooth::Write::without_response(self) -> Self
pub enum paperpaw_sdk::bluetooth::Access
pub paperpaw_sdk::bluetooth::Access::Authenticated
pub paperpaw_sdk::bluetooth::Access::Encrypted
pub paperpaw_sdk::bluetooth::Access::Open
pub enum paperpaw_sdk::bluetooth::AdvertisePower
pub paperpaw_sdk::bluetooth::AdvertisePower::Balanced
pub paperpaw_sdk::bluetooth::AdvertisePower::Fast
pub paperpaw_sdk::bluetooth::AdvertisePower::Low
pub enum paperpaw_sdk::bluetooth::BtError
pub paperpaw_sdk::bluetooth::BtError::Att(paperpaw_sdk::bluetooth::AttError)
pub paperpaw_sdk::bluetooth::BtError::Busy
pub paperpaw_sdk::bluetooth::BtError::Declined
pub paperpaw_sdk::bluetooth::BtError::Held(paperpaw_sdk::work::Refusal)
pub paperpaw_sdk::bluetooth::BtError::Lost
pub paperpaw_sdk::bluetooth::BtError::NotAllowed
pub paperpaw_sdk::bluetooth::BtError::NotFound
pub paperpaw_sdk::bluetooth::BtError::Off
pub paperpaw_sdk::bluetooth::BtError::Timeout
pub paperpaw_sdk::bluetooth::BtError::Unsupported
pub const fn paperpaw_sdk::bluetooth::BtError::as_str(self) -> &'static str
pub fn paperpaw_sdk::bluetooth::BtError::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub fn paperpaw_sdk::bluetooth::BtError::from_param(&str) -> core::option::Option<Self>
pub fn paperpaw_sdk::bluetooth::BtError::missing() -> core::option::Option<Self>
pub fn paperpaw_sdk::bluetooth::BtError::to_param(&self) -> alloc::string::String
pub fn paperpaw_sdk::bluetooth::BtError::from_param(&str) -> core::option::Option<Self>
pub fn paperpaw_sdk::bluetooth::BtError::missing() -> core::option::Option<Self>
pub fn paperpaw_sdk::bluetooth::BtError::to_param(&self) -> alloc::string::String
pub enum paperpaw_sdk::bluetooth::BtEvent
pub paperpaw_sdk::bluetooth::BtEvent::Advertising
pub paperpaw_sdk::bluetooth::BtEvent::AdvertisingEnded
pub paperpaw_sdk::bluetooth::BtEvent::Connected
pub paperpaw_sdk::bluetooth::BtEvent::Connected::device: paperpaw_sdk::bluetooth::DeviceId
pub paperpaw_sdk::bluetooth::BtEvent::Connected::mtu: u16
pub paperpaw_sdk::bluetooth::BtEvent::Connected::security: paperpaw_sdk::bluetooth::Security
pub paperpaw_sdk::bluetooth::BtEvent::Disconnected
pub paperpaw_sdk::bluetooth::BtEvent::Disconnected::device: paperpaw_sdk::bluetooth::DeviceId
pub paperpaw_sdk::bluetooth::BtEvent::Disconnected::reason: core::option::Option<paperpaw_sdk::bluetooth::BtError>
pub paperpaw_sdk::bluetooth::BtEvent::Discovered
pub paperpaw_sdk::bluetooth::BtEvent::Discovered::device: paperpaw_sdk::bluetooth::DeviceId
pub paperpaw_sdk::bluetooth::BtEvent::Discovered::services: alloc::vec::Vec<paperpaw_sdk::bluetooth::GattService>
pub paperpaw_sdk::bluetooth::BtEvent::Done
pub paperpaw_sdk::bluetooth::BtEvent::Done::device: paperpaw_sdk::bluetooth::DeviceId
pub paperpaw_sdk::bluetooth::BtEvent::Done::op: paperpaw_sdk::bluetooth::BtOp
pub paperpaw_sdk::bluetooth::BtEvent::Extended
pub paperpaw_sdk::bluetooth::BtEvent::Extended::key: paperpaw_sdk::Id
pub paperpaw_sdk::bluetooth::BtEvent::Extended::params: paperpaw_sdk::Params
pub paperpaw_sdk::bluetooth::BtEvent::Failed(paperpaw_sdk::bluetooth::BtFailure)
pub paperpaw_sdk::bluetooth::BtEvent::Found(paperpaw_sdk::bluetooth::Device)
pub paperpaw_sdk::bluetooth::BtEvent::HidReport
pub paperpaw_sdk::bluetooth::BtEvent::HidReport::bytes: alloc::vec::Vec<u8>
pub paperpaw_sdk::bluetooth::BtEvent::HidReport::device: paperpaw_sdk::bluetooth::DeviceId
pub paperpaw_sdk::bluetooth::BtEvent::HidReport::report: core::option::Option<u8>
pub paperpaw_sdk::bluetooth::BtEvent::HidReportMap
pub paperpaw_sdk::bluetooth::BtEvent::HidReportMap::bytes: alloc::vec::Vec<u8>
pub paperpaw_sdk::bluetooth::BtEvent::HidReportMap::device: paperpaw_sdk::bluetooth::DeviceId
pub paperpaw_sdk::bluetooth::BtEvent::Paired
pub paperpaw_sdk::bluetooth::BtEvent::Paired::device: paperpaw_sdk::bluetooth::DeviceId
pub paperpaw_sdk::bluetooth::BtEvent::ReadRequest
pub paperpaw_sdk::bluetooth::BtEvent::ReadRequest::central: paperpaw_sdk::bluetooth::DeviceId
pub paperpaw_sdk::bluetooth::BtEvent::ReadRequest::characteristic: paperpaw_sdk::bluetooth::Uuid
pub paperpaw_sdk::bluetooth::BtEvent::ReadRequest::request: paperpaw_sdk::bluetooth::GattRequest
pub paperpaw_sdk::bluetooth::BtEvent::ReadRequest::service: paperpaw_sdk::bluetooth::Uuid
pub paperpaw_sdk::bluetooth::BtEvent::ScanEnded
pub paperpaw_sdk::bluetooth::BtEvent::Sent
pub paperpaw_sdk::bluetooth::BtEvent::Sent::device: paperpaw_sdk::bluetooth::DeviceId
pub paperpaw_sdk::bluetooth::BtEvent::Sent::handle: paperpaw_sdk::bluetooth::Handle
pub paperpaw_sdk::bluetooth::BtEvent::ServicesChanged
pub paperpaw_sdk::bluetooth::BtEvent::ServicesChanged::device: paperpaw_sdk::bluetooth::DeviceId
pub paperpaw_sdk::bluetooth::BtEvent::Subscribed
pub paperpaw_sdk::bluetooth::BtEvent::Subscribed::central: paperpaw_sdk::bluetooth::DeviceId
pub paperpaw_sdk::bluetooth::BtEvent::Subscribed::characteristic: paperpaw_sdk::bluetooth::Uuid
pub paperpaw_sdk::bluetooth::BtEvent::Subscribed::service: paperpaw_sdk::bluetooth::Uuid
pub paperpaw_sdk::bluetooth::BtEvent::Unsubscribed
pub paperpaw_sdk::bluetooth::BtEvent::Unsubscribed::central: paperpaw_sdk::bluetooth::DeviceId
pub paperpaw_sdk::bluetooth::BtEvent::Unsubscribed::characteristic: paperpaw_sdk::bluetooth::Uuid
pub paperpaw_sdk::bluetooth::BtEvent::Unsubscribed::service: paperpaw_sdk::bluetooth::Uuid
pub paperpaw_sdk::bluetooth::BtEvent::Value
pub paperpaw_sdk::bluetooth::BtEvent::Value::bytes: alloc::vec::Vec<u8>
pub paperpaw_sdk::bluetooth::BtEvent::Value::device: paperpaw_sdk::bluetooth::DeviceId
pub paperpaw_sdk::bluetooth::BtEvent::Value::handle: paperpaw_sdk::bluetooth::Handle
pub paperpaw_sdk::bluetooth::BtEvent::Value::kind: paperpaw_sdk::bluetooth::ValueKind
pub paperpaw_sdk::bluetooth::BtEvent::WriteRequest
pub paperpaw_sdk::bluetooth::BtEvent::WriteRequest::bytes: alloc::vec::Vec<u8>
pub paperpaw_sdk::bluetooth::BtEvent::WriteRequest::central: paperpaw_sdk::bluetooth::DeviceId
pub paperpaw_sdk::bluetooth::BtEvent::WriteRequest::characteristic: paperpaw_sdk::bluetooth::Uuid
pub paperpaw_sdk::bluetooth::BtEvent::WriteRequest::request: core::option::Option<paperpaw_sdk::bluetooth::GattRequest>
pub paperpaw_sdk::bluetooth::BtEvent::WriteRequest::service: paperpaw_sdk::bluetooth::Uuid
pub paperpaw_sdk::bluetooth::BtEvent::Written
pub paperpaw_sdk::bluetooth::BtEvent::Written::device: paperpaw_sdk::bluetooth::DeviceId
pub paperpaw_sdk::bluetooth::BtEvent::Written::handle: paperpaw_sdk::bluetooth::Handle
pub const fn paperpaw_sdk::bluetooth::BtEvent::device(&self) -> core::option::Option<paperpaw_sdk::bluetooth::DeviceId>
pub const fn paperpaw_sdk::bluetooth::BtEvent::kind(&self) -> &'static str
pub fn paperpaw_sdk::bluetooth::BtEvent::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::bluetooth::BtEvent::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::bluetooth::BtEvent::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::bluetooth::BtEvent::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::bluetooth::BtEvent::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::bluetooth::BtEvent::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::bluetooth::BtEvent::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::bluetooth::BtEvent::into_params(self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::bluetooth::BtEvent::to_params(&self) -> paperpaw_sdk::Params
pub enum paperpaw_sdk::bluetooth::BtOp
pub paperpaw_sdk::bluetooth::BtOp::Advertise
pub paperpaw_sdk::bluetooth::BtOp::Connect
pub paperpaw_sdk::bluetooth::BtOp::Disconnect
pub paperpaw_sdk::bluetooth::BtOp::Discover
pub paperpaw_sdk::bluetooth::BtOp::Extended
pub paperpaw_sdk::bluetooth::BtOp::Forget
pub paperpaw_sdk::bluetooth::BtOp::Give
pub paperpaw_sdk::bluetooth::BtOp::HidReports
pub paperpaw_sdk::bluetooth::BtOp::Keys
pub paperpaw_sdk::bluetooth::BtOp::Notify
pub paperpaw_sdk::bluetooth::BtOp::Pair
pub paperpaw_sdk::bluetooth::BtOp::Read
pub paperpaw_sdk::bluetooth::BtOp::Respond
pub paperpaw_sdk::bluetooth::BtOp::Scan
pub paperpaw_sdk::bluetooth::BtOp::Subscribe
pub paperpaw_sdk::bluetooth::BtOp::Unsubscribe
pub paperpaw_sdk::bluetooth::BtOp::Write
pub const fn paperpaw_sdk::bluetooth::BtOp::as_str(self) -> &'static str
pub fn paperpaw_sdk::bluetooth::BtOp::parse(&str) -> core::option::Option<paperpaw_sdk::bluetooth::BtOp>
pub enum paperpaw_sdk::bluetooth::DeviceKind
pub paperpaw_sdk::bluetooth::DeviceKind::Keyboard
pub paperpaw_sdk::bluetooth::DeviceKind::Other
pub paperpaw_sdk::bluetooth::DeviceKind::Phone
pub paperpaw_sdk::bluetooth::DeviceKind::Remote
pub paperpaw_sdk::bluetooth::DeviceKind::Sensor
pub const fn paperpaw_sdk::bluetooth::DeviceKind::as_str(self) -> &'static str
pub const fn paperpaw_sdk::bluetooth::DeviceKind::can_type(self) -> bool
pub fn paperpaw_sdk::bluetooth::DeviceKind::parse(&str) -> paperpaw_sdk::bluetooth::DeviceKind
pub enum paperpaw_sdk::bluetooth::LinkPower
pub paperpaw_sdk::bluetooth::LinkPower::Burst
pub paperpaw_sdk::bluetooth::LinkPower::Low
pub paperpaw_sdk::bluetooth::LinkPower::Responsive
pub enum paperpaw_sdk::bluetooth::RadioState
pub paperpaw_sdk::bluetooth::RadioState::Off
pub paperpaw_sdk::bluetooth::RadioState::On
pub enum paperpaw_sdk::bluetooth::ScanPower
pub paperpaw_sdk::bluetooth::ScanPower::Balanced
pub paperpaw_sdk::bluetooth::ScanPower::Fast
pub paperpaw_sdk::bluetooth::ScanPower::Low
pub enum paperpaw_sdk::bluetooth::Security
pub paperpaw_sdk::bluetooth::Security::Authenticated
pub paperpaw_sdk::bluetooth::Security::Encrypted
pub paperpaw_sdk::bluetooth::Security::None
pub enum paperpaw_sdk::bluetooth::ValueKind
pub paperpaw_sdk::bluetooth::ValueKind::Indicated
pub paperpaw_sdk::bluetooth::ValueKind::Notified
pub paperpaw_sdk::bluetooth::ValueKind::Read
pub struct paperpaw_sdk::bluetooth::BluetoothView<'a>
pub fn paperpaw_sdk::bluetooth::BluetoothView<'a>::bond(&self, paperpaw_sdk::bluetooth::DeviceId) -> core::option::Option<&'a paperpaw_sdk::bluetooth::Bonded>
pub fn paperpaw_sdk::bluetooth::BluetoothView<'a>::bonded(&self) -> impl core::iter::traits::iterator::Iterator<Item = &'a paperpaw_sdk::bluetooth::Bonded> + '_
pub fn paperpaw_sdk::bluetooth::BluetoothView<'a>::busy(&self) -> bool
pub fn paperpaw_sdk::bluetooth::BluetoothView<'a>::given(&self, paperpaw_sdk::bluetooth::DeviceId) -> &'a [paperpaw_sdk::Id]
pub fn paperpaw_sdk::bluetooth::BluetoothView<'a>::manager(&self) -> bool
pub fn paperpaw_sdk::bluetooth::BluetoothView<'a>::max_links(&self) -> u8
pub fn paperpaw_sdk::bluetooth::BluetoothView<'a>::state(&self) -> paperpaw_sdk::bluetooth::RadioState
pub fn paperpaw_sdk::bluetooth::BluetoothView<'_>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub const paperpaw_sdk::bluetooth::bt_params::CHARACTERISTIC: &str
pub const paperpaw_sdk::bluetooth::bt_params::DEVICE: &str
pub const paperpaw_sdk::bluetooth::bt_params::ERROR: &str
pub const paperpaw_sdk::bluetooth::bt_params::HANDLE: &str
pub const paperpaw_sdk::bluetooth::bt_params::KIND: &str
pub const paperpaw_sdk::bluetooth::bt_params::LENGTH: &str
pub const paperpaw_sdk::bluetooth::bt_params::OP: &str
pub const paperpaw_sdk::bluetooth::bt_params::SERVICE: &str
pub fn paperpaw_sdk::bluetooth::advertise(&paperpaw_sdk::event::Event<paperpaw_sdk::bluetooth::BtEvent>) -> paperpaw_sdk::bluetooth::Advertising
pub fn paperpaw_sdk::bluetooth::characteristic(&[paperpaw_sdk::bluetooth::GattService], paperpaw_sdk::bluetooth::Uuid, paperpaw_sdk::bluetooth::Uuid) -> core::option::Option<&paperpaw_sdk::bluetooth::GattCharacteristic>
pub fn paperpaw_sdk::bluetooth::connect(paperpaw_sdk::bluetooth::DeviceId, &paperpaw_sdk::event::Event<paperpaw_sdk::bluetooth::BtEvent>) -> paperpaw_sdk::bluetooth::Connect
pub fn paperpaw_sdk::bluetooth::disconnect(paperpaw_sdk::bluetooth::DeviceId) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::bluetooth::discover(paperpaw_sdk::bluetooth::DeviceId) -> paperpaw_sdk::bluetooth::Discover
pub fn paperpaw_sdk::bluetooth::extended(impl core::convert::Into<paperpaw_sdk::Id>, paperpaw_sdk::Params) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::bluetooth::forget(paperpaw_sdk::bluetooth::DeviceId, &paperpaw_sdk::event::Event<paperpaw_sdk::bluetooth::BtEvent>) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::bluetooth::give(paperpaw_sdk::bluetooth::DeviceId, impl core::convert::Into<paperpaw_sdk::Id>, &paperpaw_sdk::event::Event<paperpaw_sdk::bluetooth::BtEvent>) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::bluetooth::hid_reports(paperpaw_sdk::bluetooth::DeviceId, &paperpaw_sdk::event::Event<paperpaw_sdk::bluetooth::BtEvent>) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::bluetooth::notify_centrals(paperpaw_sdk::bluetooth::Uuid, paperpaw_sdk::bluetooth::Uuid, impl core::convert::Into<alloc::vec::Vec<u8>>) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::bluetooth::pair(paperpaw_sdk::bluetooth::DeviceId) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::bluetooth::read(paperpaw_sdk::bluetooth::DeviceId, paperpaw_sdk::bluetooth::Handle) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::bluetooth::refuse(paperpaw_sdk::bluetooth::GattRequest, paperpaw_sdk::bluetooth::AttError) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::bluetooth::remote_keys(paperpaw_sdk::bluetooth::DeviceId, &paperpaw_sdk::event::Event<paperpaw_sdk::bluetooth::BtEvent>) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::bluetooth::remote_keys_off(paperpaw_sdk::bluetooth::DeviceId, &paperpaw_sdk::event::Event<paperpaw_sdk::bluetooth::BtEvent>) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::bluetooth::respond(paperpaw_sdk::bluetooth::GattRequest, impl core::convert::Into<alloc::vec::Vec<u8>>) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::bluetooth::scan(&paperpaw_sdk::event::Event<paperpaw_sdk::bluetooth::BtEvent>) -> paperpaw_sdk::bluetooth::Scan
pub fn paperpaw_sdk::bluetooth::stop_advertising() -> paperpaw_sdk::Command
pub fn paperpaw_sdk::bluetooth::stop_scan(&paperpaw_sdk::event::Event<paperpaw_sdk::bluetooth::BtEvent>) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::bluetooth::subscribe(paperpaw_sdk::bluetooth::DeviceId, paperpaw_sdk::bluetooth::Handle) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::bluetooth::subscribe_to(paperpaw_sdk::bluetooth::DeviceId, paperpaw_sdk::bluetooth::Uuid, paperpaw_sdk::bluetooth::Uuid) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::bluetooth::take_back(paperpaw_sdk::bluetooth::DeviceId, impl core::convert::Into<paperpaw_sdk::Id>, &paperpaw_sdk::event::Event<paperpaw_sdk::bluetooth::BtEvent>) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::bluetooth::unsubscribe(paperpaw_sdk::bluetooth::DeviceId, paperpaw_sdk::bluetooth::Handle) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::bluetooth::write(paperpaw_sdk::bluetooth::DeviceId, paperpaw_sdk::bluetooth::Handle, impl core::convert::Into<alloc::vec::Vec<u8>>) -> paperpaw_sdk::bluetooth::Write
pub mod paperpaw_sdk::bluetooth::bt_params
```
